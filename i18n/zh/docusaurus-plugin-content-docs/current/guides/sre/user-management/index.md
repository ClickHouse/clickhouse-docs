---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: '用户和角色'
title: '访问控制与账户管理'
keywords: ['ClickHouse Cloud', '访问控制', '用户管理', 'RBAC', '安全']
description: '介绍 ClickHouse Cloud 中的访问控制和账户管理'
doc_type: 'guide'
---

# 在 ClickHouse 中创建用户和角色 {#creating-users-and-roles-in-clickhouse}

ClickHouse 支持基于 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 方法的访问控制管理。

ClickHouse 访问控制实体:
- [用户账户](#user-account-management)
- [角色](#role-management)
- [行策略](#row-policy-management)
- [设置配置文件](#settings-profiles-management)
- [配额](#quotas-management)

您可以通过以下方式配置访问控制实体:

- 基于 SQL 的工作流。

    您需要[启用](#enabling-access-control)该功能。

- 服务器[配置文件](/operations/configuration-files.md) `users.xml` 和 `config.xml`。

我们建议使用基于 SQL 的工作流。这两种配置方法可以同时生效,因此如果您使用服务器配置文件来管理账户和访问权限,可以平稳切换到基于 SQL 的工作流。

:::note
不能同时使用两种配置方法来管理同一个访问控制实体。
:::

:::note
如果您希望管理 ClickHouse Cloud 控制台用户,请参考此[页面](/cloud/security/manage-cloud-users)。
:::

要查看所有用户、角色、配置文件等以及它们被授予的所有权限,请使用 [`SHOW ACCESS`](/sql-reference/statements/show#show-access) 语句。

## 概览 {#access-control-usage}

默认情况下,ClickHouse 服务器提供 `default` 用户账户。该账户不受基于 SQL 的访问控制和账户管理机制约束,但拥有全部权限。在任何未显式指定用户名的情况下都会使用 `default` 用户账户,例如从客户端登录或执行分布式查询时。在分布式查询处理中,如果服务器或集群配置中未指定 [user 和 password](/engines/table-engines/special/distributed.md) 属性,则会使用默认用户账户。

如果你刚开始使用 ClickHouse,可以考虑如下步骤:

1.  为 `default` 用户[启用](#enabling-access-control)基于 SQL 的访问控制和账户管理。
2.  以 `default` 用户账户登录并创建所有需要的用户。不要忘记创建一个管理员账户(`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`)。
3.  为 `default` 用户[收紧权限](/operations/settings/permissions-for-queries),并为其禁用基于 SQL 的访问控制和账户管理。

### 当前方案的特性 {#access-control-properties}

- 即使数据库和表尚不存在,你也可以为它们授予权限。
- 如果一个表被删除,与该表对应的所有权限不会自动被收回。这意味着即使你之后创建了同名的新表,所有这些权限仍然有效。要撤销与已删除表对应的权限,你需要执行例如 `REVOKE ALL PRIVILEGES ON db.table FROM ALL` 这样的查询。
- 权限没有生存期相关的设置。

### 用户账户 {#user-account-management}

用户账户是一种访问实体,用于在 ClickHouse 中对某个主体进行授权。一个用户账户包含:

- 标识信息。
- [权限](/sql-reference/statements/grant.md#privileges),用于定义该用户可以执行的查询范围。
- 被允许连接到 ClickHouse 服务器的主机。
- 分配给该用户的角色及其默认角色。
- 在用户登录时默认应用的设置及其约束。
- 分配给该用户的设置配置文件。

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询,或通过分配[角色](#role-management),向用户账户授予权限。要从用户撤销权限,ClickHouse 提供 [REVOKE](/sql-reference/statements/revoke.md) 查询。要列出某个用户拥有的权限,使用 [SHOW GRANTS](/sql-reference/statements/show#show-grants) 语句。

管理查询:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 设置的生效顺序 {#access-control-settings-applying}

设置可以通过不同方式进行配置:在用户账户中、在授予给该用户的角色中,以及在设置配置文件中。在用户登录时,如果同一项设置在不同的访问实体中都有配置,其值和约束按如下优先级(从高到低)生效:

1.  用户账户自身的设置。
2.  用户账户默认角色中的设置。如果某个设置在多个角色中都有配置,则该设置的应用顺序未定义。
3.  分配给用户或其默认角色的设置配置文件中的设置。如果某个设置在多个配置文件中都有配置,则该设置的应用顺序未定义。
4.  默认应用于整个服务器的设置,或来自 [default profile](/operations/server-configuration-parameters/settings#default_profile) 的设置。

### 角色 {#role-management}

角色是一个访问实体容器,可以授予给用户账户。

一个角色包含:

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

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询向角色授予权限。要从角色撤销权限,ClickHouse 提供 [REVOKE](/sql-reference/statements/revoke.md) 查询。

#### 行级策略 {#row-policy-management}

行策略是一种过滤器,用于定义某个用户或角色可以访问哪些行。行策略包含针对某个特定表的过滤条件,以及应使用此行策略的角色和/或用户列表。

:::note
行策略仅对具有只读访问权限的用户才有意义。如果用户可以修改表或在表之间复制分区,就会绕过行策略的限制。
:::

管理查询:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 设置配置文件 {#settings-profiles-management}

设置配置文件是[设置](/operations/settings/index.md)的集合。设置配置文件包含设置和约束,以及应用此配置文件的角色和/或用户列表。

管理查询:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### 配额 {#quotas-management}

配额用于限制资源使用。参见[配额](/operations/quotas.md)。

配额包含针对若干时间段的一组限制,以及应使用此配额的角色和/或用户列表。

管理查询:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### 启用基于 SQL 的访问控制和账户管理 {#enabling-access-control}

- 为配置存储设置一个目录。

    ClickHouse 将访问实体配置存储在由服务器配置参数 [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) 指定的文件夹中。

- 至少为一个用户账户启用基于 SQL 的访问控制和账户管理。

    默认情况下,基于 SQL 的访问控制和账户管理对所有用户均处于禁用状态。你需要在 `users.xml` 配置文件中至少配置一个用户,并将 [`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections` 和 `show_named_collections_secrets` 设置的值设为 1。

## 定义 SQL 用户和角色 {#defining-sql-users-and-roles}

:::tip
如果你在使用 ClickHouse Cloud,请参阅 [Cloud access management](/cloud/security/console-roles)。
:::

本文介绍如何在基础层面定义 SQL 用户和角色,并将这些权限和许可应用到数据库、表、行和列上。

### 启用 SQL 用户模式 {#enabling-sql-user-mode}

1.  在 `users.xml` 文件中为 `<default>` 用户启用 SQL 用户模式:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` 用户是在全新安装时默认创建的唯一用户,同时也是默认用于节点间通信的账户。

    在生产环境中,建议在使用 SQL 管理员用户配置好节点间通信,并使用 `<secret>`、集群凭证以及/或节点间 HTTP 和传输协议凭证之后禁用该用户,因为 `default` 账户会被用于节点间通信。
    :::

2. 重启节点以应用更改。

3. 启动 ClickHouse 客户端:
    ```sql
    clickhouse-client --user default --password <password>
    ```

### 定义用户 {#defining-users}

1. 创建一个 SQL 管理员账户:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```

2. 授予新用户完整的管理权限:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER 权限 {#alter-permissions}

本文旨在帮助您更好地理解如何定义权限,以及在特权用户执行 `ALTER` 语句时权限是如何生效的。

`ALTER` 语句可以划分为若干类别,其中一部分具有层级结构,另一部分则不具有层级结构,必须显式定义。

**示例数据库、表和用户配置**

1. 使用管理员用户创建一个示例用户

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

4. 创建一个示例管理员用户用于授予或撤销权限

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
要授予或撤销权限,管理员用户必须拥有 `WITH GRANT OPTION` 权限。
例如:

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

要执行 `GRANT` 或 `REVOKE` 操作来授予或收回权限,用户自身必须先拥有这些权限。
:::

**授予或撤销权限**

`ALTER` 的层级结构:

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

1. 为用户或角色授予 `ALTER` 权限

使用 `GRANT ALTER on *.* TO my_user` 只会对顶级的 `ALTER TABLE` 和 `ALTER VIEW` 生效,其他 `ALTER` 语句必须分别单独授予或撤销。

例如,授予基本的 `ALTER` 权限:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

最终得到的权限集合:

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

这将授予上面示例中 `ALTER TABLE` 和 `ALTER VIEW` 下的所有权限,但是不会授予某些其他 `ALTER` 权限,例如 `ALTER ROW POLICY`(参见前面的权限层级结构,可以看到 `ALTER ROW POLICY` 并不是 `ALTER TABLE` 或 `ALTER VIEW` 的子权限)。这些权限必须被显式授予或撤销。

如果只需要 `ALTER` 权限的一个子集,则可以分别授予每一项;如果该权限还有子权限,这些子权限也会被自动授予。

例如:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

权限将配置为:

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

这还包括以下子权限:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. 从用户和角色撤销 `ALTER` 权限

`REVOKE` 语句的行为与 `GRANT` 语句类似。

如果某个用户/角色被授予了某个子权限,你可以直接撤销该子权限,也可以撤销其所继承的上级权限。

例如,如果该用户被授予了 `ALTER ADD COLUMN`

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

可以单独撤销某项权限:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

也可以在任意上层级别撤销(撤销该 COLUMN 的所有子权限):

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

这些权限必须由一个用户来授予,该用户不仅具有 `WITH GRANT OPTION`,而且自身也拥有这些权限。

1. 要为某个管理员用户授予相应的权限,并允许其管理一组权限,
   下面是一个示例:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

现在用户可以授予或撤销 `ALTER COLUMN` 及其所有子权限。

**测试**

1. 授予 `SELECT` 权限

```sql
GRANT SELECT ON my_db.my_table TO my_user;
```

2. 为该用户授予 ADD COLUMN 权限

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 使用受限权限用户登录

```bash
clickhouse-client --user my_user --password password --port 9000 --host <你的 ClickHouse 主机地址>
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

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. 测试删除列

```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. 通过授予权限测试 ALTER ADMIN

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. 使用 alter admin 用户登录

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

8. 测试尝试为 alter 管理员用户授予一个其自身不具备、且并非该管理员用户现有授权子权限的权限。

```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: Not enough privileges. To execute this query it's necessary to have grant ALTER UPDATE ON my_db.my_table WITH GRANT OPTION. (ACCESS_DENIED)
```

**摘要**

针对表和视图的 `ALTER`,其权限具有层级关系,但对其他 `ALTER` 语句则不适用。权限既可以按细粒度级别进行设置,也可以通过权限分组来统一设置,并且可以以类似方式撤销。执行授权或撤销操作的用户必须具有 `WITH GRANT OPTION`,才能为用户(包括其自身)设置权限,并且自身必须已经拥有相应的权限。如果执行操作的用户本身不具备相应的 grant option 权限,则无法撤销自己的权限。