"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, X, ArrowRight, ArrowLeft, Check, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ClinicData {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
}

export default function ClinicsAdminPage() {
  const router = useRouter();
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Actions Dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // View Details state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewClinic, setViewClinic] = useState<ClinicData | null>(null);

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editClinicId, setEditClinicId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchClinics = () => {
    setLoading(true);
    fetch("/api/clinics")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setClinics(resData.data);
        }
      })
      .catch((err) => console.error("Error loading clinics:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleCreateOrUpdate = async () => {
    setSubmitting(true);
    setSubmitError("");

    const body = {
      name,
      city,
      address,
      phone,
      email,
      status,
    };

    try {
      const url = isEditMode ? `/api/clinics/${editClinicId}` : "/api/clinics";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Failed to save clinic details.");
      }

      setIsModalOpen(false);
      resetForm();
      fetchClinics();
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (clinic: ClinicData) => {
    setIsEditMode(true);
    setEditClinicId(clinic._id);
    setName(clinic.name);
    setCity(clinic.city);
    setAddress(clinic.address);
    setPhone(clinic.phone);
    setEmail(clinic.email);
    setStatus(clinic.status);
    setStep(1);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this clinic?")) return;

    try {
      const res = await fetch(`/api/clinics/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchClinics();
      } else {
        alert(data.message || "Failed to delete.");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleViewClick = (clinic: ClinicData) => {
    setViewClinic(clinic);
    setIsViewOpen(true);
  };

  const resetForm = () => {
    setName("");
    setCity("");
    setAddress("");
    setPhone("");
    setEmail("");
    setStatus("Active");
    setStep(1);
    setIsEditMode(false);
    setEditClinicId(null);
    setSubmitError("");
  };

  const columns: ColumnDef<ClinicData>[] = [
    {
      accessorKey: "name",
      header: "Clinic Name",
      cell: ({ row }) => {
        const clinic = row.original;
        return (
          <button 
            onClick={() => router.push(`/admin/clinics/${clinic._id}`)}
            className="font-bold hover:text-primary text-left transition-colors"
          >
            {clinic.name}
          </button>
        );
      }
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "Active" ? "default" : "destructive";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const clinic = row.original;
        const isOpen = activeMenuId === clinic._id;
        return (
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setActiveMenuId(isOpen ? null : clinic._id)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
                <div className="absolute right-0 mt-1 w-36 bg-card border border-border shadow-xl rounded-xl py-1 z-40 flex flex-col">
                  <button 
                    onClick={() => {
                      setActiveMenuId(null);
                      router.push(`/admin/clinics/${clinic._id}`);
                    }} 
                    className="w-full text-left px-4 py-2 text-xs hover:bg-muted font-medium transition-colors"
                  >
                    Open Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      setActiveMenuId(null);
                      handleViewClick(clinic);
                    }} 
                    className="w-full text-left px-4 py-2 text-xs hover:bg-muted font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => {
                      setActiveMenuId(null);
                      handleEditClick(clinic);
                    }} 
                    className="w-full text-left px-4 py-2 text-xs hover:bg-muted font-medium transition-colors"
                  >
                    Edit Clinic
                  </button>
                  <button 
                    onClick={() => {
                      setActiveMenuId(null);
                      handleDeleteClick(clinic._id);
                    }} 
                    className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 font-medium transition-colors"
                  >
                    Delete Clinic
                  </button>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinics Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage clinic locations across the platform.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Add Clinic
        </Button>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading clinic list...</div>
      ) : (
        <DataTable columns={columns} data={clinics} />
      )}

      {/* Multi-step Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!submitting) setIsModalOpen(false); }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h3 className="text-xl font-bold">{isEditMode ? "Edit Clinic" : "Add Clinic"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 2</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Step Indicators */}
              <div className="flex px-6 py-3 bg-muted/30 border-b border-border gap-2">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      step >= s ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {submitError && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                    {submitError}
                  </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-sm font-bold">Clinic Name *</label>
                      <input
                        type="text"
                        placeholder="Pune Intimacy Clinic"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold">City *</label>
                      <input
                        type="text"
                        placeholder="Pune"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold">Full Address *</label>
                      <input
                        type="text"
                        placeholder="Sector 4, Koregaon Park, Pune"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-sm font-bold">WhatsApp / Phone *</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold">Email Address *</label>
                      <input
                        type="email"
                        placeholder="pune@intima.health"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={submitting}
                    className="rounded-xl h-11 px-4 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <Button
                    onClick={() => {
                      if (!name || !city || !address) {
                        setSubmitError("Please fill out all required fields.");
                        return;
                      }
                      setSubmitError("");
                      setStep(step + 1);
                    }}
                    className="rounded-xl h-11 px-5 gap-2 ml-auto"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateOrUpdate}
                    disabled={submitting || !phone || !email}
                    className="rounded-xl h-11 px-5 gap-2 ml-auto"
                  >
                    {submitting ? "Saving..." : (
                      <>
                        <Check className="w-4 h-4" /> {isEditMode ? "Save Changes" : "Save Clinic"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewOpen && viewClinic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full border border-border bg-muted flex items-center justify-center text-primary">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{viewClinic.name}</h3>
                    <p className="text-sm text-primary font-medium">{viewClinic.city}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3 border-t border-b border-border py-4">
                <p className="text-sm"><strong>City:</strong> {viewClinic.city}</p>
                <p className="text-sm"><strong>Address:</strong> {viewClinic.address}</p>
                <p className="text-sm"><strong>WhatsApp / Phone:</strong> {viewClinic.phone}</p>
                <p className="text-sm"><strong>Email:</strong> {viewClinic.email}</p>
                <p className="text-sm">
                  <strong>Status:</strong>{" "}
                  <Badge variant={viewClinic.status === "Active" ? "default" : "destructive"}>
                    {viewClinic.status}
                  </Badge>
                </p>
              </div>

              <Button onClick={() => setIsViewOpen(false)} className="w-full rounded-xl h-11">
                Close
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
