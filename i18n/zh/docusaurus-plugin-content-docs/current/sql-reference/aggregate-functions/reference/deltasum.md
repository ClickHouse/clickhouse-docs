---
'description': '计算连续行之间的算术差的总和。'
'sidebar_position': 129
'slug': '/sql-reference/aggregate-functions/reference/deltasum'
'title': 'deltaSum'
'doc_type': 'reference'
---


# deltaSum

对连续行之间的算术差值进行求和。如果差值为负，则会被忽略。

:::note
底层数据必须已经排序，以确保此函数正常工作。如果您想在 [物化视图](/sql-reference/statements/create/view#materialized-view) 中使用此函数，您更可能希望使用 [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) 方法。
:::

**语法**

```sql
deltaSum(value)
```

**参数**

- `value` — 输入值，必须是 [整数](../../data-types/int-uint.md) 或 [浮点数](../../data-types/float.md) 类型。

**返回值**

- 得到的算术差值，为 `Integer` 或 `Float` 类型。

**示例**

查询：

```sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

结果：

```text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

查询：

```sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

结果：

```text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

查询：

```sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

结果：

```text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```

## 另见 {#see-also}

- [runningDifference](/sql-reference/functions/other-functions#runningDifference)
