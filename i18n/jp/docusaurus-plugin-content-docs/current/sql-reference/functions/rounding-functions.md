description: '丸め関数に関するドキュメント'
sidebar_label: '丸め'
sidebar_position: 155
slug: /sql-reference/functions/rounding-functions
title: '丸め関数'
```


# 丸め関数

## floor {#floor}

`x` 以下の最大の丸められた数を返します。  
丸められた数は 1 / 10 * N の倍数、または 1 / 10 * N が正確でない場合は適切なデータ型の最も近い数です。

整数引数は負の `N` 引数で丸めることができ、非負の `N` では関数は `x` を返します。つまり、何も行いません。

丸めがオーバーフローを引き起こす場合（例：`floor(-128, -1)`）、結果は未定義です。

**構文**

```sql
floor(x[, N])
```

**パラメータ**

- `x` - 丸める値。 [Float*](../data-types/float.md)、[Decimal*](../data-types/decimal.md)、または[(U)Int*](../data-types/int-uint.md)。
- `N` . [(U)Int*](../data-types/int-uint.md)。デフォルトはゼロで、整数への丸めを意味します。負の値にすることができます。

**返される値**

`x` と同じ型の丸められた数。

**例**

クエリ:

```sql
SELECT floor(123.45, 1) AS rounded
```

結果:

```response
┌─rounded─┐
│   123.4 │
└─────────┘
```

クエリ:

```sql
SELECT floor(123.45, -1)
```

結果:

```response
┌─rounded─┐
│     120 │
└─────────┘
```

## ceiling {#ceiling}

`floor` と似ていますが、`x` 以上の最小の丸められた数を返します。

**構文**

```sql
ceiling(x[, N])
```

エイリアス: `ceil`

## truncate {#truncate}

`floor` と似ていますが、`x` の絶対値以下の最大の絶対値を持つ丸められた数を返します。

**構文**

```sql
truncate(x[, N])
```

エイリアス: `trunc`.

**例**

クエリ:

```sql
SELECT truncate(123.499, 1) as res;
```

```response
┌───res─┐
│ 123.4 │
└───────┘
```

## round {#round}

指定された小数点以下の桁数に値を丸めます。

この関数は、指定された桁数の最も近い数を返します。  
入力値が2つの隣接数との距離が等しい場合、関数は [Float*](../data-types/float.md) 入力に対してバンカーの丸めを使用し、他の数値型（[Decimal*](../data-types/decimal.md)）に対してはゼロから遠ざけて丸めます。

**構文**

```sql
round(x[, N])
```

**引数**

- `x` — 丸める数。 [Float*](../data-types/float.md)、[Decimal*](../data-types/decimal.md)、または[(U)Int*](../data-types/int-uint.md)。
- `N` — 丸める小数点以下の桁数。整数。デフォルトは `0`。
    - `N > 0` の場合、関数は小数点の右側を丸めます。
    - `N < 0` の場合、関数は小数点の左側を丸めます。
    - `N = 0` の場合、関数は次の整数を丸めます。

**返される値:**

`x` と同じ型の丸められた数。

**例**

`Float` 入力の例:

```sql
SELECT number / 2 AS x, round(x) FROM system.numbers LIMIT 3;
```

```response
┌───x─┬─round(divide(number, 2))─┐
│   0 │                        0 │
│ 0.5 │                        0 │
│   1 │                        1 │
└─────┴──────────────────────────┘
```

`Decimal` 入力の例:

```sql
SELECT cast(number / 2 AS  Decimal(10,4)) AS x, round(x) FROM system.numbers LIMIT 3;
```

```sql
┌───x─┬─round(CAST(divide(number, 2), 'Decimal(10, 4)'))─┐
│   0 │                                                0 │
│ 0.5 │                                                1 │
│   1 │                                                1 │
└─────┴──────────────────────────────────────────────────┘
```

末尾のゼロを維持するには、設定 `output_format_decimal_trailing_zeros` を有効にします:

```sql
SELECT cast(number / 2 AS  Decimal(10,4)) AS x, round(x) FROM system.numbers LIMIT 3 settings output_format_decimal_trailing_zeros=1;

```

```sql
┌──────x─┬─round(CAST(divide(number, 2), 'Decimal(10, 4)'))─┐
│ 0.0000 │                                           0.0000 │
│ 0.5000 │                                           1.0000 │
│ 1.0000 │                                           1.0000 │
└────────┴──────────────────────────────────────────────────┘
```

最も近い数に丸める例:

```text
round(3.2, 0) = 3
round(4.1267, 2) = 4.13
round(22,-1) = 20
round(467,-2) = 500
round(-467,-2) = -500
```

バンカーの丸め。

```text
round(3.5) = 4
round(4.5) = 4
round(3.55, 1) = 3.6
round(3.65, 1) = 3.6
```

**参照**

- [roundBankers](#roundbankers)

## roundBankers {#roundbankers}

指定した小数位置に数を丸めます。

丸め数が2つの数の間で半分の場合、関数はバンカーの丸めを使用します。  
バンカーの丸めは、分数を丸める方法であり、  
丸め数が2つの数の間で半分の場合、指定された小数位置で最も近い偶数の桁に丸められます。  
例えば: 3.5 は 4 に、2.5 は 2 に丸められます。  
これは、[IEEE 754](https://en.wikipedia.org/wiki/IEEE_754#Roundings_to_nearest) で定義された浮動小数点数のデフォルトの丸め方法です。  
[round](#round) 関数は浮動小数点数に対して同じ丸めを行います。  
`roundBankers` 関数も整数を同様に丸め、例えば `roundBankers(45, -1) = 40` になります。

他の場合では、関数は数を最も近い整数に丸めます。

バンカーの丸めを使用すると、丸めの結果がこれらの数の合計や引き算の結果に与える影響を減らすことができます。

例えば、異なる丸めで 1.5、2.5、3.5、4.5 の合計を求めると:

- 丸めなし: 1.5 + 2.5 + 3.5 + 4.5 = 12。
- バンカーの丸め: 2 + 2 + 4 + 4 = 12。
- 最も近い整数に丸め: 2 + 3 + 4 + 5 = 14。

**構文**

```sql
roundBankers(x [, N])
```

**引数**

    - `N > 0` — 関数は数を小数点の右側の指定位置に丸めます。例: `roundBankers(3.55, 1) = 3.6`。
    - `N < 0` — 関数は数を小数点の左側の指定位置に丸めます。例: `roundBankers(24.55, -1) = 20`。
    - `N = 0` — 関数は数を整数に丸めます。この場合、引数は省略できます。例: `roundBankers(2.5) = 2`。

- `x` — 丸める数。 [Float*](../data-types/float.md)、[Decimal*](../data-types/decimal.md)、または[(U)Int*](../data-types/int-uint.md)。
- `N` — 丸める小数点以下の桁数。整数。デフォルトは `0`。
    - `N > 0` の場合、関数は小数点の右側を丸めます。
    - `N < 0` の場合、関数は小数点の左側を丸めます。
    - `N = 0` の場合、関数は次の整数を丸めます。

**返される値**

バンカーの丸め方法によって丸められた値。

**例**

クエリ:

```sql
 SELECT number / 2 AS x, roundBankers(x, 0) AS b FROM system.numbers limit 10
```

結果:

```response
┌───x─┬─b─┐
│   0 │ 0 │
│ 0.5 │ 0 │
│   1 │ 1 │
│ 1.5 │ 2 │
│   2 │ 2 │
│ 2.5 │ 2 │
│   3 │ 3 │
│ 3.5 │ 4 │
│   4 │ 4 │
│ 4.5 │ 4 │
└─────┴───┘
```

バンカーの丸めの例:

```response
roundBankers(0.4) = 0
roundBankers(-3.5) = -4
roundBankers(4.5) = 4
roundBankers(3.55, 1) = 3.6
roundBankers(3.65, 1) = 3.6
roundBankers(10.35, 1) = 10.4
roundBankers(10.755, 2) = 10.76
```

**参照**

- [round](#round)

## roundToExp2 {#roundtoexp2}

数を受け取ります。数が1未満の場合、`0` を返します。それ以外の場合は、数を最も近い（非負の整数）2のべき乗に丸めます。

**構文**

```sql
roundToExp2(num)
```

**パラメータ**

- `num`: 丸める数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返される値**

- `0`、`num` $\lt 1$ の場合。 [UInt8](../data-types/int-uint.md)。
- `num` を最も近い（非負の整数）2のべき乗に丸めたもの。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 入力型に相当。

**例**

クエリ:

```sql
SELECT *, roundToExp2(*) FROM system.numbers WHERE number IN (0, 2, 5, 10, 19, 50)
```

結果:

```response
┌─number─┬─roundToExp2(number)─┐
│      0 │                   0 │
│      2 │                   2 │
│      5 │                   4 │
│     10 │                   8 │
│     19 │                  16 │
│     50 │                  32 │
└────────┴─────────────────────┘
```

## roundDuration {#roundduration}

数を受け取ります。数が1未満の場合、`0` を返します。それ以外の場合は、一般に使われる期間のセットから数を下に丸めます: `1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。

**構文**

```sql
roundDuration(num)
```

**パラメータ**

- `num`: 一般的な期間のセットのいずれかの数字へ丸める数。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返される値**

- `0`、`num` $\lt 1$ の場合。
- それ以外の場合、以下のいずれか: `1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。 [UInt16](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT *, roundDuration(*) FROM system.numbers WHERE number IN (0, 9, 19, 47, 101, 149, 205, 271, 421, 789, 1423, 2345, 4567, 9876, 24680, 42573)
```

結果:

```response
┌─number─┬─roundDuration(number)─┐
│      0 │                     0 │
│      9 │                     1 │
│     19 │                    10 │
│     47 │                    30 │
│    101 │                    60 │
│    149 │                   120 │
│    205 │                   180 │
│    271 │                   240 │
│    421 │                   300 │
│    789 │                   600 │
│   1423 │                  1200 │
│   2345 │                  1800 │
│   4567 │                  3600 │
│   9876 │                  7200 │
│  24680 │                 18000 │
│  42573 │                 36000 │
└────────┴───────────────────────┘
```

## roundAge {#roundage}

様々な一般的な人間の年齢範囲の数を受け取り、その範囲内の最大または最小を返します。

**構文**

```sql
roundAge(num)
```

**パラメータ**

- `age`: 年齢を表す数（年）。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返される値**

- $age \lt 1$ の場合、`0` を返します。
- $1 \leq age \leq 17$ の場合、`17` を返します。
- $18 \leq age \leq 24$ の場合、`18` を返します。
- $25 \leq age \leq 34$ の場合、`25` を返します。
- $35 \leq age \leq 44$ の場合、`35` を返します。
- $45 \leq age \leq 54$ の場合、`45` を返します。
- $age \geq 55$ の場合、`55` を返します。

タイプ: [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT *, roundAge(*) FROM system.numbers WHERE number IN (0, 5, 20, 31, 37, 54, 72);
```

結果:

```response
┌─number─┬─roundAge(number)─┐
│      0 │                0 │
│      5 │               17 │
│     20 │               18 │
│     31 │               25 │
│     37 │               35 │
│     54 │               45 │
│     72 │               55 │
└────────┴──────────────────┘
```

## roundDown {#rounddown}

数を受け取り、指定された配列の要素に下丸めします。値が下限より小さい場合は、下限が返されます。

**構文**

```sql
roundDown(num, arr)
```

**パラメータ**

- `num`: 下丸めする数。 [Numeric](../data-types/int-uint.md)。
- `arr`: `age` を下丸めするための要素の配列。 [Array](../data-types/array.md) 型の [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md).

**返される値**

- `arr` の要素に下丸めされた数。値が下限より小さい場合は、下限が返されます。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 型は `arr` の型から推定されます。

**例**

クエリ:

```sql
SELECT *, roundDown(*, [3, 4, 5]) FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5)
```

結果:

```response
┌─number─┬─roundDown(number, [3, 4, 5])─┐
│      0 │                            3 │
│      1 │                            3 │
│      2 │                            3 │
│      3 │                            3 │
│      4 │                            4 │
│      5 │                            5 │
└────────┴──────────────────────────────┘
