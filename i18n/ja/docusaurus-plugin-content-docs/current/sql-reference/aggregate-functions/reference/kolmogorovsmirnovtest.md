---
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
sidebar_position: 156
sidebar_label: kolmogorovSmirnovTest
---

# kolmogorovSmirnovTest

二つの母集団からのサンプルに対してコルモゴロフ-スミルノフ検定を適用します。

**構文**

``` sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` カラムにあります。`sample_index` が 0 の場合、その行の値は最初の母集団からのサンプルに属します。それ以外の場合は、第二の母集団からのサンプルに属します。サンプルは連続した一元的確率分布に属する必要があります。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md)、 [浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `alternative` — 対立仮説。 (オプション、デフォルト: `'two-sided'`.) [文字列](../../../sql-reference/data-types/string.md)。
    F(x) および G(x) を最初の分布と第二の分布の累積分布関数（CDF）とします。
    - `'two-sided'`
        帰無仮説はサンプルが同じ分布から来ているというもので、例えばすべての x に対して `F(x) = G(x)` です。
        対立仮説は分布が同一でないことです。
    - `'greater'`
        帰無仮説は、最初のサンプルの値が第二のサンプルの値よりも*確率的に小さい*というものです。
        すなわち、最初の分布のCDFは第二の分布のCDFの上にあり、したがって左側に位置します。
        実際にはすべての x に対して `F(x) >= G(x)` を意味します。この場合の対立仮説は、少なくとも1つの x に対して `F(x) < G(x)` です。
    - `'less'`
        帰無仮説は、最初のサンプルの値が第二のサンプルの値よりも*確率的に大きい*というものです。
        すなわち、最初の分布のCDFは第二の分布のCDFの下にあり、したがって右側に位置します。
        実際にはすべての x に対して `F(x) <= G(x)` を意味します。この場合の対立仮説は、少なくとも1つの x に対して `F(x) > G(x)` です。
- `computation_method` — p値を計算するために使用される方法。 (オプション、デフォルト: `'auto'`.) [文字列](../../../sql-reference/data-types/string.md)。
    - `'exact'` - 計算はテスト統計の正確な確率分布を使用して実行されます。サンプルが小さい場合を除いて、計算集約的で無駄が多いです。
    - `'asymp'`（`'asymptotic'`） - 計算は近似を使用して実行されます。サンプルサイズが大きい場合、正確なp値と漸近的p値は非常に似ています。
    - `'auto'` - サンプルの最大数が 10,000 未満の場合は `'exact'` メソッドが使用されます。

**返される値**

[タプル](../../../sql-reference/data-types/tuple.md)で二つの要素が含まれます：

- 計算された統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算された p値。 [Float64](../../../sql-reference/data-types/float.md)。

**例**

クエリ：

``` sql
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

``` text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

ノート：
p値は 0.05 より大きい（信頼水準 95% の場合）、したがって帰無仮説は棄却されません。

クエリ：

``` sql
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

``` text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```

ノート：
p値は 0.05 より小さい（信頼水準 95% の場合）、したがって帰無仮説は棄却されます。

**関連項目**

- [コルモゴロフ-スミルノフ検定](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
