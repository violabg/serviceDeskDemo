import { auth } from "@/lib/auth/server"

export default auth.middleware({
  loginUrl: "/login",
})

export const config = {
  // Complete the OAuth verifier exchange before rendering the callback UI.
  matcher: ["/auth/callback", "/account/:path*"],
}
