---
description: '基于 PostgreSQL 数据库中的表创建一个 ClickHouse 数据库。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
建议 ClickHouse Cloud 用户使用 [ClickPipes](/integrations/clickpipes) 实现 PostgreSQL 到 ClickHouse 的复制。ClickPipes 原生支持 PostgreSQL 的高性能 CDC（变更数据捕获）。
:::

基于 PostgreSQL 数据库中的表创建一个 ClickHouse 数据库。首先，使用 `MaterializedPostgreSQL` 引擎的数据库会创建 PostgreSQL 数据库的快照并加载所需的表。所需的表可以是指定数据库中任意 schema 下的任意表子集。在创建快照的同时，数据库引擎会获取 LSN，并在完成对这些表的初始导出后开始从 WAL 拉取更新。数据库创建完成后，新添加到 PostgreSQL 数据库的表不会自动加入复制，需要通过执行 `ATTACH TABLE db.table` 查询手动添加。

复制是通过 PostgreSQL 逻辑复制协议实现的。该协议不支持复制 DDL，但可以检测是否发生了破坏复制的变更（列类型变化、增加/删除列）。一旦检测到此类变更，相应的表将停止接收更新。在这种情况下，您应使用 `ATTACH` / `DETACH PERMANENTLY` 查询来对该表进行完整重载。如果 DDL 不会破坏复制（例如重命名列），该表仍将继续接收更新（插入是按位置完成的）。

:::note
此数据库引擎为实验性功能。要使用它，请在配置文件中或通过 `SET` 命令将 `allow_experimental_database_materialized_postgresql` 设置为 1：

```sql
SET allow_experimental_database_materialized_postgresql=1
```

:::


## 创建数据库

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**引擎参数**

* `host:port` — PostgreSQL 服务器地址（主机:端口）。
* `database` — PostgreSQL 数据库名。
* `user` — PostgreSQL 用户名。
* `password` — 用户密码。


## 使用示例

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```


## 动态向复制中添加新表

创建 `MaterializedPostgreSQL` 数据库后，它不会自动检测对应 PostgreSQL 数据库中的新表。可以手动添加这类表：

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
在 22.1 之前的版本中，将表加入复制后会留下一个不会自动删除的临时复制槽（名称为 `{db_name}_ch_replication_slot_tmp`）。如果在 22.1 之前的 ClickHouse 版本中执行表的 ATTACH 操作，请务必手动删除该复制槽（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`），否则磁盘使用量会不断增长。该问题已在 22.1 中修复。
:::


## 动态移除复制中的表

可以将特定的表从复制中移除：

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```


## PostgreSQL 模式

从 21.12 版本开始，PostgreSQL 的[模式（schema）](https://www.postgresql.org/docs/9.1/ddl-schemas.html)可以通过 3 种方式进行配置。

1. 每个 `MaterializedPostgreSQL` 数据库引擎对应一个模式。需要使用设置项 `materialized_postgresql_schema`。
   表只能通过表名进行访问：

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 对于一个 `MaterializedPostgreSQL` 数据库引擎，可以使用任意数量的 schema，并为每个 schema 指定一组表。需要设置参数 `materialized_postgresql_tables_list`。每个表都会连同其 schema 一起写入。
   访问表时需要同时指定 schema 名称和表名称：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

在这种情况下，`materialized_postgresql_tables_list` 中的所有表都必须带上其 schema 名称。
需要设置 `materialized_postgresql_tables_list_with_schema = 1`。

警告：在这种情况下，表名中不允许包含点号。

3. 对于一个 `MaterializedPostgreSQL` 数据库引擎，可以包含任意数量的 schema，每个 schema 都包含完整的表集合。需要使用设置 `materialized_postgresql_schema_list`。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告：在这种情况下，表名中不允许包含点号。


## 要求

1. 在 PostgreSQL 配置文件中，必须将 [wal&#95;level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 参数设置为 `logical`，并且将 `max_replication_slots` 参数设置为至少 `2`。

2. 每个参与复制的表必须具有以下 [replica identity](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) 之一：

* 主键（默认）

* 索引

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

系统总是先检查主键。如果主键不存在，则会检查被定义为复制标识索引的索引。
如果某个索引被用作复制标识，那么在一张表中只能有一个这样的索引。
你可以使用以下命令检查某个特定表使用的复制标识类型：

```bash
postgres# SELECT CASE relreplident
          WHEN 'd' THEN 'default'
          WHEN 'n' THEN 'nothing'
          WHEN 'f' THEN 'full'
          WHEN 'i' THEN 'index'
       END AS replica_identity
FROM pg_class
WHERE oid = 'postgres_table'::regclass;
```

:::note
不支持复制 [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 值。将会使用该数据类型的默认值。
:::


## 设置

### `materialized_postgresql_tables_list`

设置一个以逗号分隔的 PostgreSQL 数据库表列表，这些表将通过 [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md) 数据库引擎进行复制。

每个表可以在方括号中指定要复制的列子集。如果省略列子集，则会复制该表的所有列。

```sql
materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
```

默认值：空列表 —— 表示将复制整个 PostgreSQL 数据库。

### `materialized_postgresql_schema`

默认值：空字符串。（使用默认 schema）

### `materialized_postgresql_schema_list`

默认值：空列表。（使用默认 schema）

### `materialized_postgresql_max_block_size`

设置在将数据刷新到 PostgreSQL 数据库表之前，先在内存中累积的行数。

可选值：

* 正整数。

默认值：`65536`。

### `materialized_postgresql_replication_slot`

由用户创建的 replication slot。必须与 `materialized_postgresql_snapshot` 一起使用。

### `materialized_postgresql_snapshot`

用于标识快照的文本字符串，将基于该快照执行 [PostgreSQL 表的初始导出](../../engines/database-engines/materialized-postgresql.md)。必须与 `materialized_postgresql_replication_slot` 一起使用。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

SELECT * FROM database1.table1;
```

如有需要，可以通过 DDL 查询修改这些设置。但无法更改 `materialized_postgresql_tables_list` 这一设置。要更新该设置中的表列表，请使用 `ATTACH TABLE` 查询。

```sql
ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <新大小>;
```

### `materialized_postgresql_use_unique_replication_consumer_identifier`

使用唯一的复制消费者标识符进行复制。默认值：`0`。
如果设置为 `1`，则允许创建多个指向同一 `PostgreSQL` 表的 `MaterializedPostgreSQL` 表。


## 注意事项 {#notes}

### 逻辑复制槽的故障切换 {#logical-replication-slot-failover}

主库上存在的逻辑复制槽在备用副本上不可用。
因此，如果发生故障切换，新的主库（原来的物理备用节点）将不了解旧主库上存在的任何槽。这会导致来自 PostgreSQL 的复制中断。
一种解决方案是自行管理复制槽，并定义一个永久复制槽（相关信息可在[此处](https://patroni.readthedocs.io/en/latest/SETTINGS.html)找到）。需要通过 `materialized_postgresql_replication_slot` 设置传递槽名称，并且该槽必须使用 `EXPORT SNAPSHOT` 选项导出。快照标识符需要通过 `materialized_postgresql_snapshot` 设置传递。

请注意，仅在确有需要时才应使用此方案。如果没有明确的需求或对原因缺乏充分理解，那么最好允许表引擎自行创建并管理它自己的复制槽。

**示例（来自 [@bchrobot](https://github.com/bchrobot))**

1. 在 PostgreSQL 中配置复制槽。

    ```yaml
    apiVersion: "acid.zalan.do/v1"
    kind: postgresql
    metadata:
      name: acid-demo-cluster
    spec:
      numberOfInstances: 2
      postgresql:
        parameters:
          wal_level: logical
      patroni:
        slots:
          clickhouse_sync:
            type: logical
            database: demodb
            plugin: pgoutput
    ```

2. 等待复制槽就绪，然后开启一个事务并导出事务快照标识符：

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. 在 ClickHouse 中创建数据库：

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. 一旦确认已成功复制到 ClickHouse 数据库后，结束 PostgreSQL 事务。验证在故障切换后复制是否能够继续进行：

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 所需权限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) —— 执行 CREATE PUBLICATION 语句的权限。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) —— 复制权限。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) —— 复制权限或超级用户权限。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) —— 发布的所有者（即 MaterializedPostgreSQL 引擎中的 `username`）。

可以不执行命令 `2` 和 `3`，也无需具备相应权限，而是改为使用 `materialized_postgresql_replication_slot` 和 `materialized_postgresql_snapshot` 设置。但必须格外谨慎。

对下列表的访问权限：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
