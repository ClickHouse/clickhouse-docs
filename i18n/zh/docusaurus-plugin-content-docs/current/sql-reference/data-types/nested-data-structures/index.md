---
description: 'ClickHouse 中嵌套数据结构的概述'
sidebar_label: 'Nested(Name1 Type1, Name2 Type2, ...)'
sidebar_position: 57
slug: /sql-reference/data-types/nested-data-structures/nested
title: 'Nested'
doc_type: 'guide'
---

# 嵌套 \{#nested\}

## Nested(name1 Type1, Name2 Type2, ...) \{#nestedname1-type1-name2-type2-\}

嵌套数据结构就像表格单元格中的一张表。嵌套数据结构的参数——列名和类型——的指定方式与 [CREATE TABLE](../../../sql-reference/statements/create/table.md) 查询中相同。表中的每一行都可以对应嵌套数据结构中的任意数量的行。

示例：

```sql
CREATE TABLE test.visits
(
    CounterID UInt32,
    StartDate Date,
    Sign Int8,
    IsNew UInt8,
    VisitID UInt64,
    UserID UInt64,
    ...
    Goals Nested
    (
        ID UInt32,
        Serial UInt32,
        EventTime DateTime,
        Price Int64,
        OrderID String,
        CurrencyID UInt32
    ),
    ...
) ENGINE = CollapsingMergeTree(StartDate, intHash32(UserID), (CounterID, StartDate, intHash32(UserID), VisitID), 8192, Sign)
```

此示例声明了 `Goals` 嵌套数据结构，其中包含关于转化（已达成目标）的数据。`visits` 表中的每一行都可以对应零个或任意数量的转化。

当将 [flatten&#95;nested](/operations/settings/settings#flatten_nested) 设置为 `0`（默认值并非如此）时，将支持任意层级的嵌套。

在大多数情况下，处理嵌套数据结构时，其列通过用点分隔的列名来指定。这些列都是相同类型的数组。单个嵌套数据结构中的所有数组列长度都相同。

示例：

```sql
SELECT
    Goals.ID,
    Goals.EventTime
FROM test.visits
WHERE CounterID = 101500 AND length(Goals.ID) < 5
LIMIT 10
```

```text
┌─Goals.ID───────────────────────┬─Goals.EventTime───────────────────────────────────────────────────────────────────────────┐
│ [1073752,591325,591325]        │ ['2014-03-17 16:38:10','2014-03-17 16:38:48','2014-03-17 16:42:27']                       │
│ [1073752]                      │ ['2014-03-17 00:28:25']                                                                   │
│ [1073752]                      │ ['2014-03-17 10:46:20']                                                                   │
│ [1073752,591325,591325,591325] │ ['2014-03-17 13:59:20','2014-03-17 22:17:55','2014-03-17 22:18:07','2014-03-17 22:18:51'] │
│ []                             │ []                                                                                        │
│ [1073752,591325,591325]        │ ['2014-03-17 11:37:06','2014-03-17 14:07:47','2014-03-17 14:36:21']                       │
│ []                             │ []                                                                                        │
│ []                             │ []                                                                                        │
│ [591325,1073752]               │ ['2014-03-17 00:46:05','2014-03-17 00:46:05']                                             │
│ [1073752,591325,591325,591325] │ ['2014-03-17 13:28:33','2014-03-17 13:30:26','2014-03-17 18:51:21','2014-03-17 18:51:45'] │
└────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
```

最容易的方式是将嵌套数据结构看作一组长度相同的多列数组。

在 `SELECT` 查询中，只有在 `ARRAY JOIN` 子句中才能指定整个嵌套数据结构的名称，而不是单独的列名。有关更多信息，请参阅“ARRAY JOIN 子句”。示例：

```sql
SELECT
    Goal.ID,
    Goal.EventTime
FROM test.visits
ARRAY JOIN Goals AS Goal
WHERE CounterID = 101500 AND length(Goals.ID) < 5
LIMIT 10
```

```text
┌─Goal.ID─┬──────Goal.EventTime─┐
│ 1073752 │ 2014-03-17 16:38:10 │
│  591325 │ 2014-03-17 16:38:48 │
│  591325 │ 2014-03-17 16:42:27 │
│ 1073752 │ 2014-03-17 00:28:25 │
│ 1073752 │ 2014-03-17 10:46:20 │
│ 1073752 │ 2014-03-17 13:59:20 │
│  591325 │ 2014-03-17 22:17:55 │
│  591325 │ 2014-03-17 22:18:07 │
│  591325 │ 2014-03-17 22:18:51 │
│ 1073752 │ 2014-03-17 11:37:06 │
└─────────┴─────────────────────┘
```

不能对整个嵌套数据结构执行 SELECT 查询，只能显式列出其中的各个单独列。

对于 INSERT 查询，需要分别传递嵌套数据结构中各个组成列的数组（就像它们是独立的列数组一样）。在插入时，系统会检查它们的长度是否一致。

对于 DESCRIBE 查询，嵌套数据结构中的列也会以同样的方式分别列出。

对嵌套数据结构中元素执行的 ALTER 查询存在一定限制。
