---
description: '指定されたカラム内で、おおよそ出現頻度が最も高い値の配列を返します。返される配列は、値そのものではなく、推定される出現頻度の高い順（降順）にソートされます。さらに、値の重みも考慮されます。'
sidebar_position: 203
slug: /sql-reference/aggregate-functions/reference/topkweighted
title: 'topKWeighted'
doc_type: 'reference'
---

# topKWeighted

指定された列において、おおよそ最も頻繁に出現する値の配列を返します。返される配列は、値そのものではなく、値のおおよその出現頻度の降順でソートされます。また、値の重みも考慮されます。

**構文**

```sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**パラメータ**

* `N` — 返される要素数。省略可能。デフォルト値: 10。
* `load_factor` — 値のために予約されるセル数を指定します。`uniq(column) > N * load_factor` の場合、`topK` 関数の結果は近似値になります。省略可能。デフォルト値: 3。
* `counts` — 結果に近似的なカウント値と誤差を含めるかどうかを指定します。

**引数**

* `column` — 値。
* `weight` — 重み。各値は頻度計算において `weight` 回分としてカウントされます。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**戻り値**

重みの近似合計が最大となる値の配列を返します。

**例**

クエリ:

```sql
SELECT topKWeighted(2)(k, w) FROM
VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果：

```text
┌─topKWeighted(2)(k, w)──┐
│ ['z','x']              │
└────────────────────────┘
```

クエリ：

```sql
SELECT topKWeighted(2, 10, 'counts')(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

結果：

```text
┌─topKWeighted(2, 10, 'counts')(k, w)─┐
│ [('z',10,0),('x',5,0)]              │
└─────────────────────────────────────┘
```

**関連項目**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
