import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Code2,
  Brain,
  Palette,
  GraduationCap,
  Heart,
  Zap,
  Users,
  Lightbulb,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: `Careers at ${COMPANY.name} — Join Our Team` },
      {
        name: "description",
        content: `Explore career opportunities at ${COMPANY.name}. We're building a team of engineers, designers, and AI developers who are passionate about creating impactful software.`,
      },
      { property: "og:title", content: `Careers — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Join the ${COMPANY.name} team. We're looking for talented engineers, designers, and AI developers.`,
      },
    ],
  }),
  component: Careers,
});

const cultureValues = [
  {
    icon: Lightbulb,
    title: "Learning-First Culture",
    desc: "We invest in continuous learning. Team members regularly explore new technologies, share knowledge, and grow their skills through real project work.",
  },
  {
    icon: Code2,
    title: "Engineering Excellence",
    desc: "We write clean, maintainable code. We value thoughtful architecture, thorough testing, and solid documentation over quick shortcuts.",
  },
  {
    icon: Users,
    title: "Mentorship & Collaboration",
    desc: "Senior engineers actively mentor junior team members. We believe great engineering teams are built through knowledge sharing and collaborative problem-solving.",
  },
  {
    icon: Zap,
    title: "Ownership & Impact",
    desc: "Every team member owns their work from concept to deployment. We value initiative, independent thinking, and taking responsibility for outcomes.",
  },
];

const techStack = [
  { area: "Frontend", tools: "React, Next.js, TypeScript, TailwindCSS" },
  { area: "Backend", tools: "Node.js, Python, FastAPI, REST APIs" },
  { area: "Database", tools: "PostgreSQL, Supabase, Redis" },
  { area: "AI/ML", tools: "Python, LangChain, RAG, LLM APIs, Data Pipelines" },
  { area: "Design", tools: "Figma, Adobe Suite, Design Systems" },
  { area: "DevOps", tools: "Vercel, Docker, CI/CD, Git" },
];

function Careers() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Careers"
          title="Build Your Career with Us"
          description={`${COMPANY.name} is a growing technology company. We're building a team of engineers, designers, and innovators who care about craft, quality, and real impact.`}
        />

        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed text-center mb-4">
            We are a small, focused team where every member has direct impact on
            the products we build and the students we train. If you're passionate
            about technology, enjoy solving complex problems, and want to work in an
            environment where your contributions matter — we'd like to hear from you.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            {COMPANY.name} is registered as a Micro, Small & Medium Enterprise
            (MSME: {COMPANY.udyam}) and is headquartered in Tamil Nadu, India.
          </p>
        </div>
      </Section>

      {/* Culture & Values */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Culture"
          title="How We Work"
          description="Our values shape how we build software, train interns, and grow as a team."
        />
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {cultureValues.map((v) => (
            <Card key={v.title} className="p-6 border border-border">
              <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center mb-3">
                <v.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Tech Stack */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Technology"
          title="Our Technology Stack"
          description="The tools and technologies we use to build products."
        />
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 border border-border">
            <div className="space-y-4">
              {techStack.map((t) => (
                <div key={t.area} className="flex items-start gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-accent/50 px-2.5 py-1 rounded-md shrink-0 min-w-[80px] text-center">
                    {t.area}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.tools}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Areas We Hire */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Opportunities"
          title="Areas We Hire For"
          description="We're always looking for talented people in these areas. Even if there isn't a specific listing, reach out — we'd love to talk."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {[
            {
              icon: Code2,
              title: "Full Stack Engineering",
              desc: "Build end-to-end web applications using React, Node.js, TypeScript, and PostgreSQL.",
            },
            {
              icon: Brain,
              title: "AI & ML Engineering",
              desc: "Develop AI-powered features, LLM integrations, RAG systems, and data pipelines.",
            },
            {
              icon: Palette,
              title: "UI/UX Design",
              desc: "Design intuitive, accessible interfaces and build consistent design systems.",
            },
            {
              icon: GraduationCap,
              title: "Internship Mentors",
              desc: "Guide and review intern projects, provide technical feedback, and support learning.",
            },
          ].map((role) => (
            <Card key={role.title} className="p-5 border border-border hover:shadow-elegant hover:-translate-y-1 transition-all">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center mb-3 shadow-elegant">
                <role.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm mb-2">{role.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{role.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How to Apply */}
      <Section className="!pt-0">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 border border-border text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
              <Mail className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Interested? Get in Touch</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
              We don't always have open listings, but we're always interested in
              meeting talented people. Send us your resume and a brief note about
              what you're passionate about.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant">
                <a href={`mailto:${COMPANY.email}?subject=Career Inquiry — ${COMPANY.name}`}>
                  Email Us <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Form</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Email: {COMPANY.email}
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
