"use client";

import { useEffect, useState } from "react";
import { Calendar, Pill, Video, FileText, ArrowRight, Activity, ShieldAlert, CreditCard, Download, Hospital } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/store/useBookingModal";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  _id: string;
  doctorId: {
    name: string;
    specialization: string;
    clinicId?: string;
    fees?: number;
  };
  date: string;
  time: string;
  type: string;
  status: string;
  paymentStatus?: string;
}

interface Consultation {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
    clinicId?: string;
  };
  status: string;
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  notes?: string;
  createdAt: string;
}

interface Medicine {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface TherapySession {
  _id: string;
  name: string;
  price: number;
  status: "Unpaid" | "Paid";
  clinicId?: {
    name: string;
  };
}

interface PharmacyOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function PatientDashboard() {
  const { openBooking } = useBookingModal();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [upcomingApt, setUpcomingApt] = useState<Appointment | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const fetchDashboardData = (pId: string) => {
    setLoading(true);
    const t = Date.now();
    Promise.all([
      fetch(`/api/appointments?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/consultations?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/therapy-sessions?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/pharmacy/orders?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/clinics?_t=${t}`, { cache: "no-store" }) // to resolve clinic details if needed
    ])
      .then(async ([aptRes, consultRes, therapyRes, ordersRes, clinicsRes]) => {
        const aptData = await aptRes.json();
        const consultData = await consultRes.json();
        const therapyData = await therapyRes.json();
        const ordersData = await ordersRes.json();

        // Process appointments
        if (aptData.success && aptData.data) {
          const list: Appointment[] = aptData.data;
          const upcoming = list
            .filter((a) => a.status === "Scheduled")
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];
          setUpcomingApt(upcoming || null);
        }

        // Process consultations
        if (consultData.success && consultData.data) {
          setConsultations(consultData.data);
        }

        // Process therapy sessions
        if (therapyData.success && therapyData.data) {
          setTherapySessions(therapyData.data);
        }

        // Process pharmacy orders
        if (ordersData.success && ordersData.data) {
          setPharmacyOrders(ordersData.data);
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Load products first
    fetch(`/api/clinics?_t=${Date.now()}`, { cache: "no-store" }) // just warm DB
    
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.patientId) {
          setPatientId(data.user.patientId);
          setPatientName(data.user.name);
          fetchDashboardData(data.user.patientId);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDownloadPrescription = (consultation: Consultation) => {
    const { printPrescription } = require("@/lib/print-prescription");
    printPrescription(consultation);
  };

  const handleOrderFromPharmacy = async (consultation: Consultation) => {
    if (!consultation.prescriptionSummary || !patientId) return;
    
    try {
      const meds: Medicine[] = JSON.parse(consultation.prescriptionSummary);
      if (meds.length === 0) return;

      // Resolve clinicId from the prescribing doctor
      const clinicId = consultation.doctorId?.clinicId;
      if (!clinicId) {
        alert("This prescription does not have an associated clinic pharmacy.");
        return;
      }

      // Create dummy products or link them. We will create mock product references.
      const items = meds.map((m) => {
        return {
          productId: "65f27c62d08a50672e811bc3", // placeholder valid ObjectId
          quantity: 1,
          priceAtPurchase: 450 // average cost
        };
      });

      const totalAmount = items.length * 450;

      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          clinicId,
          items,
          totalAmount,
          status: "Pending",
          shippingAddress: "Home Address on file"
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Medications order placed successfully at the Clinic Pharmacy! You can check it under 'Active Orders'.");
        fetchDashboardData(patientId);
      } else {
        alert(data.message || "Failed to order from pharmacy.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to process order.");
    }
  };

  const handlePayTherapy = async (sessionId: string) => {
    try {
      const res = await fetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay",
          sessionId
        }),
      });

      const data = await res.json();
      if (data.success && patientId) {
        alert("Payment processed successfully! Therapy session marked as Paid.");
        window.location.reload();
      } else {
        alert(data.message || "Payment failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  const handlePayAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success && patientId) {
        alert("Consultation fee paid successfully! You can now join the consultation room.");
        window.location.reload();
      } else {
        alert(data.message || "Payment failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome back, {patientName || "Valued Patient"}!
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Here is your custom overview, prescriptions, therapies, and treatment plans.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Appointment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-primary/5 rounded-3xl border border-primary/20 shadow-sm col-span-full lg:col-span-1 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Video className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Upcoming Session</span>
            </div>
            {upcomingApt ? (
              <>
                <h3 className="text-xl font-bold mb-1">{upcomingApt.doctorId?.name || "Clinician Practitioner"}</h3>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">{upcomingApt.doctorId?.specialization || "Wellness Expert"}</p>
                <p className="text-sm text-muted-foreground font-medium">{upcomingApt.type === "In-person" ? "Walk-in" : "Video"} Consultation • {upcomingApt.date} at {upcomingApt.time}</p>
                {upcomingApt.paymentStatus !== "Paid" && (
                  <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Please pay the consultation fee to confirm your booking.
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">No Scheduled Sessions</h3>
                <p className="text-sm text-muted-foreground">Book a consultation with one of our clinic locations.</p>
              </>
            )}
          </div>
          {upcomingApt ? (
            upcomingApt.paymentStatus === "Paid" ? (
              <Button 
                onClick={() => window.location.href = upcomingApt.type === "In-person" ? "/patient/appointments" : "/patient/consultations"} 
                className="w-full rounded-xl h-11 font-bold mt-6 shadow-md shadow-primary/10 hover:shadow-primary/20"
              >
                {upcomingApt.type === "In-person" ? "View Appointment Details" : "Join Consultation Room"}
              </Button>
            ) : (
              <Button 
                onClick={() => handlePayAppointment(upcomingApt._id)} 
                className="w-full rounded-xl h-11 font-bold mt-6 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/10"
              >
                Pay Consultation Fee (₹{upcomingApt.type === "In-person" ? "1,499" : "999"})
              </Button>
            )
          ) : (
            <Button 
              onClick={() => openBooking()} 
              className="w-full rounded-xl h-11 font-bold mt-6"
            >
              Book New Appointment
            </Button>
          )}
        </motion.div>

        {/* Therapy Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-xl">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Therapy Sessions</h3>
            </div>
            <p className="text-2xl font-black mb-1">
              {therapySessions.filter(s => s.status === "Unpaid").length} Pending
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Pay for your prescribed therapy sessions to begin treatment.
            </p>
          </div>
          <div className="text-xs text-green-600 font-bold bg-green-500/5 px-2.5 py-1 rounded-xl border border-green-500/10 w-fit">
            {therapySessions.filter(s => s.status === "Paid").length} Sessions Paid
          </div>
        </motion.div>

        {/* Pharmacy Orders Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-xl">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Clinic Pharmacy Orders</h3>
            </div>
            <p className="text-2xl font-black mb-1">{pharmacyOrders.length} Orders</p>
            <p className="text-xs text-muted-foreground font-medium">Medication packages ordered from clinic pharmacies.</p>
          </div>
          <div className="text-xs text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-xl border border-primary/10 w-fit">
            {pharmacyOrders.filter(o => o.status === "Pending").length} Pending Fulfillment
          </div>
        </motion.div>
      </div>

      {/* Main Layout: Left = Prescriptions & Therapies, Right = Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Digital Prescriptions & Prescribed Therapies */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prescriptions Section */}
          <div className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
              <FileText className="w-4 h-4 text-primary" /> My Digital Prescriptions
            </h3>
            
            <div className="space-y-4">
              {consultations.filter(c => c.status === "Completed" && c.prescriptionSummary).length > 0 ? (
                consultations
                  .filter(c => c.status === "Completed" && c.prescriptionSummary)
                  .map((consult) => {
                    const meds: Medicine[] = JSON.parse(consult.prescriptionSummary || "[]");
                    return (
                      <div key={consult._id} className="p-5 border border-border rounded-2xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm">Prescribed by {consult.doctorId?.name}</h4>
                            <p className="text-xs text-muted-foreground">Date: {new Date(consult.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">Rx #{consult._id.substring(18)}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {meds.map((med, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-semibold p-2 bg-muted/40 rounded-xl">
                              <div>
                                <p className="font-bold text-foreground">{med.drug}</p>
                                <p className="text-[10px] text-muted-foreground">Dosage: {med.dosage} | Frequency: {med.frequency}</p>
                              </div>
                              <span className="text-[10px] text-primary">{med.duration}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                          <Button 
                            size="sm" 
                            onClick={() => handleOrderFromPharmacy(consult)}
                            className="rounded-xl h-9 text-xs font-bold gap-1.5"
                          >
                            <Pill className="w-3.5 h-3.5" /> Order from Clinic Pharmacy
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDownloadPrescription(consult)}
                            className="rounded-xl h-9 text-xs font-bold gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Rx
                          </Button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                  <FileText className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-semibold">No digital prescriptions found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Therapy Sessions Section */}
          <div className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
              <Hospital className="w-4 h-4 text-primary" /> Prescribed Therapy Sessions
            </h3>
            
            <div className="space-y-3">
              {therapySessions.length > 0 ? (
                therapySessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">Th</div>
                      <div>
                        <h4 className="font-bold text-sm">{session.name}</h4>
                        <p className="text-[10px] text-muted-foreground">Cost: ₹{session.price}</p>
                      </div>
                    </div>
                    {session.status === "Unpaid" ? (
                      <Button 
                        size="sm" 
                        onClick={() => handlePayTherapy(session._id)}
                        className="rounded-xl h-9 text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">Paid</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                  <Activity className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-semibold">No therapy sessions prescribed.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Pharmacy Orders History */}
        <div className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm min-h-[350px] space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
            <Pill className="w-4 h-4 text-primary" /> Active Pharmacy Orders
          </h3>
          
          <div className="space-y-4">
            {pharmacyOrders.length > 0 ? (
              pharmacyOrders.map((order) => (
                <div key={order._id} className="text-xs space-y-1.5 p-3.5 bg-muted/20 border border-border/50 rounded-2xl">
                  <div className="flex justify-between font-bold">
                    <span className="font-mono text-muted-foreground">#{order._id.substring(18)}</span>
                    <span className="text-primary">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <Badge variant={order.status === "Pending" ? "secondary" : "outline"} className="text-[9px] px-1.5 py-0">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                <Pill className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold">No active pharmacy orders.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
