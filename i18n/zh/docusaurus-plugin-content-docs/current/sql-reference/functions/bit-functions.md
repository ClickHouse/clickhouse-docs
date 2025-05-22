
# 位函数

位函数适用于 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32` 或 `Float64` 的任何类型对。一些函数支持 `String` 和 `FixedString` 类型。

结果类型是一个整数，其位数等于参数的最大位数。如果至少有一个参数是有符号的，则结果是一个有符号数。如果一个参数是浮点数，则会转换为 Int64。

## bitAnd(a, b) {#bitanda-b}

## bitOr(a, b) {#bitora-b}

## bitXor(a, b) {#bitxora-b}

## bitNot(a) {#bitnota}

## bitShiftLeft(a, b) {#bitshiftlefta-b}

将值的二进制表示向左移动指定的位数。

`FixedString` 或 `String` 被视为单个多字节值。

`FixedString` 值的位在移出时会丢失。相反，`String` 值将通过额外的字节进行扩展，因此不会丢失任何位。

**语法**

```sql
bitShiftLeft(a, b)
```

**参数**

- `a` — 要移位的值。 [整数类型](../data-types/int-uint.md)、 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `b` — 移位的位置数。允许[无符号整数类型](../data-types/int-uint.md)、 64 位类型或更小。

**返回值**

- 移位后的值。

返回值的类型与输入值的类型相同。

**示例**

在以下查询中，使用了 [bin](encoding-functions.md#bin) 和 [hex](encoding-functions.md#hex) 函数来显示移位值的位。

```sql
SELECT 99 AS a, bin(a), bitShiftLeft(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
```

结果：

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

将值的二进制表示向右移动指定的位数。

`FixedString` 或 `String` 被视为单个多字节值。请注意，随着位的移出，`String` 值的长度会减小。

**语法**

```sql
bitShiftRight(a, b)
```

**参数**

- `a` — 要移位的值。 [整数类型](../data-types/int-uint.md)、 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `b` — 移位的位置数。允许[无符号整数类型](../data-types/int-uint.md)、 64 位类型或更小。

**返回值**

- 移位后的值。

返回值的类型与输入值的类型相同。

**示例**

查询：

```sql
SELECT 101 AS a, bin(a), bitShiftRight(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
```

结果：

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

返回以偏移索引的位开始的子字符串，长度为 'length' 位。位索引从 1 开始。

**语法**

```sql
bitSlice(s, offset[, length])
```

**参数**

- `s` — s 是 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `offset` — 偏移位的起始索引，正值表示向左偏移，负值表示向右偏移。位的编号从 1 开始。
- `length` — 子字符串的位长度。如果指定负值，则函数返回开放子字符串 \[offset, array_length - length\]。如果省略值，函数返回子字符串 \[offset, the_end_string\]。如果长度超过 s，则会截断。如果长度不是 8 的倍数，则在右侧填充 0。

**返回值**

- 子字符串。 [String](../data-types/string.md)

**示例**

查询：

```sql
select bin('Hello'), bin(bitSlice('Hello', 1, 8))
select bin('Hello'), bin(bitSlice('Hello', 1, 2))
select bin('Hello'), bin(bitSlice('Hello', 1, 9))
select bin('Hello'), bin(bitSlice('Hello', -4, 8))
```

结果：

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

请参见函数 [substring](string-functions.md#substring)。

## bitTest {#bittest}

接受任何整数并将其转换为 [二进制形式](https://en.wikipedia.org/wiki/Binary_number)，返回指定位置的位的值。计数从右到左，从 0 开始。

**语法**

```sql
SELECT bitTest(number, index)
```

**参数**

- `number` – 整数。
- `index` – 位的位置。

**返回值**

- 指定位置的位的值。 [UInt8](../data-types/int-uint.md)。

**示例**

例如，数字 43 在二进制数系统中的值是 101011。

查询：

```sql
SELECT bitTest(43, 1);
```

结果：

```text
┌─bitTest(43, 1)─┐
│              1 │
└────────────────┘
```

另一个示例：

查询：

```sql
SELECT bitTest(43, 2);
```

结果：

```text
┌─bitTest(43, 2)─┐
│              0 │
└────────────────┘
```

## bitTestAll {#bittestall}

返回给定位置所有位的 [逻辑合取](https://en.wikipedia.org/wiki/Logical_conjunction)（AND 运算符）的结果。计数从右到左，从 0 开始。

位运算的合取：

0 AND 0 = 0

0 AND 1 = 0

1 AND 0 = 0

1 AND 1 = 1

**语法**

```sql
SELECT bitTestAll(number, index1, index2, index3, index4, ...)
```

**参数**

- `number` – 整数。
- `index1`、`index2`、`index3`、`index4` – 位的位置。例如，只有当所有位置都为真时，位置集 (`index1`、`index2`、`index3`、`index4`) 才为真（`index1` ⋀ `index2` ⋀ `index3` ⋀ `index4`）。

**返回值**

- 逻辑合取的结果。 [UInt8](../data-types/int-uint.md)。

**示例**

例如，数字 43 在二进制数系统中的值是 101011。

查询：

```sql
SELECT bitTestAll(43, 0, 1, 3, 5);
```

结果：

```text
┌─bitTestAll(43, 0, 1, 3, 5)─┐
│                          1 │
└────────────────────────────┘
```

另一个示例：

查询：

```sql
SELECT bitTestAll(43, 0, 1, 3, 5, 2);
```

结果：

```text
┌─bitTestAll(43, 0, 1, 3, 5, 2)─┐
│                             0 │
└───────────────────────────────┘
```

## bitTestAny {#bittestany}

返回给定位置所有位的 [逻辑析取](https://en.wikipedia.org/wiki/Logical_disjunction)（OR 运算符）的结果。计数从右到左，从 0 开始。

位运算的析取：

0 OR 0 = 0

0 OR 1 = 1

1 OR 0 = 1

1 OR 1 = 1

**语法**

```sql
SELECT bitTestAny(number, index1, index2, index3, index4, ...)
```

**参数**

- `number` – 整数。
- `index1`、`index2`、`index3`、`index4` – 位的位置。

**返回值**

- 逻辑析取的结果。 [UInt8](../data-types/int-uint.md)。

**示例**

例如，数字 43 在二进制数系统中的值是 101011。

查询：

```sql
SELECT bitTestAny(43, 0, 2);
```

结果：

```text
┌─bitTestAny(43, 0, 2)─┐
│                    1 │
└──────────────────────┘
```

另一个示例：

查询：

```sql
SELECT bitTestAny(43, 4, 2);
```

结果：

```text
┌─bitTestAny(43, 4, 2)─┐
│                    0 │
└──────────────────────┘
```

## bitCount {#bitcount}

计算一个数字的二进制表示中设置为 1 的位数。

**语法**

```sql
bitCount(x)
```

**参数**

- `x` — [整数](../data-types/int-uint.md) 或 [浮点数](../data-types/float.md)。该函数使用内存中的值表示。它允许支持浮点数。

**返回值**

- 输入数字中设置为 1 的位数。 [UInt8](../data-types/int-uint.md)。

:::note
该函数不会将输入值转换为更大的类型（[符号扩展](https://en.wikipedia.org/wiki/Sign_extension)）。例如，`bitCount(toUInt8(-1)) = 8`。
:::

**示例**

以数字 333 为例。其二进制表示为：0000000101001101。

查询：

```sql
SELECT bitCount(333);
```

结果：

```text
┌─bitCount(333)─┐
│             5 │
└───────────────┘
```

## bitHammingDistance {#bithammingdistance}

返回两个整数值的位表示之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance)。可以与 [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) 函数一起使用以检测半重复字符串。距离越小，这些字符串相同的可能性就越大。

**语法**

```sql
bitHammingDistance(int1, int2)
```

**参数**

- `int1` — 第一个整数值。 [Int64](../data-types/int-uint.md)。
- `int2` — 第二个整数值。 [Int64](../data-types/int-uint.md)。

**返回值**

- 汉明距离。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT bitHammingDistance(111, 121);
```

结果：

```text
┌─bitHammingDistance(111, 121)─┐
│                            3 │
└──────────────────────────────┘
```

与 [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) 结合使用：

```sql
SELECT bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'));
```

结果：

```text
┌─bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'))─┐
│                                                                            5 │
└──────────────────────────────────────────────────────────────────────────────┘
```
