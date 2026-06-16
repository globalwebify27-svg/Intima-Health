"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface PatientData {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface AppointmentData {
  _id: string;
  patientId?: PatientData;
}

export default function ClinicPatientsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [clinicName, setClinicName] = useState("");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clinicRes = await fetch(`/api/clinics/${id}`);
        const clinicJson = await clinicRes.json();
        if (clinicJson.success) {
          setClinicName(clinicJson.data.name);
        }

        const aptsRes = await fetch(`/api/appointments?clinicId=${id}`);
        const aptsJson = await aptsRes.json();
        if (aptsJson.success) {
          const appointments: AppointmentData[] = aptsJson.data;
          const patientsMap = new Map<string, PatientData>();
          appointments.forEach((apt) => {
            if (apt.patientId && !patientsMap.has(apt.patientId._id)) {
              patientsMap.set(apt.patientId._id, apt.patientId);
            }
          });
          setPatients(Array.from(patientsMap.values()));
        }
      } catch (err) {
        console.error("Failed to load clinic patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const columns: ColumnDef<PatientData>[] = [
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => <span className="font-bold text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "phone",
      header: "WhatsApp / Phone",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-xs">
          <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {row.original.phone}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-xs">
          <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {row.original.email}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push(`/admin/clinics/${id}`)} className="rounded-xl gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" /> Clinic Patients Directory
        </h1>
        <p className="text-muted-foreground mt-2">
          Directory of all patients treated or registered for consultations at <span className="font-semibold text-foreground">{clinicName || "Clinic"}</span>.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading patient records...</div>
      ) : (
        <DataTable columns={columns} data={patients} />
      )}
    </div>
  );
}
