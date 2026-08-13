import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, Mail, AlertTriangle, KeyRound } from "lucide-react";
import { COMPANY } from "@/lib/company";

const SIGN_IN_TIMEOUT = 15000;

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In | YR NOVATECH" },
      { name: "description", content: "Sign in or create your YR NOVATECH internship account." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(128),
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  college: z.string().trim().min(2, "College required").max(150),
  department: z.string().trim().min(2, "Department required").max(100),
  year: z.string().trim().min(1, "Year required"),
  domainId: z.string().uuid("Select a domain"),
  duration: z.string().min(1, "Select duration"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  confirmPassword: z.string(),
});

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

function isNetworkError(err: any): boolean {
  const msg = String(err?.message ?? err ?? "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request") ||
    msg.includes("load failed") ||
    msg.includes("connection") ||
    msg.includes("socket") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("timed out") ||
    err?.code === "NETWORK_ERROR"
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [domains, setDomains] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [domainsError, setDomainsError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("domains")
      .select("id,name,slug")
      .eq("active", true)
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("[auth] domains load error:", error);
          setDomainsError("Domains could not be loaded. Try again shortly.");
          setDomains([]);
          return;
        }
        setDomains(data ?? []);
        setDomainsError(null);
      });
  }, []);

  useEffect(() => {
    try {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const type = params.get("type") ?? new URLSearchParams(window.location.search).get("type");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (type === "recovery" && accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              toast.error(error.message);
            } else {
              setRecoveryMode(true);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          });
      }
    } catch {
      // ignore malformed hashes
    }
  }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600 * 1024) return toast.error("Photo must be under 600KB");
    const reader = new FileReader();
    reader.onload = () => setPhotoData(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function handleRedirect(_userId: string) {
    // Navigate to /dashboard immediately — the _authenticated route guard
    // resolves the role (with user_roles → profiles fallback) and redirects
    // admins to /admin and unprivileged accounts back to /auth. Doing role
    // resolution here blocks the redirect on extra network round-trips and,
    // on a transient query error, left users stuck on /auth after a
    // successful sign-in.
    navigate({ to: "/dashboard" });
  }

  async function handleResendConfirmation() {
    const email = unconfirmedEmail;
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) {
        toast.error(error.message);
        console.error("[auth] resend error:", error);
      } else {
        toast.success("Confirmation email resent. Please check your inbox.");
      }
    } catch (err: any) {
      toast.error("Failed to resend confirmation.");
      console.error("[auth] resend exception:", err);
    }
    setResending(false);
  }

  async function handleForgotPassword() {
    const email = (document.getElementById("si-email") as HTMLInputElement)?.value;
    if (!email) return toast.error("Enter your email first.");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) return toast.error(error.message);
      toast.success("Password reset link sent to your email.");
    } catch (err: any) {
      toast.error("Unable to connect to server. Check your internet connection.");
      console.error("[auth] forgot password exception:", err);
    }
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailUnconfirmed(false);
    setUnconfirmedEmail("");
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword(parsed.data),
        SIGN_IN_TIMEOUT,
      );

      console.log("[auth] signInWithPassword result:", {
        code: error?.code,
        message: error?.message,
      });

      if (error?.code === "email_not_confirmed") {
        setEmailUnconfirmed(true);
        setUnconfirmedEmail(parsed.data.email);
        setLoading(false);
        return toast.error("Email not confirmed. Check your inbox or resend the confirmation.");
      }

      setLoading(false);

      if (error) {
        console.error("[auth] signIn error:", error);
        return toast.error(
          isNetworkError(error)
            ? "Unable to reach the server. Check your internet connection and try again."
            : error.message || "Invalid email or password.",
        );
      }

      toast.success("Welcome back!");
      if (data?.user) {
        await handleRedirect(data.user.id);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setLoading(false);
      console.error("[auth] signIn exception:", err);
      if (err?.message === "timeout") {
        toast.error("Unable to connect to server. Check your internet connection.");
      } else if (isNetworkError(err)) {
        toast.error("Unable to reach the server. Check your internet connection and try again.");
      } else {
        toast.error("Invalid email or password.");
      }
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignUpSuccess(false);
    setSignUpEmail("");

    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!domains.some((d) => d.id === parsed.data.domainId)) {
      return toast.error("Please select a valid domain.");
    }

    if (parsed.data.password !== parsed.data.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);

    try {
      const { data: signUpData, error } = await withTimeout(
        supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: parsed.data.fullName,
              phone: parsed.data.phone,
              college: parsed.data.college,
              department: parsed.data.department,
              year: parsed.data.year,
              avatar_url: photoData,
              domain_id: parsed.data.domainId,
              duration: parsed.data.duration,
              must_change_password: false,
            },
          },
        }),
        SIGN_IN_TIMEOUT,
      );

      if (error) {
        console.error("[auth] signUp error:", error);
        setLoading(false);
        return toast.error(error.message);
      }

      const user = signUpData?.user;
      if (!user) {
        setLoading(false);
        return toast.error("Account creation failed. Please try again.");
      }

      if (signUpData?.user?.identities?.length === 0) {
        setLoading(false);
        return toast.error("An account with this email already exists. Try signing in instead.");
      }

      // Auto-login: establish a session immediately (no email verification required).
      const { data: signInData, error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
        SIGN_IN_TIMEOUT,
      );

      setLoading(false);

      if (signInError) {
        console.error("[auth] auto-login failed:", signInError);
        setSignUpSuccess(true);
        setSignUpEmail(parsed.data.email);
        return toast.error("Account created. Auto-login is pending — please sign in manually.");
      }

      toast.success("Account created! Redirecting to your dashboard...");
      if (signInData?.user) {
        await handleRedirect(signInData.user.id);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setLoading(false);
      console.error("[auth] signUp exception:", err);
      toast.error("Unable to connect to server. Check your internet connection.");
    }
  }

  async function handleRecoverySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    if (newPassword !== confirmNewPassword) return toast.error("Passwords do not match.");
    setRecoveryBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return toast.error(error.message);
      toast.success("Password updated! Please sign in with your new password.");
      await supabase.auth.signOut();
      setRecoveryMode(false);
      setNewPassword("");
      setConfirmNewPassword("");
      navigate({ to: "/auth" });
    } catch (err: any) {
      toast.error("Unable to connect to server.");
      console.error("[auth] recovery exception:", err);
    } finally {
      setRecoveryBusy(false);
    }
  }

  if (recoveryMode) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Set a new password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a strong password for your account
            </p>
          </div>
          <form onSubmit={handleRecoverySubmit} className="space-y-4">
            <div>
              <Label htmlFor="npw">New password</Label>
              <div className="relative">
                <Input
                  id="npw"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="cpw">Confirm new password</Label>
              <Input
                id="cpw"
                type={showSignUpPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={recoveryBusy}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              {recoveryBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome to {COMPANY.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Internship portal access</p>
        </div>

        {signUpSuccess ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Account created</h2>
            <p className="text-sm text-muted-foreground">
              We could not sign you in automatically. Please sign in with the credentials you just
              created.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button
                onClick={() => {
                  setSignUpSuccess(false);
                }}
              >
                Go to Sign in
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="si-pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="si-pw"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {emailUnconfirmed && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Email not confirmed</p>
                        <p className="text-xs mt-0.5">
                          Check <strong>{unconfirmedEmail}</strong> inbox for the confirmation link.
                          If you don't see it, check spam or resend below.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleResendConfirmation}
                      disabled={resending}
                    >
                      {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Resend confirmation email
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="remember" defaultChecked className="rounded" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="fullName" required />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="su-phone">Phone number</Label>
                  <Input id="su-phone" name="phone" type="tel" required autoComplete="tel" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="su-college">College</Label>
                    <Input id="su-college" name="college" required />
                  </div>
                  <div>
                    <Label htmlFor="su-dept">Department</Label>
                    <Input id="su-dept" name="department" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="su-year">Year</Label>
                    <select
                      id="su-year"
                      name="year"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="su-domain">Domain (locked after registration)</Label>
                    {domainsError ? (
                      <p className="text-sm text-destructive mt-1">{domainsError}</p>
                    ) : domains.length === 0 ? (
                      <p className="text-sm text-muted-foreground mt-1">Loading domains...</p>
                    ) : null}
                    <select
                      id="su-domain"
                      name="domainId"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select</option>
                      {domains.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="su-duration">
                    Internship Duration (locked after registration)
                  </Label>
                  <select
                    id="su-duration"
                    name="duration"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select Duration</option>
                    {["1 Month", "2 Months", "3 Months"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="su-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-password"
                      name="password"
                      type={showSignUpPassword ? "text" : "password"}
                      required
                      className="pr-10"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="su-confirm">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="su-confirm"
                      name="confirmPassword"
                      type={showSignUpConfirm ? "text" : "password"}
                      required
                      className="pr-10"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirm(!showSignUpConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignUpConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="su-photo">Student photo (optional, max 600KB)</Label>
                  <Input id="su-photo" type="file" accept="image/*" onChange={handlePhoto} />
                  {photoData && (
                    <img
                      src={photoData}
                      alt="preview"
                      className="mt-2 h-20 w-20 rounded object-cover border"
                    />
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register & enroll"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing you agree to our terms.{" "}
          <Link to="/" className="underline">
            Home
          </Link>
        </p>
      </Card>
    </div>
  );
}
