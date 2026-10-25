---
title: "customers_domain"
tier: "PerContext"
intent: "When changing customer pages, the customer form, customer status changes, or the link between customers and tickets."
editable: true
---
# When to read this

Read this before changing customer pages, the customer form, customer status, or how customers link to tickets. Read the code for signatures and field names; this document keeps only the rules that the code does not state on its own.

## Business Rules

- A customer is either Active or Deactivated. Only Active customers can be chosen on a new ticket.
- The customer form is one shared component for create and edit. Status is never changed from the form; it has its own control, gated by the manage permission.
- Customers have their own permission section. Creating or editing needs write; changing status needs manage.
- A Deactivated customer with the same company and email as a new one is reactivated, not duplicated.
- A customer cannot be deactivated while it has a Critical ticket that is Open, InProgress or Pending.
- Company and email are matched case-insensitively for duplicates.
- Any change to a customer also refreshes the ticket data that shows it.
