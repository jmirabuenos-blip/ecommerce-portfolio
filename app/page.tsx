// app/page.tsx
import { prisma } from '../lib/db';
import HomeClient from '../components/HomeClient';

// Revalidate every 60s — no need to skip the cache entirely on a product listing.
// Use revalidate = 0 only on pages with user-specific data (cart, account).
export const revalidate = 60;

async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  });
  return products;
}

export default async function HomePage() {
  const products = await getProducts();
  return <HomeClient products={products} />;
}