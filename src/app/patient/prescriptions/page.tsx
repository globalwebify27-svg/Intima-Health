"use client";

import { useEffect, useState } from "react";
import { 
  Pill, FileText, Activity, PhoneCall, 
  CheckCircle2, Clock, ExternalLink, AlertCircle,
  ShieldCheck, Loader2, XCircle, Eye, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { printPrescription } from "@/lib/print-prescription";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Medicine {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

type MedicineForm = "Tablet" | "Capsule" | "Powder" | "Liquid" | "Ointment";

interface SelectableMedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  selected: boolean;
  form: MedicineForm;
  packaging: string;
  customQuantity: string;
}

function detectMedicineForm(drugName: string): MedicineForm {
  const name = drugName.toLowerCase();
  if (/\b(cap|capsule|capsules)\b/i.test(name)) return "Capsule";
  if (/\b(syp|syrup|liquid|drops|sol|solution|susp|suspension)\b/i.test(name)) return "Liquid";
  if (/\b(powder|sachet|churna|granules|kwath|churn)\b/i.test(name)) return "Powder";
  if (/\b(gel|cream|ointment|lotion|tube)\b/i.test(name)) return "Ointment";
  return "Tablet";
}

function getDefaultPackaging(form: MedicineForm): string {
  switch (form) {
    case "Tablet":
      return "30 Tablets (1 Month Supply)";
    case "Capsule":
      return "30 Capsules (1 Month Supply)";
    case "Powder":
      return "100 gm";
    case "Liquid":
      return "1 Bottle (200 ml)";
    case "Ointment":
      return "1 Tube (15 gm)";
    default:
      return "1 Pack";
  }
}

const PACKAGING_OPTIONS: Record<MedicineForm, string[]> = {
  Tablet: [
    "10 Tablets (1 Strip)",
    "20 Tablets (2 Strips)",
    "30 Tablets (1 Month Supply)",
    "60 Tablets (2 Months Supply)",
    "90 Tablets (3 Months Supply)",
    "1 Strip",
    "2 Strips",
    "3 Strips",
    "4 Strips",
    "5 Strips",
    "Custom Quantity",
  ],
  Capsule: [
    "10 Capsules (1 Strip)",
    "20 Capsules (2 Strips)",
    "30 Capsules (1 Month Supply)",
    "60 Capsules (2 Months Supply)",
    "90 Capsules (3 Months Supply)",
    "1 Strip",
    "2 Strips",
    "3 Strips",
    "4 Strips",
    "5 Strips",
    "Custom Quantity",
  ],
  Powder: [
    "50 gm",
    "100 gm",
    "200 gm",
    "250 gm",
    "500 gm",
    "1 kg",
    "Custom Quantity",
  ],
  Liquid: [
    "1 Bottle (100 ml)",
    "1 Bottle (200 ml)",
    "2 Bottles (200 ml)",
    "1 Bottle (500 ml)",
    "1 Bottle",
    "2 Bottles",
    "3 Bottles",
    "Custom Quantity",
  ],
  Ointment: [
    "1 Tube (15 gm)",
    "1 Tube (30 gm)",
    "2 Tubes",
    "3 Tubes",
    "Custom Quantity",
  ],
};

interface Consultation {
  _id: string;
  doctorId?: {
    name: string;
    specialization: string;
    clinicId?: {
      _id: string;
      name?: string;
    } | string;
  };
  appointmentId?: {
    clinicId?: {
      _id: string;
      name?: string;
    } | string;
  };
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  createdAt: string;
  isValid?: boolean;
  daysLeft?: number;
}

interface ExistingOrder {
  _id: string;
  consultationId?: { _id?: string } | string;
  status: string;
  orderNumber?: string;
}

export default function PatientPrescriptionsPage() {
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<Consultation[]>([]);
  const [existingOrders, setExistingOrders] = useState<ExistingOrder[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [patientUser, setPatientUser] = useState<{ name?: string; phone?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Order Request State
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
  const [selectableItems, setSelectableItems] = useState<SelectableMedicineItem[]>([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPrescriptions = async (pId: string) => {
    try {
      const [resConsult, resOrders] = await Promise.all([
        fetch(`/api/consultations?patientId=${pId}`),
        fetch(`/api/pharmacy/orders?patientId=${pId}`),
      ]);

      const jsonConsult = await resConsult.json();
      const jsonOrders = await resOrders.json();

      if (jsonOrders.success && Array.isArray(jsonOrders.data)) {
        setExistingOrders(jsonOrders.data);
      }

      if (jsonConsult.success && jsonConsult.data) {
        const currentTime = Date.now();
        const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
        const completedPrescriptions = jsonConsult.data
          .filter(
            (c: { status: string; prescriptionSummary?: string; prescribedTherapies?: string }) =>
              c.status === "Completed" && (
                (c.prescriptionSummary && c.prescriptionSummary !== "[]") ||
                (c.prescribedTherapies && c.prescribedTherapies !== "[]")
              )
          )
          .map((c: Consultation) => {
            const rxDate = new Date(c.createdAt).getTime();
            const isValid = currentTime - rxDate <= sixtyDaysMs;
            const daysLeft = Math.max(0, 60 - Math.floor((currentTime - rxDate) / (1000 * 60 * 60 * 24)));
            return {
              ...c,
              isValid,
              daysLeft,
            };
          });
        setPrescriptions(completedPrescriptions);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fast path: use cached patient info to immediately start fetching data on frame 0
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("patient_auth_user");
        if (cached) {
          const user = JSON.parse(cached);
          if (user.patientId) {
            setPatientId(user.patientId);
            setPatientUser({
              name: user.name,
              phone: user.phone,
              email: user.email,
            });
            fetchPrescriptions(user.patientId);
          }
        }
      } catch (e) {
        console.error("Cache read error:", e);
      }
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("patient_auth_user", JSON.stringify(data.user));
            } catch {}
          }
          if (data.user.patientId) {
            setPatientId(data.user.patientId);
            setPatientUser({
              name: data.user.name,
              phone: data.user.phone,
              email: data.user.email,
            });
            fetchPrescriptions(data.user.patientId);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const openMedicineSelector = (consult: Consultation) => {
    setSelectedConsult(consult);
    setErrorMessage(null);

    let parsedMeds: Medicine[] = [];
    try {
      parsedMeds = JSON.parse(consult.prescriptionSummary || "[]");
    } catch {
      parsedMeds = [];
    }

    if (parsedMeds.length === 0) {
      parsedMeds = [{
        drug: "Doctor Prescribed Medicines",
        dosage: "As Prescribed",
        frequency: "Daily",
        duration: "As directed",
      }];
    }

    const items: SelectableMedicineItem[] = parsedMeds.map((med) => {
      const form = detectMedicineForm(med.drug);
      return {
        name: med.drug,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        selected: true,
        form,
        packaging: getDefaultPackaging(form),
        customQuantity: "",
      };
    });

    setSelectableItems(items);
    setSelectModalOpen(true);
  };

  const handleToggleItem = (index: number) => {
    setSelectableItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleFormChange = (index: number, newForm: MedicineForm) => {
    setSelectableItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              form: newForm,
              packaging: getDefaultPackaging(newForm),
              customQuantity: "",
            }
          : item
      )
    );
  };

  const handlePackagingChange = (index: number, newPackaging: string) => {
    setSelectableItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, packaging: newPackaging } : item
      )
    );
  };

  const handleCustomQuantityChange = (index: number, customVal: string) => {
    setSelectableItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, customQuantity: customVal } : item
      )
    );
  };

  const handleConfirmSubmitRequest = async () => {
    if (!selectedConsult) return;

    const selectedMeds = selectableItems.filter((i) => i.selected);
    if (selectedMeds.length === 0) {
      setErrorMessage("Please select at least one medicine to order.");
      return;
    }

    try {
      setSubmittingOrder(true);
      setErrorMessage(null);

      const formattedItems = selectedMeds.map((item) => {
        const finalPackaging =
          item.packaging === "Custom Quantity"
            ? (item.customQuantity.trim() || "Custom Requirement")
            : item.packaging;

        return {
          name: item.name,
          form: item.form,
          packaging: finalPackaging,
          dosage: [item.dosage, item.frequency, item.duration].filter(Boolean).join(" • "),
          quantity: 1,
        };
      });

      const payload = {
        consultationId: selectedConsult._id,
        patientId,
        patientDetails: {
          name: patientUser?.name,
          phone: patientUser?.phone,
          email: patientUser?.email,
        },
        items: formattedItems,
      };

      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok && !data.alreadySubmitted) {
        throw new Error(data.message || "Failed to submit medicine order request.");
      }

      setSubmittedOrderNumber(data.data?.orderNumber || "KMH-REQ");
      setSelectModalOpen(false);
      setConfirmationModalOpen(true);

      // Refresh orders so UI shows status badge
      if (patientId) {
        const resOrders = await fetch(`/api/pharmacy/orders?patientId=${patientId}`);
        const jsonOrders = await resOrders.json();
        if (jsonOrders.success && Array.isArray(jsonOrders.data)) {
          setExistingOrders(jsonOrders.data);
        }
      }
    } catch (err) {
      console.error("Order request failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Unable to place medicine order request.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleDownloadPrescription = (consultation: Consultation) => {
    try {
      printPrescription(consultation);
    } catch {
      window.print();
    }
  };

  const getExistingOrderForConsult = (consultId: string) => {
    return existingOrders.find((o) => {
      const cId = typeof o.consultationId === "object" ? o.consultationId?._id : o.consultationId;
      return cId === consultId && !["Cancelled", "CANCELLED"].includes(o.status);
    });
  };

  if (loading && prescriptions.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted/60 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-muted/40 rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-card rounded-3xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-muted rounded-md" />
                    <div className="h-3 w-36 bg-muted/60 rounded-md" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-muted rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-14 bg-muted/30 rounded-2xl" />
                <div className="h-14 bg-muted/30 rounded-2xl" />
              </div>
              <div className="pt-2 flex justify-between gap-2 border-t border-border/40">
                <div className="h-9 w-32 bg-muted/50 rounded-xl" />
                <div className="h-9 w-36 bg-primary/20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">Active Prescriptions &amp; Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review your doctor&apos;s prescriptions and request medicine dispatch from the clinic pharmacy.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 w-full max-w-full min-w-0">
        {prescriptions.length > 0 ? (
          prescriptions.map((consult) => {
            const meds: Medicine[] = JSON.parse(consult.prescriptionSummary || "[]");
            const isValid = consult.isValid ?? true;
            const daysLeft = consult.daysLeft ?? 60;
            const existingOrder = getExistingOrderForConsult(consult._id);
            const isOrderFulfilled = !!(existingOrder && (
              existingOrder.status.toUpperCase() === "FULFILLED" || 
              existingOrder.status.toUpperCase() === "DELIVERED"
            ));

            const doctorDisplayName = consult.doctorId?.name
              ? (consult.doctorId.name.startsWith("Dr.") ? consult.doctorId.name : `Dr. ${consult.doctorId.name}`)
              : "Dr. Medical Specialist";

            const getOrderBadge = (status: string) => {
              const norm = (status || "").toUpperCase();
              if (norm === "FULFILLED" || norm === "DELIVERED" || norm === "COMPLETED") {
                return (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1.5 py-1 px-3 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered &amp; Dispensed
                  </Badge>
                );
              }
              if (norm === "DISPATCHED" || norm === "SHIPPED") {
                return (
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-bold gap-1.5 py-1 px-3 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Dispatched / On the Way
                  </Badge>
                );
              }
              if (norm === "CALL_COMPLETED" || norm === "PRESCRIPTION_APPROVED") {
                return (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold gap-1.5 py-1 px-3 shadow-xs">
                    <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Call Verified • Processing
                  </Badge>
                );
              }
              if (norm === "CANCELLED") {
                return (
                  <Badge variant="destructive" className="text-xs font-bold gap-1.5 py-1 px-3">
                    <XCircle className="w-3.5 h-3.5" /> Order Cancelled
                  </Badge>
                );
              }
              return (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold gap-1.5 py-1 px-3 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Order Placed • In Review
                </Badge>
              );
            };

            return (
              <div key={consult._id} className="p-4 sm:p-6 bg-card rounded-3xl border border-border shadow-sm flex flex-col justify-between space-y-4 w-full max-w-full min-w-0 overflow-hidden">
                <div className="space-y-4 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base truncate">Rx #{consult._id.substring(18)}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          Prescribed by {doctorDisplayName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-auto">
                      {isValid ? (
                        <Badge variant="outline" className="border-border text-muted-foreground text-xs font-semibold">
                          Valid ({daysLeft}d left)
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs font-semibold">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="space-y-2 min-w-0">
                    {meds.map((med, idx) => (
                      <div key={idx} className="p-3 bg-muted/40 rounded-2xl text-xs space-y-0.5 min-w-0">
                        <div className="flex justify-between items-center gap-2 min-w-0">
                          <p className="font-bold text-foreground min-w-0 truncate">{med.drug}</p>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">Prescribed</span>
                        </div>
                        <p className="text-muted-foreground break-words text-[11px]">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </p>
                      </div>
                    ))}

                    {/* Prescribed Therapies */}
                    {consult.prescribedTherapies && JSON.parse(consult.prescribedTherapies).map((th: { name: string }, idx: number) => (
                      <div key={`th-${idx}`} className="p-3 bg-purple-500/5 dark:bg-purple-950/5 border border-purple-500/10 rounded-2xl text-xs flex items-center gap-2 min-w-0">
                        <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-purple-900 dark:text-purple-400 break-words min-w-0">{th.name}</p>
                          <p className="text-muted-foreground text-[10px]">Clinical Therapy Recommended</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Order Status Highlight Bar */}
                  {existingOrder && (
                    <div className="p-3 bg-muted/30 border border-border/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Order Status:</span>
                        {getOrderBadge(existingOrder.status)}
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground shrink-0">
                        #{existingOrder.orderNumber}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-1 flex justify-between items-center gap-2 flex-wrap min-w-0">
                    <span>Issued: {new Date(consult.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Actions: Responsive 2-column grid on mobile, flex row on desktop */}
                <div className="grid grid-cols-2 gap-2 pt-2 w-full max-w-full min-w-0 sm:flex sm:flex-row">
                  {isValid ? (
                    existingOrder ? (
                      <Button 
                        variant="outline"
                        className="h-11 rounded-xl font-bold gap-2 text-xs border-border hover:bg-muted text-foreground shadow-xs w-full sm:flex-1 min-w-0"
                        onClick={() => router.push(`/patient/orders/${existingOrder._id}`)}
                      >
                        <Eye className="w-4 h-4 text-primary shrink-0" /> 
                        <span className="truncate">View Order</span>
                      </Button>
                    ) : (
                      <Button 
                        className="h-11 rounded-xl font-bold gap-2 shadow-sm text-xs bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:flex-1 min-w-0"
                        onClick={() => openMedicineSelector(consult)}
                      >
                        <Pill className="w-4 h-4 shrink-0" />
                        <span className="truncate">Order Medicines</span>
                      </Button>
                    )
                  ) : (
                    <Link href="/booking" className="w-full col-span-2 sm:col-span-1 sm:flex-1 min-w-0">
                      <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs gap-1.5 border-primary text-primary">
                        Prescription Expired — Book Reassessment
                      </Button>
                    </Link>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="h-11 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground w-full sm:w-auto shrink-0 shadow-xs"
                    onClick={() => handleDownloadPrescription(consult)}
                    title="Download Official Prescription"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span className="truncate">Download Rx</span>
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-3xl text-muted-foreground space-y-3">
            <Pill className="w-12 h-12 mx-auto text-muted-foreground/60" />
            <div>
              <p className="font-bold text-base text-foreground">No Active Prescriptions</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Consult a Kelkar Manas doctor to receive verified digital prescriptions eligible for pharmacy order requests.
              </p>
            </div>
            <Link href="/booking">
              <Button size="sm" className="rounded-full px-6 gap-2">
                Book Consultation <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* SELECT MEDICINES MODAL - FLEXIBLE PACKAGING / UNITS */}
      <Dialog open={selectModalOpen} onOpenChange={setSelectModalOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-7 space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold font-serif text-foreground">
              Select Medicines to Order
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose individual medicines from your prescription. You are not forced to buy the full list.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Medicines Selection List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {selectableItems.map((item, idx) => {
              const isChecked = item.selected;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isChecked
                      ? "border-primary/50 bg-primary/[0.03] shadow-xs"
                      : "border-border/60 bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`med-check-${idx}`}
                      checked={isChecked}
                      onChange={() => handleToggleItem(idx)}
                      className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                    />
                    <label htmlFor={`med-check-${idx}`} className="flex-1 cursor-pointer select-none space-y-0.5">
                      <p className="font-bold text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {[item.dosage, item.frequency, item.duration].filter(Boolean).join(" • ")}
                      </p>
                    </label>
                  </div>

                  {isChecked && (
                    <div className="pt-2.5 border-t border-border/40 space-y-2.5">
                      {/* Medicine Form Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground">Medicine Form:</span>
                        <div className="flex flex-wrap gap-1">
                          {(["Tablet", "Capsule", "Powder", "Liquid", "Ointment"] as MedicineForm[]).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => handleFormChange(idx, f)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                                item.form === f
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              }`}
                            >
                              {f === "Powder" ? "Powder (gm/kg)" : f === "Liquid" ? "Liquid (ml/Bottle)" : f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity / Unit Dropdown */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground">Quantity / Need:</span>
                        <select
                          value={item.packaging}
                          onChange={(e) => handlePackagingChange(idx, e.target.value)}
                          className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {PACKAGING_OPTIONS[item.form].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Custom Quantity Input */}
                      {item.packaging === "Custom Quantity" && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-muted-foreground font-medium shrink-0">Enter need:</span>
                          <input
                            type="text"
                            value={item.customQuantity}
                            onChange={(e) => handleCustomQuantityChange(idx, e.target.value)}
                            placeholder={
                              item.form === "Powder"
                                ? "e.g., 150 gm or 2 kg"
                                : item.form === "Liquid"
                                ? "e.g., 350 ml or 4 bottles"
                                : item.form === "Ointment"
                                ? "e.g., 4 tubes (30g)"
                                : "e.g., 45 tablets or 4 strips"
                            }
                            className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-muted/40 rounded-2xl text-[11px] text-muted-foreground flex items-center gap-2 border border-border/50">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Selected medicines will be verified against your doctor&apos;s prescription before delivery.</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button 
              variant="outline" 
              className="rounded-xl font-semibold text-xs"
              onClick={() => setSelectModalOpen(false)}
              disabled={submittingOrder}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSubmitRequest}
              disabled={!selectableItems.some(i => i.selected) || submittingOrder}
              className="rounded-xl font-bold bg-primary text-primary-foreground px-6 text-xs gap-1.5"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                "Proceed to Request"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION MODAL - EXACT REVISED WORKFLOW COPY */}
      <Dialog open={confirmationModalOpen} onOpenChange={setConfirmationModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              Order Request Submitted
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/80 leading-relaxed font-medium">
              Your order request has been sent to the clinic pharmacy. You will receive a confirmation call from the clinic pharmacy.
            </DialogDescription>
          </DialogHeader>

          {submittedOrderNumber && (
            <div className="p-3 bg-muted/50 rounded-2xl text-xs text-muted-foreground">
              Reference ID: <span className="font-mono font-bold text-foreground">{submittedOrderNumber}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              variant="outline" 
              className="rounded-xl font-semibold"
              onClick={() => setConfirmationModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              className="rounded-xl font-bold bg-primary text-primary-foreground"
              onClick={() => {
                setConfirmationModalOpen(false);
                router.push("/patient/orders");
              }}
            >
              View in My Orders &rarr;
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
