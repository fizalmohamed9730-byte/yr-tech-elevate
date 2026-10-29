import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import { articles, CATEGORIES, getCategoryLabel } from "@/lib/articles";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: `Technology Resources & Engineering Knowledge Hub | ${COMPANY.name}` },
      {
        name: "description",
        content: `Technical articles, architecture guides, and engineering knowledge from ${COMPANY.name}. Learn about full-stack development, AI, Python, data analytics, and UI/UX design.`,
      },
      { property: "og:title", content: `Technology Resources — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Engineering knowledge hub: full-stack, AI, Python, and design guides from ${COMPANY.name}.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://yrnovatech.in/resources" },
    ],
    links: [{ rel: "canonical", href: "https://yrnovatech.in/resources" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "YR NOVATECH Technology Resources",
          url: "https://yrnovatech.in/resources",
          description: "Technical articles, architecture guides, and engineering knowledge from YR NOVATECH.",
          publisher: { "@type": "Organization", name: "YR NOVATECH", url: "https://yrnovatech.in" },
          hasPart: articles.map((a) => ({
            "@type": "TechArticle",
            headline: a.title,
            description: a.summary,
            url: `https://yrnovatech.in/resources/${a.id}`,
          })),
        }),
      },
    ],
  }),
  component: Resources,
});

function Resources() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Knowledge Hub"
          title="Technology Resources"
          description={`Engineering knowledge and technical guides from the ${COMPANY.name} team. Practical explanations of the technologies, architectures, and practices we use to build software.`}
        />

        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm text-muted-foreground leading-relaxed">
            These resources are written by our engineering team based on real
            experience building production software and training interns. Each article
            explains a concept in depth, with practical context for how it applies to
            real projects. We focus on fundamentals that remain relevant regardless
            of which specific frameworks or libraries are popular today.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Article list — each card links to the full article page */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="border border-border overflow-hidden transition-all hover:shadow-card-hover"
            >
              <Link
                to="/resources/$slug"
                params={{ slug: article.id }}
                className="block p-6 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 shadow-elegant">
                    <article.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {getCategoryLabel(article.category)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </Link>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No articles found in this category yet.
            </p>
          </div>
        )}
      </Section>

      {/* CTA */}
      <Section className="!pt-0">
        <div className="rounded-3xl bg-gradient-hero p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Learn by Building with {COMPANY.name}
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm">
            Our internship programs put these concepts into practice. Build real
            projects, get mentor feedback, and earn verifiable certificates.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/internship">
                View Internship Program <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
