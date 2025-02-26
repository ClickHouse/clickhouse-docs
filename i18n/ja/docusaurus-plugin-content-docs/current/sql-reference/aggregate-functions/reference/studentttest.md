---
slug: /sql-reference/aggregate-functions/reference/studentttest
sidebar_position: 194
sidebar_label: studentTTest
---

# studentTTest

2つの母集団からのサンプルに対して、スチューデントのt検定を適用します。

**構文**

``` sql
studentTTest([confidence_level])(sample_data, sample_index)
```

両方のサンプルの値は`sample_data`カラムに格納されています。`sample_index`が0の場合、その行の値は最初の母集団からのサンプルに属します。そうでない場合、その値は2番目の母集団からのサンプルに属します。
帰無仮説は、母集団の平均が等しいというものです。等しい分散を持つ正規分布を仮定します。

**引数**

- `sample_data` — サンプルデータ。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点数](../../../sql-reference/data-types/float.md)または[小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。[整数](../../../sql-reference/data-types/int-uint.md)。

**パラメーター**

- `confidence_level` — 信頼区間を計算するための信頼レベル。[浮動小数点数](../../../sql-reference/data-types/float.md)。

**戻り値**

2つまたは4つの要素を持つ[タプル](../../../sql-reference/data-types/tuple.md)（オプションの`confidence_level`が指定された場合）:

- 計算されたt統計量。[Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。[Float64](../../../sql-reference/data-types/float.md)。
- [計算された信頼区間の下限。[Float64](../../../sql-reference/data-types/float.md)。]
- [計算された信頼区間の上限。[Float64](../../../sql-reference/data-types/float.md)。]

**例**

入力テーブル:

``` text
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

``` sql
SELECT studentTTest(sample_data, sample_index) FROM student_ttest;
```

結果:

``` text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**参照**

- [スチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [welchTTest関数](welchttest.md#welchttest)
