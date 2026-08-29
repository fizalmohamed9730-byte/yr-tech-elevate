import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/yr-tech-logo.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <img
        src={logoUrl}
        alt="YR NOVATECH logo"
        className="h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
      />
      {!compact && (
        <div className="flex flex-col leading-tight whitespace-nowrap">
          <span className="font-bold tracking-tight text-lg md:text-xl">YR NOVATECH</span>
          <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider uppercase">
            Innovate. Develop. Deliver
          </span>
        </div>
      )}
    </Link>
  );
}