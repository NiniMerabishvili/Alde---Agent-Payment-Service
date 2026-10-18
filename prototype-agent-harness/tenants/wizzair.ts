// PROTOTYPE — throwaway. Mock catalog for Wizz Air (Georgian departures).
// Venue = departure airport (KUT / TBS / BUS). Item = one specific one-way flight on one date (per passenger).
// Options = Wizz ancillaries. Option names deliberately avoid sharing words ("bag", "check…") so the mock planner
// attaches exactly the option the user named. Flights are generated for the next 14 days from server start, so
// "this Friday" always resolves. HERO TEST CASE: "book a seat on Oct 21 and return on 27 Oct" -> KUT-BER round trip, 918 GEL.
import type { Item, Option, Tenant, Venue } from "./types";

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 0.62)}&fit=crop&auto=format`;
// verified 200 + visually checked
const IMG = {
  wing: "1436491865332-7a61a109cc05",
  budapest: "1565426873118-a17ed65d74b9",
  budapest2: "1551867633-194f125bddfa",
  vienna: "1516550893923-42d28e5677af",
  warsaw: "1519197924294-4ba991a11128",
  milan: "1513581166391-887a96ddeafd",
  rome: "1552832230-c0197dd311b5",
  berlin: "1560969184-10fe8719e047",
  tbilisi: "1565008576549-57569a49371d",
};

type Dest = { city: string; code: string; airport: string; country: string; image?: string; ka: string };
const D: Record<string, Dest> = {
  BUD: { city: "Budapest", code: "BUD", airport: "Budapest Ferenc Liszt", country: "Hungary", image: IMG.budapest, ka: "ბუდაპეშტი" },
  VIE: { city: "Vienna", code: "VIE", airport: "Vienna International", country: "Austria", image: IMG.vienna, ka: "ვენა" },
  WAW: { city: "Warsaw", code: "WAW", airport: "Warsaw Chopin", country: "Poland", image: IMG.warsaw, ka: "ვარშავა" },
  BGY: { city: "Milan Bergamo", code: "BGY", airport: "Milan Bergamo", country: "Italy", image: IMG.milan, ka: "მილანი ბერგამო" },
  FCO: { city: "Rome", code: "FCO", airport: "Rome Fiumicino", country: "Italy", image: IMG.rome, ka: "რომი" },
  BER: { city: "Berlin", code: "BER", airport: "Berlin Brandenburg", country: "Germany", image: IMG.berlin, ka: "ბერლინი" },
  LCA: { city: "Larnaca", code: "LCA", airport: "Larnaca International", country: "Cyprus", ka: "ლარნაკა" },
  DTM: { city: "Dortmund", code: "DTM", airport: "Dortmund", country: "Germany", ka: "დორტმუნდი" },
  KTW: { city: "Katowice", code: "KTW", airport: "Katowice", country: "Poland", ka: "კატოვიცე" },
  VNO: { city: "Vilnius", code: "VNO", airport: "Vilnius", country: "Lithuania", ka: "ვილნიუსი" },
};

const wizzOptions = (bagPrice: number): Option[] => [
  { id: "priority", name: "WIZZ Priority (10kg cabin trolley)", ka: "WIZZ Priority (10კგ ხელბარგი)", tags: ["პრიორიტი", "ხელბარგი"], price: Math.round(bagPrice * 0.6), group: "Cabin" },
  { id: "bag20", name: "20kg checked bag", ka: "20კგ ჩასაბარებელი ბარგი", tags: ["ჩასაბარებელი", "ბარგი", "ჩემოდანი"], price: bagPrice, group: "Hold luggage" },
  { id: "seat", name: "Seat selection", ka: "ადგილის არჩევა", tags: ["არჩევა"], price: 24, group: "Seat" },
  { id: "flex", name: "Flexible fare", ka: "მოქნილი ტარიფი", tags: ["მოქნილი"], price: 45, group: "Fare" },
  { id: "desk", name: "Airport desk boarding pass", ka: "ბორდინგ-ბარათი აეროპორტის სტოიკაზე", tags: ["სტოიკა"], price: 55, group: "Airport" },
];
const kaOpt = (o: Option, price: number): Option => ({ ...o, price });

// [from, to, flight no, weekdays (0=Sun), dep time, block minutes, tz shift hours (dest - Georgia), base fare ₾, bag ₾]
type Route = [string, string, string, number[], string, number, number, number, number];
const ROUTES: Route[] = [
  ["KUT", "BUD", "W6 2416", [1, 3, 5, 0], "06:15", 200, -2, 149, 89],
  ["KUT", "VIE", "W6 2422", [2, 5], "05:40", 215, -2, 179, 95],
  ["KUT", "WAW", "W6 1784", [1, 4, 6], "04:55", 225, -2, 139, 85],
  ["KUT", "BGY", "W6 2730", [3, 6], "11:20", 245, -2, 169, 92],
  ["KUT", "FCO", "W6 2788", [2, 5], "12:05", 240, -2, 189, 92],
  ["KUT", "BER", "W6 1724", [1, 5], "06:50", 250, -2, 159, 89],
  ["KUT", "LCA", "W6 2462", [4, 0], "15:30", 135, -1, 119, 79],
  ["KUT", "DTM", "W6 1710", [3, 6], "05:25", 265, -2, 129, 85],
  ["KUT", "KTW", "W6 1792", [2, 6], "07:10", 220, -2, 109, 79],
  ["KUT", "VNO", "W6 1816", [4], "06:30", 215, -1, 125, 79],
  ["TBS", "BUD", "W6 2410", [2, 4, 6], "04:20", 205, -2, 189, 95],
  ["TBS", "VIE", "W6 2426", [1, 5], "05:05", 220, -2, 209, 99],
  ["TBS", "LCA", "W6 2456", [3, 0], "14:15", 130, -1, 149, 85],
  ["TBS", "FCO", "W6 2792", [5], "10:40", 245, -2, 219, 99],
  ["BUS", "BUD", "W6 2418", [5, 0], "13:35", 185, -2, 199, 95],
  ["BUS", "WAW", "W6 1786", [3], "09:10", 210, -2, 179, 89],
  ["BUS", "KTW", "W6 1796", [6], "08:45", 205, -2, 159, 85],
];

const venues: Venue[] = [
  { id: "kut", name: "Kutaisi", area: "KUT", ka: { name: "ქუთაისი", area: "KUT" }, lat: 42.1766, lng: 42.4826, image: img(IMG.wing), cuisine: "Kutaisi International Airport — Wizz Air base", rating: 4.6, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { code: "KUT", airport: "Kutaisi International (David the Builder)", city: "Kutaisi" } },
  { id: "tbs", name: "Tbilisi", area: "TBS", ka: { name: "თბილისი", area: "TBS" }, lat: 41.6692, lng: 44.9547, image: img(IMG.tbilisi), cuisine: "Tbilisi International Airport", rating: 4.5, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { code: "TBS", airport: "Tbilisi International (Shota Rustaveli)", city: "Tbilisi" } },
  { id: "bus", name: "Batumi", area: "BUS", ka: { name: "ბათუმი", area: "BUS" }, lat: 41.6103, lng: 41.5997, image: img(IMG.wing), cuisine: "Batumi International Airport", rating: 4.4, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { code: "BUS", airport: "Batumi International (Alexander Kartveli)", city: "Batumi" } },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_KA = ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"];
const MON_KA = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const addMin = (hhmm: string, m: number) => { const [h, mm] = hhmm.split(":").map(Number); const t = (((h * 60 + mm + m) % 1440) + 1440) % 1440; return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };

const catalog: Item[] = [];
const today = new Date();
today.setHours(0, 0, 0, 0);
for (const [from, to, no, wdays, dep, mins, tz, fare, bag] of ROUTES) {
  const v = venues.find((v) => v.meta!.code === from)!;
  const d = D[to];
  let n = 0;
  for (let k = 1; k <= 14; k++) {
    const day = new Date(today.getTime() + k * 86400000);
    const wd = day.getDay();
    if (!wdays.includes(wd)) continue;
    const dname = DAYS[wd];
    const iso = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    const label = `${dname.slice(0, 3)} ${day.getDate()} ${MON[day.getMonth()]}`;
    const arr = addMin(dep, mins + tz * 60);
    // demand-based pricing: weekend + soon = pricier
    const price = Math.round(fare * (wd === 5 || wd === 0 ? 1.18 : 1) * (k <= 3 ? 1.12 : 1) * (n % 2 ? 0.93 : 1)) - 0.01;
    catalog.push({
      id: `${v.id}__${to.toLowerCase()}_${iso}`,
      venueId: v.id,
      category: `${d.city} (${d.code})`,
      name: `${v.name} → ${d.city} — ${label} ${dep} · ${no}`,
      ka: `${v.ka!.name} → ${d.ka} — ${DAYS_KA[wd]}, ${day.getDate()} ${MON_KA[day.getMonth()]} ${dep} · ${no}`,
      description: `${v.meta!.airport} (${from}) → ${d.airport} (${d.code}). Departs ${dep}, arrives ${arr} local time · ${Math.floor(mins / 60)}h ${pad(mins % 60)}m direct. Basic fare includes one small personal item (40×30×20 cm).`,
      price,
      image: d.image ? img(d.image, 300) : undefined,
      tags: [d.city.toLowerCase(), d.country.toLowerCase(), d.code.toLowerCase(), dname.toLowerCase(), "flight", "one-way", "direct",
        ...(k <= 7 ? [`this ${dname.toLowerCase()}`] : [`next ${dname.toLowerCase()}`])],
      options: wizzOptions(bag),
      meta: { from, to, fromCity: v.meta!.city, toCity: d.city, fromCityKa: v.ka!.name, toCityKa: d.ka, weekdayKa: DAYS_KA[wd], date: iso, dateLabel: label, weekday: dname, dep, arr, durationMin: mins, flightNo: no, seatsLeft: 3 + ((k * 7 + mins) % 9) },
    });
    n++;
  }
}

// HERO SCENARIO: the user's real planned trip with real prices (fixed dates, not generated).
// "book a seat on Oct 21 and return on 27 Oct" → this item. One payment = one venue (KUT), so the round trip is ONE item.
// Tags carry "seat", "oct", "21", "27", "return": no generated flight has "21"/"27"/"return"/"seat" tags.
catalog.push({
  id: "kut__ber_rt_2026-10-21_2026-10-27",
  venueId: "kut",
  category: "Round trips",
  name: "Kutaisi ⇄ Berlin Brandenburg — Wed 21 Oct 16:15 / Tue 27 Oct 08:40 (return)",
  ka: "ქუთაისი ⇄ ბერლინი ბრანდენბურგი — 21 ოქტომბერი 16:15 / 27 ოქტომბერი 08:40 (ორმხრივი ბილეთი)",
  description: "Round trip, 1 adult. Outbound W6 1726 KUT 16:15 → BER 18:20 (4h 05m direct). Return W6 1727 BER 08:40 → KUT 15:30 (3h 50m direct). Basic fare includes one small personal item (40×30×20 cm) on each flight.",
  price: 918, // 549.00 outbound + 369.00 return (real prices checked by the user, all-in)
  image: img(IMG.berlin, 300),
  tags: ["seat", "return", "round", "round-trip", "berlin", "brandenburg", "germany", "ber", "oct", "october", "21", "27", "trip",
    // Georgian search words: ONLY on this item, so nothing else ties for the Georgian test case
    "ადგილი", "ოქტომბერი", "დაბრუნება", "ორმხრივი", "ბერლინი"],
  options: [
    kaOpt(wizzOptions(0)[0], 106),
    kaOpt(wizzOptions(0)[1], 178),
    kaOpt(wizzOptions(0)[2], 48),
    kaOpt(wizzOptions(0)[3], 90),
    kaOpt(wizzOptions(0)[4], 110),
  ],
  meta: {
    roundTrip: true, from: "KUT", to: "BER", fromCity: "Kutaisi", toCity: "Berlin", fromCityKa: "ქუთაისი", toCityKa: "ბერლინი", weekdayKa: "ოთხშაბათი", date: "2026-10-21", dateLabel: "Wed 21 Oct", weekday: "Wednesday",
    dep: "16:15", arr: "18:20", durationMin: 245, flightNo: "W6 1726", seatsLeft: 4, price: 549,
    ret: { from: "BER", to: "KUT", fromCity: "Berlin", toCity: "Kutaisi", fromCityKa: "ბერლინი", toCityKa: "ქუთაისი", weekdayKa: "სამშაბათი", date: "2026-10-27", dateLabel: "Tue 27 Oct", weekday: "Tuesday",
      dep: "08:40", arr: "15:30", durationMin: 230, flightNo: "W6 1727", price: 369 },
  },
});

const tenant: Tenant = {
  id: "wizzair",
  name: "Wizz Air",
  publishableKey: "pk_wizzair_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 2500,
  serviceFee: 0, // Wizz shows all-in fares (admin fee included), matching the real 549 + 369 GEL the user checked
  savedPaymentMethod: "Mastercard •••• 5521",
  brandColor: "#c6007e",
  persona: "You help users book Wizz Air flights from Georgian airports (Kutaisi KUT, Tbilisi TBS, Batumi BUS). Each item is one one-way flight on one date for one passenger; qty = number of passengers. Add bags/seat/flex as options. Prefer the departure airport nearest to the user unless they name one. One booking = one departure airport.",
  defaultLocation: { lat: 42.2679, lng: 42.718, label: "Kutaisi, Rustaveli Ave 8", labelKa: "ქუთაისი, რუსთაველის გამზ. 8" },
  venues,
  catalog,
};

export default tenant;
