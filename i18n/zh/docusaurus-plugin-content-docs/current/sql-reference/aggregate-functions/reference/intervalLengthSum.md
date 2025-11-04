---
'description': '计算所有范围（数值轴上的段）并集的总长度。'
'sidebar_label': 'intervalLengthSum'
'sidebar_position': 155
'slug': '/sql-reference/aggregate-functions/reference/intervalLengthSum'
'title': 'intervalLengthSum'
'doc_type': 'reference'
---

计算所有区间（数值轴上的片段）联合的总长度。

**语法**

```sql
intervalLengthSum(start, end)
```

**参数**

- `start` — 区间的起始值。可为 [Int32](/sql-reference/data-types/int-uint#integer-ranges), [Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt32](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges), [Float32](/sql-reference/data-types/float), [Float64](/sql-reference/data-types/float), [DateTime](/sql-reference/data-types/datetime) 或 [Date](/sql-reference/data-types/date)。
- `end` — 区间的结束值。可为 [Int32](/sql-reference/data-types/int-uint#integer-ranges), [Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt32](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges), [Float32](/sql-reference/data-types/float), [Float64](/sql-reference/data-types/float), [DateTime](/sql-reference/data-types/datetime) 或 [Date](/sql-reference/data-types/date)。

:::note
参数必须是相同的数据类型。否则，将会抛出异常。
:::

**返回值**

- 所有区间（数值轴上的片段）联合的总长度。根据参数的类型，返回值可以是 [UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float) 类型。

**示例**

1. 输入表：

```text
┌─id─┬─start─┬─end─┐
│ a  │   1.1 │ 2.9 │
│ a  │   2.5 │ 3.2 │
│ a  │     4 │   5 │
└────┴───────┴─────┘
```

在此示例中，使用了 Float32 类型的参数。该函数返回 Float64 类型的值。

结果是区间 `[1.1, 3.2]` 的长度之和（联合了 `[1.1, 2.9]` 和 `[2.5, 3.2]`）以及 `[4, 5]`。

查询：

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM fl_interval GROUP BY id ORDER BY id;
```

结果：

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                           3.1 │ Float64                                   │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```

2. 输入表：

```text
┌─id─┬───────────────start─┬─────────────────end─┐
│ a  │ 2020-01-01 01:12:30 │ 2020-01-01 02:10:10 │
│ a  │ 2020-01-01 02:05:30 │ 2020-01-01 02:50:31 │
│ a  │ 2020-01-01 03:11:22 │ 2020-01-01 03:23:31 │
└────┴─────────────────────┴─────────────────────┘
```

在此示例中，使用了 DateTime 类型的参数。该函数返回单位为秒的值。

查询：

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM dt_interval GROUP BY id ORDER BY id;
```

结果：

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                          6610 │ UInt64                                    │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```

3. 输入表：

```text
┌─id─┬──────start─┬────────end─┐
│ a  │ 2020-01-01 │ 2020-01-04 │
│ a  │ 2020-01-12 │ 2020-01-18 │
└────┴────────────┴────────────┘
```

在此示例中，使用了 Date 类型的参数。该函数返回单位为天的值。

查询：

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM date_interval GROUP BY id ORDER BY id;
```

结果：

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                             9 │ UInt64                                    │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```
