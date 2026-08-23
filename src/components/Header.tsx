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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl h-16">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Logo compact />
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-1.5"
              activeProps={{ className: "text-sm font-medium text-foreground bg-accent rounded-md px-3 py-1.5" }}
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground rounded-md px-3 py-2 hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-border/40 pt-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-medium rounded-md px-3 py-2 hover:bg-accent">
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium rounded-md px-3 py-2 hover:bg-accent">
                  Dashboard
                </Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="text-sm font-medium text-left rounded-md px-3 py-2 hover:bg-accent">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-medium bg-gradient-primary text-primary-foreground rounded-md px-3 py-2 text-center hover:opacity-90">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
