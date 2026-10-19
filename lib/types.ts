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
  comingSoon?: boolean;
  /** ERPNext outlet (pos_profile) this branch's orders go to. */
  erpPosProfile?: string;
  /** Staff WhatsApp number(s) for automatic new-order alerts. */
  alertWhatsapp?: string;
}

export type MenuCategory = "pizzas" | "sides" | "drinks";

export interface SizeOption {
  id: string;
  label: string;
  priceDelta: number;
  /** ERPNext item_code for this size (set by the ERP menu sync). */
  itemCode?: string;
}

export interface AddOnOption {
  id: string;
  label: string;
  price: number;
  /** ERPNext item_code for this topping (set by the ERP menu sync). */
  itemCode?: string;
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
  available?: boolean;
  /** ERPNext item_code for single-size items (sides, drinks). */
  erpItemCode?: string | null;
  /** Uploaded photo URL (Admin → Menu); falls back to /images/menu/<slug>.jpg. */
  image?: string | null;

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
  deliveryAddress?: string | null;
  status: "received" | "kitchen" | "out-for-delivery" | "delivered";
}
