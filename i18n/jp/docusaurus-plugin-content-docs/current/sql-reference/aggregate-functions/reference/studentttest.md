---
description: '二つの母集団からのサンプルに適用される学生のt検定。'
sidebar_label: 'studentTTest'
sidebar_position: 194
slug: /sql-reference/aggregate-functions/reference/studentttest
title: 'studentTTest'
---


# studentTTest

二つの母集団からのサンプルに学生のt検定を適用します。

**構文**

```sql
studentTTest([confidence_level])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。`sample_index` が 0 に等しい場合、その行の値は最初の母集団からのサンプルに属します。それ以外の場合は、第二の母集団からのサンプルに属します。帰無仮説は、母集団の平均が等しいことです。等しい分散を持つ正規分布が想定されています。

**引数**

- `sample_data` — サンプルデータ。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md) 又は [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。[整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `confidence_level` — 信頼区間を計算するための信頼レベル。[浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

[タプル](../../../sql-reference/data-types/tuple.md)で、二つまたは四つの要素を含みます（オプションの `confidence_level` が指定された場合）:

- 計算されたt統計量。[Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。[Float64](../../../sql-reference/data-types/float.md)。
- [計算された信頼区間下限。[Float64](../../../sql-reference/data-types/float.md)。]
- [計算された信頼区間上限。[Float64](../../../sql-reference/data-types/float.md)。]

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

結果:

```text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**関連情報**

- [学生のt検定](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [welchTTest関数](/sql-reference/aggregate-functions/reference/welchttest)
