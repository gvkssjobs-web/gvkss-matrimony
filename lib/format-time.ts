/**
 * Format 24-hour time string (e.g. "14:30" or "14:30:00") to 12-hour display (e.g. "2:30 PM").
 */
export function time24To12(timeStr: string | null | undefined): string {
  if (!timeStr || !timeStr.trim()) return '';

  const onlyTime = timeStr.trim().split(' ')[0];
  const parts = onlyTime.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].replace(/\D/g, '').padStart(2, '0');
  if (Number.isNaN(hours)) return timeStr;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${suffix}`;
}

/**
 * Parse hour (1-12), minute (0-59), and ampm ('AM'|'PM') to 24h "HH:mm" string.
 */
export function time12To24(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h = hour;
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Parse 24h "HH:mm" string to { hour: 1-12, minute: 0-59, ampm: 'AM'|'PM' }.
 */
export function time24ToParts(time24: string | null | undefined): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
  const defaultParts = { hour: 12, minute: 0, ampm: 'AM' as const };
  if (!time24 || !time24.trim()) return defaultParts;

  const onlyTime = time24.trim().split(' ')[0];
  const parts = onlyTime.split(':');
  if (parts.length < 2) return defaultParts;

  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;
  if (Number.isNaN(h)) return defaultParts;

  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;

  return { hour: h, minute: Math.min(59, Math.max(0, m)), ampm };
}
