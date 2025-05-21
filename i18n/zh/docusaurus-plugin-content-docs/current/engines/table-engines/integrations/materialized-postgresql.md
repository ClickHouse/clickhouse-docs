---
'description': '创建一个ClickHouse表，其中包含PostgreSQL表的初始数据转储，并启动复制过程。'
'sidebar_label': '物化视图PostgreSQL'
'sidebar_position': 130
'slug': '/engines/table-engines/integrations/materialized-postgresql'
'title': 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud 用户建议使用 [ClickPipes](/integrations/clickpipes) 将 PostgreSQL 复制到 ClickHouse。它原生支持 PostgreSQL 的高性能变更数据捕获 (CDC)。
:::

创建 ClickHouse 表，并导入 PostgreSQL 表的初始数据快照，并启动复制过程，即执行一个后台作业以应用在远程 PostgreSQL 数据库的 PostgreSQL 表上的新更改。

:::note
此表引擎为实验性。要使用它，请在配置文件中将 `allow_experimental_materialized_postgresql_table` 设置为 1，或者使用 `SET` 命令：
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

如果需要多个表，强烈建议使用 [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) 数据库引擎，而不是表引擎，并使用 `materialized_postgresql_tables_list` 设置，该设置指定要复制的表（将来也可以添加数据库 `schema`）。在 CPU 使用率、连接数和远程 PostgreSQL 数据库中的复制槽方面，它将表现得更好。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**引擎参数**

- `host:port` — PostgreSQL 服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — PostgreSQL 用户。
- `password` — 用户密码。

## 要求 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 设置必须值为 `logical`，并且 PostgreSQL 配置文件中的 `max_replication_slots` 参数必须至少为 `2`。

2. 使用 `MaterializedPostgreSQL` 引擎的表必须具有主键——与 PostgreSQL 表的副本身份索引（默认: 主键）相同（参见 [副本身份索引的详细信息](../../../engines/database-engines/materialized-postgresql.md#requirements)）。

3. 只允许使用数据库 [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems))。

4. `MaterializedPostgreSQL` 表引擎仅适用于 PostgreSQL 版本 >= 11，因为该实现需要 [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 函数。

## 虚拟列 {#virtual-columns}

- `_version` — 事务计数器。类型: [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 删除标记。类型: [Int8](../../../sql-reference/data-types/int-uint.md)。可能的值：
    - `1` — 行未被删除，
    - `-1` — 行已被删除。

创建表时不需要添加这些列。它们在 `SELECT` 查询中始终可访问。
`_version` 列等于 `WAL` 中的 `LSN` 位置，因此可以用于检查复制的实时性。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
不支持 [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 值的复制。将使用数据类型的默认值。
:::
