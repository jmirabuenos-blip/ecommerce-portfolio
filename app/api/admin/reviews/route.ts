
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/reviews
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = productId ? { productId } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        product: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

// DELETE /api/admin/reviews?reviewId=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return NextResponse.json({ success: true });
}