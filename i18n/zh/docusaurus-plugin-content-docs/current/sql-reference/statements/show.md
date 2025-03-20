---
slug: /sql-reference/statements/show
sidebar_position: 37
sidebar_label: SHOW
title: SHOW 语句
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` 会隐藏机密，除非启用了以下设置:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (服务器设置)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (格式设置)  

此外，用户应具有 [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 权限。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

这些语句返回一个类型为 String 的单列，包含用于创建指定对象的 `CREATE` 查询。

### 语法 {#syntax}

```sql title="语法"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
如果您使用此语句获取系统表的 `CREATE` 查询，您将获得一个 *虚假的* 查询，该查询仅声明表结构，无法用于创建表。
:::

## SHOW DATABASES {#show-databases}

此语句打印所有数据库的列表。

### 语法 {#syntax-1}

```sql title="语法"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

它与查询相同：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 示例 {#examples}

在此示例中，我们使用 `SHOW` 来获取名称中包含符号序列 'de' 的数据库名称：

```sql title="查询"
SHOW DATABASES LIKE '%de%'
```

```text title="响应"
┌─name────┐
│ default │
└─────────┘
```

我们也可以以不区分大小写的方式执行：

```sql title="查询"
SHOW DATABASES ILIKE '%DE%'
```

```text title="响应"
┌─name────┐
│ default │
└─────────┘
```

或者获取其名称中不包含 'de' 的数据库名称：

```sql title="查询"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="响应"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

最后，我们可以仅获取前两个数据库的名称：

```sql title="查询"
SHOW DATABASES LIMIT 2
```

```text title="响应"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 另请参见 {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` 语句显示一个表的列表。

### 语法 {#syntax-2}

```sql title="语法"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

如果未指定 `FROM` 子句，则查询返回当前数据库的表列表。

此语句与查询相同：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 示例 {#examples-1}

在此示例中，我们使用 `SHOW TABLES` 语句查找名称中包含 'user' 的所有表：

```sql title="查询"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="响应"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

我们也可以以不区分大小写的方式执行：

```sql title="查询"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="响应"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

或者查找名称中不包含字母 's' 的表：

```sql title="查询"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="响应"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

最后，我们可以仅获取前两个表的名称：

```sql title="查询"
SHOW TABLES FROM system LIMIT 2
```

```text title="响应"
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

```sql title="语法"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

数据库和表名可以以简写形式指定为 `<db>.<table>`，这意味着 `FROM tab FROM db` 和 `FROM db.tab` 是等价的。
如果未指定数据库，则查询返回当前数据库的列列表。

还有两个可选关键字：`EXTENDED` 和 `FULL`。`EXTENDED` 关键字目前没有影响，并且是为了与 MySQL 兼容。`FULL` 关键字会导致输出包括排序、注释和权限列。

`SHOW COLUMNS` 语句生成一个具有以下结构的结果表：

| 列         | 描述                                                                                                                     | 类型               |
|------------|-------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`    | 列的名称                                                                                                               | `String`           |
| `type`     | 列的数据类型。如果查询是通过 MySQL 线协议进行的，则显示 MySQL 中的等效类型名称。                                     | `String`           |
| `null`     | 如果列的数据类型是 Nullable，则为 `YES`，否则为 `NO`                                                                  | `String`           |
| `key`      | 如果列是主键的一部分，则为 `PRI`；如果列是排序键的一部分，则为 `SOR`，否则为空                                        | `String`           |
| `default`  | 如果列类型是 `ALIAS`、`DEFAULT` 或 `MATERIALIZED`，则为列的默认表达式，否则为 `NULL`。                              | `Nullable(String)` |
| `extra`    | 额外信息，目前未使用                                                                                                   | `String`           |
| `collation`| （仅当指定 `FULL` 关键字时）列的排列，始终为 `NULL`，因为 ClickHouse 没有每列的排列                                   | `Nullable(String)` |
| `comment`  | （仅当指定 `FULL` 关键字时）列的注释                                                                                 | `String`           |
| `privilege`| （仅当指定 `FULL` 关键字时）您在此列上的权限，目前不可用                                                           | `String`           |

### 示例 {#examples-2}

在此示例中，我们将使用 `SHOW COLUMNS` 语句获取关于表 'orders' 中所有列的信息，从 'delivery_' 字段开始：

```sql title="查询"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="响应"
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

```sql title="语法"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

如果未指定 `FROM` 子句，则查询返回当前数据库的字典列表。

您可以以以下方式获取与 `SHOW DICTIONARIES` 查询相同的结果：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 示例 {#examples-3}

以下查询选择 `system` 数据库中名称包含 `reg` 的前两行：

```sql title="查询"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="响应"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

显示表的主键和数据跳过索引的列表。

此语句主要是为了与 MySQL 兼容。系统表 [`system.tables`](../../operations/system-tables/tables.md) (用于主键) 和 [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (用于数据跳过索引) 提供等效的信息，但采用对 ClickHouse 更原生的方式。

### 语法 {#syntax-5}

```sql title="语法"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

数据库和表名可以被简写为 `<db>.<table>`，即 `FROM tab FROM db` 和 `FROM db.tab` 是等价的。如果未指定数据库，则查询假定当前数据库为数据库。

可选关键字 `EXTENDED` 目前没有影响，并且是为了与 MySQL 兼容。

该语句生成一个具有以下结构的结果表：

| 列               | 描述                                                                                                                  | 类型               |
|------------------|-----------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`          | 表名                                                                                                                  | `String`           |
| `non_unique`     | 始终为 `1`，因为 ClickHouse 不支持唯一约束。                                                                          | `UInt8`            |
| `key_name`       | 索引的名称，如果索引是主键索引，则为 `PRIMARY`。                                                                      | `String`           |
| `seq_in_index`   | 对于主键索引，从 `1` 开始的列的位置。对于数据跳过索引：始终为 `1`。                                                 | `UInt8`            |
| `column_name`    | 对于主键索引，列的名称。对于数据跳过索引：`''`（空字符串），见字段 "expression"。                                    | `String`           |
| `collation`      | 索引中的列的排序：`A` 如果升序，`D` 如果降序，`NULL` 如果无序。                                                        | `Nullable(String)` |
| `cardinality`    | 对于索引基数的估计（索引中唯一值的数量）。目前始终为 0。                                                              | `UInt64`           |
| `sub_part`       | 始终为 `NULL`，因为 ClickHouse 不支持像 MySQL 一样的索引前缀。                                                         | `Nullable(String)` |
| `packed`         | 始终为 `NULL`，因为 ClickHouse 不支持打包索引（类似 MySQL）。                                                           | `Nullable(String)` |
| `null`           | 当前未使用                                                                                                            |                    |
| `index_type`     | 索引类型，例如 `PRIMARY`、`MINMAX`、`BLOOM_FILTER` 等。                                                              | `String`           |
| `comment`        | 关于索引的额外信息，目前始终为 `''`（空字符串）。                                                                     | `String`           |
| `index_comment`  | `''`（空字符串），因为 ClickHouse 中的索引不能具有 `COMMENT` 字段（如 MySQL）。                                     | `String`           |
| `visible`        | 如果该索引对优化器可见，始终为 `YES`。                                                                                | `String`           |
| `expression`     | 对于数据跳过索引，索引表达式。对于主键索引：`''`（空字符串）。                                                       | `String`           |

### 示例 {#examples-4}

在此示例中，我们使用 `SHOW INDEX` 语句获取表 'tbl' 中所有索引的信息：

```sql title="查询"
SHOW INDEX FROM 'tbl'
```

```text title="响应"
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

输出 [`system.processes`](/operations/system-tables/processes) 表的内容，该表包含正在处理的查询列表，不包括 `SHOW PROCESSLIST` 查询。

### 语法 {#syntax-6}

```sql title="语法"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` 查询返回有关当前所有查询的数据。

:::tip
在控制台中执行：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` 语句显示用户的权限。

### 语法 {#syntax-7}

```sql title="语法"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

如果未指定用户，则查询返回当前用户的权限。

`WITH IMPLICIT` 修饰符允许显示隐式授权（例如，`GRANT SELECT ON system.one`）

`FINAL` 修饰符合并用户及其授权角色的所有授权（包括继承）

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` 语句显示在 [用户创建](../../sql-reference/statements/create/user.md) 中使用的参数。

### 语法 {#syntax-8}

```sql title="语法"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` 语句显示在 [角色创建](../../sql-reference/statements/create/role.md) 中使用的参数。

### 语法 {#syntax-9}

```sql title="语法"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` 语句显示在 [行策略创建](../../sql-reference/statements/create/row-policy.md) 中使用的参数。

### 语法 {#syntax-10}

```sql title="语法"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` 语句显示在 [配额创建](../../sql-reference/statements/create/quota.md) 中使用的参数。

### 语法 {#syntax-11}

```sql title="语法"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` 语句显示在 [设置配置文件创建](../../sql-reference/statements/create/settings-profile.md) 中使用的参数。

### 语法 {#syntax-12}

```sql title="语法"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` 语句返回 [用户帐户](../../guides/sre/user-management/index.md#user-account-management) 名称的列表。
要查看用户帐户参数，请参见系统表 [`system.users`](/operations/system-tables/users)。

### 语法 {#syntax-13}

```sql title="语法"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` 语句返回 [角色](../../guides/sre/user-management/index.md#role-management) 的列表。
要查看其他参数，请参见系统表 [`system.roles`](/operations/system-tables/roles) 和 [`system.role_grants`](/operations/system-tables/role-grants)。

### 语法 {#syntax-14}

```sql title="语法"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` 语句返回 [设置配置文件](../../guides/sre/user-management/index.md#settings-profiles-management) 的列表。要查看用户帐户参数，请参见系统表 [`settings_profiles`](/operations/system-tables/settings_profiles)。

### 语法 {#syntax-15}

```sql title="语法"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` 语句返回指定表的 [行策略](../../guides/sre/user-management/index.md#row-policy-management) 的列表。要查看用户帐户参数，请参见系统表 [`system.row_policies`](/operations/system-tables/row_policies)。

### 语法 {#syntax-16}

```sql title="语法"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` 语句返回 [配额](../../guides/sre/user-management/index.md#quotas-management) 的列表。
要查看配额参数，请参见系统表 [`system.quotas`](/operations/system-tables/quotas)。

### 语法 {#syntax-17}

```sql title="语法"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` 语句返回所有用户或当前用户的 [配额](../../operations/quotas.md) 消耗情况。
要查看其他参数，请参见系统表 [`system.quotas_usage`](/operations/system-tables/quotas_usage) 和 [`system.quota_usage`](/operations/system-tables/quota_usage)。

### 语法 {#syntax-18}

```sql title="语法"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

`SHOW ACCESS` 语句显示所有 [用户](../../guides/sre/user-management/index.md#user-account-management)、[角色](../../guides/sre/user-management/index.md#role-management)、[配置文件](../../guides/sre/user-management/index.md#settings-profiles-management) 等和它们所有的 [授权](../../sql-reference/statements/grant.md#privileges)。

### 语法 {#syntax-19}

```sql title="语法"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` 语句返回集群的列表。
所有可用的集群都列在 [`system.clusters`](../../operations/system-tables/clusters.md) 表中。

:::note
`SHOW CLUSTER name` 查询显示指定集群名称的 `system.clusters` 表的内容。
:::

### 语法 {#syntax-20}

```sql title="语法"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### 示例 {#examples-5}

```sql title="查询"
SHOW CLUSTERS;
```

```text title="响应"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="查询"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="响应"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="查询"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="响应"
Row 1:
──────
cluster:                 test_shard_localhost
shard_num:               1
shard_weight:            1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
is_local:                1
user:                    default
default_database:
errors_count:            0
estimated_recovery_time: 0
```

## SHOW SETTINGS {#show-settings}

`SHOW SETTINGS` 语句返回系统设置及其值的列表。
它从 [`system.settings`](../../operations/system-tables/settings.md) 表中选择数据。

### 语法 {#syntax-21}

```sql title="语法"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 子句 {#clauses}

`LIKE|ILIKE` 允许指定设置名称的匹配模式。它可以包含通配符，例如 `%` 或 `_`。`LIKE` 子句是区分大小写的，`ILIKE` 是不区分大小写的。

当使用 `CHANGED` 子句时，查询仅返回已更改为默认值的设置。

### 示例 {#examples-6}

使用 `LIKE` 子句的查询：

```sql title="查询"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="响应"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

使用 `ILIKE` 子句的查询：

```sql title="查询"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="响应"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

使用 `CHANGED` 子句的查询：

```sql title="查询"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="响应"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING` 语句输出指定设置名称的设置值。

### 语法 {#syntax-22}

```sql title="语法"
SHOW SETTING <name>
```

### 另请参见 {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) 表

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### 示例 {#examples-7}

```sql title="查询"
SHOW FILESYSTEM CACHES
```

```text title="响应"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### 另请参见 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) 表

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` 语句输出 [`system.table_engines`](../../operations/system-tables/table_engines.md) 表的内容，该表包含服务器支持的表引擎及其功能支持信息的描述。

### 语法 {#syntax-23}

```sql title="语法"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 另请参见 {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) 表

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` 语句输出 [`system.functions`](../../operations/system-tables/functions.md) 表的内容。

### 语法 {#syntax-24}

```sql title="语法"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

如果指定了 `LIKE` 或 `ILIKE` 子句，则查询返回名称与提供的 `<pattern>` 匹配的系统函数列表。

### 另请参见 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) 表

## SHOW MERGES {#show-merges}

`SHOW MERGES` 语句返回合并的列表。
所有合并都列在 [`system.merges`](../../operations/system-tables/merges.md) 表中：

| 列                  | 描述                                                |
|----------------------|------------------------------------------------------|
| `table`              | 表名称。                                            |
| `database`           | 表所在的数据库的名称。                              |
| `estimate_complete`  | 完成的估计时间（以秒为单位）。                     |
| `elapsed`            | 自合并开始以来经过的时间（以秒为单位）。           |
| `progress`           | 完成工作百分比（0-100%）。                         |
| `is_mutation`        | 如果该过程是部分变异，则为 1。                       |
| `size_compressed`    | 合并部分的压缩数据的总大小。                       |
| `memory_usage`       | 合并过程中消耗的内存。                             |


### 语法 {#syntax-25}

```sql title="语法"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### 示例 {#examples-8}

```sql title="查询"
SHOW MERGES;
```

```text title="响应"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="查询"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="响应"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
