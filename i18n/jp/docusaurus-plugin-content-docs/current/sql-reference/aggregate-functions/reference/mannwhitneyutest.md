---
slug: /sql-reference/aggregate-functions/reference/mannwhitneyutest
sidebar_position: 161
sidebar_label: mannWhitneyUTest
title: "mannWhitneyUTest"
description: "2つの母集団からのサンプルに対してMann-Whitneyランク検定を適用します。"
---


# mannWhitneyUTest

2つの母集団からのサンプルに対してMann-Whitneyランク検定を適用します。

**構文**

``` sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。 `sample_index` が 0 の場合、その行の値は最初の母集団からのサンプルに属します。そうでない場合は、2番目の母集団からのサンプルに属します。
帰無仮説は、2つの母集団が確率的に等しいというものです。また、片側仮説も検定することができます。この検定は、データが正規分布に従っていると仮定しません。

**引数**

- `sample_data` — サンプルデータ。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。[整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `alternative` — 対立仮説。（オプション、デフォルト: `'two-sided'`。）[文字列](../../../sql-reference/data-types/string.md)。
    - `'two-sided'`;
    - `'greater'`;
    - `'less'`。
- `continuity_correction` — 0 でない場合、p値の正規近似における連続性補正が適用されます。（オプション、デフォルト: 1。）[UInt64](../../../sql-reference/data-types/int-uint.md)。

**戻り値**

[タプル](../../../sql-reference/data-types/tuple.md)で、2つの要素を持ちます：

- 計算された U 統計量。[Float64](../../../sql-reference/data-types/float.md)。
- 計算された p 値。[Float64](../../../sql-reference/data-types/float.md)。


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

**参照**

- [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [Stochastic ordering](https://en.wikipedia.org/wiki/Stochastic_ordering)
