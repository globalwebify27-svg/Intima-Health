"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Truck,
  Plus,
  Trash2,
  ShieldCheck,
  Save,
  Loader2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Palette,
  Mail,
  Send,
  Bell,
  Server,
  Key,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServiceablePincode {
  pinCode: string;
  areaName: string;
  deliveryCharge: number;
  estimatedHours: string;
  isActive: boolean;
}

interface PharmacyConfig {
  pharmacyName: string;
  licenseNumber: string;
  pharmacistInCharge: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  isActive: boolean;
  allowCOD: boolean;
  taxRatePercent: number;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  serviceablePincodes: ServiceablePincode[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "pharmacy" | "branding" | "notifications">("profile");

  // Notification Recipient state (Owner Testing & Inquiries)
  const [contactNotificationEmail, setContactNotificationEmail] = useState("temptest9093@gmail.com");
  const [testRecipientEmail, setTestRecipientEmail] = useState("saahmed311@gmail.com");
  const [savingNotificationEmail, setSavingNotificationEmail] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testingAllMails, setTestingAllMails] = useState(false);

  // SMTP Server Configuration state
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState<number | string>(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [hasSmtpPass, setHasSmtpPass] = useState(false);
  const [smtpFromName, setSmtpFromName] = useState("Kelkar Manas Health Care");
  const [smtpFromEmail, setSmtpFromEmail] = useState("support@kelkarmanasclinic.com");
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // User Profile details
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Branding & Logo state
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [customLogoUrl, setCustomLogoUrl] = useState("/logo.png");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form password details
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Pharmacy & Delivery Config state
  const [pharmacyConfig, setPharmacyConfig] = useState<PharmacyConfig>({
    pharmacyName: "Kelkar Manas Partner Pharmacy",
    licenseNumber: "MH-AKL-2026-20B-10842",
    pharmacistInCharge: "Licensed Pharmacist (Reg. No. MH-PH-49120)",
    contactPhone: "+91 94228 61000",
    contactEmail: "pharmacy@kelkarmanas.com",
    address: "Civil Lines, Near District Hospital, Akola, Maharashtra 444001",
    isActive: true,
    allowCOD: false,
    taxRatePercent: 12,
    defaultDeliveryFee: 50,
    freeDeliveryThreshold: 500,
    serviceablePincodes: [],
  });
  const [savingPharmacy, setSavingPharmacy] = useState(false);

  // New PIN code form state
  const [newPin, setNewPin] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newFee, setNewFee] = useState("50");
  const [newTime, setNewTime] = useState("Same Day (within 24 hrs)");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "SUPER_ADMIN") {
          router.push("/staff-login");
          return;
        }

        if (!ignore) {
          setUserName(meJson.user.name || "");
          setUserEmail(meJson.user.email || "");
        }

        // Load pharmacy config
        const configRes = await fetch("/api/pharmacy/config");
        const configJson = await configRes.json();
        if (!ignore && configJson.success && configJson.data) {
          setPharmacyConfig(configJson.data);
        }

        // Load branding logo
        const brandingRes = await fetch("/api/admin/settings/branding");
        const brandingJson = await brandingRes.json();
        if (!ignore && brandingJson.success && brandingJson.data?.logoUrl) {
          setLogoUrl(brandingJson.data.logoUrl);
          setCustomLogoUrl(brandingJson.data.logoUrl);
        }

        // Load contact notification & SMTP settings
        const notifRes = await fetch("/api/admin/settings/notifications");
        const notifJson = await notifRes.json();
        if (!ignore && notifJson.success && notifJson.data) {
          const d = notifJson.data;
          if (d.contactNotificationEmail) {
            setContactNotificationEmail(d.contactNotificationEmail);
            const first = d.contactNotificationEmail.split(/[,;\s]+/)[0];
            if (first) {
              setTestRecipientEmail(first);
            }
          }
          if (d.smtpHost) setSmtpHost(d.smtpHost);
          if (d.smtpPort) setSmtpPort(d.smtpPort);
          if (typeof d.smtpSecure === "boolean") setSmtpSecure(d.smtpSecure);
          if (d.smtpUser) setSmtpUser(d.smtpUser);
          if (d.smtpFromName) setSmtpFromName(d.smtpFromName);
          if (d.smtpFromEmail) setSmtpFromEmail(d.smtpFromEmail);
          setHasSmtpPass(Boolean(d.hasSmtpPass));
          setIsSmtpConfigured(Boolean(d.isSmtpConfigured));
        }
      } catch (err) {
        console.error("Failed to load settings details:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [router]);

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
      if (json.success) {
        setSuccessMsg("Profile details and credentials updated successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(json.message || "Failed to update profile.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Save Pharmacy Configuration
  const handleSavePharmacyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPharmacy(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/pharmacy/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pharmacyConfig),
      });

      const json = await res.json();
      if (json.success) {
        setPharmacyConfig(json.data);
        setSuccessMsg("Pharmacy partner credentials and Akola delivery coverage updated successfully.");
      } else {
        setErrorMsg(json.message || "Failed to update pharmacy settings.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving pharmacy settings.";
      setErrorMsg(msg);
    } finally {
      setSavingPharmacy(false);
    }
  };

  // Add new PIN code to coverage
  const handleAddPinCode = () => {
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setErrorMsg("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (!newArea.trim()) {
      setErrorMsg("Please enter the locality or area name.");
      return;
    }

    const updated = [
      ...pharmacyConfig.serviceablePincodes,
      {
        pinCode: newPin.trim(),
        areaName: newArea.trim(),
        deliveryCharge: Number(newFee) || 50,
        estimatedHours: newTime.trim() || "24-48 Hours",
        isActive: true,
      },
    ];

    setPharmacyConfig({ ...pharmacyConfig, serviceablePincodes: updated });
    setNewPin("");
    setNewArea("");
    setSuccessMsg(`Added PIN code ${newPin} (${newArea}) to delivery matrix. Click "Save Pharmacy Settings" to apply.`);
  };

  // Remove PIN code
  const handleRemovePinCode = (pinToRemove: string) => {
    const updated = pharmacyConfig.serviceablePincodes.filter((p) => p.pinCode !== pinToRemove);
    setPharmacyConfig({ ...pharmacyConfig, serviceablePincodes: updated });
  };

  // Toggle PIN code active status
  const handleTogglePinActive = (pinToToggle: string) => {
    const updated = pharmacyConfig.serviceablePincodes.map((p) => 
      p.pinCode === pinToToggle ? { ...p, isActive: !p.isActive } : p
    );
    setPharmacyConfig({ ...pharmacyConfig, serviceablePincodes: updated });
  };

  // Upload new logo file
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid image type. Please upload a PNG, SVG, JPG, or WebP logo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Logo file size exceeds 5MB. Please upload a smaller file.");
      return;
    }

    setUploadingLogo(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "branding");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setLogoUrl(json.url);
        setCustomLogoUrl(json.url);
        setSuccessMsg("Logo uploaded to preview. Click 'Save Logo Changes' to apply it across the website.");
      } else {
        throw new Error(json.message || "Failed to upload logo.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading logo.";
      setErrorMsg(msg);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save logo changes
  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = customLogoUrl.trim() || logoUrl.trim();
    if (!finalUrl) {
      setErrorMsg("Please provide or upload a valid logo image.");
      return;
    }

    setSavingLogo(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: finalUrl }),
      });

      const json = await res.json();
      if (json.success) {
        setLogoUrl(finalUrl);
        setCustomLogoUrl(finalUrl);
        setSuccessMsg("Clinic logo updated successfully! It is now live across the website, navigation menu, and admin portal.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("branding_updated", { detail: { logoUrl: finalUrl } }));
        }
      } else {
        setErrorMsg(json.message || "Failed to save logo.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving the logo.";
      setErrorMsg(msg);
    } finally {
      setSavingLogo(false);
    }
  };

  // Reset to default logo
  const handleResetDefaultLogo = async () => {
    if (!confirm("Are you sure you want to reset to the default system logo (/logo.png)?")) return;
    setSavingLogo(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: "/logo.png" }),
      });

      const json = await res.json();
      if (json.success) {
        setLogoUrl("/logo.png");
        setCustomLogoUrl("/logo.png");
        setSuccessMsg("Reset to default system logo (/logo.png).");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("branding_updated", { detail: { logoUrl: "/logo.png" } }));
        }
      } else {
        setErrorMsg(json.message || "Failed to reset logo.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset logo.";
      setErrorMsg(msg);
    } finally {
      setSavingLogo(false);
    }
  };

  // Save notification email for contact form & owner testing
  const handleSaveNotificationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotificationEmail(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactNotificationEmail }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || "Contact form notification email saved successfully.");
      } else {
        setErrorMsg(json.message || "Failed to update notification email.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update notification email.";
      setErrorMsg(msg);
    } finally {
      setSavingNotificationEmail(false);
    }
  };

  // Trigger test notification email to the configured or custom test recipient
  const handleSendTestNotification = async () => {
    const targetEmail = testRecipientEmail.trim() || contactNotificationEmail.trim();
    if (!targetEmail) {
      setErrorMsg("Please enter a test recipient email address.");
      return;
    }
    setTestingNotification(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_contact", email: targetEmail }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || `Test notification sent to ${targetEmail}!`);
      } else {
        setErrorMsg(json.message || "Failed to deliver test notification. Please verify SMTP settings.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger test notification.";
      setErrorMsg(msg);
    } finally {
      setTestingNotification(false);
    }
  };

  // Trigger all 5 email templates with test data to recipient
  const handleTriggerAllTestEmails = async () => {
    const targetEmail = testRecipientEmail.trim() || contactNotificationEmail.trim();
    if (!targetEmail) {
      setErrorMsg("Please enter a test recipient email address.");
      return;
    }
    setTestingAllMails(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_all", email: targetEmail }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || `All 5 email templates dispatched to ${targetEmail}!`);
      } else {
        setErrorMsg(json.message || "Failed to trigger all test emails. Please verify SMTP settings.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger test emails.";
      setErrorMsg(msg);
    } finally {
      setTestingAllMails(false);
    }
  };

  // Save SMTP Outgoing Server Configuration
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSuccessMsg("");
    setErrorMsg("");
    setSmtpTestResult(null);

    try {
      const payload: Record<string, any> = {
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 465,
        smtpSecure,
        smtpUser: smtpUser.trim(),
        smtpFromName: smtpFromName.trim(),
        smtpFromEmail: smtpFromEmail.trim(),
      };
      if (smtpPass.trim()) {
        payload.smtpPass = smtpPass.trim();
      }

      const res = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || "SMTP configuration saved and activated successfully.");
        if (json.data) {
          setIsSmtpConfigured(Boolean(json.data.isSmtpConfigured));
          setHasSmtpPass(Boolean(json.data.hasSmtpPass));
        }
        setSmtpPass(""); // Clear local input after successful save
      } else {
        setErrorMsg(json.message || "Failed to update SMTP settings.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update SMTP settings.";
      setErrorMsg(msg);
    } finally {
      setSavingSmtp(false);
    }
  };

  // Test SMTP Server Connection (Handshake & Auth)
  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_smtp",
          smtpHost: smtpHost.trim(),
          smtpPort: Number(smtpPort) || 465,
          smtpSecure,
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim() || undefined,
          email: contactNotificationEmail,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSmtpTestResult({ success: true, message: json.message || "SMTP connection verified successfully!" });
        setSuccessMsg(json.message || "SMTP connection verified successfully!");
      } else {
        setSmtpTestResult({ success: false, message: json.message || "SMTP connection test failed." });
        setErrorMsg(json.message || "SMTP connection test failed. Please verify credentials.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to test SMTP connection.";
      setSmtpTestResult({ success: false, message: msg });
      setErrorMsg(msg);
    } finally {
      setTestingSmtp(false);
    }
  };

  // Apply quick provider presets
  const applyPreset = (preset: "hostinger_ssl" | "hostinger_tls" | "gmail") => {
    if (preset === "hostinger_ssl") {
      setSmtpHost("smtp.hostinger.com");
      setSmtpPort(465);
      setSmtpSecure(true);
    } else if (preset === "hostinger_tls") {
      setSmtpHost("smtp.hostinger.com");
      setSmtpPort(587);
      setSmtpSecure(false);
    } else if (preset === "gmail") {
      setSmtpHost("smtp.gmail.com");
      setSmtpPort(587);
      setSmtpSecure(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-medium">
        Loading system settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System, Branding & Pharmacy Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage administrator profile credentials, clinic branding logo, and licensed pharmacy delivery coverage.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-2xl border border-emerald-200/50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-2xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navigation Tabs */}
        <div className="bg-card border border-border p-4 rounded-3xl shadow-sm self-start flex flex-col gap-1.5">
          <button
            onClick={() => { setActiveTab("profile"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full px-4 py-3 rounded-2xl text-left text-sm font-bold transition flex items-center gap-3 ${
              activeTab === "profile"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            Profile Credentials
          </button>

          <button
            onClick={() => { setActiveTab("branding"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full px-4 py-3 rounded-2xl text-left text-sm font-bold transition flex items-center gap-3 ${
              activeTab === "branding"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Branding & Logo
          </button>

          <button
            onClick={() => { setActiveTab("pharmacy"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full px-4 py-3 rounded-2xl text-left text-sm font-bold transition flex items-center gap-3 ${
              activeTab === "pharmacy"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Truck className="w-4 h-4" />
            Pharmacy & Delivery Coverage
          </button>

          <button
            onClick={() => { setActiveTab("notifications"); setSuccessMsg(""); setErrorMsg(""); }}
            className={`w-full px-4 py-3 rounded-2xl text-left text-sm font-bold transition flex items-center gap-3 ${
              activeTab === "notifications"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications & Inquiries
          </button>
        </div>

        {/* Tab 1: Profile Credentials */}
        {activeTab === "profile" && (
          <div className="lg:col-span-3 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Administrator Credentials</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Email Address</Label>
                  <Input
                    disabled
                    value={userEmail}
                    className="rounded-xl h-11 bg-muted/40 cursor-not-allowed text-muted-foreground"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Portal Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Leave fields empty if you do not wish to change your login password.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Confirm New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={submitting} className="rounded-full px-8 font-bold">
                  {submitting ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Branding & Website Logo */}
        {activeTab === "branding" && (
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Clinic Branding & Website Logo</h2>
                </div>
                <Badge variant={logoUrl === "/logo.png" ? "outline" : "default"}>
                  {logoUrl === "/logo.png" ? "Default Logo" : "Custom Logo Active"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Update the official clinic logo that appears on the public website header, mobile navigation drawer, administrative portal sidebar, patient portal, and digital documents.
              </p>

              {/* Current Logo Preview Card */}
              <div className="p-6 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Current Logo Display
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {logoUrl}
                  </span>
                </div>

                <div className="h-28 w-full rounded-xl bg-background/80 border border-border/50 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                  <Image
                    src={logoUrl || "/logo.png"}
                    alt="Clinic Logo Preview"
                    width={280}
                    height={80}
                    className="max-h-20 w-auto object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Upload New Logo Image</Label>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: <strong>PNG (transparent recommended)</strong>, <strong>SVG</strong>, <strong>WebP</strong>, or <strong>JPG</strong>. Max file size: 5MB.
                  </p>
                  
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo || savingLogo}
                      className="rounded-xl px-5 gap-2 font-semibold shadow-sm"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading & Optimizing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Choose Logo File
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetDefaultLogo}
                      disabled={savingLogo || uploadingLogo || logoUrl === "/logo.png"}
                      className="rounded-xl gap-2 text-xs font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Default Logo
                    </Button>
                  </div>
                </div>

                {/* Direct Image URL fallback */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label htmlFor="customLogoUrl" className="text-xs font-semibold text-muted-foreground">
                    Or Enter Direct Logo URL / Path
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="customLogoUrl"
                      value={customLogoUrl}
                      onChange={(e) => {
                        setCustomLogoUrl(e.target.value);
                        setLogoUrl(e.target.value);
                      }}
                      placeholder="/logo.png or https://example.com/logo.png"
                      className="rounded-xl h-11 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      onClick={handleSaveLogo}
                      disabled={savingLogo || uploadingLogo}
                      className="rounded-xl px-6 font-bold gap-2 shrink-0 shadow-md"
                    >
                      {savingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Logo Changes
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Mock Header Preview */}
              <div className="space-y-2 pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" /> Live Navigation Bar Preview
                </span>
                <p className="text-xs text-muted-foreground">
                  Here is an exact simulation of how your logo renders on the visitor navigation bar:
                </p>

                <div className="rounded-2xl border border-border/80 bg-background/90 shadow-sm p-4 flex items-center justify-between overflow-x-auto">
                  <div className="flex items-center gap-6">
                    <div className="h-12 flex items-center px-2">
                      <Image
                        src={logoUrl || "/logo.png"}
                        alt="Header Simulation"
                        width={180}
                        height={48}
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-foreground/80">
                      <span>Treatments</span>
                      <span>Sexual Problems</span>
                      <span>Pharmacy</span>
                      <span>About Us</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary hidden md:inline">Log In</span>
                    <div className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center shadow-sm">
                      Get Started
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Pharmacy Partner & Akola Delivery Matrix */}
        {activeTab === "pharmacy" && (
          <div className="lg:col-span-3 space-y-8">
            <form onSubmit={handleSavePharmacyConfig} className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Licensed Pharmacy Partner Credentials</h2>
                </div>
                <Badge variant={pharmacyConfig.isActive ? "default" : "destructive"}>
                  {pharmacyConfig.isActive ? "Fulfilment Active" : "Suspended"}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Pharmacy Legal Business Name *</Label>
                  <Input
                    required
                    value={pharmacyConfig.pharmacyName}
                    onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, pharmacyName: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Retail Drug Licence Number (Form 20B/21B) *</Label>
                  <Input
                    required
                    value={pharmacyConfig.licenseNumber}
                    onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, licenseNumber: e.target.value })}
                    className="rounded-xl h-11 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Registered Pharmacist In-Charge</Label>
                  <Input
                    value={pharmacyConfig.pharmacistInCharge}
                    onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, pharmacistInCharge: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Official Support Mobile / WhatsApp</Label>
                  <Input
                    value={pharmacyConfig.contactPhone}
                    onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, contactPhone: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <Label>Licensed Physical Pharmacy Address</Label>
                  <Input
                    value={pharmacyConfig.address}
                    onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, address: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Delivery Rates & Financial Controls */}
              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Delivery Charges & Tax Rules
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Default Local Delivery Fee (₹)</Label>
                    <Input
                      type="number"
                      value={pharmacyConfig.defaultDeliveryFee}
                      onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, defaultDeliveryFee: Number(e.target.value) })}
                      className="rounded-xl h-11 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Free Delivery Minimum Order (₹)</Label>
                    <Input
                      type="number"
                      value={pharmacyConfig.freeDeliveryThreshold}
                      onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, freeDeliveryThreshold: Number(e.target.value) })}
                      className="rounded-xl h-11 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">GST Rate on Medicines (%)</Label>
                    <Input
                      type="number"
                      value={pharmacyConfig.taxRatePercent}
                      onChange={(e) => setPharmacyConfig({ ...pharmacyConfig, taxRatePercent: Number(e.target.value) })}
                      className="rounded-xl h-11 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Serviceable PIN Codes Management (Akola focus) */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Serviceable Delivery Coverage (Akola, Maharashtra)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Customers can only complete checkout for addresses located within active PIN codes.
                    </p>
                  </div>
                  <Badge variant="outline" className="self-start text-xs font-semibold">
                    {pharmacyConfig.serviceablePincodes.filter(p => p.isActive).length} Active PINs
                  </Badge>
                </div>

                {/* PIN Codes Table */}
                <div className="border border-border rounded-2xl overflow-hidden bg-background">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">PIN Code</th>
                        <th className="p-3">Area / Locality</th>
                        <th className="p-3">Fee (₹)</th>
                        <th className="p-3">Delivery SLA</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {pharmacyConfig.serviceablePincodes.map((pin) => (
                        <tr key={pin.pinCode} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-mono font-bold text-primary">{pin.pinCode}</td>
                          <td className="p-3 font-medium text-foreground">{pin.areaName}</td>
                          <td className="p-3 font-semibold">₹{pin.deliveryCharge}</td>
                          <td className="p-3 text-muted-foreground">{pin.estimatedHours}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePinActive(pin.pinCode)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                pin.isActive 
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {pin.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePinCode(pin.pinCode)}
                              className="text-destructive hover:text-destructive/80 p-1"
                              title="Remove PIN code"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New PIN Code Form */}
                <div className="p-4 bg-muted/30 rounded-2xl border border-border space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Add New Serviceable PIN Code</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <Input
                      placeholder="6-Digit PIN (e.g. 444001)"
                      value={newPin}
                      maxLength={6}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                      className="h-9 text-xs rounded-xl font-mono font-bold"
                    />
                    <Input
                      placeholder="Locality Name (e.g. Civil Lines)"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="Delivery Fee (₹)"
                      type="number"
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="SLA (e.g. 24 Hours)"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <Button type="button" onClick={handleAddPinCode} size="sm" variant="outline" className="rounded-xl gap-1 text-xs font-bold">
                    <Plus className="w-3.5 h-3.5" /> Add PIN to Matrix
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={savingPharmacy} className="rounded-full px-8 font-bold gap-2 shadow-md">
                  {savingPharmacy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Pharmacy Settings & Coverage
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Notifications & Inquiries */}
        {activeTab === "notifications" && (
          <div className="lg:col-span-3 space-y-6">
            {/* Card 1: Contact Form Inquiry Notification Recipient */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Contact Form & Inquiry Notifications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Specify the recipient email address(es) where patient messages submitted via the public Contact page are delivered.
                </p>
              </div>

              <form onSubmit={handleSaveNotificationEmail} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notificationEmail" className="font-bold flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      Inquiry Notification Recipients (Multiple Emails Supported)
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                      Separate multiple emails with commas
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="notificationEmail"
                      type="text"
                      value={contactNotificationEmail}
                      onChange={(e) => setContactNotificationEmail(e.target.value)}
                      placeholder="e.g. saahmed311@gmail.com, support@kelkarmanasclinic.com"
                      className="rounded-xl h-11 flex-1 font-medium"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={savingNotificationEmail}
                      className="rounded-xl h-11 px-6 font-bold shadow-sm gap-2 shrink-0"
                    >
                      {savingNotificationEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Recipients
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Recipient Chips Preview */}
                  {contactNotificationEmail && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-muted-foreground font-medium mr-1">Active Recipients:</span>
                      {contactNotificationEmail
                        .split(/[,;\s]+/)
                        .map((e) => e.trim())
                        .filter(Boolean)
                        .map((email, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                          >
                            <Mail className="w-3 h-3" />
                            {email}
                          </span>
                        ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Any inquiries submitted through the public website contact form will be automatically dispatched to all recipients listed above.
                  </p>
                </div>

                {/* Instant Test Section with Custom Recipient Input */}
                <div className="p-4 sm:p-5 bg-muted/40 border border-border/80 rounded-2xl space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-primary" />
                      Verify Email Deliveries (Test Console)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enter any test recipient inbox below to verify live delivery without changing your permanent saved recipients.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={testRecipientEmail}
                        onChange={(e) => setTestRecipientEmail(e.target.value)}
                        placeholder="Enter custom test recipient email (e.g. saahmed311@gmail.com)"
                        className="pl-9 pr-8 rounded-xl h-10 text-xs font-medium bg-background"
                      />
                      {testRecipientEmail && (
                        <button
                          type="button"
                          onClick={() => setTestRecipientEmail("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
                          title="Clear test email"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendTestNotification}
                        disabled={testingNotification || testingAllMails || !testRecipientEmail.trim()}
                        className="rounded-xl text-xs font-bold gap-2 shrink-0 border-primary/40 text-primary hover:bg-primary/5 h-10"
                      >
                        {testingNotification ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Delivering Test...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Send 1 Inquiry Test
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={handleTriggerAllTestEmails}
                        disabled={testingNotification || testingAllMails || !testRecipientEmail.trim()}
                        className="rounded-xl text-xs font-bold gap-2 shrink-0 shadow-sm h-10"
                      >
                        {testingAllMails ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Triggering All 5...
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            Trigger All 5 Test Emails
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Card 2: SMTP Outgoing Mail Server Configuration */}
            <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    SMTP Outgoing Mail Server Configuration
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your custom SMTP mail provider (Hostinger, Gmail, Google Workspace, AWS SES, etc.) for transactional patient emails and notifications.
                  </p>
                </div>
                <div>
                  {isSmtpConfigured ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 gap-1.5 px-3 py-1 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SMTP Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 gap-1.5 px-3 py-1 font-bold text-xs">
                      <AlertCircle className="w-3.5 h-3.5" /> Incomplete Setup
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Quick Provider Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset("hostinger_ssl")}
                    className="rounded-xl text-xs font-semibold hover:border-primary"
                  >
                    Hostinger (SSL • Port 465)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset("hostinger_tls")}
                    className="rounded-xl text-xs font-semibold hover:border-primary"
                  >
                    Hostinger (TLS • Port 587)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset("gmail")}
                    className="rounded-xl text-xs font-semibold hover:border-primary"
                  >
                    Gmail / Google Workspace (Port 587)
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSaveSmtp} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* SMTP Host */}
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpHost" className="text-xs font-bold">
                      SMTP Host / Server
                    </Label>
                    <Input
                      id="smtpHost"
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.hostinger.com"
                      className="rounded-xl h-10 font-medium"
                      required
                    />
                  </div>

                  {/* SMTP Port */}
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpPort" className="text-xs font-bold">
                      SMTP Port
                    </Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={smtpPort}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSmtpPort(e.target.value);
                        if (val === 465) setSmtpSecure(true);
                        else if (val === 587) setSmtpSecure(false);
                      }}
                      placeholder="465"
                      className="rounded-xl h-10 font-medium"
                      required
                    />
                  </div>

                  {/* Security / Encryption */}
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpSecure" className="text-xs font-bold">
                      Encryption Protocol
                    </Label>
                    <select
                      id="smtpSecure"
                      value={smtpSecure ? "ssl" : "tls"}
                      onChange={(e) => {
                        const isSecure = e.target.value === "ssl";
                        setSmtpSecure(isSecure);
                        if (isSecure && Number(smtpPort) === 587) setSmtpPort(465);
                        else if (!isSecure && Number(smtpPort) === 465) setSmtpPort(587);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="ssl">SSL / TLS (Recommended for Port 465)</option>
                      <option value="tls">STARTTLS / TLS (Recommended for Port 587)</option>
                    </select>
                  </div>

                  {/* SMTP Username */}
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpUser" className="text-xs font-bold">
                      SMTP Username / Email
                    </Label>
                    <Input
                      id="smtpUser"
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="support@kelkarmanasclinic.com"
                      className="rounded-xl h-10 font-medium"
                      required
                    />
                  </div>

                  {/* SMTP Password */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smtpPass" className="text-xs font-bold flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-primary" />
                        SMTP Password / App Password
                      </Label>
                      {hasSmtpPass && (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Password is saved in system
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="smtpPass"
                        type={showSmtpPass ? "text" : "password"}
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder={hasSmtpPass ? "•••••••••••• (Leave blank to keep currently saved password)" : "Enter SMTP account or app password"}
                        className="rounded-xl h-10 font-medium pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                      >
                        {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {hasSmtpPass 
                        ? "A password is already saved securely. Only type here if you wish to change it."
                        : "For Gmail/Google Workspace, generate and enter a 16-character App Password."}
                    </p>
                  </div>

                  {/* Sender Display Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpFromName" className="text-xs font-bold">
                      Sender Display Name
                    </Label>
                    <Input
                      id="smtpFromName"
                      type="text"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="Kelkar Manas Health Care"
                      className="rounded-xl h-10 font-medium"
                      required
                    />
                  </div>

                  {/* Sender From Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpFromEmail" className="text-xs font-bold">
                      Sender &quot;From&quot; Email Address
                    </Label>
                    <Input
                      id="smtpFromEmail"
                      type="email"
                      value={smtpFromEmail}
                      onChange={(e) => setSmtpFromEmail(e.target.value)}
                      placeholder="support@kelkarmanasclinic.com"
                      className="rounded-xl h-10 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Connection Test Output Alert */}
                {smtpTestResult && (
                  <div
                    className={`p-4 rounded-2xl border text-xs font-medium flex items-start gap-2.5 ${
                      smtpTestResult.success
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    {smtpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block font-bold">
                        {smtpTestResult.success ? "Connection Verified Successfully" : "Connection Failed"}
                      </strong>
                      <span className="mt-0.5 block leading-relaxed">{smtpTestResult.message}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestSmtpConnection}
                    disabled={testingSmtp || !smtpHost || !smtpUser}
                    className="rounded-xl h-11 px-5 font-bold gap-2 text-xs border-primary/40 text-primary hover:bg-primary/5"
                  >
                    {testingSmtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying SMTP Handshake...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Test SMTP Connection
                      </>
                    )}
                  </Button>

                  <Button
                    type="submit"
                    disabled={savingSmtp}
                    className="rounded-xl h-11 px-8 font-bold gap-2 shadow-sm"
                  >
                    {savingSmtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving SMTP Settings...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save SMTP Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
