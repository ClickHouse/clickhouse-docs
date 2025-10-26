---
'description': '指定されたカラムにおけるおおよそ最も頻繁な値の配列を返します。結果の配列は、値自体によるのではなく、値のおおよその頻度の降順でソートされています。'
'sidebar_position': 202
'slug': '/sql-reference/aggregate-functions/reference/topk'
'title': 'topK'
'doc_type': 'reference'
---


# topK

指定されたカラムにおける最も頻繁に出現する値の近似を含む配列を返します。結果の配列は、値そのものではなく、値の近似頻度の降順にソートされます。

[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) アルゴリズムを実装しており、このアルゴリズムは、[Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) からの reduce-and-combine アルゴリズムに基づいて TopK を分析します。

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

この関数は、保証された結果を提供しません。特定の状況では、エラーが発生する可能性があり、最も頻繁な値ではない頻繁な値を返すことがあります。

N の値は 10 未満を推奨します。大きな N 値ではパフォーマンスが低下します。最大の N の値は 65536 です。

**パラメータ**

- `N` — 返す要素の数。オプション。デフォルト値: 10。
- `load_factor` — 値用に予約されたセルの数を定義します。uniq(column) > N * load_factor の場合、topK 関数の結果は近似値になります。オプション。デフォルト値: 3。
- `counts` — 結果に近似カウントとエラー値を含めるかどうかを定義します。

**引数**

- `column` — 頻度を計算する値。

**例**

[OnTime](../../../getting-started/example-datasets/ontime.md) データセットを取り、`AirlineID` カラムにおける最も頻繁に出現する値を三つ選択します。

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**参照**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
