---
slug: /sql-reference/aggregate-functions/reference/deltasum
sidebar_position: 129
title: "deltaSum"
description: "連続する行の算術的な差を合計します。"
---


# deltaSum

連続する行の算術的な差を合計します。差が負の場合は無視されます。

:::note
この関数が正しく機能するには、基になるデータがソートされている必要があります。この関数を [materialized view](../../../sql-reference/statements/create/view.md#materialized) で使用したい場合は、おそらく [deltaSumTimestamp](../../../sql-reference/aggregate-functions/reference/deltasumtimestamp.md#agg_functions-deltasumtimestamp) メソッドを代わりに使用することをお勧めします。
:::

**構文**

``` sql
deltaSum(value)
```

**引数**

- `value` — 入力値、[Integer](../../data-types/int-uint.md) または [Float](../../data-types/float.md) 型でなければなりません。

**返される値**

- `Integer` または `Float` 型の算術的な差の合計。

**例**

クエリ:

``` sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

結果:

``` text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

クエリ:

``` sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

結果:

``` text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

クエリ:

``` sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

結果:

``` text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```

## 関連情報 {#see-also}

- [runningDifference](../../functions/other-functions.md#other_functions-runningdifference)
