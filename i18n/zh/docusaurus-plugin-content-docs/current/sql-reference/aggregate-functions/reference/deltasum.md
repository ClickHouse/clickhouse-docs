---
'description': '对连续行之间的算术差进行求和。'
'sidebar_position': 129
'slug': '/sql-reference/aggregate-functions/reference/deltasum'
'title': 'deltaSum'
---


# deltaSum

计算连续行之间的算术差。如果差值为负，则会被忽略。

:::note
底层数据必须经过排序才能正确使用此函数。如果您希望在 [物化视图](/sql-reference/statements/create/view#materialized-view) 中使用此函数，您可能更想使用 [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) 方法。
:::

**语法**

```sql
deltaSum(value)
```

**参数**

- `value` — 输入值，必须是 [整数](../../data-types/int-uint.md) 或 [浮点数](../../data-types/float.md) 类型。

**返回值**

- 返回一个 `Integer` 或 `Float` 类型的算术差值。

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
