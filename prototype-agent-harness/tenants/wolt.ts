// PROTOTYPE — throwaway. Mock catalog for Wolt.
import type { Item, Option, Tenant, Venue } from "./types";

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 0.62)}&fit=crop&auto=format`;
const IMG = {
  wrap: "1626700051175-6818013e1d4f",
  gyro: "1529006557810-274b9b2fc783",
  plate: "1561651823-34feb02250e4",
  cola: "1622483767028-3f66f32aef97",
  fries: "1630384060421-cb20d0e0649d",
  fries2: "1573080496219-bb080dd4f877",
  pizza: "1565299624946-b28f40a0ae38",
  pizza2: "1513104890138-7c749659a591",
  pizza3: "1574126154517-d1e0d89ef734",
  burger: "1568901346375-23c9450c58cd",
  burger2: "1594212699903-ec8a3eca50f5",
  chickenBurger: "1606755962773-d324e0a13086",
  sushi: "1579871494447-9811cf80d66c",
  sushi2: "1617196034796-73dfa7b1fd56",
  coffee: "1509042239860-f550ce710b93",
  coffee2: "1495474472287-4d71bcdd2085",
  grill: "1555939594-58d7cb561ad1",
  stew: "1541518763669-27fef04b14ea",
  sandwich: "1528735602780-2552fd46c7af",
};

// ---------- Wolt ----------

const shawarmaOptions = (): Option[] => [
  { id: "no_onion", name: "Without onion", ka: "ხახვის გარეშე", tags: ["ხახვი"], price: 0, group: "Remove ingredients" },
  { id: "no_peppers", name: "Without peppers", ka: "წიწაკის გარეშე", tags: ["წიწაკა"], price: 0, group: "Remove ingredients" },
  { id: "no_tomato", name: "Without tomato", ka: "პომიდვრის გარეშე", tags: ["პომიდორი"], price: 0, group: "Remove ingredients" },
  { id: "no_pickles", name: "Without pickles", ka: "მწნილის გარეშე", tags: ["მწნილი"], price: 0, group: "Remove ingredients" },
  { id: "no_garlic", name: "Without garlic sauce", ka: "ნივრის სოუსის გარეშე", tags: ["ნიორი", "ნივრის"], price: 0, group: "Remove ingredients" },
  { id: "extra_cheese", name: "Extra cheese", ka: "დამატებითი ყველი", tags: ["ყველი"], price: 1.5, group: "Extras" },
  { id: "extra_meat", name: "Extra meat", ka: "დამატებითი ხორცი", tags: ["ხორცი"], price: 3, group: "Extras" },
  { id: "spicy", name: "Spicy sauce", ka: "ცხარე სოუსი", tags: ["ცხარე"], price: 0.5, group: "Extras" },
];

const margeMenu = (venueId: string): Item[] => [
  { id: `${venueId}__small_shawarma`, venueId, category: "Shawarma", name: "Small Shawarma", price: 12, ka: "პატარა შაურმა", image: img(IMG.wrap, 300),
    description: "Chicken, garlic sauce, tomato, cucumber, pickles, onion, peppers, lavash.", tags: ["შაურმა", "პატარა", "shawarma", "chicken", "wrap", "small"], options: shawarmaOptions() },
  { id: `${venueId}__large_shawarma`, venueId, category: "Shawarma", name: "Large Shawarma", price: 15, ka: "დიდი შაურმა", image: img(IMG.wrap, 300),
    description: "Double chicken, garlic sauce, tomato, cucumber, pickles, onion, peppers, lavash.", tags: ["შაურმა", "დიდი", "shawarma", "chicken", "wrap", "large", "big"], options: shawarmaOptions() },
  { id: `${venueId}__beef_shawarma`, venueId, category: "Shawarma", name: "Beef Shawarma", price: 14, ka: "საქონლის შაურმა", image: img(IMG.gyro, 300),
    description: "Beef, tahini, tomato, onion, parsley, peppers.", tags: ["შაურმა", "საქონლის", "shawarma", "beef", "wrap"], options: shawarmaOptions() },
  { id: `${venueId}__shawarma_plate`, venueId, category: "Shawarma", name: "Shawarma Plate", price: 18, ka: "შაურმა თეფშზე", image: img(IMG.plate, 300),
    description: "Chicken shawarma on a plate with fries, salad and sauces.", tags: ["შაურმა", "თეფში", "shawarma", "plate", "fries"], options: shawarmaOptions() },
  { id: `${venueId}__fries`, venueId, category: "Sides", name: "French Fries", price: 4, ka: "კარტოფილი ფრი", image: img(IMG.fries, 300),
    description: "Crispy fries with salt.", tags: ["კარტოფილი", "ფრი", "fries", "potato", "side"] },
  { id: `${venueId}__cola`, venueId, category: "Drinks", name: "Coca-Cola Classic 0.5L", price: 3.5, ka: "კოკა-კოლა კლასიკი 0.5ლ", image: img(IMG.cola, 300),
    description: "Coca-Cola Original Taste, 0.5L bottle.", tags: ["კოკა", "კოლა", "კლასიკი", "0.5ლ", "coca-cola", "coca", "cola", "coke", "classic", "drink", "0.5l"] },
  { id: `${venueId}__cola_zero`, venueId, category: "Drinks", name: "Coca-Cola Zero 0.5L", price: 3.5, ka: "კოკა-კოლა ზერო 0.5ლ", image: img(IMG.cola, 300),
    description: "No sugar, 0.5L bottle.", tags: ["კოკა", "კოლა", "ზერო", "0.5ლ", "coca-cola", "coca", "cola", "coke", "zero", "drink", "0.5l"] },
  { id: `${venueId}__fanta`, venueId, category: "Drinks", name: "Fanta Orange 0.5L", price: 3.5, ka: "ფანტა ფორთოხალი 0.5ლ",
    description: "0.5L bottle.", tags: ["ფანტა", "0.5ლ", "fanta", "drink", "0.5l"] },
  { id: `${venueId}__ayran`, venueId, category: "Drinks", name: "Ayran", price: 3, ka: "აირანი",
    description: "Cold yogurt drink, 0.3L.", tags: ["აირანი", "ayran", "drink"] },
];

const woltVenues: Venue[] = [
  { id: "marge_gldani", name: "Marge", area: "Gldani", ka: { name: "მარჯი", area: "გლდანი" }, lat: 41.7958, lng: 44.8226, image: img(IMG.wrap), cuisine: "Shawarma", rating: 9.2, etaMin: 20, etaMax: 30, deliveryFee: 1.99 },
  { id: "marge_saburtalo", name: "Marge", area: "Saburtalo", ka: { name: "მარჯი", area: "საბურთალო" }, lat: 41.727, lng: 44.753, image: img(IMG.wrap), cuisine: "Shawarma", rating: 9.0, etaMin: 45, etaMax: 55, deliveryFee: 4.99 },
  { id: "marge_vake", name: "Marge", area: "Vake", ka: { name: "მარჯი", area: "ვაკე" }, lat: 41.7105, lng: 44.765, image: img(IMG.wrap), cuisine: "Shawarma", rating: 8.9, etaMin: 50, etaMax: 60, deliveryFee: 5.99 },
  { id: "shawarma_king", name: "Shawarma King", area: "Gldani", ka: { name: "შაურმა ქინგი", area: "გლდანი" }, lat: 41.802, lng: 44.835, image: img(IMG.gyro), cuisine: "Shawarma", rating: 8.4, etaMin: 25, etaMax: 35, deliveryFee: 2.49 },
  { id: "pizza_hut_gldani", name: "Pizza Napoli", area: "Gldani", ka: { name: "პიცა ნაპოლი", area: "გლდანი" }, lat: 41.789, lng: 44.817, image: img(IMG.pizza), cuisine: "Pizza", rating: 8.8, etaMin: 30, etaMax: 40, deliveryFee: 2.49 },
  { id: "mtsvadi_house", name: "Mtsvadi House", area: "Didube", ka: { name: "მწვადის სახლი", area: "დიდუბე" }, lat: 41.744, lng: 44.778, image: img(IMG.grill), cuisine: "Georgian", rating: 9.4, etaMin: 35, etaMax: 45, deliveryFee: 3.99 },
  { id: "burger_lab", name: "Burger Lab", area: "Gldani", ka: { name: "ბურგერ ლაბი", area: "გლდანი" }, lat: 41.793, lng: 44.829, image: img(IMG.burger), cuisine: "Burgers", rating: 9.0, etaMin: 25, etaMax: 35, deliveryFee: 1.99 },
  { id: "sushi_go", name: "Sushi Go", area: "Nadzaladevi", ka: { name: "სუში გო", area: "ნაძალადევი" }, lat: 41.76, lng: 44.79, image: img(IMG.sushi), cuisine: "Sushi", rating: 8.7, etaMin: 40, etaMax: 50, deliveryFee: 3.49 },
  { id: "coffee_lab", name: "Coffee Lab", area: "Gldani", ka: { name: "ქოფი ლაბი", area: "გლდანი" }, lat: 41.7905, lng: 44.8265, image: img(IMG.coffee), cuisine: "Coffee", rating: 9.5, etaMin: 15, etaMax: 25, deliveryFee: 1.49 },
];

const woltCatalog: Item[] = [
  ...margeMenu("marge_gldani"),
  ...margeMenu("marge_saburtalo"),
  ...margeMenu("marge_vake"),
  { id: "sk__chicken", venueId: "shawarma_king", category: "Shawarma", name: "Chicken Shawarma", price: 8, image: img(IMG.gyro, 300), description: "Chicken, garlic sauce, vegetables.", tags: ["shawarma", "chicken"], options: shawarmaOptions() },
  { id: "sk__cola", venueId: "shawarma_king", category: "Drinks", name: "Coca-Cola 0.5L", price: 3.8, image: img(IMG.cola, 300), description: "0.5L bottle.", tags: ["coca-cola", "cola", "coke", "drink"] },
  { id: "pn__margherita", venueId: "pizza_hut_gldani", category: "Pizza", name: "Margherita 30cm", price: 19, ka: "მარგარიტა 30სმ", image: img(IMG.pizza2, 300), description: "Tomato, mozzarella, basil.", tags: ["პიცა", "მარგარიტა", "pizza", "margherita", "vegetarian"] },
  { id: "pn__pepperoni", venueId: "pizza_hut_gldani", category: "Pizza", name: "Pepperoni 30cm", price: 23, ka: "პეპერონი 30სმ", image: img(IMG.pizza3, 300), description: "Tomato, mozzarella, pepperoni.", tags: ["პიცა", "პეპერონი", "pizza", "pepperoni"] },
  { id: "mh__mtsvadi", venueId: "mtsvadi_house", category: "Grill", name: "Pork Mtsvadi", price: 22, image: img(IMG.grill, 300), description: "Georgian BBQ skewers with onion and pomegranate.", tags: ["mtsvadi", "georgian", "bbq", "pork"] },
  { id: "mh__chashushuli", venueId: "mtsvadi_house", category: "Mains", name: "Chashushuli", price: 18, image: img(IMG.stew, 300), description: "Spicy Georgian beef stew.", tags: ["georgian", "stew", "beef"] },
  { id: "bl__classic", venueId: "burger_lab", category: "Burgers", name: "Classic Burger", price: 17, image: img(IMG.burger2, 300), description: "Beef patty, cheddar, pickles, house sauce.", tags: ["burger", "beef"] },
  { id: "bl__chicken", venueId: "burger_lab", category: "Burgers", name: "Crispy Chicken Burger", price: 16, image: img(IMG.chickenBurger, 300), description: "Crispy chicken, slaw, spicy mayo.", tags: ["burger", "chicken"] },
  { id: "bl__fries", venueId: "burger_lab", category: "Sides", name: "Fries", price: 5, image: img(IMG.fries2, 300), description: "Skin-on fries.", tags: ["fries", "side"] },
  { id: "sg__set", venueId: "sushi_go", category: "Sets", name: "Philadelphia Set (24 pcs)", price: 45, image: img(IMG.sushi2, 300), description: "Salmon, cream cheese, cucumber.", tags: ["sushi", "salmon", "set"] },
  { id: "cl__cappuccino", venueId: "coffee_lab", category: "Coffee", name: "Cappuccino", price: 7, ka: "კაპუჩინო", image: img(IMG.coffee2, 300), description: "Double shot, whole milk.", tags: ["კაპუჩინო", "ყავა", "coffee", "cappuccino"] },
  { id: "cl__sandwich", venueId: "coffee_lab", category: "Food", name: "Club Sandwich", price: 13, ka: "კლაბ სენდვიჩი", image: img(IMG.sandwich, 300), description: "Chicken, bacon, egg, lettuce.", tags: ["კლაბ", "სენდვიჩი", "sandwich", "breakfast"] },
];

const tenant: Tenant =
{
    id: "wolt",
    name: "Wolt",
    publishableKey: "pk_wolt_demo",
    currency: "GEL",
    currencySymbol: "₾",
    perOrderLimit: 150,
    serviceFee: 0.99,
    savedPaymentMethod: "Visa •••• 4242",
    brandColor: "#009de0",
    persona: "You help users order food delivery from restaurants near them. One order = one restaurant.",
    defaultLocation: { lat: 41.7915, lng: 44.828, label: "Gldani, III m/r, bldg 12", labelKa: "გლდანი, III მ/რ, კორპ. 12" },
    venues: woltVenues,
    catalog: woltCatalog,
  };

export default tenant;
