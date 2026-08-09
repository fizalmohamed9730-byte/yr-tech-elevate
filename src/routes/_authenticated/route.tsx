import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: roleRows, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (rolesError) {
      console.error("[_authenticated] Could not load user roles:", rolesError);
      throw new Error("Unable to verify your access level. Please try again.");
    }

    const roles: string[] = (roleRows ?? []).map((x: any) => x.role);
    const role: "admin" | "intern" | null = roles.includes("admin")
      ? "admin"
      : roles.includes("intern") || roles.includes("student")
        ? "intern"
        : null;

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
