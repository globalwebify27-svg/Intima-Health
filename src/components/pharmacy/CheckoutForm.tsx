"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, ArrowRight, CreditCard, ShoppingBag, 
  CheckCircle2, AlertCircle, Upload, FileText, 
  Truck, Building2, Loader2, UserCheck,
  Banknote, Edit3, Phone
} from "lucide-react";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  paymentMethod?: string;
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

interface CheckoutFormProps {
  isDashboard?: boolean;
}

export function CheckoutForm({ isDashboard = false }: CheckoutFormProps) {
  const { items, getTotal, clearCart } = useCart();
  const searchParams = useSearchParams();
  const queryConsultationId = searchParams.get("consultationId");

  // Authentication & Patient state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  // Stepper: 1: Prescription (if required), 2: Shipping & PIN check, 3: Payment, 4: Success
  const hasPrescriptionItems = items.some((item) => item.isPrescription === true);
  
  // If user selected a prescription from portal, start directly on delivery/shipping step!
  const [currentStep, setCurrentStep] = useState<"prescription" | "shipping" | "payment" | "success" | null>(null);
  const step = currentStep ?? (queryConsultationId ? "shipping" : (hasPrescriptionItems ? "prescription" : "shipping"));
  const setStep = (s: "prescription" | "shipping" | "payment" | "success") => setCurrentStep(s);

  // Prescription selection states
  const [prescriptionType, setPrescriptionType] = useState<"digital" | "upload">("digital");
  const [digitalPrescriptions, setDigitalPrescriptions] = useState<DigitalPrescription[]>([]);
  const [selectedDigitalRxId, setSelectedDigitalRxId] = useState<string>(queryConsultationId || "");
  const [uploadedRxUrl, setUploadedRxUrl] = useState<string>("");
  const [uploadedRxName, setUploadedRxName] = useState<string>("");
  const [uploadingRx, setUploadingRx] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");

  // Shipping form state (Focus: Akola, Maharashtra)
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const city = "Akola";
  const state = "Maharashtra";
  const [pinCode, setPinCode] = useState("");
  const [landmark, setLandmark] = useState("");

  // Phone editing & verification states
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isNewPhoneVerified, setIsNewPhoneVerified] = useState(false);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Guest phone fallback state
  const [guestPhone, setGuestPhone] = useState("");
  const [isGuestPhoneVerified, setIsGuestPhoneVerified] = useState(false);

  // PIN code live validation
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinResult, setPinResult] = useState<PincodeCheckResult | null>(null);
  const [pinError, setPinError] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"Online" | "COD">("Online");

  // Order & Payment state
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 1. Check patient authentication on mount & auto-populate
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setIsLoggedIn(true);
          const pId = data.user.patientId || data.user.id;
          setPatientId(pId);
          
          if (data.user.name) {
            setFullName(data.user.name);
            setProfileName(data.user.name);
          }
          if (data.user.phone) {
            const cleanPhone = data.user.phone.replace(/\D/g, "").slice(-10);
            setProfilePhone(cleanPhone);
          } else {
            // Direct profile fallback if phone was not on user object
            const fetchPatientPhone = async () => {
              if (data.user.patientId) {
                try {
                  const pRes = await fetch(`/api/patients/${data.user.patientId}`);
                  const pJson = await pRes.json();
                  if (pJson.success && pJson.data?.phone) {
                    const clean = pJson.data.phone.replace(/\D/g, "").slice(-10);
                    setProfilePhone(clean);
                    return;
                  }
                } catch {}
              }

              try {
                const prRes = await fetch("/api/patients/profile");
                const prJson = await prRes.json();
                if (prJson.success && prJson.profile?.phone) {
                  const clean = prJson.profile.phone.replace(/\D/g, "").slice(-10);
                  setProfilePhone(clean);
                  return;
                }
              } catch {}

              // If no phone found anywhere in database, automatically open edit mode so patient can enter it
              setIsEditingPhone(true);
            };

            fetchPatientPhone();
          }

          // If logged in, fetch digital prescriptions
          if (data.user.patientId) {
            fetch(`/api/consultations?patientId=${data.user.patientId}`)
              .then((r) => r.json())
              .then((consultJson) => {
                if (consultJson.success && Array.isArray(consultJson.data)) {
                  const withRx = consultJson.data.filter(
                    (c: { prescriptionSummary?: string; _id: string }) => c.prescriptionSummary && c.prescriptionSummary !== "[]"
                  );
                  
                  if (queryConsultationId) {
                    // Show ONLY the prescription chosen when ordering!
                    const matched = withRx.filter((c: { _id: string }) => c._id === queryConsultationId);
                    setDigitalPrescriptions(matched.length > 0 ? matched : withRx);
                    setSelectedDigitalRxId(queryConsultationId);
                  } else {
                    setDigitalPrescriptions(withRx);
                    if (withRx.length > 0) {
                      setSelectedDigitalRxId(withRx[0]._id);
                    }
                  }
                }
              })
              .catch((err) => console.error("Error loading prescriptions:", err));
          }
        }
      })
      .catch((err) => console.error("Auth check failed:", err));
  }, [queryConsultationId]);

  // 2. Validate PIN code whenever it changes to 6 digits
  useEffect(() => {
    if (pinCode.length === 6 && /^\d{6}$/.test(pinCode)) {
      let ignore = false;
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
    }
  }, [pinCode]);

  // Handle Prescription File Upload (PDF, JPG, PNG)
  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPrescriptionError("Invalid file type. Please upload a PDF, JPG, or PNG document.");
      return;
    }

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

  // Active phone number resolution
  const activeDeliveryPhone = isLoggedIn 
    ? (isEditingPhone && isNewPhoneVerified ? newPhone : profilePhone)
    : guestPhone;

  // OTP handlers for phone verification
  const handleSendOtp = async (phoneToSend: string) => {
    const cleanPhone = phoneToSend.replace(/\D/g, "").slice(-10);
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
        setShowOtpBox(true);
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

  const handleVerifyOtp = async (phoneToVerify: string) => {
    const cleanPhone = phoneToVerify.replace(/\D/g, "").slice(-10);
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
      if (data.success) {
        if (isLoggedIn) {
          setIsNewPhoneVerified(true);
          setShowOtpBox(false);
          setOtpSentMessage("");
          setOtpError("");
          setPinError("");
        } else {
          setIsGuestPhoneVerified(true);
          const resolvedPatientId = data.user?.patientId || data.user?.id;
          if (resolvedPatientId) setPatientId(resolvedPatientId);
          if (data.user?.name && !fullName.trim()) setFullName(data.user.name);
          setShowOtpBox(false);
          setOtpSentMessage("");
          setOtpError("");
          setPinError("");
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

    if (isLoggedIn) {
      if (isEditingPhone && !isNewPhoneVerified) {
        setPinError("Please verify your updated mobile number via WhatsApp OTP, or click Cancel to use your profile number.");
        return;
      }
      if (!activeDeliveryPhone || activeDeliveryPhone.length < 10) {
        setPinError("A valid 10-digit mobile number is required for delivery coordination.");
        return;
      }
    } else {
      const cleanPhone = guestPhone.replace(/\D/g, "").slice(-10);
      if (!cleanPhone || cleanPhone.length < 10) {
        setPinError("A valid 10-digit mobile number is required for delivery coordination.");
        return;
      }
      if (!isGuestPhoneVerified) {
        setPinError("Please verify your mobile number via WhatsApp OTP before continuing.");
        if (!showOtpBox) {
          handleSendOtp(guestPhone);
        }
        return;
      }
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
    const finalPhone = activeDeliveryPhone.replace(/\D/g, "").slice(-10);
    if (!finalPhone || finalPhone.length < 10) {
      setOrderError("Please enter a valid 10-digit mobile number for delivery.");
      setStep("shipping");
      return;
    }

    if (isLoggedIn && isEditingPhone && !isNewPhoneVerified) {
      setOrderError("Please verify your updated phone number via OTP first.");
      setStep("shipping");
      return;
    }

    if (!isLoggedIn && !isGuestPhoneVerified) {
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
          phone: finalPhone, // Order-only delivery phone without altering profile
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
        paymentMethod: paymentMethod,
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

      // 3. Handle COD Payment Mode directly
      if (paymentMethod === "COD") {
        setConfirmedOrder(createdOrder);
        setStep("success");
        clearCart();
        setSubmittingOrder(false);
        return;
      }

      // 4. Handle Online Payment via Razorpay
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
              contact: finalPhone,
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
              setOrderError(resp.error?.description || "Payment failed or was cancelled. You can choose Pay on Delivery below to complete your order.");
              setSubmittingOrder(false);
            });
          }
          rzpInstance.open();
          return;
        } else {
          throw new Error("Unable to load Razorpay payment SDK. Please try Pay on Delivery or refresh.");
        }
      } catch (paymentErr: unknown) {
        console.error("Razorpay flow error:", paymentErr);
        const msg = paymentErr instanceof Error ? paymentErr.message : "Payment gateway error. Please try Pay on Delivery.";
        setOrderError(`${msg} (You can also select Pay on Delivery below to place your order immediately)`);
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
      <div className="bg-background rounded-3xl p-8 border flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          You need to select medicines from your prescriptions before proceeding to checkout.
        </p>
        <Link href="/patient/prescriptions">
          <Button size="lg" className="rounded-full px-8">Order from Prescriptions</Button>
        </Link>
      </div>
    );
  }

  // Success view
  if (step === "success" && confirmedOrder) {
    return (
      <div className="bg-background rounded-3xl p-6 sm:p-12 border max-w-2xl mx-auto text-center space-y-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground text-sm">
              Your medicine delivery order has been received and forwarded to our licensed pharmacy partner.
            </p>
          </div>

          <div className="bg-muted/40 p-5 rounded-2xl border text-left text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-foreground text-sm">{confirmedOrder.orderNumber || confirmedOrder._id}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Delivery Recipient:</span>
              <span className="font-semibold text-foreground">{confirmedOrder.shippingDetails?.fullName || fullName}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Delivery Contact Phone:</span>
              <span className="font-semibold font-mono text-foreground">+91 {confirmedOrder.shippingDetails?.phone || activeDeliveryPhone}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-semibold text-foreground">
                {confirmedOrder.paymentMethod === "COD" ? "Pay on Delivery (Cash/UPI)" : "Prepaid Online"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Destination:</span>
              <span className="font-semibold text-foreground">Akola, Maharashtra ({pinCode})</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/patient/orders">
              <Button size="lg" className="rounded-full px-8 shadow-md gap-2 w-full sm:w-auto">
                Track Order Status
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/patient/prescriptions">
              <Button variant="outline" size="lg" className="rounded-full px-8 w-full sm:w-auto">
                Back to Prescriptions
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Breadcrumb (if inside patient portal) */}
      {isDashboard && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Prescription Medicine Delivery</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Secure express medicine delivery in Akola with licensed pharmacist verification
            </p>
          </div>
          <Link href="/patient/prescriptions">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold gap-1.5">
              ← Back to Prescriptions
            </Button>
          </Link>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 mb-6 text-xs sm:text-sm font-semibold flex-wrap">
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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
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
                  Your cart contains prescription medications. As per regulations, a licensed pharmacist must verify your doctor&apos;s prescription before dispensing.
                </p>
              </div>

              {/* If selected specifically from portal or 1 prescription attached */}
              {queryConsultationId && digitalPrescriptions.length > 0 ? (
                <div className="space-y-4 pt-2">
                  <div className="p-5 rounded-2xl border-2 border-primary bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Prescription Attached from Patient Portal
                      </span>
                      <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        ✓
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Prescription by Dr. {digitalPrescriptions[0].doctorId?.name || "Clinic Doctor"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Issued: {new Date(digitalPrescriptions[0].createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground bg-background/80 rounded-xl p-3 border border-border/60">
                      This prescription has been automatically linked to your order. You can proceed directly to delivery details.
                    </p>
                  </div>
                </div>
              ) : (
                <>
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

                  {prescriptionType === "digital" && (
                    <div className="space-y-4 pt-2">
                      {digitalPrescriptions.length === 0 ? (
                        <div className="p-6 bg-muted/30 border border-dashed border-border rounded-2xl text-center space-y-3">
                          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                          <div>
                            <p className="font-semibold text-sm">No issued prescriptions found on your account</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                              If you have a physical prescription from another doctor, you can switch tabs to upload it.
                            </p>
                          </div>
                          <div className="pt-2 flex justify-center gap-3">
                            <Button size="sm" variant="outline" onClick={() => setPrescriptionType("upload")}>
                              Upload Existing Prescription
                            </Button>
                            <Link href="/booking">
                              <Button size="sm" className="gap-1.5">
                                Book Doctor Consultation
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
                </>
              )}

              {prescriptionError && (
                <p className="text-xs font-semibold text-destructive">{prescriptionError}</p>
              )}

              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-between items-stretch sm:items-center border-t border-border">
                <Link href="/patient/prescriptions" className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 py-1">
                  ← Back to Prescriptions
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
                  {/* Recipient Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name">Recipient Full Name *</Label>
                      {isLoggedIn && profileName && (
                        <span className="text-[11px] text-muted-foreground">
                          Account: <strong className="text-foreground">{profileName}</strong>
                        </span>
                      )}
                    </div>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="rounded-xl h-11"
                      required
                    />
                  </div>

                  {/* Delivery Phone Number */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone">Delivery Contact Phone *</Label>
                      {isLoggedIn ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isEditingPhone ? (isNewPhoneVerified ? "New Number Verified" : "OTP Required") : "Profile Verified"}
                        </span>
                      ) : isGuestPhoneVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : null}
                    </div>

                    {/* Case 1: Logged-in user in DEFAULT mode with verified profile phone */}
                    {isLoggedIn && !isEditingPhone && profilePhone && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-3 text-xs font-bold text-muted-foreground select-none">+91</span>
                            <Input
                              id="phone"
                              type="tel"
                              value={profilePhone}
                              readOnly
                              disabled
                              className="rounded-xl h-11 pl-11 font-mono font-medium bg-muted/40 text-foreground cursor-not-allowed select-none border-border/80"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditingPhone(true);
                              setNewPhone("");
                              setIsNewPhoneVerified(false);
                              setShowOtpBox(false);
                              setOtpSentMessage("");
                              setOtpError("");
                            }}
                            className="rounded-xl h-11 px-4 text-xs font-bold shrink-0 border-primary/40 text-primary hover:bg-primary/5 gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Update
                          </Button>
                        </div>

                        <div className="rounded-xl bg-muted/40 border border-border/70 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Pre-filled from your verified profile (+91 {profilePhone}).
                          </span>
                          <span className="text-foreground/70 text-[10px]">Click Update for alternate courier phone</span>
                        </div>
                      </div>
                    )}

                    {/* Case 2: Logged-in user in EDITING mode (Update & Verify by OTP) OR when profilePhone is missing */}
                    {isLoggedIn && (isEditingPhone || !profilePhone) && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-primary" />
                              {profilePhone ? "Update Delivery Contact Number" : "Enter Delivery Contact Phone"}
                            </span>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              This number will be verified via WhatsApp OTP and used <strong className="text-foreground">only for this delivery order</strong>. Your main account profile will remain unchanged.
                            </p>
                          </div>
                          {profilePhone && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditingPhone(false);
                                setNewPhone("");
                                setIsNewPhoneVerified(false);
                                setShowOtpBox(false);
                              }}
                              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground shrink-0"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>

                        {!isNewPhoneVerified ? (
                          <div className="space-y-3 pt-1">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3.5 top-3 text-xs font-bold text-muted-foreground select-none">+91</span>
                                <Input
                                  type="tel"
                                  value={newPhone}
                                  maxLength={10}
                                  onChange={(e) => {
                                    let raw = e.target.value.replace(/\D/g, "");
                                    if (raw.startsWith("0")) raw = raw.slice(1);
                                    if (raw.startsWith("91") && raw.length > 10) raw = raw.slice(2);
                                    raw = raw.slice(0, 10);
                                    setNewPhone(raw);
                                    setShowOtpBox(false);
                                  }}
                                  placeholder="New 10-digit delivery number"
                                  className="rounded-xl h-11 pl-11 font-mono font-medium bg-background"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={() => handleSendOtp(newPhone)}
                                disabled={sendingOtp || newPhone.length < 10}
                                className="rounded-xl h-11 px-4 text-xs font-bold shrink-0 shadow-sm"
                              >
                                {sendingOtp ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    Sending OTP...
                                  </>
                                ) : (
                                  "Verify by OTP"
                                )}
                              </Button>
                            </div>

                            {/* OTP Box */}
                            {showOtpBox && (
                              <div className="p-3.5 bg-background border border-primary/30 rounded-xl space-y-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-primary" /> Enter 6-digit WhatsApp Code sent to +91 {newPhone}
                                  </span>
                                  {countdown > 0 ? (
                                    <span className="text-xs text-muted-foreground font-mono">Resend in {countdown}s</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSendOtp(newPhone)}
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
                                    className="rounded-xl h-11 tracking-widest font-mono text-center text-lg font-bold bg-muted/20"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => handleVerifyOtp(newPhone)}
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
                          </div>
                        ) : (
                          /* Success Message Once Verified */
                          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                +91 {newPhone} verified successfully for this order!
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingPhone(false);
                                  setNewPhone("");
                                  setIsNewPhoneVerified(false);
                                }}
                                className="text-xs text-primary underline font-bold"
                              >
                                Revert to Profile Phone
                              </button>
                            </div>
                            <p className="text-[11px] text-emerald-700 leading-tight">
                              This new number is confirmed for courier delivery coordination. Your profile phone remains +91 {profilePhone}.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Case 3: Unauthenticated / Guest User */}
                    {!isLoggedIn && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-3 text-xs font-bold text-muted-foreground select-none">+91</span>
                            <Input
                              type="tel"
                              value={guestPhone}
                              maxLength={10}
                              onChange={(e) => {
                                let raw = e.target.value.replace(/\D/g, "");
                                if (raw.startsWith("0")) raw = raw.slice(1);
                                if (raw.startsWith("91") && raw.length > 10) raw = raw.slice(2);
                                raw = raw.slice(0, 10);
                                setGuestPhone(raw);
                                setIsGuestPhoneVerified(false);
                                setShowOtpBox(false);
                              }}
                              placeholder="98765 43210"
                              className="rounded-xl h-11 pl-11 font-mono font-medium"
                              required
                            />
                          </div>

                          {!isGuestPhoneVerified ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleSendOtp(guestPhone)}
                              disabled={sendingOtp || guestPhone.length < 10}
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

                        {!isGuestPhoneVerified && showOtpBox && (
                          <div className="p-3.5 bg-muted/40 border border-primary/30 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-primary" /> Enter 6-digit WhatsApp Code
                              </span>
                              {countdown > 0 ? (
                                <span className="text-xs text-muted-foreground font-mono">Resend in {countdown}s</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSendOtp(guestPhone)}
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
                                className="rounded-xl h-11 tracking-widest font-mono text-center text-lg font-bold bg-background"
                              />
                              <Button
                                type="button"
                                onClick={() => handleVerifyOtp(guestPhone)}
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Street Address */}
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

                {/* PIN, City, State */}
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

                {/* Landmark */}
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
                  Choose your preferred payment method for Akola local pharmacy dispatch.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: Instant Online Payment */}
                <div 
                  onClick={() => setPaymentMethod("Online")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === "Online" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-border/80"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">UPI, Debit/Credit Card, Net Banking</p>
                      <p className="text-xs text-muted-foreground">Instant verification via Razorpay secure gateway</p>
                    </div>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${paymentMethod === "Online" ? "bg-primary text-white border-primary" : "border-muted-foreground/30"}`}>
                    {paymentMethod === "Online" && "✓"}
                  </span>
                </div>

                {/* Option 2: Pay on Delivery (Cash or UPI) */}
                <div 
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === "COD" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-border/80"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Pay on Delivery (Cash or UPI upon delivery)</p>
                      <p className="text-xs text-muted-foreground">Pay via Cash or UPI QR scan when medicines arrive at your doorstep in Akola</p>
                    </div>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${paymentMethod === "COD" ? "bg-primary text-white border-primary" : "border-muted-foreground/30"}`}>
                    {paymentMethod === "COD" && "✓"}
                  </span>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fulfilled in discreet, sealed packaging by registered pharmacy partner in Akola.</span>
                </div>
              </div>

              {orderError && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="font-medium">{orderError}</p>
                  </div>
                  {paymentMethod === "Online" && (
                    <div className="pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPaymentMethod("COD");
                          setOrderError("");
                        }}
                        className="rounded-full text-xs font-semibold bg-background"
                      >
                        Switch to Pay on Delivery & Continue
                      </Button>
                    </div>
                  )}
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
                  ) : paymentMethod === "Online" ? (
                    <>
                      Pay ₹{totalAmount.toLocaleString()} & Confirm Order
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Confirm Order with Pay on Delivery (₹{totalAmount.toLocaleString()})
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
                Delivered in discreet packaging across Akola. Prescriptions verified by licensed pharmacists before packing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
