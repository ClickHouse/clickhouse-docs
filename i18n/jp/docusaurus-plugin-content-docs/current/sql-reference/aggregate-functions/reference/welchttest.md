---
slug: /sql-reference/aggregate-functions/reference/welchttest
sidebar_position: 214
sidebar_label: welchTTest
title: 'welchTTest'
description: '2つの母集団からのサンプルにWelchのt検定を適用します。'
---


# welchTTest

2つの母集団からのサンプルにWelchのt検定を適用します。

**構文**

``` sql
welchTTest([confidence_level])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。 `sample_index` が 0 の場合、その行の値は最初の母集団からのサンプルに属します。そうでない場合は、2番目の母集団からのサンプルに属します。
帰無仮説は、母集団の平均が等しいことです。正規分布が仮定されています。母集団は異なる分散を持つ場合があります。

**引数**

- `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `confidence_level` — 信頼区間を計算するための信頼レベル。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

[Tuple](../../../sql-reference/data-types/tuple.md) で、要素は2つまたは4つ（オプションの `confidence_level` が指定された場合）

- 計算された t 統計量。[Float64](../../../sql-reference/data-types/float.md)。
- 計算された p 値。[Float64](../../../sql-reference/data-types/float.md)。
- 計算された信頼区間下限。[Float64](../../../sql-reference/data-types/float.md)。
- 計算された信頼区間上限。[Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル:

``` text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        22.1 │            0 │
│        21.9 │            0 │
│        18.9 │            1 │
│        20.3 │            1 │
│          19 │            1 │
└─────────────┴──────────────┘
```

クエリ:

``` sql
SELECT welchTTest(sample_data, sample_index) FROM welch_ttest;
```

結果:

``` text
┌─welchTTest(sample_data, sample_index)─────┐
│ (2.7988719532211235,0.051807360348581945) │
└───────────────────────────────────────────┘
```

**参照**

- [Welchのt検定](https://en.wikipedia.org/wiki/Welch%27s_t-test)
- [studentTTest関数](/sql-reference/aggregate-functions/reference/studentttest)
