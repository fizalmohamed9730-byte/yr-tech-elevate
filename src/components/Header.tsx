import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/internship", label: "Internship" },
  { to: "/projects", label: "Projects" },
  { to: "/resources", label: "Resources", secondary: true },
  { to: "/faq", label: "FAQ", secondary: true },
  { to: "/careers", label: "Careers", secondary: true },
  { to: "/contact", label: "Contact" },
] as const;

function navClass(active: boolean, secondary?: boolean) {
  const base = [
    "text-[13px] rounded-lg px-3 py-2 relative transition-colors",
    secondary ? "hidden xl:block" : "block",
    active ? "font-semibold text-primary bg-accent/40" : "font-medium text-nav-muted hover:text-foreground hover:bg-accent/50",
  ];
  if (!active) return base.join(" ");
  return [
    ...base,
    "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-primary after:rounded-full",
  ].join(" ");
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, signOut } = useAuth();

  // Track scroll to add backdrop blur + subtle shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-nav glass shadow-nav border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo — constrained size */}
        <Logo compact />

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={navClass(false, "secondary" in l ? l.secondary : undefined)}
              activeProps={{ className: navClass(true, "secondary" in l ? l.secondary : undefined) }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-accent/50 text-foreground hover:bg-accent transition-colors"
                aria-label="Dashboard"
              >
                <User className="h-4 w-4" />
              </Link>
              {isAdmin && (
                <div className="relative hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-lg text-xs"
                    onClick={() => setAdminDropdown(!adminDropdown)}
                  >
                    Admin
                    <ChevronDown className={`h-3 w-3 transition-transform ${adminDropdown ? "rotate-180" : ""}`} />
                  </Button>
                  {adminDropdown && (
                    <div className="absolute right-0 mt-2 w-44 bg-card rounded-xl border border-border shadow-card-hover py-1.5 z-50 animate-slide-up">
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                        onClick={() => setAdminDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setAdminDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!isAdmin && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden md:inline-flex text-muted-foreground hover:text-foreground text-xs"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              )}
            </>
          ) : (
            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs shadow-sm"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground h-8 w-8"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav
          className="md:hidden border-t border-border bg-card/95 glass px-4 py-3 flex flex-col gap-0.5 animate-slide-up"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-border pt-2 flex flex-col gap-0.5">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium rounded-lg px-3 py-2.5 hover:bg-accent/50 text-primary transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium rounded-lg px-3 py-2.5 hover:bg-accent/50 text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-sm font-medium text-left rounded-lg px-3 py-2.5 hover:bg-accent/50 text-foreground transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-2.5 text-center hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
