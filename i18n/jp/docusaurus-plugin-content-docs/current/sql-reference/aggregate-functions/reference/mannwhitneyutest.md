---
description: '2つの母集団からの標本に対してマン–ホイットニーの順位和検定を適用します。'
sidebar_label: 'mannWhitneyUTest'
sidebar_position: 161
slug: /sql-reference/aggregate-functions/reference/mannwhitneyutest
title: 'mannWhitneyUTest'
doc_type: 'reference'
---

# mannWhitneyUTest

2つの母集団からの標本に対して、Mann-Whitneyの順位和検定を適用します。

**構文**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

両サンプルの値は `sample_data` 列にあります。`sample_index` が 0 の場合、その行の値は第1母集団からのサンプルに属します。そうでない場合は第2母集団からのサンプルに属します。
帰無仮説は、2つの母集団が同一の確率分布に従うというものです。また、片側仮説についても検定できます。この検定では、データが正規分布に従うという仮定は置きません。

**引数**

* `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — サンプルインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

* `alternative` — 対立仮説。（省略可能、デフォルト: `'two-sided'`。）[String](../../../sql-reference/data-types/string.md)。
  * `'two-sided'`；
  * `'greater'`；
  * `'less'`。
* `continuity_correction` — 0 以外の場合、p 値の計算における正規近似に連続性補正が適用されます。（省略可能、デフォルト: 1。）[UInt64](../../../sql-reference/data-types/int-uint.md)。

**戻り値**

2 要素の [Tuple](../../../sql-reference/data-types/tuple.md):

* 計算された U 統計量。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された p 値。[Float64](../../../sql-reference/data-types/float.md)。

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

クエリ：

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

* [マン・ホイットニーのU検定](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
* [確率順序](https://en.wikipedia.org/wiki/Stochastic_ordering)
