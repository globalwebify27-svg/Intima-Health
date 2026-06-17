"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, Plus, Trash2, Edit3, X, CheckCircle2, AlertCircle, Sparkles, DollarSign, User, ShieldAlert 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

interface ClinicService {
  _id: string;
  name: string;
  price: number;
  description?: string;
  status: "Active" | "Inactive";
  doctorId?: Doctor;
}

export default function ManageClinicServicesPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Status message states
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchServicesAndDoctors = async (cId: string) => {
    try {
      // 1. Fetch clinic therapies/services
      const servicesRes = await fetch(`/api/clinic-services?clinicId=${cId}&_t=${Date.now()}`, { cache: "no-store" });
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setServices(servicesData.data);
      }

      // 2. Fetch doctors for this clinic
      const docsRes = await fetch(`/api/doctors?clinicId=${cId}`);
      const docsData = await docsRes.json();
      if (docsData.success) {
        setDoctors(docsData.data);
      }
    } catch (err) {
      console.error("Failed to load clinic services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.clinicId) {
          setClinicId(data.user.clinicId);
          fetchServicesAndDoctors(data.user.clinicId);
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
    setSelectedDoctor("");
    setStatus("Active");
    setEditingId(null);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (service: ClinicService) => {
    resetForm();
    setEditingId(service._id);
    setName(service.name);
    setPrice(String(service.price));
    setDescription(service.description || "");
    setSelectedDoctor(service.doctorId?._id || "");
    setStatus(service.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      clinicId,
      doctorId: selectedDoctor || undefined,
      name,
      price: Number(price),
      description,
      status,
    };

    try {
      let res;
      if (editingId) {
        // Edit mode
        res = await fetch(`/api/clinic-services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create mode
        res = await fetch("/api/clinic-services", {
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
        if (clinicId) fetchServicesAndDoctors(clinicId);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service/therapy from the clinic list?")) return;

    try {
      const res = await fetch(`/api/clinic-services/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Service deleted successfully.");
        if (clinicId) fetchServicesAndDoctors(clinicId);
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
        Loading therapies and services...
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
            <h1 className="text-3xl font-bold tracking-tight">Therapies & Services</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Create and manage specialized clinical therapies and session prices.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenAddModal} className="rounded-2xl h-11 px-5 text-white font-bold gap-2 self-stretch md:self-auto shadow-lg shadow-primary/10">
          <Plus className="w-5 h-5" /> Add Therapy Service
        </Button>
      </div>

      {/* Services List Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        {services.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-4">
            <Activity className="w-12 h-12 stroke-[1.2] mx-auto text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">No Therapies Configured</h3>
              <p className="text-xs text-muted-foreground">Add services offered by your doctors to populate pharmacy billing.</p>
            </div>
            <Button onClick={handleOpenAddModal} size="sm" variant="outline" className="rounded-xl">Add First Service</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Therapy Name</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-foreground">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[300px]">{service.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {service.doctorId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            Dr
                          </div>
                          <span className="font-semibold text-xs text-foreground">Dr. {service.doctorId.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">General (All Specialists)</span>
                      )}
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
              <h3 className="text-lg font-bold">{editingId ? "Edit Therapy Service" : "Add Therapy Service"}</h3>
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Service / Therapy Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cognitive Behavioral Therapy (CBT)"
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
                      placeholder="1500"
                      className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign Specialist Doctor (Optional)</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-3.5 w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- General Clinic Therapy (Any Specialist) --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the therapy structure, duration, or guidelines..."
                  className="w-full p-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl mt-2">
                {submitting ? "Saving..." : editingId ? "Update Service details" : "Add Service to Clinic"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
