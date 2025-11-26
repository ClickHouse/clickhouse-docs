---
description: '2つの母集団から得られた標本に Kolmogorov-Smirnov 検定を適用します。'
sidebar_label: 'kolmogorovSmirnovTest'
sidebar_position: 156
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
title: 'kolmogorovSmirnovTest'
doc_type: 'reference'
---

# kolmogorovSmirnovTest

2つの母集団から得られた標本に対してコルモゴロフ–スミルノフ検定を適用します。

**構文**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。`sample_index` が 0 の場合、その行の値は第 1 集団からのサンプルに属します。そうでない場合は第 2 集団からのサンプルに属します。
サンプルは連続な一次元の確率分布に属している必要があります。

**引数**

* `sample_data` — サンプルデータ。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) または [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — サンプルインデックス。[Integer](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

* `alternative` — 対立仮説。（省略可、デフォルト: `'two-sided'`。）[String](../../../sql-reference/data-types/string.md)。\
  F(x) および G(x) を、それぞれ第 1 および第 2 の分布の CDF とします。
  * `'two-sided'`\
    帰無仮説は、サンプルが同じ分布に由来する、すなわちすべての x について `F(x) = G(x)` であるというものです。\
    対立仮説は、分布が同一ではないというものです。
  * `'greater'`\
    帰無仮説は、第 1 サンプルの値が第 2 サンプルの値よりも *確率的に小さい* というものです。\
    例えば、第 1 分布の CDF が第 2 分布の CDF より上（したがって左側）に位置する場合です。\
    これは実質的に、すべての x について `F(x) >= G(x)` であることを意味します。この場合の対立仮説は、少なくとも 1 つの x について `F(x) < G(x)` であるというものです。
  * `'less'`\
    帰無仮説は、第 1 サンプルの値が第 2 サンプルの値よりも *確率的に大きい* というものです。\
    例えば、第 1 分布の CDF が第 2 分布の CDF より下（したがって右側）に位置する場合です。\
    これは実質的に、すべての x について `F(x) <= G(x)` であることを意味します。この場合の対立仮説は、少なくとも 1 つの x について `F(x) > G(x)` であるというものです。
* `computation_method` — p 値を計算する際に使用される手法。（省略可、デフォルト: `'auto'`。）[String](../../../sql-reference/data-types/string.md)。
  * `'exact'` - 検定統計量の正確な確率分布を用いて計算を行います。小さなサンプル以外では計算コストが高く非効率です。
  * `'asymp'` (`'asymptotic'`) - 近似を用いて計算を行います。サンプルサイズが大きい場合、`'exact'` と漸近的な p 値は非常に近くなります。
  * `'auto'`  - サンプル数の最大値が 10&#39;000 未満の場合に `'exact'` 手法が使用されます。

**戻り値**

2 要素からなる [Tuple](../../../sql-reference/data-types/tuple.md):

* 計算された統計量。[Float64](../../../sql-reference/data-types/float.md)。
* 計算された p 値。[Float64](../../../sql-reference/data-types/float.md)。

**例**

クエリ:

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

結果：

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

Note:
P値が 0.05 より大きい（信頼水準 95% において）ため、帰無仮説は棄却されません。

Query:

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

結果：

```text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```


注記:
P 値が 0.05 未満（信頼水準 95% において）であるため、帰無仮説は棄却されます。

**関連項目**

- [Kolmogorov-Smirnov test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)