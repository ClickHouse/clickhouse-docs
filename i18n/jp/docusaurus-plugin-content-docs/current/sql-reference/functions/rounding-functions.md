---
slug: /sql-reference/functions/rounding-functions
sidebar_position: 155
sidebar_label: Rounding
---


# 四捨五入関数

## floor {#floor}

`x`以下の最大の丸めた数を返します。
丸めた数は、1 / 10 * Nの倍数であるか、1 / 10 * Nが正確でない場合は適切なデータ型の最も近い数です。

整数引数は、負の`N`引数で丸めることができ、非負の`N`では関数は`x`を返す、すなわち何もしません。

丸めによってオーバーフローが発生した場合（例えば`floor(-128, -1)`）、結果は未定義です。

**構文**

``` sql
floor(x[, N])
```

**パラメータ**

- `x` - 丸める値。 [Float*](../data-types/float.md)、[Decimal*](../data-types/decimal.md)、または[(U)Int*](../data-types/int-uint.md)。
- `N`。 [(U)Int*](../data-types/int-uint.md)。 デフォルトはゼロで、整数に丸めることを意味します。 負の値にすることができます。

**返される値**

`x`と同じタイプの丸められた数。

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

`floor`のように、`x`以上の最小の丸めた数を返します。

**構文**

``` sql
ceiling(x[, N])
```

エイリアス: `ceil`

## truncate {#truncate}

`floor`のように、`x`の絶対値以下の最大の絶対値を持つ丸めた数を返します。

**構文**

```sql
truncate(x[, N])
```

エイリアス: `trunc`。

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

関数は指定された位の最も近い数を返します。
入力値が隣接する2つの数の間の距離が等しい場合、関数は[Float*](../data-types/float.md)入力に対して銀行の丸めを使用し、他の数値型（[Decimal*](../data-types/decimal.md)）にはゼロから離れる方向に丸めます。

**構文**

``` sql
round(x[, N])
```

**引数**

- `x` — 丸める数。 [Float*](../data-types/float.md)、[Decimal*](../data-types/decimal.md)、または[(U)Int*](../data-types/int-uint.md)。
- `N` — 丸める小数点以下の桁数。 整数。 デフォルトは`0`です。
    - `N > 0`の場合、関数は小数点の右側に丸めます。
    - `N < 0`の場合、関数は小数点の左側に丸めます。
    - `N = 0`の場合、関数は次の整数に丸めます。

**返される値:**

`x`と同じタイプの丸められた数。

**例**

`Float`入力の例:

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

`Decimal`入力の例:

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

末尾のゼロを保持するには、設定`output_format_decimal_trailing_zeros`を有効にします:

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

``` text
round(3.2, 0) = 3
round(4.1267, 2) = 4.13
round(22,-1) = 20
round(467,-2) = 500
round(-467,-2) = -500
```

銀行の丸め:

``` text
round(3.5) = 4
round(4.5) = 4
round(3.55, 1) = 3.6
round(3.65, 1) = 3.6
```

**関連情報**

- [roundBankers](#roundbankers)

## roundBankers {#roundbankers}

指定された小数位置に数を丸めます。

丸める数が2つの数の間の中間の場合、関数は銀行の丸めを使用します。
銀行の丸めは、分数の数値を丸める方法です。
丸める数が2つの数の間の中間の場合、指定された小数位置で最も近い偶数桁に丸められます。
たとえば、3.5は4に、2.5は2に丸められます。
これは[IEEE 754](https://en.wikipedia.org/wiki/IEEE_754#Roundings_to_nearest)で定義された浮動小数点数のデフォルトの丸め方法です。
[round](#round)関数は浮動小数点数に対して同じ丸めを行います。
`roundBankers`関数は整数も同様に丸めます。たとえば、`roundBankers(45, -1) = 40`。

他のケースでは、関数は数を最も近い整数に丸めます。

銀行の丸めを使用すると、丸めた数がこれらの数の合計または減算の結果に与える影響を減らすことができます。

たとえば、1.5、2.5、3.5、4.5の数字を異なる丸めで合計します：

- 丸めなし: 1.5 + 2.5 + 3.5 + 4.5 = 12。
- 銀行の丸め: 2 + 2 + 4 + 4 = 12。
- 最も近い整数に丸める: 2 + 3 + 4 + 5 = 14。

**構文**

``` sql
roundBankers(x [, N])
```

**引数**

    - `N > 0` — 関数は小数点の右側の指定された位置に数を丸めます。 例: `roundBankers(3.55, 1) = 3.6`。
    - `N < 0` — 関数は小数点の左側の指定された位置に数を丸めます。 例: `roundBankers(24.55, -1) = 20`。
    - `N = 0` — 関数は数を整数に丸めます。この場合、引数は省略可能です。 例: `roundBankers(2.5) = 2`。

- `x` — 丸める数。 [Float*](../data-types/float.md)、[Decimal*](../data-types/decimal.md)、または[(U)Int*](../data-types/int-uint.md)。
- `N` — 丸める小数点以下の桁数。 整数。 デフォルトは`0`。
    - `N > 0`の場合、関数は小数点の右側に丸めます。
    - `N < 0`の場合、関数は小数点の左側に丸めます。
    - `N = 0`の場合、関数は次の整数に丸めます。

**返される値**

銀行の丸め方法で丸められた値。

**例**

クエリ:

```sql
 SELECT number / 2 AS x, roundBankers(x, 0) AS b fROM system.numbers limit 10
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

銀行の丸めの例:

```response
roundBankers(0.4) = 0
roundBankers(-3.5) = -4
roundBankers(4.5) = 4
roundBankers(3.55, 1) = 3.6
roundBankers(3.65, 1) = 3.6
roundBankers(10.35, 1) = 10.4
roundBankers(10.755, 2) = 10.76
```

**関連情報**

- [round](#round)

## roundToExp2 {#roundtoexp2}

数を受け取ります。数が1未満の場合、`0`を返します。それ以外の場合、数を最も近い（整数の非負）2の指数に丸めます。

**構文**

```sql
roundToExp2(num)
```

**パラメータ**

- `num`: 丸める数。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返される値**

- `0`、`num` $\lt 1$の場合。 [UInt8](../data-types/int-uint.md)。
- `num`を最も近い（整数の非負）2の指数に丸めた数。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)で、入力型と同等です。

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

数を受け取ります。数が1未満の場合、`0`を返します。それ以外の場合、数を一般的に使用される期間のセットから丸めます: `1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。

**構文**

```sql
roundDuration(num)
```

**パラメータ**

- `num`: 一般的な期間のセットのいずれかの数に丸める数。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返される値**

- `0`、`num` $\lt 1$の場合。
- それ以外の場合、次のいずれか: `1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。 [UInt16](../data-types/int-uint.md)。

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

人間の年齢のさまざまな一般的な範囲内の数を受け取り、その範囲内の最大または最小を返します。

**構文**

```sql
roundAge(num)
```

**パラメータ**

- `age`: 年齢を年で表す数。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返される値**

- $age \lt 1$の場合は`0`を返します。
- $1 \leq age \leq 17$の場合は`17`を返します。
- $18 \leq age \leq 24$の場合は`18`を返します。
- $25 \leq age \leq 34$の場合は`25`を返します。
- $35 \leq age \leq 44$の場合は`35`を返します。
- $45 \leq age \leq 54$の場合は`45`を返します。
- $age \geq 55$の場合は`55`を返します。

型: [UInt8](../data-types/int-uint.md)。

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

数を受け取り、指定された配列内の要素に丸めます。値が最小範囲より小さい場合、最小範囲が返されます。

**構文**

```sql
roundDown(num, arr)
```

**パラメータ**

- `num`: 丸める数。 [Numeric](../data-types/int-uint.md)。
- `arr`: `age`を丸めるための要素の配列。 [Array](../data-types/array.md)の[UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)型の要素。

**返される値**

- `arr`内の要素に丸められた数。値が最小範囲より小さい場合、最小範囲が返されます。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)型は`arr`の型から推測されます。

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
```
