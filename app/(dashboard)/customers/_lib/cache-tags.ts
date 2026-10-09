export function customerListTag() {
  return "customers:list"
}

export function customerDetailTag(customerId: string) {
  return `customers:detail:${customerId}`
}
