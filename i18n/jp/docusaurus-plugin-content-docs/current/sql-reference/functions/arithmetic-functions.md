---
'description': '算術関数のドキュメント'
'sidebar_label': '算術'
'sidebar_position': 5
'slug': '/sql-reference/functions/arithmetic-functions'
'title': 'Arithmetic Functions'
---


# 算術関数

算術関数は、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32`、または `Float64` 型の任意の2つのオペランドで機能します。

演算を実行する前に、両方のオペランドは結果の型にキャストされます。結果の型は以下のように決定されます（以下の関数のドキュメントで異なるように指定されていない限り）：
- 両方のオペランドが32ビット幅までである場合、結果の型のサイズは、2つのオペランドの大きい方の次に大きい型のサイズになります（整数サイズの昇格）。例えば、`UInt8 + UInt16 = UInt32` または `Float32 * Float32 = Float64`。
- オペランドの1つが64ビット以上である場合、結果の型のサイズは2つのオペランドの大きい方と同じサイズになります。例えば、`UInt32 + UInt128 = UInt128` または `Float32 * Float64 = Float64`。
- オペランドの1つが符号付きである場合、結果の型も符号付きになります。そうでない場合は符号なしになります。例えば、`UInt32 * Int32 = Int64`。

これらのルールにより、結果の型はすべての可能な結果を表現できる最小の型が選択されます。これにより値の範囲の境界周辺でのオーバーフローのリスクが導入されますが、計算は64ビットの最大ネイティブ整数幅を使用して迅速に実行されることが保証されます。この動作は、BIGINTとして最大の整数型を提供する他の多くのデータベースとの互換性も保証します。

例：

```sql
SELECT toTypeName(0), toTypeName(0 + 0), toTypeName(0 + 0 + 0), toTypeName(0 + 0 + 0 + 0)
```

```text
┌─toTypeName(0)─┬─toTypeName(plus(0, 0))─┬─toTypeName(plus(plus(0, 0), 0))─┬─toTypeName(plus(plus(plus(0, 0), 0), 0))─┐
│ UInt8         │ UInt16                 │ UInt32                          │ UInt64                                   │
└───────────────┴────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

オーバーフローはC++と同じ方法で生成されます。

## plus {#plus}

2つの値 `a` と `b` の合計を計算します。

**構文**

```sql
plus(a, b)
```

整数と日付または日時を追加することが可能です。前者の操作は日付の中の日数を増加させ、後者の操作は日時の日付の中の秒数を増加させます。

エイリアス: `a + b` (演算子)

## minus {#minus}

2つの値 `a` と `b` の差を計算します。結果は常に符号付きです。

`plus` と同様に、整数を日付または日時から引くことも可能です。

さらに、日時間の引き算もサポートされており、2つの間の時間差を求めることができます。

**構文**

```sql
minus(a, b)
```

エイリアス: `a - b` (演算子)

## multiply {#multiply}

2つの値 `a` と `b` の積を計算します。

**構文**

```sql
multiply(a, b)
```

エイリアス: `a * b` (演算子)

## divide {#divide}

2つの値 `a` と `b` の商を計算します。結果型は常に[Float64](../data-types/float.md)です。整数の割り算は `intDiv` 関数によって提供されます。

0での除算は `inf`、`-inf`、または `nan` を返します。

**構文**

```sql
divide(a, b)
```

エイリアス: `a / b` (演算子)

## divideOrNull {#divideornull}

[divide](#divide) と同様ですが、除数がゼロの際にNULLを返します。

**構文**

```sql
divideOrNull(a, b)
```

## intDiv {#intdiv}

2つの値 `a` と `b` の整数除算を行います。つまり、商を次の最小の整数に切り下げて計算します。

結果は被除数（最初のパラメータ）と同じ幅を持ちます。

ゼロでの除算、商が被除数の範囲に収まらない場合、または最小の負数をマイナス1で除算する際には例外がスローされます。

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
Received exception from server (version 23.2.1):
Code: 153. DB::Exception: Received from localhost:9000. DB::Exception: Cannot perform integer division, because it will produce infinite or too large number: While processing intDiv(1, 0.001) AS res, toTypeName(res). (ILLEGAL_DIVISION)
```

## intDivOrZero {#intdivorzero}

`intDiv` と同様ですが、ゼロで除算する際や最小の負数をマイナス1で除算する際にはゼロを返します。

**構文**

```sql
intDivOrZero(a, b)
```

## intDivOrNull {#intdivornull}

[intDiv](#intdiv) と同様ですが、除数がゼロの場合にNULLを返します。

**構文**

```sql
intDivOrNull(a, b)
```

## isFinite {#isfinite}

Float32 または Float64 引数が無限大でなく、NaNでもない場合は1を返します。それ以外の場合はこの関数は0を返します。

**構文**

```sql
isFinite(x)
```

## isInfinite {#isinfinite}

Float32 または Float64 引数が無限大である場合は1を返します。それ以外の場合はこの関数は0を返します。NaNの場合は0が返されます。

**構文**

```sql
isInfinite(x)
```

## ifNotFinite {#ifnotfinite}

浮動小数点値が有限かどうかをチェックします。

**構文**

```sql
ifNotFinite(x,y)
```

**引数**

- `x` — 無限大かどうかをチェックする値。 [Float*](../data-types/float.md)。
- `y` — フォールバック値。 [Float*](../data-types/float.md)。

**返される値**

- `x` が有限であれば `x`。
- `x` が有限でなければ `y`。

**例**

クエリ：

    SELECT 1/0 as infimum, ifNotFinite(infimum,42)

結果：

    ┌─infimum─┬─ifNotFinite(divide(1, 0), 42)─┐
    │     inf │                            42 │
    └─────────┴───────────────────────────────┘

[三項演算子](/sql-reference/functions/conditional-functions#if)を使用することで類似の結果を得ることができます: `isFinite(x) ? x : y`。

## isNaN {#isnan}

Float32 および Float64 引数が NaN である場合は1を返します。それ以外の場合はこの関数は0を返します。

**構文**

```sql
isNaN(x)
```

## modulo {#modulo}

2つの値 `a` を `b` で割った余りを計算します。

入力が両方とも整数の場合、結果型は整数になります。1つでも浮動小数点数が存在する場合、結果型は [Float64](../data-types/float.md) になります。

余りはC++のように計算されます。負の数に対しては切り捨て除算が使用されます。

ゼロで割るときや最小の負数をマイナス1で割るときには例外がスローされます。

**構文**

```sql
modulo(a, b)
```

エイリアス: `a % b` (演算子)

## moduloOrZero {#moduloorzero}

[modulo](#modulo) と同様ですが、除数がゼロの際にはゼロを返します。

**構文**

```sql
moduloOrZero(a, b)
```

## moduloOrNull {#moduloornull}

[modulo](#modulo) と同様ですが、除数がゼロの際にNULLを返します。

**構文**

```sql
moduloOrNull(a, b)
```

## positiveModulo(a, b) {#positivemoduloa-b}

[modulo](#modulo) と同様ですが、常に非負の数を返します。

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

## positiveModuloOrNull(a, b) {#positivemoduloornulla-b}

[positiveModulo](#positivemoduloa-b) と同様ですが、除数がゼロの場合はNULLを返します。

**構文**

```sql
positiveModuloOrNull(a, b)
```

## negate {#negate}

値 `a` をネガティブにします。結果は常に符号付きです。

**構文**

```sql
negate(a)
```

エイリアス: `-a`

## abs {#abs}

値 `a` の絶対値を計算します。`a` が符号なし型である場合は効果がありません。`a` が符号付き型である場合、符号なしの数を返します。

**構文**

```sql
abs(a)
```

## gcd {#gcd}

2つの値 `a` および `b` の最大公約数を返します。

ゼロでの除算や、最小の負数をマイナス1で割るときには例外がスローされます。

**構文**

```sql
gcd(a, b)
```

## lcm(a, b) {#lcma-b}

2つの値 `a` および `b` の最小公倍数を返します。

ゼロでの除算や、最小の負数をマイナス1で割るときには例外がスローされます。

**構文**

```sql
lcm(a, b)
```

## max2 {#max2}

2つの値 `a` および `b` の大きい方を返します。返される値の型は[Float64](../data-types/float.md)です。

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

2つの値 `a` および `b` の小さい方を返します。返される値の型は[Float64](../data-types/float.md)です。

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

2つの小数 `a` と `b` を掛け算します。結果の値は[Decimal256](../data-types/decimal.md)型になります。

結果のスケールは `result_scale` で明示的に指定できます。`result_scale` が指定されていない場合、入力値の最大スケールとみなされます。

この関数は通常の `multiply` よりも顕著に遅く動作します。結果の精度に対する制御が不要であり、あるいは高速な計算が望まれる場合は `multiply` の使用を検討してください。

**構文**

```sql
multiplyDecimal(a, b[, result_scale])
```

**引数**

- `a` — 最初の値。[Decimal](../data-types/decimal.md)。
- `b` — 2番目の値。[Decimal](../data-types/decimal.md)。
- `result_scale` — 結果のスケール。[Int/UInt](../data-types/int-uint.md)。

**返される値**

- 指定されたスケールでの乗算の結果。[Decimal256](../data-types/decimal.md)。

**例**

```result
┌─multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)─┐
│                                                           25.2 │
└────────────────────────────────────────────────────────────────┘
```

**通常の乗算との違い：**

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

Received exception from server (version 22.11.1):
Code: 407. DB::Exception: Received from localhost:9000. DB::Exception: Decimal math overflow: While processing toDecimal64(-12.647987876, 9) AS a, toDecimal64(123.967645643, 9) AS b, a * b. (DECIMAL_OVERFLOW)
```

## divideDecimal {#dividedecimal}

2つの小数 `a` と `b` を割ります。結果の値は[Decimal256](../data-types/decimal.md)型になります。

結果のスケールは `result_scale` で明示的に指定できます。`result_scale` が指定されていない場合、入力値の最大スケールとみなされます。

この関数は通常の `divide` よりも顕著に遅く動作します。結果の精度に対する制御が不要であり、あるいは高速な計算が望まれる場合は `divide` の使用を検討してください。

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

**通常の除算との違い：**

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
DB::Exception: Decimal result's scale is less than argument's one: While processing toDecimal64(-12, 0) / toDecimal32(2.1, 1). (ARGUMENT_OUT_OF_BOUND)

┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

## byteSwap {#byteswap}

整数のバイトを反転させます。つまり、その[エンディアン](https://en.wikipedia.org/wiki/Endianness)を変更します。

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

上記の例は、次のように計算されます：
1. 10進数の整数をビッグエンディアン形式の相当な16進数フォーマットに変換します。すなわち3351772109 -> C7 C7 FB CD (4バイト)
2. バイトを反転します。すなわちC7 C7 FB CD -> CD FB C7 C7
3. 結果をビッグエンディアンと仮定して整数に戻します。すなわちCD FB C7 C7 -> 3455829959

この関数の使い方の一例はIPv4を反転させることです：

```result
┌─toIPv4(byteSwap(toUInt32(toIPv4('205.251.199.199'))))─┐
│ 199.199.251.205                                       │
└───────────────────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
