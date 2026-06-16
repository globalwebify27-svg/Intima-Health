"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface DoctorData {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  status: string;
}

export default function ClinicSpecialistsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [clinicName, setClinicName] = useState("");
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
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

        const docsRes = await fetch(`/api/doctors?clinicId=${id}`);
        const docsJson = await docsRes.json();
        if (docsJson.success) {
          setDoctors(docsJson.data);
        }
      } catch (err) {
        console.error("Failed to load specialists:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const columns: ColumnDef<DoctorData>[] = [
    {
      accessorKey: "name",
      header: "Specialist Name",
      cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
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
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "Active" ? "default" : "secondary";
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
          <UserPlus className="w-8 h-8 text-primary" /> Assigned Specialists
        </h1>
        <p className="text-muted-foreground mt-2">
          Managing doctors and specialists registered at <span className="font-semibold text-foreground">{clinicName || "Clinic"}</span>.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading specialists...</div>
      ) : (
        <DataTable columns={columns} data={doctors} />
      )}
    </div>
  );
}
