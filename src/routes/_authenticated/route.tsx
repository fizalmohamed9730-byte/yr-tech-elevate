import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const AUTH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("auth-timeout")), ms),
    ),
  ]);
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let user;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw redirect({ to: "/auth" });
      user = data.user;
    } catch (err: any) {
      if (err?.name === "Redirect" || err?.isRedirect) throw err;
      console.error("[_authenticated] getUser failed:", err);
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
