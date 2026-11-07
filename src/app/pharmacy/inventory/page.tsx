"use client";

import { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Plus, Edit3, X, Upload, Download, Trash2, Search } from "lucide-react";
import * as XLSX from "xlsx";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  packSize?: string;
  dosageForm?: string;
}

const MEDICINE_CATEGORIES = [
  "Tablets",
  "Syrup",
  "Powder",
  "Capsules",
  "Injections",
  "Ointment / Cream",
  "Drops (Eye / Ear)",
  "Inhaler / Spray",
  "Supplements",
  "General Medicine",
];

export default function PharmacyInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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
  const [category, setCategory] = useState("Tablets");
  const [packSize, setPackSize] = useState("");
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
          packSize,
          price,
          stock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        // Reset form
        setName("");
        setCategory("Tablets");
        setPackSize("");
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
    const csvContent = "Medicine Name,Category,Quantity / Pack Size,Price (₹),Initial Stock\n" +
      "FLUME 20 TAB,Syrup,100ml,78,100\n" +
      "Paracetamol 500mg,Tablets,10 tabs/strip,40,120\n" +
      "Amoxicillin 250mg,Capsules,10 caps/strip,150,45\n" +
      "Cough Relief Syrup,Syrup,100ml bottle,95,50\n" +
      "Pain Relief Gel,Ointment / Cream,30g tube,110,35\n";
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
      
      // Standardize the keys (lower case, trim, alphanumeric)
      const mappedProducts = parsedData.map(row => {
        const getVal = (keyNames: string[]) => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
            for (const target of keyNames) {
              const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (cleanKey === cleanTarget || cleanKey.includes(cleanTarget)) {
                return row[key];
              }
            }
          }
          return undefined;
        };

        const name = getVal(["medicinename", "medicine", "productname", "product", "name"]);
        const category = getVal(["category", "type", "form", "dosageform"]) || "General Medicine";

        // Pack / Unit Quantity column (e.g. "Quantity / Pack Size", "Pack / Unit Quantity", "Pack Size", "Quantity")
        const explicitPackSize = getVal([
          "packunitquantity", 
          "quantitypacksize", 
          "packquantity", 
          "packsize", 
          "packaging", 
          "unitquantity", 
          "volume"
        ]);

        // Explicit initial stock check
        const explicitStock = getVal(["initialstock", "stocklevel", "currentstock", "inventory", "stock"]);

        let packSizeVal = explicitPackSize;
        let stockVal = explicitStock;

        // If file had a generic "Quantity" column alongside "Stock", "Quantity" is the pack quantity!
        if (!packSizeVal && row["Quantity"] !== undefined && (row["Stock"] !== undefined || row["Initial Stock"] !== undefined)) {
          packSizeVal = row["Quantity"];
        }

        // If stock wasn't mapped via explicit stock keywords, fall back to "quantity" or "qty" if numeric
        if (stockVal === undefined) {
          const fallbackQty = getVal(["quantity", "qty"]);
          if (fallbackQty !== undefined && !isNaN(Number(fallbackQty))) {
            stockVal = fallbackQty;
          }
        }
        
        const priceVal = getVal(["price", "cost", "mrp", "rate"]);

        return {
          name: name ? String(name).trim() : undefined,
          category: category ? String(category).trim() : "General Medicine",
          packSize: packSizeVal ? String(packSizeVal).trim() : undefined,
          price: priceVal !== undefined ? Number(String(priceVal).replace(/[^0-9.]/g, "")) : undefined,
          stock: stockVal !== undefined ? parseInt(String(stockVal).replace(/[^0-9]/g, ""), 10) : undefined,
        };
      }).filter(p => p.name && p.price !== undefined && !isNaN(p.price) && p.stock !== undefined && !isNaN(p.stock));

      if (mappedProducts.length === 0) {
        alert("No valid products found. Ensure columns like Medicine Name, Price, and Stock exist.");
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
          packSize,
          price,
          stock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        setPackSize("");
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
    setCategory(product.category || "Tablets");
    setPackSize(product.packSize || "");
    setPrice(product.price);
    setStock(product.stock);
    setIsEditModalOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Medicine Name",
      cell: ({ row }) => <span className="font-bold text-foreground">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "category",
      header: "Category & Packaging",
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-foreground">{prod.category || "General Medicine"}</span>
            {prod.packSize && (
              <span className="text-[11px] text-muted-foreground">{prod.packSize}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price (₹)",
      cell: ({ row }) => {
        const amount = row.getValue("price") as number;
        return <span className="font-semibold text-foreground">₹{amount.toLocaleString()}</span>;
      }
    },
    {
      accessorKey: "stock",
      header: "Stock Level",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        return <span className={`font-semibold ${stock <= 15 ? "text-amber-600 dark:text-amber-400 font-bold" : ""}`}>{stock} units</span>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "In Stock" ? "default" : status === "Low Stock" ? "secondary" : "destructive";
        return <Badge variant={variant as any} className="text-[10px]">{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary rounded-lg" onClick={() => openEditModal(product)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 text-muted-foreground rounded-lg" onClick={() => handleDeleteProduct(product._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalMobilePages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedMobileProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="space-y-5 relative max-w-full overflow-x-hidden">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Manage clinic pharmacy stock, prices, and categories.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold text-xs h-9 px-2.5 flex-1 sm:flex-initial" onClick={downloadTemplate}>
            <Download className="w-3.5 h-3.5 mr-1" /> Template
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs h-9 px-2.5 flex-1 sm:flex-initial" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="w-3.5 h-3.5 mr-1" /> 
            {isUploading ? "Importing..." : "Import"}
          </Button>
          <Button size="sm" className="rounded-xl font-bold text-xs h-9 px-3 flex-1 sm:flex-initial shadow-xs" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-card rounded-2xl border border-border/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Medicines</span>
          <p className="text-xl font-black text-foreground mt-0.5">{products.length}</p>
        </div>
        <div className="p-3.5 bg-card rounded-2xl border border-border/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Low / Out of Stock</span>
          <p className="text-xl font-black text-amber-600 mt-0.5">
            {products.filter(p => p.stock <= 15).length}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3.5 bg-card rounded-2xl border border-border/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In Stock</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">
            {products.filter(p => p.stock > 15).length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search medicines by name or category..."
          className="pl-10 h-10 rounded-xl bg-card border-border/80 text-sm focus:ring-2 focus:ring-primary/20 w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Desktop View: Full DataTable */}
      <div className="hidden md:block w-full max-w-full overflow-hidden">
        <DataTable columns={columns} data={filteredProducts} />
      </div>

      {/* Mobile View: Responsive Cards List */}
      <div className="block md:hidden space-y-3">
        {paginatedMobileProducts.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border/60 text-muted-foreground text-sm">
            {searchQuery ? "No medicines matching your search." : "No medicines in inventory yet."}
          </div>
        ) : (
          paginatedMobileProducts.map((product) => {
            const variant = product.status === "In Stock" ? "default" : product.status === "Low Stock" ? "secondary" : "destructive";
            return (
              <div key={product._id} className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-foreground leading-snug">{product.name}</h3>
                    <span className="inline-block text-[11px] font-semibold text-muted-foreground">
                      {product.category || "General Medicine"}{product.packSize ? ` • ${product.packSize}` : ""}
                    </span>
                  </div>
                  <Badge variant={variant as any} className="shrink-0 text-[10px]">
                    {product.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock: </span>
                    <span className={`font-bold ${product.stock <= 15 ? "text-amber-600" : "text-foreground"}`}>
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary rounded-lg" onClick={() => openEditModal(product)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDeleteProduct(product._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        {filteredProducts.length > pageSize && (
          <div className="flex items-center justify-between pt-2 px-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Page {currentPage} of {totalMobilePages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalMobilePages}
                onClick={() => setCurrentPage(prev => Math.min(totalMobilePages, prev + 1))}
                className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Paracetamol 500mg" 
                  required 
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Category List & Quick Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={MEDICINE_CATEGORIES.includes(category) ? category : "Other"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== "Other") setCategory(val);
                      else setCategory("");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {MEDICINE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other / Custom</option>
                  </select>
                  {(!MEDICINE_CATEGORIES.includes(category) || category === "") && (
                    <Input
                      type="text"
                      placeholder="Type custom category name..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-9 text-xs rounded-xl mt-1.5"
                      required
                    />
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {["Tablets", "Syrup", "Powder", "Capsules"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          category.toLowerCase() === cat.toLowerCase()
                            ? "bg-primary text-white border-primary"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="packSize">Pack / Unit Quantity (Optional)</Label>
                  <Input 
                    id="packSize" 
                    value={packSize} 
                    onChange={(e) => setPackSize(e.target.value)} 
                    placeholder="e.g. 10 tabs/strip, 100ml, 5g" 
                    className="h-10 rounded-xl bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">Packaging or volume per unit.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    placeholder="e.g. 40"
                    required 
                    className="h-10 rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">Price per unit/tablet.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stock">Initial Stock *</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(Number(e.target.value))} 
                    required 
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" className="rounded-xl h-10 font-bold" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl h-10 font-bold">
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
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="edit-name">Medicine Name *</Label>
                <Input 
                  id="edit-name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Category List & Quick Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-category">Category *</Label>
                  <select
                    id="edit-category"
                    value={MEDICINE_CATEGORIES.includes(category) ? category : "Other"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== "Other") setCategory(val);
                      else setCategory("");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {MEDICINE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other / Custom</option>
                  </select>
                  {(!MEDICINE_CATEGORIES.includes(category) || category === "") && (
                    <Input
                      type="text"
                      placeholder="Type custom category name..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-9 text-xs rounded-xl mt-1.5"
                      required
                    />
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {["Tablets", "Syrup", "Powder", "Capsules"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          category.toLowerCase() === cat.toLowerCase()
                            ? "bg-primary text-white border-primary"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-packSize">Pack / Unit Quantity (Optional)</Label>
                  <Input 
                    id="edit-packSize" 
                    value={packSize} 
                    onChange={(e) => setPackSize(e.target.value)} 
                    placeholder="e.g. 10 tabs/strip, 100ml, 5g" 
                    className="h-10 rounded-xl bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">Packaging or volume per unit.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input 
                    id="edit-price" 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    placeholder="e.g. 40"
                    required 
                    className="h-10 rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">Price per unit/tablet.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-stock">Current Stock *</Label>
                  <Input 
                    id="edit-stock" 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(Number(e.target.value))} 
                    required 
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-xl h-10 font-bold"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl h-10 font-bold">
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
