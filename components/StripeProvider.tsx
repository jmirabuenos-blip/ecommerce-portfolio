"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { ReactNode } from "react";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export default function StripeProvider({
  clientSecret,
  children,
}: StripeProviderProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#4f46e5",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}