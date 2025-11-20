---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: '用户和角色'
title: '访问控制与账号管理'
keywords: ['ClickHouse Cloud', '访问控制', '用户管理', 'RBAC', '安全']
description: '介绍 ClickHouse Cloud 中的访问控制与账号管理'
doc_type: 'guide'
---



# 在 ClickHouse 中创建用户和角色

ClickHouse 支持基于 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 模型的访问控制管理。

ClickHouse 中的访问实体包括：
- [用户账号](#user-account-management)
- [角色](#role-management)
- [行级策略](#row-policy-management)
- [设置配置文件](#settings-profiles-management)
- [配额](#quotas-management)

你可以通过以下方式配置访问实体：

- 基于 SQL 的工作流。

    你需要先[启用](#enabling-access-control)此功能。

- 服务器[配置文件](/operations/configuration-files.md) `users.xml` 和 `config.xml`。

我们推荐使用基于 SQL 的工作流。这两种配置方法可以同时使用，因此如果你当前通过服务器配置文件管理账号和访问权限，可以平滑切换到基于 SQL 的工作流。

:::note
不能同时通过这两种配置方法管理同一个访问实体。
:::

:::note
如果你希望管理 ClickHouse Cloud 控制台用户，请参阅此[页面](/cloud/security/manage-cloud-users)
:::

要查看所有用户、角色、配置文件等及其所有授权，请使用 [`SHOW ACCESS`](/sql-reference/statements/show#show-access) 语句。



## 概述 {#access-control-usage}

默认情况下,ClickHouse 服务器提供 `default` 用户账户,该账户不允许使用基于 SQL 的访问控制和账户管理,但拥有所有权限。当未定义用户名时(例如从客户端登录或在分布式查询中),将使用 `default` 用户账户。在分布式查询处理中,如果服务器或集群的配置未指定[用户和密码](/engines/table-engines/special/distributed.md)属性,则会使用默认用户账户。

如果您刚开始使用 ClickHouse,请考虑以下方案:

1.  为 `default` 用户[启用](#enabling-access-control)基于 SQL 的访问控制和账户管理。
2.  登录到 `default` 用户账户并创建所有必需的用户。不要忘记创建管理员账户(`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`)。
3.  为 `default` 用户[限制权限](/operations/settings/permissions-for-queries)并禁用其基于 SQL 的访问控制和账户管理。

### 当前方案的特性 {#access-control-properties}

- 即使数据库和表不存在,您也可以为它们授予权限。
- 如果删除了表,与该表对应的所有权限不会被撤销。这意味着即使您稍后创建同名的新表,所有权限仍然有效。要撤销与已删除表对应的权限,您需要执行例如 `REVOKE ALL PRIVILEGES ON db.table FROM ALL` 查询。
- 权限没有生命周期设置。

### 用户账户 {#user-account-management}

用户账户是允许在 ClickHouse 中对某人进行授权的访问实体。用户账户包含:

- 身份识别信息。
- 定义用户可以执行的查询范围的[权限](/sql-reference/statements/grant.md#privileges)。
- 允许连接到 ClickHouse 服务器的主机。
- 已分配的角色和默认角色。
- 用户登录时默认应用的设置及其约束。
- 已分配的设置配置文件。

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询或分配[角色](#role-management)向用户账户授予权限。要从用户撤销权限,ClickHouse 提供了 [REVOKE](/sql-reference/statements/revoke.md) 查询。要列出用户的权限,请使用 [SHOW GRANTS](/sql-reference/statements/show#show-grants) 语句。

管理查询:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 设置应用 {#access-control-settings-applying}

设置可以在不同位置配置:用户账户、其授予的角色以及设置配置文件中。用户登录时,如果为不同的访问实体配置了某个设置,则该设置的值和约束按以下方式应用(从高到低优先级):

1.  用户账户设置。
2.  用户账户默认角色的设置。如果在某些角色中配置了设置,则设置应用的顺序是未定义的。
3.  分配给用户或其默认角色的设置配置文件中的设置。如果在某些配置文件中配置了设置,则设置应用的顺序是未定义的。
4.  默认应用于整个服务器的设置或来自[默认配置文件](/operations/server-configuration-parameters/settings#default_profile)的设置。

### 角色 {#role-management}

角色是可以授予用户账户的访问实体的容器。

角色包含:

- [权限](/sql-reference/statements/grant#privileges)
- 设置和约束
- 已分配角色的列表

管理查询:

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询向角色授予权限。要从角色撤销权限,ClickHouse 提供了 [REVOKE](/sql-reference/statements/revoke.md) 查询。

#### 行策略 {#row-policy-management}


行策略是一个过滤器,用于定义用户或角色可以访问哪些行。行策略包含针对特定表的过滤器,以及应使用此行策略的角色和/或用户列表。

:::note
行策略仅对具有只读访问权限的用户有意义。如果用户可以修改表或在表之间复制分区,则会使行策略的限制失效。
:::

管理查询:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 设置配置 {#settings-profiles-management}

设置配置是[设置](/operations/settings/index.md)的集合。设置配置包含设置和约束,以及应用此配置的角色和/或用户列表。

管理查询:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### 配额 {#quotas-management}

配额用于限制资源使用。请参阅[配额](/operations/quotas.md)。

配额包含一组针对特定时间段的限制,以及应使用此配额的角色和/或用户列表。

管理查询:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### 启用 SQL 驱动的访问控制和账户管理 {#enabling-access-control}

- 设置配置存储目录。

  ClickHouse 将访问实体配置存储在 [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) 服务器配置参数所设置的文件夹中。

- 为至少一个用户账户启用 SQL 驱动的访问控制和账户管理。

  默认情况下,所有用户的 SQL 驱动访问控制和账户管理都是禁用的。您需要在 `users.xml` 配置文件中配置至少一个用户,并将 [`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections` 和 `show_named_collections_secrets` 设置的值设为 1。


## 定义 SQL 用户和角色 {#defining-sql-users-and-roles}

:::tip
如果您使用 ClickHouse Cloud,请参阅 [Cloud 访问管理](/cloud/security/console-roles)。
:::

本文介绍定义 SQL 用户和角色的基础知识,以及如何将这些权限和许可应用于数据库、表、行和列。

### 启用 SQL 用户模式 {#enabling-sql-user-mode}

1.  在 `users.xml` 文件的 `<default>` 用户下启用 SQL 用户模式:

    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` 用户是全新安装时创建的唯一用户,默认情况下也是用于节点间通信的账户。

    在生产环境中,建议在使用 SQL 管理员用户配置好节点间通信,并通过 `<secret>`、集群凭据和/或节点间 HTTP 及传输协议凭据设置好节点间通信后,禁用此用户,因为 `default` 账户用于节点间通信。
    :::

2.  重启节点以应用更改。

3.  启动 ClickHouse 客户端:
    ```sql
    clickhouse-client --user default --password <password>
    ```

### 定义用户 {#defining-users}

1. 创建 SQL 管理员账户:
   ```sql
   CREATE USER clickhouse_admin IDENTIFIED BY 'password';
   ```
2. 授予新用户完整的管理权限
   ```sql
   GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
   ```


## ALTER 权限 {#alter-permissions}

本文旨在帮助您更好地理解如何定义权限,以及特权用户使用 `ALTER` 语句时权限的工作方式。

`ALTER` 语句分为多个类别,其中一些具有层次结构,而另一些则没有,必须显式定义。

**示例数据库、表和用户配置**

1. 使用管理员用户创建示例用户

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. 创建示例数据库

```sql
CREATE DATABASE my_db;
```

3. 创建示例表

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 创建示例管理员用户以授予/撤销权限

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
要授予或撤销权限,管理员用户必须具有 `WITH GRANT OPTION` 权限。
例如:

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

要执行 `GRANT` 或 `REVOKE` 操作,用户必须首先自己拥有这些权限。
:::

**授予或撤销权限**

`ALTER` 层次结构:

```response
├── ALTER (only for table and view)/
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

1. 向用户或角色授予 `ALTER` 权限

使用 `GRANT ALTER on *.* TO my_user` 只会影响顶层的 `ALTER TABLE` 和 `ALTER VIEW`,其他 `ALTER` 语句必须单独授予或撤销。

例如,授予基本 `ALTER` 权限:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

结果权限集:

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

这将授予上述示例中 `ALTER TABLE` 和 `ALTER VIEW` 下的所有权限,但不会授予某些其他 `ALTER` 权限,例如 `ALTER ROW POLICY`(参考层次结构,您会看到 `ALTER ROW POLICY` 不是 `ALTER TABLE` 或 `ALTER VIEW` 的子权限)。这些权限必须显式授予或撤销。

如果只需要 `ALTER` 权限的子集,则可以单独授予每个权限,如果该权限包含子权限,那么这些子权限也会自动授予。

例如:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

授予的权限将设置为:

```sql
SHOW GRANTS FOR my_user;
```


```response
SHOW GRANTS FOR my_user

查询 ID: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

返回 1 行。耗时:0.004 秒。
```

这同样会授予以下子权限：

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. 从用户和角色收回 `ALTER` 权限

`REVOKE` 语句的工作方式与 `GRANT` 语句类似。

如果某个用户/角色被授予了某个子权限，你可以直接收回该子权限，或者收回其继承来源的上级权限。

例如，如果该用户被授予了 `ALTER ADD COLUMN`

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

查询 ID: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

可以单独撤销某项权限：

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

或者可以在任意上级层级撤销（撤销该 `COLUMN` 的所有子权限）：

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

**补充说明**

授予这些权限的用户不仅必须具有 `WITH GRANT OPTION`，还必须自身拥有这些权限。

1. 要为某个管理员用户授予某项权限，并允许其管理一组权限
   示例：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

现在用户可以授予或撤销 `ALTER COLUMN` 及其所有细分权限。

**测试**

1. 添加 `SELECT` 权限

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. 为该用户授予 `ADD COLUMN` 权限

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 使用受限用户登录

```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. 测试添加一列

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

查询 ID: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272
```


┌─name────┬─type───┬─default&#95;type─┬─default&#95;expression─┬─comment─┬─codec&#95;expression─┬─ttl&#95;expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

````

4. 测试删除列
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
````

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

服务器返回异常 (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 权限不足。要执行此查询,需要授予 ALTER DROP COLUMN(column2) ON my_db.my_table 权限。(ACCESS_DENIED)
```

5. 通过授予权限测试 alter 管理员

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. 使用 alter 管理员账号登录

```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. 授予子权限

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. 测试向 `alter admin` 用户授予一种其自身并不拥有、且并非其已有权限子权限的特权。

```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

查询 ID: 191690dc-55a6-4625-8fee-abc3d14a5545

返回 0 行。用时: 0.004 秒。

服务器返回异常(版本 22.5.1):
代码: 497. DB::Exception: 来自 chnode1.marsnet.local:9440。DB::Exception: my_alter_admin: 权限不足。执行此查询需要具有 ALTER UPDATE ON my_db.my_table WITH GRANT OPTION 授权。(ACCESS_DENIED)
```

**摘要**
对于针对表和视图的 `ALTER` 操作，ALTER 权限是分层的，但对其他 `ALTER` 语句则不适用这种层级关系。权限既可以按细粒度进行设置，也可以通过权限分组的方式进行设置，并且也可以以类似方式撤销。执行授予或撤销操作的用户在为其他用户（包括其自身）设置权限时，必须拥有 `WITH GRANT OPTION`，并且自身已经拥有相应的权限。如果执行操作的用户本身不具备授予选项权限，则不能撤销自己的权限。
