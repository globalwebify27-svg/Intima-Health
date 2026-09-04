"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "clinic">("profile");

  // User Profile details
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  // Clinic details
  const [clinicDetails, setClinicDetails] = useState<any>(null);

  // Form password details
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDetails = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "PHARMACY_STAFF") {
        router.push("/staff-login");
        return;
      }

      setUserName(meJson.user.name);
      setUserEmail(meJson.user.email);
      setUserRole(meJson.user.role);

      const clinicId = meJson.user.clinicId;
      if (clinicId) {
        const clinicRes = await fetch(`/api/clinics/${clinicId}`);
        const clinicJson = await clinicRes.json();
        if (clinicJson.success) {
          setClinicDetails(clinicJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to load settings details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      // Find and update staff profile endpoint or credentials
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined
        })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to update profile.");
      }

      setSuccessMsg("Profile credentials updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your pharmacy manager profile credentials and review clinic assignments.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navigation Tabs (Sidebar layout for settings) */}
        <div className="bg-card border border-border p-4 rounded-3xl shadow-sm self-start flex flex-col gap-1.5">
          <button
            onClick={() => { setActiveTab("profile"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full px-4 py-3 rounded-xl text-left text-sm font-bold transition flex items-center gap-3 ${
              activeTab === "profile"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            Profile Credentials
          </button>
          <button
            onClick={() => { setActiveTab("clinic"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full px-4 py-3 rounded-xl text-left text-sm font-bold transition flex items-center gap-3 ${
              activeTab === "clinic"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Clinic Parameters
          </button>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-3 bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Update Profile Settings</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-muted/30 text-muted-foreground text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Portal Password
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave fields empty if you do not wish to change your login password.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-12 text-white font-bold rounded-xl text-base">
                {submitting ? "Saving changes..." : "Save Credentials"}
              </Button>
            </form>
          )}

          {activeTab === "clinic" && clinicDetails && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Associated Clinic Information</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clinic Name</div>
                  <div className="font-bold text-foreground text-lg">{clinicDetails.name}</div>
                </div>

                <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</div>
                  <div className="mt-1">
                    <Badge variant={clinicDetails.status === "Active" ? "default" : "secondary"}>
                      {clinicDetails.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> Location / Address
                  </div>
                  <div className="text-sm font-medium text-foreground">{clinicDetails.address}, {clinicDetails.city}</div>
                </div>

                <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary" /> Phone / Contact
                  </div>
                  <div className="text-sm font-medium text-foreground">{clinicDetails.phone}</div>
                </div>

                <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-1 sm:col-span-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-primary" /> Email Address
                  </div>
                  <div className="text-sm font-medium text-foreground">{clinicDetails.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
