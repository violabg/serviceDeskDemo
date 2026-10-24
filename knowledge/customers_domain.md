---
title: "customers_domain"
tier: "PerContext"
intent: "When changing customer pages, the customer form, customer status changes, or the link between customers and tickets."
editable: true
---
# When to read this

Read this before adding or changing customer pages, the customer profile form, customer status changes, or the link between customers and tickets. It is also the reference for any ticket feature that depends on whether a customer is Active.

## Customer Record and Status

A Customer is a stored organisation contact. Its fields are `name`, `company`, `email`, `phone`, `notes`, `status`, and a list of linked `tickets`. Status has two values only:

```ts
// Prisma enum CustomerStatus
// Active        — default; the customer can be chosen on new tickets
// Deactivated   — cannot be chosen on new tickets

type CustomerProfileInput = {
  name: string
  company: string
  email: string
  phone: string | null
  notes: string | null
}
```

## Permission Gates

Customer access uses its own section, `customers`, with the same read, write and manage operations used by other sections.

```ts
// Pages: read the section, otherwise redirect to the dashboard
const access = await requireCurrentApplicationAccess()
if (!hasPermission(permissions, "customers", "read")) redirect("/dashboard")
const canWrite = hasPermission(permissions, "customers", "write")
const canManage = hasPermission(permissions, "customers", "manage")

// Actions: check the level the operation needs
// create and update  -> customers:write
// status change      -> customers:manage
```

The access check is always performed on the server, and the page's `canWrite` and `canManage` values only control which controls are shown.

## Customer Service Functions

These functions in `lib/customers/service` do the data work. Each validation failure returns a result object instead of throwing.

```ts
getCustomerList()                       // ordered by company, then name; includes a count of tickets
getCustomerById(id)                     // includes linked tickets, newest first
createCustomer(input, status)           // returns ok, or reason: invalid | duplicate | reactivation
updateCustomer(id, input)               // returns ok, or reason: invalid | duplicate
reactivateCustomer(id)                  // returns ok, or reason: invalid | duplicate
deactivateCustomer(id)                  // returns ok, or reason: critical-ticket
```

Input is trimmed. Email is trimmed and lowercased before it is saved, and it must match `local@domain.tld`. Blank `phone` and `notes` are saved as null.

## Duplicate and Reactivation Rules

- Two Active customers cannot share the same company and email, compared case-insensitively. `createCustomer` returns `duplicate` when one exists.
- When `createCustomer` finds a Deactivated customer with the same company and email, it returns `reactivation` together with the matching records. It does not create a new customer.
- When `updateCustomer` changes an Active customer, it checks for another Active customer with the same company and email and returns `duplicate` if one exists. Updating a Deactivated customer skips this check.
- `reactivateCustomer` runs in a Serializable transaction. It returns `invalid` when the stored company or email is missing or malformed, and `duplicate` when another Active customer already has the same company and email.

## Status Change and Linked Tickets

`deactivateCustomer` runs in a Serializable transaction. It first looks for a linked ticket with priority `Critical` and status `Open`, `InProgress` or `Pending`. When one exists, it returns `critical-ticket` and leaves the customer Active. Otherwise it sets the status to `Deactivated`.

```ts
const blocking = await tx.ticket.findFirst({
  where: { customerId: id, priority: "Critical", status: { in: ["Open", "InProgress", "Pending"] } },
})
if (blocking) return { ok: false, reason: "critical-ticket" }
await tx.customer.update({ where: { id }, data: { status: "Deactivated" } })
```

A Deactivated customer does not appear as a choice on the new-ticket form, because ticket reference data lists only Active customers.

Example: a customer named "Acme Ltd" has a Critical ticket in status InProgress. A user with `customers:manage` requests deactivation. The transaction finds the ticket and returns `critical-ticket`, so the customer stays Active. Deactivation succeeds only after that ticket is moved out of the open statuses (Resolved or Closed) or its priority is lowered.

## Server Actions and Cache Invalidation

Customer actions live in `app/(dashboard)/customers/actions.ts`. Each one starts with the same access check, then calls the service, then expires tags only after a successful result.

```ts
export async function createCustomerAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  if (!hasPermission(new Set(access.effectivePermissionKeys), "customers", "write")) return { ok: false, reason: "forbidden" }
  // parse the form, call createCustomer, then expire tags on success
  if (result.ok) {
    updateTag(customerListTag())
    updateTag(ticketListTag())
    updateTag(ticketReferenceTag())
  }
  return result
}
```

- Create expires the customer list, the ticket list and the ticket reference data, because new customers become choices on the ticket form.
- Update and status change also expire the customer detail and the detail of every linked ticket.
- Status change requires `customers:manage`; create and update require `customers:write`.

## Pitfalls to avoid

- Matching customers by company or email without the case-insensitive comparison. The service compares them case-insensitively.
- Creating a new customer for a company and email that match a Deactivated customer. The service returns `reactivation` with the matching records and creates nothing, so the caller must handle the existing record.
- Changing a customer's status without the `manage` check. The write check does not cover status changes.
- Forgetting ticket tags after a customer change. Ticket lists and reference data display customer names and status.
- Treating the page's `canWrite` or `canManage` flags as the access check. The server action check is the gate.
