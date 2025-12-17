---
description: 'SHOW 语句文档'
sidebar_label: 'SHOW'
sidebar_position: 37
slug: /sql-reference/statements/show
title: 'SHOW 语句'
doc_type: 'reference'
---

:::note

除非开启以下设置，否则 `SHOW CREATE (TABLE|DATABASE|USER)` 默认会隐藏密钥等敏感信息：

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select)（服务器设置）
- [`format_display_secrets_in_show_and_select` ](../../operations/settings/formats/#format_display_secrets_in_show_and_select)（格式设置）  

此外，用户需要具备 [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 权限。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

这些语句会返回一个 `String` 类型的单列，
其中包含用于创建指定对象的 `CREATE` 查询语句。

### 语法 {#syntax}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
如果你使用该语句来获取系统表对应的 `CREATE` 查询语句，
你将会得到一个*虚假的*查询，它只声明了表结构，
但不能真正用于创建表。
:::

## SHOW DATABASES {#show-databases}

该语句会列出所有数据库。

### 语法 {#syntax-1}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

它与以下查询相同：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 示例 {#examples}

在此示例中，我们使用 `SHOW` 获取名称中包含字符序列 &#39;de&#39; 的数据库：

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

我们也可以改为不区分大小写：

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

或者获取名称中不包含 &#39;de&#39; 的数据库：

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

最后，我们只获取前两个数据库的名称：

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 另请参阅 {#see-also}

* [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` 语句用于显示表列表。

### 语法 {#syntax-2}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

如果未指定 `FROM` 子句，查询将返回当前数据库中的表列表。

该语句等同于以下查询：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 示例 {#examples-1}

在以下示例中，我们使用 `SHOW TABLES` 语句查找所有表名中包含 &#39;user&#39; 的表：

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

我们也可以以不区分大小写的方式进行：

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

或者查找表名中不包含字母 “s” 的表：

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

最后，我们就只获取前两个表的名称：

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 另请参阅 {#see-also-1}

* [`Create Tables`](/sql-reference/statements/create/table)
* [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` 语句用于显示列列表。

### 语法 {#syntax-3}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

数据库和表名可以用简写形式 `<db>.<table>` 来指定，
这意味着 `FROM tab FROM db` 和 `FROM db.tab` 是等价的。
如果未指定数据库，则查询会返回当前数据库中的列列表。

另外还有两个可选关键字：`EXTENDED` 和 `FULL`。`EXTENDED` 关键字目前没有任何效果，
仅用于与 MySQL 兼容。`FULL` 关键字会使输出中包含排序规则、注释和权限列。

`SHOW COLUMNS` 语句会生成具有以下结构的结果表：

| Column      | Description                                                     | Type               |
| ----------- | --------------------------------------------------------------- | ------------------ |
| `field`     | 列名                                                              | `String`           |
| `type`      | 列的数据类型。如果查询是通过 MySQL wire 协议发出的，则会显示在 MySQL 中的等效类型名称。           | `String`           |
| `null`      | 如果列的数据类型是 Nullable，则为 `YES`，否则为 `NO`                            | `String`           |
| `key`       | 如果该列是主键的一部分则为 `PRI`，如果是排序键的一部分则为 `SOR`，否则为空                     | `String`           |
| `default`   | 当列类型为 `ALIAS`、`DEFAULT` 或 `MATERIALIZED` 时，为该列的默认表达式，否则为 `NULL` | `Nullable(String)` |
| `extra`     | 其他附加信息，目前未使用                                                    | `String`           |
| `collation` | （仅在指定了 `FULL` 关键字时）列的排序规则，始终为 `NULL`，因为 ClickHouse 不支持列级排序规则    | `Nullable(String)` |
| `comment`   | （仅在指定了 `FULL` 关键字时）该列的注释                                        | `String`           |
| `privilege` | （仅在指定了 `FULL` 关键字时）您在该列上拥有的权限，目前不可用                             | `String`           |

### Examples {#examples-2}

在此示例中，我们将使用 `SHOW COLUMNS` 语句获取表 &#39;orders&#39; 中所有列的信息，
从列名以 &#39;delivery&#95;&#39; 开头的列开始：

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### 另请参阅 {#see-also-2}

* [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES` 语句用于显示 [字典（Dictionaries）](../../sql-reference/dictionaries/index.md) 的列表。

### 语法 {#syntax-4}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

如果未指定 `FROM` 子句，查询将返回当前数据库中的字典列表。

你可以通过以下方式即可获得与 `SHOW DICTIONARIES` 查询相同的结果：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 示例 {#examples-3}

以下查询从 `system` 数据库的表列表中选取名称中包含 `reg` 的前两行记录。

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

显示表的主键索引和数据跳过索引（data skipping index）列表。

该语句主要是为兼容MySQL而提供。系统表 [`system.tables`](../../operations/system-tables/tables.md)（用于主键）和 [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)（用于数据跳过索引）提供了等价的信息，但以更符合 ClickHouse 原生风格的方式呈现。

### 语法 {#syntax-5}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

数据库和表名可以使用缩写形式 `<db>.<table>` 指定，即 `FROM tab FROM db` 和 `FROM db.tab` 是等价的。如果未指定数据库，查询会将当前数据库视为默认数据库。

可选关键字 `EXTENDED` 目前没有任何效果，仅为兼容 MySQL 而保留。

该语句会生成具有以下结构的结果表：

| Column          | Description                                                      | Type               |
| --------------- | ---------------------------------------------------------------- | ------------------ |
| `table`         | 表的名称。                                                            | `String`           |
| `non_unique`    | 始终为 `1`，因为 ClickHouse 不支持唯一性约束。                                  | `UInt8`            |
| `key_name`      | 索引名称，如果索引是主键索引，则为 `PRIMARY`。                                     | `String`           |
| `seq_in_index`  | 对于主键索引，为列在索引中的位置，从 `1` 开始计数。对于数据跳过索引：始终为 `1`。                    | `UInt8`            |
| `column_name`   | 对于主键索引，为该列的名称。对于数据跳过索引：为 `''`（空字符串），详见字段 &quot;expression&quot;。 | `String`           |
| `collation`     | 列在索引中的排序方式：升序为 `A`，降序为 `D`，未排序为 `NULL`。                          | `Nullable(String)` |
| `cardinality`   | 索引基数（索引中唯一值数量）的估计值。目前始终为 0。                                      | `UInt64`           |
| `sub_part`      | 始终为 `NULL`，因为 ClickHouse 不支持类似 MySQL 的索引前缀。                      | `Nullable(String)` |
| `packed`        | 始终为 `NULL`，因为 ClickHouse 不支持类似 MySQL 的打包索引。                      | `Nullable(String)` |
| `null`          | 当前未使用                                                            |                    |
| `index_type`    | 索引类型，例如 `PRIMARY`、`MINMAX`、`BLOOM_FILTER` 等。                     | `String`           |
| `comment`       | 关于索引的附加信息，目前始终为 `''`（空字符串）。                                      | `String`           |
| `index_comment` | 为 `''`（空字符串），因为在 ClickHouse 中索引不能像 MySQL 那样拥有 `COMMENT` 字段。      | `String`           |
| `visible`       | 指示该索引是否对优化器可见，始终为 `YES`。                                         | `String`           |
| `expression`    | 对于数据跳过索引，为索引表达式。对于主键索引：为 `''`（空字符串）。                             | `String`           |

### Examples {#examples-4}

在此示例中，我们使用 `SHOW INDEX` 语句获取表 `tbl` 中所有索引的信息。

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

### 另请参阅 {#see-also-3}

* [`system.tables`](../../operations/system-tables/tables.md)
* [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST {#show-processlist}

返回 [`system.processes`](/operations/system-tables/processes) 表的内容。该表包含当前正在处理的查询列表，但不包括 `SHOW PROCESSLIST` 查询。

### 语法 {#syntax-6}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` 查询会返回所有当前正在执行的查询信息。

:::tip
在控制台中执行以下命令：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```

:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` 语句用于显示某个用户所拥有的权限。

### 语法 {#syntax-7}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

如果未指定用户，查询将返回当前用户的权限。

`WITH IMPLICIT` 修饰符允许显示隐式授予的权限（例如，`GRANT SELECT ON system.one`）。

`FINAL` 修饰符会合并来自用户本身及其被授予角色（包括继承）的所有权限。

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` 语句会显示[创建用户](../../sql-reference/statements/create/user.md)时使用的参数。

### 语法 {#syntax-8}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` 语句会显示在[创建角色](../../sql-reference/statements/create/role.md)时使用的参数。

### 语法 {#syntax-9}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` 语句用于显示在[创建行策略](../../sql-reference/statements/create/row-policy.md)时使用的参数。

### 语法 {#syntax-10}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` 语句显示[创建配额](../../sql-reference/statements/create/quota.md)时所使用的参数。

### 语法 {#syntax-11}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` 语句会显示在[创建设置配置文件](../../sql-reference/statements/create/settings-profile.md)时使用的参数。

### 语法 {#syntax-12}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` 语句返回[用户账户](../../guides/sre/user-management/index.md#user-account-management)名称的列表。
要查看用户账户的参数，请参阅系统表 [`system.users`](/operations/system-tables/users)。

### 语法 {#syntax-13}

```sql title="Syntax"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` 语句返回一份 [roles](../../guides/sre/user-management/index.md#role-management) 列表。  
要查看更多相关信息，  
请参阅系统表 [`system.roles`](/operations/system-tables/roles) 和 [`system.role_grants`](/operations/system-tables/role_grants)。

### 语法 {#syntax-14}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```

## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` 语句返回[设置配置文件](../../guides/sre/user-management/index.md#settings-profiles-management)列表。
要查看用户账户参数，请参阅系统表 [`settings_profiles`](/operations/system-tables/settings_profiles)。

### 语法 {#syntax-15}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` 语句返回指定表的[行策略](../../guides/sre/user-management/index.md#row-policy-management)列表。
要查看用户账户参数，请参阅系统表 [`system.row_policies`](/operations/system-tables/row_policies)。

### 语法 {#syntax-16}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` 语句返回[配额](../../guides/sre/user-management/index.md#quotas-management)列表。
要查看配额的相关参数，请参阅系统表 [`system.quotas`](/operations/system-tables/quotas)。

### 语法 {#syntax-17}

```sql title="Syntax"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` 语句返回所有用户或当前用户的[配额](../../operations/quotas.md)使用情况。  
要查看其他参数，请参阅系统表 [`system.quotas_usage`](/operations/system-tables/quotas_usage) 和 [`system.quota_usage`](/operations/system-tables/quota_usage)。

### 语法 {#syntax-18}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```

## SHOW ACCESS {#show-access}

`SHOW ACCESS` 语句会显示所有[用户](../../guides/sre/user-management/index.md#user-account-management)、[角色](../../guides/sre/user-management/index.md#role-management)、[设置配置文件](../../guides/sre/user-management/index.md#settings-profiles-management)等，以及它们的所有[权限](../../sql-reference/statements/grant.md#privileges)。

### 语法 {#syntax-19}

```sql title="Syntax"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` 语句返回一个集群列表。
所有可用的集群都列在 [`system.clusters`](../../operations/system-tables/clusters.md) 表中。

:::note
`SHOW CLUSTER name` 查询会显示 `system.clusters` 表中指定集群名称对应的 `cluster`、`shard_num`、`replica_num`、`host_name`、`host_address` 和 `port` 信息。
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
它从 [`system.settings`](../../operations/system-tables/settings.md) 表中查询数据。

### 语法 {#syntax-21}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 子句 {#clauses}

`LIKE|ILIKE` 允许为设置名称指定匹配模式。该模式可以包含 `%` 或 `_` 等通配符。`LIKE` 子句区分大小写，`ILIKE` 子句则不区分大小写。

当使用 `CHANGED` 子句时，查询只会返回已从默认值被修改的设置。

### 示例 {#examples-6}

使用 `LIKE` 子句的查询：

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

使用 `ILIKE` 子句的查询：

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

使用包含 `CHANGED` 子句的查询：

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING` 语句返回指定设置名称对应的值。

### 语法 {#syntax-22}

```sql title="Syntax"
SHOW SETTING <name>
```

### 另请参阅 {#see-also-4}

* [`system.settings`](../../operations/system-tables/settings.md) 表

## 显示文件系统缓存 {#show-filesystem-caches}

### 示例 {#examples-7}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### 另请参阅 {#see-also-5}

* [`system.settings`](../../operations/system-tables/settings.md) 表

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` 语句会输出 [`system.table_engines`](../../operations/system-tables/table_engines.md) 表的内容，
该表包含服务器所支持的表引擎的描述及其功能支持情况。

### 语法 {#syntax-23}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 另请参阅 {#see-also-6}

* [system.table&#95;engines](../../operations/system-tables/table_engines.md) 表

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` 语句会返回 [`system.functions`](../../operations/system-tables/functions.md) 表的内容。

### 语法 {#syntax-24}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

如果指定了 `LIKE` 或 `ILIKE` 子句，查询会返回所有名称匹配给定 `<pattern>` 的系统函数列表。

### 另请参阅 {#see-also-7}

* [`system.functions`](../../operations/system-tables/functions.md) 表

## SHOW MERGES {#show-merges}

`SHOW MERGES` 语句返回合并任务的列表。
所有合并任务都列在 [`system.merges`](../../operations/system-tables/merges.md) 表中：

| Column              | Description                 |
| ------------------- | --------------------------- |
| `table`             | 表名。                         |
| `database`          | 表所属数据库的名称。                  |
| `estimate_complete` | 预计完成所需时间（秒）。                |
| `elapsed`           | 自合并开始以来已经经过的时间（秒）。          |
| `progress`          | 已完成工作的百分比（0-100）。           |
| `is_mutation`       | 如果该进程属于一次 mutation 操作，则为 1。 |
| `size_compressed`   | 已合并数据各部分的压缩数据总大小。           |
| `memory_usage`      | 合并过程的内存占用。                  |

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
