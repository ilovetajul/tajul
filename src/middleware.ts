import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Best-effort rate limiting on sensitive POST endpoints. This is in-memory, so it
// resets whenever a serverless instance cold-starts — it's a real speed bump against
// naive rapid-fire abuse (login brute-forcing, contact-form spam bots), but it is NOT
// a guarantee under sustained/distributed attack traffic. A production-grade version
// would use a shared store like Upstash Redis or Vercel KV; documented here rather
// than silently overselling what this does.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMITS: Record<string, number> = {
  "/api/auth/callback/credentials": 5,
  "/api/contact": 5,
};
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

// Unchanged from before — same config, same behavior for admin routes. It's just
// invoked conditionally now instead of being the sole default export.
const protectAdmin = withAuth({ pages: { signIn: "/admin/login" } });

export default function middleware(req: NextRequest, event: unknown) {
  const { pathname } = req.nextUrl;
  const limit = RATE_LIMITS[pathname];

  if (req.method === "POST" && limit) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(`${pathname}:${ip}`, limit)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // withAuth's returned function expects NextRequestWithAuth; a plain NextRequest is
    // structurally compatible with what it actually reads at runtime. Explicit cast
    // instead of @ts-ignore, which only suppresses the exact next line and is fragile
    // to reformatting.
    return (protectAdmin as any)(req as any, event as any);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/((?!login).*)",
    "/api/admin/:path*",
    "/api/auth/callback/credentials",
    "/api/contact",
  ],
};
