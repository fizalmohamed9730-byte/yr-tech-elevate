import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
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
    </>
  );
}
