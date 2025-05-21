---
description: '連続する行間の算術的差を合計します。'
sidebar_position: 129
slug: /sql-reference/aggregate-functions/reference/deltasum
title: 'deltaSum'
---


# deltaSum

連続する行間の算術的差を合計します。差が負の場合は無視されます。

:::note
この関数を正しく機能させるためには、基礎データがソートされている必要があります。この関数を [materialized view](/sql-reference/statements/create/view#materialized-view) で使用する場合は、ほとんどの場合 [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) メソッドを使用することをお勧めします。
:::

**構文**

```sql
deltaSum(value)
```

**引数**

- `value` — 入力値、[Integer](../../data-types/int-uint.md) または [Float](../../data-types/float.md) 型でなければなりません。

**返される値**

- `Integer` または `Float` 型の得られた算術的差。

**例**

クエリ：

```sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

結果：

```text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

クエリ：

```sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

結果：

```text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

結果：

```text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```

## 関連項目 {#see-also}

- [runningDifference](/sql-reference/functions/other-functions#runningDifference)
