customers say what they want, your agent finds it in that company’s catalog, shows a real price, and the customer taps to pay.

Prototype video (demo)
https://github.com/user-attachments/assets/ae929a63-9983-4d60-a902-e34fdc17eb6c

What the client is buying
Three things, in this order:

- A chat on their site or app. A customer writes “two khachapuri near me” or “a flight to Berlin on Friday.” The agent searches only that company’s catalog, remembers preferences for that company only, and replies in the customer’s language.
- A payment card the agent cannot press. The agent builds the order. Prices come from the client’s catalog, not from the model. The customer sees venue, lines, fees, and total, then taps Confirm & pay. Until that tap, nothing is charged.
- Their brand, their customers, their money. They keep the website, the user account, and their existing card or payment provider. You host the agent.

security Layer - The five promises that close the sale

- The agent cannot pay. It can only propose an order. Confirm and cancel come from the customer’s tap.
- The model cannot invent a price. Totals, fees, and options are read from the client’s catalog. A wrong item id is rejected.
- There is a ceiling. Each client sets a per-order limit. Over the limit, the agent must change the order or refuse it.
- Companies never share memory. The same person on Wolt and on tkt.ge is two strangers. Preferences stay inside that client.
- One order, one seller. A cart cannot mix venues. A new proposal replaces the unpaid one, and an unpaid card expires.

How a client goes live

- Brand. Name, color, currency, language, per-order limit.
- Catalog. Their products or venues, with ids, prices, and options. At first a file or a simple API is enough. Later, a live connection to their menu, inventory, or booking system.
- Payer. The card or wallet already saved on their user’s account, charged by their payment provider when the user confirms.
- Install. Paste the widget, or wire the SDK into the screen they already have.
- Try it on their own site. “Order me a khachapuri.” Card appears. They tap pay. Then ask the same user on a second demo brand, “what do you know about me?” and show that it knows nothing.
