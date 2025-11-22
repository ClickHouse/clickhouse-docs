---
description: '对相邻行之间的差值求和。如果差值为负，则忽略该差值。'
sidebar_position: 130
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
title: 'deltaSumTimestamp'
doc_type: 'reference'
---

对相邻行之间的差值求和。如果差值为负，则忽略该差值。

此函数主要用于[物化视图](/sql-reference/statements/create/view#materialized-view)，这些视图按某个与时间分桶对齐的时间戳排序并存储数据，例如使用 `toStartOfMinute` 分桶。由于此类物化视图中的行都具有相同的时间戳，如果不存储原始、未取整的时间戳值，就无法以正确的顺序对它们进行合并。`deltaSumTimestamp` 函数会记录其已处理值的原始 `timestamp`，因此在合并各部分数据时能够正确计算函数的值（状态）。

要在有序集合上计算差值求和，可以直接使用 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 函数。

**语法**

```sql
deltaSumTimestamp(value, timestamp)
```

**参数**

* `value` — 输入值，必须是 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型，或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。
* `timestamp` — 用于对值排序的参数，必须是 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型，或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

**返回值**

* 按 `timestamp` 参数排序后，相邻值之间差值的累积和。

类型：[Integer](../../data-types/int-uint.md) 或 [Float](../../data-types/float.md) 或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

**示例**

查询：

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

结果：

```text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
