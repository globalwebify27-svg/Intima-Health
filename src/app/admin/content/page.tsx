"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Rss, List, HelpCircle, Plus, Edit2, Trash2, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "pages" | "posts" | "categories" | "faqs" | "treatments" | "sexual-problems";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [pages, setPages] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [sexualProblems, setSexualProblems] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Tab>("pages");
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let fetchUrl = `/api/admin/content/${activeTab}`;
      if (activeTab === "treatments") fetchUrl = "/api/admin/content/treatments?type=treatment";
      if (activeTab === "sexual-problems") fetchUrl = "/api/admin/content/treatments?type=sexual-problem";
      
      const res = await fetch(fetchUrl);
      const json = await res.json();
      if (json.success) {
        if (activeTab === "pages") setPages(json.data);
        if (activeTab === "posts") {
          setPosts(json.data);
          // Fetch categories for the posts dropdown
          const catRes = await fetch("/api/admin/content/categories");
          const catJson = await catRes.json();
          if (catJson.success) setCategories(catJson.data);
        }
        if (activeTab === "categories") setCategories(json.data);
        if (activeTab === "faqs") setFaqs(json.data);
        if (activeTab === "treatments") setTreatments(json.data);
        if (activeTab === "sexual-problems") setSexualProblems(json.data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: Tab, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiType = modalType === "sexual-problems" ? "treatments" : modalType;
      const url = editingItem 
        ? `/api/admin/content/${apiType}/${editingItem._id}`
        : `/api/admin/content/${apiType}`;
      
      const method = editingItem ? "PUT" : "POST";
      
      const bodyPayload = (modalType === "treatments" || modalType === "sexual-problems") 
        ? { ...formData, type: modalType === "sexual-problems" ? "sexual-problem" : "treatment" }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      
      if (res.ok) {
        closeModal();
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: Tab, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const apiType = type === "sexual-problems" ? "treatments" : type;
      const res = await fetch(`/api/admin/content/${apiType}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, heroImage: json.url });
      } else {
        alert("Upload failed: " + json.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  const TABS = [
    { id: "pages", label: "Pages", icon: FileText },
    { id: "posts", label: "Blog Posts", icon: Rss },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "treatments", label: "Treatments", icon: Activity },
    { id: "sexual-problems", label: "Sexual Problems", icon: Activity },
  ] as const;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Manage website pages, blog posts, FAQs, and categories.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                isActive ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
          <Button onClick={() => openModal(activeTab)} className="rounded-xl h-10 px-4 font-bold text-xs gap-2">
            <Plus className="w-4 h-4" /> Add New
          </Button>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {activeTab === "pages" && (
                    <>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Slug</th>
                      <th className="p-4 font-semibold w-24">Actions</th>
                    </>
                  )}
                  {activeTab === "posts" && (
                    <>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Author</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold w-24">Actions</th>
                    </>
                  )}
                  {activeTab === "faqs" && (
                    <>
                      <th className="p-4 font-semibold">Question</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold w-24">Actions</th>
                    </>
                  )}
                  {activeTab === "treatments" && (
                    <>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Slug</th>
                      <th className="p-4 font-semibold">Category Badge</th>
                      <th className="p-4 font-semibold w-24">Actions</th>
                    </>
                  )}
                  {activeTab === "sexual-problems" && (
                    <>
                      <th className="p-4 font-semibold">Title</th>
                      <th className="p-4 font-semibold">Slug</th>
                      <th className="p-4 font-semibold">Category Badge</th>
                      <th className="p-4 font-semibold w-24">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeTab === "pages" && pages.map(page => (
                  <tr key={page._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{page.title}</td>
                    <td className="p-4 text-muted-foreground">{page.slug}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal("pages", page)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete("pages", page._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {activeTab === "posts" && posts.map(post => (
                  <tr key={post._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{post.title}</td>
                    <td className="p-4 text-muted-foreground">{post.author}</td>
                    <td className="p-4 text-muted-foreground">{post.categoryId?.name || "Uncategorized"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${post.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal("posts", post)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete("posts", post._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {activeTab === "faqs" && faqs.map(faq => (
                  <tr key={faq._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium max-w-xs truncate">{faq.question}</td>
                    <td className="p-4 text-muted-foreground">{faq.category}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal("faqs", faq)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete("faqs", faq._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {activeTab === "treatments" && treatments.map(treatment => (
                  <tr key={treatment._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{treatment.title}</td>
                    <td className="p-4 text-muted-foreground">{treatment.slug}</td>
                    <td className="p-4 text-muted-foreground">{treatment.badge}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal("treatments", treatment)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete("treatments", treatment._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {activeTab === "sexual-problems" && sexualProblems.map(problem => (
                  <tr key={problem._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{problem.title}</td>
                    <td className="p-4 text-muted-foreground">{problem.slug}</td>
                    <td className="p-4 text-muted-foreground">{problem.badge}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal("sexual-problems", problem)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete("sexual-problems", problem._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {(!loading && ((activeTab === "pages" && pages.length === 0) || (activeTab === "posts" && posts.length === 0) || (activeTab === "categories" && categories.length === 0) || (activeTab === "faqs" && faqs.length === 0) || (activeTab === "treatments" && treatments.length === 0) || (activeTab === "sexual-problems" && sexualProblems.length === 0))) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No {activeTab} found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeTab === "posts" && (
        <div className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold capitalize">Categories</h2>
            <Button onClick={() => openModal("categories")} className="rounded-xl h-10 px-4 font-bold text-xs gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>
          {loading ? (
            <div className="p-10 flex justify-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Slug</th>
                    <th className="p-4 font-semibold w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map(cat => (
                    <tr key={cat._id} className="hover:bg-muted/20">
                      <td className="p-4 font-medium">{cat.name}</td>
                      <td className="p-4 text-muted-foreground">{cat.slug}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => openModal("categories", cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete("categories", cat._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {(!loading && categories.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl border border-border flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                <h2 className="text-xl font-bold">{editingItem ? "Edit" : "Add"} {modalType.slice(0, -1)}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                
                {/* Pages Form */}
                {modalType === "pages" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Title</label>
                      <input required type="text" value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Slug (URL)</label>
                      <input required type="text" value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    {formData.slug === "contact" ? (() => {
                      let contactData: any = {};
                      try {
                        contactData = JSON.parse(formData.content || "{}");
                      } catch (e) {}
                      const updateField = (key: string, value: string) => {
                        const newData = { ...contactData, [key]: value };
                        setFormData({ ...formData, content: JSON.stringify(newData) });
                      };
                      return (
                        <div className="space-y-4 pt-2">
                          <h3 className="font-bold border-b pb-2">Contact Page Details</h3>
                          
                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hero Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title</label>
                                <input type="text" value={contactData.heroTitle || ""} onChange={e => updateField("heroTitle", e.target.value)} placeholder="e.g. Get in touch." className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Subtitle</label>
                                <textarea rows={2} value={contactData.heroSubtitle || ""} onChange={e => updateField("heroSubtitle", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Direct Channels (Contact Info)</h4>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Introductory Text</label>
                              <textarea rows={2} value={contactData.description || ""} onChange={e => updateField("description", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Phone 1</label>
                                <input type="text" value={contactData.phone1 || ""} onChange={e => updateField("phone1", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Phone 2</label>
                                <input type="text" value={contactData.phone2 || ""} onChange={e => updateField("phone2", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">YouTube URL</label>
                                <input type="text" value={contactData.youtube || ""} onChange={e => updateField("youtube", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Instagram URL</label>
                                <input type="text" value={contactData.instagram || ""} onChange={e => updateField("instagram", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Twitter/X Text</label>
                                <input type="text" value={contactData.twitter || ""} onChange={e => updateField("twitter", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Website URL</label>
                                <input type="text" value={contactData.website || ""} onChange={e => updateField("website", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Google Maps URL</label>
                                <input type="text" value={contactData.googleMaps || ""} onChange={e => updateField("googleMaps", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Google Reviews URL</label>
                                <input type="text" value={contactData.googleReviews || ""} onChange={e => updateField("googleReviews", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hospitals Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Title</label>
                                <input type="text" value={contactData.hospitalsTitle || ""} onChange={e => updateField("hospitalsTitle", e.target.value)} placeholder="e.g. Our Hospitals" className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Description</label>
                                <textarea rows={2} value={contactData.hospitalsDesc || ""} onChange={e => updateField("hospitalsDesc", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hospital Names (comma-separated)</label>
                              <textarea rows={3} value={contactData.hospitalNames || ""} onChange={e => updateField("hospitalNames", e.target.value)} placeholder="Kelkar Hospital, Sanmitra Hospital, Ashakiran Hospital" className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                          </div>
                        </div>
                      );
                    })() : formData.slug === "about" ? (() => {
                      let aboutData: any = {};
                      try {
                        aboutData = JSON.parse(formData.content || "{}");
                      } catch (e) {}
                      const updateField = (key: string, value: any) => {
                        const newData = { ...aboutData, [key]: value };
                        setFormData({ ...formData, content: JSON.stringify(newData) });
                      };
                      return (
                        <div className="space-y-4 pt-2">
                          <h3 className="font-bold border-b pb-2">About Page Details</h3>
                          
                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hero Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title 1</label>
                                <input type="text" value={aboutData.heroTitle1 || ""} onChange={e => updateField("heroTitle1", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title 2</label>
                                <input type="text" value={aboutData.heroTitle2 || ""} onChange={e => updateField("heroTitle2", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hero Subtitle</label>
                              <textarea rows={2} value={aboutData.heroSubtitle || ""} onChange={e => updateField("heroSubtitle", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Our Story / About Content</h4>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">About Description (HTML supported, e.g. &lt;br/&gt;)</label>
                              <textarea 
                                rows={6} 
                                value={aboutData.aboutContent || ""} 
                                onChange={e => updateField("aboutContent", e.target.value)} 
                                className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" 
                                placeholder="Enter content about the clinic/hospital..."
                              />
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Values Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Values Title</label>
                                <input type="text" value={aboutData.valuesTitle || ""} onChange={e => updateField("valuesTitle", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Values Description</label>
                                <textarea rows={2} value={aboutData.valuesDescription || ""} onChange={e => updateField("valuesDescription", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Experts Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Experts Title</label>
                                <input type="text" value={aboutData.expertsTitle || ""} onChange={e => updateField("expertsTitle", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Experts Description</label>
                                <textarea rows={2} value={aboutData.expertsDescription || ""} onChange={e => updateField("expertsDescription", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                            
                            <div className="space-y-4 mt-6">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-foreground">Medical Experts</label>
                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                  const experts = aboutData.experts || [];
                                  updateField("experts", [...experts, { img: "", name: "", role: "", spec: "" }]);
                                }}>
                                  <Plus className="w-4 h-4 mr-2" /> Add Expert
                                </Button>
                              </div>
                              
                              {(aboutData.experts || []).map((expert: any, idx: number) => (
                                <div key={idx} className="p-4 bg-background border border-border rounded-xl relative space-y-4">
                                  <button type="button" onClick={() => {
                                    const experts = aboutData.experts || [];
                                    updateField("experts", experts.filter((_: any, i: number) => i !== idx));
                                  }} className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  
                                  <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-xl border border-border overflow-hidden relative">
                                      {expert.img ? (
                                        <img src={expert.img} alt="Expert" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">No Image</div>
                                      )}
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setUploadingImage(true);
                                          try {
                                            const form = new FormData();
                                            form.append("file", file);
                                            const res = await fetch("/api/upload", { method: "POST", body: form });
                                            const json = await res.json();
                                            if (json.success) {
                                              const newExperts = [...(aboutData.experts || [])];
                                              newExperts[idx] = { ...newExperts[idx], img: json.url };
                                              updateField("experts", newExperts);
                                            }
                                          } catch (err) {
                                            console.error(err);
                                          } finally {
                                            setUploadingImage(false);
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <label className="text-xs font-bold text-muted-foreground">Name</label>
                                          <input type="text" value={expert.name || ""} onChange={(e) => {
                                            const newExperts = [...(aboutData.experts || [])];
                                            newExperts[idx] = { ...newExperts[idx], name: e.target.value };
                                            updateField("experts", newExperts);
                                          }} className="w-full h-8 px-2 rounded-lg border border-border bg-background outline-none text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-xs font-bold text-muted-foreground">Degree</label>
                                          <input type="text" value={expert.role || ""} onChange={(e) => {
                                            const newExperts = [...(aboutData.experts || [])];
                                            newExperts[idx] = { ...newExperts[idx], role: e.target.value };
                                            updateField("experts", newExperts);
                                          }} className="w-full h-8 px-2 rounded-lg border border-border bg-background outline-none text-sm" />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground">Specialization</label>
                                        <input type="text" value={expert.spec || ""} onChange={(e) => {
                                          const newExperts = [...(aboutData.experts || [])];
                                          newExperts[idx] = { ...newExperts[idx], spec: e.target.value };
                                          updateField("experts", newExperts);
                                        }} className="w-full h-8 px-2 rounded-lg border border-border bg-background outline-none text-sm" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground italic">Note: The arrays for Values can be edited via raw JSON or advanced setup later.</p>
                        </div>
                      );
                    })() : formData.slug === "contact" ? (() => {
                      let contactData: any = {};
                      try {
                        contactData = JSON.parse(formData.content || "{}");
                      } catch (e) {}
                      const updateField = (key: string, value: any) => {
                        const newData = { ...contactData, [key]: value };
                        setFormData({ ...formData, content: JSON.stringify(newData) });
                      };
                      return (
                        <div className="space-y-4 pt-2">
                          <h3 className="font-bold border-b pb-2">Contact Page Details</h3>
                          
                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hero Section</h4>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hero Title</label>
                              <input type="text" value={contactData.heroTitle || ""} onChange={e => updateField("heroTitle", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hero Subtitle</label>
                              <textarea rows={2} value={contactData.heroSubtitle || ""} onChange={e => updateField("heroSubtitle", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Direct Channels</h4>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Description</label>
                              <textarea rows={2} value={contactData.description || ""} onChange={e => updateField("description", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Phone 1</label>
                                <input type="text" value={contactData.phone1 || ""} onChange={e => updateField("phone1", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Phone 2</label>
                                <input type="text" value={contactData.phone2 || ""} onChange={e => updateField("phone2", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">YouTube Link</label>
                                <input type="text" value={contactData.youtube || ""} onChange={e => updateField("youtube", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Instagram Link</label>
                                <input type="text" value={contactData.instagram || ""} onChange={e => updateField("instagram", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Twitter (X) Link</label>
                                <input type="text" value={contactData.twitter || ""} onChange={e => updateField("twitter", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Website Link</label>
                                <input type="text" value={contactData.website || ""} onChange={e => updateField("website", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Google Maps Link</label>
                                <input type="text" value={contactData.googleMaps || ""} onChange={e => updateField("googleMaps", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Google Reviews Link</label>
                                <input type="text" value={contactData.googleReviews || ""} onChange={e => updateField("googleReviews", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hospitals Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hospitals Title</label>
                                <input type="text" value={contactData.hospitalsTitle || ""} onChange={e => updateField("hospitalsTitle", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hospitals Desc</label>
                                <textarea rows={2} value={contactData.hospitalsDesc || ""} onChange={e => updateField("hospitalsDesc", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hospital Names (comma separated)</label>
                              <textarea rows={2} value={contactData.hospitalNames || ""} onChange={e => updateField("hospitalNames", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                          </div>
                        </div>
                      );
                    })() : formData.slug === "services" ? (() => {
                      let servicesData: any = {};
                      try {
                        servicesData = JSON.parse(formData.content || "{}");
                      } catch (e) {}
                      const updateField = (key: string, value: any) => {
                        const newData = { ...servicesData, [key]: value };
                        setFormData({ ...formData, content: JSON.stringify(newData) });
                      };
                      return (
                        <div className="space-y-4 pt-2">
                          <h3 className="font-bold border-b pb-2">Services Page Details</h3>
                          
                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hero Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title 1</label>
                                <input type="text" value={servicesData.heroTitle1 || ""} onChange={e => updateField("heroTitle1", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title 2</label>
                                <input type="text" value={servicesData.heroTitle2 || ""} onChange={e => updateField("heroTitle2", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hero Subtitle</label>
                              <textarea rows={2} value={servicesData.heroSubtitle || ""} onChange={e => updateField("heroSubtitle", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Specialties Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Services Title</label>
                                <input type="text" value={servicesData.servicesTitle || ""} onChange={e => updateField("servicesTitle", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Services Description</label>
                                <textarea rows={2} value={servicesData.servicesDescription || ""} onChange={e => updateField("servicesDescription", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground italic">Note: The services list can be edited via raw JSON or advanced setup later.</p>
                        </div>
                      );
                    })() : formData.slug === "conditions" ? (() => {
                      let conditionsData: any = {};
                      try {
                        conditionsData = JSON.parse(formData.content || "{}");
                      } catch (e) {}
                      const updateField = (key: string, value: any) => {
                        const newData = { ...conditionsData, [key]: value };
                        setFormData({ ...formData, content: JSON.stringify(newData) });
                      };
                      return (
                        <div className="space-y-4 pt-2">
                          <h3 className="font-bold border-b pb-2">Conditions Page Details</h3>
                          
                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Hero Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title 1</label>
                                <input type="text" value={conditionsData.heroTitle1 || ""} onChange={e => updateField("heroTitle1", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Hero Title 2</label>
                                <input type="text" value={conditionsData.heroTitle2 || ""} onChange={e => updateField("heroTitle2", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">Hero Subtitle</label>
                              <textarea rows={2} value={conditionsData.heroSubtitle || ""} onChange={e => updateField("heroSubtitle", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                            </div>
                          </div>

                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="font-semibold text-sm">Conditions Section</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Conditions Title</label>
                                <input type="text" value={conditionsData.conditionsTitle || ""} onChange={e => updateField("conditionsTitle", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Conditions Description</label>
                                <textarea rows={2} value={conditionsData.conditionsDescription || ""} onChange={e => updateField("conditionsDescription", e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground italic">Note: The conditions list can be edited via raw JSON or advanced setup later.</p>
                        </div>
                      );
                    })() : (
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Content (HTML/Markdown)</label>
                        <textarea required rows={6} value={formData.content || ""} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                      </div>
                    )}
                  </>
                )}

                {/* Treatments Form */}
                {(modalType === "treatments" || modalType === "sexual-problems") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Title</label>
                        <input required type="text" value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Slug (URL)</label>
                        <input required type="text" value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Badge / Category Name</label>
                      <input type="text" value={formData.badge || ""} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Doctor/Team Label</label>
                        <input type="text" value={formData.doctor || "Clinical Team"} onChange={e => setFormData({...formData, doctor: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Lead Doctor Role</label>
                        <input type="text" value={formData.leadDoctorRole || "Specialists"} onChange={e => setFormData({...formData, leadDoctorRole: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                      </div>
                    </div>
                    
                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                      <h4 className="font-semibold text-sm">Hero Section</h4>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground">Hero Image Upload (Optional)</label>
                        <div className="flex items-center gap-4">
                          {formData.heroImage && (
                            <img src={formData.heroImage} alt="Hero Preview" className="h-16 w-16 object-cover rounded-xl border border-border bg-background" />
                          )}
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploadingImage}
                            />
                            <button type="button" disabled={uploadingImage} className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors">
                              {uploadingImage ? "Uploading..." : "Choose Image"}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground">Hero Headline</label>
                        <input type="text" value={formData.heroHeadline || ""} onChange={e => setFormData({...formData, heroHeadline: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground">Hero Subtext</label>
                        <textarea rows={2} value={formData.heroSubtext || ""} onChange={e => setFormData({...formData, heroSubtext: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground">Main Description (Below Hero)</label>
                        <textarea rows={3} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background outline-none resize-y" />
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm">Causes / Symptoms Sections</h4>
                        <button type="button" onClick={() => setFormData({...formData, causes: [...(formData.causes || []), {}]})} className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">Add Section</button>
                      </div>
                      {(formData.causes || []).map((cause: any, index: number) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-background relative mt-2">
                          <button type="button" onClick={() => {
                            const newCauses = [...formData.causes];
                            newCauses.splice(index, 1);
                            setFormData({...formData, causes: newCauses});
                          }} className="absolute top-2 right-2 text-red-500"><X className="w-4 h-4" /></button>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2 mt-4">
                            <input type="text" placeholder="Title" value={cause.title || ""} onChange={e => {
                              const newCauses = [...formData.causes];
                              newCauses[index] = {...cause, title: e.target.value};
                              setFormData({...formData, causes: newCauses});
                            }} className="w-full h-10 px-3 rounded-lg border border-border outline-none text-sm" />
                            <input type="text" placeholder="Icon (e.g. BrainCircuit)" value={cause.icon || ""} onChange={e => {
                              const newCauses = [...formData.causes];
                              newCauses[index] = {...cause, icon: e.target.value};
                              setFormData({...formData, causes: newCauses});
                            }} className="w-full h-10 px-3 rounded-lg border border-border outline-none text-sm" />
                          </div>
                          <textarea rows={2} placeholder="Optional Description" value={cause.description || ""} onChange={e => {
                            const newCauses = [...formData.causes];
                            newCauses[index] = {...cause, description: e.target.value};
                            setFormData({...formData, causes: newCauses});
                          }} className="w-full p-3 rounded-lg border border-border outline-none text-sm resize-y mb-2" />
                          <textarea rows={3} placeholder="Points (one per line)" value={(cause.points || []).join('\n')} onChange={e => {
                            const newCauses = [...formData.causes];
                            newCauses[index] = {...cause, points: e.target.value.split('\n').filter(Boolean)};
                            setFormData({...formData, causes: newCauses});
                          }} className="w-full p-3 rounded-lg border border-border outline-none text-sm resize-y" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm">Treatment Options</h4>
                        <button type="button" onClick={() => setFormData({...formData, treatments: [...(formData.treatments || []), {}]})} className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">Add Treatment</button>
                      </div>
                      {(formData.treatments || []).map((t: any, index: number) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-background relative mt-2">
                          <button type="button" onClick={() => {
                            const newTs = [...formData.treatments];
                            newTs.splice(index, 1);
                            setFormData({...formData, treatments: newTs});
                          }} className="absolute top-2 right-2 text-red-500"><X className="w-4 h-4" /></button>
                          
                          <input type="text" placeholder="Treatment Title" value={t.title || ""} onChange={e => {
                            const newTs = [...formData.treatments];
                            newTs[index] = {...t, title: e.target.value};
                            setFormData({...formData, treatments: newTs});
                          }} className="w-full h-10 px-3 mt-4 mb-2 rounded-lg border border-border outline-none text-sm" />
                          <textarea rows={2} placeholder="Description" value={t.description || ""} onChange={e => {
                            const newTs = [...formData.treatments];
                            newTs[index] = {...t, description: e.target.value};
                            setFormData({...formData, treatments: newTs});
                          }} className="w-full p-3 rounded-lg border border-border outline-none text-sm resize-y" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                      <h4 className="font-semibold text-sm">Call to Action (CTA)</h4>
                      <div className="space-y-2">
                        <input type="text" placeholder="Headline" value={formData.cta?.headline || ""} onChange={e => setFormData({...formData, cta: {...(formData.cta || {}), headline: e.target.value}})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm" />
                        <input type="text" placeholder="Subtext" value={formData.cta?.subtext || ""} onChange={e => setFormData({...formData, cta: {...(formData.cta || {}), subtext: e.target.value}})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm" />
                        <input type="text" placeholder="Button Text (e.g. Book an Appointment)" value={formData.cta?.buttonText || ""} onChange={e => setFormData({...formData, cta: {...(formData.cta || {}), buttonText: e.target.value}})} className="w-full h-10 px-3 rounded-xl border border-border bg-background outline-none text-sm" />
                      </div>
                    </div>
                  </>
                )}

                {/* Posts Form */}
                {modalType === "posts" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Title</label>
                        <input required type="text" value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Slug</label>
                        <input required type="text" value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Author</label>
                        <input required type="text" value={formData.author || ""} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Status</label>
                        <select value={formData.status || "Draft"} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Excerpt</label>
                        <textarea required rows={2} value={formData.excerpt || ""} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Read Time (e.g., 5 min read)</label>
                        <input required type="text" value={formData.readTime || ""} onChange={e => setFormData({...formData, readTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Category</label>
                      <select value={formData.categoryId || ""} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Content</label>
                      <textarea required rows={6} value={formData.content || ""} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                    </div>
                  </>
                )}

                {/* Categories Form */}
                {modalType === "categories" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Name</label>
                      <input required type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Slug</label>
                      <input required type="text" value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                  </>
                )}

                {/* FAQs Form */}
                {modalType === "faqs" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Question</label>
                      <input required type="text" value={formData.question || ""} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Category</label>
                      <input type="text" value={formData.category || "General"} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Answer</label>
                      <textarea required rows={4} value={formData.answer || ""} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                    </div>
                  </>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl font-bold">Cancel</Button>
                  <Button type="submit" disabled={saving} className="rounded-xl font-bold">
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
