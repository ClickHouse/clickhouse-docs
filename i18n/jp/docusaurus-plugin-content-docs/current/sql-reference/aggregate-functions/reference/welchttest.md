---
'description': '二つの母集団からのサンプルにWelchのt検定を適用します。'
'sidebar_label': 'welchTTest'
'sidebar_position': 214
'slug': '/sql-reference/aggregate-functions/reference/welchttest'
'title': 'welchTTest'
'doc_type': 'reference'
---


# welchTTest

Welchのt検定を2つの母集団からのサンプルに適用します。

**構文**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

両方のサンプルの値は`sample_data`カラムにあります。`sample_index`が0の場合、その行の値は最初の母集団からのサンプルに属します。それ以外の場合、その値は2番目の母集団からのサンプルに属します。
帰無仮説は、母集団の平均が等しいというものです。正規分布が仮定されます。母集団は不均一な分散を持つ場合があります。

**引数**

- `sample_data` — サンプルデータ。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md) または [10進数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — サンプルインデックス。 [整数](../../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `confidence_level` — 信頼区間を計算するための信頼レベル。 [浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

[タプル](../../../sql-reference/data-types/tuple.md)で、2つまたは4つの要素（オプションの`confidence_level`が指定されている場合）

- 計算されたt統計量。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算されたp値。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算された信頼区間下限。 [Float64](../../../sql-reference/data-types/float.md)。
- 計算された信頼区間上限。 [Float64](../../../sql-reference/data-types/float.md)。

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

**関連情報**

- [Welchのt検定](https://en.wikipedia.org/wiki/Welch%27s_t-test)
- [studentTTest関数](/sql-reference/aggregate-functions/reference/studentttest)
