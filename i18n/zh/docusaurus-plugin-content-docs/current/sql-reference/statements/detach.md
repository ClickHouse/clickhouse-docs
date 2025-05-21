---
'description': 'Documentation for Detach'
'sidebar_label': 'DETACH'
'sidebar_position': 43
'slug': '/sql-reference/statements/detach'
'title': 'DETACH Statement'
---



使服务器“忘记”某个表、物化视图、字典或数据库的存在。

**语法**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

分离操作不会删除某个表、物化视图、字典或数据库的数据或元数据。如果某个实体没有被 `PERMANENTLY` 分离，下次服务器启动时，服务器会读取元数据并再次记起表/视图/字典/数据库。如果某个实体被 `PERMANENTLY` 分离，则不会自动恢复。

无论一个表、字典或数据库是永久性分离还是临时分离，在两种情况下，您都可以使用 [ATTACH](../../sql-reference/statements/attach.md) 查询将它们重新附加。系统日志表也可以重新附加（例如 `query_log`、`text_log` 等）。其他系统表无法重新附加。在下次服务器启动时，服务器将再次记起这些表。

`ATTACH MATERIALIZED VIEW` 不支持短语法（不带 `SELECT`），但您可以使用 `ATTACH TABLE` 查询将其附加。

请注意，您不能对已经被临时分离的表执行永久性分离操作。但您可以将其重新附加，然后再次永久性地分离。

此外，您也不能对被分离的表执行 [DROP](../../sql-reference/statements/drop.md#drop-table) 操作，或使用与永久性分离的表同名的 [CREATE TABLE](../../sql-reference/statements/create/table.md) 操作，或使用 [RENAME TABLE](../../sql-reference/statements/rename.md) 查询将其替换为其他表。

`SYNC` 修饰符会立即执行该操作。

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
在 ClickHouse Cloud 中，用户应使用 `PERMANENTLY` 子句，例如 `DETACH TABLE <table> PERMANENTLY`。如果未使用该子句，表将在集群重启时重新附加，例如在升级期间。
:::

**另请参阅**

- [物化视图](/sql-reference/statements/create/view#materialized-view)
- [字典](../../sql-reference/dictionaries/index.md)
