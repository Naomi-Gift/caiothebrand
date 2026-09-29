import Image from "next/image";
import Link from "next/link";

/* Shared shell for the info and legal pages (About, Contact, FAQs, Track, Privacy…). */

export function InfoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:gap-7">{children}</div>
    </div>
  );
}

export interface InfoAction {
  href: string;
  label: string;
  external?: boolean;
}

export function InfoHero({
  kicker,
  title,
  titleEm,
  intro,
  actions = [],
  children,
}: {
  kicker: string;
  title: string;
  titleEm?: string;
  intro?: React.ReactNode;
  actions?: InfoAction[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-bone-dark/60 bg-gradient-to-br from-crisp via-cream to-bone px-6 py-9 shadow-soft sm:px-12 sm:py-14">
      <Image
        src="/images/logo-mark-primary.png"
        alt=""
        aria-hidden="true"
        width={1082}
        height={1106}
        className="pointer-events-none absolute -bottom-16 -right-10 hidden h-[300px] w-auto opacity-[0.09] sm:block"
      />
      <div className="relative flex max-w-2xl flex-col gap-4">
        <p className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.3em] text-brown">
          {kicker}
        </p>
        <h1 className="font-display text-[2.3rem] font-bold leading-[0.98] text-brown-darkest sm:text-6xl">
          {title}
          {titleEm && (
            <>
              {" "}
              <em className="not-italic text-brown-light">{titleEm}</em>
            </>
          )}
        </h1>
        {intro && (
          <p className="text-[0.98rem] leading-relaxed text-brown-muted sm:text-[1.08rem]">
            {intro}
          </p>
        )}
        {actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {actions.map((a, i) => (
              <PillLink key={a.href} {...a} primary={i === 0} />
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function PillLink({
  href,
  label,
  external,
  primary,
}: InfoAction & { primary?: boolean }) {
  const cls = `label-uppercase inline-flex items-center rounded-full border px-5 py-2.5 text-[0.7rem] transition-colors duration-200 ${
    primary
      ? "border-brown bg-brown text-cream hover:bg-brown-deep"
      : "border-bone-dark bg-crisp text-brown hover:border-brown hover:bg-brown hover:text-cream"
  }`;
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

export function InfoCard({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-bone-dark/60 bg-crisp px-6 py-7 shadow-soft sm:px-10 sm:py-10"
    >
      <h2 className="font-display text-2xl font-bold text-brown-darkest sm:text-[1.9rem]">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[0.95rem] leading-relaxed text-brown-muted sm:text-[1.02rem]">
        {children}
      </div>
    </section>
  );
}
