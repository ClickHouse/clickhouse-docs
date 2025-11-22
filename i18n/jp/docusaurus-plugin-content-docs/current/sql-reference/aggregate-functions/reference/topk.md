---
description: '指定されたカラム内の、おおよそ最頻出の値の配列を返します。結果の配列は、（値そのものではなく）値のおおよその出現頻度が高い順にソートされます。'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
doc_type: 'reference'
---

# topK

指定された列内で、おおよそ最も頻出する値の配列を返します。返される配列は、値そのものではなく、値の出現頻度の概算値に基づく降順でソートされています。

TopK を求めるために [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) アルゴリズムを実装しており、これは [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) における reduce-and-combine アルゴリズムに基づいています。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は結果が保証されるわけではありません。特定の状況ではエラーが発生する場合があり、最頻値ではない値を頻出値として返すことがあります。

`N < 10` の値を使用することを推奨します。`N` を大きくするとパフォーマンスが低下します。`N` の最大値は `65536` です。

**パラメータ**

* `N` — 返す要素数。省略可能。デフォルト値: 10。
* `load_factor` — 値のために確保されるセルの数を定義します。もし uniq(column) &gt; N * load&#95;factor の場合、topK 関数の結果は近似値になります。省略可能。デフォルト値: 3。
* `counts` — 結果に近似的な件数と誤差値を含めるかどうかを定義します。

**引数**

* `column` — 出現頻度を計算する対象の値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md) データセットを使用し、`AirlineID` 列において最も頻繁に出現する値を 3 つ取得します。

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**関連項目**

* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
