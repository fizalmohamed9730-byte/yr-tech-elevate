import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/internship", label: "Internship" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const { isAuthenticated, isAdmin, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-blue-100/60 shadow-[0_1px_3px_rgba(37,99,235,0.06)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo compact />
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors rounded-md px-3 py-1.5 relative"
              activeProps={{
                className:
                  "text-sm font-medium text-blue-600 rounded-md px-3 py-1.5 relative after:absolute after:bottom-[-13px] after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-blue-600 after:rounded-full",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Dashboard"
              >
                <User className="h-4 w-4" />
              </Link>
              {isAdmin && (
                <div className="relative hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5 rounded-lg"
                    onClick={() => setAdminDropdown(!adminDropdown)}
                  >
                    Sign In
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  {adminDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-blue-100 shadow-lg py-1 z-50">
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setAdminDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setAdminDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600"
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
                  className="hidden md:inline-flex text-slate-500 hover:text-blue-600"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              )}
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Sign in"
              >
                <User className="h-4 w-4" />
              </Link>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden md:inline-flex border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5 rounded-lg"
              >
                <Link to="/auth">
                  Sign In <ChevronDown className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-blue-100/40 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 rounded-md px-3 py-2 hover:bg-blue-50"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-blue-100/40 pt-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium rounded-md px-3 py-2 hover:bg-blue-50 text-blue-600"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium rounded-md px-3 py-2 hover:bg-blue-50 text-slate-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-sm font-medium text-left rounded-md px-3 py-2 hover:bg-blue-50 text-slate-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="text-sm font-medium bg-blue-600 text-white rounded-lg px-3 py-2 text-center hover:bg-blue-700"
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
