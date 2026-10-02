import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { verifyInternship } from "./-verify-internship.serverfn";
import {
  UserPlus,
  FileText,
  Linkedin,
  Code,
  Github,
  ClipboardCheck,
  Award,
  ArrowRight,
  Layers,
  Palette,
  Cpu,
  Terminal,
  Brain,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Check,
  Calendar,
  Clock,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/internship")({
  head: () => ({
    meta: [
      { title: "Project-Based Internship Program | YR NOVATECH" },
      {
        name: "description",
        content:
          "Join YR NOVATECH's project-based internship in Full Stack, UI/UX, C++, Python, and AI. Earn verifiable certificates.",
      },
      { property: "og:title", content: "YR NOVATECH Internship Program" },
      { property: "og:description", content: "Hands-on internships across high-demand tech domains." },
      { property: "og:url", content: "https://www.yrnovatech.in/internship" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/internship" }],
  }),
  component: Internship,
});

const domains = [
  {
    icon: Layers,
    title: "Full Stack Development",
    level: "Web & Systems",
    desc: "Master frontend component architecture, backend REST APIs, database modeling, authentication, and cloud deployment end-to-end.",
    skills: ["React & Next.js", "Node.js / Express", "PostgreSQL / Supabase", "REST API Engineering"],
    project: "Full-Stack SaaS Platform with Role-Based Access",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence",
    level: "AI & Machine Learning",
    desc: "Build practical generative AI applications, vector retrieval augmented generation (RAG) pipelines, and intelligent agent workflows.",
    skills: ["Python & PyTorch", "LangChain & LLM APIs", "Vector DBs (Pinecone/Chroma)", "Data Preprocessing"],
    project: "Context-Aware AI Document Assistant",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    level: "Product Experience",
    desc: "Craft user research archetypes, interactive wireframes, micro-interactions, responsive grids, and design token libraries in Figma.",
    skills: ["Figma & FigJam", "Wireframing & Prototyping", "Design Tokens & WCAG", "User Journey Mapping"],
    project: "Complete Mobile & Web Product Redesign",
  },
  {
    icon: Terminal,
    title: "Python Programming",
    level: "Core & Automation",
    desc: "Deep dive into object-oriented Python, web scraping, asynchronous automation scripts, and high-performance backend APIs with FastAPI.",
    skills: ["Advanced Python 3", "FastAPI & Pydantic", "Automation & Web Scraping", "Data Structures"],
    project: "Automated Data Ingestion & Analytics Pipeline",
  },
  {
    icon: Cpu,
    title: "C++ Programming",
    level: "Systems & DSA",
    desc: "Strengthen low-level problem solving, memory management, algorithms, data structures, and object-oriented architectural patterns.",
    skills: ["C++17 / C++20", "Data Structures & Algorithms", "Memory Management & Pointers", "OOP & System Design"],
    project: "High-Concurrency Order Matching Engine",
  },
];

const programBenefits = [
  {
    title: "100% Free Registration",
    desc: "No upfront fees to apply or work on the structured curriculum.",
  },
  {
    title: "Official Offer Letter",
    desc: "Verified institutional offer letter issued upon onboarding approval.",
  },
  {
    title: "Real GitHub Repositories",
    desc: "Build genuine portfolio projects that impress tech recruiters.",
  },
  {
    title: "Direct Mentor Reviews",
    desc: "Constructive code reviews with actionable technical feedback.",
  },
  {
    title: "Publicly Verifiable Credential",
    desc: "QR-coded, permanent verification link hosted on our platform.",
  },
  {
    title: "Flexible Durations",
    desc: "Choose between 1, 2, or 3-month durations to match your college semester.",
  },
];

const workflow = [
  {
    step: "01",
    icon: UserPlus,
    title: "Registration",
    desc: "Create an account, specify your college/branch, and choose your domain.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Offer Letter",
    desc: "Receive an official signed offer letter confirming your cohort enrolment.",
  },
  {
    step: "03",
    icon: Linkedin,
    title: "Announcement",
    desc: "Share your internship milestone on LinkedIn to build your public developer profile.",
  },
  {
    step: "04",
    icon: Code,
    title: "Project Tasks",
    desc: "Follow clear specification briefs to build milestone deliverables locally.",
  },
  {
    step: "05",
    icon: Github,
    title: "Submission",
    desc: "Submit your GitHub repository and live demonstration links via the dashboard.",
  },
  {
    step: "06",
    icon: ClipboardCheck,
    title: "Review & Feedback",
    desc: "Our engineering mentors evaluate your code quality and task completion.",
  },
  {
    step: "07",
    icon: Award,
    title: "Certificate Issuance",
    desc: "Earn your tamper-proof, publicly verifiable completion certificate with unique ID.",
  },
];

function Internship() {
  const [internshipCode, setInternshipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof verifyInternship>> | null>(null);
  const [error, setError] = useState("");

  async function handleVerify() {
    const code = internshipCode.trim();
    if (!code) {
      setError("Please enter an Internship ID (e.g. YRN-ABC123).");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await verifyInternship({ data: { internshipCode: code } });
      if (res.found) {
        setResult(res);
      } else {
        setError(res.error || "No matching internship found with this ID.");
      }
    } catch {
      setError("Verification service is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Certificate code copied to clipboard!");
  };

  return (
    <>
      {/* Hero Section */}
      <Section className="py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Summer &amp; Fall Cohorts Open</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Project-Based Internship <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Engineered for Real Growth
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Build actual software, receive structured code reviews, and earn tamper-proof verifiable certificates across 5 high-demand engineering tracks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary text-primary-foreground shadow-elegant"
            >
              <Link to="/auth">
                Apply for Internship <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent text-foreground">
              <a href="#verify-section">
                <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                Verify Credential
              </a>
            </Button>
          </div>
        </div>

        {/* Benefits Strip */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {programBenefits.map((b) => (
            <div key={b.title} className="p-3.5 rounded-xl bg-card border border-border/70 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{b.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Domains Section */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Specialization Tracks"
          title="Choose Your Engineering Domain"
          description="Each track is centered on hands-on deliverables that simulate authentic software engineering environments."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {domains.map((d) => (
            <Card
              key={d.title}
              className="flex flex-col justify-between p-6 border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all rounded-2xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <d.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] font-medium border-border/80 bg-accent/40">
                    {d.level}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {d.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {d.desc}
                </p>

                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Core Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {d.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <span className="text-[11px] text-muted-foreground block mb-1">Capstone Deliverable:</span>
                <span className="text-xs font-semibold text-foreground/90">{d.project}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* How the Program Works / Workflow */}
      <Section className="!pt-0">
        <div className="max-w-6xl mx-auto p-8 md:p-12 rounded-3xl bg-secondary/30 border border-border/70">
          <SectionHeading
            eyebrow="Curriculum Journey"
            title="How the Program Works"
            description="Seven guided milestones from registration to your verified credential."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-10">
            {workflow.slice(0, 4).map((w) => (
              <div key={w.step} className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <w.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-black text-muted-foreground/30 font-mono">
                      {w.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1.5 text-foreground">{w.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            {workflow.slice(4).map((w) => (
              <div key={w.step} className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <w.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-black text-muted-foreground/30 font-mono">
                      {w.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1.5 text-foreground">{w.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Internship Verification Section */}
      <Section id="verify-section" className="!pt-0">
        <SectionHeading
          eyebrow="Credential Verification"
          title="Verify an Internship Certificate"
          description="Employers, universities, and partners can independently confirm certificate validity via our public ledger."
        />

        <Card className="max-w-xl mx-auto p-6 md:p-8 border border-border bg-card shadow-sm rounded-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Enter the unique Internship ID shown on the certificate or offer letter.</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. YRN-ABC123"
                value={internshipCode}
                onChange={(e) => {
                  setInternshipCode(e.target.value);
                  setError("");
                  setResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
                disabled={loading}
                className="flex-1 font-mono uppercase h-11 rounded-xl bg-background border-border"
              />
              <Button
                onClick={handleVerify}
                disabled={loading || !internshipCode.trim()}
                className="h-11 px-5 bg-gradient-primary text-primary-foreground font-semibold rounded-xl shadow-elegant"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Verify ID</span>
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 animate-fade-in">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && result.found && (
              <div className="mt-4 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 animate-fade-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Verified Official Record</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                    AUTHENTIC
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Intern Name</span>
                    <p className="font-semibold text-sm mt-0.5 text-foreground">{result.internName}</p>
                  </div>

                  <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Internship ID</span>
                    <p className="font-mono font-bold text-sm mt-0.5 text-primary">{result.internshipCode}</p>
                  </div>

                  <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Domain</span>
                    <p className="font-medium mt-0.5 text-foreground">{result.domain}</p>
                  </div>

                  <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Duration</span>
                    <p className="font-medium mt-0.5 text-foreground">{result.duration}</p>
                  </div>

                  <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Cohort Status</span>
                    <p className="mt-0.5">
                      <Badge
                        variant={
                          result.status === "active"
                            ? "default"
                            : result.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[11px]"
                      >
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Badge>
                    </p>
                  </div>

                  <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">Certificate Status</span>
                    <p className="mt-0.5">
                      {result.certificateIssued ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[11px]">
                          Issued &amp; Certified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px]">In Progress</Badge>
                      )}
                    </p>
                  </div>

                  {result.startedAt && (
                    <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                      <span className="text-muted-foreground text-[10px] uppercase font-semibold">Start Date</span>
                      <p className="font-medium mt-0.5 text-foreground">
                        {new Date(result.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {result.completedAt && (
                    <div className="rounded-lg bg-card/80 p-3 border border-border/60">
                      <span className="text-muted-foreground text-[10px] uppercase font-semibold">Completion Date</span>
                      <p className="font-medium mt-0.5 text-foreground">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {result.certificateIssued && result.certificateCode && (
                    <div className="rounded-lg bg-card/80 p-3 sm:col-span-2 border border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold">Certificate Code</span>
                        <p className="font-mono font-bold text-sm mt-0.5 text-foreground">{result.certificateCode}</p>
                      </div>
                      <button
                        onClick={() => copyCode(result.certificateCode!)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy Certificate Code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </Section>
    </>
  );
}
