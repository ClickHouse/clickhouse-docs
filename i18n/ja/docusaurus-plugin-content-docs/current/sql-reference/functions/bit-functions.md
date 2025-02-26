---
slug: /sql-reference/functions/bit-functions
sidebar_position: 20
sidebar_label: ビット
---

# ビット関数

ビット関数は、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32`、または `Float64` の任意のペアの型に対して機能します。一部の関数は `String` と `FixedString` 型をサポートします。

結果の型は、引数の最大ビット数と同じビット数の整数です。引数のうち、少なくとも1つが符号付きの場合、結果は符号付きの数となります。引数が浮動小数点数の場合、Int64 にキャストされます。

## bitAnd(a, b) {#bitanda-b}

## bitOr(a, b) {#bitora-b}

## bitXor(a, b) {#bitxora-b}

## bitNot(a) {#bitnota}

## bitShiftLeft(a, b) {#bitshiftlefta-b}

指定されたビット位置数だけ値の二進数表現を左にシフトします。

`FixedString` または `String` は、1つのマルチバイト値として扱われます。

`FixedString` 値のビットはシフトアウトされると失われます。対照的に、`String` 値は追加のバイトで拡張されるため、ビットは失われません。

**構文**

``` sql
bitShiftLeft(a, b)
```

**引数**

- `a` — シフトする値。[整数型](../data-types/int-uint.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `b` — シフト位置の数。[符号なし整数型](../data-types/int-uint.md)、64ビット型以下が許可されています。

**戻り値**

- シフトされた値。

戻り値の型は、入力値の型と同じです。

**例**

以下のクエリでは、[bin](encoding-functions.md#bin) および [hex](encoding-functions.md#hex) 関数を使用して、シフトされた値のビットを表示します。

``` sql
SELECT 99 AS a, bin(a), bitShiftLeft(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
```

結果:

``` text
┌──a─┬─bin(99)──┬─a_shifted─┬─bin(bitShiftLeft(99, 2))─┐
│ 99 │ 01100011 │       140 │ 10001100                 │
└────┴──────────┴───────────┴──────────────────────────┘
┌─a───┬─hex('abc')─┬─a_shifted─┬─hex(bitShiftLeft('abc', 4))─┐
│ abc │ 616263     │ &0        │ 06162630                    │
└─────┴────────────┴───────────┴─────────────────────────────┘
┌─a───┬─hex(toFixedString('abc', 3))─┬─a_shifted─┬─hex(bitShiftLeft(toFixedString('abc', 3), 4))─┐
│ abc │ 616263                       │ &0        │ 162630                                        │
└─────┴──────────────────────────────┴───────────┴───────────────────────────────────────────────┘
```

## bitShiftRight(a, b) {#bitshiftrighta-b}

指定されたビット位置数だけ値の二進数表現を右にシフトします。

`FixedString` または `String` は、1つのマルチバイト値として扱われます。ビットがシフトアウトされると `String` 値の長さが減少することに注意してください。

**構文**

``` sql
bitShiftRight(a, b)
```

**引数**

- `a` — シフトする値。[整数型](../data-types/int-uint.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `b` — シフト位置の数。[符号なし整数型](../data-types/int-uint.md)、64ビット型以下が許可されています。

**戻り値**

- シフトされた値。

戻り値の型は、入力値の型と同じです。

**例**

クエリ:

``` sql
SELECT 101 AS a, bin(a), bitShiftRight(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
```

結果:

``` text
┌───a─┬─bin(101)─┬─a_shifted─┬─bin(bitShiftRight(101, 2))─┐
│ 101 │ 01100101 │        25 │ 00011001                   │
└─────┴──────────┴───────────┴────────────────────────────┘
┌─a───┬─hex('abc')─┬─a_shifted─┬─hex(bitShiftRight('abc', 12))─┐
│ abc │ 616263     │           │ 0616                          │
└─────┴────────────┴───────────┴───────────────────────────────┘
┌─a───┬─hex(toFixedString('abc', 3))─┬─a_shifted─┬─hex(bitShiftRight(toFixedString('abc', 3), 12))─┐
│ abc │ 616263                       │           │ 000616                                          │
└─────┴──────────────────────────────┴───────────┴─────────────────────────────────────────────────┘
```

## bitRotateLeft(a, b) {#bitrotatelefta-b}

## bitRotateRight(a, b) {#bitrotaterighta-b}

## bitSlice(s, offset, length) {#bitslices-offset-length}

'offset' インデックスから始まる 'length' ビット長の部分文字列を返します。ビットインデックスは1から始まります。

**構文**

``` sql
bitSlice(s, offset[, length])
```

**引数**

- `s` — `s` は [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — ビットの開始インデックス。正の値は左のオフセットを示し、負の値は右のインデントを示します。ビットの番号付けは1から始まります。
- `length` — ビットを持つ部分文字列の長さ。負の値を指定すると、関数はオープンな部分文字列 \[offset, array_length - length\] を返します。値を省略すると、関数は部分文字列 \[offset, the_end_string\] を返します。長さが `s` を超えると、切り捨てられます。長さが8の倍数でない場合は、右に0を埋めます。

**戻り値**

- 部分文字列。[String](../data-types/string.md)

**例**

クエリ:

``` sql
select bin('Hello'), bin(bitSlice('Hello', 1, 8))
select bin('Hello'), bin(bitSlice('Hello', 1, 2))
select bin('Hello'), bin(bitSlice('Hello', 1, 9))
select bin('Hello'), bin(bitSlice('Hello', -4, 8))
```

結果:

``` text
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', 1, 8))─┐
│ 0100100001100101011011000110110001101111 │ 01001000                     │
└──────────────────────────────────────────┴──────────────────────────────┘
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', 1, 2))─┐
│ 0100100001100101011011000110110001101111 │ 01000000                     │
└──────────────────────────────────────────┴──────────────────────────────┘
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', 1, 9))─┐
│ 0100100001100101011011000110110001101111 │ 0100100000000000             │
└──────────────────────────────────────────┴──────────────────────────────┘
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', -4, 8))─┐
│ 0100100001100101011011000110110001101111 │ 11110000                      │
└──────────────────────────────────────────┴───────────────────────────────┘
```

## byteSlice(s, offset, length) {#byteslices-offset-length}

関数 [substring](string-functions.md#substring) を参照してください。

## bitTest {#bittest}

任意の整数を取り込み、[二進数形式](https://en.wikipedia.org/wiki/Binary_number) に変換し、指定された位置のビットの値を返します。数え方は右から左へ、0から始まります。

**構文**

``` sql
SELECT bitTest(number, index)
```

**引数**

- `number` – 整数。
- `index` – ビットの位置。

**戻り値**

- 指定された位置のビットの値。[UInt8](../data-types/int-uint.md)。

**例**

例えば、数値 43 を二進数（バイナリ）数体系で表すと 101011 です。

クエリ:

``` sql
SELECT bitTest(43, 1);
```

結果:

``` text
┌─bitTest(43, 1)─┐
│              1 │
└────────────────┘
```

別の例:

クエリ:

``` sql
SELECT bitTest(43, 2);
```

結果:

``` text
┌─bitTest(43, 2)─┐
│              0 │
└────────────────┘
```

## bitTestAll {#bittestall}

指定された位置のすべてのビットの [論理積](https://en.wikipedia.org/wiki/Logical_conjunction) (AND 演算子) の結果を返します。数え方は右から左へ、0から始まります。

ビット単位の演算における論理積:

0 AND 0 = 0

0 AND 1 = 0

1 AND 0 = 0

1 AND 1 = 1

**構文**

``` sql
SELECT bitTestAll(number, index1, index2, index3, index4, ...)
```

**引数**

- `number` – 整数。
- `index1`, `index2`, `index3`, `index4` – ビットの位置。例えば、位置の集合 (`index1`, `index2`, `index3`, `index4`) に対して真であるのは、すべての位置が真である場合のみです（`index1` ⋀ `index2` ⋀ `index3` ⋀ `index4`）。

**戻り値**

- 論理積の結果。[UInt8](../data-types/int-uint.md)。

**例**

例えば、数値 43 を二進数で表すと 101011 です。

クエリ:

``` sql
SELECT bitTestAll(43, 0, 1, 3, 5);
```

結果:

``` text
┌─bitTestAll(43, 0, 1, 3, 5)─┐
│                          1 │
└────────────────────────────┘
```

別の例:

クエリ:

``` sql
SELECT bitTestAll(43, 0, 1, 3, 5, 2);
```

結果:

``` text
┌─bitTestAll(43, 0, 1, 3, 5, 2)─┐
│                             0 │
└───────────────────────────────┘
```

## bitTestAny {#bittestany}

指定された位置のすべてのビットの [論理和](https://en.wikipedia.org/wiki/Logical_disjunction) (OR 演算子) の結果を返します。数え方は右から左へ、0から始まります。

ビット単位の演算における論理和:

0 OR 0 = 0

0 OR 1 = 1

1 OR 0 = 1

1 OR 1 = 1

**構文**

``` sql
SELECT bitTestAny(number, index1, index2, index3, index4, ...)
```

**引数**

- `number` – 整数。
- `index1`, `index2`, `index3`, `index4` – ビットの位置。

**戻り値**

- 論理和の結果。[UInt8](../data-types/int-uint.md)。

**例**

例えば、数値 43 を二進数で表すと 101011 です。

クエリ:

``` sql
SELECT bitTestAny(43, 0, 2);
```

結果:

``` text
┌─bitTestAny(43, 0, 2)─┐
│                    1 │
└──────────────────────┘
```

別の例:

クエリ:

``` sql
SELECT bitTestAny(43, 4, 2);
```

結果:

``` text
┌─bitTestAny(43, 4, 2)─┐
│                    0 │
└──────────────────────┘
```

## bitCount {#bitcount}

数値の二進数表現において、1に設定されたビットの数を計算します。

**構文**

``` sql
bitCount(x)
```

**引数**

- `x` — [整数](../data-types/int-uint.md) または [浮動小数点](../data-types/float.md) 数値。この関数はメモリ内の値の表現を使用するため、浮動小数点数のサポートが可能です。

**戻り値**

- 入力数値における1に設定されたビットの数。[UInt8](../data-types/int-uint.md)。

:::note
この関数は入力値を大きな型に変換しません（[符号拡張](https://en.wikipedia.org/wiki/Sign_extension)）。したがって、例えば `bitCount(toUInt8(-1)) = 8` です。
:::

**例**

例えば、数値 333 の二進数表現は 0000000101001101 です。

クエリ:

``` sql
SELECT bitCount(333);
```

結果:

``` text
┌─bitCount(333)─┐
│             5 │
└───────────────┘
```

## bitHammingDistance {#bithammingdistance}

2つの整数値のビット表現間の [ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance) を返します。準複製文字列の検出のために [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) 関数と共に使用することができます。距離が小さいほど、それらの文字列が同じである可能性が高くなります。

**構文**

``` sql
bitHammingDistance(int1, int2)
```

**引数**

- `int1` — 最初の整数値。[Int64](../data-types/int-uint.md)。
- `int2` — 2番目の整数値。[Int64](../data-types/int-uint.md)。

**戻り値**

- ハミング距離。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

``` sql
SELECT bitHammingDistance(111, 121);
```

結果:

``` text
┌─bitHammingDistance(111, 121)─┐
│                            3 │
└──────────────────────────────┘
```

[SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) とともに使用する場合:

``` sql
SELECT bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'));
```

結果:

``` text
┌─bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'))─┐
│                                                                            5 │
└──────────────────────────────────────────────────────────────────────────────┘
```
