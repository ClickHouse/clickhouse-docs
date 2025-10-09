---
'description': '2つの母集団からのサンプルにKolmogorov-Smirnovのテストを適用します。'
'sidebar_label': 'kolmogorovSmirnovTest'
'sidebar_position': 156
'slug': '/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest'
'title': 'kolmogorovSmirnovTest'
'doc_type': 'reference'
---



# kolmogorovSmirnovTest

二つの母集団からのサンプルに対してコルモゴロフ–スミルノフ検定を適用します。

**構文**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

両方のサンプルの値は `sample_data` 列にあります。 `sample_index` が 0 の場合、その行の値は最初の母集団からのサンプルに属します。そうでない場合、それは第二の母集団からのサンプルに属します。
サンプルは連続的な一次元確率分布に属する必要があります。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md), [浮動小数点数](../../../sql-reference/data-types/float.md) または [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `alternative` — 対立仮説。 (オプション、デフォルト: `'two-sided'`.) [文字列](../../../sql-reference/data-types/string.md)。
    F(x) と G(x) をそれぞれ最初と第二の分布のCDFとします。
  - `'two-sided'`
        帰無仮説は、サンプルが同じ分布から来ているというもので、すなわち `F(x) = G(x)` が全ての x に対して成り立ちます。
        対立仮説は、分布が同一でないというものです。
  - `'greater'`
        帰無仮説は、最初のサンプルの値が第二のサンプルの値よりも*確率的に小さい*というもので、
        すなわち、最初の分布のCDFが第二の分布のそれよりも上にあり、そのため左にあるということです。
        実際には、これは `F(x) >= G(x)` が全ての x に対して成り立つことを意味します。そして、この場合の対立仮説は `F(x) < G(x)` が少なくとも一つの x に対して成り立つということです。
  - `'less'`
        帰無仮説は、最初のサンプルの値が第二のサンプルの値よりも*確率的に大きい*というもので、
        すなわち、最初の分布のCDFが第二の分布のそれよりも下にあり、そのため右にあるということです。
        実際には、これは `F(x) <= G(x)` が全ての x に対して成り立つことを意味します。そして、この場合の対立仮説は `F(x) > G(x)` が少なくとも一つの x に対して成り立つということです。
- `computation_method` — p値を計算するために使用される方法。 (オプション、デフォルト: `'auto'`.) [文字列](../../../sql-reference/data-types/string.md)。
  - `'exact'` - 計算はテスト統計量の正確な確率分布を使用して行われます。小さいサンプルの場合を除いて、計算集約的で無駄です。
  - `'asymp'` (`'asymptotic'`) - 計算は近似を使用して行われます。大きなサンプルサイズの場合、正確な p 値と漸近的な p 値は非常に似ています。
  - `'auto'`  - サンプルの最大数が 10'000 未満の場合、`'exact'` メソッドが使用されます。

**戻り値**

[タプル](../../../sql-reference/data-types/tuple.md)で二つの要素を返します：

- 計算された統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算された p 値。 [Float64](../../../sql-reference/data-types/float.md)。

**例**

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

結果：

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

注意：
p値は 0.05 より大きい（信頼水準 95%）ため、帰無仮説は棄却されません。

クエリ：

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

注意：
p値は 0.05 より小さい（信頼水準 95%）ため、帰無仮説は棄却されます。

**関連情報**

- [コルモゴロフ–スミルノフ検定](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
