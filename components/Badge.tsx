type BadgeTone = "brown" | "cream";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  brown: "bg-crisp/90 text-brown",
  cream: "bg-brown text-cream",
};

export default function Badge({
  children,
  tone = "brown",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`label-uppercase inline-flex items-center rounded-full px-3 py-1 text-[0.6rem] shadow-soft ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
