"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, User, Phone, Mail, Calendar, ShieldAlert, Heart, Siren, AlertCircle } from "lucide-react";

interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export default function PatientProfilePage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.patientId) {
          setPatientId(data.user.patientId);
          return fetch(`/api/patients/${data.user.patientId}`);
        } else {
          throw new Error("Patient session not found.");
        }
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const profile: PatientProfile = data.data;
          setName(profile.name || "");
          setEmail(profile.email || "");
          setPhone(profile.phone || "");
          setGender(profile.gender || "");
          setDob(profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "");
          setAllergies(profile.allergies?.join(", ") || "");
          setMedicalHistory(profile.medicalHistory || "");
          setEmergencyContactName(profile.emergencyContactName || "");
          setEmergencyContactPhone(profile.emergencyContactPhone || "");
        }
      })
      .catch((err) => setError(err.message || "Failed to load patient profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    setSaving(true);
    setSuccess(false);
    setError("");

    const payload = {
      name,
      phone,
      gender,
      dob: dob || undefined,
      allergies: allergies.split(",").map((a) => a.trim()).filter(Boolean),
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
    };

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || "Failed to update profile settings.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          My Profile Details
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Update your contact details, clinical allergies, emergency contacts, and medical conditions.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <p className="font-semibold text-sm">Patient profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm font-semibold rounded-2xl border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 md:p-8 bg-card border border-border/60 rounded-3xl shadow-sm space-y-8">
        
        {/* Section 1: Contact Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold border-b border-border/50 pb-2 text-foreground/90 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-11 border-border/60"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp Number</Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-11 border-border/60"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address (Read-only)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                className="rounded-xl h-11 bg-muted/30 text-muted-foreground border-border/40 cursor-not-allowed"
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gender</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-border/65 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="rounded-xl h-11 border-border/60"
            />
          </div>
        </div>

        {/* Section 2: Clinical Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold border-b border-border/50 pb-2 text-foreground/90 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" /> Medical Background
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="allergies" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 text-red-600"><ShieldAlert className="w-4 h-4" /> Known Drug Allergies (comma separated)</Label>
            <Input
              id="allergies"
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="rounded-xl h-11 border-border/60"
              placeholder="e.g. Penicillin, Sulfa drugs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="medicalHistory" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Medical History & Chronic Conditions</Label>
            <textarea
              id="medicalHistory"
              rows={4}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border/60 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium"
              placeholder="Please detail any past surgery, chronic illnesses (hypertension, diabetes), or regular treatments..."
            />
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold border-b border-border/50 pb-2 text-foreground/90 flex items-center gap-2">
            <Siren className="w-5 h-5 text-primary" /> Emergency Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emergencyContactName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Person Name</Label>
              <Input
                id="emergencyContactName"
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="rounded-xl h-11 border-border/60"
                placeholder="Name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emergencyContactPhone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Person Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="text"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="rounded-xl h-11 border-border/60"
                placeholder="Phone"
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 mt-4 transition-all">
          {saving ? "Saving Profile Changes..." : "Save Profile Details"}
        </Button>
      </form>
    </div>
  );
}
