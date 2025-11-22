---
description: '对相邻行之间的算术差进行求和。'
sidebar_position: 129
slug: /sql-reference/aggregate-functions/reference/deltasum
title: 'deltaSum'
doc_type: 'reference'
---



# deltaSum

对连续行之间的算术差值求和。如果差值为负，则会被忽略。

:::note
为使此函数正常工作，底层数据必须是已排序的。如果你希望在[物化视图](/sql-reference/statements/create/view#materialized-view)中使用此函数，通常应改用[deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp)函数。
:::

**语法**

```sql
deltaSum(value)
```

**参数**

* `value` — 输入值，必须是 [Integer](../../data-types/int-uint.md) 或 [Float](../../data-types/float.md) 类型。

**返回值**

* 返回的 `Integer` 或 `Float` 类型的算术差。

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
