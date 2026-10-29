"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Upload, 
  X, 
  Check, 
  ImageIcon, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Navigation,
  Sparkles,
  AlertCircle,
  Clock,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RequiredDocuments {
  title: string;
  list: string[];
  note: string;
}

interface HospitalData {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  image?: string;
  hidePdf?: boolean;
  shortDescription: string;
  fullAbout: string;
  founderInfo?: string;
  services: string[];
  servicesDisclaimer?: string;
  rtmsIntro?: string;
  rtmsConditions?: string[];
  rtmsBenefits?: string[];
  rtmsSummary?: string;
  requiredDocuments?: RequiredDocuments;
  closingWellnessNote?: string;
  whyChooseUs?: string[];
  address: string;
  phones: string[];
  googleMapQuery?: string;
  googleMapEmbed?: string;
  googleMapDirectionUrl?: string;
  cashlessSchemeBadge: string;
  cashlessSchemeDetails: string;
  features: string[];
  status?: "Active" | "Inactive";
  order?: number;
}

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"general" | "descriptions" | "contact" | "schemes">("general");

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [shortDescription, setShortDescription] = useState("");
  const [fullAbout, setFullAbout] = useState("");
  const [founderInfo, setFounderInfo] = useState("");
  const [closingWellnessNote, setClosingWellnessNote] = useState("");
  
  // Location & Contact
  const [address, setAddress] = useState("");
  const [phonesText, setPhonesText] = useState("");
  const [googleMapDirectionUrl, setGoogleMapDirectionUrl] = useState("");
  const [googleMapEmbed, setGoogleMapEmbed] = useState("");
  
  // Schemes & Services
  const [cashlessSchemeBadge, setCashlessSchemeBadge] = useState("");
  const [cashlessSchemeDetails, setCashlessSchemeDetails] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [servicesDisclaimer, setServicesDisclaimer] = useState("");
  
  // RTMS & Docs
  const [rtmsIntro, setRtmsIntro] = useState("");
  const [rtmsConditionsText, setRtmsConditionsText] = useState("");
  const [rtmsBenefitsText, setRtmsBenefitsText] = useState("");
  const [rtmsSummary, setRtmsSummary] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docListText, setDocListText] = useState("");
  const [docNote, setDocNote] = useState("");

  // Upload State
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hospitals");
      const json = await res.json();
      if (json.success && json.data) {
        setHospitals(json.data);
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setTagline("");
    setImage("");
    setStatus("Active");
    setShortDescription("");
    setFullAbout("");
    setFounderInfo("");
    setClosingWellnessNote("");
    setAddress("");
    setPhonesText("");
    setGoogleMapDirectionUrl("");
    setGoogleMapEmbed("");
    setCashlessSchemeBadge("");
    setCashlessSchemeDetails("");
    setFeaturesText("");
    setServicesText("");
    setServicesDisclaimer("");
    setRtmsIntro("");
    setRtmsConditionsText("");
    setRtmsBenefitsText("");
    setRtmsSummary("");
    setDocTitle("");
    setDocListText("");
    setDocNote("");
    setEditId(null);
    setIsEditMode(false);
    setSubmitError("");
    setSuccessMsg("");
    setActiveModalTab("general");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (hospital: HospitalData) => {
    setIsEditMode(true);
    setEditId(hospital._id || hospital.slug);
    setName(hospital.name || "");
    setSlug(hospital.slug || "");
    setTagline(hospital.tagline || "");
    setImage(hospital.image || "");
    setStatus(hospital.status || "Active");
    setShortDescription(hospital.shortDescription || "");
    setFullAbout(hospital.fullAbout || "");
    setFounderInfo(hospital.founderInfo || "");
    setClosingWellnessNote(hospital.closingWellnessNote || "");
    setAddress(hospital.address || "");
    setPhonesText(hospital.phones?.join(", ") || "");
    setGoogleMapDirectionUrl(hospital.googleMapDirectionUrl || "");
    setGoogleMapEmbed(hospital.googleMapEmbed || "");
    setCashlessSchemeBadge(hospital.cashlessSchemeBadge || "");
    setCashlessSchemeDetails(hospital.cashlessSchemeDetails || "");
    setFeaturesText(hospital.features?.join(", ") || "");
    setServicesText(hospital.services?.join("\n") || "");
    setServicesDisclaimer(hospital.servicesDisclaimer || "");
    setRtmsIntro(hospital.rtmsIntro || "");
    setRtmsConditionsText(hospital.rtmsConditions?.join("\n") || "");
    setRtmsBenefitsText(hospital.rtmsBenefits?.join("\n") || "");
    setRtmsSummary(hospital.rtmsSummary || "");
    setDocTitle(hospital.requiredDocuments?.title || "");
    setDocListText(hospital.requiredDocuments?.list?.join(", ") || "");
    setDocNote(hospital.requiredDocuments?.note || "");
    setSubmitError("");
    setSuccessMsg("");
    setActiveModalTab("general");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/hospital-image", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.url) {
        setImage(json.url);
      } else {
        setSubmitError(json.message || "Failed to upload image.");
      }
    } catch (err: any) {
      setSubmitError("Failed to upload image: " + err.message);
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("Hospital name is required.");
      return;
    }
    const computedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    setSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");

    const body: Partial<HospitalData> = {
      name: name.trim(),
      slug: computedSlug,
      tagline: tagline.trim(),
      image: image.trim(),
      status,
      shortDescription: shortDescription.trim(),
      fullAbout: fullAbout.trim(),
      founderInfo: founderInfo.trim(),
      closingWellnessNote: closingWellnessNote.trim(),
      address: address.trim(),
      phones: phonesText.split(",").map(p => p.trim()).filter(Boolean),
      googleMapDirectionUrl: googleMapDirectionUrl.trim(),
      googleMapEmbed: googleMapEmbed.trim(),
      cashlessSchemeBadge: cashlessSchemeBadge.trim(),
      cashlessSchemeDetails: cashlessSchemeDetails.trim(),
      features: featuresText.split(",").map(f => f.trim()).filter(Boolean),
      services: servicesText.split("\n").map(s => s.trim()).filter(Boolean),
      servicesDisclaimer: servicesDisclaimer.trim(),
      rtmsIntro: rtmsIntro.trim(),
      rtmsConditions: rtmsConditionsText.split("\n").map(c => c.trim()).filter(Boolean),
      rtmsBenefits: rtmsBenefitsText.split("\n").map(b => b.trim()).filter(Boolean),
      rtmsSummary: rtmsSummary.trim(),
      requiredDocuments: {
        title: docTitle.trim(),
        list: docListText.split(",").map(d => d.trim()).filter(Boolean),
        note: docNote.trim(),
      },
    };

    try {
      const url = isEditMode ? `/api/admin/hospitals/${editId}` : "/api/admin/hospitals";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to save hospital.");
      }

      setSuccessMsg(isEditMode ? "Hospital updated successfully!" : "Hospital created successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        fetchHospitals();
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (hospital: HospitalData) => {
    if (!confirm(`Are you sure you want to delete ${hospital.name}? This will remove it from the Alcohol and De-Addiction sections.`)) return;
    try {
      const targetId = hospital._id || hospital.slug;
      const res = await fetch(`/api/admin/hospitals/${targetId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchHospitals();
      } else {
        alert(json.message || "Failed to delete hospital.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("An error occurred during deletion.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Content Management</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            De-Addiction Hospitals & Rehab Centres
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage the hospital cards, images, cashless health scheme details, and full information pages displayed in the Alcohol & Drug Addiction section.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="rounded-xl px-5 py-2.5 font-semibold shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Hospital Centre
        </Button>
      </div>

      {/* Hospital Cards List */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground font-medium flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading hospital information...
        </div>
      ) : hospitals.length === 0 ? (
        <div className="bg-card rounded-3xl p-12 text-center border border-dashed border-border">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">No hospitals found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Get started by creating your first hospital profile.</p>
          <Button onClick={handleOpenAdd} className="rounded-xl">Add Hospital Centre</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {hospitals.map((hospital) => (
            <div
              key={hospital._id || hospital.slug}
              className="bg-card rounded-3xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    <CreditCard className="w-3.5 h-3.5" />
                    {hospital.cashlessSchemeBadge || "Inpatient Care"}
                  </span>
                  
                  <Badge variant="outline" className={hospital.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground"}>
                    {hospital.status || "Active"}
                  </Badge>
                </div>

                {/* Image & Title Preview */}
                <div className="flex gap-4 mb-4 items-start">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-border bg-muted/40 shadow-xs flex items-center justify-center">
                    {hospital.image ? (
                      <Image
                        src={hospital.image}
                        alt={hospital.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-primary/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-serif font-bold text-foreground leading-snug truncate">
                      {hospital.name}
                    </h3>
                    <p className="text-xs text-primary font-semibold mt-1 line-clamp-2">
                      {hospital.tagline || "Dedicated Inpatient Care"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                      /hospitals/{hospital.slug}
                    </p>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {hospital.shortDescription}
                </p>

                {/* Address & Contact Details */}
                <div className="space-y-2 text-xs text-foreground/80 font-medium pb-4 border-b border-border/50">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{hospital.address}</span>
                  </div>
                  {hospital.phones && hospital.phones.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{hospital.phones.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-2 mt-4">
                <Link
                  href={`/hospitals/${hospital.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Live Page
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(hospital)}
                    className="rounded-xl text-xs h-9 px-3.5 font-semibold border-border hover:bg-primary hover:text-primary-foreground gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Info & Images
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(hospital)}
                    className="rounded-xl text-xs h-9 px-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card w-full max-w-4xl rounded-3xl border border-border shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground">
                      {isEditMode ? `Edit: ${name || "Hospital"}` : "Add New Hospital / Centre"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Update hospital descriptions, uploaded image, schemes, and contact options.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-border bg-muted/10 px-6 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("general")}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeModalTab === "general"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1. Basic & Image
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("descriptions")}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeModalTab === "descriptions"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  2. Descriptions & About
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("contact")}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeModalTab === "contact"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  3. Location & Maps
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("schemes")}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeModalTab === "schemes"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  4. Schemes & Services
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* TAB 1: BASIC & IMAGE */}
                {activeModalTab === "general" && (
                  <div className="space-y-5">
                    {/* Hospital Image Uploader & Preview */}
                    <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-primary block">
                        Hospital Picture / Banner Image
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-border bg-card flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          {image ? (
                            <Image
                              src={image}
                              alt="Hospital Preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-muted-foreground/50">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-[10px]">No image set</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                          />

                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <Button
                              type="button"
                              disabled={imageUploading}
                              onClick={() => imageInputRef.current?.click()}
                              className="rounded-xl text-xs font-semibold gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              {imageUploading ? "Uploading Picture..." : image ? "Change Image File" : "Upload Hospital Photo"}
                            </Button>

                            {image && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setImage("")}
                                className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Remove Image
                              </Button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground block">
                              Or specify image path / URL directly:
                            </label>
                            <input
                              type="text"
                              value={image}
                              onChange={(e) => setImage(e.target.value)}
                              placeholder="/images/ashakiran_center.jpg or /uploads/..."
                              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            This image is displayed on the Alcohol de-addiction section and hospital information page.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ashakiran Rehabilitation Centre"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug (URL Path) *</label>
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="ashakiran-rehabilitation-centre"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tagline</label>
                        <input
                          type="text"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          placeholder="Dedicated Inpatient Care for Mental Health & Alcohol Addiction"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                        >
                          <option value="Active">Active (Visible)</option>
                          <option value="Inactive">Inactive (Hidden)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cashless Scheme Badge</label>
                        <input
                          type="text"
                          value={cashlessSchemeBadge}
                          onChange={(e) => setCashlessSchemeBadge(e.target.value)}
                          placeholder="Specialized Inpatient De-Addiction"
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DESCRIPTIONS & ABOUT */}
                {activeModalTab === "descriptions" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Short Description (Shown on Alcohol Section Cards) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Brief overview of the hospital and inpatient de-addiction facility..."
                        className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Full About Us Story (Shown on the Hospital Info Page)
                      </label>
                      <textarea
                        rows={6}
                        value={fullAbout}
                        onChange={(e) => setFullAbout(e.target.value)}
                        placeholder="Detailed background, history, mission, and hospital philosophy..."
                        className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Founder / Hospital Leadership Info
                      </label>
                      <input
                        type="text"
                        value={founderInfo}
                        onChange={(e) => setFounderInfo(e.target.value)}
                        placeholder="Founder: Dr. Deepak Kelkar. Location: Kelkar Hospital, Ramdas Peth, Akola..."
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Closing Wellness Note
                      </label>
                      <textarea
                        rows={2}
                        value={closingWellnessNote}
                        onChange={(e) => setClosingWellnessNote(e.target.value)}
                        placeholder="Empowering closing message encouraging mental wellness and recovery..."
                        className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: LOCATION & MAPS */}
                {activeModalTab === "contact" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital Address *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Near Kelkar Hospital, RAMDAS PETH, Akola"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Phone Numbers (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={phonesText}
                        onChange={(e) => setPhonesText(e.target.value)}
                        placeholder="+91 7030414140, +91 8805097227"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Google Map Direction URL
                      </label>
                      <input
                        type="text"
                        value={googleMapDirectionUrl}
                        onChange={(e) => setGoogleMapDirectionUrl(e.target.value)}
                        placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Google Map Embed (iFrame Embed URL)
                      </label>
                      <input
                        type="text"
                        value={googleMapEmbed}
                        onChange={(e) => setGoogleMapEmbed(e.target.value)}
                        placeholder="https://www.google.com/maps/embed?pb=..."
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: SCHEMES & SERVICES */}
                {activeModalTab === "schemes" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Cashless Scheme Details & Rules
                      </label>
                      <textarea
                        rows={3}
                        value={cashlessSchemeDetails}
                        onChange={(e) => setCashlessSchemeDetails(e.target.value)}
                        placeholder="Information regarding Ayushman Card, Mahatma Phule Yojana eligibility and approvals..."
                        className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Features / Highlights (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={featuresText}
                        onChange={(e) => setFeaturesText(e.target.value)}
                        placeholder="Inpatient Rehabilitation, No Relative Required, 24/7 Medical Supervision"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Available Services (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={servicesText}
                        onChange={(e) => setServicesText(e.target.value)}
                        placeholder="Treatment for mental health conditions&#10;Alcohol and addiction rehabilitation&#10;Counselling and therapy sessions"
                        className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Services Disclaimer
                      </label>
                      <input
                        type="text"
                        value={servicesDisclaimer}
                        onChange={(e) => setServicesDisclaimer(e.target.value)}
                        placeholder="These treatments are completely free under government schemes..."
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>

                    {/* Required Documents Callout */}
                    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                        Required Documents (For Free/Scheme Treatment)
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder="How to Avail the Benefits"
                            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Document List (Comma-separated)</label>
                          <input
                            type="text"
                            value={docListText}
                            onChange={(e) => setDocListText(e.target.value)}
                            placeholder="Aadhaar Card, Ration Card"
                            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Document Guidance Note</label>
                        <input
                          type="text"
                          value={docNote}
                          onChange={(e) => setDocNote(e.target.value)}
                          placeholder="Patients must carry Aadhaar Card and Ration Card for verification..."
                          className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-2">
                    {activeModalTab !== "schemes" ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (activeModalTab === "general") setActiveModalTab("descriptions");
                          else if (activeModalTab === "descriptions") setActiveModalTab("contact");
                          else if (activeModalTab === "contact") setActiveModalTab("schemes");
                        }}
                        className="rounded-xl"
                      >
                        Next Step →
                      </Button>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl px-6 font-semibold"
                    >
                      {submitting ? "Saving Hospital..." : isEditMode ? "Save Changes" : "Create Hospital"}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
