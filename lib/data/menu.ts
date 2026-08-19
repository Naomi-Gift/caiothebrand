import type { AddOnOption, MenuItem, SizeOption } from "@/lib/types";

// ─── Size helpers ─────────────────────────────────────────────────────────────

function pizzaSizes(prices: {
  selfie?: number;
  medium: number;
  large: number;
  extraLarge: number;
}): SizeOption[] {
  const base = prices.selfie ?? prices.medium;
  const sizes: SizeOption[] = [];
  if (prices.selfie !== undefined) {
    sizes.push({ id: "selfie", label: "Selfie", priceDelta: prices.selfie - base });
  }
  sizes.push({ id: "medium", label: "Medium", priceDelta: prices.medium - base });
  sizes.push({ id: "large", label: "Large", priceDelta: prices.large - base });
  sizes.push({ id: "extra-large", label: "Extra Large", priceDelta: prices.extraLarge - base });
  return sizes;
}

function pizzaBasePrice(prices: { selfie?: number; medium: number }): number {
  return prices.selfie ?? prices.medium;
}

const singleSize = (label: string): SizeOption[] => [
  { id: "regular", label, priceDelta: 0 },
];

// ─── Extra toppings ───────────────────────────────────────────────────────────

const pizzaAddOns: AddOnOption[] = [
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

// ─── Menu items ───────────────────────────────────────────────────────────────

export const menuItems: MenuItem[] = [

  // ── Pizzas ──────────────────────────────────────────────────────────────────

  {
    id: "chicken-suya-experience",
    slug: "chicken-suya-experience",
    category: "pizzas",
    name: "Chicken Suya Experience",
    descriptor: "Tender suya chicken, yaji spice, caramelised onions",
    description:
      "Marinated suya chicken on a rich tomato base, hit with yaji spice and finished with caramelised onions. The grill flavour carries all the way through.",
    basePrice: pizzaBasePrice({ medium: 13900 }),
    sizes: pizzaSizes({ medium: 13900, large: 19900, extraLarge: 28500 }),
    addOns: pizzaAddOns,
    spicy: true,
    vegetarian: false,
    featured: true,
  },
  {
    id: "bbq-beef",
    slug: "bbq-beef",
    category: "pizzas",
    name: "BBQ Beef",
    descriptor: "Slow-cooked beef, smoky BBQ sauce, red onions",
    description:
      "Slow-cooked beef strips glazed in smoky BBQ sauce, red onions, mozzarella. Rich and unsubtle.",
    basePrice: pizzaBasePrice({ medium: 15400 }),
    sizes: pizzaSizes({ medium: 15400, large: 21500, extraLarge: 32700 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "bbq-chicken",
    slug: "bbq-chicken",
    category: "pizzas",
    name: "BBQ Chicken",
    descriptor: "Grilled chicken, BBQ sauce, mozzarella",
    description:
      "Grilled chicken in a sweet BBQ glaze, mozzarella, and a scatter of red onions. The most popular order we get.",
    basePrice: pizzaBasePrice({ selfie: 9800, medium: 12100 }),
    sizes: pizzaSizes({ selfie: 9800, medium: 12100, large: 17400, extraLarge: 25500 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
    featured: true,
  },
  {
    id: "pepperoni",
    slug: "pepperoni",
    category: "pizzas",
    name: "Pepperoni",
    descriptor: "Classic pepperoni, San Marzano tomato, mozzarella",
    description:
      "No reinvention here — just great pepperoni, San Marzano tomato, and mozzarella. Crisp edges, curled slices.",
    basePrice: pizzaBasePrice({ selfie: 8400, medium: 10300 }),
    sizes: pizzaSizes({ selfie: 8400, medium: 10300, large: 14600, extraLarge: 20800 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "veggie-supreme",
    slug: "veggie-supreme",
    category: "pizzas",
    name: "Veggie Supreme",
    descriptor: "Roasted peppers, mushroom, onions, olives",
    description:
      "Roasted peppers, mushroom, red onions, green olives, mozzarella. Vegetarian and not at all apologetic about it.",
    basePrice: pizzaBasePrice({ medium: 13700 }),
    sizes: pizzaSizes({ medium: 13700, large: 20500, extraLarge: 29900 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: true,
    featured: true,
    imagePosition: "center 70%",
  },
  {
    id: "beef-suya-experience",
    slug: "beef-suya-experience",
    category: "pizzas",
    name: "Beef Suya Experience",
    descriptor: "Suya beef, yaji rub, scotch bonnet drizzle",
    description:
      "Thin-sliced suya beef on a tomato base, yaji rub, scotch bonnet drizzle, pickled onions. Brings the full street-grill experience to the oven.",
    basePrice: pizzaBasePrice({ medium: 17000 }),
    sizes: pizzaSizes({ medium: 17000, large: 24300, extraLarge: 34900 }),
    addOns: pizzaAddOns,
    spicy: true,
    vegetarian: false,
  },
  {
    id: "bbq-sausage",
    slug: "bbq-sausage",
    category: "pizzas",
    name: "BBQ Sausage",
    descriptor: "Smoked sausage, BBQ glaze, caramelised onions",
    description:
      "Sliced smoked sausage, sweet BBQ glaze, caramelised onions, and mozzarella. Straightforward in the best way.",
    basePrice: pizzaBasePrice({ medium: 13100 }),
    sizes: pizzaSizes({ medium: 13100, large: 19600, extraLarge: 28000 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "margherita",
    slug: "margherita",
    category: "pizzas",
    name: "Margherita",
    descriptor: "San Marzano tomato, fior di latte, torn basil",
    description:
      "San Marzano tomato, fior di latte, torn basil. No fusion, no fuss. The one you order when you want to know if a place is actually good.",
    basePrice: pizzaBasePrice({ selfie: 10900, medium: 13900 }),
    sizes: pizzaSizes({ selfie: 10900, medium: 13900, large: 21100, extraLarge: 30200 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: true,
    featured: true,
    imagePosition: "center 70%",
  },
  {
    id: "smoky-bbq-chicken",
    slug: "smoky-bbq-chicken",
    category: "pizzas",
    name: "Smoky BBQ Chicken",
    descriptor: "Smoked chicken, BBQ sauce, caramelised onions",
    description:
      "Slow-smoked chicken strips, smoky BBQ sauce, caramelised onions, mozzarella. The smoke is not a trick — it's in the chicken.",
    basePrice: pizzaBasePrice({ medium: 15300 }),
    sizes: pizzaSizes({ medium: 15300, large: 22600, extraLarge: 33200 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "sweet-chicken-bbq",
    slug: "sweet-chicken-bbq",
    category: "pizzas",
    name: "Sweet Chicken BBQ",
    descriptor: "Grilled chicken, honey BBQ glaze, pineapple",
    description:
      "Grilled chicken in a honey BBQ glaze, pineapple, mozzarella. Sweet, a little tangy, no regrets.",
    basePrice: pizzaBasePrice({ medium: 13400 }),
    sizes: pizzaSizes({ medium: 13400, large: 19500, extraLarge: 28400 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "hot-and-sweet",
    slug: "hot-and-sweet",
    category: "pizzas",
    name: "Hot And Sweet",
    descriptor: "Spiced chicken, sweet chilli sauce, jalapeños",
    description:
      "Spiced chicken, sweet chilli sauce, jalapeños, honey drizzle. The contrast is the point — heat first, then sweet.",
    basePrice: pizzaBasePrice({ medium: 17600 }),
    sizes: pizzaSizes({ medium: 17600, large: 25500, extraLarge: 36500 }),
    addOns: pizzaAddOns,
    spicy: true,
    vegetarian: false,
  },
  {
    id: "mega-mix",
    slug: "mega-mix",
    category: "pizzas",
    name: "Mega Mix",
    descriptor: "Chicken, beef, sausage, pepperoni, full toppings",
    description:
      "Chicken, beef, sausage, pepperoni, mushroom, peppers, onions, olives. Everything on one base. For when you can't decide and don't want to.",
    basePrice: pizzaBasePrice({ medium: 20400 }),
    sizes: pizzaSizes({ medium: 20400, large: 27000, extraLarge: 35300 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "supreme-chicken",
    slug: "supreme-chicken",
    category: "pizzas",
    name: "Supreme Chicken",
    descriptor: "Seasoned chicken, peppers, mushroom, olives",
    description:
      "Generously seasoned chicken, mixed peppers, mushroom, olives, mozzarella. A full-flavour bird pizza.",
    basePrice: pizzaBasePrice({ medium: 13600 }),
    sizes: pizzaSizes({ medium: 13600, large: 20000, extraLarge: 29400 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "chicken-feast",
    slug: "chicken-feast",
    category: "pizzas",
    name: "Chicken Feast",
    descriptor: "Double chicken, garlic sauce, spring onions",
    description:
      "Double chicken — grilled and spiced — on a garlic cream sauce, spring onions, mozzarella. No tomato base, all white.",
    basePrice: pizzaBasePrice({ medium: 13800 }),
    sizes: pizzaSizes({ medium: 13800, large: 20200, extraLarge: 29800 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
  },
  {
    id: "meatlover",
    slug: "meatlover",
    category: "pizzas",
    name: "Meatlover",
    descriptor: "Beef, chicken, sausage, pepperoni, BBQ base",
    description:
      "Beef, chicken, sausage, pepperoni on a BBQ tomato base. A lot of meat. Deliberately so.",
    basePrice: pizzaBasePrice({ medium: 16900 }),
    sizes: pizzaSizes({ medium: 16900, large: 25000, extraLarge: 37100 }),
    addOns: pizzaAddOns,
    spicy: false,
    vegetarian: false,
    featured: true,
    imagePosition: "center 70%",
  },

  // ── Sides ────────────────────────────────────────────────────────────────────

  {
    id: "chicken-wings",
    slug: "chicken-wings",
    category: "sides",
    name: "Chicken Wings",
    descriptor: "Crispy seasoned wings",
    description: "Crispy seasoned chicken wings. Good on their own, better alongside a pizza.",
    basePrice: 7100,
    sizes: singleSize("Regular"),
    addOns: [],
    spicy: false,
    vegetarian: false,
  },
  {
    id: "suya-bites",
    slug: "suya-bites",
    category: "sides",
    name: "Suya Bites",
    descriptor: "Suya-spiced beef bites, yaji rub",
    description: "Bite-sized beef in a proper yaji rub. Suya off the skewer, straight to the table.",
    basePrice: 7100,
    sizes: singleSize("Regular"),
    addOns: [],
    spicy: true,
    vegetarian: false,
  },
  {
    id: "drum-sticks",
    slug: "drum-sticks",
    category: "sides",
    name: "Drum Sticks",
    descriptor: "Smoked chicken drumsticks",
    description: "Smoked chicken drumsticks, seasoned and slow-cooked. The kind you eat standing up.",
    basePrice: 7200,
    sizes: singleSize("Regular"),
    addOns: [],
    spicy: false,
    vegetarian: false,
  },

  // ── Drinks ───────────────────────────────────────────────────────────────────

  {
    id: "coca-cola-50cl",
    slug: "coca-cola-50cl",
    category: "drinks",
    name: "Coca-Cola",
    descriptor: "50cl, ice cold",
    description: "Coca-Cola 50cl. Cold.",
    basePrice: 1100,
    sizes: singleSize("50cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
  {
    id: "fanta-60cl",
    slug: "fanta-60cl",
    category: "drinks",
    name: "Fanta",
    descriptor: "60cl, ice cold",
    description: "Fanta 60cl. Cold.",
    basePrice: 1100,
    sizes: singleSize("60cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
  {
    id: "sprite-60cl",
    slug: "sprite-60cl",
    category: "drinks",
    name: "Sprite",
    descriptor: "60cl, ice cold",
    description: "Sprite 60cl. Cold.",
    basePrice: 1100,
    sizes: singleSize("60cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
  {
    id: "mojito-schweppes",
    slug: "mojito-schweppes",
    category: "drinks",
    name: "Schweppes Mojito",
    descriptor: "Mojito flavour, 40cl",
    description: "Schweppes Mojito 40cl.",
    basePrice: 1100,
    sizes: singleSize("40cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
  {
    id: "chapman-schweppes",
    slug: "chapman-schweppes",
    category: "drinks",
    name: "Schweppes Chapman",
    descriptor: "Chapman flavour, 40cl",
    description: "Schweppes Chapman 40cl.",
    basePrice: 1100,
    sizes: singleSize("40cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
  {
    id: "pineapple-schweppes",
    slug: "pineapple-schweppes",
    category: "drinks",
    name: "Schweppes Pineapple",
    descriptor: "Pineapple flavour, 40cl",
    description: "Schweppes Pineapple 40cl.",
    basePrice: 1100,
    sizes: singleSize("40cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
  {
    id: "eva-water",
    slug: "eva-water",
    category: "drinks",
    name: "Eva Water",
    descriptor: "Still water, 75cl",
    description: "Eva still water 75cl.",
    basePrice: 800,
    sizes: singleSize("75cl"),
    addOns: [],
    spicy: false,
    vegetarian: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const categoryLabels: Record<MenuItem["category"], string> = {
  pizzas: "Pizzas",
  sides: "Sides",
  drinks: "Drinks",
};

export const categoryOrder: MenuItem["category"][] = [
  "pizzas",
  "sides",
  "drinks",
];

export function getMenuItemBySlug(slug: string): MenuItem | undefined {
  return menuItems.find((item) => item.slug === slug);
}

export function getFeaturedItems(): MenuItem[] {
  return menuItems.filter((item) => item.featured && !item.soldOut);
}
