---
'description': '指定されたカラムにおけるおおよその最頻出値とそのカウントの配列を返します。'
'sidebar_position': 107
'slug': '/sql-reference/aggregate-functions/reference/approxtopk'
'title': 'approx_top_k'
'doc_type': 'reference'
---


# approx_top_k

指定されたカラム内の約最頻値とそのカウントの配列を返します。結果の配列は、値自体ではなく、値の近似頻度の降順にソートされています。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

この関数は、保証された結果を提供しません。特定の状況では、エラーが発生する可能性があり、最頻値ではない頻繁な値を返すことがあります。

`N < 10` の値を使用することをお勧めします。大きな `N` の値ではパフォーマンスが低下します。最大の値は `N = 65536` です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `reserved` — 値のために予約されたセルの数を定義します。もし uniq(column) > reserved の場合、topK 関数の結果は近似的になります。オプション。デフォルト値: N * 3。
 
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

`approx_top_k` 関数のエイリアスです。

**関連項目**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
