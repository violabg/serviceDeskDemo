export function ticketListTag() {
  return "tickets:list"
}

export function ticketDetailTag(ticketId: string) {
  return `tickets:detail:${ticketId}`
}

export function ticketReferenceTag() {
  return "tickets:reference"
}
