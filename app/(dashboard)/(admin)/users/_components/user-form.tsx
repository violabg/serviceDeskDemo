"use client"

import { createUserAction } from "@/app/(dashboard)/(admin)/actions"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

type Values = {
  name: string
  email: string
}

export function UserForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { name: "", email: "" },
  })

  const nameField = register("name")
  const emailField = register("email", {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
    },
  })

  const submit = handleSubmit((values) => {
    const formData = new FormData()
    formData.set("name", values.name)
    formData.set("email", values.email)

    startTransition(async () => {
      setMessage("")

      const result = await createUserAction(formData)

      if (!result.ok) {
        if (result.reason === "duplicate") {
          setError("email", {
            message: "An application user already uses this email",
          })
          return
        }

        setMessage(
          result.reason === "invalid"
            ? "Enter the user's email address."
            : "You do not have users:write permission."
        )
      }
    })
  })

  return (
    <form onSubmit={submit} className="gap-4 grid">
      <h2 className="font-heading font-semibold text-lg">New User</h2>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="user-name">Name</FieldLabel>
          <Input id="user-name" disabled={isPending} {...nameField} />
        </Field>
        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="user-email">
            Email <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="user-email"
            type="email"
            disabled={isPending}
            aria-invalid={errors.email ? true : undefined}
            {...emailField}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create User"}
        </Button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </form>
  )
}
