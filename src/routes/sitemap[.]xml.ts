import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { articles } from "@/lib/articles";

const BASE_URL = "https://yrnovatech.in";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          "/",
          "/about",
          "/services",
          "/internship",
          "/projects",
          "/resources",
          "/faq",
          "/careers",
          "/contact",
          "/privacy-policy",
          "/terms-and-conditions",
          "/refund-policy",
        ];

        // Individual resource article pages
        const articlePaths = articles.map((a) => `/resources/${a.id}`);

        const allPaths = [...staticPaths, ...articlePaths];

        const urls = allPaths
          .map((p) => {
            let changefreq = "monthly";
            let priority = "0.7";

            if (p === "/") {
              changefreq = "weekly";
              priority = "1.0";
            } else if (["/about", "/services", "/internship"].includes(p)) {
              priority = "0.9";
            } else if (p.startsWith("/resources/")) {
              priority = "0.8";
            }

            return `  <url><loc>${BASE_URL}${p}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
