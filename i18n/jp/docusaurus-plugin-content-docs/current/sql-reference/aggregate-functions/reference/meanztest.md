---
description: '2つの母集団から得られた標本に対して、平均に対するZ検定を適用します。'
sidebar_label: 'meanZTest'
sidebar_position: 166
slug: /sql-reference/aggregate-functions/reference/meanztest
title: 'meanZTest'
doc_type: 'reference'
---

# meanZTest

2つの母集団からの標本に対して平均値のZ検定を適用します。

**構文**

```sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

両サンプルの値は `sample_data` 列にあります。`sample_index` が 0 の場合、その行の値は第 1 母集団からのサンプルに対応します。0 以外の場合は第 2 母集団からのサンプルに対応します。
帰無仮説は、母集団の平均が等しいというものです。分布は正規分布であると仮定します。母集団は等分散である必要はなく、分散は既知であるとします。

**引数**

* `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — サンプルインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

* `population_variance_x` — 母集団 x の分散。[Float](../../../sql-reference/data-types/float.md)。
* `population_variance_y` — 母集団 y の分散。[Float](../../../sql-reference/data-types/float.md)。
* `confidence_level` — 信頼区間を計算するための信頼水準。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

4 要素を持つ [Tuple](../../../sql-reference/data-types/tuple.md):

* 計算された t 統計量。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された p 値。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された信頼区間の下限。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された信頼区間の上限。[Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル：

```text
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

```sql
SELECT meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index) FROM mean_ztest
```

結果：

```text
┌─meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index)────────────────────────────┐
│ (3.2841296025548123,0.0010229786769086013,0.8198428246768334,3.2468238419898365) │
└──────────────────────────────────────────────────────────────────────────────────┘
```
