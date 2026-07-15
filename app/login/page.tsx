import { AuthView } from "@neondatabase/auth/react"

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <AuthView path="sign-in" />
    </main>
  )
}
