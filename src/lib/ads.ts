export const ADSENSE_CLIENT = "ca-pub-7591764247912152";

/**
 * Ad unit slot IDs.
 *
 * Every value must be a real slot ID created in the AdSense dashboard for
 * client `ca-pub-7591764247912152`. An empty string means "no slot created
 * yet" and AdSlot renders nothing, so the site never ships an invalid unit.
 *
 * To go live: create the slots in AdSense, paste the IDs here, redeploy.
 */
export const AD_SLOTS = {
  /** Home page, between main content sections. */
  homeInline: "",
  /** Long-form content pages (services, internship, resources, about). */
  contentInline: "",
  /** FAQ / support pages. */
  faqInline: "",
} as const;

/** Route prefixes where an ad must never render. */
export const AD_BLOCKED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/admin-setup",
  "/login",
  "/register",
  "/auth",
  "/internships",
  "/profile",
  "/certificate",
] as const;

export function isAdBlockedPath(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0];
  if (path === "/") return false;
  return AD_BLOCKED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
