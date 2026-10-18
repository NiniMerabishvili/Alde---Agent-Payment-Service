// PROTOTYPE — throwaway. Payment intent state machine with a mock PSP.
//
//   awaiting_user_confirmation ──confirm (user tap)──▶ captured
//            │
//            └────────cancel / expire──────────────▶ cancelled
//
// The agent can only CREATE an intent. Moving it to "captured" requires a call that
// comes from the user's tap in the widget, never from the model. That is the core
// safety property of agentic payments here.

import type { Tenant } from "./tenants/index";

export type Status = "awaiting_user_confirmation" | "captured" | "cancelled";

export type Line = {
  itemId: string; name: string; qty: number; unitPrice: number; options: string[]; note?: string; image?: string;
  nameKa?: string; optionsKa?: string[]; // Georgian display names (fall back to name/options)
};

export type Intent = {
  id: string;
  tenantId: string;
  userId: string;
  venue: { id: string; name: string; area: string; image: string; etaMin: number; etaMax: number; nameKa?: string; areaKa?: string };
  lines: Line[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
  currency: string;
  status: Status;
  createdAt: number;
  history: { at: number; status: Status; by: "agent" | "user" | "system" }[];
};

const EXPIRE_MS = 10 * 60_000;
const intents = new Map<string, Intent>();
let seq = 1;

export function createIntent(
  tenant: Tenant,
  userId: string,
  requested: { item_id: string; qty?: number; option_ids?: string[]; note?: string }[],
  createdBy: "agent" | "user" = "agent",
): Intent | { error: string } {
  if (!requested?.length) return { error: "No items requested." };
  const lines: Line[] = [];
  let venueId: string | undefined;
  for (const r of requested) {
    // Prices always come from the tenant catalog, never from the model's arguments.
    const item = tenant.catalog.find((i) => i.id === r.item_id);
    if (!item) return { error: `Unknown item_id ${r.item_id} for ${tenant.name}.` };
    if (venueId && item.venueId !== venueId) return { error: "All items in one order must come from the same venue." };
    venueId = item.venueId;
    const opts = [];
    for (const oid of r.option_ids ?? []) {
      const o = item.options?.find((o) => o.id === oid);
      if (!o) return { error: `Option ${oid} does not exist on ${item.name}. Valid: ${item.options?.map((o) => o.id).join(", ") || "none"}` };
      opts.push(o);
    }
    const qty = Math.max(1, Math.min(20, Math.floor(r.qty ?? 1)));
    const unitPrice = round(item.price + opts.reduce((s, o) => s + o.price, 0));
    lines.push({
      itemId: item.id, name: item.name, qty, unitPrice, options: opts.map((o) => o.name), note: r.note || undefined, image: item.image,
      nameKa: item.ka, optionsKa: opts.map((o) => o.ka ?? o.name),
    });
  }
  const v = tenant.venues.find((v) => v.id === venueId)!;
  const subtotal = round(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const total = round(subtotal + v.deliveryFee + tenant.serviceFee);
  if (total > tenant.perOrderLimit)
    return { error: `Total ${total} ${tenant.currency} exceeds the per-order limit of ${tenant.perOrderLimit} ${tenant.currency}.` };

  // Only one open intent per user: a new proposal replaces the old one.
  for (const i of intents.values())
    if (i.tenantId === tenant.id && i.userId === userId && i.status === "awaiting_user_confirmation") transition(i, "cancelled", "system");

  const intent: Intent = {
    id: `pi_${tenant.id}_${seq++}`,
    tenantId: tenant.id,
    userId,
    venue: { id: v.id, name: v.name, area: v.area, image: v.image, etaMin: v.etaMin, etaMax: v.etaMax, nameKa: v.ka?.name, areaKa: v.ka?.area },
    lines,
    subtotal,
    deliveryFee: v.deliveryFee,
    serviceFee: tenant.serviceFee,
    total,
    paymentMethod: tenant.savedPaymentMethod,
    currency: tenant.currency,
    status: "awaiting_user_confirmation",
    createdAt: Date.now(),
    history: [{ at: Date.now(), status: "awaiting_user_confirmation", by: createdBy }],
  };
  intents.set(intent.id, intent);
  return intent;
}

// Scoped lookup: an intent is invisible outside its own tenant + user.
export function getIntent(tenantId: string, userId: string, id: string) {
  const i = intents.get(id);
  if (!i || i.tenantId !== tenantId || i.userId !== userId) return undefined;
  if (i.status === "awaiting_user_confirmation" && Date.now() - i.createdAt > EXPIRE_MS) transition(i, "cancelled", "system");
  return i;
}

export function confirmByUser(tenantId: string, userId: string, id: string) {
  const i = getIntent(tenantId, userId, id);
  if (!i) return { error: "Payment not found." };
  if (i.status !== "awaiting_user_confirmation") return { error: `Payment is already ${i.status}.` };
  // Mock PSP: in production this is the client's own checkout / card-on-file / bank SCA step.
  transition(i, "captured", "user");
  return i;
}

export function cancelByUser(tenantId: string, userId: string, id: string) {
  const i = getIntent(tenantId, userId, id);
  if (!i) return { error: "Payment not found." };
  if (i.status !== "awaiting_user_confirmation") return { error: `Payment is already ${i.status}.` };
  transition(i, "cancelled", "user");
  return i;
}

export const intentsFor = (tenantId: string, userId?: string) =>
  [...intents.values()].filter((i) => i.tenantId === tenantId && (!userId || i.userId === userId));

export function resetPayments(tenantId: string) {
  for (const [id, i] of intents) if (i.tenantId === tenantId) intents.delete(id);
}

const round = (n: number) => Math.round(n * 100) / 100;

function transition(i: Intent, status: Status, by: "agent" | "user" | "system") {
  i.status = status;
  i.history.push({ at: Date.now(), status, by });
}
