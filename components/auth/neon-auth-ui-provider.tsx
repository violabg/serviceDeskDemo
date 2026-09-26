"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth/client"

type NeonAuthUiProviderProps = {
  children: React.ReactNode
}

export function NeonAuthUiProvider({ children }: NeonAuthUiProviderProps) {
  const router = useRouter()

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      Link={Link}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      credentials={false}
      persistClient
      redirectTo="/"
      social={{ providers: ["github"] }}
    >
      {children}
    </NeonAuthUIProvider>
  )
}
