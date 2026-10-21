import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createFileRoute, useNavigate, redirect, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, BookOpen, Award, Loader2, Github, ExternalLink, FolderOpen, FileText,
  BarChart3, CheckSquare, Settings, Plus, Edit3, Trash2, Eye, RotateCw, Search,
  X, MailPlus, Download, MessageSquare, Star, Linkedin, LayoutDashboard,
  ClipboardList, Upload, Mail, CreditCard, Bell, Menu, LogOut, Clock, CheckCircle, CheckCircle2,
  TrendingUp, Calendar, Megaphone, Sun, Moon, TriangleAlert, ChevronRight,
  Filter, Sparkles, RefreshCw, SlidersHorizontal, Check, ShieldCheck, ArrowUpRight
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from "recharts";
import { getTasksForSlug } from "@/lib/tasks";
import { getInitials } from "@/lib/utils";
import { useAdminTheme } from "@/hooks/use-admin-theme";
import {
  downloadCertificate, downloadOfferLetterAnywhere, downloadIdCard,
  uploadOfferLetterToStorage, viewOfferLetterFromStorage
} from "@/lib/pdf";
import { sendOfferLetterEmail, sendCertificateEmail } from "@/routes/-email.serverfn";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const ctx = context as { isAdmin?: boolean };
    if (!ctx.isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

type Section =
  | "dashboard"
  | "interns"
  | "applications"
  | "tasks"
  | "submissions"
  | "offers"
  | "idcards"
  | "certificates"
  | "feedback"
  | "enquiries"
  | "analytics"
  | "announcements";

type SectionKey =
  | "profiles"
  | "internships"
  | "submissions"
  | "projects"
  | "projectSubmissions"
  | "domains"
  | "enquiries"
  | "announcements"
  | "feedback"
  | "discovery";

type SectionError = { error: string | null; ts: number };

interface NavItemDef {
  id: Section;
  label: string;
  icon: any;
  badgeKey?: string;
  category: "Overview" | "Management" | "Credentials" | "Communication";
}

const NAV_GROUPS: { name: "Overview" | "Management" | "Credentials" | "Communication"; items: NavItemDef[] }[] = [
  {
    name: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "Overview" },
      { id: "analytics", label: "Analytics", icon: BarChart3, category: "Overview" },
    ],
  },
  {
    name: "Management",
    items: [
      { id: "interns", label: "Student Directory", icon: Users, category: "Management" },
      { id: "applications", label: "Applications", icon: FileText, badgeKey: "applications", category: "Management" },
      { id: "tasks", label: "Task Submissions", icon: ClipboardList, badgeKey: "tasks", category: "Management" },
      { id: "submissions", label: "Project Submissions", icon: Upload, badgeKey: "submissions", category: "Management" },
    ],
  },
  {
    name: "Credentials",
    items: [
      { id: "offers", label: "Offer Letters", icon: Mail, category: "Credentials" },
      { id: "idcards", label: "ID Cards", icon: CreditCard, category: "Credentials" },
      { id: "certificates", label: "Certificates", icon: Award, category: "Credentials" },
    ],
  },
  {
    name: "Communication",
    items: [
      { id: "announcements", label: "Announcements", icon: Megaphone, category: "Communication" },
      { id: "enquiries", label: "Enquiries Desk", icon: Mail, badgeKey: "enquiries", category: "Communication" },
      { id: "feedback", label: "Student Feedback", icon: MessageSquare, category: "Communication" },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  pending_review: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  completed: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  cancelled: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  resubmit: "bg-amber-500/15 text-amber-500 border-amber-500/30",
};

const DOMAIN_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f97316", "#10b981", "#ec4899"];

function LazyAvatar({
  profileId,
  name,
  src,
  size = 32,
  onReveal,
}: {
  profileId?: string | null;
  name?: string | null;
  src?: string | null;
  size?: number;
  onReveal?: (id: string) => void;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [requested, setRequested] = useState(false);
  const photo = src ?? null;

  useEffect(() => {
    if (photo || requested) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      onReveal?.(profileId as string);
      setRequested(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onReveal?.(profileId as string);
          setRequested(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [photo, requested, profileId, onReveal]);

  return (
    <span ref={ref} className="inline-flex shrink-0">
      {photo ? (
        <img
          src={photo}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="rounded-full object-cover border border-(--admin-input-border) shadow-xs"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <Avatar style={{ width: size, height: size }} className="inline-flex">
          <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      )}
    </span>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const routeCtx = useRouteContext({ from: "/_authenticated" }) as {
    user?: { id: string } | null;
    isAdmin?: boolean;
  } | undefined;

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Core Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [taskFilterStatus, setTaskFilterStatus] = useState<"all" | "pending" | "resubmit" | "approved">("all");

  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toggleTheme, isDark } = useAdminTheme();
  const reloadInProgress = useRef(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");

  const [profilePhotos, setProfilePhotos] = useState<Record<string, string | null>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<SectionKey, SectionError>>({
    profiles: { error: null, ts: 0 },
    internships: { error: null, ts: 0 },
    submissions: { error: null, ts: 0 },
    projects: { error: null, ts: 0 },
    projectSubmissions: { error: null, ts: 0 },
    domains: { error: null, ts: 0 },
    enquiries: { error: null, ts: 0 },
    announcements: { error: null, ts: 0 },
    feedback: { error: null, ts: 0 },
    discovery: { error: null, ts: 0 },
  });

  const [sectionLoading, setSectionLoading] = useState<Record<SectionKey, boolean>>({
    profiles: false,
    internships: false,
    submissions: false,
    projects: false,
    projectSubmissions: false,
    domains: false,
    enquiries: false,
    announcements: false,
    feedback: false,
    discovery: false,
  });

  const [filterCountry, setFilterCountry] = useState("all");
  const [filterDiscovery, setFilterDiscovery] = useState("all");
  const [discoveryData, setDiscoveryData] = useState<any[]>([]);
  const [discoveryColumnsMissing, setDiscoveryColumnsMissing] = useState(false);

  async function safeQuery<T = any>(
    label: string,
    builder: { then: Function }
  ): Promise<{
    data: T[];
    failed: boolean;
    supabaseError?: { code?: string; message?: string; details?: string; hint?: string; status?: number };
  }> {
    try {
      const { data, error } = (await builder) as any;
      if (error) {
        const errInfo = {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
        };
        console.error(`[admin] ${label} query error:`, errInfo);
        return { data: [], failed: true, supabaseError: errInfo };
      }
      return { data: (data ?? []) as T[], failed: false };
    } catch (err: any) {
      console.error(`[admin] ${label} query threw:`, {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      });
      return { data: [], failed: true, supabaseError: { code: "THROW", message: err?.message } };
    }
  }

  const photoCache = useRef<Record<string, string | null>>({});
  const photoPending = useRef<Set<string>>(new Set());

  const fetchPhoto = useCallback(async (profileId: string): Promise<string | null> => {
    if (profileId in photoCache.current) return photoCache.current[profileId];
    if (photoPending.current.has(profileId)) return null;
    photoPending.current.add(profileId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", profileId)
        .maybeSingle();
      if (error) return null;
      const url = data?.avatar_url ?? null;
      photoCache.current[profileId] = url;
      setProfilePhotos({ ...photoCache.current });
      return url;
    } catch {
      return null;
    } finally {
      photoPending.current.delete(profileId);
    }
  }, []);

  const revealPhoto = useCallback(
    (profileId: string | null | undefined) => {
      if (!profileId) return;
      if (profileId in photoCache.current) return;
      void fetchPhoto(profileId);
    },
    [fetchPhoto]
  );

  function isSchemaMismatchError(err: any): boolean {
    if (!err) return false;
    const code = err.code;
    const msg = err.message ?? "";
    return (
      code === "42703" ||
      code === "PGRST204" ||
      code === "42P01" ||
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("column")
    );
  }

  async function reload() {
    if (reloadInProgress.current) return;
    reloadInProgress.current = true;
    setSectionLoading({
      profiles: true,
      internships: true,
      submissions: true,
      projects: true,
      projectSubmissions: true,
      domains: true,
      enquiries: true,
      announcements: true,
      feedback: true,
      discovery: true,
    });

    try {
      const db = supabase as any;
      const [pRes, rawInternsRes, rawSubsRes, projRes, rawPsRes, dRes, enqRes, annRes, rawFbRes, discRes] =
        await Promise.all([
          safeQuery(
            "profiles",
            supabase
              .from("profiles")
              .select(
                "id, user_id, full_name, email, phone, college, department, year, github_url, linkedin_url, created_at"
              )
              .order("created_at", { ascending: false })
          ),
          safeQuery(
            "internships",
            supabase
              .from("internships")
              .select(
                "id, student_id, domain_id, status, duration, started_at, internship_code, offer_letter_code, certificate_code, certificate_issued_at, certificate_released_by, certificate_released_at, progress_percent, completed_at, created_at, domain:domains(name,slug)"
              )
              .order("created_at", { ascending: false })
          ),
          safeQuery(
            "submissions",
            db
              .from("submissions")
              .select(
                "id, internship_id, task_no, status, project_url, github_url, drive_url, notes, feedback, submitted_at, reviewed_at"
              )
              .order("submitted_at", { ascending: false })
          ),
          safeQuery(
            "projects",
            db
              .from("projects")
              .select(
                "id, title, description, file_url, difficulty, deadline, created_at, active, project_domains(domain_id, domain:domains(name))"
              )
              .order("created_at", { ascending: false })
          ),
          safeQuery(
            "project_submissions",
            db
              .from("project_submissions")
              .select(
                "id, project_id, student_id, github_url, notes, status, feedback, submitted_at, reviewed_at, project:projects(title)"
              )
              .order("submitted_at", { ascending: false })
          ),
          safeQuery("domains", supabase.from("domains").select("id, name, slug, active").eq("active", true)),
          safeQuery(
            "enquiries",
            db
              .from("enquiries")
              .select("id, name, email, message, status, created_at, read_at")
              .order("created_at", { ascending: false })
          ),
          safeQuery(
            "announcements",
            db.from("announcements").select("id, title, body, created_at").order("created_at", { ascending: false })
          ),
          safeQuery(
            "feedback",
            db
              .from("feedback")
              .select("id, user_id, rating, message, status, created_at")
              .order("created_at", { ascending: false })
          ),
          safeQuery(
            "discovery",
            supabase.from("profiles").select("id, country, discovery_source, discovery_other").order("created_at", { ascending: false })
          ),
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

      const i = rawInterns.map((intern: any) => ({
        ...intern,
        student: studentMap.get(intern.student_id) ?? null,
      }));

      if (i.length > 0) {
        const extRes = await safeQuery(
          "internships_extended",
          (supabase as any)
            .from("internships")
            .select("id, certificate_status, certificate_revoked_at, certificate_revoked_by, certificate_revoke_reason")
        );
        if (!extRes.failed && extRes.data.length > 0) {
          const extMap = new Map<string, any>();
          for (const row of extRes.data) extMap.set(row.id, row);
          for (const intern of i) {
            const ext = extMap.get(intern.id);
            if (ext) {
              intern.certificate_status = ext.certificate_status ?? "none";
              intern.certificate_revoked_at = ext.certificate_revoked_at ?? null;
              intern.certificate_revoked_by = ext.certificate_revoked_by ?? null;
              intern.certificate_revoke_reason = ext.certificate_revoke_reason ?? null;
            } else {
              intern.certificate_status = "none";
            }
          }
        } else {
          for (const intern of i) {
            intern.certificate_status = intern.certificate_status ?? "none";
          }
        }
      }

      const ps = rawPs.map((sub: any) => ({
        ...sub,
        student: studentMap.get(sub.student_id) ?? sub.student ?? null,
      }));
      const fb = rawFb.map((f: any) => ({ ...f, student: studentMap.get(f.user_id) ?? null }));

      setProfiles(p);
      setInternships(i);
      setProjects(proj);
      setProjectSubmissions(ps);
      setDomains(d);
      setEnquiries(enq);
      setAnnouncements(ann);
      setFeedbackList(fb);

      const discoveryRecords = discRes.failed ? [] : discRes.data;
      setDiscoveryData(discoveryRecords);
      setDiscoveryColumnsMissing(
        discRes.failed && (discRes.supabaseError?.code === "42703" || discRes.supabaseError?.code === "PGRST204")
      );

      const internshipMap = new Map<string, any>();
      for (const int of i) internshipMap.set(int.id, int);
      setSubmissions(
        rawSubs.map((sub: any) => ({ ...sub, internship: internshipMap.get(sub.internship_id) ?? null }))
      );

      const newErrors: Record<SectionKey, SectionError> = {
        profiles: {
          error: !pRes.failed || isSchemaMismatchError(pRes.supabaseError) ? null : "Failed to load profiles",
          ts: Date.now(),
        },
        internships: {
          error: !rawInternsRes.failed || isSchemaMismatchError(rawInternsRes.supabaseError) ? null : "Failed to load internships",
          ts: Date.now(),
        },
        submissions: {
          error: !rawSubsRes.failed || isSchemaMismatchError(rawSubsRes.supabaseError) ? null : "Failed to load submissions",
          ts: Date.now(),
        },
        projects: {
          error: !projRes.failed || isSchemaMismatchError(projRes.supabaseError) ? null : "Failed to load projects",
          ts: Date.now(),
        },
        projectSubmissions: {
          error: !rawPsRes.failed || isSchemaMismatchError(rawPsRes.supabaseError) ? null : "Failed to load project submissions",
          ts: Date.now(),
        },
        domains: {
          error: !dRes.failed || isSchemaMismatchError(dRes.supabaseError) ? null : "Failed to load domains",
          ts: Date.now(),
        },
        enquiries: {
          error: !enqRes.failed || isSchemaMismatchError(enqRes.supabaseError) ? null : "Failed to load enquiries",
          ts: Date.now(),
        },
        announcements: {
          error: !annRes.failed || isSchemaMismatchError(annRes.supabaseError) ? null : "Failed to load announcements",
          ts: Date.now(),
        },
        feedback: {
          error: !rawFbRes.failed || isSchemaMismatchError(rawFbRes.supabaseError) ? null : "Failed to load feedback",
          ts: Date.now(),
        },
        discovery: {
          error: !discRes.failed || isSchemaMismatchError(discRes.supabaseError) ? null : discRes.supabaseError?.message || "Discovery analytics unavailable",
          ts: Date.now(),
        },
      };
      setSectionErrors(newErrors);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err: any) {
      console.error("[admin] reload error:", err);
    } finally {
      reloadInProgress.current = false;
      setSectionLoading({
        profiles: false,
        internships: false,
        submissions: false,
        projects: false,
        projectSubmissions: false,
        domains: false,
        enquiries: false,
        announcements: false,
        feedback: false,
        discovery: false,
      });
    }
  }

  useEffect(() => {
    setIsAdmin(routeCtx?.isAdmin === true);
    setChecking(false);
    if (routeCtx?.isAdmin === true) void reload();
  }, [routeCtx?.isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (reloadInProgress.current) return;
      void reload();
    };
    const interval = setInterval(tick, 60000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAdmin]);

  const approvedCountByInternship = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of submissions) {
      if (sub.status !== "approved") continue;
      map.set(sub.internship_id, (map.get(sub.internship_id) ?? 0) + 1);
    }
    return map;
  }, [submissions]);

  function getRequiredTaskCount(domainSlug: string | undefined | null, duration: string | undefined | null): number {
    if (domainSlug === "artificial-intelligence" || domainSlug === "full-stack") {
      if (duration === "1 Month") return 5;
      if (duration === "2 Months") return 7;
      return 10;
    }
    if (duration === "1 Month") return 3;
    if (duration === "2 Months") return 4;
    return 5;
  }

  const requiredCountByInternship = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of internships) {
      map.set(i.id, getRequiredTaskCount(i.domain?.slug, i.duration));
    }
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
      if (internship?.domain_id) {
        const dom = domains.find((d) => d.id === internship.domain_id);
        if (dom) return dom.name;
      }
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
      list = list.filter(
        (s) =>
          (s.full_name ?? "").toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q) ||
          (s.college ?? "").toLowerCase().includes(q) ||
          (s.year ?? "").toLowerCase().includes(q) ||
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

  const pendingSubs = submissions.filter(
    (s) => s.status === "pending" || s.status === "pending_review" || s.status === "resubmit"
  );
  const activeCount = internships.filter((i) => i.status === "active").length;
  const completedCount = internships.filter((i) => i.status === "completed").length;
  const pendingApps = internships.filter((i) => i.status === "pending").length;
  const pendingProjectSubs = projectSubmissions.filter((s) => s.status === "pending");
  const certsIssued = internships.filter((i) => i.certificate_code).length;

  const badgeCounts: Record<string, number> = {
    applications: pendingApps,
    tasks: pendingSubs.length,
    submissions: pendingProjectSubs.length,
    enquiries: enquiries.filter((e) => e.status === "new").length,
  };

  const registrationData = useMemo(() => {
    const mc: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mc[d.toLocaleDateString("en-US", { month: "short", year: "numeric" })] = 0;
    }
    for (const intern of internships) {
      const k = new Date(intern.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (k in mc) mc[k]++;
    }
    return Object.entries(mc).map(([name, count]) => ({ name, count }));
  }, [internships]);

  const completionData = useMemo(() => {
    const c = internships.filter((i) => i.status === "completed").length;
    const a = internships.filter((i) => i.status === "active").length;
    const p = internships.filter((i) => i.status === "pending").length;
    const x = internships.filter((i) => i.status === "cancelled").length;
    return [
      { name: "Completed", value: c, color: "#3b82f6" },
      { name: "In Progress", value: a, color: "#06b6d4" },
      { name: "Dropped", value: x, color: "#f97316" },
      { name: "Pending", value: p, color: "#ef4444" },
    ];
  }, [internships]);

  const domainData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const intern of internships) {
      const n = intern.domain?.name ?? "Unknown";
      counts[n] = (counts[n] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.length > 16 ? name.slice(0, 14) + "..." : name,
        fullName: name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [internships]);

  const recentInterns = useMemo(
    () => [...internships].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [internships]
  );
  const completionRate = useMemo(
    () => Math.round((completedCount / (internships.length || 1)) * 100),
    [internships, completedCount]
  );

  const filteredDiscoveryRecords = useMemo(() => {
    let result = discoveryData;
    if (filterCountry !== "all") result = result.filter((d) => d.country === filterCountry);
    if (filterDiscovery !== "all") result = result.filter((d) => d.discovery_source === filterDiscovery);
    return result;
  }, [discoveryData, filterCountry, filterDiscovery]);

  const filteredCountryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of filteredDiscoveryRecords) {
      if (!d.country) continue;
      counts[d.country] = (counts[d.country] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredDiscoveryRecords]);

  const filteredDiscoveryData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const d of filteredDiscoveryRecords) {
      if (!d.discovery_source) continue;
      counts[d.discovery_source] = (counts[d.discovery_source] || 0) + 1;
      total++;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, percent: Math.round((count / (total || 1)) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [filteredDiscoveryRecords]);

  const uniqueCountries = useMemo(() => {
    const set = new Set(discoveryData.map((d) => d.country).filter(Boolean));
    return Array.from(set).sort();
  }, [discoveryData]);

  const uniqueDiscoverySources = useMemo(() => {
    const set = new Set(discoveryData.map((d) => d.discovery_source).filter(Boolean));
    return Array.from(set).sort();
  }, [discoveryData]);

  const notifications = useMemo(() => {
    type NotifItem = {
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      icon: any;
      color: string;
      section?: Section;
    };
    const items: NotifItem[] = [];
    for (const sub of pendingSubs) {
      items.push({
        id: `sub-${sub.id}`,
        type: "submission",
        title: "Task Submission",
        description: `${sub.internship?.student?.full_name ?? "Intern"} submitted Task ${sub.task_no} for review`,
        timestamp: sub.submitted_at,
        icon: Upload,
        color: "text-amber-500",
        section: "tasks",
      });
    }
    for (const enquiry of enquiries.filter((e) => e.status === "new")) {
      items.push({
        id: `enq-${enquiry.id}`,
        type: "enquiry",
        title: "New Enquiry",
        description: `${enquiry.name}: ${(enquiry.message ?? "").slice(0, 60)}${
          (enquiry.message ?? "").length > 60 ? "..." : ""
        }`,
        timestamp: enquiry.created_at,
        icon: Mail,
        color: "text-blue-500",
        section: "enquiries",
      });
    }
    for (const ann of announcements.slice(0, 5)) {
      items.push({
        id: `ann-${ann.id}`,
        type: "announcement",
        title: "Announcement",
        description: ann.title,
        timestamp: ann.created_at,
        icon: Megaphone,
        color: "text-purple-500",
        section: "announcements",
      });
    }
    const recents = internships
      .filter((i) => {
        const created = new Date(i.created_at).getTime();
        return Date.now() - created < 86400000;
      })
      .slice(0, 5);
    for (const intern of recents) {
      items.push({
        id: `reg-${intern.id}`,
        type: "registration",
        title: "New Registration",
        description: `${intern.student?.full_name ?? "New intern"} registered for ${intern.domain?.name ?? ""}`,
        timestamp: intern.created_at,
        icon: Users,
        color: "text-emerald-500",
        section: "interns",
      });
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [pendingSubs, enquiries, announcements, internships]);

  const unreadCount = pendingSubs.length + enquiries.filter((e) => e.status === "new").length;

  // Actions
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
          const emailResult = await sendCertificateEmail({
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
          if (emailResult?.error) toast.error("Email failed: " + emailResult.error);
          else toast.success("Certificate emailed to " + intern.student.email);
        } catch (emailErr: any) {
          toast.error("Email failed: " + (emailErr?.message ?? "Unknown error"));
        }
      })();
    }
  }

  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string; code: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  async function revokeCertificate() {
    if (!revokeTarget) return;
    if (!revokeReason.trim()) return toast.error("Reason is required to revoke a certificate.");
    setRevoking(true);
    try {
      const { data: result, error } = await supabase.rpc("revoke_certificate", {
        p_internship_id: revokeTarget.id,
        p_reason: revokeReason.trim(),
      });
      const res = result as any;
      if (error) return toast.error("Failed to revoke: " + error.message);
      if (res?.error) return toast.error(res.error);
      toast.success("Certificate revoked for " + revokeTarget.name);
      setRevokeTarget(null);
      setRevokeReason("");
      reload();
    } catch (err: any) {
      toast.error("Revoke failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setRevoking(false);
    }
  }

  const [reissueTarget, setReissueTarget] = useState<{ id: string; name: string } | null>(null);
  const [reissuing, setReissuing] = useState(false);

  async function reissueCertificate() {
    if (!reissueTarget) return;
    setReissuing(true);
    try {
      const { data: result, error } = await supabase.rpc("reissue_certificate", {
        p_internship_id: reissueTarget.id,
      });
      const res = result as any;
      if (error) return toast.error("Failed to reissue: " + error.message);
      if (res?.error) return toast.error(res.error);
      const code = res?.certificate_code ?? "reissued";
      toast.success("Certificate re-issued: " + code);
      setReissueTarget(null);
      reload();
    } catch (err: any) {
      toast.error("Reissue failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setReissuing(false);
    }
  }

  async function handleSendOfferLetterEmail(intern: any) {
    if (!intern.student?.email) return toast.error("No email found for this intern");
    setSendingEmail(`ol-${intern.id}`);
    try {
      const result = await sendOfferLetterEmail({
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
      if (result?.error) toast.error("Email failed: " + result.error);
      else {
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
      const result = await sendCertificateEmail({
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
      if (result?.error) toast.error("Email failed: " + result.error);
      else {
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
    for (const i of interns ?? []) await db.from("submissions").delete().eq("internship_id", i.id);
    await db.from("internships").delete().eq("student_id", studentId);
    const { error } = await db.from("profiles").delete().eq("id", studentId);
    if (error) return toast.error(error.message);
    toast.success("Student removed");
    reload();
  }

  async function approveFeedback(id: string) {
    const { error } = await (supabase as any).from("feedback").update({ status: "approved" }).eq("id", id);
    if (error) return toast.error("Failed to approve: " + error.message);
    toast.success("Feedback approved — now visible on homepage");
    reload();
  }

  async function rejectFeedback(id: string) {
    const { error } = await (supabase as any).from("feedback").update({ status: "rejected" }).eq("id", id);
    if (error) return toast.error("Failed to reject: " + error.message);
    toast.success("Feedback rejected");
    reload();
  }

  async function updateStatus(id: string, status: string) {
    const patch: any = { status };
    if (status === "completed") {
      patch.completed_at = new Date().toISOString();
      patch.progress_percent = 100;
    }
    const { data: updatedData, error } = await (supabase as any)
      .from("internships")
      .update(patch)
      .eq("id", id)
      .select("*, domain:domains(name,slug)")
      .single();
    if (error) return toast.error("Failed to update: " + error.message);
    toast.success(status === "active" ? "Approved - offer letter issued" : "Updated");
    reload();
    if (status === "active") {
      const ud: any = updatedData;
      const sp = profiles.find((p) => p.id === ud.student_id);
      (async () => {
        try {
          await uploadOfferLetterToStorage({
            studentId: ud.student_id,
            fullName: sp?.full_name ?? "Intern",
            domain: ud.domain?.name ?? "",
            domainSlug: ud.domain?.slug,
            internshipCode: ud.internship_code,
            offerCode: ud.offer_letter_code,
            startedAt: ud.started_at,
            duration: ud.duration,
          });
          toast.success("Offer letter PDF stored");
        } catch (err: any) {
          toast.error("Failed to store PDF: " + err.message);
        }
      })();
      if (sp?.email) {
        (async () => {
          try {
            const r = await sendOfferLetterEmail({
              data: {
                internshipId: id,
                email: sp.email,
                fullName: sp.full_name ?? "Intern",
                domain: ud.domain?.name ?? "",
                duration: ud.duration ?? "1 Month",
                internshipCode: ud.internship_code,
                offerCode: ud.offer_letter_code,
                startedAt: ud.started_at,
              },
            });
            if (r?.error) toast.error("Email failed: " + r.error);
            else toast.success("Offer letter emailed to " + sp.email);
          } catch (e: any) {
            toast.error("Email failed: " + (e?.message ?? "Unknown error"));
          }
        })();
      }
    }
  }

  async function reviewSubmission(id: string, status: "approved" | "rejected" | "resubmit", fb: string) {
    const { error } = await (supabase as any)
      .from("submissions")
      .update({ status, feedback: fb || null, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Failed to review: " + error.message);
    toast.success("Reviewed");
    reload();
  }

  async function reviewProjectSubmission(id: string, status: "approved" | "rejected", fb: string) {
    const { error } = await (supabase as any)
      .from("project_submissions")
      .update({ status, feedback: fb || null, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Failed to review: " + error.message);
    toast.success("Submission " + status);
    reload();
  }

  async function handleAnnouncementSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    const body = (fd.get("body") as string)?.trim() || "";
    if (!title) return toast.error("Title is required");
    const { error } = await supabase
      .from("announcements")
      .insert({ title, body, created_by: routeCtx?.user?.id ?? null, active: true });
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
    const { error } = await supabase
      .from("enquiries")
      .update({ status, read_at: status === "read" ? new Date().toISOString() : null })
      .eq("id", id);
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
    const cols = [
      "name",
      "email",
      "phone",
      "college",
      "department",
      "year",
      "internship_id",
      "domain",
      "duration",
      "status",
      "registered",
      "linkedin",
      "github",
    ];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as any)[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `YR-NOVATECH-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Filtered Task Submissions
  const filteredSubmissions = useMemo(() => {
    let list = submissions;
    if (taskFilterStatus === "pending") {
      list = list.filter((s) => s.status === "pending" || s.status === "pending_review");
    } else if (taskFilterStatus === "resubmit") {
      list = list.filter((s) => s.status === "resubmit" || s.status === "rejected");
    } else if (taskFilterStatus === "approved") {
      list = list.filter((s) => s.status === "approved");
    }
    if (searchTerm.trim() && activeSection === "tasks") {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          (s.internship?.student?.full_name ?? "").toLowerCase().includes(q) ||
          (s.internship?.internship_code ?? "").toLowerCase().includes(q) ||
          `task ${s.task_no}`.includes(q)
      );
    }
    return list;
  }, [submissions, taskFilterStatus, searchTerm, activeSection]);
  if (checking) {
    return (
      <div className="dark min-h-screen bg-(--admin-loading-bg) flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
          <p className="text-(--admin-text-secondary) text-sm font-medium">Verifying Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dayStr = now.toLocaleDateString("en-US", { weekday: "short" });

  const activeNavItem = NAV_GROUPS.flatMap((g) => g.items).find((item) => item.id === activeSection);

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-(--admin-sidebar-border)">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm ring-1 ring-white/10 shrink-0">
              YR
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-(--admin-text) tracking-tight truncate">YR NOVATECH</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              </div>
              <div className="text-[10px] text-blue-500 font-mono uppercase tracking-wider font-semibold">
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-(--admin-text-muted) uppercase tracking-wider">
                {group.name}
              </div>
              <div className="space-y-0.5 pt-0.5">
                {group.items.map((item) => {
                  const count = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0;
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs font-semibold"
                          : "text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg)"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-(--admin-text-muted)"}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {count > 0 && (
                        <span
                          className={`h-4.5 min-w-4.5 px-1.5 rounded-full text-[10px] font-semibold flex items-center justify-center ${
                            isActive
                              ? "bg-white/20 text-white"
                              : item.id === "tasks"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/20"
                              : "bg-blue-500/15 text-blue-500 border border-blue-500/20"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-(--admin-sidebar-border) space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 text-xs text-(--admin-text-muted)">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live System
            </span>
            <span className="text-[10px] font-mono">v2.6 Enterprise</span>
          </div>

          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-(--admin-text-secondary) hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }


  return (
    <div id="admin-root" className={isDark ? "dark" : "admin-light"}>
      <div className="flex h-screen bg-(--admin-page) overflow-hidden font-sans">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-(--admin-sidebar) border-r border-(--admin-sidebar-border) shrink-0 shadow-xs z-20">
          <SidebarContent />
        </aside>

        {/* Mobile Navigation Drawer */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 bg-(--admin-sidebar) border-r border-(--admin-sidebar-border)">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 border-b border-(--admin-header-border) bg-(--admin-header) backdrop-blur-md flex items-center justify-between px-4 lg:px-6 gap-3 shrink-0 z-10">
            {/* Left: Mobile trigger & Breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-(--admin-nav-hover-bg) text-(--admin-text-secondary) transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-(--admin-text-muted) font-medium">
                  <span>Console</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{activeNavItem?.label}</span>
                </div>
                <h1 className="text-base font-bold text-(--admin-text) tracking-tight truncate hidden sm:block">
                  {activeNavItem?.label}
                </h1>
              </div>
            </div>

            {/* Middle: Universal Search */}
            <div className="flex-1 max-w-sm hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--admin-text-muted)" />
                <input
                  placeholder={`Search in ${activeNavItem?.label}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-(--admin-input) border border-(--admin-input-border) rounded-lg pl-9 pr-8 py-1.5 text-xs text-(--admin-text) placeholder-(--admin-input-placeholder) focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--admin-text-muted) hover:text-(--admin-text)"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Actions, Sync, Theme, User */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reload()}
                className="h-8 px-2 sm:px-2.5 text-xs text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg) gap-1.5"
                title={`Last synced: ${lastSyncedTime}`}
              >
                <RotateCw className={`h-3.5 w-3.5 ${reloadInProgress.current ? "animate-spin text-blue-500" : ""}`} />
                <span className="hidden xl:inline text-[11px]">Sync</span>
              </Button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-(--admin-nav-hover-bg) text-(--admin-text-secondary) transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
              </button>

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-lg hover:bg-(--admin-nav-hover-bg) text-(--admin-text-secondary) transition-colors">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute 1 top-1 right-1 h-3.5 min-w-3.5 px-1 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-(--admin-card) border-(--admin-card-border) p-0 shadow-lg">
                  <div className="p-3 border-b border-(--admin-card-border) flex items-center justify-between">
                    <h3 className="text-xs font-bold text-(--admin-text) uppercase tracking-wider">Alerts & Actions</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-blue-500 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {unreadCount} pending
                      </span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-(--admin-text-muted)">No active notifications</div>
                  ) : (
                    notifications.slice(0, 15).map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-(--admin-nav-hover-bg) border-b border-(--admin-card-border)/50 last:border-0 rounded-none transition-colors"
                        onClick={() => {
                          if (n.section) setActiveSection(n.section);
                        }}
                      >
                        <n.icon className={`h-4 w-4 mt-0.5 shrink-0 ${n.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-(--admin-text)">{n.title}</div>
                          <div className="text-[11px] text-(--admin-text-muted) truncate">{n.description}</div>
                          <div className="text-[9px] text-(--admin-text-muted)/80 mt-0.5">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin Avatar Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-lg hover:bg-(--admin-nav-hover-bg) transition-colors border-l border-(--admin-input-border)">
                    <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                      <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden xl:block">
                      <div className="text-xs font-semibold text-(--admin-text) leading-tight">Admin</div>
                      <div className="text-[10px] text-(--admin-text-muted) leading-tight">Superuser</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-(--admin-card) border-(--admin-card-border)">
                  <DropdownMenuLabel className="font-semibold text-xs text-(--admin-text)">
                    Administrator Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-(--admin-card-border)" />
                  <DropdownMenuItem onClick={() => setActiveSection("interns")} className="text-xs cursor-pointer">
                    <Users className="h-3.5 w-3.5 mr-2" /> Student Directory
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSection("tasks")} className="text-xs cursor-pointer">
                    <ClipboardList className="h-3.5 w-3.5 mr-2" /> Pending Submissions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSection("certificates")} className="text-xs cursor-pointer">
                    <Award className="h-3.5 w-3.5 mr-2" /> Certificate Desk
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-(--admin-card-border)" />
                  <DropdownMenuItem
                    onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}
                    className="text-xs text-rose-500 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Section Errors Alert */}
          {Object.values(sectionErrors).some((e) => e.error) && (
            <div className="mx-4 lg:mx-6 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-rose-500">
              <div className="flex items-center gap-2 min-w-0">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Sync notice: {Object.entries(sectionErrors).filter(([, e]) => e.error).map(([k]) => k).join(", ")} data unavailable.
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-rose-500 hover:bg-rose-500/10 shrink-0"
                onClick={() => reload()}
              >
                <RotateCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </div>
          )}

          {/* Dynamic Content View */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {/* ==============================================================
                1. DASHBOARD OVERVIEW
               ============================================================== */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Greeting Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-(--admin-card) border border-(--admin-card-border) shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold text-(--admin-text) tracking-tight">
                      Platform Overview
                    </h2>
                    <p className="text-xs text-(--admin-text-secondary) mt-0.5">
                      Monitor candidate milestones, deliverables, approvals, and credentials.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-(--admin-text) bg-(--admin-input) px-3 py-1.5 rounded-lg border border-(--admin-input-border) flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      {dayStr}, {dateStr}
                    </span>
                    <Button
                      size="sm"
                      onClick={exportStudentsCSV}
                      variant="outline"
                      className="h-8 text-xs border-(--admin-input-border) text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-nav-hover-bg)"
                    >
                      <Download className="h-3 w-3 mr-1" /> Export CSV
                    </Button>
                  </div>
                </div>

                {/* 6 Key Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
                  {[
                    {
                      label: "Total Interns",
                      value: profiles.length,
                      icon: Users,
                      color: "text-blue-500",
                      bg: "bg-blue-500/10",
                      border: "border-blue-500/20",
                      action: () => setActiveSection("interns"),
                    },
                    {
                      label: "Active Interns",
                      value: activeCount,
                      icon: BookOpen,
                      color: "text-cyan-500",
                      bg: "bg-cyan-500/10",
                      border: "border-cyan-500/20",
                      action: () => setActiveSection("interns"),
                    },
                    {
                      label: "Pending Applications",
                      value: pendingApps,
                      icon: Clock,
                      color: "text-amber-500",
                      bg: "bg-amber-500/10",
                      border: "border-amber-500/20",
                      action: () => setActiveSection("applications"),
                    },
                    {
                      label: "Completed",
                      value: completedCount,
                      icon: CheckCircle2,
                      color: "text-emerald-500",
                      bg: "bg-emerald-500/10",
                      border: "border-emerald-500/20",
                      action: () => setActiveSection("interns"),
                    },
                    {
                      label: "Pending Reviews",
                      value: pendingSubs.length,
                      icon: ClipboardList,
                      color: "text-purple-500",
                      bg: "bg-purple-500/10",
                      border: "border-purple-500/20",
                      action: () => setActiveSection("tasks"),
                    },
                    {
                      label: "Certificates Released",
                      value: certsIssued,
                      icon: Award,
                      color: "text-rose-500",
                      bg: "bg-rose-500/10",
                      border: "border-rose-500/20",
                      action: () => setActiveSection("certificates"),
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      onClick={stat.action}
                      className="cursor-pointer bg-(--admin-card) border border-(--admin-card-border) rounded-xl p-4 hover:border-blue-500/40 hover:shadow-xs transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-(--admin-text-muted) group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-(--admin-text) tracking-tight">
                          {stat.value}
                        </div>
                        <div className="text-[11px] text-(--admin-text-muted) font-medium truncate">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analytical Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Registration Trend (2 cols) */}
                  <div className="lg:col-span-2 bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-(--admin-card-border)/50 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-(--admin-text) flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" /> Registration Velocity
                        </h3>
                        <p className="text-[11px] text-(--admin-text-muted)">
                          Candidate enrollments mapped over the past 6 calendar months
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        6 Months Trend
                      </Badge>
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={registrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"} vertical={false} />
                        <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} />
                        <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0d1f3c" : "#ffffff",
                            borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                            borderRadius: "10px",
                            fontSize: "12px",
                            color: isDark ? "#ffffff" : "#0f172a",
                          }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#regGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Completion Rate (1 col) */}
                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="border-b border-(--admin-card-border)/50 pb-3">
                      <h3 className="text-sm font-bold text-(--admin-text) flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan-500" /> Completion Ratio
                      </h3>
                      <p className="text-[11px] text-(--admin-text-muted)">Cohort progression distribution</p>
                    </div>

                    <div className="relative">
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <Pie data={completionData} cx="50%" cy="50%" innerRadius={58} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                            {completionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#0d1f3c" : "#ffffff",
                              borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                              borderRadius: "10px",
                              fontSize: "12px",
                              color: isDark ? "#ffffff" : "#0f172a",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-2xl font-black text-(--admin-text)">{completionRate}%</div>
                          <div className="text-[10px] text-(--admin-text-muted) font-semibold uppercase tracking-wider">Completed</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {completionData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-(--admin-input)">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-(--admin-text-secondary) text-[11px] truncate">{d.name}</span>
                          <span className="text-(--admin-text) font-bold text-[11px] ml-auto">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Domain Distribution Bar Chart */}
                <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-(--admin-card-border)/50 pb-3">
                    <h3 className="text-sm font-bold text-(--admin-text) flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" /> Domain Enrollment Distribution
                    </h3>
                    <span className="text-[11px] text-(--admin-text-muted) font-mono">
                      {domainData.reduce((acc, curr) => acc + curr.count, 0)} Total Enrollments
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={domainData} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"} vertical={false} />
                      <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} interval={0} />
                      <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#0d1f3c" : "#ffffff",
                          borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                          borderRadius: "10px",
                          fontSize: "12px",
                          color: isDark ? "#ffffff" : "#0f172a",
                        }}
                        formatter={(value: number, _name: string, props: any) => [value, props.payload.fullName]}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {domainData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Interns Table */}
                <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-(--admin-card-border)/50 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-(--admin-text) flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" /> Recently Enrolled Candidates
                      </h3>
                      <p className="text-[11px] text-(--admin-text-muted)">Latest registrations across all internship tracks</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveSection("interns")}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                    >
                      View All Directory <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--admin-card-border) text-(--admin-text-muted) uppercase text-[10px] font-bold">
                          <th className="text-left py-2.5 px-3">Candidate</th>
                          <th className="text-left py-2.5 px-3 hidden md:table-cell">ID Code</th>
                          <th className="text-left py-2.5 px-3">Domain</th>
                          <th className="text-left py-2.5 px-3 hidden sm:table-cell">Duration</th>
                          <th className="text-left py-2.5 px-3">Status</th>
                          <th className="text-left py-2.5 px-3">Progress</th>
                          <th className="text-right py-2.5 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--admin-card-border)/50">
                        {recentInterns.map((intern) => {
                          const s = intern.student;
                          const ta = approvedCountByStudent.get(intern.student_id) ?? 0;
                          const tt = getRequiredTaskCount(intern.domain?.slug, intern.duration);
                          const pr = tt > 0 ? Math.round((ta / tt) * 100) : 0;

                          return (
                            <tr key={intern.id} className="hover:bg-(--admin-table-hover) transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="h-7 w-7 ring-1 ring-blue-500/20 shrink-0">
                                    <AvatarFallback className="bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                                      {getInitials(s?.full_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-(--admin-text) truncate">{s?.full_name ?? "-"}</div>
                                    <div className="text-[10px] text-(--admin-text-muted) truncate">{s?.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-(--admin-text-secondary) hidden md:table-cell">
                                {intern.internship_code}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                  {intern.domain?.name ?? "-"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-(--admin-text-secondary) hidden sm:table-cell">
                                {intern.duration ?? "-"}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[intern.status] ?? ""}`}>
                                  {intern.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <Progress value={pr} className="h-1.5 w-14 bg-(--admin-progress-bg)" />
                                  <span className="text-[10px] font-mono text-(--admin-text-secondary)">{pr}%</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setActiveSection("interns")}
                                  className="h-7 w-7 p-0 text-(--admin-text-secondary) hover:text-(--admin-text)"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                2. STUDENT DIRECTORY (INTERNS)
               ============================================================== */}
            {activeSection === "interns" && (
              <div className="space-y-4">
                {/* Header & Tool Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <div>
                    <h2 className="text-base font-bold text-(--admin-text) tracking-tight">
                      Student Directory ({enrichedStudents.length})
                    </h2>
                    <p className="text-xs text-(--admin-text-muted)">
                      Complete roster of registered candidates and internship progress records.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reload()}
                      className="h-8 text-xs border-(--admin-input-border) text-(--admin-text-secondary) hover:text-(--admin-text)"
                    >
                      <RotateCw className="h-3 w-3 mr-1" /> Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={exportStudentsCSV}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-3 w-3 mr-1" /> Export CSV
                    </Button>
                  </div>
                </div>

                {/* Filter Desk */}
                <div className="p-3.5 rounded-xl bg-(--admin-card) border border-(--admin-card-border) flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--admin-text-muted)" />
                    <input
                      placeholder="Filter candidate, email, ID, or college..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-8 rounded-lg border border-(--admin-input-border) bg-(--admin-input) pl-8 pr-3 text-xs text-(--admin-text) placeholder-(--admin-text-muted) focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="h-8 rounded-lg border border-(--admin-input-border) bg-(--admin-input) px-2.5 text-xs text-(--admin-text) focus:outline-none"
                  >
                    <option value="all">All Domains</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-8 rounded-lg border border-(--admin-input-border) bg-(--admin-input) px-2.5 text-xs text-(--admin-text) focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={filterDuration}
                    onChange={(e) => setFilterDuration(e.target.value)}
                    className="h-8 rounded-lg border border-(--admin-input-border) bg-(--admin-input) px-2.5 text-xs text-(--admin-text) focus:outline-none"
                  >
                    <option value="all">All Durations</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                  </select>

                  {(searchTerm || filterDomain !== "all" || filterStatus !== "all" || filterDuration !== "all") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-rose-500 hover:bg-rose-500/10"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterDomain("all");
                        setFilterStatus("all");
                        setFilterDuration("all");
                      }}
                    >
                      <X className="h-3 w-3 mr-1" /> Reset
                    </Button>
                  )}
                </div>

                {/* Directory Table */}
                <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--admin-card-border) bg-(--admin-input)/50 text-(--admin-text-muted) uppercase text-[10px] font-bold">
                          <th className="text-left py-3 px-3">Avatar</th>
                          <th className="text-left py-3 px-3">Candidate</th>
                          <th className="text-left py-3 px-3 hidden md:table-cell">ID Code</th>
                          <th className="text-left py-3 px-3 hidden lg:table-cell">Academic College</th>
                          <th className="text-left py-3 px-3">Domain</th>
                          <th className="text-left py-3 px-3 hidden sm:table-cell">Duration</th>
                          <th className="text-left py-3 px-3">Status</th>
                          <th className="text-left py-3 px-3">Progress</th>
                          <th className="text-right py-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--admin-card-border)/50">
                        {enrichedStudents.map((s) => {
                          const i = s.internship;
                          const ta = approvedCountByStudent.get(s.id) ?? 0;
                          const tt = getRequiredTaskCount(i?.domain?.slug, i?.duration);
                          const pr = tt > 0 ? Math.round((ta / tt) * 100) : 0;

                          return (
                            <tr key={s.id} className="hover:bg-(--admin-table-hover) transition-colors">
                              <td className="py-2.5 px-3">
                                <LazyAvatar
                                  profileId={s.id}
                                  name={s.full_name}
                                  src={profilePhotos[s.id] ?? null}
                                  onReveal={revealPhoto}
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-(--admin-text) truncate">{s.full_name ?? "-"}</div>
                                <div className="text-[10px] text-(--admin-text-muted) truncate">{s.email}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-(--admin-text-secondary) hidden md:table-cell">
                                {i?.internship_code ?? "-"}
                              </td>
                              <td className="py-2.5 px-3 text-(--admin-text-secondary) max-w-[160px] truncate hidden lg:table-cell">
                                {s.college ?? "-"}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                  {s.resolvedDomain || "-"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-(--admin-text-secondary) hidden sm:table-cell">
                                {i?.duration ?? "-"}
                              </td>
                              <td className="py-2.5 px-3">
                                {i ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[i.status] ?? ""}`}>
                                    {i.status}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-(--admin-text-muted)">No App</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {i ? (
                                  <div className="flex items-center gap-1.5">
                                    <Progress value={pr} className="h-1.5 w-12 bg-(--admin-progress-bg)" />
                                    <span className="text-[10px] font-mono text-(--admin-text-secondary)">
                                      {ta}/{tt}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-(--admin-text-muted)">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* View Profile Dialog */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-(--admin-text-secondary) hover:text-(--admin-text)"
                                        title="View Student File"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg bg-(--admin-dialog) border-(--admin-dialog-border)">
                                      <DialogHeader>
                                        <DialogTitle className="text-base text-(--admin-text) flex items-center gap-2">
                                          <Users className="h-4 w-4 text-blue-500" /> {s.full_name ?? "Student Profile"}
                                        </DialogTitle>
                                      </DialogHeader>

                                      <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pt-2">
                                        <div className="p-3.5 rounded-xl bg-(--admin-input) border border-(--admin-card-border) space-y-2">
                                          <div className="font-bold text-[10px] uppercase text-(--admin-text-muted)">
                                            Personal & Academic
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div><span className="text-(--admin-text-muted)">Email:</span> <span className="font-medium text-(--admin-text)">{s.email}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Phone:</span> <span className="font-medium text-(--admin-text)">{s.phone ?? "-"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">College:</span> <span className="font-medium text-(--admin-text)">{s.college ?? "-"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Dept:</span> <span className="font-medium text-(--admin-text)">{s.department ?? "-"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Grad Year:</span> <span className="font-medium text-(--admin-text)">{s.year ?? "-"}</span></div>
                                          </div>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-(--admin-input) border border-(--admin-card-border) space-y-2">
                                          <div className="font-bold text-[10px] uppercase text-(--admin-text-muted)">
                                            Internship Record
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div><span className="text-(--admin-text-muted)">Code:</span> <span className="font-mono font-semibold text-(--admin-text)">{i?.internship_code ?? "-"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Domain:</span> <span className="font-medium text-(--admin-text)">{s.resolvedDomain || "-"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Duration:</span> <span className="font-medium text-(--admin-text)">{i?.duration ?? "-"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Tasks Completed:</span> <span className="font-bold text-blue-500">{ta}/{tt} tasks</span></div>
                                            <div><span className="text-(--admin-text-muted)">Offer Code:</span> <span className="font-mono text-[11px] text-(--admin-text)">{i?.offer_letter_code ?? "Pending"}</span></div>
                                            <div><span className="text-(--admin-text-muted)">Certificate:</span> <span className="font-mono text-[11px] text-(--admin-text)">{i?.certificate_code ?? "Pending"}</span></div>
                                          </div>
                                        </div>

                                        {(s.github_url || s.linkedin_url) && (
                                          <div className="p-3.5 rounded-xl bg-(--admin-input) border border-(--admin-card-border) space-y-2">
                                            <div className="font-bold text-[10px] uppercase text-(--admin-text-muted)">
                                              Professional Links
                                            </div>
                                            <div className="space-y-1.5 text-xs">
                                              {s.github_url && (
                                                <a href={s.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline">
                                                  <Github className="h-3.5 w-3.5" /> {s.github_url}
                                                </a>
                                              )}
                                              {s.linkedin_url && (
                                                <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline">
                                                  <Linkedin className="h-3.5 w-3.5" /> {s.linkedin_url}
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {/* Quick Approval / Rejection if pending */}
                                  {i?.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => updateStatus(i.id, "active")}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-[10px] text-rose-500 border-rose-500/30"
                                        onClick={() => updateStatus(i.id, "cancelled")}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}

                                  {/* Delete student */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeStudent(s.id)}
                                    className="h-7 w-7 p-0 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                                    title="Delete candidate"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {enrichedStudents.length === 0 && (
                          <tr>
                            <td colSpan={9} className="text-center py-10 text-(--admin-text-muted) text-xs">
                              No matching candidates found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                3. APPLICATIONS
               ============================================================== */}
            {activeSection === "applications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <div>
                    <h2 className="text-base font-bold text-(--admin-text) tracking-tight">
                      Enrollment Applications ({internships.length})
                    </h2>
                    <p className="text-xs text-(--admin-text-muted)">
                      Review new registrations and issue initial offer letters.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pendingApps} Pending Review
                  </Badge>
                </div>

                <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--admin-card-border) bg-(--admin-input)/50 text-(--admin-text-muted) uppercase text-[10px] font-bold">
                          <th className="text-left py-3 px-3">Code</th>
                          <th className="text-left py-3 px-3">Student Name</th>
                          <th className="text-left py-3 px-3">Domain Track</th>
                          <th className="text-left py-3 px-3">Duration</th>
                          <th className="text-left py-3 px-3">Status</th>
                          <th className="text-right py-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--admin-card-border)/50">
                        {internships.map((i) => (
                          <tr key={i.id} className="hover:bg-(--admin-table-hover) transition-colors">
                            <td className="py-2.5 px-3 font-mono font-medium text-(--admin-text)">
                              {i.internship_code}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-(--admin-text)">{i.student?.full_name ?? "-"}</div>
                              <div className="text-[10px] text-(--admin-text-muted)">{i.student?.email}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {i.domain?.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-(--admin-text-secondary)">{i.duration}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[i.status] ?? ""}`}>
                                {i.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {i.status === "pending" ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => updateStatus(i.id, "active")}
                                  >
                                    Approve & Enroll
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-(--admin-input-border) text-rose-500 hover:bg-rose-500/10"
                                    onClick={() => updateStatus(i.id, "cancelled")}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-(--admin-text-muted)">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                4. TASK SUBMISSIONS REVIEW
               ============================================================== */}
            {activeSection === "tasks" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <div>
                    <h2 className="text-base font-bold text-(--admin-text) tracking-tight">
                      Task Submissions Desk ({submissions.length})
                    </h2>
                    <p className="text-xs text-(--admin-text-muted)">
                      Evaluate milestone deliverables, code repositories, and reports.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-(--admin-input) p-1 rounded-lg border border-(--admin-input-border) text-xs">
                    {(
                      [
                        { id: "all", label: "All" },
                        { id: "pending", label: `In Review (${pendingSubs.length})` },
                        { id: "resubmit", label: "Needs Revision" },
                        { id: "approved", label: "Approved" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setTaskFilterStatus(tab.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          taskFilterStatus === tab.id
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-(--admin-text-secondary) hover:text-(--admin-text)"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12 bg-(--admin-card) border border-(--admin-card-border) rounded-2xl space-y-2">
                    <CheckSquare className="h-8 w-8 text-(--admin-text-muted) mx-auto" />
                    <p className="text-sm font-semibold text-(--admin-text)">No task submissions found</p>
                    <p className="text-xs text-(--admin-text-muted)">Try adjusting your status filter or search criteria.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSubmissions.map((s) => {
                    const tasks = getTasksForSlug(s.internship?.domain?.slug);
                    const taskMeta = tasks.find((t) => t.no === s.task_no);

                    return (
                      <div
                        key={s.id}
                        className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3.5 shadow-xs hover:border-blue-500/30 transition-all"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-(--admin-input) text-(--admin-text-secondary)">
                                Task {s.task_no}
                              </span>
                              <span className="font-mono text-[10px] text-(--admin-text-muted)">
                                {s.internship?.internship_code}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[s.status] ?? ""}`}>
                                {s.status === "pending_review" ? "In Review" : s.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-(--admin-text) tracking-tight pt-1">
                              {taskMeta?.title ?? `Task ${s.task_no}`}
                            </h4>
                            <p className="text-xs text-(--admin-text-secondary)">
                              {s.internship?.student?.full_name ?? "Candidate"} • {s.internship?.domain?.name ?? "Domain"}
                            </p>
                          </div>

                          <ReviewDialog onReview={(status, fb) => reviewSubmission(s.id, status, fb)} />
                        </div>

                        {/* Deliverable URLs */}
                        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                          {s.task_no === 1 && s.project_url && (
                            <a
                              href={s.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:underline border border-blue-500/20"
                            >
                              <Linkedin className="h-3 w-3" /> LinkedIn Post
                            </a>
                          )}
                          {s.github_url && (
                            <a
                              href={s.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--admin-input) text-blue-600 dark:text-blue-400 hover:underline border border-(--admin-input-border)"
                            >
                              <Github className="h-3 w-3" /> Code Repo
                            </a>
                          )}
                          {s.task_no !== 1 && s.project_url && (
                            <a
                              href={s.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--admin-input) text-blue-600 dark:text-blue-400 hover:underline border border-(--admin-input-border)"
                            >
                              <ExternalLink className="h-3 w-3" /> Live Demo
                            </a>
                          )}
                          {s.drive_url && (
                            <a
                              href={s.drive_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--admin-input) text-blue-600 dark:text-blue-400 hover:underline border border-(--admin-input-border)"
                            >
                              <FolderOpen className="h-3 w-3" /> Drive Assets
                            </a>
                          )}
                        </div>

                        {/* Implementation notes */}
                        {s.notes && (
                          <div className="p-2.5 rounded-xl bg-(--admin-input) border border-(--admin-input-border) text-xs text-(--admin-text-secondary)">
                            <span className="font-semibold text-(--admin-text)">Student Notes: </span>
                            {s.notes}
                          </div>
                        )}

                        {/* Existing Feedback */}
                        {s.feedback && (
                          <div className="p-2.5 rounded-xl bg-(--admin-feedback-bg) border border-(--admin-card-border) text-xs space-y-0.5">
                            <span className="font-semibold text-(--admin-text-muted) flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Reviewer Remarks:
                            </span>
                            <p className="text-(--admin-feedback-text) italic">&ldquo;{s.feedback}&rdquo;</p>
                          </div>
                        )}

                        <div className="text-[10px] text-(--admin-text-muted) pt-1">
                          Submitted: {new Date(s.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==============================================================
                5. PROJECT SUBMISSIONS
               ============================================================== */}
            {activeSection === "submissions" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text)">
                    Project Submissions ({projectSubmissions.length})
                  </h2>
                  <p className="text-xs text-(--admin-text-muted)">
                    Evaluations for independent portfolio assignments.
                  </p>
                </div>

                {projectSubmissions.length === 0 && (
                  <p className="text-xs text-(--admin-text-muted) text-center py-10 bg-(--admin-card) border border-(--admin-card-border) rounded-xl">
                    No project submissions found.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectSubmissions.map((ps) => (
                    <div
                      key={ps.id}
                      className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-(--admin-text)">{ps.project?.title}</div>
                          <div className="text-xs text-(--admin-text-muted)">
                            {ps.student?.full_name} ({ps.student?.email})
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[ps.status] ?? ""}`}>
                          {ps.status}
                        </span>
                      </div>

                      {ps.github_url && (
                        <a
                          href={ps.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                        >
                          <Github className="h-3 w-3" /> {ps.github_url}
                        </a>
                      )}

                      {ps.notes && <p className="text-xs text-(--admin-text-secondary)">{ps.notes}</p>}

                      {ps.status === "pending" && (
                        <ReviewDialog onReview={(status, fb) => reviewProjectSubmission(ps.id, status as any, fb)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==============================================================
                6. OFFER LETTERS
               ============================================================== */}
            {activeSection === "offers" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text)">Offer Letters Management</h2>
                  <p className="text-xs text-(--admin-text-muted)">
                    Download official PDF offer letters or transmit them to verified intern inboxes.
                  </p>
                </div>

                <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--admin-card-border) bg-(--admin-input)/50 text-(--admin-text-muted) uppercase text-[10px] font-bold">
                          <th className="text-left py-3 px-3">Intern ID</th>
                          <th className="text-left py-3 px-3">Candidate</th>
                          <th className="text-left py-3 px-3">Domain</th>
                          <th className="text-left py-3 px-3">Offer Code</th>
                          <th className="text-right py-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--admin-card-border)/50">
                        {internships
                          .filter((i) => i.status === "active" || i.status === "completed")
                          .map((i) => (
                            <tr key={i.id} className="hover:bg-(--admin-table-hover) transition-colors">
                              <td className="py-2.5 px-3 font-mono font-medium text-(--admin-text)">
                                {i.internship_code}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-(--admin-text)">{i.student?.full_name}</td>
                              <td className="py-2.5 px-3 text-(--admin-text-secondary)">{i.domain?.name}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-blue-500 font-semibold">
                                {i.offer_letter_code ?? "-"}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-(--admin-text-secondary) hover:text-(--admin-text)"
                                    onClick={() =>
                                      viewOfferLetterFromStorage(i.student_id).catch((err) =>
                                        toast.error("View failed: " + (err?.message ?? "Unknown error"))
                                      )
                                    }
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-(--admin-input-border) text-blue-500 hover:text-blue-600"
                                    onClick={() =>
                                      downloadOfferLetterAnywhere({
                                        studentId: i.student_id,
                                        fullName: i.student?.full_name ?? "Intern",
                                        domain: i.domain?.name ?? "",
                                        domainSlug: i.domain?.slug,
                                        internshipCode: i.internship_code,
                                        offerCode: i.offer_letter_code,
                                        startedAt: i.started_at,
                                        duration: i.duration,
                                      }).catch((err) => toast.error("Download failed: " + (err?.message ?? "Unknown error")))
                                    }
                                  >
                                    Download
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={sendingEmail === `ol-${i.id}`}
                                    onClick={() => handleSendOfferLetterEmail(i)}
                                  >
                                    {sendingEmail === `ol-${i.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Send Email"
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                7. ID CARDS
               ============================================================== */}
            {activeSection === "idcards" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text)">Official Intern ID Cards</h2>
                  <p className="text-xs text-(--admin-text-muted)">
                    Generate and download verified identification passes for active interns.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {internships
                    .filter((i) => i.status === "active")
                    .map((i) => (
                      <div
                        key={i.id}
                        className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                              {getInitials(i.student?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-sm text-(--admin-text)">{i.student?.full_name ?? "-"}</div>
                            <div className="font-mono text-xs text-blue-500 font-semibold">{i.internship_code}</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-(--admin-input) border border-(--admin-input-border) text-xs space-y-1">
                          <div>
                            <span className="text-(--admin-text-muted)">Track:</span>{" "}
                            <span className="font-semibold text-(--admin-text)">{i.domain?.name ?? "-"}</span>
                          </div>
                          <div>
                            <span className="text-(--admin-text-muted)">Period:</span>{" "}
                            <span className="font-medium text-(--admin-text)">{i.duration ?? "-"}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                          onClick={async () => {
                            let photoDataUrl: string | undefined =
                              profilePhotos[i.student_id] ?? (await fetchPhoto(i.student_id)) ?? undefined;
                            downloadIdCard({
                              fullName: i.student?.full_name ?? "Intern",
                              internshipCode: i.internship_code ?? "",
                              domain: i.domain?.name ?? "",
                              photoDataUrl,
                              email: i.student?.email,
                              duration: i.duration,
                            }).catch((err) => toast.error("Download failed: " + (err?.message ?? "Unknown error")));
                          }}
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Download ID Card
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ==============================================================
                8. CERTIFICATES
               ============================================================== */}
            {activeSection === "certificates" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text)">Certificate Issuance & Revocation Desk</h2>
                  <p className="text-xs text-(--admin-text-muted)">
                    Issue verified completion credentials, manage revocations, and re-issue authorized certificates.
                  </p>
                </div>

                {/* Eligible Candidates for Certification */}
                {internships.filter((i) => {
                  if (i.certificate_code) return false;
                  if (i.certificate_status === "revoked") return false;
                  const approved = approvedCountByInternship.get(i.id) ?? 0;
                  const required = requiredCountByInternship.get(i.id) ?? 5;
                  return approved >= required;
                }).length > 0 && (
                  <div className="bg-(--admin-card) border border-emerald-500/30 rounded-2xl p-5 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-(--admin-text)">
                        Milestone Complete — Ready for Certification
                      </h3>
                    </div>

                    <div className="divide-y divide-(--admin-card-border)/50">
                      {internships
                        .filter((i) => {
                          if (i.certificate_code) return false;
                          if (i.certificate_status === "revoked") return false;
                          const approved = approvedCountByInternship.get(i.id) ?? 0;
                          const required = requiredCountByInternship.get(i.id) ?? 5;
                          return approved >= required;
                        })
                        .map((i) => {
                          const ta = approvedCountByInternship.get(i.id) ?? 0;
                          const required = requiredCountByInternship.get(i.id) ?? 5;

                          return (
                            <div key={i.id} className="flex items-center justify-between gap-3 py-3">
                              <div>
                                <span className="font-semibold text-xs text-(--admin-text)">
                                  {i.student?.full_name}
                                </span>
                                <span className="text-[11px] font-mono text-(--admin-text-muted) ml-2">
                                  {i.internship_code}
                                </span>
                                <span className="text-[11px] text-blue-500 font-medium ml-2">
                                  {i.domain?.name}
                                </span>
                                <span className="text-[11px] text-emerald-600 font-bold ml-2">
                                  {ta}/{required} tasks approved
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => issueCertificate(i.id)}
                              >
                                <Award className="h-3.5 w-3.5 mr-1" /> Issue Certificate
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Issued Certificates */}
                <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-(--admin-card-border) flex items-center justify-between">
                    <h3 className="text-sm font-bold text-(--admin-text) flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" /> Issued Certificates ({certsIssued})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--admin-card-border) bg-(--admin-input)/50 text-(--admin-text-muted) uppercase text-[10px] font-bold">
                          <th className="text-left py-3 px-3">Intern ID</th>
                          <th className="text-left py-3 px-3">Candidate</th>
                          <th className="text-left py-3 px-3">Domain</th>
                          <th className="text-left py-3 px-3">Certificate Code</th>
                          <th className="text-left py-3 px-3">Issued Date</th>
                          <th className="text-right py-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--admin-card-border)/50">
                        {internships
                          .filter((i) => i.certificate_code)
                          .map((i) => (
                            <tr key={i.id} className="hover:bg-(--admin-table-hover) transition-colors">
                              <td className="py-2.5 px-3 font-mono font-medium text-(--admin-text)">
                                {i.internship_code}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-(--admin-text)">{i.student?.full_name}</td>
                              <td className="py-2.5 px-3 text-(--admin-text-secondary)">{i.domain?.name}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {i.certificate_code}
                              </td>
                              <td className="py-2.5 px-3 text-(--admin-text-secondary)">
                                {i.certificate_issued_at ? new Date(i.certificate_issued_at).toLocaleDateString() : "-"}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-(--admin-input-border) text-blue-500 hover:text-blue-600"
                                    onClick={() =>
                                      downloadCertificate({
                                        fullName: i.student?.full_name ?? "Intern",
                                        domain: i.domain?.name ?? "",
                                        internshipCode: i.internship_code,
                                        certificateCode: i.certificate_code,
                                        issuedAt: i.certificate_issued_at,
                                        duration: i.duration,
                                      }).catch((err) => {
                                        console.error("[certificate-download]", err);
                                        toast.error("Download failed");
                                      })
                                    }
                                  >
                                    Download
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={sendingEmail === `cert-${i.id}`}
                                    onClick={() => handleSendCertificateEmail(i)}
                                  >
                                    {sendingEmail === `cert-${i.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Send"
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-xs"
                                    onClick={() =>
                                      setRevokeTarget({
                                        id: i.id,
                                        name: i.student?.full_name ?? "Intern",
                                        code: i.certificate_code ?? "",
                                      })
                                    }
                                  >
                                    Revoke
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Revoked Certificates */}
                {internships.filter((i) => i.certificate_status === "revoked").length > 0 && (
                  <div className="bg-(--admin-card) border border-rose-500/30 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-3 border-b border-(--admin-card-border)">
                      <h3 className="text-sm font-bold text-rose-500">
                        Revoked Certificates ({internships.filter((i) => i.certificate_status === "revoked").length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-(--admin-card-border) bg-(--admin-input)/50 text-(--admin-text-muted) uppercase text-[10px] font-bold">
                            <th className="text-left py-3 px-3">Intern ID</th>
                            <th className="text-left py-3 px-3">Candidate</th>
                            <th className="text-left py-3 px-3">Domain</th>
                            <th className="text-left py-3 px-3">Revoked Date</th>
                            <th className="text-left py-3 px-3">Reason</th>
                            <th className="text-right py-3 px-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-(--admin-card-border)/50">
                          {internships
                            .filter((i) => i.certificate_status === "revoked")
                            .map((i) => {
                              const ta = approvedCountByInternship.get(i.id) ?? 0;
                              const required = requiredCountByInternship.get(i.id) ?? 5;
                              const canReissue = ta >= required;

                              return (
                                <tr key={i.id} className="hover:bg-(--admin-table-hover)">
                                  <td className="py-2.5 px-3 font-mono font-medium text-(--admin-text)">
                                    {i.internship_code}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-(--admin-text)">{i.student?.full_name}</td>
                                  <td className="py-2.5 px-3 text-(--admin-text-secondary)">{i.domain?.name}</td>
                                  <td className="py-2.5 px-3 text-rose-400 font-medium">
                                    {i.certificate_revoked_at
                                      ? new Date(i.certificate_revoked_at).toLocaleDateString()
                                      : "-"}
                                  </td>
                                  <td className="py-2.5 px-3 text-(--admin-text-muted) max-w-[200px] truncate">
                                    {i.certificate_revoke_reason || "-"}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <Button
                                      size="sm"
                                      disabled={!canReissue}
                                      className={`h-7 text-xs text-white ${
                                        canReissue ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-400 cursor-not-allowed"
                                      }`}
                                      onClick={() => setReissueTarget({ id: i.id, name: i.student?.full_name ?? "Intern" })}
                                    >
                                      Re-Issue
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Revoke Confirmation Dialog */}
                <Dialog
                  open={!!revokeTarget}
                  onOpenChange={(open) => {
                    if (!open) {
                      setRevokeTarget(null);
                      setRevokeReason("");
                    }
                  }}
                >
                  <DialogContent className="bg-(--admin-dialog) border border-(--admin-dialog-border) max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base font-bold text-rose-500">Revoke Credential</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-1 text-xs">
                      <p className="text-(--admin-text-secondary) leading-relaxed">
                        Are you certain you wish to revoke certificate authorization for{" "}
                        <strong>{revokeTarget?.name}</strong>?
                      </p>
                      {revokeTarget?.code && (
                        <p className="font-mono text-blue-500 font-semibold">Certificate: {revokeTarget.code}</p>
                      )}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        Revocation disables verification and download access immediately.
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-(--admin-text-secondary)">
                          Revocation Reason <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                          rows={3}
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          placeholder="State the justification for credential revocation..."
                          className="bg-(--admin-input) border-(--admin-input-border) text-(--admin-text)"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRevokeTarget(null);
                            setRevokeReason("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!revokeReason.trim() || revoking}
                          onClick={revokeCertificate}
                        >
                          {revoking ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Confirm Revocation
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Re-Issue Confirmation Dialog */}
                <Dialog
                  open={!!reissueTarget}
                  onOpenChange={(open) => {
                    if (!open) setReissueTarget(null);
                  }}
                >
                  <DialogContent className="bg-(--admin-dialog) border border-(--admin-dialog-border) max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base font-bold text-amber-500">Re-Issue Certificate</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-1 text-xs">
                      <p className="text-(--admin-text-secondary)">
                        Generate a fresh certificate for <strong>{reissueTarget?.name}</strong>?
                      </p>
                      <div className="flex gap-2 justify-end pt-2">
                        <Button variant="outline" size="sm" onClick={() => setReissueTarget(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          disabled={reissuing}
                          onClick={reissueCertificate}
                        >
                          {reissuing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Re-Issue Certificate
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* ==============================================================
                9. FEEDBACK
               ============================================================== */}
            {activeSection === "feedback" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text) flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" /> Student Program Reviews ({feedbackList.length})
                  </h2>
                  <p className="text-xs text-(--admin-text-muted)">
                    Moderate ratings and testimonials visible on the official public portal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbackList.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < fb.rating ? "fill-amber-400 text-amber-400" : "text-(--admin-text-muted)"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          fb.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : fb.status === "rejected"
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>
                          {fb.status === "approved" ? "Approved" : fb.status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      </div>

                      <p className="text-xs text-(--admin-feedback-text) leading-relaxed">&ldquo;{fb.message}&rdquo;</p>
                      <div className="text-[11px] text-(--admin-text-muted)">
                        {fb.student?.full_name ?? "Intern"} • {new Date(fb.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2 pt-1">
                        {fb.status !== "approved" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => approveFeedback(fb.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Approve for Web
                          </Button>
                        )}
                        {fb.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                            onClick={() => rejectFeedback(fb.id)}
                          >
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==============================================================
                10. ANNOUNCEMENTS
               ============================================================== */}
            {activeSection === "announcements" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text)">Cohort Announcements</h2>
                  <p className="text-xs text-(--admin-text-muted)">Broadcast messages to student account dashboards.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 space-y-4 h-fit shadow-xs">
                    <h3 className="text-sm font-bold text-(--admin-text) flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-blue-500" /> Draft Announcement
                    </h3>
                    <form onSubmit={handleAnnouncementSubmit} className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <Label htmlFor="ann-title">Title</Label>
                        <Input
                          id="ann-title"
                          name="title"
                          placeholder="E.g. Final Milestone Evaluation Schedule..."
                          required
                          className="bg-(--admin-input) text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="ann-body">Announcement Body</Label>
                        <Textarea
                          id="ann-body"
                          name="body"
                          rows={4}
                          placeholder="Write the full message text for candidates..."
                          className="bg-(--admin-input) text-xs"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                        Publish Announcement
                      </Button>
                    </form>
                  </div>

                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 space-y-3 shadow-xs">
                    <h3 className="text-sm font-bold text-(--admin-text)">Published Feed ({announcements.length})</h3>
                    {announcements.length === 0 && (
                      <p className="text-xs text-(--admin-text-muted) text-center py-8">No announcements posted yet.</p>
                    )}
                    <div className="space-y-2.5">
                      {announcements.map((a) => (
                        <div
                          key={a.id}
                          className="p-3.5 rounded-xl border border-(--admin-card-border) flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <h5 className="font-bold text-(--admin-text)">{a.title}</h5>
                            {a.body && <p className="text-(--admin-text-secondary) leading-relaxed">{a.body}</p>}
                            <div className="text-[10px] text-(--admin-text-muted)">
                              {new Date(a.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10"
                            onClick={() => deleteAnnouncement(a.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                11. ENQUIRIES
               ============================================================== */}
            {activeSection === "enquiries" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text) flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" /> Candidate & Visitor Enquiries ({enquiries.length})
                  </h2>
                  <p className="text-xs text-(--admin-text-muted)">Messages received via the contact support desk.</p>
                </div>

                <div className="space-y-3">
                  {enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        enq.status === "new"
                          ? "bg-blue-500/5 border-blue-500/30"
                          : "bg-(--admin-card) border-(--admin-card-border)"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-bold text-(--admin-text)">{enq.name}</span>
                            <span className="font-mono text-[11px] text-(--admin-text-muted)">{enq.email}</span>
                            {enq.status === "new" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-500">
                                New
                              </span>
                            )}
                            {enq.status === "read" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                                Read
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-(--admin-text-secondary) leading-relaxed">{enq.message}</p>
                          <div className="text-[10px] text-(--admin-text-muted)">
                            {new Date(enq.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`mailto:${enq.email}?subject=Reply from YR NOVATECH`}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs bg-blue-600 text-white font-medium hover:bg-blue-700"
                          >
                            <Mail className="h-3 w-3" /> Reply
                          </a>
                          {enq.status === "new" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-(--admin-input-border) text-(--admin-text-secondary)"
                              onClick={() => updateEnquiryStatus(enq.id, "read")}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==============================================================
                12. ANALYTICS
               ============================================================== */}
            {activeSection === "analytics" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-(--admin-card) border border-(--admin-card-border)">
                  <h2 className="text-base font-bold text-(--admin-text)">Program Analytics & Sourcing</h2>
                  <p className="text-xs text-(--admin-text-muted)">
                    Real-time demographics, geographical dispersion, and referral channels.
                  </p>
                </div>

                {/* Funnel Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--admin-text-muted)">
                      Application Funnel
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Total Registered:</span>
                        <span className="font-bold text-(--admin-text)">{profiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Pending Applications:</span>
                        <span className="font-bold text-amber-500">{pendingApps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Active Enrolled:</span>
                        <span className="font-bold text-blue-500">{activeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Completed Milestones:</span>
                        <span className="font-bold text-emerald-500">{completedCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--admin-text-muted)">
                      Submissions Audit
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Total Submitted:</span>
                        <span className="font-bold text-(--admin-text)">{submissions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Approved:</span>
                        <span className="font-bold text-emerald-500">{submissions.filter((s) => s.status === "approved").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Pending Grading:</span>
                        <span className="font-bold text-amber-500">{pendingSubs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Needs Revision:</span>
                        <span className="font-bold text-rose-500">
                          {submissions.filter((s) => s.status === "rejected" || s.status === "resubmit").length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-4.5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--admin-text-muted)">
                      Credentials Ledger
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Certificates Released:</span>
                        <span className="font-bold text-emerald-500">{certsIssued}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Revoked:</span>
                        <span className="font-bold text-rose-500">
                          {internships.filter((i) => i.certificate_status === "revoked").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--admin-text-secondary)">Eligible & Pending:</span>
                        <span className="font-bold text-blue-500">
                          {internships.filter((i) => i.status === "completed" && !i.certificate_code).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Country & Discovery Dispersion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-(--admin-card-border)/50 pb-3">
                      <h4 className="text-xs font-bold text-(--admin-text) uppercase tracking-wider">
                        Geographical Dispersion
                      </h4>
                      <span className="text-[11px] text-(--admin-text-muted)">
                        {filteredCountryData.length} countries
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {filteredCountryData.slice(0, 8).map((item) => (
                        <div key={item.name} className="flex items-center gap-3 text-xs">
                          <span className="w-28 text-(--admin-text) font-medium truncate">{item.name}</span>
                          <div className="flex-1 h-3 bg-(--admin-input) rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${(item.count / (filteredCountryData[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-(--admin-text) w-8 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-(--admin-card) border border-(--admin-card-border) rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-(--admin-card-border)/50 pb-3">
                      <h4 className="text-xs font-bold text-(--admin-text) uppercase tracking-wider">
                        Discovery Referral Channels
                      </h4>
                      <span className="text-[11px] text-(--admin-text-muted)">Candidate Acquisition</span>
                    </div>

                    <div className="space-y-2.5">
                      {filteredDiscoveryData.map((item) => (
                        <div key={item.name} className="flex items-center gap-3 text-xs">
                          <span className="w-28 text-(--admin-text) font-medium truncate">{item.name}</span>
                          <div className="flex-1 h-3 bg-(--admin-input) rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${(item.count / (filteredDiscoveryData[0]?.count || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-(--admin-text) w-8 text-right">{item.count}</span>
                          <span className="text-[10px] text-(--admin-text-muted) w-8 text-right">{item.percent}%</span>
                        </div>
                      ))}
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

function ReviewDialog({
  onReview,
}: {
  onReview: (s: "approved" | "rejected" | "resubmit", fb: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [fb, setFb] = useState("");

  function go(status: "approved" | "rejected" | "resubmit") {
    onReview(status, fb);
    setOpen(false);
    setFb("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7.5 px-3 font-semibold shadow-xs">
          Evaluate
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-(--admin-dialog) border border-(--admin-dialog-border) max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-(--admin-text) flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-500" /> Milestone Review
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5 pt-2 text-xs">
          <div className="space-y-1">
            <Label className="text-(--admin-text-secondary) font-semibold">
              Evaluator Feedback / Revision Guidance (Optional)
            </Label>
            <Textarea
              rows={3}
              value={fb}
              onChange={(e) => setFb(e.target.value)}
              placeholder="Highlight any suggestions, missing test cases, or reasons for revision..."
              className="bg-(--admin-input) border-(--admin-input-border) text-(--admin-text) text-xs"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => go("approved")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
            </Button>
            <Button
              onClick={() => go("resubmit")}
              variant="outline"
              className="flex-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs h-8 font-semibold"
            >
              <RotateCw className="h-3.5 w-3.5 mr-1" /> Revision
            </Button>
            <Button
              onClick={() => go("rejected")}
              variant="destructive"
              className="flex-1 text-xs h-8 font-semibold"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
