import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, Mail, AlertTriangle } from "lucide-react";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/admin-setup")({
  head: () => ({
    meta: [
      { title: "Admin Setup | YR NOVATECH" },
      { name: "description", content: "Create the YR NOVATECH admin account." },
    ],
  }),
  component: AdminSetup,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function AdminSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [promoteFailed, setPromoteFailed] = useState(false);
  const [existsUnconfirmed, setExistsUnconfirmed] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);

    // 1. Create the auth user via Supabase Auth (no hardcoded credentials)
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName, role: "intern" },
      },
    });

    if (error) {
      setLoading(false);
      if (error.message.toLowerCase().includes("already registered")) {
        toast.error("This email is already registered.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (data?.user?.identities?.length === 0) {
      setLoading(false);
      setExistsUnconfirmed(true);
      setUnconfirmedEmail(parsed.data.email);
      toast.error("This email is already registered.");
      return;
    }

    // 2. Auto-login and promote to admin (only works while no admin exists yet)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    let promoted = false;
    if (!signInError && signInData?.user) {
      const { data: promotedOk } = await (supabase as any).rpc("promote_to_admin", {
        p_email: parsed.data.email,
      });
      promoted = !!promotedOk;
    }

    setLoading(false);
    setCreated(true);
    setCreatedEmail(parsed.data.email);
    setPromoteFailed(!promoted);

    if (promoted) {
      toast.success("Admin account created and promoted!");
      setTimeout(() => navigate({ to: "/admin" }), 800);
    } else {
      toast.success("Admin account created!");
    }
  }

  if (created) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-600">Account Created!</h1>
          {promoteFailed ? (
            <>
              <p className="text-muted-foreground text-sm">
                Your account for <strong>{createdEmail}</strong> was created, but it could not be
                promoted to <strong>admin</strong> automatically (an admin may already exist).
              </p>
              <p className="text-xs text-muted-foreground">
                Run this SQL in the Supabase SQL Editor to grant admin role, then sign in:
              </p>
              <pre className="text-left text-[11px] bg-muted p-3 rounded-md overflow-x-auto">
                {`select public.promote_to_admin('${createdEmail}');`}
              </pre>
              <Button asChild className="bg-gradient-primary text-primary-foreground">
                <Link to="/auth">Go to Sign In</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                <strong>{createdEmail}</strong> is now an admin. Redirecting you to the admin
                dashboard...
              </p>
              <Button asChild className="bg-gradient-primary text-primary-foreground">
                <Link to="/admin">Go to Admin Dashboard</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (existsUnconfirmed) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-8 space-y-4">
          <div className="text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold mt-2">Email Already Registered</h1>
            <p className="text-sm text-muted-foreground mt-1">
              An account with <strong>{unconfirmedEmail}</strong> already exists. Sign in with your
              existing password, or reset it using "Forgot password".
            </p>
          </div>
          <Button asChild className="w-full bg-gradient-primary text-primary-foreground">
            <Link to="/auth">Go to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Admin Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create the {COMPANY.name} admin account
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="fullName" placeholder="Enter admin name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@company.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                className="pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Admin Account"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Already have an account?{" "}
          <Link to="/auth" className="underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
