---
slug: /sql-reference/statements/detach
sidebar_position: 43
sidebar_label: DETACH
title: 'DETACH 语句'
---

使服务器“忘记”一个表、物化视图、字典或数据库的存在。

**语法**

``` sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

分离不会删除表、物化视图、字典或数据库的数据或元数据。如果一个实体不是在 `PERMANENTLY` 状态下被分离，下次服务器启动时，服务器将读取元数据并重新调用表/视图/字典/数据库。如果一个实体是以 `PERMANENTLY` 状态被分离的，则不会有自动调用。

不论一个表、字典或数据库是否被永久分离，都可以使用 [ATTACH](../../sql-reference/statements/attach.md) 查询重新附加它们。系统日志表也可以重新附加（例如 `query_log`、`text_log` 等）。其他系统表无法重新附加。在下次服务器启动时，服务器将重新调用这些表。

`ATTACH MATERIALIZED VIEW` 不支持简写（不带 `SELECT`），但您可以使用 `ATTACH TABLE` 查询附加它。

请注意，您不能对已经分离（临时）的表进行永久分离。但您可以重新附加它，然后再次永久分离。

此外，您不能 [DROP](../../sql-reference/statements/drop.md#drop-table) 被分离的表，也不能 [CREATE TABLE](../../sql-reference/statements/create/table.md) 创建一个与永久分离的表同名的表，或使用 [RENAME TABLE](../../sql-reference/statements/rename.md) 查询用其他表替换它。

`SYNC` 修饰符会立即执行该操作。

**示例**

创建一个表：

查询：

``` sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

结果：

``` text
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

``` sql
DETACH TABLE test;
SELECT * FROM test;
```

结果：

``` text
Received exception from server (version 21.4.1):
Code: 60. DB::Exception: Received from localhost:9000. DB::Exception: Table default.test does not exist.
```

:::note
在 ClickHouse Cloud 中，用户应该使用 `PERMANENTLY` 子句，例如 `DETACH TABLE <table> PERMANENTLY`。如果不使用此子句，表将在集群重启时例如在升级期间被重新附加。
:::

**另请参阅**

- [物化视图](/sql-reference/statements/create/view#materialized-view)
- [字典](../../sql-reference/dictionaries/index.md)
