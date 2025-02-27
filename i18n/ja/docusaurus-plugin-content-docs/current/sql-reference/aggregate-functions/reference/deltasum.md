---
slug: /sql-reference/aggregate-functions/reference/deltasum
sidebar_position: 129
---

# deltaSum

連続した行の算術的差分を合計します。差分が負の場合は無視されます。

:::note
この関数が正しく動作するためには、基となるデータがソートされている必要があります。この関数を[物化ビュー](../../../sql-reference/statements/create/view.md#materialized)で使用したい場合は、代わりに[deltaSumTimestamp](../../../sql-reference/aggregate-functions/reference/deltasumtimestamp.md#agg_functions-deltasumtimestamp)メソッドを使用することをお勧めします。
:::

**構文**

``` sql
deltaSum(value)
```

**引数**

- `value` — 入力値。[整数](../../data-types/int-uint.md)または[浮動小数点数](../../data-types/float.md)型である必要があります。

**返される値**

- `Integer`または`Float`型の算術的差分の合計。

**例**

クエリ：

``` sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

結果：

``` text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

クエリ：

``` sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

結果：

``` text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

クエリ：

``` sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

結果：

``` text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```

## 関連項目 {#see-also}

- [runningDifference](../../functions/other-functions.md#other_functions-runningdifference)
