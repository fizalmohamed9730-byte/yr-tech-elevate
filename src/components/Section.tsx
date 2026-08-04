import { type ReactNode } from "react";

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`container mx-auto px-4 py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center mb-12 animate-fade-up">
      {eyebrow && (
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-accent text-accent-foreground mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {description && <p className="text-muted-foreground text-lg">{description}</p>}
    </div>
  );
}