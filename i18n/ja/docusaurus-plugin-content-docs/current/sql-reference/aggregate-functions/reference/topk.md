---
slug: /sql-reference/aggregate-functions/reference/topk
sidebar_position: 202
---

# topK

指定されたカラムで最も頻繁に出現する値の概ねの配列を返します。結果の配列は、値自体ではなく、値の概算頻度の降順にソートされます。

[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024)アルゴリズムを実装しており、[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003)のreduce-and-combineアルゴリズムに基づいてTopKを分析します。

``` sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は、結果を保証するものではありません。特定の状況ではエラーが発生する可能性があり、最も頻繁な値ではない頻繁な値を返すことがあります。

`N < 10` の値の使用を推奨します。大きな `N` 値でのパフォーマンスは低下します。最大値は `N = 65536` です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `load_factor` — 値のために予約されたセルの数を定義します。uniq(column) が N * load_factor より大きい場合、topK 関数の結果は概算になります。オプション。デフォルト値: 3。
- `counts` — 結果に概算のカウントと誤差値が含まれるべきかを定義します。

**引数**

- `column` — 頻度を計算する値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを取り、`AirlineID` カラムで最も頻繁に出現する3つの値を選択します。

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
