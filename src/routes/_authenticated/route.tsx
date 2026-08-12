import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Resolve role from user_roles; fall back to profiles.role as a safety
    // net for accounts missing a user_roles row or on transient query errors.
    const rolesQuery = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const roles: string[] = rolesQuery.error
      ? []
      : (rolesQuery.data ?? []).map((x: any) => x.role);

    let role: "admin" | "intern" | null = roles.includes("admin")
      ? "admin"
      : roles.includes("intern") || roles.includes("student")
        ? "intern"
        : null;

    if (!role) {
      const prof = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      const pr = (prof.data as any)?.role as string | undefined;
      if (pr === "admin") role = "admin";
      else if (pr === "intern" || pr === "student") role = "intern";
    }

    if (!role) {
      throw redirect({ to: "/auth" });
    }

    return {
      user: data.user,
      role,
      isAdmin: role === "admin",
      isIntern: role === "intern",
    };
  },
  component: () => <Outlet />,
});
