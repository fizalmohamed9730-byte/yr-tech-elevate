import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Badge } from "@/components/ui/badge";

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

const projects = [
  { title: "EduTrack LMS", type: "Client", desc: "Learning management platform for a regional ed-tech brand.", tags: ["Next.js", "Postgres", "Stripe"] },
  { title: "AI Recipe Assistant", type: "Student", desc: "LLM-powered cooking companion built during internship.", tags: ["React", "OpenAI", "RAG"] },
  { title: "MediCare Dashboard", type: "Client", desc: "Patient analytics dashboard for a healthcare startup.", tags: ["React", "FastAPI", "Charts"] },
  { title: "Portfolio Builder", type: "Student", desc: "Drag-and-drop portfolio site generator.", tags: ["Next.js", "Tailwind"] },
  { title: "FinFlow", type: "Client", desc: "Personal finance tracker with budget insights.", tags: ["React Native", "Supabase"] },
  { title: "CTF Trainer", type: "Student", desc: "Cyber security challenges platform for beginners.", tags: ["Python", "Docker"] },
];

function Projects() {
  return (
    <Section>
      <SectionHeading eyebrow="Portfolio" title="Selected work" description="A mix of production client work and standout intern projects." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Card key={p.title} className="overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="h-40 bg-gradient-hero relative">
              <div className="absolute top-3 right-3">
                <Badge variant="secondary">{p.type}</Badge>
              </div>
              <div className="absolute bottom-4 left-4 text-white text-2xl font-bold opacity-90">{p.title.split(" ")[0]}</div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => <span key={t} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">{t}</span>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}