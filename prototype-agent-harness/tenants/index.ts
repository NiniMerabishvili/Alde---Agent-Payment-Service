// PROTOTYPE — throwaway. Auto-loads every tenants/<id>.ts (default export = Tenant).
// A broken tenant file is logged and skipped so it can't take the other tenants down.
import type { Tenant } from "./types";
export type { Tenant, Item, Venue, Option } from "./types";

export const tenants: Tenant[] = [];
for (const f of [...new Bun.Glob("*.ts").scanSync(import.meta.dir)].sort()) {
  if (f === "index.ts" || f === "types.ts") continue;
  try {
    const t: Tenant = (await import(`./${f}`)).default;
    if (!t?.id || !t.publishableKey) throw new Error("default export is not a Tenant");
    tenants.push(t);
  } catch (e: any) {
    console.error(`[tenants] skipped ${f}: ${e.message}`);
  }
}

export const tenantByKey = (key: string | null) => tenants.find((t) => t.publishableKey === key);
export const tenantById = (id: string) => tenants.find((t) => t.id === id);
