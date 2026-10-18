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
  const color = cfg.color || "#111";
  let location = cfg.lat ? { lat: +cfg.lat, lng: +cfg.lng, label: cfg.locationLabel } : null;
  if (!location && navigator.geolocation)
    navigator.geolocation.getCurrentPosition((p) => (location = { lat: p.coords.latitude, lng: p.coords.longitude }));

  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; }
    .fab { position: fixed; right: 20px; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; border: 0;
           background: ${color}; color: #fff; font-size: 24px; cursor: pointer; box-shadow: 0 4px 14px #0003; z-index: 99999; }
    .panel { position: fixed; right: 20px; bottom: 88px; width: 360px; height: 520px; background: #fff; border-radius: 14px;
             box-shadow: 0 8px 30px #0003; display: none; flex-direction: column; overflow: hidden; z-index: 99999; }
    .panel.open { display: flex; }
    header { background: ${color}; color: #fff; padding: 12px 14px; font-weight: 600; font-size: 14px; }
    header small { display: block; font-weight: 400; opacity: .85; }
    .log { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #f6f7f9; }
    .msg { max-width: 85%; padding: 8px 11px; border-radius: 12px; font-size: 14px; line-height: 1.35; white-space: pre-wrap; }
    .user { align-self: flex-end; background: ${color}; color: #fff; }
    .agent { align-self: flex-start; background: #fff; border: 1px solid #e3e5e8; }
    .card { align-self: stretch; background: #fff; border: 2px solid ${color}; border-radius: 12px; padding: 10px 12px; font-size: 13px; }
    .card b { font-size: 15px; } .card .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .card .btns { display: flex; gap: 8px; margin-top: 8px; }
    .card button { flex: 1; padding: 8px; border-radius: 8px; border: 0; cursor: pointer; font-weight: 600; }
    .pay { background: ${color}; color: #fff; } .cancel { background: #eee; }
    .status { font-weight: 600; margin-top: 6px; }
    form { display: flex; border-top: 1px solid #e3e5e8; }
    input { flex: 1; border: 0; padding: 12px; font-size: 14px; outline: none; }
    form button { border: 0; background: none; color: ${color}; font-weight: 700; padding: 0 14px; cursor: pointer; }
    .typing { font-size: 12px; color: #888; padding-left: 4px; }
  </style>
  <button class="fab" title="Buy with AI">✦</button>
  <div class="panel">
    <header>AI checkout assistant<small>Type what you want — I'll find it nearby and pay for you.</small></header>
    <div class="log"></div>
    <form><input placeholder="e.g. order me a khachapuri" /><button>Send</button></form>
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
