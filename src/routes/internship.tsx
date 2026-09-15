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
} from "lucide-react";

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
      { property: "og:description", content: "Hands-on internships across six tech domains." },
    ],
  }),
  component: Internship,
});

const domains = [
  {
    icon: Layers,
    title: "Full Stack Development",
    desc: "Master the MERN stack, Next.js, Postgres, and production deployments end-to-end.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Design in Figma, build design systems, and conduct user research that ships.",
  },
  {
    icon: Cpu,
    title: "C++ Programming",
    desc: "Dive into DSA, OOP principles, and competitive problem solving at scale.",
  },
  {
    icon: Terminal,
    title: "Python Programming",
    desc: "Write scripts, automate workflows, and build backends with FastAPI.",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence",
    desc: "Work with LLMs, RAG pipelines, computer vision, and end-to-end ML systems.",
  },
];

const workflow = [
  { icon: UserPlus, title: "Registration", desc: "Sign up and pick your domain." },
  { icon: FileText, title: "Offer Letter", desc: "Receive your official offer letter." },
  { icon: Linkedin, title: "LinkedIn Task", desc: "Announce your internship to your network." },
  { icon: Code, title: "Project Tasks", desc: "Build real projects guided by mentors." },
  { icon: Github, title: "GitHub Submission", desc: "Submit your work for review." },
  { icon: ClipboardCheck, title: "Review", desc: "Mentor feedback and approval." },
  { icon: Award, title: "Certificate", desc: "Verifiable certificate with QR code." },
];

function Internship() {
  const [internshipCode, setInternshipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof verifyInternship>> | null>(null);
  const [error, setError] = useState("");

  async function handleVerify() {
    const code = internshipCode.trim();
    if (!code) {
      setError("Please enter an Internship ID.");
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
        setError(res.error);
      }
    } catch {
      setError("Unable to verify Internship ID. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Section className="text-center">
        <SectionHeading
          eyebrow="Internship Program"
          title="Launch Your Career"
          description="A structured, mentor-guided journey from registration to verifiable certificate."
        />
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <Link to="/auth">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Domains"
          title="Choose Your Domain"
          description="Pick the track that aligns with your goals and get hands-on experience."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <Card
              key={d.title}
              className="group p-6 border border-border hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground transition-colors group-hover:bg-accent">
                <d.icon className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{d.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/30 rounded-3xl">
        <SectionHeading
          eyebrow="Workflow"
          title="How the Program Works"
          description="Seven clear steps from sign-up to certificate."
        />
        <div className="relative max-w-3xl mx-auto mt-12">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-1/2" />
          <div className="space-y-10">
            {workflow.map((w, i) => (
              <div
                key={w.title}
                className={`relative flex items-start gap-4 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div
                  className={`md:w-1/2 ${
                    i % 2 === 0
                      ? "md:pr-12 md:text-right"
                      : "md:pl-12 md:text-left"
                  } pl-16 md:pl-0`}
                >
                  <h4 className="font-semibold text-base mb-1">{w.title}</h4>
                  <p className="text-sm text-muted-foreground">{w.desc}</p>
                </div>
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-elegant z-10">
                  <w.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Verification"
          title="Internship Verification"
          description="Verify a YR NOVATECH internship using the Internship ID."
        />
        <Card className="max-w-lg mx-auto p-6 md:p-8 border border-border">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Enter the Internship ID to view verified details.</span>
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
                className="flex-1 font-mono uppercase"
              />
              <Button
                onClick={handleVerify}
                disabled={loading || !internshipCode.trim()}
                className="bg-gradient-primary text-primary-foreground"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Verify</span>
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && result.found && (
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Internship Verified</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-xs">Intern Name</span>
                    <p className="font-medium mt-0.5">{result.internName}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-xs">Internship ID</span>
                    <p className="font-mono font-medium mt-0.5">{result.internshipCode}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-xs">Domain</span>
                    <p className="font-medium mt-0.5">{result.domain}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-xs">Duration</span>
                    <p className="font-medium mt-0.5">{result.duration}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-xs">Status</span>
                    <p className="mt-0.5">
                      <Badge variant={result.status === "active" ? "default" : result.status === "completed" ? "secondary" : "outline"}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Badge>
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-xs">Certificate Status</span>
                    <p className="mt-0.5">
                      {result.certificateIssued ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">Issued</Badge>
                      ) : (
                        <Badge variant="outline">Not Yet Issued</Badge>
                      )}
                    </p>
                  </div>
                  {result.startedAt && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-muted-foreground text-xs">Start Date</span>
                      <p className="font-medium mt-0.5">{new Date(result.startedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {result.completedAt && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-muted-foreground text-xs">Completion Date</span>
                      <p className="font-medium mt-0.5">{new Date(result.completedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {result.certificateIssued && result.certificateCode && (
                    <div className="rounded-lg bg-muted/50 p-3 sm:col-span-2">
                      <span className="text-muted-foreground text-xs">Certificate Code</span>
                      <p className="font-mono font-medium mt-0.5">{result.certificateCode}</p>
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
