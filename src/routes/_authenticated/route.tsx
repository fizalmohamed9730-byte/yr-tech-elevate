import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    let role: string | null = null;
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const r = (roles ?? []).map((x: any) => x.role);
      role = r.includes("admin")
        ? "admin"
        : r.includes("intern") || r.includes("student")
          ? "intern"
          : "intern";
    } catch {
      role = "intern";
    }

    return {
      user: data.user,
      role,
      isAdmin: role === "admin",
      isIntern: role !== "admin",
    };
  },
  component: () => <Outlet />,
});
