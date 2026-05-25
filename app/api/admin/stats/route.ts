import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orders, users, products] = await Promise.all([
    prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    }),
    prisma.user.count(),
    prisma.product.count(),
  ]);

  const totalRevenue = orders
    .filter((o: any) => o.paymentStatus === "PAID")
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const ordersByStatus = {
    PENDING: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  } as Record<string, number>;

  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
  }

  return NextResponse.json({
    totalRevenue,
    totalOrders: orders.length,
    ordersByStatus,
    totalUsers: users,
    totalProducts: products,
  });
}