// PROTOTYPE — throwaway. The embeddable chat widget. A client adds ONE tag:
//
//   <script src="https://agentpay.example/widget.js"
//           data-key="pk_wolt_demo" data-user-id="user_123"
//           data-lat="41.709" data-lng="44.766" data-color="#009de0"></script>
//
// Shadow DOM keeps our styles from clashing with the client's site.
(() => {
  const script = document.currentScript;
  const cfg = script.dataset;
  const API = new URL(script.src).origin;
  let location = cfg.lat ? { lat: +cfg.lat, lng: +cfg.lng, label: cfg.locationLabel } : null;
  if (!location && navigator.geolocation)
    navigator.geolocation.getCurrentPosition((p) => (location = { lat: p.coords.latitude, lng: p.coords.longitude }));

  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Michroma&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Georgian:wght@400;500&display=swap");
    * { box-sizing: border-box; font-family: "Space Grotesk", "Noto Sans Georgian", system-ui, sans-serif; }
    .fab { position: fixed; right: 20px; bottom: 20px; height: 52px; padding: 0 16px 0 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,.35);
           background: #08090b; color: #eceef2; cursor: pointer; z-index: 99999; display: flex; align-items: center; gap: 8px;
           box-shadow: 0 8px 30px #0008; letter-spacing: .12em; font-family: Michroma, sans-serif; font-size: 12px; }
    .fab svg { width: 16px; height: 16px; fill: #eceef2; }
    .panel { position: fixed; right: 20px; bottom: 84px; width: 360px; height: 520px; background: #08090b; color: #eceef2; border-radius: 18px;
             border: 1px solid rgba(255,255,255,.12); box-shadow: 0 30px 60px -20px #000; display: none; flex-direction: column; overflow: hidden; z-index: 99999; }
    .panel.open { display: flex; }
    header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px; border-bottom: 1px solid rgba(255,255,255,.1); background: #08090b; }
    header svg { width: 16px; height: 16px; fill: #eceef2; flex: none; }
    header b { font-family: Michroma, sans-serif; font-weight: 400; letter-spacing: .14em; font-size: 13px; }
    header small { display: block; font-family: "JetBrains Mono", monospace; font-weight: 400; font-size: 10px; letter-spacing: .08em; color: rgba(236,238,242,.5); margin-top: 3px; }
    .log { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: transparent; }
    .msg { max-width: 85%; padding: 8px 11px; border-radius: 12px; font-size: 14px; line-height: 1.35; white-space: pre-wrap; }
    .user { align-self: flex-end; background: #f2f3f5; color: #111; }
    .agent { align-self: flex-start; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); }
    .card { align-self: stretch; background: rgba(12,13,16,.9); border: 1px solid rgba(255,255,255,.14); border-radius: 14px; padding: 12px; font-size: 13px; }
    .card b { font-size: 15px; } .card .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .card .btns { display: flex; gap: 8px; margin-top: 8px; }
    .card button { flex: 1; padding: 8px; border-radius: 8px; border: 0; cursor: pointer; font-weight: 600; }
    .pay { background: #f2f3f5; color: #111; } .cancel { background: rgba(255,255,255,.08); color: rgba(236,238,242,.7); }
    .status { font-weight: 600; margin-top: 6px; font-family: "JetBrains Mono", monospace; font-size: 11px; letter-spacing: .06em; }
    form { display: flex; align-items: center; gap: 8px; padding: 10px; border-top: 1px solid rgba(255,255,255,.12); }
    input { flex: 1; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.04); color: #fff; border-radius: 12px; padding: 12px; font-size: 14px; outline: none; font-family: "JetBrains Mono", monospace; }
    input::placeholder { color: rgba(255,255,255,.35); }
    form button { width: 42px; height: 42px; border: 0; border-radius: 50%; background: #f2f3f5; color: #111; font-weight: 700; cursor: pointer; }
    .typing { font-size: 12px; color: rgba(236,238,242,.5); padding-left: 4px; font-family: "JetBrains Mono", monospace; }
  </style>
  <button class="fab" title="Alde"><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="0" y="0" width="4" height="4"/><rect x="4" y="4" width="4" height="4"/><rect x="8" y="0" width="4" height="4" opacity=".4"/><rect x="0" y="8" width="4" height="4" opacity=".4"/></svg>ALDE</button>
  <div class="panel">
    <header><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="0" y="0" width="4" height="4"/><rect x="4" y="4" width="4" height="4"/><rect x="8" y="0" width="4" height="4" opacity=".4"/><rect x="0" y="8" width="4" height="4" opacity=".4"/></svg><div><b>ALDE</b><small>THE AGENT · SAY WHAT YOU WANT</small></div></header>
    <div class="log"></div>
    <form><input placeholder="Tell Alde what you want…" /><button aria-label="Send">↑</button></form>
  </div>`;

  const $ = (s) => root.querySelector(s);
  const log = $(".log");
  $(".fab").onclick = () => { $(".panel").classList.toggle("open"); $("input").focus(); };

  const api = (path, body) =>
    fetch(API + path, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agentpay-key": cfg.key },
      body: JSON.stringify({ userId: cfg.userId, ...body }),
    }).then((r) => r.json());

  const add = (cls, text) => {
    const el = document.createElement("div");
    el.className = "msg " + cls;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };
  const changed = () => window.dispatchEvent(new CustomEvent("agentpay:update"));

  function paymentCard(p) {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML =
      `<b>Confirm payment</b>` +
      p.lines.map((l) => `<div class="row"><span>${l.qty}× ${l.name}<br><small>${p.venue.name}${l.options.length ? " · " + l.options.join(", ") : ""}</small></span><span>${l.qty * l.unitPrice} ${p.currency}</span></div>`).join("") +
      `<div class="row"><b>Total</b><b>${p.total} ${p.currency}</b></div>
       <div class="btns"><button class="cancel">Cancel</button><button class="pay">Confirm & pay</button></div>
       <div class="status"></div>`;
    const done = (r) => {
      el.querySelector(".btns").remove();
      el.querySelector(".status").textContent =
        r.error ? "⚠ " + r.error : r.status === "captured" ? "✓ Paid — order placed" : "Cancelled";
      changed();
    };
    el.querySelector(".pay").onclick = () => api(`/v1/payments/${p.id}/confirm`, {}).then(done);
    el.querySelector(".cancel").onclick = () => api(`/v1/payments/${p.id}/cancel`, {}).then(done);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  $("form").onsubmit = async (e) => {
    e.preventDefault();
    const text = $("input").value.trim();
    if (!text) return;
    $("input").value = "";
    add("user", text);
    const typing = add("typing", "agent is working…");
    const r = await api("/v1/chat", { message: text, location }).catch((err) => ({ error: String(err) }));
    typing.remove();
    if (r.error) add("agent", "⚠ " + r.error);
    else {
      add("agent", r.reply || "(no reply)");
      if (r.payment) paymentCard(r.payment);
    }
    changed();
  };
})();
