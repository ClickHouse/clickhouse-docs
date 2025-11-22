---
description: '2つの母集団から得られた標本にスチューデントのt検定を適用します。'
sidebar_label: 'studentTTest'
sidebar_position: 194
slug: /sql-reference/aggregate-functions/reference/studentttest
title: 'studentTTest'
doc_type: 'reference'
---

# studentTTest

2 つの母集団からの標本に対してスチューデントの t 検定を適用します。

**構文**

```sql
studentTTest([confidence_level])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` 列に格納されています。`sample_index` が 0 の場合、その行の値は第 1 母集団からのサンプルに属します。そうでない場合は第 2 母集団からのサンプルに属します。
帰無仮説は、母集団の平均が等しいというものです。同じ分散を持つ正規分布であると仮定します。

**引数**

* `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — サンプルインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

* `confidence_level` — 信頼区間を計算するための信頼水準。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

[Tuple](../../../sql-reference/data-types/tuple.md) 型で、要素数は 2 つまたは 4 つ（省略可能な `confidence_level` が指定された場合は 4 つ）:

* 計算された t-統計量。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された p 値。[Float64](../../../sql-reference/data-types/float.md)。
* [計算された信頼区間下限。[Float64](../../../sql-reference/data-types/float.md)。]
* [計算された信頼区間上限。[Float64](../../../sql-reference/data-types/float.md)。]

**例**

入力テーブル:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.1 │            0 │
│        21.9 │            1 │
│        21.7 │            0 │
│        19.9 │            1 │
│        21.8 │            1 │
└─────────────┴──────────────┘
```

クエリ:

```sql
SELECT studentTTest(sample_data, sample_index) FROM student_ttest;
```

結果：

```text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**関連項目**

* [スチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test)
* [welchTTest 関数](/sql-reference/aggregate-functions/reference/welchttest)
