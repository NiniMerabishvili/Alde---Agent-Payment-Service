// PROTOTYPE — throwaway. Mock catalog for tkt.ge (Georgia's event-ticketing platform).
// Venue = event venue (Dinamo Arena, Tbilisi Opera, ...). Item = one ticket category of one event
// ("Dinamo Tbilisi vs Torpedo Kutaisi — East Stand"); the event itself lives in item.meta.
// TEST CASE: "Buy 3 tickets for movie The odyssey on 18 Oct in Cavea City Mall Saburtalo on 22:00 in central seats in any of the last three rows"
//   → 3× "The Odyssey — 18 Oct 22:00 · Last rows 10–12, central seats" at Cavea City Mall Saburtalo.
// Georgian: "იყიდე 3 ბილეთი ფილმზე „ოდისეა“ 18 ოქტომბერს, კავეა სითი მოლ საბურთალოში, 22:00-ზე, ცენტრალური ადგილები ბოლო სამი რიგიდან ერთ-ერთში" → same order.
// Older case still works: "Buy 2 tickets for the Dinamo Tbilisi match this Sunday, East Stand".
import type { Item, Option, Tenant, Venue } from "./types";

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 0.62)}&fit=crop&auto=format`;
const IMG = {
  stadiumNight: "1489944440615-453fc2b6a9a9",
  stadiumDay: "1522778119026-d647f0596c20",
  footballBall: "1574629810360-7efbbe195018",
  operaHouse: "1516307365426-bea591f05011",
  operaStage: "1580809361436-42a7ec204889",
  ballet: "1518834107812-67b0b7c58434",
  theatreCurtain: "1503095396549-807759245b35",
  theatreHall: "1507924538820-ede94a04019d",
  orchestra: "1465847899084-d164df4dedc6",
  laugh: "1527224857830-43a7acc85260",
  standupStage: "1585699324551-f6c309eedeca",
  club: "1574391884720-bbc3740c59d1",
  arenaShow: "1470229722913-7c0e2dbbafd3",
  sax: "1415201364774-f6f0bb35f28f",
  basketball: "1546519638-68e109498ffc",
  odyssey: "1505142468610-359e7d316be0",
  cityNight: "1477959858617-67f85cf4f1df",
  toys: "1558060370-d644479cb6f7",
  cinemaSeats: "1489599849927-2ee91cede3ba",
  cinemaCrowd: "1517604931442-7e0c8ed2963c",
  cinemaScreen: "1595769816263-9b910be24d5f",
  cinemaNeon: "1536440136628-849c177e76a1",
  rockConcert: "1459749411175-04bf5292ceea",
  festival: "1514525253161-7a46d19cd819",
};

// ---------- venues ----------

const venues: Venue[] = [
  { id: "v_opera", ka: { name: "თბილისის ოპერისა და ბალეტის თეატრი", area: "რუსთაველის გამზირი" }, name: "Tbilisi Opera and Ballet Theatre", area: "Rustaveli Ave", lat: 41.6993, lng: 44.7961, image: img(IMG.operaHouse), cuisine: "Opera house", rating: 9.8, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "25 Shota Rustaveli Ave, Tbilisi", city: "Tbilisi" } },
  { id: "v_rustaveli", ka: { name: "რუსთაველის თეატრი", area: "რუსთაველის გამზირი" }, name: "Rustaveli Theatre", area: "Rustaveli Ave", lat: 41.7007, lng: 44.7947, image: img(IMG.theatreHall), cuisine: "Drama theatre", rating: 9.6, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "17 Shota Rustaveli Ave, Tbilisi", city: "Tbilisi" } },
  { id: "v_concert_hall", ka: { name: "თბილისის საკონცერტო დარბაზი", area: "ვერე" }, name: "Tbilisi Concert Hall", area: "Vere", lat: 41.7101, lng: 44.7857, image: img(IMG.orchestra), cuisine: "Concert hall", rating: 9.4, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "1 Melikishvili Ave, Tbilisi", city: "Tbilisi" } },
  { id: "v_dinamo", ka: { name: "დინამო არენა", area: "დიდუბე" }, name: "Dinamo Arena", area: "Didube", lat: 41.723, lng: 44.7893, image: img(IMG.stadiumNight), cuisine: "Stadium", rating: 9.5, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "2 Akaki Tsereteli Ave, Tbilisi", city: "Tbilisi", fullName: "Boris Paichadze Dinamo Arena" } },
  { id: "v_bassiani", ka: { name: "ბასიანი", area: "დიდუბე" }, name: "Bassiani", area: "Didube", lat: 41.7226, lng: 44.7886, image: img(IMG.club), cuisine: "Club", rating: 9.7, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "Dinamo Arena (pool level), 2 Akaki Tsereteli Ave", city: "Tbilisi" } },
  { id: "v_comedy", ka: { name: "კომედი კლუბი თბილისი", area: "სოლოლაკი" }, name: "Comedy Club Tbilisi", area: "Sololaki", lat: 41.6929, lng: 44.8009, image: img(IMG.standupStage), cuisine: "Comedy club", rating: 9.3, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "12 Leonidze St, Tbilisi", city: "Tbilisi" } },
  { id: "v_sports_palace", ka: { name: "თბილისის სპორტის სასახლე", area: "საბურთალო" }, name: "Tbilisi Sports Palace", area: "Saburtalo", lat: 41.7262, lng: 44.7815, image: img(IMG.basketball), cuisine: "Indoor arena", rating: 9.1, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "1 Kazbegi Ave, Tbilisi", city: "Tbilisi" } },
  { id: "v_bsa", ka: { name: "შავი ზღვის არენა", area: "შეკვეთილი" }, name: "Black Sea Arena", area: "Shekvetili", lat: 41.9183, lng: 41.7779, image: img(IMG.arenaShow), cuisine: "Open-air arena", rating: 9.6, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "Shekvetili, Guria (45 min from Batumi)", city: "Shekvetili" } },
  // Cavea cinemas
  { id: "v_cavea_citymall", ka: { name: "კავეა სითი მოლი", area: "საბურთალო" }, name: "Cavea City Mall Saburtalo", area: "Saburtalo", lat: 41.727, lng: 44.748, image: img(IMG.cinemaSeats), cuisine: "Cinema", rating: 9.4, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "City Mall, 70 Vazha-Pshavela Ave, Tbilisi", city: "Tbilisi" } },
  { id: "v_cavea_tbilisimall", ka: { name: "კავეა თბილისი მოლი", area: "დიდი დიღომი" }, name: "Cavea Tbilisi Mall", area: "Didi Dighomi", lat: 41.7781, lng: 44.7584, image: img(IMG.cinemaCrowd), cuisine: "Cinema", rating: 9.2, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "Tbilisi Mall, 16 km Aghmashenebeli Alley", city: "Tbilisi" } },
  { id: "v_cavea_eastpoint", ka: { name: "კავეა ისთ ფოინთი", area: "ვარკეთილი" }, name: "Cavea East Point", area: "Varketili", lat: 41.6896, lng: 44.8987, image: img(IMG.cinemaScreen), cuisine: "Cinema", rating: 9.1, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "East Point, 2 Tbilisi–Airport Hwy", city: "Tbilisi" } },
  { id: "v_cavea_gallery", ka: { name: "კავეა გალერეა", area: "რუსთაველის გამზირი" }, name: "Cavea Gallery", area: "Rustaveli Ave", lat: 41.6965, lng: 44.8, image: img(IMG.cinemaNeon), cuisine: "Cinema", rating: 9.3, etaMin: 0, etaMax: 0, deliveryFee: 0, meta: { address: "Galleria Tbilisi, 2/4 Rustaveli Ave", city: "Tbilisi" } },
];

// ---------- options ----------

const insurance = (p: number): Option => ({ id: "insurance", name: "Ticket insurance", price: p, group: "Extras", ka: "ბილეთის დაზღვევა", tags: ["დაზღვევა","დაზღვევით"] });
const stadiumOpts = (): Option[] => [insurance(1.5), { id: "parking", name: "Parking pass", price: 10, group: "Extras", ka: "პარკინგის საშვი", tags: ["პარკინგი","პარკინგით"] }, { id: "scarf", name: "Club scarf", price: 25, group: "Merch", ka: "კლუბის შარფი", tags: ["შარფი"] }];
const theatreOpts = (): Option[] => [insurance(2), { id: "programme", name: "Printed programme", price: 5, group: "Extras", ka: "ბეჭდური პროგრამა", tags: ["პროგრამა"] }, { id: "cloakroom", name: "Cloakroom token", price: 2, group: "Extras", ka: "გარდერობის ნომერი", tags: ["გარდერობი"] }];
const clubOpts = (): Option[] => [insurance(1.5), { id: "fasttrack", name: "Fast track entry", price: 20, group: "Extras", ka: "სწრაფი შესვლა", tags: ["სწრაფი"] }];
const arenaOpts = (): Option[] => [insurance(3), { id: "parking", name: "Parking pass", price: 15, group: "Extras", ka: "პარკინგის საშვი", tags: ["პარკინგი","პარკინგით"] }, { id: "shuttle", name: "Shuttle from Batumi", price: 12, group: "Transport", ka: "შატლი ბათუმიდან", tags: ["შატლი","შატლით"] }];

// ---------- events → ticket categories ----------

type Ev = {
  id: string; venueId: string; title: string; ka?: string; sub: string; kind: string; date: string; dow: string; time: string;
  poster: string; tags: string[]; about: string; opts: () => Option[];
  cats: { zone: string; price: number; left: number; note: string }[];
};

const events: Ev[] = [
  { id: "e_dinamo_torpedo", ka: "დინამო თბილისი — ტორპედო ქუთაისი", venueId: "v_dinamo", title: "Dinamo Tbilisi vs Torpedo Kutaisi", sub: "Erovnuli Liga · Matchday 31", kind: "Sport",
    date: "2026-10-18", dow: "Sun", time: "20:00", poster: IMG.stadiumNight, opts: stadiumOpts,
    tags: ["football", "match", "sport", "sunday", "today", "dinamo", "torpedo", "erovnuli", "ფეხბურთი", "დინამო"],
    about: "The classic Georgian derby under the lights of Dinamo Arena. Gates open 90 minutes before kick-off.",
    cats: [
      { zone: "East Stand", price: 15, left: 412, note: "Sectors 21–28 · behind the benches" },
      { zone: "West Stand", price: 25, left: 186, note: "Sectors 1–8 · main stand, covered" },
      { zone: "North Stand", price: 10, left: 640, note: "Sectors 31–36 · home fans, standing" },
      { zone: "VIP Lounge", price: 80, left: 24, note: "Halfway line · lounge, catering" },
    ] },
  { id: "e_dinamo_dila", ka: "დინამო თბილისი — დილა გორი", venueId: "v_dinamo", title: "Dinamo Tbilisi vs Dila Gori", sub: "Erovnuli Liga · Matchday 33", kind: "Sport",
    date: "2026-10-31", dow: "Sat", time: "17:00", poster: IMG.stadiumDay, opts: stadiumOpts,
    tags: ["football", "match", "sport", "saturday", "dinamo", "dila", "erovnuli", "ფეხბურთი", "დინამო"],
    about: "Dinamo host Dila Gori in the race for the title.",
    cats: [
      { zone: "East Stand", price: 15, left: 820, note: "Sectors 21–28" },
      { zone: "West Stand", price: 25, left: 410, note: "Sectors 1–8 · covered" },
    ] },
  { id: "e_georgia_greece", ka: "საქართველო — საბერძნეთი", venueId: "v_dinamo", title: "Georgia vs Greece", sub: "UEFA Nations League", kind: "Sport",
    date: "2026-11-12", dow: "Thu", time: "21:00", poster: IMG.footballBall, opts: stadiumOpts,
    tags: ["football", "match", "sport", "thursday", "national", "georgia", "nations", "ფეხბურთი", "საქართველო"],
    about: "The Crusaders return to Tbilisi. Expect a sold-out Dinamo Arena.",
    cats: [
      { zone: "East Stand", price: 40, left: 96, note: "Sectors 21–28" },
      { zone: "West Stand", price: 60, left: 38, note: "Sectors 1–8 · covered" },
      { zone: "VIP Lounge", price: 250, left: 6, note: "Halfway line · lounge, catering" },
    ] },
  { id: "e_traviata", ka: "ტრავიატა", venueId: "v_opera", title: "La Traviata", sub: "Giuseppe Verdi · opera in 3 acts", kind: "Opera",
    date: "2026-10-24", dow: "Sat", time: "19:00", poster: IMG.operaStage, opts: theatreOpts,
    tags: ["opera", "verdi", "classical", "music", "saturday", "ოპერა"],
    about: "Verdi's masterpiece on the historic stage of the Tbilisi Opera. Sung in Italian with Georgian and English surtitles. 2 h 40 min with intermissions.",
    cats: [
      { zone: "Parterre", price: 80, left: 54, note: "Rows 1–18" },
      { zone: "Loge", price: 120, left: 12, note: "Boxes 1–14, tier 1" },
      { zone: "Balcony", price: 45, left: 88, note: "Tier 2–3" },
      { zone: "Gallery", price: 25, left: 64, note: "Tier 4 · limited view" },
    ] },
  { id: "e_swan_lake", ka: "გედების ტბა", venueId: "v_opera", title: "Swan Lake", sub: "Tbilisi State Ballet · Tchaikovsky", kind: "Theatre",
    date: "2026-10-30", dow: "Fri", time: "19:00", poster: IMG.ballet, opts: theatreOpts,
    tags: ["ballet", "tchaikovsky", "classical", "friday", "theatre", "ბალეტი"],
    about: "The State Ballet of Georgia performs Tchaikovsky's Swan Lake.",
    cats: [
      { zone: "Parterre", price: 100, left: 31, note: "Rows 1–18" },
      { zone: "Balcony", price: 60, left: 72, note: "Tier 2–3" },
    ] },
  { id: "e_hamlet", ka: "ჰამლეტი", venueId: "v_rustaveli", title: "Hamlet", sub: "Robert Sturua · in Georgian with English surtitles", kind: "Theatre",
    date: "2026-10-21", dow: "Wed", time: "19:00", poster: IMG.theatreCurtain, opts: theatreOpts,
    tags: ["theatre", "drama", "shakespeare", "wednesday", "თეატრი"],
    about: "Shakespeare's tragedy in the legendary staging of the Rustaveli Theatre.",
    cats: [
      { zone: "Parterre", price: 30, left: 120, note: "Rows 1–20" },
      { zone: "Balcony", price: 20, left: 90, note: "Tier 2" },
    ] },
  { id: "e_mgzavrebi", ka: "მგზავრები — ლაივი", venueId: "v_concert_hall", title: "Mgzavrebi — Live", sub: "Autumn concert", kind: "Concert",
    date: "2026-10-31", dow: "Sat", time: "20:00", poster: IMG.rockConcert, opts: theatreOpts,
    tags: ["concert", "music", "live", "band", "saturday", "კონცერტი"],
    about: "Mgzavrebi play their best-loved songs and new material at Tbilisi Concert Hall.",
    cats: [
      { zone: "Stalls", price: 70, left: 140, note: "Rows 1–25" },
      { zone: "Amphitheatre", price: 45, left: 210, note: "Rows 26–40" },
      { zone: "Dance floor", price: 55, left: 300, note: "Standing, front of stage" },
    ] },
  { id: "e_jazz", ka: "თბილისის ჯაზ ფესტივალი", venueId: "v_concert_hall", title: "Tbilisi Jazz Festival", sub: "3 nights of jazz", kind: "Festival",
    date: "2026-11-06", dow: "Fri", time: "20:00", poster: IMG.sax, opts: theatreOpts,
    tags: ["jazz", "festival", "music", "concert", "friday", "ჯაზი", "ფესტივალი"],
    about: "Georgia's oldest jazz festival returns with international headliners.",
    cats: [
      { zone: "Day pass", price: 70, left: 260, note: "Fri 7 Nov, any seat" },
      { zone: "Festival pass", price: 180, left: 90, note: "All 3 nights, reserved seat" },
    ] },
  { id: "e_standup", ka: "სტენდაპ პარასკევი", venueId: "v_comedy", title: "Stand-up Friday Night", sub: "5 comedians · in Georgian", kind: "Stand-up",
    date: "2026-10-23", dow: "Fri", time: "21:00", poster: IMG.laugh, opts: clubOpts,
    tags: ["stand-up", "standup", "comedy", "show", "friday", "სტენდაპ", "კომედია"],
    about: "The best of Tbilisi's stand-up scene. 18+.",
    cats: [
      { zone: "Standard seat", price: 30, left: 44, note: "Free seating" },
      { zone: "Front row", price: 45, left: 8, note: "Table for 2, first row" },
    ] },
  { id: "e_bassiani", ka: "ბასიანი: შაბათის ტექნო", venueId: "v_bassiani", title: "Bassiani: Saturday Techno", sub: "All night long · 18+", kind: "Music",
    date: "2026-10-24", dow: "Sat", time: "23:59", poster: IMG.club, opts: clubOpts,
    tags: ["techno", "club", "party", "music", "rave", "saturday", "ტექნო"],
    about: "Bassiani residents in the main room, Horoom in the second. Face control applies.",
    cats: [{ zone: "Entry", price: 50, left: 300, note: "General admission" }] },
  { id: "e_basketball", ka: "საქართველო — ესპანეთი", venueId: "v_sports_palace", title: "Georgia vs Spain", sub: "FIBA Basketball World Cup Qualifier", kind: "Sport",
    date: "2026-11-15", dow: "Sun", time: "19:00", poster: IMG.basketball, opts: stadiumOpts,
    tags: ["basketball", "sport", "game", "national", "georgia", "კალათბურთი"],
    about: "The national team faces Spain at a packed Sports Palace.",
    cats: [
      { zone: "Courtside", price: 120, left: 10, note: "Row A" },
      { zone: "Lower tier", price: 35, left: 330, note: "Sectors A–F" },
      { zone: "Upper tier", price: 15, left: 900, note: "Sectors G–P" },
    ] },
  { id: "e_bsa_finale", ka: "შავი ზღვის არენა — სეზონის ფინალი", venueId: "v_bsa", title: "Black Sea Arena Season Finale", sub: "Open-air show · Shekvetili", kind: "Concert",
    date: "2026-11-07", dow: "Sat", time: "21:00", poster: IMG.arenaShow, opts: arenaOpts,
    tags: ["concert", "music", "show", "batumi", "saturday", "კონცერტი"],
    about: "The closing night of the Black Sea Arena season with fireworks over the sea.",
    cats: [
      { zone: "Fan zone", price: 60, left: 1500, note: "Standing, front of stage" },
      { zone: "Seated", price: 90, left: 800, note: "Sectors 1–12" },
      { zone: "VIP", price: 200, left: 40, note: "Sky lounge" },
    ] },
];

// ---------- Cavea cinema sessions ----------
// Every session is its own "event"; items = seat zones of a 12-row × 14-seat hall. The UI assigns concrete seats
// (best adjacent block inside the zone) and shows them on the seat map + e-tickets.
// Item names carry date + time + zone, e.g. "The Odyssey — 18 Oct 22:00 · Last rows 10–12, central seats",
// so "The Odyssey on 18 Oct … 22:00 … central seats … last three rows" resolves to exactly that zone of that session.
const cinemaOpts = (): Option[] => [
  { id: "popcorn", name: "Popcorn & Cola combo", price: 12, group: "Snacks", ka: "პოპკორნი და კოლა", tags: ["პოპკორნი","პოპკორნით","კოლა"] },
  { id: "nachos", name: "Nachos with cheese dip", price: 9, group: "Snacks", ka: "ნაჩოსი ყველის სოუსით", tags: ["ნაჩოსი","ნაჩოსით"] },
];
const FILMS: Record<string, { ka: string; title: string; sub: string; poster: string; tags: string[]; about: string; mins: number }> = {
  odyssey: { ka: "ოდისეა", title: "The Odyssey", sub: "Christopher Nolan · 2026 · ENG, GEO subtitles", poster: IMG.odyssey, mins: 172, tags: ["odyssey", "nolan", "epic", "adventure", "ოდისეა", "ნოლანი"],
    about: "Christopher Nolan's epic retelling of Homer: Odysseus' ten-year journey home from the Trojan War. Shot entirely on IMAX film." },
  spiderman: { ka: "სპაიდერმენი: ახალი დღე", title: "Spider-Man: Brand New Day", sub: "Marvel Studios · 2026 · ENG, GEO subtitles", poster: IMG.cityNight, mins: 141, tags: ["spider", "spiderman", "marvel", "superhero", "სპაიდერმენი"],
    about: "Peter Parker starts over in a city that has forgotten who he is." },
  toystory: { ka: "სათამაშოების ისტორია 5", title: "Toy Story 5", sub: "Disney · Pixar · 2026 · Georgian dub", poster: IMG.toys, mins: 102, tags: ["toy", "pixar", "animation", "kids", "family", "მულტფილმი"],
    about: "Woody, Buzz and the gang meet a new kind of toy: a tablet." },
};
const ZONES = [
  { key: "front", ka: "პირველი რიგები (1–4)", zone: "Front rows 1–4", price: 14, rows: [1, 4], seats: [1, 14], tags: ["front"] },
  { key: "middle", ka: "შუა რიგები (5–9)", zone: "Middle rows 5–9", price: 16, rows: [5, 9], seats: [1, 14], tags: ["middle"] },
  { key: "last_side", ka: "ბოლო სამი რიგი (10–12), გვერდითი ადგილები", zone: "Last rows 10–12, side seats", price: 16, rows: [10, 12], seats: [1, 14], side: true, tags: ["back", "side"] },
  { key: "last_central", ka: "ბოლო სამი რიგი (10–12), ცენტრალური ადგილები", zone: "Last rows 10–12, central seats", price: 18, rows: [10, 12], seats: [5, 10], tags: ["back", "centre", "center", "middle"] },
];
const SESSIONS: { film: keyof typeof FILMS; venueId: string; date: string; time: string; hall: string }[] = [
  { film: "odyssey", venueId: "v_cavea_citymall", date: "2026-10-18", time: "16:30", hall: "Hall 2" },
  { film: "odyssey", venueId: "v_cavea_citymall", date: "2026-10-18", time: "19:15", hall: "Hall 2" },
  { film: "odyssey", venueId: "v_cavea_citymall", date: "2026-10-18", time: "22:00", hall: "Hall 2" },
  { film: "odyssey", venueId: "v_cavea_citymall", date: "2026-10-19", time: "22:00", hall: "Hall 2" },
  { film: "spiderman", venueId: "v_cavea_citymall", date: "2026-10-18", time: "22:00", hall: "Hall 6" },
  { film: "toystory", venueId: "v_cavea_citymall", date: "2026-10-18", time: "13:00", hall: "Hall 1" },
  { film: "odyssey", venueId: "v_cavea_tbilisimall", date: "2026-10-18", time: "19:00", hall: "Hall 4" },
  { film: "odyssey", venueId: "v_cavea_tbilisimall", date: "2026-10-18", time: "22:30", hall: "Hall 4" },
  { film: "odyssey", venueId: "v_cavea_eastpoint", date: "2026-10-18", time: "21:00", hall: "Hall 1" },
  { film: "odyssey", venueId: "v_cavea_gallery", date: "2026-10-18", time: "20:00", hall: "Hall 1" },
  { film: "spiderman", venueId: "v_cavea_gallery", date: "2026-10-18", time: "17:15", hall: "Hall 2" },
];
const dowOf = (d: string) => new Date(d + "T12:00:00Z").toLocaleString("en", { weekday: "short", timeZone: "UTC" });
const monOf = (d: string) => new Date(d + "T12:00:00Z").toLocaleString("en", { month: "short", timeZone: "UTC" });
const cinemaItems: Item[] = SESSIONS.flatMap((s) => {
  const f = FILMS[s.film];
  const sid = `c_${s.film}_${s.venueId.replace("v_cavea_", "")}_${s.date.slice(5).replace("-", "")}_${s.time.replace(":", "")}`;
  const when = `${+s.date.slice(8)} ${monOf(s.date)} ${s.time}`;
  return ZONES.map((z) => ({
    id: `${sid}__${z.key}`,
    venueId: s.venueId,
    name: `${f.title} — ${when} · ${z.zone}`,
    ka: `${f.ka} — ${+s.date.slice(8)} ოქტომბერი, ${s.time} · ${z.ka}`,
    description: `${s.hall}, ${z.zone}. ${dowOf(s.date)}, ${when}. ${f.mins} min.`,
    price: z.price,
    category: "Cinema",
    image: img(f.poster, 300),
    tags: ["movie", "film", "cinema", "kino", "session", dowOf(s.date).toLowerCase() + "day", "ფილმი", "კინო", "სეანსი", ...f.tags, ...z.tags],
    options: cinemaOpts(),
    meta: { eventId: sid, event: f.title, eventKa: f.ka, zoneKa: z.ka, hallKa: s.hall.replace("Hall", "დარბაზი"), sub: f.sub, kind: "Cinema", film: s.film, date: s.date, dow: dowOf(s.date), time: s.time, zone: z.zone,
      note: `${s.hall} · rows ${z.rows[0]}–${z.rows[1]}${z.side ? " · side blocks" : z.seats[0] > 1 ? ` · seats ${z.seats[0]}–${z.seats[1]}` : ""}`,
      left: 0, poster: img(f.poster), about: f.about, mins: f.mins,
      hall: { name: s.hall, rows: 12, seats: 14 }, rows: z.rows, seats: z.seats, side: !!z.side },
  }));
});

const DOW_KA: Record<string, string> = { Mon: "ორშაბათი", Tue: "სამშაბათი", Wed: "ოთხშაბათი", Thu: "ხუთშაბათი", Fri: "პარასკევი", Sat: "შაბათი", Sun: "კვირა" };
const ZONE_KA: Record<string, string> = {
  "East Stand": "აღმოსავლეთ ტრიბუნა", "West Stand": "დასავლეთ ტრიბუნა", "North Stand": "ჩრდილოეთ ტრიბუნა", "VIP Lounge": "VIP ლაუნჯი",
  Parterre: "პარტერი", Loge: "ლოჟა", Balcony: "აივანი", Gallery: "გალერეა", Stalls: "პარტერი", Amphitheatre: "ამფითეატრი",
  "Dance floor": "საცეკვაო მოედანი", "Day pass": "ერთდღიანი საშვი", "Festival pass": "ფესტივალის საშვი", "Standard seat": "სტანდარტული ადგილი",
  "Front row": "პირველი რიგი", Entry: "შესასვლელი", Courtside: "მოედანთან", "Lower tier": "ქვედა იარუსი", "Upper tier": "ზედა იარუსი",
  "Fan zone": "ფან ზონა", Seated: "დასაჯდომი ადგილი", VIP: "VIP",
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const catalog: Item[] = events.flatMap((e) =>
  e.cats.map((c) => ({
    id: `${e.id}__${slug(c.zone)}`,
    venueId: e.venueId,
    name: `${e.title} — ${c.zone}`,
    ka: `${e.ka ?? e.title} — ${ZONE_KA[c.zone] ?? c.zone}`,
    description: `${c.note}. ${e.dow}, ${e.date.slice(8)} ${new Date(e.date).toLocaleString("en", { month: "short" })} · ${e.time}.`,
    price: c.price,
    category: e.kind,
    image: img(e.poster, 300),
    tags: [...e.tags, DOW_KA[e.dow], ...(e.tags.includes("football") ? ["მატჩი"] : [])],
    options: e.opts(),
    meta: { eventId: e.id, event: e.title, eventKa: e.ka, zoneKa: ZONE_KA[c.zone], sub: e.sub, kind: e.kind, date: e.date, dow: e.dow, time: e.time, zone: c.zone, note: c.note, left: c.left, poster: img(e.poster), about: e.about },
  })),
).concat(cinemaItems);

const tenant: Tenant = {
  id: "tktge",
  name: "tkt.ge",
  publishableKey: "pk_tktge_demo",
  currency: "GEL",
  currencySymbol: "₾",
  perOrderLimit: 1000,
  serviceFee: 2,
  savedPaymentMethod: "Mastercard •••• 8812",
  brandColor: "#0F78FF",
  persona:
    "You help users buy tickets on tkt.ge: concerts, theatre and opera, football and other sport, stand-up, clubs and festivals in Tbilisi and Batumi. Each item is one ticket category of one event; the event date/time is in the item description. Today is Sunday 18 October 2026. tkt.ge also sells Cavea cinema tickets: each item is one seat zone of one session; the app assigns the best adjacent seats inside that zone.",
  defaultLocation: { lat: 41.7255, lng: 44.7525, label: "Vazha-Pshavela Ave, Saburtalo", labelKa: "ვაჟა-ფშაველას გამზირი, საბურთალო" },
  venues,
  catalog,
};

export default tenant;
