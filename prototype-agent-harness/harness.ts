// PROTOTYPE — throwaway. The agent harness: one tenant-scoped turn of
// user message -> Gemini (function calling loop) -> tools -> reply,
// emitting live events so the host UI can show progress while the model works.

import type { Tenant } from "./tenants/index";
import { memoryFor, trimHistory, type Content, type UserMemory } from "./memory";
import { createIntent, getIntent, intentsFor, type Intent } from "./payments";

const API_KEY = process.env.GEMINI_API_KEY;
export const MODEL = process.env.GEMINI_MODEL ?? "gemini-4-argon";
const THINKING = process.env.GEMINI_THINKING ?? "low"; // "" = model default
export const MODE = API_KEY && !process.env.AGENTPAY_MOCK ? "gemini" : "mock"; // AGENTPAY_MOCK=1 forces mock (no Gemini calls)
const MAX_STEPS = 8;
const CALL_TIMEOUT_MS = 25_000;

export type Location = { lat: number; lng: number; label?: string };
export type AgentEvent =
  | { type: "status"; text: string }
  | { type: "thinking"; text: string }
  | { type: "tool"; tool: string; label: string; args: any; result: any }
  | { type: "payment"; payment: Intent }
  | { type: "reply"; text: string };
export type TurnResult = { reply: string; trace: AgentEvent[]; payment?: Intent };

type Lang = "en" | "ka";
type Ctx = { tenant: Tenant; userId: string; mem: UserMemory; location: Location; lang: Lang; proposed?: Intent };
const GEO = /[\u10A0-\u10FF]/;
const detectLang = (text: string): Lang => (GEO.test(text) ? "ka" : "en");
// Georgian genitive for names: მარჯი → მარჯის, ბოლტი → ბოლტის, ვაკე → ვაკეს
const kaGen = (n: string) => (/[ი]$/.test(n) ? n.slice(0, -1) + "ის" : /[აეოუ]$/.test(n) ? n + "ს" : n + "ის");
// Display names in the user's language (Georgian names are optional per item/venue/option).
const iName = (ctx: Ctx, i: { name: string; ka?: string }) => (ctx.lang === "ka" && i.ka ? i.ka : i.name);
const vName = (ctx: Ctx, v: Tenant["venues"][number]) => {
  const name = ctx.lang === "ka" ? v.ka?.name ?? v.name : v.name, area = ctx.lang === "ka" ? v.ka?.area ?? v.area : v.area;
  return area && area !== name ? `${name} (${area})` : name;
};

// ---------- tools ----------

const toolDeclarations = [
  {
    name: "search_nearby_items",
    description:
      "Search this platform's catalog (items across all venues). Results are ranked by match, then by distance of the venue from the user's current location. Each result includes the venue and available option_ids (e.g. 'Without onion').",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "English keywords incl. venue/brand name if the user gave one, e.g. 'marge small shawarma', 'coca-cola 0.5'." },
        venue_id: { type: "STRING", description: "Optional: restrict to one venue (use once you've picked the venue)." },
        max_km: { type: "NUMBER", description: "Optional max distance in km." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_venue_menu",
    description: "Full menu of one venue, with item_ids, prices and option_ids.",
    parameters: { type: "OBJECT", properties: { venue_id: { type: "STRING" } }, required: ["venue_id"] },
  },
  {
    name: "create_payment_intent",
    description:
      "Put together the order and propose the payment. Does NOT charge the user: it shows a payment card and the user must confirm it themselves. Prices and fees are taken from the catalog. All items must be from the same venue. Calling it again replaces the previous unpaid proposal.",
    parameters: {
      type: "OBJECT",
      properties: {
        items: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              item_id: { type: "STRING" },
              qty: { type: "INTEGER" },
              option_ids: { type: "ARRAY", items: { type: "STRING" }, description: "Modifiers, e.g. ['no_onion','no_peppers']." },
              note: { type: "STRING", description: "Only for wishes no option covers." },
            },
            required: ["item_id", "qty"],
          },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "check_payment_status",
    description: "Check whether a payment intent was confirmed (captured) or cancelled by the user.",
    parameters: { type: "OBJECT", properties: { intent_id: { type: "STRING" } }, required: ["intent_id"] },
  },
  {
    name: "remember_user_preference",
    description: "Store a durable fact about this user for future conversations on this platform (e.g. 'no onion in shawarma', 'vegetarian').",
    parameters: { type: "OBJECT", properties: { fact: { type: "STRING" } }, required: ["fact"] },
  },
];

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function itemView(tenant: Tenant, i: Tenant["catalog"][number], location: Location) {
  const v = tenant.venues.find((v) => v.id === i.venueId)!;
  return {
    item_id: i.id,
    name: i.name,
    price: i.price,
    description: i.description,
    venue_id: v.id,
    venue: `${v.name} (${v.area})`,
    ...(i.ka ? { name_ka: i.ka } : {}),
    ...(v.ka?.name ? { venue_ka: `${v.ka.name}${v.ka.area ? ` (${v.ka.area})` : ""}` } : {}),
    distance_km: +km(location, v).toFixed(1),
    eta: v.etaMax ? `${v.etaMin}-${v.etaMax} min` : undefined,
    options: i.options?.map((o) => ({ option_id: o.id, name: o.name, ...(o.ka ? { name_ka: o.ka } : {}), price: o.price })),
  };
}

function executeTool(ctx: Ctx, name: string, args: any): any {
  const { tenant, userId, mem, location } = ctx;
  switch (name) {
    case "search_nearby_items": {
      const words = String(args.query ?? "").toLowerCase().split(/[^\p{L}\p{N}.]+/u).filter((w) => w.length > 1);
      const results = tenant.catalog
        .filter((i) => !args.venue_id || i.venueId === args.venue_id)
        .map((i) => {
          const v = tenant.venues.find((v) => v.id === i.venueId)!;
          const hay = `${i.name} ${v.name} ${v.area} ${v.cuisine} ${i.category} ${i.tags.join(" ")}`.toLowerCase();
          return { i, score: words.filter((w) => hay.includes(w)).length, d: km(location, v) };
        })
        .filter((r) => (words.length === 0 || r.score > 0) && (!args.max_km || r.d <= args.max_km))
        .sort((a, b) => b.score - a.score || a.d - b.d)
        .slice(0, 6);
      return { currency: tenant.currency, items: results.map((r) => itemView(tenant, r.i, location)) };
    }
    case "get_venue_menu": {
      const v = tenant.venues.find((v) => v.id === args.venue_id);
      if (!v) return { error: "Unknown venue_id" };
      return {
        venue: `${v.name} (${v.area})`, distance_km: +km(location, v).toFixed(1), delivery_fee: v.deliveryFee, currency: tenant.currency,
        items: tenant.catalog.filter((i) => i.venueId === v.id).map((i) => itemView(tenant, i, location)),
      };
    }
    case "create_payment_intent": {
      const r = createIntent(tenant, userId, args.items);
      if ("error" in r) return r;
      ctx.proposed = r;
      return {
        intent_id: r.id, status: r.status, venue: `${r.venue.name} (${r.venue.area})`,
        lines: r.lines.map((l) => `${l.qty}x ${l.name}${l.options.length ? ` (${l.options.join(", ")})` : ""}`),
        subtotal: r.subtotal, delivery_fee: r.deliveryFee, service_fee: r.serviceFee, total: r.total, currency: r.currency,
        note: "The payment card is now shown BELOW your message. It is NOT paid yet; the user confirms it themselves.",
      };
    }
    case "check_payment_status": {
      const i = getIntent(tenant.id, userId, args.intent_id);
      return i ? { intent_id: i.id, status: i.status, total: i.total } : { error: "Not found." };
    }
    case "remember_user_preference": {
      const fact = String(args.fact ?? "").slice(0, 200);
      if (fact && !mem.preferences.includes(fact)) mem.preferences.push(fact);
      return { ok: true, preferences: mem.preferences };
    }
  }
  return { error: `Unknown tool ${name}` };
}

// Human-readable step labels for the UI.
function toolLabel(ctx: Ctx, name: string, args: any, result: any) {
  const ka = ctx.lang === "ka";
  const venueOf = (id?: string) => { const v = ctx.tenant.venues.find((v) => v.id === id); return v ? vName(ctx, v) : ""; };
  switch (name) {
    case "search_nearby_items": {
      const top = result.items?.[0];
      if (!top) return ka ? `მოვძებნე „${args.query}“ — ვერაფერი მოიძებნა` : `Searched “${args.query}” — nothing found`;
      return ka ? `მოვძებნე „${args.query}“ — უახლოესი: ${venueOf(top.venue_id)}, ${top.distance_km} კმ` : `Searched “${args.query}” — nearest: ${top.venue}, ${top.distance_km} km`;
    }
    case "get_venue_menu": return ka ? `გავხსენი მენიუ: ${venueOf(args.venue_id)}` : result.venue ? `Opened menu of ${result.venue}` : "Opened menu";
    case "create_payment_intent": {
      if (result.error) return ka ? `შეკვეთის შედგენა ვერ მოხერხდა: ${result.error}` : `Couldn't build the order: ${result.error}`;
      const p = ctx.proposed;
      const lines = ka && p ? p.lines.map((l) => `${l.qty}× ${l.nameKa ?? l.name}${l.options.length ? ` (${(l.optionsKa ?? l.options).join(", ")})` : ""}`) : result.lines;
      return ka ? `შეკვეთა მზადაა: ${lines.join(", ")} — ${ctx.tenant.currencySymbol}${result.total.toFixed(2)}` : `Order ready: ${lines.join(", ")} — ${result.total} ${result.currency}`;
    }
    case "check_payment_status": return ka ? `გადახდის სტატუსი: ${result.status ?? "ვერ მოიძებნა"}` : `Checked payment: ${result.status ?? "not found"}`;
    case "remember_user_preference": return ka ? `დავიმახსოვრე: „${args.fact}“` : `Remembered: “${args.fact}”`;
  }
  return name;
}

// ---------- prompt ----------

function systemPrompt(ctx: Ctx) {
  const { tenant, mem, location, userId } = ctx;
  const orders = intentsFor(tenant.id, userId).slice(-5)
    .map((i) => `- ${i.id}: ${i.venue.name} (${i.venue.area}) — ${i.lines.map((l) => `${l.qty}x ${l.name}${l.options.length ? ` (${l.options.join(", ")})` : ""}`).join(", ")} = ${i.total} ${i.currency} [${i.status}]`);
  return `You are the AI ordering assistant built into the ${tenant.name} app. ${tenant.persona}

How to work:
- You are an autonomous purchasing agent. When the user asks for something, DO EVERYTHING YOURSELF: search, pick the venue,
  items, quantities, options, date/time/seats, and call create_payment_intent. Do NOT ask clarifying questions, do NOT offer
  alternatives to choose from, do NOT ask "shall I order?". The ONLY thing the user does is confirm the payment card.
- When something is under-specified, choose the most sensible option yourself (nearest venue, standard/cheapest class,
  best-matching time/seats) and mention the choice in your reply.
- Only offer items returned by the tools. Never invent items, prices, venues or options.
- The user is at lat ${location.lat}, lng ${location.lng}${location.label ? ` (${location.label})` : ""}. When a brand has several branches, pick the NEAREST branch and say which one and how far.
- Map wishes to option_ids ("without onion and peppers" -> ["no_onion","no_peppers"]). Apply the same options to each unit the user meant. Use note only if no option fits.
- If something the user asked for doesn't exist, pick the closest match from the tools and say so in one short sentence.
- create_payment_intent only PROPOSES the payment. The user confirms it on the payment card shown BELOW your message. Never say it is paid/ordered unless check_payment_status says "captured".
- Per-order limit: ${tenant.perOrderLimit} ${tenant.currency}. Payment method on file: ${tenant.savedPaymentMethod}.
- If the user states a lasting preference, save it with remember_user_preference.
- If the user writes in Georgian: think and act the same way, but reply in natural Georgian and use the Georgian names
  (name_ka / venue_ka) from the tools when present.
- Reply in the user's language (Georgian, English, Russian…). Max 2 short sentences: what you picked + "confirm the payment below". No questions, no markdown, no lists. Use "₾" for prices.

What you remember about this user on ${tenant.name}:
${mem.preferences.map((p) => `- ${p}`).join("\n") || "- (nothing yet)"}

Their recent orders on ${tenant.name}:
${orders.join("\n") || "- (none)"}`;
}

// ---------- Gemini ----------

async function callGemini(system: string, contents: Content[], attempt = 1): Promise<Content> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CALL_TIMEOUT_MS);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-goog-api-key": API_KEY! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        tools: [{ functionDeclarations: toolDeclarations }],
        generationConfig: { thinkingConfig: { includeThoughts: true, ...(THINKING ? { thinkingLevel: THINKING } : {}) } },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      if (attempt < 2 && (res.status === 429 || res.status >= 500)) return callGemini(system, contents, attempt + 1);
      throw new Error(`Gemini ${res.status}: ${body.slice(0, 400)}`);
    }
    const data: any = await res.json();
    const content = data.candidates?.[0]?.content as Content | undefined;
    if (!content?.parts) throw new Error(`Gemini returned no content: ${JSON.stringify(data).slice(0, 400)}`);
    return { ...content, role: "model" };
  } catch (e: any) {
    if (e.name === "AbortError" && attempt < 2) return callGemini(system, contents, attempt + 1); // latency spike: retry once
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- the turn ----------

export async function runTurn(
  tenant: Tenant, userId: string, message: string, location?: Location, onEvent: (e: AgentEvent) => void = () => {},
): Promise<TurnResult> {
  const mem = memoryFor(tenant.id).user(userId); // <- the only memory this turn can ever touch
  const ctx: Ctx = { tenant, userId, mem, location: location ?? tenant.defaultLocation, lang: detectLang(message) };
  const trace: AgentEvent[] = [];
  const emit = (e: AgentEvent) => { trace.push(e); onEvent(e); };

  if (MODE === "mock") return await mockTurn(ctx, message, trace, emit);

  const historyLen = mem.history.length;
  mem.history.push({ role: "user", parts: [{ text: message }] });
  const system = systemPrompt(ctx);

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      emit({ type: "status", text: ctx.lang === "ka" ? (step === 0 ? "ვიგებ მოთხოვნას…" : "ვმუშაობ…") : step === 0 ? "Understanding your request…" : "Working on it…" });
      const modelContent = await callGemini(system, mem.history);
      mem.history.push(modelContent); // kept verbatim so thought signatures survive
      for (const p of modelContent.parts) if (p.thought && p.text) emit({ type: "thinking", text: p.text.trim() }); // Gemini thought summaries

      const calls = modelContent.parts.filter((p) => p.functionCall).map((p) => p.functionCall);
      if (!calls.length) {
        trimHistory(mem.history);
        const reply = modelContent.parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();
        emit({ type: "reply", text: reply });
        return { reply, trace, payment: ctx.proposed };
      }

      const responses = calls.map((c: any) => {
        const result = executeTool(ctx, c.name, c.args ?? {});
        emit({ type: "tool", tool: c.name, label: toolLabel(ctx, c.name, c.args ?? {}, result), args: c.args, result });
        if (c.name === "create_payment_intent" && !result.error) emit({ type: "payment", payment: ctx.proposed! });
        return { functionResponse: { name: c.name, ...(c.id ? { id: c.id } : {}), response: result } };
      });
      mem.history.push({ role: "user", parts: responses });
    }
  } catch (e) {
    mem.history.length = historyLen; // don't leave a half-finished turn in memory
    throw e;
  }
  const reply = ctx.proposed ? "Your order is ready below — tap Pay to confirm." : "Sorry, I couldn't finish that. Could you rephrase?";
  emit({ type: "reply", text: reply });
  return { reply, trace, payment: ctx.proposed };
}

// Mock agent (no API key, or AGENTPAY_MOCK=1): a deterministic keyword planner that drives the SAME tools
// as Gemini, so every tenant's flow is demoable/testable without spending model quota. It understands:
// quantities ("two", "2x"), several items in one message, "without X and Y" / "no X" / "extra X" / "with X"
// options, brand/venue names, and picks the best-matching venue (nearest on ties).
const NUM: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, couple: 2, pair: 2,
  ერთი: 1, ორი: 2, ორ: 2, სამი: 3, სამ: 3, ოთხი: 4, ოთხ: 4, ხუთი: 5, ხუთ: 5, ექვსი: 6 };
const STOP = new Set(("i want to buy order me a an the please get some from nearest near closest for and with without no of in on at my " +
  "book reserve purchase need would like can you could give take ticket tickets x pcs " +
  // Georgian filler / request verbs
  "მინდა მინდოდა იყიდე მიყიდე შეიძინე შემიძინე შეუკვეთე შემიკვეთე დაჯავშნე დამიჯავშნე მომიტანე გამომიძახე გამიძახე " +
  "უახლოესი უახლოეს უახლოესიდან უახლოესში ახლოს ჩემი ჩემთვის და ან ერთად გთხოვთ გთხოვ ცალი ცალს " +
  "ბილეთი ბილეთს ბილეთები ბილეთზე").split(" "));
const commonPrefix = (a: string, b: string) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };
// Word similarity: exact, prefix (≥4 chars), or for Georgian a shared stem (handles case endings: შაურმა/შაურმები/შაურმას).
const similar = (h: string, w: string) =>
  h === w || (h.length > 3 && w.length > 3 && (h.startsWith(w) || w.startsWith(h))) ||
  (GEO.test(w) && commonPrefix(h, w) >= Math.max(4, Math.ceil(0.6 * Math.min(h.length, w.length))));
const stem = (w: string) => (w.length > 4 && w.endsWith("es") && !w.endsWith("ses") ? w.slice(0, -2) : w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const tokenize = (t: string) => t.toLowerCase().replace(/(\d)\s*x\b/g, "$1 ").split(/[^\p{L}\p{N}.]+/u).map((w) => w.replace(/^\.+|\.+$/g, "")).filter(Boolean);

function mockPlan(ctx: Ctx, message: string) {
  const { tenant, location } = ctx;
  const toks = tokenize(message);
  const words = toks.map(stem).filter((w) => !STOP.has(w) && !(w in NUM));
  // option phrases: "without onion and peppers", "no tomato", "extra cheese", "with breakfast"
  const optWords = new Set<string>();
  const optRe = /\b(without|no|extra|with|add|plus)\s+([\p{L}\p{N}\s,]+?)(?=$|[.;!?+]|\s(?:and\s+(?:a|an|one|two|three|\d)\b|from|at|in|to|for|this|next|on)\b)/giu;
  for (const m of message.toLowerCase().matchAll(optRe)) for (const w of tokenize(m[2])) if (!STOP.has(w)) optWords.add(stem(w));
  // only words that actually name an option count as option words ("extra cheese and fries" → fries stays an item)
  const OPT_KW = new Set(["without", "no", "extra", "with", "add", "plus", "გარეშე", "დამატებით", "ექსტრა"]);
  const optHay = (o: NonNullable<Tenant["catalog"][number]["options"]>[number]) => `${o.name} ${o.ka ?? ""} ${(o.tags ?? []).join(" ")}`;
  const optionVocab = new Set(tenant.catalog.flatMap((i) => (i.options ?? []).flatMap((o) => tokenize(optHay(o)).map(stem))).filter((w) => !OPT_KW.has(w)));
  const inOptionVocab = (w: string) => [...optionVocab].some((h) => similar(h, w));
  // Georgian: "ხახვის და წიწაკის გარეშე" (option words BEFORE "გარეშე"), and option words used with case endings
  // ("სასაჩუქრე შეფუთვით", "საუზმით") anywhere — Georgian has no separate "with" word.
  const toksAll = tokenize(message);
  toksAll.forEach((t, k) => {
    if (t !== "გარეშე") return;
    for (let j = k - 1; j >= 0 && k - j <= 6; j--) { if (toksAll[j] === "და") continue; if (!inOptionVocab(toksAll[j])) break; optWords.add(stem(toksAll[j])); }
  });
  const itemVocab = new Set(tenant.catalog.flatMap((i) => tokenize(`${i.name} ${i.ka ?? ""} ${i.tags.join(" ")}`).map(stem)));
  for (const t of toksAll) if (GEO.test(t) && !STOP.has(t) && inOptionVocab(t) && ![...itemVocab].some((h) => similar(h, t))) optWords.add(stem(t));
  for (const w of [...optWords]) if (OPT_KW.has(w) || !inOptionVocab(w)) optWords.delete(w);
  const itemWords = words.filter((w) => !optWords.has(w));

  const hay = (s: string) => tokenize(s).map(stem);
  const venueWords = (vId: string) => { const v = tenant.venues.find((v) => v.id === vId)!; return new Set(hay(`${v.name} ${v.area} ${v.cuisine} ${v.ka?.name ?? ""} ${v.ka?.area ?? ""}`)); };
  const itemHay = (i: Tenant["catalog"][number]) => new Set(hay(`${i.name} ${i.ka ?? ""} ${i.category} ${i.tags.join(" ")}`));
  const matchCount = (set: Set<string>, ws: string[]) => ws.filter((w) => set.has(w) || [...set].some((h) => similar(h, w))).length;

  // 1) choose venue: words matching the venue itself + best item coverage; ties → nearest
  const venues = tenant.venues.map((v) => {
    const vw = venueWords(v.id);
    const venueScore = matchCount(vw, itemWords);
    const items = tenant.catalog.filter((i) => i.venueId === v.id);
    const covered = new Set(itemWords.filter((w) => items.some((i) => matchCount(itemHay(i), [w]))));
    return { v, score: venueScore * 2 + covered.size, d: km(location, v) };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.d - b.d);
  if (!venues.length) return { venue: undefined, lines: [] as any[], ranked: [] as typeof venues };
  const venue = venues[0].v;

  // 2) greedily pick items in that venue, consuming matched words
  let remaining = itemWords.filter((w) => !matchCount(venueWords(venue.id), [w]) || tenant.catalog.some((i) => i.venueId === venue.id && matchCount(itemHay(i), [w])));
  const lines: { item_id: string; qty: number; option_ids: string[] }[] = [];
  const pool = tenant.catalog.filter((i) => i.venueId === venue.id);
  for (let guard = 0; guard < 6 && remaining.length; guard++) {
    const best = pool
      .filter((i) => !lines.some((l) => l.item_id === i.id))
      .map((i) => {
        const h = itemHay(i), nameH = new Set(hay(ctx.lang === "ka" && i.ka ? i.ka : i.name)); // name in the user's language
        const hit = remaining.filter((w) => matchCount(h, [w]));
        return { i, hit, nameHits: matchCount(nameH, hit), extra: nameH.size - matchCount(nameH, hit) };
      })
      .filter((x) => x.hit.length > 0)
      // words in the item's NAME beat words only in its tags; then fewest unmatched name words; then cheapest
      .sort((a, b) => b.nameHits - a.nameHits || b.hit.length - a.hit.length || a.extra - b.extra || a.i.price - b.i.price)[0];
    if (!best) break;
    // quantity = number word just before the first matched word in the original message
    const pos = toks.findIndex((t) => best.hit.includes(stem(t)));
    let qty = 1;
    // look back up to 3 meaningful words (filler like "the/for/tickets" doesn't count toward the window)
    for (let k = pos - 1, seen = 0; k >= 0 && seen < 3; k--) {
      const t = toks[k];
      if (t in NUM) { qty = NUM[t]; break; }
      if (/^\d{1,2}$/.test(t)) { qty = +t; break; }
      if (t === "and" || t === "with" || t === "without" || t === "extra" || t === "no" || t === "+") break;
      if (!STOP.has(t)) seen++;
    }
    const option_ids = (best.i.options ?? []).filter((o) => matchCount(new Set(hay(optHay(o)).filter((w) => !OPT_KW.has(w))), [...optWords])).map((o) => o.id);
    lines.push({ item_id: best.i.id, qty, option_ids, pos } as any);
    remaining = remaining.filter((w) => !best.hit.includes(w));
  }
  lines.sort((a: any, b: any) => a.pos - b.pos); // keep the order the user said them in
  return { venue, lines: lines.map(({ item_id, qty, option_ids }) => ({ item_id, qty, option_ids })), ranked: venues };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Human-readable reasoning for the mock agent, derived from its plan (Gemini emits its own thought summaries).
function mockThoughts(ctx: Ctx, plan: ReturnType<typeof mockPlan>) {
  const { tenant } = ctx;
  const ka = ctx.lang === "ka";
  const sym = tenant.currencySymbol;
  const item = (id: string) => tenant.catalog.find((i) => i.id === id)!;
  const optsOf = (l: { item_id: string; option_ids: string[] }) => l.option_ids.map((o) => item(l.item_id).options!.find((x) => x.id === o)!);
  const describe = (l: { item_id: string; qty: number; option_ids: string[] }) => {
    const opts = optsOf(l).map((o) => iName(ctx, o).toLowerCase());
    return `${l.qty}× ${iName(ctx, item(l.item_id))}${opts.length ? ` (${opts.join(", ")})` : ""}`;
  };
  const v = plan.venue!;
  const area = (x: Tenant["venues"][number]) => (ka ? x.ka?.area ?? x.area : x.area) || iName(ctx, x);
  const where = (x: { v: Tenant["venues"][number]; d: number }) => `${area(x.v)} ${x.d.toFixed(1)} ${ka ? "კმ" : "km"}`;
  const branches = plan.ranked.filter((x) => x.v.name === v.name);
  const others = plan.ranked.filter((x) => x.v.id !== v.id).slice(0, 2);
  const vn = vName(ctx, v), brand = ka ? v.ka?.name ?? v.name : v.name, dist = km(ctx.location, v).toFixed(1);
  const eta = v.etaMax ? ` (${v.etaMin}–${v.etaMax} ${ka ? "წთ" : "min"})` : "";
  const venueThought = branches.length > 1
    ? ka
      ? `${kaGen(brand)} ${branches.length} ფილიალი აქვს: ${branches.slice(0, 4).map(where).join(", ")}. ვირჩევ ფილიალს: ${vn} — ყველაზე ახლოსაა${eta}.`
      : `${v.name} has ${branches.length} locations: ${branches.slice(0, 4).map(where).join(", ")}. Picking ${v.name} ${v.area} — it's the nearest${eta}.`
    : ka
      ? `საუკეთესო შესაბამისობა: ${vn}, ${dist} კმ-ში.${others.length ? ` განვიხილე ${others.map((x) => vName(ctx, x.v)).join(" და ")}, მაგრამ მოთხოვნას ნაკლებად შეესაბამება.` : ""}`
      : `Best match is ${vn}, ${dist} km away${others.length ? `; also considered ${others.map((x) => x.v.name).join(" and ")}, but they match the request less well` : ""}.`;
  const lineThoughts = plan.lines.map((l) => {
    const i = item(l.item_id), opts = optsOf(l);
    const q = (t: string) => (ka ? `„${t}“` : `“${t}”`);
    const o = opts.length ? ` + ${opts.map((o) => `${q(iName(ctx, o))}${o.price ? ` +${sym}${o.price.toFixed(2)}` : ""}`).join(", ")}` : "";
    return `${iName(ctx, i)}: ${sym}${i.price.toFixed(2)}${o} × ${l.qty}.`;
  });
  const subtotal = plan.lines.reduce((s, l) => s + l.qty * (item(l.item_id).price + optsOf(l).reduce((a, o) => a + o.price, 0)), 0);
  const total = subtotal + v.deliveryFee + tenant.serviceFee;
  const fees = `${v.deliveryFee ? ` + ${sym}${v.deliveryFee.toFixed(2)} ${ka ? "საკომისიო" : "fee"}` : ""}${tenant.serviceFee ? ` + ${sym}${tenant.serviceFee.toFixed(2)} ${ka ? "მომსახურება" : "service"}` : ""}`;
  return ka
    ? {
        request: `მომხმარებელს სურს ${plan.lines.map(describe).join(" და ")}. ყველა საჭირო ინფორმაცია მოცემულია, ამიტომ შეკვეთას თავად მოვამზადებ და მხოლოდ გადახდის დადასტურებას ვთხოვ.`,
        venue: venueThought,
        lines: lineThoughts.join(" "),
        total: `ჯამი ${sym}${subtotal.toFixed(2)}${fees} = ${sym}${total.toFixed(2)} — ${sym}${tenant.perOrderLimit}-ის ლიმიტის ფარგლებში. ${tenant.savedPaymentMethod}-დან თანხა ჩამოიჭრება მხოლოდ მომხმარებლის დადასტურების შემდეგ.`,
      }
    : {
        request: `The user wants ${plan.lines.map(describe).join(" and ")}. Everything needed is in the message, so I'll prepare the whole order myself and only ask them to confirm the payment.`,
        venue: venueThought,
        lines: lineThoughts.join(" "),
        total: `Total ${sym}${subtotal.toFixed(2)}${fees} = ${sym}${total.toFixed(2)} — within the ${sym}${tenant.perOrderLimit} limit. Charging ${tenant.savedPaymentMethod} only after the user confirms.`,
      };
}

async function mockTurn(ctx: Ctx, message: string, trace: AgentEvent[], emit: (e: AgentEvent) => void): Promise<TurnResult> {
  const run = (tool: string, args: any) => {
    const result = executeTool(ctx, tool, args);
    emit({ type: "tool", tool, label: toolLabel(ctx, tool, args, result), args, result });
    return result;
  };
  ctx.mem.history.push({ role: "user", parts: [{ text: message }] });
  const ka = ctx.lang === "ka";
  emit({ type: "status", text: ka ? "ვიგებ მოთხოვნას…" : "Understanding your request…" });
  const pref = message.match(/\bi(?:'m| am)\s+(vegetarian|vegan|allergic to \w+)\b/i);
  if (pref) run("remember_user_preference", { fact: pref[1].toLowerCase() });

  const plan = mockPlan(ctx, message);
  const th = plan.venue && plan.lines.length ? mockThoughts(ctx, plan) : null;
  const think = async (text?: string) => { if (!text) return; await sleep(500); emit({ type: "thinking", text }); await sleep(350); };
  await think(th?.request);
  const query = plan.venue && plan.lines.length
    ? `${ka ? plan.venue.ka?.name ?? plan.venue.name : plan.venue.name} ${plan.lines.map((l) => iName(ctx, ctx.tenant.catalog.find((i) => i.id === l.item_id)!)).join(", ")}`.toLowerCase()
    : tokenize(message).filter((w) => !STOP.has(w) && !(w in NUM)).join(" ");
  run("search_nearby_items", { query });
  await think(th?.venue);
  let reply: string;
  const sym = ctx.tenant.currencySymbol;
  if (!plan.venue || !plan.lines.length)
    reply = ka ? `${ctx.tenant.name}-ზე ეს ვერ ვიპოვე. სცადეთ სხვანაირად აღწერა.` : `I couldn't find that on ${ctx.tenant.name}. Could you describe it differently?`;
  // Autonomous by default: anything that isn't clearly a question becomes a ready-to-confirm payment.
  else if (!/\?\s*$|^\s*(what|which|is|are|do|does|how|show|list|any)\b|^\s*(რა|რომელი|რამდენი|არის)\s/i.test(message) || /\b(buy|order|book|reserve|purchase)\b/i.test(message)) {
    run("get_venue_menu", { venue_id: plan.venue.id });
    await think(th?.lines);
    await think(th?.total);
    const r = run("create_payment_intent", { items: plan.lines });
    if (r.error) reply = ka ? `შეკვეთის შედგენა ვერ მოხერხდა: ${r.error}` : `I couldn't put that order together: ${r.error}`;
    else {
      emit({ type: "payment", payment: ctx.proposed! });
      reply = ka
        ? `შეკვეთა მზადაა — ${vName(ctx, plan.venue)}, სულ ${sym}${r.total.toFixed(2)}. დაადასტურეთ გადახდა ქვემოთ.`
        : `Your order from ${vName(ctx, plan.venue)} is ready — ${sym}${r.total.toFixed(2)} in total. Confirm the payment below when you're ready.`;
    }
  } else {
    const r = run("get_venue_menu", { venue_id: plan.venue.id });
    const list = plan.lines.map((l) => { const i = ctx.tenant.catalog.find((i) => i.id === l.item_id)!; return `${iName(ctx, i)} ${sym}${i.price.toFixed(2)}`; }).join(", ");
    reply = ka ? `${vName(ctx, plan.venue)}: ${list}. გნებავთ, შევუკვეთო?` : `At ${vName(ctx, plan.venue)}: ${list}. Want me to order it?`;
  }
  ctx.mem.history.push({ role: "model", parts: [{ text: reply }] });
  trimHistory(ctx.mem.history);
  emit({ type: "reply", text: reply });
  return { reply, trace, payment: ctx.proposed };
}
