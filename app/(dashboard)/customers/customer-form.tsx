"use client"

import {
  changeCustomerStatusAction,
  createCustomerAction,
  updateCustomerAction,
} from "@/app/(dashboard)/customers/actions"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

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
}

export function CustomerForm({ mode, canWrite, canManage, customerId, initialValues }: CustomerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [matches, setMatches] = useState<Array<{ id: string; company: string | null; name: string; email: string | null }>>([])
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({
    defaultValues: {
      company: initialValues?.company ?? "",
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      notes: initialValues?.notes ?? "",
      status: initialValues?.status ?? "Active",
    },
  })

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
      setMatches([])
      setMessage("Customer saved.")
      router.refresh()
    })
  })

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

  function changeCurrentStatus() {
    if (!customerId) return
    const formData = new FormData()
    formData.set("customerId", customerId)
    formData.set("action", initialValues?.status === "Active" ? "deactivate" : "reactivate")
    startTransition(async () => {
      const result = await changeCustomerStatusAction(formData)
      if (!result.ok) {
        setMessage(result.reason === "critical-ticket" ? "Resolve or close all Critical Tickets before deactivating this Customer." : "The Customer status could not be changed.")
        return
      }
      setMessage("Customer status updated.")
      router.refresh()
    })
  }

  if (!canWrite) return null

  return (
    <form onSubmit={submit} className="gap-4 grid">
      <Field data-invalid={errors.company ? true : undefined}>
        <FieldLabel htmlFor="customer-company">Company name *</FieldLabel>
        <Input id="customer-company" aria-invalid={errors.company ? true : undefined} {...register("company", { required: "Company name is required" })} />
        <FieldError errors={[errors.company]} />
      </Field>
      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor="customer-contact">Primary contact *</FieldLabel>
        <Input id="customer-contact" aria-invalid={errors.name ? true : undefined} {...register("name", { required: "Primary contact is required" })} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="customer-email">Contact email *</FieldLabel>
        <Input id="customer-email" type="email" aria-invalid={errors.email ? true : undefined} {...register("email", { required: "Contact email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } })} />
        <FieldError errors={[errors.email]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
        <Input id="customer-phone" {...register("phone")} />
      </Field>
      <Field>
        <FieldLabel htmlFor="customer-notes">Operational notes</FieldLabel>
        <Textarea id="customer-notes" {...register("notes")} />
      </Field>
      {mode === "create" ? (
        <Field>
          <FieldLabel htmlFor="customer-status">Status *</FieldLabel>
          <Controller name="status" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="customer-status"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Deactivated">Deactivated</SelectItem></SelectContent>
            </Select>
          )} />
        </Field>
      ) : null}
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Customer"}</Button>
      {mode === "edit" && canManage ? <Button type="button" variant="outline" disabled={isPending} onClick={changeCurrentStatus}>{initialValues?.status === "Active" ? "Deactivate Customer" : "Reactivate Customer"}</Button> : null}
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
