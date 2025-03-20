---
slug: /sql-reference/aggregate-functions/reference/meanztest
sidebar_position: 166
sidebar_label: meanZTest
title: "meanZTest"
description: "2つの母集団からのサンプルに平均z検定を適用します。"
---


# meanZTest

2つの母集団からのサンプルに平均z検定を適用します。

**構文**

``` sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。`sample_index` が 0 の場合、その行の値は最初の母集団からのサンプルに属します。それ以外の場合、値は2番目の母集団からのサンプルに属します。
帰無仮説は、母集団の平均が等しいというものです。正規分布が仮定されています。母集団は不均一な分散を持つ可能性があり、分散は既知です。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md)、または [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `population_variance_x` — 母集団xの分散。 [浮動小数点数](../../../sql-reference/data-types/float.md)。
- `population_variance_y` — 母集団yの分散。 [浮動小数点数](../../../sql-reference/data-types/float.md)。
- `confidence_level` — 信頼区間を計算するための信頼レベル。 [浮動小数点数](../../../sql-reference/data-types/float.md)。

**返される値**

[タプル](../../../sql-reference/data-types/tuple.md)で4つの要素を含みます：

- 計算されたt統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算された信頼区間下限。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算された信頼区間上限。 [Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル：

``` text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.9 │            0 │
│        22.1 │            0 │
│        18.9 │            1 │
│          19 │            1 │
│        20.3 │            1 │
└─────────────┴──────────────┘
```

クエリ：

``` sql
SELECT meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index) FROM mean_ztest
```

結果：

``` text
┌─meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index)────────────────────────────┐
│ (3.2841296025548123,0.0010229786769086013,0.8198428246768334,3.2468238419898365) │
└──────────────────────────────────────────────────────────────────────────────────┘
```
