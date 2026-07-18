export const TICKET_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const

export const TICKET_STATUSES = [
  "Open",
  "InProgress",
  "Pending",
  "Resolved",
  "Closed",
] as const

export const TICKET_CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Account",
  "Other",
] as const

export const INTAKE_CHANNELS = [
  "Email",
  "Phone",
  "Portal",
  "Chat",
  "WalkIn",
] as const

export type TicketPriority = (typeof TICKET_PRIORITIES)[number]
export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type IntakeChannel = (typeof INTAKE_CHANNELS)[number]
