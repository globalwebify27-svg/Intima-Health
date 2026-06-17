"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Video, VideoOff, Mic, MicOff, ScreenShare, PhoneOff, Check, 
  User, Clipboard, Calendar, Clock, ChevronRight, X, Heart, ShieldAlert, FileText, Plus, Trash2, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  allergies?: string[];
  medicalHistory?: string;
}

interface Consultation {
  _id: string;
  appointmentId: {
    _id?: string;
    date: string;
    time: string;
    type?: string;
    clinicId?: any;
  };
  patientId: Patient;
  doctorId?: any;
  videoChannelName: string;
  status: "Pending" | "Active" | "Completed";
  notes?: string;
  prescriptionSummary?: string;
  createdAt: string;
}

interface PrescriptionItem {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface TherapyItem {
  name: string;
  price: number;
}

export default function DoctorConsultationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading consultations room...</p>
      </div>
    }>
      <ConsultationsContent />
    </Suspense>
  );
}

function ConsultationsContent() {
  const searchParams = useSearchParams();
  const targetAptId = searchParams.get("appointmentId");

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"Pending" | "Active" | "Completed" | "All">("Pending");

  // Video Room States
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [notes, setNotes] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { drug: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [therapyItems, setTherapyItems] = useState<TherapyItem[]>([
    { name: "", price: 0 }
  ]);
  const [completing, setCompleting] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"patient" | "notes">("notes");
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const fetchConsultations = () => {
    setLoading(true);
    fetch("/api/consultations")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setConsultations(resData.data || []);
        } else {
          throw new Error(resData.message || "Failed to load consultations.");
        }
      })
      .catch((err) => setError(err.message || "Failed to load consultations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    if (activeConsultation) {
      const cId = activeConsultation.appointmentId && typeof activeConsultation.appointmentId.clinicId === 'object'
        ? (activeConsultation.appointmentId.clinicId as any)._id
        : (activeConsultation.appointmentId?.clinicId || (activeConsultation.doctorId as any)?.clinicId);
      if (cId) {
        fetch(`/api/pharmacy/products?clinicId=${cId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setAvailableProducts(data.data || []);
            }
          })
          .catch((err) => console.error("Error fetching pharmacy products:", err));

        fetch(`/api/clinic-services?clinicId=${cId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setAvailableServices(data.data || []);
            }
          })
          .catch((err) => console.error("Error fetching clinic services:", err));
      }
    } else {
      setAvailableProducts([]);
      setAvailableServices([]);
    }
  }, [activeConsultation]);

  const handleStartConsultation = async (consultation: Consultation & { prescribedTherapies?: string }) => {
    try {
      // 1. Update status to Active
      const res = await fetch(`/api/consultations/${consultation._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedConsult = data.data;
        setActiveConsultation(updatedConsult);
        setNotes(updatedConsult.notes || "");
        
        if (updatedConsult.prescriptionSummary) {
          try {
            setPrescriptionItems(JSON.parse(updatedConsult.prescriptionSummary));
          } catch {
            setPrescriptionItems([{ drug: "", dosage: "", frequency: "", duration: "" }]);
          }
        } else {
          setPrescriptionItems([{ drug: "", dosage: "", frequency: "", duration: "" }]);
        }

        if (updatedConsult.prescribedTherapies) {
          try {
            setTherapyItems(JSON.parse(updatedConsult.prescribedTherapies));
          } catch {
            setTherapyItems([{ name: "", price: 0 }]);
          }
        } else {
          setTherapyItems([{ name: "", price: 0 }]);
        }
      }
    } catch (err) {
      console.error("Failed to start consultation", err);
    }
  };

  useEffect(() => {
    if (targetAptId && consultations.length > 0) {
      const found = consultations.find(
        (c) => 
          c.appointmentId?._id === targetAptId || 
          (c.appointmentId && (c.appointmentId as any)._id === targetAptId)
      );
      if (found && found.status !== "Completed" && activeConsultation?._id !== found._id) {
        handleStartConsultation(found);
      }
    }
  }, [targetAptId, consultations, activeConsultation]);

  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { drug: "", dosage: "", frequency: "", duration: "" }
    ]);
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, idx) => idx !== index));
  };

  const handlePrescriptionChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    setPrescriptionItems(
      prescriptionItems.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleAddTherapyItem = () => {
    setTherapyItems([
      ...therapyItems,
      { name: "", price: 0 }
    ]);
  };

  const handleRemoveTherapyItem = (index: number) => {
    setTherapyItems(therapyItems.filter((_, idx) => idx !== index));
  };

  const handleTherapyChange = (index: number, field: keyof TherapyItem, value: string) => {
    setTherapyItems(
      therapyItems.map((item, idx) => {
        if (idx === index) {
          const updated = { ...item, [field]: field === "price" ? Number(value) : value };
          if (field === "name") {
            const matched = availableServices.find(s => s.name.toLowerCase() === value.toLowerCase());
            if (matched) {
              updated.price = matched.price;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleCompleteConsultation = async () => {
    if (!activeConsultation) return;
    setCompleting(true);

    const filteredPrescription = prescriptionItems.filter((item) => item.drug.trim() !== "");
    const filteredTherapies = therapyItems.filter((item) => item.name.trim() !== "");

    try {
      const res = await fetch(`/api/consultations/${activeConsultation._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          notes,
          prescriptionSummary: JSON.stringify(filteredPrescription),
          prescribedTherapies: JSON.stringify(filteredTherapies),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveConsultation(null);
        window.location.href = "/doctor/appointments";
      } else {
        alert(data.message || "Failed to complete consultation.");
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setCompleting(false);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    if (activeTab === "All") return true;
    return c.status === activeTab;
  });

  if (loading && consultations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading consultations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Telemedicine Consultations
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Join digital consultation rooms, check medical history, write prescriptions, and complete sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4">
        {(["Pending", "Active", "Completed", "All"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab} Sessions
            {tab === "Pending" && consultations.filter((c) => c.status === "Pending").length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-primary text-white rounded-full font-extrabold">
                {consultations.filter((c) => c.status === "Pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredConsultations.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border/80 bg-muted/20 rounded-3xl text-muted-foreground">
            No {activeTab.toLowerCase()} consultation sessions found.
          </div>
        ) : (
          filteredConsultations.map((session) => (
            <div 
              key={session._id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-card border border-border/60 rounded-3xl shadow-sm hover:shadow-md transition-all gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold">
                  {session.patientId?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{session.patientId?.name}</h3>
                    <Badge variant={session.status === "Completed" ? "secondary" : session.status === "Active" ? "default" : "outline"}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {session.appointmentId?.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.appointmentId?.time}</span>
                  </div>
                </div>
              </div>

              {session.status !== "Completed" ? (
                <Button 
                  onClick={() => handleStartConsultation(session)} 
                  className="rounded-xl px-5 h-11 font-bold gap-2 self-stretch md:self-auto"
                >
                  <Video className="w-4 h-4" /> Start Consultation
                </Button>
              ) : (
                <div className="text-sm font-semibold text-green-600 flex items-center gap-1 bg-green-500/5 px-3 py-1.5 rounded-xl border border-green-500/10">
                  <Check className="w-4 h-4" /> Consultation Completed
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Full-Screen Telemedicine Video overlay */}
      <AnimatePresence>
        {activeConsultation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row overflow-hidden"
          >
            {/* Left Section: Live Video Room or In-Person Panel */}
            {activeConsultation.appointmentId?.type === "In-person" ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 p-8 h-[55vh] md:h-full relative overflow-y-auto">
                {/* Exit Button */}
                <button
                  onClick={() => window.location.href = "/doctor/appointments"}
                  className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition bg-muted/30 px-4 py-2 rounded-xl border border-border/40"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Exit Session
                </button>

                <div className="max-w-md w-full text-center space-y-6 bg-card border border-border/60 shadow-xl rounded-3xl p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <MapPin className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full">
                      In-Person Consultation
                    </span>
                    <h2 className="text-2xl font-black text-foreground pt-1">
                      {activeConsultation.patientId.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Session started at {activeConsultation.appointmentId.time} on {activeConsultation.appointmentId.date}
                    </p>
                  </div>

                  <div className="border-t border-b border-border/50 py-4 my-2 text-left space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Location:</span>
                      <span className="font-bold text-foreground">Clinic Room</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Email:</span>
                      <span className="font-bold text-foreground">{activeConsultation.patientId.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Phone:</span>
                      <span className="font-bold text-foreground">{activeConsultation.patientId.phone}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Document clinical findings, diagnose, build a prescription, or prescribe therapies in the right sidebar. When finished, click <strong>"Complete & Sign Consultation"</strong> to save the records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative bg-slate-950 p-4 h-[55vh] md:h-full justify-between">
                {/* Patient Badge overlay */}
                <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                    {activeConsultation.patientId.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold">{activeConsultation.patientId.name}</h4>
                    <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Connected</p>
                  </div>
                </div>

                {/* Video Grid */}
                <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center p-8 relative">
                  {/* Simulated Doctor Stream */}
                  {isCamOn ? (
                    <div className="w-full md:w-[60%] h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-2xl">
                      <div className="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-1.5 rounded-xl text-white text-xs font-bold">
                        Patient (Stream Video)
                      </div>
                      {/* Simulated avatar placeholder */}
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <User className="w-20 h-20 text-slate-600 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-[60%] h-full rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                      Camera is Turned Off
                    </div>
                  )}

                  {/* Self Stream (Floating or side) */}
                  <div className="absolute bottom-6 right-6 w-36 h-48 rounded-2xl border-2 border-slate-700 overflow-hidden bg-slate-900 shadow-2xl z-20 hidden md:block">
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-lg text-white text-[9px] font-bold">
                      You (Doctor)
                    </div>
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <User className="w-10 h-10 text-slate-600" />
                    </div>
                  </div>
                </div>

                {/* Video control bar */}
                <div className="flex items-center justify-center gap-4 py-4 z-10 bg-gradient-to-t from-slate-950 to-transparent">
                  <Button 
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`rounded-full w-12 h-12 flex items-center justify-center p-0 ${
                      isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button 
                    onClick={() => setIsCamOn(!isCamOn)}
                    className={`rounded-full w-12 h-12 flex items-center justify-center p-0 ${
                      isCamOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button 
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`rounded-full w-12 h-12 flex items-center justify-center p-0 ${
                      isScreenSharing ? "bg-primary text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    <ScreenShare className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={() => window.location.href = "/doctor/appointments"}
                    className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center p-0"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Right Section: Sidebar (Clinical Records & Bio) */}
            <div className="w-full md:w-[450px] border-t md:border-t-0 md:border-l border-border bg-card flex flex-col h-[45vh] md:h-full z-10">
              {/* Tabs */}
              <div className="flex border-b border-border bg-muted/20">
                <button
                  onClick={() => setActiveSidebarTab("notes")}
                  className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-wider text-center border-b-2 transition-all ${
                    activeSidebarTab === "notes"
                      ? "border-primary text-primary bg-card"
                      : "border-transparent text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  Consultation Details
                </button>
                <button
                  onClick={() => setActiveSidebarTab("patient")}
                  className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-wider text-center border-b-2 transition-all ${
                    activeSidebarTab === "patient"
                      ? "border-primary text-primary bg-card"
                      : "border-transparent text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  Patient Profile
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeSidebarTab === "notes" ? (
                  <div className="space-y-6">
                    {/* Clinical Diagnosis Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="clinical-notes" className="text-sm font-bold flex items-center gap-1.5"><Clipboard className="w-4 h-4 text-primary" /> Clinical Diagnosis & Notes</Label>
                      <textarea
                        id="clinical-notes"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3.5 text-sm border border-border/60 bg-muted/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium leading-relaxed"
                        placeholder="Type diagnosis, clinical notes, patient complaints, and advice here..."
                      />
                    </div>

                    {/* Prescription Builder */}
                    <div className="space-y-4 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary" /> Prescription Items</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleAddPrescriptionItem}
                          className="text-xs font-bold gap-1 text-primary hover:bg-primary/5 rounded-lg px-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Medicine
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {prescriptionItems.map((item, index) => (
                          <div key={index} className="p-3 bg-muted/40 border border-border/55 rounded-2xl space-y-2 relative">
                            {prescriptionItems.length > 1 && (
                              <button
                                onClick={() => handleRemovePrescriptionItem(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-600 p-1 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Medicine name</span>
                              <Input
                                value={item.drug}
                                onChange={(e) => handlePrescriptionChange(index, "drug", e.target.value)}
                                className="h-8 text-xs font-semibold rounded-lg bg-background"
                                placeholder="Paracetamol 650mg"
                                list={`medicine-suggestions-${index}`}
                                autoComplete="off"
                              />
                              <datalist id={`medicine-suggestions-${index}`}>
                                {availableProducts
                                  .filter(p => p.status !== "Out of Stock")
                                  .map((product) => (
                                    <option key={product._id} value={product.name} />
                                  ))
                                }
                              </datalist>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground">Dosage</span>
                                <Input
                                  value={item.dosage}
                                  onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)}
                                  className="h-8 text-xs rounded-lg bg-background"
                                  placeholder="1 tab"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground">Freq</span>
                                <Input
                                  value={item.frequency}
                                  onChange={(e) => handlePrescriptionChange(index, "frequency", e.target.value)}
                                  className="h-8 text-xs rounded-lg bg-background"
                                  placeholder="1-0-1 (after meals)"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground">Duration</span>
                                <Input
                                  value={item.duration}
                                  onChange={(e) => handlePrescriptionChange(index, "duration", e.target.value)}
                                  className="h-8 text-xs rounded-lg bg-background"
                                  placeholder="5 days"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Therapy Builder */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold flex items-center gap-1.5"><Heart className="w-4 h-4 text-primary" /> Prescribe Therapy</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleAddTherapyItem}
                          className="text-xs font-bold gap-1 text-primary hover:bg-primary/5 rounded-lg px-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Therapy
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {therapyItems.map((item, index) => (
                          <div key={index} className="p-3 bg-muted/40 border border-border/55 rounded-2xl space-y-2 relative">
                            {therapyItems.length > 1 && (
                              <button
                                onClick={() => handleRemoveTherapyItem(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-600 p-1 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Therapy Name</span>
                              <Input
                                value={item.name}
                                onChange={(e) => handleTherapyChange(index, "name", e.target.value)}
                                className="h-8 text-xs font-semibold rounded-lg bg-background"
                                placeholder="Couples Therapy Session"
                                list={`therapy-suggestions-${index}`}
                                autoComplete="off"
                              />
                              <datalist id={`therapy-suggestions-${index}`}>
                                {availableServices
                                  .filter(s => s.status !== "Inactive")
                                  .map((service) => (
                                    <option key={service._id} value={service.name} />
                                  ))
                                }
                              </datalist>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Price (₹)</span>
                              <Input
                                type="number"
                                value={item.price || ""}
                                readOnly
                                className="h-8 text-xs rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                                placeholder="Price will auto-fill"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-primary">
                        {activeConsultation.patientId.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold">{activeConsultation.patientId.name}</h4>
                        <p className="text-xs text-muted-foreground">{activeConsultation.patientId.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase text-muted-foreground font-bold">Gender</span>
                        <p className="text-foreground">{activeConsultation.patientId.gender || "Not Specified"}</p>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase text-muted-foreground font-bold">Date of Birth</span>
                        <p className="text-foreground">
                          {activeConsultation.patientId.dob 
                            ? new Date(activeConsultation.patientId.dob).toLocaleDateString()
                            : "Not Specified"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4" /> Allergies
                      </div>
                      <p className="text-xs text-red-800 dark:text-red-400 font-medium">
                        {activeConsultation.patientId.allergies && activeConsultation.patientId.allergies.length > 0
                          ? activeConsultation.patientId.allergies.join(", ")
                          : "No known allergies listed."
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-foreground/80 font-bold text-xs">
                        <Heart className="w-4 h-4 text-primary" /> Medical History
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {activeConsultation.patientId.medicalHistory || "No past medical history recorded."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Complete & Submit controls */}
              <div className="p-4 border-t border-border bg-muted/10 flex flex-col gap-2">
                <Button 
                  onClick={handleCompleteConsultation}
                  disabled={completing || notes.trim() === ""}
                  className="w-full h-11 font-extrabold rounded-xl"
                >
                  {completing ? "Saving Session..." : "Complete & Sign Consultation"}
                </Button>
                <p className="text-[10px] text-muted-foreground/60 text-center font-medium">Clinical notes & digital prescription will be signed and saved to patient records.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
