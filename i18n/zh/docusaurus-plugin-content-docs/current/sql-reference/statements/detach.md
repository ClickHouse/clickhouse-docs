---
description: 'DETACH 文档'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'DETACH 语句'
doc_type: 'reference'
---

让服务器“忘记”某个表、物化视图、字典或数据库的存在。

**语法**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

分离操作不会删除表、物化视图、字典或数据库的数据或元数据。如果某个实体没有使用 `PERMANENTLY` 分离，则在下一次服务器启动时，服务器会读取元数据并再次加载该表/视图/字典/数据库。如果某个实体是使用 `PERMANENTLY` 分离的，则不会发生自动重新加载。

无论表、字典或数据库是否被永久分离，这两种情况下都可以使用 [ATTACH](../../sql-reference/statements/attach.md) 查询将其重新附加。
系统日志表也可以重新附加（例如 `query_log`、`text_log` 等）。其他系统表无法重新附加，但在下一次服务器启动时，服务器会再次加载这些表。

`ATTACH MATERIALIZED VIEW` 不支持简写语法（即不带 `SELECT`），但可以使用 `ATTACH TABLE` 查询来附加它。

请注意，不能对已经分离（临时分离）的表执行永久分离操作。但可以先将其重新附加，然后再执行永久分离。

另外，不能对已分离的表执行 [DROP](../../sql-reference/statements/drop.md#drop-table) 操作，不能使用 [CREATE TABLE](../../sql-reference/statements/create/table.md) 创建与已永久分离表同名的表，也不能使用 [RENAME TABLE](../../sql-reference/statements/rename.md) 查询将其替换为其他表。

`SYNC` 修饰符会同步执行该操作（无延迟）。

**示例**

创建一张表：

查询：

```sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

结果：

```text
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

分离表：

查询：

```sql
DETACH TABLE test;
SELECT * FROM test;
```

结果：

```text
Received exception from server (version 21.4.1):
Code: 60. DB::Exception: Received from localhost:9000. DB::Exception: Table default.test does not exist.
```

:::note
在 ClickHouse Cloud 中，用户应使用 `PERMANENTLY` 子句，例如 `DETACH TABLE <table> PERMANENTLY`。如果未使用该子句，表会在集群重启时（例如升级期间）自动重新附加。
:::

**另请参阅**

* [物化视图](/sql-reference/statements/create/view#materialized-view)
* [字典](../../sql-reference/dictionaries/index.md)
