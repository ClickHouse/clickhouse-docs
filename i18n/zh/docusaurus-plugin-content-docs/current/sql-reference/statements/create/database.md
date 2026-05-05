---
description: 'CREATE DATABASE 语句的文档'
sidebar_label: 'DATABASE'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---

# CREATE DATABASE \{#create-database\}

创建新数据库。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [SETTINGS ...] [COMMENT 'Comment']
```


## 子句 \{#clauses\}

### IF NOT EXISTS \{#if-not-exists\}

如果 `db_name` 数据库已经存在，则 ClickHouse 不会创建新的数据库，并且：

* 如果指定了该子句，则不会抛出异常。
* 如果未指定该子句，则会抛出异常。

### ON CLUSTER \{#on-cluster\}

ClickHouse 会在指定集群的所有服务器上创建 `db_name` 数据库。更多详情参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md) 一文。

### ENGINE \{#engine\}

默认情况下，ClickHouse 使用其自带的 [Atomic](../../../engines/database-engines/atomic.md) 数据库引擎。还可以使用 [MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md)。

### COMMENT \{#comment\}

在创建数据库时，可以为其添加注释。

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


### SETTINGS \{#settings\}

#### lazy_load_tables \{#lazy-load-tables\}

启用后，数据库启动时不会完全加载所有表。取而代之的是，为每个表创建一个轻量级代理，并在首次访问时才加载并初始化实际的表引擎。对于包含大量表且只对其中一部分进行频繁查询的数据库，这可以减少启动时间和内存占用。

```sql
CREATE DATABASE db_name ENGINE = Atomic SETTINGS lazy_load_tables = 1;
```

适用于将表元数据存储在磁盘上的数据库引擎（例如 `Atomic`、`Ordinary`）。`VIEW`、materialized view、dictionaries，以及基于 table function 的表始终会被立即加载，与此设置无关。

**适用场景：** 此设置适用于包含大量表（数百或数千个）且只有一部分表会被实际查询的数据库。它通过将表引擎对象的创建、数据分区片段的扫描以及后台线程的初始化推迟到首次访问时执行，从而减少服务器启动时间和内存使用。

**对 `system.tables` 的影响：**

* 在访问表之前，`system.tables` 会将其引擎显示为 `TableProxy`。首次访问后，会显示真实的引擎名称（例如 `MergeTree`）。
* 对于尚未加载的表，由于实际存储尚未创建，`total_rows` 和 `total_bytes` 等列会返回 `NULL`。

**与 DDL 操作的交互：**

* `SELECT`、`INSERT`、`ALTER`、`DROP` 会在首次使用时透明地触发真实表引擎的加载。
* `RENAME TABLE` 可以在不触发加载的情况下执行。
* 一旦表被加载，在整个服务器进程生命周期内都会保持加载状态。

**限制：**

* 依赖 `system.tables` 元数据（例如 `total_rows`、`engine`）的监控工具，对于未加载的表可能会看到不完整的信息。
* 针对尚未加载的表的第一次查询会产生一次性的加载开销（解析已存储的 `CREATE TABLE` 语句并初始化引擎）。

默认值：`0`（禁用）。
