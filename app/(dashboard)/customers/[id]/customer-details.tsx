"use client"

import { changeCustomerStatusAction } from "@/app/(dashboard)/customers/actions"
import { CustomerForm } from "@/app/(dashboard)/customers/_components/customer-form"
import { customerPathForState, isCustomerEditState } from "@/app/(dashboard)/customers/_lib/edit-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const isEditing = isCustomerEditState(searchParams)
  const basePath = `/customers/${customer.id}`
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
          cancelHref={customerPathForState(basePath, false)}
        />
      ) : (
        <div className="gap-4 grid">
          <dl className="gap-3 grid">
            <div className="gap-1 grid">
              <dt className="text-muted-foreground text-sm">Company</dt>
              <dd><h2 className="font-heading font-semibold text-lg">{customer.company ?? "Company missing"}</h2></dd>
            </div>
            <div className="gap-1 grid">
              <dt className="text-muted-foreground text-sm">Name</dt>
              <dd>{customer.name}</dd>
            </div>
            <div className="gap-1 grid">
              <dt className="text-muted-foreground text-sm">Email</dt>
              <dd>{customer.email ?? "Email missing"}</dd>
            </div>
            <div className="gap-1 grid">
              <dt className="text-muted-foreground text-sm">Status</dt>
              <dd>{customer.status}</dd>
            </div>
            <div className="gap-1 grid">
              <dt className="text-muted-foreground text-sm">Phone</dt>
              <dd>{customer.phone ?? "No phone"}</dd>
            </div>
            <div className="gap-1 grid">
              <dt className="text-muted-foreground text-sm">Notes</dt>
              <dd className="whitespace-pre-wrap">{customer.notes ?? "No operational notes"}</dd>
            </div>
          </dl>
          {canWrite ? (
            <Button variant="outline" className="justify-self-start" render={<Link href={customerPathForState(basePath, true)} />} nativeButton={false}>Edit</Button>
          ) : null}
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
