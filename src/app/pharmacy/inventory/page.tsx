"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Plus, Edit3, X } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

export default function PharmacyInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const fetchInventory = async (cId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pharmacy/products?clinicId=${cId}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.clinicId) {
          setClinicId(data.user.clinicId);
          fetchInventory(data.user.clinicId);
        } else {
          fetchInventory("");
        }
      })
      .catch(() => fetchInventory(""));
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;

    try {
      const res = await fetch("/api/pharmacy/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          name,
          category,
          price,
          stock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        // Reset form
        setName("");
        setCategory("");
        setPrice(0);
        setStock(0);
        fetchInventory(clinicId);
      } else {
        alert(data.message || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !clinicId) return;

    try {
      const res = await fetch("/api/pharmacy/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProduct._id,
          name,
          category,
          price,
          stock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        fetchInventory(clinicId);
      } else {
        alert(data.message || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setIsEditModalOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Medicine Name",
      cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const amount = row.getValue("price") as number;
        return <span>₹{amount.toLocaleString()}</span>;
      }
    },
    {
      accessorKey: "stock",
      header: "Stock Level",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "In Stock" ? "default" : status === "Low Stock" ? "secondary" : "destructive";
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openEditModal(product)}>
            <Edit3 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Track stock levels and manage medication pricing.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>
      
      <DataTable columns={columns} data={products} />

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-lg relative space-y-4">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Medicine Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Paracetamol 500mg" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="e.g. Analgesic" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(Number(e.target.value))} 
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-lg relative space-y-4">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Edit Product Details</h2>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Medicine Name</Label>
                <Input 
                  id="edit-name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-category">Category</Label>
                <Input 
                  id="edit-category" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input 
                    id="edit-price" 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-stock">Current Stock</Label>
                  <Input 
                    id="edit-stock" 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(Number(e.target.value))} 
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
