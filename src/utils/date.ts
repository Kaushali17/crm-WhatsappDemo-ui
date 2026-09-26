/** Formats an ISO date string as a short, locale-aware time (e.g. for chat bubbles). */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Formats an ISO date string as a short date + time for lists (e.g. conversation list). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return formatTime(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Formats an ISO date string as a plain date (e.g. "created at" columns). */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
