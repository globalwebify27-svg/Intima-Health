"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  Edit3, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  X,
  Activity
} from "lucide-react";

import { getServiceIcon, SERVICE_ICON_OPTIONS } from "@/lib/service-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlatformService {
  _id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: "Consultation" | "Therapy";
  status: "Active" | "Inactive";
}

export default function ManagePlatformServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Activity");
  const [type, setType] = useState<"Consultation" | "Therapy">("Consultation");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (err) {
      console.error("Failed to load platform services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && (data.user.role === "SUPER_ADMIN" || data.user.role === "CLINIC_ADMIN" || data.user.role === "ADMIN")) {
          fetchServices();
        } else {
          router.push("/staff-login");
        }
      })
      .catch((err) => {
        console.error(err);
        router.push("/staff-login");
      });
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setIcon("Activity");
    setType("Consultation");
    setStatus("Active");
    setEditingId(null);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (service: PlatformService) => {
    resetForm();
    setEditingId(service._id);
    setName(service.name);
    setPrice(String(service.price));
    setDescription(service.description);
    setIcon(service.icon || "Activity");
    setType(service.type);
    setStatus(service.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      name,
      price: Number(price),
      description,
      icon,
      type,
      status,
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Failed to save service.");
      }

      setSuccessMsg(editingId ? "Service updated successfully!" : "Service added successfully!");
      setTimeout(() => {
        setShowModal(false);
        resetForm();
        fetchServices();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform service?")) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchServices();
      } else {
        alert(data.message || "Failed to delete service.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        Loading platform services...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Services</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Manage the global services shown to patients in the booking modal.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenAddModal} className="rounded-2xl h-11 px-5 text-white font-bold gap-2 self-stretch md:self-auto shadow-lg shadow-primary/10">
          <Plus className="w-5 h-5" /> Add Global Service
        </Button>
      </div>

      {/* Services List Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        {services.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-4">
            <Activity className="w-12 h-12 stroke-[1.2] mx-auto text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">No Platform Services Configured</h3>
              <p className="text-xs text-muted-foreground">Add general platform services that clinics can offer.</p>
            </div>
            <Button onClick={handleOpenAddModal} size="sm" variant="outline" className="rounded-xl">Add First Service</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {(() => {
                            const Icon = getServiceIcon(service.icon);
                            return <Icon className="w-4 h-4 text-primary" />;
                          })()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{service.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[300px]">{service.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-xs text-foreground">{service.type}</span>
                    </td>
                    <td className="p-4 font-extrabold text-primary">₹{service.price}</td>
                    <td className="p-4">
                      <Badge variant={service.status === "Active" ? "secondary" : "destructive"}>
                        {service.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenEditModal(service)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                        >
                          <Edit3 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(service._id)}
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">{editingId ? "Edit Global Service" : "Add Global Service"}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Online Consultation"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (₹) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-3.5 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="999"
                      className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Therapy">Therapy</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Icon</label>
                  <select
                    required
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {SERVICE_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the service..."
                  className="w-full p-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl mt-2">
                {submitting ? "Saving..." : editingId ? "Update Service details" : "Add Service"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
