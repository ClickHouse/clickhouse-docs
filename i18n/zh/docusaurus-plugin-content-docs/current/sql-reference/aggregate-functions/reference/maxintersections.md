---
slug: /sql-reference/aggregate-functions/reference/maxintersections
sidebar_position: 163
title: maxIntersections
description: '聚合函数，计算一组区间相互交叉的最大次数（如果所有区间至少交叉一次）。'
---


# maxIntersections

聚合函数，计算一组区间相互交叉的最大次数（如果所有区间至少交叉一次）。

语法如下：

```sql
maxIntersections(start_column, end_column)
```

**参数**

- `start_column` – 表示每个区间开始的数字列。如果 `start_column` 为 `NULL` 或 0，则该区间将被跳过。

- `end_column` - 表示每个区间结束的数字列。如果 `end_column` 为 `NULL` 或 0，则该区间将被跳过。

**返回值**

返回交叉区间的最大数量。

**示例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();
```

向 `my_events` 中插入以下值：

```sql
INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

这些区间看起来如下：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

这三条区间有一个共同的值（共同值为 `4`，但共同值并不重要，我们测量的是交叉的数量）。区间 `(1,3)` 和 `(3,7)` 共享一个端点，但在 `maxIntersections` 函数中不被视为相交。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

响应:
```response
3
```

如果你有多个最大区间的出现次数，可以使用 [`maxIntersectionsPosition` 函数](./maxintersectionsposition.md) 查找那些出现次数及其位置。
