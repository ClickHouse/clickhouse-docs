---
'description': 'quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK'
'sidebar_position': 177
'slug': '/sql-reference/aggregate-functions/reference/quantiles'
'title': 'quantiles 関数'
'doc_type': 'reference'
---


# quantiles 関数

## quantiles {#quantiles}

構文: `quantiles(level1, level2, ...)(x)`

すべての分位点関数には、対応する分位点関数があります: `quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD`。これらの関数は、指定されたレベルのすべての分位点を一度のパスで計算し、結果の値の配列を返します。

## quantilesExactExclusive {#quantilesexactexclusive}

数値データ列の[分位点](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を取得するために、すべての入力値が配列に結合され、その後部分的にソートされます。したがって、この関数は `O(n)` メモリを消費します。ここで、`n` は渡された値の数です。ただし、少数の値に対しては、この関数は非常に効果的です。

この関数は、Excel関数の[PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)に相当します。([タイプ R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))。

[quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive) よりも、レベルのセットに対してより効率的に機能します。

**構文**

```sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**引数**

- `expr` — 列の値に対する式で、数値の [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を返します。

**パラメータ**

- `level` — 分位点のレベル。可能な値: (0, 1) — 境界を含まない。 [Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの分位点の [配列](../../../sql-reference/data-types/array.md)。

配列の値のタイプ:

- 数値データ型の入力には [Float64](../../../sql-reference/data-types/float.md)。
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

数値データ列の[分位点](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を取得するために、すべての入力値が配列に結合され、その後部分的にソートされます。したがって、この関数は `O(n)` メモリを消費します。ここで、`n` は渡された値の数です。ただし、少数の値に対しては、この関数は非常に効果的です。

この関数は、Excel関数の[PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)に相当します。([タイプ R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))。

[quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive) よりも、レベルのセットに対してより効率的に機能します。

**構文**

```sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**引数**

- `expr` — 列の値に対する式で、数値の [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を返します。

**パラメータ**

- `level` — 分位点のレベル。可能な値: [0, 1] — 境界を含む。 [Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの分位点の [配列](../../../sql-reference/data-types/array.md)。

配列の値のタイプ:

- 数値データ型の入力には [Float64](../../../sql-reference/data-types/float.md)。
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

`quantilesGK` は `quantileGK` と同様に機能しますが、異なるレベルでの数量を同時に計算し、配列を返すことができます。

**構文**

```sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**返される値**

- 指定されたレベルの分位点の [配列](../../../sql-reference/data-types/array.md)。

配列の値のタイプ:

- 数値データ型の入力には [Float64](../../../sql-reference/data-types/float.md)。
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
