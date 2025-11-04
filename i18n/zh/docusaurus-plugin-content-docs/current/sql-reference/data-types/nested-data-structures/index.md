---
'description': '在 ClickHouse 中嵌套数据结构的概述'
'sidebar_label': 'Nested(Name1 Type1, Name2 Type2, ...)'
'sidebar_position': 57
'slug': '/sql-reference/data-types/nested-data-structures/nested'
'title': 'Nested'
'doc_type': 'guide'
---


# 嵌套

## Nested(name1 Type1, Name2 Type2, ...) {#nestedname1-type1-name2-type2-}

嵌套数据结构就像一个单元格内部的表。嵌套数据结构的参数——列名称和类型——与 [CREATE TABLE](../../../sql-reference/statements/create/table.md) 查询中指定的方式相同。每个表行可以对应于嵌套数据结构中的任意数量的行。

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

此示例声明了 `Goals` 嵌套数据结构，它包含有关转换（达到目标）的数据。“visits” 表中的每一行可以对应于零个或任意数量的转换。

当 [flatten_nested](/operations/settings/settings#flatten_nested) 设置为 `0`（默认情况下不是）时，支持任意级别的嵌套。

在大多数情况下，在处理嵌套数据结构时，其列通过点分隔的列名称进行指定。这些列组成一个匹配类型的数组。单个嵌套数据结构的所有列数组具有相同的长度。

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

将嵌套数据结构视为一组相同长度的多个列数组是最简单的方式。

SELECT 查询唯一可以指定整个嵌套数据结构名称而不是单个列的地方是 ARRAY JOIN 子句。有关更多信息，请参见“ARRAY JOIN 子句”。示例：

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

您不能针对整个嵌套数据结构执行 SELECT。您只能明确列出它的单个列。

对于 INSERT 查询，您应单独传递嵌套数据结构的所有组件列数组（就像它们是单独的列数组一样）。在插入过程中，系统检查它们是否具有相同的长度。

对于 DESCRIBE 查询，嵌套数据结构中的列以相同的方式单独列出。

ALTER 查询对于嵌套数据结构中的元素有其限制。
