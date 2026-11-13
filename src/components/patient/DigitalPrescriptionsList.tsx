import { FileText, Download, Pill, CheckCircle2, Clock, PhoneCall, Eye, XCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Medicine {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
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

interface DigitalPrescriptionsListProps {
  consultations: Consultation[];
  orders?: any[];
  handleOrderFromPharmacy?: (consultation: Consultation) => void;
  handleDownloadPrescription: (consultation: Consultation) => void;
}

export function DigitalPrescriptionsList({
  consultations,
  orders = [],
  handleDownloadPrescription
}: DigitalPrescriptionsListProps) {
  const completedConsultations = consultations.filter(
    c => c.status === "Completed" && (
      (c.prescriptionSummary && c.prescriptionSummary !== "[]") ||
      (c.prescribedTherapies && c.prescribedTherapies !== "[]")
    )
  );

  return (
    <div className="p-3.5 sm:p-6 bg-card rounded-2xl sm:rounded-3xl border border-border/60 shadow-sm space-y-4 w-full max-w-full overflow-hidden">
      <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-3">
        <FileText className="w-4 h-4 text-primary" /> My Digital Prescriptions
      </h3>
      
      <div className="space-y-4">
        {completedConsultations.length > 0 ? (
          completedConsultations.map((consult) => {
            const meds: Medicine[] = JSON.parse(consult.prescriptionSummary || "[]");
            const existingOrder = orders?.find(
              (o) =>
                o.consultationId === consult._id ||
                (typeof o.consultationId === "object" && o.consultationId?._id === consult._id)
            );
            const isFulfilled = !!(existingOrder && (
              (existingOrder.status || "").toUpperCase() === "FULFILLED" ||
              (existingOrder.status || "").toUpperCase() === "DELIVERED"
            ));

            const doctorName = consult.doctorId?.name
              ? (consult.doctorId.name.startsWith("Dr.") ? consult.doctorId.name : `Dr. ${consult.doctorId.name}`)
              : "Dr. Medical Specialist";

            return (
              <div key={consult._id} className="p-4 sm:p-5 border border-border rounded-2xl space-y-4 w-full max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">Prescribed by {doctorName}</h4>
                    <p className="text-xs text-muted-foreground">Date: {new Date(consult.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-xs shrink-0 font-mono">Rx #{consult._id.substring(18)}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2 min-w-0">
                  {meds.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2 text-xs font-semibold p-2.5 bg-muted/40 rounded-xl min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground break-words">{med.drug}</p>
                        <p className="text-[10px] text-muted-foreground break-words">Dosage: {med.dosage} | Frequency: {med.frequency}</p>
                      </div>
                      <span className="text-[10px] text-primary shrink-0 whitespace-nowrap">{med.duration}</span>
                    </div>
                  ))}
                  {consult.prescribedTherapies && JSON.parse(consult.prescribedTherapies).map((th: { name: string }, idx: number) => (
                    <div key={`th-${idx}`} className="p-2.5 bg-purple-500/5 dark:bg-purple-950/5 border border-purple-500/10 rounded-xl text-xs flex items-center gap-2 min-w-0">
                      <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-purple-900 dark:text-purple-400 break-words">{th.name}</p>
                        <p className="text-muted-foreground text-[10px]">Clinical Therapy Recommended</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40 min-w-0">
                  <div className="min-w-0 w-full sm:w-auto">
                    {existingOrder ? (
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Order Status:</span>
                        {isFulfilled ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1 py-0.5 px-2.5 shadow-2xs shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered &amp; Dispensed
                          </Badge>
                        ) : (existingOrder.status || "").toUpperCase() === "CALL_COMPLETED" ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold gap-1 py-0.5 px-2.5 shadow-2xs shrink-0">
                            <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Call Verified • Processing
                          </Badge>
                        ) : (existingOrder.status || "").toUpperCase() === "CANCELLED" ? (
                          <Badge variant="destructive" className="text-xs font-bold gap-1 py-0.5 px-2.5 shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Order Cancelled
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold gap-1 py-0.5 px-2.5 shadow-2xs shrink-0">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Order Placed • In Review
                          </Badge>
                        )}
                        {existingOrder.orderNumber && (
                          <span className="text-[11px] font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60 shrink-0">
                            #{existingOrder.orderNumber}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Official prescription ready for ordering</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto shrink-0">
                    {existingOrder ? (
                      <Link href={`/patient/orders/${existingOrder._id}`} className="w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-xl h-9 text-xs font-bold gap-1.5 border-border hover:bg-muted text-foreground w-full sm:w-auto shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary shrink-0" /> 
                          <span className="truncate">View Order</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/patient/prescriptions" className="w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          className="rounded-xl h-9 text-xs font-bold gap-1.5 w-full sm:w-auto shadow-2xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Pill className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Order Medicines</span>
                        </Button>
                      </Link>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownloadPrescription(consult)}
                      className="rounded-xl h-9 text-xs font-bold gap-1.5 w-full sm:w-auto shrink-0 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Download Rx</span>
                    </Button>
                  </div>
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
  );
}
