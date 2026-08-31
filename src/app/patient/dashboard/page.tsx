"use client";

import { useEffect, useState } from "react";
import { Pill, Activity, Hospital, CreditCard, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/store/useBookingModal";
import { Badge } from "@/components/ui/badge";
import { UpcomingAppointmentsSlider } from "@/components/patient/UpcomingAppointmentsSlider";
import { DigitalPrescriptionsList } from "@/components/patient/DigitalPrescriptionsList";

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
  serviceName?: string;
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
  status: "Recommended" | "Booked" | "Paid";
  date?: string;
  time?: string;
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
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [therapyToBook, setTherapyToBook] = useState<TherapySession | null>(null);
  const [therapyDate, setTherapyDate] = useState("");
  const [therapyTime, setTherapyTime] = useState("");
  const [bookingTherapy, setBookingTherapy] = useState(false);
  const [isTherapyListModalOpen, setIsTherapyListModalOpen] = useState(false);

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
          const now = new Date().getTime();
          const upcoming = list
            .filter((a) => a.status === "Scheduled" && new Date(`${a.date}T${a.time}`).getTime() >= now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
          setUpcomingApts(upcoming);
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

  const handleBookTherapy = async () => {
    if (!therapyToBook || !therapyDate || !therapyTime) return;
    setBookingTherapy(true);
    try {
      const res = await fetch(`/api/therapy-sessions/${therapyToBook._id}/book`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: therapyDate, time: therapyTime })
      });
      const data = await res.json();
      if (data.success) {
        alert("Therapy booked successfully!");
        setTherapyToBook(null);
        setTherapyDate("");
        setTherapyTime("");
        if (patientId) fetchDashboardData(patientId);
      } else {
        alert(data.message || "Failed to book therapy");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setBookingTherapy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {/* Next Appointment Card */}
        <UpcomingAppointmentsSlider
          upcomingApts={upcomingApts}
          openBooking={openBooking}
          handlePayAppointment={handlePayAppointment}
        />

        {/* Therapy Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[260px] lg:min-h-[220px]"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-xl">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Therapy Sessions</h3>
            </div>
            <div className="text-2xl font-black mt-2 text-foreground flex items-center gap-3">
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").length} Recommended
              <div className="text-[10px] text-green-600 font-bold bg-green-500/5 px-2 py-0.5 rounded-lg border border-green-500/10 h-fit">
                {therapySessions.filter(s => s.status === "Booked").length} Upcoming
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Book your prescribed therapy sessions to begin treatment.
            </p>
          </div>

        </motion.div>

        {/* Pharmacy Orders Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[260px] lg:min-h-[220px]"
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

          {/* Therapy Sessions Section */}
          {therapySessions.length > 0 && (
            <div className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm space-y-4" id="recommended-therapies">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
                <Hospital className="w-4 h-4 text-primary" /> Prescribed Therapy Sessions
              </h3>

              <div className="space-y-3">
                {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Recommended by Doctor</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").map((session) => (
                        <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">Th</div>
                            <div>
                              <h4 className="font-bold text-sm text-amber-900">{session.name}</h4>
                              <p className="text-[10px] text-amber-700 font-medium">Estimated Cost: ₹{session.price}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setTherapyToBook(session)}
                            className="rounded-xl h-9 text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-none"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Book Therapy
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {therapySessions.filter(s => s.status === "Booked" || s.status === "Paid").length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">My Booked Therapies</h4>
                    <div className="space-y-3">
                      {therapySessions.filter(s => s.status === "Booked" || s.status === "Paid").map((session) => (
                        <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-muted/20 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">Th</div>
                            <div>
                              <h4 className="font-bold text-sm">{session.name}</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{session.date} at {session.time}</p>
                            </div>
                          </div>
                          {session.status === "Booked" ? (
                            <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50 self-start sm:self-center shrink-0">Unpaid - Pay at Clinic</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50 self-start sm:self-center shrink-0">Paid</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prescriptions Section */}
          <DigitalPrescriptionsList
            consultations={consultations}
            handleOrderFromPharmacy={handleOrderFromPharmacy}
            handleDownloadPrescription={handleDownloadPrescription}
          />

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

      {/* Therapy Selection Modal Overlay */}
      {isTherapyListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-6 shadow-xl border border-border">
            <h3 className="text-xl font-bold mb-2">Select Therapy to Book</h3>
            <p className="text-muted-foreground text-sm mb-6">Choose one of your prescribed therapy sessions to schedule.</p>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">Th</div>
                    <div>
                      <h4 className="font-bold text-sm">{session.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">Estimated Cost: ₹{session.price}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsTherapyListModalOpen(false);
                      setTherapyToBook(session);
                    }}
                    className="rounded-xl h-9 text-xs font-bold gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book
                  </Button>
                </div>
              ))}
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").length === 0 && (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground">
                  No prescribed therapies available to book.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setIsTherapyListModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Therapy Booking Date/Time Modal Overlay */}
      {therapyToBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-6 shadow-xl border border-border">
            <h3 className="text-xl font-bold mb-2">Book Therapy Session</h3>
            <p className="text-muted-foreground text-sm mb-6">Select a date and time for your prescribed {therapyToBook.name}.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-border bg-transparent p-3 text-sm focus:outline-none focus:border-primary font-medium"
                  value={therapyDate}
                  onChange={(e) => setTherapyDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Time</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-border bg-transparent p-3 text-sm focus:outline-none focus:border-primary font-medium"
                  value={therapyTime}
                  onChange={(e) => setTherapyTime(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => { setTherapyToBook(null); setTherapyDate(""); setTherapyTime(""); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl text-white font-bold"
                  disabled={!therapyDate || !therapyTime || bookingTherapy}
                  onClick={handleBookTherapy}
                >
                  {bookingTherapy ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
