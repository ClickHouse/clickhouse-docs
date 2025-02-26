---
slug: /sql-reference/aggregate-functions/reference/quantileexact
sidebar_position: 173
---

# quantileExact関数

## quantileExact {#quantileexact}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値は配列に結合され、その後部分的にソートされます。そのため、関数は`O(n)`のメモリを消費します。ここで、`n`は渡された値の数です。しかし、少数の値の場合、関数は非常に効果的です。

クエリ内で異なるレベルの複数の`quantile*`関数を使用する場合、内部状態は結合されません（つまり、クエリは可能な限り効率的に動作しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileExact(level)(expr)
```

別名: `medianExact`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`[0.01, 0.99]`の範囲内の`level`値の使用を推奨します。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)の値を持つカラムに対する式。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型の場合、出力形式は入力形式と同じになります。たとえば:

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

1行の結果。経過時間: 0.002秒。
```

- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
SELECT quantileExact(number) FROM numbers(10)
```

結果:

``` text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```

## quantileExactLow {#quantileexactlow}

`quantileExact`に類似しており、数値データシーケンスの正確な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

正確な値を得るために、渡されたすべての値は配列に結合され、その後完全にソートされます。ソート[アルゴリズム](https://en.cppreference.com/w/cpp/algorithm/sort)の計算量は`O(N·log(N))`であり、ここで`N = std::distance(first, last)`による比較を行います。

返される値は分位数のレベルと選択される要素の数に依存します。つまり、レベルが0.5の場合、関数は偶数の要素に対しては下位中央値の値を返し、奇数の要素に対しては中間中央値の値を返します。中央値は、Pythonで使用される[median_low](https://docs.python.org/3/library/statistics.html#statistics.median_low)の実装と同様に計算されます。

他のすべてのレベルの場合、`level * size_of_array`の値に対応するインデックスの要素が返されます。たとえば:

``` sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

クエリ内で異なるレベルの複数の`quantile*`関数を使用する場合、内部状態は結合されません（つまり、クエリは可能な限り効率的に動作しません）。この場合、[quantiles](/ru/sql-reference/aggregate-functions/reference/quantiles)関数を使用してください。

**構文**

``` sql
quantileExactLow(level)(expr)
```

別名: `medianExactLow`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`[0.01, 0.99]`の範囲内の`level`値の使用を推奨します。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)の値を持つカラムに対する式。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
SELECT quantileExactLow(number) FROM numbers(10)
```

結果:

``` text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh {#quantileexacthigh}

`quantileExact`に類似しており、数値データシーケンスの正確な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

すべての渡された値は配列に結合され、その後完全にソートされて正確な値を得ます。ソート[アルゴリズム](https://en.cppreference.com/w/cpp/algorithm/sort)の計算量は`O(N·log(N))`であり、ここで`N = std::distance(first, last)`による比較を行います。

返される値は分位数のレベルと選択される要素の数に依存します。つまり、レベルが0.5の場合、関数は偶数の要素に対しては上位中央値の値を返し、奇数の要素に対しては中間中央値の値を返します。中央値は、Pythonで使用される[median_high](https://docs.python.org/3/library/statistics.html#statistics.median_high)の実装と同様に計算されます。その他のすべてのレベルの場合、`level * size_of_array`の値に対応するインデックスの要素が返されます。

この実装は、現在の`quantileExact`の実装とまったく同様に動作します。

クエリ内で異なるレベルの複数の`quantile*`関数を使用する場合、内部状態は結合されません（つまり、クエリは可能な限り効率的に動作しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileExactHigh(level)(expr)
```

別名: `medianExactHigh`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`[0.01, 0.99]`の範囲内の`level`値の使用を推奨します。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)の値を持つカラムに対する式。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

結果:

``` text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```

## quantileExactExclusive {#quantileexactexclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値は配列に結合され、その後部分的にソートされます。そのため、関数は`O(n)`のメモリを消費します。ここで、`n`は渡された値の数です。しかし、少数の値の場合、関数は非常に効果的です。

この関数は、Excelの[昔のExcel関数PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)に相当します（[型R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

クエリ内で異なるレベルの複数の`quantileExactExclusive`関数を使用する場合、内部状態は結合されません（つまり、クエリは可能な限り効率的に動作しません）。この場合、[quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive)関数を使用してください。

**構文**

``` sql
quantileExactExclusive(level)(expr)
```

**引数**

- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)の値を持つカラムに対する式。

**パラメータ**

- `level` — 分位数のレベル。オプション。可能な値: (0, 1) — 範囲は含まれない。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactExclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

結果:

``` text
┌─quantileExactExclusive(0.6)(x)─┐
│                          599.6 │
└────────────────────────────────┘
```

## quantileExactInclusive {#quantileexactinclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値は配列に結合され、その後部分的にソートされます。そのため、関数は`O(n)`のメモリを消費します。ここで、`n`は渡された値の数です。しかし、少数の値の場合、関数は非常に効果的です。

この関数は、Excelの[PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)関数に相当します（[型R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

クエリ内で異なるレベルの複数の`quantileExactInclusive`関数を使用する場合、内部状態は結合されません（つまり、クエリは可能な限り効率的に動作しません）。この場合、[quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive)関数を使用してください。

**構文**

``` sql
quantileExactInclusive(level)(expr)
```

**引数**

- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)の値を持つカラムに対する式。

**パラメータ**

- `level` — 分位数のレベル。オプション。可能な値: [0, 1] — 範囲は含まれる。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

結果:

``` text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**関連項目**

- [中央値](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [分位数](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
