import { createNeonAuth } from "@neondatabase/auth/next/server"
import {
  createAuthServer,
  extractNeonAuthCookies,
  type RequestContext,
} from "@neondatabase/auth/server"
import { cookies, headers } from "next/headers"

const baseUrl = process.env.NEON_AUTH_BASE_URL!
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET!

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
})

const sessionReader = createAuthServer({
  baseUrl,
  cookieSecret,
  context: async (): Promise<RequestContext> => {
    const cookieStore = await cookies()
    const headerStore = await headers()

    return {
      // cookies() includes session cookies refreshed by the proxy on this request.
      getCookies: () => extractNeonAuthCookies(cookieStore.toString()),
      // Rendering can only read cookies; proxy and auth handlers persist refreshes.
      setCookie: () => {},
      getHeader: (name) => headerStore.get(name),
      getOrigin: () =>
        headerStore.get("origin") ||
        headerStore.get("referer")?.split("/").slice(0, 3).join("/") ||
        "",
      getFramework: () => "nextjs",
    }
  },
})

// Keep the SDK's writable handlers and auth methods, but make session reads RSC-safe.
auth.getSession = sessionReader.getSession
