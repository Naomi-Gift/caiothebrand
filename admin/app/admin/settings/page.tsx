import { getSettings } from "@/lib/api";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

const SETTING_FIELDS = [
  { key: "branch_owerri_address",   label: "Owerri Branch Address",   placeholder: "3 Douglas Road, Owerri" },
  { key: "branch_owerri_hours",     label: "Owerri Opening Hours",    placeholder: "Mon–Sun: 11am – 11pm" },
  { key: "branch_owerri_phone",     label: "Owerri Phone",            placeholder: "+234 800 000 0000" },
  { key: "branch_lagos_address",    label: "Lagos Branch Address",    placeholder: "14 Admiralty Way, Lekki" },
  { key: "branch_lagos_hours",      label: "Lagos Opening Hours",     placeholder: "Mon–Sun: 11am – 11pm" },
  { key: "branch_lagos_phone",      label: "Lagos Phone",             placeholder: "+234 800 000 0001" },
  { key: "delivery_estimate_owerri",label: "Owerri Delivery ETA",     placeholder: "30–45 min" },
  { key: "delivery_estimate_lagos", label: "Lagos Delivery ETA",      placeholder: "30–45 min" },
  { key: "promo_codes",             label: "Active Promo Codes (JSON)",placeholder: '[{"code":"CAIO10","discount":10,"type":"percent"}]' },
];

export default async function SettingsPage() {
  const settings = await getSettings().catch(() => ({} as Record<string, string>));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Branch information and promo codes. Changes go live immediately.</p>
      <div className="mt-6 max-w-2xl">
        <SettingsForm fields={SETTING_FIELDS} initial={settings} />
      </div>
    </div>
  );
}
