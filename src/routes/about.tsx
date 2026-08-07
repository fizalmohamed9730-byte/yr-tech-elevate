import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Target, Eye, Heart, Rocket } from "lucide-react";
import founder from "@/assets/founder.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YR NOVATECH — Technology & Innovation Company" },
      {
        name: "description",
        content:
          "YR NOVATECH is a technology and innovation company focused on software development, internship programs, and professional skill development.",
      },
      { property: "og:title", content: "About YR NOVATECH" },
      {
        property: "og:description",
        content:
          "Technology and innovation company focused on software development, internship programs, and professional skill development.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Target,
    title: "Mission",
    text: "Empower businesses and aspiring engineers through high-quality software and immersive training.",
  },
  {
    icon: Eye,
    title: "Vision",
    text: "Become India's most trusted partner for software craftsmanship and ed-tech excellence.",
  },
  {
    icon: Heart,
    title: "Values",
    text: "Curiosity, craft, integrity, and student-first thinking guide every project we touch.",
  },
  {
    icon: Rocket,
    title: "Future Goals",
    text: "Train 10,000+ engineers and launch our own SaaS products by 2027.",
  },
];

function About() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="About YR NOVATECH"
          title="Technology & Innovation Company"
          description="Bridging the gap between academic learning and industry requirements through hands-on experience."
        />
      </Section>

      <Section className="!pt-0">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            YR NOVATECH is a technology and innovation company focused on software development,
            internship programs, and professional skill development. We provide practical industry
            experience through project-based internships and help students develop real-world
            technical skills.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our mission is to bridge the gap between academic learning and industry requirements by
            offering hands-on experience, guided projects, and professional development
            opportunities.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
            {[
              "Innovation",
              "Practical Learning",
              "Skill Development",
              "Industry Experience",
              "Career Growth",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg bg-gradient-primary/10 border border-primary/20 px-3 py-2 text-sm font-medium text-primary"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-8 md:grid-cols-2 items-center max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-3xl" />
            <img
              src={founder}
              alt="S. Fizal Mohamed, Founder & CEO of YR NOVATECH"
              loading="lazy"
              width={896}
              height={1024}
              className="relative rounded-2xl shadow-elegant w-full"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Founder & CEO
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-1">S. FIZAL MOHAMED</h2>
            <p className="text-sm text-muted-foreground mb-6">Founder & CEO, YR NOVATECH</p>
            <p className="text-muted-foreground mb-4">
              S. Fizal Mohamed founded YR NOVATECH with one belief: India has incredible engineering
              talent that just needs the right opportunities. What started as freelance projects has
              grown into a technology company delivering software solutions for clients across
              industries — and a learning platform mentoring hundreds of students every year.
            </p>
            <p className="text-muted-foreground">
              He leads the company's vision around innovation, mentorship, and building products
              that matter.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-secondary/30 rounded-3xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <Card key={v.title} className="p-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <v.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
