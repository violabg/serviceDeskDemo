export function ticketListTag(actorUserId: string) {
  return `tickets:list:${actorUserId}`
}

export function ticketDetailTag(actorUserId: string, ticketId: string) {
  return `tickets:detail:${actorUserId}:${ticketId}`
}
