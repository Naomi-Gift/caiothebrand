"use client";

import { useRef, useState } from "react";

const MAX_SIDE = 1200;

/** Resize to ≤1200px and re-encode (WebP, JPEG fallback) so uploads stay small. */
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const encode = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  const blob = (await encode("image/webp", 0.82)) ?? (await encode("image/jpeg", 0.85));
  if (!blob) throw new Error("Couldn't process that image.");
  return { blob, width, height };
}

export default function ImageUpload({
  value,
  fallback,
  onChange,
}: {
  /** Current uploaded image URL ("" for none). */
  value: string;
  /** What the website shows when there's no upload (bundled photo). */
  fallback?: string;
  onChange: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fallbackOk, setFallbackOk] = useState(true);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    setError(null);
    setBusy(true);
    try {
      const { blob, width, height } = await compress(file);
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": blob.type, "X-Image-Width": String(width), "X-Image-Height": String(height) },
        body: blob,
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const shown = value || (fallback && fallbackOk ? fallback : "");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {/* Square preview, cropped like the menu tiles */}
      <div className="relative aspect-square w-full max-w-[11rem] shrink-0 overflow-hidden rounded-xl border border-bone-dark/70 bg-bone">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary uploaded URL
          <img src={shown} alt="Product photo preview" className="h-full w-full object-cover" onError={() => !value && setFallbackOk(false)} />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-xs text-brown-light">No photo yet</div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-crisp/80 text-xs font-semibold text-brown">Uploading…</div>
        )}
        {!value && shown && (
          <span className="absolute bottom-2 left-2 rounded-full bg-crisp/90 px-2 py-0.5 text-[0.6rem] text-brown-muted">Current photo</span>
        )}
      </div>

      <div className="flex-1">
        <div
          role="button"
          tabIndex={0}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files[0]); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-brown bg-bone/60" : "border-bone-dark bg-cream hover:border-brown"
          }`}
        >
          <p className="font-semibold text-brown-darkest">{value ? "Replace photo" : "Upload a photo"}</p>
          <p className="mt-1 text-xs text-brown-light">Drag it here or tap to choose · JPG, PNG or WebP · square photos look best</p>
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
        {value && (
          <button type="button" onClick={() => onChange("")} className="mt-2 text-xs text-red-700 underline">
            Remove uploaded photo
          </button>
        )}
        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
