// app/order-confirmation/[orderId]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrderConfirmation from "@/components/OrderConfirmation";

interface Props {
  params: Promise<{ orderId: string }>;
}

export const metadata = {
  title: "Order Confirmed",
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <OrderConfirmation orderId={orderId} />;
}