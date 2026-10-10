import { auth } from "@/lib/auth/server"

export default auth.middleware({
  loginUrl: "/login",
})

export const config = {
  // Refresh session cookies before protected Server Components read the session.
  matcher: [
    "/auth/callback",
    "/account/:path*",
    "/dashboard/:path*",
    "/customers/:path*",
    "/tickets/:path*",
    "/users/:path*",
    "/roles/:path*",
    "/pending-access",
  ],
}
