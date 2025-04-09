---
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
sidebar_position: 130
title: 'deltaSumTimestamp'
description: 'Adds the difference between consecutive rows. If the difference is negative, it is ignored.'
---

添加连续行之间的差异。如果差异为负，则被忽略。

此函数主要用于 [物化视图](/sql-reference/statements/create/view#materialized-view)，这些视图以某些时间桶对齐的时间戳为顺序存储数据，例如，以 `toStartOfMinute` 为桶。由于这样的物化视图中的行将具有相同的时间戳，因此在没有存储原始的、未四舍五入的时间戳值的情况下，无法按照正确的顺序合并它们。`deltaSumTimestamp` 函数跟踪其所见值的原始 `timestamp`，因此在分区合并期间，可以正确计算该函数的值（状态）。

要计算有序集合的增量总和，可以简单使用 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 函数。

**语法**

``` sql
deltaSumTimestamp(value, timestamp)
```

**参数**

- `value` — 输入值，必须是某种 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。
- `timestamp` — 用于排序值的参数，必须是某种 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

**返回值**

- 按 `timestamp` 参数排序的连续值之间的累积差异。

类型: [Integer](../../data-types/int-uint.md) 或 [Float](../../data-types/float.md) 或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

**示例**

查询：

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

结果：

``` text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
