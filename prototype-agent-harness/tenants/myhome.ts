// PROTOTYPE — throwaway. Mock daily-rent / hotel catalog for myhome.ge (TNET).
// Venue = property (hotel / apartment). Item = a room type for fixed dates; price = total stay (nights × nightly rate).
// TEST CASE: "Book a Deluxe King room at the Biltmore this weekend with breakfast"
//   → 1× "Deluxe King Room · Weekend 23–25 Oct" at The Biltmore Hotel Tbilisi + "Breakfast included".
import type { Item, Option, Tenant, Venue } from "./types";

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 0.62)}&fit=crop&auto=format`;
const IMG = {
  kingDark: "1591088398332-8a7791972843",
  lounge: "1565031491910-e57fac031c41",
  panorama: "1578683010236-d716f9a3f461",
  twin: "1595576508898-0ad5c879a061",
  classic: "1618773928121-c32242e63f39",
  hotelRoom: "1631049307264-da0ec9d70304",
  sofaRoom: "1590490360182-c33d57733427",
  sunsetBed: "1582719478250-c89cae4dc85b",
  moody: "1611892440504-42a792e24d32",
  tufted: "1559599238-308793637427",
  rooftop: "1445019980597-93fa8acb246c",
  orangeBed: "1540518614846-7eded433c457",
  classicBed: "1505693416388-ac5ce068fe85",
  whiteBed: "1512918728675-ed5a9ecdebfd",
  aptLiving: "1493809842364-78817add7ffb",
  aptPlants: "1502672260266-1c1ef2d93688",
  aptKitchen: "1522708323590-d24dbb6b0267",
  aptBright: "1560448204-e02f11c3d0e2",
  aptYellow: "1586023492125-27b2c045efd7",
};

// Dates (today is Sun 18 Oct 2026): "this weekend" = Fri 23 – Sun 25 Oct.
const WEEKEND = { checkIn: "2026-10-23", checkOut: "2026-10-25", dateLabel: "Fri 23 – Sun 25 Oct", nights: 2, short: "Weekend 23–25 Oct", dateLabelKa: "პარ 23 – კვი 25 ოქტ", shortKa: "შაბათ-კვირა 23–25 ოქტ" };
const WEEKDAY = { checkIn: "2026-10-19", checkOut: "2026-10-21", dateLabel: "Mon 19 – Wed 21 Oct", nights: 2, short: "Mon 19–Wed 21 Oct", dateLabelKa: "ორშ 19 – ოთხ 21 ოქტ", shortKa: "ორშ 19 – ოთხ 21 ოქტ" };

const hotelOptions = (breakfast: number, late: number, transfer: number, view?: number): Option[] => [
  { id: "breakfast", name: "Breakfast included", ka: "საუზმე შედის", tags: ["საუზმე"], price: breakfast, group: "Meals" },
  { id: "late_checkout", name: "Late checkout", ka: "გვიანი გასვლა", tags: ["გვიანი", "გასვლა"], price: late, group: "Stay extras" },
  { id: "airport_transfer", name: "Airport transfer", ka: "აეროპორტის ტრანსფერი", tags: ["აეროპორტი", "ტრანსფერი"], price: transfer, group: "Stay extras" },
  ...(view ? [{ id: "city_view", name: "City view upgrade", ka: "ქალაქის ხედის განახლება", tags: ["ქალაქის"], price: view, group: "Upgrades" }] : []),
];
const aptOptions = (late: number, transfer: number): Option[] => [
  { id: "late_checkout", name: "Late checkout", ka: "გვიანი გასვლა", tags: ["გვიანი", "გასვლა"], price: late, group: "Stay extras" },
  { id: "airport_transfer", name: "Airport transfer", ka: "აეროპორტის ტრანსფერი", tags: ["აეროპორტი", "ტრანსფერი"], price: transfer, group: "Stay extras" },
];

type RoomSpec = { key: string; name: string; ka: string; bedKa: string; viewKa: string; perNight: number; image: string; bed: string; size: number; view: string; guests: number; desc: string; tags: string[]; options: Option[] };
// One item per room type per date window; the weekend one carries the "weekend" tag.
const rooms = (venueId: string, specs: RoomSpec[]): Item[] =>
  specs.flatMap((r) =>
    [WEEKEND, WEEKDAY].map((d, n) => ({
      id: `${venueId}__${r.key}__${n ? "wd" : "we"}`,
      venueId,
      category: n ? "Weekdays · Mon 19 – Wed 21 Oct" : "This weekend · Fri 23 – Sun 25 Oct",
      name: `${r.name} · ${d.short}`,
      ka: `${r.ka} · ${d.shortKa}`,
      price: r.perNight * d.nights,
      image: img(r.image, 300),
      description: `${d.dateLabel}, ${d.nights} nights · ${r.guests} guests · ${r.bed} · ${r.size} m² · ${r.view}. ${r.desc}`,
      tags: [...r.tags, ...(n ? ["weekday"] : ["weekend", "შაბათ-კვირა", "შაბათი", "კვირა"]), "stay"],
      options: r.options,
      meta: { ...d, guests: r.guests, bed: r.bed, size: r.size, view: r.view, perNight: r.perNight, roomType: r.name, roomTypeKa: r.ka, bedKa: r.bedKa, viewKa: r.viewKa },
    })),
  );

const venues: Venue[] = [
  { id: "biltmore", name: "The Biltmore Hotel Tbilisi", area: "Rustaveli Ave", ka: { name: "ბილტმორი სასტუმრო თბილისი", area: "რუსთაველის გამზ." }, lat: 41.7012, lng: 44.7957, image: img(IMG.kingDark), cuisine: "5-star hotel", rating: 9.3, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Hotel", stars: 5, address: "Rustaveli Ave 29, Tbilisi", addressKa: "რუსთაველის გამზ. 29, თბილისი", fromPerNight: 690, reviews: 1284, vip: "SUPER VIP", floors: 32, checkIn: "15:00", checkOut: "12:00",
      gallery: [img(IMG.kingDark, 800), img(IMG.lounge, 800), img(IMG.panorama, 800), img(IMG.twin, 800), img(IMG.classic, 800)],
      amenities: ["Indoor pool", "Spa & fitness", "Free Wi-Fi", "Parking", "Restaurant", "Rooftop bar", "Airport shuttle", "24h reception"],
      about: "Iconic 32-floor glass tower on Rustaveli Avenue joined to the restored 1938 IMELI building. Panoramic city views, Pool & spa, Cafe Littera nearby. 2 min walk to Freedom Square metro." } },
  { id: "stamba", name: "Stamba Hotel", area: "Vera", ka: { name: "სასტუმრო სტამბა", area: "ვერა" }, lat: 41.7058, lng: 44.7866, image: img(IMG.moody), cuisine: "5-star design hotel", rating: 9.5, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Hotel", stars: 5, address: "14 Merab Kostava St, Tbilisi", addressKa: "მერაბ კოსტავას ქ. 14, თბილისი", fromPerNight: 610, reviews: 932, vip: "VIP+", checkIn: "15:00", checkOut: "12:00",
      gallery: [img(IMG.moody, 800), img(IMG.tufted, 800), img(IMG.lounge, 800)],
      amenities: ["Free Wi-Fi", "Restaurant", "Café", "Fitness", "Rooftop pool", "Pet friendly"],
      about: "A Soviet-era publishing house turned design hotel with a 5-floor atrium, café, bakery and courtyard." } },
  { id: "rooms_tbilisi", name: "Rooms Hotel Tbilisi", area: "Vera", ka: { name: "რუმს ჰოტელი თბილისი", area: "ვერა" }, lat: 41.7055, lng: 44.7871, image: img(IMG.rooftop), cuisine: "Boutique hotel", rating: 9.2, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Hotel", stars: 4, address: "14 Merab Kostava St, Tbilisi", addressKa: "მერაბ კოსტავას ქ. 14, თბილისი", fromPerNight: 420, reviews: 1710, vip: "VIP", checkIn: "14:00", checkOut: "12:00",
      gallery: [img(IMG.rooftop, 800), img(IMG.orangeBed, 800), img(IMG.sofaRoom, 800)],
      amenities: ["Free Wi-Fi", "Restaurant", "Garden", "Fitness", "Bar"],
      about: "Industrial-chic boutique hotel with a leafy terrace, famous brunch and a lively lobby bar." } },
  { id: "radisson_iveria", name: "Radisson Blu Iveria", area: "Rose Revolution Sq", ka: { name: "რედისონ ბლუ ივერია", area: "ვარდების რევოლუციის მოედანი" }, lat: 41.7022, lng: 44.7935, image: img(IMG.panorama), cuisine: "5-star hotel", rating: 8.9, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Hotel", stars: 5, address: "1 Rose Revolution Sq, Tbilisi", addressKa: "ვარდების რევოლუციის მოედანი 1, თბილისი", fromPerNight: 480, reviews: 2210, vip: "VIP", checkIn: "15:00", checkOut: "12:00",
      gallery: [img(IMG.panorama, 800), img(IMG.hotelRoom, 800), img(IMG.sunsetBed, 800)],
      amenities: ["Indoor pool", "Casino", "Spa", "Free Wi-Fi", "Parking", "Restaurant"],
      about: "Landmark hotel with balconies over the Mtkvari and a rooftop spa." } },
  { id: "vake_apartment", name: "Sunny 2-room apartment in Vake", area: "Vake", ka: { name: "მზიანი ბინა ვაკეში", area: "ვაკე" }, lat: 41.709, lng: 44.7652, image: img(IMG.aptLiving), cuisine: "Daily rent apartment", rating: 9.1, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Apartment", address: "Chavchavadze Ave 37, Vake, Tbilisi", addressKa: "ჭავჭავაძის გამზ. 37, ვაკე, თბილისი", fromPerNight: 160, reviews: 86, vip: "VIP", rooms: 2, floor: "7/12", checkIn: "14:00", checkOut: "12:00",
      gallery: [img(IMG.aptLiving, 800), img(IMG.whiteBed, 800), img(IMG.aptKitchen, 800)],
      amenities: ["Free Wi-Fi", "Kitchen", "Washing machine", "Balcony", "Air conditioning"],
      about: "Renovated apartment next to Vake Park, self check-in with smart lock." } },
  { id: "old_tbilisi_loft", name: "Balcony loft in Old Tbilisi", area: "Sololaki", ka: { name: "აივნიანი ლოფტი ძველ თბილისში", area: "სოლოლაკი" }, lat: 41.6903, lng: 44.8036, image: img(IMG.aptPlants), cuisine: "Daily rent apartment", rating: 9.4, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Apartment", address: "Betlemi St 12, Sololaki, Tbilisi", addressKa: "ბეთლემის ქ. 12, სოლოლაკი, თბილისი", fromPerNight: 140, reviews: 143, vip: "", rooms: 2, floor: "2/3", checkIn: "14:00", checkOut: "11:00",
      gallery: [img(IMG.aptPlants, 800), img(IMG.classicBed, 800), img(IMG.aptYellow, 800)],
      amenities: ["Free Wi-Fi", "Kitchen", "Carved balcony", "Old town view", "Air conditioning"],
      about: "Traditional Tbilisi house with a wooden balcony, 5 min to Narikala cable car." } },
  { id: "abanotubani_studio", name: "Studio near the Sulfur Baths", area: "Abanotubani", ka: { name: "სტუდიო გოგირდის აბანოებთან", area: "აბანოთუბანი" }, lat: 41.6884, lng: 44.8104, image: img(IMG.aptBright), cuisine: "Daily rent apartment", rating: 8.8, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Apartment", address: "Gorgasali St 5, Old Tbilisi", addressKa: "გორგასლის ქ. 5, ძველი თბილისი", fromPerNight: 110, reviews: 64, vip: "", rooms: 1, floor: "3/4", checkIn: "14:00", checkOut: "11:00",
      gallery: [img(IMG.aptBright, 800), img(IMG.sunsetBed, 800)],
      amenities: ["Free Wi-Fi", "Kitchenette", "Air conditioning"],
      about: "Cosy studio steps from the sulfur baths and Leghvtakhevi waterfall." } },
  { id: "batumi_sea_apartment", name: "Sea view apartment in Batumi", area: "Batumi, New Boulevard", ka: { name: "ზღვის ხედიანი ბინა ბათუმში", area: "ბათუმი, ახალი ბულვარი" }, lat: 41.6339, lng: 41.6152, image: img(IMG.aptKitchen), cuisine: "Daily rent apartment", rating: 9.0, etaMin: 0, etaMax: 0, deliveryFee: 0,
    meta: { type: "Apartment", address: "Sherif Khimshiashvili St 7, Batumi", addressKa: "შერიფ ხიმშიაშვილის ქ. 7, ბათუმი", fromPerNight: 130, reviews: 211, vip: "VIP", rooms: 2, floor: "24/40", checkIn: "14:00", checkOut: "12:00",
      gallery: [img(IMG.aptKitchen, 800), img(IMG.aptYellow, 800)],
      amenities: ["Sea view", "Pool", "Free Wi-Fi", "Kitchen", "Parking"],
      about: "24th-floor apartment on the New Boulevard with a full sea view, 3 min to the beach." } },
];

const catalog: Item[] = [
  ...rooms("biltmore", [
    { key: "deluxe_king", name: "Deluxe King Room", ka: "დელუქს ქინგ ოთახი", bedKa: "1 ქინგ საწოლი", viewKa: "ხედი რუსთაველზე", perNight: 690, image: IMG.kingDark, bed: "1 King bed", size: 38, view: "Rustaveli Ave view", guests: 2,
      desc: "Floor-to-ceiling windows, rain shower, Nespresso, smart TV.", tags: ["deluxe", "king", "double", "hotel"], options: hotelOptions(140, 150, 120, 180) },
    { key: "deluxe_twin", name: "Deluxe Twin Room", ka: "დელუქს ტვინ ოთახი", bedKa: "2 ერთადგილიანი საწოლი", viewKa: "ხედი რუსთაველზე", perNight: 690, image: IMG.twin, bed: "2 Single beds", size: 38, view: "Rustaveli Ave view", guests: 2,
      desc: "Two single beds, work desk, rain shower.", tags: ["deluxe", "twin", "hotel"], options: hotelOptions(140, 150, 120, 180) },
    { key: "executive_king", name: "Executive King Room", ka: "ექსეკუტივ ქინგ ოთახი", bedKa: "1 ქინგ საწოლი", viewKa: "პანორამული ხედი ქალაქზე", perNight: 890, image: IMG.classic, bed: "1 King bed", size: 45, view: "Panoramic city view", guests: 2,
      desc: "High floor, Executive Lounge access, evening canapés.", tags: ["executive", "king", "hotel", "lounge"], options: hotelOptions(140, 150, 120) },
    { key: "panorama_suite", name: "Panorama Suite", ka: "პანორამული ლუქსი", bedKa: "1 ქინგ საწოლი", viewKa: "360° ხედი ძველ თბილისზე", perNight: 1650, image: IMG.panorama, bed: "1 King bed", size: 92, view: "360° Old Tbilisi view", guests: 3,
      desc: "Separate living room, soaking tub, butler service.", tags: ["suite", "luxury", "hotel"], options: hotelOptions(210, 0, 0) },
  ]),
  ...rooms("stamba", [
    { key: "standard", name: "Stamba Standard Double", ka: "სტამბა სტანდარტული ორადგილიანი", bedKa: "1 ქუინ საწოლი", viewKa: "ხედი ეზოზე", perNight: 610, image: IMG.moody, bed: "1 Queen bed", size: 32, view: "Courtyard view", guests: 2,
      desc: "Industrial design, record player, freestanding tub.", tags: ["double", "queen", "hotel"], options: hotelOptions(120, 120, 110) },
    { key: "loft", name: "Stamba Loft Suite", ka: "სტამბა ლოფტ ლუქსი", bedKa: "1 ქინგ საწოლი", viewKa: "ხედი ატრიუმზე", perNight: 980, image: IMG.tufted, bed: "1 King bed", size: 60, view: "Atrium view", guests: 2,
      desc: "Double-height loft with a library wall.", tags: ["suite", "loft", "hotel"], options: hotelOptions(120, 120, 110) },
  ]),
  ...rooms("rooms_tbilisi", [
    { key: "medium", name: "Medium Room", ka: "საშუალო ოთახი", bedKa: "1 ქუინ საწოლი", viewKa: "ხედი ქუჩაზე", perNight: 420, image: IMG.orangeBed, bed: "1 Queen bed", size: 26, view: "Street view", guests: 2,
      desc: "Vintage furniture, oak floors.", tags: ["double", "hotel"], options: hotelOptions(90, 90, 100) },
    { key: "terrace", name: "Large Room with Terrace", ka: "დიდი ოთახი ტერასით", bedKa: "1 ქუინ საწოლი", viewKa: "ხედი ბაღზე", perNight: 560, image: IMG.sofaRoom, bed: "1 Queen bed", size: 34, view: "Garden view", guests: 2,
      desc: "Private terrace over the garden.", tags: ["terrace", "hotel"], options: hotelOptions(90, 90, 100) },
  ]),
  ...rooms("radisson_iveria", [
    { key: "superior", name: "Superior Double Room", ka: "სუპერიორ ორადგილიანი ოთახი", bedKa: "1 ქუინ საწოლი", viewKa: "ხედი ქალაქზე", perNight: 480, image: IMG.hotelRoom, bed: "1 Queen bed", size: 30, view: "City view", guests: 2,
      desc: "Balcony, minibar, work desk.", tags: ["double", "superior", "hotel"], options: hotelOptions(110, 100, 100, 90) },
    { key: "business", name: "Business Class Room", ka: "ბიზნეს კლასის ოთახი", bedKa: "1 ქუინ საწოლი", viewKa: "ხედი მდინარეზე", perNight: 620, image: IMG.sunsetBed, bed: "1 Queen bed", size: 34, view: "River view", guests: 2,
      desc: "Business lounge access and river balcony.", tags: ["business", "hotel"], options: hotelOptions(110, 100, 100) },
  ]),
  ...rooms("vake_apartment", [
    { key: "apt", name: "Whole apartment (2 rooms)", ka: "მთლიანი ბინა (2 ოთახი)", bedKa: "1 ორადგილიანი + გასაშლელი დივანი", viewKa: "ხედი პარკზე", perNight: 160, image: IMG.aptLiving, bed: "1 Double + sofa bed", size: 68, view: "Park view", guests: 4,
      desc: "Self check-in, fully equipped kitchen.", tags: ["apartment", "flat", "vake", "ბინა", "ვაკე"], options: aptOptions(40, 70) },
  ]),
  ...rooms("old_tbilisi_loft", [
    { key: "apt", name: "Whole loft (2 rooms)", ka: "მთლიანი ლოფტი (2 ოთახი)", bedKa: "1 ორადგილიანი საწოლი", viewKa: "ხედი ძველ ქალაქზე", perNight: 140, image: IMG.aptPlants, bed: "1 Double bed", size: 55, view: "Old Town view", guests: 3,
      desc: "Wooden balcony, wine-cellar-style kitchen.", tags: ["apartment", "flat", "loft", "old", "tbilisi", "ბინა"], options: aptOptions(30, 70) },
  ]),
  ...rooms("abanotubani_studio", [
    { key: "studio", name: "Studio apartment", ka: "სტუდიო ბინა", bedKa: "1 ორადგილიანი საწოლი", viewKa: "ხედი ეზოზე", perNight: 110, image: IMG.aptBright, bed: "1 Double bed", size: 32, view: "Courtyard view", guests: 2,
      desc: "Compact studio with kitchenette.", tags: ["apartment", "studio", "flat", "ბინა"], options: aptOptions(30, 70) },
  ]),
  ...rooms("batumi_sea_apartment", [
    { key: "apt", name: "Sea view apartment (2 rooms)", ka: "ზღვის ხედიანი ბინა (2 ოთახი)", bedKa: "1 ორადგილიანი + გასაშლელი დივანი", viewKa: "ხედი შავ ზღვაზე", perNight: 130, image: IMG.aptKitchen, bed: "1 Double + sofa bed", size: 62, view: "Black Sea view", guests: 4,
      desc: "Balcony over the sea, pool access.", tags: ["apartment", "sea", "batumi", "flat", "beach", "ბინა", "ბათუმი", "ზღვის", "ხედიანი"], options: aptOptions(30, 90) },
  ]),
];

const tenant: Tenant = {
  id: "myhome",
  name: "myhome.ge",
  publishableKey: "pk_myhome_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 6000,
  serviceFee: 15, // myhome.ge booking fee
  savedPaymentMethod: "Visa •••• 4242",
  brandColor: "#26B571",
  persona:
    "You are myhome.ge's booking assistant for daily rentals and hotels in Georgia. Each item is one room type for fixed dates; its price is the total for all nights. " +
    "'This weekend' means Fri 23 – Sun 25 Oct 2026. One booking = one property. Extras (breakfast, late checkout, transfer, view upgrade) are options.",
  defaultLocation: { lat: 41.6968, lng: 44.7995, label: "Rustaveli Ave, Tbilisi", labelKa: "რუსთაველის გამზ., თბილისი" },
  venues,
  catalog,
};

export default tenant;
