import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud 用户推荐使用 [ClickPipes](/integrations/clickpipes) 进行 PostgreSQL 到 ClickHouse 的复制。这原生支持高性能的变更数据捕获（CDC）用于 PostgreSQL。
:::

创建一个 ClickHouse 数据库，包含来自 PostgreSQL 数据库的表。首先，`MaterializedPostgreSQL` 引擎会创建 PostgreSQL 数据库的快照并加载所需的表。所需的表可以包括指定数据库中任意模式的任何子集的表。快照数据库引擎会获取 LSN，并在初始表转储完成后，开始从 WAL 中拉取更新。在数据库创建后，新添加到 PostgreSQL 数据库的表不会自动添加到复制中。它们必须通过 `ATTACH TABLE db.table` 查询手动添加。

复制是通过 PostgreSQL 逻辑复制协议实现的，该协议不允许复制 DDL，但允许知道是否发生了破坏性更改（列类型更改、添加/删除列）。此类更改会被检测到，并且相应的表将停止接收更新。在这种情况下，您应该使用 `ATTACH` / `DETACH PERMANENTLY` 查询来完全重新加载表。如果 DDL 不会破坏复制（例如，重命名列），则表仍会接收更新（插入按位置完成）。

:::note
此数据库引擎为实验性。要使用它，请在配置文件中将 `allow_experimental_database_materialized_postgresql` 设置为 1，或者使用 `SET` 命令：
```sql
SET allow_experimental_database_materialized_postgresql=1
```
:::

## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**引擎参数**

- `host:port` — PostgreSQL 服务器端点。
- `database` — PostgreSQL 数据库名称。
- `user` — PostgreSQL 用户。
- `password` — 用户密码。

## 使用示例 {#example-of-use}

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```

## 动态添加新表到复制中 {#dynamically-adding-table-to-replication}

创建 `MaterializedPostgreSQL` 数据库后，它不会自动检测相应 PostgreSQL 数据库中的新表。这些表可以手动添加：

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
在 22.1 版本之前，添加表到复制中会留下一个未删除的临时复制槽（命名为 `{db_name}_ch_replication_slot_tmp`）。如果在 ClickHouse 22.1 之前的版本中附加表，请确保手动删除它（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。否则磁盘使用将会增加。此问题在 22.1 中已修复。
:::

## 动态从复制中移除表 {#dynamically-removing-table-from-replication}

可以从复制中移除特定的表：

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQL 架构 {#schema}

PostgreSQL [架构](https://www.postgresql.org/docs/9.1/ddl-schemas.html) 可以通过 3 种方式配置（从版本 21.12 开始）。

1. 每个 `MaterializedPostgreSQL` 数据库引擎一个架构。需要使用设置 `materialized_postgresql_schema`。
表通过表名访问：

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 对于一个 `MaterializedPostgreSQL` 数据库引擎，任何数量的架构可以与指定的表集一起使用。需要使用设置 `materialized_postgresql_tables_list`。每个表与其架构一起书写。
表通过架构名和表名同时访问：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

但在这种情况下，`materialized_postgresql_tables_list` 中的所有表必须写上其架构名。
需要 `materialized_postgresql_tables_list_with_schema = 1`。

警告：在此情况下，表名中不允许有点号。

3. 对于一个 `MaterializedPostgreSQL` 数据库引擎，任何数量的架构可以与完整的表集一起使用。需要使用设置 `materialized_postgresql_schema_list`。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告：在此情况下，表名中不允许有点号。

## 必要条件 {#requirements}

1. PostgreSQL 配置文件中的 [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 设置必须为 `logical`，并且 `max_replication_slots` 参数必须至少为 `2`。

2. 每个被复制的表必须具有以下 [副本标识](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) 之一：

- 主键（默认）

- 索引

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

始终首先检查主键。如果不存在，则检查定义为副本标识索引的索引。
如果索引用作副本标识，则表中必须只有一个这样的索引。
您可以通过以下命令检查特定表使用的类型：

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
不支持[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 值的复制。将使用数据类型的默认值。
:::

## 设置 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    设置要通过 [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md) 数据库引擎复制的 PostgreSQL 数据库表的逗号分隔列表。

    每个表可以在括号中包含被复制列的子集。如果省略列的子集，则将复制表中的所有列。

```sql
materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
```

    默认值：空列表 — 意味着整个 PostgreSQL 数据库将被复制。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    默认值：空字符串。 （使用默认架构）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    默认值：空列表。 （使用默认架构）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    设置在将数据刷新到 PostgreSQL 数据库表中之前在内存中收集的行数。

    可能的值：

    - 正整数。

    默认值：`65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    用户创建的复制槽。必须与 `materialized_postgresql_snapshot` 一起使用。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    标识快照的文本字符串，将从中执行[PostgreSQL 表的初始转储](../../engines/database-engines/materialized-postgresql.md)。必须与 `materialized_postgresql_replication_slot` 一起使用。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

SELECT * FROM database1.table1;
```

    可以在必要时使用 DDL 查询更改这些设置。但无法更改设置 `materialized_postgresql_tables_list`。要更新此设置中的表列表，请使用 `ATTACH TABLE` 查询。

```sql
ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

为复制使用唯一的复制消费者标识符。默认值：`0`。
如果设置为 `1`，允许设置多个 `MaterializedPostgreSQL` 表指向同一个 `PostgreSQL` 表。

## 注意事项 {#notes}

### 逻辑复制槽的故障转移 {#logical-replication-slot-failover}

存在于主服务器上的逻辑复制槽在备用副本上不可用。
因此，如果发生故障转移，新的主服务器（原物理备用）将不知道任何与旧主服务器存在的槽。这将导致 PostgreSQL 的复制中断。
解决方案是自行管理复制槽并定义一个永久复制槽（一些信息可以在 [这里](https://patroni.readthedocs.io/en/latest/SETTINGS.html) 找到）。您需要通过 `materialized_postgresql_replication_slot` 设置传递槽名称，并必须使用 `EXPORT SNAPSHOT` 选项进行导出。快照标识符需要通过 `materialized_postgresql_snapshot` 设置传递。

请注意，只有在实际需要时才应使用此功能。如果没有真正的需要或者不完全理解原因，则最好允许表引擎自己创建和管理其复制槽。

**示例（来自 [@bchrobot](https://github.com/bchrobot)）**

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

2. 等待复制槽准备好，然后开始事务并导出事务快照标识符：

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

4. 一旦确认向 ClickHouse 数据库的复制完成，结束 PostgreSQL 事务。验证在故障转移后复制是否继续：

```bash
kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
```

### 所需权限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) -- 创建查询权限。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) -- 复制权限。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) -- 复制权限或超级用户。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) -- 发布的所有者（`MaterializedPostgreSQL` 引擎本身中的 `username`）。

可以避免执行 `2` 和 `3` 这两个命令并拥有这些权限。使用设置 `materialized_postgresql_replication_slot` 和 `materialized_postgresql_snapshot`。但要非常小心。

访问表：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
