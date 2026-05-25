import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });

  const productsWithRatings = products.map((product: any) => {
    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount > 0
        ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
        : null;

    const { reviews, ...rest } = product;
    return { ...rest, averageRating, reviewCount };
  });

  return NextResponse.json(productsWithRatings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, price, images, category, stock } = await req.json();

  if (!name || !description || !price || !category) {
    return NextResponse.json(
      { error: "Name, description, price and category are required." },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      images: images ?? [],
      category,
      stock: parseInt(stock ?? "0"),
    },
  });

  return NextResponse.json(product, { status: 201 });
}