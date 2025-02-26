---
slug: /sql-reference/functions/arithmetic-functions
sidebar_position: 5
sidebar_label: 算術
---

# 算術関数

算術関数は、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32`、または`Float64`のいずれかのタイプの2つのオペランドに対して動作します。

演算を行う前に、両方のオペランドは結果のタイプにキャストされます。結果のタイプは、以下のように決定されます（以下の関数のドキュメントで異なると指定されていない限り）：
- 両方のオペランドが32ビット以内の場合、結果のタイプのサイズは、2つのオペランドのうち大きい方の次に大きいタイプのサイズとなります（整数サイズの昇格）。例えば、`UInt8 + UInt16 = UInt32` または `Float32 * Float32 = Float64` です。
- いずれかのオペランドが64ビット以上の場合、結果のタイプのサイズは、2つのオペランドのうち大きい方と同じサイズになります。例えば、`UInt32 + UInt128 = UInt128` または `Float32 * Float64 = Float64` です。
- いずれかのオペランドが符号付きの場合、結果のタイプも符号付きになり、そうでない場合は符号なしになります。例えば、`UInt32 * Int32 = Int64` です。

これらのルールにより、結果のタイプはすべての可能な結果を表現できる最小のタイプとなります。これにより、値範囲境界周辺のオーバーフローのリスクが生じますが、計算は64ビットの最大ネイティブ整数幅を使用して迅速に実行されることが保証されます。この動作は、多くの他のデータベースとの互換性も保証します。これらのデータベースは、最も大きな整数型として64ビット整数（BIGINT）を提供します。

例：

```sql
SELECT toTypeName(0), toTypeName(0 + 0), toTypeName(0 + 0 + 0), toTypeName(0 + 0 + 0 + 0)
```

```text
┌─toTypeName(0)─┬─toTypeName(plus(0, 0))─┬─toTypeName(plus(plus(0, 0), 0))─┬─toTypeName(plus(plus(plus(0, 0), 0), 0))─┐
│ UInt8         │ UInt16                 │ UInt32                          │ UInt64                                   │
└───────────────┴────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

オーバーフローはC++と同じ方法で発生します。

## plus {#plus}

2つの値 `a` と `b` の合計を計算します。

**構文**

```sql
plus(a, b)
```

整数と日付または日付と時刻を加算することも可能です。前者の操作は日付内の日数を加算し、後者の操作は日付と時刻内の秒数を加算します。

エイリアス: `a + b`（演算子）

## minus {#minus}

2つの値 `a` と `b` の差を計算します。結果は常に符号付きです。

`plus`と同様に、日付または時刻付きの日付から整数を引くことも可能です。

さらに、時刻付きの日付間の減算もサポートされており、2つの間の時間の差が結果として得られます。

**構文**

```sql
minus(a, b)
```

エイリアス: `a - b`（演算子）

## multiply {#multiply}

2つの値 `a` と `b` の積を計算します。

**構文**

```sql
multiply(a, b)
```

エイリアス: `a * b`（演算子）

## divide {#divide}

2つの値 `a` と `b` の商を計算します。結果のタイプは常に [Float64](../data-types/float.md) です。整数除算は `intDiv` 関数で提供されます。

0での除算は `inf`、`-inf`、または `nan` を返します。

**構文**

```sql
divide(a, b)
```

エイリアス: `a / b`（演算子）

## intDiv {#intdiv}

2つの値 `a` を `b` で整数除算します。つまり、商を次の最小の整数に切り下げます。

結果の幅は、被除数（最初のパラメーター）と同じです。

ゼロで除算する場合、商が被除数の範囲に収まらない場合、または最小の負の数をマイナス1で除算する場合には例外が発生します。

**構文**

```sql
intDiv(a, b)
```

**例**

クエリ：

```sql
SELECT
    intDiv(toFloat64(1), 0.001) AS res,
    toTypeName(res)
```

```response
┌──res─┬─toTypeName(intDiv(toFloat64(1), 0.001))─┐
│ 1000 │ Int64                                   │
└──────┴─────────────────────────────────────────┘
```

```sql
SELECT
    intDiv(1, 0.001) AS res,
    toTypeName(res)
```

```response
サーバーからの例外を受信しました (バージョン 23.2.1):
コード: 153. DB::Exception: localhost:9000 から受信しました。DB::Exception: 整数除算を行うことができません。無限または大きすぎる数を生成します: intDiv(1, 0.001) AS res, toTypeName(res) を処理中です。 (ILLEGAL_DIVISION)
```

## intDivOrZero {#intdivorzero}

`intDiv` と同じですが、ゼロでの除算または最小の負の数をマイナス1で除算する場合はゼロを返します。

**構文**

```sql
intDivOrZero(a, b)
```

## isFinite {#isfinite}

Float32 または Float64 の引数が無限でなく、NaNでない場合は1を返し、そうでない場合は0を返します。

**構文**

```sql
isFinite(x)
```

## isInfinite {#isinfinite}

Float32 または Float64 の引数が無限である場合は1を返し、そうでない場合は0を返します。NaNの場合は0が返されることに注意してください。

**構文**

```sql
isInfinite(x)
```

## ifNotFinite {#ifnotfinite}

浮動小数点値が有限であるかどうかを確認します。

**構文**

```sql
ifNotFinite(x,y)
```

**引数**

- `x` — 無限をチェックする値。[Float*](../data-types/float.md)。
- `y` — フォールバック値。[Float*](../data-types/float.md)。

**返される値**

- `x` が有限の場合は `x`。
- `x` が有限でない場合は `y`。

**例**

クエリ：

    SELECT 1/0 as infimum, ifNotFinite(infimum,42)

結果：

    ┌─infimum─┬─ifNotFinite(divide(1, 0), 42)─┐
    │     inf │                            42 │
    └─────────┴───────────────────────────────┘

同様の結果は [三項演算子](../../sql-reference/functions/conditional-functions.md#ternary-operator) を使用することでも得られます: `isFinite(x) ? x : y`。

## isNaN {#isnan}

Float32 および Float64 の引数が NaN である場合は1を返し、そうでない場合は0を返します。

**構文**

```sql
isNaN(x)
```

## modulo {#modulo}

2つの値 `a` を `b` で割った余りを計算します。

両方の入力が整数である場合、結果の型は整数になります。入力のうちの1つが浮動小数点数である場合、結果の型は [Float64](../data-types/float.md) になります。

余りはC++のように計算されます。負の数に対しては切り捨て除算が使用されます。

ゼロで除算する場合や、最小の負の数をマイナス1で除算する場合には例外が発生します。

**構文**

```sql
modulo(a, b)
```

エイリアス: `a % b`（演算子）

## moduloOrZero {#moduloorzero}

[modulo](#modulo) と同様ですが、除数がゼロの場合はゼロを返します。

**構文**

```sql
moduloOrZero(a, b)
```

## positiveModulo(a, b) {#positivemoduloa-b}

[modulo](#modulo) と似ていますが、常に非負の数を返します。

この関数は `modulo` よりも4-5倍遅くなります。

**構文**

```sql
positiveModulo(a, b)
```

エイリアス:
- `positive_modulo(a, b)`
- `pmod(a, b)`

**例**

クエリ：

```sql
SELECT positiveModulo(-1, 10)
```

結果：

```result
┌─positiveModulo(-1, 10)─┐
│                      9 │
└────────────────────────┘
```

## negate {#negate}

値 `a` をネガティブにします。結果は常に符号付きです。

**構文**

```sql
negate(a)
```

エイリアス: `-a`

## abs {#abs}

値 `a` の絶対値を計算します。`a` が符号なしの型である場合には効果がありません。`a` が符号付きの型である場合には符号なしの数を返します。

**構文**

```sql
abs(a)
```

## gcd {#gcd}

2つの値 `a` と `b` の最大公約数を返します。

ゼロで除算する場合や、最小の負の数をマイナス1で除算する場合には例外が発生します。

**構文**

```sql
gcd(a, b)
```

## lcm(a, b) {#lcma-b}

2つの値 `a` と `b` の最小公倍数を返します。

ゼロで除算する場合や、最小の負の数をマイナス1で除算する場合には例外が発生します。

**構文**

```sql
lcm(a, b)
```

## max2 {#max2}

2つの値 `a` と `b` のうち大きい方を返します。返される値は [Float64](../data-types/float.md) 型です。

**構文**

```sql
max2(a, b)
```

**例**

クエリ：

```sql
SELECT max2(-1, 2);
```

結果：

```result
┌─max2(-1, 2)─┐
│           2 │
└─────────────┘
```

## min2 {#min2}

2つの値 `a` と `b` のうち小さい方を返します。返される値は [Float64](../data-types/float.md) 型です。

**構文**

```sql
min2(a, b)
```

**例**

クエリ：

```sql
SELECT min2(-1, 2);
```

結果：

```result
┌─min2(-1, 2)─┐
│          -1 │
└─────────────┘
```

## multiplyDecimal {#multiplydecimal}

2つの小数 `a` と `b` を掛け算します。結果の値は [Decimal256](../data-types/decimal.md) 型になります。

結果のスケールは `result_scale` によって明示的に指定できます。`result_scale` が指定されていない場合、入力値の最大スケールとみなされます。

この関数は通常の `multiply` よりも著しく遅く実行されます。結果の精度を制御する必要がない場合や、迅速な計算が必要な場合は、`multiply` を使用することを検討してください。

**構文**

```sql
multiplyDecimal(a, b[, result_scale])
```

**引数**

- `a` — 第一の値。[Decimal](../data-types/decimal.md)。
- `b` — 第二の値。[Decimal](../data-types/decimal.md)。
- `result_scale` — 結果のスケール。[Int/UInt](../data-types/int-uint.md)。

**返される値**

- 指定されたスケールでの掛け算の結果。[Decimal256](../data-types/decimal.md)。

**例**

```result
┌─multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)─┐
│                                                           25.2 │
└────────────────────────────────────────────────────────────────┘
```

**通常の掛け算との違い:**

```sql
SELECT toDecimal64(-12.647, 3) * toDecimal32(2.1239, 4);
SELECT toDecimal64(-12.647, 3) as a, toDecimal32(2.1239, 4) as b, multiplyDecimal(a, b);
```

結果：

```result
┌─multiply(toDecimal64(-12.647, 3), toDecimal32(2.1239, 4))─┐
│                                               -26.8609633 │
└───────────────────────────────────────────────────────────┘
┌───────a─┬──────b─┬─multiplyDecimal(toDecimal64(-12.647, 3), toDecimal32(2.1239, 4))─┐
│ -12.647 │ 2.1239 │                                                         -26.8609 │
└─────────┴────────┴──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDecimal64(-12.647987876, 9) AS a,
    toDecimal64(123.967645643, 9) AS b,
    multiplyDecimal(a, b);

SELECT
    toDecimal64(-12.647987876, 9) AS a,
    toDecimal64(123.967645643, 9) AS b,
    a * b;
```

結果：

```result
┌─────────────a─┬─────────────b─┬─multiplyDecimal(toDecimal64(-12.647987876, 9), toDecimal64(123.967645643, 9))─┐
│ -12.647987876 │ 123.967645643 │                                                               -1567.941279108 │
└───────────────┴───────────────┴───────────────────────────────────────────────────────────────────────────────┘

サーバーからの例外を受信しました (バージョン 22.11.1):
コード: 407. DB::Exception: localhost:9000 から受信しました。DB::Exception: Decimal math overflow: toDecimal64(-12.647987876, 9) AS a, toDecimal64(123.967645643, 9) AS b, a * b を処理中です。 (DECIMAL_OVERFLOW)
```

## divideDecimal {#dividedecimal}

2つの小数 `a` と `b` を割ります。結果の値は [Decimal256](../data-types/decimal.md) 型になります。

結果のスケールは `result_scale` によって明示的に指定できます。`result_scale` が指定されていない場合は、入力値の最大スケールとみなされます。

この関数は通常の `divide` よりも著しく遅く実行されます。結果の精度を制御する必要がない場合や、迅速な計算が必要な場合は、`divide` を使用することを検討してください。

**構文**

```sql
divideDecimal(a, b[, result_scale])
```

**引数**

- `a` — 第一の値: [Decimal](../data-types/decimal.md)。
- `b` — 第二の値: [Decimal](../data-types/decimal.md)。
- `result_scale` — 結果のスケール: [Int/UInt](../data-types/int-uint.md)。

**返される値**

- 指定されたスケールでの除算の結果。[Decimal256](../data-types/decimal.md)。

**例**

```result
┌─divideDecimal(toDecimal256(-12, 0), toDecimal32(2.1, 1), 10)─┐
│                                                -5.7142857142 │
└──────────────────────────────────────────────────────────────┘
```

**通常の除算との違い:**

```sql
SELECT toDecimal64(-12, 1) / toDecimal32(2.1, 1);
SELECT toDecimal64(-12, 1) as a, toDecimal32(2.1, 1) as b, divideDecimal(a, b, 1), divideDecimal(a, b, 5);
```

結果：

```result
┌─divide(toDecimal64(-12, 1), toDecimal32(2.1, 1))─┐
│                                             -5.7 │
└──────────────────────────────────────────────────┘

┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 1), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 1), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

```sql
SELECT toDecimal64(-12, 0) / toDecimal32(2.1, 1);
SELECT toDecimal64(-12, 0) as a, toDecimal32(2.1, 1) as b, divideDecimal(a, b, 1), divideDecimal(a, b, 5);
```

結果：

```result
DB::Exception: Decimal result's scale is less than argument's one: toDecimal64(-12, 0) / toDecimal32(2.1, 1) を処理中です。 (ARGUMENT_OUT_OF_BOUND)

┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

## byteSwap {#byteswap}

整数のバイトを反転します。つまり、[エンディアン](https://en.wikipedia.org/wiki/Endianness) を変更します。

**構文**

```sql
byteSwap(a)
```

**例**

```sql
byteSwap(3351772109)
```

結果：

```result
┌─byteSwap(3351772109)─┐
│           3455829959 │
└──────────────────────┘
```

上記の例は以下のように算出できます：
1. 10進数の整数をその等価の16進数形式をビッグエンディアン形式に変換します。つまり、3351772109 -> C7 C7 FB CD (4バイト)
2. バイトを反転させます。つまり、C7 C7 FB CD -> CD FB C7 C7
3. 結果を整数に変換します。ビッグエンディアンであると仮定して、つまり、CD FB C7 C7  -> 3455829959

この関数の1つの使用例はIPv4の反転です：

```result
┌─toIPv4(byteSwap(toUInt32(toIPv4('205.251.199.199'))))─┐
│ 199.199.251.205                                       │
└───────────────────────────────────────────────────────┘
```
