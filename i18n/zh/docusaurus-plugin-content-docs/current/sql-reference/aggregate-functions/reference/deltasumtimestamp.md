添加连续行之间的差异。如果差异为负，则被忽略。

此函数主要用于存储数据按某个时间桶对齐的时间戳顺序的 [物化视图](/sql-reference/statements/create/view#materialized-view)，例如 `toStartOfMinute` 桶。因为在这样的物化视图中，所有行都将具有相同的时间戳，所以在不存储原始、未经舍入的时间戳值的情况下，无法按照正确的顺序进行合并。`deltaSumTimestamp` 函数跟踪它所看到的值的原始 `timestamp`，因此在合并分片时，函数的值（状态）得以正确计算。

要计算有序集合的增量和，您可以简单地使用 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 函数。

**语法**

```sql
deltaSumTimestamp(value, timestamp)
```

**参数**

- `value` — 输入值，必须是某种 [整数](../../data-types/int-uint.md) 类型或 [浮点数](../../data-types/float.md) 类型，或者是 [日期](../../data-types/date.md) 或 [日期时间](../../data-types/datetime.md)。
- `timestamp` — 用于排序值的参数，必须是某种 [整数](../../data-types/int-uint.md) 类型或 [浮点数](../../data-types/float.md) 类型，或者是 [日期](../../data-types/date.md) 或 [日期时间](../../data-types/datetime.md)。

**返回值**

- 按 `timestamp` 参数排序的连续值之间的累积差异。

类型：[整数](../../data-types/int-uint.md) 或 [浮点数](../../data-types/float.md) 或 [日期](../../data-types/date.md) 或 [日期时间](../../data-types/datetime.md)。

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
