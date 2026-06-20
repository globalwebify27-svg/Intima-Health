"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Users, UserPlus, Trash2, Edit2, Shield, Building2, MapPin, 
  Phone, Mail, Zap, X, Plus, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, Eye, EyeOff 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClinicData {
  _id: string;
  name: string;
  city: string;
}

interface StaffData {
  id: string;
  name: string;
  email: string;
  role: "CLINIC_MANAGER" | "DOCTOR" | "PHARMACY_STAFF";
  clinicId?: ClinicData;
  status: "Active" | "Inactive" | "Pending";
  doctorId?: string;
  specialization?: string;
  phone?: string;
  fees?: number;
  experience?: number;
  bio?: string;
  availability?: Array<{
    day: string;
    slots: Array<{ start: string; end: string }>;
  }>;
  qualifications?: string[];
  conditions?: string[];
}

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CLINIC_MANAGER" | "DOCTOR" | "PHARMACY_STAFF">("CLINIC_MANAGER");

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicAssignment, setClinicAssignment] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Pending">("Active");

  // Doctor Fields
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [bio, setBio] = useState("");
  const [qualificationsText, setQualificationsText] = useState("");
  const [conditionsText, setConditionsText] = useState("");
  const [availability, setAvailability] = useState<Array<{ day: string; slots: Array<{ start: string; end: string }> }>>([]);

  // Time Slot Builder Form state
  const [slotDay, setSlotDay] = useState("Monday");
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("17:00");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const staffRes = await fetch("/api/admin/staff");
      const staffJson = await staffRes.json();
      if (staffJson.success) {
        setStaff(staffJson.data);
      }

      const clinicsRes = await fetch("/api/clinics");
      const clinicsJson = await clinicsRes.json();
      if (clinicsJson.success) {
        setClinics(clinicsJson.data);
      }
    } catch (err) {
      console.error("Failed to load staff directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSlot = () => {
    const existingDay = availability.find(a => a.day === slotDay);
    if (existingDay) {
      existingDay.slots.push({ start: slotStart, end: slotEnd });
      setAvailability([...availability]);
    } else {
      setAvailability([
        ...availability,
        { day: slotDay, slots: [{ start: slotStart, end: slotEnd }] }
      ]);
    }
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...availability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    if (updated[dayIndex].slots.length === 0) {
      updated.splice(dayIndex, 1);
    }
    setAvailability(updated);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setClinicAssignment("");
    setStatus("Active");
    setPhone("");
    setSpecialization("");
    setExperience("");
    setFees("");
    setBio("");
    setQualificationsText("");
    setConditionsText("");
    setAvailability([]);
    setSubmitError("");
    setSuccessMsg("");
    setEditStaffId(null);
    setIsEditMode(false);
    setShowPassword(false);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");

    const body: any = {
      name,
      email,
      role: activeTab,
      clinicId: clinicAssignment || undefined,
      status,
    };

    if (password) {
      body.password = password;
    }

    if (activeTab === "DOCTOR") {
      body.doctorDetails = {
        phone: phone || undefined,
        specialization: specialization || undefined,
        experience: experience ? Number(experience) : undefined,
        bio: bio || undefined,
        fees: fees ? Number(fees) : undefined,
        qualifications: qualificationsText ? qualificationsText.split(",").map(q => q.trim()).filter(Boolean) : ["MD"],
        conditions: conditionsText ? conditionsText.split(",").map(c => c.trim().toLowerCase()).filter(Boolean) : [],
        availability,
      };
    }

    try {
      const url = isEditMode ? `/api/admin/staff/${editStaffId}` : "/api/admin/staff";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to save staff record.");
      }

      setSuccessMsg(isEditMode ? "Staff member updated successfully!" : "Staff member registered successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        fetchData();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (member: StaffData) => {
    setIsEditMode(true);
    setEditStaffId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPassword("");
    setClinicAssignment(member.clinicId?._id || "");
    setStatus(member.status);

    if (member.role === "DOCTOR") {
      setPhone(member.phone || "");
      setSpecialization(member.specialization || "");
      setExperience(String(member.experience || ""));
      setFees(String(member.fees || ""));
      setBio(member.bio || "");
      setQualificationsText(member.qualifications?.join(", ") || "");
      setConditionsText(member.conditions?.join(", ") || "");
      setAvailability(member.availability || []);
    }

    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member? This deletes their credentials and profile permanently.")) return;

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.message || "Failed to delete staff member.");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Filter staff by active tab role
  const filteredStaff = staff.filter(s => s.role === activeTab);

  const columns: ColumnDef<StaffData>[] = [
    {
      accessorKey: "name",
      header: "Staff Name",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-foreground">{row.original.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "clinicId",
      header: "Assigned Clinic",
      cell: ({ row }) => {
        const clinic = row.original.clinicId;
        return clinic ? (
          <div>
            <span className="font-semibold text-foreground text-sm flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-primary" /> {clinic.name}
            </span>
            <span className="text-xs text-muted-foreground">{clinic.city}</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-950 px-2 py-0.5 rounded-full">
            Not Assigned
          </span>
        );
      },
    },
    ...(activeTab === "DOCTOR" ? [
      {
        accessorKey: "specialization",
        header: "Specialization",
        cell: ({ row }: { row: any }) => (
          <div>
            <div className="font-bold text-sm text-foreground">{row.getValue("specialization")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Fees: ₹{row.original.fees}</div>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact Phone",
      }
    ] : []),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "Active" ? "default" : "secondary";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEditClick(row.original)} className="rounded-lg h-9 w-9">
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(row.original.id)} className="rounded-lg h-9 w-9 border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20">
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" /> Staff Directory & Clinic Assignments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage provider logins, credential provisioning, and dynamic clinic assignments.
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="rounded-2xl h-11 px-5 font-bold flex items-center gap-2 bg-primary text-white"
        >
          <UserPlus className="w-4 h-4" /> Provision New Staff
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-card border border-border p-2 rounded-2xl shadow-sm self-start inline-flex">
        <button
          onClick={() => setActiveTab("CLINIC_MANAGER")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "CLINIC_MANAGER" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
          }`}
        >
          Clinic Managers
        </button>
        <button
          onClick={() => setActiveTab("DOCTOR")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "DOCTOR" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
          }`}
        >
          Doctors
        </button>
        <button
          onClick={() => setActiveTab("PHARMACY_STAFF")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "PHARMACY_STAFF" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
          }`}
        >
          Pharmacy Staff
        </button>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading directory logs...</div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <DataTable columns={columns} data={filteredStaff} />
        </div>
      )}

      {/* --- PROVISION MODAL (ADD & EDIT) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="text-lg font-bold">
                    {isEditMode ? "Edit Staff Member Details" : `Provision New ${activeTab.replace("_", " ")}`}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-muted rounded-full">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                {submitError && (
                  <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {submitError}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Pune Clinic Staff"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@intima.health"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isEditMode ? "New Password (Leave blank to keep current)" : "Login Password *"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!isEditMode}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-3 pr-10 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinic Assignment *</label>
                    <select
                      value={clinicAssignment}
                      onChange={(e) => setClinicAssignment(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Assigned Location --</option>
                      {clinics.map((c) => (
                        <option key={c._id} value={c._id}>{c.name} ({c.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending Approval</option>
                    </select>
                  </div>
                </div>

                {/* --- Doctor Specific Details form fields --- */}
                {activeTab === "DOCTOR" && (
                  <div className="border-t border-border pt-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Doctor Profile Information</h4>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9123456789"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialization *</label>
                        <input
                          type="text"
                          required
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="Sexual Medicine"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience (Years) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="8"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Fees (INR) *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={fees}
                          onChange={(e) => setFees(e.target.value)}
                          placeholder="1000"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Qualifications (Comma-separated) *</label>
                        <input
                          type="text"
                          required
                          value={qualificationsText}
                          onChange={(e) => setQualificationsText(e.target.value)}
                          placeholder="MD - Sexual Medicine, Fellowship in Sexual Health"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conditions Treated (Comma-separated, e.g. ed, pe, low-libido, sti, fertility, couples) *</label>
                        <input
                          type="text"
                          required
                          value={conditionsText}
                          onChange={(e) => setConditionsText(e.target.value)}
                          placeholder="ed, pe, low-libido, sti, fertility, couples"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor Biography *</label>
                        <textarea
                          required
                          rows={2}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Brief biography details about experience and specialization..."
                          className="w-full p-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Availability Slot Manager */}
                    <div className="border-t border-border pt-4 space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-primary">Availability Slots</label>
                      
                      {/* Slot Form */}
                      <div className="flex flex-wrap items-end gap-3 bg-muted/30 border border-border/50 p-3 rounded-xl">
                        <div className="flex-1 min-w-[120px] space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Day</span>
                          <select
                            value={slotDay}
                            onChange={(e) => setSlotDay(e.target.value)}
                            className="w-full h-9 px-2 rounded border border-border bg-background text-xs"
                          >
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24 space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Start (HH:MM)</span>
                          <input
                            type="text"
                            value={slotStart}
                            onChange={(e) => setSlotStart(e.target.value)}
                            placeholder="09:00"
                            className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-center"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">End (HH:MM)</span>
                          <input
                            type="text"
                            value={slotEnd}
                            onChange={(e) => setSlotEnd(e.target.value)}
                            placeholder="17:00"
                            className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-center"
                          />
                        </div>
                        <Button type="button" onClick={handleAddSlot} variant="outline" size="sm" className="rounded-lg h-9 font-bold">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Day Slot
                        </Button>
                      </div>

                      {/* Display added slots */}
                      {availability.length > 0 && (
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                          {availability.map((dayGroup, dIdx) => (
                            <div key={dIdx} className="bg-muted/10 border border-border/40 p-2.5 rounded-xl text-xs space-y-1.5">
                              <span className="font-extrabold text-primary">{dayGroup.day}</span>
                              <div className="flex flex-wrap gap-2">
                                {dayGroup.slots.map((slot, sIdx) => (
                                  <Badge key={sIdx} variant="outline" className="flex items-center gap-1 text-[10px] py-1 bg-card">
                                    {slot.start} - {slot.end}
                                    <button type="button" onClick={() => handleRemoveSlot(dIdx, sIdx)} className="text-rose-500 hover:text-rose-700 ml-1">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={submitting} className="w-full h-12 text-white font-bold rounded-xl text-base mt-4">
                  {submitting ? "Processing Registration..." : isEditMode ? "Save Details & Sync Credentials" : "Confirm & Provision Credentials"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
