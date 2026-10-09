import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
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
  Globe,
  Monitor,
  Users,
  ClipboardList,
  RefreshCw,
  Bug,
  Wallet,
  GraduationCap,
  ListChecks,
  Send,
  MessageSquare,
  Lightbulb,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface InternshipFaq {
  q: string;
  a: string;
}

/* Rendered on this page AND mirrored in the FAQPage JSON-LD in `head`. */
const internshipFaqs: InternshipFaq[] = [
  {
    q: "Is the internship a job?",
    a: "No. Our internship program is a project-based learning experience, not employment. Participating interns are not employees of YR NOVATECH, and the program does not guarantee employment, placement, or any specific career outcome.",
  },
  {
    q: "Which internship domains are available?",
    a: "Internship domains include Full Stack Development, UI/UX Design, Python Programming, C++ Programming, Cyber Security, and Artificial Intelligence & Machine Learning. You choose your preferred domain at registration.",
  },
  {
    q: "What are the internship durations?",
    a: "You can select a duration of 1 month, 2 months, or 3 months at the time of registration, based on your academic calendar and schedule.",
  },
  {
    q: "How are tasks submitted and reviewed?",
    a: "After registration, you receive project tasks inside your account dashboard. You submit your completed work (for example, a GitHub repository, project link, or other required deliverable) from the dashboard. Our team reviews submissions and either approves them or returns them with feedback for revision.",
  },
  {
    q: "Will I definitely receive a certificate?",
    a: "Certificates are issued to interns who complete all required tasks for their selected duration and receive approval for those tasks. Issuance is based on the completeness and quality of your submitted work.",
  },
  {
    q: "How much does the internship cost?",
    a: "Registration, participation and certificate issuance are completely free. There are no payment steps, no processing fees and no hidden charges at any stage of the program.",
  },
];

export const Route = createFileRoute("/internship")({
  head: () => ({
    meta: [
      {
        title: "Internship Program: Domains, Tasks & Certificate | YR NOVATECH",
      },
      {
        name: "description",
        content:
          "A detailed guide to the YR NOVATECH online project-based internship: 6 engineering domains, 1/2/3-month durations, how tasks are submitted and approved, and public certificate verification. The program is completely free.",
      },
      {
        property: "og:title",
        content: "YR NOVATECH Internship Program — Domains, Tasks & Certificates",
      },
      {
        property: "og:description",
        content:
          "How the YR NOVATECH internship works: domains, durations, task submissions, admin review, certificate issuance and verification — all completely free.",
      },
      { property: "og:url", content: "https://www.yrnovatech.in/internship" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/internship" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: internshipFaqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }),
      },
    ],
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
    learn: "Plan, build and ship a complete web product: interface screens, REST endpoints, a database schema, authentication and deployment — each step submitted as its own reviewed task.",
    project: "Full-Stack SaaS Platform with Role-Based Access",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence & Machine Learning",
    level: "AI & Machine Learning",
    desc: "Build practical generative AI applications, vector retrieval augmented generation (RAG) pipelines, and intelligent agent workflows.",
    skills: ["Python & PyTorch", "LangChain & LLM APIs", "Vector DBs (Pinecone/Chroma)", "Data Preprocessing"],
    learn: "Collect and clean data, preprocess it properly, build and evaluate AI features, and package them into a working application with documented results.",
    project: "Context-Aware AI Document Assistant",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    level: "Product Experience",
    desc: "Craft user research archetypes, interactive wireframes, micro-interactions, responsive grids, and design token libraries in Figma.",
    skills: ["Figma & FigJam", "Wireframing & Prototyping", "Design Tokens & WCAG", "User Journey Mapping"],
    learn: "Run the full design process: research and personas, user flows and information architecture, wireframes, a consistent design system, and an interactive prototype ready for handoff.",
    project: "Complete Mobile & Web Product Redesign",
  },
  {
    icon: Terminal,
    title: "Python Programming",
    level: "Core & Automation",
    desc: "Deep dive into object-oriented Python, web scraping, asynchronous automation scripts, and high-performance backend APIs with FastAPI.",
    skills: ["Advanced Python 3", "FastAPI & Pydantic", "Automation & Web Scraping", "Data Structures"],
    learn: "Build data processing pipelines, REST APIs, tests and automation scripts, then document and package them the way production Python projects are maintained.",
    project: "Automated Data Ingestion & Analytics Pipeline",
  },
  {
    icon: Cpu,
    title: "C++ Programming",
    level: "Systems & DSA",
    desc: "Strengthen low-level problem solving, memory management, algorithms, data structures, and object-oriented architectural patterns.",
    skills: ["C++17 / C++20", "Data Structures & Algorithms", "Memory Management & Pointers", "OOP & System Design"],
    learn: "Implement core data structures and algorithms from scratch, manage memory safely, apply design patterns in multi-module projects, and benchmark your code.",
    project: "High-Concurrency Order Matching Engine",
  },
  {
    icon: ShieldCheck,
    title: "Cyber Security",
    level: "Security & Defense",
    desc: "Learn practical security assessment work: identify common risks in a test application, document your findings, and build tooling that monitors for suspicious activity.",
    skills: ["Security Risk Assessment", "Threat Detection", "Security Monitoring Dashboards", "Safe Testing Practices"],
    learn: "Read security events from sample logs, detect patterns such as repeated failed logins, assign severity levels, and communicate findings and recommendations clearly.",
    project: "Cybersecurity Monitoring & Threat Detection Dashboard",
  },
];

const durations = [
  {
    icon: Clock,
    title: "1 Month",
    desc: "A short, focused track. You work through the core project tasks for your domain inside a single month.",
    fit: "Best when you want a quick, structured start or have a short window between semesters.",
  },
  {
    icon: Calendar,
    title: "2 Months",
    desc: "A longer window with a longer task list, so you can take on deeper and more involved project work than the shortest track.",
    fit: "A common choice when one month feels rushed but a full semester is not available.",
  },
  {
    icon: Calendar,
    title: "3 Months",
    desc: "The longest available track. The task list grows again, giving you the most time to build, get feedback and revise your work.",
    fit: "Best when you want the most practice and the widest set of tasks in your portfolio.",
  },
];

const onlinePoints = [
  {
    icon: Globe,
    title: "Work From Anywhere",
    desc: "The internship is fully online and remote. You need a computer and an internet connection — there is no campus, commute or in-person attendance.",
  },
  {
    icon: Monitor,
    title: "One Dashboard",
    desc: "Your task list, submissions, reviewer feedback, offer letter and certificate all live in your account dashboard, so nothing is scattered across email threads.",
  },
  {
    icon: Calendar,
    title: "A Fixed Window",
    desc: "You select 1, 2 or 3 months at registration and complete your tasks inside that window, alongside your college or work schedule.",
  },
  {
    icon: Send,
    title: "Digital Documents",
    desc: "Your offer letter is issued digitally on approval, and your certificate carries a unique code that anyone can check on this website.",
  },
];

const learningApproach = [
  {
    icon: Search,
    title: "Read the Specification",
    desc: "Every task begins with a written brief. Understand the goal, the required deliverables and the constraints before you start building.",
  },
  {
    icon: ClipboardList,
    title: "Plan the Work",
    desc: "Break the task into steps, decide what to build first, and keep your repository and files organised as you go.",
  },
  {
    icon: Code,
    title: "Build It Properly",
    desc: "Write clean, working code or design files instead of quick demos. Reviewers reward completeness and quality over speed.",
  },
  {
    icon: Bug,
    title: "Check Your Own Work",
    desc: "Before submitting, run the project and test it against the brief so you know it meets every requirement.",
  },
  {
    icon: FileText,
    title: "Document It",
    desc: "Include a README, screenshots and notes so a reviewer can understand what you built, how to run it and why you made your choices.",
  },
  {
    icon: RefreshCw,
    title: "Revise From Feedback",
    desc: "If a task comes back with feedback, treat it like a real code review: make the changes, resubmit and move forward.",
  },
];

const submissionSteps = [
  {
    step: "01",
    title: "Open your dashboard",
    desc: "Your task list for your chosen domain and duration appears inside your account.",
  },
  {
    step: "02",
    title: "Build the task",
    desc: "Complete the work described in the task brief in your own repository or design file.",
  },
  {
    step: "03",
    title: "Submit your deliverables",
    desc: "Submit from the dashboard with the required links — typically a GitHub repository, a live or demo link, supporting files where asked, plus short notes.",
  },
  {
    step: "04",
    title: "Track the status",
    desc: "The submission moves into review, and its status plus any reviewer feedback are shown in the dashboard.",
  },
];

const reviewCriteria = [
  "Whether the submission matches the task specification and includes every required deliverable.",
  "Whether the project actually works as described — running code, a working link or a working prototype.",
  "Quality of the work: structure, clarity, correctness and consistency with good engineering practice.",
  "Quality of the documentation and your notes, so the reviewer can follow what you built.",
];

const certificateSteps = [
  {
    icon: ClipboardCheck,
    title: "Complete every required task",
    desc: "All required tasks for your selected duration must be submitted and approved before a certificate can be issued.",
  },
  {
    icon: ShieldCheck,
    title: "Admin reviews and releases",
    desc: "Once every required task is approved, the admin reviews your record and releases your certificate. There is no fee at any stage.",
  },
  {
    icon: Award,
    title: "Certificate issued",
    desc: "Your certificate is issued with a unique, publicly verifiable code that you can download and share.",
  },
];

const outcomes = [
  {
    icon: Github,
    title: "Portfolio Work",
    desc: "Real repositories and project deliverables in your domain, documented so you can show them to anyone.",
  },
  {
    icon: Target,
    title: "Engineering Habits",
    desc: "Experience of working from a written specification: planning, testing, documenting and submitting work.",
  },
  {
    icon: MessageSquare,
    title: "Review Experience",
    desc: "Practice submitting work for professional review, responding to feedback and improving a submission.",
  },
  {
    icon: Lightbulb,
    title: "Domain Skills",
    desc: "Concrete skills in the track you chose — the same areas listed on the domain cards above.",
  },
  {
    icon: Award,
    title: "Verifiable Certificate",
    desc: "A certificate with a unique code that employers, universities and partners can confirm on this website.",
  },
  {
    icon: GraduationCap,
    title: "Career Clarity",
    desc: "A realistic picture of what day-to-day work in your chosen field involves, before you commit to it professionally.",
  },
];

const applySteps = [
  {
    icon: UserPlus,
    title: "Create your account",
    desc: "Sign up through the application page and set up your login.",
  },
  {
    icon: Users,
    title: "Complete your profile",
    desc: "Add your details, including your college and branch.",
  },
  {
    icon: ListChecks,
    title: "Choose domain and duration",
    desc: "Pick one of the six domains and a duration of 1, 2 or 3 months.",
  },
  {
    icon: FileText,
    title: "Receive your offer letter",
    desc: "On approval of your registration you receive an official offer letter confirming your enrolment.",
  },
  {
    icon: Code,
    title: "Start your task list",
    desc: "Your project tasks appear in the dashboard and you begin building.",
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
            Build actual software, receive structured code reviews, and earn tamper-proof verifiable
            certificates across six engineering domains: Full Stack Development, UI/UX Design, Python
            Programming, C++ Programming, Cyber Security, and Artificial Intelligence &amp; Machine
            Learning.
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

          <p className="mt-5 text-sm text-muted-foreground">
            Not sure yet? Read the{" "}
            <Link to="/faq" className="text-primary font-medium hover:underline">
              full internship FAQ
            </Link>{" "}
            or jump to{" "}
            <a href="#certificate" className="text-primary font-medium hover:underline">
              certificate process details
            </a>
            .
          </p>
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
      {/* Program Overview / Who It Is For */}
      <Section id="overview" className="!pt-0">
        <SectionHeading
          eyebrow="Program Overview"
          title="What This Internship Is — and Who It Is For"
          description="A structured, project-based learning program run entirely online by YR NOVATECH, a registered MSME software development company."
        />

        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            You register, choose one of six domains and a duration of 1, 2 or 3 months, and receive an
            offer letter once your registration is approved. From there you work through a list of
            project tasks in your account dashboard: each task has a written specification, you build
            the work yourself, and you submit it for review. Our team approves a submission or returns
            it with feedback. When every required task is approved, your certificate can be issued and
            checked publicly by anyone.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          <Card className="p-5 border border-border h-full">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">Who can apply</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Students and aspiring engineers who want practical, supervised project experience. You
              can apply from any college or branch, and you choose your domain and duration when you
              register.
            </p>
          </Card>

          <Card className="p-5 border border-border h-full">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Monitor className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">Where it happens</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              100% online and remote. Tasks, submissions, feedback, your offer letter and your
              certificate all move through your dashboard — there is no office to attend and no
              in-person session to reach.
            </p>
          </Card>

          <Card className="p-5 border border-border h-full">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">What you actually do</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You complete a list of project tasks with clear specifications, submit your work for
              review from the dashboard, respond to feedback, and build toward a verifiable
              certificate.
            </p>
          </Card>

          <Card className="p-5 border border-border h-full">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">What it is not</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              It is a learning program, not a job. Interns are not employees of YR NOVATECH, and the
              program does not guarantee employment, placement or any specific career outcome.
            </p>
          </Card>
        </div>

        <p className="max-w-3xl mx-auto text-center mt-8 text-sm text-muted-foreground">
          YR NOVATECH also builds commercial software — see{" "}
          <Link to="/services" className="text-primary hover:underline">
            our services
          </Link>
          , or{" "}
          <Link to="/about" className="text-primary hover:underline">
            learn more about the company
          </Link>{" "}
          behind the program.
        </p>
      </Section>

      {/* Domains Section */}
      <Section id="domains" className="!pt-0">
        <SectionHeading
          eyebrow="Specialization Tracks"
          title="Choose Your Engineering Domain"
          description="Six domains, each centered on hands-on deliverables that simulate authentic software engineering environments. You pick one at registration."
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

                <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    What You&rsquo;ll Learn
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.learn}</p>
                </div>

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

      {/* Duration Options */}
      <Section id="duration" className="!pt-0">
        <SectionHeading
          eyebrow="Duration Options"
          title="Pick 1, 2 or 3 Months"
          description="You select your duration at registration, based on your academic calendar and schedule. The way the program works stays the same — only the amount of work changes."
        />

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {durations.map((d) => (
            <Card
              key={d.title}
              className="p-6 border border-border bg-card rounded-2xl flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <d.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{d.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{d.desc}</p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed mt-auto pt-3 border-t border-border/60">
                {d.fit}
              </p>
            </Card>
          ))}
        </div>

        <Card className="max-w-5xl mx-auto mt-6 p-6 border border-border bg-secondary/30 rounded-2xl">
          <div className="flex items-start gap-3">
            <ListChecks className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-1.5">
                How the durations differ
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your task list grows with the duration you choose: a longer track means more tasks and
                deeper, more advanced work in the same domain, while a shorter track covers the core
                project tasks for that domain. Every track follows the same rules — complete your task
                list, get each required task approved, then have your certificate issued. The exact
                task list for your domain and duration is always visible inside your dashboard, so you
                know what is expected before you begin.
              </p>
            </div>
          </div>
        </Card>
      </Section>

      {/* Online Mode */}
      <Section id="online" className="!pt-0">
        <SectionHeading
          eyebrow="Mode of Study"
          title="Fully Online and Remote"
          description="The entire internship — registration, tasks, submissions, feedback and certificate — is delivered online."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {onlinePoints.map((p) => (
            <Card key={p.title} className="p-5 border border-border h-full">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-foreground">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
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
      {/* Learning Approach */}
      <Section id="learning" className="!pt-0">
        <SectionHeading
          eyebrow="Learning Approach"
          title="A Real-World Development Approach"
          description="The same working habits our engineering team uses on client projects, applied to every internship task."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {learningApproach.map((a, i) => (
            <Card key={a.title} className="p-6 border border-border h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-primary/70 tabular-nums font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-semibold text-base mb-2 text-foreground">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </Card>
          ))}
        </div>

        <p className="max-w-3xl mx-auto text-center mt-8 text-sm text-muted-foreground">
          Want to see how this approach applies to professional work? Browse our{" "}
          <Link to="/services" className="text-primary hover:underline">
            software services
          </Link>{" "}
          and the{" "}
          <Link to="/resources" className="text-primary hover:underline">
            engineering resources library
          </Link>
          .
        </p>
      </Section>

      {/* Hands-On Project Structure */}
      <Section id="projects" className="!pt-0">
        <SectionHeading
          eyebrow="Project Structure"
          title="Hands-On Projects, Not Theory"
          description="Every domain is a sequence of practical tasks that builds, step by step, into a complete project you can present as portfolio work."
        />

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-8">
          <Card className="p-6 border border-border h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base text-foreground">How a task is structured</h3>
            </div>
            <ul className="space-y-2.5">
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>A written specification that states what to build and what to submit.</span>
              </li>
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Concrete deliverables — usually a GitHub repository, a live or demo link,
                  supporting files where asked, and a README explaining your approach.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  A review step where your submission is checked and either approved or sent back
                  with feedback.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  A final capstone deliverable that ties the track together into one presentable
                  project.
                </span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 border border-border h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                Capstone deliverables by domain
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Each track ends with a substantial project, for example:
            </p>
            <ul className="space-y-2">
              {domains.map((d) => (
                <li key={d.title} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-medium">{d.title}:</span> {d.project}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <p className="max-w-3xl mx-auto text-center text-sm text-muted-foreground">
          Curious about the kind of work we ship as a company? Visit the{" "}
          <Link to="/projects" className="text-primary hover:underline">
            projects page
          </Link>
          .
        </p>
      </Section>

      {/* Task & Submission Process */}
      <Section id="tasks" className="!pt-0">
        <SectionHeading
          eyebrow="Tasks & Submissions"
          title="How Tasks Are Submitted and Approved"
          description="Everything happens inside your account dashboard — from the task list to reviewer feedback."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-6">
          {submissionSteps.map((s) => (
            <Card key={s.step} className="p-5 border border-border h-full">
              <span className="text-xl font-black text-muted-foreground/30 font-mono block mb-2">
                {s.step}
              </span>
              <h3 className="font-semibold text-sm mb-1.5 text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
          <Card className="p-6 border border-border h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                What reviewers look for
              </h3>
            </div>
            <ul className="space-y-2.5">
              {reviewCriteria.map((c) => (
                <li key={c} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border border-border h-full">
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                Admin verification and approval
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Every submission is checked by our team before it counts toward your certificate. A
              submission is either <span className="text-foreground font-medium">approved</span> or
              returned with feedback so you can revise and resubmit it.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The current status of each task is always visible in your dashboard. Only when{" "}
              <span className="text-foreground font-medium">every required task</span> for your
              duration is approved does your internship move to the certificate stage — nothing is
              issued automatically, and an admin releases the certificate.
            </p>
          </Card>
        </div>
      </Section>
      {/* Certificate & Verification */}
      <Section id="certificate" className="!pt-0">
        <SectionHeading
          eyebrow="Certificate"
          title="How the Certificate Works"
          description="Certificates are issued only after your work is approved — then verified once, usable forever."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-6">
          {certificateSteps.map((s) => (
            <Card key={s.title} className="p-5 border border-border h-full">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
          {/* Free certification process */}
          <Card className="p-6 border border-border bg-card rounded-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <Wallet className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                Free certification process
              </h3>
            </div>

            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Registration &amp; participation</span>
                <span className="font-semibold text-foreground">Free</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Certificate issuance</span>
                <span className="font-semibold text-foreground">Free</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Hidden charges</span>
                <span className="font-semibold text-foreground">None</span>
              </div>
            </div>

            <ol className="space-y-2.5 border-t border-border/60 pt-4">
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Complete every required task for your selected duration and get each one approved.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Once all required tasks are approved, an admin reviews your record and releases your
                  certificate.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Download your certificate with a unique, publicly verifiable code. No fee is
                  collected at any stage.
                </span>
              </li>
            </ol>

            <p className="text-xs text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/60">
              Questions about how your details are handled? See the{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Card>

          {/* Verification */}
          <div className="space-y-6">

            <Card className="p-6 border border-border bg-card rounded-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base text-foreground">
                  Verifying a certificate
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Every issued certificate carries a unique verification code. Anyone — an employer, a
                university or a partner — can enter that code in the public verification tool below
                to confirm the domain, duration, cohort status and certificate status instantly.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-border hover:bg-accent text-foreground"
              >
                <a href="#verify">
                  <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                  Go to the verification tool
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </Section>

      {/* Internship Verification Section */}
      <Section id="verify" className="!pt-0">
        <span id="verify-section" className="block h-0 scroll-mt-24" />
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
      {/* Application Process */}
      <Section id="apply" className="!pt-0">
        <SectionHeading
          eyebrow="How to Apply"
          title="Application Process"
          description="Five steps from signup to your first task. Registration, participation and certification are completely free."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
          {applySteps.map((s, i) => (
            <Card key={s.title} className="p-5 border border-border h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-xl font-black text-muted-foreground/30 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center mt-8">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <Link to="/auth">
              Apply for Internship <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Expected Outcomes */}
      <Section id="outcomes" className="!pt-0">
        <SectionHeading
          eyebrow="Expected Outcomes"
          title="What You Take Away"
          description="What a completed internship is designed to give you — skills, evidence of work, and a credential anyone can check."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {outcomes.map((o) => (
            <Card key={o.title} className="p-5 border border-border h-full">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <o.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-foreground">{o.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{o.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Internship FAQ */}
      <Section id="faq" className="!pt-0">
        <SectionHeading
          eyebrow="Internship FAQ"
          title="Internship Questions, Answered"
          description="The questions we hear most often about the program, tasks and certificates."
        />

        <div className="max-w-3xl mx-auto space-y-3">
          {internshipFaqs.map((f) => (
            <Card key={f.q} className="p-5 border border-border bg-card/90 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <h3 className="font-semibold text-base text-foreground leading-snug mb-1.5">
                    {f.q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="max-w-3xl mx-auto text-center mt-6 text-sm text-muted-foreground">
          Looking for something else? The{" "}
          <Link to="/faq" className="text-primary font-medium hover:underline">
            full FAQ
          </Link>{" "}
          covers registration, certificates and contact details in more depth.
        </p>
      </Section>

      <AdSlot slot={AD_SLOTS.contentInline} className="py-2" />

      {/* Contact / Application CTA */}
      <Section className="!pt-0">
        <Card className="max-w-4xl mx-auto p-8 md:p-10 border border-border bg-secondary/30 rounded-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Ready when you are</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Start your project-based internship
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Pick your domain, pick your duration, and get your first task list. If you have a
            question before applying, our support team is happy to help.
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
              <Link to="/contact">
                Contact Us <MessageSquare className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Quick answers:{" "}
            <Link to="/faq" className="text-primary hover:underline">
              FAQ
            </Link>{" "}
            ·{" "}
            <Link to="/about" className="text-primary hover:underline">
              About YR NOVATECH
            </Link>{" "}
            ·{" "}
            <Link to="/resources" className="text-primary hover:underline">
              Resources
            </Link>
          </p>
        </Card>
      </Section>
    </>
  );
}
