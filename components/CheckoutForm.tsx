"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import StripeProvider from "@/components/StripeProvider";
import PaymentForm from "@/components/PaymentForm";

type Step = "address" | "payment" | "confirm";

interface AddressData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const STEPS: Step[] = ["address", "payment", "confirm"];

const stepLabel: Record<Step, string> = {
  address: "Shipping",
  payment: "Payment",
  confirm: "Review",
};

const ADDRESS_FIELDS: {
  label: string;
  name: keyof AddressData;
  type: string;
  colSpan?: boolean;
}[] = [
  { label: "Full Name",           name: "fullName", type: "text",  colSpan: true },
  { label: "Email",               name: "email",    type: "email", colSpan: true },
  { label: "Street Address",      name: "address",  type: "text",  colSpan: true },
  { label: "City",                name: "city",     type: "text"  },
  { label: "State / Province",    name: "state",    type: "text"  },
  { label: "ZIP / Postal Code",   name: "zip",      type: "text"  },
  { label: "Country",             name: "country",  type: "text"  },
];

export default function CheckoutForm() {
  const { cart, cartTotal } = useCart();

  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const [address, setAddress] = useState<AddressData>({
    fullName: "",
    email:    "",
    address:  "",
    city:     "",
    state:    "",
    zip:      "",
    country:  "",
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId,      setOrderId]      = useState<string | null>(null);

  const shipping = cartTotal > 0 ? 9.99 : 0;
  const total    = cartTotal + shipping;
  const stepIdx  = STEPS.indexOf(currentStep);

  function prevStep() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateAddress() {
    return Object.values(address).every((v) => v.trim() !== "");
  }

  async function handleContinueToPayment() {
    if (!validateAddress()) {
      setError("Please fill in all address fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity:  item.quantity,
            price:     item.price,
          })),
          totalAmount:     total,
          shippingName:    address.fullName,
          shippingEmail:   address.email,
          shippingAddress: address.address,
          shippingCity:    address.city,
          shippingState:   address.state,
          shippingZip:     address.zip,
          shippingCountry: address.country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initialize payment.");
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setCurrentStep("payment");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, idx) => {
          const isDone   = idx < stepIdx;
          const isActive = idx === stepIdx;
          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                  ${isActive
                    ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100 text-white dark:text-gray-900"
                    : isDone
                    ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600"
                  }
                `}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : idx + 1}
                </div>
                <span className={`
                  text-xs mt-1 font-medium
                  ${isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"}
                `}>
                  {stepLabel[step]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`
                  flex-1 h-px mx-2 mb-4 transition-all
                  ${idx < stepIdx
                    ? "bg-gray-400 dark:bg-gray-500"
                    : "bg-gray-200 dark:bg-gray-700"
                  }
                `} />
              )}
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {stepLabel[currentStep] === "Shipping" ? "Shipping Address"
          : stepLabel[currentStep] === "Payment" ? "Payment Details"
          : "Review & Pay"}
      </h2>

      {/* ── Address step ── */}
      {currentStep === "address" && (
        <div className="space-y-4">
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADDRESS_FIELDS.map(({ label, name, type, colSpan }) => (
              <div key={name} className={colSpan ? "sm:col-span-2" : ""}>
                <label
                  htmlFor={name}
                  className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5"
                >
                  {label}
                </label>
                <input
                  id={name}
                  type={type}
                  name={name}
                  value={address[name]}
                  onChange={handleAddressChange}
                  placeholder={label}
                  className="
                    w-full border border-gray-200 dark:border-gray-700
                    rounded-xl px-4 py-2.5 text-sm
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    placeholder:text-gray-300 dark:placeholder:text-gray-600
                    focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100
                    transition-colors
                  "
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleContinueToPayment}
            disabled={loading}
            className="
              w-full mt-2 flex items-center justify-center gap-2
              bg-gray-900 dark:bg-gray-100
              text-white dark:text-gray-900
              font-semibold py-3 rounded-xl
              hover:opacity-85 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Initializing Payment…
              </>
            ) : (
              <>
                Continue to Payment
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Payment step ── */}
      {currentStep === "payment" && clientSecret && orderId && (
        <div className="space-y-4">

          {/* Mini order summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-1.5">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="tabular-nums">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Shipping</span>
              <span className="tabular-nums">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span className="tabular-nums">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping address recap */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-0.5">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Shipping to</p>
            <p className="text-gray-600 dark:text-gray-400">{address.fullName}</p>
            <p className="text-gray-600 dark:text-gray-400">{address.email}</p>
            <p className="text-gray-600 dark:text-gray-400">{address.address}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {address.city}, {address.state} {address.zip}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{address.country}</p>
          </div>

          <StripeProvider clientSecret={clientSecret}>
            <PaymentForm orderId={orderId} totalAmount={total} />
          </StripeProvider>

          <button
            onClick={prevStep}
            className="
              w-full flex items-center justify-center gap-2
              border border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300
              font-semibold py-3 rounded-xl
              hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Address
          </button>
        </div>
      )}

      {/* ── Confirm step ── */}
      {currentStep === "confirm" && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
          Redirecting to payment confirmation…
        </div>
      )}
    </div>
  );
}