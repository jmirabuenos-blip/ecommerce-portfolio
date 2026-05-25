
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, rating, comment } = body;

  if (!productId || !rating) {
    return NextResponse.json({ error: "productId and rating are required" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  if (!comment || comment.trim().length === 0) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check for existing review
  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, productId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this product" },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      productId,
      rating,
      comment: comment.trim(),
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return NextResponse.json(review, { status: 201 });
}