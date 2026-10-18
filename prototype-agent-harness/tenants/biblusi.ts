// PROTOTYPE — throwaway. Mock catalog for Biblusi (biblusi.ge), Georgia's largest bookstore chain.
// Venue = a Biblusi store (ships from there; fee = delivery), Item = a book at that store (shared assortment).
// TEST CASE: "Buy Harry Potter and the Philosopher's Stone in Georgian with gift wrapping"
//   → 1× "Harry Potter and the Philosopher's Stone (Georgian)" + Gift wrapping, from the nearest store (Pekini).
import type { Item, Option, Tenant, Venue } from "./types";

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 0.62)}&fit=crop&auto=format`;
const IMG = {
  shelvesLights: "1481627834876-b7833e8f5570",
  woodCase: "1521587760476-6c12a4b040da",
  shelves: "1526243741027-444d633d7365",
  shelves2: "1507842217343-583bb7270b66",
  curved: "1524995997946-a1c2e315a42f",
  stacks: "1550399105-c4db5fb85c18",
  spines: "1495446815901-a7297e633e8d",
};

const bookOptions = (hardcoverPrice?: number): Option[] => [
  { id: "gift_wrap", name: "Gift wrapping", ka: "სასაჩუქრე შეფუთვა", tags: ["შეფუთვა", "სასაჩუქრე"], price: 3, group: "Gift" },
  { id: "gift_card", name: "Greeting card", ka: "მისალოცი ბარათი", tags: ["მისალოცი", "ბარათი", "ბარათით"], price: 2, group: "Gift" },
  ...(hardcoverPrice ? [{ id: "hardcover", name: "Hardcover", ka: "მაგარი ყდა", tags: ["მაგარი", "ყდა", "ყდით"], price: hardcoverPrice, group: "Edition" }] : []),
  { id: "bookmark", name: "Biblusi bookmark", ka: "ბიბლუსის სანიშნე", tags: ["სანიშნე", "სანიშნით"], price: 1.5, group: "Extras" },
];

// Georgian display names (Item.ka). Language words for search go into tags below.
const KA: Record<string, string> = {
  hp1_ka: "ჰარი პოტერი და ფილოსოფიური ქვა (ქართული)",
  hp1_en: "ჰარი პოტერი და ფილოსოფიური ქვა (ინგლისური)",
  hp2_ka: "ჰარი პოტერი და საიდუმლო ოთახი (ქართული)",
  hp3_ka: "ჰარი პოტერი და აზკაბანის ტყვე (ქართული)",
  hp_box_en: "ჰარი პოტერი — კოლექცია 1–7 (ინგლისური)",
  little_prince_ka: "პატარა უფლისწული (ქართული)",
  little_prince_en: "პატარა უფლისწული (ინგლისური)",
  caterpillar_ka: "ძალიან მშიერი მუხლუხა (ქართული)",
  knight_ka: "ვეფხისტყაოსანი (ქართული)",
  knight_en: "ვეფხისტყაოსანი (ინგლისური)",
  data_tutashkhia: "დათა თუთაშხია (ქართული)",
  chiladze_road: "გზაზე ერთი კაცი მიდიოდა (ქართული)",
  atomic_ka: "ატომური ჩვევები (ქართული)",
  atomic_en: "ატომური ჩვევები (ინგლისური)",
  sapiens_ka: "საპიენსი: კაცობრიობის მოკლე ისტორია (ქართული)",
  sapiens_en: "საპიენსი: კაცობრიობის მოკლე ისტორია (ინგლისური)",
  think_grow_ka: "იფიქრე და გამდიდრდი (ქართული)",
};

// cover = CSS-generated cover art in the app: [background, accent, text colour, motif emoji]
type Book = Omit<Item, "id" | "venueId" | "options"> & { slug: string; hardcover?: number };
const BOOKS: Book[] = [
  { slug: "hp1_ka", category: "Harry Potter", name: "Harry Potter and the Philosopher's Stone (Georgian)", price: 24.95,
    description: "The boy who lived arrives at Hogwarts. Georgian translation by Bakur Sulakauri Publishing — the edition every Tbilisi kid grew up with.",
    tags: ["harry", "potter", "rowling", "georgian", "ქართული", "fantasy", "kids", "magic", "hogwarts"],
    meta: { titleKa: "ჰარი პოტერი და ფილოსოფიური ქვა", author: "J.K. Rowling", authorKa: "ჯ.კ. როულინგი", language: "Georgian", cover: "Paperback", pages: 352, year: 2019, publisher: "Bakur Sulakauri", isbn: "9789941235186", art: ["#7a1f1f", "#f2c14e", "#fff", "⚡"], rating: 4.9, reviews: 214 }, hardcover: 9 },
  { slug: "hp1_en", category: "Harry Potter", name: "Harry Potter and the Philosopher's Stone (English)", price: 32.95,
    description: "Bloomsbury paperback, original English text.",
    tags: ["harry", "potter", "rowling", "english", "original", "fantasy", "kids", "magic"],
    meta: { author: "J.K. Rowling", language: "English", cover: "Paperback", pages: 223, year: 2014, publisher: "Bloomsbury", isbn: "9781408855652", art: ["#1d3f8f", "#f2c14e", "#fff", "⚡"], rating: 4.9, reviews: 96 }, hardcover: 12 },
  { slug: "hp2_ka", category: "Harry Potter", name: "Harry Potter and the Chamber of Secrets (Georgian)", price: 24.95,
    description: "Harry's second year at Hogwarts. Georgian translation.",
    tags: ["harry", "potter", "rowling", "georgian", "fantasy", "kids", "magic"],
    meta: { titleKa: "ჰარი პოტერი და საიდუმლო ოთახი", author: "J.K. Rowling", language: "Georgian", cover: "Paperback", pages: 384, year: 2019, publisher: "Bakur Sulakauri", isbn: "9789941235193", art: ["#1f5e3a", "#e9d8a6", "#fff", "🐍"], rating: 4.8, reviews: 142 }, hardcover: 9 },
  { slug: "hp3_ka", category: "Harry Potter", name: "Harry Potter and the Prisoner of Azkaban (Georgian)", price: 26.95,
    description: "Sirius Black has escaped. Georgian translation.",
    tags: ["harry", "potter", "rowling", "georgian", "fantasy", "kids", "magic"],
    meta: { titleKa: "ჰარი პოტერი და აზკაბანის ტყვე", author: "J.K. Rowling", language: "Georgian", cover: "Paperback", pages: 448, year: 2020, publisher: "Bakur Sulakauri", isbn: "9789941235209", art: ["#3b2a6b", "#c9b8ff", "#fff", "🦌"], rating: 4.9, reviews: 121 }, hardcover: 9 },
  { slug: "hp_box_en", category: "Harry Potter", name: "Harry Potter Box Set 1–7 (English)", price: 289,
    description: "All seven books in a collector's slipcase. Bloomsbury paperbacks.",
    tags: ["harry", "potter", "rowling", "english", "box", "set", "collection", "gift"],
    meta: { author: "J.K. Rowling", language: "English", cover: "Paperback box set", pages: 3407, year: 2014, publisher: "Bloomsbury", art: ["#2b2b2b", "#f2c14e", "#fff", "📚"], rating: 5, reviews: 38 } },
  { slug: "little_prince_ka", category: "Children's books", name: "The Little Prince (Georgian)", price: 14.95,
    description: "Antoine de Saint-Exupéry's timeless tale, with the author's watercolours.",
    tags: ["little", "prince", "saint-exupery", "exupery", "georgian", "kids", "classic"],
    meta: { titleKa: "პატარა უფლისწული", author: "Antoine de Saint-Exupéry", language: "Georgian", cover: "Paperback", pages: 112, year: 2021, publisher: "Palitra L", isbn: "9789941213955", art: ["#0e3b6e", "#f6d36b", "#fff", "🌹"], rating: 4.9, reviews: 187 }, hardcover: 7 },
  { slug: "little_prince_en", category: "Children's books", name: "The Little Prince (English)", price: 19.95,
    description: "Penguin Classics edition with original illustrations.",
    tags: ["little", "prince", "saint-exupery", "exupery", "english", "kids", "classic"],
    meta: { author: "Antoine de Saint-Exupéry", language: "English", cover: "Paperback", pages: 96, year: 2018, publisher: "Penguin", art: ["#f6e7c1", "#0e3b6e", "#0e3b6e", "🌹"], rating: 4.8, reviews: 64 }, hardcover: 8 },
  { slug: "caterpillar_ka", category: "Children's books", name: "The Very Hungry Caterpillar (Georgian)", price: 16.95,
    description: "Eric Carle's board-book classic for the little ones.",
    tags: ["caterpillar", "carle", "georgian", "kids", "baby", "picture"],
    meta: { titleKa: "ძალიან მშიერი მუხლუხა", author: "Eric Carle", language: "Georgian", cover: "Board book", pages: 26, year: 2020, publisher: "Intelekti", art: ["#7cc242", "#e4352b", "#fff", "🐛"], rating: 4.9, reviews: 77 } },
  { slug: "knight_ka", category: "Georgian classics", name: "The Knight in the Panther's Skin (Georgian)", price: 45,
    description: "Shota Rustaveli's 12th-century epic — gift edition with Mihály Zichy illustrations.",
    tags: ["knight", "panther", "vepkhistkaosani", "rustaveli", "shota", "georgian", "classic", "poetry", "epic"],
    meta: { titleKa: "ვეფხისტყაოსანი", author: "Shota Rustaveli", authorKa: "შოთა რუსთაველი", language: "Georgian", cover: "Hardcover", pages: 432, year: 2022, publisher: "Palitra L", art: ["#5a1a12", "#d9a441", "#f3e2b3", "🐆"], rating: 5, reviews: 158 } },
  { slug: "knight_en", category: "Georgian classics", name: "The Knight in the Panther's Skin (English)", price: 39,
    description: "Lyn Coffin's acclaimed English translation of Rustaveli's epic.",
    tags: ["knight", "panther", "rustaveli", "shota", "english", "classic", "poetry", "epic"],
    meta: { author: "Shota Rustaveli", language: "English", cover: "Paperback", pages: 320, year: 2015, publisher: "Poezia Press", art: ["#1c1c1c", "#d9a441", "#d9a441", "🐆"], rating: 4.7, reviews: 23 }, hardcover: 10 },
  { slug: "data_tutashkhia", category: "Georgian classics", name: "Data Tutashkhia (Georgian)", price: 29.95,
    description: "Chabua Amirejibi's great novel of the noble outlaw of Samegrelo.",
    tags: ["data", "tutashkhia", "amirejibi", "chabua", "georgian", "classic", "novel"],
    meta: { titleKa: "დათა თუთაშხია", author: "Chabua Amirejibi", authorKa: "ჭაბუა ამირეჯიბი", language: "Georgian", cover: "Paperback", pages: 784, year: 2018, publisher: "Bakur Sulakauri", art: ["#2f3b2a", "#c8b273", "#f1e9d0", "🐎"], rating: 5, reviews: 132 }, hardcover: 10 },
  { slug: "chiladze_road", category: "Georgian classics", name: "A Man Was Going Down the Road (Georgian)", price: 27.95,
    description: "Otar Chiladze's mythic novel, retelling the Argonaut legend in Georgian soil.",
    tags: ["chiladze", "otar", "road", "georgian", "classic", "novel"],
    meta: { titleKa: "გზაზე ერთი კაცი მიდიოდა", author: "Otar Chiladze", authorKa: "ოთარ ჭილაძე", language: "Georgian", cover: "Paperback", pages: 512, year: 2017, publisher: "Bakur Sulakauri", art: ["#c0612b", "#1d1d1d", "#fff", "🛤️"], rating: 4.8, reviews: 54 }, hardcover: 9 },
  { slug: "atomic_ka", category: "Bestsellers", name: "Atomic Habits (Georgian)", price: 29.95,
    description: "James Clear on tiny changes and remarkable results. Georgian translation.",
    tags: ["atomic", "habits", "clear", "georgian", "self-help", "bestseller"],
    meta: { titleKa: "ატომური ჩვევები", author: "James Clear", language: "Georgian", cover: "Paperback", pages: 320, year: 2021, publisher: "Palitra L", art: ["#f4f1ea", "#d9a441", "#1d1d1d", "⚛️"], rating: 4.8, reviews: 301 }, hardcover: 9 },
  { slug: "atomic_en", category: "Bestsellers", name: "Atomic Habits (English)", price: 42,
    description: "Random House Business paperback, original English.",
    tags: ["atomic", "habits", "clear", "english", "self-help", "bestseller"],
    meta: { author: "James Clear", language: "English", cover: "Paperback", pages: 320, year: 2018, publisher: "Random House", art: ["#ffffff", "#d9a441", "#1d1d1d", "⚛️"], rating: 4.8, reviews: 88 }, hardcover: 15 },
  { slug: "sapiens_ka", category: "Bestsellers", name: "Sapiens: A Brief History of Humankind (Georgian)", price: 34.95,
    description: "Yuval Noah Harari's history of our species. Georgian translation.",
    tags: ["sapiens", "harari", "history", "georgian", "bestseller", "non-fiction"],
    meta: { titleKa: "საპიენსი: კაცობრიობის მოკლე ისტორია", author: "Yuval Noah Harari", language: "Georgian", cover: "Paperback", pages: 512, year: 2019, publisher: "Artanuji", art: ["#e9e4d8", "#b0302a", "#1d1d1d", "✋"], rating: 4.7, reviews: 176 }, hardcover: 10 },
  { slug: "sapiens_en", category: "Bestsellers", name: "Sapiens: A Brief History of Humankind (English)", price: 45,
    description: "Vintage paperback, original English.",
    tags: ["sapiens", "harari", "history", "english", "bestseller", "non-fiction"],
    meta: { author: "Yuval Noah Harari", language: "English", cover: "Paperback", pages: 498, year: 2015, publisher: "Vintage", art: ["#f4efe3", "#b0302a", "#1d1d1d", "✋"], rating: 4.7, reviews: 72 }, hardcover: 15 },
  { slug: "think_grow_ka", category: "Bestsellers", name: "Think and Grow Rich (Georgian)", price: 16.95,
    description: "Napoleon Hill's classic on the mindset of success.",
    tags: ["think", "grow", "rich", "hill", "georgian", "self-help", "bestseller"],
    meta: { titleKa: "იფიქრე და გამდიდრდი", author: "Napoleon Hill", language: "Georgian", cover: "Paperback", pages: 288, year: 2022, publisher: "Palitra L", art: ["#f6f1e1", "#c79a2a", "#1d1d1d", "💰"], rating: 4.6, reviews: 95 }, hardcover: 8 },
];

const STORES: Venue[] = [
  { id: "pekini", name: "Biblusi", ka: { name: "ბიბლუსი", area: "პეკინი" }, area: "Pekini", lat: 41.7262, lng: 44.7687, image: img(IMG.woodCase), cuisine: "Bookstore", rating: 4.9, etaMin: 45, etaMax: 60, deliveryFee: 6,
    meta: { address: "Pekini Ave 28, Tbilisi", hours: "10:00–22:00", express: true } },
  { id: "vake", name: "Biblusi", ka: { name: "ბიბლუსი", area: "ვაკე" }, area: "Vake", lat: 41.7098, lng: 44.7605, image: img(IMG.shelves2), cuisine: "Bookstore", rating: 4.8, etaMin: 60, etaMax: 90, deliveryFee: 6,
    meta: { address: "Chavchavadze Ave 37, Tbilisi", hours: "10:00–22:00", express: true } },
  { id: "rustaveli", name: "Biblusi", ka: { name: "ბიბლუსი", area: "რუსთაველი" }, area: "Rustaveli", lat: 41.6987, lng: 44.7988, image: img(IMG.shelvesLights), cuisine: "Bookstore", rating: 4.9, etaMin: 60, etaMax: 90, deliveryFee: 6,
    meta: { address: "Rustaveli Ave 26, Tbilisi", hours: "10:00–23:00", express: true } },
  { id: "tbilisi_mall", name: "Biblusi", ka: { name: "ბიბლუსი", area: "თბილისი მოლი" }, area: "Tbilisi Mall", lat: 41.7969, lng: 44.7711, image: img(IMG.shelves), cuisine: "Bookstore", rating: 4.7, etaMin: 75, etaMax: 105, deliveryFee: 6,
    meta: { address: "Tbilisi Mall, D. Aghmashenebeli Alley 16km", hours: "10:00–22:00", express: true } },
  { id: "east_point", name: "Biblusi", ka: { name: "ბიბლუსი", area: "ისთ ფოინთი" }, area: "East Point", lat: 41.6812, lng: 44.8965, image: img(IMG.curved), cuisine: "Bookstore", rating: 4.7, etaMin: 90, etaMax: 120, deliveryFee: 6,
    meta: { address: "East Point, Tbilisi", hours: "10:00–22:00", express: false } },
  { id: "kutaisi", name: "Biblusi", ka: { name: "ბიბლუსი", area: "ქუთაისი" }, area: "Kutaisi", lat: 42.2707, lng: 42.7044, image: img(IMG.spines), cuisine: "Bookstore", rating: 4.8, etaMin: 1440, etaMax: 2880, deliveryFee: 8,
    meta: { address: "Rustaveli Ave 5, Kutaisi", hours: "10:00–21:00", express: false } },
  { id: "batumi", name: "Biblusi", ka: { name: "ბიბლუსი", area: "ბათუმი" }, area: "Batumi", lat: 41.6503, lng: 41.6366, image: img(IMG.stacks), cuisine: "Bookstore", rating: 4.8, etaMin: 1440, etaMax: 2880, deliveryFee: 8,
    meta: { address: "Gorgiladze St 34, Batumi", hours: "10:00–22:00", express: false } },
];

const catalog: Item[] = STORES.flatMap((v) =>
  BOOKS.map(({ slug, hardcover, ...b }) => ({
    ...b, id: `${v.id}__${slug}`, venueId: v.id, ka: KA[slug], options: bookOptions(hardcover),
    tags: [...b.tags.filter((t) => t !== "ქართული"), ...(b.meta!.language === "English" ? ["ინგლისური", "ინგლისურად"] : ["ქართული", "ქართულად"]), ...(b.meta!.authorKa ? b.meta!.authorKa.split(/\s+/) : [])],
  })),
);

const tenant: Tenant = {
  id: "biblusi",
  name: "Biblusi",
  publishableKey: "pk_biblusi_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 400,
  serviceFee: 0,
  savedPaymentMethod: "Visa •••• 4242",
  brandColor: "#084fa3",
  persona: "You are Biblusi's book assistant. You help users buy books (Georgian translations and English originals) from the nearest Biblusi store, delivered to their address. One order = one store. If the language isn't specified and both editions exist, prefer the Georgian edition and mention the English one.",
  defaultLocation: { lat: 41.7255, lng: 44.7512, label: "Saburtalo, Vazha-Pshavela Ave 27", labelKa: "საბურთალო, ვაჟა-ფშაველას გამზ. 27" },
  venues: STORES,
  catalog,
};

export default tenant;
