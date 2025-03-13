---
slug: /sql-reference/aggregate-functions/reference/approxtopk
sidebar_position: 107
title: "approx_top_k"
description: "指定されたカラム内でおおよそ最も頻繁な値とそのカウントの配列を返します。"
---


# approx_top_k

指定されたカラム内でおおよそ最も頻繁な値とそのカウントの配列を返します。結果の配列は、値そのものではなく、おおよその頻度の降順でソートされます。

``` sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

この関数は保証された結果を提供しません。特定の状況ではエラーが発生し、最も頻繁な値ではない頻繁な値を返すことがあります。

`N < 10`の値を使用することをお勧めします。大きな`N`の値ではパフォーマンスが低下します。`N`の最大値は`65536`です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `reserved` — 値のために予約されたセルの数を定義します。`uniq(column) > reserved`の場合、`topK`関数の結果はおおよそになります。オプション。デフォルト値: `N * 3`。

**引数**

- `column` — 頻度を計算する値。

**例**

クエリ:

``` sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

結果:

``` text
┌─approx_top_k(2)(k)────┐
│ [('y',3,0),('x',1,0)] │
└───────────────────────┘
```


# approx_top_count

`approx_top_k`関数のエイリアスです。

**参照**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
