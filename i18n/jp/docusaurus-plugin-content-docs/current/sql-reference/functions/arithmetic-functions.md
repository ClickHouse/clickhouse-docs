---
slug: /sql-reference/functions/arithmetic-functions
sidebar_position: 5
sidebar_label: 算術
---


# 算術関数

算術関数は、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32`、または `Float64` 型の任意の2つのオペランドに対して動作します。

演算を行う前に、両方のオペランドは結果型にキャストされます。結果型は以下のように決定されます（以下の関数のドキュメントで異なることが指定されていない限り）：
- 両方のオペランドが32ビット以内の場合、結果型のサイズは大きい方のオペランドの次に大きい型のサイズになります（整数サイズの昇格）。例えば、`UInt8 + UInt16 = UInt32` または `Float32 * Float32 = Float64` のようになります。
- いずれかのオペランドが64ビット以上の場合、結果型のサイズは2つのオペランドのうち大きい方と同じサイズになります。例えば、`UInt32 + UInt128 = UInt128` または `Float32 * Float64 = Float64` のようになります。
- いずれかのオペランドが符号付きの場合、結果型も符号付きになります。そうでない場合、結果型は符号なしになります。例えば、`UInt32 * Int32 = Int64` のようになります。

これらのルールにより、結果型はすべての可能な結果を表すことができる最小の型になります。このことは、値範囲の境界周辺でのオーバーフローのリスクを伴いますが、64ビットの最大ネイティブ整数幅を使用して計算が迅速に行われることを保証します。この動作は、最も大きな整数型として64ビット整数（BIGINT）を提供する多くの他のデータベースとの互換性も保証します。

例：

```sql
SELECT toTypeName(0), toTypeName(0 + 0), toTypeName(0 + 0 + 0), toTypeName(0 + 0 + 0 + 0)
```

```text
┌─toTypeName(0)─┬─toTypeName(plus(0, 0))─┬─toTypeName(plus(plus(0, 0), 0))─┬─toTypeName(plus(plus(plus(0, 0), 0), 0))─┐
│ UInt8         │ UInt16                 │ UInt32                          │ UInt64                                   │
└───────────────┴────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

オーバーフローはC++と同様に発生します。

## plus {#plus}

2つの値`a`と`b`の合計を計算します。

**構文**

```sql
plus(a, b)
```

整数と日付または日付と時間を加えることが可能です。前者の操作は日付の日の数を増加させ、後者の操作は日付と時間の秒数を増加させます。

エイリアス: `a + b` (演算子)

## minus {#minus}

2つの値`a`と`b`の差を計算します。結果は常に符号付きです。

`plus`と同様に、日付または日付と時間から整数を引くことができます。

さらに、日付と時間の間の引き算もサポートされており、彼らの間の時間の差を返します。

**構文**

```sql
minus(a, b)
```

エイリアス: `a - b` (演算子)

## multiply {#multiply}

2つの値`a`と`b`の積を計算します。

**構文**

```sql
multiply(a, b)
```

エイリアス: `a * b` (演算子)

## divide {#divide}

2つの値`a`と`b`の商を計算します。結果型は常に [Float64](../data-types/float.md) です。整数の除算は `intDiv` 関数で提供されています。

0での除算は `inf`、`-inf`、または `nan` を返します。

**構文**

```sql
divide(a, b)
```

エイリアス: `a / b` (演算子)

## intDiv {#intdiv}

2つの値 `a` を `b` で整数除算を行います。すなわち、次に小さい整数への切り下げた商を計算します。

結果は被除数（最初のパラメータ）と同じ幅になります。

0で割ると例外がスローされ、商が被除数の範囲に収まらない場合や、最小負数をマイナス1で割るときにも例外がスローされます。

**構文**

```sql
intDiv(a, b)
```

**例**

クエリ:

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
サーバーからの例外を受け取りました (version 23.2.1):
コード: 153. DB::Exception: localhost:9000から受信しました。DB::Exception: 整数除算を行うことができません。無限または非常に大きな数を生成します: intDiv(1, 0.001) AS res、toTypeName(res)を処理中。(ILLEGAL_DIVISION)
```

## intDivOrZero {#intdivorzero}

`intDiv` と同じですが、0で割るか、最小負数をマイナス1で割るときは0を返します。

**構文**

```sql
intDivOrZero(a, b)
```

## isFinite {#isfinite}

Float32またはFloat64の引数が無限ではなく、NaNでない場合は1を返します。そうでない場合、この関数は0を返します。

**構文**

```sql
isFinite(x)
```

## isInfinite {#isinfinite}

Float32またはFloat64の引数が無限の場合は1を返します。そうでない場合、この関数は0を返します。NaNの場合は0が返されます。

**構文**

```sql
isInfinite(x)
```

## ifNotFinite {#ifnotfinite}

浮動小数点値が有限であるかどうかをチェックします。

**構文**

```sql
ifNotFinite(x, y)
```

**引数**

- `x` — 無限かどうかを確認する値。[Float*](../data-types/float.md)。
- `y` — フォールバック値。[Float*](../data-types/float.md)。

**返される値**

- `x` が有限の場合は `x`。
- `x` が有限でない場合は `y`。

**例**

クエリ：

    SELECT 1/0 as infimum, ifNotFinite(infimum, 42)

結果：

    ┌─infimum─┬─ifNotFinite(divide(1, 0), 42)─┐
    │     inf │                            42 │
    └─────────┴───────────────────────────────┘

同様の結果は[三項演算子](../../sql-reference/functions/conditional-functions.md#ternary-operator)を使用して得ることができます: `isFinite(x) ? x : y`。

## isNaN {#isnan}

Float32およびFloat64の引数がNaNの場合は1を返します。そうでない場合、この関数は0を返します。

**構文**

```sql
isNaN(x)
```

## modulo {#modulo}

2つの値 `a` を `b` で除算した余りを計算します。

入力が両方とも整数の場合、結果型は整数になります。入力のいずれかが浮動小数点数である場合、結果型は [Float64](../data-types/float.md) になります。

余りはC++のように計算されます。負の数に対して切り捨て除算が使用されます。

0で割る場合や最小負数をマイナス1で割る場合には例外がスローされます。

**構文**

```sql
modulo(a, b)
```

エイリアス: `a % b` (演算子)

## moduloOrZero {#moduloorzero}

[modulo](#modulo) と同様ですが、除数がゼロの場合はゼロを返します。

**構文**

```sql
moduloOrZero(a, b)
```

## positiveModulo(a, b) {#positivemoduloa-b}

[modulo](#modulo) と同様ですが、常に非負の数を返します。

この関数は `modulo` よりも4〜5倍遅くなります。

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

値 `a` を否定します。結果は常に符号付きです。

**構文**

```sql
negate(a)
```

エイリアス: `-a`

## abs {#abs}

`a` の絶対値を計算します。`a` が符号なし型の場合は影響ありません。`a` が符号付き型の場合は符号なしの数を返します。

**構文**

```sql
abs(a)
```

## gcd {#gcd}

2つの値 `a` と `b` の最大公約数を返します。

0で割る場合や最小負数をマイナス1で割る場合には例外がスローされます。

**構文**

```sql
gcd(a, b)
```

## lcm(a, b) {#lcma-b}

2つの値 `a` と `b` の最小公倍数を返します。

0で割る場合や最小負数をマイナス1で割る場合には例外がスローされます。

**構文**

```sql
lcm(a, b)
```

## max2 {#max2}

2つの値 `a` と `b` のうち大きい方を返します。返される値の型は [Float64](../data-types/float.md) です。

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

2つの値 `a` と `b` のうち小さい方を返します。返される値の型は [Float64](../data-types/float.md) です。

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

2つのデシマル `a` と `b` を掛け算します。結果の値は [Decimal256](../data-types/decimal.md) 型になります。

結果のスケールは `result_scale` で明示的に指定できます。`result_scale` が指定されていない場合、入力値の最大スケールであると見なされます。

この関数は通常の `multiply` よりも著しく遅く動作します。結果の精度に対する制御が不要な場合や、高速な計算が必要な場合は、`multiply` の使用を検討してください。

**構文**

```sql
multiplyDecimal(a, b[, result_scale])
```

**引数**

- `a` — 最初の値。[Decimal](../data-types/decimal.md)。
- `b` — 2番目の値。[Decimal](../data-types/decimal.md)。
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

サーバーからの例外を受け取りました (version 22.11.1):
コード: 407. DB::Exception: localhost:9000から受信しました。DB::Exception: デシマル数学のオーバーフロー: toDecimal64(-12.647987876, 9) AS a, toDecimal64(123.967645643, 9) AS b, a * bを処理中。(DECIMAL_OVERFLOW)
```

## divideDecimal {#dividedecimal}

2つのデシマル `a` と `b` を割ります。結果の値は [Decimal256](../data-types/decimal.md) 型になります。

結果のスケールは `result_scale` で明示的に指定できます。`result_scale` が指定されていない場合、入力値の最大スケールであると見なされます。

この関数は通常の `divide` よりも著しく遅く動作します。結果の精度に対する制御が不要な場合や、高速な計算が必要な場合は、`divide` の使用を検討してください。

**構文**

```sql
divideDecimal(a, b[, result_scale])
```

**引数**

- `a` — 最初の値: [Decimal](../data-types/decimal.md)。
- `b` — 2番目の値: [Decimal](../data-types/decimal.md)。
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
DB::Exception: デシマル結果のスケールが引数のものより小さい: toDecimal64(-12, 0) / toDecimal32(2.1, 1)を処理中。(ARGUMENT_OUT_OF_BOUND)

┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

## byteSwap {#byteswap}

整数のバイトを反転させます。すなわち、その[エンディアン](https://en.wikipedia.org/wiki/Endianness)を変更します。

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

上記の例は以下のように計算できます：
1. 10進整数をその等価な16進形式に変換します（ビッグエンディアン形式）、すなわち3351772109 -> C7 C7 FB CD（4バイト）
2. バイトを反転させます、すなわちC7 C7 FB CD -> CD FB C7 C7
3. 結果を整数に戻します（ビッグエンディアンとして）、すなわちCD FB C7 C7 -> 3455829959

この関数の使用例はIPv4の反転です：

```result
┌─toIPv4(byteSwap(toUInt32(toIPv4('205.251.199.199'))))─┐
│ 199.199.251.205                                       │
└───────────────────────────────────────────────────────┘
```
