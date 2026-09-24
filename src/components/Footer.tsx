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

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-white border-t border-blue-100/60 mt-0">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 md:gap-8 md:grid-cols-12">
          {/* Logo */}
          <div className="md:col-span-2">
            <Logo />
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-800 mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-blue-600 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-800 mb-4 text-sm">Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/services" className="hover:text-blue-600 transition-colors">
                  Software Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-600 transition-colors">
                  AI Solutions
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-600 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-600 transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-600 transition-colors">
                  UI/UX Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Internship */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-800 mb-4 text-sm">Internship</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/internship" className="hover:text-blue-600 transition-colors">
                  Full Stack
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-blue-600 transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-blue-600 transition-colors">
                  C / C++
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-blue-600 transition-colors">
                  Python
                </Link>
              </li>
              <li>
                <Link to="/internship" className="hover:text-blue-600 transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Right-side description + social */}
          <div className="md:col-span-4 md:text-right">
            <h4 className="font-bold text-slate-800 text-lg mb-2">
              Impact. Develop. Deliver.
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Premium Software Engineering, AI Solutions and Project-based Internships.
            </p>
            <div className="flex gap-2 md:justify-end">
              <a
                href={COMPANY.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@yrnovatech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/yrnovatech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-100/60">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()}. YR NOVATECH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/about" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
              Terms & Conditions
            </Link>
          </div>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
