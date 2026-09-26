import { NeonAuthUiProvider } from "@/components/auth/neon-auth-ui-provider"
import { AuthView } from "@neondatabase/auth-ui"

export default function AuthCallbackPage() {
  return (
    <NeonAuthUiProvider>
      <AuthView path="callback" />
    </NeonAuthUiProvider>
  )
}
