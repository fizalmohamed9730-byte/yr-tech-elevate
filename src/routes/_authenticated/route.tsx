import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AUTH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("auth-timeout")), ms),
    ),
  ]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveUser() {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.getUser(),
        AUTH_TIMEOUT_MS,
      );
      if (!error && data.user) {
        console.log("[_authenticated] getUser success on attempt", attempt + 1);
        return data.user;
      }
      console.warn("[_authenticated] getUser returned no user (attempt", attempt + 1, "):", error?.message);
    } catch (err: any) {
      if (err?.name === "Redirect" || err?.isRedirect) throw err;
      console.warn("[_authenticated] getUser exception (attempt", attempt + 1, "):", err?.message);
    }

    if (attempt < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  console.log("[_authenticated] getUser failed after retries, falling back to getSession");
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.user) {
      console.log("[_authenticated] getSession fallback success");
      return data.session.user;
    }
    console.warn("[_authenticated] getSession fallback also failed:", error?.message);
  } catch (err: any) {
    console.error("[_authenticated] getSession fallback exception:", err);
  }

  return null;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await resolveUser();

    if (!user) {
      throw redirect({ to: "/auth" });
    }

    let role: "admin" | "intern" | null = null;

    try {
      const rolesQuery = await withTimeout(
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id) as unknown as Promise<any>,
        AUTH_TIMEOUT_MS,
      );
      const roles: string[] = rolesQuery.error
        ? []
        : (rolesQuery.data ?? []).map((x: any) => x.role);

      role = roles.includes("admin")
        ? "admin"
        : roles.includes("intern") || roles.includes("student")
          ? "intern"
          : null;
    } catch (err: any) {
      if (err?.name === "Redirect" || err?.isRedirect) throw err;
      console.error("[_authenticated] user_roles query failed:", err);
    }

    if (!role) {
      throw redirect({ to: "/auth" });
    }

    return {
      user,
      role,
      isAdmin: role === "admin",
      isIntern: role === "intern",
    };
  },
  component: () => <Outlet />,
});
