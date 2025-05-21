---
description: '2つの母集団からのサンプルに対してコルモゴロフ-スミルノフ検定を適用します。'
sidebar_label: 'kolmogorovSmirnovTest'
sidebar_position: 156
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
title: 'kolmogorovSmirnovTest'
---


# kolmogorovSmirnovTest

2つの母集団からのサンプルに対してコルモゴロフ-スミルノフ検定を適用します。

**構文**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。もし `sample_index` が 0 の場合、その行の値は最初の母集団からのサンプルに属します。そうでなければ、2番目の母集団からのサンプルに属します。サンプルは連続した一次元の確率分布に属さなければなりません。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md)、 [浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `alternative` — 対立仮説。 （オプション、デフォルト: `'two-sided'`。） [文字列](../../../sql-reference/data-types/string.md)。
    F(x) と G(x) をそれぞれ最初の分布と2番目の分布の累積分布函数（CDF）とします。
    - `'two-sided'`
        帰無仮説はサンプルが同じ分布から来ているというもので、すなわち、全ての x に対して `F(x) = G(x)` です。
        対立仮説は分布が同一ではないというものです。
    - `'greater'`
        帰無仮説は最初のサンプルの値が2番目のものよりも*確率的に小さい*というもので、すなわち、最初の分布のCDFが2番目のものの上に位置するため、左側にあります。
        これは実際には、全ての x に対して `F(x) >= G(x)` を意味します。この場合の対立仮説は少なくともひとつの x に対して `F(x) < G(x)` です。
    - `'less'`
        帰無仮説は最初のサンプルの値が2番目のものよりも*確率的に大きい*というもので、すなわち、最初の分布のCDFが2番目のものの下に位置するため、右側にあります。
        これは実際には、全ての x に対して `F(x) <= G(x)` を意味します。この場合の対立仮説は少なくともひとつの x に対して `F(x) > G(x)` です。
- `computation_method` — p値を計算するために使用される方法。 （オプション、デフォルト: `'auto'`。） [文字列](../../../sql-reference/data-types/string.md)。
    - `'exact'` - 計算は検定統計量の正確な確率分布を使用して行われます。 サンプルが小さい場合以外は計算負荷が高く、無駄です。
    - `'asymp'`（`'asymptotic'`） - 計算は近似を使用して行われます。 サンプルサイズが大きい場合、正確なp値と漸近的p値は非常に似ています。
    - `'auto'`  - 最大サンプル数が10,000未満の場合、`'exact'` メソッドが使用されます。

**返される値**

[タプル](../../../sql-reference/data-types/tuple.md)で2つの要素を含みます：

- 計算された統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。 [Float64](../../../sql-reference/data-types/float.md)。

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

結果:

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

注:
p値は0.05より大きい（95％の信頼レベルの場合）、したがって帰無仮説は棄却されません。

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
p値は0.05より小さい（95％の信頼レベルの場合）、したがって帰無仮説は棄却されます。

**関連情報**

- [コルモゴロフ-スミルノフ検定](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
