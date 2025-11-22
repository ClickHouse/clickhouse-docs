---
description: '基于 PostgreSQL 表的初始数据转储创建一个 ClickHouse 表，并启动复制过程。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'MaterializedPostgreSQL 表引擎'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL 表引擎

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
对于 ClickHouse Cloud 用户，推荐使用 [ClickPipes](/integrations/clickpipes) 将 PostgreSQL 复制到 ClickHouse。它原生支持高性能的 PostgreSQL 变更数据捕获（CDC）。
:::

创建一个 ClickHouse 表，先从 PostgreSQL 表中进行初始数据转储，然后启动复制过程。也就是说，它会在后台执行作业，将远程 PostgreSQL 数据库中该 PostgreSQL 表上的新变更持续应用到该 ClickHouse 表中。

:::note
此表引擎为实验特性。要使用它，请在配置文件中或通过 `SET` 命令将 `allow_experimental_materialized_postgresql_table` 设置为 1：

```sql
SET allow_experimental_materialized_postgresql_table=1
```

:::

如果需要使用多个表，强烈建议使用 [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) 数据库引擎来替代表引擎，并通过 `materialized_postgresql_tables_list` 设置指定要复制的表（未来还可以添加数据库 `schema`）。这样在 CPU 占用率、连接数以及远程 PostgreSQL 数据库中使用的复制槽数量方面都会更优。


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
- `user` — PostgreSQL 用户名。
- `password` — 用户密码。


## 要求 {#requirements}

1. 在 PostgreSQL 配置文件中,[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 设置必须为 `logical`,且 `max_replication_slots` 参数值至少为 `2`。

2. 使用 `MaterializedPostgreSQL` 引擎的表必须具有主键——该主键需与 PostgreSQL 表的副本标识索引(默认为主键)相同(参见[副本标识索引的详细信息](../../../engines/database-engines/materialized-postgresql.md#requirements))。

3. 仅允许使用 [Atomic](<https://en.wikipedia.org/wiki/Atomicity_(database_systems)>) 数据库。

4. `MaterializedPostgreSQL` 表引擎仅支持 PostgreSQL 11 及以上版本,因为其实现依赖 [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 函数。


## 虚拟列 {#virtual-columns}

- `_version` — 事务计数器。类型：[UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 删除标记。类型：[Int8](../../../sql-reference/data-types/int-uint.md)。可能的值：
  - `1` — 行未删除，
  - `-1` — 行已删除。

创建表时无需添加这些列。在 `SELECT` 查询中始终可以访问它们。
`_version` 列等于 `WAL` 中的 `LSN` 位置,因此可用于检查复制的实时性。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
不支持复制 [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 值。将使用数据类型的默认值。
:::
