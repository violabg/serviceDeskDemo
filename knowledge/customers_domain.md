---
title: "customers_domain"
tier: "PerContext"
intent: "When changing customer pages, customer status changes, or the link between customers and tickets."
editable: true
---
# When to read this

Read this before changing customer pages, the customer form, customer status, or how customers link to tickets. Read the code for signatures and field names; this document keeps only the rules that the code does not state on its own.

## Business Rules

- A customer is either Active or Deactivated. Only Active customers can be chosen on a new ticket.
- Creating or editing a customer needs write permission; changing its status needs manage permission.
- A Deactivated customer with the same company and email as a new one is reactivated, not duplicated.
- A customer cannot be deactivated while it has a Critical ticket that is Open, InProgress or Pending.
- Company and email are matched case-insensitively for duplicates.
