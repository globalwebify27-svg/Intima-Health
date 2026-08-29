import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorModel } from "@/modules/doctors/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });
    }

    await connectDB();

    // Parse optional date range and clinic from query params
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range"); // "week" | "month" | "3months" | "all"
    const clinicId = searchParams.get("clinicId"); // Optional clinic ID filter

    // Calculate date boundaries
    const now = new Date();
    const todayISO = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
    let startDate: string | null = null;

    if (rangeParam === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split("T")[0];
    } else if (rangeParam === "month") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      startDate = d.toISOString().split("T")[0];
    } else if (rangeParam === "3months") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      startDate = d.toISOString().split("T")[0];
    }
    // "all" or default = no startDate filter

    // Build date filter for appointments
    const dateFilter: Record<string, any> = { deletedAt: null };
    if (startDate) {
      dateFilter.date = { $gte: startDate };
    }
    if (clinicId) {
      dateFilter.clinicId = clinicId;
    }

    const doctorFilter: Record<string, any> = { status: "Active", deletedAt: null };
    if (clinicId) {
      doctorFilter.clinicId = clinicId;
    }

    const todayFilter = { date: todayISO, deletedAt: null, ...(clinicId ? { clinicId } : {}) };
    
    // Fetch all relevant appointments based on filter
    const allAppointments = await AppointmentModel.find(dateFilter).lean();

    // If clinic filter is applied, total patients are unique patients from the appointments.
    // Otherwise, all patients.
    let totalPatients = 0;
    if (clinicId) {
      const patientIds = new Set(allAppointments.map((a: any) => String(a.patientId)));
      totalPatients = patientIds.size;
    } else {
      totalPatients = await PatientModel.countDocuments({ deletedAt: null });
    }

    const [activeDoctors, todayAppointments] = await Promise.all([
      DoctorModel.countDocuments(doctorFilter),
      AppointmentModel.countDocuments(todayFilter),
    ]);

    // --- Revenue ---
    const paidAppointments = allAppointments.filter((a: any) => a.paymentStatus === "Paid");
    const totalRevenue = paidAppointments.reduce((sum: number, a: any) => sum + (a.feeAmount || 0), 0);

    // --- Appointments by status ---
    const statusCounts = { Scheduled: 0, Completed: 0, Cancelled: 0 };
    for (const a of allAppointments) {
      const s = (a as any).status as keyof typeof statusCounts;
      if (statusCounts[s] !== undefined) statusCounts[s]++;
    }

    // --- Revenue by month (last 6 months) ---
    const monthlyRevenue: { month: string; revenue: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });

      const monthAppts = paidAppointments.filter((a: any) => {
        const aDate = a.date?.split("-");
        if (!aDate || aDate.length < 2) return false;
        return `${aDate[0]}-${aDate[1]}` === yearMonth;
      });

      monthlyRevenue.push({
        month: label,
        revenue: monthAppts.reduce((sum: number, a: any) => sum + (a.feeAmount || 0), 0),
        count: monthAppts.length,
      });
    }

    // --- Service breakdown ---
    const serviceMap: Record<string, number> = {};
    for (const a of allAppointments) {
      const name = (a as any).serviceName || "Unknown";
      serviceMap[name] = (serviceMap[name] || 0) + 1;
    }
    const serviceBreakdown = Object.entries(serviceMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // --- Top doctors ---
    const doctorMap: Record<string, number> = {};
    for (const a of allAppointments) {
      const did = String((a as any).doctorId);
      doctorMap[did] = (doctorMap[did] || 0) + 1;
    }
    const topDoctorIds = Object.entries(doctorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const doctors = await DoctorModel.find({ _id: { $in: topDoctorIds.map(([id]) => id) } }).lean();
    const doctorLookup = new Map(doctors.map((d: any) => [String(d._id), d]));
    const topDoctors = topDoctorIds.map(([id, count]) => {
      const doc = doctorLookup.get(id);
      return {
        name: doc?.name || "Unknown",
        specialization: doc?.specialization || "",
        appointments: count,
      };
    });

    // --- Recent appointments (last 5) ---
    const recentFilter = { deletedAt: null, ...(clinicId ? { clinicId } : {}) };
    const recentAppointments = await AppointmentModel.find(recentFilter)
      .populate("patientId", "name")
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentFormatted = recentAppointments.map((a: any) => ({
      _id: a._id,
      patientName: a.patientId?.name || "N/A",
      doctorName: a.doctorId?.name || "N/A",
      doctorSpec: a.doctorId?.specialization || "",
      date: a.date,
      time: a.time,
      status: a.status,
      serviceName: a.serviceName || "N/A",
      paymentStatus: a.paymentStatus || "Pending",
      feeAmount: a.feeAmount || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalPatients,
        activeDoctors,
        todayAppointments,
        totalAppointments: allAppointments.length,
        statusCounts,
        monthlyRevenue,
        serviceBreakdown,
        topDoctors,
        recentAppointments: recentFormatted,
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load stats." },
      { status: 500 }
    );
  }
}
