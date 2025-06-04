---
'description': 'Documentation for Bit Functions'
'sidebar_label': 'Bit'
'sidebar_position': 20
'slug': '/sql-reference/functions/bit-functions'
'title': '位函数'
---


# 位函数

位函数适用于 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32` 或 `Float64` 中的任何一对类型。某些函数支持 `String` 和 `FixedString` 类型。

结果类型是一个整数，其位等于参数的最大位数。如果至少有一个参数是有符号的，则结果为有符号数。如果参数是浮点数，则会转换为 Int64。

## bitAnd(a, b) {#bitanda-b}

## bitOr(a, b) {#bitora-b}

## bitXor(a, b) {#bitxora-b}

## bitNot(a) {#bitnota}

## bitShiftLeft(a, b) {#bitshiftlefta-b}

将一个值的二进制表示向左移动指定的位数。

`FixedString` 或 `String` 被视为单个多字节值。

`FixedString` 值的位在向外移动时会丢失。相反，`String` 值会用额外的字节扩展，因此不会丢失位。

**语法**

```sql
bitShiftLeft(a, b)
```

**参数**

- `a` — 要移动的值。[整数类型](../data-types/int-uint.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `b` — 移动的位数。[无符号整数类型](../data-types/int-uint.md)、64 位类型或更小的类型是允许的。

**返回值**

- 移动后的值。

返回值的类型与输入值的类型相同。

**示例**

在以下查询中，使用了 [bin](encoding-functions.md#bin) 和 [hex](encoding-functions.md#hex) 函数来显示移动后的值的位。

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

将一个值的二进制表示向右移动指定的位数。

`FixedString` 或 `String` 被视为单个多字节值。请注意，`String` 值的长度在位被移出时会减少。

**语法**

```sql
bitShiftRight(a, b)
```

**参数**

- `a` — 要移动的值。[整数类型](../data-types/int-uint.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `b` — 移动的位数。[无符号整数类型](../data-types/int-uint.md)、64 位类型或更小的类型是允许的。

**返回值**

- 移动后的值。

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

返回从 'offset' 索引开始的子字符串，长度为 'length' 位。位的索引从 1 开始。

**语法**

```sql
bitSlice(s, offset[, length])
```

**参数**

- `s` — s 是 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `offset` — 起始位的索引，正值表示在左侧的偏移，负值表示在右侧的缩进。位的编号从 1 开始。
- `length` — 子字符串的位长。如果指定了负值，函数将返回一个开放子字符串 \[offset, array_length - length\]。如果省略该值，函数将返回子字符串 \[offset, the_end_string\]。如果 length 超过 s，将被截断。如果 length 不是 8 的倍数，则在右侧填充 0。

**返回值**

- 子字符串。[String](../data-types/string.md)

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

参见函数 [substring](string-functions.md#substring)。

## bitTest {#bittest}

接受任何整数并将其转换为 [二进制形式](https://en.wikipedia.org/wiki/Binary_number)，返回指定位置的位的值。计数是从右到左，从 0 开始。

**语法**

```sql
SELECT bitTest(number, index)
```

**参数**

- `number` – 整数。
- `index` – 位的位置。

**返回值**

- 指定位置的位的值。[UInt8](../data-types/int-uint.md)。

**示例**

例如，数字 43 在二进制（基数 2）系统中是 101011。

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

返回给定位置所有位的 [逻辑合取](https://en.wikipedia.org/wiki/Logical_conjunction)（AND 操作符）的结果。计数是从右到左，从 0 开始。

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
- `index1`、`index2`、`index3`、`index4` – 位的位置。例如，对于位置集（`index1`、`index2`、`index3`、`index4`），当且仅当所有位置都为真时，该条件为真（`index1` ⋀ `index2` ⋀ `index3` ⋀ `index4`）。

**返回值**

- 逻辑合取的结果。[UInt8](../data-types/int-uint.md)。

**示例**

例如，数字 43 在二进制（基数 2）系统中是 101011。

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

返回给定位置所有位的 [逻辑析取](https://en.wikipedia.org/wiki/Logical_disjunction)（OR 操作符）的结果。计数是从右到左，从 0 开始。

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

- 逻辑析取的结果。[UInt8](../data-types/int-uint.md)。

**示例**

例如，数字 43 在二进制（基数 2）系统中是 101011。

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

计算数字的二进制表示中设置为 1 的位的数量。

**语法**

```sql
bitCount(x)
```

**参数**

- `x` — [整数](../data-types/int-uint.md) 或 [浮点](../data-types/float.md) 数字。该函数使用内存中的值表示。它允许支持浮点数。

**返回值**

- 输入数字中设置为 1 的位的数量。[UInt8](../data-types/int-uint.md)。

:::note
该函数不会将输入值转换为更大的类型（[符号扩展](https://en.wikipedia.org/wiki/Sign_extension)）。例如，`bitCount(toUInt8(-1)) = 8`。
:::

**示例**

例如，数字 333。它的二进制表示：0000000101001101。

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

返回两个整数值的位表示之间的 [汉明距离](https://en.wikipedia.org/wiki/Hamming_distance)。可以与 [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) 函数一起使用，以检测半重复的字符串。距离越小，说明这些字符串越可能相同。

**语法**

```sql
bitHammingDistance(int1, int2)
```

**参数**

- `int1` — 第一个整数值。[Int64](../data-types/int-uint.md)。
- `int2` — 第二个整数值。[Int64](../data-types/int-uint.md)。

**返回值**

- 汉明距离。[UInt8](../data-types/int-uint.md)。

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

与 [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) 一起使用：

```sql
SELECT bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'));
```

结果：

```text
┌─bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'))─┐
│                                                                            5 │
└──────────────────────────────────────────────────────────────────────────────┘
```

<!-- 
在文档框架构建时，下面标签的内部内容会替换为
从 system.functions 生成的文档。请不要修改或删除这些标签。
参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
