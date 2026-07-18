"use client"

import {
  addTicketNoteAction,
  assignTechnicianAction,
  updateTicketPriorityAction,
  updateTicketStatusAction,
} from "@/app/(dashboard)/tickets/actions"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets/constants"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

const NONE_VALUE = "__none__"

type StatusValues = {
  status: (typeof TICKET_STATUSES)[number]
}

type PriorityValues = {
  priority: (typeof TICKET_PRIORITIES)[number]
}

type TechnicianValues = {
  technicianId: string
}

type NoteValues = {
  content: string
}

export function TicketDetailForms({
  ticketId,
  status,
  priority,
  assignedToId,
  canWrite,
  canManage,
  technicians,
}: {
  ticketId: string
  status: (typeof TICKET_STATUSES)[number]
  priority: (typeof TICKET_PRIORITIES)[number]
  assignedToId: string | null
  canWrite: boolean
  canManage: boolean
  technicians: Array<{ id: string; name: string | null; email: string }>
}) {
  const router = useRouter()
  const [isSubmitting, startTransition] = useTransition()
  const statusForm = useForm<StatusValues>({
    defaultValues: { status },
  })
  const priorityForm = useForm<PriorityValues>({
    defaultValues: { priority },
  })
  const technicianForm = useForm<TechnicianValues>({
    defaultValues: { technicianId: assignedToId ?? NONE_VALUE },
  })
  const noteForm = useForm<NoteValues>({
    defaultValues: { content: "" },
  })

  const submitStatus = statusForm.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("ticketId", ticketId)
      formData.set("status", values.status)
      await updateTicketStatusAction(formData)
      router.refresh()
    })
  })

  const submitPriority = priorityForm.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("ticketId", ticketId)
      formData.set("priority", values.priority)
      await updateTicketPriorityAction(formData)
      router.refresh()
    })
  })

  const submitTechnician = technicianForm.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("ticketId", ticketId)
      formData.set(
        "technicianId",
        values.technicianId === NONE_VALUE ? "" : values.technicianId
      )
      await assignTechnicianAction(formData)
      router.refresh()
    })
  })

  const submitNote = noteForm.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("ticketId", ticketId)
      formData.set("content", values.content)
      await addTicketNoteAction(formData)
      noteForm.reset({ content: "" })
      router.refresh()
    })
  })

  return (
    <>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <form onSubmit={submitStatus} className="grid gap-2">
          <label className="text-sm font-medium">Status</label>
          <Controller
            name="status"
            control={statusForm.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={!canWrite && !canManage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TICKET_STATUSES.map((statusValue) => (
                      <SelectItem key={statusValue} value={statusValue}>
                        {statusValue}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={(!canWrite && !canManage) || isSubmitting}
          >
            Update Status
          </Button>
        </form>

        <form onSubmit={submitPriority} className="grid gap-2">
          <label className="text-sm font-medium">Priority</label>
          <Controller
            name="priority"
            control={priorityForm.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={!canWrite}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TICKET_PRIORITIES.map((priorityValue) => (
                      <SelectItem key={priorityValue} value={priorityValue}>
                        {priorityValue}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={!canWrite || isSubmitting}
          >
            Update Priority
          </Button>
        </form>

        <form onSubmit={submitTechnician} className="grid gap-2">
          <label className="text-sm font-medium">Technician</label>
          <Controller
            name="technicianId"
            control={technicianForm.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={!canWrite}
              >
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
          <Button
            type="submit"
            variant="outline"
            disabled={!canWrite || isSubmitting}
          >
            Assign
          </Button>
        </form>
      </div>

      <form onSubmit={submitNote} className="mt-4 grid gap-2">
        <Textarea
          {...noteForm.register("content", { required: true })}
          className="min-h-24"
          placeholder="Add an investigation note"
          disabled={!canWrite || isSubmitting}
        />
        <Button type="submit" disabled={!canWrite || isSubmitting}>
          Add Note
        </Button>
      </form>
    </>
  )
}
