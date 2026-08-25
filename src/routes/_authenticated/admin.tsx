import { useEffect, useState, useMemo } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Award, Loader2, Github, ExternalLink, FolderOpen, FileText, BarChart3, CheckSquare, Briefcase, Settings, Plus, Edit3, Trash2, Eye, RotateCw, Search, X, MailPlus, Download, Megaphone, MessageSquare, Star, Linkedin } from "lucide-react";
import { getTasksForSlug } from "@/lib/tasks";
import { COMPANY } from "@/lib/company";

// PDF + email functions are lazy-loaded to avoid pulling jspdf (~300KB) into the admin bundle.
type PdfModule = typeof import("@/lib/pdf");
let _pdfMod: PdfModule | null = null;
async function getPdf(): Promise<PdfModule> {
  if (!_pdfMod) _pdfMod = await import("@/lib/pdf");
  return _pdfMod;
}
type EmailModule = typeof import("@/routes/-email.serverfn");
let _emailMod: EmailModule | null = null;
async function getEmail(): Promise<EmailModule> {
  if (!_emailMod) _emailMod = await import("@/routes/-email.serverfn");
  return _emailMod;
}

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const ctx = context as { isAdmin?: boolean };
    if (!ctx.isAdmin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminPage
});

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

  async function safeQuery<T = any>(label: string, builder: { then: Function }): Promise<T[]> {
    try {
      const { data, error } = await builder as any;
      if (error) {
        console.error(`[admin] ${label} query error:`, error);
        return [];
      }
      return (data ?? []) as T[];
    } catch (err: any) {
      console.error(`[admin] ${label} query threw:`, err);
      return [];
    }
  }

  async function reload() {
    const db = supabase as any;
    const [p, rawInterns, rawSubs, proj, rawPs, d, enq, ann, rawFb] = await Promise.all([
      safeQuery("profiles", supabase.from("profiles").select("id, user_id, full_name, email, phone, college, department, year, avatar_url, created_at").order("created_at", { ascending: false })),
      safeQuery("internships", supabase.from("internships").select("id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, offer_letter_email_sent, offer_letter_email_sent_at, offer_letter_email_error, offer_letter_resend_message_id, certificate_code, certificate_issued_at, certificate_email_sent, certificate_email_sent_at, certificate_email_error, certificate_resend_message_id, progress_percent, completed_at, domain:domains(name,slug)").order("created_at", { ascending: false })),
      safeQuery("submissions", db.from("submissions").select("id, internship_id, task_no, status, project_url, github_url, drive_url, notes, feedback, submitted_at, reviewed_at").order("submitted_at", { ascending: false })),
      safeQuery("projects", db.from("projects").select("id, title, description, github_url, demo_url, created_at, project_domains(domain_id, domain:domains(name))").order("created_at", { ascending: false })),
      safeQuery("project_submissions", db.from("project_submissions").select("id, project_id, student_id, github_url, demo_url, notes, status, submitted_at, reviewed_at, project:projects(title)").order("submitted_at", { ascending: false })),
      safeQuery("domains", supabase.from("domains").select("id, name, slug, active").eq("active", true)),
      safeQuery("enquiries", db.from("enquiries").select("id, name, email, phone, subject, message, status, created_at").order("created_at", { ascending: false })),
      safeQuery("announcements", db.from("announcements").select("id, title, body, priority, created_at").order("created_at", { ascending: false })),
      safeQuery("feedback", db.from("feedback").select("id, user_id, rating, message, created_at").order("created_at", { ascending: false })),
    ]);

    const studentMap = new Map<string, any>();
    for (const profile of p) {
      studentMap.set(profile.id, profile);
    }

    const i = rawInterns.map((intern: any) => ({
      ...intern,
      student: studentMap.get(intern.student_id) ?? null,
    }));

    const ps = rawPs.map((sub: any) => ({
      ...sub,
      student: studentMap.get(sub.student_id) ?? sub.student ?? null,
    }));

    const fb = rawFb.map((f: any) => ({
      ...f,
      student: studentMap.get(f.user_id) ?? null,
    }));

    setProfiles(p);
    setInternships(i);
    setProjects(proj);
    setProjectSubmissions(ps);
    setDomains(d);
    setEnquiries(enq);
    setAnnouncements(ann);
    setFeedbackList(fb);
    const internshipMap = new Map<string, any>();
    for (const int of i) {
      internshipMap.set(int.id, int);
    }
    const enrichedSubs = rawSubs.map((sub: any) => {
      const internship = internshipMap.get(sub.internship_id) ?? null;
      return { ...sub, internship };
    });
    setSubmissions(enrichedSubs);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || !mounted) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      const admin = (roles ?? []).some((r: any) => r.role === "admin");
      if (!mounted) return;
      setIsAdmin(admin);
      setChecking(false);
      if (admin) await reload();
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-refresh every 60s once admin is confirmed
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => { reload(); }, 60000);
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
    for (const internship of internships) {
      map.set(internship.student_id, internship);
    }
    return map;
  }, [internships]);

  const approvedCountByStudent = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of submissions) {
      if (sub.status !== "approved") continue;
      const internship = internshipByStudent.get(sub.internship_id);
      if (internship?.student_id) {
        map.set(internship.student_id, (map.get(internship.student_id) ?? 0) + 1);
      }
    }
    return map;
  }, [submissions, internshipByStudent]);

  const enrichedStudents = useMemo(() => {
    function resolveDomainName(internship: any): string {
      if (internship?.domain?.name) return internship.domain.name;
      if (internship?.domain_id) {
        const dom = domains.find((d) => d.id === internship.domain_id);
        if (dom) return dom.name;
      }
      return "";
    }

    const internshipByStudent = new Map<string, any>();
    for (const internship of internships) {
      internshipByStudent.set(internship.student_id, internship);
    }

    let list = profiles.map((profile) => {
      const internship = internshipByStudent.get(profile.id) ?? null;
      const domainName = resolveDomainName(internship);
      return { ...profile, internship, resolvedDomain: domainName };
    });

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) =>
        (s.full_name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.college ?? "").toLowerCase().includes(q) ||
        (s.internship?.internship_code ?? "").toLowerCase().includes(q) ||
        (s.internship?.domain?.name ?? "").toLowerCase().includes(q) ||
        (s.resolvedDomain ?? "").toLowerCase().includes(q)
      );
    }

    // Domain filter
    if (filterDomain !== "all") {
      list = list.filter((s) => s.internship?.domain_id === filterDomain);
    }

    // Status filter
    if (filterStatus !== "all") {
      list = list.filter((s) => (s.internship?.status ?? "none") === filterStatus);
    }

    // Duration filter
    if (filterDuration !== "all") {
      list = list.filter((s) => (s.internship?.duration ?? "") === filterDuration);
    }

    return list;
  }, [profiles, internships, domains, searchTerm, filterDomain, filterStatus, filterDuration]);

  async function issueCertificate(internshipId: string) {
    const code = "YRNT-CERT-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const now = new Date().toISOString();
    const { error } = await (supabase as any).from("internships").update({
      certificate_code: code,
      certificate_issued_at: now,
    }).eq("id", internshipId);
    if (error) {
      console.error("[admin] issueCertificate error:", error);
      return toast.error("Failed to issue certificate: " + error.message);
    }
    toast.success("Certificate issued: " + code);
    // Auto-send certificate email
    const intern = internships.find((i) => i.id === internshipId);
    if (intern?.student?.email) {
      toast.info("Sending certificate email...");
      try {
        const emailResult = await (await getEmail()).sendCertificateEmail({
          data: {
            internshipId,
            email: intern.student.email,
            fullName: intern.student.full_name ?? "Intern",
            domain: intern.domain?.name ?? "",
            duration: intern.duration ?? "1 Month",
            internshipCode: intern.internship_code,
            certificateCode: code,
            issuedAt: now,
          },
        });
        if (emailResult?.error) {
          toast.error("Email delivery failed: " + emailResult.error);
        } else {
          toast.success("Certificate emailed to " + intern.student.email);
        }
      } catch (emailErr: any) {
        toast.error("Email delivery failed: " + (emailErr?.message ?? "Unknown error"));
      }
    }
    reload();
  }

  async function handleSendOfferLetterEmail(intern: any) {
    if (!intern.student?.email) return toast.error("No email found for this intern");
    setSendingEmail(`ol-${intern.id}`);
    try {
      const result = await (await getEmail()).sendOfferLetterEmail({
        data: {
          internshipId: intern.id,
          email: intern.student.email,
          fullName: intern.student.full_name ?? "Intern",
          domain: intern.domain?.name ?? "",
          duration: intern.duration ?? "1 Month",
          internshipCode: intern.internship_code,
          offerCode: intern.offer_letter_code,
          startedAt: intern.started_at,
        },
      });
      if (result?.error) {
        toast.error("Email failed: " + result.error);
      } else {
        toast.success("Offer letter emailed successfully");
        reload();
      }
    } catch (err: any) {
      toast.error("Email failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setSendingEmail(null);
    }
  }

  async function handleSendCertificateEmail(intern: any) {
    if (!intern.student?.email) return toast.error("No email found for this intern");
    setSendingEmail(`cert-${intern.id}`);
    try {
      const result = await (await getEmail()).sendCertificateEmail({
        data: {
          internshipId: intern.id,
          email: intern.student.email,
          fullName: intern.student.full_name ?? "Intern",
          domain: intern.domain?.name ?? "",
          duration: intern.duration ?? "1 Month",
          internshipCode: intern.internship_code,
          certificateCode: intern.certificate_code,
          issuedAt: intern.certificate_issued_at,
        },
      });
      if (result?.error) {
        toast.error("Email failed: " + result.error);
      } else {
        toast.success("Certificate emailed successfully");
        reload();
      }
    } catch (err: any) {
      toast.error("Email failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setSendingEmail(null);
    }
  }

  async function removeStudent(studentId: string) {
    if (!confirm("Permanently delete this student and all their data?")) return;
    const db = supabase as any;
    const { data: interns } = await db.from("internships").select("id").eq("student_id", studentId);
    for (const i of (interns ?? [])) {
      await db.from("submissions").delete().eq("internship_id", i.id);
    }
    await db.from("internships").delete().eq("student_id", studentId);
    const { error } = await db.from("profiles").delete().eq("id", studentId);
    if (error) return toast.error(error.message);
    toast.success("Student removed");
    reload();
  }

  async function updateStatus(id: string, status: string) {
    const patch: any = { status };
    if (status === "completed") { patch.completed_at = new Date().toISOString(); patch.progress_percent = 100; }
    const { data: updatedData, error } = await (supabase as any)
      .from("internships")
      .update(patch)
      .eq("id", id)
      .select("*, domain:domains(name,slug)")
      .single();
    if (error) {
      console.error("[admin] updateStatus error:", error);
      return toast.error("Failed to update: " + error.message);
    }
    if (status === "active") {
      const ud: any = updatedData;
      const studentProfile = profiles.find((p) => p.id === ud.student_id);
      // Store PDF in Supabase Storage (non-blocking for email)
      try {
        toast.info("Generating and storing offer letter...");
        const { uploadOfferLetterToStorage } = await import("@/lib/pdf");
        await uploadOfferLetterToStorage({
          studentId: ud.student_id,
          fullName: studentProfile?.full_name ?? "Intern",
          domain: ud.domain?.name ?? "",
          domainSlug: ud.domain?.slug,
          internshipCode: ud.internship_code,
          offerCode: ud.offer_letter_code,
          startedAt: ud.started_at,
          duration: ud.duration,
        });
        toast.success("Offer letter PDF stored in Supabase Storage");
      } catch (err: any) {
        toast.error("Failed to store Offer Letter PDF: " + err.message);
      }
      // Send email (independent of storage result)
      if (studentProfile?.email) {
        toast.info("Sending offer letter email...");
        try {
          const emailResult = await (await getEmail()).sendOfferLetterEmail({
            data: {
              internshipId: id,
              email: studentProfile.email,
              fullName: studentProfile.full_name ?? "Intern",
              domain: ud.domain?.name ?? "",
              duration: ud.duration ?? "1 Month",
              internshipCode: ud.internship_code,
              offerCode: ud.offer_letter_code,
              startedAt: ud.started_at,
            },
          });
          if (emailResult?.error) {
            toast.error("Email delivery failed: " + emailResult.error);
          } else {
            toast.success("Offer letter emailed to " + studentProfile.email);
          }
        } catch (emailErr: any) {
          toast.error("Email delivery failed: " + (emailErr?.message ?? "Unknown error"));
        }
      } else {
        toast.warning("No email address found — offer letter not emailed");
      }
    }
    toast.success(status === "active" ? "Approved — offer letter issued" : "Updated");
    reload();
  }

  async function reviewSubmission(id: string, status: "approved" | "rejected" | "resubmit", feedback: string) {
    const { error } = await (supabase as any).from("submissions").update({
      status, feedback: feedback || null, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      console.error("[admin] reviewSubmission error:", error);
      return toast.error("Failed to review: " + error.message);
    }
    toast.success("Reviewed");
    reload();
  }

  async function handleProjectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = fd.get("description") as string;
    const difficulty = fd.get("difficulty") as string;
    const deadline = fd.get("deadline") as string;
    const fileUrl = fd.get("file_url") as string;
    const selectedDomains = JSON.parse(fd.get("domain_ids") as string || "[]") as string[];

    if (!title?.trim()) return toast.error("Title is required");
    if (selectedDomains.length === 0) return toast.error("Select at least one domain");

    const { data: proj, error } = await (supabase as any).from("projects").insert({
      title: title.trim(),
      description: description?.trim() || "",
      difficulty,
      deadline: deadline || null,
      file_url: fileUrl || null,
    }).select().single();

    if (error) return toast.error(error.message);

    const { error: de } = await (supabase as any).from("project_domains").insert(
      selectedDomains.map((did) => ({ project_id: proj.id, domain_id: did }))
    );
    if (de) { toast.error("Project created but domain assignment failed: " + de.message); } else { toast.success("Project created"); }
    reload();
    (document.getElementById("proj-form") as HTMLFormElement)?.reset();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const { error } = await (supabase as any).from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    reload();
  }

  async function updateProject(id: string, fields: any) {
    const { error } = await (supabase as any).from("projects").update(fields).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project updated");
    reload();
  }

  async function reviewProjectSubmission(id: string, status: "approved" | "rejected", feedback: string) {
    const { error } = await (supabase as any).from("project_submissions").update({
      status, feedback: feedback || null, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Submission " + status);
    reload();
  }

  async function handleAnnouncementSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const body = (fd.get("body") as string)?.trim() || "";
    if (!title) return toast.error("Title is required");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({
      title,
      body,
      created_by: u.user?.id ?? null,
      active: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Announcement published");
    (e.currentTarget as HTMLFormElement).reset();
    reload();
  }

  async function deleteAnnouncement(id: string) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Announcement deleted");
    reload();
  }

  async function updateEnquiryStatus(id: string, status: string) {
    const { error } = await supabase.from("enquiries").update({
      status, read_at: status === "read" ? new Date().toISOString() : null,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  function exportStudentsCSV() {
    const rows = enrichedStudents.map((s) => ({
      name: s.full_name ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      college: s.college ?? "",
      department: s.department ?? "",
      year: s.year ?? "",
      internship_id: s.internship?.internship_code ?? "",
      domain: s.internship?.domain?.name ?? "",
      duration: s.internship?.duration ?? "",
      status: s.internship?.status ?? "no-app",
      registered: s.created_at ? new Date(s.created_at).toISOString() : "",
      linkedin: s.linkedin_url ?? "",
      github: s.github_url ?? "",
    }));
    const cols = ["name","email","phone","college","department","year","internship_id","domain","duration","status","registered","linkedin","github"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as any)[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `YR-NOVATECH-students-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (checking) return <div className="container mx-auto py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!isAdmin) return null;

  const pendingSubs = submissions.filter((s) => s.status === "pending" || s.status === "resubmit");
  const activeCount = internships.filter((i) => i.status === "active").length;
  const completedCount = internships.filter((i) => i.status === "completed").length;
  const pendingApps = internships.filter((i) => i.status === "pending").length;
  const pendingProjectSubs = projectSubmissions.filter((s) => s.status === "pending");

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage YR NOVATECH applications, projects, tasks, and credentials.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Stat icon={Users} label="Total Students" value={profiles.length} />
        <Stat icon={BookOpen} label="Active Interns" value={activeCount} />
        <Stat icon={Award} label="Completed" value={completedCount} />
        <Stat icon={FileText} label="Pending Reviews" value={pendingSubs.length} />
        <Stat icon={FolderOpen} label="Projects" value={projects.length} />
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full h-auto p-1 bg-muted rounded-lg">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="applications">Apps ({pendingApps})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({pendingSubs.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="project-subs">P.Subs ({pendingProjectSubs.length})</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="certificates">Certs</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiries ({enquiries.filter((e) => e.status === "new").length})</TabsTrigger>
          <TabsTrigger value="announcements">Announce ({announcements.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedbackList.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Tab 1: Students */}
        <TabsContent value="students">
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold">Student Directory ({enrichedStudents.length})</h3>
              <Button size="sm" variant="outline" onClick={() => reload()} className="ml-auto"><RotateCw className="h-3 w-3 mr-1" /> Refresh</Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, ID, college, domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-8"
                />
                {searchTerm && (
                  <X className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setSearchTerm("")} />
                )}
              </div>
              <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All Domains</option>
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All Durations</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Internship ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedStudents.map((s) => {
                    const i = s.internship;
                    const taskApproved = approvedCountByStudent.get(s.id) ?? 0;
                    const taskTotal = i?.duration === "1 Month" ? 3 : i?.duration === "2 Months" ? 4 : i?.duration === "3 Months" ? 5 : 0;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{s.full_name ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{i?.internship_code ?? "—"}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{s.email}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{s.phone ?? "—"}</TableCell>
                        <TableCell className="text-xs max-w-[130px] truncate">{s.college ?? "—"}</TableCell>
                        <TableCell className="text-xs">{s.department ?? "—"}</TableCell>
                        <TableCell className="text-xs">{s.year ?? "—"}</TableCell>
                        <TableCell className="text-xs">{s.resolvedDomain || <span className="text-muted-foreground italic">Domain not assigned</span>}</TableCell>
                        <TableCell className="text-xs">{i?.duration ?? "—"}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          {i ? (
                            <Badge variant={i.status === "active" ? "default" : i.status === "pending" ? "secondary" : i.status === "completed" ? "outline" : "destructive"}>
                              {i.status}
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">No app</span>}
                        </TableCell>
                        <TableCell>
                          {i?.offer_letter_code ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="default" className="bg-emerald-600">Issued</Badge>
                              {i.offer_letter_email_sent && <span title="Emailed"><MailPlus className="h-3 w-3 text-emerald-600" /></span>}
                            </div>
                          ) : i?.status === "active" ? <Badge variant="outline">Pending</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs">{i ? `${taskApproved}/${taskTotal}` : "—"}</TableCell>
                        <TableCell>
                          {i?.certificate_code ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="default" className="bg-emerald-600">Issued</Badge>
                              {i.certificate_email_sent && <span title="Emailed"><MailPlus className="h-3 w-3 text-emerald-600" /></span>}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-nowrap">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-2" title="View Profile"><Eye className="h-3 w-3" /></Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>{s.full_name ?? "Student"}</DialogTitle></DialogHeader>
                                <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto">
                                  {s.avatar_url && (
                                    <div className="flex justify-center">
                                      <img src={s.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                                    </div>
                                  )}
                                  <div className="border rounded-lg p-3 space-y-2">
                                    <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wide">Personal Information</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><span className="text-muted-foreground">Full Name:</span> {s.full_name ?? "—"}</div>
                                      <div><span className="text-muted-foreground">Email:</span> {s.email}</div>
                                      <div><span className="text-muted-foreground">Phone:</span> {s.phone ?? "—"}</div>
                                      <div><span className="text-muted-foreground">Year:</span> {s.year ?? "—"}</div>
                                    </div>
                                  </div>
                                  <div className="border rounded-lg p-3 space-y-2">
                                    <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wide">Academic Details</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><span className="text-muted-foreground">College:</span> {s.college ?? "—"}</div>
                                      <div><span className="text-muted-foreground">Department:</span> {s.department ?? "—"}</div>
                                    </div>
                                  </div>
                                  <div className="border rounded-lg p-3 space-y-2">
                                    <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wide">Internship Details</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><span className="text-muted-foreground">Internship ID:</span> <span className="font-mono">{i?.internship_code ?? "—"}</span></div>
                                      <div><span className="text-muted-foreground">Domain:</span> {s.resolvedDomain || <span className="text-muted-foreground italic">Domain not assigned</span>}</div>
                                      <div><span className="text-muted-foreground">Duration:</span> {i?.duration ?? "—"}</div>
                                      <div><span className="text-muted-foreground">Status:</span> {i ? <Badge variant={i.status === "active" ? "default" : i.status === "completed" ? "outline" : "secondary"} className="ml-1">{i.status}</Badge> : "—"}</div>
                                      <div><span className="text-muted-foreground">Start Date:</span> {i?.started_at ? new Date(i.started_at).toLocaleDateString() : "—"}</div>
                                      <div><span className="text-muted-foreground">End Date:</span> {i?.completed_at ? new Date(i.completed_at).toLocaleDateString() : "—"}</div>
                                      <div><span className="text-muted-foreground">Registered:</span> {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</div>
                                      <div><span className="text-muted-foreground">Progress:</span> {taskApproved} / {taskTotal} tasks approved</div>
                                    </div>
                                  </div>
                                  <div className="border rounded-lg p-3 space-y-2">
                                    <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wide">Credentials</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><span className="text-muted-foreground">Offer Letter:</span> {i?.offer_letter_code ? <span className="font-mono">{i.offer_letter_code}</span> : "Not issued"}</div>
                                      <div><span className="text-muted-foreground">Certificate:</span> {i?.certificate_code ? <span className="font-mono">{i.certificate_code}</span> : "Not issued"}</div>
                                    </div>
                                    {(i?.offer_letter_email_sent !== undefined || i?.certificate_email_sent !== undefined) && (
                                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                                        <div><span className="text-muted-foreground">OL Email:</span> {i?.offer_letter_email_sent ? <Badge variant="default" className="bg-emerald-600 text-xs">Sent</Badge> : <Badge variant="outline" className="text-xs">Not Sent</Badge>}</div>
                                        <div><span className="text-muted-foreground">Cert Email:</span> {i?.certificate_email_sent ? <Badge variant="default" className="bg-emerald-600 text-xs">Sent</Badge> : <Badge variant="outline" className="text-xs">Not Sent</Badge>}</div>
                                      </div>
                                    )}
                                  </div>
                                  {(s.github_url || s.linkedin_url) && (
                                    <div className="border rounded-lg p-3 space-y-2">
                                      <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wide">Links</h4>
                                      {s.github_url && <div><span className="text-muted-foreground">GitHub:</span> <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{s.github_url}</a></div>}
                                      {s.linkedin_url && <div><span className="text-muted-foreground">LinkedIn:</span> <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{s.linkedin_url}</a></div>}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            {i?.status === "pending" && (
                              <>
                                <Button size="sm" className="h-7 px-2" onClick={() => updateStatus(i.id, "active")}>Approve</Button>
                                <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => updateStatus(i.id, "rejected")}>Reject</Button>
                              </>
                            )}
                            {i?.status === "active" && (
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => {
                                  getPdf().then((m) => m.downloadIdCard({
                                  fullName: s.full_name ?? "Intern",
                                  internshipCode: i.internship_code ?? "",
                                  domain: s.resolvedDomain || (i.domain?.name ?? ""),
                                  photoDataUrl: s.avatar_url,
                                  email: s.email,
                                  duration: i.duration,
                                }));
                              }} title="Download ID Card">ID Card</Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-destructive" onClick={() => removeStudent(s.id)} title="Remove Student"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {enrichedStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center text-muted-foreground py-6">No students registered yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Applications */}
        <TabsContent value="applications">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Internship Applications</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Domain & Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.internship_code}</TableCell>
                      <TableCell>
                        <div className="font-medium">{i.student?.full_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{i.student?.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{i.domain?.name}</div>
                        <div className="text-xs text-muted-foreground">{i.duration}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={i.status === "active" ? "default" : i.status === "pending" ? "secondary" : i.status === "completed" ? "outline" : "destructive"}>
                          {i.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1 whitespace-nowrap">
                        {i.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(i.id, "active")}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(i.id, "rejected")}>Reject</Button>
                          </>
                        )}
                        {i.status !== "pending" && <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {internships.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No applications yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Tasks */}
        <TabsContent value="tasks">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Student Task Submissions</h3>
            {submissions.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No submissions yet</p>}
            {submissions.map((s) => {
              const tasks = getTasksForSlug(s.internship?.domain?.slug);
              const taskMeta = tasks.find((t) => t.no === s.task_no);
              return (
                <div key={s.id} className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{s.internship?.internship_code} · Task {s.task_no}</span>
                        <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"}>{s.status}</Badge>
                      </div>
                      <div className="font-semibold mt-1">{taskMeta?.title ?? `Task ${s.task_no}`}</div>
                      <div className="text-xs text-muted-foreground">{s.internship?.student?.full_name} · {s.internship?.domain?.name}</div>
                      <div className="flex gap-3 mt-2 text-xs flex-wrap">
                        {s.task_no === 1 && s.project_url && <a href={s.project_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1"><Linkedin className="h-3 w-3"/>LinkedIn</a>}
                        {s.github_url && <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1"><Github className="h-3 w-3"/>GitHub</a>}
                        {s.task_no !== 1 && s.project_url && <a href={s.project_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3"/>Project</a>}
                        {s.drive_url && <a href={s.drive_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1"><FolderOpen className="h-3 w-3"/>Drive</a>}
                      </div>
                      {s.notes && <p className="text-xs mt-2 text-muted-foreground">{s.notes}</p>}
                      {s.feedback && <p className="text-xs mt-2 p-2 bg-accent rounded"><b>Feedback:</b> {s.feedback}</p>}
                    </div>
                    <ReviewDialog onReview={(status, fb) => reviewSubmission(s.id, status, fb)} />
                  </div>
                </div>
              );
            })}
          </Card>
        </TabsContent>

        {/* Tab 4: Projects */}
        <TabsContent value="projects">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Management</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Project</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
                  <form id="proj-form" onSubmit={handleProjectSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="proj-title">Project Title</Label>
                      <Input id="proj-title" name="title" required />
                    </div>
                    <div>
                      <Label htmlFor="proj-desc">Description</Label>
                      <Textarea id="proj-desc" name="description" rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="proj-diff">Difficulty</Label>
                      <select id="proj-diff" name="difficulty" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate" selected>Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="proj-deadline">Deadline (optional)</Label>
                      <Input id="proj-deadline" name="deadline" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="proj-file">File URL (optional)</Label>
                      <Input id="proj-file" name="file_url" placeholder="https://example.com/project-file.pdf" />
                    </div>
                    <div>
                      <Label>Assign to Domains</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {domains.map((d) => (
                          <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" value={d.id} className="rounded" onChange={(e) => {
                              const checkboxes = document.querySelectorAll<HTMLInputElement>('[data-domain-checkbox]');
                              const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
                              const hidden = document.getElementById("domain-ids-hidden") as HTMLInputElement;
                              if (hidden) hidden.value = JSON.stringify(selected);
                            }} data-domain-checkbox />
                            {d.name}
                          </label>
                        ))}
                      </div>
                      <input type="hidden" id="domain-ids-hidden" name="domain_ids" value="[]" />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">Create Project</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((proj) => (
                <Card key={proj.id} className="p-4 border space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{proj.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{proj.description || "No description"}</p>
                    </div>
                    <Badge variant={proj.difficulty === "Beginner" ? "secondary" : proj.difficulty === "Advanced" ? "destructive" : "default"}>
                      {proj.difficulty}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proj.project_domains?.map((pd: any) => (
                      <Badge key={pd.domain_id} variant="outline" className="text-xs">{pd.domain?.name ?? pd.domain_id}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{proj.deadline ? `Due: ${new Date(proj.deadline).toLocaleDateString()}` : "No deadline"}</span>
                    <span>{proj.active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <EditProjectDialog project={proj} domains={domains} onSaved={reload} />
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => deleteProject(proj.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-6">No projects yet. Click "New Project" to create one.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 5: Project Submissions */}
        <TabsContent value="project-subs">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Project Submissions</h3>
            {projectSubmissions.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No project submissions yet</p>}
            {projectSubmissions.map((ps) => (
              <div key={ps.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{ps.project?.title}</span>
                      <Badge variant={ps.status === "approved" ? "default" : ps.status === "rejected" ? "destructive" : "secondary"}>{ps.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{ps.student?.full_name} · {ps.student?.email}</div>
                    {ps.github_url && <a href={ps.github_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs inline-flex items-center gap-1 mt-1"><Github className="h-3 w-3" />GitHub</a>}
                    {ps.notes && <p className="text-xs mt-2 text-muted-foreground">{ps.notes}</p>}
                    {ps.feedback && <p className="text-xs mt-2 p-2 bg-accent rounded"><b>Feedback:</b> {ps.feedback}</p>}
                  </div>
                  {ps.status === "pending" && (
                    <ReviewDialog onReview={(status, fb) => reviewProjectSubmission(ps.id, status as any, fb)} />
                  )}
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Tab 6: Offer Letters */}
        <TabsContent value="offers">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Offer Letters</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intern ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Offer Code</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.filter(i => i.status === "active" || i.status === "completed").map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.internship_code}</TableCell>
                      <TableCell className="font-medium">{i.student?.full_name}</TableCell>
                      <TableCell>{i.domain?.name}</TableCell>
                      <TableCell className="font-mono text-xs">{i.offer_letter_code ?? "—"}</TableCell>
                      <TableCell>
                        {i.offer_letter_email_sent ? (
                          <div className="text-xs">
                            <Badge variant="default" className="bg-emerald-600">Sent</Badge>
                            {i.offer_letter_email_sent_at && (
                              <div className="text-muted-foreground mt-1">{new Date(i.offer_letter_email_sent_at).toLocaleString()}</div>
                            )}
                            {i.offer_letter_resend_message_id && (
                              <div className="text-muted-foreground mt-0.5 font-mono text-[10px]" title={`Resend ID: ${i.offer_letter_resend_message_id}`}>ID: {i.offer_letter_resend_message_id.slice(0, 12)}…</div>
                            )}
                          </div>
                        ) : i.offer_letter_email_error ? (
                          <div className="text-xs">
                            <Badge variant="destructive">Failed</Badge>
                            <div className="text-destructive mt-1 max-w-[160px] leading-tight" title={i.offer_letter_email_error}>{i.offer_letter_email_error.length > 60 ? i.offer_letter_email_error.slice(0, 60) + "…" : i.offer_letter_email_error}</div>
                          </div>
                        ) : (
                          <Badge variant="outline">Not Sent</Badge>
                        )}
                      </TableCell>
                      <TableCell className="space-x-1 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => getPdf().then(m => m.viewOfferLetterFromStorage(i.student_id))}>View</Button>
                        <Button size="sm" onClick={() => getPdf().then(m => m.downloadOfferLetterAnywhere({
                          studentId: i.student_id,
                          fullName: i.student?.full_name ?? "Intern",
                          domain: i.domain?.name ?? "",
                          domainSlug: i.domain?.slug,
                          internshipCode: i.internship_code,
                          offerCode: i.offer_letter_code,
                          startedAt: i.started_at,
                          duration: i.duration,
                        }))}>Download</Button>
                        <Button
                          size="sm"
                          variant={i.offer_letter_email_sent ? "outline" : "default"}
                          disabled={sendingEmail === `ol-${i.id}`}
                          onClick={() => handleSendOfferLetterEmail(i)}
                        >
                          {sendingEmail === `ol-${i.id}` ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending...</>
                          ) : i.offer_letter_email_sent ? (
                            <><RotateCw className="h-3 w-3 mr-1" />Resend</>
                          ) : (
                            <><MailPlus className="h-3 w-3 mr-1" />Send</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {internships.filter(i => i.status === "active" || i.status === "completed").length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No issued offer letters yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 7: Certificates */}
        <TabsContent value="certificates">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Issued Certificates</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Intern ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Certificate Code</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internships.filter(i => i.certificate_code).map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-mono text-xs">{i.internship_code}</TableCell>
                        <TableCell className="font-medium">{i.student?.full_name}</TableCell>
                        <TableCell>{i.domain?.name}</TableCell>
                        <TableCell className="text-xs">{i.duration}</TableCell>
                        <TableCell className="font-mono text-xs">{i.certificate_code}</TableCell>
                        <TableCell className="text-xs">{i.certificate_issued_at ? new Date(i.certificate_issued_at).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          {i.certificate_email_sent ? (
                            <div className="text-xs">
                              <Badge variant="default" className="bg-emerald-600">Sent</Badge>
                              {i.certificate_email_sent_at && (
                                <div className="text-muted-foreground mt-1">{new Date(i.certificate_email_sent_at).toLocaleString()}</div>
                              )}
                              {i.certificate_resend_message_id && (
                                <div className="text-muted-foreground mt-0.5 font-mono text-[10px]" title={`Resend ID: ${i.certificate_resend_message_id}`}>ID: {i.certificate_resend_message_id.slice(0, 12)}…</div>
                              )}
                            </div>
                          ) : i.certificate_email_error ? (
                            <div className="text-xs">
                              <Badge variant="destructive">Failed</Badge>
                              <div className="text-destructive mt-1 max-w-[160px] leading-tight" title={i.certificate_email_error}>{i.certificate_email_error.length > 60 ? i.certificate_email_error.slice(0, 60) + "…" : i.certificate_email_error}</div>
                            </div>
                          ) : (
                            <Badge variant="outline">Not Sent</Badge>
                          )}
                        </TableCell>
                        <TableCell className="space-x-1 whitespace-nowrap">
                          <Button size="sm" onClick={() => getPdf().then(m => m.downloadCertificate({ fullName: i.student?.full_name ?? "Intern", domain: i.domain?.name ?? "", internshipCode: i.internship_code, certificateCode: i.certificate_code, issuedAt: i.certificate_issued_at, duration: i.duration }))}>
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant={i.certificate_email_sent ? "outline" : "default"}
                            disabled={sendingEmail === `cert-${i.id}`}
                            onClick={() => handleSendCertificateEmail(i)}
                          >
                            {sendingEmail === `cert-${i.id}` ? (
                              <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending...</>
                            ) : i.certificate_email_sent ? (
                              <><RotateCw className="h-3 w-3 mr-1" />Resend</>
                            ) : (
                              <><MailPlus className="h-3 w-3 mr-1" />Send</>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {internships.filter(i => i.certificate_code).length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No certificates issued yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {internships.filter(i => i.status === "completed" && !i.certificate_code).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Eligible for Certificate</h3>
                <p className="text-sm text-muted-foreground mb-3">These interns have completed all tasks and are eligible for certificate issuance.</p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Intern ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Task Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {internships.filter(i => i.status === "completed" && !i.certificate_code).map((i) => {
                        const approved = approvedCountByInternship.get(i.id) ?? 0;
                        const total = i.duration === "1 Month" ? 3 : i.duration === "2 Months" ? 4 : 5;
                        return (
                        <TableRow key={i.id}>
                          <TableCell className="font-mono text-xs">{i.internship_code}</TableCell>
                          <TableCell className="font-medium">{i.student?.full_name}</TableCell>
                          <TableCell>{i.domain?.name}</TableCell>
                          <TableCell className="text-xs">{i.duration}</TableCell>
                          <TableCell className="text-xs">{approved} / {total} approved</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => issueCertificate(i.id)}>
                              <Award className="h-3 w-3 mr-1" /> Issue Certificate
                            </Button>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 8: Enquiries */}
        <TabsContent value="enquiries">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2"><MailPlus className="h-5 w-5 text-blue-600" /> Enquiries</h3>
              <Button size="sm" variant="outline" onClick={() => {
                const csv = ["name,email,message,created_at,status"].concat(
                  enquiries.map(e => `"${(e.name||"").replace(/"/g,'""')}","${(e.email||"").replace(/"/g,'""')}","${(e.message||"").replace(/"/g,'""')}","${e.created_at}","${e.status}"`)
                ).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `YR-NOVATECH-enquiries-${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
              }}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>
            {enquiries.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No enquiries yet</p>}
            {enquiries.map((enq) => (
              <div key={enq.id} className={`border rounded-lg p-4 ${enq.status === "new" ? "bg-accent/40" : "bg-card"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{enq.name}</span>
                      <Badge variant={enq.status === "new" ? "default" : enq.status === "read" ? "secondary" : "outline"}>{enq.status}</Badge>
                    </div>
                    <a href={`mailto:${enq.email}`} className="text-primary underline text-xs">{enq.email}</a>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{enq.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(enq.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {enq.status !== "read" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateEnquiryStatus(enq.id, "read")}>
                        Mark Read
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateEnquiryStatus(enq.id, "archived")}>
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Tab 9: Announcements */}
        <TabsContent value="announcements">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 space-y-4 h-fit">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Megaphone className="h-5 w-5 text-blue-600" /> New Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ann-title">Title</Label>
                  <Input id="ann-title" name="title" placeholder="Important update..." required />
                </div>
                <div>
                  <Label htmlFor="ann-body">Message</Label>
                  <Textarea id="ann-body" name="body" rows={4} placeholder="Details for students..." />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">Publish</Button>
              </form>
            </Card>
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Posted Announcements</h3>
              {announcements.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No announcements yet</p>}
              {announcements.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold">{a.title}</h5>
                    {a.body && <p className="text-sm text-muted-foreground mt-1">{a.body}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive" onClick={() => deleteAnnouncement(a.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </Card>
          </div>
        </TabsContent>

        {/* Tab 10: Feedback */}
        <TabsContent value="feedback">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Student Feedback</h3>
            {feedbackList.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No feedback submitted yet.</p>
            )}
            {feedbackList.map((fb) => (
              <div key={fb.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < fb.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-sm">{fb.message}</p>
                <div className="text-xs text-muted-foreground">
                  {fb.student?.full_name ?? "Unknown"} ({fb.student?.email ?? "—"})
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Tab 11: Analytics */}
        <TabsContent value="analytics">
          {(() => {
            const totalStudents = profiles.length;
            const totalInternships = internships.length;
            const activeInterns = internships.filter((i) => i.status === "active").length;
            const completedInterns = internships.filter((i) => i.status === "completed").length;
            const pendingApprovals = internships.filter((i) => i.status === "pending").length;
            const rejectedInterns = internships.filter((i) => i.status === "rejected").length;
            const totalSubmissions = submissions.length;
            const approvedSubs = submissions.filter((s) => s.status === "approved").length;
            const pendingSubsCount = submissions.filter((s) => s.status === "pending" || s.status === "resubmit").length;
            const rejectedSubs = submissions.filter((s) => s.status === "rejected").length;
            const certEligible = internships.filter((i) => i.status === "completed" && !i.certificate_code).length;
            const certsIssued = internships.filter((i) => i.certificate_code).length;

            return (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><BarChart3 className="h-4 w-4 text-blue-600"/> Application Funnel</h4>
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm"><span>Registered Students:</span><span className="font-bold">{totalStudents}</span></div>
                    <div className="flex justify-between text-sm"><span>Total Internships:</span><span className="font-bold">{totalInternships}</span></div>
                    <div className="flex justify-between text-sm"><span>Pending Approvals:</span><span className="font-bold text-amber-600">{pendingApprovals}</span></div>
                    <div className="flex justify-between text-sm"><span>Active Interns:</span><span className="font-bold text-blue-600">{activeInterns}</span></div>
                    <div className="flex justify-between text-sm"><span>Completed Internships:</span><span className="font-bold text-emerald-600">{completedInterns}</span></div>
                    <div className="flex justify-between text-sm"><span>Rejected:</span><span className="font-bold text-destructive">{rejectedInterns}</span></div>
                  </div>
                </Card>
                <Card className="p-6 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="h-4 w-4 text-blue-600"/> Interns by Domain</h4>
                  <div className="space-y-3 pt-4">
                    {domains.map((dom) => {
                      const count = internships.filter((i) => i.domain_id === dom.id).length;
                      return (
                        <div key={dom.id} className="flex justify-between text-sm">
                          <span>{dom.name}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                      );
                    })}
                    {domains.length === 0 && <p className="text-xs text-muted-foreground">No domains configured</p>}
                  </div>
                </Card>
                <Card className="p-6 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><CheckSquare className="h-4 w-4 text-blue-600"/> Task Submissions</h4>
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm"><span>Total Submissions:</span><span className="font-bold">{totalSubmissions}</span></div>
                    <div className="flex justify-between text-sm"><span>Approved:</span><span className="font-bold text-emerald-600">{approvedSubs}</span></div>
                    <div className="flex justify-between text-sm"><span>Pending Review:</span><span className="font-bold text-amber-600">{pendingSubsCount}</span></div>
                    <div className="flex justify-between text-sm"><span>Rejected / Resubmit:</span><span className="font-bold text-destructive">{rejectedSubs}</span></div>
                  </div>
                </Card>
                <Card className="p-6 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Award className="h-4 w-4 text-blue-600"/> Certificates</h4>
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm"><span>Certificates Issued:</span><span className="font-bold text-emerald-600">{certsIssued}</span></div>
                    <div className="flex justify-between text-sm"><span>Eligible (Not Yet Issued):</span><span className="font-bold text-amber-600">{certEligible}</span></div>
                  </div>
                </Card>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center"><Icon className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function ReviewDialog({ onReview }: { onReview: (s: "approved" | "rejected" | "resubmit", fb: string) => void }) {
  const [open, setOpen] = useState(false);
  const [fb, setFb] = useState("");
  function go(status: "approved" | "rejected" | "resubmit") { onReview(status, fb); setOpen(false); setFb(""); }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Review</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Review submission</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Feedback (optional)</Label><Textarea rows={3} value={fb} onChange={(e) => setFb(e.target.value)} /></div>
          <div className="flex gap-2">
            <Button onClick={() => go("approved")} className="flex-1 bg-gradient-primary text-primary-foreground">Approve</Button>
            <Button onClick={() => go("resubmit")} variant="outline" className="flex-1">Resubmit</Button>
            <Button onClick={() => go("rejected")} variant="destructive" className="flex-1">Reject</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function EditProjectDialog({ project, domains, onSaved }: { project: any; domains: any[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(project.title ?? "");
  const [description, setDescription] = useState(project.description ?? "");
  const [difficulty, setDifficulty] = useState(project.difficulty ?? "Intermediate");
  const [deadline, setDeadline] = useState(project.deadline?.slice(0, 10) ?? "");
  const [fileUrl, setFileUrl] = useState(project.file_url ?? "");
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    (project.project_domains ?? []).map((pd: any) => pd.domain_id)
  );
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (selectedDomains.length === 0) return toast.error("Select at least one domain");
    setSaving(true);
    const supabase2 = supabase as any;
    const { error } = await supabase2.from("projects").update({
      title: title.trim(), description, difficulty, deadline: deadline || null, file_url: fileUrl || null,
    }).eq("id", project.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    await supabase2.from("project_domains").delete().eq("project_id", project.id);
    const { error: de } = await supabase2.from("project_domains").insert(
      selectedDomains.map((did) => ({ project_id: project.id, domain_id: did }))
    );
    if (de) toast.error("Project updated but domains failed: " + de.message);
    else { toast.success("Project updated"); setOpen(false); onSaved(); }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"><Edit3 className="h-3 w-3 mr-1" /> Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label>Description</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div>
            <Label>Difficulty</Label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div><Label>Deadline (optional)</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
          <div><Label>File URL (optional)</Label><Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://example.com/project-file.pdf" /></div>
          <div>
            <Label>Domains</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {domains.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded" checked={selectedDomains.includes(d.id)}
                    onChange={(e) => setSelectedDomains(prev => e.target.checked ? [...prev, d.id] : prev.filter(x => x !== d.id))} />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-primary text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
