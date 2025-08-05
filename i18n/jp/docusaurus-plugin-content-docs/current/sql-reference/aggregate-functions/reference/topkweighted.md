---
description: '指定されたカラム内のおおよそ最も頻繁に出現する値の配列を返します。結果の配列は値自体ではなく、おおよその出現頻度の降順でソートされます。さらに、値の重みも考慮されます。'
sidebar_position: 203
slug: '/sql-reference/aggregate-functions/reference/topkweighted'
title: 'topKWeighted'
---




# topKWeighted

指定されたカラム内の約最も頻繁な値の配列を返します。結果の配列は、値自体ではなく、値の近似頻度の降順でソートされます。さらに、値の重みも考慮されます。

**構文**

```sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `load_factor` — 値のために予約されるセルの数を定義します。もし uniq(column) > N * load_factor の場合、topK 関数の結果は近似値になります。オプション。デフォルト値: 3。
- `counts` — 結果に近似カウントと誤差値を含むべきかどうかを定義します。

**引数**

- `column` — 値。
- `weight` — 重み。各値は頻度計算のために `weight` 回考慮されます。 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**返される値**

最大の近似重みの合計を持つ値の配列を返します。

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

**関連項目**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
