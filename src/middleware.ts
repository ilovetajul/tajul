import { withAuth } from "next-auth/middleware";

// Protects every /admin page (except /admin/login) and every /api/admin/* route.
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  // Protects everything under /admin EXCEPT /admin/login (must stay public,
  // otherwise you'd get redirected to the login page... in an infinite loop).
  matcher: ["/admin/((?!login).*)", "/api/admin/:path*"],
};
