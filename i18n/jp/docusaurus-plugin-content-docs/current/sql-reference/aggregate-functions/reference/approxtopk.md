---
description: '指定されたカラム内で、おおよそ最も頻繁に現れる値とその出現回数の配列を返します。'
sidebar_position: 107
slug: /sql-reference/aggregate-functions/reference/approxtopk
title: 'approx_top_k'
doc_type: 'reference'
---

# approx&#95;top&#95;k

指定された列において、頻度が高い値とその出現回数を近似的に求め、その配列を返します。結果の配列は、値そのものではなく、値の近似出現頻度の降順でソートされます。

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

この関数の結果は保証されているわけではありません。特定の状況ではエラーが発生したり、最頻値ではない値を頻出値として返す場合があります。

`N < 10` の値を使用することを推奨します。`N` の値が大きくなるとパフォーマンスが低下します。`N` の最大値は `65536` です。

**パラメータ**

* `N` — 返す要素数。省略可能。デフォルト値: 10。
* `reserved` — 値のために予約されるセル数を定義します。もし `uniq(column) &gt; reserved` の場合、`topK` 関数の結果は近似値となります。省略可能。デフォルト値: `N * 3`。

**引数**

* `column` — 出現頻度を計算する対象の値。

**例**

クエリ:

```sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

結果：

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