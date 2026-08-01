import Image from "next/image";
import Link from "next/link";

type LogoVariant = "primary" | "reversed" | "monogram";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  href?: string | false;
}

const LOCKUP: Record<"primary" | "reversed", { src: string; width: number; height: number }> = {
  primary: { src: "/images/logo-lockup-primary.png", width: 1421, height: 1051 },
  reversed: { src: "/images/logo-lockup-reversed.png", width: 1421, height: 1051 },
};

const MARK: Record<"primary" | "reversed", { src: string; width: number; height: number }> = {
  primary: { src: "/images/logo-mark-primary.png", width: 1082, height: 1106 },
  reversed: { src: "/images/logo-mark-reversed.png", width: 1082, height: 1106 },
};

function LogoMark({ variant }: { variant: LogoVariant }) {
  if (variant === "monogram") {
    const mark = MARK.primary;
    return (
      <Image
        src={mark.src}
        width={mark.width}
        height={mark.height}
        alt="Caio Pizza"
        className="h-9 w-9 object-contain"
        priority
      />
    );
  }

  const lockup = LOCKUP[variant];
  return (
    <Image
      src={lockup.src}
      width={lockup.width}
      height={lockup.height}
      alt="Caio Pizza"
      className="h-10 w-auto object-contain"
      priority
    />
  );
}

export default function Logo({
  variant = "primary",
  className = "",
  href = "/",
}: LogoProps) {
  const mark = <LogoMark variant={variant} />;

  if (href === false) {
    return <span className={className}>{mark}</span>;
  }

  return (
    <Link href={href} className={`inline-flex ${className}`} aria-label="Caio Pizza — home">
      {mark}
    </Link>
  );
}
