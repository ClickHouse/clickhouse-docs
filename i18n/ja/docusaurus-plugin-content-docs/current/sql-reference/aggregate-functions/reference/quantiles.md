---
slug: /sql-reference/aggregate-functions/reference/quantiles
sidebar_position: 177
---

# quantiles 関数

## quantiles {#quantiles}

構文: `quantiles(level1, level2, ...)(x)`

すべてのクォンタイル関数には、次の対応するクォンタイル関数があります: `quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD`。これらの関数は、リストされたレベルのすべてのクォンタイルを一度の処理で計算し、結果の値の配列を返します。

## quantilesExactExclusive {#quantilesexactexclusive}

数値データ列の [クォンタイル](https://en.wikipedia.org/wiki/Quantile) を正確に計算します。

正確な値を得るために、全ての渡された値は配列にまとめられ、その後部分的にソートされます。したがって、この関数は `O(n)` メモリを消費します。ここで `n` は渡された値の数です。ただし、少量の値に対してはこの関数は非常に効果的です。

この関数は、Excelの [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) 関数に相当します、([type R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))。

[quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive) よりも、レベルのセットに対してより効率的に動作します。

**構文**

``` sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**引数**

- `expr` — 数値の [データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md) または [日付時刻](../../../sql-reference/data-types/datetime.md) の値を持つカラムの表現。

**パラメータ**

- `level` — クォンタイルのレベル。可能な値: (0, 1) — 境界を含まない。 [Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルのクォンタイルの [配列](../../../sql-reference/data-types/array.md)。

配列の値の型:

- 数値データ型の入力には [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

結果:

``` text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesExactInclusive {#quantilesexactinclusive}

数値データ列の [クォンタイル](https://en.wikipedia.org/wiki/Quantile) を正確に計算します。

正確な値を得るために、全ての渡された値は配列にまとめられ、その後部分的にソートされます。したがって、この関数は `O(n)` メモリを消費します。ここで `n` は渡された値の数です。ただし、少量の値に対してはこの関数は非常に効果的です。

この関数は、Excelの [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) 関数に相当します、([type R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))。

[quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive) よりも、レベルのセットに対してより効率的に動作します。

**構文**

``` sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**引数**

- `expr` — 数値の [データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md) または [日付時刻](../../../sql-reference/data-types/datetime.md) の値を持つカラムの表現。

**パラメータ**

- `level` — クォンタイルのレベル。可能な値: [0, 1] — 境界を含む。 [Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルのクォンタイルの [配列](../../../sql-reference/data-types/array.md)。

配列の値の型:

- 数値データ型の入力には [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

結果:

``` text
┌─quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.75,499.5,749.25,899.1,949.05,989.01,998.001]                   │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesGK {#quantilesgk}

`quantilesGK` は `quantileGK` と類似しており、異なるレベルで同時に数量を計算し、配列を返すことを可能にします。

**構文**

``` sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**返される値**

- 指定されたレベルのクォンタイルの [配列](../../../sql-reference/data-types/array.md)。

配列の値の型:

- 数値データ型の入力には [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
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
