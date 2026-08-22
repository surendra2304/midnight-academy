/**
 * Formats a date/time in Indian Standard Time (IST) as "22 Aug 2026, 03:30 PM".
 * Returns an empty string for null/undefined/invalid input.
 */
export function formatToIST(date?: string | null): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(parsed);
  return formatted.replace(/(am|pm)/i, (m) => m.toUpperCase());
}
