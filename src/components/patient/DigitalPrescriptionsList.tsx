import { FileText, Download, Pill, CheckCircle2, Clock, PhoneCall } from "lucide-react";
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
    <div className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm space-y-4">
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
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">Prescribed by {doctorName}</h4>
                    <p className="text-xs text-muted-foreground">Date: {new Date(consult.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {isFulfilled ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fulfilled
                      </Badge>
                    ) : (existingOrder?.status || "").toUpperCase() === "CALL_COMPLETED" ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold gap-1">
                        <PhoneCall className="w-3 h-3 text-blue-600" /> Call Verified
                      </Badge>
                    ) : existingOrder ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending
                      </Badge>
                    ) : null}
                    <Badge variant="outline" className="text-xs shrink-0">Rx #{consult._id.substring(18)}</Badge>
                  </div>
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
                  <div>
                    {existingOrder ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Order Status:</span>
                        {isFulfilled ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1 py-0.5 px-2.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered &amp; Dispensed
                          </Badge>
                        ) : (existingOrder.status || "").toUpperCase() === "CALL_COMPLETED" ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold gap-1 py-0.5 px-2.5">
                            <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Call Verified • Processing
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold gap-1 py-0.5 px-2.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Order Placed • In Review
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Official prescription ready for ordering</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {existingOrder ? (
                      <Link href={`/patient/orders/${existingOrder._id}`} className="flex-1 sm:flex-initial">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="rounded-xl h-9 text-xs font-bold gap-1.5 border border-primary/20 text-primary hover:bg-primary/10 shadow-sm w-full sm:w-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 
                          <span className="truncate">
                            {isFulfilled ? `Order Delivered & Dispensed (${existingOrder.orderNumber || "Details"})` : `View Order (${existingOrder.orderNumber || "Status"})`}
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/patient/prescriptions" className="flex-1 sm:flex-initial">
                        <Button 
                          size="sm" 
                          className="rounded-xl h-9 text-xs font-bold gap-1.5 w-full sm:w-auto"
                        >
                          <Pill className="w-3.5 h-3.5 shrink-0" /> Order from Clinic Pharmacy
                        </Button>
                      </Link>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownloadPrescription(consult)}
                      className="rounded-xl h-9 text-xs font-bold gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Rx
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
