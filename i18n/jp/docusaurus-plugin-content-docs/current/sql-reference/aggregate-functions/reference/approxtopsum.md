---
description: '指定した列における、おおよそ最頻出の値とその出現回数の配列を返します。'
sidebar_position: 108
slug: /sql-reference/aggregate-functions/reference/approxtopsum
title: 'approx_top_sum'
doc_type: 'reference'
---

# approx&#95;top&#95;sum

指定された列において、ほぼ最頻出の値とその出現回数を含む配列を返します。結果の配列は、値そのものではなく、値のおおよその出現頻度に基づいて降順にソートされます。さらに、値の重み付けも考慮されます。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

この関数の結果は保証されません。特定の状況では誤りが発生し、最頻値ではない値を頻度の高い値として返す場合があります。

`N < 10` の値を使用することを推奨します。`N` が大きいとパフォーマンスが低下します。`N` の最大値は `65536` です。

**パラメータ**

* `N` — 返す要素数。省略可能。既定値: 10。
* `reserved` — 値のために確保するセル数を定義します。`uniq(column) > reserved` の場合、`topK` 関数の結果は近似値になります。省略可能。既定値: `N * 3`。

**引数**

* `column` — 出現頻度を計算する対象の値。
* `weight` — 重み。各値は頻度計算において `weight` 回出現したものとして扱われます。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果:

```text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**関連項目**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
