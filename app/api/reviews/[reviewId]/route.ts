
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/reviews/[reviewId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await params;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { rating, comment } = body;

  if (rating !== undefined) {
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
  }

  if (comment !== undefined && comment.trim().length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(rating !== undefined && { rating }),
      ...(comment !== undefined && { comment: comment.trim() }),
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/reviews/[reviewId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await params;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = review.userId === session.user.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return NextResponse.json({ success: true });
}