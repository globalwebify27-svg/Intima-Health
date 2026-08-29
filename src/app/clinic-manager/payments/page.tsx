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
  DollarSign
} from "lucide-react";
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
  paymentStatus: "Pending" | "Paid";
}

interface TherapySessionData {
  _id: string;
  patientId?: PatientData;
  name: string;
  price: number;
  status: "Unpaid" | "Paid";
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
          setTherapySessions(therapyJson.data);
        }

        // Fetch Pharmacy Orders
        const pharmacyRes = await fetch(`/api/pharmacy/orders?clinicId=${cId}`);
        const pharmacyJson = await pharmacyRes.json();
        if (pharmacyJson.success) {
          setPharmacyOrders(pharmacyJson.data);
        }

        // Fetch Consultation Appointments (Pending Cash payments)
        const aptRes = await fetch(`/api/appointments?clinicId=${cId}&paymentStatus=Pending`);
        const aptJson = await aptRes.json();
        if (aptJson.success) {
          // Filter to only In-person/Cash types since Video is online
          setConsultations(aptJson.data.filter((a: any) => a.type === "In-person"));
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
    return patientName.includes(query) || doctorName.includes(query);
  });

  const filteredTherapy = therapySessions.filter((ts) => {
    const patientName = ts.patientId?.name.toLowerCase() || "";
    const sessionName = ts.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return patientName.includes(query) || sessionName.includes(query);
  });

  const filteredPharmacy = pharmacyOrders.filter((order) => {
    const patientName = order.patientId?.name.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return patientName.includes(query);
  });

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
                  {filteredConsultations.map((apt) => (
                    <tr key={apt._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{apt.patientId?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{apt.patientId?.phone || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{apt.doctorId?.name || "Doctor"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{apt.date} at {apt.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-medium bg-background">{apt.type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none font-bold">
                          {apt.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ₹1499
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handlePayAppointment(apt._id)}
                          disabled={actionLoading === apt._id}
                          className="font-bold shadow-none bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        >
                          {actionLoading === apt._id ? "Processing..." : "Collect Payment"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th className="p-4">Billing Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredTherapy.map((ts) => (
                    <tr key={ts._id} className="hover:bg-muted/10 transition">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{ts.patientId?.name || "Patient"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{ts.patientId?.phone || "No phone"}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{ts.name}</span>
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
                        {ts.status === "Unpaid" ? (
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
            filteredPharmacy.map((order) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
