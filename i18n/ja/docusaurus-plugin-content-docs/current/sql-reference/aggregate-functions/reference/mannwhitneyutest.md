---
slug: /sql-reference/aggregate-functions/reference/mannwhitneyutest
sidebar_position: 161
sidebar_label: mannWhitneyUTest
---

# mannWhitneyUTest

Mann-Whitneyのランク検定を二つの集団からのサンプルに適用します。

**構文**

``` sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。`sample_index` が 0 の場合、その行の値は最初の集団からのサンプルに属します。そうでない場合、その値は第二の集団からのサンプルに属します。
帰無仮説は、二つの集団が確率的に等しいというものです。また、一方向の仮説も検定できます。このテストはデータが正規分布であるという仮定をしません。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)または[十進数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `alternative` — 対立仮説。 (オプション、デフォルト: `'two-sided'`.) [文字列](../../../sql-reference/data-types/string.md)。
    - `'two-sided'`;
    - `'greater'`;
    - `'less'`。
- `continuity_correction` — 0でない場合、p値の正規近似における連続補正が適用されます。 (オプション、デフォルト: 1.) [UInt64](../../../sql-reference/data-types/int-uint.md)。

**返される値**

[タプル](../../../sql-reference/data-types/tuple.md)で、二つの要素から成ります：

- 計算されたU統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。 [Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル：

``` text
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

``` sql
SELECT mannWhitneyUTest('greater')(sample_data, sample_index) FROM mww_ttest;
```

結果：

``` text
┌─mannWhitneyUTest('greater')(sample_data, sample_index)─┐
│ (9,0.04042779918503192)                                │
└────────────────────────────────────────────────────────┘
```

**関連情報**

- [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [Stochastic ordering](https://en.wikipedia.org/wiki/Stochastic_ordering)
