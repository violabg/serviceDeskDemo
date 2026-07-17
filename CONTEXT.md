# Service Desk

This context describes the core language for the service desk application and its access model.

## Language

**Account**:
An external authentication identity from Neon Auth, currently backed by GitHub login.
_Avoid_: User, Customer

**User**:
A local application person who can be assigned roles and permissions after signing in.
_Avoid_: Account, Customer

**Customer**:
A person or organization that receives service desk support.
_Avoid_: User, Account

**Role**:
A named collection of permissions assignable to one or more users.
_Avoid_: Group

**Permission**:
An allow-only access grant for one section and one operation, such as `users:read`.
_Avoid_: Privilege, Right
