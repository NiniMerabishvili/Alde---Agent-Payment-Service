// PROTOTYPE — throwaway. Shared tenant types. One file per client in this folder (wolt.ts, tktge.ts, ...),
// each default-exporting a Tenant. index.ts auto-loads them. In production each catalog comes from the client's own API.

export type Option = {
  id: string; name: string; price: number; group: string;
  ka?: string;     // Georgian display name, e.g. "ხახვის გარეშე"
  tags?: string[]; // extra words that select this option (any language), e.g. ["ხახვი", "onion"]
};

export type Venue = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  image: string;
  cuisine: string;
  rating: number;
  etaMin: number;
  etaMax: number;
  ka?: { name?: string; area?: string }; // Georgian display names
  deliveryFee: number; // generic "fee" added once per order (delivery / booking / ride fee); 0 if none
  meta?: Record<string, any>; // anything app-specific (address, airport code, stars, ...)
};

export type Item = {
  id: string;
  venueId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  tags: string[];
  options?: Option[];
  ka?: string; // Georgian display name (put Georgian search words in tags)
  meta?: Record<string, any>; // anything app-specific (date, seat, author, rooms, ...)
};

export type Tenant = {
  id: string;
  name: string;
  publishableKey: string; // what the client puts in the <script> tag / SDK init
  currency: string;
  currencySymbol: string;
  perOrderLimit: number;
  serviceFee: number;
  savedPaymentMethod: string; // display only: the card already on the user's account
  brandColor: string;
  persona: string;
  defaultLocation: { lat: number; lng: number; label: string; labelKa?: string };
  venues: Venue[];
  catalog: Item[];
};

