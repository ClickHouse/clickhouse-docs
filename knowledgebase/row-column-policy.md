---
date: 2023-08-13
---

# Does ClickHouse support row-level and column-level RBAC?

ClickHouse and ClickHouse Cloud both support row and column-level access restrictions for read-only users necessary to achieve a role-based access control (RBAC) model. 

[Row Policies](/docs/en/operations/access-rights#row-policy-management) can be used to specify which rows will be returned to a read-only user when they query a table. ClickHouse Cloud is configured to enable the SQL-driven workflow by default. To leverage this workflow [CREATE](/docs/en/sql-reference/statements/create/user) a user, [GRANT](/docs/en/sql-reference/statements/grant) the user privileges on a table, then set the appropriate [ROW POLICY](/docs/en/operations/access-rights#row-policy-management). When the user performs a `SELECT * FROM table` only rows allowed by policy will be displayed.

Column level restrictions may specified directly when using the [GRANT statement](/docs/en/sql-reference/statements/grant) to enable table level access for users and roles. Users _may only_ include columns for which they have access in a query. `SELECT * FROM table` will return an error stating the user has insufficient permissions.
