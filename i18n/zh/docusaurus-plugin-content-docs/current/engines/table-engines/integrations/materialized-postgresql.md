---
description: '创建一个包含 PostgreSQL 表初始数据转储的 ClickHouse 表，并启动数据复制进程。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'MaterializedPostgreSQL 表引擎'
doc_type: '指南'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MaterializedPostgreSQL 表引擎 \{#materializedpostgresql-table-engine\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
对于 ClickHouse Cloud 用户，推荐使用 [ClickPipes](/integrations/clickpipes) 将 PostgreSQL 数据复制到 ClickHouse。它原生支持高性能的 PostgreSQL CDC（变更数据捕获）。
:::

创建一个 ClickHouse 表，对 PostgreSQL 表进行初始数据转储，并启动复制过程，即在后台执行作业，将远程 PostgreSQL 数据库中该 PostgreSQL 表上发生的新变更实时应用到该表中。

:::note
此表引擎为实验特性。要使用它，请在配置文件中将 `allow_experimental_materialized_postgresql_table` 设置为 1，或通过 `SET` 命令进行设置：

```sql
SET allow_experimental_materialized_postgresql_table=1
```

:::

如果需要使用多个表，强烈建议使用 [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) 数据库引擎而不是表引擎，并通过 `materialized_postgresql_tables_list` 设置来指定要复制的表（后续也可以添加数据库 `schema`）。在 CPU 占用、连接数以及远程 PostgreSQL 数据库中所占用的复制槽数量方面，这种方式都会更优。

## 创建表 \{#creating-a-table\}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**引擎参数**

* `host:port` — PostgreSQL 服务器地址。
* `database` — 远程数据库名。
* `table` — 远程表名。
* `user` — PostgreSQL 用户。
* `password` — 用户密码。

## 要求 \{#requirements\}

1. 在 PostgreSQL 配置文件中，[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 设置必须为 `logical`，并且 `max_replication_slots` 参数的值至少为 `2`。

2. 使用 `MaterializedPostgreSQL` 引擎的表必须具有主键，且该主键必须与 PostgreSQL 表的副本标识索引（默认：主键）相同（参见[副本标识索引的详细信息](../../../engines/database-engines/materialized-postgresql.md#requirements)）。

3. 仅允许使用 [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) 数据库。

4. 由于实现依赖于 PostgreSQL 的 [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) 函数，`MaterializedPostgreSQL` 表引擎仅适用于 PostgreSQL 版本 >= 11。

## 虚拟列 \{#virtual-columns\}

* `_version` — 事务计数器。类型：[UInt64](../../../sql-reference/data-types/int-uint.md)。

* `_sign` — 删除标记。类型：[Int8](../../../sql-reference/data-types/int-uint.md)。可能的取值：
  * `1` — 行未被删除，
  * `-1` — 行已被删除。

在创建表时不需要显式添加这些列。它们在 `SELECT` 查询中始终可用。
`_version` 列等于 `WAL` 中的 `LSN` 位置，因此可用于检查复制的同步进度。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
不支持对 [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 值进行复制。将使用该数据类型的默认值。
:::
