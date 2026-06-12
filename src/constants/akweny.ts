/**
 * Akweny (obszary żeglarskie) — używane do filtrowania rejsów i pinezek na mapie.
 * lat/lng = przybliżony środek akwenu (pinezka rejsu ląduje tu, dopóki nie
 * dodamy dokładnego wyboru lokalizacji na mapie przy tworzeniu rejsu).
 */
export type Akwen = { key: string; label: string; lat: number; lng: number };

export const AKWENY: Akwen[] = [
  { key: 'baltyk', label: 'Bałtyk', lat: 54.5, lng: 18.55 },
  { key: 'adriatyk', label: 'Adriatyk', lat: 43.51, lng: 16.44 },
  { key: 'egejskie', label: 'Morze Egejskie', lat: 37.44, lng: 25.32 },
  { key: 'jonskie', label: 'Morze Jońskie', lat: 38.0, lng: 20.7 },
  { key: 'tyrrenskie', label: 'Morze Tyrreńskie', lat: 40.8, lng: 14.2 },
  { key: 'mazury', label: 'Mazury', lat: 53.86, lng: 21.7 },
  { key: 'kanary', label: 'Wyspy Kanaryjskie', lat: 28.29, lng: -16.62 },
  { key: 'karaiby', label: 'Karaiby', lat: 18.22, lng: -63.07 },
  { key: 'inny', label: 'Inny', lat: 46.0, lng: 14.0 },
];

export function akwenByKey(key: string | null | undefined): Akwen | undefined {
  if (!key) return undefined;
  return AKWENY.find((a) => a.key === key);
}

export function akwenLabel(key: string | null | undefined): string {
  return akwenByKey(key)?.label ?? '';
}
