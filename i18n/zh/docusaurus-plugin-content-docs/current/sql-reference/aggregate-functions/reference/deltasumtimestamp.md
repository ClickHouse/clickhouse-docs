---
'description': '添加连续行之间的差异。如果差异为负，则忽略它。'
'sidebar_position': 130
'slug': '/sql-reference/aggregate-functions/reference/deltasumtimestamp'
'title': 'deltaSumTimestamp'
'doc_type': 'reference'
---

将连续行之间的差值相加。如果差值为负，则被忽略。

该函数主要用于存储按某个时间段对齐的时间戳顺序排列的数据的 [物化视图](/sql-reference/statements/create/view#materialized-view)，例如，`toStartOfMinute` 桶。由于这样的物化视图中的行将具有相同的时间戳，因此在不存储原始的未四舍五入时间戳值的情况下，无法以正确的顺序合并它们。`deltaSumTimestamp` 函数跟踪它所见的值的原始 `timestamp`，因此在分区片段合并期间，函数的值（状态）被正确计算。

要计算有序集合的增量和，可以简单地使用 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 函数。

**语法**

```sql
deltaSumTimestamp(value, timestamp)
```

**参数**

- `value` — 输入值，必须是某种 [整数](../../data-types/int-uint.md) 类型或 [浮点数](../../data-types/float.md) 类型，或 [日期](../../data-types/date.md) 或 [日期时间](../../data-types/datetime.md)。
- `timestamp` — 用于排序值的参数，必须是某种 [整数](../../data-types/int-uint.md) 类型或 [浮点数](../../data-types/float.md) 类型，或 [日期](../../data-types/date.md) 或 [日期时间](../../data-types/datetime.md)。

**返回值**

- 按 `timestamp` 参数排序的连续值之间的累积差异。

类型: [整数](../../data-types/int-uint.md) 或 [浮点数](../../data-types/float.md) 或 [日期](../../data-types/date.md) 或 [日期时间](../../data-types/datetime.md)。

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
