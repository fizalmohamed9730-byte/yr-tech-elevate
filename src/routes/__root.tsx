import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { COMPANY } from "@/lib/company";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "YR NOVATECH - Innovate. Develop. Deliver." },
      {
        name: "description",
        content:
          "YR NOVATECH is an MSME-registered software development and technology company building web and mobile applications, data and AI solutions, and structured project-based internships for students and aspiring engineers.",
      },
      { name: "author", content: "YR NOVATECH" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#2563eb" },
      { name: "google-adsense-account", content: "ca-pub-7591764247912152" },
      { property: "og:title", content: "YR NOVATECH - Innovate. Develop. Deliver." },
      {
        property: "og:description",
        content:
          "Software development, data and AI solutions, and project-based internships from an MSME-registered technology company.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "YR NOVATECH" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: "https://www.yrnovatech.in" },
      { property: "og:image", content: "https://www.yrnovatech.in/og-image.png" },
      { property: "og:image:width", content: "1024" },
      { property: "og:image:height", content: "682" },
      { property: "og:image:alt", content: "YR NOVATECH logo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "YR NOVATECH - Innovate. Develop. Deliver." },
      {
        name: "twitter:description",
        content: "Software development, data and AI solutions, and project-based internships.",
      },
      { name: "twitter:image", content: "https://www.yrnovatech.in/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.yrnovatech.in" },
      { rel: "icon", href: "/__fallback/yr-tech-logo.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "YR NOVATECH",
          url: "https://www.yrnovatech.in",
          logo: "https://www.yrnovatech.in/og-image.png",
          email: COMPANY.email,
          description:
            "MSME-registered software development and technology company building web and mobile applications, data and AI solutions, and project-based internships.",
          address: { "@type": "PostalAddress", addressCountry: "IN" },
          sameAs: [COMPANY.instagram, COMPANY.linkedin],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "YR NOVATECH",
          url: "https://www.yrnovatech.in",
          publisher: { "@type": "Organization", name: "YR NOVATECH" },
        }),
      },
      {
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7591764247912152",
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Development-only egress diagnostics. The `import.meta.env.DEV` check is
  // statically evaluated at build time, so this whole block is dead-code
  // eliminated from production bundles.
  useEffect(() => {
    if (import.meta.env.DEV) {
      void import("@/lib/supabase-diagnostics").then((m) =>
        m.installSupabaseDiagnostics(),
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
