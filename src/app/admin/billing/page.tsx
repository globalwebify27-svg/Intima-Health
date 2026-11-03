"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Receipt, Search, Eye, Edit3, Plus, Trash2, CheckCircle2, 
  AlertCircle, RefreshCcw, Printer, ArrowLeft, ShieldCheck, 
  Sparkles, Package, Truck, Percent, IndianRupee, Tag,
  FileText, Clock, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AdditionalCharge {
  id: string;
  name: string;
  amount: number;
}

interface BillItem {
  name: string;
  quantity: number;
  priceAtPurchase: number;
  total: number;
  isPrescription?: boolean;
}

interface Bill {
  _id: string;
  billNumber: string;
  orderNumber?: string;
  createdAt: string;
  patient: {
    name: string;
    email: string;
    phone: string;
  };
  shippingDetails?: {
    fullName: string;
    phone: string;
    pinCode: string;
    city: string;
    street?: string;
    receiverName?: string;
    receiverPhone?: string;
  };
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  items: BillItem[];
  pricing: {
    itemsTotal: number;
    taxPercent: number;
    taxAmount: number;
    deliveryCharge: number;
    packingCharge: number;
    handlingCharge: number;
    additionalCharges: AdditionalCharge[];
    discountAmount: number;
    totalPayable: number;
    customizedAt?: string;
    customizedBy?: string;
    notes?: string;
  };
}

function BillingContent() {
  const searchParams = useSearchParams();
  const preselectOrderId = searchParams.get("orderId");

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Summary stats
  const [summary, setSummary] = useState({
    totalBills: 0,
    totalRevenue: 0,
    customizedCount: 0,
    additionalChargesTotal: 0,
  });

  // Customize Bill Modal state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingBill, setSavingBill] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // Editable bill state
  const [editItemsTotal, setEditItemsTotal] = useState<number>(0);
  const [editTaxPercent, setEditTaxPercent] = useState<number>(12);
  const [editTaxAmount, setEditTaxAmount] = useState<number>(0);
  const [editDeliveryCharge, setEditDeliveryCharge] = useState<number>(0);
  const [editAdditionalCharges, setEditAdditionalCharges] = useState<AdditionalCharge[]>([]);
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");

  // Preview Bill Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Fetch all bills
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/billing");
      const json = await res.json();
      if (json.success && json.data) {
        setBills(json.data.bills);
        setSummary(json.data.summary);

        if (preselectOrderId) {
          const match = json.data.bills.find(
            (b: Bill) => b._id === preselectOrderId || b.orderNumber === preselectOrderId
          );
          if (match) {
            handleOpenCustomize(match);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        b.billNumber.toLowerCase().includes(query) ||
        (b.orderNumber && b.orderNumber.toLowerCase().includes(query)) ||
        b.patient.name.toLowerCase().includes(query) ||
        b.patient.phone.includes(query) ||
        (b.shippingDetails?.receiverName && b.shippingDetails.receiverName.toLowerCase().includes(query));

      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Paid" && b.paymentStatus === "Paid") ||
        (statusFilter === "Pending" && b.paymentStatus === "Pending") ||
        (statusFilter === "Customized" && (b.pricing.customizedAt || (b.pricing.additionalCharges && b.pricing.additionalCharges.length > 0)));

      return matchQuery && matchStatus;
    });
  }, [bills, searchQuery, statusFilter]);

  // Open Customize modal
  const handleOpenCustomize = (bill: Bill) => {
    setSelectedBill(bill);
    setEditItemsTotal(bill.pricing.itemsTotal);
    setEditTaxPercent(bill.pricing.taxPercent || 12);
    setEditTaxAmount(bill.pricing.taxAmount);
    setEditDeliveryCharge(bill.pricing.deliveryCharge);

    // Merge packing/handling into additional charges if separate
    const existing = [...(bill.pricing.additionalCharges || [])];
    if (bill.pricing.packingCharge && !existing.some((c) => c.name.toLowerCase().includes("packing"))) {
      existing.push({ id: "pack-legacy", name: "Packing Charges", amount: bill.pricing.packingCharge });
    }
    if (bill.pricing.handlingCharge && !existing.some((c) => c.name.toLowerCase().includes("handling"))) {
      existing.push({ id: "hand-legacy", name: "Handling Charges", amount: bill.pricing.handlingCharge });
    }

    setEditAdditionalCharges(existing);
    setEditDiscountAmount(bill.pricing.discountAmount || 0);
    setEditNotes(bill.pricing.notes || "");
    setSaveSuccess("");
    setSaveError("");
    setEditModalOpen(true);
  };

  // Open Preview directly from table
  const handleOpenPreviewDirect = (bill: Bill) => {
    setSelectedBill(bill);
    setEditItemsTotal(bill.pricing.itemsTotal);
    setEditTaxPercent(bill.pricing.taxPercent || 12);
    setEditTaxAmount(bill.pricing.taxAmount);
    setEditDeliveryCharge(bill.pricing.deliveryCharge);
    setEditAdditionalCharges(bill.pricing.additionalCharges || []);
    setEditDiscountAmount(bill.pricing.discountAmount || 0);
    setEditNotes(bill.pricing.notes || "");
    setPreviewModalOpen(true);
  };

  // Live Computed Total
  const calculatedTotal = useMemo(() => {
    const additionalSum = editAdditionalCharges.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const sub = Number(editItemsTotal) || 0;
    const tax = Number(editTaxAmount) || 0;
    const del = Number(editDeliveryCharge) || 0;
    const disc = Number(editDiscountAmount) || 0;
    return Math.max(0, sub + tax + del + additionalSum - disc);
  }, [editItemsTotal, editTaxAmount, editDeliveryCharge, editAdditionalCharges, editDiscountAmount]);

  // Quick Presets
  const handleAddPackingPreset = () => {
    const exists = editAdditionalCharges.find((c) => c.name.toLowerCase().includes("packing"));
    if (exists) {
      setEditAdditionalCharges(
        editAdditionalCharges.map((c) => (c.name.toLowerCase().includes("packing") ? { ...c, amount: 40 } : c))
      );
    } else {
      setEditAdditionalCharges([
        ...editAdditionalCharges,
        { id: Math.random().toString(36).substring(2, 9), name: "Packing Charges", amount: 40 },
      ]);
    }
  };

  const handleAddHandlingPreset = () => {
    const exists = editAdditionalCharges.find((c) => c.name.toLowerCase().includes("handling"));
    if (exists) {
      setEditAdditionalCharges(
        editAdditionalCharges.map((c) => (c.name.toLowerCase().includes("handling") ? { ...c, amount: 9 } : c))
      );
    } else {
      setEditAdditionalCharges([
        ...editAdditionalCharges,
        { id: Math.random().toString(36).substring(2, 9), name: "Handling Charges", amount: 9 },
      ]);
    }
  };

  const handleAddNewCharge = () => {
    setEditAdditionalCharges([
      ...editAdditionalCharges,
      { id: Math.random().toString(36).substring(2, 9), name: "Custom Charge", amount: 0 },
    ]);
  };

  const handleRemoveCharge = (id: string) => {
    setEditAdditionalCharges(editAdditionalCharges.filter((c) => c.id !== id));
  };

  const handleUpdateCharge = (id: string, field: "name" | "amount", value: string | number) => {
    setEditAdditionalCharges(
      editAdditionalCharges.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            [field]: field === "amount" ? Math.max(0, Number(value) || 0) : value,
          };
        }
        return c;
      })
    );
  };

  // Auto-calculate tax from percentage
  const handleRecalculateTax = () => {
    const calculated = Math.round((Number(editItemsTotal) * Number(editTaxPercent)) / 100);
    setEditTaxAmount(calculated);
  };

  // Save changes
  const handleSaveBill = async () => {
    if (!selectedBill) return;
    setSavingBill(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const payload = {
        itemsTotal: editItemsTotal,
        taxPercent: editTaxPercent,
        taxAmount: editTaxAmount,
        deliveryCharge: editDeliveryCharge,
        additionalCharges: editAdditionalCharges,
        discountAmount: editDiscountAmount,
        totalPayable: calculatedTotal,
        notes: editNotes,
      };

      const res = await fetch(`/api/admin/billing/${selectedBill._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(`Bill ${selectedBill.billNumber} successfully updated and finalized!`);
        fetchBills();
        setTimeout(() => {
          setEditModalOpen(false);
        }, 1200);
      } else {
        setSaveError(json.message || "Failed to update bill.");
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error saving bill.");
    } finally {
      setSavingBill(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-primary" />
            Billing Management & Customization
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Customize, add, or remove charges (packing, handling, taxes, delivery) for any bill generated on the website.
          </p>
        </div>

        <Button
          onClick={fetchBills}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold gap-2 self-start sm:self-auto shrink-0"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Bills
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" /> Total Invoices
          </span>
          <p className="text-2xl font-bold font-serif text-foreground">{summary.totalBills}</p>
          <p className="text-[10px] text-muted-foreground">All customer orders & bills</p>
        </div>

        <div className="bg-card border border-border/80 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Billed Revenue
          </span>
          <p className="text-2xl font-bold font-serif text-foreground">₹{summary.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Across all generated bills</p>
        </div>

        <div className="bg-card border border-border/80 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-600" /> Additional Charges
          </span>
          <p className="text-2xl font-bold font-serif text-foreground">₹{summary.additionalChargesTotal.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Packing, handling & custom charges</p>
        </div>

        <div className="bg-card border border-border/80 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Customized Bills
          </span>
          <p className="text-2xl font-bold font-serif text-foreground">{summary.customizedCount}</p>
          <p className="text-[10px] text-muted-foreground">Bills modified by administrators</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bill #, Customer Name, Phone..."
            className="pl-10 rounded-xl h-10 text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", "Paid", "Pending", "Customized"].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="rounded-xl text-xs font-bold shrink-0"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">All Invoices & Bills</h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredBills.length} of {bills.length} bills. Select any bill to modify charges or preview.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Bill Reference</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Medicines / Items</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">Additional Charges</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBills.map((bill) => {
                const addCharges = bill.pricing.additionalCharges || [];
                const isCustomized = !!bill.pricing.customizedAt || addCharges.length > 0;

                return (
                  <tr key={bill._id} className="hover:bg-muted/30 transition-colors">
                    {/* Bill Reference */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-primary text-xs">
                          {bill.billNumber}
                        </span>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        {isCustomized && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-bold bg-primary/10 text-primary border-primary/20">
                            Customized
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-xs">{bill.patient.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">+91 {bill.patient.phone}</p>
                        {bill.shippingDetails?.receiverName && (
                          <p className="text-[10px] text-primary font-medium flex items-center gap-1 pt-0.5">
                            <UserCheck className="w-3 h-3 shrink-0" />
                            Receiver: {bill.shippingDetails.receiverName}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-0.5 max-w-[200px]">
                        <span className="font-semibold text-foreground">
                          {bill.items.length} {bill.items.length === 1 ? "Item" : "Items"}
                        </span>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {bill.items.map((i) => `${i.name} (${i.quantity}x)`).join(", ")}
                        </p>
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="py-4 px-4 align-top font-medium font-mono text-xs">
                      ₹{bill.pricing.itemsTotal.toLocaleString()}
                    </td>

                    {/* Additional Charges Badges */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {addCharges.length > 0 ? (
                          addCharges.map((c, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {c.name}: +₹{c.amount}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-foreground font-mono">
                          ₹{bill.pricing.totalPayable.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {bill.paymentMethod}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-top">
                      {bill.paymentStatus === "Paid" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px] font-semibold">
                          Pending
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPreviewDirect(bill)}
                          className="h-8 px-2.5 rounded-xl text-xs gap-1 font-semibold text-foreground hover:bg-muted"
                          title="Preview Printable Bill"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="hidden sm:inline">Preview</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleOpenCustomize(bill)}
                          className="h-8 px-3 rounded-xl text-xs gap-1.5 font-bold shadow-sm"
                          title="Customize Bill Charges"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Customize
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBills.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    No bills found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: CUSTOMIZE BILL ================= */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {selectedBill?.billNumber}
              </span>
              <Badge variant="outline" className="text-xs">
                Customer: {selectedBill?.patient.name}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-serif font-bold text-foreground pt-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Customize & Edit Bill Charges
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust medicine subtotal, delivery, taxes, or add extra packing/handling charges. All updates apply immediately to this bill.
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-6 pt-2">
              {/* Items Summary (Readonly overview) */}
              <div className="p-3.5 bg-muted/30 border border-border rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Purchased Items ({selectedBill.items.length})
                </span>
                <div className="divide-y divide-border/60 text-xs">
                  {selectedBill.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center">
                      <span className="text-foreground">
                        {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        ₹{(item.priceAtPurchase * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Presets Section */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Quick Charge Presets
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPackingPreset}
                    className="rounded-xl text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Packing Charges (+₹40)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddHandlingPreset}
                    className="rounded-xl text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Handling Charges (+₹9)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewCharge}
                    className="rounded-xl text-xs font-semibold gap-1.5 border-dashed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Custom Charge
                  </Button>
                </div>
              </div>

              {/* Editable Billing Components Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 1. Items Subtotal */}
                <div className="space-y-1.5">
                  <Label htmlFor="subtotal" className="text-xs font-semibold">
                    Medicines Subtotal (₹) *
                  </Label>
                  <Input
                    id="subtotal"
                    type="number"
                    min={0}
                    value={editItemsTotal}
                    onChange={(e) => setEditItemsTotal(Number(e.target.value) || 0)}
                    className="rounded-xl h-10 font-mono font-bold"
                  />
                </div>

                {/* 2. Delivery Charges */}
                <div className="space-y-1.5">
                  <Label htmlFor="delivery" className="text-xs font-semibold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                    Delivery Charges (₹)
                  </Label>
                  <Input
                    id="delivery"
                    type="number"
                    min={0}
                    value={editDeliveryCharge}
                    onChange={(e) => setEditDeliveryCharge(Number(e.target.value) || 0)}
                    className="rounded-xl h-10 font-mono font-bold"
                  />
                </div>

                {/* 3. Tax Percentage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxPercent" className="text-xs font-semibold flex items-center gap-1">
                      <Percent className="w-3 h-3 text-muted-foreground" />
                      Tax Rate (% GST)
                    </Label>
                    <button
                      type="button"
                      onClick={handleRecalculateTax}
                      className="text-[11px] text-primary font-bold hover:underline"
                    >
                      Recalculate
                    </button>
                  </div>
                  <Input
                    id="taxPercent"
                    type="number"
                    min={0}
                    value={editTaxPercent}
                    onChange={(e) => setEditTaxPercent(Number(e.target.value) || 0)}
                    className="rounded-xl h-10 font-mono font-bold"
                  />
                </div>

                {/* 4. Tax Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="taxAmount" className="text-xs font-semibold">
                    Tax Amount (₹)
                  </Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    min={0}
                    value={editTaxAmount}
                    onChange={(e) => setEditTaxAmount(Number(e.target.value) || 0)}
                    className="rounded-xl h-10 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dynamic Additional Charges (Packing, Handling, etc.) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" />
                    Additional Custom Charges ({editAdditionalCharges.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddNewCharge}
                    className="h-7 text-xs text-primary font-bold gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Charge
                  </Button>
                </div>

                {editAdditionalCharges.length > 0 ? (
                  <div className="space-y-2">
                    {editAdditionalCharges.map((charge) => (
                      <div
                        key={charge.id}
                        className="p-2.5 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-2"
                      >
                        <Input
                          value={charge.name}
                          onChange={(e) => handleUpdateCharge(charge.id, "name", e.target.value)}
                          placeholder="Charge name (e.g. Packing Charges)"
                          className="rounded-lg h-9 text-xs font-medium bg-background flex-1"
                        />
                        <div className="relative w-28 shrink-0">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-muted-foreground select-none">
                            ₹
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={charge.amount}
                            onChange={(e) => handleUpdateCharge(charge.id, "amount", e.target.value)}
                            className="rounded-lg h-9 pl-6 text-xs font-mono font-bold bg-background text-right"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCharge(charge.id)}
                          className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                          title="Remove Charge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-border/70 text-center text-xs text-muted-foreground">
                    No additional charges added. Use the presets above to add Packing (+₹40) or Handling (+₹9).
                  </div>
                )}
              </div>

              {/* Discount & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="discount" className="text-xs font-semibold">
                    Discount / Adjustment (₹)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    value={editDiscountAmount}
                    onChange={(e) => setEditDiscountAmount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="rounded-xl h-10 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold">
                    Admin Customization Notes
                  </Label>
                  <Input
                    id="notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Added packing & handling per customer request"
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Calculated Final Bill Breakdown
                </span>
                <div className="space-y-1 text-xs text-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicines Subtotal:</span>
                    <span className="font-mono">₹{editItemsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes ({editTaxPercent}%):</span>
                    <span className="font-mono">₹{editTaxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charges:</span>
                    <span className="font-mono">₹{editDeliveryCharge.toLocaleString()}</span>
                  </div>
                  {editAdditionalCharges.map((c) => (
                    <div key={c.id} className="flex justify-between text-amber-700 font-medium">
                      <span>+ {c.name}:</span>
                      <span className="font-mono">₹{Number(c.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  {editDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>- Discount:</span>
                      <span className="font-mono">₹{editDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-primary/20 flex justify-between items-center text-sm font-bold">
                    <span className="text-foreground">Final Payable Amount:</span>
                    <span className="text-primary text-lg font-mono">₹{calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status alerts */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {saveSuccess}
                </div>
              )}
              {saveError && (
                <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  {saveError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewModalOpen(true)}
                  className="rounded-xl h-11 px-5 text-xs font-bold gap-2 w-full sm:w-auto"
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  Preview Bill
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-xl h-11 px-4 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveBill}
                    disabled={savingBill}
                    className="rounded-xl h-11 px-6 text-xs font-bold gap-2 shadow-sm w-full sm:w-auto"
                  >
                    {savingBill ? "Saving Changes..." : "Save & Finalize Bill"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: PREVIEW BILL (INVOICE) ================= */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-10">
          <DialogHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground">
                PRINTABLE INVOICE PREVIEW
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 rounded-xl text-xs font-bold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Download
              </Button>
            </div>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-6 pt-2 font-sans" id="printable-bill">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/logo.png" alt="Kelkar Manas Logo" className="h-9 w-auto object-contain" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-foreground">Kelkar Manas Health Care Pvt. Ltd.</h3>
                  <p className="text-xs text-muted-foreground">
                    Licensed Clinical Pharmacy & Neuropsychiatric Center
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Civil Lines, Akola, Maharashtra - 444001
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    DL No: MH-AKL-2024-0912 | GSTIN: 27AABCK9901M1Z5
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-sm text-foreground pt-1">{selectedBill.billNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Date:{" "}
                    {new Date(selectedBill.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    Payment: {selectedBill.paymentStatus} ({selectedBill.paymentMethod})
                  </Badge>
                </div>
              </div>

              {/* Customer & Delivery Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/20 border border-border rounded-2xl text-xs">
                <div>
                  <span className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    Billed To:
                  </span>
                  <p className="font-bold text-foreground text-sm">{selectedBill.patient.name}</p>
                  <p className="text-muted-foreground font-mono">+91 {selectedBill.patient.phone}</p>
                  {selectedBill.patient.email && (
                    <p className="text-muted-foreground">{selectedBill.patient.email}</p>
                  )}
                </div>

                <div>
                  <span className="font-bold uppercase text-[10px] text-muted-foreground block mb-1">
                    Delivery Destination:
                  </span>
                  <p className="text-foreground">{selectedBill.shippingAddress}</p>
                  {selectedBill.shippingDetails?.receiverName && (
                    <p className="text-primary font-semibold pt-1">
                      Receiver at Doorstep: <strong>{selectedBill.shippingDetails.receiverName}</strong>
                      {selectedBill.shippingDetails.receiverPhone && ` (+91 ${selectedBill.shippingDetails.receiverPhone})`}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-muted-foreground font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {item.name}
                          {item.isPrescription && (
                            <span className="text-[10px] text-amber-600 font-bold ml-1.5">(Rx Verified)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{item.priceAtPurchase.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          ₹{(item.priceAtPurchase * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown Table */}
              <div className="flex justify-end">
                <div className="w-full sm:w-80 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 text-muted-foreground">
                    <span>Medicines Subtotal:</span>
                    <span className="font-mono font-semibold text-foreground">
                      ₹{editItemsTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-muted-foreground">
                    <span>Applicable GST ({editTaxPercent}%):</span>
                    <span className="font-mono font-semibold text-foreground">
                      ₹{editTaxAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-muted-foreground">
                    <span>Local Delivery:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {editDeliveryCharge === 0 ? "FREE" : `₹${editDeliveryCharge.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Dynamic Additional Charges */}
                  {editAdditionalCharges.map((c) => (
                    <div key={c.id} className="flex justify-between py-1 text-amber-800 font-medium">
                      <span>+ {c.name}:</span>
                      <span className="font-mono font-bold">₹{Number(c.amount).toLocaleString()}</span>
                    </div>
                  ))}

                  {/* Discount */}
                  {editDiscountAmount > 0 && (
                    <div className="flex justify-between py-1 text-emerald-700 font-medium">
                      <span>- Discount / Concession:</span>
                      <span className="font-mono font-bold">₹{editDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="pt-2 border-t-2 border-primary/30 flex justify-between items-center text-sm font-bold">
                    <span className="text-foreground">Grand Total Payable:</span>
                    <span className="text-primary text-xl font-mono">₹{calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="pt-4 border-t border-border text-center space-y-1 text-[11px] text-muted-foreground">
                <p>This is a computer-generated invoice from Kelkar Manas Health Care Pharmacy Dispatch.</p>
                <p>Support: support@kelkarmanasclinic.com | Helplines: +91 94228 61000, +91 82610 67922</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BillingManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading Billing Management...</div>}>
      <BillingContent />
    </Suspense>
  );
}

