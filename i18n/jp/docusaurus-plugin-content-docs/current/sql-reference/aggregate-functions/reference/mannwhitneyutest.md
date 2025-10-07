---
'description': '2つの母集団からのサンプルに対してMann-Whitney順位検定を適用します。'
'sidebar_label': 'mannWhitneyUTest'
'sidebar_position': 161
'slug': '/sql-reference/aggregate-functions/reference/mannwhitneyutest'
'title': 'mannWhitneyUTest'
'doc_type': 'reference'
---


# mannWhitneyUTest

二つの母集団からのサンプルに対してMann-Whitney順位検定を適用します。

**構文**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

両方のサンプルの値は`sample_data`カラムにあります。`sample_index`が0の場合、該当行の値は最初の母集団からのサンプルに属します。それ以外の場合は、第二の母集団からのサンプルに属します。
帰無仮説は二つの母集団が確率的に等しいことです。また、一方の仮説を検定することもできます。このテストはデータが正規分布していることを仮定しません。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md)、 [浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `alternative` — 対立仮説。 (オプション、デフォルト: `'two-sided'`.) [文字列](../../../sql-reference/data-types/string.md)。
  - `'two-sided'`；
  - `'greater'`；
  - `'less'`。
- `continuity_correction` — 0でない場合、p値の正規近似に対して連続性修正が適用されます。 (オプション、デフォルト: 1.) [UInt64](../../../sql-reference/data-types/int-uint.md)。

**戻り値**

[タプル](../../../sql-reference/data-types/tuple.md)で二つの要素を含みます：

- 計算されたU統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。 [Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル：

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

クエリ：

```sql
SELECT mannWhitneyUTest('greater')(sample_data, sample_index) FROM mww_ttest;
```

結果：

```text
┌─mannWhitneyUTest('greater')(sample_data, sample_index)─┐
│ (9,0.04042779918503192)                                │
└────────────────────────────────────────────────────────┘
```

**関連情報**

- [Mann–Whitney Uテスト](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [確率的順序付け](https://en.wikipedia.org/wiki/Stochastic_ordering)
