---
slug: /sql-reference/data-types/nested-data-structures/nested
sidebar_position: 57
sidebar_label: 嵌套(Nested(Name1 Type1, Name2 Type2, ...))
---


# 嵌套

## Nested(name1 Type1, Name2 Type2, ...) {#nestedname1-type1-name2-type2-}

嵌套数据结构就像是单元格中的一个表。嵌套数据结构的参数——列名和类型——以与 [CREATE TABLE](../../../sql-reference/statements/create/table.md) 查询相同的方式进行指定。每个表行可以对应嵌套数据结构中的任意数量的行。

示例：

``` sql
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

该示例声明了 `Goals` 嵌套数据结构，包含有关转换（达到的目标）的数据。“visits”表中的每一行可以对应零个或任意数量的转换。

当 [flatten_nested](/operations/settings/settings#flatten_nested) 设置为 `0`（默认不是），则支持任意级别的嵌套。

在大多数情况下，处理嵌套数据结构时，其列以点分隔的列名来指定。这些列组成了匹配类型的数组。单个嵌套数据结构的所有列数组具有相同的长度。

示例：

``` sql
SELECT
    Goals.ID,
    Goals.EventTime
FROM test.visits
WHERE CounterID = 101500 AND length(Goals.ID) < 5
LIMIT 10
```

``` text
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

最简单的理解嵌套数据结构的方法是将其视为相同长度的多个列数组的集合。

SELECT 查询中可以指定整个嵌套数据结构的名称的唯一地方是 ARRAY JOIN 子句。有关更多信息，请参见 “ARRAY JOIN 子句”。示例：

``` sql
SELECT
    Goal.ID,
    Goal.EventTime
FROM test.visits
ARRAY JOIN Goals AS Goal
WHERE CounterID = 101500 AND length(Goals.ID) < 5
LIMIT 10
```

``` text
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

您无法对整个嵌套数据结构执行 SELECT。只能明确列出其所属的单独列。

对于 INSERT 查询，您应该分别传递嵌套数据结构的所有组件列数组（就像它们是单独的列数组一样）。在插入过程中，系统检查它们的长度是否相同。

对于 DESCRIBE 查询，嵌套数据结构中的列以相同方式分别列出。

对嵌套数据结构中元素的 ALTER 查询存在限制。
