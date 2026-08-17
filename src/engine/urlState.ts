import { SavedUrlState } from './types';

// UTF-8 sikker base64-kodning til URL
export function kodTilUrl(tilstandObjekt: SavedUrlState): string {
  try {
    const json = JSON.stringify(tilstandObjekt);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?d=${base64}`;
    }
    return `?d=${base64}`;
  } catch {
    return '';
  }
}

// Afkodning fra URL query parameter ?d=...
export function afkodFraUrl(): SavedUrlState | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const d = params.get('d');
  if (!d) return null;
  try {
    const json = decodeURIComponent(escape(atob(d)));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.seed !== 'number') {
      return null;
    }
    return parsed as SavedUrlState;
  } catch {
    return null; // ugyldigt/korrupt link — start med standardtilstand i stedet
  }
}
