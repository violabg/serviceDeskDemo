"use client"

import {
  changeCustomerStatusAction,
  createCustomerAction,
  findDeactivatedMatchesAction,
  updateCustomerAction,
} from "@/app/(dashboard)/customers/actions"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

type Values = {
  company: string
  name: string
  email: string
  phone: string
  notes: string
  status: "Active" | "Deactivated"
}

type CustomerFormProps = {
  mode: "create" | "edit"
  canWrite: boolean
  canManage: boolean
  customerId?: string
  initialValues?: Partial<Values>
  onSaved?: () => void
}

type MatchView = { id: string; company: string | null; name: string; email: string | null }

export function CustomerForm({ mode, canWrite, canManage, customerId, initialValues, onSaved }: CustomerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [, startLookupTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [matches, setMatches] = useState<MatchView[]>([])
  const { register, getValues, handleSubmit, formState: { errors } } = useForm<Values>({
    defaultValues: {
      company: initialValues?.company ?? "",
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      notes: initialValues?.notes ?? "",
      status: initialValues?.status ?? "Active",
    },
  })

  const companyField = register("company", { required: "Company name is required" })
  const nameField = register("name", { required: "Primary contact is required" })
  const emailField = register("email", {
    required: "Contact email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
  })
  const phoneField = register("phone")
  const notesField = register("notes")

  const submit = handleSubmit((values) => {
    const formData = new FormData()
    if (customerId) formData.set("customerId", customerId)
    formData.set("company", values.company)
    formData.set("name", values.name)
    formData.set("email", values.email)
    formData.set("phone", values.phone)
    formData.set("notes", values.notes)
    formData.set("status", values.status)
    startTransition(async () => {
      const result = mode === "create"
        ? await createCustomerAction(formData)
        : await updateCustomerAction(formData)
      if (!result.ok) {
        setMatches(result.reason === "reactivation" ? result.matches : [])
        setMessage(result.reason === "duplicate" ? "An active Customer already uses this company and email." : result.reason === "reactivation" ? "A deactivated match exists. Reactivate that record instead." : "Check the Customer fields and try again.")
        return
      }
      if (mode === "create" && "customer" in result) {
        router.push(`/customers/${result.customer.id}`)
        return
      }
      setMatches([])
      setMessage("Customer saved.")
      onSaved?.()
      router.refresh()
    })
  })

  function lookupDeactivatedMatches() {
    if (mode !== "create" || !canWrite) return
    const company = getValues("company").trim()
    const email = getValues("email").trim()
    if (!company || !email) return
    startLookupTransition(async () => {
      try {
        const result = await findDeactivatedMatchesAction(company, email)
        setMatches(result.ok ? result.matches : [])
      } catch {
        setMatches([])
      }
    })
  }

  function reactivate(id: string) {
    const formData = new FormData()
    formData.set("customerId", id)
    formData.set("action", "reactivate")
    startTransition(async () => {
      const result = await changeCustomerStatusAction(formData)
      setMessage(result.ok ? "Customer reactivated." : "The Customer could not be reactivated. Review its data and try again.")
      if (result.ok) router.push(`/customers/${id}`)
    })
  }

  return (
    <form onSubmit={submit} className="gap-4 grid">
      <Field data-invalid={errors.company ? true : undefined}>
        <FieldLabel htmlFor="customer-company">Company name *</FieldLabel>
        <Input
          id="customer-company"
          disabled={!canWrite}
          aria-invalid={errors.company ? true : undefined}
          {...companyField}
          onBlur={(event) => {
            void companyField.onBlur(event)
            lookupDeactivatedMatches()
          }}
        />
        <FieldError errors={[errors.company]} />
      </Field>
      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor="customer-contact">Primary contact *</FieldLabel>
        <Input id="customer-contact" disabled={!canWrite} aria-invalid={errors.name ? true : undefined} {...nameField} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="customer-email">Contact email *</FieldLabel>
        <Input
          id="customer-email"
          type="email"
          disabled={!canWrite}
          aria-invalid={errors.email ? true : undefined}
          {...emailField}
          onBlur={(event) => {
            void emailField.onBlur(event)
            lookupDeactivatedMatches()
          }}
        />
        <FieldError errors={[errors.email]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
        <Input id="customer-phone" disabled={!canWrite} {...phoneField} />
      </Field>
      <Field>
        <FieldLabel htmlFor="customer-notes">Operational notes</FieldLabel>
        <Textarea id="customer-notes" disabled={!canWrite} {...notesField} />
      </Field>
      <Button type="submit" disabled={!canWrite || isPending}>{isPending ? "Saving…" : "Save Customer"}</Button>
      {message ? <p role="status">{message}</p> : null}
      {matches.map((match) => (
        <div key={match.id} className="flex items-center justify-between gap-3 border rounded-md p-3">
          <p>{match.company ?? "Company missing"} · {match.name} · {match.email ?? "Email missing"}</p>
          {canManage ? <Button type="button" disabled={isPending} onClick={() => reactivate(match.id)}>Reactivate</Button> : <p className="text-muted-foreground text-sm">Ask a Customer manager to reactivate this record.</p>}
        </div>
      ))}
    </form>
  )
}
