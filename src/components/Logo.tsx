import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/yr-tech-logo.png";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <img
        src={logoUrl}
        alt="YR NOVATECH logo"
        width={40}
        height={40}
        className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
      />
      {!compact && (
        <div className="flex flex-col leading-tight whitespace-nowrap">
          <span className="font-bold tracking-tight text-base">YR NOVATECH</span>
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
            Innovate · Develop · Deliver
          </span>
        </div>
      )}
    </Link>
  );
}