"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface OrderItem {
  productId?: {
    name: string;
  };
  quantity: number;
}

interface OrderData {
  _id: string;
  patientId?: {
    name: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ClinicOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [clinicName, setClinicName] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
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

        const ordersRes = await fetch(`/api/pharmacy/orders?clinicId=${id}`);
        const ordersJson = await ordersRes.json();
        if (ordersJson.success) {
          setOrders(ordersJson.data);
        }
      } catch (err) {
        console.error("Failed to load pharmacy orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const columns: ColumnDef<OrderData>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original._id}</span>,
    },
    {
      accessorKey: "patientId.name",
      header: "Patient",
      cell: ({ row }) => <span className="font-bold">{row.original.patientId?.name || "Patient"}</span>,
    },
    {
      accessorKey: "items",
      header: "Items Prescribed & Dispensed",
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5 max-w-[280px]">
          {row.original.items.map((item, idx) => (
            <div key={idx} className="truncate">• {item.productId?.name || "Medication"} (x{item.quantity})</div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Revenue",
      cell: ({ row }) => <span className="font-bold text-primary">₹{row.original.totalAmount.toLocaleString()}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Date Placed",
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "Pending" ? "secondary" : "outline";
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
          <ShoppingBag className="w-8 h-8 text-primary" /> Pharmacy Orders & Revenue
        </h1>
        <p className="text-muted-foreground mt-2">
          Listing all prescription order fulfillments and pharmacy transactions at <span className="font-semibold text-foreground">{clinicName || "Clinic"}</span>.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading pharmacy orders...</div>
      ) : (
        <DataTable columns={columns} data={orders} />
      )}
    </div>
  );
}
