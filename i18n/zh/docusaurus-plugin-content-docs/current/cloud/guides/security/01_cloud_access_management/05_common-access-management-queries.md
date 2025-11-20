---
sidebar_label: '常用访问管理查询'
title: '常用访问管理查询'
slug: /cloud/security/common-access-management-queries
description: '本文介绍了定义 SQL 用户和角色的基本方法，以及如何将相应的权限和许可应用到数据库、表、行和列。'
keywords: ['ClickHouse Cloud', 'access management']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# 常见访问管理查询

:::tip 自托管
如果你在使用自托管 ClickHouse，请参阅 [SQL 用户和角色](/guides/sre/user-management/index.md)。
:::

本文介绍如何定义 SQL 用户和角色，以及如何将相应的权限和许可应用到数据库、表、行和列上。



## 管理员用户 {#admin-user}

ClickHouse Cloud 服务具有一个管理员用户 `default`,该用户在服务创建时自动生成。密码在服务创建时提供,具有 **Admin** 角色的 ClickHouse Cloud 用户可以重置该密码。

当您为 ClickHouse Cloud 服务添加其他 SQL 用户时,需要为他们设置 SQL 用户名和密码。如果希望他们拥有管理员级别的权限,则需为新用户分配 `default_role` 角色。例如,添加用户 `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
使用 SQL Console 时,您的 SQL 语句不会以 `default` 用户身份运行。相反,语句将以名为 `sql-console:${cloud_login_email}` 的用户身份运行,其中 `cloud_login_email` 是当前执行查询的用户的电子邮件地址。

这些自动生成的 SQL Console 用户具有 `default` 角色。
:::


## 无密码身份验证 {#passwordless-authentication}

SQL 控制台提供两个角色:`sql_console_admin` 拥有与 `default_role` 相同的权限,`sql_console_read_only` 拥有只读权限。

管理员用户默认分配 `sql_console_admin` 角色,因此对他们而言没有任何变化。而 `sql_console_read_only` 角色允许管理员为非管理员用户授予对任意实例的只读或完全访问权限。管理员需要配置此访问权限。可以使用 `GRANT` 或 `REVOKE` 命令调整这些角色,以更好地满足特定实例的需求,对这些角色所做的任何修改都将被持久化保存。

### 细粒度访问控制 {#granular-access-control}

此访问控制功能也可以手动配置,以实现用户级别的细粒度控制。在将新的 `sql_console_*` 角色分配给用户之前,应创建与命名空间 `sql-console-role:<email>` 匹配的 SQL 控制台用户专属数据库角色。例如:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

当检测到匹配的角色时,将为用户分配该角色,而不是默认的标准角色。这样可以实现更复杂的访问控制配置,例如创建 `sql_console_sa_role` 和 `sql_console_pm_role` 等角色,并将它们授予特定用户。例如:

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
