---
title: "customers_domain"
tier: "PerContext"
intent: "When changing customer pages, customer status changes, or the link between customers and tickets."
editable: true
---
# Customers

- A customer is Active or Deactivated, and only Active customers are selectable on a ticket.
- `customers:write` creates a customer. `customers:manage` edits it, changes its status, and reactivates a Deactivated one from the create form.
- Creating a customer whose company and email match a Deactivated customer reactivates that record instead of duplicating it.
- Company and email match case-insensitively when checking for duplicates.
- A customer with a Critical ticket in Open, InProgress or Pending cannot be deactivated.
