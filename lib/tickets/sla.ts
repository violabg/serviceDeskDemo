export const TICKET_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const

export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

const HOUR_IN_MS = 60 * 60 * 1000

export const SLA_HOURS: Record<TicketPriority, number> = {
  Critical: 4,
  High: 8,
  Medium: 24,
  Low: 72,
}

export function computeSlaBreachAt(priority: TicketPriority, createdAt: Date) {
  return new Date(createdAt.getTime() + SLA_HOURS[priority] * HOUR_IN_MS)
}

export function isSlaBreached(slaBreachedAt: Date | null) {
  if (!slaBreachedAt) {
    return false
  }

  return slaBreachedAt.getTime() < Date.now()
}
