---
title: "Users and roles"
slug: "/en/cloud/users-and-roles"
---

import Content from '@site/docs/en/_snippets/_users-and-roles-common.md';

# Users and Roles

:::tip Self-managed
If you are working with self-managed ClickHouse please see [SQL users and roles](/docs/en/guides/sre/user-management/index.md).
:::

This article shows the basics of defining SQL users and roles and applying those privileges and permissions to databases, tables, rows, and columns.

## Admin user

ClickHouse Cloud services have an admin user, `default`, that is created when the service is created.  The password is provided at service creation, and it can be reset by ClickHouse Cloud users that have the **Admin** role.

When you add additional SQL users for your ClickHouse Cloud service, they will need a SQL username and password.  If you want them to have administrative-level privileges, then assign the new user(s) the role `default_role`. For example, adding user `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
When using the SQL Console, your SQL statements will not be run as the `default` user. Instead, statements will be run as a user named `sql-console:${cloud_login_email}`, where `cloud_login_email` is the email of the user currently running the query.

These automatically generated SQL Console users have the `default` role.
:::

## Passwordless authentication

There are two roles available for SQL console: `sql_console_admin` with identical permissions to `default_role` and `sql_console_read_only` with read-only permissions. 

Admin users are assigned the `sql_console_admin` role by default, so nothing changes for them. However, the `sql_console_read_only` role allows non-admin users to be granted read-only or full access to any instance, but an admin needs to configure this access. The roles can be adjusted using the `GRANT` or `REVOKE` commands to better fit instance-specific requirements, and any modifications made to these roles will be persisted.

This access control functionality can also be configured manually for user-level granularity. Before assigning the new `sql_console_*` roles to users, SQL console user-specific database roles matching the namespace `sql-console-role:<email>` should be created. For example: 

```sql
CREATE ROLE OR REPLACE sql_console_role_<email>;
GRANT <some grants> TO sql_console_role_<email>;
```

When a matching role is detected, it will be assigned to the user instead of the boilerplate roles. This introduces more complex access control configurations, such as creating roles like `sql_console_sa_role` and `sql_console_pm_role`, and granting them to specific users.

We plan to build a full database RBAC UI and an API/TF provider on top of this framework. Until then, user-level access control will only be manually configurable.

<Content />
