// PROTOTYPE — throwaway. Tenant-isolated memory, in memory only.
//
// Isolation rule: the only way in is memoryFor(tenantId). The harness and every tool
// receive a TenantMemory handle for exactly one tenant, so Wolt's agent physically
// cannot read tkt.ge's users, even if the same person (same userId) uses both.

export type Content = { role: "user" | "model"; parts: any[] }; // Gemini content shape

export type UserMemory = {
  history: Content[]; // full Gemini conversation incl. function calls + thought signatures
  preferences: string[]; // long-term facts the agent chose to remember
};

export type TenantMemory = {
  tenantId: string;
  user(userId: string): UserMemory;
  dump(): Record<string, UserMemory>;
};

const MAX_HISTORY = 40;
const stores = new Map<string, Map<string, UserMemory>>();

export function memoryFor(tenantId: string): TenantMemory {
  if (!stores.has(tenantId)) stores.set(tenantId, new Map());
  const users = stores.get(tenantId)!;
  return {
    tenantId,
    user(userId) {
      if (!users.has(userId)) users.set(userId, { history: [], preferences: [] });
      return users.get(userId)!;
    },
    dump: () => Object.fromEntries(users),
  };
}

export function resetMemory(tenantId: string) {
  stores.delete(tenantId);
}

// Trim old turns without splitting a functionCall/functionResponse pair:
// always cut so history starts at a plain user text message.
export function trimHistory(h: Content[]) {
  while (h.length > MAX_HISTORY) {
    h.shift();
    while (h.length && !(h[0].role === "user" && h[0].parts.some((p) => "text" in p))) h.shift();
  }
}
