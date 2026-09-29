"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBranch } from "@/context/BranchContext";
import { branches, branchList } from "@/lib/data/branches";
import { CHANNELS, FIELD_LIMITS, HIGHLIGHTS, RATING_LABELS } from "@/lib/feedback";
import type { BranchId } from "@/lib/types";

const HASH = "#feedback";
const STEPS = 4;

const MARK = { src: "/images/logo-mark-primary.png", width: 1082, height: 1106 };
const MARK_REVERSED = { src: "/images/logo-mark-reversed.png", width: 1082, height: 1106 };

const INPUT =
  "w-full rounded-2xl border border-bone-dark bg-cream px-4 py-3 text-[0.95rem] text-brown-darkest placeholder:text-brown-light focus:border-brown focus:outline-none";
const LABEL = "mb-2 block font-heading text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brown";

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[0.85rem] transition-colors ${
        active
          ? "border-brown bg-brown text-cream"
          : "border-bone-dark bg-crisp text-brown hover:border-brown"
      }`}
    >
      {children}
    </button>
  );
}

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Deep link: any URL ending in #feedback opens the survey. The hash is left in
  // place while open (hydration can remount us) and removed on close.
  useEffect(() => {
    const check = () => {
      if (window.location.hash === HASH) setOpen(true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    if (window.location.hash === HASH) {
      history.replaceState(history.state, "", window.location.pathname + window.location.search);
    }
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label-uppercase fixed right-2 top-1/2 z-40 flex -translate-y-1/2 items-center gap-2 rounded-full bg-brown px-4 py-2.5 text-[0.68rem] tracking-[0.15em] text-cream shadow-brown ring-1 ring-cream/40 transition-colors hover:bg-brown-deep sm:right-4"
        aria-haspopup="dialog"
      >
        <ChatIcon />
        Feedback
      </button>
      {open && <FeedbackDialog onClose={close} />}
    </>
  );
}

function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const { branchId: currentBranch } = useBranch();
  const panelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [rating, setRating] = useState<number | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<BranchId | null>(currentBranch);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [recommend, setRecommend] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Esc closes, body scroll locked, focus moves in and back out.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const toggleHighlight = (id: string) =>
    setHighlights((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  async function submit() {
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "SURVEY",
          rating,
          recommend,
          channel,
          branchId,
          highlights,
          message,
          name,
          email,
          website,
          page: window.location.pathname,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong — please try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  const next = () => {
    if (step < STEPS) setStep(step + 1);
    else void submit();
  };

  const branchName = branchId ? `Caio ${branches[branchId].name}` : "Caio Pizza";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brown-darkest/50 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-crisp shadow-soft-lg focus:outline-none sm:max-w-lg sm:rounded-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-crisp px-5 pb-4 pt-5 sm:px-7">
          <div className="flex items-start gap-3">
            <Image src={MARK.src} width={MARK.width} height={MARK.height} alt="" className="h-9 w-9 object-contain" />
            <div className="flex-1">
              <p className="font-heading text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brown-light">
                {done ? "Quick survey · done" : `Quick survey · ${step} of ${STEPS}`}
              </p>
              <h2 id={titleId} className="font-display text-2xl font-bold leading-tight text-brown-darkest">
                How was your <em className="not-italic text-brown-light">Caio?</em>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close feedback"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-brown transition-colors hover:bg-bone"
            >
              ×
            </button>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bone">
            <div
              className="h-full rounded-full bg-brown transition-[width] duration-300"
              style={{ width: `${((done ? STEPS : step) / STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-7">
          {done ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brown">
                <Image src={MARK_REVERSED.src} width={MARK.width} height={MARK.height} alt="" className="h-11 w-11 object-contain" />
              </span>
              <p className="mt-5 font-display text-3xl font-bold text-brown-darkest">Slice received.</p>
              <p className="mt-2 max-w-xs text-[0.95rem] text-brown-muted">
                We read every note — it goes straight to the team at {branchName}.
              </p>
              <Link
                href="/#menu"
                onClick={onClose}
                className="label-uppercase mt-6 rounded-full bg-brown px-7 py-3 text-xs text-cream transition-colors hover:bg-brown-deep"
              >
                Back to the menu
              </Link>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <p id={`${titleId}-rate`} className="text-[1.05rem] text-brown-darkest">
                    How many slices would you give us?
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${titleId}-rate`}
                    className="mt-4 flex justify-between gap-2 sm:justify-start"
                  >
                    {[1, 2, 3, 4, 5].map((n) => {
                      const lit = rating !== null && n <= rating;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={rating === n}
                          aria-label={`${n} of 5 — ${RATING_LABELS[n - 1]}`}
                          onClick={() => setRating(n)}
                          className={`flex h-16 w-14 items-center justify-center rounded-xl border-2 transition-all sm:h-20 sm:w-16 ${
                            lit ? "border-brown bg-bone" : "border-bone-dark/60 bg-crisp opacity-30 hover:opacity-60"
                          }`}
                        >
                          <Image src={MARK.src} width={MARK.width} height={MARK.height} alt="" className="h-10 w-10 object-contain" />
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 h-6 font-display text-lg text-brown" aria-live="polite">
                    {rating ? RATING_LABELS[rating - 1] : ""}
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <p className={LABEL}>How did you get it?</p>
                    <div className="flex flex-wrap gap-2">
                      {CHANNELS.map((c) => (
                        <Chip key={c.id} active={channel === c.id} onClick={() => setChannel(channel === c.id ? null : c.id)}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={LABEL}>Which branch?</p>
                    <div className="flex flex-wrap gap-2">
                      {branchList.map((b) => (
                        <Chip key={b.id} active={branchId === b.id} onClick={() => setBranchId(branchId === b.id ? null : b.id)}>
                          {b.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={LABEL}>What stood out?</p>
                    <div className="flex flex-wrap gap-2">
                      {HIGHLIGHTS.map((h) => (
                        <Chip key={h.id} active={highlights.includes(h.id)} onClick={() => toggleHighlight(h.id)}>
                          {h.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p id={`${titleId}-nps`} className="text-[1.05rem] text-brown-darkest">
                    How likely are you to recommend Caio Pizza to a friend?
                  </p>
                  <div role="radiogroup" aria-labelledby={`${titleId}-nps`} className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-11">
                    {Array.from({ length: 11 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={recommend === n}
                        onClick={() => setRecommend(recommend === n ? null : n)}
                        className={`h-11 rounded-lg border font-heading text-sm font-bold transition-colors ${
                          recommend === n
                            ? "border-brown bg-brown text-cream"
                            : "border-bone-dark bg-crisp text-brown hover:border-brown"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[0.8rem] text-brown-light">
                    <span>Not likely</span>
                    <span>Extremely likely</span>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor={`${titleId}-msg`} className={LABEL}>Anything else?</label>
                    <textarea
                      id={`${titleId}-msg`}
                      rows={4}
                      maxLength={FIELD_LIMITS.message}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you loved, or what we could do better."
                      className={INPUT}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`${titleId}-name`} className={LABEL}>Name</label>
                      <input id={`${titleId}-name`} value={name} maxLength={FIELD_LIMITS.name} onChange={(e) => setName(e.target.value)} placeholder="Optional" className={INPUT} autoComplete="name" />
                    </div>
                    <div>
                      <label htmlFor={`${titleId}-email`} className={LABEL}>Email</label>
                      <input id={`${titleId}-email`} type="email" value={email} maxLength={FIELD_LIMITS.email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" className={INPUT} autoComplete="email" />
                    </div>
                  </div>
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor={`${titleId}-web`}>Website</label>
                    <input id={`${titleId}-web`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[0.9rem] text-red-800">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="label-uppercase rounded-full border border-brown px-5 py-2.5 text-[0.7rem] text-brown transition-colors hover:bg-bone"
                  >
                    Back
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {(step === 2 || step === 3) && (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="label-uppercase px-3 py-2.5 text-[0.7rem] text-brown-light transition-colors hover:text-brown"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    disabled={(step === 1 && rating === null) || sending}
                    className="label-uppercase rounded-full bg-brown px-6 py-2.5 text-[0.7rem] text-cream transition-colors hover:bg-brown-deep disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {step < STEPS ? "Next" : sending ? "Sending…" : "Send feedback"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
