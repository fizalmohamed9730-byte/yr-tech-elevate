import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Github, Linkedin, Mail, MessageCircle, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30 mt-20">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            Innovate · Develop · Deliver. Premium software engineering, AI solutions, and
            project-based internships.
          </p>
          <div className="flex gap-2">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-md hover:bg-accent"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-md hover:bg-accent"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-md hover:bg-accent"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2 rounded-md hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="mailto:fizalyrtech@gmail.com"
              aria-label="Email"
              className="p-2 rounded-md hover:bg-accent"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/projects" className="hover:text-foreground">
                Projects
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/services" className="hover:text-foreground">
                Software Development
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-foreground">
                AI Solutions
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-foreground">
                Web Development
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-foreground">
                Mobile Apps
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-foreground">
                UI/UX Design
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Internship</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/internship" className="hover:text-foreground">
                Full Stack
              </Link>
            </li>
            <li>
              <Link to="/internship" className="hover:text-foreground">
                UI/UX Design
              </Link>
            </li>
            <li>
              <Link to="/internship" className="hover:text-foreground">
                C++
              </Link>
            </li>
            <li>
              <Link to="/internship" className="hover:text-foreground">
                Python
              </Link>
            </li>
            <li>
              <Link to="/internship" className="hover:text-foreground">
                Artificial Intelligence
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} YR NOVATECH. All rights reserved. · Founded by S. FIZAL MOHAMED
        · Udyam UDYAM-TN-17-0077694
      </div>
    </footer>
  );
}
