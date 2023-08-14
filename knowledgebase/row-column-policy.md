---
date: 2023-08-13
---

# Does ClickHouse support row-level and column-level RBAC?

Both row-level and column-level RBAC are supported in ClickHouse and ClickHouse Cloud. To specify row-level permissions, you can use [row policies](/docs/en/operations/access-rights#row-policy-management). Row policies are used to restrict row access for specific read-only users. To specify column-level permissions, you can use the [GRANT statement](/docs/en/sql-reference/statements/grant) to restrict access to individual columns for a particular user or role.
