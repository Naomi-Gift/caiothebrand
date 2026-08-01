interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}

export default function QuantityStepper({
  quantity,
  onChange,
  min = 1,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center rounded-full bg-cream shadow-soft">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-brown transition-colors hover:bg-bone disabled:opacity-30"
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="flex h-10 w-10 items-center justify-center font-body font-semibold text-brown">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-brown transition-colors hover:bg-bone"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
