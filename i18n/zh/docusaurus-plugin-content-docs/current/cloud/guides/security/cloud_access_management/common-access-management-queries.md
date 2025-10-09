---
'sidebar_label': '常见访问管理查询'
'title': '常见访问管理查询'
'slug': '/cloud/security/common-access-management-queries'
'description': '本文展示了定义 SQL 用户和角色的基础知识，以及将这些权限应用于 DATABASE、TABLE、行和列的方式。'
'doc_type': 'guide'
---

import CommonUserRolesContent from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 常见访问管理查询

:::tip 自管理
如果您正在使用自管理的 ClickHouse，请查看 [SQL 用户和角色](/guides/sre/user-management/index.md)。
:::

本文展示了定义 SQL 用户和角色的基础知识，以及如何将这些特权和权限应用于数据库、表、行和列。

## 管理员用户 {#admin-user}

ClickHouse Cloud 服务有一个管理员用户 `default`，在服务创建时生成。密码在服务创建时提供，具有 **Admin** 角色的 ClickHouse Cloud 用户可以重置密码。

当您为 ClickHouse Cloud 服务添加其他 SQL 用户时，他们将需要一个 SQL 用户名和密码。 如果您希望他们具有管理级别的权限，请将新用户分配为角色 `default_role`。例如，添加用户 `clickhouse_admin`：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
在使用 SQL 控制台时，您的 SQL 语句不会作为 `default` 用户运行。相反，语句将作为名为 `sql-console:${cloud_login_email}` 的用户运行，其中 `cloud_login_email` 是当前运行查询的用户的电子邮件。

这些自动生成的 SQL 控制台用户具有 `default` 角色。
:::

## 无密码认证 {#passwordless-authentication}

SQL 控制台有两个可用角色：`sql_console_admin`，其权限与 `default_role` 相同，以及 `sql_console_read_only`，具有只读权限。

管理员用户默认分配了 `sql_console_admin` 角色，因此他们的权限没有变化。然而，`sql_console_read_only` 角色允许非管理员用户被授予只读或完全访问实例的权限。管理员需要配置此访问权限。可以使用 `GRANT` 或 `REVOKE` 命令调整角色，以更好地满足实例特定的需求，对这些角色所做的任何修改将会被持久化。

### 细粒度访问控制 {#granular-access-control}

这种访问控制功能还可以手动配置，以实现用户级别的细粒度控制。在将新的 `sql_console_*` 角色分配给用户之前，应为与命名空间 `sql-console-role:<email>` 匹配的 SQL 控制台用户特定数据库角色创建。例如：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

当检测到匹配的角色时，它将被分配给用户，而不是模板角色。这引入了更复杂的访问控制配置，例如创建角色 `sql_console_sa_role` 和 `sql_console_pm_role`，并将它们授予特定用户。例如：

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <whatever level of access> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <whatever level of access> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role to `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
