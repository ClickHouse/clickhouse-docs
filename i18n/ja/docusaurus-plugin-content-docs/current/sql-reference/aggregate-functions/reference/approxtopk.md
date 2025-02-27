---
slug: /sql-reference/aggregate-functions/reference/approxtopk
sidebar_position: 107
---

# approx_top_k

指定したカラムにおける、概ね最も頻繁な値とそのカウントの配列を返します。結果の配列は、値自体ではなく、値の概算頻度の降順にソートされます。


```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

この関数は保証された結果を提供しません。特定の状況ではエラーが発生することがあり、最も頻繁な値ではない頻繁な値を返す場合があります。

`N < 10` の値を使用することをお勧めします。大きな `N` 値を使用するとパフォーマンスが低下します。最大値は `N = 65536` です。

**パラメータ**

- `N` — 戻り値の要素数。オプショナル。デフォルト値は 10。
- `reserved` — 値用に予約されたセルの数を定義します。`uniq(column) > reserved` の場合、topK 関数の結果は概算になります。オプショナル。デフォルト値は `N * 3`。

**引数**

- `column` — 頻度を計算する値。

**例**

クエリ:

```sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

結果:

```text
┌─approx_top_k(2)(k)────┐
│ [('y',3,0),('x',1,0)] │
└───────────────────────┘
```

# approx_top_count

`approx_top_k` 関数へのエイリアスです。

**関連項目**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
