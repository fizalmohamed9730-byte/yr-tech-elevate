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
import { Users, BookOpen, Award, Loader2, Github, ExternalLink, FolderOpen, FileText, BarChart3, CheckSquare, Briefcase, Settings, Plus, Edit3, Trash2, Eye, RotateCw, Search, X, MailPlus, Download, Megaphone } from "lucide-react";
import { getTasksForSlug } from "@/lib/tasks";
import { downloadCertificate, viewOfferLetterFromStorage, downloadOfferLetterFromStorage, downloadIdCard } from "@/lib/pdf";
import { COMPANY } from "@/lib/company";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");

  async function reload() {
    const [{ data: p }, { data: i }, { data: s }, { data: proj }, { data: ps }, { data: d }, { data: enq }, { data: ann }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("internships").select("*, domain:domains(name,slug), student:profiles!internships_student_id_fkey(full_name,email,phone,college,department,year,avatar_url,created_at)").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*, internship:internships(internship_code, domain:domains(name,slug), student:profiles!internships_student_id_fkey(full_name,email))").order("submitted_at", { ascending: false }),
      (supabase as any).from("projects").select("*, project_domains(domain_id, domain:domains(name))").order("created_at", { ascending: false }),
      (supabase as any).from("project_submissions").select("*, project:projects(title), student:profiles(full_name,email)").order("submitted_at", { ascending: false }),
      supabase.from("domains").select("*").eq("active", true),
      supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles(p ?? []);
    setInternships(i ?? []);
    setSubmissions(s ?? []);
    setProjects(proj ?? []);
    setProjectSubmissions(ps ?? []);
    setDomains(d ?? []);
    setEnquiries(enq ?? []);
    setAnnouncements(ann ?? []);
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

  // Auto-refresh every 30s once admin is confirmed
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => { reload(); }, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const enrichedStudents = useMemo(() => {
    let list = profiles.map((profile) => {
      const internship = internships.find((i) => i.student_id === profile.id);
      return { ...profile, internship };
    });

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) =>
        (s.full_name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.college ?? "").toLowerCase().includes(q) ||
        (s.internship?.internship_code ?? "").toLowerCase().includes(q) ||
        (s.internship?.domain?.name ?? "").toLowerCase().includes(q)
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
  }, [profiles, internships, searchTerm, filterDomain, filterStatus, filterDuration]);

  async function updateStatus(id: string, status: string) {
    const patch: any = { status };
    if (status === "completed") { patch.completed_at = new Date().toISOString(); patch.progress_percent = 100; }
    const { data: updatedData, error } = await supabase
      .from("internships")
      .update(patch)
      .eq("id", id)
      .select("*, domain:domains(name,slug), student:profiles!internships_student_id_fkey(full_name,email)")
      .single();
    if (error) return toast.error(error.message);
    if (status === "active") {
      try {
        toast.info("Generating and storing offer letter...");
        const { uploadOfferLetterToStorage } = await import("@/lib/pdf");
        const ud: any = updatedData;
        await uploadOfferLetterToStorage({
          studentId: ud.student_id,
          fullName: ud.student?.full_name ?? "Intern",
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
    }
    toast.success(status === "active" ? "Approved — offer letter issued" : "Updated");
    reload();
  }

  async function reviewSubmission(id: string, status: "approved" | "rejected" | "resubmit", feedback: string) {
    const { error } = await supabase.from("submissions").update({
      status, feedback: feedback || null, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
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
                    const taskApproved = submissions.filter((sub) => {
                      const intern = internships.find((ii) => ii.id === sub.internship_id);
                      return intern?.student_id === s.id && sub.status === "approved";
                    }).length;
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
                        <TableCell className="text-xs">{i?.domain?.name ?? "—"}</TableCell>
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
                          {i?.offer_letter_code ? <Badge variant="default" className="bg-emerald-600">Issued</Badge> : i?.status === "active" ? <Badge variant="outline">Pending</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs">{i ? `${taskApproved}/${taskTotal}` : "—"}</TableCell>
                        <TableCell>
                          {i?.certificate_code ? <Badge variant="default" className="bg-emerald-600">Issued</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-nowrap">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-2" title="View Profile"><Eye className="h-3 w-3" /></Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>{s.full_name ?? "Student"}</DialogTitle></DialogHeader>
                                <div className="space-y-3 text-sm">
                                  {s.avatar_url && (
                                    <div className="flex justify-center">
                                      <img src={s.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-muted-foreground">Email:</span> {s.email}</div>
                                    <div><span className="text-muted-foreground">Phone:</span> {s.phone ?? "—"}</div>
                                    <div><span className="text-muted-foreground">College:</span> {s.college ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Dept:</span> {s.department ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Year:</span> {s.year ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Domain:</span> {i?.domain?.name ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Duration:</span> {i?.duration ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Internship ID:</span> {i?.internship_code ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Offer Code:</span> {i?.offer_letter_code ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Certificate Code:</span> {i?.certificate_code ?? "—"}</div>
                                  </div>
                                  {s.github_url && <div><span className="text-muted-foreground">GitHub:</span> <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{s.github_url}</a></div>}
                                  {s.linkedin_url && <div><span className="text-muted-foreground">LinkedIn:</span> <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{s.linkedin_url}</a></div>}
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
                                import("@/lib/pdf").then((m) => m.downloadIdCard({
                                  fullName: s.full_name ?? "Intern",
                                  internshipCode: i.internship_code ?? "",
                                  domain: i.domain?.name ?? "",
                                  photoDataUrl: s.avatar_url,
                                  email: s.email,
                                  duration: i.duration,
                                }));
                              }} title="Download ID Card">ID Card</Button>
                            )}
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
                        {s.github_url && <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1"><Github className="h-3 w-3"/>GitHub</a>}
                        {s.project_url && <a href={s.project_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3"/>Project</a>}
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
            <h3 className="text-lg font-semibold mb-4">Secure Storage Offer Letters</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intern ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Offer Code</TableHead>
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
                      <TableCell className="space-x-1 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => viewOfferLetterFromStorage(i.student_id)}>View</Button>
                        <Button size="sm" onClick={() => downloadOfferLetterFromStorage(i.student_id, i.internship_code)}>Download</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {internships.filter(i => i.status === "active" || i.status === "completed").length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No issued offer letters yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 7: Certificates */}
        <TabsContent value="certificates">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Verifiable Certificates</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intern ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Certificate Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.filter(i => i.certificate_code).map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.internship_code}</TableCell>
                      <TableCell className="font-medium">{i.student?.full_name}</TableCell>
                      <TableCell>{i.domain?.name}</TableCell>
                      <TableCell className="font-mono text-xs">{i.certificate_code}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => downloadCertificate({ fullName: i.student?.full_name ?? "Intern", domain: i.domain?.name ?? "", internshipCode: i.internship_code, certificateCode: i.certificate_code, issuedAt: i.certificate_issued_at, duration: i.duration })}>
                          Download Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {internships.filter(i => i.certificate_code).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No certificates issued yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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

        {/* Tab 10: Analytics */}
        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><BarChart3 className="h-4 w-4 text-blue-600"/> Application Funnel</h4>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between text-sm"><span>Registered Students:</span><span className="font-bold">{profiles.length}</span></div>
                <div className="flex justify-between text-sm"><span>Pending Approvals:</span><span className="font-bold text-amber-600">{pendingApps}</span></div>
                <div className="flex justify-between text-sm"><span>Active Interns:</span><span className="font-bold text-blue-600">{activeCount}</span></div>
                <div className="flex justify-between text-sm"><span>Graduated Interns:</span><span className="font-bold text-emerald-600">{completedCount}</span></div>
              </div>
            </Card>
            <Card className="p-6 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="h-4 w-4 text-blue-600"/> Domain Enrollments</h4>
              <div className="space-y-3 pt-4">
                {domains.map((dom) => {
                  const count = internships.filter(i => i.domain?.name === dom.name).length;
                  return (
                    <div key={dom.id} className="flex justify-between text-sm">
                      <span>{dom.name}:</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1"><CheckSquare className="h-4 w-4 text-blue-600"/> Task Analytics</h4>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between text-sm"><span>Total Submissions:</span><span className="font-bold">{submissions.length}</span></div>
                <div className="flex justify-between text-sm"><span>Needs Review:</span><span className="font-bold text-amber-600">{pendingSubs.length}</span></div>
                <div className="flex justify-between text-sm"><span>Approved:</span><span className="font-bold text-emerald-600">{submissions.filter(s => s.status === 'approved').length}</span></div>
              </div>
            </Card>
          </div>
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
