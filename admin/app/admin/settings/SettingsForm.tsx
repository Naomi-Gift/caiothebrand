"use client";
import { useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const inp = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

interface Field { key: string; label: string; placeholder: string; }

export default function SettingsForm({ fields, initial }: { fields: Field[]; initial: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.key, initial[f.key] ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    const pairs = Object.entries(values).map(([key, value]) => ({ key, value }));
    const res = await fetch(`${BACKEND}/api/settings`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pairs), credentials: "include",
    });
    if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? "Error saving."); }
    else setSaved(true);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {saved && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Settings saved.</div>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map(f => (
          <div key={f.key} className={`flex flex-col gap-1.5 ${f.key === "promo_codes" ? "sm:col-span-2" : ""}`}>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{f.label}</label>
            {f.key === "promo_codes" ? (
              <textarea
                value={values[f.key] ?? ""}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                rows={4}
                placeholder={f.placeholder}
                className={`${inp} resize-none font-mono text-xs`}
              />
            ) : (
              <input
                value={values[f.key] ?? ""}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={inp}
              />
            )}
          </div>
        ))}
      </div>

      <button type="submit" disabled={saving} className="self-start rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50">
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
