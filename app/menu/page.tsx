import { fetchMenuItems } from "@/lib/fetchMenu";
import MenuPageClient from "./MenuPageClient";

export const revalidate = 60;

export default async function MenuPage() {
  const items = await fetchMenuItems();
  return <MenuPageClient items={items} />;
}
