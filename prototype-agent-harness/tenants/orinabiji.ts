// PROTOTYPE — throwaway. Mock catalog for 2 Nabiji (orinabiji.ge / 2nabiji.ge) — Georgian grocery chain with online delivery.
// Venues = 2 Nabiji branches (delivery comes from the nearest one); every branch carries the same assortment.
// TEST CASE: "Order 2 Sante milk 1L, a Shoti bread, 10 eggs and a Borjomi 1L from the nearest 2 Nabiji"
//   → nearest branch (Saburtalo): 2× Sante milk 1L, 1× Shoti bread, 1× Eggs 10 pcs, 1× Borjomi 1L.
// Naming note for the mock planner: only Borjomi 1L is short ("Mineral Water Borjomi 1L"); the 0.5L carries extra words
// so that "Borjomi 1L" resolves to the 1L bottle even after "1L" has been consumed by the milk line.
import type { Item, Option, Tenant, Venue } from "./types";

// Store image: the 2 Nabiji mark drawn as an inline SVG (no external images needed).
const LOGO = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#f6f7f9"/>` +
  `<rect x="22" y="22" width="76" height="76" rx="18" fill="#fff" stroke="#9bd30b" stroke-width="9"/>` +
  `<path d="M42 38h26a12 12 0 0 1 0 24H42z" fill="#007a3e"/><path d="M42 58h30v0a14 14 0 0 1-14 8H42z" fill="#007a3e"/>` +
  `<rect x="42" y="68" width="36" height="12" fill="#007a3e"/></svg>`);

const ripeness = (): Option[] => [
  { id: "ripe", name: "Ripe", ka: "მწიფე", tags: ["მწიფე"], price: 0, group: "Ripeness" },
  { id: "green", name: "Green", ka: "მწვანე", tags: ["მწვანე", "მკვახე"], price: 0, group: "Ripeness" },
];

type Row = [key: string, category: string, name: string, price: number, emoji: string, tags: string[], description: string, extra?: Partial<Item> & { oldPrice?: number }];
const ROWS: Row[] = [
  // Dairy & Eggs
  ["milk_sante", "Dairy Products", 'Milk "Sante" 3.2% 1L', 3.45, "🥛", ["milk", "dairy"], "Pasteurised cow's milk, 3.2% fat, 1L carton."],
  ["milk_soplis", "Dairy Products", 'Village Milk "Soplis" 3.2% 1L', 3.95, "🥛", ["milk", "dairy", "village"], "Farm milk from Kakheti, 1L bottle."],
  ["kefir_sante", "Dairy Products", 'Kefir "Sante" 2.5% 1L', 3.65, "🥛", ["kefir", "dairy"], "Classic kefir, 2.5% fat."],
  ["matsoni_sante", "Dairy Products", 'Matsoni "Sante" 3.2% 500g', 2.75, "🥣", ["matsoni", "yogurt", "dairy"], "Traditional Georgian matsoni, glass jar."],
  ["eggs10", "Dairy Products", "Eggs C1, 10 pcs", 4.99, "🥚", ["egg", "eggs"], "Fresh Georgian farm eggs, category C1, pack of 10."],
  ["eggs30", "Dairy Products", "Eggs C1, 30 pcs tray", 13.9, "🥚", ["egg", "eggs", "tray"], "Fresh farm eggs, category C1, tray of 30."],
  ["sulguni", "Dairy Products", "Sulguni Cheese, 500g", 9.49, "🧀", ["sulguni", "cheese", "dairy"], "Brined Megrelian cheese, mild and stretchy."],
  ["imeruli", "Dairy Products", "Imeruli Cheese, 500g", 8.49, "🧀", ["imeruli", "cheese", "dairy"], "Fresh Imeretian cheese — the khachapuri classic."],
  ["butter", "Dairy Products", 'Butter "President" 82% 200g', 5.99, "🧈", ["butter", "dairy"], "French butter, 82% fat.", { oldPrice: 8.55 }],
  // Bread & Bakery
  ["shoti", "Bakery", "Shoti Bread", 1.0, "🥖", ["bread", "shoti", "tone", "puri"], "Georgian tone bread, baked fresh in the branch every morning."],
  ["lavashi", "Bakery", "Lavashi, 5 pcs", 2.2, "🫓", ["lavash", "lavashi", "flatbread"], "Thin Armenian-style flatbread, 5 sheets."],
  ["toast", "Bakery", "Toast Bread Sliced, 500g", 2.95, "🍞", ["bread", "toast", "sliced"], "Soft white sandwich loaf."],
  ["croissant", "Bakery", "Croissant Classic", 1.6, "🥐", ["croissant", "pastry"], "All-butter croissant, baked in-store."],
  // Beverage
  ["borjomi05", "Beverage", 'Mineral Water "Borjomi" Glass Bottle 0.5L', 2.4, "💧", ["borjomi", "water", "mineral", "drink"], "Natural sparkling mineral water, glass bottle."],
  ["borjomi1", "Beverage", 'Mineral Water "Borjomi" 1L', 3.4, "💧", ["borjomi", "water", "mineral", "drink"], "Natural sparkling mineral water, 1L PET."],
  ["nabeghlavi", "Beverage", 'Mineral Water "Nabeghlavi" 1L', 1.29, "💧", ["nabeghlavi", "water", "mineral", "drink"], "Sparkling mineral water from Guria.", { oldPrice: 1.85 }],
  ["cola", "Beverage", "Coca-Cola 1L", 3.2, "🥤", ["coca-cola", "cola", "coke", "drink"], "1L PET bottle."],
  ["natakhtari", "Beverage", 'Lemonade "Natakhtari" Tarragon 1L', 2.6, "🍹", ["lemonade", "natakhtari", "tarragon", "tarkhuna", "drink"], "Georgian tarragon lemonade."],
  // Fruit & Vegetables
  ["apples", "Fruit & Vegetables", "Apples Golden, 1kg", 3.49, "🍏", ["apple", "fruit"], "Golden Delicious apples from Shida Kartli."],
  ["bananas", "Fruit & Vegetables", "Bananas, 1kg", 4.99, "🍌", ["banana", "fruit"], "Ecuador bananas — choose ripe or green.", { options: ripeness() }],
  ["tomatoes", "Fruit & Vegetables", "Tomatoes, 1kg", 5.49, "🍅", ["tomato", "tomatoes", "vegetable"], "Greenhouse tomatoes."],
  ["cucumbers", "Fruit & Vegetables", "Cucumbers, 1kg", 3.99, "🥒", ["cucumber", "vegetable"], "Crunchy local cucumbers."],
  ["onions", "Fruit & Vegetables", "Onions, 1kg", 1.35, "🧅", ["onion", "vegetable"], "Yellow onions."],
  ["potatoes", "Fruit & Vegetables", "Potatoes, 1kg", 1.49, "🥔", ["potato", "potatoes", "vegetable"], "Akhalkalaki potatoes."],
  // Meat & Poultry
  ["chicken_fillet", "Meat & Poultry", "Chicken Breast Fillet, 1kg", 15.9, "🍗", ["chicken", "fillet", "breast", "meat"], "Chilled Georgian chicken breast."],
  ["chicken_whole", "Meat & Poultry", "Whole Chicken, ~1.8kg", 14.5, "🐔", ["chicken", "whole", "meat"], "Chilled whole broiler."],
  ["beef_mince", "Meat & Poultry", "Minced Beef, 500g", 11.5, "🥩", ["beef", "mince", "minced", "meat"], "Fresh minced beef."],
  // Grocery
  ["pasta", "Grocery", 'Spaghetti "Barilla" No.5 500g', 4.89, "🍝", ["pasta", "spaghetti", "barilla"], "Italian durum wheat pasta."],
  ["rice", "Grocery", "Basmati Rice, 1kg", 6.49, "🍚", ["rice", "basmati"], "Long-grain basmati."],
  ["oil", "Grocery", "Sunflower Oil, 1L", 5.2, "🫙", ["oil", "sunflower"], "Refined sunflower oil."],
  ["sugar", "Grocery", "Sugar, 1kg", 2.79, "🧂", ["sugar"], "White granulated sugar."],
  ["buckwheat", "Grocery", "Buckwheat, 900g", 4.2, "🌾", ["buckwheat", "grain"], "Roasted buckwheat groats."],
  // Tea, Coffee & Cocoa
  ["coffee_jacobs", "Tea, Coffee & Cocoa", 'Instant Coffee "Jacobs Monarch" 95g', 11.9, "☕", ["coffee", "instant", "jacobs"], "Freeze-dried instant coffee."],
  ["coffee_lavazza", "Tea, Coffee & Cocoa", 'Ground Coffee "Lavazza Qualità Rossa" 250g', 13.5, "☕", ["coffee", "ground", "lavazza"], "Medium roast, for moka and filter.", { oldPrice: 16.9 }],
  ["tea", "Tea, Coffee & Cocoa", 'Black Tea "Gurieli" 25 bags', 3.6, "🍵", ["tea", "black", "gurieli"], "Georgian black tea."],
  // Sweets
  ["churchkhela", "Sweets & Ice Cream", "Churchkhela with Walnuts", 3.5, "🍬", ["churchkhela", "sweet", "walnut"], "Kakhetian grape-and-walnut candle."],
  ["chocolate", "Sweets & Ice Cream", 'Chocolate "Alpen Gold" Hazelnut 85g', 2.99, "🍫", ["chocolate", "sweet"], "Hazelnut chocolate bar."],
];

// Georgian display names (the mock planner matches against these too). Same naming rule as English: only Borjomi 1L is short.
const KA: Record<string, string> = {
  milk_sante: "რძე „სანტე“ 3.2% 1ლ", milk_soplis: "სოფლის რძე 3.2% 1ლ", kefir_sante: "კეფირი „სანტე“ 2.5% 1ლ",
  matsoni_sante: "მაწონი „სანტე“ 3.2% 500გ", eggs10: "კვერცხი C1, 10 ც", eggs30: "კვერცხი C1, 30 ც, კასეტა",
  sulguni: "სულგუნი, 500გ", imeruli: "იმერული ყველი, 500გ", butter: "კარაქი „პრეზიდენტი“ 82% 200გ",
  shoti: "შოთის პური", lavashi: "ლავაში, 5 ც", toast: "ტოსტის პური, დაჭრილი 500გ", croissant: "კრუასანი კლასიკური",
  borjomi05: "მინერალური წყალი „ბორჯომი“ მინის ბოთლი 0.5ლ", borjomi1: "მინერალური წყალი „ბორჯომი“ 1ლ",
  nabeghlavi: "მინერალური წყალი „ნაბეღლავი“ 1ლ", cola: "კოკა-კოლა 1ლ", natakhtari: "ლიმონათი „ნატახტარი“ ტარხუნა 1ლ",
  apples: "ვაშლი გოლდენი, 1კგ", bananas: "ბანანი, 1კგ", tomatoes: "პომიდორი, 1კგ", cucumbers: "კიტრი, 1კგ",
  onions: "ხახვი, 1კგ", potatoes: "კარტოფილი, 1კგ", chicken_fillet: "ქათმის მკერდის ფილე, 1კგ",
  chicken_whole: "მთლიანი ქათამი, ~1.8კგ", beef_mince: "საქონლის ფარში, 500გ", pasta: "სპაგეტი „ბარილა“ №5 500გ",
  rice: "ბასმატი ბრინჯი, 1კგ", oil: "მზესუმზირის ზეთი, 1ლ", sugar: "შაქარი, 1კგ", buckwheat: "წიწიბურა, 900გ",
  coffee_jacobs: "ხსნადი ყავა „იაკობს მონარქი“ 95გ", coffee_lavazza: "დაფქული ყავა „ლავაცა“ 250გ",
  tea: "შავი ჩაი „გურიელი“ 25 პაკეტი", churchkhela: "ჩურჩხელა ნიგვზით", chocolate: "შოკოლადი „ალპენ გოლდი“ თხილით 85გ",
};
// Extra Georgian search words (spoken forms without the case ending / synonyms)
const KA_TAGS: Record<string, string[]> = {
  shoti: ["შოთი", "პური"], toast: ["პური"], milk_sante: ["რძე"], milk_soplis: ["რძე"], eggs10: ["კვერცხი"], eggs30: ["კვერცხი"],
  borjomi1: ["ბორჯომი", "წყალი"], borjomi05: ["ბორჯომი", "წყალი"], nabeghlavi: ["ნაბეღლავი", "წყალი"], sulguni: ["ყველი"],
  chicken_fillet: ["ქათამი"], chicken_whole: ["ქათამი"], pasta: ["მაკარონი"], coffee_jacobs: ["ყავა"], coffee_lavazza: ["ყავა"],
};

const assortment = (venueId: string): Item[] =>
  ROWS.map(([key, category, name, price, emoji, tags, description, extra]) => {
    const { oldPrice, ...rest } = extra ?? {};
    return { id: `${venueId}__${key}`, venueId, category, name, ka: KA[key], price, description, tags: [...tags, ...(KA_TAGS[key] ?? [])], ...rest, meta: { emoji, ...(oldPrice ? { oldPrice } : {}) } };
  });

const ADDR_KA: Record<string, string> = { on_saburtalo: "ვაჟა-ფშაველას გამზ. 45", on_vake: "ჭავჭავაძის გამზ. 64", on_dighomi: "პეტრე ქავთარაძის ქ. 7",
  on_didube: "წერეთლის გამზ. 116", on_isani: "ნავთლუღის ქ. 39/41", on_gldani: "ხიზანიშვილის ქ. 12" };
const AREA_KA: Record<string, string> = { Saburtalo: "საბურთალო", Vake: "ვაკე", Dighomi: "დიღომი", Didube: "დიდუბე", Isani: "ისანი", Gldani: "გლდანი" };
const branch = (id: string, area: string, address: string, lat: number, lng: number, etaMin: number, etaMax: number, deliveryFee: number): Venue =>
  ({ id, name: "2 Nabiji", area, ka: { name: "ორი ნაბიჯი", area: AREA_KA[area] }, lat, lng, image: LOGO, cuisine: "Supermarket", rating: 4.7, etaMin, etaMax, deliveryFee, meta: { address, addressKa: ADDR_KA[id], hours: "08:00–24:00" } });

const venues: Venue[] = [
  branch("on_saburtalo", "Saburtalo", "Vazha-Pshavela Ave 45", 41.7262, 44.7468, 30, 45, 2.99),
  branch("on_vake", "Vake", "Chavchavadze Ave 64", 41.7095, 44.756, 40, 55, 3.99),
  branch("on_dighomi", "Dighomi", "Petre Kavtaradze St 7", 41.766, 44.748, 45, 60, 3.99),
  branch("on_didube", "Didube", "Tsereteli Ave 116", 41.748, 44.779, 45, 60, 4.49),
  branch("on_isani", "Isani", "Navtlughi St 39/41", 41.6905, 44.8335, 60, 80, 5.99),
  branch("on_gldani", "Gldani", "Khizanishvili St 12", 41.7955, 44.8235, 70, 90, 6.99),
];

const tenant: Tenant = {
  id: "orinabiji",
  name: "2 Nabiji",
  publishableKey: "pk_orinabiji_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 200,
  serviceFee: 0,
  savedPaymentMethod: "Visa •••• 4242",
  brandColor: "#007a3e",
  persona: "You are the 2 Nabiji grocery assistant. You build grocery delivery baskets from the nearest 2 Nabiji branch. One order = one branch. Use exact brand/size when the user names one.",
  defaultLocation: { lat: 41.7275, lng: 44.752, label: "Vazha-Pshavela Ave 37, Saburtalo", labelKa: "ვაჟა-ფშაველას გამზ. 37, საბურთალო" },
  venues,
  catalog: venues.flatMap((v) => assortment(v.id)),
};

export default tenant;
