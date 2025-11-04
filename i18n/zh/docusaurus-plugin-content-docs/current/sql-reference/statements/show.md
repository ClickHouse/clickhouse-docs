---
'description': 'SHOW 的文档'
'sidebar_label': 'SHOW'
'sidebar_position': 37
'slug': '/sql-reference/statements/show'
'title': 'SHOW 语句'
'doc_type': 'reference'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` 隐藏秘密，除非启用以下设置：

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) （服务器设置）
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) （格式设置）  

此外，用户应该具有 [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 权限。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

这些语句返回一个类型为 String 的单列， 
包含用于创建指定对象的 `CREATE` 查询。

### 语法 {#syntax}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
如果您使用此语句获取系统表的 `CREATE` 查询，
您将获得一个 *伪* 查询，该查询仅声明表结构，
但无法用于创建表。
:::

## SHOW DATABASES {#show-databases}

此语句打印所有数据库的列表。

### 语法 {#syntax-1}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

它与查询相同：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 示例 {#examples}

在此示例中，我们使用 `SHOW` 获取名称中包含符号序列 'de' 的数据库名称：

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

我们也可以以不区分大小写的方式执行此操作：

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

或者获取名称中不包含 'de' 的数据库名称：

```sql title="Query"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

最后，我们可以只获取前两个数据库的名称：

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 另请参见 {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` 语句显示表的列表。

### 语法 {#syntax-2}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

如果没有指定 `FROM` 子句，则查询返回当前数据库中的表列表。

此语句与查询相同：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 示例 {#examples-1}

在此示例中，我们使用 `SHOW TABLES` 语句查找所有名称中包含 'user' 的表：

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

我们也可以以不区分大小写的方式执行此操作：

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

或者查找名称中不包含字母 's' 的表：

```sql title="Query"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="Response"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

最后，我们可以只获取前两个表的名称：

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 另请参见 {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` 语句显示列的列表。

### 语法 {#syntax-3}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

数据库和表名可以用简写形式 `<db>.<table>` 指定， 
这意味着 `FROM tab FROM db` 和 `FROM db.tab` 是等效的。 
如果未指定数据库，则查询返回当前数据库中的列列表。

还有两个可选关键字：`EXTENDED` 和 `FULL`。 `EXTENDED` 关键字目前没有效果，
存在是为了与 MySQL 兼容。 `FULL` 关键字使输出包括校对、注释和权限列。

`SHOW COLUMNS` 语句产生一个结果表，其结构如下：

| 列          | 描述                                                                                                                     | 类型               |
|-------------|------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | 列的名称                                                                                                               | `String`           |
| `type`      | 列的数据类型。如果查询是通过 MySQL 线协议进行的，则显示 MySQL 中的等效类型名称。                                     | `String`           |
| `null`      | 如果列的数据类型是 Nullable，则为 `YES`，否则为 `NO`                                                                    | `String`           |
| `key`       | 如果列是主键的一部分，则为 `PRI`，如果列是排序键的一部分，则为 `SOR`，否则为空                                          | `String`           |
| `default`   | 如果列的类型是 `ALIAS`、`DEFAULT` 或 `MATERIALIZED`，则为列的默认表达式，否则为 `NULL`。                               | `Nullable(String)` |
| `extra`     | 附加信息，目前未使用                                                                                                   | `String`           |
| `collation` | （仅在指定了 `FULL` 关键字时）列的校对，总是 `NULL`，因为 ClickHouse 没有每列的校对                                 | `Nullable(String)` |
| `comment`   | （仅在指定了 `FULL` 关键字时）列的注释                                                                                | `String`           |
| `privilege` | （仅在指定了 `FULL` 关键字时）您在此列上的权限，目前不可用                                                          | `String`           |

### 示例 {#examples-2}

在此示例中，我们将使用 `SHOW COLUMNS` 语句获取表 'orders' 中所有列的信息，从 'delivery_' 开始：

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### 另请参见 {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES` 语句显示 [字典](../../sql-reference/dictionaries/index.md) 的列表。

### 语法 {#syntax-4}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

如果没有指定 `FROM` 子句，则查询返回当前数据库中的字典列表。

您可以通过以下方式获取与 `SHOW DICTIONARIES` 查询相同的结果：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 示例 {#examples-3}

以下查询选择 `system` 数据库中名称包含 `reg` 的表列表的前两行。

```sql title="Query"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Response"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

显示表的主键和数据跳过索引的列表。

此语句主要是为了与 MySQL 兼容。系统表 [`system.tables`](../../operations/system-tables/tables.md)（用于
主键）和 [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)（用于数据跳过索引）
提供等效信息，但以更原生于 ClickHouse 的方式。

### 语法 {#syntax-5}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

数据库和表名可以用简写形式 `<db>.<table>` 指定，即 `FROM tab FROM db` 和 `FROM db.tab` 是
等效的。如果未指定数据库，则查询假定当前数据库为数据库。

可选关键字 `EXTENDED` 目前没有效果，存在是为了与 MySQL 兼容。

该语句产生一个结果表，其结构如下：

| 列              | 描述                                                                                                                 | 类型               |
|-----------------|----------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | 表的名称。                                                                                                          | `String`           |
| `non_unique`    | 始终为 `1`，因为 ClickHouse 不支持唯一性约束。                                                                     | `UInt8`            |
| `key_name`      | 索引的名称，`PRIMARY` 如果索引是主键索引。                                                                          | `String`           |
| `seq_in_index`  | 对于主键索引，从 `1` 开始的列的位置。对于数据跳过索引：始终为 `1`。                                               | `UInt8`            |
| `column_name`   | 对于主键索引，列的名称。对于数据跳过索引：`''`（空字符串），见字段 "expression"。                                  | `String`           |
| `collation`     | 索引中列的排序：升序为 `A`，降序为 `D`，未排序为 `NULL`。                                                          | `Nullable(String)` |
| `cardinality`   | 索引基数的估计（索引中唯一值的数量）。目前始终为 0。                                                               | `UInt64`           |
| `sub_part`      | 始终为 `NULL`，因为 ClickHouse 不支持像 MySQL 那样的索引前缀。                                                       | `Nullable(String)` |
| `packed`        | 始终为 `NULL`，因为 ClickHouse 不支持压缩索引（如 MySQL）。                                                          | `Nullable(String)` |
| `null`          | 当前未使用                                                                                                          |                    |
| `index_type`    | 索引类型，例如 `PRIMARY`、`MINMAX`、`BLOOM_FILTER` 等。                                                            | `String`           |
| `comment`       | 关于索引的附加信息，目前始终为 `''`（空字符串）。                                                                    | `String`           |
| `index_comment` | `''`（空字符串），因为 ClickHouse 中的索引不能有 `COMMENT` 字段（与 MySQL 类似）。                                | `String`           |
| `visible`       | 如果索引对优化器可见，始终为 `YES`。                                                                               | `String`           |
| `expression`    | 对于数据跳过索引，索引表达式。对于主键索引：`''`（空字符串）。                                                      | `String`           |

### 示例 {#examples-4}

在此示例中，我们使用 `SHOW INDEX` 语句获取表 'tbl' 中所有索引的信息。

```sql title="Query"
SHOW INDEX FROM 'tbl'
```

```text title="Response"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
│ tbl   │          1 │ mm1_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ a, c, d    │
│ tbl   │          1 │ mm2_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ c, d, e    │
│ tbl   │          1 │ PRIMARY  │ 1            │ c           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ PRIMARY  │ 2            │ a           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ set_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ SET          │         │               │ YES     │ e          │
└───────┴────────────┴──────────┴──────────────┴─────────────┴───────────┴─────────────┴──────────┴────────┴──────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
```

### 另请参见 {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST {#show-processlist}

输出 [`system.processes`](/operations/system-tables/processes) 表的内容，其中包含当前正在处理的查询列表，不包括 `SHOW PROCESSLIST` 查询。

### 语法 {#syntax-6}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` 查询返回所有当前查询的数据。

:::tip
在控制台中执行：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` 语句显示用户的权限。

### 语法 {#syntax-7}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

如果未指定用户，则查询返回当前用户的权限。

`WITH IMPLICIT` 修饰符允许显示隐式授予（例如，`GRANT SELECT ON system.one`）

`FINAL` 修饰符合并来自用户及其授予角色（带继承）的所有授予。

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` 语句显示用于 [用户创建](../../sql-reference/statements/create/user.md) 的参数。

### 语法 {#syntax-8}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` 语句显示用于 [角色创建](../../sql-reference/statements/create/role.md) 的参数。

### 语法 {#syntax-9}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` 语句显示用于 [行策略创建](../../sql-reference/statements/create/row-policy.md) 的参数。

### 语法 {#syntax-10}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` 语句显示用于 [配额创建](../../sql-reference/statements/create/quota.md) 的参数。

### 语法 {#syntax-11}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` 语句显示用于 [设置配置文件创建](../../sql-reference/statements/create/settings-profile.md) 的参数。

### 语法 {#syntax-12}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` 语句返回一个 [用户帐户](../../guides/sre/user-management/index.md#user-account-management) 名称列表。 
要查看用户帐户参数，请参见系统表 [`system.users`](/operations/system-tables/users)。

### 语法 {#syntax-13}

```sql title="Syntax"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` 语句返回一个 [角色](../../guides/sre/user-management/index.md#role-management) 名称列表。 
要查看其他参数， 
请参见系统表 [`system.roles`](/operations/system-tables/roles) 和 [`system.role_grants`](/operations/system-tables/role_grants)。

### 语法 {#syntax-14}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` 语句返回一个 [设置配置文件](../../guides/sre/user-management/index.md#settings-profiles-management) 名称列表。 
要查看用户帐户参数，请参见系统表 [`settings_profiles`](/operations/system-tables/settings_profiles)。

### 语法 {#syntax-15}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` 语句返回指定表的 [行策略](../../guides/sre/user-management/index.md#row-policy-management) 列表。 
要查看用户帐户参数，请参见系统表 [`system.row_policies`](/operations/system-tables/row_policies)。

### 语法 {#syntax-16}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` 语句返回 [配额](../../guides/sre/user-management/index.md#quotas-management) 列表。 
要查看配额参数，请参见系统表 [`system.quotas`](/operations/system-tables/quotas)。

### 语法 {#syntax-17}

```sql title="Syntax"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` 语句返回所有用户或当前用户的 [配额](../../operations/quotas.md) 消耗。 
要查看其他参数，请参见系统表 [`system.quotas_usage`](/operations/system-tables/quotas_usage) 和 [`system.quota_usage`](/operations/system-tables/quota_usage)。

### 语法 {#syntax-18}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

`SHOW ACCESS` 语句显示所有 [用户](../../guides/sre/user-management/index.md#user-account-management)、[角色](../../guides/sre/user-management/index.md#role-management)、[配置文件](../../guides/sre/user-management/index.md#settings-profiles-management) 等及其所有 [授权](../../sql-reference/statements/grant.md#privileges)。

### 语法 {#syntax-19}

```sql title="Syntax"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` 语句返回集群列表。 
所有可用集群都列在 [`system.clusters`](../../operations/system-tables/clusters.md) 表中。

:::note
`SHOW CLUSTER name` 查询显示 `system.clusters` 表中指定集群名称的 `cluster`、`shard_num`、`replica_num`、`host_name`、`host_address` 和 `port`。
:::

### 语法 {#syntax-20}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### 示例 {#examples-5}

```sql title="Query"
SHOW CLUSTERS;
```

```text title="Response"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="Query"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="Response"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="Query"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="Response"
Row 1:
──────
cluster:                 test_shard_localhost
shard_num:               1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
```

## SHOW SETTINGS {#show-settings}

`SHOW SETTINGS` 语句返回系统设置及其值的列表。 
它从 [`system.settings`](../../operations/system-tables/settings.md) 表中选择数据。

### 语法 {#syntax-21}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 子句 {#clauses}

`LIKE|ILIKE` 允许指定设置名称的匹配模式。它可以包含斜杠，如 `%` 或 `_`。 `LIKE` 子句是大小写敏感的，`ILIKE` — 不区分大小写。

当使用 `CHANGED` 子句时，查询仅返回已更改的设置与其默认值的不同。

### 示例 {#examples-6}

带有 `LIKE` 子句的查询：

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

带有 `ILIKE` 子句的查询：

```sql title="Query"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="Response"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

带有 `CHANGED` 子句的查询：

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING` 语句输出指定设置名称的设置值。

### 语法 {#syntax-22}

```sql title="Syntax"
SHOW SETTING <name>
```

### 另请参见 {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) 表

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### 示例 {#examples-7}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### 另请参见 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) 表

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` 语句输出 [`system.table_engines`](../../operations/system-tables/table_engines.md) 表的内容， 
其中包含服务器支持的表引擎及其功能支持信息的描述。

### 语法 {#syntax-23}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 另请参见 {#see-also-6}

- [`system.table_engines`](../../operations/system-tables/table_engines.md) 表

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` 语句输出 [`system.functions`](../../operations/system-tables/functions.md) 表的内容。

### 语法 {#syntax-24}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

如果指定了 `LIKE` 或 `ILIKE` 子句，则查询会返回与提供的 `<pattern>` 匹配的系统函数名称列表。

### 另请参见 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) 表

## SHOW MERGES {#show-merges}

`SHOW MERGES` 语句返回合并的列表。 
所有合并都列在 [`system.merges`](../../operations/system-tables/merges.md) 表中：

| 列                | 描述                                                   |
|-------------------|---------------------------------------------------------|
| `table`           | 表名。                                                 |
| `database`        | 表所属数据库的名称。                                   |
| `estimate_complete` | 估计完成时间（以秒为单位）。                          |
| `elapsed`         | 自合并开始以来经过的时间（以秒为单位）。              |
| `progress`        | 完成工作百分比（0-100 百分比）。                       |
| `is_mutation`     | 如果此过程是部分变更，则为 1。                        |
| `size_compressed` | 合并部分的压缩数据的总大小。                          |
| `memory_usage`    | 合并过程的内存消耗。                                  |

### 语法 {#syntax-25}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### 示例 {#examples-8}

```sql title="Query"
SHOW MERGES;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="Query"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
