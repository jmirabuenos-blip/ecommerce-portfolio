import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      items,
      totalAmount,
      shippingName,
      shippingEmail,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    // Create order in DB with PENDING status and UNPAID payment status
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: "PENDING",
        paymentStatus: "UNPAID",
        shippingName,
        shippingEmail,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        items: {
          create: items.map((item: {
            productId: string;
            quantity: number;
            price: number;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // convert to cents
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    });

    // Save stripeId to order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}