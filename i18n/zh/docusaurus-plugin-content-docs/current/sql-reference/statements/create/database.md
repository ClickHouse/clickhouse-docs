---
'description': 'CREATE DATABASE 的文档'
'sidebar_label': 'DATABASE'
'sidebar_position': 35
'slug': '/sql-reference/statements/create/database'
'title': 'CREATE DATABASE'
'doc_type': 'reference'
---


# 创建数据库

创建一个新的数据库。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## 子句 {#clauses}

### 如果不存在 {#if-not-exists}

如果 `db_name` 数据库已经存在，则 ClickHouse 不会创建新的数据库，并且：

- 如果指定了子句，则不会抛出异常。
- 如果未指定子句，则会抛出异常。

### 在集群上 {#on-cluster}

ClickHouse 在指定集群的所有服务器上创建 `db_name` 数据库。更多详细信息请参阅 [分布式 DDL](../../../sql-reference/distributed-ddl.md) 文章。

### 引擎 {#engine}

默认情况下，ClickHouse 使用其自己的 [Atomic](../../../engines/database-engines/atomic.md) 数据库引擎。还提供 [Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md) 等引擎。

### 注释 {#comment}

创建数据库时可以添加注释。

所有数据库引擎都支持注释。

**语法**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**示例**

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
