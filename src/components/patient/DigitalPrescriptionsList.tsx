import { FileText, Download, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  handleOrderFromPharmacy: (consultation: Consultation) => void;
  handleDownloadPrescription: (consultation: Consultation) => void;
}

export function DigitalPrescriptionsList({
  consultations,
  handleOrderFromPharmacy,
  handleDownloadPrescription
}: DigitalPrescriptionsListProps) {
  const completedConsultations = consultations.filter(
    c => c.status === "Completed" && c.prescriptionSummary
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
  );
}
