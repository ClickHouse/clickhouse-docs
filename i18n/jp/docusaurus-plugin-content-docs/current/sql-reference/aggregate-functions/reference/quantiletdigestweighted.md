---
'description': '数値データシーケンスの近似的な分位数をt-digestアルゴリズムを使用して計算します。'
'sidebar_position': 179
'slug': '/sql-reference/aggregate-functions/reference/quantiletdigestweighted'
'title': 'quantileTDigestWeighted'
'doc_type': 'reference'
---


# quantileTDigestWeighted

数値データシーケンスの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)アルゴリズムを使用して算出します。この関数は、各シーケンスメンバーの重みを考慮に入れます。最大誤差は1%です。メモリ消費は`log(n)`で、ここで`n`は値の数です。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile)や[quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)のパフォーマンスよりも低いです。状態サイズと精度の比率という点では、この関数は`quantile`よりもはるかに優れています。

結果はクエリの実行順序に依存し、非決定的です。

異なるレベルの複数の`quantile*`関数をクエリ内で使用すると、内部状態は結合されません（つまり、クエリは本来可能なよりも効率的ではありません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

:::note    
`tiny data sets`に対して`quantileTDigestWeighted`の使用は[推奨されません](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)であり、重大な誤差を引き起こす可能性があります。この場合は、[`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)の使用を検討してください。
:::

**構文**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`.

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1の範囲の定数浮動小数点数。`[0.01, 0.99]`の範囲の`level`値の使用を推奨します。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を算出します。
- `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。
- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

結果:

```text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
