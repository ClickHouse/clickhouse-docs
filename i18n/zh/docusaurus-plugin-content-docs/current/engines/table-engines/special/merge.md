---
'description': 'The `Merge` engine (not to be confused with `MergeTree`) does not
  store data itself, but allows reading from any number of other tables simultaneously.'
'sidebar_label': 'Merge'
'sidebar_position': 30
'slug': '/engines/table-engines/special/merge'
'title': 'Merge Table Engine'
---




# Merge Table Engine

`Merge` 引擎（不要与 `MergeTree` 混淆）本身不存储数据，但允许同时从任意数量的其他表中读取数据。

读取会被自动并行化。写入表不被支持。在读取时，会使用实际读取表的索引（如果存在）。

## Creating a Table {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp [, table_to_write])
```

## Engine Parameters {#engine-parameters}

### db_name {#db_name}

`db_name` — 可取值：
    - 数据库名称，
    - 返回数据库名称字符串的常量表达式，例如 `currentDatabase()`，
    - `REGEXP(expression)`，其中 `expression` 是用于匹配数据库名称的正则表达式。

### tables_regexp {#tables_regexp}

`tables_regexp` — 一个正则表达式，用于匹配指定数据库或数据库中的表名称。

正则表达式 — [re2](https://github.com/google/re2)（支持 PCRE 的一个子集），区分大小写。
请参阅“匹配”部分关于正则表达式中转义符号的说明。

### table_to_write {#table_to_write}

`table_to_write` - 在插入到 `Merge` 表时写入的表名称。
可取值：
    - `'db_name.table_name'` - 插入到特定数据库中指定的表。
    - `'table_name'` - 插入到表 `db_name.table_name`。仅在第一个参数 `db_name` 不是正则表达式时允许。
    - `auto` - 插入到按字母顺序排列的最后一个传递给 `tables_regexp` 的表中。仅在第一个参数 `db_name` 不是正则表达式时允许。

## Usage {#usage}

在选择要读取的表时，`Merge` 表本身不会被选择，即使它符合正则表达式。这是为了避免循环。
可以创建两个 `Merge` 表，它们将无休止地尝试读取彼此的数据，但这并不是一个好主意。

使用 `Merge` 引擎的典型方法是将许多 `TinyLog` 表视为一个单一表进行操作。

## Examples {#examples}

**Example 1**

考虑两个数据库 `ABC_corporate_site` 和 `ABC_store`。`all_visitors` 表将包含来自两个数据库中 `visitors` 表的 ID。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**Example 2**

假设您有一个旧表 `WatchLog_old`，并决定在不将数据移动到新表 `WatchLog_new` 的情况下更改分区，并且您需要从两个表中查看数据。

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

插入到表 `WatchLog` 的数据将进入表 `WatchLog_new`。
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

- `_table` — 包含读取数据的表的名称。类型：[String](../../../sql-reference/data-types/string.md)。

    您可以在 `WHERE/PREWHERE` 子句中对 `_table` 设置常量条件（例如，`WHERE _table='xyz'`）。在这种情况下，读取操作仅对满足 `_table` 条件的表进行，因此 `_table` 列充当索引。

**See Also**

- [Virtual columns](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 表函数
