// app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AddressData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to place an order." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items, address } = body as {
      items: CartItem[];
      address: AddressData;
      total: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const productIds = items.map((i) => i.id);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, price: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products could not be found." },
        { status: 400 }
      );
    }

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.id);
      if (product && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${product.name}".` },
          { status: 400 }
        );
      }
    }

    const serverTotal = items.reduce((sum: number, item: any) => {
      const product = products.find((p: any) => p.id === item.id);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await prisma.$transaction(async (tx: any) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: serverTotal,
          status: "PENDING",
          paymentStatus: "UNPAID",
          shippingName: address.fullName,
          shippingEmail: address.email,
          shippingAddress: address.address,
          shippingCity: address.city,
          shippingState: address.state,
          shippingZip: address.zip,
          shippingCountry: address.country,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: products.find((p: any) => p.id === item.id)?.price ?? 0,
            })),
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      { orderId: order.id, message: "Order placed successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[CHECKOUT_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}