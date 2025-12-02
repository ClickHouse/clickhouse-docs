---
description: '计算 maxIntersections 函数各次出现位置的聚合函数。'
sidebar_position: 164
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
title: 'maxIntersectionsPosition'
doc_type: 'reference'
---

# maxIntersectionsPosition {#maxintersectionsposition}

聚合函数，用于计算[`maxIntersections` 函数](./maxintersections.md)结果中各次出现的位置。

语法如下所示：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**参数**

* `start_column` – 表示每个区间起点的数值列。如果 `start_column` 为 `NULL` 或 0，则跳过该区间。

* `end_column` - 表示每个区间终点的数值列。如果 `end_column` 为 `NULL` 或 0，则跳过该区间。

**返回值**

返回相交区间数量最大时的起始位置。

**示例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

这些时间间隔如下：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

请注意，其中有三个区间都共同包含数值 4，而且这一点是从第二个区间开始的：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

响应：

```response
2
```

换句话说，`(1,6)` 这一行是 3 个相交区间的起点，而 3 是同时相交的区间的最大数量。
