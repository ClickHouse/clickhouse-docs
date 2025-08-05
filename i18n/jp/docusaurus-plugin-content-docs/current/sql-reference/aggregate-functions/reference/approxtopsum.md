---
description: 'Returns an array of the approximately most frequent values and their
  counts in the specified column.'
sidebar_position: 108
slug: '/sql-reference/aggregate-functions/reference/approxtopsum'
title: 'approx_top_sum'
---




# approx_top_sum

指定されたカラムの約最頻出値とそのカウントの配列を返します。結果の配列は、値自体ではなく、値の近似頻度の降順でソートされます。さらに、値の重みも考慮されます。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

この関数は保証された結果を提供しません。特定の状況では、エラーが発生する可能性があり、最も頻繁な値ではない頻出値を返すことがあります。

`N < 10` の値を使用することをお勧めします。大きな `N` の場合、パフォーマンスが低下します。`N` の最大値は 65536 です。

**パラメータ**

- `N` — 返す要素の数。オプションです。デフォルト値は 10 です。
- `reserved` — 値のために予約されるセルの数を定義します。もし uniq(column) > reserved であれば、topK 関数の結果は近似値になります。オプションです。デフォルト値は N * 3 です。

**引数**

- `column` — 頻度を計算する値。
- `weight` — 重み。各値は頻度計算のために `weight` 回カウントされます。 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**例**

クエリ：

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

**関連情報**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
