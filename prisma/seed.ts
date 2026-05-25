// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from your .env file!");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const initialProducts = [
  // ── Bags ──
  {
    name: 'Minimalist Leather Backpack',
    description: 'Crafted from premium full-grain leather, this backpack features a padded 15-inch laptop sleeve, water-resistant lining, and breathable mesh back straps.',
    price: 129.99,
    category: 'Bags',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Canvas Tote Bag',
    description: 'Heavy-duty waxed canvas tote with reinforced leather handles and a zippered inner pocket. Perfect for groceries, books, or everyday carry.',
    price: 44.99,
    category: 'Bags',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Slim Crossbody Bag',
    description: 'Compact yet spacious crossbody bag made from vegan leather. Features an adjustable strap, front zip pocket, and RFID-blocking card slots.',
    price: 59.95,
    category: 'Bags',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80&auto=format&fit=crop'],
  },

  // ── Electronics ──
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in pure sound. Features hybrid active noise cancellation, 40-hour battery life, and plush memory foam earcups for all-day comfort.',
    price: 199.50,
    category: 'Electronics',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Mechanical Ergonomic Keyboard',
    description: 'Anodized aluminum frame with hot-swappable tactile switches, per-key RGB backlighting, and seamless wireless connectivity up to 3 devices.',
    price: 89.99,
    category: 'Electronics',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: '360-degree surround sound with deep bass and crisp highs. IPX7 waterproof, 20-hour playtime, and USB-C fast charging.',
    price: 79.99,
    category: 'Electronics',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Qi-certified 15W fast wireless charger compatible with all Qi-enabled devices. Ultra-thin design with LED indicator and anti-slip surface.',
    price: 29.99,
    category: 'Electronics',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1618577608401-46f4a95e539a?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Smart LED Desk Lamp',
    description: 'Touch-sensitive desk lamp with 5 color temperatures, 10 brightness levels, USB-A charging port, and auto-dimming memory function.',
    price: 49.95,
    category: 'Electronics',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop'],
  },

  // ── Fitness ──
  {
    name: 'Hydro Thermal Flask (32oz)',
    description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps your drinks ice cold for up to 24 hours or piping hot for up to 12 hours.',
    price: 34.95,
    category: 'Fitness',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Resistance Band Set',
    description: 'Set of 5 progressive resistance bands (10–50 lbs) made from natural latex. Includes carry bag, door anchor, and ankle straps for full-body workouts.',
    price: 24.99,
    category: 'Fitness',
    stock: 120,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Extra-thick 6mm non-slip yoga mat with alignment lines, moisture-wicking surface, and carrying strap. Ideal for yoga, pilates, and stretching.',
    price: 39.99,
    category: 'Fitness',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Adjustable Dumbbell (up to 25 lbs)',
    description: 'Space-saving adjustable dumbbell that replaces 9 weights in one. Quick-adjust dial mechanism, durable steel construction, and ergonomic grip.',
    price: 109.00,
    category: 'Fitness',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80&auto=format&fit=crop'],
  },

  // ── Home & Living ──
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Handcrafted ceramic dripper and carafe set for the perfect pour-over brew. Includes reusable stainless steel filter and serving stand.',
    price: 54.99,
    category: 'Home & Living',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Linen Throw Blanket',
    description: 'Soft stonewashed linen throw blanket with a subtle herringbone weave. Lightweight, breathable, and perfect for year-round use.',
    price: 64.00,
    category: 'Home & Living',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1512474932049-78ac69ede12c?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Scented Soy Candle Set',
    description: 'Set of 3 hand-poured soy wax candles in amber glass jars. Scents include cedar & sandalwood, bergamot & mint, and vanilla & tonka bean.',
    price: 42.00,
    category: 'Home & Living',
    stock: 90,
    images: ['https://images.unsplash.com/photo-1603905831106-8ead5588c639?w=600&q=80&auto=format&fit=crop'],
  },

  // ── Stationery ──
  {
    name: 'Hardcover Dot Grid Notebook',
    description: 'A5 hardcover notebook with 200 pages of 100gsm acid-free dot grid paper. Lay-flat binding, ribbon bookmark, and elastic closure.',
    price: 18.99,
    category: 'Stationery',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1517971071642-34a2d3eaac27?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Brass Mechanical Pencil',
    description: 'Weighted solid brass mechanical pencil with knurled grip, 0.5mm lead, and a minimalist matte finish that develops a natural patina over time.',
    price: 32.00,
    category: 'Stationery',
    stock: 65,
    images: ['https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&q=80&auto=format&fit=crop'],
  },

  // ── Apparel ──
  {
    name: 'Merino Wool Crew Neck Sweater',
    description: '100% extra-fine merino wool sweater with a classic crew neck. Temperature-regulating, itch-free, and machine washable. Available in 6 colors.',
    price: 95.00,
    category: 'Apparel',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80&auto=format&fit=crop'],
  },
  {
    name: 'Slim Chino Pants',
    description: 'Tailored slim-fit chinos made from stretch cotton twill. Wrinkle-resistant, moisture-wicking, and transition seamlessly from desk to dinner.',
    price: 72.00,
    category: 'Apparel',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80&auto=format&fit=crop'],
  },
];

async function main() {
  console.log('Cleaning up existing data...');
  // Must delete in dependency order — child tables first
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  console.log(`Seeding ${initialProducts.length} products into the database...`);
  for (const product of initialProducts) {
    await prisma.product.create({
      data: product,
    });
  }
  console.log('Database seeded successfully! 🌱');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });