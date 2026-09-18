export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    RECEIVED: "bg-blue-100 text-blue-700",
    KITCHEN: "bg-amber-100 text-amber-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  const label = status.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}
