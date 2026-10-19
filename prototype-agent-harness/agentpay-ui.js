// PROTOTYPE — throwaway. Shared AgentPay UI pieces that every client app embeds (served at /agentpay-ui.js):
//
//   const tb = AgentPayUI.thinking(msgsEl, { accent, onUpdate })   // "Thinking…" → "Thought for 3.2s"
//   tb.status(text); tb.thought(text); tb.step(label, ok); tb.done();
//
//   const paid = await AgentPayUI.pay({ root: screenEl, agent, payment, accent, merchant })
//   // visualises the real card-payment path (Face ID → network token → 3-D Secure → bank authorisation →
//   // capture via agent.confirm → receipt) and resolves with the captured intent, or null on failure.
//
//   AgentPayUI.stages(containerEl, [{ title, detail, ms }], { accent, onDone })   // live fulfilment timeline
(() => {
  const css = `
  /* Chat lists are flex columns: never let messages/cards shrink (that clipped the Pay button), let the list scroll. */
  #msgs, .msgs { min-height: 0 !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
  #msgs > *, .msgs > * { flex-shrink: 0 !important; }
  .apui-think { align-self: stretch; font-size: 13px; line-height: 1.45; margin: 2px 0; }
  .apui-think-h { display: inline-flex; align-items: center; gap: 7px; font-weight: 800; color: rgba(32,33,37,.62); cursor: pointer; user-select: none; padding: 2px 0; background: none; border: 0; font: inherit; font-size: 13px; }
  .apui-think-h .apui-spark { color: var(--apui-accent); font-size: 14px; }
  .apui-think.run .apui-think-h .apui-label { background: linear-gradient(90deg, rgba(32,33,37,.45) 0%, rgba(32,33,37,.9) 40%, rgba(32,33,37,.45) 80%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: apui-shimmer 1.6s linear infinite; }
  @keyframes apui-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
  .apui-chev { transition: transform .2s; opacity: .6; }
  .apui-think.closed .apui-chev { transform: rotate(-90deg); }
  .apui-think-b { border-left: 2px solid rgba(32,33,37,.12); margin: 4px 0 4px 6px; padding: 2px 0 2px 12px; display: flex; flex-direction: column; gap: 6px; }
  .apui-think.closed .apui-think-b { display: none; }
  .apui-thought { color: rgba(32,33,37,.66); font-style: italic; font-weight: 600; animation: apui-in .3s ease-out; }
  .apui-step { display: flex; gap: 7px; align-items: flex-start; color: rgba(32,33,37,.78); font-weight: 700; animation: apui-in .3s ease-out; }
  .apui-step i { width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; display: grid; place-items: center; font-size: 9px; font-style: normal; color: #fff; background: var(--apui-accent); }
  .apui-step.err i { background: #e5484d; }
  @keyframes apui-in { from { opacity: 0; transform: translateY(3px); } }

  .apui-pay { position: absolute; inset: 0; z-index: 120; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; animation: apui-fade .2s; font-family: inherit; }
  @keyframes apui-fade { from { opacity: 0; } }
  .apui-sheet { width: 100%; background: #fff; border-radius: 22px 22px 0 0; padding: 18px 18px 28px; animation: apui-up .3s cubic-bezier(.2,.8,.2,1); max-height: 94%; overflow-y: auto; color: #1d1d1f; }
  @keyframes apui-up { from { transform: translateY(100%); } }
  .apui-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .apui-mlogo { width: 38px; height: 38px; border-radius: 10px; background: var(--apui-accent); color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 17px; }
  .apui-top b { display: block; font-size: 15.5px; font-weight: 800; }
  .apui-top small { color: rgba(0,0,0,.55); font-weight: 600; font-size: 12.5px; }
  .apui-secure { margin-left: auto; font-size: 11px; font-weight: 800; color: #1a7f37; background: #e9f7ee; padding: 4px 8px; border-radius: 99px; }
  .apui-amt { font-size: 34px; font-weight: 900; letter-spacing: -.5px; margin: 4px 0 10px; }
  .apui-rows { border-top: 1px solid rgba(0,0,0,.08); }
  .apui-row { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px solid rgba(0,0,0,.08); font-size: 13.5px; }
  .apui-row span:first-child { color: rgba(0,0,0,.5); font-weight: 600; }
  .apui-row span:last-child { font-weight: 800; text-align: right; }
  .apui-face { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 0 6px; font-weight: 800; font-size: 14px; }
  .apui-face svg { width: 62px; height: 62px; }
  .apui-face .scan { animation: apui-scan 1s ease-in-out infinite; transform-origin: center; }
  @keyframes apui-scan { 50% { transform: scale(.92); opacity: .6; } }
  .apui-steps { margin-top: 12px; display: flex; flex-direction: column; gap: 0; }
  .apui-ps { display: flex; gap: 11px; padding: 8px 0; opacity: .35; transition: opacity .25s; }
  .apui-ps.on, .apui-ps.ok, .apui-ps.err { opacity: 1; }
  .apui-ps .dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); flex-shrink: 0; display: grid; place-items: center; font-size: 11px; color: #fff; font-weight: 900; margin-top: 1px; }
  .apui-ps.on .dot { border-color: var(--apui-accent); border-top-color: transparent; animation: apui-spin .8s linear infinite; }
  .apui-ps.ok .dot { background: #1a7f37; border-color: #1a7f37; }
  .apui-ps.err .dot { background: #e5484d; border-color: #e5484d; }
  @keyframes apui-spin { to { transform: rotate(360deg); } }
  .apui-ps b { display: block; font-size: 14px; font-weight: 800; }
  .apui-ps small { display: block; color: rgba(0,0,0,.55); font-size: 12px; font-weight: 600; line-height: 1.35; }
  .apui-done { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 26px 0 10px; text-align: center; }
  .apui-done .ring { width: 84px; height: 84px; border-radius: 50%; background: #1a7f37; display: grid; place-items: center; animation: apui-pop .45s cubic-bezier(.2,1.6,.4,1); }
  .apui-done .ring svg { width: 44px; height: 44px; stroke-dasharray: 60; stroke-dashoffset: 60; animation: apui-draw .45s .2s ease-out forwards; }
  @keyframes apui-pop { from { transform: scale(.3); opacity: 0; } }
  @keyframes apui-draw { to { stroke-dashoffset: 0; } }
  .apui-done h3 { font-size: 24px; font-weight: 900; margin-top: 8px; }
  .apui-done p { color: rgba(0,0,0,.55); font-weight: 700; font-size: 13.5px; }
  .apui-btn { width: 100%; margin-top: 14px; padding: 14px; border-radius: 12px; border: 0; background: #1d1d1f; color: #fff; font: inherit; font-weight: 800; font-size: 15px; cursor: pointer; }

  .apui-stages { display: flex; flex-direction: column; }
  .apui-st { display: flex; gap: 12px; position: relative; padding-bottom: 16px; opacity: .38; transition: opacity .3s; }
  .apui-st:not(:last-child)::before { content: ""; position: absolute; left: 11px; top: 26px; bottom: 2px; width: 2px; background: rgba(0,0,0,.1); }
  .apui-st.ok:not(:last-child)::before { background: var(--apui-accent); }
  .apui-st.on, .apui-st.ok { opacity: 1; }
  .apui-st .dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(0,0,0,.15); flex-shrink: 0; display: grid; place-items: center; color: #fff; font-size: 12px; font-weight: 900; background: #fff; z-index: 1; }
  .apui-st.on .dot { border-color: var(--apui-accent); border-top-color: transparent; animation: apui-spin .8s linear infinite; }
  .apui-st.ok .dot { background: var(--apui-accent); border-color: var(--apui-accent); }
  .apui-st b { display: block; font-weight: 800; font-size: 14.5px; }
  .apui-st small { display: block; color: rgba(0,0,0,.55); font-weight: 600; font-size: 12.5px; line-height: 1.35; }
  .apui-st .t { margin-left: auto; font-size: 11.5px; font-weight: 700; color: rgba(0,0,0,.4); white-space: nowrap; }

  /* The chat is Alde, on top of the client's app. The store keeps its own screens. */
  .chat {
    background: #08090b !important; color: #eceef2 !important;
    font-family: "Space Grotesk", "Noto Sans Georgian", system-ui, sans-serif !important;
  }
  .chathead {
    background: #08090b !important; color: #eceef2 !important;
    border-bottom: 1px solid rgba(255,255,255,.1) !important;
    position: sticky; top: 0; z-index: 2;
  }
  .chathead b {
    font-family: Michroma, "Space Grotesk", sans-serif !important;
    font-weight: 400 !important; letter-spacing: .14em !important; font-size: 13px !important; color: #fff !important;
    text-transform: uppercase !important;
  }
  .chathead small, .chathead small span { color: rgba(236,238,242,.55) !important; font-weight: 500 !important; }
  .chathead > button { color: #eceef2 !important; }
  .alde-mark { width: 18px; height: 18px; fill: #eceef2; flex: none; display: block; }
  .welcome .alde-mark { width: 28px; height: 28px; margin: 0 auto 12px; }
  .chat .logo, .chat .ailogo, .chat .lg { background: transparent !important; box-shadow: none !important; }
  .chat .ailogo::after, .chat .lg i, .chathead b .beta { display: none !important; }
  .chat .msgs, .chat #msgs { background: transparent !important; }
  .chat .b { font-weight: 500 !important; }
  .chat .b.me { background: #f2f3f5 !important; color: #111 !important; }
  .chat .b.ai { background: rgba(255,255,255,.05) !important; color: #eceef2 !important; border: 1px solid rgba(255,255,255,.1); }
  .chat .welcome h2 { color: #fff !important; font-weight: 500 !important; }
  .chat .welcome p { color: rgba(236,238,242,.55) !important; }
  .chat .sugg button, .chat .chips button {
    background: rgba(8,9,11,.8) !important; color: #eceef2 !important;
    border: 1px solid rgba(255,255,255,.28) !important; font-weight: 500 !important;
  }
  .chat .composer { background: #08090b !important; border-top: 1px solid rgba(255,255,255,.12) !important; }
  .chat .composer input { background: rgba(255,255,255,.04) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.16) !important; }
  .chat .composer input::placeholder { color: rgba(255,255,255,.35) !important; }
  .chat .composer .send { background: #f2f3f5 !important; color: #000 !important; }
  .chat .composer .mic { background: rgba(255,255,255,.06) !important; color: #eceef2 !important; }
  .chat .langsw { background: rgba(255,255,255,.06) !important; }
  .chat .langsw button { color: rgba(236,238,242,.55) !important; }
  .chat .langsw button.on { background: #f2f3f5 !important; color: #111 !important; }
  .chat .apui-think-h { color: rgba(236,238,242,.72) !important; }
  .chat .apui-think.run .apui-think-h .apui-label {
    background: linear-gradient(90deg, rgba(255,255,255,.35), #fff, rgba(255,255,255,.35)) !important;
    background-size: 200% 100% !important; -webkit-background-clip: text !important; background-clip: text !important; color: transparent !important;
  }
  .chat .apui-thought { color: rgba(236,238,242,.6) !important; }
  .chat .apui-step { color: rgba(236,238,242,.82) !important; }
  .chat .apui-think-b { border-left-color: rgba(255,255,255,.16) !important; }
  .chat .apui-step i { background: #f2f3f5 !important; color: #111 !important; }
  .fab, .aipill {
    background: #08090b !important; color: #eceef2 !important;
    border: 1px solid rgba(255,255,255,.35) !important;
    font-family: "Space Grotesk", system-ui, sans-serif !important;
  }
  `;
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Michroma&family=Space+Grotesk:wght@400;500&family=Noto+Sans+Georgian:wght@400;500&display=swap";
  document.head.appendChild(font);
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---- language: set AgentPayUI.lang = "ka" for Georgian ----
  const T = {
    en: { thinking: "Thinking…", thought: (s) => `Thought for ${s}s`, pay: (m) => `Pay ${m}`, secure: "🔒 Secure", card: "Card", issuer: "Issuer",
      prepared: "Prepared by", preparedV: "AgentPay AI ✦ · confirmed by you", confirmFace: "Confirm with Face ID", faceOk: "Face ID verified",
      steps: (x) => [
        ["Strong customer authentication", "Face ID on this device · SCA satisfied (PSD2-style)"],
        [`${x.network} network token`, `Card ••${x.last4} replaced by a one-time token — the AI and ${x.merchant} never see the card number`],
        ["3-D Secure 2 check", `${x.bank} risk engine · frictionless approval`],
        ["Authorisation", `${x.bank} approved ${x.amt} · auth code ${x.auth}`],
        ["Capture", `AgentPay intent ${x.id} → captured · ${x.amt} to ${x.merchant}`],
        ["Receipt & hand-off", `Receipt ${x.receipt} · RRN ${x.rrn} · handed to ${x.merchant}`],
      ], paid: (a) => `Paid ${a}`, auth: "Auth", close: "Close",
      banks: { visa: "Bank of Georgia", master: "TBC Bank", amex: "Liberty Bank" } },
    ka: { thinking: "ფიქრობს…", thought: (s) => `იფიქრა ${s} წმ`, pay: (m) => `გადახდა — ${m}`, secure: "🔒 დაცული", card: "ბარათი", issuer: "ბანკი",
      prepared: "მოამზადა", preparedV: "AgentPay AI ✦ · დაადასტურეთ თქვენ", confirmFace: "დაადასტურეთ Face ID-ით", faceOk: "Face ID დადასტურდა",
      steps: (x) => [
        ["მომხმარებლის ძლიერი ავთენტიფიკაცია", "Face ID ამ მოწყობილობაზე · SCA შესრულდა"],
        [`${x.network} ქსელური ტოკენი`, `ბარათი ••${x.last4} ჩანაცვლდა ერთჯერადი ტოკენით — ბარათის ნომერს ვერც AI ხედავს და ვერც ${x.merchant}`],
        ["3-D Secure 2 შემოწმება", `${x.bank} — რისკის შეფასება · დადასტურდა დამატებითი ნაბიჯის გარეშე`],
        ["ავტორიზაცია", `${x.bank}: ${x.amt} დადასტურდა · ავტორიზაციის კოდი ${x.auth}`],
        ["თანხის ჩამოჭრა", `AgentPay intent ${x.id} → ჩამოჭრილია · ${x.amt} → ${x.merchant}`],
        ["ქვითარი და გადაცემა", `ქვითარი ${x.receipt} · RRN ${x.rrn} · გადაეცა: ${x.merchant}`],
      ], paid: (a) => `გადახდილია ${a}`, auth: "ავტ. კოდი", close: "დახურვა",
      banks: { visa: "საქართველოს ბანკი", master: "თიბისი ბანკი", amex: "ლიბერთი ბანკი" } },
  };
  const tr = () => T[window.AgentPayUI?.lang] || T.en;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const FACE = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M4 18V10a6 6 0 0 1 6-6h8M46 4h8a6 6 0 0 1 6 6v8M60 46v8a6 6 0 0 1-6 6h-8M18 60h-8a6 6 0 0 1-6-6v-8"/><g class="scan"><path d="M22 24v5M42 24v5M32 24v12h-3M24 44c4.5 4 11.5 4 16 0"/></g></svg>';
  const code = (n) => Array.from({ length: n }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

  // Type text out quickly so reasoning feels live.
  async function typeInto(el, text) {
    const step = Math.max(1, Math.ceil(text.length / 45));
    for (let i = 0; i <= text.length; i += step) { el.textContent = text.slice(0, i); await sleep(14); }
    el.textContent = text;
  }

  function thinking(parent, { accent = "#009de0", onUpdate = () => {} } = {}) {
    const el = document.createElement("div");
    el.className = "apui-think run";
    el.style.setProperty("--apui-accent", accent);
    el.innerHTML = `<button class="apui-think-h"><span class="apui-spark">✦</span><span class="apui-label">${tr().thinking}</span><svg class="apui-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg></button><div class="apui-think-b"></div>`;
    parent.appendChild(el);
    const body = el.querySelector(".apui-think-b");
    const label = el.querySelector(".apui-label");
    el.querySelector(".apui-think-h").onclick = () => el.classList.toggle("closed");
    const t0 = Date.now();
    let queue = Promise.resolve();
    const enqueue = (fn) => (queue = queue.then(fn).then(onUpdate));
    return {
      el,
      status: (text) => { if (el.classList.contains("run")) label.textContent = text; },
      thought: (text) => enqueue(async () => { const p = document.createElement("div"); p.className = "apui-thought"; body.appendChild(p); onUpdate(); await typeInto(p, text); }),
      step: (text, ok = true) => enqueue(() => { const s = document.createElement("div"); s.className = "apui-step" + (ok ? "" : " err"); s.innerHTML = `<i>${ok ? "✓" : "!"}</i><span>${esc(text)}</span>`; body.appendChild(s); }),
      done: () => enqueue(() => {
        el.classList.remove("run");
        label.textContent = tr().thought(((Date.now() - t0) / 1000).toFixed(1));
        el.classList.add("closed");
      }),
      settled: () => queue,
    };
  }

  const BANK = (card) => tr().banks[/master/i.test(card) ? "master" : /amex/i.test(card) ? "amex" : "visa"];

  async function pay({ root, agent, payment: p, accent = "#009de0", merchant = "Merchant", bank, sym = "₾" }) {
    const card = p.paymentMethod || "Card";
    const network = /master/i.test(card) ? "Mastercard" : "Visa";
    const last4 = (card.match(/(\d{4})\s*$/) || [, "••••"])[1];
    bank = bank || BANK(card);
    const amt = `${sym}${Number(p.total).toFixed(2)}`;
    const isKa = window.AgentPayUI?.lang === "ka";
    const vn = (isKa && p.venue?.nameKa) || p.venue?.name || "", va = (isKa && p.venue?.areaKa) || p.venue?.area || "";
    const ov = document.createElement("div");
    ov.className = "apui-pay";
    ov.style.setProperty("--apui-accent", accent);
    ov.innerHTML = `<div class="apui-sheet">
      <div class="apui-top"><div class="apui-mlogo">${esc(merchant[0] || "•")}</div><div><b>${esc(tr().pay(merchant))}</b><small>${esc(vn)}${va ? " · " + esc(va) : ""}</small></div><span class="apui-secure">${tr().secure}</span></div>
      <div class="apui-amt">${amt}</div>
      <div class="apui-rows">
        <div class="apui-row"><span>${tr().card}</span><span>${esc(card)}</span></div>
        <div class="apui-row"><span>${tr().issuer}</span><span>${esc(bank)}</span></div>
        <div class="apui-row"><span>${tr().prepared}</span><span>${tr().preparedV}</span></div>
      </div>
      <div class="apui-face" id="apui-face">${FACE}<span>${tr().confirmFace}</span></div>
      <div class="apui-steps" id="apui-steps"></div>
    </div>`;
    root.appendChild(ov);
    const $ = (s) => ov.querySelector(s);
    await sleep(1200);
    $("#apui-face").innerHTML = `<div class="ring" style="width:62px;height:62px;border-radius:50%;background:#1a7f37;display:grid;place-items:center">${CHECK.replace('viewBox', 'width="34" height="34" viewBox')}</div><span>${tr().faceOk}</span>`;
    await sleep(450);
    $("#apui-face").remove();

    const auth = code(6), rrn = String(Date.now()).slice(-10), receipt = "R-" + code(6);
    const steps = tr().steps({ network, last4, merchant, bank, amt, auth, id: p.id, receipt, rrn });
    const list = $("#apui-steps");
    list.innerHTML = steps.map(([t, d]) => `<div class="apui-ps"><span class="dot"></span><div><b>${esc(t)}</b><small>${esc(d)}</small></div></div>`).join("");
    const rows = [...list.children];
    let captured = null;
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.add("on");
      await sleep(i === 3 ? 900 : 550);
      if (i === 4) {
        const r = await agent.confirm(p.id); // ← the ONLY call that moves money, triggered by the user's Face ID
        if (r.error) {
          rows[i].className = "apui-ps err";
          rows[i].querySelector(".dot").textContent = "!";
          rows[i].querySelector("small").textContent = r.error;
          const b = document.createElement("button");
          b.className = "apui-btn"; b.textContent = tr().close;
          $(".apui-sheet").appendChild(b);
          await new Promise((res) => (b.onclick = res));
          ov.remove();
          return null;
        }
        captured = r;
      }
      rows[i].className = "apui-ps ok";
      rows[i].querySelector(".dot").innerHTML = "✓";
    }
    await sleep(350);
    $(".apui-sheet").innerHTML = `<div class="apui-done"><div class="ring">${CHECK}</div><h3>${esc(tr().paid(amt))}</h3><p>${esc(merchant)} · ${esc(card)}</p><p style="font-size:12px">${tr().auth} ${auth} · ${receipt}</p></div>`;
    await sleep(1300);
    ov.remove();
    return captured;
  }

  function stages(container, list, { accent = "#009de0", onDone = () => {}, onStage = () => {} } = {}) {
    container.style.setProperty("--apui-accent", accent);
    container.classList.add("apui-stages");
    container.innerHTML = list.map((s) => `<div class="apui-st"><span class="dot"></span><div><b>${esc(s.title)}</b><small>${esc(s.detail || "")}</small></div><span class="t"></span></div>`).join("");
    const rows = [...container.children];
    let cancelled = false;
    (async () => {
      for (let i = 0; i < rows.length && !cancelled; i++) {
        rows[i].classList.add("on");
        onStage(i, list[i]);
        await sleep(list[i].ms ?? 1500);
        if (cancelled || !rows[i].isConnected) return;
        rows[i].className = "apui-st ok";
        rows[i].querySelector(".dot").textContent = "✓";
        rows[i].querySelector(".t").textContent = new Date().toTimeString().slice(0, 5);
      }
      if (!cancelled) onDone();
    })();
    return { cancel: () => (cancelled = true) };
  }

  window.AgentPayUI = { thinking, pay, stages, lang: "en" };
})();
