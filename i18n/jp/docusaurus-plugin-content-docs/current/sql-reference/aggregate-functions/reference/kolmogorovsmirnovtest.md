---
description: '2つの母集団からの標本に Kolmogorov–Smirnov 検定を適用します。'
sidebar_label: 'kolmogorovSmirnovTest'
sidebar_position: 156
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
title: 'kolmogorovSmirnovTest'
doc_type: 'reference'
---

# kolmogorovSmirnovTest

2つの母集団からの標本に対して Kolmogorov-Smirnov 検定を適用します。

**構文**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` 列にあります。`sample_index` が 0 の場合、その行の値は第1母集団からのサンプルに属します。そうでない場合は第2母集団からのサンプルに属します。\
サンプルは連続な一次元確率分布に従っている必要があります。

**Arguments**

* `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — サンプルインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**Parameters**

* `alternative` — 対立仮説。（省略可能、デフォルト: `'two-sided'`。）[String](../../../sql-reference/data-types/string.md)。\
  F(x) および G(x) を、それぞれ第1および第2の分布の CDF とします。
  * `'two-sided'`\
    帰無仮説は、サンプルが同一の分布から得られている、すなわちすべての x について `F(x) = G(x)` であるというものです。\
    対立仮説は、分布が同一ではないというものです。
  * `'greater'`\
    帰無仮説は、第1サンプルの値が第2サンプルの値よりも *確率的に小さい* というものです。\
    例えば、第1分布の CDF が第2分布の CDF より上側、したがって左側に位置する状況です。\
    これは実質的に、すべての x について `F(x) >= G(x)` であることを意味します。この場合の対立仮説は、少なくともある x について `F(x) < G(x)` であるというものです。
  * `'less'`\
    帰無仮説は、第1サンプルの値が第2サンプルの値よりも *確率的に大きい* というものです。\
    例えば、第1分布の CDF が第2分布の CDF より下側、したがって右側に位置する状況です。\
    これは実質的に、すべての x について `F(x) <= G(x)` であることを意味します。この場合の対立仮説は、少なくともある x について `F(x) > G(x)` であるというものです。
* `computation_method` — p-value を計算するために使用される方法。（省略可能、デフォルト: `'auto'`。）[String](../../../sql-reference/data-types/string.md)。
  * `'exact'` - 検定統計量の厳密な確率分布を用いて計算を行います。サンプルが小さい場合を除き、計算コストが高く非効率です。
  * `'asymp'` (`'asymptotic'`) - 近似を用いて計算を行います。サンプルサイズが大きい場合、厳密な p-value と漸近的な p-value の差は非常に小さくなります。
  * `'auto'`  - サンプル数の最大値が 10&#39;000 未満の場合に `'exact'` メソッドを使用します。

**Returned values**

2 要素からなる [Tuple](../../../sql-reference/data-types/tuple.md):

* 計算された統計量。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された p-value。[Float64](../../../sql-reference/data-types/float.md)。

**Example**

クエリ：

```sql
SELECT kolmogorovSmirnovTest('less', 'exact')(value, num)
FROM
(
    SELECT
        randNormal(0, 10) AS value,
        0 AS num
    FROM numbers(10000)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(10000)
)
```

結果:

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

注意：
P値は 0.05 より大きい（信頼水準 95% の場合）のため、帰無仮説は棄却されません。

クエリ:

```sql
SELECT kolmogorovSmirnovTest('two-sided', 'exact')(value, num)
FROM
(
    SELECT
        randStudentT(10) AS value,
        0 AS num
    FROM numbers(100)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(100)
)
```

結果:

```text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```


注:
P値が0.05未満（信頼水準95%）のため、帰無仮説は棄却されます。

**関連項目**

- [Kolmogorov-Smirnov 検定](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)