import Link from "next/link";

type ButtonVariant = "solid" | "outline" | "solid-cream" | "outline-cream";
type ButtonSize = "sm" | "md";

const base =
  "label-uppercase inline-flex items-center justify-center gap-1.5 rounded-full border-2 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100";

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[0.65rem]",
  md: "px-6 py-3 text-xs",
};

const variants: Record<ButtonVariant, string> = {
  solid:
    "border-brown bg-brown text-cream shadow-soft hover:bg-brown-deep hover:shadow-soft-lg",
  outline:
    "border-brown bg-crisp text-brown shadow-soft hover:bg-bone hover:shadow-soft-lg",
  "solid-cream":
    "border-cream bg-cream text-brown shadow-soft hover:bg-crisp hover:shadow-soft-lg",
  "outline-cream":
    "border-cream bg-transparent text-cream hover:bg-cream hover:text-brown",
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
}

export default function Button({
  variant = "solid",
  size = "md",
  className = "",
  children,
  href,
  type = "button",
  onClick,
  disabled,
  ...aria
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...aria}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...aria}
    >
      {children}
    </button>
  );
}
