---
description: '累加相邻行之间的差值。如果差值为负，则会被忽略。'
sidebar_position: 130
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
title: 'deltaSumTimestamp'
doc_type: 'reference'
---

累加相邻行之间的差值。如果差值为负，则会被忽略。

此函数主要用于按某个对齐到时间桶的时间戳排序并存储数据的[物化视图](/sql-reference/statements/create/view#materialized-view)，例如 `toStartOfMinute` 时间桶。由于这样的物化视图中的行具有相同的时间戳，如果不存储原始、未取整的时间戳值，就无法以正确顺序合并这些行。`deltaSumTimestamp` 函数会跟踪它已经处理过的值对应的原始 `timestamp`，因此在数据分片合并期间，函数的值（状态）可以被正确计算。

要对有序集合计算增量和，你可以直接使用 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 函数。

**语法**

```sql
deltaSumTimestamp(value, timestamp)
```

**参数**

* `value` — 输入值，必须是某个 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型，或者 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。
* `timestamp` — 用于对值进行排序的参数，必须是某个 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型，或者 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

**返回值**

* 按 `timestamp` 参数排序后，相邻值之间差值的累计和。

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
