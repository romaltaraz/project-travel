// In-memory TTL cache to avoid hammering the Claude API when multiple
// users request the same trip plan for the same vacation.

interface Entry<T> { value: T; expiresAt: number }

class TtlCache<T> {
  private store = new Map<string, Entry<T>>();
  constructor(private ttlMs: number) {}

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  get(key: string): T | null {
    const e = this.store.get(key);
    if (!e) return null;
    if (Date.now() > e.expiresAt) { this.store.delete(key); return null; }
    return e.value;
  }
}

// Cached for 1 hour — vacation details don't change that often
export const tripPlanCache = new TtlCache<unknown>(60 * 60 * 1000);
