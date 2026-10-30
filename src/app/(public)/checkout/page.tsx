"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Lock, ShieldCheck, ArrowRight, CreditCard, ShoppingBag, 
  CheckCircle2, AlertCircle, Upload, FileText, 
  Truck, Building2, ExternalLink, Loader2, UserCheck
} from "lucide-react";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DigitalPrescription {
  _id: string;
  doctorId?: {
    name: string;
    specialization?: string;
  };
  prescriptionSummary?: string;
  createdAt: string;
}

interface PincodeCheckResult {
  isServiceable: boolean;
  pinCode?: string;
  areaName?: string;
  deliveryCharge?: number;
  estimatedHours?: string;
  freeDeliveryThreshold?: number;
  message?: string;
}

interface ConfirmedOrder {
  _id: string;
  orderNumber?: string;
  status: string;
  totalAmount?: number;
  shippingDetails?: {
    fullName?: string;
    phone?: string;
    areaName?: string;
    pinCode?: string;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const router = useRouter();

  // Authentication & Patient state
  const [patientId, setPatientId] = useState<string | null>(null);

  // Stepper: 1: Prescription (if required), 2: Shipping & PIN check, 3: Payment, 4: Success
  const hasPrescriptionItems = items.some((item) => item.isPrescription === true);
  const [currentStep, setCurrentStep] = useState<"prescription" | "shipping" | "payment" | "success" | null>(null);
  const step = currentStep ?? (hasPrescriptionItems ? "prescription" : "shipping");
  const setStep = (s: "prescription" | "shipping" | "payment" | "success") => setCurrentStep(s);

  // Prescription selection states
  const [prescriptionType, setPrescriptionType] = useState<"digital" | "upload">("digital");
  const [digitalPrescriptions, setDigitalPrescriptions] = useState<DigitalPrescription[]>([]);
  const [selectedDigitalRxId, setSelectedDigitalRxId] = useState<string>("");
  const [uploadedRxUrl, setUploadedRxUrl] = useState<string>("");
  const [uploadedRxName, setUploadedRxName] = useState<string>("");
  const [uploadingRx, setUploadingRx] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");

  // Shipping form state (Focus: Akola, Maharashtra)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const city = "Akola";
  const state = "Maharashtra";
  const [pinCode, setPinCode] = useState("");
  const [landmark, setLandmark] = useState("");

  // Mobile verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // PIN code live validation
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinResult, setPinResult] = useState<PincodeCheckResult | null>(null);
  const [pinError, setPinError] = useState("");

  // Order & Payment state
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  // 1. Check patient authentication on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setPatientId(data.user.patientId || data.user.id);
          setFullName(data.user.name || "");
          if (data.user.phone) {
            setPhone(data.user.phone);
            setIsPhoneVerified(true);
          }

          // If logged in, fetch their digital prescriptions
          if (data.user.patientId) {
            fetch(`/api/consultations?patientId=${data.user.patientId}`)
              .then((r) => r.json())
              .then((consultJson) => {
                if (consultJson.success && Array.isArray(consultJson.data)) {
                  const withRx = consultJson.data.filter(
                    (c: { prescriptionSummary?: string; _id: string }) => c.prescriptionSummary && c.prescriptionSummary !== "[]"
                  );
                  setDigitalPrescriptions(withRx);
                  if (withRx.length > 0) {
                    setSelectedDigitalRxId(withRx[0]._id);
                  }
                }
              })
              .catch((err) => console.error("Error loading prescriptions:", err));
          }
        }
      })
      .catch((err) => console.error("Auth check failed:", err));
  }, []);

  // 2. Validate PIN code whenever it changes to 6 digits
  useEffect(() => {
    if (pinCode.length === 6 && /^\d{6}$/.test(pinCode)) {
      let ignore = false;
      setCheckingPin(true);
      fetch(`/api/pharmacy/check-pincode?pincode=${pinCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) {
            if (data.isServiceable) {
              setPinResult({ isServiceable: true, ...data.data });
              setPinError("");
            } else {
              setPinResult(null);
              setPinError(data.message || "PIN code is currently not serviceable in Akola.");
            }
          }
        })
        .catch(() => {
          if (!ignore) {
            setPinResult(null);
            setPinError("Failed to check PIN code serviceability.");
          }
        })
        .finally(() => {
          if (!ignore) setCheckingPin(false);
        });

      return () => {
        ignore = true;
      };
    } else {
      setPinResult(null);
    }
  }, [pinCode]);

  // Handle Prescription File Upload (PDF, JPG, PNG)
  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPrescriptionError("Invalid file type. Please upload a PDF, JPG, or PNG document.");
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setPrescriptionError("File size exceeds 8MB. Please upload a smaller file.");
      return;
    }

    setPrescriptionError("");
    setUploadingRx(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "prescriptions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setUploadedRxUrl(json.url);
        setUploadedRxName(file.name);
      } else {
        throw new Error(json.message || "Upload failed");
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to upload prescription. Please try again.";
      setPrescriptionError(msg);
    } finally {
      setUploadingRx(false);
    }
  };

  // Financial calculations
  const itemsSubtotal = getTotal();
  const taxRate = 12; // GST 12% on medications
  const taxAmount = Math.round((itemsSubtotal * taxRate) / 100);
  const freeThreshold = pinResult?.freeDeliveryThreshold || 500;
  const deliveryFee = itemsSubtotal >= freeThreshold ? 0 : (pinResult?.deliveryCharge ?? 50);
  const totalAmount = itemsSubtotal + taxAmount + deliveryFee;

  // Validate Prescription step
  const handleProceedFromPrescription = () => {
    if (hasPrescriptionItems) {
      if (prescriptionType === "digital" && !selectedDigitalRxId) {
        setPrescriptionError("Please select a valid doctor's prescription from your account.");
        return;
      }
      if (prescriptionType === "upload" && !uploadedRxUrl) {
        setPrescriptionError("Please upload a clear doctor's prescription (PDF, JPG, or PNG).");
        return;
      }
    }
    setPrescriptionError("");
    setStep("shipping");
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setPinError("Please enter a valid 10-digit mobile number first.");
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    setOtpSentMessage("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, name: fullName }),
      });
      const data = await res.json();
      if (data.success) {
        setShowOtpInput(true);
        setOtpSentMessage(data.message || `Verification code sent to WhatsApp +91 ${cleanPhone}`);
        setCountdown(60);
      } else {
        setOtpError(data.message || "Failed to send OTP.");
      }
    } catch {
      setOtpError("Failed to send OTP. Please check your network connection.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!otp || otp.length < 4) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }
    setVerifyingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp, name: fullName }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setIsPhoneVerified(true);
        const resolvedPatientId = data.user.patientId || data.user.id;
        setPatientId(resolvedPatientId);
        if (data.user.name && !fullName.trim()) {
          setFullName(data.user.name);
        }
        setShowOtpInput(false);
        setOtpSentMessage("");
        setOtpError("");
        setPinError("");

        // If existing patient has prescriptions, fetch them automatically
        if (resolvedPatientId) {
          fetch(`/api/consultations?patientId=${resolvedPatientId}`)
            .then((r) => r.json())
            .then((consultJson) => {
              if (consultJson.success && Array.isArray(consultJson.data)) {
                const withRx = consultJson.data.filter(
                  (c: { prescriptionSummary?: string; _id: string }) => c.prescriptionSummary && c.prescriptionSummary !== "[]"
                );
                setDigitalPrescriptions(withRx);
                if (withRx.length > 0) {
                  setSelectedDigitalRxId(withRx[0]._id);
                }
              }
            })
            .catch((err) => console.error("Error loading prescriptions:", err));
        }
      } else {
        setOtpError(data.message || "Invalid OTP code. Please try again.");
      }
    } catch {
      setOtpError("Failed to verify code. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Validate Shipping step
  const handleProceedFromShipping = () => {
    setPinError("");
    if (!fullName.trim()) {
      setPinError("Full recipient name is required.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setPinError("A valid 10-digit mobile number is required for delivery coordination.");
      return;
    }
    if (!isPhoneVerified) {
      setPinError("Please verify your mobile number via WhatsApp OTP before continuing.");
      if (!showOtpInput) {
        handleSendOtp();
      }
      return;
    }
    if (!street.trim()) {
      setPinError("Street address and house/flat number are required.");
      return;
    }
    if (!pinCode || pinCode.length !== 6) {
      setPinError("Please enter your 6-digit delivery PIN code.");
      return;
    }
    if (checkingPin) {
      setPinError("Verifying delivery PIN code, please wait a moment...");
      return;
    }
    if (!pinResult || !pinResult.isServiceable) {
      setPinError("Please enter a serviceable PIN code within Akola (e.g., 444001, 444002, 444004).");
      return;
    }

    setPinError("");
    setStep("payment");
  };

  // Final Order Placement & Payment Handler
  const handlePlaceOrder = async () => {
    if (!patientId || !isPhoneVerified) {
      setOrderError("Please verify your mobile number to complete your medicine order.");
      setStep("shipping");
      return;
    }

    setSubmittingOrder(true);
    setOrderError("");

    try {
      // 1. Prepare Order Payload
      const orderPayload = {
        patientId,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          priceAtPurchase: i.price,
          isPrescription: !!i.isPrescription,
        })),
        shippingDetails: {
          fullName,
          phone,
          street,
          city: "Akola",
          state: "Maharashtra",
          pinCode,
          landmark,
        },
        prescriptionSource: hasPrescriptionItems 
          ? (prescriptionType === "digital" ? "DIGITAL_CONSULTATION" : "UPLOADED_DOCUMENT")
          : "OTC_NO_RX",
        consultationId: (hasPrescriptionItems && prescriptionType === "digital") ? selectedDigitalRxId : undefined,
        uploadedPrescriptionUrl: (hasPrescriptionItems && prescriptionType === "upload") ? uploadedRxUrl : undefined,
        paymentMethod: "Online",
      };

      // 2. Submit Order to Pharmacy API
      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      const createdOrder = data.data;

      // 3. Process Payment via Razorpay
      try {
        const razorpayRes = await fetch("/api/payments/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            receipt: createdOrder.orderNumber || createdOrder._id,
          }),
        });

        const rzpData = await razorpayRes.json();
        if (!razorpayRes.ok || !rzpData.success || !rzpData.order) {
          throw new Error(rzpData.error || "Failed to initialize payment gateway.");
        }

        // Dynamically ensure Razorpay checkout script is loaded
        await new Promise<boolean>((resolve) => {
          if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        // Open Razorpay Checkout modal
        if (typeof window !== "undefined" && window.Razorpay && rzpData.order) {
          const keyToUse = rzpData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TkVlKsA4NG7BFZ";

          const options = {
            key: keyToUse,
            amount: rzpData.order.amount,
            currency: rzpData.order.currency || "INR",
            name: "Kelkar Manas Health Care",
            description: `Medicine Order ${createdOrder.orderNumber}`,
            order_id: rzpData.order.id,
            prefill: {
              name: fullName,
              contact: phone.replace(/\D/g, "").slice(-10),
            },
            theme: {
              color: "#7A2E7A",
            },
            modal: {
              backdropclose: false,
              escape: true,
              handleback: true,
              confirm_close: true,
              ondismiss: () => {
                setSubmittingOrder(false);
              },
            },
            handler: async function (response: Record<string, unknown>) {
              try {
                await fetch("/api/payments/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...response,
                    amount: totalAmount,
                    patientId,
                    orderId: createdOrder._id,
                  }),
                });
              } catch (verifyErr) {
                console.warn("Payment verification notice:", verifyErr);
              }
              setConfirmedOrder(createdOrder);
              setStep("success");
              clearCart();
              setSubmittingOrder(false);
            },
          };

          const rzpInstance = new window.Razorpay(options);
          if ("on" in rzpInstance && typeof (rzpInstance as unknown as { on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void }).on === "function") {
            (rzpInstance as unknown as { on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void }).on("payment.failed", function (resp: { error?: { description?: string } }) {
              setOrderError(resp.error?.description || "Payment failed or was cancelled. Please try again.");
              setSubmittingOrder(false);
            });
          }
          rzpInstance.open();
          return;
        } else {
          throw new Error("Unable to load Razorpay payment SDK. Please refresh and try again.");
        }
      } catch (paymentErr: unknown) {
        console.error("Razorpay flow error:", paymentErr);
        const msg = paymentErr instanceof Error ? paymentErr.message : "Payment gateway error. Please try again.";
        setOrderError(msg);
        setSubmittingOrder(false);
        return;
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "An error occurred while placing your order.";
      setOrderError(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Empty cart view
  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-20 px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          You need to add some medicines or healthcare products to your cart before proceeding to checkout.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8">Return to Pharmacy</Button>
        </Link>
      </div>
    );
  }

  // Success view
  if (step === "success" && confirmedOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-20 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-xl mx-auto space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground text-sm">
              Your medicine delivery order has been received and forwarded to our licensed pharmacy partner.
            </p>
          </div>

          {/* Patient Account & Profile Linked Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-left flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-900">Patient Profile Linked</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your order is securely linked to your verified patient profile for <strong>+91 {phone}</strong>. You can log into your patient account anytime using this WhatsApp number to track live delivery, review doctor prescriptions, and book consultations.
              </p>
            </div>
          </div>

          <div className="bg-muted/40 border border-border/80 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Order Reference</span>
                <p className="font-mono font-bold text-lg text-primary">{confirmedOrder.orderNumber || `#${confirmedOrder._id.slice(-6)}`}</p>
              </div>
              <Badge className="bg-emerald-600 text-white font-semibold">
                {confirmedOrder.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase font-bold">Delivery Location</span>
                <p className="font-semibold text-foreground mt-0.5">{confirmedOrder.shippingDetails?.areaName || "Akola"}, Maharashtra</p>
                <p className="text-muted-foreground">PIN: {confirmedOrder.shippingDetails?.pinCode || pinCode}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase font-bold">Est. Dispatch Time</span>
                <p className="font-semibold text-foreground mt-0.5">{pinResult?.estimatedHours || "Within 24 Hours"}</p>
                <p className="text-muted-foreground">Discreet packaging guaranteed</p>
              </div>
            </div>

            <div className="p-3 bg-background/80 rounded-xl border border-border/60 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" /> Licensed Pharmacy Fulfilment
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Kelkar Manas Partner Pharmacy (Licence: MH-AKL-2026-20B-10842). Verified by registered pharmacist before tamper-evident dispatch.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/patient/orders">
              <Button size="lg" className="rounded-full px-8 shadow-md gap-2 w-full sm:w-auto">
                Track Order Status
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="rounded-full px-8 w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-32 sm:pb-16">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm font-semibold flex-wrap">
          {hasPrescriptionItems && (
            <div 
              className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer ${step === "prescription" ? "text-primary font-bold" : "text-muted-foreground"}`}
              onClick={() => setStep("prescription")}
            >
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step === "prescription" ? "bg-primary text-white shadow-sm" : "bg-muted border"}`}>1</span>
              <span>Prescription</span>
            </div>
          )}
          
          <div 
            className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer ${step === "shipping" ? "text-primary font-bold" : "text-muted-foreground"}`}
            onClick={() => (!hasPrescriptionItems || (uploadedRxUrl || selectedDigitalRxId)) && setStep("shipping")}
          >
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step === "shipping" ? "bg-primary text-white shadow-sm" : "bg-muted border"}`}>
              {hasPrescriptionItems ? "2" : "1"}
            </span>
            <span>Delivery & PIN</span>
          </div>

          <div className={`flex items-center gap-1.5 sm:gap-2 ${step === "payment" ? "text-primary font-bold" : "text-muted-foreground opacity-60"}`}>
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${step === "payment" ? "bg-primary text-white shadow-sm" : "bg-muted border"}`}>
              {hasPrescriptionItems ? "3" : "2"}
            </span>
            <span>Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          
          {/* Left Column: Form Steps */}
          <div className="lg:w-3/5 space-y-6">
            
            {/* STEP 1: PRESCRIPTION REQUIREMENT */}
            {step === "prescription" && hasPrescriptionItems && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold mb-3 border border-amber-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Prescription Required by Indian Law
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Doctor&apos;s Prescription Verification</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your cart contains prescription-only medications. As per regulations, a licensed pharmacist must verify a registered doctor&apos;s prescription before dispensing.
                  </p>
                </div>

                {/* Prescription Intake Tabs */}
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-muted/50 rounded-2xl border border-border/70 text-xs sm:text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setPrescriptionType("digital")}
                    className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${prescriptionType === "digital" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <FileText className="w-4 h-4" />
                    Select Digital Prescription
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrescriptionType("upload")}
                    className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${prescriptionType === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Prescription File
                  </button>
                </div>

                {/* Option A: Digital Prescription from Portal */}
                {prescriptionType === "digital" && (
                  <div className="space-y-4 pt-2">
                    {digitalPrescriptions.length === 0 ? (
                      <div className="p-6 bg-muted/30 border border-dashed border-border rounded-2xl text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                        <div>
                          <p className="font-semibold text-sm">No issued prescriptions found on your account</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            If you have a physical prescription from another doctor, you can switch tabs to upload it. Otherwise, book an online doctor consultation.
                          </p>
                        </div>
                        <div className="pt-2 flex justify-center gap-3">
                          <Button size="sm" variant="outline" onClick={() => setPrescriptionType("upload")}>
                            Upload Existing Prescription
                          </Button>
                          <Link href="/booking">
                            <Button size="sm" className="gap-1.5">
                              Book Doctor Consultation <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Select from your clinical consultations</Label>
                        {digitalPrescriptions.map((rx) => (
                          <div 
                            key={rx._id}
                            onClick={() => setSelectedDigitalRxId(rx._id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${selectedDigitalRxId === rx._id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-border/80 bg-background"}`}
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Prescription by Dr. {rx.doctorId?.name || "Clinic Doctor"}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Issued: {new Date(rx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${selectedDigitalRxId === rx._id ? "bg-primary text-white border-primary" : "border-muted-foreground/30"}`}>
                              {selectedDigitalRxId === rx._id && "✓"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Option B: Upload Prescription Document */}
                {prescriptionType === "upload" && (
                  <div className="space-y-4 pt-2">
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-8 text-center space-y-3 hover:bg-muted/10 transition-colors relative">
                      <input 
                        type="file" 
                        accept=".pdf,image/png,image/jpeg,image/webp" 
                        onChange={handlePrescriptionUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={uploadingRx}
                      />
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        {uploadingRx ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {uploadedRxName ? `Selected: ${uploadedRxName}` : "Click or drag your doctor's prescription here"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: PDF, JPG, PNG (Max size: 8MB)
                        </p>
                      </div>
                    </div>

                    {uploadedRxUrl && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Prescription file uploaded and attached
                        </span>
                        <a href={uploadedRxUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline text-primary">
                          Preview
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {prescriptionError && (
                  <p className="text-xs font-semibold text-destructive">{prescriptionError}</p>
                )}

                <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-between items-stretch sm:items-center border-t border-border">
                  <Link href="/booking" className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 py-1">
                    Need a new prescription? Book consultation
                  </Link>
                  <Button onClick={handleProceedFromPrescription} className="rounded-full px-6 py-3 sm:py-2 text-sm font-bold gap-2 w-full sm:w-auto justify-center">
                    Continue to Delivery
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SHIPPING ADDRESS & AKOLA PIN CODE CHECK */}
            {step === "shipping" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Delivery Address</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Medicine deliveries are currently prioritized for Akola, Maharashtra with local express dispatch.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Recipient Full Name *</Label>
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="phone">Mobile Phone (WhatsApp Verified) *</Label>
                        {isPhoneVerified && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-3 text-xs font-bold text-muted-foreground select-none">+91</span>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            maxLength={11}
                            onChange={(e) => {
                              let raw = e.target.value.replace(/\D/g, "");
                              // Automatically remove leading 0 if entered
                              if (raw.startsWith("0")) raw = raw.slice(1);
                              if (raw.startsWith("91") && raw.length > 10) raw = raw.slice(2);
                              raw = raw.slice(0, 10);
                              setPhone(raw);
                              if (isPhoneVerified) {
                                setIsPhoneVerified(false);
                                setShowOtpInput(false);
                              }
                            }}
                            placeholder="98765 43210"
                            className="rounded-xl h-11 pl-11 font-mono font-medium"
                            required
                          />
                        </div>
                        {!isPhoneVerified ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendOtp}
                            disabled={sendingOtp || phone.replace(/\D/g, "").slice(-10).length < 10}
                            className="rounded-xl h-11 px-4 text-xs font-semibold shrink-0 border-primary/40 text-primary hover:bg-primary/5"
                          >
                            {sendingOtp ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                Sending...
                              </>
                            ) : (
                              "Verify Mobile"
                            )}
                          </Button>
                        ) : (
                          <div className="h-11 px-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5 text-xs font-bold shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Verified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp OTP Verification Box */}
                  {!isPhoneVerified && showOtpInput && (
                    <div className="p-4 bg-muted/40 border border-primary/30 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary" /> Enter 6-digit WhatsApp Verification Code
                        </span>
                        {countdown > 0 ? (
                          <span className="text-xs text-muted-foreground font-mono">Resend in {countdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>

                      {otpSentMessage && (
                        <p className="text-xs text-emerald-600 font-medium">{otpSentMessage}</p>
                      )}

                      <div className="flex gap-2">
                        <Input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="rounded-xl h-11 tracking-widest font-mono text-center text-lg font-bold bg-background placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otp.length < 4}
                          className="rounded-xl h-11 px-5 font-semibold text-xs shrink-0"
                        >
                          {verifyingOtp ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              Verifying...
                            </>
                          ) : (
                            "Confirm OTP"
                          )}
                        </Button>
                      </div>

                      {otpError && (
                        <p className="text-xs text-destructive font-medium">{otpError}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address / House / Flat No. *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Flat 204, Om Residency, Civil Lines"
                      className="rounded-xl h-11"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <div className="relative">
                        <Input
                          id="pincode"
                          value={pinCode}
                          maxLength={6}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPinCode(val);
                            if (val.length === 6) {
                              setCheckingPin(true);
                            } else {
                              setPinResult(null);
                              setPinError(val.length > 0 ? "Please enter a 6-digit PIN code." : "");
                            }
                          }}
                          placeholder="e.g. 444001"
                          className="rounded-xl h-11 font-mono font-medium placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground/60"
                          required
                        />
                        {checkingPin && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        readOnly
                        className="rounded-xl h-11 bg-muted/40 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={state}
                        readOnly
                        className="rounded-xl h-11 bg-muted/40 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near District Hospital or Town Hall"
                      className="rounded-xl h-11"
                    />
                  </div>

                  {/* Serviceability Banner */}
                  {pinResult && pinResult.isServiceable && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                      <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Serviceable in {pinResult.areaName || "Akola Area"}</span>
                        <p className="mt-0.5">
                          Estimated Delivery: <span className="font-semibold">{pinResult.estimatedHours || "Within 24 Hours"}</span>. 
                          {deliveryFee === 0 ? " You qualify for FREE Delivery!" : ` Standard local delivery: ₹${deliveryFee}.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {pinError && (
                    <div className="p-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl flex items-start gap-3 text-xs">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <p>{pinError}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-between items-stretch sm:items-center border-t border-border">
                  {hasPrescriptionItems ? (
                    <Button variant="ghost" onClick={() => setStep("prescription")} className="rounded-full w-full sm:w-auto h-11 text-xs sm:text-sm font-semibold">
                      Back to Prescription
                    </Button>
                  ) : <div className="hidden sm:block" />}
                  <Button onClick={handleProceedFromShipping} className="rounded-full px-6 py-3.5 sm:py-2.5 h-auto text-sm sm:text-base font-bold gap-2 w-full sm:w-auto justify-center">
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {step === "payment" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-background rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Payment Method</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prepaid online payments are required under pharmacy dispensary regulations.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">UPI, Debit/Credit Card, Net Banking</p>
                        <p className="text-xs text-muted-foreground">Instant verification via Razorpay secure gateway</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold">Default</Badge>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Refunds for cancelled or unavailable items are processed back to the original payment source.</span>
                  </div>
                </div>

                {orderError && (
                  <div className="p-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs">
                    {orderError}
                  </div>
                )}

                <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between items-stretch sm:items-center border-t border-border">
                  <Button variant="ghost" onClick={() => setStep("shipping")} className="rounded-full w-full sm:w-auto h-11 text-xs sm:text-sm font-semibold">
                    Back to Address
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    disabled={submittingOrder}
                    className="rounded-full w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-6 text-sm sm:text-base font-bold shadow-lg gap-2 justify-center h-auto"
                  >
                    {submittingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        Pay ₹{totalAmount.toLocaleString()} & Confirm Order
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:w-2/5">
            <div className="bg-background rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-border shadow-sm sticky top-24 space-y-6">
              <h3 className="text-lg font-serif font-bold">Order Summary</h3>

              {/* Items List */}
              <div className="divide-y divide-border/60 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground line-clamp-1">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        {item.isPrescription && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 font-semibold">
                            Rx Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Medicines Subtotal</span>
                  <span>₹{itemsSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Applicable GST (12%)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Local Delivery (Akola)</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-3 border-t border-border text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary text-xl">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Discreet Packaging & Pharmacy Guarantee */}
              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Building2 className="w-4 h-4 text-primary" />
                  Fulfilled by Partner Licensed Pharmacy
                </div>
                <p>
                  Delivered in unbranded, discreet packaging across Akola. Prescriptions verified by licensed pharmacists before packing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
