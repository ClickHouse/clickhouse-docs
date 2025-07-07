---
'slug': '/operations/access-rights'
'sidebar_position': 1
'sidebar_label': '用户和角色'
'title': '访问控制和账户管理'
'keywords':
- 'ClickHouse Cloud'
- 'Access Control'
- 'User Management'
- 'RBAC'
- 'Security'
'description': '描述了在 ClickHouse Cloud 中的访问控制和账户管理'
---


# 在 ClickHouse 中创建用户和角色

ClickHouse 支持基于 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 的访问控制管理。

ClickHouse 访问实体：
- [用户账户](#user-account-management)
- [角色](#role-management)
- [行策略](#row-policy-management)
- [设置配置文件](#settings-profiles-management)
- [配额](#quotas-management)

您可以通过以下方式配置访问实体：

- 基于 SQL 的工作流。

    您需要 [启用](#enabling-access-control) 此功能。

- 服务器 [配置文件](/operations/configuration-files.md) `users.xml` 和 `config.xml`。

我们推荐使用基于 SQL 的工作流。两种配置方法可以同时工作，因此，如果您使用服务器配置文件来管理账户和访问权限，您可以顺利切换到基于 SQL 的工作流。

:::note
您不能同时通过这两种配置方法管理同一个访问实体。
:::

:::note
如果您想管理 ClickHouse Cloud Console 用户，请参考此 [页面](/cloud/security/cloud-access-management)。
:::

要查看所有用户、角色、配置文件等及其所有权限，请使用 [`SHOW ACCESS`](/sql-reference/statements/show#show-access) 语句。

## 概述 {#access-control-usage}

默认情况下，ClickHouse 服务器提供 `default` 用户账户，该账户不允许使用基于 SQL 的访问控制和账户管理，但拥有所有权限和权限。当未定义用户名时，例如，从客户端登录或在分布式查询中，使用 `default` 用户账户。在分布式查询处理中，如果服务器或集群的配置未指定 [用户名和密码](/engines/table-engines/special/distributed.md) 属性，则使用默认用户账户。

如果您刚开始使用 ClickHouse，可以考虑以下场景：

1.  [启用](#enabling-access-control) SQL 驱动的访问控制和账户管理，用于 `default` 用户。
2.  登录到 `default` 用户账户并创建所有必需的用户。不要忘记创建管理员账户（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）。
3.  [限制权限](/operations/settings/permissions-for-queries) 给 `default` 用户，并禁用其 SQL 驱动的访问控制和账户管理。

### 当前解决方案的属性 {#access-control-properties}

- 您可以为数据库和表授予权限，即使它们不存在。
- 如果删除了一个表，则与该表相关的所有权限不会被撤销。这意味着即使您稍后创建一个同名的新表，所有权限仍然有效。要撤销与已删除表相关的权限，您需要执行，例如，`REVOKE ALL PRIVILEGES ON db.table FROM ALL` 查询。
- 权限没有有效期设置。

### 用户账户 {#user-account-management}

用户账户是一个访问实体，允许在 ClickHouse 中进行身份验证。用户账户包含：

- 身份识别信息。
- 定义用户可以执行的查询范围的 [特权](/sql-reference/statements/grant.md#privileges)。
- 允许连接到 ClickHouse 服务器的主机。
- 分配的和默认角色。
- 在用户登录时默认应用的设置及其约束。
- 分配的设置配置文件。

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询或分配 [角色](#role-management) 向用户账户授予权限。要从用户中撤销权限，ClickHouse 提供了 [REVOKE](/sql-reference/statements/revoke.md) 查询。要列出用户的权限，请使用 [SHOW GRANTS](/sql-reference/statements/show#show-grants) 语句。

管理查询：

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 设置应用 {#access-control-settings-applying}

设置可以以不同方式进行配置：针对用户账户、其授权的角色以及设置配置文件。在用户登录时，如果为不同访问实体配置了设置，该设置的值和约束将按以下优先级应用（从高到低）：

1.  用户账户设置。
2.  用户账户的默认角色的设置。如果某些角色中配置了某个设置，则该设置的应用顺序未定义。
3.  分配给用户或其默认角色的设置配置文件中的设置。如果某些配置文件中配置了某个设置，则该设置的应用顺序未定义。
4.  默认或来自 [默认配置文件](/operations/server-configuration-parameters/settings#default_profile) 应用到整个服务器的设置。

### 角色 {#role-management}

角色是一个访问实体的容器，可以授予用户账户。

角色包含：

- [特权](/sql-reference/statements/grant#privileges)
- 设置和约束
- 已分配角色的列表

管理查询：

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

可以通过 [GRANT](/sql-reference/statements/grant.md) 查询授予角色特权。要从角色中撤销权限，ClickHouse 提供了 [REVOKE](/sql-reference/statements/revoke.md) 查询。

#### 行策略 {#row-policy-management}

行策略是定义用户或角色可用哪些行的过滤器。行策略包含针对特定表的过滤器，以及应使用此行策略的角色和/或用户列表。

:::note
行策略仅对具有只读访问权限的用户有意义。如果用户可以修改表或在表之间复制分区，则这会破坏行策略的限制。
:::

管理查询：

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 设置配置文件 {#settings-profiles-management}

设置配置文件是一组 [设置](/operations/settings/index.md)。设置配置文件包含设置和约束，以及一个角色和/或用户列表，这些角色和/或用户应用此配置文件。

管理查询：

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### 配额 {#quotas-management}

配额限制资源的使用。参见 [Quotas](/operations/quotas.md)。

配额包含一组限额，适用于某些时间段，以及一个角色和/或用户列表，这些角色和/或用户应使用此配额。

管理查询：

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### 启用 SQL 驱动的访问控制和账户管理 {#enabling-access-control}

- 设置用于配置存储的目录。

    ClickHouse 将访问实体配置存储在由 [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) 服务器配置参数设置的文件夹中。

- 为至少一个用户账户启用 SQL 驱动的访问控制和账户管理。

    默认情况下，所有用户的 SQL 驱动访问控制和账户管理都被禁用。您需要在 `users.xml` 配置文件中配置至少一个用户，并将 [`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections` 和 `show_named_collections_secrets` 设置的值设置为 1。


## 定义 SQL 用户和角色 {#defining-sql-users-and-roles}

:::tip
如果您在 ClickHouse Cloud 中工作，请查看 [Cloud access management](/cloud/security/cloud-access-management)。
:::

本文展示了定义 SQL 用户和角色的基本知识，并将这些特权和权限应用于数据库、表、行和列。

### 启用 SQL 用户模式 {#enabling-sql-user-mode}

1.  在 `<default>` 用户下的 `users.xml` 文件中启用 SQL 用户模式：
```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

    :::note
    `default` 用户是唯一一个在新安装时创建的用户，并且默认用于节点间通信的账户。

    在生产环境中，建议在使用 SQL 管理用户配置了节点间通信后禁用此用户，并同时配置了 `<secret>`、集群凭据和/或节点间 HTTP 和传输协议凭据，因为 `default` 账户用于节点间通信。
    :::

2. 重启节点以应用更改。

3. 启动 ClickHouse 客户端：
```sql
clickhouse-client --user default --password <password>
```
### 定义用户 {#defining-users}

1. 创建一个 SQL 管理员账户：
```sql
CREATE USER clickhouse_admin IDENTIFIED BY 'password';
```
2. 授予新用户完全的管理权限
```sql
GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
```

## ALTER 权限 {#alter-permissions}

本文旨在帮助您更好地理解如何定义权限，以及在使用 `ALTER` 语句时特权用户如何工作。

`ALTER` 语句分为几类，其中一些是分层的，而另一些不是，必须显式定义。

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

4. 创建示例管理员用户以授予/撤销权限
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
要授予或撤销权限，管理员用户必须具有 `WITH GRANT OPTION` 特权。
例如：
```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```
要 `GRANT` 或 `REVOKE` 权限，用户必须首先拥有这些权限。
:::

**授予或撤销特权**

`ALTER` 层次结构：

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

1. 授予用户或角色 `ALTER` 权限

使用 `GRANT ALTER on *.* TO my_user` 只会影响顶层的 `ALTER TABLE` 和 `ALTER VIEW`，其他 `ALTER` 语句必须单独授予或撤销。

例如，授予基本的 `ALTER` 权限：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

生成的权限集：

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

这将授予上述示例中 `ALTER TABLE` 和 `ALTER VIEW` 下的所有权限，但是，它不会授予其他某些 `ALTER` 权限，例如 `ALTER ROW POLICY`（请参阅层次结构，您会看到 `ALTER ROW POLICY` 不是 `ALTER TABLE` 或 `ALTER VIEW` 的子项）。这些必须显式地授予或撤销。

如果只需要 `ALTER` 权限的子集，则可分别授予每个权限，如果该权限有子特权，则这些子特权也会自动授予。

例如：

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

权限将被设置为：

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

这还会提供以下子特权：

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

如果用户/角色被授予了子特权，则可以直接撤销该子特权，或者撤销其继承的更高层特权。

例如，如果用户被授予 `ALTER ADD COLUMN`

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

可以单独撤销特权：

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

或者可以从任何上级撤销（撤销所有列子特权）：

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

**附加**

特权必须由不仅具有 `WITH GRANT OPTION` 权限的用户授予，还必须拥有特权本身。

1. 要授予管理员用户权限，同时允许他们管理一组权限
以下是一个示例：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

现在，该用户可以授予或撤销 `ALTER COLUMN` 和所有子特权。

**测试**

1. 添加 `SELECT` 权限
```sql
GRANT SELECT ON my_db.my_table TO my_user;
```

2. 向用户添加添加列权限
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

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. 测试删除一列
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

5. 测试通过授予权限来测试更改管理员
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. 使用更改管理员用户登录
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. 授予子特权
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. 测试授予权限，该更改管理员用户没有的权限不是管理员用户的授予子权限。
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

**总结**
对于 `ALTER`，权限在表和视图中是分层的，但对于其他 `ALTER` 语句则不是。权限可以以细粒度设置或按权限分组设置，并且可以以类似方式撤销。授予或撤销的用户必须具有 `WITH GRANT OPTION` 以在用户上设置权限，包括实际用户本身，并且必须已经拥有该权限。如果执行用户没有自己的授予选项权限，则不能撤销自己的权限。
