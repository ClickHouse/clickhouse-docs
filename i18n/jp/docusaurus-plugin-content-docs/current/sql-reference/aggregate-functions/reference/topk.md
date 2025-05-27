---
'description': 'Returns an array of the approximately most frequent values in the
  specified column. The resulting array is sorted in descending order of approximate
  frequency of values (not by the values themselves).'
'sidebar_position': 202
'slug': '/sql-reference/aggregate-functions/reference/topk'
'title': 'topK'
---




# topK

指定したカラムの最も頻繁に出現する値の配列を返します。結果の配列は、値自体ではなく、近似頻度の降順でソートされています。

これは、[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024)アルゴリズムを使用してTopKを分析しており、[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003)からのreduce-and-combineアルゴリズムに基づいています。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は、保証された結果を提供しません。特定の状況では、エラーが発生し、最も頻繁な値でない頻出値を返すことがあります。

`N < 10`の値を使用することをお勧めします。大きな`N`値ではパフォーマンスが低下します。最大値の`N = 65536`です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値：10。
- `load_factor` — 値のために予約されたセルの数を定義します。uniq(column) > N * load_factorの場合、topK関数の結果は近似になります。オプション。デフォルト値：3。
- `counts` — 結果に近似カウントとエラー値が含まれるべきかを定義します。

**引数**

- `column` — 頻度を計算するための値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md)データセットを取得し、`AirlineID`カラムで最も頻繁に発生する3つの値を選択します。

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**関連情報**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
