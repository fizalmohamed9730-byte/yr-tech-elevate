import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Github,
  FolderOpen,
  ShieldCheck,
  GitBranch,
  Camera,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Case Studies | YR NOVATECH" },
      {
        name: "description",
        content:
          "How YR NOVATECH documents and publishes real software projects and case studies, what each study contains, and when new work becomes publicly available.",
      },
      { property: "og:title", content: "YR NOVATECH Projects & Case Studies" },
      {
        property: "og:description",
        content:
          "Our policy for publishing real engineering work, and how to follow newly released case studies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.yrnovatech.in/projects" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/projects" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "YR NOVATECH Projects & Case Studies",
          url: "https://www.yrnovatech.in/projects",
          description:
            "Engineering case studies published by YR NOVATECH as real work is cleared for public release.",
          isPartOf: { "@type": "WebSite", url: "https://www.yrnovatech.in" },
        }),
      },
    ],
  }),
  component: Projects,
});

interface Project {
  id: string;
  title: string;
  description: string | null;
  difficulty?: string | null;
  active?: boolean;
  github_url?: string | null;
  demo_url?: string | null;
  project_domains?: { domain: { name: string } | null }[];
}

/**
 * Publication policy: we only ever render rows that genuinely exist in the
 * projects table. There is intentionally no hard-coded fallback portfolio —
 * showing invented projects or dead demo links would misrepresent our work.
 */
const PROJECT_SELECT =
  "id, title, description, difficulty, active, github_url, demo_url, project_domains(domain:domains(name))";

const GRADIENTS = [
  "from-blue-600 via-indigo-600 to-cyan-500",
  "from-emerald-600 via-teal-600 to-cyan-500",
  "from-indigo-600 via-violet-600 to-blue-500",
  "from-rose-500 via-pink-600 to-orange-400",
];

const PUBLICATION_STEPS = [
  {
    icon: GitBranch,
    title: "Built in a real workflow",
    body: "Work enters our pipeline as a scoped engagement with a defined problem, a repository, and review checkpoints. Nothing is written afterwards for the sake of a portfolio page.",
  },
  {
    icon: ShieldCheck,
    title: "Cleared before publishing",
    body: "A case study is only published once the client or internal owner has approved public release of the description, screenshots, and any technical detail.",
  },
  {
    icon: Camera,
    title: "Documented with evidence",
    body: "Each study records the problem statement, the approach actually taken, the technology used, and screenshots only where we are authorised to show them.",
  },
  {
    icon: Users,
    title: "Released as it becomes available",
    body: "As clearances complete, approved projects are added to this page and to the public sitemap. We do not pre-announce work that has not shipped.",
  },
];

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "empty">("loading");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("projects")
          .select(PROJECT_SELECT)
          .eq("active", true)
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (error || !data) {
          // Treat any failure as "nothing to publish yet" rather than
          // substituting placeholder projects.
          console.warn("[projects] no publishable project rows:", error?.message ?? "no data");
          setState("empty");
        } else if (data.length === 0) {
          setState("empty");
        } else {
          setProjects(data);
          setState("ready");
        }
      } catch (e) {
        console.warn("[projects] load failed:", e);
        if (!cancelled) setState("empty");
      }
    })();
    return () => {
      cancelled = true;
    };
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
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Engineering Work</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Projects &amp; Case Studies
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Every project we publish here is real work that has been shipped and cleared for public
          release. This page explains what we document, how we decide what to publish, and how to
          follow new case studies as they go live.
        </p>

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

      {state === "loading" && (
        <div className="max-w-3xl mx-auto text-center py-10">
          <p className="text-sm text-muted-foreground">Checking published case studies…</p>
        </div>
      )}

      {state === "ready" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredProjects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}

      {state === "empty" && (
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 md:p-8 border border-border bg-card/80 rounded-2xl text-center">
            <FolderOpen className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Selected case studies will be published here
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              We do not list placeholder projects. At the moment no case study has completed
              clearance for public release, so this page intentionally shows the standard we hold
              every study to instead of an invented portfolio.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              When a project is published it will state the client or internal problem, the
              objective, the solution we built, the technology used, the key features, the
              development approach, and — only where it has been independently verified — the
              outcome. Screenshots appear only where we have permission to show them.
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 mt-6">
            {PUBLICATION_STEPS.map((s) => (
              <Card key={s.title} className="p-5 border border-border bg-card/70 rounded-2xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <s.icon className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-14">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          What goes into a YR NOVATECH case study
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-6">
          We keep the format consistent so each study is useful to readers who are evaluating how
          we work, not just browsing screenshots.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Problem",
              body: "The concrete business or technical problem the project set out to solve, stated plainly.",
            },
            {
              title: "Objective",
              body: "What success looked like for the owner, and the constraints we worked within.",
            },
            {
              title: "Solution",
              body: "The system we actually built, including the trade-offs we chose and why.",
            },
            {
              title: "Technology",
              body: "The languages, frameworks, platforms, and infrastructure used in production.",
            },
            {
              title: "Key features",
              body: "The capabilities that mattered most, described in terms a non-engineer can follow.",
            },
            {
              title: "Development approach",
              body: "How the work was scoped, reviewed, and shipped — including testing and release.",
            },
            {
              title: "Outcome",
              body: "Published only when a result can be stated honestly and verified by the owner.",
            },
            {
              title: "Technical highlights",
              body: "Notable engineering decisions, and what we would carry into the next build.",
            },
          ].map((f) => (
            <Card key={f.title} className="p-5 border border-border bg-card/70 rounded-2xl">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-14">
        <Card className="p-6 border border-border bg-accent/40 rounded-2xl">
          <h2 className="text-lg font-bold text-foreground mb-3">
            Interested in our technical work?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            If you want a deeper view of how we approach a particular kind of build, we can walk you
            through the engineering approach we would apply to your problem — architecture,
            delivery stages, testing, and handover — without needing to share client-confidential
            material.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground">
              <Link to="/contact">
                Discuss a project <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/services">See our services</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/internship">Internship capstones</Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mt-12 text-center">
        <Card className="p-8 border border-border bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-left">
            <h3 className="font-bold text-lg text-foreground">Have a custom build in mind?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us the problem you are solving. We will tell you how we would engineer it and
              what a realistic delivery looks like.
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
  const desc = project.description?.trim();
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card className="flex flex-col overflow-hidden border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
      <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-end p-5`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="relative z-10">
          <h3 className="text-white text-lg font-bold leading-snug drop-shadow-sm">
            {project.title}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 space-y-3">
        {desc ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Case study write-up is being prepared for public release.
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.difficulty && <Badge variant="secondary" className="text-[11px]">{project.difficulty}</Badge>}
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

      {(project.github_url || project.demo_url) && (
        <div className="p-5 pt-0 border-t border-border/50 flex items-center gap-2">
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
              aria-label="View live demo"
              className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Demo</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
