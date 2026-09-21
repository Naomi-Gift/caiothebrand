import { redirect } from "next/navigation";

// Menu is now the homepage — redirect any direct /menu visits to /
export default function MenuPage() {
  redirect("/");
}
