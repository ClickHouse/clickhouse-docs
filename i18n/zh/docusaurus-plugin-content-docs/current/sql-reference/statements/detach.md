---
description: 'DETACH 语句文档'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'DETACH 语句'
doc_type: 'reference'
---

使服务器“忘记”某个表、物化视图、字典或数据库的存在。

**语法**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

分离操作不会删除表、物化视图、字典或数据库的数据或元数据。如果某个实体未使用 `PERMANENTLY` 进行分离，那么在下次服务器启动时，服务器会读取元数据并再次加载该表/视图/字典/数据库。如果某个实体是使用 `PERMANENTLY` 分离的，则不会自动恢复。

无论表、字典或数据库是否被永久分离，在这两种情况下，你都可以使用 [ATTACH](../../sql-reference/statements/attach.md) 查询将它们重新附加。
系统日志表也可以被重新附加（例如 `query_log`、`text_log` 等）。其他系统表不能被重新附加。在下次服务器启动时，服务器会再次加载这些表。

`ATTACH MATERIALIZED VIEW` 不支持简写语法（不带 `SELECT`），但你可以使用 `ATTACH TABLE` 查询来附加它。

请注意，你不能对已经被分离（临时）的表再执行永久分离操作。但你可以先将其重新附加，然后再执行永久分离。

此外，你不能 [DROP](../../sql-reference/statements/drop.md#drop-table) 已分离的表，或使用与已永久分离表相同的名称执行 [CREATE TABLE](../../sql-reference/statements/create/table.md)，也不能使用 [RENAME TABLE](../../sql-reference/statements/rename.md) 查询将其替换为其他表。

`SYNC` 修饰符会立即执行该操作，不会延迟。

**示例**

创建一个表：

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

分离该表：

查询语句：

```sql
DETACH TABLE test;
SELECT * FROM test;
```

结果：

```text
服务器返回异常（版本 21.4.1）：
代码：60. DB::Exception: 来自 localhost:9000。DB::Exception: 表 default.test 不存在。
```

:::note
在 ClickHouse Cloud 中，用户应使用 `PERMANENTLY` 子句，例如 `DETACH TABLE &lt;table&gt; PERMANENTLY`。如果不使用该子句，这些表会在集群重启后重新附加，例如在升级期间。
:::

**另请参阅**

* [Materialized View（物化视图）](/sql-reference/statements/create/view#materialized-view)
* [Dictionaries（字典）](../../sql-reference/dictionaries/index.md)
