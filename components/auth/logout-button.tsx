"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/client"
import { SignOutIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const disabled = isSigningOut || isPending

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={disabled}
      onClick={() => {
        setIsSigningOut(true)

        startTransition(async () => {
          await authClient.signOut()
          router.replace("/login")
          router.refresh()
        })
      }}
    >
      <SignOutIcon weight="fill" />
      {disabled ? "Signing out..." : "Log out"}
    </Button>
  )
}
