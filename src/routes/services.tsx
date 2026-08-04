import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Code2, Layers, Palette, Cpu, Brain, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Web, Full Stack, AI & More | YR NOVATECH" },
      { name: "description", content: "Web development, full stack, UI/UX design, software solutions, AI, and technical consulting from YR NOVATECH." },
      { property: "og:title", content: "YR NOVATECH Services" },
      { property: "og:description", content: "End-to-end product engineering and AI solutions." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: Code2, title: "Web Development", desc: "Modern, fast, and responsive websites built with React, Next.js, and Tailwind. SEO-optimized and conversion-focused.", features: ["Marketing sites", "Web apps", "E-commerce", "CMS integrations"] },
  { icon: Layers, title: "Full Stack Development", desc: "End-to-end product engineering: APIs, databases, frontend, and deployments. From MVP to scale.", features: ["React/Next.js", "Node/Python", "PostgreSQL", "Cloud deploys"] },
  { icon: Palette, title: "UI/UX Design", desc: "Research-driven product design. Wireframes, prototypes, and design systems that ship.", features: ["User research", "Design systems", "Prototypes", "Branding"] },
  { icon: Cpu, title: "Software Solutions", desc: "Custom internal tools, dashboards, and automation tailored to your business workflows.", features: ["Dashboards", "Automation", "Integrations", "Workflow tools"] },
  { icon: Brain, title: "AI Solutions", desc: "LLM-powered features, chatbots, RAG, and intelligent automation embedded into your product.", features: ["Chatbots", "RAG systems", "AI agents", "Embeddings"] },
  { icon: Lightbulb, title: "Technical Consulting", desc: "Architecture reviews, tech-stack guidance, code audits, and team upskilling.", features: ["Audits", "Architecture", "Hiring help", "Workshops"] },
];

function Services() {
  return (
    <>
      <Section>
        <SectionHeading eyebrow="Services" title="What we build" description="Full-stack capabilities for ambitious teams." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Card key={s.title} className="p-6 hover:shadow-elegant hover:-translate-y-1 transition-all animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 shadow-elegant">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-primary" />{f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <Section>
        <div className="rounded-3xl bg-gradient-hero p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Have a project in mind?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">Tell us what you're building and we'll respond within 24 hours.</p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contact">Start a project <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>
    </>
  );
}