import { withAuth } from "next-auth/middleware";

// Reverted to the simple, proven-working version — the rate-limiting wrapper added
// in the V2 round is the prime suspect for breaking admin login (401 on
// /api/auth/callback/credentials right after that change shipped). This exact
// version worked reliably for the whole rest of this project before that.
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  // Protects everything under /admin EXCEPT /admin/login (must stay public,
  // otherwise you'd get redirected to the login page... in an infinite loop).
  matcher: ["/admin/((?!login).*)", "/api/admin/:path*"],
};
