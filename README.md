# Alde

Customers say what they want. The agent finds it in that company’s catalog, shows a real price, and the customer taps to pay.

The store stays the store. The chat is Alde, so the customer always knows who the agent is.

[Prototype video](https://github.com/user-attachments/assets/ae929a63-9983-4d60-a902-e34fdc17eb6c)

## What a client gets

- **A chat on their site or app.** A customer writes “two khachapuri near me” or “a flight to Berlin on Friday.” The agent searches only that company’s catalog, remembers preferences for that company only, and replies in the customer’s language.
- **A payment card the agent cannot press.** The agent builds the order. Prices come from the client’s catalog, not from the model. The customer sees the place, the lines, the fees, and the total, then taps **Confirm & pay**. Until that tap, nothing is charged.
- **Their brand, their customers, their money.** They keep the website, the user account, and their existing card or payment provider. Alde hosts the agent.

## The five rules

- **The agent cannot pay.** It can only propose an order. Confirm and cancel come from the customer’s tap.
- **The model cannot invent a price.** Totals, fees, and options are read from the client’s catalog. A wrong item is rejected.
- **There is a ceiling.** Each client sets a per-order limit. Over the limit, the agent must change the order or refuse it.
- **Companies never share memory.** The same person on Wolt and on tkt.ge is two strangers. Preferences stay inside that client.
- **One order, one seller.** A cart cannot mix venues. A new proposal replaces the unpaid one, and an unpaid card expires.

## Payment

The customer pays the company, through the card already saved on that company’s account. Alde never sees the card number.

1. The agent builds a payment intent from catalog prices.
2. The Alde panel shows the order. Status is `awaiting_user_confirmation`.
3. The customer taps **Confirm**. That tap is the only thing that may start a charge.
4. The company’s payment provider captures the money into the company’s account.
5. Alde tells the company’s backend the order is paid, and they fulfill it.

Cancel, expiry, or a new proposal leaves the intent unpaid. No charge, no order.

In this prototype the capture is simulated. The tap still cannot be made by the model.

## Install

One script, after the client’s backend has named the logged-in customer:

```html
<script src="https://agent.alde/widget.js"
        data-key="pk_live_…"
        data-user-id="user_123"></script>
```

The panel is Alde. It does not restyle the client’s site.

## Run the demos

```bash
bun install
bun run proto
```

Open http://localhost:8787/

Set `GEMINI_API_KEY` to use Gemini. Without it, the agent runs in mock mode. `bun run proto:mock` forces mock mode.

Each company demo is the same agent with a different catalog: Wolt, Bolt, Wizz Air, Swoop, tkt.ge, myhome.ge, Biblusi, and 2 Nabiji.

## What a client provides

- **Brand.** Name, color, currency, language, per-order limit.
- **Catalog.** Products or venues, with ids, prices, and options.
- **Payer.** The card or wallet already on their customer’s account.
- **Install.** The widget on their site, or the SDK if they choose where the panel sits.
