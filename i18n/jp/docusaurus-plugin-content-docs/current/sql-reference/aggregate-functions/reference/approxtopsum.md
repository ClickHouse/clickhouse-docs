---
description: '指定された列において、おおよそ最も頻出する値とその出現回数を配列で返します。'
sidebar_position: 108
slug: /sql-reference/aggregate-functions/reference/approxtopsum
title: 'approx_top_sum'
doc_type: 'reference'
---

# approx&#95;top&#95;sum

指定した列において、概ね最も頻出する値とそのカウントを要素とする配列を返します。結果の配列は、値そのものではなく、値の近似的な出現頻度に基づいて降順にソートされます。さらに、値の重みも考慮されます。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

この関数は結果を保証するものではありません。特定の状況では誤りが生じる可能性があり、最頻値ではない値を頻出値として返す場合があります。

`N < 10` の値を使用することを推奨します。`N` の値が大きいとパフォーマンスが低下します。`N` の最大値は `65536` です。

**パラメータ**

* `N` — 返される要素数。省略可能。デフォルト値: 10。
* `reserved` — 値のために確保するセル数を指定します。もし uniq(column) &gt; `reserved` の場合、topK 関数の結果は近似値になります。省略可能。デフォルト値: N * 3。

**引数**

* `column` — 出現頻度を計算する対象の値。
* `weight` — 重み。各値は頻度計算において `weight` 回分としてカウントされます。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果：

```text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**関連項目**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
