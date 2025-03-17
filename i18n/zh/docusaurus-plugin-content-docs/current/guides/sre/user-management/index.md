---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 用户与角色
title: 访问控制与账户管理
keywords: ['ClickHouse Cloud', '访问控制', '用户管理', 'RBAC', '安全性']
---


# 在 ClickHouse 中创建用户和角色

ClickHouse 支持基于 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 方法的访问控制管理。

ClickHouse 访问实体：
- [用户账户](#user-account-management)
- [角色](#role-management)
- [行策略](#row-policy-management)
- [设置配置文件](#settings-profiles-management)
- [配额](#quotas-management)

您可以使用以下方式配置访问实体：

- 基于 SQL 的工作流程。

    您需要 [启用](#enabling-access-control) 此功能。

- 服务器 [配置文件](/operations/configuration-files.md) `users.xml` 和 `config.xml`。

我们推荐使用基于 SQL 的工作流程。这两种配置方法可以同时工作，因此如果您使用服务器配置文件来管理账户和访问权限，可以顺利切换到基于 SQL 的工作流程。

:::note
您无法同时通过这两种配置方法管理同一访问实体。
:::

:::note
如果您希望管理 ClickHouse Cloud 控制台用户，请参考此 [页面](/cloud/security/cloud-access-management)。
:::

要查看所有用户、角色、配置文件等及其所有授权，请使用 [`SHOW ACCESS`](/sql-reference/statements/show#show-access) 语句。

## 概述 {#access-control-usage}

默认情况下，ClickHouse 服务器提供名为 `default` 的用户账户，该账户不允许使用基于 SQL 的访问控制和账户管理，但拥有所有权限和授权。当未定义用户名时，例如，从客户端登录或在分布式查询中，使用 `default` 用户账户。在处理分布式查询时，如果服务器或集群的配置未指定 [用户和密码](/engines/table-engines/special/distributed.md) 属性，则使用 `default` 用户账户。

如果您刚开始使用 ClickHouse，请考虑以下场景：

1.  [启用](#enabling-access-control) SQL 驱动的访问控制和账户管理，针对 `default` 用户。
2.  登录到 `default` 用户账户并创建所需的所有用户。不要忘记创建管理员账户 (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`)。
3.  [限制权限](/operations/settings/permissions-for-queries) 为 `default` 用户并禁用其 SQL 驱动的访问控制和账户管理。

### 当前解决方案的属性 {#access-control-properties}

- 您可以授予数据库和表的权限，即使它们不存在。
- 如果表被删除，与该表对应的所有特权不会被撤销。这意味着，即使您稍后创建一个同名的新表，所有的特权仍然有效。要撤销与已删除表对应的特权，您需要执行，例如，`REVOKE ALL PRIVILEGES ON db.table FROM ALL` 查询。
- 特权没有生命周期设置。

### 用户账户 {#user-account-management}

用户账户是一个访问实体，允许在 ClickHouse 中对某人进行授权。用户账户包含：

- 身份信息。
- 定义用户可以执行的查询范围的 [特权](/sql-reference/statements/grant.md#privileges)。
- 允许连接到 ClickHouse 服务器的主机。
- 指派的角色和默认角色。
- 用户登录时默认应用的设置及其约束。
- 指派的设置配置文件。

特权可以通过 [GRANT](/sql-reference/statements/grant.md) 查询授予用户账户，或通过分配 [角色](#role-management)。要撤销用户的特权，ClickHouse 提供了 [REVOKE](/sql-reference/statements/revoke.md) 查询。要列出用户的特权，请使用 [SHOW GRANTS](/sql-reference/statements/show#show-grants) 语句。

管理查询：

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 设置应用 {#access-control-settings-applying}

可以以不同方式配置设置：针对用户账户、其授予的角色或设置配置文件。在用户登录时，如果为不同的访问实体配置了某个设置，则按以下优先级应用该设置的值和约束（从高到低）：

1.  用户账户设置。
2.  用户账户的默认角色的设置。如果某些角色中配置了设置，则设置应用的顺序未定义。
3.  分配给用户或其默认角色的设置配置文件中的设置。如果某些配置文件中配置了设置，则设置应用的顺序未定义。
4.  默认情况下或从 [默认配置文件](/operations/server-configuration-parameters/settings#default_profile) 应用于整个服务器的设置。

### 角色 {#role-management}

角色是一个容器，可以授予用户账户的访问实体。

角色包含：

- [特权](/sql-reference/statements/grant#privileges)
- 设置和约束
- 指派的角色列表

管理查询：

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询授予角色特权。要从角色中撤销特权，ClickHouse 提供了 [REVOKE](/sql-reference/statements/revoke.md) 查询。

#### 行策略 {#row-policy-management}

行策略是一个过滤器，用于定义某一用户或角色可用的行。行策略包含一个特定表的过滤器，以及应使用此行策略的角色和/或用户列表。

:::note
行策略只对具有只读访问权限的用户有意义。如果用户可以修改表或在表之间复制分区，则会破坏行策略的限制。
:::

管理查询：

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 设置配置文件 {#settings-profiles-management}

设置配置文件是一组 [设置](/operations/settings/index.md)。设置配置文件包含设置和约束，以及适用此配置文件的角色和/或用户列表。

管理查询：

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### 配额 {#quotas-management}

配额限制资源使用。请参见 [配额](/operations/quotas.md)。

配额包含一组特定时间段的限制，以及应使用此配额的角色和/或用户列表。

管理查询：

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### 启用 SQL 驱动的访问控制和账户管理 {#enabling-access-control}

- 设置配置存储目录。

    ClickHouse 将访问实体的配置存储在 `access_control_path` 服务器配置参数所设置的文件夹中。

- 针对至少一个用户账户启用 SQL 驱动的访问控制和账户管理。

    默认情况下，所有用户的 SQL 驱动的访问控制和账户管理都是禁用的。您需要在 `users.xml` 配置文件中配置至少一个用户，并将 [`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、 `named_collection_control`、 `show_named_collections` 和 `show_named_collections_secrets` 设置的值设置为 1。

## 定义 SQL 用户和角色 {#defining-sql-users-and-roles}

:::tip
如果您在 ClickHouse Cloud 中工作，请参阅 [Cloud 访问管理](/cloud/security/cloud-access-management)。
:::

本文展示了定义 SQL 用户和角色的基础知识以及如何将这些特权和权限应用到数据库、表、行和列。

### 启用 SQL 用户模式 {#enabling-sql-user-mode}

1. 在 `users.xml` 文件中的 `<default>` 用户下启用 SQL 用户模式：
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` 用户是新安装时唯一创建的用户，并且也是默认用于节点间通信的账户。

    在生产环境中，建议在以 SQL 管理用户配置了节点间通信并使用 `<secret>`、集群凭据和/或节点间 HTTP 和传输协议凭据配置之后禁用此用户，因为 `default` 账户用于节点间通信。
    :::

2. 重启节点以应用更改。

3. 启动 ClickHouse 客户端：
    ```sql
    clickhouse-client --user default --password <password>
    ```
### 定义用户 {#defining-users}

1. 创建 SQL 管理员账户：
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. 授予新用户完全的管理权限：
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER 权限 {#alter-permissions}

本文旨在帮助您更好地理解如何定义权限，以及在使用 `ALTER` 语句时权限如何工作。

`ALTER` 语句分为几个类别，其中一些是层次结构的，有些则不是，必须明确地定义。

**示例数据库、表和用户配置**
1. 使用管理员用户创建示例用户：
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. 创建示例数据库：
```sql
CREATE DATABASE my_db;
```

3. 创建示例表：
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 创建示例管理员用户以授予/撤销权限：
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
要授予或撤销权限，管理员用户必须具备 `WITH GRANT OPTION` 特权。
例如：
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
要 `GRANT` 或 `REVOKE` 权限，用户必须首先具备这些权限。
:::

**授予或撤销权限**

`ALTER` 层次结构：

```response
├── ALTER (仅适用于表和视图)/
│   ├── ALTER TABLE/
│   │   ├── ALTER UPDATE
│   │   ├── ALTER DELETE
│   │   ├── ALTER COLUMN/
│   │   │   ├── ALTER ADD COLUMN
│   │   │   ├── ALTER DROP COLUMN
│   │   │   ├── ALTER MODIFY COLUMN
│   │   │   ├── ALTER COMMENT COLUMN
│   │   │   ├── ALTER CLEAR COLUMN
│   │   │   └── ALTER RENAME COLUMN
│   │   ├── ALTER INDEX/
│   │   │   ├── ALTER ORDER BY
│   │   │   ├── ALTER SAMPLE BY
│   │   │   ├── ALTER ADD INDEX
│   │   │   ├── ALTER DROP INDEX
│   │   │   ├── ALTER MATERIALIZE INDEX
│   │   │   └── ALTER CLEAR INDEX
│   │   ├── ALTER CONSTRAINT/
│   │   │   ├── ALTER ADD CONSTRAINT
│   │   │   └── ALTER DROP CONSTRAINT
│   │   ├── ALTER TTL/
│   │   │   └── ALTER MATERIALIZE TTL
│   │   ├── ALTER SETTINGS
│   │   ├── ALTER MOVE PARTITION
│   │   ├── ALTER FETCH PARTITION
│   │   └── ALTER FREEZE PARTITION
│   └── ALTER LIVE VIEW/
│       ├── ALTER LIVE VIEW REFRESH
│       └── ALTER LIVE VIEW MODIFY QUERY
├── ALTER DATABASE
├── ALTER USER
├── ALTER ROLE
├── ALTER QUOTA
├── ALTER [ROW] POLICY
└── ALTER [SETTINGS] PROFILE
```

1. 授予用户或角色 `ALTER` 权限

使用 `GRANT ALTER on *.* TO my_user` 将仅影响顶级 `ALTER TABLE` 和 `ALTER VIEW`，其他 `ALTER` 语句必须单独授予或撤销。

例如，授予基本的 `ALTER` 特权：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

结果集的特权：

```sql
SHOW GRANTS FOR  my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

这将授予上述示例中 `ALTER TABLE` 和 `ALTER VIEW` 下的所有权限，但不会授予其他某些 `ALTER` 权限，如 `ALTER ROW POLICY`（请参见层次结构，您将看到 `ALTER ROW POLICY` 并不是 `ALTER TABLE` 或 `ALTER VIEW` 的子项）。这些必须明确授予或撤销。

如果只需要一部分 `ALTER` 权限，则可以单独授予每个权限，如果该权限有子特权，那么这些子特权也会自动授予。

例如：

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

授予将在下列情况下设置：

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

这还授予了以下子特权：

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. 从用户和角色撤销 `ALTER` 权限

`REVOKE` 语句的工作方式与 `GRANT` 语句类似。

如果某个用户/角色被授予了一个子特权，您可以直接撤销该子特权或撤销它继承的高级权限。

例如，如果用户被授予 `ALTER ADD COLUMN`：

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

可以单独撤销一个特权：

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

或者可以从任何上层撤销（撤销所有的 COLUMN 子特权）：

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: e7d341de-de65-490b-852c-fa8bb8991174

Ok.

0 rows in set. Elapsed: 0.003 sec.
```

**额外说明**

特权必须由不仅具备 `WITH GRANT OPTION` 还具备这些特权的用户授予。

1. 授予管理用户特权，并允许他们管理一组特权
以下是一个示例：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

现在用户可以授予或撤销 `ALTER COLUMN` 和所有子特权。

**测试**

1. 添加 `SELECT` 权限：
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. 为用户添加列权限：
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 使用限制用户登录：
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. 测试添加列：
```sql
ALTER TABLE my_db.my_table ADD COLUMN column2 String;
```

```response
ALTER TABLE my_db.my_table
    ADD COLUMN `column2` String

Query id: d5d6bfa1-b80c-4d9f-8dcd-d13e7bd401a5

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

```sql
DESCRIBE my_db.my_table;
```

```response
DESCRIBE TABLE my_db.my_table

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. 测试删除列：
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47


0 rows in set. Elapsed: 0.004 sec.

从服务器收到异常 (版本 22.5.1):
代码: 497. DB::Exception: 从 chnode1.marsnet.local:9440 收到。DB::Exception: my_user: 权限不足。要执行该查询，必须具备在 my_db.my_table 上授予 ALTER DROP COLUMN(column2) 的权限。 (ACCESS_DENIED)
```

5. 测试通过授予权限的 alter 管理员：
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. 使用 alter 管理员用户登录：
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. 授予子特权：
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. 测试授予一项权限，该 alter 管理员用户没有该权限且该权限不是该管理员用户授予的子权限。
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545


0 rows in set. Elapsed: 0.004 sec.

从服务器收到异常 (版本 22.5.1):
代码: 497. DB::Exception: 从 chnode1.marsnet.local:9440 收到。DB::Exception: my_alter_admin: 权限不足。要执行该查询，必须具备授予 ALTER UPDATE ON my_db.my_table WITH GRANT OPTION 的权限。 (ACCESS_DENIED)
```

**总结**
`ALTER` 权限在表和视图的 `ALTER` 中是层次性的，但在其他 `ALTER` 语句中则不是。可以在细粒度水平或通过权限组授予权限，也可以以类似方式撤销。授予或撤销特权的用户不仅必须具备 `WITH GRANT OPTION` 还必须具备特权自身。如果行为用户没有授予权限的特权，则不能撤销自己的权限。
