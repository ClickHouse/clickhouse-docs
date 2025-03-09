---
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
sidebar_position: 164
title: maxIntersectionsPosition
description: '聚合函数，用于计算 maxIntersections 函数的出现位置。'
---


# maxIntersectionsPosition

聚合函数，用于计算 [`maxIntersections` 函数](./maxintersections.md) 的出现位置。

语法为：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**参数**

- `start_column` – 表示每个区间起始的数值列。如果 `start_column` 为 `NULL` 或 0，则该区间将被跳过。

- `end_column` - 表示每个区间结束的数值列。如果 `end_column` 为 `NULL` 或 0，则该区间将被跳过。

**返回值**

返回交叉区间的最大数量的起始位置。

**示例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();
```

插入数据到 my_events 表：

```sql
INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

这些区间的表示如下：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

注意，这三个区间有值 4 是共同的，并且是从第 2 个区间开始的：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

响应：
```response
2
```

换句话说， `(1,6)` 行是三个交叉区间的起始位置，并且交叉的最大数量是 3。
