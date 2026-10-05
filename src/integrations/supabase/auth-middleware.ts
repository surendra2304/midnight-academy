import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Claims shape produced by `supabase.auth.getClaims`. The local-preview branches
 * forge this shape, so it is cast once here instead of scattering `any`.
 */
type AuthClaims = NonNullable<
  Awaited<ReturnType<ReturnType<typeof createClient<Database>>["auth"]["getClaims"]>>["data"]
>["claims"];
import type { Database } from "./types";
import { createLocalSupabaseClient, DEFAULT_LOCAL_USER } from "./local-db";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const SUPABASE_PUBLISHABLE_KEY =
      process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "Missing Supabase auth configuration. Configure the public Supabase URL and key.",
        );
      }
      const localSupabase = createLocalSupabaseClient() as ReturnType<
        typeof createClient<Database>
      >;
      return next({
        context: {
          supabase: localSupabase,
          userId: DEFAULT_LOCAL_USER.id,
          claims: {
            sub: DEFAULT_LOCAL_USER.id,
            email: DEFAULT_LOCAL_USER.email,
            role: "authenticated",
          } as AuthClaims,
        },
      });
    }

    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Only Bearer tokens are supported");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    if (token === "local-testglider-access-token" && process.env.NODE_ENV !== "production") {
      const localSupabase = createLocalSupabaseClient() as ReturnType<
        typeof createClient<Database>
      >;
      return next({
        context: {
          supabase: localSupabase,
          userId: DEFAULT_LOCAL_USER.id,
          claims: {
            sub: DEFAULT_LOCAL_USER.id,
            email: DEFAULT_LOCAL_USER.email,
            role: "authenticated",
          } as AuthClaims,
        },
      });
    }

    if (token.split(".").length !== 3) {
      throw new Error("Unauthorized: Invalid token");
    }

    const supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      global: {
        fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY!),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Error("Unauthorized: Invalid token");
    }

    if (!data.claims.sub) {
      throw new Error("Unauthorized: No user ID found in token");
    }

    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims,
      },
    });
  },
);
