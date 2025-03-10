---
slug: /engines/table-engines/special/merge
sidebar_position: 30
sidebar_label: Merge
title: '合并表引擎'
description: '`Merge` 引擎（不要与 `MergeTree` 混淆）本身不存储数据，而是允许同时从多个其他表中读取数据。'
---


# 合并表引擎

`Merge` 引擎（不要与 `MergeTree` 混淆）本身不存储数据，而是允许同时从多个其他表中读取数据。

读取操作会自动并行化。不支持向表中写入数据。当读取时，会使用实际被读取表的索引（如果存在）。

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## 引擎参数 {#engine-parameters}

### db_name {#db_name}

`db_name` — 可选值：
- 数据库名称，
- 返回字符串的常量表达式，例如 `currentDatabase()`，
- `REGEXP(expression)`，其中 `expression` 是用于匹配数据库名称的正则表达式。

### tables_regexp {#tables_regexp}

`tables_regexp` — 用于匹配指定数据库或数据库中的表名的正则表达式。

正则表达式 — [re2](https://github.com/google/re2)（支持 PCRE 的一个子集），区分大小写。请参阅“匹配”部分关于在正则表达式中转义符号的说明。

## 用法 {#usage}

在选择要读取的表时，即使 `Merge` 表符合正则表达式，也不会被选择。这是为了避免循环。可以创建两个 `Merge` 表，它们将无限尝试读取彼此的数据，但这样并不是一个好主意。

使用 `Merge` 引擎的典型方式是将大量 `TinyLog` 表视为单个表进行操作。

## 示例 {#examples}

**示例 1**

考虑两个数据库 `ABC_corporate_site` 和 `ABC_store`。`all_visitors` 表将包含来自两个数据库的 `visitors` 表的 ID。

``` sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**示例 2**

假设您有一个旧表 `WatchLog_old`，并决定更改分区而不将数据移动到新表 `WatchLog_new`，您需要查看两个表的数据。

``` sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog as WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

SELECT * FROM WatchLog;
```

``` text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## 虚拟列 {#virtual-columns}

- `_table` — 包含读取数据的表的名称。类型：[String](../../../sql-reference/data-types/string.md)。

    您可以在 `WHERE/PREWHERE` 子句中对 `_table` 设置常量条件（例如 `WHERE _table='xyz'`）。在这种情况下，读取操作仅对满足 `_table` 条件的表执行，因此 `_table` 列充当了索引。

**另请参见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) 表函数
