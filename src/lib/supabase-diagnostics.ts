/**
 * Development-only Supabase egress diagnostics.
 *
 * Tracks request count, endpoint, response size, duration and duplicate
 * frequency so egress regressions are visible locally.
 *
 * Safety:
 *  - Installed only when `import.meta.env.DEV` is true, so production builds
 *    strip it entirely (the guard is statically evaluated and the call is
 *    behind it).
 *  - Only the request *path* is recorded. Query-string values, headers, request
 *    bodies, tokens and error payloads are never read or logged, so no
 *    passwords, payment data or personal information can leak.
 */

type Bucket = {
  method: string;
  path: string;
  count: number;
  bytes: number;
  totalMs: number;
  maxMs: number;
  statuses: Record<string, number>;
};

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_PATHS = 200;

type DiagWindow = Window & {
  __supabaseEgressDiag?: boolean;
  __supabaseEgressReport?: () => void;
};

const diagWindow = () => window as DiagWindow;

function bucketFor(method: string, path: string): Bucket {
  const key = `${method} ${path}`;
  let b = buckets.get(key);
  if (!b) {
    if (buckets.size >= MAX_TRACKED_PATHS)
      return { method, path, count: 0, bytes: 0, totalMs: 0, maxMs: 0, statuses: {} };
    b = { method, path, count: 0, bytes: 0, totalMs: 0, maxMs: 0, statuses: {} };
    buckets.set(key, b);
  }
  return b;
}

function isSupabaseRequest(input: RequestInfo | URL): URL | null {
  try {
    const href =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    const url = new URL(href);
    return /supabase\.co$/.test(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

export function installSupabaseDiagnostics(): void {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV !== true) return;
  if (diagWindow().__supabaseEgressDiag) return;
  diagWindow().__supabaseEgressDiag = true;

  const originalFetch = window.fetch.bind(window);
  let reportTimer: number | undefined;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = isSupabaseRequest(input);
    if (!url) return originalFetch(input, init);

    const method = (
      init?.method ?? (input instanceof Request ? input.method : "GET")
    ).toUpperCase();
    // Deliberately drop the query string: values can contain emails/ids.
    const path = url.pathname;
    const bucket = bucketFor(method, path);
    const started = performance.now();

    const res = await originalFetch(input, init);

    const ms = performance.now() - started;
    const status = String(res.status);
    const lenHeader = Number(res.headers.get("content-length") ?? "0");

    bucket.count += 1;
    bucket.totalMs += ms;
    bucket.maxMs = Math.max(bucket.maxMs, ms);
    bucket.statuses[status] = (bucket.statuses[status] ?? 0) + 1;
    if (lenHeader) bucket.bytes += lenHeader;

    scheduleReport();
    return res;
  };

  function scheduleReport() {
    if (reportTimer !== undefined) return;
    reportTimer = window.setTimeout(() => {
      reportTimer = undefined;
      printReport();
    }, 3000);
  }

  function printReport() {
    const rows = [...buckets.values()]
      .filter((b) => b.count > 0)
      .sort((a, b) => b.bytes - a.bytes || b.count - a.count);

    if (rows.length === 0) return;

    const totalReq = rows.reduce((s, b) => s + b.count, 0);
    const totalBytes = rows.reduce((s, b) => s + b.bytes, 0);

    console.groupCollapsed(
      `[supabase-egress] ${totalReq} requests, ${(totalBytes / 1024).toFixed(1)} KB transferred`,
    );
    console.table(
      rows.map((b) => ({
        endpoint: `${b.method} ${b.path}`,
        requests: b.count,
        "KB (content-length)": (b.bytes / 1024).toFixed(1),
        "avg ms": (b.totalMs / b.count).toFixed(0),
        "max ms": b.maxMs.toFixed(0),
        statuses: JSON.stringify(b.statuses),
      })),
    );
    const dupes = rows.filter((b) => b.count > 1);
    if (dupes.length) {
      console.info(
        "[supabase-egress] repeated endpoints (possible duplicate/polling load):",
        dupes.map((b) => `${b.method} ${b.path} x${b.count}`),
      );
    }
    console.groupEnd();
  }

  diagWindow().__supabaseEgressReport = printReport;
  console.info(
    "[supabase-egress] diagnostics enabled (dev only). Call window.__supabaseEgressReport() for an on-demand summary.",
  );
}
