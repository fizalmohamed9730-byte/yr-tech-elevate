import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, BookOpen, Award, Loader2, Github, ExternalLink, FolderOpen, FileText,
  BarChart3, CheckSquare, Settings, Plus, Edit3, Trash2, Eye, RotateCw, Search,
  X, MailPlus, Download, MessageSquare, Star, Linkedin, LayoutDashboard,
  ClipboardList, Upload, Mail, CreditCard, Bell, Menu, LogOut, Clock, CheckCircle,
  TrendingUp, Calendar, Megaphone, Sun, Moon, TriangleAlert
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { getTasksForSlug } from "@/lib/tasks";
import { getInitials } from "@/lib/utils";
import { useAdminTheme } from "@/hooks/use-admin-theme";

import { downloadCertificate, downloadOfferLetterAnywhere, downloadIdCard, uploadOfferLetterToStorage, viewOfferLetterFromStorage } from "@/lib/pdf";
import { sendOfferLetterEmail, sendCertificateEmail } from "@/routes/-email.serverfn";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const ctx = context as { isAdmin?: boolean };
    if (!ctx.isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage
});

type Section = "dashboard" | "interns" | "applications" | "tasks" | "submissions" | "offers" | "idcards" | "certificates" | "feedback" | "enquiries" | "analytics" | "announcements";

const NAV_ITEMS: { id: Section; label: string; icon: any; badgeKey?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "interns", label: "Interns", icon: Users },
  { id: "applications", label: "Applications", icon: FileText, badgeKey: "applications" },
  { id: "tasks", label: "Tasks", icon: ClipboardList, badgeKey: "tasks" },
  { id: "submissions", label: "Submissions", icon: Upload, badgeKey: "submissions" },
  { id: "offers", label: "Offer Letters", icon: Mail },
  { id: "idcards", label: "ID Cards", icon: CreditCard },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "enquiries", label: "Enquiries", icon: Mail, badgeKey: "enquiries" },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  pending_review: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  resubmit: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const DOMAIN_COLORS = ["#3b82f6", "#06b6d4", "#a855f7", "#f97316", "#22c55e", "#ec4899"];

function AdminPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useAdminTheme();
  const reloadInProgress = useRef(false);
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>({});
  const profilePhotosLoaded = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastReloadSucceeded = useRef(false);

  async function safeQuery<T = any>(label: string, builder: { then: Function }): Promise<{ data: T[]; failed: boolean }> {
    try {
      const { data, error } = await builder as any;
      if (error) {
        console.error(`[admin] ${label} query error:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
        });
        return { data: [], failed: true };
      }
      return { data: (data ?? []) as T[], failed: false };
    } catch (err: any) {
      console.error(`[admin] ${label} query threw:`, {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      });
      return { data: [], failed: true };
    }
  }

  const loadProfilePhotos = useCallback(async (profilesList: any[]) => {
    if (profilePhotosLoaded.current || profilesList.length === 0) return;
    try {
      const ids = profilesList.map((p: any) => p.id);
      const { data } = await supabase.from("profiles").select("id, avatar_url").in("id", ids);
      if (data && data.length > 0) {
        const photos: Record<string, string> = {};
        for (const row of data) {
          if (row.avatar_url) photos[row.id] = row.avatar_url;
        }
        setProfilePhotos(photos);
      }
      profilePhotosLoaded.current = true;
    } catch {
      profilePhotosLoaded.current = true;
    }
  }, []);

  async function reload() {
    if (reloadInProgress.current) return;
    reloadInProgress.current = true;
    setLoadError(null);
    try {
      const db = supabase as any;
      const [pRes, rawInternsRes, rawSubsRes, projRes, rawPsRes, dRes, enqRes, annRes, rawFbRes] = await Promise.all([
        safeQuery("profiles", supabase.from("profiles").select("id, user_id, full_name, email, phone, college, department, year, github_url, linkedin_url, created_at").order("created_at", { ascending: false })),
        safeQuery("internships", supabase.from("internships").select("id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, certificate_code, certificate_issued_at, progress_percent, completed_at, created_at, domain:domains(name,slug)").order("created_at", { ascending: false })),
        safeQuery("submissions", db.from("submissions").select("id, internship_id, task_no, status, project_url, github_url, drive_url, notes, feedback, submitted_at, reviewed_at").order("submitted_at", { ascending: false })),
        safeQuery("projects", db.from("projects").select("id, title, description, file_url, difficulty, deadline, created_at, active, project_domains(domain_id, domain:domains(name))").order("created_at", { ascending: false })),
        safeQuery("project_submissions", db.from("project_submissions").select("id, project_id, student_id, github_url, notes, status, feedback, submitted_at, reviewed_at, project:projects(title)").order("submitted_at", { ascending: false })),
        safeQuery("domains", supabase.from("domains").select("id, name, slug, active").eq("active", true)),
        safeQuery("enquiries", db.from("enquiries").select("id, name, email, message, status, created_at, read_at").order("created_at", { ascending: false })),
        safeQuery("announcements", db.from("announcements").select("id, title, body, created_at").order("created_at", { ascending: false })),
        safeQuery("feedback", db.from("feedback").select("id, user_id, rating, message, created_at").order("created_at", { ascending: false })),
      ]);

      const p = pRes.data;
      const rawInterns = rawInternsRes.data;
      const rawSubs = rawSubsRes.data;
      const proj = projRes.data;
      const rawPs = rawPsRes.data;
      const d = dRes.data;
      const enq = enqRes.data;
      const ann = annRes.data;
      const rawFb = rawFbRes.data;

      const studentMap = new Map<string, any>();
      for (const profile of p) studentMap.set(profile.id, profile);

      const i = rawInterns.map((intern: any) => ({ ...intern, student: studentMap.get(intern.student_id) ?? null }));
      const ps = rawPs.map((sub: any) => ({ ...sub, student: studentMap.get(sub.student_id) ?? sub.student ?? null }));
      const fb = rawFb.map((f: any) => ({ ...f, student: studentMap.get(f.user_id) ?? null }));

      setProfiles(p);
      setInternships(i);
      setProjects(proj);
      setProjectSubmissions(ps);
      setDomains(d);
      setEnquiries(enq);
      setAnnouncements(ann);
      setFeedbackList(fb);

      const internshipMap = new Map<string, any>();
      for (const int of i) internshipMap.set(int.id, int);
      setSubmissions(rawSubs.map((sub: any) => ({ ...sub, internship: internshipMap.get(sub.internship_id) ?? null })));
      loadProfilePhotos(p);

      const failedCount = [pRes, rawInternsRes, rawSubsRes, projRes, rawPsRes, dRes, enqRes, annRes, rawFbRes].filter(r => r.failed).length;
      if (failedCount === 9) {
        setLoadError("Unable to connect to the server. Please try again.");
        lastReloadSucceeded.current = false;
      } else if (failedCount > 0) {
        setLoadError(`Some data could not be loaded (${failedCount}/9 sections failed). Partial data is shown.`);
        lastReloadSucceeded.current = true;
      } else {
        lastReloadSucceeded.current = true;
      }
    } catch (err: any) {
      console.error("[admin] reload error:", err);
      setLoadError("Unable to connect to the server. Please try again.");
      lastReloadSucceeded.current = false;
    } finally {
      reloadInProgress.current = false;
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: u, error: uErr } = await supabase.auth.getUser();
        if (uErr) {
          console.error("[admin] auth error:", uErr.message, uErr);
          return;
        }
        if (!u.user || !mounted) return;
        const { data: roles, error: rErr } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
        if (rErr) console.error("[admin] user_roles error:", rErr.code, rErr.message, rErr.details, rErr.hint);
        const admin = (roles ?? []).some((r: any) => r.role === "admin");
        if (!mounted) return;
        setIsAdmin(admin);
        if (admin) await reload();
      } catch (err: any) {
        console.error("[admin] init error:", err);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      if (lastReloadSucceeded.current) reload();
    }, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const approvedCountByInternship = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of submissions) {
      if (sub.status !== "approved") continue;
      map.set(sub.internship_id, (map.get(sub.internship_id) ?? 0) + 1);
    }
    return map;
  }, [submissions]);

  const internshipByStudent = useMemo(() => {
    const map = new Map<string, any>();
    for (const internship of internships) map.set(internship.student_id, internship);
    return map;
  }, [internships]);

  const approvedCountByStudent = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of submissions) {
      if (sub.status !== "approved") continue;
      const studentId = sub.internship?.student_id;
      if (studentId) map.set(studentId, (map.get(studentId) ?? 0) + 1);
    }
    return map;
  }, [submissions]);

  const enrichedStudents = useMemo(() => {
    function resolveDomainName(internship: any): string {
      if (internship?.domain?.name) return internship.domain.name;
      if (internship?.domain_id) { const dom = domains.find((d) => d.id === internship.domain_id); if (dom) return dom.name; }
      return "";
    }
    const ibs = new Map<string, any>();
    for (const internship of internships) ibs.set(internship.student_id, internship);
    let list = profiles.map((profile) => {
      const internship = ibs.get(profile.id) ?? null;
      return { ...profile, internship, resolvedDomain: resolveDomainName(internship) };
    });
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) =>
        (s.full_name ?? "").toLowerCase().includes(q) || (s.email ?? "").toLowerCase().includes(q) ||
        (s.college ?? "").toLowerCase().includes(q) || (s.year ?? "").toLowerCase().includes(q) ||
        (s.internship?.internship_code ?? "").toLowerCase().includes(q) ||
        (s.resolvedDomain ?? "").toLowerCase().includes(q) ||
        (s.internship?.duration ?? "").toLowerCase().includes(q) ||
        (s.internship?.status ?? "").toLowerCase().includes(q)
      );
    }
    if (filterDomain !== "all") list = list.filter((s) => s.internship?.domain_id === filterDomain);
    if (filterStatus !== "all") list = list.filter((s) => (s.internship?.status ?? "none") === filterStatus);
    if (filterDuration !== "all") list = list.filter((s) => (s.internship?.duration ?? "") === filterDuration);
    return list;
  }, [profiles, internships, domains, searchTerm, filterDomain, filterStatus, filterDuration]);

  const pendingSubs = submissions.filter((s) => s.status === "pending" || s.status === "pending_review" || s.status === "resubmit");
  const activeCount = internships.filter((i) => i.status === "active").length;
  const completedCount = internships.filter((i) => i.status === "completed").length;
  const pendingApps = internships.filter((i) => i.status === "pending").length;
  const pendingProjectSubs = projectSubmissions.filter((s) => s.status === "pending");
  const certsIssued = internships.filter((i) => i.certificate_code).length;

  const badgeCounts: Record<string, number> = { applications: pendingApps, tasks: pendingSubs.length, submissions: pendingProjectSubs.length, enquiries: enquiries.filter((e) => e.status === "new").length };

  const registrationData = useMemo(() => {
    const mc: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); mc[d.toLocaleDateString("en-US", { month: "short", year: "numeric" })] = 0; }
    for (const intern of internships) { const k = new Date(intern.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }); if (k in mc) mc[k]++; }
    return Object.entries(mc).map(([name, count]) => ({ name, count }));
  }, [internships]);

  const completionData = useMemo(() => {
    const c = internships.filter(i => i.status === "completed").length;
    const a = internships.filter(i => i.status === "active").length;
    const p = internships.filter(i => i.status === "pending").length;
    const x = internships.filter(i => i.status === "cancelled").length;
    return [
      { name: "Completed", value: c, color: "#3b82f6" },
      { name: "In Progress", value: a, color: "#06b6d4" },
      { name: "Dropped", value: x, color: "#f97316" },
      { name: "Pending", value: p, color: "#ef4444" },
    ];
  }, [internships]);

  const domainData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const intern of internships) { const n = intern.domain?.name ?? "Unknown"; counts[n] = (counts[n] || 0) + 1; }
    return Object.entries(counts).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 14) + "..." : name, fullName: name, count })).sort((a, b) => b.count - a.count);
  }, [internships]);

  const recentInterns = useMemo(() => [...internships].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5), [internships]);
  const completionRate = useMemo(() => Math.round((completedCount / (internships.length || 1)) * 100), [internships, completedCount]);

  const notifications = useMemo(() => {
    type NotifItem = { id: string; type: string; title: string; description: string; timestamp: string; icon: any; color: string; section?: Section };
    const items: NotifItem[] = [];
    for (const sub of pendingSubs) {
      items.push({ id: `sub-${sub.id}`, type: "submission", title: "Task Submission", description: `${sub.internship?.student?.full_name ?? "Intern"} submitted Task ${sub.task_no} for review`, timestamp: sub.submitted_at, icon: Upload, color: "text-amber-500", section: "tasks" });
    }
    for (const enquiry of enquiries.filter((e) => e.status === "new")) {
      items.push({ id: `enq-${enquiry.id}`, type: "enquiry", title: "New Enquiry", description: `${enquiry.name}: ${(enquiry.message ?? "").slice(0, 60)}${(enquiry.message ?? "").length > 60 ? "..." : ""}`, timestamp: enquiry.created_at, icon: Mail, color: "text-blue-500", section: "enquiries" });
    }
    for (const ann of announcements.slice(0, 5)) {
      items.push({ id: `ann-${ann.id}`, type: "announcement", title: "Announcement", description: ann.title, timestamp: ann.created_at, icon: Megaphone, color: "text-purple-500", section: "announcements" });
    }
    const recentInterns = internships.filter((i) => { const created = new Date(i.created_at).getTime(); return Date.now() - created < 86400000; }).slice(0, 5);
    for (const intern of recentInterns) {
      items.push({ id: `reg-${intern.id}`, type: "registration", title: "New Registration", description: `${intern.student?.full_name ?? "New intern"} registered for ${intern.domain?.name ?? ""}`, timestamp: intern.created_at, icon: Users, color: "text-emerald-500", section: "interns" });
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [pendingSubs, enquiries, announcements, internships]);

  const unreadCount = pendingSubs.length + enquiries.filter((e) => e.status === "new").length;

  async function issueCertificate(internshipId: string) {
    const { data: result, error } = await supabase.rpc("issue_certificate", { p_internship_id: internshipId });
    const res = result as any;
    if (error) return toast.error("Failed to issue certificate: " + error.message);
    if (res?.error) return toast.error(res.error);
    const code = res?.certificate_code ?? "issued";
    const now = res?.issued_at ?? new Date().toISOString();
    toast.success("Certificate issued: " + code);
    reload();
    const intern = internships.find((i) => i.id === internshipId);
    if (intern?.student?.email) {
      (async () => {
        try {
          const emailResult = await sendCertificateEmail({ data: { internshipId, email: intern.student.email, fullName: intern.student.full_name ?? "Intern", domain: intern.domain?.name ?? "", duration: intern.duration ?? "1 Month", internshipCode: intern.internship_code, certificateCode: code, issuedAt: now } });
          if (emailResult?.error) toast.error("Email failed: " + emailResult.error);
          else toast.success("Certificate emailed to " + intern.student.email);
        } catch (emailErr: any) { toast.error("Email failed: " + (emailErr?.message ?? "Unknown error")); }
      })();
    }
  }

  async function handleSendOfferLetterEmail(intern: any) {
    if (!intern.student?.email) return toast.error("No email found for this intern");
    setSendingEmail(`ol-${intern.id}`);
    try {
      const result = await sendOfferLetterEmail({ data: { internshipId: intern.id, email: intern.student.email, fullName: intern.student.full_name ?? "Intern", domain: intern.domain?.name ?? "", duration: intern.duration ?? "1 Month", internshipCode: intern.internship_code, offerCode: intern.offer_letter_code, startedAt: intern.started_at } });
      if (result?.error) toast.error("Email failed: " + result.error);
      else { toast.success("Offer letter emailed successfully"); reload(); }
    } catch (err: any) { toast.error("Email failed: " + (err?.message ?? "Unknown error")); }
    finally { setSendingEmail(null); }
  }

  async function handleSendCertificateEmail(intern: any) {
    if (!intern.student?.email) return toast.error("No email found for this intern");
    setSendingEmail(`cert-${intern.id}`);
    try {
      const result = await sendCertificateEmail({ data: { internshipId: intern.id, email: intern.student.email, fullName: intern.student.full_name ?? "Intern", domain: intern.domain?.name ?? "", duration: intern.duration ?? "1 Month", internshipCode: intern.internship_code, certificateCode: intern.certificate_code, issuedAt: intern.certificate_issued_at } });
      if (result?.error) toast.error("Email failed: " + result.error);
      else { toast.success("Certificate emailed successfully"); reload(); }
    } catch (err: any) { toast.error("Email failed: " + (err?.message ?? "Unknown error")); }
    finally { setSendingEmail(null); }
  }

  async function removeStudent(studentId: string) {
    if (!confirm("Permanently delete this student and all their data?")) return;
    const db = supabase as any;
    const { data: interns } = await db.from("internships").select("id").eq("student_id", studentId);
    for (const i of (interns ?? [])) await db.from("submissions").delete().eq("internship_id", i.id);
    await db.from("internships").delete().eq("student_id", studentId);
    const { error } = await db.from("profiles").delete().eq("id", studentId);
    if (error) return toast.error(error.message);
    toast.success("Student removed");
    reload();
  }

  async function updateStatus(id: string, status: string) {
    const patch: any = { status };
    if (status === "completed") { patch.completed_at = new Date().toISOString(); patch.progress_percent = 100; }
    const { data: updatedData, error } = await (supabase as any).from("internships").update(patch).eq("id", id).select("*, domain:domains(name,slug)").single();
    if (error) return toast.error("Failed to update: " + error.message);
    toast.success(status === "active" ? "Approved - offer letter issued" : "Updated");
    reload();
    if (status === "active") {
      const ud: any = updatedData;
      const sp = profiles.find((p) => p.id === ud.student_id);
      (async () => { try { await uploadOfferLetterToStorage({ studentId: ud.student_id, fullName: sp?.full_name ?? "Intern", domain: ud.domain?.name ?? "", domainSlug: ud.domain?.slug, internshipCode: ud.internship_code, offerCode: ud.offer_letter_code, startedAt: ud.started_at, duration: ud.duration }); toast.success("Offer letter PDF stored"); } catch (err: any) { toast.error("Failed to store PDF: " + err.message); } })();
      if (sp?.email) { (async () => { try { const r = await sendOfferLetterEmail({ data: { internshipId: id, email: sp.email, fullName: sp.full_name ?? "Intern", domain: ud.domain?.name ?? "", duration: ud.duration ?? "1 Month", internshipCode: ud.internship_code, offerCode: ud.offer_letter_code, startedAt: ud.started_at } }); if (r?.error) toast.error("Email failed: " + r.error); else toast.success("Offer letter emailed to " + sp.email); } catch (e: any) { toast.error("Email failed: " + (e?.message ?? "Unknown error")); } })(); }
    }
  }

  async function reviewSubmission(id: string, status: "approved" | "rejected" | "resubmit", fb: string) {
    const { error } = await (supabase as any).from("submissions").update({ status, feedback: fb || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error("Failed to review: " + error.message);
    toast.success("Reviewed"); reload();
  }

  async function handleProjectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const selectedDomains = JSON.parse(fd.get("domain_ids") as string || "[]") as string[];
    if (!title?.trim()) return toast.error("Title is required");
    if (selectedDomains.length === 0) return toast.error("Select at least one domain");
    const { data: proj, error } = await (supabase as any).from("projects").insert({ title: title.trim(), description: (fd.get("description") as string)?.trim() || "", difficulty: fd.get("difficulty") as string, deadline: fd.get("deadline") as string || null, file_url: fd.get("file_url") as string || null }).select().single();
    if (error) return toast.error(error.message);
    const { error: de } = await (supabase as any).from("project_domains").insert(selectedDomains.map((did) => ({ project_id: proj.id, domain_id: did })));
    if (de) toast.error("Domain assignment failed: " + de.message); else toast.success("Project created");
    reload(); (document.getElementById("proj-form") as HTMLFormElement)?.reset();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const { error } = await (supabase as any).from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted"); reload();
  }

  async function reviewProjectSubmission(id: string, status: "approved" | "rejected", fb: string) {
    const { error } = await (supabase as any).from("project_submissions").update({ status, feedback: fb || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Submission " + status); reload();
  }

  async function handleAnnouncementSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const body = (fd.get("body") as string)?.trim() || "";
    if (!title) return toast.error("Title is required");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({ title, body, created_by: u.user?.id ?? null, active: true });
    if (error) return toast.error(error.message);
    toast.success("Announcement published"); (e.currentTarget as HTMLFormElement).reset(); reload();
  }

  async function deleteAnnouncement(id: string) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Announcement deleted"); reload();
  }

  async function updateEnquiryStatus(id: string, status: string) {
    const { error } = await supabase.from("enquiries").update({ status, read_at: status === "read" ? new Date().toISOString() : null }).eq("id", id);
    if (error) return toast.error(error.message); reload();
  }

  function exportStudentsCSV() {
    const rows = enrichedStudents.map((s) => ({ name: s.full_name ?? "", email: s.email ?? "", phone: s.phone ?? "", college: s.college ?? "", department: s.department ?? "", year: s.year ?? "", internship_id: s.internship?.internship_code ?? "", domain: s.internship?.domain?.name ?? "", duration: s.internship?.duration ?? "", status: s.internship?.status ?? "no-app", registered: s.created_at ? new Date(s.created_at).toISOString() : "", linkedin: s.linkedin_url ?? "", github: s.github_url ?? "" }));
    const cols = ["name","email","phone","college","department","year","internship_id","domain","duration","status","registered","linkedin","github"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as any)[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `YR-NOVATECH-students-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  if (checking) return <div className="dark min-h-screen bg-(--admin-loading-bg) flex items-center justify-center"><div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" /><p className="mt-4 text-(--admin-text-secondary) text-sm">Loading dashboard...</p></div></div>;
  if (!isAdmin) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dayStr = now.toLocaleDateString("en-US", { weekday: "long" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  function SidebarContent() {
    return (<>
      <div className="p-5 border-b border-(--admin-sidebar-border)">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">YR</div>
          <div><div className="text-sm font-bold text-(--admin-text) tracking-tight">YR NOVATECH</div><div className="text-[10px] text-(--admin-text-muted) uppercase tracking-widest">Innovate. Develop. Deliver</div></div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const count = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0;
          return (<button key={item.id} onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${activeSection === item.id ? "bg-(--admin-nav-active-bg) text-blue-500 font-medium" : "text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg)"}`}>
            <item.icon className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">{item.label}</span>
            {count > 0 && <span className="h-5 min-w-5 px-1.5 rounded-full bg-blue-500/20 text-blue-500 text-[11px] font-medium flex items-center justify-center">{count}</span>}
          </button>);
        })}
      </nav>
      <div className="p-3 border-t border-(--admin-sidebar-border)">
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-(--admin-text-secondary) hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-4 w-4" /><span>Logout</span>
        </button>
      </div>
    </>);
  }

  return (
    <div id="admin-root" className={isDark ? "dark" : "admin-light"}>
      <div className="flex h-screen bg-(--admin-page) overflow-hidden">
        <aside className="hidden lg:flex flex-col w-55 bg-(--admin-sidebar) border-r border-(--admin-sidebar-border) shrink-0"><SidebarContent /></aside>
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-65 p-0 bg-(--admin-sidebar) border-r border-(--admin-sidebar-border)"><SheetTitle className="sr-only">Navigation</SheetTitle><SidebarContent /></SheetContent>
        </Sheet>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 border-b border-(--admin-header-border) bg-(--admin-header) backdrop-blur-sm flex items-center px-4 lg:px-6 gap-4 shrink-0">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-(--admin-nav-hover-bg) text-(--admin-text-secondary)"><Menu className="h-5 w-5" /></button>
            <div className="flex-1 max-w-md"><div className="relative">              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--admin-text-muted)" />
              <input placeholder="Search interns, applications, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-(--admin-input) border border-(--admin-input-border) rounded-lg pl-10 pr-4 py-2 text-sm text-(--admin-text) placeholder-(--admin-input-placeholder) focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
              {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--admin-text-muted) hover:text-(--admin-text)"><X className="h-4 w-4" /></button>}
            </div></div>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-(--admin-nav-hover-bg) text-(--admin-text-secondary) transition-colors" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-blue-600" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-(--admin-nav-hover-bg) text-(--admin-text-secondary) transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-(--admin-card) border-(--admin-card-border) p-0">
                <div className="p-3 border-b border-(--admin-card-border) flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-(--admin-text)">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[10px] text-blue-500 font-medium">{unreadCount} unread</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-(--admin-text-muted)">No notifications</div>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <DropdownMenuItem key={n.id} className="flex items-start gap-3 p-3 cursor-pointer hover:bg-(--admin-nav-hover-bg) focus:bg-(--admin-nav-hover-bg) border-b border-(--admin-card-border) last:border-0 rounded-none" onClick={() => { if (n.section) setActiveSection(n.section); }}>
                      <n.icon className={`h-4 w-4 mt-0.5 shrink-0 ${n.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-(--admin-text)">{n.title}</div>
                        <div className="text-xs text-(--admin-text-muted) truncate">{n.description}</div>
                        <div className="text-[10px] text-(--admin-text-muted) mt-1">{new Date(n.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                {notifications.length > 20 && <div className="p-2 text-center text-[11px] text-(--admin-text-muted)">+ {notifications.length - 20} more</div>}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-3 pl-3 border-l border-(--admin-input-border)">
              <div className="text-right hidden sm:block"><div className="text-sm font-medium text-(--admin-text)">Admin</div><div className="text-[11px] text-(--admin-text-muted)">System Administrator</div></div>
              <Avatar className="h-9 w-9 border-2 border-blue-500/30"><AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">AD</AvatarFallback></Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">

{loadError && (
  <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <TriangleAlert className="h-4 w-4 shrink-0" />
      <span>{loadError}</span>
    </div>
    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { lastReloadSucceeded.current = true; reload(); }}>
      <RotateCw className="h-3 w-3 mr-1" /> Retry
    </Button>
  </div>
)}

{/* ============ DASHBOARD ============ */}
{activeSection === "dashboard" && (
<div className="space-y-6">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-(--admin-text) tracking-tight">Admin Dashboard</h1>
      <p className="text-(--admin-text-secondary) text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with your internship program.</p>
    </div>
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl px-4 py-3 flex items-center gap-3">
      <Calendar className="h-5 w-5 text-blue-500" />
      <div><div className="text-sm font-medium text-(--admin-text)">{dateStr}</div><div className="text-[11px] text-(--admin-text-muted)">{dayStr}, {timeStr}</div></div>
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    {[
      { label: "Total Interns", value: profiles.length, icon: Users, bg: "bg-blue-500/10", ic: "text-blue-400", ring: "ring-blue-500/20" },
      { label: "Active Interns", value: activeCount, icon: BookOpen, bg: "bg-cyan-500/10", ic: "text-cyan-400", ring: "ring-cyan-500/20" },
      { label: "Pending Applications", value: pendingApps, icon: Clock, bg: "bg-amber-500/10", ic: "text-amber-400", ring: "ring-amber-500/20" },
      { label: "Completed", value: completedCount, icon: CheckCircle, bg: "bg-emerald-500/10", ic: "text-emerald-400", ring: "ring-emerald-500/20" },
      { label: "Pending Reviews", value: pendingSubs.length, icon: ClipboardList, bg: "bg-purple-500/10", ic: "text-purple-400", ring: "ring-purple-500/20" },
      { label: "Certificates Issued", value: certsIssued, icon: Award, bg: "bg-rose-500/10", ic: "text-rose-400", ring: "ring-rose-500/20" },
    ].map((stat) => (
      <div key={stat.label} className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-4 hover:border-(--admin-card-hover) transition-colors">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${stat.bg} ring-1 ${stat.ring} flex items-center justify-center shrink-0`}><stat.icon className={`h-5 w-5 ${stat.ic}`} /></div>
          <div className="min-w-0"><div className="text-[11px] text-(--admin-text-muted) uppercase tracking-wider truncate">{stat.label}</div><div className="text-2xl font-bold text-(--admin-text)">{stat.value}</div></div>
        </div>
      </div>
    ))}
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-(--admin-text) flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500" /> Registration Analytics</h3>
        <span className="text-[11px] text-(--admin-text-muted) bg-(--admin-input) px-2.5 py-1 rounded-md">Last 6 Months</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={registrationData}><CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} />
          <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} fontSize={11} tickLine={false} />
          <YAxis stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderRadius: "8px", fontSize: "12px", color: isDark ? "#ffffff" : "#0f172a" }} labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }} itemStyle={{ color: "#3b82f6" }} />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "#3b82f6" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5">
      <h3 className="text-sm font-semibold text-(--admin-text) flex items-center gap-2 mb-4"><CheckCircle className="h-4 w-4 text-cyan-500" /> Completion Analytics</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart><Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
            {completionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
          </Pie><Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderRadius: "8px", fontSize: "12px", color: isDark ? "#ffffff" : "#0f172a" }} /></PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-center"><div className="text-2xl font-bold text-(--admin-text)">{completionRate}%</div><div className="text-[10px] text-(--admin-text-muted)">Completion Rate</div></div></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {completionData.map((d) => (<div key={d.name} className="flex items-center gap-2 text-xs"><div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} /><span className="text-(--admin-text-secondary) truncate">{d.name}</span><span className="text-(--admin-text) font-medium ml-auto">{d.value}</span></div>))}
      </div>
    </div>
  </div>

  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5">
    <h3 className="text-sm font-semibold text-(--admin-text) flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-purple-500" /> Domain-wise Student Statistics</h3>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={domainData} barCategoryGap="20%"><CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} vertical={false} />
        <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} fontSize={10} tickLine={false} interval={0} />
        <YAxis stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderRadius: "8px", fontSize: "12px", color: isDark ? "#ffffff" : "#0f172a" }} formatter={(value: number, _name: string, props: any) => [value, props.payload.fullName]} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>{domainData.map((_, index) => (<Cell key={`cell-${index}`} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />))}</Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-(--admin-text) flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /> Recent Interns</h3>
      <button onClick={() => setActiveSection("interns")} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">View All</button>
    </div>
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm"><thead><tr className="border-b border-(--admin-card-border)">
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Name</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase hidden md:table-cell">Email</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase hidden lg:table-cell">ID</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase hidden xl:table-cell">College</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase hidden xl:table-cell">Year</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Domain</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase hidden md:table-cell">Duration</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Status</th>
        <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Progress</th>
        <th className="text-right py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Actions</th>
      </tr></thead><tbody>
        {recentInterns.map((intern) => {
          const s = intern.student; const ta = approvedCountByStudent.get(intern.student_id) ?? 0;
          const tt = intern.duration === "1 Month" ? 3 : intern.duration === "2 Months" ? 4 : 5;
          const pr = tt > 0 ? Math.round((ta / tt) * 100) : 0;
          return (<tr key={intern.id} className="border-b border-(--admin-card-border) hover:bg-(--admin-table-hover) transition-colors">
            <td className="py-3 px-3"><div className="flex items-center gap-2.5"><Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-blue-600/20 text-blue-500 text-xs font-medium">{getInitials(s?.full_name)}</AvatarFallback></Avatar><span className="text-(--admin-text) font-medium whitespace-nowrap">{s?.full_name ?? "-"}</span></div></td>
            <td className="py-3 px-3 text-(--admin-text-secondary) text-xs max-w-[140px] truncate hidden md:table-cell">{s?.email}</td>
            <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary) hidden lg:table-cell">{intern.internship_code}</td>
            <td className="py-3 px-3 text-(--admin-text-secondary) text-xs max-w-[120px] truncate hidden xl:table-cell">{s?.college ?? "-"}</td>
            <td className="py-3 px-3 text-(--admin-text-secondary) text-xs hidden xl:table-cell">{s?.year ?? "-"}</td>
            <td className="py-3 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">{intern.domain?.name ?? "-"}</span></td>
            <td className="py-3 px-3 text-(--admin-text-secondary) text-xs hidden md:table-cell">{intern.duration ?? "-"}</td>
            <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[intern.status] ?? ""}`}>{intern.status}</span></td>
            <td className="py-3 px-3"><div className="flex items-center gap-2"><Progress value={pr} className="h-1.5 w-16 bg-(--admin-progress-bg)" /><span className="text-xs text-(--admin-text-secondary) whitespace-nowrap">{pr}%</span></div></td>
            <td className="py-3 px-3"><div className="flex items-center gap-1 justify-end">
              <Dialog><DialogTrigger asChild><Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg)"><Eye className="h-3.5 w-3.5" /></Button></DialogTrigger>
                <DialogContent className="max-w-lg bg-(--admin-dialog) border-(--admin-dialog-border)"><DialogHeader><DialogTitle className="text-(--admin-text)">{s?.full_name ?? "Student"}</DialogTitle></DialogHeader>
                  <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto">
                    <div className="border border-(--admin-card-border) rounded-lg p-4 space-y-2"><h4 className="font-semibold text-xs uppercase text-(--admin-text-muted)">Personal</h4><div className="grid grid-cols-2 gap-2">
                      <div><span className="text-(--admin-text-muted)">Name:</span> <span className="text-(--admin-text)">{s?.full_name ?? "-"}</span></div>
                      <div><span className="text-(--admin-text-muted)">Email:</span> <span className="text-(--admin-text)">{s?.email}</span></div>
                      <div><span className="text-(--admin-text-muted)">Phone:</span> <span className="text-(--admin-text)">{s?.phone ?? "-"}</span></div>
                      <div><span className="text-(--admin-text-muted)">Year:</span> <span className="text-(--admin-text)">{s?.year ?? "-"}</span></div>
                      <div><span className="text-(--admin-text-muted)">College:</span> <span className="text-(--admin-text)">{s?.college ?? "-"}</span></div>
                      <div><span className="text-(--admin-text-muted)">Dept:</span> <span className="text-(--admin-text)">{s?.department ?? "-"}</span></div>
                    </div></div>
                    <div className="border border-(--admin-card-border) rounded-lg p-4 space-y-2"><h4 className="font-semibold text-xs uppercase text-(--admin-text-muted)">Internship</h4><div className="grid grid-cols-2 gap-2">
                      <div><span className="text-(--admin-text-muted)">ID:</span> <span className="text-(--admin-text) font-mono">{intern.internship_code}</span></div>
                      <div><span className="text-(--admin-text-muted)">Domain:</span> <span className="text-(--admin-text)">{intern.domain?.name ?? "-"}</span></div>
                      <div><span className="text-(--admin-text-muted)">Duration:</span> <span className="text-(--admin-text)">{intern.duration ?? "-"}</span></div>
                      <div><span className="text-(--admin-text-muted)">Status:</span> <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ml-1 ${STATUS_COLORS[intern.status] ?? ""}`}>{intern.status}</span></div>
                      <div><span className="text-(--admin-text-muted)">Progress:</span> <span className="text-(--admin-text)">{ta}/{tt} tasks</span></div>
                      <div><span className="text-(--admin-text-muted)">Offer:</span> <span className="text-(--admin-text) font-mono text-xs">{intern.offer_letter_code ?? "Not issued"}</span></div>
                      <div><span className="text-(--admin-text-muted)">Certificate:</span> <span className="text-(--admin-text) font-mono text-xs">{intern.certificate_code ?? "Not issued"}</span></div>
                    </div></div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg)"><Edit3 className="h-3.5 w-3.5" /></Button>
            </div></td>
          </tr>);
        })}
        {recentInterns.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-(--admin-text-muted) text-sm">No interns found</td></tr>}
      </tbody></table>
    </div>
  </div>
</div>
)}

{/* ============ INTERNS ============ */}
{activeSection === "interns" && (
<div className="space-y-4">
  <div className="flex flex-wrap items-center gap-3">
    <h2 className="text-lg font-semibold text-(--admin-text)">Student Directory ({enrichedStudents.length})</h2>
    <Button size="sm" variant="outline" onClick={() => reload()} className="ml-auto border-(--admin-input-border) text-(--admin-text-secondary) hover:bg-(--admin-nav-hover-bg)"><RotateCw className="h-3 w-3 mr-1" /> Refresh</Button>
    <Button size="sm" variant="outline" onClick={exportStudentsCSV} className="border-(--admin-input-border) text-(--admin-text-secondary) hover:bg-(--admin-nav-hover-bg)"><Download className="h-3 w-3 mr-1" /> Export CSV</Button>
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--admin-text-muted)" />
      <input placeholder="Search by name, email, ID, domain..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-9 rounded-lg border border-(--admin-input-border) bg-(--admin-select-bg) pl-9 pr-4 text-sm text-(--admin-text) placeholder-(--admin-text-muted) focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
      {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--admin-text-muted) hover:text-(--admin-text)"><X className="h-3.5 w-3.5" /></button>}
    </div>
    <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="h-9 rounded-lg border border-(--admin-input-border) bg-(--admin-select-bg) px-3 text-sm text-(--admin-text)"><option value="all">All Domains</option>{domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-(--admin-input-border) bg-(--admin-select-bg) px-3 text-sm text-(--admin-text)"><option value="all">All Status</option><option value="pending">Pending</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
    <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)} className="h-9 rounded-lg border border-(--admin-input-border) bg-(--admin-select-bg) px-3 text-sm text-(--admin-text)"><option value="all">All Durations</option><option value="1 Month">1 Month</option><option value="2 Months">2 Months</option><option value="3 Months">3 Months</option></select>
    {(searchTerm || filterDomain !== "all" || filterStatus !== "all" || filterDuration !== "all") && (
      <Button size="sm" variant="ghost" className="h-9 px-3 text-xs text-(--admin-text-secondary) hover:bg-(--admin-nav-hover-bg)" onClick={() => { setSearchTerm(""); setFilterDomain("all"); setFilterStatus("all"); setFilterDuration("all"); }}><X className="h-3 w-3 mr-1" /> Clear Filters</Button>
    )}
  </div>
  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-(--admin-card-border)">
    <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Photo</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Name</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">ID</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Email</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">College</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Domain</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Duration</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Status</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Progress</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Actions</th>
  </tr></thead><tbody>
    {enrichedStudents.map((s) => {
      const i = s.internship; const ta = approvedCountByStudent.get(s.id) ?? 0;
      const tt = i?.duration === "1 Month" ? 3 : i?.duration === "2 Months" ? 4 : i?.duration === "3 Months" ? 5 : 0;
      const pr = tt > 0 ? Math.round((ta / tt) * 100) : 0;
      return (<tr key={s.id} className="border-b border-(--admin-card-border) hover:bg-(--admin-table-hover)">
        <td className="py-3 px-3">{(profilePhotos[s.id] || s.avatar_url) ? <img src={profilePhotos[s.id] || s.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-(--admin-input-border)" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-600/20 text-blue-500 text-xs">{getInitials(s.full_name)}</AvatarFallback></Avatar>}</td>
        <td className="py-3 px-3 text-(--admin-text) font-medium whitespace-nowrap">{s.full_name ?? "-"}</td>
        <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary)">{i?.internship_code ?? "-"}</td>
        <td className="py-3 px-3 text-xs text-(--admin-text-secondary) max-w-[120px] truncate">{s.email}</td>
        <td className="py-3 px-3 text-xs text-(--admin-text-secondary) max-w-[120px] truncate">{s.college ?? "-"}</td>
        <td className="py-3 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">{s.resolvedDomain || "-"}</span></td>
        <td className="py-3 px-3 text-xs text-(--admin-text-secondary)">{i?.duration ?? "-"}</td>
        <td className="py-3 px-3">{i ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[i.status] ?? ""}`}>{i.status}</span> : <span className="text-xs text-(--admin-text-muted)">No app</span>}</td>
        <td className="py-3 px-3">{i ? <div className="flex items-center gap-2"><Progress value={pr} className="h-1.5 w-14 bg-(--admin-progress-bg)" /><span className="text-xs text-(--admin-text-secondary)">{ta}/{tt}</span></div> : <span className="text-xs text-(--admin-text-muted)">-</span>}</td>
        <td className="py-3 px-3"><div className="flex items-center gap-1">
          <Dialog><DialogTrigger asChild><Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg)"><Eye className="h-3.5 w-3.5" /></Button></DialogTrigger>
            <DialogContent className="max-w-lg bg-(--admin-dialog) border-(--admin-dialog-border)"><DialogHeader><DialogTitle className="text-(--admin-text)">{s.full_name ?? "Student"}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto">
                {(profilePhotos[s.id] || s.avatar_url) && <div className="flex justify-center"><img src={profilePhotos[s.id] || s.avatar_url} alt={s.full_name ?? ""} className="w-20 h-20 rounded-full object-cover border-2 border-(--admin-card-border)" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
                <div className="border border-(--admin-card-border) rounded-lg p-4 space-y-2"><h4 className="font-semibold text-xs uppercase text-(--admin-text-muted)">Personal</h4><div className="grid grid-cols-2 gap-2">
                  <div><span className="text-(--admin-text-muted)">Name:</span> <span className="text-(--admin-text)">{s.full_name ?? "-"}</span></div><div><span className="text-(--admin-text-muted)">Email:</span> <span className="text-(--admin-text)">{s.email}</span></div>
                  <div><span className="text-(--admin-text-muted)">Phone:</span> <span className="text-(--admin-text)">{s.phone ?? "-"}</span></div><div><span className="text-(--admin-text-muted)">Year:</span> <span className="text-(--admin-text)">{s.year ?? "-"}</span></div>
                  <div><span className="text-(--admin-text-muted)">College:</span> <span className="text-(--admin-text)">{s.college ?? "-"}</span></div><div><span className="text-(--admin-text-muted)">Dept:</span> <span className="text-(--admin-text)">{s.department ?? "-"}</span></div>
                </div></div>
                <div className="border border-(--admin-card-border) rounded-lg p-4 space-y-2"><h4 className="font-semibold text-xs uppercase text-(--admin-text-muted)">Internship</h4><div className="grid grid-cols-2 gap-2">
                  <div><span className="text-(--admin-text-muted)">ID:</span> <span className="text-(--admin-text) font-mono">{i?.internship_code ?? "-"}</span></div><div><span className="text-(--admin-text-muted)">Domain:</span> <span className="text-(--admin-text)">{s.resolvedDomain || "-"}</span></div>
                  <div><span className="text-(--admin-text-muted)">Duration:</span> <span className="text-(--admin-text)">{i?.duration ?? "-"}</span></div>
                  <div><span className="text-(--admin-text-muted)">Status:</span> <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ml-1 ${STATUS_COLORS[i?.status] ?? ""}`}>{i?.status ?? "-"}</span></div>
                  <div><span className="text-(--admin-text-muted)">Progress:</span> <span className="text-(--admin-text)">{ta}/{tt} tasks</span></div>
                  <div><span className="text-(--admin-text-muted)">Offer:</span> <span className="text-(--admin-text) font-mono text-xs">{i?.offer_letter_code ?? "Not issued"}</span></div>
                  <div><span className="text-(--admin-text-muted)">Certificate:</span> <span className="text-(--admin-text) font-mono text-xs">{i?.certificate_code ?? "Not issued"}</span></div>
                </div></div>
                {(s.github_url || s.linkedin_url) && <div className="border border-(--admin-card-border) rounded-lg p-4 space-y-2"><h4 className="font-semibold text-xs uppercase text-(--admin-text-muted)">Links</h4>
                  {s.github_url && <div><span className="text-(--admin-text-muted)">GitHub:</span> <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{s.github_url}</a></div>}
                  {s.linkedin_url && <div><span className="text-(--admin-text-muted)">LinkedIn:</span> <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{s.linkedin_url}</a></div>}
                </div>}
              </div>
            </DialogContent>
          </Dialog>
          {i?.status === "pending" && <><Button size="sm" className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={() => updateStatus(i.id, "active")}>Approve</Button><Button size="sm" variant="outline" className="h-7 px-2 text-xs border-(--admin-input-border) text-(--admin-text-secondary)" onClick={() => updateStatus(i.id, "cancelled")}>Reject</Button></>}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => removeStudent(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div></td>
      </tr>);
    })}
    {enrichedStudents.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-(--admin-text-muted) text-sm">{(searchTerm || filterDomain !== "all" || filterStatus !== "all" || filterDuration !== "all") ? "No interns found matching the selected filters." : "No students registered yet"}</td></tr>}
  </tbody></table></div></div>
</div>
)}

{/* ============ APPLICATIONS ============ */}
{activeSection === "applications" && (
<div className="space-y-4"><h2 className="text-lg font-semibold text-(--admin-text)">Internship Applications</h2>
  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-(--admin-card-border)">
    <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Code</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Student</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Domain & Duration</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Status</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Actions</th>
  </tr></thead><tbody>
    {internships.map((i) => (<tr key={i.id} className="border-b border-(--admin-card-border) hover:bg-(--admin-table-hover)">
      <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary)">{i.internship_code}</td>
      <td className="py-3 px-3"><div className="text-(--admin-text) font-medium">{i.student?.full_name ?? "-"}</div><div className="text-xs text-(--admin-text-muted)">{i.student?.email}</div></td>
      <td className="py-3 px-3"><div className="text-(--admin-text)">{i.domain?.name}</div><div className="text-xs text-(--admin-text-muted)">{i.duration}</div></td>
      <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[i.status] ?? ""}`}>{i.status}</span></td>
      <td className="py-3 px-3 space-x-1">{i.status === "pending" && <><Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateStatus(i.id, "active")}>Approve</Button><Button size="sm" variant="outline" className="h-7 border-(--admin-input-border) text-(--admin-text-secondary)" onClick={() => updateStatus(i.id, "cancelled")}>Reject</Button></>}{i.status !== "pending" && <span className="text-xs text-(--admin-text-muted)">-</span>}</td>
    </tr>))}
    {internships.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-(--admin-text-muted) text-sm">No applications yet</td></tr>}
  </tbody></table></div></div>
</div>
)}

{/* ============ TASKS ============ */}
{activeSection === "tasks" && (
<div className="space-y-4"><h2 className="text-lg font-semibold text-(--admin-text)">Student Task Submissions</h2>
  {submissions.length === 0 && <p className="text-sm text-(--admin-text-muted) text-center py-8 bg-(--admin-card) border border-(--admin-card-border) rounded-xl">No submissions yet</p>}
  {submissions.map((s) => {
    const tasks = getTasksForSlug(s.internship?.domain?.slug);
    const taskMeta = tasks.find((t) => t.no === s.task_no);
    return (<div key={s.id} className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-4 hover:border-(--admin-card-hover) transition-colors">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-xs text-(--admin-text-muted)">{s.internship?.internship_code} | Task {s.task_no}</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[s.status] ?? ""}`}>{s.status}</span></div>
          <div className="font-semibold mt-1 text-(--admin-text)">{taskMeta?.title ?? `Task ${s.task_no}`}</div>
          <div className="text-xs text-(--admin-text-muted) mt-0.5">{s.internship?.student?.full_name} | {s.internship?.domain?.name}</div>
          <div className="flex gap-3 mt-2 text-xs flex-wrap">
            {s.task_no === 1 && s.project_url && <a href={s.project_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline inline-flex items-center gap-1"><Linkedin className="h-3 w-3"/>LinkedIn</a>}
            {s.github_url && <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline inline-flex items-center gap-1"><Github className="h-3 w-3"/>GitHub</a>}
            {s.task_no !== 1 && s.project_url && <a href={s.project_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3"/>Project</a>}
            {s.drive_url && <a href={s.drive_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline inline-flex items-center gap-1"><FolderOpen className="h-3 w-3"/>Drive</a>}
          </div>
          {s.notes && <p className="text-xs mt-2 text-(--admin-text-muted)">{s.notes}</p>}
          {s.feedback && <p className="text-xs mt-2 p-2 bg-(--admin-feedback-bg) rounded-lg text-(--admin-feedback-text)"><b className="text-(--admin-text-secondary)">Feedback:</b> {s.feedback}</p>}
        </div>
        <ReviewDialog onReview={(status, fb) => reviewSubmission(s.id, status, fb)} />
      </div>
    </div>);
  })}
</div>
)}

{/* ============ SUBMISSIONS ============ */}
{activeSection === "submissions" && (
<div className="space-y-4"><h2 className="text-lg font-semibold text-(--admin-text)">Project Submissions</h2>
  {projectSubmissions.length === 0 && <p className="text-sm text-(--admin-text-muted) text-center py-8 bg-(--admin-card) border border-(--admin-card-border) rounded-xl">No project submissions yet</p>}
  {projectSubmissions.map((ps) => (
    <div key={ps.id} className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-4 hover:border-(--admin-card-hover) transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-(--admin-text)">{ps.project?.title}</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[ps.status] ?? ""}`}>{ps.status}</span></div>
          <div className="text-xs text-(--admin-text-muted) mt-1">{ps.student?.full_name} | {ps.student?.email}</div>
          {ps.github_url && <a href={ps.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs inline-flex items-center gap-1 mt-1"><Github className="h-3 w-3" />GitHub</a>}
          {ps.notes && <p className="text-xs mt-2 text-(--admin-text-muted)">{ps.notes}</p>}
          {ps.feedback && <p className="text-xs mt-2 p-2 bg-(--admin-feedback-bg) rounded-lg text-(--admin-feedback-text)"><b className="text-(--admin-text-secondary)">Feedback:</b> {ps.feedback}</p>}
        </div>
        {ps.status === "pending" && <ReviewDialog onReview={(status, fb) => reviewProjectSubmission(ps.id, status as any, fb)} />}
      </div>
    </div>
  ))}
</div>
)}

{/* ============ OFFER LETTERS ============ */}
{activeSection === "offers" && (
<div className="space-y-4"><h2 className="text-lg font-semibold text-(--admin-text)">Offer Letters</h2>
  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-(--admin-card-border)">
    <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Intern ID</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Name</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Domain</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Offer Code</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Email Status</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Actions</th>
  </tr></thead><tbody>
    {internships.filter(i => i.status === "active" || i.status === "completed").map((i) => (
      <tr key={i.id} className="border-b border-(--admin-card-border) hover:bg-(--admin-table-hover)">
        <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary)">{i.internship_code}</td>
        <td className="py-3 px-3 text-(--admin-text) font-medium">{i.student?.full_name}</td>
        <td className="py-3 px-3 text-(--admin-text)">{i.domain?.name}</td>
        <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary)">{i.offer_letter_code ?? "-"}</td>
        <td className="py-3 px-3">
          <span className="text-xs text-(--admin-text-muted)">-</span>
        </td>
        <td className="py-3 px-3 space-x-1 whitespace-nowrap">
          <Button size="sm" variant="ghost" className="h-7 text-xs text-(--admin-text-secondary) hover:text-(--admin-text)" onClick={() => viewOfferLetterFromStorage(i.student_id).catch(err => toast.error("View failed: " + (err?.message ?? "Unknown error")))}>View</Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-500 hover:text-blue-600" onClick={() => downloadOfferLetterAnywhere({ studentId: i.student_id, fullName: i.student?.full_name ?? "Intern", domain: i.domain?.name ?? "", domainSlug: i.domain?.slug, internshipCode: i.internship_code, offerCode: i.offer_letter_code, startedAt: i.started_at, duration: i.duration }).catch(err => toast.error("Download failed: " + (err?.message ?? "Unknown error")))}>Download</Button>
          <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" disabled={sendingEmail === `ol-${i.id}`} onClick={() => handleSendOfferLetterEmail(i)}>
            {sendingEmail === `ol-${i.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send"}
          </Button>
        </td>
      </tr>
    ))}
    {internships.filter(i => i.status === "active" || i.status === "completed").length === 0 && <tr><td colSpan={6} className="text-center py-8 text-(--admin-text-muted) text-sm">No issued offer letters yet</td></tr>}
  </tbody></table></div></div>
</div>
)}

{/* ============ ID CARDS ============ */}
{activeSection === "idcards" && (
<div className="space-y-4"><h2 className="text-lg font-semibold text-(--admin-text)">ID Cards</h2>
  <p className="text-sm text-(--admin-text-secondary)">Download intern ID cards for active interns.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {internships.filter(i => i.status === "active").map((i) => (
      <div key={i.id} className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-4 hover:border-(--admin-card-hover) transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10"><AvatarFallback className="bg-blue-600/20 text-blue-500 text-sm">{getInitials(i.student?.full_name)}</AvatarFallback></Avatar>
          <div><div className="text-(--admin-text) font-medium">{i.student?.full_name ?? "-"}</div><div className="text-xs text-(--admin-text-muted) font-mono">{i.internship_code}</div></div>
        </div>
        <div className="text-xs text-(--admin-text-secondary) space-y-1 mb-3">
          <div>Domain: <span className="text-(--admin-text)">{i.domain?.name ?? "-"}</span></div>
          <div>Duration: <span className="text-(--admin-text)">{i.duration ?? "-"}</span></div>
        </div>
        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={async () => {
          let photoDataUrl: string | undefined = i.student?.avatar_url;
          if (!photoDataUrl && i.student_id) {
            try { const { data } = await supabase.from("profiles").select("avatar_url").eq("id", i.student_id).maybeSingle(); photoDataUrl = data?.avatar_url ?? undefined; } catch {}
          }
          downloadIdCard({ fullName: i.student?.full_name ?? "Intern", internshipCode: i.internship_code ?? "", domain: i.domain?.name ?? "", photoDataUrl, email: i.student?.email, duration: i.duration }).catch(err => toast.error("Download failed: " + (err?.message ?? "Unknown error")));
        }}>
          <CreditCard className="h-3 w-3 mr-1" /> Download ID Card
        </Button>
      </div>
    ))}
    {internships.filter(i => i.status === "active").length === 0 && <div className="col-span-full text-center py-8 text-(--admin-text-muted) text-sm bg-(--admin-card) border border-(--admin-card-border) rounded-xl">No active interns</div>}
  </div>
</div>
)}

{/* ============ CERTIFICATES ============ */}
{activeSection === "certificates" && (
<div className="space-y-6">
  <h2 className="text-lg font-semibold text-(--admin-text)">Certificates</h2>
  {internships.filter(i => i.certificate_code).length > 0 && (
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-(--admin-card-border)">
      <th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Intern ID</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Name</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Domain</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Certificate Code</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Issued</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Email</th><th className="text-left py-3 px-3 text-[11px] font-medium text-(--admin-text-muted) uppercase">Actions</th>
    </tr></thead><tbody>
      {internships.filter(i => i.certificate_code).map((i) => (
        <tr key={i.id} className="border-b border-(--admin-card-border) hover:bg-(--admin-table-hover)">
          <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary)">{i.internship_code}</td>
          <td className="py-3 px-3 text-(--admin-text) font-medium">{i.student?.full_name}</td>
          <td className="py-3 px-3 text-(--admin-text)">{i.domain?.name}</td>
          <td className="py-3 px-3 font-mono text-xs text-(--admin-text-secondary)">{i.certificate_code}</td>
          <td className="py-3 px-3 text-xs text-(--admin-text-secondary)">{i.certificate_issued_at ? new Date(i.certificate_issued_at).toLocaleDateString() : "-"}</td>
          <td className="py-3 px-3"><span className="text-xs text-(--admin-text-muted)">-</span></td>
          <td className="py-3 px-3 space-x-1 whitespace-nowrap">
            <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-500 hover:text-blue-600" onClick={() => downloadCertificate({ fullName: i.student?.full_name ?? "Intern", domain: i.domain?.name ?? "", internshipCode: i.internship_code, certificateCode: i.certificate_code, issuedAt: i.certificate_issued_at, duration: i.duration }).catch(err => { console.error("[certificate-download]", err); toast.error("Download failed") })}>Download</Button>
            <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" disabled={sendingEmail === `cert-${i.id}`} onClick={() => handleSendCertificateEmail(i)}>
              {sendingEmail === `cert-${i.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send"}
            </Button>
          </td>
        </tr>
      ))}
    </tbody></table></div></div>
  )}
  {internships.filter(i => i.status === "completed" && !i.certificate_code).length > 0 && (
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-(--admin-text)">Eligible for Certificate</h3>
      {internships.filter(i => i.status === "completed" && !i.certificate_code).map((i) => {
        const ta = approvedCountByInternship.get(i.id) ?? 0;
        return (<div key={i.id} className="flex items-center justify-between gap-3 py-2 border-b border-(--admin-card-border) last:border-0">
          <div><span className="text-(--admin-text) font-medium">{i.student?.full_name}</span><span className="text-xs text-(--admin-text-muted) ml-2">{i.internship_code}</span><span className="text-xs text-(--admin-text-muted) ml-2">{i.domain?.name}</span></div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={() => issueCertificate(i.id)}><Award className="h-3 w-3 mr-1" /> Issue Certificate</Button>
        </div>);
      })}
    </div>
  )}
</div>
)}

{/* ============ FEEDBACK ============ */}
{activeSection === "feedback" && (
<div className="space-y-4"><h2 className="text-lg font-semibold text-(--admin-text) flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-500" /> Student Feedback</h2>
  {feedbackList.length === 0 && <p className="text-sm text-(--admin-text-muted) text-center py-8 bg-(--admin-card) border border-(--admin-card-border) rounded-xl">No feedback submitted yet.</p>}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {feedbackList.map((fb) => (
      <div key={fb.id} className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-4 space-y-2 hover:border-(--admin-card-hover) transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">            {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-3.5 w-3.5 ${i < fb.rating ? "fill-amber-400 text-amber-400" : "text-(--admin-text-muted)"}`} />))}</div>
          <span className="text-xs text-(--admin-text-muted)">{new Date(fb.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
        <p className="text-sm text-(--admin-feedback-text)">{fb.message}</p>
        <div className="text-xs text-(--admin-text-muted)">{fb.student?.full_name ?? "Unknown"} ({fb.student?.email ?? "-"})</div>
      </div>
    ))}
  </div>
</div>
)}

{/* ============ ANNOUNCEMENTS ============ */}
{activeSection === "announcements" && (
<div className="space-y-6"><h2 className="text-lg font-semibold text-(--admin-text)">Announcements</h2>
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5 space-y-4 h-fit">
      <h3 className="text-sm font-semibold text-(--admin-text) flex items-center gap-2"><Megaphone className="h-4 w-4 text-blue-500" /> New Announcement</h3>
      <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
        <div><Label htmlFor="ann-title" className="text-(--admin-text-secondary)">Title</Label><Input id="ann-title" name="title" placeholder="Important update..." required className="bg-(--admin-input) border-(--admin-input-border) text-(--admin-text) placeholder-(--admin-input-placeholder)" /></div>
        <div><Label htmlFor="ann-body" className="text-(--admin-text-secondary)">Message</Label><Textarea id="ann-body" name="body" rows={4} placeholder="Details for students..." className="bg-(--admin-input) border-(--admin-input-border) text-(--admin-text) placeholder-(--admin-input-placeholder)" /></div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Publish</Button>
      </form>
    </div>
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-(--admin-text)">Posted Announcements</h3>
      {announcements.length === 0 && <p className="text-sm text-(--admin-text-muted) text-center py-6">No announcements yet</p>}
      {announcements.map((a) => (
        <div key={a.id} className="border border-(--admin-card-border) rounded-lg p-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0"><h5 className="text-(--admin-text) font-medium">{a.title}</h5>{a.body && <p className="text-sm text-(--admin-text-secondary) mt-1">{a.body}</p>}<p className="text-xs text-(--admin-text-muted) mt-2">{new Date(a.created_at).toLocaleDateString()}</p></div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => deleteAnnouncement(a.id)}><X className="h-3.5 w-3.5" /></Button>
        </div>
      ))}
    </div>
  </div>
</div>
)}

{/* ============ ENQUIRIES ============ */}
{activeSection === "enquiries" && (
<div className="space-y-6"><h2 className="text-lg font-semibold text-(--admin-text)">Enquiries</h2>
  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-(--admin-text) flex items-center gap-2"><Mail className="h-4 w-4 text-blue-500" /> All Enquiries ({enquiries.length})</h3>
      <div className="flex items-center gap-2">
        <span className="text-xs text-(--admin-text-muted)">{enquiries.filter(e => e.status === "new").length} unread</span>
      </div>
    </div>
    {enquiries.length === 0 && <p className="text-sm text-(--admin-text-muted) text-center py-8">No enquiries yet</p>}
    <div className="space-y-3">
      {enquiries.map((enq) => (
        <div key={enq.id} className={`border rounded-lg p-4 transition-colors ${enq.status === "new" ? "border-blue-500/30 bg-blue-500/5" : "border-(--admin-card-border)"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-(--admin-text) font-medium">{enq.name}</span>
                <span className="text-xs text-(--admin-text-muted) font-mono">{enq.email}</span>
                {enq.status === "new" && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">New</span>}
                {enq.status === "read" && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Read</span>}
                {enq.status === "archived" && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/15 text-gray-400 border border-gray-500/20">Archived</span>}
              </div>
              <p className="text-sm text-(--admin-text-secondary) mt-1 whitespace-pre-wrap">{enq.message}</p>
              <p className="text-xs text-(--admin-text-muted) mt-2">{new Date(enq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {enq.status === "new" && <Button size="sm" variant="outline" className="text-xs h-7 border-(--admin-input-border) text-(--admin-text-secondary) hover:text-(--admin-text)" onClick={() => updateEnquiryStatus(enq.id, "read")}>Mark Read</Button>}
              {enq.status !== "archived" && <Button size="sm" variant="ghost" className="text-xs h-7 text-(--admin-text-muted) hover:text-(--admin-text)" onClick={() => updateEnquiryStatus(enq.id, "archived")}>Archive</Button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
)}

{/* ============ ANALYTICS ============ */}
{activeSection === "analytics" && (
<div className="space-y-6"><h2 className="text-lg font-semibold text-(--admin-text)">Analytics Overview</h2>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5 space-y-3">
      <h4 className="text-sm font-medium text-(--admin-text-secondary) flex items-center gap-1"><BarChart3 className="h-4 w-4 text-blue-500"/> Application Funnel</h4>
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Registered Students:</span><span className="font-bold text-(--admin-text)">{profiles.length}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Total Internships:</span><span className="font-bold text-(--admin-text)">{internships.length}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Pending Approvals:</span><span className="font-bold text-amber-500">{pendingApps}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Active Interns:</span><span className="font-bold text-blue-500">{activeCount}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Completed:</span><span className="font-bold text-emerald-500">{completedCount}</span></div>
      </div>
    </div>
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5 space-y-3">
      <h4 className="text-sm font-medium text-(--admin-text-secondary) flex items-center gap-1"><CheckSquare className="h-4 w-4 text-blue-500"/> Task Submissions</h4>
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Total:</span><span className="font-bold text-(--admin-text)">{submissions.length}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Approved:</span><span className="font-bold text-emerald-500">{submissions.filter(s => s.status === "approved").length}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Pending Review:</span><span className="font-bold text-amber-500">{pendingSubs.length}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Rejected/Resubmit:</span><span className="font-bold text-red-500">{submissions.filter(s => s.status === "rejected" || s.status === "resubmit").length}</span></div>
      </div>
    </div>
    <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-5 space-y-3">
      <h4 className="text-sm font-medium text-(--admin-text-secondary) flex items-center gap-1"><Award className="h-4 w-4 text-blue-500"/> Certificates</h4>
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Issued:</span><span className="font-bold text-emerald-500">{certsIssued}</span></div>
        <div className="flex justify-between text-sm"><span className="text-(--admin-text-secondary)">Eligible (Not Issued):</span><span className="font-bold text-amber-500">{internships.filter(i => i.status === "completed" && !i.certificate_code).length}</span></div>
      </div>
    </div>
  </div>
</div>
)}

          </main>
        </div>
      </div>
    </div>
  );
}

function ReviewDialog({ onReview }: { onReview: (s: "approved" | "rejected" | "resubmit", fb: string) => void }) {
  const [open, setOpen] = useState(false);
  const [fb, setFb] = useState("");
  function go(status: "approved" | "rejected" | "resubmit") { onReview(status, fb); setOpen(false); setFb(""); }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Review</Button></DialogTrigger>
      <DialogContent className="bg-(--admin-dialog) border-(--admin-dialog-border)">
        <DialogHeader><DialogTitle className="text-(--admin-text)">Review submission</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-(--admin-text-secondary)">Feedback (optional)</Label><Textarea rows={3} value={fb} onChange={(e) => setFb(e.target.value)} className="bg-(--admin-input) border-(--admin-input-border) text-(--admin-text) placeholder-(--admin-input-placeholder)" /></div>
          <div className="flex gap-2">
            <Button onClick={() => go("approved")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
            <Button onClick={() => go("resubmit")} variant="outline" className="flex-1 border-(--admin-input-border) text-(--admin-text-secondary)">Resubmit</Button>
            <Button onClick={() => go("rejected")} variant="destructive" className="flex-1">Reject</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
