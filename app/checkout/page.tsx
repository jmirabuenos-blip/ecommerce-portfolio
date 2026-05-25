// app/checkout/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import OrderSummary from "@/components/OrderSummary";

export const metadata = {
  title: "Checkout — Minimalist",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Checkout
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Logged in as{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {session.user?.email}
            </span>
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>
          <div className="lg:sticky lg:top-24">
            <OrderSummary />
          </div>
        </div>

      </div>
    </main>
  );
}