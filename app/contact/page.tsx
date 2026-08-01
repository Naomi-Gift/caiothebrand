"use client";

import { useState } from "react";
import { useBranch } from "@/context/BranchContext";
import Button from "@/components/Button";

export default function ContactPage() {
  const { branch } = useBranch();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const whatsappHref = branch
    ? `https://wa.me/?text=${encodeURIComponent(
        `Hi Caio Pizza ${branch.name}, I have a question.`
      )}`
    : "https://wa.me/";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="label-uppercase text-xs text-brown-light">Get in touch</p>
      <h1 className="mt-2 font-display text-5xl font-black italic text-brown">
        Contact
      </h1>
      <p className="mt-3 text-sm text-brown-light">
        Questions about an order, catering, or just want to say hi — we&apos;re
        around.
      </p>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="label-uppercase mt-8 flex w-full items-center justify-center rounded-full bg-brown px-6 py-3 text-xs text-cream shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-brown-deep hover:shadow-soft-lg sm:w-auto"
      >
        Message us on WhatsApp{branch ? ` — ${branch.name}` : ""}
      </a>

      <div className="mt-10 rounded-2xl bg-crisp p-6 shadow-soft">
        <p className="label-uppercase text-xs text-brown-light">
          Or send a note
        </p>
        {sent ? (
          <p className="mt-4 font-display text-lg italic text-brown">
            Got it — thanks. We&apos;ll be in touch soon.
          </p>
        ) : (
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && message.trim()) setSent(true);
            }}
          >
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-2xl bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
            />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message"
              rows={4}
              className="rounded-2xl bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
            />
            <Button type="submit" variant="outline" className="self-start">
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
