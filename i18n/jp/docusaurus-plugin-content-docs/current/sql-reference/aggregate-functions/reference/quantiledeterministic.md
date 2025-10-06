---
'description': '数値データ系列の近似分位数を計算します。'
'sidebar_position': 172
'slug': '/sql-reference/aggregate-functions/reference/quantiledeterministic'
'title': 'quantileDeterministic'
'doc_type': 'reference'
---


# quantileDeterministic

数値データシーケンスの近似[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、8192 までのリザーバーサイズを持つ[リザーバーサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用し、サンプリングのための決定論的アルゴリズムを使用します。結果は決定論的です。正確な分位点を得るには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 関数を使用してください。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は統合されません（つまり、クエリは本来の効率よりも低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileDeterministic(level)(expr, determinator)
```

別名: `medianDeterministic`.

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0 から 1 までの定数浮動小数点数。 `[0.01, 0.99]` の範囲の `level` 値を使用することをお勧めします。デフォルト値: 0.5。 `level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](/sql-reference/data-types)や[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md) 型のカラムの値に対する式。
- `determinator` — リザーバーサンプリングアルゴリズムにおいてランダム数生成器の代わりに使用されるハッシュ値を持つ数。これにより、サンプリングの結果が決定論的になります。決定子として、ユーザー ID やイベント ID のような任意の決定論的正の数を使用できます。同じ決定子の値が頻繁に発生すると、関数は正しく機能しません。

**返される値**

- 指定されたレベルの近似分位点。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

クエリ:

```sql
SELECT quantileDeterministic(val, 1) FROM t
```

結果:

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
