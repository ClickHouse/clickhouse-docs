---
sidebar_label: Users and Roles
slug: /en/cloud/users-and-roles
hide_table_of_contents: true
---

import Content from '@site/docs/en/_snippets/_users-and-roles-common.md';

# Users and Roles

:::tip
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

<Content />
