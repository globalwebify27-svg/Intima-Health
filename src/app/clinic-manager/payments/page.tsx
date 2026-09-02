"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ShoppingBag,
  DollarSign,
  XCircle
} from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PatientData {
  _id: string;
  name: string;
  phone: string;
}

interface AppointmentData {
  _id: string;
  patientId?: PatientData;
  doctorId?: { name: string; salary?: number };
  date: string;
  time: string;
  type: string;
  status?: string;
  paymentStatus: "Pending" | "Paid";
}

interface TherapySessionData {
  _id: string;
  patientId?: PatientData;
  name: string;
  price: number;
  status: "Unpaid" | "Paid" | "Booked" | "Recommended";
  date?: string;
  time?: string;
  createdAt: string;
}

interface OrderItemData {
  productId?: {
    name: string;
  };
  quantity: number;
  priceAtPurchase: number;
}

interface OrderData {
  _id: string;
  patientId?: PatientData;
  items: OrderItemData[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"consultations" | "therapy" | "pharmacy">("consultations");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Data states
  const [consultations, setConsultations] = useState<AppointmentData[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySessionData[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "CLINIC_MANAGER") {
        router.push("/staff-login");
        return;
      }
      
      const cId = meJson.user.clinicId;
      setClinicId(cId);

      if (cId) {
        // Fetch Therapy Sessions
        const therapyRes = await fetch(`/api/therapy-sessions?clinicId=${cId}`);
        const therapyJson = await therapyRes.json();
        if (therapyJson.success) {
          // Filter out Recommended therapies since they haven't been booked yet
          setTherapySessions(therapyJson.data.filter((t: any) => t.status !== "Recommended"));
        }

        // Fetch Pharmacy Orders
        const pharmacyRes = await fetch(`/api/pharmacy/orders?clinicId=${cId}`);
        const pharmacyJson = await pharmacyRes.json();
        if (pharmacyJson.success) {
          setPharmacyOrders(pharmacyJson.data);
        }

        // Fetch Consultation Appointments (Pending and Paid Cash payments)
        const aptRes = await fetch(`/api/appointments?clinicId=${cId}`);
        const aptJson = await aptRes.json();
        if (aptJson.success) {
          // Filter to only Walk-in/Cash types since Video is online
          setConsultations(aptJson.data.filter((a: any) => a.type === "Walk-in"));
        }
      }
    } catch (err) {
      console.error("Failed to load billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayTherapy = async (sessionId: string) => {
    if (!confirm("Confirm payment receipt at the counter?")) return;
    
    setActionLoading(sessionId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay", sessionId }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to process payment.");
      }
      setSuccessMsg("Therapy session marked as Paid successfully.");
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayAppointment = async (appointmentId: string) => {
    if (!confirm("Confirm payment receipt at the counter?")) return;
    
    setActionLoading(appointmentId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectedBy: "Clinic Manager" }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to process payment.");
      }
      setSuccessMsg("Consultation marked as Paid successfully.");
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredConsultations = consultations.filter((apt) => {
    const patientName = apt.patientId?.name.toLowerCase() || "";
    const doctorName = apt.doctorId?.name.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchSearch = patientName.includes(query) || doctorName.includes(query);
    const matchDate = filterDate ? apt.date === filterDate : true;
    
    let matchStatus = true;
    if (filterStatus === "Paid") matchStatus = apt.status !== "Cancelled" && apt.paymentStatus === "Paid";
    if (filterStatus === "Unpaid") matchStatus = apt.status !== "Cancelled" && apt.paymentStatus === "Pending";
    if (filterStatus === "Cancelled") matchStatus = apt.status === "Cancelled";

    return matchSearch && matchDate && matchStatus;
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const filteredTherapy = therapySessions.filter((ts) => {
    const patientName = ts.patientId?.name.toLowerCase() || "";
    const sessionName = ts.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = patientName.includes(query) || sessionName.includes(query);
    const matchDate = filterDate ? (ts.date === filterDate) : true;
    
    let matchStatus = true;
    if (filterStatus === "Paid") matchStatus = ts.status === "Paid";
    if (filterStatus === "Unpaid") matchStatus = ts.status === "Booked" || ts.status === "Unpaid";
    if (filterStatus === "Cancelled") matchStatus = false;

    return matchSearch && matchDate && matchStatus;
  }).sort((a, b) => new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`).getTime() - new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`).getTime());

  const filteredPharmacy = pharmacyOrders.filter((order) => {
    const patientName = order.patientId?.name.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchSearch = patientName.includes(query);
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const matchDate = filterDate ? orderDate === filterDate : true;
    return matchSearch && matchDate;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getPaginatedData = (dataArray: any[]) => {
    const totalPages = Math.ceil(dataArray.length / pageSize);
    const paginated = dataArray.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { totalPages, paginated };
  };

  const { totalPages: totalCons, paginated: paginatedCons } = getPaginatedData(filteredConsultations);
  const { totalPages: totalTherapy, paginated: paginatedTherapy } = getPaginatedData(filteredTherapy);
  const { totalPages: totalPharm, paginated: paginatedPharm } = getPaginatedData(filteredPharmacy);

  const renderPagination = (totalPages: number, totalItems: number) => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 col-span-full">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</Button>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading billing logs...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Counter Bills</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Review counter therapy session billing and track medication prescription order transactions.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Navigation tabs & search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("consultations");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "consultations"
                ? "bg-primary text-white"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            <Activity className="w-4 h-4" />
            Consultations
          </button>
          <button
            onClick={() => {
              setActiveTab("therapy");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "therapy"
                ? "bg-primary text-white"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            <Activity className="w-4 h-4" />
            Therapy Sessions Desk
          </button>
          <button
            onClick={() => {
              setActiveTab("pharmacy");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "pharmacy"
                ? "bg-primary text-white"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pharmacy Orders
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid / Settled</option>
            <option value="Unpaid">Unpaid / Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input 
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
          />
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                activeTab === "therapy"
                  ? "Search patient or therapy..."
                  : activeTab === "consultations"
                  ? "Search patient or doctor..."
                  : "Search patient..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Consultations Billing */}
      {activeTab === "consultations" && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filteredConsultations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No pending cash consultations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor & Appt Time</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedCons.map((apt: AppointmentData) => (
                    <tr key={apt._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{apt.patientId?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{apt.patientId?.phone || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{apt.doctorId?.name || "Doctor"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{apt.date} at {formatTime12Hour(apt.time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-medium bg-background">{apt.type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={
                            apt.status === "Cancelled" ? "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none shadow-none font-bold"
                            : apt.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none font-bold" 
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none font-bold"
                          }
                        >
                          {apt.status === "Cancelled" ? "Appointment Cancelled" : apt.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ₹1499
                      </td>
                      <td className="px-6 py-4 text-right">
                        {apt.status === "Cancelled" ? (
                          <span className="text-xs font-bold text-rose-500 flex items-center justify-end gap-1">
                            <XCircle className="w-4 h-4" /> Appointment Cancelled
                          </span>
                        ) : apt.paymentStatus === "Paid" ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePayAppointment(apt._id)}
                            disabled={actionLoading === apt._id}
                            className="font-bold shadow-none bg-primary/10 text-primary hover:bg-primary hover:text-white"
                          >
                            {actionLoading === apt._id ? "Processing..." : "Collect Payment"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(totalCons, filteredConsultations.length)}
            </div>
          )}
        </div>
      )}

      {/* Therapy Sessions Billing */}
      {activeTab === "therapy" && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filteredTherapy.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No therapy sessions found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Patient Details</th>
                    <th className="p-4">Therapy Name</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Billing Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {paginatedTherapy.map((ts: TherapySessionData) => (
                    <tr key={ts._id} className="hover:bg-muted/10 transition">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{ts.patientId?.name || "Patient"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{ts.patientId?.phone || "No phone"}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{ts.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-muted-foreground">{ts.date} at {ts.time ? formatTime12Hour(ts.time) : ""}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">₹{ts.price}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={ts.status === "Paid" ? "default" : "secondary"}>
                          {ts.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {ts.status === "Booked" ? (
                          <Button
                            size="sm"
                            disabled={actionLoading === ts._id}
                            onClick={() => handlePayTherapy(ts._id)}
                            className="text-xs font-bold text-white rounded-lg px-3.5 py-1.5 h-auto"
                          >
                            Collect ₹{ts.price}
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pharmacy Orders Billing */}
      {activeTab === "pharmacy" && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPharmacy.length === 0 ? (
            <div className="col-span-full bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground">
              No prescription orders found matching filters.
            </div>
          ) : (
            <>
              {paginatedPharm.map((order: OrderData) => (
                <div 
                  key={order._id}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-tight text-foreground">{order.patientId?.name || "Patient"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Phone: {order.patientId?.phone}</p>
                      </div>
                      <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>

                    {/* Items list */}
                    <div className="border-t border-border pt-3 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ordered Products</h4>
                      <div className="space-y-1.5">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs text-foreground bg-muted/40 p-2 rounded-lg border border-border/40">
                            <span>{item.productId?.name || "Medicine"} x {item.quantity}</span>
                            <span className="font-bold">₹{item.priceAtPurchase * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-sm">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span>Total Bill: <strong className="text-foreground font-bold">₹{order.totalAmount}</strong></span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Ordered: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              <div className="col-span-full">
                {renderPagination(totalPharm, filteredPharmacy.length)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
