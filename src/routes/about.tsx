import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Target, Eye, Rocket, GraduationCap, BadgeCheck, Code2, PenTool, Brain, BarChart3 } from "lucide-react";
import founder from "@/assets/founder.png";
import coFounder from "@/assets/co-founder.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YR NOVATECH - Technology & Innovation Company" },
      {
        name: "description",
        content:
          "YR NOVATECH is a technology and innovation company focused on software development, internship programs, and professional skill development. Meet our leadership.",
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

const whatWeDo = [
  "Custom Software Development",
  "AI & Machine Learning Solutions",
  "Web & Mobile Application Development",
  "UI/UX Design & Product Strategy",
  "Project-Based Internship Programs",
];

const values = [
  { icon: Target, title: "Mission", text: "Empower businesses and aspiring engineers through high-quality software and immersive training." },
  { icon: Eye, title: "Vision", text: "Become India's most trusted partner for software craftsmanship and ed-tech excellence." },
  { icon: Rocket, title: "Future Goals", text: "Train 10,000+ engineers and launch our own SaaS products by 2027." },
];

function About() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="About YR NOVATECH"
          title="Technology & Innovation Company"
        />
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            YR NOVATECH is a technology and innovation company focused on software development,
            internship programs, and professional skill development. We bridge the gap between
            academic learning and industry requirements through hands-on experience, guided
            projects, and professional development opportunities.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="p-6 border border-border">
            <h3 className="font-semibold text-lg mb-4">What We Do</h3>
            <ul className="space-y-2.5">
              {whatWeDo.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-4">
            {values.map((v) => (
              <Card key={v.title} className="p-5 border border-border flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                  <v.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.text}</p>
                </div>
              </Card>
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

        <div className="grid gap-8 max-w-5xl mx-auto">
          <Reveal>
            <Card className="group overflow-hidden rounded-2xl border border-border bg-card shadow-elegant hover:-translate-y-1 transition-transform duration-300 h-full">
              <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="relative overflow-hidden">
                  <div className="absolute -inset-4 bg-gradient-primary opacity-15 blur-2xl rounded-3xl" />
                  <img
                    src={founder}
                    alt="S. Fizal Mohamed, Founder & CEO of YR NOVATECH"
                    loading="lazy"
                    width={1024}
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

                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    B.Tech - Information Technology
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {[
                      { icon: Code2, label: "Certified Full Stack Developer" },
                      { icon: Brain, label: "AI Developer" },
                      { icon: BarChart3, label: "Data Analytics" },
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
                    S. Fizal Mohamed founded YR NOVATECH with one belief: India has incredible
                    engineering talent that just needs the right opportunities. What started as
                    freelance projects has grown into a technology company delivering software
                    solutions for clients across industries - and a learning platform mentoring
                    hundreds of students every year.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    He leads the company's vision around innovation, mentorship, and building products
                    that matter.
                  </p>

                  <div className="mt-5 pt-5 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Expertise
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: Code2, label: "Full Stack Development" },
                        { icon: Brain, label: "AI Development" },
                        { icon: BarChart3, label: "Data Analytics" },
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
              </div>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="group overflow-hidden rounded-2xl border border-border bg-card shadow-elegant hover:-translate-y-1 transition-transform duration-300 h-full">
              <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="relative overflow-hidden">
                  <div className="absolute -inset-4 bg-gradient-primary opacity-15 blur-2xl rounded-3xl" />
                  <img
                    src={coFounder}
                    alt="M. Annapoorani - Co-Founder & COO of YR NOVATECH"
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
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
