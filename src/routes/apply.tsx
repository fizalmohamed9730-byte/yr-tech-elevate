import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: `Apply for Internship | ${COMPANY.name}` },
      { name: "description", content: "Submit your YR NOVATECH internship application." },
    ],
  }),
  component: ApplyPage,
});

const applySchema = z.object({
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

function ApplyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [domains, setDomains] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [domainsError, setDomainsError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("domains")
      .select("id,name,slug")
      .eq("active", true)
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("[apply] domains load error:", error);
          setDomainsError("Domains could not be loaded. Try again shortly.");
          setDomains([]);
          return;
        }
        setDomains(data ?? []);
        setDomainsError(null);
      });
  }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600 * 1024) return toast.error("Photo must be under 600KB");
    const reader = new FileReader();
    reader.onload = () => setPhotoData(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function handleResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Resume must be under 2MB");
    setResumeFile(file);
  }

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = applySchema.safeParse({
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      college: fd.get("college"),
      department: fd.get("department"),
      year: fd.get("year"),
      domainId: fd.get("domainId"),
      duration: fd.get("duration"),
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
    });

    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!domains.some((d) => d.id === parsed.data.domainId)) {
      return toast.error("Please select a valid domain.");
    }
    if (parsed.data.password !== parsed.data.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);

    // 1. Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
    });

    if (signUpError) {
      setLoading(false);
      return toast.error(signUpError.message);
    }

    const user = signUpData.user;
    if (!user) {
      setLoading(false);
      return toast.error("Account creation failed. Please try again.");
    }

    if (signUpData.user?.identities?.length === 0) {
      setLoading(false);
      return toast.error("An account with this email already exists. Try signing in instead.");
    }

    // 2. Auto-login (no email verification required — emails are auto-confirmed)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // 3. Create profile + internship records directly (in case DB trigger is missing)
    const userId = user.id;
    if (signInData?.user) {
      await (supabase as any)
        .from("profiles")
        .upsert({
          id: userId,
          user_id: userId,
          full_name: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          college: parsed.data.college,
          department: parsed.data.department,
          year: parsed.data.year,
          avatar_url: photoData,
          must_change_password: false,
        })
        .maybeSingle();

      let { data: internship } = await (supabase as any)
        .from("internships")
        .select("id")
        .eq("student_id", userId)
        .maybeSingle();

      if (!internship?.id) {
        internship = (
          await (supabase as any)
            .from("internships")
            .insert({
              student_id: userId,
              domain_id: parsed.data.domainId,
              duration: parsed.data.duration,
              status: "pending",
            })
            .select("id")
            .single()
        ).data;
      }

      if (internship?.id) {
        await (supabase as any)
          .from("profiles")
          .update({
            internship_id: internship.id,
            duration: parsed.data.duration,
            selected_domain: parsed.data.domainId,
          })
          .eq("id", userId);
      }

      // 4. Upload resume if provided
      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const filePath = `${userId}/resume_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile, { upsert: true });

        if (!uploadError) {
          const { data: publicUrl } = supabase.storage.from("resumes").getPublicUrl(filePath);
          if (publicUrl) {
            await supabase
              .from("profiles")
              .update({ resume_url: publicUrl.publicUrl })
              .eq("id", userId);
          }
        } else {
          toast.error(
            "Account created, but resume upload failed. You can re-upload it from your profile.",
          );
        }
      }
    }

    setLoading(false);

    if (signInError) {
      console.error("[apply] auto-login failed:", signInError);
      toast.success("Application submitted successfully!");
      navigate({ to: "/auth" });
      return;
    }

    toast.success("Application submitted successfully! Redirecting to dashboard...");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/internship">
            <ArrowLeft className="h-4 w-4" /> Back to Internship Details
          </Link>
        </Button>
      </div>

      <Card className="p-8 shadow-elegant border border-border/40">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Apply for Internship
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Join the YR NOVATECH team to build tomorrow's technology
          </p>
        </div>

        <form onSubmit={handleApply} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="app-name">Full Name</Label>
            <Input id="app-name" name="fullName" placeholder="Enter your full name" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-email">Email Address</Label>
              <Input
                id="app-email"
                name="email"
                type="email"
                placeholder="name@college.edu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-phone">Phone Number</Label>
              <Input
                id="app-phone"
                name="phone"
                type="tel"
                placeholder="10-digit number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-password">Password</Label>
              <div className="relative">
                <Input
                  id="app-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  required
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
            <div className="space-y-2">
              <Label htmlFor="app-confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="app-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-college">College Name</Label>
              <Input id="app-college" name="college" placeholder="Engineering College" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-dept">Department</Label>
              <Input id="app-dept" name="department" placeholder="Computer Science" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-year">Year of Study</Label>
              <select
                id="app-year"
                name="year"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Year</option>
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-domain">Domain (Cannot be changed later)</Label>
              {domainsError ? (
                <p className="text-sm text-destructive">{domainsError}</p>
              ) : domains.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading domains...</p>
              ) : null}
              <select
                id="app-domain"
                name="domainId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Domain</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-duration">Internship Duration (Cannot be changed later)</Label>
            <select
              id="app-duration"
              name="duration"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Duration</option>
              {["1 Month", "2 Months", "3 Months"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-photo">Student Photo (Max 600KB)</Label>
            <Input id="app-photo" type="file" accept="image/*" onChange={handlePhoto} required />
            {photoData && (
              <div className="mt-2 flex justify-center">
                <img
                  src={photoData}
                  alt="Preview"
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-resume">Resume Upload (Optional, PDF/Doc under 2MB)</Label>
            <Input id="app-resume" type="file" accept=".pdf,.doc,.docx" onChange={handleResume} />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Already applied?{" "}
          <Link to="/auth" className="underline hover:text-foreground">
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
}
