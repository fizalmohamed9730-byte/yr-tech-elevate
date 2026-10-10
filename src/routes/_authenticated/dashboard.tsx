import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, redirect, useRouteContext } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Award, FileText, IdCard, Github, ExternalLink, FolderOpen, Linkedin,
  Loader2, Upload, User, ShieldCheck, Eye, EyeOff, MessageSquare, Star,
  CheckCircle, CheckCircle2, Clock, AlertTriangle, AlertCircle,
  Calendar, Megaphone, Copy, Check, Sparkles, ChevronRight, ArrowRight,
  BookOpen, Download, LayoutDashboard, Filter, RefreshCw, Info, Lock,
  ChevronDown, Send, CheckCheck, HelpCircle, Layers, CheckSquare
} from "lucide-react";
import { getTasksForSlug, type TaskDef } from "@/lib/tasks";
import { downloadCertificate, downloadOfferLetterAnywhere, downloadIdCard, viewOfferLetterFromStorage } from "@/lib/pdf";
import { COMPANY } from "@/lib/company";
import { fileToResizedDataUrl, AVATAR_MAX_DIM } from "@/lib/image";
import { getInitials } from "@/lib/utils";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: ({ context }) => {
    const ctx = context as { isIntern?: boolean; isAdmin?: boolean };
    if (ctx.isAdmin) {
      throw redirect({ to: "/admin" });
    }
  },
  component: Dashboard,
});

export function Dashboard() {
  const routeCtx = useRouteContext({ from: "/_authenticated" }) as { user?: any };
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [internship, setInternship] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [showForcePw, setShowForcePw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("overview");
  const [taskFilter, setTaskFilter] = useState<"all" | "available" | "in_review" | "approved" | "resubmit">("all");
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskDef | null>(null);

  // Profile editing states
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyToClipboard(text: string, key: string, label: string = "Copied") {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function load() {
    try {
      let userId: string | null = routeCtx?.user?.id ?? null;

      if (!userId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          userId = session?.user?.id ?? null;
        } catch {}
      }

      if (!userId) {
        console.warn("[dashboard] no authenticated user available");
        setLoadError("No authenticated user found. Please log in again.");
        return;
      }

      // Step 1: Fetch profile and internship using safe production column select
      const [{ data: p, error: pErr }, { data: i, error: iErr }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, phone, college, department, year, avatar_url, github_url, linkedin_url, must_change_password, created_at")
          .eq("id", userId)
          .single(),
        supabase
          .from("internships")
          .select("id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, certificate_code, certificate_issued_at, certificate_released_by, certificate_released_at, progress_percent, completed_at, domain:domains(name,slug)")
          .eq("student_id", userId)
          .maybeSingle(),
      ]);

      if (pErr) console.error("[dashboard] profiles query error:", pErr.code, pErr.message);

      if (iErr) {
        console.error("[dashboard] internships query error:", iErr.code, iErr.message);
        setLoadError("Failed to load internship data. Database error: " + (iErr.message ?? iErr.code ?? "unknown"));
        setLoading(false);
        return;
      }

      setProfile(p);
      setPhoto(p?.avatar_url ?? null);

      let internshipData = i;
      let certStatus = (internshipData as any)?.certificate_status ?? "none";
      let certRevokedAt = (internshipData as any)?.certificate_revoked_at ?? null;
      let certRevokeReason = (internshipData as any)?.certificate_revoke_reason ?? null;

      // Step 2: Fetch certificate status + revocation columns separately (tolerant)
      if (internshipData?.id) {
        try {
          const { data: extData } = await (supabase as any)
            .from("internships")
            .select("certificate_status, certificate_revoked_at, certificate_revoke_reason")
            .eq("id", internshipData.id)
            .maybeSingle();
          if (extData?.certificate_status) certStatus = extData.certificate_status;
          if (extData?.certificate_revoked_at) certRevokedAt = extData.certificate_revoked_at;
          if (extData?.certificate_revoke_reason) certRevokeReason = extData.certificate_revoke_reason;
        } catch {}

        internshipData = {
          ...(internshipData as any),
          certificate_status: certStatus,
          certificate_revoked_at: certRevokedAt,
          certificate_revoke_reason: certRevokeReason,
        };
      }

      // Auto-activate offer letter if needed
      if (internshipData?.id && !internshipData.offer_letter_code) {
        try {
          const { data: upd, error: updErr } = await (supabase as any)
            .from("internships")
            .update({
              status: "active",
              started_at: internshipData.started_at ?? new Date().toISOString(),
            })
            .eq("id", internshipData.id)
            .select("id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, certificate_code, certificate_issued_at, certificate_released_by, certificate_released_at, progress_percent, completed_at, domain:domains(name,slug)")
            .maybeSingle();
          if (updErr) console.warn("[dashboard] auto-activate error:", updErr.code, updErr.message);
          if (upd) {
            internshipData = {
              ...upd,
              certificate_status: certStatus,
              certificate_revoked_at: certRevokedAt,
              certificate_revoke_reason: certRevokeReason,
            };
          }
        } catch (err: any) {
          console.warn("[dashboard] auto-activate internship error:", err?.message);
        }
      }
      setInternship(internshipData);

      // Domain fallback
      if (internshipData?.domain_id && (!internshipData.domain?.name || !internshipData.domain?.slug)) {
        try {
          const { data: domainRow, error: dErr } = await (supabase as any)
            .from("domains").select("name, slug").eq("id", internshipData.domain_id).maybeSingle();
          if (!dErr && domainRow?.name && domainRow?.slug) {
            internshipData = { ...internshipData, domain: { name: domainRow.name, slug: domainRow.slug } };
            setInternship(internshipData);
          }
        } catch (err: any) {
          console.warn("[dashboard] fallback domain fetch:", err?.message);
        }
      }

      // Submissions and Announcements queries
      if (internshipData?.id) {
        const { data: s, error: sErr } = await supabase
          .from("submissions")
          .select("id, task_no, status, project_url, github_url, drive_url, notes, feedback, submitted_at, reviewed_at")
          .eq("internship_id", internshipData.id)
          .order("task_no");

        if (sErr) console.error("[dashboard] submissions query error:", sErr.code, sErr.message);
        setSubmissions(s ?? []);

        let announcementsData: any[] = [];
        try {
          const { data: annData } = await (supabase as any)
            .from("announcements")
            .select("id, title, body, created_at, active")
            .eq("active", true)
            .order("created_at", { ascending: false });
          announcementsData = annData ?? [];
        } catch (annErr: any) {
          console.warn("[dashboard] announcements query failed:", annErr?.message);
        }
        setAnnouncements(announcementsData);
      }
    } catch (err: any) {
      console.error("[dashboard] load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600 * 1024) return toast.error("Photo must be under 600KB");
    setPhoto(await fileToResizedDataUrl(file, AVATAR_MAX_DIM));
  }

  const profileSchema = z.object({
    full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    college: z.string().trim().max(150).optional().or(z.literal("")),
    department: z.string().trim().max(100).optional().or(z.literal("")),
    year: z.string().trim().max(40).optional().or(z.literal("")),
    github_url: z.string().trim().url("Please enter a valid GitHub URL").max(300).optional().or(z.literal("")),
    linkedin_url: z.string().trim().url("Please enter a valid LinkedIn URL").max(300).optional().or(z.literal("")),
  });

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload: any = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]));
    payload.avatar_url = photo;
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile details saved successfully");
    load();
  }

  async function handleForceChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwBusy(false);
      return toast.error(error.message);
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", profile.id);
    setPwBusy(false);
    if (profileError) return toast.error(profileError.message);
    toast.success("Password changed successfully!");
    setProfile({ ...profile, must_change_password: false });
  }

  useEffect(() => {
    load();
  }, []);

  // Compute tasks & progression
  const isAIML = internship?.domain?.slug === "artificial-intelligence";
  const isFullStack = internship?.domain?.slug === "full-stack";
  const useDurationAwareTasks = isAIML || isFullStack;
  const allTasks = internship ? getTasksForSlug(internship.domain?.slug, useDurationAwareTasks ? internship.duration : undefined) : [];
  const durationTasksCount = useDurationAwareTasks
    ? allTasks.length
    : (internship?.duration === "1 Month" ? 3 : internship?.duration === "2 Months" ? 4 : 5);
  const tasks = useDurationAwareTasks ? allTasks : allTasks.slice(0, durationTasksCount);
  const submissionByNo = useMemo(() => new Map(submissions.map((s) => [s.task_no, s])), [submissions]);

  const approvedTaskCount = tasks.filter((t) => submissionByNo.get(t.no)?.status === "approved").length;
  const pendingReviewCount = tasks.filter((t) => {
    const st = submissionByNo.get(t.no)?.status;
    return st === "pending_review" || st === "pending";
  }).length;
  const resubmitCount = tasks.filter((t) => {
    const st = submissionByNo.get(t.no)?.status;
    return st === "rejected" || st === "resubmit";
  }).length;
  const remainingCount = Math.max(0, durationTasksCount - approvedTaskCount);
  const allRequiredApproved = tasks.length > 0 && tasks.every((t) => submissionByNo.get(t.no)?.status === "approved");

  function isTaskUnlocked(taskNo: number): boolean {
    if (taskNo === 1) return true;
    const prevSubmission = submissionByNo.get(taskNo - 1);
    return prevSubmission?.status === "approved";
  }

  // Next Action intelligence engine
  const nextAction = useMemo(() => {
    if (!internship) return null;

    // 1. Any task rejected or needing resubmission
    const taskNeedingResubmit = tasks.find((t) => {
      const s = submissionByNo.get(t.no);
      return s && (s.status === "rejected" || s.status === "resubmit");
    });
    if (taskNeedingResubmit) {
      const sub = submissionByNo.get(taskNeedingResubmit.no);
      return {
        type: "warning" as const,
        badge: "Action Required",
        title: `Revise Task ${taskNeedingResubmit.no}: ${taskNeedingResubmit.title}`,
        description: sub?.feedback
          ? `Reviewer feedback: "${sub.feedback}"`
          : "Your previous submission requires revisions to meet quality standards.",
        actionLabel: "Revise Deliverables",
        onAction: () => {
          setActiveTab("tasks");
          setSelectedTaskForModal(taskNeedingResubmit);
        },
      };
    }

    // 2. Next unlocked task not yet submitted
    const nextUnlocked = tasks.find((t) => isTaskUnlocked(t.no) && !submissionByNo.has(t.no));
    if (nextUnlocked) {
      return {
        type: "primary" as const,
        badge: "Next Milestone",
        title: `Submit Task ${nextUnlocked.no}: ${nextUnlocked.title}`,
        description: nextUnlocked.description.slice(0, 130) + (nextUnlocked.description.length > 130 ? "..." : ""),
        actionLabel: `Start Task ${nextUnlocked.no}`,
        onAction: () => {
          setActiveTab("tasks");
          setSelectedTaskForModal(nextUnlocked);
        },
      };
    }

    // 3. Any task pending review
    const pendingTask = tasks.find((t) => {
      const s = submissionByNo.get(t.no);
      return s && (s.status === "pending_review" || s.status === "pending");
    });
    if (pendingTask) {
      return {
        type: "info" as const,
        badge: "Evaluation in Progress",
        title: `Task ${pendingTask.no} is Awaiting Evaluation`,
        description: "Your deliverables have been received and are currently being reviewed by the technical evaluation team.",
        actionLabel: "View Roadmap",
        onAction: () => setActiveTab("tasks"),
      };
    }

    // 4. All tasks approved!
    if (allRequiredApproved) {
      if (internship.certificate_code) {
        return {
          type: "success" as const,
          badge: "Certificate Ready",
          title: "Certificate of Completion Issued!",
          description: `Verified Certificate ${internship.certificate_code} is officially signed and ready for download.`,
          actionLabel: "Download Certificate",
          onAction: () => setActiveTab("certificate"),
        };
      }

      return {
        type: "info" as const,
        badge: "Ready for Release",
        title: "All Milestones Completed!",
        description: "All assigned domain tasks are approved. Your official certificate is awaiting final administrative sign-off.",
        actionLabel: "View Certificate",
        onAction: () => setActiveTab("certificate"),
      };
    }

    return {
      type: "info" as const,
      badge: "In Progress",
      title: "Continue Your Engineering Roadmap",
      description: "Follow the structured curriculum and submit each project milestone for review.",
      actionLabel: "View Tasks",
      onAction: () => setActiveTab("tasks"),
    };
  }, [internship, tasks, submissionByNo, allRequiredApproved, durationTasksCount]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (loadError) {
    return (
      <div className="container mx-auto max-w-xl py-20 px-4 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Unable to Load Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{loadError}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => { setLoadError(null); setLoading(true); load(); }} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry Connection
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="container mx-auto max-w-xl py-20 px-4 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <Layers className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">No Active Internship Found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your account does not have an active internship enrollment registered in the portal.
        </p>
        <Button asChild>
          <Link to="/auth">Sign In With Another Account</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SaaS Product Header Ribbon */}
      <section className="border-b border-border/60 bg-gradient-to-b from-card to-background/50">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Student Profile Info */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-16 w-16 md:h-18 md:w-18 rounded-2xl border-2 border-primary/20 shadow-sm">
                  {photo ? (
                    <AvatarImage src={photo} alt={profile?.full_name ?? "Intern"} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-lg md:text-xl">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" title="Active intern" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
                    Welcome back, {profile?.full_name?.split(" ")[0] ?? "Intern"}
                  </h1>
                  <Badge variant={internship.status === "completed" ? "default" : "secondary"} className="capitalize text-xs font-medium">
                    {internship.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <span className="font-semibold text-foreground">{internship.domain?.name ?? "Engineering Track"}</span>
                  <span className="text-border">•</span>
                  <span>{internship.duration || "1 Month"}</span>
                  <span className="text-border">•</span>
                  <button
                    onClick={() => copyToClipboard(internship.internship_code, "id", "Internship ID copied")}
                    className="group inline-flex items-center gap-1.5 font-mono text-xs font-medium px-2 py-0.5 rounded bg-muted/80 hover:bg-muted text-foreground transition-colors"
                    title="Click to copy ID"
                  >
                    <span>ID: {internship.internship_code}</span>
                    {copiedKey === "id" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {internship.offer_letter_code && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.promise(
                      downloadOfferLetterAnywhere({
                        studentId: profile.id,
                        fullName: profile?.full_name ?? "Intern",
                        domain: internship.domain?.name ?? "",
                        domainSlug: internship.domain?.slug,
                        internshipCode: internship.internship_code,
                        offerCode: internship.offer_letter_code,
                        startedAt: internship.started_at,
                        duration: internship.duration,
                      }),
                      {
                        loading: "Downloading offer letter...",
                        success: "Offer letter downloaded!",
                        error: "Failed to download offer letter."
                      }
                    );
                  }}
                  className="gap-1.5 text-xs h-9 shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> Offer Letter
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("idcard")}
                className="gap-1.5 text-xs h-9 shadow-sm"
              >
                <IdCard className="h-3.5 w-3.5 text-indigo-600" /> Digital ID
              </Button>

              <Button
                size="sm"
                onClick={() => setActiveTab("certificate")}
                disabled={!internship.certificate_code}
                variant={internship.certificate_code ? "default" : "secondary"}
                className="gap-1.5 text-xs h-9 shadow-sm"
              >
                <Award className="h-3.5 w-3.5" />
                {internship.certificate_code ? "Certificate" : "Certificate Locked"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main SaaS Dashboard Container */}
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Next Action Intelligence Card */}
        {nextAction && (
          <div className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 shadow-sm transition-all ${
            nextAction.type === "warning"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
              : nextAction.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
              : "bg-primary/5 border-primary/20 text-foreground"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {nextAction.badge}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {nextAction.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {nextAction.description}
                </p>
              </div>

              <Button
                onClick={nextAction.onAction}
                className="shrink-0 gap-2 shadow-sm font-medium w-full sm:w-auto"
              >
                {nextAction.actionLabel} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Global Progress Metrics Strip */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 md:p-5 border-border/60 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Approved Tasks</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{approvedTaskCount}</span>
              <span className="text-xs text-muted-foreground">/ {durationTasksCount} required</span>
            </div>
            <Progress value={(approvedTaskCount / (durationTasksCount || 1)) * 100} className="h-1.5 mt-3" />
          </Card>

          <Card className="p-4 md:p-5 border-border/60 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Submissions Made</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Upload className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{submissions.length}</span>
              <span className="text-xs text-muted-foreground">milestones submitted</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {pendingReviewCount > 0 ? `${pendingReviewCount} under evaluation` : "All reviews processed"}
            </div>
          </Card>

          <Card className="p-4 md:p-5 border-border/60 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Tasks Remaining</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{remainingCount}</span>
              <span className="text-xs text-muted-foreground">tasks to complete</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${remainingCount === 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
              {remainingCount === 0 ? "All requirements completed" : "Roadmap in progress"}
            </div>
          </Card>

          <Card className="p-4 md:p-5 border-border/60 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">Certificate Status</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-semibold text-foreground">
                {internship.certificate_code ? "Released" : allRequiredApproved ? "Eligible" : "Locked"}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-3 truncate">
              {internship.certificate_code ? `ID: ${internship.certificate_code}` : `${remainingCount} tasks left`}
            </div>
          </Card>
        </div>

        {/* Tabbed Navigation System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-muted/60 p-1 text-muted-foreground border border-border/40 gap-1 w-max md:w-full md:grid md:grid-cols-7">
              <TabsTrigger value="overview" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <CheckSquare className="h-3.5 w-3.5" /> Tasks
                {resubmitCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                    {resubmitCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="offer" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <FileText className="h-3.5 w-3.5" /> Offer Letter
              </TabsTrigger>
              <TabsTrigger value="idcard" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <IdCard className="h-3.5 w-3.5" /> ID Card
              </TabsTrigger>
              <TabsTrigger value="certificate" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Award className="h-3.5 w-3.5" /> Certificate
              </TabsTrigger>
              <TabsTrigger value="announcements" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Megaphone className="h-3.5 w-3.5" /> Announcements
                {announcements.length > 0 && (
                  <span className="h-4 px-1.5 rounded-full bg-primary/20 text-[10px] text-primary flex items-center justify-center font-bold">
                    {announcements.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-lg text-xs md:text-sm font-medium px-3.5 py-1.5 gap-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <MessageSquare className="h-3.5 w-3.5" /> Feedback
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ==============================================================
              TAB 1: OVERVIEW
             ============================================================== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Internship Progress Flowchart */}
            <Card className="p-5 md:p-6 border-border/60 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Program Milestone Roadmap
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    End-to-end certification workflow from registration to verified release.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs w-max">
                  {approvedTaskCount} of {durationTasksCount} Completed
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                {/* Milestone 1: Application Verified */}
                <div className="flex flex-col p-4 rounded-xl border bg-card/60 shadow-sm relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 1</span>
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">Enrollment & Offer</h4>
                  <p className="text-xs text-muted-foreground">Application verified and official offer issued.</p>
                </div>

                {/* Milestone 2: Technical Tasks */}
                <div className={`flex flex-col p-4 rounded-xl border shadow-sm relative space-y-2 ${
                  allRequiredApproved ? "bg-card/60 border-emerald-500/30" : "bg-card/80 border-primary/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 2</span>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      allRequiredApproved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                    }`}>
                      {allRequiredApproved ? "✓" : "2"}
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">Task Evaluations</h4>
                  <p className="text-xs text-muted-foreground">
                    {approvedTaskCount} / {durationTasksCount} tasks approved by evaluation team.
                  </p>
                </div>

                {/* Milestone 3: Admin Sign-off */}
                <div className="flex flex-col p-4 rounded-xl border bg-card/60 shadow-sm relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 3</span>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      internship.certificate_code
                        ? "bg-emerald-500 text-white"
                        : allRequiredApproved
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {internship.certificate_code ? "✓" : "3"}
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">Admin Sign-off</h4>
                  <p className="text-xs text-muted-foreground">
                    {internship.certificate_code
                      ? "Approved and released by Admin."
                      : allRequiredApproved
                      ? "Awaiting final release by Admin."
                      : "Released by Admin after approvals."}
                  </p>
                </div>

                {/* Milestone 4: Certificate Released */}
                <div className="flex flex-col p-4 rounded-xl border bg-card/60 shadow-sm relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 4</span>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      internship.certificate_code ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {internship.certificate_code ? "✓" : "4"}
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">Official Certificate</h4>
                  <p className="text-xs text-muted-foreground">
                    {internship.certificate_code ? "Certificate available to download." : "Digital release by Admin."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Program Information & Quick Credentials */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-5 border-border/60 shadow-sm md:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Enrollment Details
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="text-[11px] text-muted-foreground">Internship ID</div>
                    <div className="font-mono font-semibold text-foreground mt-1">{internship.internship_code}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="text-[11px] text-muted-foreground">Engineering Domain</div>
                    <div className="font-medium text-foreground mt-1 truncate">{internship.domain?.name ?? "-"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="text-[11px] text-muted-foreground">Duration</div>
                    <div className="font-medium text-foreground mt-1">{internship.duration || "1 Month"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="text-[11px] text-muted-foreground">College / University</div>
                    <div className="font-medium text-foreground mt-1 truncate">{profile?.college || "Not specified"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="text-[11px] text-muted-foreground">Academic Year</div>
                    <div className="font-medium text-foreground mt-1">{profile?.year || "Not specified"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="text-[11px] text-muted-foreground">Started Date</div>
                    <div className="font-medium text-foreground mt-1">
                      {internship.started_at ? new Date(internship.started_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Need to update your college, phone, or portfolio links?
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("profile")} className="w-full sm:w-auto text-xs">
                    Edit Profile Details
                  </Button>
                </div>
              </Card>

              {/* ID Card Quick Snapshot */}
              <Card className="p-5 border-border/60 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-primary" /> Digital ID Card
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Official digital credential for identity verification during project reviews and corporate submissions.
                  </p>
                </div>

                <div className="flex justify-center py-2">
                  <div className="w-[170px] h-[240px] rounded-xl border border-primary/20 bg-gradient-to-b from-card to-muted/40 shadow-md p-3 flex flex-col items-center justify-between text-center relative overflow-hidden">
                    <div className="w-full bg-primary/10 text-primary rounded py-1 text-[9px] font-bold tracking-tight">
                      {COMPANY.name}
                    </div>
                    {photo ? (
                      <img src={photo} alt="Avatar" className="w-16 h-18 rounded-lg object-cover border shadow-sm" />
                    ) : (
                      <div className="w-16 h-18 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground border">
                        No Photo
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold text-[10px] truncate max-w-[140px] text-foreground">{profile?.full_name}</div>
                      <div className="font-mono text-[8px] text-muted-foreground">{internship.internship_code}</div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => setActiveTab("idcard")} className="w-full text-xs">
                  View Full Card & Download
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* ==============================================================
              TAB 2: TASKS & ROADMAP
             ============================================================== */}
          <TabsContent value="tasks" className="space-y-6">
            <Card className="p-5 md:p-6 border-border/60 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" /> Internship Tasks — {internship.domain?.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Submit deliverables for each milestone sequentially. Each task unlocks once the preceding task is approved.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant={taskFilter === "all" ? "default" : "outline"}
                    onClick={() => setTaskFilter("all")}
                    className="h-8 text-xs rounded-lg"
                  >
                    All ({tasks.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={taskFilter === "available" ? "default" : "outline"}
                    onClick={() => setTaskFilter("available")}
                    className="h-8 text-xs rounded-lg"
                  >
                    To Do
                  </Button>
                  <Button
                    size="sm"
                    variant={taskFilter === "in_review" ? "default" : "outline"}
                    onClick={() => setTaskFilter("in_review")}
                    className="h-8 text-xs rounded-lg"
                  >
                    In Review ({pendingReviewCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={taskFilter === "approved" ? "default" : "outline"}
                    onClick={() => setTaskFilter("approved")}
                    className="h-8 text-xs rounded-lg"
                  >
                    Approved ({approvedTaskCount})
                  </Button>
                </div>
              </div>

              {/* Task Roadmap List */}
              <div className="space-y-4">
                {tasks
                  .filter((t) => {
                    const sub = submissionByNo.get(t.no);
                    const unlocked = isTaskUnlocked(t.no);
                    if (taskFilter === "approved") return sub?.status === "approved";
                    if (taskFilter === "in_review") return sub?.status === "pending_review" || sub?.status === "pending";
                    if (taskFilter === "available") return unlocked && (!sub || sub?.status === "rejected" || sub?.status === "resubmit");
                    return true;
                  })
                  .map((t) => (
                    <TaskCard
                      key={t.no}
                      task={t}
                      submission={submissionByNo.get(t.no)}
                      unlocked={isTaskUnlocked(t.no)}
                      profile={profile}
                      internship={internship}
                      onOpenSubmit={() => setSelectedTaskForModal(t)}
                    />
                  ))}

                {tasks.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No curriculum tasks mapped for domain slug <code className="bg-muted px-1.5 py-0.5 rounded">{internship.domain?.slug ?? "unknown"}</code>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ==============================================================
              TAB 3: OFFER LETTER
             ============================================================== */}
          <TabsContent value="offer" className="space-y-6">
            <Card className="p-6 md:p-8 max-w-2xl mx-auto border-border/60 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" /> Official Offer Letter
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Verified internship enrollment document issued by {COMPANY.name}.
                  </p>
                </div>
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                  Approved & Signed
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Offer Letter Code</span>
                  <span className="font-mono font-semibold text-foreground">{internship.offer_letter_code ?? "Pending"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Internship ID</span>
                  <span className="font-mono font-semibold text-foreground">{internship.internship_code}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Engineering Track</span>
                  <span className="font-medium text-foreground">{internship.domain?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{internship.duration || "1 Month"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Issue Status</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Digitally Signed
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 p-4 text-xs sm:text-sm text-blue-900 dark:text-blue-200 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <Linkedin className="h-4 w-4 text-blue-600" /> Milestone Task 1 Deliverable
                </div>
                <p className="leading-relaxed">
                  Download this official offer letter and publish a post on your LinkedIn profile announcing your internship.
                  Submit the post URL in Task 1 for approval.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => {
                    toast.promise(
                      downloadOfferLetterAnywhere({
                        studentId: profile.id,
                        fullName: profile?.full_name ?? "Intern",
                        domain: internship.domain?.name ?? "",
                        domainSlug: internship.domain?.slug,
                        internshipCode: internship.internship_code,
                        offerCode: internship.offer_letter_code,
                        startedAt: internship.started_at,
                        duration: internship.duration,
                      }),
                      {
                        loading: "Generating official offer letter PDF...",
                        success: "Downloaded successfully!",
                        error: "Failed to download offer letter."
                      }
                    );
                  }}
                  className="flex-1 gap-2 font-medium"
                >
                  <Download className="h-4 w-4" /> Download Official PDF
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    toast.promise(
                      viewOfferLetterFromStorage(profile.id),
                      {
                        loading: "Opening in-browser preview...",
                        success: "Preview opened!",
                        error: "Failed to open preview."
                      }
                    );
                  }}
                >
                  <Eye className="h-4 w-4" /> In-Browser Preview
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* ==============================================================
              TAB 4: DIGITAL ID CARD
             ============================================================== */}
          <TabsContent value="idcard" className="space-y-6">
            <Card className="p-6 md:p-8 max-w-md mx-auto border-border/60 shadow-sm space-y-6 text-center">
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                  <IdCard className="h-5 w-5 text-primary" /> Digital Intern ID Card
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Official credential issued by {COMPANY.name}.
                </p>
              </div>

              {/* Realistic High-Fidelity ID Card */}
              <div className="flex justify-center py-2">
                <div className="w-[220px] h-[340px] rounded-2xl border-2 border-primary/30 bg-card text-card-foreground shadow-elegant overflow-hidden flex flex-col relative text-[9px]">
                  {/* Top Header */}
                  <div className="bg-primary text-primary-foreground p-3 text-center">
                    <div className="font-extrabold text-[12px] tracking-tight">{COMPANY.name}</div>
                    <div className="text-[6px] opacity-80">{COMPANY.tagline}</div>
                    <div className="font-semibold mt-1 text-[8px] tracking-wider uppercase bg-primary-foreground/15 rounded py-0.5">
                      INTERN ID CARD
                    </div>
                  </div>

                  {/* Student Photo */}
                  <div className="flex justify-center pt-3">
                    {photo ? (
                      <img src={photo} alt="Student" className="w-[80px] h-[90px] rounded-lg object-cover border shadow-sm" />
                    ) : (
                      <div className="w-[80px] h-[90px] bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border text-[8px] gap-1">
                        <User className="h-5 w-5 opacity-40" />
                        <span>No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Student Name */}
                  <div className="text-center px-3 pt-2">
                    <div className="font-bold text-[11px] leading-tight text-foreground truncate">{profile?.full_name}</div>
                  </div>

                  <div className="mx-3 mt-1.5 border-t border-border/60" />

                  {/* ID Details */}
                  <div className="flex-1 px-3 pt-2 space-y-1 text-[7.5px]">
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Intern ID</span><span className="font-mono font-semibold">{internship.internship_code}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Domain</span><span className="text-right leading-tight max-w-[120px] truncate">{internship.domain?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Duration</span><span>{internship.duration || "1 Month"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Issued</span><span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Email</span><span className="truncate max-w-[110px] text-right">{profile?.email}</span></div>
                  </div>

                  {/* Bottom Accent */}
                  <div className="bg-slate-900 h-2 mt-auto" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => downloadIdCard({
                    fullName: profile?.full_name ?? "Intern",
                    internshipCode: internship.internship_code,
                    domain: internship.domain?.name ?? "",
                    photoDataUrl: profile?.avatar_url,
                    email: profile?.email,
                    duration: internship.duration,
                  }).catch(err => toast.error("Download failed: " + (err?.message ?? "Unknown error")))}
                  className="w-full gap-2 font-medium"
                >
                  <Download className="h-4 w-4" /> Download PDF ID Card
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                  className="w-full text-xs"
                >
                  Update Photo in Profile
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* ==============================================================
              TAB 5: CERTIFICATE
             ============================================================== */}
          <TabsContent value="certificate" className="space-y-6">
            <Card className="p-6 md:p-8 max-w-2xl mx-auto border-border/60 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Certificate of Completion
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Official verifiable certificate issued upon successful completion of all internship tasks.
                  </p>
                </div>

                {internship.certificate_status === "revoked" ? (
                  <Badge className="bg-rose-600 text-white text-xs">Revoked</Badge>
                ) : internship.certificate_code ? (
                  <Badge className="bg-emerald-600 text-white text-xs">Released</Badge>
                ) : allRequiredApproved ? (
                  <Badge className="bg-amber-500 text-white text-xs">Pending Release</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Locked ({approvedTaskCount}/{durationTasksCount})
                  </Badge>
                )}
              </div>

              {/* Multi-State Status Cards */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Certificate Status</span>
                  <span className="font-semibold text-foreground">
                    {internship.certificate_status === "revoked"
                      ? "Revoked"
                      : internship.certificate_code
                      ? "Digitally Issued"
                      : allRequiredApproved
                      ? "Awaiting Admin Release"
                      : "Locked"}
                  </span>
                </div>
                {internship.certificate_code && (
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground">Certificate ID Code</span>
                    <span className="font-mono font-bold text-primary">{internship.certificate_code}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Curriculum Deliverables</span>
                  <span className="font-medium text-foreground">{approvedTaskCount} of {durationTasksCount} Approved</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Issuing Authority</span>
                  <span className="font-medium text-foreground">{COMPANY.name}</span>
                </div>
              </div>

              {/* State Explanations */}
              {!internship.certificate_code && !allRequiredApproved && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Certification Requirements Pending
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    You have {remainingCount} remaining tasks to get approved by the evaluation team. Once all required tasks are approved, your certificate will become eligible.
                  </p>
                </div>
              )}

              {!internship.certificate_code && allRequiredApproved && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs sm:text-sm space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" /> All Tasks Approved!
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    All required deliverables are approved. Your certificate is queued for digital signature and release by the Administrator.
                  </p>
                </div>
              )}

              {internship.certificate_status === "revoked" && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs sm:text-sm space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Certificate Revoked
                  </div>
                  <p className="text-xs">Reason: {internship.certificate_revoke_reason || "Administrative review."}</p>
                </div>
              )}

              <Button
                disabled={!internship.certificate_code || internship.certificate_status === "revoked"}
                onClick={() => downloadCertificate({
                  fullName: profile?.full_name ?? "Intern",
                  domain: internship.domain?.name ?? "",
                  internshipCode: internship.internship_code,
                  certificateCode: internship.certificate_code,
                  issuedAt: internship.certificate_issued_at,
                  duration: internship.duration,
                }).catch(err => toast.error("Download failed: " + (err?.message ?? "Unknown error")))}
                className="w-full gap-2 font-medium"
              >
                <Download className="h-4 w-4" />
                {internship.certificate_status === "revoked"
                  ? "Certificate Revoked"
                  : internship.certificate_code
                  ? "Download Official Certificate PDF"
                  : "Certificate Locked"}
              </Button>
            </Card>
          </TabsContent>

          {/* ==============================================================
              TAB 6: ANNOUNCEMENTS
             ============================================================== */}
          <TabsContent value="announcements" className="space-y-6">
            <Card className="p-6 md:p-8 max-w-2xl mx-auto border-border/60 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" /> Official Announcements
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Program bulletins, schedule updates, and system notices.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {announcements.length} Posted
                </Badge>
              </div>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl border border-border/50 bg-card/60 shadow-sm space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-sm md:text-base text-foreground">{ann.title}</h4>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {new Date(ann.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {ann.body}
                    </p>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <div className="text-center py-12 space-y-2">
                    <Megaphone className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <h4 className="font-semibold text-sm text-foreground">No Announcements Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Any schedule changes or program bulletins will appear here.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ==============================================================
              TAB 7: FEEDBACK
             ============================================================== */}
          <TabsContent value="feedback" className="space-y-6">
            <FeedbackPanel profile={profile} />
          </TabsContent>

          {/* ==============================================================
              TAB 8: PROFILE
             ============================================================== */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 md:p-8 max-w-2xl mx-auto border-border/60 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Profile Settings & Credentials
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage your personal information and student credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Uploader */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/40">
                  <Avatar className="h-16 w-16 rounded-xl border">
                    {photo ? <AvatarImage src={photo} className="object-cover" /> : null}
                    <AvatarFallback className="rounded-xl font-bold">{getInitials(profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <Label className="text-xs font-semibold">Profile Photo (Max 600KB)</Label>
                    <Input type="file" accept="image/*" onChange={onPhoto} className="text-xs" />
                    <p className="text-[11px] text-muted-foreground">Used on your verified digital ID card.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address (Read-Only)</Label>
                  <Input value={profile?.email ?? ""} disabled className="bg-muted text-muted-foreground text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-xs font-semibold">Full Legal Name</Label>
                  <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required className="text-xs" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Contact Phone</Label>
                    <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} className="text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="year" className="text-xs font-semibold">Academic Year</Label>
                    <Input id="year" name="year" defaultValue={profile?.year ?? ""} placeholder="e.g. 3rd Year" className="text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="college" className="text-xs font-semibold">College / University</Label>
                    <Input id="college" name="college" defaultValue={profile?.college ?? ""} className="text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-semibold">Department / Stream</Label>
                    <Input id="department" name="department" defaultValue={profile?.department ?? ""} placeholder="e.g. Computer Science" className="text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="github_url" className="text-xs font-semibold">GitHub Profile URL</Label>
                  <Input id="github_url" name="github_url" type="url" defaultValue={profile?.github_url ?? ""} placeholder="https://github.com/username" className="text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkedin_url" className="text-xs font-semibold">LinkedIn Profile URL</Label>
                  <Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={profile?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/username" className="text-xs" />
                </div>

                <Button type="submit" disabled={saving} className="w-full gap-2 font-medium">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Profile Details"}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Focused Task Submission Dialog */}
      {selectedTaskForModal && (
        <TaskSubmissionModal
          task={selectedTaskForModal}
          submission={submissionByNo.get(selectedTaskForModal.no)}
          internshipId={internship.id}
          open={!!selectedTaskForModal}
          onClose={() => setSelectedTaskForModal(null)}
          onSuccess={() => {
            setSelectedTaskForModal(null);
            load();
          }}
        />
      )}

      {/* Force Change Password Dialog */}
      <Dialog open={!!profile?.must_change_password}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Secure Password Required</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForceChangePassword} className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are currently logged in with your temporary default credentials. Please choose a secure password to protect your internship records.
            </p>
            <div className="space-y-2">
              <Label htmlFor="force-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="force-pw"
                  type={showForcePw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowForcePw(!showForcePw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showForcePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={pwBusy} className="w-full font-medium">
              {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password & Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================================
   TASK CARD COMPONENT
   ========================================================================= */
function TaskCard({
  task,
  submission,
  unlocked,
  profile,
  internship,
  onOpenSubmit,
}: {
  task: TaskDef;
  submission: any;
  unlocked: boolean;
  profile: any;
  internship: any;
  onOpenSubmit: () => void;
}) {
  const status = submission?.status as string | undefined;
  const canSubmit = unlocked && (!submission || status === "rejected" || status === "resubmit");

  return (
    <div className={`p-4 md:p-5 rounded-xl border transition-all ${
      status === "approved"
        ? "bg-emerald-500/5 border-emerald-500/20"
        : status === "rejected" || status === "resubmit"
        ? "bg-rose-500/5 border-rose-500/20"
        : unlocked
        ? "bg-card border-border/80 shadow-sm"
        : "bg-muted/30 border-border/40 opacity-70"
    }`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-semibold text-muted-foreground">
              Task {task.no}
            </span>
            <h4 className="font-semibold text-sm md:text-base text-foreground tracking-tight">
              {task.title}
            </h4>

            {/* Status Pills */}
            {status === "approved" && (
              <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" /> Approved
              </Badge>
            )}
            {(status === "pending_review" || status === "pending") && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-1">
                <Clock className="h-3 w-3" /> In Review
              </Badge>
            )}
            {(status === "rejected" || status === "resubmit") && (
              <Badge variant="destructive" className="text-[10px] gap-1">
                <AlertTriangle className="h-3 w-3" /> Needs Revision
              </Badge>
            )}
            {!status && unlocked && (
              <Badge variant="outline" className="text-primary border-primary/30 text-[10px] gap-1">
                <Sparkles className="h-3 w-3" /> Ready to Start
              </Badge>
            )}
            {!unlocked && (
              <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1">
                <Lock className="h-3 w-3" /> Locked
              </Badge>
            )}
          </div>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {task.description}
          </p>

          {/* Task 1 Offer Letter Shortcut */}
          {task.no === 1 && task.requires.linkedin && internship?.offer_letter_code && profile && (
            <div className="pt-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 gap-1.5"
                onClick={() => {
                  toast.promise(
                    downloadOfferLetterAnywhere({
                      studentId: profile.id,
                      fullName: profile?.full_name ?? "Intern",
                      domain: internship.domain?.name ?? "",
                      domainSlug: internship.domain?.slug,
                      internshipCode: internship.internship_code,
                      offerCode: internship.offer_letter_code,
                      startedAt: internship.started_at,
                      duration: internship.duration,
                    }),
                    {
                      loading: "Downloading offer letter...",
                      success: "Offer letter ready!",
                      error: "Failed to download."
                    }
                  );
                }}
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" /> Download Offer Letter to Share
              </Button>
            </div>
          )}

          {/* Reviewer Feedback Callout */}
          {submission?.feedback && (
            <div className="p-3 rounded-lg bg-accent/60 border border-border/40 text-xs text-foreground space-y-1">
              <span className="font-semibold text-primary flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Evaluation Feedback:
              </span>
              <p className="text-muted-foreground italic">&ldquo;{submission.feedback}&rdquo;</p>
            </div>
          )}

          {/* Deliverables Links */}
          {submission && (
            <div className="flex gap-2.5 pt-1 text-xs flex-wrap items-center">
              <span className="text-[11px] text-muted-foreground">Submitted:</span>
              {task.no === 1 && submission.project_url && (
                <a href={submission.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                  <Linkedin className="h-3 w-3" /> LinkedIn Post
                </a>
              )}
              {submission.github_url && (
                <a href={submission.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Github className="h-3 w-3" /> GitHub Repo
                </a>
              )}
              {task.no !== 1 && submission.project_url && (
                <a href={submission.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Live Project
                </a>
              )}
              {submission.drive_url && (
                <a href={submission.drive_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <FolderOpen className="h-3 w-3" /> Drive Assets
                </a>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center">
          <Button
            size="sm"
            disabled={!canSubmit}
            variant={canSubmit ? "default" : "outline"}
            onClick={onOpenSubmit}
            className="w-full md:w-auto text-xs gap-1.5 h-8 font-medium"
          >
            <Upload className="h-3.5 w-3.5" />
            {submission ? (status === "rejected" || status === "resubmit" ? "Resubmit Deliverables" : "Update") : "Submit Deliverables"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   TASK SUBMISSION MODAL COMPONENT
   ========================================================================= */
function TaskSubmissionModal({
  task,
  submission,
  internshipId,
  open,
  onClose,
  onSuccess,
}: {
  task: TaskDef;
  submission: any;
  internshipId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      internship_id: internshipId,
      task_no: task.no,
      github_url: (fd.get("github") as string) || null,
      project_url: task.no === 1
        ? (fd.get("linkedin") as string) || null
        : (fd.get("project") as string) || null,
      drive_url: (fd.get("drive") as string) || null,
      notes: (fd.get("notes") as string) || null,
      status: "pending_review",
      feedback: null,
      submitted_at: new Date().toISOString(),
    };
    setBusy(true);
    const { error } = submission
      ? await supabase.from("submissions").update(payload).eq("id", submission.id)
      : await supabase.from("submissions").upsert(payload, { onConflict: "internship_id,task_no" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deliverables submitted for administrative evaluation!");
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" /> Task {task.no}: {task.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {task.description}
          </p>

          {task.requires.linkedin && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">LinkedIn Post URL</Label>
              <Input
                name="linkedin"
                type="url"
                defaultValue={submission?.project_url ?? ""}
                placeholder="https://www.linkedin.com/posts/..."
                required
                className="text-xs"
              />
            </div>
          )}

          {task.requires.github && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">GitHub Repository URL</Label>
              <Input
                name="github"
                type="url"
                defaultValue={submission?.github_url ?? ""}
                placeholder="https://github.com/your-username/repo"
                required
                className="text-xs"
              />
            </div>
          )}

          {task.requires.project && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Live Project / Deployment URL</Label>
              <Input
                name="project"
                type="url"
                defaultValue={submission?.project_url ?? ""}
                placeholder="https://your-app.vercel.app"
                required
                className="text-xs"
              />
            </div>
          )}

          {task.requires.drive && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Google Drive Link (Reports / Demos)</Label>
              <Input
                name="drive"
                type="url"
                defaultValue={submission?.drive_url ?? ""}
                placeholder="https://drive.google.com/..."
                required={!task.requires.github}
                className="text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Implementation Notes (Optional)</Label>
            <Textarea
              name="notes"
              rows={3}
              defaultValue={submission?.notes ?? ""}
              placeholder="Highlight any key libraries, design decisions, or challenges..."
              className="text-xs"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="flex-1 text-xs font-medium">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Evaluation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================================
   FEEDBACK PANEL COMPONENT
   ========================================================================= */
function FeedbackPanel({ profile }: { profile: any }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, user_id, rating, message, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) console.error("[feedback] load error:", error.code, error.message);
      setExistingFeedback(data ?? []);
    })();
  }, [profile?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");
    if (message.trim().length < 10) return toast.error("Feedback must be at least 10 characters");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: profile.id,
        rating,
        message: message.trim(),
      });
      if (error) return toast.error(error.message);
      toast.success("Thank you! Your feedback has been received.");
      setMessage("");
      setRating(0);
      const { data: refreshed } = await supabase
        .from("feedback")
        .select("id, user_id, rating, message, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      setExistingFeedback(refreshed ?? []);
    } catch (err: any) {
      toast.error("Failed to submit feedback: " + (err?.message ?? "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6 md:p-8 max-w-2xl mx-auto border-border/60 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Program Feedback Desk
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Share your learning experience, mentorship feedback, and suggestions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Your Rating</Label>
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="p-1 rounded hover:bg-muted/60 transition-colors focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    s <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-semibold text-muted-foreground ml-2">
              {rating > 0 ? `${rating} of 5 Stars` : "Select stars"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback-msg" className="text-xs font-semibold">
            Your Comments & Review
          </Label>
          <Textarea
            id="feedback-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
            minLength={10}
            placeholder="Tell us about the challenges, learnings, and mentor support..."
            className="text-xs leading-relaxed"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Minimum 10 characters</span>
            <span>{message.length} characters</span>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full gap-2 font-medium">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
        </Button>
      </form>

      {existingFeedback.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/40">
          <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
            Previous Submissions ({existingFeedback.length})
          </h4>
          <div className="space-y-2.5">
            {existingFeedback.map((fb) => (
              <div key={fb.id} className="p-3.5 rounded-xl border border-border/40 bg-muted/30 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < fb.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-foreground/90 leading-relaxed">{fb.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* =========================================================================
   SKELETON LOADER
   ========================================================================= */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/50 p-6 md:p-8 animate-pulse">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-muted" />
            <div className="h-9 w-28 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
        <div className="h-11 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
      </div>
    </div>
  );
}
