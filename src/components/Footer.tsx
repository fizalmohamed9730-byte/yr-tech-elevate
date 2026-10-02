import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Linkedin, Instagram, Youtube, ArrowUp } from "lucide-react";
import { COMPANY } from "@/lib/company";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialLinks = [
  { href: COMPANY.linkedin, label: "LinkedIn", icon: Linkedin },
  { href: COMPANY.instagram, label: "Instagram", icon: Instagram },
  { href: "https://www.youtube.com/@yrnovatech", label: "YouTube", icon: Youtube },
  { href: "https://x.com/yrnovatech", label: "X", icon: XIcon },
] as const;

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-card border-t border-border mt-0">
      <div className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
        <div className="grid gap-10 md:gap-8 md:grid-cols-12">
          {/* Logo */}
          <div className="md:col-span-2">
            <Logo />
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-foreground mb-4 text-sm">Services</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Software Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  AI Solutions
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  UI/UX Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Internship */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-foreground mb-4 text-sm">Internship</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/internship" className="hover:text-primary transition-colors">
                  Full Stack
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-primary transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-primary transition-colors">
                  C / C++
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-primary transition-colors">
                  Python
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-primary transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Right-side description + social */}
          <div className="md:col-span-4 md:text-right">
            <h4 className="font-bold text-foreground text-lg mb-2">Impact. Develop. Deliver.</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Premium Software Engineering, AI Solutions and Project-based Internships.
            </p>
            <div className="flex gap-2 md:justify-end">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-all hover:scale-105"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. YR NOVATECH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy-policy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border">|</span>
            <Link
              to="/terms-and-conditions"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms & Conditions
            </Link>
            <span className="text-border">|</span>
            <Link
              to="/refund-policy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Refund Policy
            </Link>
          </div>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-all hover:scale-105 shadow-sm"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
