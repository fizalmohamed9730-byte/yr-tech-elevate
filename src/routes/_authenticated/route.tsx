import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AUTH_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error("auth-timeout")), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function resolveUser() {
  // First try getUser (validates JWT against Supabase server)
  try {
    const { data, error } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
    );
    if (!error && data.user) {
      return data.user;
    }
    if (error) {
      console.error("[auth] getUser error:", error.message, error);
    }
  } catch (err: any) {
    if (err?.name === "Redirect" || err?.isRedirect) throw err;
    console.error("[auth] getUser timeout or network error:", err?.message);
  }

  // Fallback: read session from localStorage (no network call)
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.user) {
      return data.session.user;
    }
  } catch {}

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
        ? (() => {
            console.error("[auth] user_roles query error:", rolesQuery.error.code, rolesQuery.error.message, rolesQuery.error.details);
            return [];
          })()
        : (rolesQuery.data ?? []).map((x: any) => x.role);

      role = roles.includes("admin")
        ? "admin"
        : roles.includes("intern") || roles.includes("student")
          ? "intern"
          : null;
    } catch (err: any) {
      if (err?.name === "Redirect" || err?.isRedirect) throw err;
      console.error("[auth] user_roles query timeout or network error:", err?.message);
    }

    if (!role) {
      console.warn("[auth] no role found for user:", user.id, "- redirecting to /auth");
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
