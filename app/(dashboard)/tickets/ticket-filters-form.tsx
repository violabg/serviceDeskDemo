"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets/constants"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"

const ALL_VALUE = "__all__"

type TicketFilterValues = {
  q: string
  status: string
  priority: string
}

export function TicketFiltersForm({
  initialValues,
  canCreate,
}: {
  initialValues: {
    q?: string
    status?: string
    priority?: string
  }
  canCreate: boolean
}) {
  const router = useRouter()
  const { register, handleSubmit, control } = useForm<TicketFilterValues>({
    defaultValues: {
      q: initialValues.q ?? "",
      status: initialValues.status ?? ALL_VALUE,
      priority: initialValues.priority ?? ALL_VALUE,
    },
  })

  const onSubmit = handleSubmit((values) => {
    const query = new URLSearchParams()

    if (values.q.trim()) {
      query.set("q", values.q.trim())
    }

    if (values.status !== ALL_VALUE) {
      query.set("status", values.status)
    }

    if (values.priority !== ALL_VALUE) {
      query.set("priority", values.priority)
    }

    const queryString = query.toString()
    router.push(queryString ? `/tickets?${queryString}` : "/tickets")
  })

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-[1fr_12rem_12rem_auto]"
    >
      <FieldGroup className="md:contents">
        <Field>
          <FieldLabel htmlFor="tickets-filter-query">Search</FieldLabel>
          <Input
            id="tickets-filter-query"
            {...register("q")}
            placeholder="Search title or description"
          />
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_VALUE}>All status</SelectItem>
                    {TICKET_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <FieldLabel>Priority</FieldLabel>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_VALUE}>All priority</SelectItem>
                    {TICKET_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </FieldGroup>
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" variant="outline">
          Filter
        </Button>
        {canCreate ? (
          <Button render={<Link href="/tickets/new" />} nativeButton={false}>
            Nuovo Ticket
          </Button>
        ) : null}
      </div>
    </form>
  )
}
