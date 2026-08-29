"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Edit2, Trash2, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StoreAdminPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");

    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, image: json.url });
      } else {
        alert(json.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/store/products`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error(`Failed to fetch products:`, err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setFormData(item || { type: "medication", isPrescription: false, stock: 0 });
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
        ? `/api/admin/store/products/${editingItem._id}`
        : `/api/admin/store/products`;
      
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price), // Ensure it's a number
          stock: Number(formData.stock) // Ensure it's a number
        })
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/store/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pharmacy Store</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Manage products, diagnostics tests, and supplements.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Products Directory</h2>
          <Button onClick={() => openModal()} className="rounded-xl h-10 px-4 font-bold text-xs gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center text-muted-foreground">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Rx Required</th>
                  <th className="p-4 font-semibold w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-muted-foreground">{product.category}</td>
                    <td className="p-4 capitalize">{product.type}</td>
                    <td className="p-4 font-semibold">₹{product.price.toLocaleString()}</td>
                    <td className="p-4">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {product.isPrescription ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                          <ShieldCheck className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-bold">No</span>
                      )}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => openModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No products found.</td>
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
                <h2 className="text-xl font-bold">{editingItem ? "Edit" : "Add"} Product</h2>
                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Product Name</label>
                    <input required type="text" value={formData.name || ""} onChange={e => {
                      const newName = e.target.value;
                      const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormData({...formData, name: newName, slug: newSlug});
                    }} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Slug (URL)</label>
                    <input required type="text" value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Price (₹)</label>
                    <input required type="number" min="0" step="1" value={formData.price || ""} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Stock Quantity</label>
                    <input required type="number" min="0" step="1" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Category</label>
                  <input required type="text" placeholder="e.g. Sexual Health" value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Product Type</label>
                    <select required value={formData.type || "medication"} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="medication">Medication</option>
                      <option value="diagnostic">Diagnostic Test</option>
                      <option value="supplement">Supplement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Image URL</label>
                    <div className="flex items-center gap-2">
                      {formData.image && (
                        <div className="w-10 h-10 shrink-0 border border-border rounded-lg overflow-hidden relative bg-muted flex items-center justify-center">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer h-10 text-sm"
                      />
                    </div>
                    {uploading && <p className="text-xs text-primary font-bold">Uploading...</p>}
                    <input type="text" placeholder="Or enter image URL" value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-xs text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2 flex items-center gap-3 pt-2">
                  <input type="checkbox" id="isPrescription" checked={formData.isPrescription || false} onChange={e => setFormData({...formData, isPrescription: e.target.checked})} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="isPrescription" className="text-sm font-bold cursor-pointer">Requires Prescription (Rx)</label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Description</label>
                  <textarea required rows={4} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y" />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl font-bold">Cancel</Button>
                  <Button type="submit" disabled={saving} className="rounded-xl font-bold">
                    {saving ? "Saving..." : "Save Product"}
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
