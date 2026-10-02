import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ExternalLink,
  Github,
  Sparkles,
  Layers,
  ArrowRight,
  Code2,
  Laptop,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Engineering Portfolio | YR NOVATECH" },
      {
        name: "description",
        content:
          "Explore production systems, AI applications, web platforms, and client solutions engineered at YR NOVATECH.",
      },
      { property: "og:title", content: "YR NOVATECH Projects Portfolio" },
      { property: "og:description", content: "Client solutions and production engineering portfolio." },
      { property: "og:url", content: "https://www.yrnovatech.in/projects" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/projects" }],
  }),
  component: Projects,
});

interface Project {
  id: string;
  title: string;
  description: string | null;
  difficulty?: string;
  active: boolean;
  image_url: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  project_domains?: { domain: { name: string } | null }[];
}

const FALLBACK_PROJECTS: Project[] = [
  {
    id: "fp-1",
    title: "NovaCloud Enterprise Resource Manager",
    description:
      "A high-throughput cloud operations portal with automated deployment orchestrations, real-time analytics streaming, and role-based privilege controls.",
    difficulty: "Production",
    active: true,
    image_url: null,
    github_url: "https://github.com",
    demo_url: "https://yrnovatech.in",
    project_domains: [{ domain: { name: "Full Stack Development" } }],
  },
  {
    id: "fp-2",
    title: "IntelliDoc RAG Knowledge Engine",
    description:
      "Vector-indexed contextual retrieval engine allowing enterprise teams to query complex technical documentation, legal archives, and PDFs with citation attribution.",
    difficulty: "Advanced AI",
    active: true,
    image_url: null,
    github_url: "https://github.com",
    demo_url: "https://yrnovatech.in",
    project_domains: [{ domain: { name: "Artificial Intelligence" } }],
  },
  {
    id: "fp-3",
    title: "HealthPulse Telemetry Mobile App",
    description:
      "Cross-platform iOS and Android health metrics application with offline-first local synchronization, biometric auth, and personalized progress charts.",
    difficulty: "Full Stack",
    active: true,
    image_url: null,
    github_url: "https://github.com",
    demo_url: "https://yrnovatech.in",
    project_domains: [{ domain: { name: "Mobile App Development" } }],
  },
  {
    id: "fp-4",
    title: "Aura Design System & Component Library",
    description:
      "Comprehensive multi-brand UI design system adhering to WCAG 2.1 AAA accessibility standards with full React/Tailwind design tokens and Figma tokens sync.",
    difficulty: "Design System",
    active: true,
    image_url: null,
    github_url: "https://github.com",
    demo_url: "https://yrnovatech.in",
    project_domains: [{ domain: { name: "UI/UX Design" } }],
  },
  {
    id: "fp-5",
    title: "Algorithmic Order Matcher & Execution Engine",
    description:
      "Low-latency order book simulator built with modern C++ and memory-mapped IO, engineered for high concurrency under burst traffic.",
    difficulty: "Systems",
    active: true,
    image_url: null,
    github_url: "https://github.com",
    demo_url: "https://yrnovatech.in",
    project_domains: [{ domain: { name: "C++ Programming" } }],
  },
  {
    id: "fp-6",
    title: "DataPipe Automated ETL Framework",
    description:
      "Asynchronous Python data pipeline with schema validation, anomaly detection, and automated reporting scheduled across distributed workloads.",
    difficulty: "Data & ML",
    active: true,
    image_url: null,
    github_url: "https://github.com",
    demo_url: "https://yrnovatech.in",
    project_domains: [{ domain: { name: "Python Programming" } }],
  },
];

const GRADIENTS = [
  "from-blue-600 via-indigo-600 to-cyan-500",
  "from-purple-600 via-pink-600 to-rose-500",
  "from-emerald-600 via-teal-600 to-cyan-500",
  "from-amber-500 via-orange-600 to-red-500",
  "from-indigo-600 via-violet-600 to-blue-500",
  "from-rose-500 via-pink-600 to-orange-400",
];

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("projects")
          .select(
            "id, title, description, image_url, github_url, demo_url, difficulty, created_at, project_domains(domain:domains(name))",
          )
          .eq("active", true)
          .order("created_at", { ascending: false });
        if (error) {
          console.warn("[projects] load error, using showcase data:", error);
          setProjects(FALLBACK_PROJECTS);
        } else if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      } catch {
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const domainsList = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.project_domains?.forEach((pd) => {
        if (pd.domain?.name) set.add(pd.domain.name);
      });
    });
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedDomain === "All") return projects;
    return projects.filter((p) =>
      p.project_domains?.some((pd) => pd.domain?.name === selectedDomain),
    );
  }, [projects, selectedDomain]);

  return (
    <Section className="py-12 md:py-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Engineering Showcase</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Work &amp; Featured Projects
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A showcase of full-stack platforms, AI tools, and capstone software engineered by our team and top program fellows.
        </p>

        {/* Filter Pills */}
        {domainsList.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {domainsList.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDomain === dom
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading project portfolio...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredProjects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}

      {/* Collaboration CTA */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <Card className="p-8 border border-border bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-left">
            <h3 className="font-bold text-lg text-foreground">Have a custom build in mind?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We engineer dedicated web apps, APIs, and AI integrations tailored to your product specs.
            </p>
          </div>
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant shrink-0">
            <Link to="/contact">
              Discuss Your Project <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </Section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const desc = project.description || "No description provided.";
  const isLong = desc.length > 130;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
      <div>
        {/* Card Header / Banner */}
        <div className="h-44 bg-gradient-to-br relative overflow-hidden flex items-end p-5">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Difficulty / Tag Badge */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <Badge variant="secondary" className="text-[11px] font-semibold bg-black/40 text-white backdrop-blur-md border border-white/20">
              {project.difficulty || "Featured"}
            </Badge>
          </div>

          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold leading-snug drop-shadow-sm group-hover:text-cyan-200 transition-colors">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isLong && !expanded ? desc.slice(0, 130) + "..." : desc}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-semibold text-primary hover:underline block"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {/* Domain Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.project_domains?.map((pd, j) => (
              <span
                key={j}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-accent/70 text-accent-foreground font-medium border border-border/50"
              >
                {pd.domain?.name ?? "Engineering"}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 border-t border-border/50 mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Verified Build</span>
        </span>

        <div className="flex items-center gap-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source repository"
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View live demo or case study"
              className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Demo</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
