
# CREATE DATABASE

创建一个新数据库。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## Clauses {#clauses}

### IF NOT EXISTS {#if-not-exists}

如果 `db_name` 数据库已经存在，那么 ClickHouse 将不会创建一个新数据库，并且：

- 如果指定了该子句，则不会抛出异常。
- 如果未指定该子句，则会抛出异常。

### ON CLUSTER {#on-cluster}

ClickHouse 会在指定集群的所有服务器上创建 `db_name` 数据库。更多详细信息请参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md) 文章。

### ENGINE {#engine}

默认情况下，ClickHouse 使用其自己的 [Atomic](../../../engines/database-engines/atomic.md) 数据库引擎。还有 [Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md)。

### COMMENT {#comment}

在创建数据库时，可以添加注释。

所有数据库引擎都支持注释。

**Syntax**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**Example**

查询：

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT 'The temporary database';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

结果：

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ The temporary database │
└────────────┴────────────────────────┘
```
