---
slug: /sql-reference/aggregate-functions/reference/topk
sidebar_position: 202
title: "topK"
description: "指定されたカラムでおおよそ最も頻繁に出現する値の配列を返します。結果の配列は値自体ではなく、値のおおよその頻度の降順でソートされています。"
---


# topK

指定されたカラムでおおよそ最も頻繁に出現する値の配列を返します。結果の配列は値自体ではなく、値のおおよその頻度の降順でソートされています。

[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024)アルゴリズムを使用してTopKを分析します。このアルゴリズムは、[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003)からのreduce-and-combineアルゴリズムに基づいています。

``` sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は、保証された結果を提供しません。特定の状況では、エラーが発生し、最も頻繁な値ではない頻繁な値を返す可能性があります。

`N < 10`の値を使用することを推奨します。大きな`N`の値ではパフォーマンスが低下します。`N`の最大値は`65536`です。

**パラメータ**

- `N` — 返す要素の数。オプショナル。デフォルト値: 10。
- `load_factor` — 値のために予約されたセルの数を定義します。もしuniq(column) > N * load_factorの場合、topK関数の結果は近似値になります。オプショナル。デフォルト値: 3。
- `counts` — 結果に近似カウントとエラー値を含めるべきかを定義します。

**引数**

- `column` — 頻度を計算する値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを使用し、`AirlineID`カラムで最も頻繁に出現する3つの値を選択します。

``` sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

``` text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**関連項目**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
