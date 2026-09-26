import { NeonAuthUiProvider } from "@/components/auth/neon-auth-ui-provider"
import { AuthView } from "@neondatabase/auth-ui"

export default function AuthCallbackPage() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <NeonAuthUiProvider>
        <AuthView path="callback" />
      </NeonAuthUiProvider>
    </main>
  )
}
