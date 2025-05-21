---
'sidebar_label': '常见访问管理查询'
'title': '常见访问管理查询'
'slug': '/cloud/security/common-access-management-queries'
'description': '本文介绍了定义 SQL 用户和角色的基础知识，并将这些权限和权限应用于数据库、表、行和列。'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# 常见访问管理查询

:::tip 自管理
如果您正在使用自管理的 ClickHouse，请参阅 [SQL 用户和角色](/guides/sre/user-management/index.md)。
:::

本文展示了定义 SQL 用户和角色及将这些权限应用于数据库、表、行和列的基本知识。

## 管理员用户 {#admin-user}

ClickHouse Cloud 服务有一个管理员用户 `default`，在服务创建时创建。密码在服务创建时提供，并且可以由具有 **Admin** 角色的 ClickHouse Cloud 用户重置。

当您为 ClickHouse Cloud 服务添加额外的 SQL 用户时，他们需要一个 SQL 用户名和密码。如果您希望他们具有管理级别的权限，则将新的用户分配角色 `default_role`。例如，添加用户 `clickhouse_admin`：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
使用 SQL 控制台时，您的 SQL 语句将不会以 `default` 用户身份运行。相反，语句将以名为 `sql-console:${cloud_login_email}` 的用户身份运行，其中 `cloud_login_email` 是当前运行查询的用户的电子邮件。

这些自动生成的 SQL 控制台用户具有 `default` 角色。
:::

## 无密码身份验证 {#passwordless-authentication}

SQL 控制台有两个可用角色：`sql_console_admin`，其权限与 `default_role` 相同，以及 `sql_console_read_only`，其为只读权限。

管理员用户默认被分配 `sql_console_admin` 角色，因此对他们没有变化。然而，`sql_console_read_only` 角色允许非管理员用户被授予对任何实例的只读或完全访问权限。管理员需要配置此访问权限。角色可以使用 `GRANT` 或 `REVOKE` 命令进行调整以更好地满足特定实例的要求，并且对这些角色所做的任何修改将被保留。

### 精细访问控制 {#granular-access-control}

此访问控制功能也可以为用户级别的精细控制手动配置。在将新的 `sql_console_*` 角色分配给用户之前，应该创建与命名空间 `sql-console-role:<email>` 匹配的 SQL 控制台用户特定数据库角色。例如：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

当检测到匹配的角色时，它将分配给用户，而不是默认角色。这引入了更复杂的访问控制配置，比如创建 `sql_console_sa_role` 和 `sql_console_pm_role` 这样的角色，并将其授权给特定用户。例如：

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
