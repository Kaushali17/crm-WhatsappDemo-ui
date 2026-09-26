type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const isOpen = status.toLowerCase() === "open";
  const classes = isOpen
    ? "bg-green-100 text-green-800"
    : "bg-gray-200 text-gray-600";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}
