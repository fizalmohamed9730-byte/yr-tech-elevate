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
  { title: "Full Stack Development", desc: "MERN, Next.js, Postgres, deployments." },
  { title: "UI/UX Design", desc: "Figma, design systems, user research." },
  { title: "C++ Programming", desc: "DSA, OOP, competitive problem solving." },
  { title: "Python Programming", desc: "Scripting, automation, backend with FastAPI." },
  { title: "Artificial Intelligence", desc: "LLMs, RAG, computer vision, ML pipelines." },
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
      <Section>
        <SectionHeading
          eyebrow="Internship Program"
          title="Project-based internships that actually count"
          description="A structured, mentor-guided journey from registration to verifiable certificate."
        />
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <Link to="/apply">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      <Section className="!pt-0">
        <h3 className="text-2xl font-bold mb-6 text-center">Choose your domain</h3>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <Card
              key={d.title}
              className="p-6 border border-border hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <h4 className="font-semibold mb-2">{d.title}</h4>
              <p className="text-sm text-muted-foreground">{d.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/30 rounded-3xl">
        <SectionHeading eyebrow="Workflow" title="How the program works" />
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-border md:left-1/2" />
          <div className="space-y-6">
            {workflow.map((w, i) => (
              <div
                key={w.title}
                className={`relative flex gap-4 md:gap-8 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="md:w-1/2 md:text-right flex md:justify-end">
                  <div className="ml-16 md:ml-0 md:mr-8">
                    <h4 className="font-semibold">{w.title}</h4>
                    <p className="text-sm text-muted-foreground">{w.desc}</p>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
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
