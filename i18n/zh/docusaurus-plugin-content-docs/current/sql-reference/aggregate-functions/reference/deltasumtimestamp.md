---
'description': 'Adds the difference between consecutive rows. If the difference is
  negative, it is ignored.'
'sidebar_position': 130
'slug': '/sql-reference/aggregate-functions/reference/deltasumtimestamp'
'title': 'deltaSumTimestamp'
---



添加连续行之间的差值。如果差值为负，则会被忽略。

此函数主要用于存储按某个时间桶对齐的时间戳排序的数据的 [物化视图](/sql-reference/statements/create/view#materialized-view)，例如 `toStartOfMinute` 桶。因为在这样的物化视图中，所有行将具有相同的时间戳，因此在没有存储原始未四舍五入时间戳值的情况下，无法正确合并这些行。`deltaSumTimestamp` 函数跟踪它所见值的原始 `timestamp`，因此在合并分片时，函数的值（状态）正确计算。

要计算有序集合的增量和，您可以简单地使用 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 函数。

**语法**

```sql
deltaSumTimestamp(value, timestamp)
```

**参数**

- `value` — 输入值，必须是某种 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型，或是 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。
- `timestamp` — 用于排序值的参数，必须是某种 [Integer](../../data-types/int-uint.md) 类型或 [Float](../../data-types/float.md) 类型，或是 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

**返回值**

- 连续值之间的累积差异，按 `timestamp` 参数排序。

类型: [Integer](../../data-types/int-uint.md) 或 [Float](../../data-types/float.md) 或 [Date](../../data-types/date.md) 或 [DateTime](../../data-types/datetime.md)。

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
