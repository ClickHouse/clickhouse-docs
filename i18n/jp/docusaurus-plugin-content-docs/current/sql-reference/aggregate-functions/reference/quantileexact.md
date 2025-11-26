---
description: 'quantileExact、quantileExactLow、quantileExactHigh、quantileExactExclusive、quantileExactInclusive 関数'
sidebar_position: 173
slug: /sql-reference/aggregate-functions/reference/quantileexact
title: 'quantileExact 関数'
doc_type: 'reference'
---



# quantileExact 関数



## quantileExact

数値データ列の[分位点 (quantile)](https://en.wikipedia.org/wiki/Quantile) を厳密に計算します。

厳密な値を得るために、渡されたすべての値を配列にまとめ、その後で部分的にソートします。したがって、この関数は `O(n)` のメモリを消費します。ここで `n` は渡された値の個数です。ただし、値の個数が少ない場合には、この関数は非常に効率的です。

1つのクエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態はマージされません（つまり、そのクエリは本来よりも非効率に動作します）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileExact(level)(expr)
```

Alias: `medianExact`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメーター。0 から 1 の間の定数の浮動小数点数です。`level` の値には `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値は 0.5 です。`level=0.5` のとき、この関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
* `expr` — 列の値に対する式で、その結果が数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) になります。

**戻り値**

* 指定したレベルの分位数。

型:

* 数値データ型に対しては、出力形式は入力形式と同じになります。例:

```sql

SELECT
    toTypeName(quantileExact(number)) AS `quantile`,
    toTypeName(quantileExact(number::Int32)) AS `quantile_int32`,
    toTypeName(quantileExact(number::Float32)) AS `quantile_float32`,
    toTypeName(quantileExact(number::Float64)) AS `quantile_float64`,
    toTypeName(quantileExact(number::Int64)) AS `quantile_int64`
FROM numbers(1)
   ┌─quantile─┬─quantile_int32─┬─quantile_float32─┬─quantile_float64─┬─quantile_int64─┐
1. │ UInt64   │ Int32          │ Float32          │ Float64          │ Int64          │
   └──────────┴────────────────┴──────────────────┴──────────────────┴────────────────┘

1行が結果セットに含まれています。経過時間: 0.002秒。
```

* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileExact(number) FROM numbers(10)
```

結果：

```text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```


## quantileExactLow

`quantileExact` と同様に、数値データ列の正確な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

正確な値を取得するために、渡されたすべての値を配列にまとめ、それを完全にソートします。ソート[アルゴリズム](https://en.cppreference.com/w/cpp/algorithm/sort)の計算量は `O(N·log(N))` であり、ここで `N = std::distance(first, last)` 回の比較が必要です。

戻り値は分位数レベルと選択された要素数に依存します。例えばレベルが 0.5 の場合、要素数が偶数のときは低い方の中央値を、要素数が奇数のときは中央値を返します。中央値は、Python で使用されている [median&#95;low](https://docs.python.org/3/library/statistics.html#statistics.median_low) の実装と同様の方法で計算されます。

それ以外のすべてのレベルでは、`level * size_of_array` の値に対応するインデックスの要素が返されます。例えば次のとおりです。

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

同一クエリ内でレベルの異なる `quantile*` 関数を複数使用すると、内部状態が統合されず（つまり、本来よりもクエリの効率が低下します）。このような場合は、[quantiles](/sql-reference/aggregate-functions/reference/quantiles) 関数を使用してください。

**構文**

```sql
quantileExactLow(level)(expr)
```

エイリアス: `medianExactLow`。

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の範囲の定数の浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を結果とする、列値に対する式。

**戻り値**

* 指定されたレベルの分位数。

型:

* 数値データ型を入力とする場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileExactLow(number) FROM numbers(10)
```

結果：


```text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh

`quantileExact` と同様に、数値データ系列の正確な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

渡されたすべての値は配列にまとめられ、その配列を完全にソートしてから正確な値を求めます。ソート[アルゴリズム](https://en.cppreference.com/w/cpp/algorithm/sort)の計算量は `O(N·log(N))` であり、ここで `N = std::distance(first, last)` は比較回数です。

戻り値は分位レベルと選択された要素数に依存します。たとえばレベルが 0.5 の場合、要素数が偶数のときは高い方の中央値を、要素数が奇数のときは中央の中央値を返します。中央値は、Python で使用されている [median&#95;high](https://docs.python.org/3/library/statistics.html#statistics.median_high) 実装と同様の方法で計算されます。その他のレベルでは、`level * size_of_array` の値に対応するインデックスの要素が返されます。

この実装は、現行の `quantileExact` 実装とまったく同じ動作をします。

1 つのクエリ内で、異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は統合されません（つまり、そのクエリは本来よりも非効率に動作します）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileExactHigh(level)(expr)
```

別名: `medianExactHigh`。

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 以上 1 以下の定数の浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [median](https://en.wikipedia.org/wiki/Median) を計算します。
* `expr` — 列の値に対して評価され、その結果が数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) となる式。

**戻り値**

* 指定されたレベルの分位数。

型:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

結果：

```text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```


## quantileExactExclusive

数値データシーケンスの[分位点 (quantile)](https://en.wikipedia.org/wiki/Quantile) を厳密に計算します。

厳密な値を得るために、渡されたすべての値を配列にまとめ、その配列を部分的にソートします。したがって、この関数は、`n` を渡された値の個数とすると `O(n)` のメモリを消費します。ただし、値の個数が少ない場合には、この関数は非常に効率的です。

この関数は、Excel の [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) 関数（[タイプ R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）と同等です。

1 つのクエリ内で異なるレベルの複数の `quantileExactExclusive` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来より非効率になります）。このような場合は、[quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive) 関数を使用してください。

**構文**

```sql
quantileExactExclusive(level)(expr)
```

**引数**

* `expr` — カラム値に対する式で、その結果が数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) になるもの。

**パラメータ**

* `level` — 分位数のレベル。省略可能。取りうる値の範囲: (0, 1) — 端点は含みません。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。[Float](../../../sql-reference/data-types/float.md)。

**戻り値**

* 指定したレベルの分位数。

型:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactExclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

結果：

```text
┌─quantileExactExclusive(0.6)(x)─┐
│                          599.6 │
└────────────────────────────────┘
```


## quantileExactInclusive

数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を厳密に計算します。

厳密な値を取得するために、渡されたすべての値は配列に連結され、その配列が部分的にソートされます。そのため、この関数は `O(n)` のメモリを消費します。ここで `n` は渡された値の個数です。ただし、値の個数が少ない場合、この関数は非常に効率的です。

この関数は Excel の [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) 関数（[タイプ R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）と同等です。

1つのクエリ内で異なるレベルを持つ複数の `quantileExactInclusive` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来より非効率に動作します）。このような場合は、[quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive) 関数を使用してください。

**構文**

```sql
quantileExactInclusive(level)(expr)
```

**引数**

* `expr` — 列の値に対する式で、結果として数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) を返します。

**パラメータ**

* `level` — 分位数のレベル。省略可能。取り得る値は [0, 1]（端点を含む）です。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

* 指定されたレベルの分位数。

型:

* 数値データ型を入力とする場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

結果:

```text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
