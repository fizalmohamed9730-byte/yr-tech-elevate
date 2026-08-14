import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Target, Eye, Heart, Rocket, GraduationCap, BadgeCheck, Code2, PenTool } from "lucide-react";
import founder from "@/assets/founder.jpg";
import coFounder from "@/assets/co-founder.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YR NOVATECH — Technology & Innovation Company" },
      {
        name: "description",
        content:
          "YR NOVATECH is a technology and innovation company focused on software development, internship programs, and professional skill development. Meet our leadership, including Co-Founder & COO M. Annapoorani.",
      },
      { property: "og:title", content: "About YR NOVATECH" },
      {
        property: "og:description",
        content:
          "Technology and innovation company focused on software development, internship programs, and professional skill development.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "YR NOVATECH",
          description:
            "Technology and innovation company focused on software development, internship programs, and professional skill development.",
          founder: { "@type": "Person", name: "S. Fizal Mohamed", jobTitle: "Founder & CEO" },
          employee: [
            {
              "@type": "Person",
              name: "M. Annapoorani",
              jobTitle: "Co-Founder & COO",
              alumniOf: { "@type": "CollegeOrUniversity", name: "B.Sc. Computer Science" },
            },
          ],
        }),
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
        <Reveal>
          <SectionHeading
            eyebrow="Leadership Team"
            title="Meet Our Leadership"
            description="The leaders driving YR NOVATECH's vision, technology, and operational excellence."
          />
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Founder & CEO */}
          <Reveal>
            <Card className="group overflow-hidden rounded-2xl border border-border bg-card shadow-elegant hover:-translate-y-1 transition-transform duration-300 h-full">
              <div className="relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-primary opacity-15 blur-2xl rounded-3xl" />
                <img
                  src={founder}
                  alt="S. Fizal Mohamed, Founder & CEO of YR NOVATECH"
                  loading="lazy"
                  width={708}
                  height={1024}
                  className="relative aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 md:p-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Founder & CEO
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-1">S. FIZAL MOHAMED</h3>
                <p className="text-sm text-muted-foreground mb-4">Founder & CEO, YR NOVATECH</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  S. Fizal Mohamed founded YR NOVATECH with one belief: India has incredible
                  engineering talent that just needs the right opportunities. What started as
                  freelance projects has grown into a technology company delivering software
                  solutions for clients across industries — and a learning platform mentoring
                  hundreds of students every year.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  He leads the company's vision around innovation, mentorship, and building products
                  that matter.
                </p>
              </div>
            </Card>
          </Reveal>

          {/* Co-Founder & COO */}
          <Reveal delay={120}>
            <Card className="group overflow-hidden rounded-2xl border border-border bg-card shadow-elegant hover:-translate-y-1 transition-transform duration-300 h-full">
              <div className="relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-primary opacity-15 blur-2xl rounded-3xl" />
                <img
                  src={coFounder}
                  alt="M. Annapoorani — Co-Founder & COO of YR NOVATECH"
                  loading="lazy"
                  width={640}
                  height={853}
                  className="relative aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 md:p-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Co-Founder & COO
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-1">M. ANNAPOORANI</h3>
                <p className="text-sm text-muted-foreground mb-4">Co-Founder & COO, YR NOVATECH</p>

                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  B.Sc. Computer Science
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    { icon: BadgeCheck, label: "Certified Java & Python Full Stack Developer" },
                    { icon: PenTool, label: "UI/UX Designer" },
                  ].map((c) => (
                    <span
                      key={c.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary"
                    >
                      <c.icon className="h-3.5 w-3.5" />
                      {c.label}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  M. Annapoorani is the Co-Founder and Chief Operating Officer of YR NOVATECH, with
                  an academic background in Computer Science and expertise spanning full-stack
                  development and UI/UX design. She is a certified Java and Python Full Stack
                  Developer and UI/UX Designer, contributing to the company's technology, product
                  development, user experience, and operational growth.
                </p>

                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: Code2, label: "Java & Python Full Stack Development" },
                      { icon: PenTool, label: "UI/UX Design" },
                    ].map((s) => (
                      <span
                        key={s.label}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-secondary border border-border px-2.5 py-1 text-xs text-secondary-foreground"
                      >
                        <s.icon className="h-3.5 w-3.5 text-primary" />
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
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
