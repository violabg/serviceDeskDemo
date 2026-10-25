"use client"

import { changeCustomerStatusAction } from "@/app/(dashboard)/customers/actions"
import { CustomerForm } from "@/app/(dashboard)/customers/customer-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export type CustomerDetailsView = {
  id: string
  company: string | null
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  status: "Active" | "Deactivated"
}

export function CustomerDetails({
  customer,
  canWrite,
  canManage,
}: {
  customer: CustomerDetailsView
  canWrite: boolean
  canManage: boolean
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  function changeStatus() {
    const formData = new FormData()
    formData.set("customerId", customer.id)
    formData.set("action", customer.status === "Active" ? "deactivate" : "reactivate")
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

  return (
    <section className="bg-card p-4 border rounded-lg gap-4 grid">
      {isEditing ? (
        <CustomerForm
          mode="edit"
          canWrite={canWrite}
          canManage={canManage}
          customerId={customer.id}
          initialValues={{
            company: customer.company ?? "",
            name: customer.name,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            notes: customer.notes ?? "",
            status: customer.status,
          }}
          onSaved={() => setIsEditing(false)}
        />
      ) : (
        <div className="gap-2 grid">
          <h2 className="font-heading font-semibold text-lg">{customer.company ?? "Company missing"}</h2>
          <p>{customer.name} · {customer.email ?? "Email missing"} · {customer.status}</p>
          <p>{customer.phone ?? "No phone"}</p>
          <p className="whitespace-pre-wrap">{customer.notes ?? "No operational notes"}</p>
          {canWrite ? <Button type="button" variant="outline" className="justify-self-start" onClick={() => setIsEditing(true)}>Edit</Button> : null}
        </div>
      )}
      {canManage ? (
        <div className="gap-2 grid justify-items-start">
          <Button type="button" variant="outline" disabled={isPending} onClick={changeStatus}>
            {customer.status === "Active" ? "Deactivate Customer" : "Reactivate Customer"}
          </Button>
          {message ? <p role="status">{message}</p> : null}
        </div>
      ) : null}
    </section>
  )
}
