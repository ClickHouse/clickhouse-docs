---
slug: /engines/database-engines/materialized-postgresql
sidebar_label: '物化PostgreSQL'
sidebar_position: 60
title: '物化PostgreSQL'
description: '创建一个ClickHouse数据库，包含来自PostgreSQL数据库的表。'
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 物化PostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
建议ClickHouse Cloud用户使用[ClickPipes](/integrations/clickpipes)进行PostgreSQL到ClickHouse的复制。这原生支持PostgreSQL的高性能变更数据捕获（CDC）。
:::

创建一个ClickHouse数据库，包含来自PostgreSQL数据库的表。首先，使用引擎`MaterializedPostgreSQL`的数据库创建PostgreSQL数据库的快照并加载所需的表。所需的表可以包含指定数据库的任何模式中的任何表的子集。通过快照，数据库引擎获取LSN，一旦初始表的转储完成，就开始从WAL中提取更新。创建数据库后，新添加到PostgreSQL数据库的表不会自动添加到复制中。必须使用`ATTACH TABLE db.table`查询手动添加。

复制使用PostgreSQL逻辑复制协议实现，该协议不允许复制DDL，但允许检测是否发生了破坏复制的更改（列类型更改、添加/删除列）。此类更改被检测到，相应的表停止接收更新。在这种情况下，您应该使用`ATTACH`/`DETACH PERMANENTLY`查询来完全重新加载表。如果DDL没有破坏复制（例如，重命名列），表仍将接收更新（插入是按位置进行的）。

:::note
该数据库引擎是实验性的。要使用它，请在配置文件中或通过使用`SET`命令将`allow_experimental_database_materialized_postgresql`设置为1：
```sql
SET allow_experimental_database_materialized_postgresql=1
```
:::

## 创建数据库 {#creating-a-database}

``` sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**引擎参数**

- `host:port` — PostgreSQL服务器端点。
- `database` — PostgreSQL数据库名称。
- `user` — PostgreSQL用户。
- `password` — 用户密码。

## 使用示例 {#example-of-use}

``` sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```

## 动态添加新表到复制 {#dynamically-adding-table-to-replication}

在创建`MaterializedPostgreSQL`数据库后，它不会自动检测到相应PostgreSQL数据库中的新表。这些表可以手动添加：

``` sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
在22.1版本之前，将表添加到复制中会留下未删除的临时复制槽（命名为`{db_name}_ch_replication_slot_tmp`）。如果在ClickHouse 22.1之前的版本中附加表，请确保手动删除它（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。否则，磁盘使用量将增加。此问题已在22.1中修复。
:::

## 动态从复制中移除表 {#dynamically-removing-table-from-replication}

可以从复制中移除特定表：

``` sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQL模式 {#schema}

PostgreSQL [模式](https://www.postgresql.org/docs/9.1/ddl-schemas.html)可以通过三种方式进行配置（从21.12版本开始）。

1. 一个模式对应一个`MaterializedPostgreSQL`数据库引擎。需要使用设置`materialized_postgresql_schema`。
通过仅使用表名访问表：

``` sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 任何数量的模式和指定表的集合对应一个`MaterializedPostgreSQL`数据库引擎。需要使用设置`materialized_postgresql_tables_list`。每个表都应与其模式一起书写。
通过模式名和表名同时访问表：

``` sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

但在这种情况下，`materialized_postgresql_tables_list`中的所有表必须写为其模式名。
需要`materialized_postgresql_tables_list_with_schema = 1`。

警告：在这种情况下，不允许在表名中使用点。

3. 任何数量的模式和完整的表集对应一个`MaterializedPostgreSQL`数据库引擎。需要使用设置`materialized_postgresql_schema_list`。

``` sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告：在这种情况下，不允许在表名中使用点。

## 要求 {#requirements}

1. PostgreSQL配置文件中的[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)设置必须为`logical`，并且`max_replication_slots`参数的值至少为`2`。

2. 每个被复制的表必须有以下之一的[副本身份](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY)：

- 主键（默认）

- 索引

``` bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

主键始终首先进行检查。如果不存在，则检查定义为副本身份索引的索引。
如果索引用作副本身份，则表中只能有一个这样的索引。
您可以使用以下命令检查特定表使用的是哪种类型：

``` bash
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
不支持[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html)值的复制。将使用数据类型的默认值。
:::

## 设置 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    设置要通过[MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md)数据库引擎复制的PostgreSQL数据库表的以逗号分隔的列表。

    每个表可以在括号中具有复制列的子集。如果省略列的子集，则将复制该表的所有列。

    ``` sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    默认值：空列表——意味着将复制整个PostgreSQL数据库。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    默认值：空字符串。（使用默认模式）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    默认值：空列表。（使用默认模式）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    设置在将数据刷新到PostgreSQL数据库表之前，在内存中收集的行数。

    可能的值：

    - 正整数。

    默认值：`65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    用户创建的复制槽。必须与`materialized_postgresql_snapshot`一起使用。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    标识快照的文本字符串，从该快照将执行[初始PostgreSQL表的转储](../../engines/database-engines/materialized-postgresql.md)。必须与`materialized_postgresql_replication_slot`一起使用。

    ``` sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    如果需要，可以使用DDL查询更改设置。但是不可能更改设置`materialized_postgresql_tables_list`。要更新该设置中的表列表，请使用`ATTACH TABLE`查询。

    ``` sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

为复制使用唯一的复制消费者标识符。默认值：`0`。
如果设置为`1`，则允许设置多个指向相同`PostgreSQL`表的`MaterializedPostgreSQL`表。

## 注意事项 {#notes}

### 逻辑复制槽的故障转移 {#logical-replication-slot-failover}

存在于主服务器上的逻辑复制槽在备用副本上不可用。
因此，如果发生故障转移，新主（旧的物理备用）将不知道旧主所存在的任何槽。这将导致从PostgreSQL到ClickHouse的复制中断。
解决此问题的方法是自己管理复制槽并定义一个永久复制槽（一些信息可以在[这里](https://patroni.readthedocs.io/en/latest/SETTINGS.html)找到）。您需要通过`materialized_postgresql_replication_slot`设置传递槽名称，并且必须使用`EXPORT SNAPSHOT`选项导出。快照标识符需要通过`materialized_postgresql_snapshot`设置传递。

请注意，这仅在实际需要时使用。如果没有真正的需求或完全理解原因，则最好允许表引擎创建和管理自己的复制槽。

**示例（来自 [@bchrobot](https://github.com/bchrobot)）**

1. 在PostgreSQL中配置复制槽。

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

2. 等待复制槽准备就绪，然后开始一个事务并导出事务快照标识符：

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. 在ClickHouse创建数据库：

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. 一旦确认到ClickHouse数据库的复制后，结束PostgreSQL事务。验证复制在故障转移后继续：

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 所需权限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — 创建查询权限。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — 复制权限。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — 复制权限或超级用户。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — 该发布的所有者（在MaterializedPostgreSQL引擎中为`username`）。

可以避免执行2和3命令并拥有那些权限。使用设置`materialized_postgresql_replication_slot`和`materialized_postgresql_snapshot`。但是需谨慎。

访问表：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
