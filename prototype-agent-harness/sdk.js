// PROTOTYPE — throwaway. AgentPay JS SDK for deep integrations: the host app (e.g. Wolt)
// renders the chat + payment sheet in its own native design; we provide the agent.
//
//   const agent = AgentPay.init({ key: "pk_wolt_live", userId, location });
//   await agent.send("2 small shawarmas", (event) => { ... });   // streams events
//   await agent.confirm(paymentId);                                  // only on the user's tap
(() => {
  const API = new URL(document.currentScript.src).origin;

  window.AgentPay = {
    init({ key, userId, location }) {
      const post = (path, body) =>
        fetch(API + path, {
          method: "POST",
          headers: { "content-type": "application/json", "x-agentpay-key": key },
          body: JSON.stringify({ userId, ...body }),
        });

      return {
        setLocation(l) { location = l; },

        // Streams agent events: status | tool | payment | reply | error | done
        async send(message, onEvent) {
          const res = await post("/v1/chat/stream", { message, location });
          if (!res.ok) return onEvent({ type: "error", text: (await res.json()).error });
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let buf = "";
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let nl;
            while ((nl = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, nl).trim();
              buf = buf.slice(nl + 1);
              if (line) onEvent(JSON.parse(line));
            }
          }
        },

        createOrder: (items) => post("/v1/orders", { items }).then((r) => r.json()),
        confirm: (id) => post(`/v1/payments/${id}/confirm`, {}).then((r) => r.json()),
        cancel: (id) => post(`/v1/payments/${id}/cancel`, {}).then((r) => r.json()),
      };
    },
  };
})();
