import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, description, price, images, category, stock } = await req.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(images && { images }),
      ...(category && { category }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}