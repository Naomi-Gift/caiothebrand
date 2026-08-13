export type BranchId = "owerri" | "lagos";

export interface Branch {
  id: BranchId;
  name: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  mapsQuery: string;
  deliveryEstimate: string;
  lat: number;
  lng: number;
}

export type MenuCategory = "pizzas" | "sides" | "drinks";

export interface SizeOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface AddOnOption {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  slug: string;
  category: MenuCategory;
  name: string;
  descriptor: string;
  description: string;
  basePrice: number;
  sizes: SizeOption[];
  addOns: AddOnOption[];
  spicy: boolean;
  vegetarian: boolean;
  soldOut?: boolean;
  featured?: boolean;
  isNew?: boolean;
}

export interface CartLineAddOn {
  id: string;
  label: string;
  price: number;
}

export interface CartLine {
  lineId: string;
  itemId: string;
  name: string;
  descriptor: string;
  size: SizeOption;
  addOns: CartLineAddOn[];
  quantity: number;
  unitPrice: number;
}

export type FulfillmentMode = "delivery" | "pickup";

export interface SavedAddress {
  id: string;
  label: string;
  line1: string;
  city: string;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  branchId: BranchId;
  fulfillment: FulfillmentMode;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: "received" | "kitchen" | "out-for-delivery" | "delivered";
}
