---
'description': 'Applies the Mann-Whitney rank test to samples from two populations.'
'sidebar_label': 'mannWhitneyUTest'
'sidebar_position': 161
'slug': '/sql-reference/aggregate-functions/reference/mannwhitneyutest'
'title': 'mannWhitneyUTest'
---




# mannWhitneyUTest

2つの母集団からのサンプルに対してMann-Whitneyランクテストを適用します。

**構文**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。もし `sample_index` が0に等しい場合、その行の値は最初の母集団からのサンプルに属します。それ以外の場合は2番目の母集団からのサンプルに属します。
帰無仮説は、2つの母集団が確率的に等しいというものです。また、片側の仮説もテストできます。このテストはデータが正規分布していると仮定しません。

**引数**

- `sample_data` — サンプルデータ。 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)です。
- `sample_index` — サンプルインデックス。 [Integer](../../../sql-reference/data-types/int-uint.md)です。

**パラメータ**

- `alternative` — 対立仮説。 (オプション、デフォルト: `'two-sided'`。) [String](../../../sql-reference/data-types/string.md)。
    - `'two-sided'`;
    - `'greater'`;
    - `'less'`.
- `continuity_correction` — 0でない場合、p値の正規近似において連続性補正が適用されます。 (オプション、デフォルト: 1。) [UInt64](../../../sql-reference/data-types/int-uint.md)。

**返される値**

[Tuple](../../../sql-reference/data-types/tuple.md)の2つの要素:

- 計算されたU統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。 [Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル:

```text
┌─sample_data─┬─sample_index─┐
│          10 │            0 │
│          11 │            0 │
│          12 │            0 │
│           1 │            1 │
│           2 │            1 │
│           3 │            1 │
└─────────────┴──────────────┘
```

クエリ:

```sql
SELECT mannWhitneyUTest('greater')(sample_data, sample_index) FROM mww_ttest;
```

結果:

```text
┌─mannWhitneyUTest('greater')(sample_data, sample_index)─┐
│ (9,0.04042779918503192)                                │
└────────────────────────────────────────────────────────┘
```

**関連項目**

- [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [Stochastic ordering](https://en.wikipedia.org/wiki/Stochastic_ordering)
