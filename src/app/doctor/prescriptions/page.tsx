"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileSignature, Plus, Search, X, Trash2, AlertCircle,
  CheckCircle2, User, Phone, Heart, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DrugItem {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface TherapyItem {
  name: string;
  price: number;
  therapistId?: string;
  recommendedMode?: "Online" | "Offline" | "Both";
  doctorNotes?: string;
}

interface ClinicService {
  _id: string;
  name: string;
  price: number;
  status: string;
}

interface PatientResult {
  _id: string;
  name: string;
  phone: string;
  email: string;
  gender?: string;
}

interface PrescriptionRecord {
  _id: string;
  patientId?: { _id: string; name: string };
  doctorId?: { _id: string; name: string };
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  notes?: string;
  status: string;
  createdAt: string;
  appointmentId?: any;
}

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [clinicServices, setClinicServices] = useState<ClinicService[]>([]);
  const [availableTherapists, setAvailableTherapists] = useState<any[]>([]);
  const [clinicId, setClinicId] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);

  // Patient search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [notes, setNotes] = useState("");
  const [drugs, setDrugs] = useState<DrugItem[]>([{ drug: "", dosage: "", frequency: "", duration: "" }]);
  const [therapies, setTherapies] = useState<TherapyItem[]>([]);

  // Status messages
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPrescriptions = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (meJson.success && meJson.user.doctorId) {
        const res = await fetch(`/api/consultations?_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setPrescriptions(json.data.filter((c: any) => c.status === "Completed" && (
            (c.prescriptionSummary && c.prescriptionSummary !== "[]") ||
            (c.prescribedTherapies && c.prescribedTherapies !== "[]")
          )));
        }

        if (meJson.user.clinicId) {
          setClinicId(meJson.user.clinicId);

          // Fetch pharmacy products for medicine autocomplete
          const prodRes = await fetch(`/api/pharmacy/products?clinicId=${meJson.user.clinicId}`);
          const prodJson = await prodRes.json();
          if (prodJson.success) setProducts(prodJson.data);

          // Fetch global therapy services
          const svcRes = await fetch(`/api/services`);
          const svcJson = await svcRes.json();
          if (svcJson.success) {
            setClinicServices(svcJson.data.filter((s: any) => s.status === "Active" && s.type === "Therapy"));
          }

          // Fetch clinic therapists
          const thRes = await fetch(`/api/therapists`);
          const thJson = await thRes.json();
          if (thJson.success) {
            setAvailableTherapists(thJson.data || []);
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

  // ── Patient search (debounced) ────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSelectedPatient(null);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (val.trim().length < 2) { setSearchResults([]); return; }

    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/prescriptions?search=${encodeURIComponent(val.trim())}`);
        const json = await res.json();
        if (json.success) setSearchResults(json.data);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  const handleSelectPatient = (p: PatientResult) => {
    setSelectedPatient(p);
    setSearchQuery(p.name);
    setSearchResults([]);
  };

  // ── Drug handlers ─────────────────────────────────────────────────────────
  const handleAddDrug = () => setDrugs([...drugs, { drug: "", dosage: "", frequency: "", duration: "" }]);
  const handleRemoveDrug = (i: number) => { if (drugs.length > 1) setDrugs(drugs.filter((_, idx) => idx !== i)); };
  const handleDrugChange = (i: number, field: keyof DrugItem, val: string) => {
    const u = [...drugs]; u[i][field] = val; setDrugs(u);
  };

  // ── Therapy handlers ──────────────────────────────────────────────────────
  const handleAddTherapy = () => setTherapies([
    ...therapies, 
    { name: "", price: 0, therapistId: "", recommendedMode: "Online", doctorNotes: "" }
  ]);
  const handleRemoveTherapy = (i: number) => setTherapies(therapies.filter((_, idx) => idx !== i));
  const handleTherapyChange = (index: number, field: keyof TherapyItem, value: any) => {
    const u = [...therapies];
    u[index] = { ...u[index], [field]: value };
    if (field === "name") {
      const matched = clinicServices.find(s => s.name.toLowerCase() === (value || "").toLowerCase());
      if (matched && matched.price) u[index].price = matched.price;
    }
    if (field === "therapistId" && value) {
      const selectedTh = availableTherapists.find(t => t._id === value);
      if (selectedTh && selectedTh.fees && !u[index].price) {
        u[index].price = selectedTh.fees;
      }
    }
    setTherapies(u);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetModal = () => {
    setSelectedPatient(null);
    setSearchQuery("");
    setSearchResults([]);
    setNotes("");
    setDrugs([{ drug: "", dosage: "", frequency: "", duration: "" }]);
    setTherapies([]);
    setSuccessMsg("");
    setErrorMsg("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) { setErrorMsg("Please search and select a patient first."); return; }
    const activeDrugs = drugs.filter(d => d.drug.trim() !== "");
    if (activeDrugs.length === 0) { setErrorMsg("Please add at least one medication."); return; }

    setSubmitting(true); setErrorMsg(""); setSuccessMsg("");

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          drugs: activeDrugs,
          therapies: therapies.filter(t => t.name.trim() !== ""),
          notes,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to issue prescription.");

      setSuccessMsg(`Prescription issued for ${selectedPatient.name}!`);
      setTimeout(() => { setShowModal(false); resetModal(); fetchPrescriptions(); }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">Loading prescriptions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Prescriptions</h1>
          <p className="text-muted-foreground mt-2">Write prescriptions for any patient — walk-in or consultation.</p>
        </div>
        <Button onClick={() => { resetModal(); setShowModal(true); }} className="rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Write Prescription
        </Button>
      </div>

      {/* Issued Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-center text-muted-foreground shadow-sm">
            <FileSignature className="w-12 h-12 mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg">No Prescriptions Issued Yet</h3>
            <p className="text-sm mt-1">Click "Write Prescription" to issue one for any clinic patient.</p>
          </div>
        ) : (
          prescriptions.map((c) => {
            let parsedDrugs: DrugItem[] = [];
            let parsedTherapies: TherapyItem[] = [];
            try { if (c.prescriptionSummary) parsedDrugs = JSON.parse(c.prescriptionSummary); } catch {}
            try { if (c.prescribedTherapies) parsedTherapies = JSON.parse(c.prescribedTherapies); } catch {}

            return (
              <div key={c._id} className="flex flex-col md:flex-row md:items-start justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-primary/10 rounded-xl text-primary shrink-0">
                    <FileSignature className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-foreground">Rx — {c.patientId?.name || "Patient"}</h3>
                      {!c.appointmentId && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/5">Walk-in</Badge>
                      )}
                    </div>

                    {/* Medications */}
                    {parsedDrugs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedDrugs.map((d, idx) => (
                          <Badge key={idx} variant="outline" className="bg-muted/50 border-border/80 text-xs">
                            {d.drug} ({d.dosage} • {d.duration})
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Therapies */}
                    {parsedTherapies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedTherapies.map((t, idx) => (
                          <Badge key={idx} variant="outline" className="bg-violet-500/5 border-violet-500/20 text-violet-600 text-xs">
                            <Heart className="w-3 h-3 mr-1" />{t.name} — ₹{t.price}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {c.notes && <p className="text-xs text-muted-foreground italic">"{c.notes}"</p>}
                    <p className="text-xs text-muted-foreground">
                      Issued on {new Date(c.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 self-start shrink-0">Signed & Active</Badge>
              </div>
            );
          })
        )}
      </div>

      {/* ── Write Prescription Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto space-y-5 my-4">
            <button onClick={() => { setShowModal(false); resetModal(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileSignature className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Write Prescription</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                </div>
              )}

              {/* ── Patient Search ── */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Search Patient by Name or Mobile *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder="Search here..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoComplete="off"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Dropdown results */}
                {searchResults.length > 0 && !selectedPatient && (
                  <div className="border border-border rounded-xl bg-background shadow-lg overflow-hidden divide-y divide-border">
                    {searchResults.map(p => (
                      <button key={p._id} type="button" onClick={() => handleSelectPatient(p)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {p.phone}{p.gender && ` • ${p.gender}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected patient card */}
                {selectedPatient && (
                  <div className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {selectedPatient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{selectedPatient.name}</p>
                      <p className="text-xs text-muted-foreground"><Phone className="w-3 h-3 inline mr-1" />{selectedPatient.phone}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedPatient(null); setSearchQuery(""); }}
                      className="text-muted-foreground hover:text-destructive p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && !searching && !selectedPatient && (
                  <p className="text-xs text-muted-foreground px-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> No patients found at this clinic. Ask the manager to register them first.
                  </p>
                )}
              </div>

              {/* ── Medications ── */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Prescribed Medications *
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDrug} className="text-xs rounded-lg h-8">
                    + Add Medicine
                  </Button>
                </div>
                <div className="space-y-3">
                  {drugs.map((d, i) => (
                    <div key={i} className="p-3.5 bg-muted/30 border border-border/60 rounded-2xl space-y-2.5 relative">
                      {drugs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDrug(i)}
                          className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive p-1 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {/* Medicine name full-width */}
                      <div className="space-y-1 pr-6">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Medicine Name *</span>
                        <input
                          type="text"
                          required
                          value={d.drug}
                          onChange={e => handleDrugChange(i, "drug", e.target.value)}
                          placeholder="e.g. Paracetamol 650mg"
                          list={`drug-list-${i}`}
                          autoComplete="off"
                          className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <datalist id={`drug-list-${i}`}>
                          {products.map(p => <option key={p._id} value={p.name} />)}
                        </datalist>
                      </div>
                      {/* Dosage, Freq, Duration in responsive columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Dosage</span>
                          <input
                            type="text"
                            required
                            value={d.dosage}
                            onChange={e => handleDrugChange(i, "dosage", e.target.value)}
                            placeholder="e.g. 1 tab / 5ml"
                            className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Frequency</span>
                          <input
                            type="text"
                            required
                            value={d.frequency}
                            onChange={e => handleDrugChange(i, "frequency", e.target.value)}
                            placeholder="e.g. 1-0-1 / Once daily"
                            className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Duration</span>
                          <input
                            type="text"
                            required
                            value={d.duration}
                            onChange={e => handleDrugChange(i, "duration", e.target.value)}
                            placeholder="e.g. 5 days / 1 month"
                            className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Therapies ── */}
              <div className="space-y-3 pt-1 border-t border-border/40">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-primary" /> Prescribe Therapies (Optional)
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTherapy} className="text-xs rounded-lg h-8">
                    + Add Therapy
                  </Button>
                </div>

                {clinicServices.length === 0 && (
                  <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                    No clinic therapies configured yet. Ask the manager to add them under &quot;Therapies Offered&quot;.
                  </p>
                )}

                {therapies.length > 0 && (
                  <div className="space-y-3">
                    {therapies.map((t, i) => (
                      <div key={i} className="p-3.5 bg-muted/30 border border-border/60 rounded-2xl space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveTherapy(i)}
                          className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-destructive p-1 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Therapy Service */}
                        <div className="space-y-1 pr-6">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Therapy Service *</span>
                          <input
                            type="text"
                            value={t.name}
                            onChange={e => handleTherapyChange(i, "name", e.target.value)}
                            placeholder="Couples Therapy Session / CBT"
                            list={`therapy-list-${i}`}
                            autoComplete="off"
                            className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <datalist id={`therapy-list-${i}`}>
                            {clinicServices.map(s => <option key={s._id} value={s.name} />)}
                          </datalist>
                        </div>

                        {/* Assign Licensed Therapist */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                              <User className="w-3 h-3 text-primary" /> Assign Licensed Therapist *
                            </span>
                            {t.therapistId && (
                              <span className="text-[10px] font-semibold text-emerald-600">Assigned</span>
                            )}
                          </div>
                          <select
                            value={t.therapistId || ""}
                            onChange={e => handleTherapyChange(i, "therapistId", e.target.value)}
                            className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">-- Choose Assigned Therapist --</option>
                            {availableTherapists.map(th => (
                              <option key={th._id} value={th._id}>
                                {th.name} ({th.specialization || "Licensed Psychologist"}) - ₹{th.fees || 1500}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Mode & Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Recommended Mode</span>
                            <select
                              value={t.recommendedMode || "Online"}
                              onChange={e => handleTherapyChange(i, "recommendedMode", e.target.value)}
                              className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-border bg-background focus:outline-none"
                            >
                              <option value="Online">Online Video</option>
                              <option value="Offline">Offline Clinic</option>
                              <option value="Both">Flexible (Both)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Session Fee (₹)</span>
                            <input
                              type="number"
                              value={t.price || ""}
                              onChange={e => handleTherapyChange(i, "price", Number(e.target.value))}
                              placeholder="1500"
                              className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        {/* Clinical Guidance / Doctor Notes */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Clinical Guidance / Doctor Notes</span>
                          <textarea
                            rows={2}
                            value={t.doctorNotes || ""}
                            onChange={e => handleTherapyChange(i, "doctorNotes", e.target.value)}
                            placeholder="Guidance for assigned therapist (e.g. CBT focus, partner dynamics, anxiety triggers)..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Clinical Notes ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Clinical Notes / Advice
                </label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Diagnosis, advice, follow-up instructions..."
                  className="w-full p-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <Button type="submit" disabled={submitting || !selectedPatient} className="w-full h-11 text-white font-bold rounded-xl">
                {submitting ? "Signing & Saving..." : "Sign & Issue Digital Prescription"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
