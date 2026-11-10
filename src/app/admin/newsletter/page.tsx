"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Trash2,
  Search,
  Loader2,
  Users,
  Send,
  History,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Monitor,
  Smartphone,
  X,
  UserCheck,
  UserX,
  RefreshCw,
  Edit3,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface SubscriberItem {
  _id: string;
  email: string;
  status: "Active" | "Unsubscribed";
  createdAt: string;
  unsubscribedAt?: string;
}

interface CampaignItem {
  _id: string;
  subject: string;
  htmlContent: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  failedRecipients?: { email: string; error: string }[];
  status: "Draft" | "Sending" | "Sent" | "Failed";
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SenderConfig {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  hasSeparateNewsletterAuth?: boolean;
  smtpConfigured: boolean;
  dnsAuth?: {
    domain: string;
    spf: { configured: boolean; record?: string };
    dmarc: { configured: boolean; record?: string };
    dkim: { checkedSelectors: string[]; foundSelector?: string; configured: boolean };
  };
}

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "compose" | "history">("subscribers");

  // Subscribers state
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0, campaignsSent: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Unsubscribed">("All");

  // Add subscriber modal
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState("");
  const [addingSub, setAddingSub] = useState(false);

  // Campaigns & sender config state
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [senderConfig, setSenderConfig] = useState<SenderConfig>({
    senderName: "Kelkar Manas Healthcare",
    senderEmail: "newsletter@kelkarmanasclinic.com",
    replyToEmail: "support@kelkarmanasclinic.com",
    smtpConfigured: false,
  });

  // Compose state
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [showTestEmailInput, setShowTestEmailInput] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  // Preview state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Campaign details modal
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  // Sender Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    senderName: "Kelkar Manas Healthcare",
    senderEmail: "",
    replyToEmail: "",
    useSeparateAuth: false,
    newsletterSmtpUser: "",
    newsletterSmtpPass: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);

  // Feedback alerts
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 6000);
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [subRes, campRes] = await Promise.all([
        fetch(`/api/admin/newsletter?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/newsletter/campaigns?_t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const subJson = await subRes.json();
      if (subJson.success) {
        setSubscribers(subJson.data || []);
        if (subJson.stats) {
          setStats(subJson.stats);
        }
      }

      const campJson = await campRes.json();
      if (campJson.success) {
        setCampaigns(campJson.data || []);
        if (campJson.senderConfig) {
          setSenderConfig(campJson.senderConfig);
          setSettingsForm((prev) => ({
            ...prev,
            senderName: campJson.senderConfig.senderName || "Kelkar Manas Healthcare",
            senderEmail: campJson.senderConfig.senderEmail || "",
            replyToEmail: campJson.senderConfig.replyToEmail || "",
            useSeparateAuth: Boolean(campJson.senderConfig.hasSeparateNewsletterAuth),
          }));
        }
      }
    } catch {
      showToast("error", "Failed to load newsletter data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Subscriber Actions ────────────────────────────────────────────────────
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    setAddingSub(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newSubEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewSubEmail("");
        setShowAddSubModal(false);
        showToast("success", data.message || "Subscriber added.");
        fetchAll();
      } else {
        showToast("error", data.message || "Failed to add subscriber.");
      }
    } catch {
      showToast("error", "Network error while adding subscriber.");
    } finally {
      setAddingSub(false);
    }
  };

  const handleToggleStatus = async (sub: SubscriberItem) => {
    const nextStatus = sub.status === "Active" ? "Unsubscribed" : "Active";
    try {
      const res = await fetch(`/api/admin/newsletter/${sub._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        fetchAll();
      } else {
        showToast("error", data.message || "Failed to update status.");
      }
    } catch {
      showToast("error", "Failed to update subscriber status.");
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to permanently remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Subscriber removed.");
        fetchAll();
      } else {
        showToast("error", data.message || "Failed to remove subscriber.");
      }
    } catch {
      showToast("error", "Failed to delete subscriber.");
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch = !search || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const target = filteredSubscribers;
    if (target.length === 0) return;

    const headers = ["Email", "Status", "Subscribed On"];
    const rows = target.map((s) => [
      `"${s.email}"`,
      `"${s.status}"`,
      `"${new Date(s.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Campaign Actions ──────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!subject.trim()) {
      showToast("error", "Please enter a newsletter subject before saving draft.");
      return;
    }
    if (!htmlContent.trim()) {
      showToast("error", "Please enter newsletter content before saving draft.");
      return;
    }

    setSavingDraft(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          campaignId: editingDraftId || undefined,
          subject,
          htmlContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?._id) setEditingDraftId(data.data._id);
        showToast("success", "Draft saved to Campaign History.");
        fetchAll();
      } else {
        showToast("error", data.message || "Failed to save draft.");
      }
    } catch {
      showToast("error", "Error saving draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      showToast("error", "Please enter both subject and newsletter content first.");
      return;
    }
    if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      showToast("error", "Please enter a valid test recipient email address.");
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_test",
          subject,
          htmlContent,
          testEmail: testEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
      } else {
        showToast("error", data.message || "Failed to send test email.");
      }
    } catch {
      showToast("error", "Error sending test email.");
    } finally {
      setSendingTest(false);
    }
  };

  const handleConfirmSendCampaign = async () => {
    setSendingCampaign(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_campaign",
          campaignId: editingDraftId || undefined,
          subject,
          htmlContent,
        }),
      });
      const data = await res.json();
      setShowSendConfirm(false);
      if (data.success) {
        showToast("success", data.message);
        setSubject("");
        setHtmlContent("");
        setEditingDraftId(null);
        setActiveTab("history");
        fetchAll();
      } else {
        showToast("error", data.message || "Campaign sending failed.");
        fetchAll();
      }
    } catch {
      setShowSendConfirm(false);
      showToast("error", "Network error while sending campaign.");
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign record from history?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Campaign deleted.");
        fetchAll();
      } else {
        showToast("error", data.message);
      }
    } catch {
      showToast("error", "Failed to delete campaign.");
    }
  };

  const loadIntoCompose = (c: CampaignItem, asDraft: boolean) => {
    setSubject(c.subject);
    setHtmlContent(c.htmlContent);
    setEditingDraftId(asDraft ? c._id : null);
    setActiveTab("compose");
  };

  const openPreview = (sub: string, body: string) => {
    setPreviewSubject(sub || "(No Subject)");
    setPreviewHtml(body || "<p>No content written yet.</p>");
    setShowPreviewModal(true);
  };

  // ── Sender & DNS Settings Actions ─────────────────────────────────────────
  const openSettingsWithDnsCheck = async () => {
    setShowSettingsModal(true);
    setCheckingDns(true);
    try {
      const res = await fetch("/api/admin/newsletter/settings?checkDns=true");
      const json = await res.json();
      if (json.success && json.data) {
        setSenderConfig(json.data);
        setSettingsForm({
          senderName: json.data.senderName || "Kelkar Manas Healthcare",
          senderEmail: json.data.senderEmail || "",
          replyToEmail: json.data.replyToEmail || "",
          useSeparateAuth: Boolean(json.data.hasSeparateNewsletterAuth),
          newsletterSmtpUser: json.data.hasSeparateNewsletterAuth ? json.data.smtpUser || "" : "",
          newsletterSmtpPass: "",
        });
      }
    } catch {
      // keep current state
    } finally {
      setCheckingDns(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/newsletter/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: settingsForm.senderName,
          senderEmail: settingsForm.senderEmail,
          replyToEmail: settingsForm.replyToEmail,
          clearSeparateAuth: !settingsForm.useSeparateAuth,
          newsletterSmtpUser: settingsForm.useSeparateAuth ? settingsForm.newsletterSmtpUser : undefined,
          newsletterSmtpPass: settingsForm.useSeparateAuth ? settingsForm.newsletterSmtpPass : undefined,
          verifyConnection: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data) setSenderConfig((prev) => ({ ...prev, ...json.data }));
        if (json.verifyStatus && !json.verifyStatus.success) {
          showToast("error", `Settings saved, but SMTP verification warned: ${json.verifyStatus.message}`);
        } else {
          showToast("success", "Newsletter sender settings saved & verified.");
        }
        setShowSettingsModal(false);
      } else {
        showToast("error", json.message || "Failed to save settings.");
      }
    } catch {
      showToast("error", "Error saving newsletter settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage subscribers, compose branded campaigns, and send emails via {senderConfig.senderName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={openSettingsWithDnsCheck}
            className="rounded-xl text-xs font-semibold gap-2"
          >
            <Settings className="w-4 h-4 text-primary" />
            Sender &amp; Email Auth
          </Button>
          {activeTab === "subscribers" && (
            <Button onClick={handleExport} variant="outline" className="rounded-xl text-xs font-semibold gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
          <div className="text-3xl font-bold tracking-tight">{stats.total}</div>
          <div className="text-xs font-semibold text-muted-foreground mt-1">Total Subscribers</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
          <div className="text-3xl font-bold tracking-tight text-emerald-600">{stats.active}</div>
          <div className="text-xs font-semibold text-muted-foreground mt-1">Active Recipients</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
          <div className="text-3xl font-bold tracking-tight text-rose-600">{stats.unsubscribed}</div>
          <div className="text-xs font-semibold text-muted-foreground mt-1">Unsubscribed</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
          <div className="text-3xl font-bold tracking-tight text-primary">{stats.campaignsSent}</div>
          <div className="text-xs font-semibold text-muted-foreground mt-1">Campaigns Sent</div>
        </div>
      </div>

      {/* 3 Section Selector Cards (Matching Admin Portal Layout) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Newsletter Sections
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("subscribers")}
            className={`text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              activeTab === "subscribers"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                activeTab === "subscribers" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base">Subscribers</div>
              <div className="text-xs text-muted-foreground mt-0.5">Manage email list ({stats.active} active)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              activeTab === "compose"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                activeTab === "compose" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base">Compose Newsletter</div>
              <div className="text-xs text-muted-foreground mt-0.5">Create and send emails</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              activeTab === "history"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base">Campaign History</div>
              <div className="text-xs text-muted-foreground mt-0.5">Track sent campaigns ({campaigns.length})</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── TAB 1: SUBSCRIBERS ────────────────────────────────────────────────── */}
      {activeTab === "subscribers" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm w-full min-w-0">
          <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(["All", "Active", "Unsubscribed"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      statusFilter === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddSubModal(true)}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Subscriber
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-4 font-semibold text-muted-foreground">Email Address</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground">Subscribed On</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-muted-foreground">
                      No subscribers match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="truncate">{subscriber.email}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            subscriber.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {subscriber.status === "Active" ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(subscriber)}
                            className="h-8 text-xs rounded-lg"
                          >
                            {subscriber.status === "Active" ? "Unsubscribe" : "Reactivate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0"
                            onClick={() => handleDeleteSubscriber(subscriber._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: COMPOSE NEWSLETTER ─────────────────────────────────────────── */}
      {activeTab === "compose" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm w-full min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {editingDraftId ? "Edit Newsletter Draft" : "Compose Newsletter"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Emails are delivered individually (1-to-1) so subscribers never see other recipients&apos; addresses, and every email includes an instant unsubscribe link.
              </p>
            </div>

            {editingDraftId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingDraftId(null);
                  setSubject("");
                  setHtmlContent("");
                }}
                className="text-xs rounded-xl"
              >
                Clear Draft &amp; Start Fresh
              </Button>
            )}
          </div>

          {/* Sender & Recipient Metadata Banner */}
          <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/80 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">From</span>
                <span className="font-semibold text-foreground">
                  {senderConfig.senderName}{" "}
                  <span className="text-muted-foreground font-mono text-xs">&lt;{senderConfig.senderEmail}&gt;</span>
                </span>
              </div>
              <button
                type="button"
                onClick={openSettingsWithDnsCheck}
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                Configure
              </button>
            </div>

            <div className="sm:border-l sm:border-border sm:pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">To</span>
              <span className="font-semibold text-foreground">
                All active subscribers{" "}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 ml-1">
                  {stats.active} recipient{stats.active === 1 ? "" : "s"}
                </span>
              </span>
            </div>
          </div>

          {!senderConfig.smtpConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  SMTP credentials are not configured yet. Configure SMTP in Admin Settings or Sender Settings to send live emails.
                </span>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={openSettingsWithDnsCheck} className="h-7 text-xs">
                Setup Email
              </Button>
            </div>
          )}

          {/* Subject Line */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject"
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            label="Newsletter Content *"
            value={htmlContent}
            onChange={setHtmlContent}
            placeholder="Write your newsletter content here..."
            minHeight="380px"
          />

          {/* Test Email Box */}
          {showTestEmailInput && (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-foreground block mb-1">Send a Test Email Before Campaign</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center gap-2 sm:self-end">
                <Button
                  type="button"
                  onClick={handleSendTest}
                  disabled={sendingTest || !subject.trim() || !htmlContent.trim()}
                  className="rounded-xl h-10 gap-2 text-xs font-semibold"
                >
                  {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sendingTest ? "Sending Test..." : "Send Test Now"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTestEmailInput(false)}
                  className="h-10 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="rounded-xl text-xs font-semibold gap-2"
              >
                {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                Save Draft
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => openPreview(subject, htmlContent)}
                className="rounded-xl text-xs font-semibold gap-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Email
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTestEmailInput((v) => !v)}
                className="rounded-xl text-xs font-semibold gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Test Email
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => {
                if (!subject.trim() || !htmlContent.trim()) {
                  showToast("error", "Please enter both an email subject and newsletter content.");
                  return;
                }
                if (stats.active === 0) {
                  showToast("error", "There are currently 0 active subscribers to send to.");
                  return;
                }
                setShowSendConfirm(true);
              }}
              disabled={sendingCampaign}
              className="rounded-xl px-6 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Send className="w-4 h-4" />
              Send Newsletter ({stats.active})
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB 3: CAMPAIGN HISTORY ───────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm w-full min-w-0">
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base">Newsletter Campaign History</h2>
              <p className="text-xs text-muted-foreground">Track drafts, delivery metrics, and sent timestamps.</p>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab("compose")}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-4 font-semibold text-muted-foreground">Subject</th>
                  <th className="p-4 font-semibold text-muted-foreground">Date &amp; Time Sent</th>
                  <th className="p-4 font-semibold text-muted-foreground">Sender Email</th>
                  <th className="p-4 font-semibold text-muted-foreground">Recipients</th>
                  <th className="p-4 font-semibold text-muted-foreground">Delivered / Failed</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      No newsletter campaigns created yet. Switch to Compose Newsletter to create your first campaign.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-semibold max-w-xs truncate">{c.subject}</td>
                      <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                        {c.sentAt ? (
                          new Date(c.sentAt).toLocaleString()
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                            <Clock className="w-3 h-3" /> Updated {new Date(c.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-mono text-muted-foreground">{c.senderEmail}</td>
                      <td className="p-4 font-semibold">{c.totalRecipients}</td>
                      <td className="p-4 text-xs">
                        <span className="text-emerald-600 font-bold">{c.successCount}</span>
                        {" / "}
                        <span className={c.failedCount > 0 ? "text-rose-600 font-bold" : "text-muted-foreground"}>
                          {c.failedCount}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            c.status === "Sent"
                              ? "bg-emerald-100 text-emerald-700"
                              : c.status === "Failed"
                              ? "bg-rose-100 text-rose-700"
                              : c.status === "Sending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Delivery Details & Content"
                            onClick={() => setSelectedCampaign(c)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {c.status === "Draft" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadIntoCompose(c, true)}
                              className="h-8 text-xs rounded-lg gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Duplicate to Compose"
                              onClick={() => loadIntoCompose(c, false)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0"
                            onClick={() => handleDeleteCampaign(c._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD SUBSCRIBER ─────────────────────────────────────────────── */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base">Add Newsletter Subscriber</h3>
              <button onClick={() => setShowAddSubModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddSubModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={addingSub} className="rounded-xl">
                  {addingSub ? "Adding..." : "Add Subscriber"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SEND CONFIRMATION ──────────────────────────────────────────── */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Confirm Newsletter Broadcast</h3>
                <p className="text-xs text-muted-foreground">Please review campaign details before sending.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Subject:</span>{" "}
                <strong className="text-foreground">{subject}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">From:</span>{" "}
                <strong className="text-foreground">
                  {senderConfig.senderName} &lt;{senderConfig.senderEmail}&gt;
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">Recipients:</span>{" "}
                <strong className="text-emerald-700">{stats.active} active subscriber(s)</strong>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                Unsubscribed contacts are automatically excluded. Each recipient receives an individual email with an unsubscribe link; other subscriber addresses remain hidden.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={sendingCampaign}
                onClick={() => setShowSendConfirm(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={sendingCampaign}
                onClick={handleConfirmSendCampaign}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {sendingCampaign ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Campaign...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirm &amp; Send Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EMAIL PREVIEW ──────────────────────────────────────────────── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base">Email Preview</h3>
                <p className="text-xs text-muted-foreground truncate max-w-md">Subject: {previewSubject}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === "desktop" ? "bg-background shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === "mobile" ? "bg-background shadow-2xs" : "text-muted-foreground"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#FAF7F9] p-4 sm:p-8 flex justify-center">
              <div
                className={`bg-white rounded-2xl border border-[#ECE4EB] shadow-sm overflow-hidden transition-all ${
                  previewDevice === "mobile" ? "w-[375px]" : "w-full max-w-[620px]"
                }`}
              >
                <div className="p-6 text-center border-b-2 border-[#F4ECF4]">
                  <img src="/logo.png" alt="Kelkar Manas Healthcare" className="h-12 w-auto mx-auto object-contain" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#7A2E7A] mt-2">
                    {senderConfig.senderName} &bull; Official Newsletter
                  </p>
                </div>
                <div className="bg-[#FAF7F9] px-6 py-4 border-b border-[#ECE4EB] text-center">
                  <h2 className="text-lg font-extrabold text-[#2D242D]">{previewSubject}</h2>
                </div>
                <div
                  className="p-6 sm:p-8 prose prose-sm max-w-none text-[#3D333D]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                <div className="bg-[#FAF7F9] px-6 py-4 border-t border-[#ECE4EB] text-center text-xs text-[#6E5C6E]">
                  <p className="font-semibold">
                    {senderConfig.senderName} &bull; {senderConfig.replyToEmail}
                  </p>
                  <p className="mt-2 text-[11px]">
                    You received this email because you subscribed to our newsletter.{" "}
                    <span className="underline font-bold text-[#7A2E7A]">Unsubscribe here</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CAMPAIGN HISTORY DETAILS ───────────────────────────────────── */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedCampaign.subject}</h3>
                <p className="text-xs text-muted-foreground">
                  Sender: {selectedCampaign.senderName} &lt;{selectedCampaign.senderEmail}&gt;
                </p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="text-xl font-bold">{selectedCampaign.totalRecipients}</div>
                  <div className="text-[11px] text-muted-foreground">Total Recipients</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xl font-bold text-emerald-700">{selectedCampaign.successCount}</div>
                  <div className="text-[11px] text-emerald-700">Successful Deliveries</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xl font-bold text-rose-700">{selectedCampaign.failedCount}</div>
                  <div className="text-[11px] text-rose-700">Failed Deliveries</div>
                </div>
              </div>

              {selectedCampaign.failedRecipients && selectedCampaign.failedRecipients.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                  <div className="text-xs font-bold text-rose-800">Failed Delivery Log</div>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-rose-700">
                    {selectedCampaign.failedRecipients.map((fr, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="font-mono">{fr.email}</span>
                        <span className="truncate">{fr.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-border rounded-xl p-4 bg-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Sent Email Body
                </div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedCampaign.htmlContent }}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = selectedCampaign;
                  setSelectedCampaign(null);
                  loadIntoCompose(target, target.status === "Draft");
                }}
                className="rounded-xl text-xs gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {selectedCampaign.status === "Draft" ? "Resume Draft" : "Duplicate into Compose"}
              </Button>
              <Button size="sm" onClick={() => setSelectedCampaign(null)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SENDER & EMAIL AUTHENTICATION SETTINGS ─────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Business Email &amp; Authentication</h3>
                <p className="text-xs text-muted-foreground">
                  Configure dedicated newsletter sender identity and inspect SPF, DKIM &amp; DMARC status.
                </p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-5 overflow-y-auto space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Sender Display Name *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.senderName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, senderName: e.target.value })}
                    placeholder="Enter sender display name"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Dedicated Newsletter Email *</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.senderEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, senderEmail: e.target.value })}
                    placeholder="Enter your email address"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Reply-To Email (General Enquiries)</label>
                <input
                  type="email"
                  value={settingsForm.replyToEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, replyToEmail: e.target.value })}
                  placeholder="Enter your email address"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.useSeparateAuth}
                    onChange={(e) => setSettingsForm({ ...settingsForm, useSeparateAuth: e.target.checked })}
                    className="rounded border-border text-primary w-4 h-4"
                  />
                  <span>Use dedicated SMTP mailbox login for newsletter email (if provider restricts aliases)</span>
                </label>

                {settingsForm.useSeparateAuth && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">Newsletter SMTP Username</label>
                      <input
                        type="text"
                        value={settingsForm.newsletterSmtpUser}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newsletterSmtpUser: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">Newsletter SMTP Password</label>
                      <input
                        type="password"
                        value={settingsForm.newsletterSmtpPass}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newsletterSmtpPass: e.target.value })}
                        placeholder="Enter your password"
                        className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SPF / DKIM / DMARC DNS Status */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Sender Domain Authentication (SPF / DKIM / DMARC)
                  </span>
                  <button
                    type="button"
                    onClick={openSettingsWithDnsCheck}
                    className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className={`w-3 h-3 ${checkingDns ? "animate-spin" : ""}`} />
                    Refresh DNS Check
                  </button>
                </div>

                {checkingDns ? (
                  <p className="text-xs text-muted-foreground">Checking domain DNS records...</p>
                ) : senderConfig.dnsAuth ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span>SPF Record ({senderConfig.dnsAuth.domain})</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          senderConfig.dnsAuth.spf.configured ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {senderConfig.dnsAuth.spf.configured ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        {senderConfig.dnsAuth.spf.configured ? "Detected" : "Not Detected"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>DKIM Record</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          senderConfig.dnsAuth.dkim.configured ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {senderConfig.dnsAuth.dkim.configured ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        {senderConfig.dnsAuth.dkim.configured
                          ? `Detected (${senderConfig.dnsAuth.dkim.foundSelector})`
                          : "Verify Host DKIM Selector"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>DMARC Policy (_dmarc.{senderConfig.dnsAuth.domain})</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          senderConfig.dnsAuth.dmarc.configured ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {senderConfig.dnsAuth.dmarc.configured ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        {senderConfig.dnsAuth.dmarc.configured ? "Detected" : "Not Detected"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
                      Ensure TXT records for SPF (<code className="text-[10px]">v=spf1 include:_spf.mail.hostinger.com ~all</code>), provider DKIM keys, and DMARC (<code className="text-[10px]">_dmarc</code>) are enabled in your DNS zone for optimal inbox delivery.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowSettingsModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={savingSettings} className="rounded-xl gap-2">
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {savingSettings ? "Saving & Verifying..." : "Save & Verify Sender"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
