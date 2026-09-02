"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  Calendar, 
  IndianRupee, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail,
  UserPlus,
  Pill,
  ShoppingBag,
  Download,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime12Hour } from "@/lib/utils";

interface ClinicData {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
}

interface DoctorData {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  status: string;
}

interface PatientData {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface AppointmentData {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  patientId?: PatientData;
  doctorId?: {
    _id: string;
    name: string;
  };
}

interface OrderItem {
  productId?: {
    name: string;
  };
  quantity: number;
}

interface OrderData {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  createdAt: string;
}

export default function ClinicDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Detail State
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch clinic details
        const clinicRes = await fetch(`/api/clinics/${id}`);
        const clinicJson = await clinicRes.json();
        if (clinicJson.success) {
          setClinic(clinicJson.data);
        }

        // 2. Fetch doctors filtered by clinicId
        const docsRes = await fetch(`/api/doctors?clinicId=${id}`);
        const docsJson = await docsRes.json();
        let doctorIds: string[] = [];
        if (docsJson.success) {
          setDoctors(docsJson.data);
          doctorIds = docsJson.data.map((d: any) => d._id);
        }

        // 3. Fetch appointments filtered by clinicId
        const aptsRes = await fetch(`/api/appointments?clinicId=${id}`);
        const aptsJson = await aptsRes.json();
        if (aptsJson.success) {
          setAppointments(aptsJson.data);
        }

        // 4. Fetch orders filtered by clinicId
        const ordersRes = await fetch(`/api/pharmacy/orders?clinicId=${id}`);
        const ordersJson = await ordersRes.json();
        if (ordersJson.success) {
          setOrders(ordersJson.data);
        }

        // 5. Fetch consultations and filter by doctorIds in this clinic
        const consultsRes = await fetch(`/api/consultations`);
        const consultsJson = await consultsRes.json();
        if (consultsJson.success && doctorIds.length > 0) {
          const filteredConsults = consultsJson.data.filter((c: any) => {
            const docId = typeof c.doctorId === "string" ? c.doctorId : c.doctorId?._id;
            return doctorIds.includes(docId);
          });
          setConsultations(filteredConsults);
        }
      } catch (err) {
        console.error("Failed to load clinic dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading clinic dashboard data...
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push("/admin/clinics")} className="rounded-xl gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Clinics
        </Button>
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-semibold">
          Clinic not found or deleted.
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeDoctors = doctors.filter(d => d.status === "Active").length;
  const scheduledAppointments = appointments.filter(a => a.status === "Scheduled").length;
  
  // Extract unique patients from appointments
  const patientsMap = new Map<string, PatientData>();
  appointments.forEach((apt) => {
    if (apt.patientId && !patientsMap.has(apt.patientId._id)) {
      patientsMap.set(apt.patientId._id, apt.patientId);
    }
  });
  const patientsList = Array.from(patientsMap.values());

  const estimatedRevenue = appointments
    .filter(a => a.status === "Completed" || a.status === "Scheduled")
    .length * 1500;

  const stats = [
    {
      title: "Clinic Revenue (Est.)",
      value: `₹${estimatedRevenue.toLocaleString()}`,
      description: "Based on active/completed bookings",
      icon: IndianRupee,
      href: `/admin/clinics/${id}/orders`,
    },
    {
      title: "Pharmacy Orders",
      value: orders.length.toString(),
      description: "Prescription sales only",
      icon: ShoppingBag,
      href: `/admin/clinics/${id}/orders`,
    },
    {
      title: "Pending Appointments",
      value: scheduledAppointments.toString(),
      description: "Upcoming visits",
      icon: Calendar,
      href: `/admin/clinics/${id}/appointments`,
    },
    {
      title: "Treated Patients",
      value: patientsList.length.toString(),
      description: "Patients seen at this location",
      icon: Users,
      href: `/admin/clinics/${id}/patients`,
    },
  ];

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDownloadReport = () => {
    // Helper to escape CSV values
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      let str = typeof val === 'string' ? val : String(val);
      str = str.replace(/"/g, '""'); // Escape double quotes
      return `"${str}"`;
    };

    let csvContent = "";

    // 1. Clinic Summary Section
    csvContent += "CLINIC SUMMARY REPORT\n";
    csvContent += `Clinic Name,${escapeCSV(clinic.name)}\n`;
    csvContent += `City,${escapeCSV(clinic.city)}\n`;
    csvContent += `Address,${escapeCSV(clinic.address)}\n`;
    csvContent += `Phone,${escapeCSV(clinic.phone)}\n`;
    csvContent += `Email,${escapeCSV(clinic.email)}\n`;
    csvContent += `Status,${escapeCSV(clinic.status)}\n`;
    csvContent += `Generated At,${escapeCSV(new Date().toLocaleString())}\n\n`;

    // 2. Metrics
    csvContent += "METRICS\n";
    csvContent += `Total Specialists,${doctors.length}\n`;
    csvContent += `Treated Patients,${patientsList.length}\n`;
    csvContent += `Total Appointments,${appointments.length}\n`;
    csvContent += `Total Pharmacy Orders,${orders.length}\n`;
    csvContent += `Estimated Consultation Revenue,₹${estimatedRevenue.toLocaleString()}\n\n`;

    // 3. Specialists List
    csvContent += "SPECIALISTS\n";
    csvContent += "Name,Specialization,Phone,Email,Status\n";
    doctors.forEach((doc) => {
      csvContent += `${escapeCSV(doc.name)},${escapeCSV(doc.specialization)},${escapeCSV(doc.phone)},${escapeCSV(doc.email)},${escapeCSV(doc.status)}\n`;
    });
    csvContent += "\n";

    // 4. Patients Details with Prescribed and Sold Medicines
    csvContent += "PATIENT ACTIVITY & MEDICAL DISPENSATIONS\n";
    csvContent += "Patient Name,Email,Phone,Prescribed Medicines,Purchased Medicines,Total Pharmacy Spend (INR)\n";
    
    patientsList.forEach((pat) => {
      // Find prescriptions for this patient in this clinic
      const patientConsults = consultations.filter((c) => {
        const pId = typeof c.patientId === "string" ? c.patientId : c.patientId?._id;
        return pId === pat._id;
      });
      const prescribedMeds = patientConsults
        .map((c) => c.prescriptionSummary)
        .filter(Boolean)
        .join(" | ");

      // Find orders for this patient in this clinic
      const patientOrders = orders.filter((o) => {
        const pId = typeof o.patientId === "string" ? o.patientId : o.patientId?._id;
        return pId === pat._id;
      });

      const purchasedMedsList: string[] = [];
      let totalSpend = 0;
      patientOrders.forEach((o) => {
        totalSpend += o.totalAmount;
        o.items.forEach((item: any) => {
          const prodName = item.productId?.name || "Medication";
          purchasedMedsList.push(`${prodName} (x${item.quantity})`);
        });
      });
      const purchasedMeds = purchasedMedsList.join(" | ");

      csvContent += `${escapeCSV(pat.name)},${escapeCSV(pat.email)},${escapeCSV(pat.phone)},${escapeCSV(prescribedMeds || "None")},${escapeCSV(purchasedMeds || "None")},${totalSpend}\n`;
    });
    csvContent += "\n";

    // 5. Bookings Details
    csvContent += "BOOKINGS & APPOINTMENTS\n";
    csvContent += "Patient Name,Date,Time,Type,Specialist,Status\n";
    appointments.forEach((apt) => {
      const patName = apt.patientId?.name || "Anonymous Patient";
      const docName = apt.doctorId?.name || "Unassigned";
      csvContent += `${escapeCSV(patName)},${escapeCSV(apt.date)},${escapeCSV(apt.time)},${escapeCSV(apt.type)},${escapeCSV(docName)},${escapeCSV(apt.status)}\n`;
    });

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clinic_report_${clinic.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/clinics")} className="rounded-xl gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Clinics
        </Button>
        <div className="flex items-center gap-3">
          <Button onClick={handleDownloadReport} className="rounded-xl gap-2 font-medium bg-primary hover:bg-primary/95 text-white">
            <Download className="w-4 h-4" /> Download Report
          </Button>
          <Badge variant={clinic.status === "Active" ? "default" : "destructive"}>
            Clinic Status: {clinic.status}
          </Badge>
        </div>
      </div>

      {/* Clinic Header Info Card */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{clinic.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" /> {clinic.address}, {clinic.city}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> {clinic.phone}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> {clinic.email}
          </div>
        </div>
      </div>

      {/* Grid of Clinic Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(stat.href)}
              className="p-6 bg-card rounded-2xl border border-border shadow-sm cursor-pointer hover:shadow-md hover:border-primary/45 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4 Lists Grid Section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* 1. Assigned Specialists */}
        <div id="specialists-section" className="p-6 bg-card rounded-2xl border border-border shadow-sm scroll-mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Assigned Specialists ({doctors.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/clinics/${id}/specialists`)} className="text-xs text-primary font-bold hover:underline">
              View All
            </Button>
          </div>
          {doctors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No specialists assigned to this clinic.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
              {doctors.map((doc) => (
                <div 
                  key={doc._id} 
                  onClick={() => setSelectedDoctor(doc)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-muted/50 rounded-xl px-2 -mx-2 transition-colors first:pt-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-semibold text-sm hover:text-primary transition-colors">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                  </div>
                  <Badge
                    className={
                      doc.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border"
                        : doc.status === "Pending"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 border"
                        : "bg-red-500/10 text-red-600 border-red-500/20 border"
                    }
                    variant="outline"
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Clinic Appointments */}
        <div id="bookings-section" className="p-6 bg-card rounded-2xl border border-border shadow-sm scroll-mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Recent Clinic Appointments ({appointments.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/clinics/${id}/appointments`)} className="text-xs text-primary font-bold hover:underline">
              View All
            </Button>
          </div>
          {appointments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No appointments booked at this clinic yet.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
              {appointments.map((apt) => (
                <div 
                  key={apt._id} 
                  onClick={() => setSelectedAppointment(apt)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-muted/50 rounded-xl px-2 -mx-2 transition-colors first:pt-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-semibold text-sm hover:text-primary transition-colors">
                      {apt.patientId?.name || "Anonymous Patient"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {apt.date} at {formatTime12Hour(apt.time)} • {apt.type}
                    </p>
                    {apt.doctorId && (
                      <p className="text-[10px] text-primary mt-0.5 font-medium">
                        Specialist: {apt.doctorId.name}
                      </p>
                    )}
                  </div>
                  <Badge variant={apt.status === "Scheduled" ? "default" : apt.status === "Completed" ? "outline" : "destructive"}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Patients Directory */}
        <div id="patients-section" className="p-6 bg-card rounded-2xl border border-border shadow-sm scroll-mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Clinic Patients ({patientsList.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/clinics/${id}/patients`)} className="text-xs text-primary font-bold hover:underline">
              View All
            </Button>
          </div>
          {patientsList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No patient records found at this location.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
              {patientsList.map((pat) => (
                <div 
                  key={pat._id} 
                  onClick={() => setSelectedPatient(pat)}
                  className="py-3 flex flex-col cursor-pointer hover:bg-muted/50 rounded-xl px-2 -mx-2 transition-colors first:pt-0 last:pb-0 gap-0.5"
                >
                  <h3 className="font-bold text-sm hover:text-primary transition-colors">{pat.name}</h3>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{pat.phone}</span>
                    <span>{pat.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Pharmacy Orders */}
        <div id="orders-section" className="p-6 bg-card rounded-2xl border border-border shadow-sm scroll-mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Pharmacy Orders ({orders.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/clinics/${id}/orders`)} className="text-xs text-primary font-bold hover:underline">
              View All
            </Button>
          </div>
          {orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No orders placed at this clinic pharmacy.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
              {orders.map((ord) => (
                <div 
                  key={ord._id} 
                  onClick={() => setSelectedOrder(ord)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-muted/50 rounded-xl px-2 -mx-2 transition-colors first:pt-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-semibold text-sm hover:text-primary transition-colors">
                      {ord.patientId?.name || "Patient"}
                    </h3>
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      {ord.items.slice(0, 2).map((item, idx) => (
                        <div key={idx}>• {item.productId?.name || "Medication"} (x{item.quantity})</div>
                      ))}
                      {ord.items.length > 2 && (
                        <div className="text-[9px] text-primary font-medium">+ {ord.items.length - 2} more items</div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-primary">₹{ord.totalAmount}</p>
                    <Badge variant={ord.status === "Pending" ? "secondary" : "outline"} className="text-[9px]">
                      {ord.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* DETAIL MODALS */}
      <AnimatePresence>
        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoctor(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedDoctor.name}</h3>
                    <p className="text-xs text-primary font-medium">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="p-1 hover:bg-muted rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3 border-t border-b border-border py-4 text-sm">
                <div className="flex justify-between"><strong>Phone:</strong> <span>{selectedDoctor.phone}</span></div>
                <div className="flex justify-between"><strong>Email:</strong> <span>{selectedDoctor.email}</span></div>
                <div className="flex justify-between"><strong>Status:</strong> <Badge>{selectedDoctor.status}</Badge></div>
              </div>
              <Button onClick={() => setSelectedDoctor(null)} className="w-full rounded-xl">Close</Button>
            </motion.div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAppointment(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedAppointment.patientId?.name || "Patient Appointment"}</h3>
                    <p className="text-xs text-muted-foreground">{selectedAppointment.date} at {formatTime12Hour(selectedAppointment.time)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="p-1 hover:bg-muted rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3 border-t border-b border-border py-4 text-sm">
                <div className="flex justify-between"><strong>Type:</strong> <span>{selectedAppointment.type}</span></div>
                <div className="flex justify-between"><strong>Specialist:</strong> <span>{selectedAppointment.doctorId?.name || "Unassigned"}</span></div>
                <div className="flex justify-between"><strong>Status:</strong> <Badge>{selectedAppointment.status}</Badge></div>
              </div>
              <Button onClick={() => setSelectedAppointment(null)} className="w-full rounded-xl">Close</Button>
            </motion.div>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (() => {
          const patientConsults = consultations.filter((c) => {
            const pId = typeof c.patientId === "string" ? c.patientId : c.patientId?._id;
            return pId === selectedPatient._id;
          });
          const patientOrders = orders.filter((o) => {
            const pId = typeof o.patientId === "string" ? o.patientId : o.patientId?._id;
            return pId === selectedPatient._id;
          });
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPatient(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 space-y-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{selectedPatient.name}</h3>
                      <p className="text-xs text-muted-foreground">Patient Directory Record</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-1 hover:bg-muted rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>

                <div className="space-y-2 border-t border-b border-border py-4 text-sm">
                  <div className="flex justify-between"><strong>Phone:</strong> <span>{selectedPatient.phone}</span></div>
                  <div className="flex justify-between"><strong>Email:</strong> <span>{selectedPatient.email}</span></div>
                </div>

                {/* Medical History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prescriptions Summary</h4>
                  {patientConsults.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No prescriptions recorded at this clinic.</p>
                  ) : (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                      {patientConsults.map((c: any) => (
                        <div key={c._id} className="p-2.5 bg-muted/40 border border-border rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Dr. {c.doctorId?.name}</span>
                            <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          {c.prescriptionSummary ? (
                            <p className="text-muted-foreground">{c.prescriptionSummary}</p>
                          ) : (
                            <p className="text-muted-foreground italic">Prescribed therapies or medication summary not detailed.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders History */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pharmacy Purchases</h4>
                  {patientOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No pharmacy orders recorded at this clinic.</p>
                  ) : (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                      {patientOrders.map((o: any) => (
                        <div key={o._id} className="p-2.5 bg-muted/40 border border-border rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-primary">₹{o.totalAmount}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {o.items.map((item: any, idx: number) => (
                                <span key={idx}>• {item.productId?.name} (x{item.quantity}) </span>
                              ))}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px]">{o.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={() => setSelectedPatient(null)} className="w-full rounded-xl">Close</Button>
              </motion.div>
            </div>
          );
        })()}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Order Details</h3>
                    <p className="text-xs text-muted-foreground">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-muted rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              <div className="space-y-3 border-t border-b border-border py-4 text-sm">
                <div className="flex justify-between"><strong>Patient:</strong> <span>{selectedOrder.patientId?.name || "Patient"}</span></div>
                <div className="flex justify-between"><strong>Status:</strong> <Badge>{selectedOrder.status}</Badge></div>
                {selectedOrder.shippingAddress && (
                  <div className="flex flex-col gap-0.5">
                    <strong>Shipping Address:</strong>
                    <span className="text-xs text-muted-foreground">{selectedOrder.shippingAddress}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Items</h4>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-muted/40 rounded-lg">
                      <span>{item.productId?.name || "Medication"}</span>
                      <span className="font-semibold text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span>Total Amount:</span>
                <span className="text-primary">₹{selectedOrder.totalAmount}</span>
              </div>

              <Button onClick={() => setSelectedOrder(null)} className="w-full rounded-xl">Close</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
