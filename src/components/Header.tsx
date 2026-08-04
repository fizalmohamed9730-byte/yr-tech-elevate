import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/internship", label: "Internship" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground rounded-md bg-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" variant="ghost" className="hidden md:inline-flex" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild className="hidden md:inline-flex bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-border/40 bg-background px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}