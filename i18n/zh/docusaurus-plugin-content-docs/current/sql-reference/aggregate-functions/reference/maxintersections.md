---
description: '聚合函数，用于计算一组区间之间的最大相交次数（在所有区间至少有一次共同相交的前提下）。'
sidebar_position: 163
slug: /sql-reference/aggregate-functions/reference/maxintersections
title: 'maxIntersections'
doc_type: 'reference'
---

# maxIntersections {#maxintersections}

聚合函数，用于在所有区间至少相交一次的前提下，计算一组区间之间的最大相交数量。

语法为：

```sql
maxIntersections(start_column, end_column)
```

**参数**

* `start_column` – 表示每个区间起点的数值列。如果 `start_column` 为 `NULL` 或 0，则跳过该区间。

* `end_column` - 表示每个区间终点的数值列。如果 `end_column` 为 `NULL` 或 0，则跳过该区间。

**返回值**

返回最大相交区间数。

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

这些区间如下：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

这些区间中有三个具有一个共同的取值（该值是 `4`，但具体是哪一个值并不重要，我们关心的是相交次数的计数）。区间 `(1,3)` 和 `(3,7)` 共享一个端点，但在 `maxIntersections` 函数中并不被视为相交。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

响应：

```response
3
```

如果存在多个最大区间，可以使用 [`maxIntersectionsPosition` 函数](./maxintersectionsposition.md) 来确定它们的数量和位置。
