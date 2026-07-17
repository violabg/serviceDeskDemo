"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth/react"

import { authClient } from "@/lib/auth/client"

type NeonAuthUiProviderProps = {
  children: React.ReactNode
}

export function NeonAuthUiProvider({ children }: NeonAuthUiProviderProps) {
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      credentials={false}
      persistClient
      redirectTo="/"
      social={{ providers: ["github"] }}
    >
      {children}
    </NeonAuthUIProvider>
  )
}
