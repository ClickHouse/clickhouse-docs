---
'description': '指定されたカラム内でおおよそ最も頻繁に出現する値の配列を返します。結果の配列は、値自体ではなく、値の大まかな頻度の降順でソートされます。加えて、値の重みも考慮されます。'
'sidebar_position': 203
'slug': '/sql-reference/aggregate-functions/reference/topkweighted'
'title': 'topKWeighted'
'doc_type': 'reference'
---


# topKWeighted

指定されたカラムの約最頻出値の配列を返します。結果の配列は、値そのものではなく、値の近似的な頻度の降順でソートされます。さらに、値の重みも考慮されます。

**構文**

```sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**パラメータ**

- `N` — 戻り値の要素数。オプション。デフォルト値: 10。
- `load_factor` — 値のために予約されているセルの数を定義します。uniq(column) > N * load_factor の場合、topK 関数の結果は近似的になります。オプション。デフォルト値: 3。
- `counts` — 結果に近似的なカウントと誤差値を含めるべきかを定義します。

**引数**

- `column` — 値。
- `weight` — 重み。各値は頻度計算のために `weight` 回カウントされます。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**返される値**

最大の近似的重みの合計を持つ値の配列を返します。

**例**

クエリ:

```sql
SELECT topKWeighted(2)(k, w) FROM
VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果:

```text
┌─topKWeighted(2)(k, w)──┐
│ ['z','x']              │
└────────────────────────┘
```

クエリ:

```sql
SELECT topKWeighted(2, 10, 'counts')(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果:

```text
┌─topKWeighted(2, 10, 'counts')(k, w)─┐
│ [('z',10,0),('x',5,0)]              │
└─────────────────────────────────────┘
```

**参照**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
