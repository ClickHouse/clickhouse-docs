---
'description': 'Bit Functions のドキュメント'
'sidebar_label': 'ビット'
'sidebar_position': 20
'slug': '/sql-reference/functions/bit-functions'
'title': 'Bit Functions'
---

# ビット関数

ビット関数は、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32`、または`Float64`の任意の型のペアに対して動作します。一部の関数は`String`および`FixedString`型をサポートしています。

結果の型は、その引数の最大ビット数に等しい整数です。引数のうち少なくとも1つが符号付きである場合、結果は符号付き数になります。引数が浮動小数点数である場合、Int64にキャストされます。

## bitAnd(a, b) {#bitanda-b}

## bitOr(a, b) {#bitora-b}

## bitXor(a, b) {#bitxora-b}

## bitNot(a) {#bitnota}

## bitShiftLeft(a, b) {#bitshiftlefta-b}

指定されたビット位置数だけ、値のバイナリ表現を左にシフトします。

`FixedString`または`String`は、単一のマルチバイト値として扱われます。

`FixedString`値のビットは、シフトされる際に失われます。逆に、`String`値は追加のバイトで拡張されるため、ビットは失われません。

**構文**

```sql
bitShiftLeft(a, b)
```

**引数**

- `a` — シフトする値。[整数型](../data-types/int-uint.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `b` — シフト位置の数。[符号なし整数型](../data-types/int-uint.md) と64ビット型以下が許可されています。

**返される値**

- シフトされた値。

返される値の型は、入力値の型と同じです。

**例**

以下のクエリでは、[bin](encoding-functions.md#bin) および [hex](encoding-functions.md#hex) 関数を使用してシフトされた値のビットを表示しています。

```sql
SELECT 99 AS a, bin(a), bitShiftLeft(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
```

結果:

```text
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

指定されたビット位置数だけ、値のバイナリ表現を右にシフトします。

`FixedString`または`String`は、単一のマルチバイト値として扱われます。ビットをシフトすると`String`値の長さが減少することに注意してください。

**構文**

```sql
bitShiftRight(a, b)
```

**引数**

- `a` — シフトする値。[整数型](../data-types/int-uint.md)、[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `b` — シフト位置の数。[符号なし整数型](../data-types/int-uint.md)と64ビット型以下が許可されています。

**返される値**

- シフトされた値。

返される値の型は、入力値の型と同じです。

**例**

クエリ:

```sql
SELECT 101 AS a, bin(a), bitShiftRight(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
```

結果:

```text
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

'offset' インデックスから始まる、'length' ビット長の部分文字列を返します。ビットのインデックスは 1 から始まります。

**構文**

```sql
bitSlice(s, offset[, length])
```

**引数**

- `s` — s は [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — ビットの開始インデックス。正の値は左のオフセットを示し、負の値は右のインデントを示します。ビットの番号は 1 から始まります。
- `length` — ビットを持つ部分文字列の長さ。負の値を指定すると、関数はオープン部分文字列 \[offset, array_length - length\] を返します。値を省略すると、関数は部分文字列 \[offset, the_end_string\] を返します。長さがsを超える場合、切り捨てられます。長さが8の倍数でない場合、右に0を埋めます。

**返される値**

- 部分文字列。[String](../data-types/string.md)。

**例**

クエリ:

```sql
select bin('Hello'), bin(bitSlice('Hello', 1, 8))
select bin('Hello'), bin(bitSlice('Hello', 1, 2))
select bin('Hello'), bin(bitSlice('Hello', 1, 9))
select bin('Hello'), bin(bitSlice('Hello', -4, 8))
```

結果:

```text
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

任意の整数を取りそれを [バイナリ形式](https://en.wikipedia.org/wiki/Binary_number) に変換し、指定された位置のビットの値を返します。カウントは右から左へ、0 から始まります。

**構文**

```sql
SELECT bitTest(number, index)
```

**引数**

- `number` – 整数値。
- `index` – ビットの位置。

**返される値**

- 指定された位置のビットの値。[UInt8](../data-types/int-uint.md)。

**例**

例えば、2進数（バイナリ）数値システムにおける数43は101011です。

クエリ:

```sql
SELECT bitTest(43, 1);
```

結果:

```text
┌─bitTest(43, 1)─┐
│              1 │
└────────────────┘
```

別の例:

クエリ:

```sql
SELECT bitTest(43, 2);
```

結果:

```text
┌─bitTest(43, 2)─┐
│              0 │
└────────────────┘
```

## bitTestAll {#bittestall}

指定された位置のすべてのビットの [論理積](https://en.wikipedia.org/wiki/Logical_conjunction)（AND演算子）の結果を返します。カウントは右から左へ、0 から始まります。

ビット単位の演算のための積:

0 AND 0 = 0

0 AND 1 = 0

1 AND 0 = 0

1 AND 1 = 1

**構文**

```sql
SELECT bitTestAll(number, index1, index2, index3, index4, ...)
```

**引数**

- `number` – 整数値。
- `index1`, `index2`, `index3`, `index4` – ビットの位置。例えば、位置のセット (`index1`, `index2`, `index3`, `index4`) がすべてtrueのときのみtrueです（`index1` ⋀ `index2`, ⋀ `index3` ⋀ `index4`）。

**返される値**

- 論理積の結果。[UInt8](../data-types/int-uint.md)。

**例**

例えば、2進数（バイナリ）数値システムにおける数43は101011です。

クエリ:

```sql
SELECT bitTestAll(43, 0, 1, 3, 5);
```

結果:

```text
┌─bitTestAll(43, 0, 1, 3, 5)─┐
│                          1 │
└────────────────────────────┘
```

別の例:

クエリ:

```sql
SELECT bitTestAll(43, 0, 1, 3, 5, 2);
```

結果:

```text
┌─bitTestAll(43, 0, 1, 3, 5, 2)─┐
│                             0 │
└───────────────────────────────┘
```

## bitTestAny {#bittestany}

指定された位置のすべてのビットの [論理和](https://en.wikipedia.org/wiki/Logical_disjunction)（OR演算子）の結果を返します。カウントは右から左へ、0 から始まります。

ビット単位の演算のための和:

0 OR 0 = 0

0 OR 1 = 1

1 OR 0 = 1

1 OR 1 = 1

**構文**

```sql
SELECT bitTestAny(number, index1, index2, index3, index4, ...)
```

**引数**

- `number` – 整数値。
- `index1`, `index2`, `index3`, `index4` – ビットの位置。

**返される値**

- 論理和の結果。[UInt8](../data-types/int-uint.md)。

**例**

例えば、2進数（バイナリ）数値システムにおける数43は101011です。

クエリ:

```sql
SELECT bitTestAny(43, 0, 2);
```

結果:

```text
┌─bitTestAny(43, 0, 2)─┐
│                    1 │
└──────────────────────┘
```

別の例:

クエリ:

```sql
SELECT bitTestAny(43, 4, 2);
```

結果:

```text
┌─bitTestAny(43, 4, 2)─┐
│                    0 │
└──────────────────────┘
```

## bitCount {#bitcount}

数値のバイナリ表現において1に設定されているビットの数を計算します。

**構文**

```sql
bitCount(x)
```

**引数**

- `x` — [整数](../data-types/int-uint.md) または [浮動小数点](../data-types/float.md) 数値。この関数はメモリ内の値表現を使用します。これにより浮動小数点数をサポートできます。

**返される値**

- 入力数値における1に設定されているビットの数。[UInt8](../data-types/int-uint.md)。

:::note
この関数は、入力値をより大きな型に変換しません（[符号拡張](https://en.wikipedia.org/wiki/Sign_extension)）。したがって、例えば `bitCount(toUInt8(-1)) = 8` となります。
:::

**例**

例えば、数333を考えます。そのバイナリ表現は: 0000000101001101。

クエリ:

```sql
SELECT bitCount(333);
```

結果:

```text
┌─bitCount(333)─┐
│             5 │
└───────────────┘
```

## bitHammingDistance {#bithammingdistance}

二つの整数値のビット表現間の [ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance) を返します。[SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) 関数と共に半重複文字列の検出に使用できます。距離が小さいほど、それらの文字列が同じである可能性が高くなります。

**構文**

```sql
bitHammingDistance(int1, int2)
```

**引数**

- `int1` — 第一整数値。[Int64](../data-types/int-uint.md)。
- `int2` — 第二整数値。[Int64](../data-types/int-uint.md)。

**返される値**

- ハミング距離。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT bitHammingDistance(111, 121);
```

結果:

```text
┌─bitHammingDistance(111, 121)─┐
│                            3 │
└──────────────────────────────┘
```

[SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) による例:

```sql
SELECT bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'));
```

結果:

```text
┌─bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'))─┐
│                                                                            5 │
└──────────────────────────────────────────────────────────────────────────────┘
```
