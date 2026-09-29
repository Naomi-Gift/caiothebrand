import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/adminAuth";
import { branches } from "@/lib/data/branches";
import { HIGHLIGHTS, channelLabel, highlightLabel } from "@/lib/feedback";
import type { BranchId } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "All" },
  { key: "survey", label: "Surveys" },
  { key: "contact", label: "Messages" },
] as const;

async function loadFeedback() {
  try {
    const rows = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    return { rows, error: false };
  } catch (err) {
    console.error("[admin/feedback] load failed", err);
    return { rows: [], error: true };
  }
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requireAdminPage();
  const { kind } = await searchParams;
  const filter = kind === "survey" || kind === "contact" ? kind : "";

  const { rows, error } = await loadFeedback();

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Couldn&apos;t load feedback. If this is a fresh deploy, the table may not exist yet — run{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">npx prisma db push</code> against the database.
        </div>
      </div>
    );
  }

  const surveys = rows.filter((r) => r.kind === "SURVEY");
  const contacts = rows.filter((r) => r.kind === "CONTACT");
  const rated = surveys.filter((r) => r.rating !== null);
  const avgRating = rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : null;
  const answered = surveys.filter((r) => r.recommend !== null);
  const promoters = answered.filter((r) => (r.recommend ?? 0) >= 9).length;
  const detractors = answered.filter((r) => (r.recommend ?? 0) <= 6).length;
  const nps = answered.length ? Math.round(((promoters - detractors) / answered.length) * 100) : null;

  const highlightCounts = HIGHLIGHTS.map((h) => ({
    ...h,
    count: surveys.filter((r) => r.highlights.includes(h.id)).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...highlightCounts.map((h) => h.count));

  const list =
    filter === "survey" ? surveys : filter === "contact" ? contacts : rows;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
      <p className="mt-1 text-sm text-gray-500">Survey responses and contact messages, newest first.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Survey responses", value: surveys.length, color: "text-amber-700" },
          { label: "Average rating", value: avgRating === null ? "—" : `${avgRating.toFixed(1)} / 5`, color: "text-green-700" },
          { label: "NPS", value: nps === null ? "—" : nps, color: "text-blue-700" },
          { label: "Contact messages", value: contacts.length, color: "text-gray-700" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className={`mt-1 text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">What stood out</h2>
        <div className="flex flex-col gap-3">
          {highlightCounts.map((h) => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="w-36 truncate text-right text-xs text-gray-600">{h.label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-3 rounded-full bg-amber-500" style={{ width: `${(h.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-8 text-xs text-gray-500">{h.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/feedback?kind=${f.key}` : "/admin/feedback"}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.key ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {list.length === 0 && (
          <li className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">Nothing here yet.</li>
        )}
        {list.map((r) => {
          const branch = r.branchId ? branches[r.branchId as BranchId] : undefined;
          return (
            <li key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-semibold ${
                    r.kind === "SURVEY" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {r.kind === "SURVEY" ? "Survey" : "Message"}
                </span>
                {branch && <span>{branch.name}</span>}
                {r.channel && <span>· {channelLabel(r.channel)}</span>}
                <span>· {r.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>

              {r.kind === "SURVEY" && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700">
                  {r.rating !== null && (
                    <span className="tracking-widest text-amber-600" aria-label={`${r.rating} of 5`}>
                      {"●".repeat(r.rating)}
                      <span className="text-gray-300">{"○".repeat(5 - r.rating)}</span>
                    </span>
                  )}
                  {r.recommend !== null && <span>Recommend: {r.recommend}/10</span>}
                  {r.highlights.length > 0 && (
                    <span className="text-gray-500">{r.highlights.map(highlightLabel).join(" · ")}</span>
                  )}
                </div>
              )}

              {r.message && <p className="mt-3 whitespace-pre-line text-sm text-gray-900">{r.message}</p>}

              {(r.name || r.email || r.phone || r.orderRef) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {r.name && <span className="font-semibold text-gray-700">{r.name}</span>}
                  {r.email && <a href={`mailto:${r.email}`} className="underline">{r.email}</a>}
                  {r.phone && <a href={`tel:${r.phone}`} className="underline">{r.phone}</a>}
                  {r.orderRef && (
                    <Link href={`/track/${encodeURIComponent(r.orderRef)}`} className="underline">
                      Order {r.orderRef}
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
