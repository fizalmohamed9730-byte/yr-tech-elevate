import { useState, useEffect, useRef } from "react";
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

const DISCOVERY_SOURCES = [
  "Google Search",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "Facebook",
  "WhatsApp",
  "Friend / Referral",
  "College / University",
  "YR NOVATECH Website",
  "Internship Platform",
  "Online Advertisement",
  "Other",
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
  "Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Burundi","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China",
  "Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador",
  "Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
  "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia",
  "Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia",
  "Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Micronesia",
  "Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea",
  "North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa",
  "San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago",
  "Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela",
  "Vietnam","Yemen","Zambia","Zimbabwe",
];

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
  country: z.string().min(1, "Please select your country."),
  discoverySource: z.string().min(1, "Please tell us how you heard about YR NOVATECH."),
  discoveryOther: z.string().optional(),
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
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [discoverySource, setDiscoverySource] = useState("");
  const countryRef = useRef<HTMLDivElement>(null);
  const recoveryModeActive = useRef(false);
  const navigating = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 5;

    async function loadDomains() {
      setLoadingDomains(true);
      while (attempt < maxAttempts && !cancelled) {
        attempt++;
        try {
          const { data, error } = await supabase
            .from("domains")
            .select("id,name,slug")
            .eq("active", true)
            .order("name");

          if (cancelled) return;

          if (error) {
            console.error(`[auth] domains load error (attempt ${attempt}/${maxAttempts}):`, error);
            if (attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, 2000 * attempt));
              continue;
            }
            break;
          }

          if (!data || data.length === 0) {
            console.warn(`[auth] domains query returned 0 rows (attempt ${attempt}/${maxAttempts})`);
            if (attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, 2000 * attempt));
              continue;
            }
            break;
          }

          console.log(`[auth] domains loaded: ${data.length} domains`);
          setDomains(data);
          setDomainsError(null);
          setLoadingDomains(false);
          return;
        } catch (err: any) {
          console.error(`[auth] domains load exception (attempt ${attempt}/${maxAttempts}):`, err);
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2000 * attempt));
            continue;
          }
          break;
        }
      }
      if (cancelled) return;
      console.warn("[auth] all domain load attempts failed, using fallback domains");
      setDomains([
        { id: "00000000-0000-0000-0000-000000000001", name: "Full Stack Development", slug: "full-stack" },
        { id: "00000000-0000-0000-0000-000000000002", name: "UI/UX Design", slug: "ui-ux" },
        { id: "00000000-0000-0000-0000-000000000003", name: "Python Programming", slug: "python" },
        { id: "00000000-0000-0000-0000-000000000004", name: "C++ Programming", slug: "cpp" },
        { id: "00000000-0000-0000-0000-000000000005", name: "Cyber Security", slug: "cyber-security" },
        { id: "00000000-0000-0000-0000-000000000006", name: "Artificial Intelligence & Machine Learning", slug: "artificial-intelligence" },
      ]);
      setDomainsError(null);
      setLoadingDomains(false);
    }

    loadDomains();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !recoveryModeActive.current) {
        recoveryModeActive.current = true;
        setRecoveryMode(true);
        toast.success("You can now set a new password.");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const type = params.get("type") ?? new URLSearchParams(window.location.search).get("type");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (type === "recovery" && accessToken && refreshToken && !recoveryModeActive.current) {
        recoveryModeActive.current = true;
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              recoveryModeActive.current = false;
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

  async function waitForSession(maxAttempts = 3, delayMs = 200): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session?.user) {
          console.log("[auth] session confirmed after", i + 1, "attempt(s)");
          return true;
        }
      } catch (err) {
        console.warn("[auth] getSession attempt", i + 1, "failed:", err);
      }
      if (i < maxAttempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }

  async function handleRedirect() {
    if (navigating.current) return;
    navigating.current = true;
    console.log("[auth] navigating to /dashboard");
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
        options: { emailRedirectTo: "https://www.yrnovatech.online/auth" },
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
        redirectTo: "https://www.yrnovatech.online/auth",
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
        hasUser: !!data?.user,
        hasSession: !!data?.session,
      });

      if (error?.code === "email_not_confirmed") {
        setEmailUnconfirmed(true);
        setUnconfirmedEmail(parsed.data.email);
        setLoading(false);
        return toast.error("Email not confirmed. Check your inbox or resend the confirmation.");
      }

      if (error) {
        setLoading(false);
        navigating.current = false;
        console.error("[auth] signIn error:", error);
        return toast.error(
          isNetworkError(error)
            ? "Unable to reach the server. Check your internet connection and try again."
            : error.message || "Invalid email or password.",
        );
      }

      if (!data?.user) {
        setLoading(false);
        navigating.current = false;
        return toast.error("Login succeeded but no user data returned. Please try again.");
      }

      const sessionReady = await waitForSession();
      if (!sessionReady) {
        console.warn("[auth] session not confirmed after signInWithPassword, navigating anyway");
      }

      toast.success("Welcome back!");
      await handleRedirect();
    } catch (err: any) {
      setLoading(false);
      navigating.current = false;
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
    const raw = Object.fromEntries(fd);
    const parsed = signUpSchema.safeParse({
      ...raw,
      discoveryOther: raw.discoveryOther || undefined,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!domains.some((d) => d.id === parsed.data.domainId)) {
      return toast.error("Please select a valid domain.");
    }

    if (parsed.data.password !== parsed.data.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    if (parsed.data.discoverySource === "Other" && !parsed.data.discoveryOther?.trim()) {
      return toast.error("Please specify how you heard about YR NOVATECH.");
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
              country: parsed.data.country,
              discovery_source: parsed.data.discoverySource,
              discovery_other: parsed.data.discoverySource === "Other" ? (parsed.data.discoveryOther ?? "") : "",
            },
          },
        }),
        SIGN_IN_TIMEOUT,
      );

      if (error) {
        console.error("[auth] signUp error:", error);
        setLoading(false);
        const msg = String(error.message ?? "").toLowerCase();
        if (
          error.code === "user_already_exists" ||
          msg.includes("already registered") ||
          msg.includes("already been registered") ||
          msg.includes("already exists")
        ) {
          return toast.error("An account with this email already exists. Try signing in instead.");
        }
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

      if (signInError) {
        setLoading(false);
        navigating.current = false;
        console.error("[auth] auto-login failed:", signInError);
        setSignUpSuccess(true);
        setSignUpEmail(parsed.data.email);
        return toast.error("Account created. Auto-login is pending - please sign in manually.");
      }

      const sessionReady = await waitForSession();
      if (!sessionReady) {
        console.warn("[auth] session not confirmed after signup auto-login, navigating anyway");
      }

      toast.success("Account created! Redirecting to your dashboard...");
      await handleRedirect();
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
                    ) : loadingDomains ? (
                      <p className="text-sm text-muted-foreground mt-1">Loading domains...</p>
                    ) : domains.length === 0 ? (
                      <p className="text-sm text-destructive mt-1">No domains available. Please refresh and try again.</p>
                    ) : null}
                    <select
                      id="su-domain"
                      name="domainId"
                      required
                      disabled={loadingDomains || domains.length === 0}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">{loadingDomains ? "Loading..." : "Select Domain"}</option>
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

                {/* Location Details */}
                <div className="pt-2 pb-1">
                  <h3 className="text-sm font-semibold text-foreground">Location Details</h3>
                </div>
                <div ref={countryRef} className="relative">
                  <Label htmlFor="su-country">Country *</Label>
                  <input
                    id="su-country"
                    name="country"
                    type="hidden"
                    value={countrySearch}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onFocus={() => setShowCountryDropdown(true)}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    autoComplete="off"
                  />
                  {showCountryDropdown && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-md">
                      {COUNTRIES.filter((c) =>
                        c.toLowerCase().includes(countrySearch.toLowerCase())
                      ).length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No countries found</div>
                      ) : (
                        COUNTRIES.filter((c) =>
                          c.toLowerCase().includes(countrySearch.toLowerCase())
                        ).map((c) => (
                          <button
                            key={c}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setCountrySearch(c);
                              setShowCountryDropdown(false);
                            }}
                          >
                            {c}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Discovery */}
                <div className="pt-2 pb-1">
                  <h3 className="text-sm font-semibold text-foreground">Discovery</h3>
                </div>
                <div>
                  <Label htmlFor="su-discovery">How did you hear about YR NOVATECH? *</Label>
                  <input name="discoverySource" type="hidden" value={discoverySource} required />
                  <select
                    id="su-discovery"
                    value={discoverySource}
                    onChange={(e) => setDiscoverySource(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select</option>
                    {DISCOVERY_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {discoverySource === "Other" && (
                  <div>
                    <Label htmlFor="su-discovery-other">Please specify</Label>
                    <Input
                      id="su-discovery-other"
                      name="discoveryOther"
                      placeholder="How did you hear about us?"
                      className="mt-1"
                    />
                  </div>
                )}

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
