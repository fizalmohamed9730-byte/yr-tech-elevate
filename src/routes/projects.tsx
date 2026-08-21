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
  project_domains?: { domain: { name: string } | null }[];
}

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="h-40 bg-gradient-hero relative">
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary">{p.difficulty}</Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white text-2xl font-bold opacity-90">{p.title.split(" ")[0]}</div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{p.description || "No description"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.project_domains?.map((pd, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">
                      {pd.domain?.name ?? "Domain"}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}