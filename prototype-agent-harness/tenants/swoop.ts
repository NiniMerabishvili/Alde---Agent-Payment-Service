// PROTOTYPE — throwaway. Mock deal catalog for swoop.ge (Georgian deals / vouchers site).
// Venue = the business selling the deal; Item = one deal (voucher). meta.oldPrice / meta.discount / meta.sold / meta.validUntil.
// TEST CASE: "Buy 2 vouchers for a private sulfur bath room at the nearest bathhouse" → 2× private room at Chreli Abano.
// KA TEST CASE: "იყიდე 2 ვაუჩერი გოგირდის აბანოს კერძო ოთახზე უახლოეს აბანოში" → the same order.
// NB: keep the digit "2" out of bathhouse item names/tags so "2" in the test case is only read as the quantity.
import type { Item, Option, Tenant, Venue } from "./types";

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 0.62)}&fit=crop&auto=format`;
const IMG = { // each id verified 200 + visually checked (contact sheet)
  tbilisi: "1565008576549-57569a49371d", // Tbilisi old town panorama
  plunge: "1560750588-73207b1ef5b8", // private room with plunge pool
  sauna: "1583416750470-965b2707b355", // wooden sauna suite
  hotstone: "1600334089648-b0d9d3028eb2", // hot stone massage
  spaTowel: "1540555700478-4be289fbecef", // spa towel & oil
  paraglide: "1601024445121-e5b82f020549",
  clouds: "1506905925346-21bda4d32df4", // peaks above clouds
  ski: "1551524559-8af4e6624178", // skier
  vineyard: "1506377247377-2a5b3b417ebb",
  wineToast: "1510812431401-41d2bd2722f3",
  dining: "1414235077428-338989a2e8c0",
  restInterior: "1517248135467-4c7edcad34c4",
  steak: "1600891964092-4316c288032e",
  grill: "1555939594-58d7cb561ad1",
  stew: "1541518763669-27fef04b14ea",
  hotelPool: "1571896349842-33c89424de2d",
  hotelRoom: "1582719478250-c89cae4dc85b",
  hotelRoom2: "1611892440504-42a792e24d32",
};

const deal = (oldPrice: number, price: number, sold: number, extra: Record<string, any> = {}) => ({
  oldPrice, discount: Math.round((1 - price / oldPrice) * 100), sold, validUntil: "31.03.2027", endsInHours: 18 + (sold % 53), ...extra,
});

// ---------- sulfur bathhouses (Abanotubani) ----------
const bathOptions = (): Option[] => [
  { id: "gift_box", name: "Gift voucher in a box", ka: "სასაჩუქრე ყუთი", tags: ["სასაჩუქრე", "საჩუქრად", "ყუთით"], price: 5, group: "Gift" },
  { id: "extra_hour", name: "Extra hour", ka: "დამატებითი საათი", tags: ["დამატებით"], price: 45, group: "Extras" },
  { id: "kisi", name: "Kisi scrub", ka: "ქისით პილინგი", tags: ["ქისა", "ქისით"], price: 25, group: "Extras" },
  { id: "tea_set", name: "Tea & churchkhela set", ka: "ჩაი და ჩურჩხელა", tags: ["ჩაი", "ჩაით", "ჩურჩხელა"], price: 12, group: "Extras" },
];

const bathMenu = (venueId: string, k: number): Item[] => [
  { id: `${venueId}__private_room`, venueId, category: "Sulfur baths", name: "Private Sulfur Bath Room — 1 hour", ka: "გოგირდის აბანო — კერძო ოთახი (1 საათი)",
    price: 79 + k, image: img(IMG.plunge, 300),
    description: "Private room with a hot sulfur pool, cold plunge pool, shower and a rest area. Up to 4 guests. Towels & slippers included.",
    tags: ["voucher", "private", "room", "sulfur", "bath", "bathhouse", "abano", "ვაუჩერი", "კერძო", "ოთახი", "გოგირდის", "აბანო"], options: bathOptions(),
    meta: deal(140 + k * 2, 79 + k, 1840 - k * 211, { guests: "up to 4 guests", duration: "1 hour" }) },
  { id: `${venueId}__public_bath`, venueId, category: "Sulfur baths", name: "Public Sulfur Bath — Entry", ka: "საზოგადო გოგირდის აბანო — შესვლა",
    price: 15, image: img(IMG.tbilisi, 300),
    description: "Entry to the public sulfur bath hall (separate men's and women's halls). Towel included.",
    tags: ["voucher", "public", "sulfur", "bath", "entry", "ვაუჩერი", "საზოგადო", "გოგირდის", "აბანო"], options: bathOptions().slice(0, 1),
    meta: deal(25, 15, 3120 - k * 300, { guests: "1 person", duration: "unlimited" }) },
  { id: `${venueId}__room_kisi`, venueId, category: "Bath & massage", name: "Private Room + Kisi Scrub Massage", ka: "კერძო ოთახი + ქისით პილინგი და მასაჟი",
    price: 129 + k, image: img(IMG.hotstone, 300),
    description: "1 hour in a private sulfur room plus a traditional kisi scrub & soap massage by a mekise for two guests.",
    tags: ["voucher", "kisi", "scrub", "massage", "mekise", "ვაუჩერი", "მასაჟი", "მექისე"], options: bathOptions(),
    meta: deal(220, 129 + k, 960 - k * 90, { guests: "two guests", duration: "1 hour" }) },
  { id: `${venueId}__vip_suite`, venueId, category: "Bath & massage", name: "VIP Suite with Sauna & Pool — two hours", ka: "VIP ლუქსი საუნით და აუზით — ორი საათი",
    price: 219 + k, image: img(IMG.sauna, 300),
    description: "Largest suite: sulfur pool, Finnish sauna, lounge with TV, tea service. Up to 6 guests.",
    tags: ["voucher", "vip", "suite", "sauna", "pool", "ვაუჩერი", "ლუქსი", "საუნა", "აუზი"], options: bathOptions(),
    meta: deal(360, 219 + k, 310 - k * 40, { guests: "up to 6 guests", duration: "two hours" }) },
];

const bathVenue = (id: string, name: string, nameKa: string, lat: number, lng: number, rating: number, address: string, image = IMG.tbilisi): Venue => ({
  id, name, ka: { name: nameKa, area: "აბანოთუბანი" }, area: "Abanotubani", lat, lng, image: img(image), cuisine: "Sulfur bathhouse", rating, etaMin: 0, etaMax: 0, deliveryFee: 0,
  meta: { section: "Leisure", address, hours: "08:00 – 24:00", phone: "+995 32 2 00 00 00" },
});

// ---------- venues ----------
const venues: Venue[] = [
  bathVenue("chreli_abano", "Chreli Abano", "ჭრელი აბანო", 41.6886, 44.8088, 4.8, "1 Abano St, Abanotubani (the blue mosaic façade)"),
  bathVenue("gulos_spa", "Gulo's Thermal Spa", "გულოს თერმული სპა", 41.6880, 44.8100, 4.7, "4 Abano St, Abanotubani", IMG.plunge),
  bathVenue("royal_bath", "Royal Bath", "სამეფო აბანო", 41.6876, 44.8106, 4.6, "2 Grishashvili St, Abanotubani", IMG.sauna),
  bathVenue("abano_5", "Abano N5", "აბანო N5", 41.6872, 44.8113, 4.5, "5 Abano St, Abanotubani", IMG.hotstone),
  { id: "vake_wellness", ka: { name: "ვაკის ველნეს სპა", area: "ვაკე" }, name: "Vake Wellness Spa", area: "Vake", lat: 41.7119, lng: 44.7560, image: img(IMG.spaTowel), cuisine: "Spa & massage", rating: 4.7,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Aesthetics", address: "14 Abashidze St, Vake", hours: "10:00 – 22:00" } },
  { id: "gudauri_fly", ka: { name: "გუდაურის პარაგლაიდინგ კლუბი", area: "გუდაური" }, name: "Gudauri Paragliding Club", area: "Gudauri", lat: 42.4770, lng: 44.4790, image: img(IMG.paraglide), cuisine: "Adventure", rating: 4.9,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Entertainment", address: "Gudauri, Kobi Ropeway upper station", hours: "Weather permitting" } },
  { id: "kakheti_tours", ka: { name: "კახეთის ღვინის ტურები", area: "სიღნაღი" }, name: "Kakheti Wine Tours", area: "Sighnaghi", lat: 41.6197, lng: 45.9218, image: img(IMG.vineyard), cuisine: "Wine tour", rating: 4.8,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Leisure", address: "Pick-up: Freedom Square, Tbilisi", hours: "Daily 09:00" } },
  { id: "borjomi_palace", ka: { name: "ბორჯომი პალასი — სასტუმრო და სპა", area: "ბორჯომი" }, name: "Borjomi Palace Hotel & Spa", area: "Borjomi", lat: 41.8406, lng: 43.3897, image: img(IMG.hotelPool), cuisine: "Hotel", rating: 4.6,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Leisure", address: "Rustaveli St 48, Borjomi", hours: "Check-in 14:00" } },
  { id: "bakuriani_inn", ka: { name: "ბაკურიანი ინი", area: "ბაკურიანი" }, name: "Bakuriani Inn", area: "Bakuriani", lat: 41.7500, lng: 43.5290, image: img(IMG.ski), cuisine: "Hotel", rating: 4.5,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Leisure", address: "Didveli slope, Bakuriani", hours: "Check-in 14:00" } },
  { id: "barbarestan", ka: { name: "ბარბარესთან", area: "მარჯანიშვილი" }, name: "Barbarestan", area: "Marjanishvili", lat: 41.7106, lng: 44.7973, image: img(IMG.dining), cuisine: "Georgian restaurant", rating: 4.9,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Food", address: "132 Aghmashenebeli Ave", hours: "12:00 – 23:00" } },
  { id: "vake_khinkali", ka: { name: "ხინკლის სახლი ვაკე", area: "ვაკე" }, name: "Khinkali House Vake", area: "Vake", lat: 41.7085, lng: 44.7630, image: img(IMG.grill), cuisine: "Georgian restaurant", rating: 4.6,
    etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { section: "Food", address: "35 Chavchavadze Ave, Vake", hours: "11:00 – 01:00" } },
];

const catalog: Item[] = [
  ...bathMenu("chreli_abano", 0),
  ...bathMenu("gulos_spa", 6),
  ...bathMenu("royal_bath", 3),
  ...bathMenu("abano_5", -4),
  { id: "vw__hotstone", ka: "ცხელი ქვებით მასაჟი — 60 წთ", venueId: "vake_wellness", category: "Massage", name: "Hot Stone Massage — 60 min", price: 69, image: img(IMG.hotstone, 300),
    description: "Full body massage with warm basalt stones and aroma oil.", tags: ["voucher", "massage", "hot", "stone", "spa", "მასაჟი", "ქვებით", "სპა", "ვაუჩერი"],
    options: [{ id: "gift_box", name: "Gift voucher in a box", ka: "სასაჩუქრე ყუთი", tags: ["სასაჩუქრე", "საჩუქრად", "ყუთით"], price: 5, group: "Gift" }, { id: "extra_30", name: "Extra 30 minutes", ka: "დამატებითი 30 წუთი", price: 30, group: "Extras" }],
    meta: deal(130, 69, 2270) },
  { id: "vw__couples", ka: "სპა დღე წყვილისთვის — მასაჟი, საუნა, აუზი", venueId: "vake_wellness", category: "Spa day", name: "Couples Spa Day — massage, sauna, pool", price: 149, image: img(IMG.spaTowel, 300),
    description: "Two 60-minute massages, sauna and pool access, fruit plate and prosecco.", tags: ["voucher", "spa", "couple", "massage", "sauna", "pool", "სპა", "წყვილი", "მასაჟი", "ვაუჩერი"],
    options: [{ id: "gift_box", name: "Gift voucher in a box", ka: "სასაჩუქრე ყუთი", tags: ["სასაჩუქრე", "საჩუქრად", "ყუთით"], price: 5, group: "Gift" }], meta: deal(290, 149, 845) },
  { id: "vw__yoga", ka: "8 იოგის გაკვეთილი — თვის აბონემენტი", venueId: "vake_wellness", category: "Wellness", name: "8 Yoga Classes — monthly pass", price: 89, image: img(IMG.spaTowel, 300),
    description: "Hatha & vinyasa yoga, any 8 classes within 30 days.", tags: ["voucher", "yoga", "sport", "class", "იოგა", "იოგის", "ვაუჩერი"], meta: deal(160, 89, 412) },
  { id: "gf__tandem", ka: "ტანდემ ფრენა პარაპლანით გუდაურში", venueId: "gudauri_fly", category: "Paragliding", name: "Tandem Paragliding Flight over Gudauri", price: 179, image: img(IMG.paraglide, 300),
    description: "15–20 minute tandem flight with a certified pilot from 2,950 m. Hotel pick-up in Gudauri.", tags: ["voucher", "paragliding", "tandem", "flight", "fly", "adventure", "პარაპლანი", "პარაგლაიდინგი", "ფრენა", "ტანდემ", "გუდაური", "ვაუჩერი"],
    options: [{ id: "video", name: "GoPro video & photos", ka: "GoPro ვიდეო და ფოტოები", tags: ["ვიდეოთი", "ვიდეო"], price: 40, group: "Extras" }, { id: "gift_box", name: "Gift voucher in a box", ka: "სასაჩუქრე ყუთი", tags: ["სასაჩუქრე", "საჩუქრად", "ყუთით"], price: 5, group: "Gift" }],
    meta: deal(250, 179, 1530, { duration: "15–20 min" }) },
  { id: "gf__panorama", ka: "პანორამული ფრენა — 30 წთ", venueId: "gudauri_fly", category: "Paragliding", name: "Panorama Flight — 30 min", price: 249, image: img(IMG.clouds, 300),
    description: "Long panorama flight over the Caucasus ridge and the Friendship Monument.", tags: ["voucher", "paragliding", "flight", "panorama", "პარაპლანი", "ფრენა", "პანორამული", "ვაუჩერი"],
    options: [{ id: "video", name: "GoPro video & photos", ka: "GoPro ვიდეო და ფოტოები", tags: ["ვიდეოთი", "ვიდეო"], price: 40, group: "Extras" }], meta: deal(350, 249, 388) },
  { id: "kt__classic", ka: "კახეთის ღვინის ტური სუფრით", venueId: "kakheti_tours", category: "Wine tours", name: "Kakheti Wine Tour with Supra Lunch", price: 79, image: img(IMG.wineToast, 300),
    description: "Full-day tour: Sighnaghi, Bodbe Monastery, two family wineries with qvevri tastings and a Georgian supra lunch.", tags: ["voucher", "wine", "tour", "kakheti", "tasting", "lunch", "ღვინის", "ტური", "კახეთში", "კახეთი", "ვაუჩერი"],
    options: [{ id: "chacha", name: "Chacha masterclass", ka: "ჭაჭის მასტერკლასი", price: 20, group: "Extras" }], meta: deal(140, 79, 2650, { duration: "10 hours" }) },
  { id: "kt__tasting", ka: "ქვევრის ღვინის დეგუსტაცია — 6 ღვინო", venueId: "kakheti_tours", category: "Wine tours", name: "Qvevri Wine Tasting — 6 wines", price: 35, image: img(IMG.vineyard, 300),
    description: "Tasting of 6 qvevri wines with cheese and churchkhela at a family marani in Sighnaghi.", tags: ["voucher", "wine", "tasting", "qvevri", "ღვინო", "დეგუსტაცია", "ქვევრის", "ვაუჩერი"], meta: deal(60, 35, 1104) },
  { id: "bp__weekend", ka: "შაბათ-კვირა ბორჯომში ორისთვის — საუზმე და სპა", venueId: "borjomi_palace", category: "Hotels", name: "Borjomi Weekend for Two — breakfast & spa", price: 299, image: img(IMG.hotelRoom2, 300),
    description: "Two nights in a Superior room for two, breakfast buffet, spa & pool, late check-out.", tags: ["voucher", "hotel", "weekend", "borjomi", "spa", "pool", "სასტუმრო", "ბორჯომი", "ვაუჩერი"],
    options: [{ id: "dinner", name: "Dinner for two", ka: "ვახშამი ორისთვის", price: 90, group: "Extras" }], meta: deal(520, 299, 640, { nights: "two nights" }) },
  { id: "bi__ski", ka: "სათხილამურო დასვენება ბაკურიანში — 3 ღამე", venueId: "bakuriani_inn", category: "Hotels", name: "Bakuriani Ski Getaway — 3 nights", price: 389, image: img(IMG.hotelRoom, 300),
    description: "Three nights for two with breakfast and dinner, ski storage, shuttle to Didveli.", tags: ["voucher", "hotel", "ski", "bakuriani", "winter", "სასტუმრო", "ბაკურიანი", "თხილამური", "ვაუჩერი"],
    options: [{ id: "skipass", name: "Ski pass for two", ka: "სათხილამურო საშვი ორისთვის", price: 120, group: "Extras" }], meta: deal(640, 389, 233) },
  { id: "bb__dinner", ka: "დეგუსტაციური ვახშამი ორისთვის ბარბარესთანში", venueId: "barbarestan", category: "Restaurants", name: "Barbarestan Tasting Dinner for Two", price: 120, image: img(IMG.steak, 300),
    description: "5-course tasting menu from the 19th-century Duchess Barbare cookbook, with a bottle of Saperavi.", tags: ["voucher", "dinner", "restaurant", "tasting", "wine", "ვახშამი", "რესტორანი", "ვაუჩერი"],
    meta: deal(200, 120, 1388) },
  { id: "kh__set", ka: "ხინკლის ნადიმი — 20 ხინკალი + მწვადი", venueId: "vake_khinkali", category: "Restaurants", name: "Khinkali Feast — 20 khinkali + mtsvadi", price: 39, image: img(IMG.grill, 300),
    description: "20 khinkali, pork mtsvadi, Georgian salad and lemonade for 3–4 people.", tags: ["voucher", "khinkali", "mtsvadi", "restaurant", "food", "ხინკალი", "მწვადი", "რესტორანი", "ვაუჩერი"],
    meta: deal(70, 39, 5210) },
  { id: "kh__chashushuli", ka: "სადილი ორისთვის — ჩაშუშული და ხაჭაპური", venueId: "vake_khinkali", category: "Restaurants", name: "Lunch for Two — chashushuli & khachapuri", price: 29, image: img(IMG.stew, 300),
    description: "Chashushuli, Imeretian khachapuri, salad and two drinks.", tags: ["voucher", "lunch", "khachapuri", "restaurant", "food", "ჩაშუშული", "ხაჭაპური", "სადილი", "ვაუჩერი"],
    meta: deal(48, 29, 1760) },
];

const tenant: Tenant = {
  id: "swoop",
  name: "Swoop",
  publishableKey: "pk_swoop_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 1000,
  serviceFee: 1,
  savedPaymentMethod: "Visa •••• 4242",
  brandColor: "#FFE100",
  persona:
    "You help users buy discounted deal vouchers on Swoop (hotels, spas, sulfur baths, restaurants, activities, travel in Georgia). " +
    "Items are deals; meta.oldPrice is the original price. One order = one business. Each purchased unit becomes one voucher code.",
  defaultLocation: { lat: 41.7097, lng: 44.7608, label: "Vake, Chavchavadze Ave 37", labelKa: "ვაკე, ჭავჭავაძის გამზ. 37" },
  venues,
  catalog,
};

export default tenant;
