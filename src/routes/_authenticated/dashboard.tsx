import { useEffect, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, FileText, IdCard, Github, ExternalLink, FolderOpen, Linkedin, Loader2, Upload, User, ShieldCheck, Eye, EyeOff, MessageSquare, Star } from "lucide-react";
import { getTasksForSlug, type TaskDef } from "@/lib/tasks";
// PDF functions are lazy-loaded to avoid pulling jspdf (~300KB) into the dashboard bundle.
type PdfModule = typeof import("@/lib/pdf");
let _pdfMod: PdfModule | null = null;
async function getPdf(): Promise<PdfModule> {
  if (!_pdfMod) _pdfMod = await import("@/lib/pdf");
  return _pdfMod;
}
import { COMPANY } from "@/lib/company";
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

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [internship, setInternship] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [showForcePw, setShowForcePw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  // Profile editing states
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  async function load() {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      // Fetch profile + internship in parallel
      const [{ data: p }, { data: i }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, phone, college, department, year, avatar_url, github_url, linkedin_url, must_change_password").eq("id", u.user.id).single(),
        supabase.from("internships").select("id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, certificate_code, certificate_issued_at, progress_percent, completed_at, domain:domains(name,slug)").eq("student_id", u.user.id).maybeSingle(),
      ]);
      setProfile(p);
      setPhoto(p?.avatar_url ?? null);

      let internship = i;
      // Legacy users (registered before the offer-letter migration) have a
      // "pending" internship with no offer code, so they can't download their
      // offer letter. Auto-activate on load - the DB trigger issues the code.
      if (internship?.id && !internship.offer_letter_code) {
        try {
          const { data: upd } = await (supabase as any)
            .from("internships")
            .update({
              status: "active",
              started_at: internship.started_at ?? new Date().toISOString(),
            })
            .eq("id", internship.id)
            .select("id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, certificate_code, certificate_issued_at, progress_percent, completed_at, domain:domains(name,slug)")
            .maybeSingle();
          if (upd) internship = upd;
        } catch (err: any) {
          console.warn("[dashboard] auto-activate internship:", err?.message);
        }
      }
      setInternship(internship);

      if (internship?.id) {
        const { data: s } = await supabase.from("submissions").select("id, task_no, status, project_url, github_url, drive_url, notes, feedback, submitted_at, reviewed_at").eq("internship_id", internship.id).order("task_no");
        setSubmissions(s ?? []);
      }
    } catch (err: any) {
      console.error("[dashboard] load error:", err);
    } finally {
      setLoading(false);
    }
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600 * 1024) return toast.error("Photo must be under 600KB");
    const r = new FileReader();
    r.onload = () => setPhoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(file);
  }

  const profileSchema = z.object({
    full_name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    college: z.string().trim().max(150).optional().or(z.literal("")),
    department: z.string().trim().max(100).optional().or(z.literal("")),
    year: z.string().trim().max(40).optional().or(z.literal("")),
    github_url: z.string().trim().url().max(300).optional().or(z.literal("")),
    linkedin_url: z.string().trim().url().max(300).optional().or(z.literal("")),
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
    toast.success("Profile updated");
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

  useEffect(() => { load(); }, []);

  if (loading) return <div className="container mx-auto py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!internship) return (
    <div className="container mx-auto max-w-xl py-20 text-center">
      <h1 className="text-2xl font-bold mb-2">No internship found</h1>
      <p className="text-muted-foreground mb-6">Please register again to select your domain.</p>
      <Button asChild><Link to="/auth">Go to registration</Link></Button>
    </div>
  );

  const durationTasksCount = internship.duration === "1 Month" ? 3 : internship.duration === "2 Months" ? 4 : 5;
  const tasks = getTasksForSlug(internship.domain?.slug).slice(0, durationTasksCount);
  const submissionByNo = new Map(submissions.map((s) => [s.task_no, s]));
  const isApproved = internship.status === "active" || internship.status === "completed";

  function isTaskUnlocked(taskNo: number): boolean {
    if (taskNo === 1) return true;
    const prevSubmission = submissionByNo.get(taskNo - 1);
    return prevSubmission?.status === "approved";
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Welcome & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-b pb-4 md:pb-6 border-border/40">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">Welcome, {profile?.full_name ?? "Intern"} 👋</h1>
          <p className="text-sm md:text-muted-foreground">{COMPANY.name} Internship Portal</p>
        </div>
      </div>

      {/* Prominent Offer Letter Banner */}
      {(internship.status === "active" || internship.status === "completed") && internship.offer_letter_code && (
        <Card className="p-4 md:p-6 border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 shadow-elegant">
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" /> Download Your Official Offer Letter
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your enrollment is approved! Download your official offer letter below.
            </p>
          </div>
          <Button
            onClick={() => {
              toast.promise(
                getPdf().then(m => m.downloadOfferLetterAnywhere({
                  studentId: profile.id,
                  fullName: profile?.full_name ?? "Intern",
                  domain: internship.domain?.name ?? "",
                  domainSlug: internship.domain?.slug,
                  internshipCode: internship.internship_code,
                  offerCode: internship.offer_letter_code,
                  startedAt: internship.started_at,
                  duration: internship.duration,
                })),
                {
                  loading: "Downloading offer letter...",
                  success: "Downloaded successfully!",
                  error: "Failed to download offer letter."
                }
              );
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-elegant px-4 md:px-6 w-full md:w-auto"
          >
            Download Offer Letter
          </Button>
        </Card>
      )}

      {/* Modern SaaS Sub-Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex md:grid md:grid-cols-7 w-auto md:w-full h-auto p-1 bg-muted rounded-lg gap-1">
            <TabsTrigger value="dashboard" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">My Tasks</TabsTrigger>
            <TabsTrigger value="offer" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">Offer Letter</TabsTrigger>
            <TabsTrigger value="idcard" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">ID Card</TabsTrigger>
            <TabsTrigger value="certificate" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">Certificate</TabsTrigger>
            <TabsTrigger value="profile" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">Profile</TabsTrigger>
            <TabsTrigger value="feedback" className="py-2 text-xs md:text-sm whitespace-nowrap px-3">Feedback</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-5">
            <Stat label="Domain" value={internship.domain?.name ?? "-"} />
            <Stat label="Duration" value={internship.duration || "1 Month"} />
            <Stat label="Internship ID" value={internship.internship_code} mono />
            <Stat label="Status" value={<Badge variant={internship.status === "completed" ? "default" : "secondary"} className="text-xs">{internship.status}</Badge>} />
            <Stat label="Progress" value={`${internship.progress_percent}%`} />
          </div>

          <Card className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
              <h2 className="text-lg md:text-xl font-semibold">Progress</h2>
              <div className="text-sm text-muted-foreground flex flex-col md:flex-row md:space-x-4 gap-1 md:gap-0">
                <span>{submissions.filter(s=>s.status==='approved').length} / {durationTasksCount} tasks approved</span>
                <span className="font-medium text-foreground">{Math.max(0, durationTasksCount - submissions.filter(s=>s.status==='approved').length)} tasks remaining</span>
              </div>
            </div>
            <Progress value={internship.progress_percent} />
          </Card>

          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <Card className="p-4 md:p-6 space-y-4">
              <h3 className="font-semibold text-base md:text-lg flex items-center gap-2"><IdCard className="h-5 w-5 text-primary flex-shrink-0" /> Internship ID Card Preview</h3>
              <div className="flex justify-center bg-muted/30 p-3 md:p-4 rounded-lg">
                <div className="w-[160px] md:w-[180px] h-[250px] md:h-[280px] rounded-xl border bg-card text-card-foreground shadow-elegant overflow-hidden flex flex-col relative text-[7px] md:text-[8px]">
                  {/* Header */}
                  <div className="bg-primary text-primary-foreground p-2 md:p-2.5 text-center">
                    <div className="font-bold text-[9px] md:text-[10px]">{COMPANY.name}</div>
                    <div className="text-[4px] md:text-[5px] opacity-80">{COMPANY.tagline}</div>
                    <div className="font-semibold mt-0.5 text-[7px] md:text-[8px]">INTERN ID CARD</div>
                    <div className="text-[3px] md:text-[4px] opacity-70 mt-0.5">Udyam: {COMPANY.udyam}</div>
                  </div>
                  {/* Photo */}
                  <div className="flex justify-center pt-2 md:pt-3">
                    {photo ? (
                      <img src={photo} alt="Student" className="w-14 h-16 md:w-16 md:h-[72px] rounded object-cover border" />
                    ) : (
                      <div className="w-14 h-16 md:w-16 md:h-[72px] bg-muted flex items-center justify-center text-muted-foreground border text-[6px]">No Photo</div>
                    )}
                  </div>
                  {/* Name */}
                  <div className="text-center px-2 pt-1.5">
                    <div className="font-bold text-[8px] md:text-[9px] leading-tight">{profile?.full_name}</div>
                  </div>
                  {/* Divider */}
                  <div className="mx-2 mt-1 border-t border-primary/30" />
                  {/* Info */}
                  <div className="flex-1 px-2.5 pt-1.5 space-y-[3px] text-[5px] md:text-[6px]">
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">ID</span><span className="font-mono font-semibold text-right">{internship.internship_code}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Domain</span><span className="text-right leading-tight max-w-[90px]">{internship.domain?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Duration</span><span>{internship.duration || "1 Month"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Issue</span><span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Valid</span><span>{new Date(Date.now() + (parseInt(internship.duration) || 1) * 30 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Email</span><span className="truncate max-w-[90px] text-right">{profile?.email}</span></div>
                  </div>
                  {/* Footer */}
                  <div className="bg-slate-900 h-1 mt-auto" />
                </div>
              </div>
              <Button onClick={() => setActiveTab("idcard")} variant="outline" className="w-full">Manage ID Card</Button>
            </Card>

            <Card className="p-4 md:p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-base md:text-lg flex items-center gap-2 mb-2"><Award className="h-5 w-5 text-primary flex-shrink-0" /> Certificate of Completion</h3>
                <p className="text-sm text-muted-foreground">
                  Your YR NOVATECH internship certificate of completion is generated automatically after all required tasks ({durationTasksCount}) are reviewed and approved by the admin.
                </p>
              </div>
              <Button onClick={() => setActiveTab("certificate")} className="w-full bg-gradient-primary text-primary-foreground mt-4 md:mt-6">View Certificate Status</Button>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Tasks */}
        <TabsContent value="tasks">
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-2">Internship Tasks ({internship.domain?.name})</h2>
            <p className="text-sm text-muted-foreground mb-4 md:mb-6">
              Complete each task and submit it for admin review. Each task unlocks after the previous task is approved.
            </p>
            <div className="space-y-3 md:space-y-4">
              {tasks.map((t) => (
                <TaskRow
                  key={t.no}
                  task={t}
                  submission={submissionByNo.get(t.no)}
                  internshipId={internship.id}
                  locked={!isTaskUnlocked(t.no)}
                  onUpdated={load}
                  profile={profile}
                  internship={internship}
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Offer Letter */}
        <TabsContent value="offer">
          <Card className="p-4 md:p-6 max-w-xl mx-auto space-y-4 md:space-y-6">
            <div className="flex items-center justify-between border-b pb-3 md:pb-4">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600 flex-shrink-0" /> Offer Letter Details</h2>
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-xs">Approved</Badge>
            </div>
            
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex justify-between border-b pb-2 gap-2">
                <span className="text-muted-foreground">Offer ID Code:</span>
                <span className="font-mono font-semibold text-right">{internship.offer_letter_code ?? "Pending"}</span>
              </div>
              <div className="flex justify-between border-b pb-2 gap-2">
                <span className="text-muted-foreground">Internship ID:</span>
                <span className="font-mono font-semibold text-right">{internship.internship_code}</span>
              </div>
              <div className="flex justify-between border-b pb-2 gap-2">
                <span className="text-muted-foreground">Udyam Registration:</span>
                <span className="font-semibold text-right">{COMPANY.udyam}</span>
              </div>
              <div className="flex justify-between border-b pb-2 gap-2">
                <span className="text-muted-foreground">Issue Status:</span>
                <span className="text-emerald-600 font-semibold">Approved & Signed</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
              <Button
                onClick={() => {
                  toast.promise(
                    getPdf().then(m => m.downloadOfferLetterAnywhere({
                      studentId: profile.id,
                      fullName: profile?.full_name ?? "Intern",
                      domain: internship.domain?.name ?? "",
                      domainSlug: internship.domain?.slug,
                      internshipCode: internship.internship_code,
                      offerCode: internship.offer_letter_code,
                      startedAt: internship.started_at,
                      duration: internship.duration,
                    })),
                    {
                      loading: "Downloading offer letter PDF...",
                      success: "Downloaded successfully!",
                      error: "Failed to download offer letter PDF."
                    }
                  );
                }}
                className="flex-1 bg-gradient-primary text-primary-foreground"
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  toast.promise(
                    getPdf().then(m => m.viewOfferLetterFromStorage(profile.id)),
                    {
                      loading: "Opening offer letter preview...",
                      success: "Opened!",
                      error: "Failed to open offer letter preview."
                    }
                  );
                }}
              >
                View Offer Letter
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 5: ID Card */}
        <TabsContent value="idcard">
          <Card className="p-4 md:p-6 max-w-sm mx-auto space-y-4 md:space-y-6 text-center shadow-elegant">
            <h2 className="text-lg md:text-xl font-semibold flex items-center justify-center gap-2"><IdCard className="h-5 w-5 text-primary flex-shrink-0" /> Digital ID Card</h2>

            {internship.status === "pending" || internship.status === "rejected" ? (
              <div className="py-8">
                <p className="text-amber-600 font-medium">Your ID Card will be available after your application is approved.</p>
                <p className="text-sm text-muted-foreground mt-2">Current status: <Badge variant={internship.status === "pending" ? "secondary" : "destructive"}>{internship.status}</Badge></p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-[200px] h-[310px] rounded-xl border bg-card text-card-foreground shadow-elegant overflow-hidden flex flex-col relative text-[9px] border-primary/20">
                    {/* Header */}
                    <div className="bg-primary text-primary-foreground p-3 text-center">
                      <div className="font-bold text-[11px]">{COMPANY.name}</div>
                      <div className="text-[6px] opacity-80">{COMPANY.tagline}</div>
                      <div className="font-semibold mt-0.5 text-[8px]">INTERN ID CARD</div>
                      <div className="text-[5px] opacity-70 mt-0.5">Udyam: {COMPANY.udyam}</div>
                    </div>
                    {/* Photo */}
                    <div className="flex justify-center pt-3">
                      {photo ? (
                        <img src={photo} alt="Student" className="w-[72px] h-[80px] rounded object-cover border shadow-sm" />
                      ) : (
                        <div className="w-[72px] h-[80px] bg-muted flex items-center justify-center text-muted-foreground border text-[7px]">No Photo</div>
                      )}
                    </div>
                    {/* Name */}
                    <div className="text-center px-3 pt-2">
                      <div className="font-bold text-[10px] leading-tight">{profile?.full_name}</div>
                    </div>
                    {/* Divider */}
                    <div className="mx-3 mt-1.5 border-t border-primary/30" />
                    {/* Info */}
                    <div className="flex-1 px-3 pt-2 space-y-1.5 text-[7px]">
                      <div className="flex justify-between"><span className="text-muted-foreground font-medium">ID</span><span className="font-mono font-semibold">{internship.internship_code}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground font-medium">Domain</span><span className="text-right leading-tight max-w-[110px]">{internship.domain?.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground font-medium">Duration</span><span>{internship.duration || "1 Month"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground font-medium">Issue</span><span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground font-medium">Valid</span><span>{new Date(Date.now() + (parseInt(internship.duration) || 1) * 30 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground font-medium">Email</span><span className="truncate max-w-[110px] text-right">{profile?.email}</span></div>
                    </div>
                    {/* Footer */}
                    <div className="bg-slate-900 h-1.5 mt-auto" />
                  </div>
                </div>

                <Button
                  onClick={() => getPdf().then(m => m.downloadIdCard({
                    fullName: profile?.full_name ?? "Intern",
                    internshipCode: internship.internship_code,
                    domain: internship.domain?.name ?? "",
                    photoDataUrl: profile?.avatar_url,
                    email: profile?.email,
                    duration: internship.duration,
                  })).catch(err => toast.error("Download failed: " + (err?.message ?? "Unknown error")))}
                  className="w-full bg-gradient-primary text-primary-foreground"
                >
                  Download PDF ID Card
                </Button>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Tab 6: Certificate */}
        <TabsContent value="certificate">
          <Card className="p-4 md:p-6 max-w-xl mx-auto space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-primary flex-shrink-0" /> Certificate of Completion</h2>
            
            <p className="text-sm text-muted-foreground">
              Your certificate becomes eligible only after all required tasks ({durationTasksCount}) are submitted, approved by the admin, and your internship is marked as completed. The admin will issue your certificate once all requirements are met.
            </p>

            <div className="p-4 border rounded-lg bg-muted/30 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Certificate Status:</span>
                {internship.certificate_code ? (
                  <Badge className="bg-emerald-600">Issued</Badge>
                ) : (
                  <Badge variant="outline">Locked ({submissions.filter(s=>s.status==='approved').length} / {durationTasksCount} Tasks Approved)</Badge>
                )}
              </div>
              {internship.certificate_code && (
                <div className="flex justify-between">
                  <span>Certificate ID:</span>
                  <span className="font-mono font-semibold">{internship.certificate_code}</span>
                </div>
              )}
            </div>

            {!internship.certificate_code && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                Complete and receive approval for all {durationTasksCount} required internship tasks to unlock your certificate.
              </div>
            )}

            <Button
              disabled={!internship.certificate_code}
              onClick={() => getPdf().then(m => m.downloadCertificate({
                fullName: profile?.full_name ?? "Intern",
                domain: internship.domain?.name ?? "",
                internshipCode: internship.internship_code,
                certificateCode: internship.certificate_code,
                issuedAt: internship.certificate_issued_at,
                duration: internship.duration,
              })).catch(err => toast.error("Download failed: " + (err?.message ?? "Unknown error")))}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              {internship.certificate_code ? "Download Certificate PDF" : "Locked"}
            </Button>
          </Card>
        </TabsContent>

        {/* Tab 7: Profile */}
        <TabsContent value="profile">
          <Card className="p-4 md:p-6 max-w-xl mx-auto space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><User className="h-5 w-5 text-primary flex-shrink-0" /> Edit My Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                {photo ? <img src={photo} alt="me" className="h-20 w-20 rounded-full object-cover border" /> : <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No photo</div>}
                <div>
                  <Label>Student photo (max 600KB)</Label>
                  <Input type="file" accept="image/*" onChange={onPhoto} />
                </div>
              </div>
              <div><Label>Email (Cannot be modified)</Label><Input value={profile?.email ?? ""} disabled /></div>
              <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} /></div>
                <div><Label htmlFor="year">Year</Label><Input id="year" name="year" defaultValue={profile?.year ?? ""} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="college">College</Label><Input id="college" name="college" defaultValue={profile?.college ?? ""} /></div>
                <div><Label htmlFor="department">Department</Label><Input id="department" name="department" defaultValue={profile?.department ?? ""} /></div>
              </div>
              <div><Label htmlFor="github_url">GitHub Profile Link</Label><Input id="github_url" name="github_url" type="url" defaultValue={profile?.github_url ?? ""} placeholder="https://github.com/username" /></div>
              <div><Label htmlFor="linkedin_url">LinkedIn Profile Link</Label><Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={profile?.linkedin_url ?? ""} /></div>
              <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Profile Details"}</Button>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 8: Feedback */}
        <TabsContent value="feedback">
          <FeedbackPanel profile={profile} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!profile?.must_change_password}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Change Password Required</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForceChangePassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are currently logged in with your default password (your phone number). Please set a secure password to access your YR NOVATECH dashboard.
            </p>
            <div className="space-y-2">
              <Label htmlFor="force-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="force-pw"
                  type={showForcePw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowForcePw(!showForcePw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showForcePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={pwBusy} className="w-full bg-gradient-primary text-primary-foreground">
              {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password & Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function FeedbackPanel({ profile }: { profile: any }) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      const { data } = await supabase
        .from("feedback")
        .select("id, user_id, rating, message, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      setExistingFeedback(data ?? []);
    })();
  }, [profile?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating.");
    if (message.trim().length < 10) return toast.error("Feedback must be at least 10 characters.");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: profile.id,
        rating,
        message: message.trim(),
      });
      if (error) return toast.error(error.message);
      toast.success("Feedback submitted! Thank you.");
      setSubmitted(true);
      setMessage("");
      setRating(0);
      const { data } = await supabase
        .from("feedback")
        .select("id, user_id, rating, message, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      setExistingFeedback(data ?? []);
    } catch (err: any) {
      toast.error("Failed to submit feedback: " + (err?.message ?? "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-4 md:p-6 max-w-xl mx-auto space-y-4 md:space-y-6">
      <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary flex-shrink-0" /> Submit Feedback</h2>
      <p className="text-sm text-muted-foreground">Share your experience about the internship program.</p>

      {submitted && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Thank you for your feedback!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Rating</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="feedback-msg">Your Feedback</Label>
          <Textarea
            id="feedback-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
            placeholder="Tell us about your experience..."
            minLength={10}
          />
        </div>
        <Button type="submit" disabled={submitting} className="bg-gradient-primary text-primary-foreground">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
        </Button>
      </form>

      {existingFeedback.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold text-sm">Your Previous Feedback</h3>
          {existingFeedback.map((fb) => (
            <div key={fb.id} className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < fb.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-sm text-foreground/90">{fb.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <Card className="p-3 md:p-5">
      <div className="text-[10px] md:text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm md:text-lg font-semibold mt-1 break-words ${mono ? "font-mono" : ""}`}>{value}</div>
    </Card>
  );
}

function DownloadCard({ icon: Icon, title, desc, available, onClick }: any) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center"><Icon className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Button disabled={!available} onClick={onClick} variant={available ? "default" : "outline"} className={available ? "bg-gradient-primary text-primary-foreground" : ""}>
        {available ? "Download PDF" : "Locked"}
      </Button>
    </Card>
  );
}

function TaskRow({ task, submission, internshipId, locked, onUpdated, profile, internship }: { task: TaskDef; submission: any; internshipId: string; locked: boolean; onUpdated: () => void; profile?: any; internship?: any }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const status = submission?.status as string | undefined;
  const canSubmit = !locked && (!submission || status === "rejected" || status === "resubmit");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
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
      status: "pending",
      feedback: null,
      submitted_at: new Date().toISOString(),
    };
    setBusy(true);
    const { error } = submission
      ? await supabase.from("submissions").update(payload).eq("id", submission.id)
      : await supabase.from("submissions").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Submitted for review");
    setOpen(false);
    onUpdated();
  }

  return (
    <div className="border rounded-lg p-3 md:p-4">
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">Task {task.no}</span>
            <h3 className="font-semibold text-sm md:text-base">{task.title}</h3>
            {task.no === 1 && <Linkedin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />}
            {status && <Badge variant={status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary"} className="text-xs">{status}</Badge>}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{task.description}</p>
          {task.no === 1 && task.requires.linkedin && internship?.offer_letter_code && profile && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs"
              onClick={() => {
                toast.promise(
                  getPdf().then(m => m.downloadOfferLetterAnywhere({
                    studentId: profile.id,
                    fullName: profile?.full_name ?? "Intern",
                    domain: internship.domain?.name ?? "",
                    domainSlug: internship.domain?.slug,
                    internshipCode: internship.internship_code,
                    offerCode: internship.offer_letter_code,
                    startedAt: internship.started_at,
                    duration: internship.duration,
                  })),
                  { loading: "Downloading offer letter...", success: "Downloaded!", error: "Failed to download." }
                );
              }}
            >
              <FileText className="h-3.5 w-3.5 mr-1" /> Download Offer Letter to Post
            </Button>
          )}
          {submission?.feedback && <p className="text-xs mt-2 p-2 bg-accent rounded"><b>Reviewer:</b> {submission.feedback}</p>}
          {submission && (
            <div className="flex gap-2 md:gap-3 mt-2 text-xs flex-wrap">
              {task.no === 1 && submission.project_url && <a href={submission.project_url} target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1"><Linkedin className="h-3 w-3"/>LinkedIn</a>}
              {submission.github_url && <a href={submission.github_url} target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1"><Github className="h-3 w-3"/>GitHub</a>}
              {task.no !== 1 && submission.project_url && <a href={submission.project_url} target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3"/>Project</a>}
              {submission.drive_url && <a href={submission.drive_url} target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1"><FolderOpen className="h-3 w-3"/>Drive</a>}
            </div>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!canSubmit} variant={canSubmit ? "default" : "outline"} className="flex-shrink-0">
              <Upload className="h-3.5 w-3.5 mr-1"/>{submission ? "Resubmit" : "Submit"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Task {task.no}: {task.title}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              {task.requires.linkedin && <div><Label>LinkedIn Post URL</Label><Input name="linkedin" type="url" defaultValue={submission?.project_url ?? ""} placeholder="https://www.linkedin.com/posts/..." required /></div>}
              {task.requires.github && <div><Label>GitHub URL</Label><Input name="github" type="url" defaultValue={submission?.github_url ?? ""} placeholder="https://github.com/you/repo" required /></div>}
              {task.requires.project && <div><Label>Project URL</Label><Input name="project" type="url" defaultValue={submission?.project_url ?? ""} placeholder="https://…" required /></div>}
              {task.requires.drive && <div><Label>Google Drive URL</Label><Input name="drive" type="url" defaultValue={submission?.drive_url ?? ""} placeholder="https://drive.google.com/…" required /></div>}
              <div><Label>Notes (optional)</Label><Textarea name="notes" rows={3} defaultValue={submission?.notes ?? ""} /></div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : "Submit for review"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
