---
description: '2つの母集団から得られた標本に Welch の t 検定を適用します。'
sidebar_label: 'welchTTest'
sidebar_position: 214
slug: /sql-reference/aggregate-functions/reference/welchttest
title: 'welchTTest'
doc_type: 'reference'
---

# welchTTest

2つの母集団からの標本に Welch の t 検定を適用します。

**構文**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。`sample_index` が 0 の場合、その行の値は第1母集団からのサンプルに属します。それ以外の場合は第2母集団からのサンプルに属します。
帰無仮説は、母集団の平均が等しいというものです。母集団は正規分布に従うと仮定します。母集団の分散は等しくない場合があります。

**引数**

* `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — サンプルのインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

* `confidence_level` — 信頼区間を計算するための信頼水準。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

[Tuple](../../../sql-reference/data-types/tuple.md)。要素数は 2 つまたは 4 つ（オプションの `confidence_level` が指定されている場合は 4 つ）

* 計算された t統計量。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された p値。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された信頼区間の下限。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された信頼区間の上限。[Float64](../../../sql-reference/data-types/float.md)。

**例**

入力テーブル：

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        22.1 │            0 │
│        21.9 │            0 │
│        18.9 │            1 │
│        20.3 │            1 │
│          19 │            1 │
└─────────────┴──────────────┘
```

クエリ：

```sql
SELECT welchTTest(sample_data, sample_index) FROM welch_ttest;
```

結果：

```text
┌─welchTTest(sample_data, sample_index)─────┐
│ (2.7988719532211235,0.051807360348581945) │
└───────────────────────────────────────────┘
```

**関連項目**

* [Welch&#39;s t-test](https://en.wikipedia.org/wiki/Welch%27s_t-test)
* [studentTTest 関数](/sql-reference/aggregate-functions/reference/studentttest)
