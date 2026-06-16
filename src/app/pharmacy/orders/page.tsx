"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Package, Search } from "lucide-react";

interface OrderItem {
  productId?: {
    name: string;
    price: number;
  };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  patientId: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  shippingAddress: string;
  createdAt: string;
}

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = (cId: string) => {
    setLoading(true);
    fetch(`/api/pharmacy/orders?clinicId=${cId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setOrders(resData.data);
        }
      })
      .catch((err) => console.error("Error loading pharmacy orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.clinicId) {
          setClinicId(data.user.clinicId);
          fetchOrders(data.user.clinicId);
        } else {
          // If no clinicId is assigned (e.g. SUPER_ADMIN), load all orders
          fetchOrders("");
        }
      })
      .catch((err) => {
        console.error("Auth verify failed:", err);
        fetchOrders("");
      });
  }, []);

  const handleFulfillOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/pharmacy/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Delivered" }),
      });
      const data = await res.json();
      if (data.success && clinicId) {
        fetchOrders(clinicId);
      } else {
        fetchOrders("");
      }
    } catch (err) {
      console.error("Failed to fulfill order:", err);
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{(row.getValue("_id") as string).substring(18)}</span>,
    },
    {
      id: "patientName",
      header: "Customer",
      cell: ({ row }) => {
        const order = row.original;
        return <span className="font-bold">{order.patientId?.name || "Patient"}</span>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <span>₹{amount.toLocaleString()}</span>;
      }
    },
    {
      id: "medications",
      header: "Medications",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="text-xs space-y-0.5">
            {order.items.map((item, idx) => (
              <div key={idx}>
                • {item.productId?.name || "Medication"} (x{item.quantity})
              </div>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        return <span>{new Date(val).toLocaleDateString()}</span>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant = "default";
        if (status === "Pending") variant = "secondary";
        if (status === "Delivered") variant = "outline";
        if (status === "Processing") variant = "default";
        
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        
        return (
          <div className="flex items-center gap-2">
            {order.status === "Pending" && (
              <Button size="sm" onClick={() => handleFulfillOrder(order._id)} className="rounded-lg">
                <Package className="w-4 h-4 mr-2" /> Fulfill
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      (order.patientId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Orders</h1>
          <p className="text-muted-foreground mt-2">
            Process, package, and ship incoming medication orders for your clinic pharmacy.
          </p>
        </div>
      </div>

      {/* Control bar for search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Search by customer or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border-border bg-muted/20 pl-9 pr-4 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "Pending", "Processing", "Shipped", "Delivered"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="rounded-xl text-xs py-1.5 h-8 shrink-0"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
      ) : (
        <DataTable columns={columns} data={filteredOrders} />
      )}
    </div>
  );
}
