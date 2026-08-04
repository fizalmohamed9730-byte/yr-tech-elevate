import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Github, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30 mt-20">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            Building tomorrow's technology and training the next generation of engineers.
          </p>
          <div className="flex gap-2">
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-md hover:bg-accent"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="p-2 rounded-md hover:bg-accent"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="p-2 rounded-md hover:bg-accent"><Twitter className="h-4 w-4" /></a>
            <a href="https://wa.me/" aria-label="WhatsApp" className="p-2 rounded-md hover:bg-accent"><MessageCircle className="h-4 w-4" /></a>
            <a href="mailto:hello@yrnovatech.in" aria-label="Email" className="p-2 rounded-md hover:bg-accent"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/projects" className="hover:text-foreground">Projects</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">Web Development</Link></li>
            <li><Link to="/services" className="hover:text-foreground">UI/UX Design</Link></li>
            <li><Link to="/services" className="hover:text-foreground">AI Solutions</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Consulting</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Internship</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/internship" className="hover:text-foreground">Full Stack</Link></li>
            <li><Link to="/internship" className="hover:text-foreground">UI/UX Design</Link></li>
            <li><Link to="/internship" className="hover:text-foreground">Python</Link></li>
            <li><Link to="/internship" className="hover:text-foreground">Cyber Security</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} YR NOVATECH. All rights reserved. · Founded by Fizal Mohamed Syed Abbas · Udyam UDYAM-TN-17-0077694
      </div>
    </footer>
  );
}