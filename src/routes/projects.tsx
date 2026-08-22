import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects Portfolio | YR NOVATECH" },
      { name: "description", content: "Explore client and student projects built at YR NOVATECH — web apps, AI products, dashboards, and more." },
      { property: "og:title", content: "YR NOVATECH Projects" },
      { property: "og:description", content: "Client and student work portfolio." },
    ],
  }),
  component: Projects,
});

interface Project {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  active: boolean;
  deadline: string | null;
  image_url: string | null;
  project_domains?: { domain: { name: string } | null }[];
}

const GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-purple-600 to-pink-500",
  "from-emerald-600 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-600 to-blue-500",
  "from-rose-500 to-orange-400",
];

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("projects")
        .select("*, project_domains(domain:domains(name))")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) console.error("[projects] load error:", error);
      setProjects(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <Section>
      <SectionHeading eyebrow="Portfolio" title="Selected work" description="A mix of production client work and standout intern projects." />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
            <span className="text-2xl font-bold text-primary">YR</span>
          </div>
          <p className="text-lg font-semibold mb-2">Projects coming soon</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We're currently curating our portfolio of client work and intern projects. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const desc = project.description || "No description";
  const isLong = desc.length > 150;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card className="overflow-hidden border border-border hover:shadow-elegant hover:-translate-y-1 transition-all animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="h-48 bg-gradient-to-br relative overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary">{project.difficulty}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 text-white text-2xl font-bold opacity-90 drop-shadow-lg">
          {project.title.split(" ")[0]}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold mb-2">{project.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
          {isLong && !expanded ? desc.slice(0, 150) + "..." : desc}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline mb-3"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        <div className="flex flex-wrap gap-1.5">
          {project.project_domains?.map((pd, j) => (
            <span key={j} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">
              {pd.domain?.name ?? "Domain"}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}