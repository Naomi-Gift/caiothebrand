"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inp = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

export interface SettingsField {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "select" | "textarea";
  options?: { value: string; label: string }[];
  help?: string;
  wide?: boolean;
}

export interface SettingsSection {
  title: string;
  description?: string;
  fields: SettingsField[];
}

export default function SettingsForm({ sections, initial }: { sections: SettingsSection[]; initial: Record<string, string> }) {
  const router = useRouter();
  const all = sections.flatMap((s) => s.fields);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(all.map((f) => [f.key, initial[f.key] ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (values.promo_codes?.trim()) {
      try {
        JSON.parse(values.promo_codes);
      } catch {
        return setError("Promo codes aren't valid JSON — check the brackets and quotes.");
      }
    }
    setSaving(true); setError(""); setSaved(false);
    const pairs = Object.entries(values).map(([key, value]) => ({ key, value }));
    const res = await fetch("/api/settings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pairs),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})) as { error?: string }; setError(d.error ?? "Error saving."); }
    else { setSaved(true); router.refresh(); }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {sections.map((section) => (
        <fieldset key={section.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <legend className="sr-only">{section.title}</legend>
          <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
          {section.description && <p className="mt-1 text-sm text-gray-500">{section.description}</p>}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.key} className={`flex flex-col gap-1.5 ${f.wide ? "sm:col-span-2" : ""}`}>
                <label htmlFor={f.key} className="text-xs font-semibold uppercase tracking-wide text-gray-500">{f.label}</label>
                {f.type === "select" ? (
                  <select id={f.key} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={inp}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea id={f.key} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} rows={4}
                    placeholder={f.placeholder} className={`${inp} resize-none font-mono text-xs`} />
                ) : (
                  <input id={f.key} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder} className={inp} />
                )}
                {f.help && <p className="text-xs text-gray-400">{f.help}</p>}
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-4 flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-800 disabled:opacity-50">
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">Saved — live on the website.</span>}
        {error && <span className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</span>}
      </div>
    </form>
  );
}
