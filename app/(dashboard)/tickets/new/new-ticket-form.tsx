"use client"

import {
  checkDuplicateTicketAction,
  createTicketAction,
} from "@/app/(dashboard)/tickets/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  INTAKE_CHANNELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
} from "@/lib/tickets/constants"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

type DuplicateState = {
  success: boolean | null
  error?: string
  duplicate: boolean
}

const initialDuplicateState: DuplicateState = {
  success: null,
  duplicate: false,
}

const NONE_VALUE = "__none__"

type NewTicketFormValues = {
  title: string
  description: string
  requesterContact: string
  customerId: string
  priority: (typeof TICKET_PRIORITIES)[number]
  category: (typeof TICKET_CATEGORIES)[number]
  intakeChannel: (typeof INTAKE_CHANNELS)[number]
  assetId: string
  assignedToId: string
}

export function NewTicketForm({
  customers,
  assets,
  technicians,
}: {
  customers: Array<{
    id: string
    name: string
    email: string | null
    company: string | null
  }>
  assets: Array<{
    id: string
    name: string
    serialNumber: string | null
    category: string | null
  }>
  technicians: Array<{ id: string; name: string | null; email: string }>
}) {
  const router = useRouter()
  const [duplicateState, setDuplicateState] = useState<DuplicateState>(
    initialDuplicateState
  )
  const [isSubmitting, startSubmitTransition] = useTransition()
  const [isCheckingDuplicate, startDuplicateTransition] = useTransition()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<NewTicketFormValues>({
    defaultValues: {
      title: "",
      description: "",
      requesterContact: "",
      customerId: customers[0]?.id ?? "",
      priority: TICKET_PRIORITIES[2],
      category: TICKET_CATEGORIES[4],
      intakeChannel: INTAKE_CHANNELS[2],
      assetId: NONE_VALUE,
      assignedToId: NONE_VALUE,
    },
  })

  const watchedTitle = watch("title")
  const watchedCustomerId = watch("customerId")

  function toFormData(values: NewTicketFormValues) {
    const formData = new FormData()

    formData.set("title", values.title)
    formData.set("description", values.description)
    formData.set("requesterContact", values.requesterContact)
    formData.set("customerId", values.customerId)
    formData.set("priority", values.priority)
    formData.set("category", values.category)
    formData.set("intakeChannel", values.intakeChannel)
    formData.set("assetId", values.assetId === NONE_VALUE ? "" : values.assetId)
    formData.set(
      "assignedToId",
      values.assignedToId === NONE_VALUE ? "" : values.assignedToId
    )

    return formData
  }

  const submitNewTicket = handleSubmit((values) => {
    startSubmitTransition(async () => {
      await createTicketAction(toFormData(values))
      router.refresh()
    })
  })

  const checkDuplicate = handleSubmit((values) => {
    startDuplicateTransition(async () => {
      const formData = new FormData()
      formData.set("customerId", values.customerId)
      formData.set("title", values.title)

      const response = await checkDuplicateTicketAction(formData)

      setDuplicateState({
        success: response.success,
        error: response.error,
        duplicate: response.duplicate,
      })
    })
  })

  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="font-heading text-lg font-semibold tracking-normal">
        Nuovo Ticket
      </h2>
      <form onSubmit={submitNewTicket} className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-sm font-medium">
          <span>
            Title <span className="text-destructive">*</span>
          </span>
          <Input
            {...register("title", { required: "Title is required" })}
            aria-invalid={errors.title ? true : undefined}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>
            Description <span className="text-destructive">*</span>
          </span>
          <Textarea
            {...register("description", {
              required: "Description is required",
            })}
            className="min-h-28"
            aria-invalid={errors.description ? true : undefined}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>
            Requester Contact <span className="text-destructive">*</span>
          </span>
          <Input
            {...register("requesterContact", {
              required: "Requester contact is required",
            })}
            aria-invalid={errors.requesterContact ? true : undefined}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>
            Customer <span className="text-destructive">*</span>
          </span>
          <Controller
            name="customerId"
            control={control}
            rules={{ required: "Customer is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={errors.customerId ? true : undefined}
                >
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.company ? ` (${customer.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1.5 text-sm font-medium">
            <span>
              Priority <span className="text-destructive">*</span>
            </span>
            <Controller
              name="priority"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
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
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>
              Category <span className="text-destructive">*</span>
            </span>
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TICKET_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>
              Intake Channel <span className="text-destructive">*</span>
            </span>
            <Controller
              name="intakeChannel"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select intake channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {INTAKE_CHANNELS.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            Asset (optional)
            <Controller
              name="assetId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No linked asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={NONE_VALUE}>
                        No linked asset
                      </SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                          {asset.serialNumber ? ` (${asset.serialNumber})` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Assign Technician (optional)
            <Controller
              name="assignedToId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={NONE_VALUE}>Unassigned</SelectItem>
                      {technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.id}>
                          {technician.name || technician.email}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={checkDuplicate}
            disabled={
              !watchedTitle || !watchedCustomerId || isCheckingDuplicate
            }
          >
            {isCheckingDuplicate ? "Checking..." : "Check Duplicate"}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </form>
      <div className="mt-4 flex items-center gap-2">
        {duplicateState.error ? (
          <p className="text-sm text-red-600">{duplicateState.error}</p>
        ) : duplicateState.duplicate ? (
          <p className="text-sm text-amber-700">
            Similar ticket found in the last 24h. You can still create this one.
          </p>
        ) : duplicateState.success ? (
          <p className="text-sm text-muted-foreground">
            No duplicate detected for this customer.
          </p>
        ) : null}
        {errors.title ||
        errors.description ||
        errors.requesterContact ||
        errors.customerId ? (
          <p className="text-sm text-red-600">
            Fill required fields before submit.
          </p>
        ) : null}
      </div>
    </section>
  )
}
