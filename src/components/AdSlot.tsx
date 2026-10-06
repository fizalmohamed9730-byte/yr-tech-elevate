import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ADSENSE_CLIENT, isAdBlockedPath } from "@/lib/ads";

interface AdSlotProps {
  /** AdSense slot ID. When empty the component renders nothing at all. */
  slot: string;
  /** Optional class for spacing around the unit. */
  className?: string;
}

/**
 * Manual AdSense unit. Renders only on public routes: private paths
 * (dashboard, admin, auth, payment, certificates, profile) are blocked even
 * if this component is imported into one of them by mistake.
 */
export function AdSlot({ slot, className = "" }: AdSlotProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pushed = useRef(false);

  const blocked = isAdBlockedPath(pathname);
  const enabled = Boolean(slot) && !blocked;

  useEffect(() => {
    if (!enabled || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* ad script not loaded yet; it will pick the unit up on next load */
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={`mx-auto w-full max-w-5xl ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
