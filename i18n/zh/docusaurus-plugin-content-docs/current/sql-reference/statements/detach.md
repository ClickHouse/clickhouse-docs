使服务器“忘记”表、物化视图、字典或数据库的存在。

**语法**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

分离不会删除表、物化视图、字典或数据库的数据或元数据。如果实体未被分离 `PERMANENTLY`，下次服务器启动时，服务器将读取元数据并重新调用表/视图/字典/数据库。如果实体被永久分离，则将不会自动调用。

无论表、字典或数据库是否被永久分离，在这两种情况下，您都可以使用 [ATTACH](../../sql-reference/statements/attach.md) 查询重新附加它们。系统日志表也可以重新附加（例如 `query_log`、`text_log` 等）。其他系统表不能被重新附加。在下次服务器启动时，服务器将再次调用这些表。

`ATTACH MATERIALIZED VIEW` 不能使用简短语法（没有 `SELECT`），但您可以使用 `ATTACH TABLE` 查询附加它。

请注意，您不能永久分离已经被临时分离的表。但您可以重新附加它，然后再次永久分离。

另外，您不能 [DROP](../../sql-reference/statements/drop.md#drop-table) 已分离的表，或使用 [CREATE TABLE](../../sql-reference/statements/create/table.md) 创建与永久分离的表同名的表，或用其他表替换它，使用 [RENAME TABLE](../../sql-reference/statements/rename.md) 查询。

`SYNC` 修饰符会立即执行操作。

**示例**

创建表：

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
在 ClickHouse Cloud 中，用户应该使用 `PERMANENTLY` 子句，例如 `DETACH TABLE <table> PERMANENTLY`。如果不使用此子句，表将在集群重启时重新附加，例如在升级期间。
:::

**相关内容**

- [物化视图](/sql-reference/statements/create/view#materialized-view)
- [字典](../../sql-reference/dictionaries/index.md)
