---
description: '指定されたカラムにおけるほぼ最も頻繁な値の配列を返します。結果の配列は、値そのものではなく、値の近似頻度の降順にソートされています。'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
---


# topK

指定されたカラムにおけるほぼ最も頻繁な値の配列を返します。結果の配列は、値そのものではなく、値の近似頻度の降順にソートされています。

[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) アルゴリズムを実装しており、[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) の reduce-and-combine アルゴリズムに基づいて TopK を分析します。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は保証された結果を提供しません。特定の状況ではエラーが発生し、最も頻繁な値ではない頻繁な値を返す可能性があります。

`N < 10` の値を使用することをお勧めします。大きな `N` 値ではパフォーマンスが低下します。`N` の最大値は `65536` です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `load_factor` — 値のために予約されたセルの数を定義します。uniq(column) > N * load_factor の場合、topK 関数の結果は近似値になります。オプション。デフォルト値: 3。
- `counts` — 結果に近似カウントとエラー値を含む必要があるかどうかを定義します。

**引数**

- `column` — 頻度を計算する値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md) データセットを使用して、`AirlineID` カラムにおける最も頻繁に発生する3つの値を選択します。

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

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
