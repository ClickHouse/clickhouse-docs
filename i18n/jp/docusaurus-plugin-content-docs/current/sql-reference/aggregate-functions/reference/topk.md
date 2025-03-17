---
slug: '/sql-reference/aggregate-functions/reference/topk'
sidebar_position: 202
title: 'topK'
description: '指定されたカラム内の約最も頻繁に出現する値の配列を返します。結果の配列は、値自体ではなく、値の近似頻度の降順にソートされます。'
---


# topK

指定されたカラム内の約最も頻繁に出現する値の配列を返します。結果の配列は、値自体ではなく、値の近似頻度の降順にソートされます。

[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) アルゴリズムを実装しており、[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) からの reduce-and-combine アルゴリズムに基づいて TopK を分析します。

``` sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は、保証された結果を提供しません。特定の状況では、エラーが発生する可能性があり、最も頻繁な値ではない頻繁に出現する値が返されることがあります。

`N < 10` の値を使用することをお勧めします。大きな `N` 値ではパフォーマンスが低下します。最大値は `N = 65536` です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `load_factor` — 値のために予約されたセルの数を定義します。もし uniq(column) > N * load_factor の場合、topK 関数の結果は近似値になります。オプション。デフォルト値: 3。
- `counts` — 結果に近似カウントと誤差値を含めるかどうかを定義します。

**引数**

- `column` — 頻度を計算する値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md) データセットを取得し、`AirlineID` カラムで最も頻繁に出現する値のうちの3つを選択します。

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
