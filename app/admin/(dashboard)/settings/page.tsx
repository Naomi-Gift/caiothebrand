import { getSettings } from "@/lib/api";
import { requireAdminPage } from "@/lib/adminAuth";
import { getBranches, BRANCH_IDS } from "@/lib/branchSettings";
import SettingsForm, { type SettingsSection } from "./SettingsForm";
import TestEmailButton from "./TestEmailButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminPage({ fullAdmin: true });
  const [settings, branches] = await Promise.all([
    getSettings().catch(() => ({}) as Record<string, string>),
    getBranches(),
  ]);

  // Show what's live now: saved setting, else the built-in default.
  const initial: Record<string, string> = { ...settings };
  const sections: SettingsSection[] = BRANCH_IDS.map((id) => {
    const b = branches[id];
    const fill = (key: string, value: string | undefined) => {
      if (!initial[key]) initial[key] = value ?? "";
    };
    fill(`branch_${id}_status`, b.comingSoon ? "coming_soon" : "open");
    fill(`branch_${id}_address`, b.address);
    fill(`branch_${id}_hours`, b.hours);
    fill(`branch_${id}_phone`, b.phone);
    fill(`branch_${id}_whatsapp`, b.whatsapp);
    fill(`delivery_estimate_${id}`, b.deliveryEstimate);
    fill(`erp_pos_profile_${id}`, b.erpPosProfile);
    fill(`branch_${id}_alert_to`, b.alertWhatsapp);
    return {
      title: `${b.name} branch`,
      description: b.comingSoon
        ? "Coming soon: customers can see it but can't order from it."
        : "Open: customers can order for delivery or pickup.",
      fields: [
        {
          key: `branch_${id}_status`,
          label: "Status",
          type: "select",
          options: [
            { value: "open", label: "Open — taking orders" },
            { value: "coming_soon", label: "Coming soon — no orders yet" },
          ],
        },
        { key: `delivery_estimate_${id}`, label: "Delivery time", placeholder: "30–45 min" },
        { key: `branch_${id}_address`, label: "Address", placeholder: "Street, area, city", wide: true },
        { key: `branch_${id}_hours`, label: "Opening hours", placeholder: "10am – 10pm" },
        { key: `branch_${id}_phone`, label: "Phone (for customers)", placeholder: "0813 755 0148" },
        { key: `branch_${id}_whatsapp`, label: "WhatsApp (for customers)", placeholder: "0813 755 0148" },
        {
          key: `branch_${id}_alert_to`,
          label: "Order alert WhatsApp (staff)",
          placeholder: "e.g. 08031234567, 08098765432",
          help: "Gets an automatic message for each new order (once WhatsApp Business is connected).",
        },
        {
          key: `erp_pos_profile_${id}`,
          label: "ERPNext outlet (POS profile)",
          placeholder: id === "lagos" ? "POS-CAIO" : "Ask Cudrock Group, e.g. POS-CAIO-OWERRI",
          help: "Orders for this branch go to this outlet's kitchen screen. Leave empty if it has none yet.",
        },
      ],
    };
  });

  sections.push({
    title: "Promo codes",
    description: 'One entry per code, e.g. [{"code":"CAIO10","discount":10,"type":"percent"}] — discount is a percentage.',
    fields: [{ key: "promo_codes", label: "Active promo codes (JSON)", type: "textarea", placeholder: '[{"code":"CAIO10","discount":10,"type":"percent"}]', wide: true }],
  });

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-brown-darkest">Settings</h1>
      <p className="mt-1 text-sm text-brown-light">Branches and promo codes. Changes show on the website within a few seconds.</p>
      <div className="mt-6 max-w-3xl">
        <SettingsForm sections={sections} initial={initial} />
        <div className="mt-6">
          <TestEmailButton />
        </div>
      </div>
    </div>
  );
}
