---
'description': 'Sums the arithmetic difference between consecutive rows.'
'sidebar_position': 129
'slug': '/sql-reference/aggregate-functions/reference/deltasum'
'title': 'deltaSum'
---




# deltaSum

计算连续行之间的算术差。 如果差值为负，则会被忽略。

:::note
底层数据必须经过排序，才能使此函数正常工作。 如果您希望在 [物化视图](/sql-reference/statements/create/view#materialized-view) 中使用此函数，您很可能想要使用 [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) 方法。
:::

**语法**

```sql
deltaSum(value)
```

**参数**

- `value` — 输入值，必须是 [Integer](../../data-types/int-uint.md) 或 [Float](../../data-types/float.md) 类型。

**返回值**

- 获得的 `Integer` 或 `Float` 类型的算术差。

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

## 另请参阅 {#see-also}

- [runningDifference](/sql-reference/functions/other-functions#runningDifference)
