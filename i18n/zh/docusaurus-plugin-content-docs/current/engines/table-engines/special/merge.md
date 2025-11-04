---
'description': '`Merge` 引擎（不要与 `MergeTree` 混淆）不自己存储数据，但允许同时从任意数量的其他表中读取.'
'sidebar_label': 'Merge'
'sidebar_position': 30
'slug': '/engines/table-engines/special/merge'
'title': 'Merge Table Engine'
'doc_type': 'reference'
---


# Merge 表引擎

`Merge` 引擎（不应与 `MergeTree` 混淆）并不存储数据，而是允许同时从任意数量的其他表中读取。

读取自动并行化。不支持对表的写入。在读取时，如果存在的实际读取表的索引将被使用。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## 引擎参数 {#engine-parameters}

### `db_name` {#db_name}

`db_name` — 可能的值：
- 数据库名称，
- 返回数据库名称字符串的常量表达式，例如 `currentDatabase()`，
- `REGEXP(expression)`，其中 `expression` 是用于匹配数据库名称的正则表达式。

### `tables_regexp` {#tables_regexp}

`tables_regexp` — 用于匹配指定数据库或数据库集中的表名称的正则表达式。

正则表达式 — [re2](https://github.com/google/re2)（支持 PCRE 的子集），区分大小写。
请参阅“匹配”部分中关于转义符号的说明。

## 用法 {#usage}

在选择要读取的表时，`Merge` 表本身不会被选择，即使它与正则表达式匹配。这是为了避免循环。
创建两个 `Merge` 表，它们会无休止地尝试读取彼此数据的可能性是存在的，但这并不是一个好主意。

使用 `Merge` 引擎的典型方式是像处理一张单一表一样处理大量的 `TinyLog` 表。

## 示例 {#examples}

**示例 1**

考虑两个数据库 `ABC_corporate_site` 和 `ABC_store`。`all_visitors` 表将包含来自两个数据库中的 `visitors` 表的 ID。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**示例 2**

假设您有一个旧表 `WatchLog_old`，并决定在不将数据移动到新表 `WatchLog_new` 的情况下更改分区，并且您需要查看这两个表中的数据。

```sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog AS WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

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

## 虚拟列 {#virtual-columns}

- `_table` — 包含读取数据的表的名称。类型: [String](../../../sql-reference/data-types/string.md)。

    您可以在 `WHERE/PREWHERE` 子句中设置 `_table` 的常量条件（例如，`WHERE _table='xyz'`）。在这种情况下，读取操作仅针对满足 `_table` 条件的表进行，因此 `_table` 列充当索引。

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 表函数
