---
'description': '创建一个ClickHouse表，并从PostgreSQL表导入初始数据转储，开始复制过程。'
'sidebar_label': '物化的PostgreSQL'
'sidebar_position': 130
'slug': '/engines/table-engines/integrations/materialized-postgresql'
'title': '物化的PostgreSQL'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
推荐 ClickHouse Cloud 用户使用 [ClickPipes](/integrations/clickpipes) 进行 PostgreSQL 到 ClickHouse 的复制。它原生支持 PostgreSQL 的高性能变更数据捕获 (CDC)。
:::

创建 ClickHouse 表，并将 PostgreSQL 表的初始数据转储到其中，并启动复制过程，即执行后台作业以根据远程 PostgreSQL 数据库中 PostgreSQL 表发生的新更改来应用这些更改。

:::note
此表引擎属于实验性。要使用它，请在配置文件中将 `allow_experimental_materialized_postgresql_table` 设置为 1，或使用 `SET` 命令：
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

如果需要多个表，强烈建议使用 [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) 数据库引擎，而不是表引擎，并使用 `materialized_postgresql_tables_list` 设置，该设置指定要复制的表（也可以添加数据库 `schema`）。这在 CPU 使用率、连接数和远程 PostgreSQL 数据库中的复制槽数方面都会更好。

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

## 需求 {#requirements}

1. PostgreSQL 配置文件中的 [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 设置必须具有 `logical` 值，且 `max_replication_slots` 参数的值必须至少为 `2`。

2. `MaterializedPostgreSQL` 引擎的表必须具有主键 — 与 PostgreSQL 表的副本身份索引相同（默认：主键）（请参见 [副本身份索引的详细信息](../../../engines/database-engines/materialized-postgresql.md#requirements)）。

3. 只允许使用数据库 [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems))。

4. `MaterializedPostgreSQL` 表引擎仅适用于版本 >= 11 的 PostgreSQL，因为实现需要 [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 函数。

## 虚拟列 {#virtual-columns}

- `_version` — 事务计数器。类型: [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 删除标记。类型: [Int8](../../../sql-reference/data-types/int-uint.md)。可能的值：
  - `1` — 行未被删除，
  - `-1` — 行已被删除。

在创建表时，这些列不需要添加。它们在 `SELECT` 查询中始终可访问。
`_version` 列等于 `WAL` 中的 `LSN` 位置，所以可以用来检查复制的最新情况。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
不支持 [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 值的复制。将使用该数据类型的默认值。
:::
