"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  date: string;
  time: string;
  type: string;
  status: string;
  patientId?: PatientData;
  doctorId?: {
    name: string;
  };
}

export default function ClinicAppointmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [clinicName, setClinicName] = useState("");
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
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
          setAppointments(aptsJson.data);
        }
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const columns: ColumnDef<AppointmentData>[] = [
    {
      accessorKey: "patientId.name",
      header: "Patient",
      cell: ({ row }) => <span className="font-bold">{row.original.patientId?.name || "Anonymous Patient"}</span>,
    },
    {
      accessorKey: "doctorId.name",
      header: "Specialist",
      cell: ({ row }) => <span>Dr. {row.original.doctorId?.name || "Unassigned"}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "time",
      header: "Time",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div className="flex items-center gap-2">
            {type === "Video" ? (
              <span className="flex items-center gap-1.5 text-blue-500 font-medium text-xs">
                <Video className="w-4 h-4" /> Video Call
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                <MapPin className="w-4 h-4" /> In-person Clinic
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "Scheduled" ? "default" : status === "Completed" ? "outline" : "destructive";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
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
          <Calendar className="w-8 h-8 text-primary" /> Clinic Bookings
        </h1>
        <p className="text-muted-foreground mt-2">
          View all scheduled consultations and medical bookings at <span className="font-semibold text-foreground">{clinicName || "Clinic"}</span>.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading bookings...</div>
      ) : (
        <DataTable columns={columns} data={appointments} />
      )}
    </div>
  );
}
