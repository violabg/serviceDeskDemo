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
- Creating a customer needs the `customers:write` key; editing an existing customer, changing its status, and reactivating a Deactivated customer from the new-customer form need the `customers:manage` key.
- A holder of `customers:write` alone opens every customer page and can create a customer, with the Edit control and the status control disabled and an edit address redirected back to the plain detail page. Do not treat that write grant as permission to edit.
- A Deactivated customer with the same company and email as a new one is reactivated, not duplicated.
- A customer cannot be deactivated while it has a Critical ticket that is Open, InProgress or Pending.
- Company and email are matched case-insensitively for duplicates.
