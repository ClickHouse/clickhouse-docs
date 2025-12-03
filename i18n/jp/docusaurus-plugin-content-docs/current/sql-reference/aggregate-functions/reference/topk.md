---
description: '指定された列の値のうち、おおよそ出現頻度の高いものを要素とする配列を返します。結果の配列は、値そのものではなく、値のおおよその出現頻度の降順でソートされます。'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
doc_type: 'reference'
---

# topK {#topk}

指定されたカラム内で最も頻繁に出現する値を、近似的な上位から配列として返します。結果の配列は、値そのものではなく、値の推定出現頻度の降順でソートされます。

[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) における reduce-and-combine アルゴリズムに基づき、TopK を求めるための [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) アルゴリズムを実装しています。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数の結果は保証されません。特定の状況ではエラーが発生する可能性があり、実際の最頻値ではない頻出値を返す場合があります。

`N = 65536` が最大値です。

**パラメータ**

* `N` — 返す要素数。省略可能。既定値: 10。
* `load_factor` — 値のために確保されるセル数をどの程度にするかを定義します。もし uniq(column) &gt; N * load&#95;factor の場合、topK 関数の結果は近似値になります。省略可能。既定値: 3。
* `counts` — 結果に近似的な出現回数と誤差を含めるかどうかを定義します。

**引数**

* `column` — 出現頻度を計算する対象の値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md) データセットを使用し、`AirlineID` カラムで最も頻繁に出現する値を 3 つ取得します。

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
