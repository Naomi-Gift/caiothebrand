/** Shared constants for the feedback survey, contact form, API and admin inbox. */

export const HIGHLIGHTS = [
  { id: "flavour", label: "Flavour" },
  { id: "crust", label: "Crust" },
  { id: "portion", label: "Portion size" },
  { id: "value", label: "Value for money" },
  { id: "speed", label: "Speed" },
  { id: "staff", label: "Friendly staff" },
  { id: "packaging", label: "Packaging" },
  { id: "online", label: "Ordering online" },
] as const;

export const CHANNELS = [
  { id: "delivery", label: "Delivery" },
  { id: "pickup", label: "Pickup" },
  { id: "in-store", label: "In store" },
  { id: "browsing", label: "Just browsing" },
] as const;

/** "How did you first hear about us?" — first survey question. */
export const HEARD_FROM = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "google", label: "Google Search / Google Maps" },
  { id: "online-ad", label: "Online Advertisement (Instagram, Facebook or TikTok Ads)" },
  { id: "influencer", label: "Influencer Recommendation" },
  { id: "word-of-mouth", label: "Friends & Family (Word of Mouth)" },
  { id: "walk-in", label: "Walk-in / Passing By" },
  { id: "flyer", label: "Flyer / Poster" },
] as const;

export function heardFromLabel(id: string) {
  return HEARD_FROM.find((h) => h.id === id)?.label ?? id;
}

export const RATING_LABELS = ["Not for me", "It was okay", "Pretty good", "Really good", "Obsessed"];

export const FIELD_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  message: 2000,
  page: 200,
  orderRef: 60,
} as const;

export type FeedbackKindInput = "SURVEY" | "CONTACT";

export function highlightLabel(id: string) {
  return HIGHLIGHTS.find((h) => h.id === id)?.label ?? id;
}

export function channelLabel(id: string) {
  return CHANNELS.find((c) => c.id === id)?.label ?? id;
}
