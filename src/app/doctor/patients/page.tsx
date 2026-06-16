"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText } from "lucide-react";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Patient Name",
    cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg">
            <FileText className="w-4 h-4 mr-2" /> Records
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "DOCTOR") {
          window.location.href = "/staff-login";
          return;
        }

        const dId = meJson.user.doctorId;
        if (dId) {
          const aptsRes = await fetch(`/api/appointments?doctorId=${dId}`);
          const aptsJson = await aptsRes.json();
          if (aptsJson.success) {
            const uniquePatientsMap = new Map<string, Patient>();
            aptsJson.data.forEach((apt: any) => {
              if (apt.patientId && apt.patientId._id) {
                uniquePatientsMap.set(apt.patientId._id, apt.patientId);
              }
            });
            setPatients(Array.from(uniquePatientsMap.values()));
          }
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading patients directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground mt-2">
            View profiles and clinical records of patients assigned to you.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={patients} />
    </div>
  );
}
