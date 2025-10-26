---
'description': 'quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive,
  quantileExactInclusive 関数'
'sidebar_position': 173
'slug': '/sql-reference/aggregate-functions/reference/quantileexact'
'title': 'quantileExact 関数'
'doc_type': 'reference'
---


# quantileExact 関数

## quantileExact {#quantileexact}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値が配列にまとめられ、部分的にソートされます。そのため、関数は `O(n)` メモリを消費します。ここで、`n` は渡された値の数です。ただし、少数の値については、関数は非常に効果的です。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されず（つまり、クエリは効率的に機能しません）、この場合は [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileExact(level)(expr)
```

エイリアス: `medianExact`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。

**戻り値**

- 指定されたレベルの分位数。

種類:

- 数値データ型の場合、出力形式は入力形式と同じです。例えば：

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

1 row in set. Elapsed: 0.002 sec.
```

- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ：

```sql
SELECT quantileExact(number) FROM numbers(10)
```

結果：

```text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```

## quantileExactLow {#quantileexactlow}

`quantileExact`に似ており、数値データシーケンスの正確な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

正確な値を得るために、渡されたすべての値が配列にまとめられ、完全にソートされます。ソート[アルゴリズム](https://en.cppreference.com/w/cpp/algorithm/sort)の複雑性は `O(N·log(N))` であり、ここで `N = std::distance(first, last)` の比較です。

戻り値は、分位数レベルと選択された要素の数に依存します。すなわち、レベルが0.5の場合、関数は偶数の要素に対して下位中央値を、奇数の要素に対して中位の中央値を返します。中央値は、Pythonで使用されている[median_low](https://docs.python.org/3/library/statistics.html#statistics.median_low)実装に類似して計算されます。

他のすべてのレベルでは、`level * size_of_array` の値に対応するインデックスの要素が返されます。例えば：

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合は [quantiles](/sql-reference/aggregate-functions/reference/quantiles) 関数を使用してください。

**構文**

```sql
quantileExactLow(level)(expr)
```

エイリアス: `medianExactLow`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。

**戻り値**

- 指定されたレベルの分位数。

種類:

- 数値データ型入力の場合、[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ：

```sql
SELECT quantileExactLow(number) FROM numbers(10)
```

結果：

```text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh {#quantileexacthigh}

`quantileExact` に似ており、数値データシーケンスの正確な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

正確な値を得るために、渡されたすべての値が配列にまとめられ、完全にソートされます。ソート[アルゴリズム](https://en.cppreference.com/w/cpp/algorithm/sort)の複雑性は `O(N·log(N))` であり、ここで `N = std::distance(first, last)` の比較です。

戻り値は、分位数レベルと選択された要素の数に依存します。すなわち、レベルが0.5の場合、関数は偶数の要素に対して上位中央値を、奇数の要素に対して中位の中央値を返します。中央値は、Pythonで使用されている[median_high](https://docs.python.org/3/library/statistics.html#statistics.median_high)実装に類似して計算されます。他のすべてのレベルでは、`level * size_of_array` の値に対応するインデックスの要素が返されます。

この実装は、現在の `quantileExact` 実装とまったく同じ動作をします。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合は [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileExactHigh(level)(expr)
```

エイリアス: `medianExactHigh`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。

**戻り値**

- 指定されたレベルの分位数。

種類:

- 数値データ型入力の場合、[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ：

```sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

結果：

```text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```

## quantileExactExclusive {#quantileexactexclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値が配列にまとめられ、部分的にソートされます。そのため、関数は `O(n)` メモリを消費します。ここで、`n` は渡された値の数です。ただし、少数の値については、関数は非常に効果的です。

この関数は、Excel 関数の[PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)と同等であり、([type R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))に該当します。

異なるレベルの複数の `quantileExactExclusive` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合は [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive) 関数を使用してください。

**構文**

```sql
quantileExactExclusive(level)(expr)
```

**引数**

- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。

**パラメータ**

- `level` — 分位数のレベル。オプションのパラメータ。可能な値: (0, 1) — 境界は含まれません。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。[Float](../../../sql-reference/data-types/float.md)。

**戻り値**

- 指定されたレベルの分位数。

種類:

- 数値データ型入力の場合、[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ：

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

## quantileExactInclusive {#quantileexactinclusive}

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、渡されたすべての値が配列にまとめられ、部分的にソートされます。そのため、関数は `O(n)` メモリを消費します。ここで、`n` は渡された値の数です。ただし、少数の値については、関数は非常に効果的です。

この関数は、Excel 関数の[PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)と同等であり、([type R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))に該当します。

異なるレベルの複数の `quantileExactInclusive` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合は [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive) 関数を使用してください。

**構文**

```sql
quantileExactInclusive(level)(expr)
```

**引数**

- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。

**パラメータ**

- `level` — 分位数のレベル。オプションのパラメータ。可能な値: [0, 1] — 境界が含まれます。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。[Float](../../../sql-reference/data-types/float.md)。

**戻り値**

- 指定されたレベルの分位数。

種類:

- 数値データ型入力の場合、[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ：

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

結果：

```text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
