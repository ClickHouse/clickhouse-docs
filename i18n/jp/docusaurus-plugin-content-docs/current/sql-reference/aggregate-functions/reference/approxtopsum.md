---
'description': '指定されたカラムの中で、約最も頻繁に出現する値とそのカウントの配列を返します。'
'sidebar_position': 108
'slug': '/sql-reference/aggregate-functions/reference/approxtopsum'
'title': 'approx_top_sum'
'doc_type': 'reference'
---


# approx_top_sum

指定されたカラムでおおよそ最も頻繁な値とそのカウントの配列を返します。結果の配列は、値自体ではなく、値の近似頻度の降順でソートされます。さらに、値の重みも考慮されます。

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

この関数は保証された結果を提供しません。特定の状況では、エラーが発生し、最も頻繁な値ではない頻繁な値を返す可能性があります。

`N < 10`の値を使用することをお勧めします。大きな`N`の値ではパフォーマンスが低下します。最大値の`N`は65536です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `reserved` — 値に対して予約されるセルの数を定義します。uniq(column) > reserved の場合、topK関数の結果は近似的になります。オプション。デフォルト値: N * 3。

**引数**

- `column` — 頻度を計算するための値。
- `weight` — 重み。すべての値は、頻度計算のために`weight`回カウントされます。[UInt64](../../../sql-reference/data-types/int-uint.md)。

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

**関連情報**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
