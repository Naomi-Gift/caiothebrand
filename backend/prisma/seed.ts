/**
 * Seed script — run with:
 *   npx ts-node --project tsconfig.json prisma/seed.ts
 * or add to package.json:
 *   "prisma": { "seed": "ts-node prisma/seed.ts" }
 * then: npx prisma db seed
 */

import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

const pizzaAddOns = [
  { id: "cheese",             label: "Cheese",             price: 3000 },
  { id: "beef",               label: "Beef",               price: 2700 },
  { id: "grilled-chicken",    label: "Grilled Chicken",    price: 1300 },
  { id: "pepperoni",          label: "Pepperoni",          price: 1300 },
  { id: "pepper-chicken",     label: "Pepper Chicken",     price: 1300 },
  { id: "chicken-suya",       label: "Chicken Suya",       price: 1300 },
  { id: "smoked-sausage",     label: "Smoked Sausage",     price: 1300 },
  { id: "mushroom",           label: "Mushroom",           price: 1300 },
  { id: "red-chilli",         label: "Red Chilli",         price: 1300 },
  { id: "green-bell-pepper",  label: "Green Bell Pepper",  price: 1300 },
  { id: "yellow-bell-pepper", label: "Yellow Bell Pepper", price: 1300 },
  { id: "onions",             label: "Onions",             price: 1300 },
  { id: "pineapple",          label: "Pineapple",          price: 1300 },
];

function pizzaSizes(prices: { selfie?: number; medium: number; large: number; extraLarge: number }) {
  const base = prices.selfie ?? prices.medium;
  const sizes = [];
  if (prices.selfie !== undefined) sizes.push({ id: "selfie",      label: "Selfie",      priceDelta: prices.selfie      - base });
  sizes.push({ id: "medium",      label: "Medium",      priceDelta: prices.medium      - base });
  sizes.push({ id: "large",       label: "Large",       priceDelta: prices.large       - base });
  sizes.push({ id: "extra-large", label: "Extra Large", priceDelta: prices.extraLarge  - base });
  return sizes;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ────────────────────────────────────────────────────────────
  const [pizzasCat, sidesCat, drinksCat] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "pizzas" },
      update: { name: "Pizzas", order: 0 },
      create: { name: "Pizzas", slug: "pizzas", order: 0 },
    }),
    prisma.category.upsert({
      where: { slug: "sides" },
      update: { name: "Sides", order: 1 },
      create: { name: "Sides", slug: "sides", order: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "drinks" },
      update: { name: "Drinks", order: 2 },
      create: { name: "Drinks", slug: "drinks", order: 2 },
    }),
  ]);

  // ── Pizzas ────────────────────────────────────────────────────────────────
  const pizzas = [
    {
      slug: "chicken-suya-experience",
      name: "Chicken Suya Experience",
      descriptor: "Tender suya chicken, yaji spice, caramelised onions",
      description: "Marinated suya chicken on a rich tomato base, hit with yaji spice and finished with caramelised onions.",
      basePrice: 13900,
      sizes: pizzaSizes({ medium: 13900, large: 19900, extraLarge: 28500 }),
      spicy: true, vegetarian: false, featured: true,
    },
    {
      slug: "bbq-beef",
      name: "BBQ Beef",
      descriptor: "Slow-cooked beef, smoky BBQ sauce, red onions",
      description: "Slow-cooked beef strips glazed in smoky BBQ sauce, red onions, mozzarella.",
      basePrice: 15400,
      sizes: pizzaSizes({ medium: 15400, large: 21500, extraLarge: 32700 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "bbq-chicken",
      name: "BBQ Chicken",
      descriptor: "Grilled chicken, BBQ sauce, mozzarella",
      description: "Grilled chicken in a sweet BBQ glaze, mozzarella, and a scatter of red onions.",
      basePrice: 9800,
      sizes: pizzaSizes({ selfie: 9800, medium: 12100, large: 17400, extraLarge: 25500 }),
      spicy: false, vegetarian: false, featured: true,
    },
    {
      slug: "pepperoni",
      name: "Pepperoni",
      descriptor: "Classic pepperoni, San Marzano tomato, mozzarella",
      description: "No reinvention — just great pepperoni, San Marzano tomato, and mozzarella.",
      basePrice: 8400,
      sizes: pizzaSizes({ selfie: 8400, medium: 10300, large: 14600, extraLarge: 20800 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "veggie-supreme",
      name: "Veggie Supreme",
      descriptor: "Roasted peppers, mushroom, onions, olives",
      description: "Roasted peppers, mushroom, red onions, green olives, mozzarella.",
      basePrice: 13700,
      sizes: pizzaSizes({ medium: 13700, large: 20500, extraLarge: 29900 }),
      spicy: false, vegetarian: true, featured: true,
    },
    {
      slug: "beef-suya-experience",
      name: "Beef Suya Experience",
      descriptor: "Suya beef, yaji rub, scotch bonnet drizzle",
      description: "Thin-sliced suya beef on a tomato base, yaji rub, scotch bonnet drizzle, pickled onions.",
      basePrice: 17000,
      sizes: pizzaSizes({ medium: 17000, large: 24300, extraLarge: 34900 }),
      spicy: true, vegetarian: false, featured: false,
    },
    {
      slug: "bbq-sausage",
      name: "BBQ Sausage",
      descriptor: "Smoked sausage, BBQ glaze, caramelised onions",
      description: "Sliced smoked sausage, sweet BBQ glaze, caramelised onions, and mozzarella.",
      basePrice: 13100,
      sizes: pizzaSizes({ medium: 13100, large: 19600, extraLarge: 28000 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "margherita",
      name: "Margherita",
      descriptor: "San Marzano tomato, fior di latte, torn basil",
      description: "San Marzano tomato, fior di latte, torn basil. No fusion, no fuss.",
      basePrice: 10900,
      sizes: pizzaSizes({ selfie: 10900, medium: 13900, large: 21100, extraLarge: 30200 }),
      spicy: false, vegetarian: true, featured: true,
    },
    {
      slug: "smoky-bbq-chicken",
      name: "Smoky BBQ Chicken",
      descriptor: "Smoked chicken, BBQ sauce, caramelised onions",
      description: "Slow-smoked chicken strips, smoky BBQ sauce, caramelised onions, mozzarella.",
      basePrice: 15300,
      sizes: pizzaSizes({ medium: 15300, large: 22600, extraLarge: 33200 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "sweet-chicken-bbq",
      name: "Sweet Chicken BBQ",
      descriptor: "Grilled chicken, honey BBQ glaze, pineapple",
      description: "Grilled chicken in a honey BBQ glaze, pineapple, mozzarella.",
      basePrice: 13400,
      sizes: pizzaSizes({ medium: 13400, large: 19500, extraLarge: 28400 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "hot-and-sweet",
      name: "Hot And Sweet",
      descriptor: "Spiced chicken, sweet chilli sauce, jalapeños",
      description: "Spiced chicken, sweet chilli sauce, jalapeños, honey drizzle.",
      basePrice: 17600,
      sizes: pizzaSizes({ medium: 17600, large: 25500, extraLarge: 36500 }),
      spicy: true, vegetarian: false, featured: false,
    },
    {
      slug: "mega-mix",
      name: "Mega Mix",
      descriptor: "Chicken, beef, sausage, pepperoni, full toppings",
      description: "Chicken, beef, sausage, pepperoni, mushroom, peppers, onions, olives.",
      basePrice: 20400,
      sizes: pizzaSizes({ medium: 20400, large: 27000, extraLarge: 35300 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "supreme-chicken",
      name: "Supreme Chicken",
      descriptor: "Seasoned chicken, peppers, mushroom, olives",
      description: "Generously seasoned chicken, mixed peppers, mushroom, olives, mozzarella.",
      basePrice: 13600,
      sizes: pizzaSizes({ medium: 13600, large: 20000, extraLarge: 29400 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "chicken-feast",
      name: "Chicken Feast",
      descriptor: "Double chicken, garlic sauce, spring onions",
      description: "Double chicken on a garlic cream sauce, spring onions, mozzarella.",
      basePrice: 13800,
      sizes: pizzaSizes({ medium: 13800, large: 20200, extraLarge: 29800 }),
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "meatlover",
      name: "Meatlover",
      descriptor: "Beef, chicken, sausage, pepperoni, BBQ base",
      description: "Beef, chicken, sausage, pepperoni on a BBQ tomato base.",
      basePrice: 16900,
      sizes: pizzaSizes({ medium: 16900, large: 25000, extraLarge: 37100 }),
      spicy: false, vegetarian: false, featured: true,
    },
  ];

  for (const p of pizzas) {
    await prisma.menuItem.upsert({
      where: { slug: p.slug },
      update: { ...p, sizes: p.sizes, addOns: pizzaAddOns, categoryId: pizzasCat.id },
      create: { ...p, sizes: p.sizes, addOns: pizzaAddOns, categoryId: pizzasCat.id },
    });
  }

  // ── Sides ─────────────────────────────────────────────────────────────────
  const sides = [
    {
      slug: "chicken-wings",
      name: "Chicken Wings",
      descriptor: "Crispy seasoned wings",
      description: "Crispy seasoned chicken wings.",
      basePrice: 7100,
      sizes: [{ id: "regular", label: "Regular", priceDelta: 0 }],
      spicy: false, vegetarian: false, featured: false,
    },
    {
      slug: "suya-bites",
      name: "Suya Bites",
      descriptor: "Suya-spiced beef bites, yaji rub",
      description: "Bite-sized beef in a proper yaji rub.",
      basePrice: 7100,
      sizes: [{ id: "regular", label: "Regular", priceDelta: 0 }],
      spicy: true, vegetarian: false, featured: false,
    },
    {
      slug: "drum-sticks",
      name: "Drum Sticks",
      descriptor: "Smoked chicken drumsticks",
      description: "Smoked chicken drumsticks, seasoned and slow-cooked.",
      basePrice: 7200,
      sizes: [{ id: "regular", label: "Regular", priceDelta: 0 }],
      spicy: false, vegetarian: false, featured: false,
    },
  ];

  for (const s of sides) {
    await prisma.menuItem.upsert({
      where: { slug: s.slug },
      update: { ...s, addOns: [], categoryId: sidesCat.id },
      create: { ...s, addOns: [], categoryId: sidesCat.id },
    });
  }

  // ── Drinks ────────────────────────────────────────────────────────────────
  const drinks = [
    { slug: "coca-cola-50cl",      name: "Coca-Cola",           descriptor: "50cl, ice cold",          description: "Coca-Cola 50cl.", basePrice: 1100, sizes: [{ id: "50cl",    label: "50cl",    priceDelta: 0 }] },
    { slug: "fanta-60cl",          name: "Fanta",               descriptor: "60cl, ice cold",          description: "Fanta 60cl.",    basePrice: 1100, sizes: [{ id: "60cl",    label: "60cl",    priceDelta: 0 }] },
    { slug: "sprite-60cl",         name: "Sprite",              descriptor: "60cl, ice cold",          description: "Sprite 60cl.",   basePrice: 1100, sizes: [{ id: "60cl",    label: "60cl",    priceDelta: 0 }] },
    { slug: "mojito-schweppes",    name: "Schweppes Mojito",    descriptor: "Mojito flavour, 40cl",    description: "Schweppes Mojito 40cl.",   basePrice: 1100, sizes: [{ id: "40cl", label: "40cl", priceDelta: 0 }] },
    { slug: "chapman-schweppes",   name: "Schweppes Chapman",   descriptor: "Chapman flavour, 40cl",   description: "Schweppes Chapman 40cl.",  basePrice: 1100, sizes: [{ id: "40cl", label: "40cl", priceDelta: 0 }] },
    { slug: "pineapple-schweppes", name: "Schweppes Pineapple", descriptor: "Pineapple flavour, 40cl", description: "Schweppes Pineapple 40cl.", basePrice: 1100, sizes: [{ id: "40cl", label: "40cl", priceDelta: 0 }] },
    { slug: "eva-water",           name: "Eva Water",           descriptor: "Still water, 75cl",       description: "Eva still water 75cl.",    basePrice: 800,  sizes: [{ id: "75cl", label: "75cl", priceDelta: 0 }] },
  ];

  for (const d of drinks) {
    await prisma.menuItem.upsert({
      where: { slug: d.slug },
      update: { ...d, addOns: [], vegetarian: true, spicy: false, featured: false, categoryId: drinksCat.id },
      create: { ...d, addOns: [], vegetarian: true, spicy: false, featured: false, categoryId: drinksCat.id },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
