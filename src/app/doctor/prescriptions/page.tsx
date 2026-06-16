"use client";

import { useEffect, useState } from "react";
import { FileSignature, Plus, Calendar, AlertCircle, CheckCircle2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DrugItem {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PatientData {
  _id: string;
  name: string;
}

interface ConsultationData {
  _id: string;
  appointmentId: {
    _id: string;
    date: string;
    time: string;
  };
  patientId: PatientData;
  notes?: string;
  prescriptionSummary?: string;
  status: "Pending" | "Active" | "Completed";
  createdAt: string;
}

export default function DoctorPrescriptionsPage() {
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState("");
  const [notes, setNotes] = useState("");
  const [drugs, setDrugs] = useState<DrugItem[]>([{ drug: "", dosage: "", frequency: "", duration: "" }]);

  // Messaging
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPrescriptions = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (meJson.success && meJson.user.doctorId) {
        setDoctorId(meJson.user.doctorId);
        
        const res = await fetch(`/api/consultations`);
        const json = await res.json();
        if (json.success) {
          setConsultations(json.data);
        }

        if (meJson.user.clinicId) {
          const prodRes = await fetch(`/api/pharmacy/products?clinicId=${meJson.user.clinicId}`);
          const prodJson = await prodRes.json();
          if (prodJson.success) {
            setProducts(prodJson.data);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleAddDrugRow = () => {
    setDrugs([...drugs, { drug: "", dosage: "", frequency: "", duration: "" }]);
  };

  const handleRemoveDrugRow = (index: number) => {
    if (drugs.length > 1) {
      setDrugs(drugs.filter((_, idx) => idx !== index));
    }
  };

  const handleDrugChange = (index: number, field: keyof DrugItem, value: string) => {
    const updated = [...drugs];
    updated[index][field] = value;
    setDrugs(updated);
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultationId) {
      setErrorMsg("Please select a patient / consultation slot.");
      return;
    }

    // Filter empty drug rows
    const activeDrugs = drugs.filter((d) => d.drug.trim() !== "");
    if (activeDrugs.length === 0) {
      setErrorMsg("Please add at least one medication details.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/consultations/${selectedConsultationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          notes: notes,
          prescriptionSummary: JSON.stringify(activeDrugs),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to submit prescription.");
      }

      setSuccessMsg("Prescription issued and signed successfully!");
      setTimeout(() => {
        setShowModal(false);
        setSelectedConsultationId("");
        setNotes("");
        setDrugs([{ drug: "", dosage: "", frequency: "", duration: "" }]);
        setSuccessMsg("");
        fetchPrescriptions();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter completed ones that have prescriptionSummary
  const prescriptionList = consultations.filter(
    (c) => c.status === "Completed" && c.prescriptionSummary
  );

  // Filter pending ones that need a prescription
  const pendingList = consultations.filter((c) => c.status !== "Completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading prescriptions directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Prescriptions</h1>
          <p className="text-muted-foreground mt-2">
            Write and sign new prescriptions for your patients.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Write Prescription
        </Button>
      </div>

      <div className="space-y-4">
        {prescriptionList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-center text-muted-foreground shadow-sm">
            <FileSignature className="w-12 h-12 mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg">No Prescriptions Issued Yet</h3>
            <p className="text-sm mt-1">Start by clicking the "Write Prescription" button to issue a prescription.</p>
          </div>
        ) : (
          prescriptionList.map((c) => {
            let parsedDrugs: DrugItem[] = [];
            try {
              if (c.prescriptionSummary) {
                parsedDrugs = JSON.parse(c.prescriptionSummary);
              }
            } catch (e) {
              console.error(e);
            }

            return (
              <div
                key={c._id}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-primary/10 rounded-xl text-primary shrink-0">
                    <FileSignature className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Rx for {c.patientId?.name || "Patient"}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {parsedDrugs.map((d, idx) => (
                        <Badge key={idx} variant="outline" className="bg-muted/50 border-border/80 text-xs">
                          {d.drug} ({d.dosage} • {d.duration})
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Prescribed on {new Date(c.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mr-2">
                    Signed & Active
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Write New Prescription</h3>
            </div>

            <form onSubmit={handleSubmitPrescription} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Consultation / Patient *</label>
                <select
                  required
                  value={selectedConsultationId}
                  onChange={(e) => setSelectedConsultationId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Choose Consultation --</option>
                  {pendingList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.patientId?.name} - {c.appointmentId?.date} ({c.appointmentId?.time})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Meds Block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prescribed Medications</h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDrugRow} className="text-xs">
                    + Add Medication
                  </Button>
                </div>

                <div className="space-y-3">
                  {drugs.map((d, index) => (
                    <div key={index} className="flex gap-2 items-center bg-muted/20 p-3 rounded-xl border border-border/50">
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <select
                          required
                          value={d.drug}
                          onChange={(e) => handleDrugChange(index, "drug", e.target.value)}
                          className="col-span-1 h-9 px-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none"
                        >
                          <option value="">-- Select Drug --</option>
                          {products.map((p) => (
                            <option key={p._id} value={p.name}>
                              {p.name} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          value={d.dosage}
                          onChange={(e) => handleDrugChange(index, "dosage", e.target.value)}
                          placeholder="Dosage (e.g. 1 tab)"
                          className="h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          value={d.frequency}
                          onChange={(e) => handleDrugChange(index, "frequency", e.target.value)}
                          placeholder="Frequency (e.g. On demand)"
                          className="h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          value={d.duration}
                          onChange={(e) => handleDrugChange(index, "duration", e.target.value)}
                          placeholder="Duration (e.g. 30 days)"
                          className="h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs focus:outline-none"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDrugRow(index)}
                        disabled={drugs.length === 1}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Notes / Advice</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Patient is recovering well. Maintain supplement routine..."
                  className="w-full p-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl">
                {submitting ? "Signing & Saving..." : "Sign & Issue Digital Prescription"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
