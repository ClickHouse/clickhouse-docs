
# Merge Table Engine

`Merge` 引擎（不应与 `MergeTree` 混淆）本身不存储数据，而是允许同时从任意数量的其他表中读取数据。

读取操作会自动并行化。表的写入不被支持。在读取时，实际被读取的表的索引（如果存在）会被使用。

## Creating a Table {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp [, table_to_write])
```

## Engine Parameters {#engine-parameters}

### db_name {#db_name}

`db_name` — 可能的值：
- 数据库名称，
- 返回字符串的常量表达式，包含数据库名称，例如 `currentDatabase()`，
- `REGEXP(expression)`，其中 `expression` 是一个匹配数据库名称的正则表达式。

### tables_regexp {#tables_regexp}

`tables_regexp` — 用于匹配指定数据库或多个数据库中表名的正则表达式。

正则表达式 — [re2](https://github.com/google/re2)（支持 PCRE 的子集），区分大小写。
有关在正则表达式中转义符号的说明，请参见“匹配”部分。

### table_to_write {#table_to_write}

`table_to_write` - 插入到 `Merge` 表时写入的表名。
可能的值：
- `'db_name.table_name'` - 插入到特定数据库中特定表中。
- `'table_name'` - 插入到表 `db_name.table_name`。仅当第一个参数 `db_name` 不是正则表达式时允许。
- `auto` - 插入到按字典顺序排列的 `tables_regexp` 中最后一个传递的表。仅当第一个参数 `db_name` 不是正则表达式时允许。

## Usage {#usage}

在选择表进行读取时，即使 `Merge` 表匹配正则表达式，也不会被选中。这是为了避免循环。
可以创建两个 `Merge` 表，它们会无休止地尝试读取彼此的数据，但这并不是一个好主意。

使用 `Merge` 引擎的典型方式是将大量 `TinyLog` 表作为单个表进行处理。

## Examples {#examples}

**Example 1**

考虑两个数据库 `ABC_corporate_site` 和 `ABC_store`。`all_visitors` 表将包含来自两个数据库中 `visitors` 表的 ID。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**Example 2**

假设您有一个旧表 `WatchLog_old`，并决定更改分区而不将数据移动到新表 `WatchLog_new`，您需要查看两个表中的数据。

```sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog as WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog', 'WatchLog_new');

SELECT * FROM WatchLog;
```

```text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

插入到表 `WatchLog` 的操作正在进行表 `WatchLog_new` 的插入
```sql
INSERT INTO WatchLog VALUES ('2018-01-03', 3, 'hit', 3);

SELECT * FROM WatchLog_New;
```

```text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-03 │      3 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## Virtual Columns {#virtual-columns}

- `_table` — 包含从中读取数据的表名称。类型: [String](../../../sql-reference/data-types/string.md)。

您可以在 `WHERE/PREWHERE` 子句中设置关于 `_table` 的固定条件（例如，`WHERE _table='xyz'`）。在这种情况下，执行的读取操作仅限于满足 `_table` 上条件的表，因此 `_table` 列作为索引工作。

**See Also**

- [Virtual columns](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 表函数
