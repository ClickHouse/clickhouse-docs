---
description: '`Merge` 引擎（不要与 `MergeTree` 混淆）本身不存储数据，而是允许同时从任意数量的其他表中读取数据。'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Merge 表引擎'
doc_type: 'reference'
---



# Merge 表引擎

`Merge` 引擎（不要与 `MergeTree` 混淆）本身不存储数据，而是允许同时从任意数量的其他表中读取数据。

读取操作会自动并行执行。不支持向该表写入数据。读取时，如果实际读取的表存在索引，则会使用这些索引。



## 创建表 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```


## 引擎参数 {#engine-parameters}

### `db_name` {#db_name}

`db_name` — 可能的值:
- 数据库名称
- 返回数据库名称字符串的常量表达式,例如 `currentDatabase()`
- `REGEXP(expression)`,其中 `expression` 是用于匹配数据库名称的正则表达式。

### `tables_regexp` {#tables_regexp}

`tables_regexp` — 用于匹配指定数据库中表名的正则表达式。

正则表达式 — [re2](https://github.com/google/re2)(支持 PCRE 的子集),区分大小写。
有关正则表达式中转义符号的说明,请参阅 "match" 部分。


## 用法 {#usage}

在选择要读取的表时，`Merge` 表本身不会被选中，即使它符合正则表达式。这样做是为了避免循环引用。
可以创建两个相互无限尝试读取对方数据的 `Merge` 表，但不建议这样做。

`Merge` 引擎的典型用法是将大量 `TinyLog` 表当作单个表来使用。


## 示例 {#examples}

**示例 1**

假设有两个数据库 `ABC_corporate_site` 和 `ABC_store`。`all_visitors` 表将包含这两个数据库中 `visitors` 表的 ID。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**示例 2**

假设您有一个旧表 `WatchLog_old`,并决定更改分区方式,但不将数据移动到新表 `WatchLog_new`,同时您需要查看这两个表的数据。

```sql
CREATE TABLE WatchLog_old(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
ORDER BY (date, UserId, EventType);

INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
PARTITION BY date
ORDER BY (UserId, EventType)
SETTINGS index_granularity=8192;

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

- `_table` — 数据来源表的名称。类型:[String](../../../sql-reference/data-types/string.md)。

  如果对 `_table` 进行过滤(例如 `WHERE _table='xyz'`),则仅读取满足过滤条件的表。

- `_database` — 数据来源数据库的名称。类型:[String](../../../sql-reference/data-types/string.md)。

**另请参阅**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 表函数
