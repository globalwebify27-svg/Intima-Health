"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, User, Phone, Mail, Award, BookOpen, Briefcase, DollarSign, Camera, AlertCircle } from "lucide-react";

interface DoctorProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialization: string;
  experience: number;
  fees: number;
  qualifications: string[];
  bio: string;
}

export default function DoctorSettingsPage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.doctorId) {
          setDoctorId(data.user.doctorId);
          return fetch(`/api/doctors/${data.user.doctorId}`);
        } else {
          throw new Error("Doctor profile not found.");
        }
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const doc: DoctorProfile = data.data;
          setName(doc.name || "");
          setEmail(doc.email || "");
          setPhone(doc.phone || "");
          setAvatar(doc.avatar || "");
          setSpecialization(doc.specialization || "");
          setExperience(String(doc.experience || "0"));
          setFees(String(doc.fees || "0"));
          setQualifications(doc.qualifications?.join(", ") || "");
          setBio(doc.bio || "");
        }
      })
      .catch((err) => setError(err.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAvatar(data.url);
      } else {
        throw new Error(data.message || "Failed to upload photo.");
      }
    } catch (err: any) {
      setError(err.message || "Photo upload failed.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;

    setSaving(true);
    setSuccess(false);
    setError("");

    const payload = {
      name,
      phone,
      avatar: avatar || undefined,
      specialization,
      experience: Number(experience),
      fees: Number(fees),
      qualifications: qualifications.split(",").map((q) => q.trim()).filter(Boolean),
      bio,
    };

    try {
      const res = await fetch(`/api/doctors/${doctorId}`, {
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
        <p className="text-muted-foreground font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Manage your personal credentials, qualifications, biography, and profile photo.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <p className="font-semibold text-sm">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm font-semibold rounded-2xl border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Profile Photo */}
        <div className="lg:col-span-1 flex flex-col items-center p-6 bg-card border border-border/60 rounded-3xl shadow-sm h-fit space-y-6">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById("profile-upload")?.click()}>
            <div className="w-36 h-36 rounded-full border-2 border-dashed border-border/80 group-hover:border-primary/50 bg-muted flex items-center justify-center overflow-hidden relative transition-colors shadow-inner">
              {avatar ? (
                <img src={avatar} alt="Profile Photo" className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center font-bold text-3xl bg-primary/5 text-primary">
                  {name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "DR"}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-8 h-8 text-white stroke-[1.5]" />
            </div>
          </div>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div className="text-center">
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-primary font-semibold">{specialization || "Clinical Practitioner"}</p>
            <p className="text-xs text-muted-foreground mt-2">Click photo to upload a new profile picture</p>
          </div>
        </div>

        {/* Right Fields Form */}
        <div className="lg:col-span-2 p-6 md:p-8 bg-card border border-border/60 rounded-3xl shadow-sm space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b border-border/50 pb-2 text-foreground/90">Personal Credentials</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-bold flex items-center gap-1.5"><User className="w-4 h-4 text-muted-foreground" /> Full Name</Label>
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
                <Label htmlFor="phone" className="text-sm font-bold flex items-center gap-1.5"><Phone className="w-4 h-4 text-muted-foreground" /> Contact Phone</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold flex items-center gap-1.5"><Mail className="w-4 h-4 text-muted-foreground" /> Email Address (Read-only)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                className="rounded-xl h-11 bg-muted/30 text-muted-foreground border-border/40 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold border-b border-border/50 pb-2 text-foreground/90">Professional Practice</h2>

            <div className="space-y-1.5">
              <Label htmlFor="specialization" className="text-sm font-bold flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-muted-foreground" /> Medical Specialty</Label>
              <Input
                id="specialization"
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="rounded-xl h-11 border-border/60"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="experience" className="text-sm font-bold flex items-center gap-1.5"><Award className="w-4 h-4 text-muted-foreground" /> Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="rounded-xl h-11 border-border/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fees" className="text-sm font-bold flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-muted-foreground" /> Consultation Fees (₹)</Label>
                <Input
                  id="fees"
                  type="number"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="rounded-xl h-11 border-border/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualifications" className="text-sm font-bold flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-muted-foreground" /> Qualifications (comma separated)</Label>
              <Input
                id="qualifications"
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="rounded-xl h-11 border-border/60"
                placeholder="MD - Internal Medicine, Fellowship in Sexual Medicine"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-sm font-bold">Biography & Clinic Description</Label>
              <textarea
                id="bio"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-border/60 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Write about your background, clinical expertise, and practice focus..."
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 mt-4 transition-all">
            {saving ? "Saving Changes..." : "Save Settings Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
