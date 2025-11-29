---
sidebar_label: '常见访问管理查询'
title: '常见访问管理查询'
slug: /cloud/security/common-access-management-queries
description: '本文介绍定义 SQL 用户和角色的基础方法，并说明如何将相应的权限和许可应用到数据库、表、行和列。'
keywords: ['ClickHouse Cloud', '访问管理']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';

# 常见访问管理查询 {#common-access-management-queries}

:::tip 自托管
如果你在使用自托管的 ClickHouse，请参阅 [SQL 用户和角色](/guides/sre/user-management/index.md)。
:::

本文介绍了定义 SQL 用户和角色的基础方法，以及如何将相应的权限应用到数据库、表、行和列上。

## 管理员用户 {#admin-user}

在创建 ClickHouse Cloud 服务时，会自动创建一个名为 `default` 的管理员用户。密码会在服务创建时提供，具有 **Admin** 角色的 ClickHouse Cloud 用户可以重置该密码。

当您为 ClickHouse Cloud 服务创建其他 SQL 用户时，这些用户需要 SQL 用户名和密码。如果希望他们拥有管理员级别的权限，则需为新用户分配 `default_role` 角色。例如，添加用户 `clickhouse_admin`：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
授予 default_role 给 clickhouse_admin;
```

:::note
在使用 SQL Console 时，您的 SQL 语句并不会以 `default` 用户身份运行，而是会以名为 `sql-console:${cloud_login_email}` 的用户身份运行，其中 `cloud_login_email` 是当前执行查询用户的电子邮箱地址。

这些自动创建的 SQL Console 用户具有 `default` 角色。
:::

## 免密认证 {#passwordless-authentication}

SQL 控制台提供两种角色：`sql_console_admin`（其权限与 `default_role` 完全相同）以及仅具有只读权限的 `sql_console_read_only`。

管理员用户默认会被分配 `sql_console_admin` 角色，因此他们的权限不会发生变化。不过，`sql_console_read_only` 角色允许为非管理员用户授予对任意实例的只读或完全访问权限，具体需要由管理员进行配置。可以使用 `GRANT` 或 `REVOKE` 命令对这些角色进行调整，以更好地匹配特定实例的需求，对这些角色所做的任何修改都会被持久化。

### 细粒度访问控制 {#granular-access-control}

此访问控制功能也可以手动配置到用户级别的精细粒度。在将新的 `sql_console_*` 角色分配给用户之前，应先创建特定于 SQL 控制台用户、且命名空间匹配 `sql-console-role:<email>` 的数据库角色。例如：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

当检测到匹配的角色时，将把该角色分配给用户，而不是使用预设的通用角色。这使得可以配置更复杂的访问控制，例如创建 `sql_console_sa_role` 和 `sql_console_pm_role` 之类的角色，并将它们授予特定用户。例如：

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <所需的具体访问级别> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <所需的具体访问级别> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role to `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
