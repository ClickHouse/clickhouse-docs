---
sidebar_label: '常见访问管理查询'
title: '常见访问管理查询'
slug: /cloud/security/common-access-management-queries
description: '本文介绍定义 SQL 用户和角色的基本方法，并将相应的权限与许可应用到数据库、表、行和列。'
keywords: ['ClickHouse Cloud', 'access management']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 常见访问管理查询 \{#common-access-management-queries\}

:::tip 自管理
如果使用自管理 ClickHouse，请参阅 [SQL 用户和角色](/guides/sre/user-management/index.md)。
:::

本文介绍了定义 SQL 用户和角色的基础知识，以及如何将相应的权限和许可应用于数据库、表、行和列。

## 管理员用户 \{#admin-user\}

ClickHouse Cloud 服务在创建时会自动创建一个名为 `default` 的管理员用户。密码在创建服务时提供，具有 **Admin** 角色的 ClickHouse Cloud 用户可以重置该密码。

当您为 ClickHouse Cloud 服务添加其他 SQL 用户时，这些用户需要一个 SQL 用户名和密码。如果您希望他们拥有管理员级别的权限，请为新用户分配角色 `default_role`。例如，添加用户 `clickhouse_admin`：

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
在使用 SQL Console 时，您的 SQL 语句不会以 `default` 用户身份执行。相反，这些语句会以名为 `sql-console:${cloud_login_email}` 的用户身份执行，其中 `cloud_login_email` 是当前执行查询的用户的电子邮件地址。

这些自动生成的 SQL Console 用户具有 `default` 角色。
:::


## 无密码认证 \{#passwordless-authentication\}

SQL 控制台提供两个可用角色：`sql_console_admin`（其权限与 `default_role` 完全相同）和只读权限的 `sql_console_read_only`。

管理员用户默认会被分配 `sql_console_admin` 角色，因此对他们而言不会有任何变化。而 `sql_console_read_only` 角色则允许为非管理员用户授予对任意实例的只读或完全访问权限。管理员需要对这些访问权限进行配置。可以使用 `GRANT` 或 `REVOKE` 命令调整这些角色，以更好地满足特定实例的需求，对这些角色所做的任何更改都会被持久化保存。

### 细粒度访问控制 \{#granular-access-control\}

此访问控制功能也可以手动配置，以实现用户级别的精细访问控制。在将新的 `sql_console_*` 角色分配给用户之前，应创建与命名空间 `sql-console-role:&lt;email&gt;` 匹配的、针对 SQL 控制台用户的数据库角色。例如：

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

当检测到匹配的角色时，将把该角色分配给用户，而不再使用预设的样板角色。这样可以实现更精细的访问控制配置，例如创建 `sql_console_sa_role` 和 `sql_console_pm_role` 等角色，并将它们授予特定用户。例如：

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
