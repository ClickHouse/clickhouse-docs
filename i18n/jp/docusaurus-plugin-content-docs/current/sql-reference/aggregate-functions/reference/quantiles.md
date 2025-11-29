---
description: 'quantiles、quantilesExactExclusive、quantilesExactInclusive、quantilesGK'
sidebar_position: 177
slug: /sql-reference/aggregate-functions/reference/quantiles
title: 'quantiles 関数'
doc_type: 'reference'
---



# 分位数関数 {#quantiles-functions}



## quantiles {#quantiles}

構文: `quantiles(level1, level2, ...)(x)`

すべての分位数関数には、対応する `quantiles` 系関数があります: `quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD`。これらの関数は、列挙されたレベルのすべての分位数を一度の処理で計算し、結果の値を配列で返します。



## quantilesExactExclusive {#quantilesexactexclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を厳密に計算します。

厳密な値を取得するために、渡されたすべての値を配列にまとめ、その配列に対して部分ソートを実行します。したがって、この関数は `O(n)` のメモリを消費します。ここで `n` は渡された値の個数です。ただし、値の個数が少ない場合、この関数は非常に効率的です。

この関数は、Excel の [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) 関数（[type R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）と同等です。

[quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive) と比較して、複数のレベル（分位点）の集合を扱う場合に、より効率的に動作します。

**構文**

```sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**引数**

* `expr` — 数値型の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を結果とする、列の値に対して適用される式。

**パラメータ**

* `level` — 分位点のレベル。取りうる値: (0, 1) — 両端点は含まれません。[Float](../../../sql-reference/data-types/float.md)。

**戻り値**

* 指定されたレベルの分位点の[Array](../../../sql-reference/data-types/array.md)。

配列要素の型:

* 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

結果：

```text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```


## quantilesExactInclusive {#quantilesexactinclusive}

数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を厳密に計算します。

正確な値を取得するために、渡されたすべての値を配列にまとめ、その配列を部分的にソートします。そのため、この関数は `O(n)` のメモリを消費します。ここで `n` は渡された値の個数です。ただし、値の個数が少ない場合には、この関数は非常に効率的です。

この関数は、Excel の [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) 関数（[type R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）と同等です。

[quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive) よりも、複数のレベルに対して効率的に動作します。

**構文**

```sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**引数**

* `expr` — 列の値に対する式で、結果が数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) になります。

**パラメータ**

* `level` — 求める分位数のレベル。指定可能な値: [0, 1] — 両端を含む範囲。[Float](../../../sql-reference/data-types/float.md)。

**戻り値**

* 指定したレベルの分位数を要素とする [Array](../../../sql-reference/data-types/array.md)。

配列要素の型:

* 数値データ型を入力とした場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

結果:

```text
┌─quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.75,499.5,749.25,899.1,949.05,989.01,998.001]                   │
└─────────────────────────────────────────────────────────────────────┘
```


## quantilesGK {#quantilesgk}

`quantilesGK` は `quantileGK` と同様に動作しますが、複数のレベルの分位数を同時に計算でき、配列を返します。

**構文**

```sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**返される値**

* 指定したレベルの分位数の [Array](../../../sql-reference/data-types/array.md)。

配列要素の型:

* 入力が数値データ型の場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantilesGK(1, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [1,1,1]                                          │
└──────────────────────────────────────────────────┘

SELECT quantilesGK(10, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(10, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [156,413,659]                                     │
└───────────────────────────────────────────────────┘
SELECT quantilesGK(100, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(100, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [251,498,741]                                      │
└────────────────────────────────────────────────────┘

SELECT quantilesGK(1000, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1000, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [249,499,749]                                       │
└─────────────────────────────────────────────────────┘
```
