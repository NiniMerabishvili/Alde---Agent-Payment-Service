// PROTOTYPE — throwaway. Mock catalog for Bolt (ride-hailing, Tbilisi).
// Venues = destinations; Items = ride classes to that destination, priced from the distance to the user's pickup (Free University).
// TEST CASE: "Order a taxi from current location (freeuni) to didube metro station" → 1× Economy to Didube Metro Station.
// KA TEST CASE: "გამომიძახე ტაქსი ჩემი ლოკაციიდან (თავისუფალი უნივერსიტეტი) დიდუბის მეტრომდე" → the same order.
// The pickup is the user location — words like freeuni/current/location must NOT appear in any destination's name/area/tags.
import type { Item, Option, Tenant, Venue } from "./types";

const PICKUP = { lat: 41.8056, lng: 44.768, label: "Free University (Freeuni)", labelKa: "თავისუფალი უნივერსიტეტი (Freeuni)" }; // Kakha Bendukidze Campus, 240 David Agmashenebeli Alley

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLn = (b.lng - a.lng) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const round = (n: number) => Math.round(n * 10) / 10;

// name/area/cuisine are what the mock planner matches the destination by — keep the distinctive word in the name
const DEST = [
  { id: "didube_metro", name: "Didube Metro Station", area: "Didube", cuisine: "Metro", lat: 41.738, lng: 44.781, emoji: "🚇", address: "Didube Square, Akaki Tsereteli Ave", tags: ["metro", "subway", "underground"], ka: { name: "დიდუბის მეტროსადგური", area: "დიდუბე", short: "დიდუბის მეტროსადგური" }, tagsKa: ["მეტრო", "მეტროსადგური"] },
  { id: "tbs_airport", name: "Tbilisi International Airport", area: "Airport (TBS)", cuisine: "Airport", lat: 41.6692, lng: 44.9547, emoji: "✈️", address: "Airport Highway, Departures", tags: ["airport", "flight", "departures", "tbs"], ka: { name: "თბილისის საერთაშორისო აეროპორტი", area: "აეროპორტი (TBS)", short: "თბილისის აეროპორტი" }, tagsKa: ["აეროპორტი", "ფრენა"] },
  { id: "freedom_sq", name: "Freedom Square", area: "Rustaveli Avenue", cuisine: "City centre", lat: 41.6934, lng: 44.8015, emoji: "🏛️", address: "Freedom Square, St. George statue", tags: ["centre", "center", "downtown", "rustaveli"], ka: { name: "თავისუფლების მოედანი", area: "რუსთაველის გამზირი", short: "თავისუფლების მოედანი" }, tagsKa: ["ცენტრი"] },
  { id: "biltmore", name: "Biltmore Hotel", area: "Rustaveli Avenue", cuisine: "Hotel", lat: 41.7003, lng: 44.7955, emoji: "🏨", address: "29 Shota Rustaveli Ave", tags: ["hotel", "biltmore"], ka: { name: "სასტუმრო ბილტმორი", area: "რუსთაველის გამზირი", short: "სასტუმრო ბილტმორი" }, tagsKa: ["სასტუმრო", "ბილტმორი"] },
  { id: "tbilisi_mall", name: "Tbilisi Mall", area: "Digomi", cuisine: "Shopping mall", lat: 41.7765, lng: 44.764, emoji: "🛍️", address: "16th km, David Agmashenebeli Alley", tags: ["mall", "shopping"], ka: { name: "თბილისი მოლი", area: "დიღომი", short: "თბილისი მოლი" }, tagsKa: ["მოლი", "სავაჭრო"] },
  { id: "east_point", name: "East Point", area: "Varketili", cuisine: "Shopping mall", lat: 41.6858, lng: 44.8916, emoji: "🛒", address: "2 Tsotne Dadiani St", tags: ["mall", "shopping", "eastpoint"], ka: { name: "ისთ ფოინთი", area: "ვარკეთილი", short: "ისთ ფოინთი" }, tagsKa: ["მოლი", "სავაჭრო"] },
  { id: "abanotubani", name: "Old Tbilisi / Abanotubani", area: "Sulphur Baths", cuisine: "Old town", lat: 41.6885, lng: 44.81, emoji: "♨️", address: "Abano St, Sulphur Baths", tags: ["old town", "baths", "sulphur", "abanotubani"], ka: { name: "ძველი თბილისი / აბანოთუბანი", area: "გოგირდის აბანოები", short: "აბანოთუბანი" }, tagsKa: ["აბანო", "აბანოები"] },
  { id: "central_station", name: "Tbilisi Central Station", area: "Station Square", cuisine: "Railway station", lat: 41.7213, lng: 44.7966, emoji: "🚆", address: "2 Station Square", tags: ["train", "railway", "station"], ka: { name: "თბილისის ცენტრალური სადგური", area: "სადგურის მოედანი", short: "ცენტრალური სადგური" }, tagsKa: ["სადგური", "ვაგზალი", "მატარებელი"] },
];

// Bolt Tbilisi-ish tariffs (GEL): base + per road-km, min fare; driver pickup ETA per class
const CLASSES = [
  { key: "economy", label: "Economy", base: 2, perKm: 0.85, min: 4, seats: 4, eta: 3, desc: "Everyday rides at the best price", tags: ["taxi", "cab", "cheapest", "cheap", "budget", "standard", "ტაქსი", "იაფი", "ეკონომი"] },
  { key: "comfort", label: "Comfort", base: 2.5, perKm: 1.1, min: 5.5, seats: 4, eta: 4, desc: "Newer cars with extra legroom", tags: ["newer", "legroom", "კომფორტი"] },
  { key: "xl", label: "XL", base: 3.5, perKm: 1.4, min: 8, seats: 6, eta: 7, desc: "Bigger cars for up to 6 people", tags: ["group", "van", "luggage", "big", "დიდი", "ჯგუფი", "მინივენი"] },
  { key: "premium", label: "Premium", base: 5, perKm: 1.9, min: 12, seats: 4, eta: 9, desc: "Top-rated drivers, premium cars", tags: ["business", "luxury", "executive", "პრემიუმი", "ბიზნესი"] },
];

const rideOptions = (): Option[] => [
  { id: "child_seat", name: "Child seat", ka: "ბავშვის სავარძელი", tags: ["ბავშვი", "სავარძელი"], price: 3, group: "Ride preferences" },
  { id: "pet_friendly", name: "Pet friendly", ka: "შინაური ცხოველით", tags: ["ცხოველი", "ძაღლი", "კატა"], price: 2, group: "Ride preferences" },
  { id: "quiet_ride", name: "Quiet ride", ka: "მშვიდი მგზავრობა", tags: ["მშვიდი", "ჩუმი"], price: 0, group: "Ride preferences" },
];

const boltVenues: Venue[] = DEST.map((d) => {
  const roadKm = round(km(PICKUP, d) * 1.15);
  const mins = Math.round(roadKm * 1.25 + 7);
  return {
    id: d.id, name: d.name, area: d.area, ka: { name: d.ka.name, area: d.ka.area }, lat: d.lat, lng: d.lng, image: "", cuisine: d.cuisine, rating: 4.9,
    etaMin: mins, etaMax: mins + 6, deliveryFee: 0,
    meta: { emoji: d.emoji, address: d.address, roadKm, tripMin: mins },
  };
});

const boltCatalog: Item[] = DEST.flatMap((d) => {
  const v = boltVenues.find((v) => v.id === d.id)!;
  const short = d.id === "tbs_airport" ? "Tbilisi Airport" : d.name;
  return CLASSES.map((c) => ({
    id: `${d.id}__${c.key}`,
    venueId: d.id,
    name: `Bolt to ${short} — ${c.label}`,
    description: `${c.desc} · ${c.seats} seats · ${v.meta!.roadKm} km`,
    price: Math.max(c.min, Math.round((c.base + c.perKm * v.meta!.roadKm) * 10) / 10),
    category: "Rides",
    ka: `Bolt: ${d.ka.short} — ${c.label}`,
    tags: [...c.tags, ...d.tags, ...d.tagsKa],
    options: rideOptions(),
    meta: { cls: c.key, label: c.label, seats: c.seats, pickupEta: c.eta, roadKm: v.meta!.roadKm, tripMin: v.meta!.tripMin },
  }));
});

const tenant: Tenant = {
  id: "bolt",
  name: "Bolt",
  publishableKey: "pk_bolt_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 200,
  serviceFee: 0.5, // shown as "Booking fee"
  savedPaymentMethod: "Visa •••• 4242",
  brandColor: "#34d186",
  persona: "You are Bolt's ride assistant in Tbilisi. Each 'venue' is a DESTINATION and each item is a ride class (Economy, Comfort, XL, Premium) from the user's pickup (Free University / Freeuni, the user's current location) to it. Pick the destination the user names (not the nearest one). One order = one ride (qty 1) unless the user asks for several cars. A plain 'taxi' with no class means Economy.",
  defaultLocation: PICKUP,
  venues: boltVenues,
  catalog: boltCatalog,
};

export default tenant;
