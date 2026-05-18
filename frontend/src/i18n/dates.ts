// Localised date/time formatting helpers used across pages (Profile, Progress,
// admin lists). We standardise on Intl.DateTimeFormat so the output respects
// the user's chosen UI language regardless of browser locale.
//
// Why a tiny module: the formatting logic was duplicated as ad-hoc string
// concatenation (`${y}-${m}-${d} · ${h}:${m}`) in two pages, producing
// neither EN nor RU output and offering no flexibility. Centralising means
// flipping the format in one place applies everywhere.
//
// All helpers accept either an ISO string OR a Date instance; null/empty
// inputs return an em-dash placeholder so callers don't need to null-check.

import { i18n } from './index';

function activeLang(): 'en' | 'ru' {
  // i18n.global.locale.value is a Ref<string> in Composition mode.
  const raw = (i18n.global as unknown as { locale: { value: string } }).locale.value;
  return raw === 'en' ? 'en' : 'ru';
}

function intlLocale(): string {
  return activeLang() === 'ru' ? 'ru-RU' : 'en-US';
}

// Coerce input to Date or return null for invalid/empty values.
function toDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

// "15 May 2026" / "15 мая 2026 г." — used for "joined" dates and other
// long-form date displays where time isn't relevant.
export function fmtDate(input: string | Date | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat(intlLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// "15 May 2026, 14:32" / "15 мая 2026 г., 14:32" — date + time, used for
// recent-sessions lists. Time uses 24h to avoid AM/PM clutter; this matches
// the surrounding tabular-numeric typography.
export function fmtDateTime(input: string | Date | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat(intlLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}

// "Today" / "Сегодня" or "3 days ago" / "3 дня назад" — relative time for the
// recent-activity feel. Falls back to fmtDate for anything older than 7 days
// because relative phrasing gets clumsy beyond that.
export function fmtRelative(input: string | Date | null | undefined): string {
  const d = toDate(input);
  if (!d) return '—';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < 0) return fmtDate(d);
  if (diffMs < 7 * day) {
    try {
      const days = Math.floor(diffMs / day);
      const rtf = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'auto' });
      return rtf.format(-days, 'day');
    } catch {
      // fall through to fmtDate
    }
  }
  return fmtDate(d);
}
