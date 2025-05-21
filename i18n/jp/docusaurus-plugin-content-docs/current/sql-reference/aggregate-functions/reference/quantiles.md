---
description: 'quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK'
sidebar_position: 177
slug: /sql-reference/aggregate-functions/reference/quantiles
title: 'quantiles 関数'
---


# quantiles 関数

## quantiles {#quantiles}

構文: `quantiles(level1, level2, ...)(x)`

すべての分位数関数には対応する分位数関数があり、`quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD` があります。これらの関数は、リストされたレベルのすべての分位数を一度の処理で計算し、結果となる値の配列を返します。

## quantilesExactExclusive {#quantilesexactexclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値が配列に結合され、その後部分的にソートされます。したがって、この関数は `O(n)` メモリを消費します。ここで `n` は渡された値の数です。ただし、少数の値に対しては、この関数は非常に効果的です。

この関数は、[PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) Excel 関数、（[タイプ R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）と同等です。

[quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive) よりもレベルのセットでより効率的に機能します。

**構文**

```sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**引数**

- `expr` — 数値 [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) のカラム値に対する式。

**パラメータ**

- `level` — 分位数のレベル。可能な値: (0, 1) — 境界は含まれません。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの分位数の [Array](../../../sql-reference/data-types/array.md)。

配列値のタイプ:

- 数値データ型入力のための [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

結果:

```text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesExactInclusive {#quantilesexactinclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値が配列に結合され、その後部分的にソートされます。したがって、この関数は `O(n)` メモリを消費します。ここで `n` は渡された値の数です。ただし、少数の値に対しては、この関数は非常に効果的です。

この関数は、[PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) Excel 関数、（[タイプ R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）と同等です。

[quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive) よりもレベルのセットでより効率的に機能します。

**構文**

```sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**引数**

- `expr` — 数値 [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) のカラム値に対する式。

**パラメータ**

- `level` — 分位数のレベル。可能な値: [0, 1] — 境界は含まれます。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの分位数の [Array](../../../sql-reference/data-types/array.md)。

配列値のタイプ:

- 数値データ型入力のための [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

`quantilesGK` は `quantileGK` と似ており、異なるレベルで数量を同時に計算し、配列を返します。

**構文**

```sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**返される値**

- 指定されたレベルの分位数の [Array](../../../sql-reference/data-types/array.md)。

配列値のタイプ:

- 数値データ型入力のための [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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
