"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Plus, Edit3, X, Upload, Download, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

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
  const [isUploading, setIsUploading] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const downloadTemplate = () => {
    const csvContent = "Name,Category,Price,Stock\nParacetamol 500mg,Analgesic,40,120\nAmoxicillin 250mg,Antibiotic,150,45\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "medicine_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clinicId) return;

    try {
      setIsUploading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      const parsedData = XLSX.utils.sheet_to_json(sheet) as any[];
      
      // Standardize the keys (lower case, trim)
      const mappedProducts = parsedData.map(row => {
        const getVal = (keyNames: string[]) => {
          for (const key of Object.keys(row)) {
            if (keyNames.includes(key.toLowerCase().trim())) {
              return row[key];
            }
          }
          return undefined;
        };
        
        return {
          name: getVal(["name", "medicine name", "medicine"]),
          category: getVal(["category", "type"]),
          price: getVal(["price", "cost"]),
          stock: getVal(["stock", "quantity", "qty", "stock level"]),
        };
      }).filter(p => p.name && p.price !== undefined && p.stock !== undefined);

      if (mappedProducts.length === 0) {
        alert("No valid products found. Ensure columns like Name, Price, and Stock exist.");
        return;
      }

      const res = await fetch("/api/pharmacy/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId, products: mappedProducts }),
      });
      const resData = await res.json();
      
      if (resData.success) {
        alert(resData.message || "Products imported successfully!");
        fetchInventory(clinicId);
      } else {
        alert(resData.message || "Failed to import products.");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing file or uploading data.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      alert("Error editing product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!clinicId) return;
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/pharmacy/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        fetchInventory(clinicId);
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
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
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openEditModal(product)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 text-muted-foreground" onClick={() => handleDeleteProduct(product._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
          <p className="text-muted-foreground mt-1">
            Manage clinic pharmacy stock, prices, and categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button variant="ghost" className="rounded-xl text-primary" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Template
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="w-4 h-4 mr-2" /> 
            {isUploading ? "Importing..." : "Import Medicine"}
          </Button>
          <Button className="rounded-xl" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
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
