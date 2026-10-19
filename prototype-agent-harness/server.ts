// PROTOTYPE — throwaway. Run from the project root: bun run proto
//
//   POST /v1/chat                     agent turn, JSON response        (header x-agentpay-key)
//   POST /v1/chat/stream              agent turn, NDJSON live events   (header x-agentpay-key)
//   POST /v1/orders                   create a payment intent from the host's own cart UI
//   POST /v1/payments/:id/confirm     user tapped "Pay"
//   POST /v1/payments/:id/cancel
//   GET  /sdk.js                      JS SDK for deep integrations (host renders its own UI)
//   GET  /widget.js                   drop-in chat bubble for zero-effort integrations
//   GET  /                            client guide;  /demo = tenant index;  /demo/wolt = look-alike app
//   GET  /demo-data/:tenant           the tenant's venues + menu (stands in for the client's own catalog)
//   GET  /debug/:tenant               that tenant's isolated memory + payments
//   POST /debug/:tenant/reset         wipe that tenant's memory + payments (before a demo)

import { tenantById, tenantByKey, tenants } from "./tenants/index";
import { runTurn, MODE, MODEL, type AgentEvent } from "./harness";
import { memoryFor, resetMemory } from "./memory";
import { cancelByUser, confirmByUser, createIntent, intentsFor, resetPayments } from "./payments";

const PORT = Number(process.env.PORT ?? 8787);
const dir = import.meta.dir;

const TRY: Record<string, string> = {
  wolt: "Order me a khachapuri",
  bolt: "Taxi to the airport",
  wizzair: "A flight to Berlin",
  swoop: "Two ice skating vouchers",
  tktge: "Tickets for tonight",
  myhome: "A room in Vake this weekend",
  biblusi: "A Georgian novel",
  orinabiji: "Milk, bread and eggs",
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const tenantCards = (list: typeof tenants) => list.map((t) => `<a class="agent" href="/demo/${esc(t.id)}"><i style="background:${esc(t.brandColor)};color:${esc(t.brandColor)}"></i><span><b>${esc(t.name)}</b><em>${esc(TRY[t.id] ?? "Open the agent")}</em></span><span class="go">OPEN</span></a>`).join("");

const cors = {
  "access-control-allow-origin": "*", // production: per-tenant allowed origins
  "access-control-allow-headers": "content-type, x-agentpay-key",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};
const json = (data: any, status = 200) => Response.json(data, { status, headers: cors });
const file = (name: string, type: string) => new Response(Bun.file(`${dir}/${name}`), { headers: { ...cors, "content-type": type } });

Bun.serve({
  port: PORT,
  idleTimeout: 120, // agent turns can take a while
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    if (path === "/widget.js") return file("widget.js", "text/javascript");
    if (path === "/sdk.js") return file("sdk.js", "text/javascript");
    if (path === "/agentpay-ui.js") return file("agentpay-ui.js", "text/javascript");
    if (path === "/" || path === "/guide") {
      const html = (await Bun.file(`${dir}/home.html`).text())
        .replaceAll("{{TENANT_COUNT}}", String(tenants.length))
        .replace("{{TENANT_CARDS}}", tenantCards(tenants));
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
    }
    if (path === "/demo") {
      const links = tenants.map((t) => `<a class="t" style="background:${t.brandColor}" href="/demo/${t.id}">${t.name}</a>`).join("");
      return new Response((await Bun.file(`${dir}/demo-index.html`).text()).replace("{{TENANT_LINKS}}", links), { headers: { "content-type": "text/html" } });
    }
    const demo = path.match(/^\/demo\/(\w+)$/);
    if (demo && tenantById(demo[1]) && (await Bun.file(`${dir}/apps/${demo[1]}.html`).exists()))
      return file(`apps/${demo[1]}.html`, "text/html"); // full look-alike app for this client
    if (demo && tenantById(demo[1])) { // fallback: generic site + drop-in widget
      const t = tenantById(demo[1])!;
      const html = (await Bun.file(`${dir}/demo-client-site.html`).text())
        .replaceAll("{{NAME}}", t.name).replaceAll("{{ID}}", t.id)
        .replaceAll("{{KEY}}", t.publishableKey).replaceAll("{{COLOR}}", t.brandColor)
        .replaceAll("{{LAT}}", String(t.defaultLocation.lat)).replaceAll("{{LNG}}", String(t.defaultLocation.lng))
        .replaceAll("{{LABEL}}", t.defaultLocation.label);
      return new Response(html, { headers: { "content-type": "text/html" } });
    }

    const data = path.match(/^\/demo-data\/(\w+)$/);
    if (data && tenantById(data[1])) {
      const t = tenantById(data[1])!;
      return json({ id: t.id, name: t.name, publishableKey: t.publishableKey, brandColor: t.brandColor, currencySymbol: t.currencySymbol,
        venues: t.venues, catalog: t.catalog, location: t.defaultLocation, serviceFee: t.serviceFee, paymentMethod: t.savedPaymentMethod });
    }

    const dbg = path.match(/^\/debug\/(\w+)(\/reset)?$/);
    if (dbg && tenantById(dbg[1])) {
      if (dbg[2] && req.method === "POST") { resetMemory(dbg[1]); resetPayments(dbg[1]); }
      return json({ mode: MODE, model: MODEL, tenant: dbg[1], memory: memoryFor(dbg[1]).dump(), payments: intentsFor(dbg[1]) });
    }

    // ---- authenticated API: everything below is scoped to the tenant behind the key ----
    if (!path.startsWith("/v1/")) return new Response("Not found", { status: 404 });
    const tenant = tenantByKey(req.headers.get("x-agentpay-key"));
    if (!tenant) return json({ error: "Invalid x-agentpay-key" }, 401);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    // PROTOTYPE: userId is trusted from the browser. Production: client backend mints a signed session token.
    const userId = body.userId ? String(body.userId) : "";

    if ((path === "/v1/chat" || path === "/v1/chat/stream") && req.method === "POST") {
      if (!userId || !body.message) return json({ error: "userId and message required" }, 400);
      const message = String(body.message).slice(0, 2000);

      if (path === "/v1/chat") {
        try { return json(await runTurn(tenant, userId, message, body.location)); }
        catch (e: any) { console.error(e); return json({ error: e.message }, 502); }
      }

      const enc = new TextEncoder();
      return new Response(
        new ReadableStream({
          async start(c) {
            const send = (e: AgentEvent | { type: "error"; text: string } | { type: "done" }) => c.enqueue(enc.encode(JSON.stringify(e) + "\n"));
            try { await runTurn(tenant, userId, message, body.location, send); }
            catch (e: any) { console.error(e); send({ type: "error", text: "The assistant is having trouble right now. Please try again." }); }
            send({ type: "done" });
            c.close();
          },
        }),
        { headers: { ...cors, "content-type": "application/x-ndjson", "cache-control": "no-cache" } },
      );
    }

    if (path === "/v1/orders" && req.method === "POST") {
      const r = createIntent(tenant, userId, body.items, "user"); // created from the host app's own checkout
      return "error" in r ? json(r, 400) : json(r);
    }

    const pay = path.match(/^\/v1\/payments\/(\w+)\/(confirm|cancel)$/);
    if (pay && req.method === "POST") {
      const r = pay[2] === "confirm" ? confirmByUser(tenant.id, userId, pay[1]) : cancelByUser(tenant.id, userId, pay[1]);
      return "error" in r ? json(r, 409) : json(r);
    }

    return json({ error: "Not found" }, 404);
  },
});

console.log(`Alde client guide on http://localhost:${PORT}/   (Wolt demo: http://localhost:${PORT}/demo/wolt)`);
console.log(`Agent mode: ${MODE === "gemini" ? `Gemini (${MODEL})` : "MOCK (set GEMINI_API_KEY to use Gemini)"}`);
console.log(`Tenants: ${tenants.map((t) => `${t.name} [${t.publishableKey}]`).join(", ")}`);
