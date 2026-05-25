// app/orders/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrderHistory from "@/components/OrdersHistory";

export const metadata = {
  title: "My Orders",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <OrderHistory />;
}