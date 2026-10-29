import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import { articles, getArticleBySlug, getCategoryLabel, CATEGORIES } from "@/lib/articles";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

const BASE_URL = "https://yrnovatech.in";

export const Route = createFileRoute("/resources_/$slug")({
  head: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) {
      return {
        meta: [{ title: `Article Not Found | ${COMPANY.name}` }],
      };
    }

    const categoryLabel = getCategoryLabel(article.category);

    return {
      meta: [
        { title: `${article.title} | ${COMPANY.name} Resources` },
        { name: "description", content: article.summary },
        { property: "og:title", content: `${article.title} — ${COMPANY.name}` },
        { property: "og:description", content: article.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${BASE_URL}/resources/${article.id}` },
        { property: "og:site_name", content: COMPANY.name },
        { property: "article:section", content: categoryLabel },
        { property: "article:publisher", content: BASE_URL },
      ],
      links: [{ rel: "canonical", href: `${BASE_URL}/resources/${article.id}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: article.title,
            description: article.summary,
            url: `${BASE_URL}/resources/${article.id}`,
            publisher: {
              "@type": "Organization",
              name: COMPANY.name,
              url: BASE_URL,
            },
            author: {
              "@type": "Organization",
              name: COMPANY.name,
              url: BASE_URL,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${BASE_URL}/resources/${article.id}`,
            },
            isPartOf: {
              "@type": "CollectionPage",
              name: `${COMPANY.name} Technology Resources`,
              url: `${BASE_URL}/resources`,
            },
            about: categoryLabel,
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const article = getArticleBySlug(slug);

  if (!article) {
    throw notFound();
  }

  const categoryLabel = getCategoryLabel(article.category);
  const Icon = article.icon;

  // Find previous / next articles in the same category for navigation
  const sameCategory = articles.filter((a) => a.category === article.category);
  const currentIdx = sameCategory.findIndex((a) => a.id === article.id);
  const prev = currentIdx > 0 ? sameCategory[currentIdx - 1] : null;
  const next = currentIdx < sameCategory.length - 1 ? sameCategory[currentIdx + 1] : null;

  // Related articles from other categories
  const related = articles
    .filter((a) => a.category !== article.category)
    .slice(0, 3);

  return (
    <>
      <Section>
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          aria-label="Breadcrumb"
        >
          <Link
            to="/resources"
            className="hover:text-primary transition-colors"
          >
            Resources
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">
            {article.title}
          </span>
        </nav>

        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elegant">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {categoryLabel}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {article.summary}
            </p>
          </header>

          {/* Article body */}
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-5">
            {article.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-[15px] text-muted-foreground leading-[1.8]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Author attribution */}
          <footer className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Written by the engineering team at{" "}
              <Link
                to="/about"
                className="text-primary hover:underline font-medium"
              >
                {COMPANY.name}
              </Link>
              . Based on real experience building production software and
              training interns through structured, project-based programs.
            </p>
          </footer>

          {/* Category navigation */}
          {(prev || next) && (
            <nav
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-between"
              aria-label="Article navigation"
            >
              {prev ? (
                <Button
                  asChild
                  variant="outline"
                  className="justify-start gap-2"
                >
                  <Link to="/resources/$slug" params={{ slug: prev.id }}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="truncate">{prev.title}</span>
                  </Link>
                </Button>
              ) : (
                <div />
              )}
              {next ? (
                <Button
                  asChild
                  variant="outline"
                  className="justify-end gap-2"
                >
                  <Link to="/resources/$slug" params={{ slug: next.id }}>
                    <span className="truncate">{next.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </nav>
          )}
        </article>

        {/* Related articles from other categories */}
        {related.length > 0 && (
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6">
              More from {COMPANY.name} Resources
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const RIcon = r.icon;
                return (
                  <Link
                    key={r.id}
                    to="/resources/$slug"
                    params={{ slug: r.id }}
                    className="group rounded-xl border border-border bg-card p-5 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <RIcon className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {getCategoryLabel(r.category)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {r.summary}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to all resources */}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/resources">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse All Resources
            </Link>
          </Button>
        </div>
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
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/internship">
                View Internship Program{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
