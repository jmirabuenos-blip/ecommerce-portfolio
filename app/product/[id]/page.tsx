// app/product/[id]/page.tsx

import { prisma } from "../../../lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  const serializedReviews = product.reviews.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    user: {
      id: r.user.id,
      name: r.user.name,
      image: r.user.image,
    },
  }));

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images,
        stock: product.stock,
      }}
      averageRating={averageRating}
      reviews={serializedReviews}
    />
  );
}