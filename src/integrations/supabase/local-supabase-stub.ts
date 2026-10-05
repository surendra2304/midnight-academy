/**
 * Lightweight local auth stub for previews without Supabase configuration.
 * It contains no assessment content, answer keys, or browser-only APIs.
 */

const unavailable = () => ({
  data: { user: null, session: null },
  error: { message: "Authentication requires Supabase configuration." },
});

export function createLocalSupabaseClient() {
  const auth = {
    async getSession() {
      return { data: { session: null }, error: null };
    },
    async getUser() {
      return { data: { user: null }, error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async signOut() {
      return { error: null };
    },
    async exchangeCodeForSession() {
      return unavailable();
    },
    async signInWithPassword() {
      return unavailable();
    },
    async signUp() {
      return unavailable();
    },
    async signInWithOAuth() {
      return unavailable();
    },
  };

  function from() {
    const result = { data: [], error: null, count: 0 };
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      select: chain,
      insert: chain,
      upsert: chain,
      update: chain,
      delete: chain,
      eq: chain,
      neq: chain,
      in: chain,
      order: chain,
      limit: chain,
      range: chain,
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
      then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    });
    return builder;
  }

  return { auth, from };
}
