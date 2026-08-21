import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/yr-tech-logo.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center group">
      <img
        src={logoUrl}
        alt="YR NOVATECH logo"
        className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
      />
    </Link>
  );
}