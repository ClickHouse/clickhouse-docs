---
description: '聚合函数，用于在所有区间至少有一次相交的前提下，计算一组区间相互相交的最大次数。'
sidebar_position: 163
slug: /sql-reference/aggregate-functions/reference/maxintersections
title: 'maxIntersections'
doc_type: 'reference'
---

# maxIntersections

聚合函数，用于计算一组区间之间的最大相交次数（前提是所有区间至少相交一次）。

语法为：

```sql
maxIntersections(start_column, end_column)
```

**参数**

* `start_column` – 表示每个区间起点的数值列。如果 `start_column` 为 `NULL` 或 0，则跳过该区间。

* `end_column` - 表示每个区间终点的数值列。如果 `end_column` 为 `NULL` 或 0，则跳过该区间。

**返回值**

返回相交区间的最大数量。

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

这些区间如下所示：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

这些区间中有三个在某个点上相交（这个公共点是 `4`，但具体数值并不重要，我们关注的是相交的次数）。区间 `(1,3)` 和 `(3,7)` 虽然共享一个端点，但在 `maxIntersections` 函数中不被视为相交。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

响应：

```response
3
```

如果最大区间出现多次，可以使用 [`maxIntersectionsPosition` 函数](./maxintersectionsposition.md) 来确定这些出现的次数及其位置。
