"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Rss, List, HelpCircle, Plus, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "pages" | "posts" | "categories" | "faqs";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pages");
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [pages, setPages] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

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
      const res = await fetch(`/api/admin/content/${activeTab}`);
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
      const url = editingItem 
        ? `/api/admin/content/${modalType}/${editingItem._id}`
        : `/api/admin/content/${modalType}`;
      
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
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
      const res = await fetch(`/api/admin/content/${type}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const TABS = [
    { id: "pages", label: "Pages", icon: FileText },
    { id: "posts", label: "Blog Posts", icon: Rss },
    { id: "categories", label: "Categories", icon: List },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
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
                  {activeTab === "categories" && (
                    <>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Slug</th>
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
                {activeTab === "categories" && categories.map(cat => (
                  <tr key={cat._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 text-muted-foreground">{cat.slug}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal("categories", cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete("categories", cat._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
                {(!loading && ((activeTab === "pages" && pages.length === 0) || (activeTab === "posts" && posts.length === 0) || (activeTab === "categories" && categories.length === 0) || (activeTab === "faqs" && faqs.length === 0))) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No {activeTab} found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Content (HTML/Markdown)</label>
                      <textarea required rows={6} value={formData.content || ""} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
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
