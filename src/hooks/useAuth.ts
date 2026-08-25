import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "intern" | "student";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (loading) setLoading(false);
    });
    // Fallback: if onAuthStateChange doesn't fire within 1s, read session directly
    const fallback = setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("[useAuth] getSession error:", error);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("[useAuth] getSession exception:", err);
      } finally {
        setLoading(false);
      }
    }, 1000);
    return () => {
      clearTimeout(fallback);
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setRoles([]);
      return;
    }
    const uid = user.id;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        if (error) console.error("[useAuth] user_roles query error:", error);
        setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
      } catch (err) {
        console.error("[useAuth] user_roles query exception:", err);
        setRoles([]);
      }
    })();
  }, [user?.id]);

  return {
    session,
    user,
    roles,
    loading,
    isAuthenticated: !!user,
    isAdmin: roles.includes("admin"),
    isStudent: roles.includes("intern") || roles.includes("student"),
    signOut: () => supabase.auth.signOut(),
  };
}
