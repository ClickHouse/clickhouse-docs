---
slug: /sql-reference/aggregate-functions/reference/approxtopsum
sidebar_position: 108
---

# approx_top_sum

指定されたカラムにおいて、約最も頻繁に出現する値とそのカウントの配列を返します。結果の配列は、値自体ではなく、値の概算頻度の降順にソートされます。さらに、値の重みも考慮されます。

``` sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

この関数は、保証された結果を提供しません。特定の状況では、エラーが発生する可能性があり、最も頻繁な値でない頻繁な値が返されることがあります。

`N < 10` の値を使用することをお勧めします。大きな `N` 値ではパフォーマンスが低下します。最大値の `N = 65536` です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `reserved` — 値のために予約されたセルの数を定義します。もし uniq(column) > reserved の場合、topK 関数の結果は概算になります。オプション。デフォルト値: N * 3。
 
**引数**

- `column` — 頻度を計算する値。
- `weight` — 重み。各値は頻度計算のために `weight` 回考慮されます。 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**例**

クエリ:

``` sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果:

``` text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**関連情報**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
