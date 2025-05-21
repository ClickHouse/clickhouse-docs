---
'description': '编码函数文档'
'sidebar_label': '编码'
'sidebar_position': 65
'slug': '/sql-reference/functions/encoding-functions'
'title': '编码函数'
---




# 编码函数

## char {#char}

返回具有指定参数数量长度的字符串，每个字节的值对应于相应的参数。接受多种数值类型的参数。如果参数的值超出 UInt8 数据类型的范围，则会转换为 UInt8，可能会发生四舍五入和溢出。

**语法**

```sql
char(number_1, [number_2, ..., number_n]);
```

**参数**

- `number_1, number_2, ..., number_n` — 被解释为整数的数值参数。类型：[Int](../data-types/int-uint.md)、[Float](../data-types/float.md)。

**返回值**

- 由指定字节组成的字符串。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT char(104.1, 101, 108.9, 108.9, 111) AS hello;
```

结果：

```text
┌─hello─┐
│ hello │
└───────┘
```

通过传递相应的字节，您可以构建任意编码的字符串。以下是 UTF-8 的示例：

查询：

```sql
SELECT char(0xD0, 0xBF, 0xD1, 0x80, 0xD0, 0xB8, 0xD0, 0xB2, 0xD0, 0xB5, 0xD1, 0x82) AS hello;
```

结果：

```text
┌─hello──┐
│ привет │
└────────┘
```

查询：

```sql
SELECT char(0xE4, 0xBD, 0xA0, 0xE5, 0xA5, 0xBD) AS hello;
```

结果：

```text
┌─hello─┐
│ 你好  │
└───────┘
```

## hex {#hex}

返回包含参数的十六进制表示的字符串。

别名：`HEX`。

**语法**

```sql
hex(arg)
```

该函数使用大写字母 `A-F`，并且不使用任何前缀（如 `0x`）或后缀（如 `h`）。

对于整数参数，它按从最重要到最不重要的顺序（大端顺序或“人类可读”顺序）打印十六进制数字（“半字节”）。它从最重要的非零字节开始（省略前导零字节），但始终打印每个字节的两个数字，即使前导数字是零。

类型为 [Date](../data-types/date.md) 和 [DateTime](../data-types/datetime.md) 的值格式化为相应的整数（自纪元以来的天数对于 Date 和 Unix 时间戳的值对于 DateTime）。

对于 [String](../data-types/string.md) 和 [FixedString](../data-types/fixedstring.md)，所有字节简单地编码为两个十六进制数字。零字节不被省略。

类型为 [Float](../data-types/float.md) 和 [Decimal](../data-types/decimal.md) 的值根据其在内存中的表示进行编码。由于我们支持小端架构，因此它们以小端方式编码。前导/尾随零字节不被省略。

类型为 [UUID](../data-types/uuid.md) 的值以大端顺序字符串编码。

**参数**

- `arg` — 要转换为十六进制的值。类型：[String](../data-types/string.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)、[Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。

**返回值**

- 包含参数的十六进制表示的字符串。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT hex(1);
```

结果：

```text
01
```

查询：

```sql
SELECT hex(toFloat32(number)) AS hex_presentation FROM numbers(15, 2);
```

结果：

```text
┌─hex_presentation─┐
│ 00007041         │
│ 00008041         │
└──────────────────┘
```

查询：

```sql
SELECT hex(toFloat64(number)) AS hex_presentation FROM numbers(15, 2);
```

结果：

```text
┌─hex_presentation─┐
│ 0000000000002E40 │
│ 0000000000003040 │
└──────────────────┘
```

查询：

```sql
SELECT lower(hex(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0'))) as uuid_hex
```

结果：

```text
┌─uuid_hex─────────────────────────┐
│ 61f0c4045cb311e7907ba6006ad3dba0 │
└──────────────────────────────────┘
```

## unhex {#unhex}

执行 [hex](#hex) 的相反操作。它将参数中的每对十六进制数字解读为一个数字，并将其转换为由该数字表示的字节。返回值为二进制字符串（BLOB）。

如果您要将结果转换为数字，可以使用 [reverse](../../sql-reference/functions/string-functions.md#reverse) 和 [reinterpretAs&lt;Type&gt;](/sql-reference/functions/type-conversion-functions) 函数。

:::note
如果在 `clickhouse-client` 中调用 `unhex`，则以 UTF-8 显示二进制字符串。
:::

别名：`UNHEX`。

**语法**

```sql
unhex(arg)
```

**参数**

- `arg` — 包含任意数量十六进制数字的字符串。[String](../data-types/string.md)、[FixedString](../data-types/fixedstring.md)。

支持大写和小写字母 `A-F`。十六进制数字的数量不必是偶数。如果为奇数，则最后一位被解释为 `00-0F` 字节的最低有效位。如果参数字符串包含其他非十六进制数字，则返回一些实现定义的结果（不会抛出异常）。对于数值参数，unhex() 不执行 hex(N) 的逆操作。

**返回值**

- 二进制字符串（BLOB）。[String](../data-types/string.md)。

**示例**

查询：
```sql
SELECT unhex('303132'), UNHEX('4D7953514C');
```

结果：
```text
┌─unhex('303132')─┬─unhex('4D7953514C')─┐
│ 012             │ MySQL               │
└─────────────────┴─────────────────────┘
```

查询：

```sql
SELECT reinterpretAsUInt64(reverse(unhex('FFF'))) AS num;
```

结果：

```text
┌──num─┐
│ 4095 │
└──────┘
```

## bin {#bin}

返回包含参数的二进制表示的字符串。

**语法**

```sql
bin(arg)
```

别名：`BIN`。

对于整数参数，它按从最重要到最不重要的顺序（大端顺序或“人类可读”顺序）打印二进制数字。它从最重要的非零字节开始（省略前导零字节），但如果前导数字是零，始终打印每个字节的八个数字。

类型为 [Date](../data-types/date.md) 和 [DateTime](../data-types/datetime.md) 的值格式化为相应的整数（自纪元以来的天数对于 `Date` 和 Unix 时间戳的值对于 `DateTime`）。

对于 [String](../data-types/string.md) 和 [FixedString](../data-types/fixedstring.md)，所有字节简单地编码为八个二进制数字。零字节不被省略。

类型为 [Float](../data-types/float.md) 和 [Decimal](../data-types/decimal.md) 的值根据其在内存中的表示进行编码。由于我们支持小端架构，因此它们以小端方式编码。前导/尾随零字节不被省略。

类型为 [UUID](../data-types/uuid.md) 的值以大端顺序字符串编码。

**参数**

- `arg` — 要转换为二进制的值。[String](../data-types/string.md)、[FixedString](../data-types/fixedstring.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)、[Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。

**返回值**

- 包含参数的二进制表示的字符串。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT bin(14);
```

结果：

```text
┌─bin(14)──┐
│ 00001110 │
└──────────┘
```

查询：

```sql
SELECT bin(toFloat32(number)) AS bin_presentation FROM numbers(15, 2);
```

结果：

```text
┌─bin_presentation─────────────────┐
│ 00000000000000000111000001000001 │
│ 00000000000000001000000001000001 │
└──────────────────────────────────┘
```

查询：

```sql
SELECT bin(toFloat64(number)) AS bin_presentation FROM numbers(15, 2);
```

结果：

```text
┌─bin_presentation─────────────────────────────────────────────────┐
│ 0000000000000000000000000000000000000000000000000010111001000000 │
│ 0000000000000000000000000000000000000000000000000011000001000000 │
└──────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT bin(toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0')) as bin_uuid
```

结果：

```text
┌─bin_uuid─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 01100001111100001100010000000100010111001011001100010001111001111001000001111011101001100000000001101010110100111101101110100000 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## unbin {#unbin}

将参数中的每对二进制数字解读为一个数字，并将其转换为由该数字表示的字节。该函数执行 [bin](#bin) 的相反操作。

**语法**

```sql
unbin(arg)
```

别名：`UNBIN`。

对于数值参数，`unbin()` 不返回 `bin()` 的反向。如果您想将结果转换为数字，可以使用 [reverse](../../sql-reference/functions/string-functions.md#reverse) 和 [reinterpretAs&lt;Type&gt;](/sql-reference/functions/type-conversion-functions#reinterpret) 函数。

:::note
如果在 `clickhouse-client` 中调用 `unbin`，则以 UTF-8 显示二进制字符串。
:::

支持二进制数字 `0` 和 `1`。二进制数字的数量不必为八的倍数。如果参数字符串包含其他数字，则返回一些实现定义的结果（不会抛出异常）。

**参数**

- `arg` — 包含任意数量二进制数字的字符串。[String](../data-types/string.md)。

**返回值**

- 二进制字符串（BLOB）。[String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT UNBIN('001100000011000100110010'), UNBIN('0100110101111001010100110101000101001100');
```

结果：

```text
┌─unbin('001100000011000100110010')─┬─unbin('0100110101111001010100110101000101001100')─┐
│ 012                               │ MySQL                                             │
└───────────────────────────────────┴───────────────────────────────────────────────────┘
```

查询：

```sql
SELECT reinterpretAsUInt64(reverse(unbin('1110'))) AS num;
```

结果：

```text
┌─num─┐
│  14 │
└─────┘
```

## bitmaskToList(num) {#bitmasktolistnum}

接受一个整数。返回一个字符串，包含幂为 2 的列表，当累加时总和为源数字。它们以逗号分隔，且无空格，以文本格式呈现，按升序排列。

## bitmaskToArray(num) {#bitmasktoarraynum}

接受一个整数。返回一个包含 UInt64 数字的数组，包含幂为 2 的列表，当累加时总和为源数字。数组中的数字按升序排列。

## bitPositionsToArray(num) {#bitpositionstoarraynum}

接受一个整数并将其转换为无符号整数。返回一个 `UInt64` 数字的数组，包含 `arg` 中等于 `1` 的位的位置列表，按升序排列。

**语法**

```sql
bitPositionsToArray(arg)
```

**参数**

- `arg` — 整数值。[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 包含位位置列表的数组，这些位等于 `1`，按升序排列。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

查询：

```sql
SELECT bitPositionsToArray(toInt8(1)) AS bit_positions;
```

结果：

```text
┌─bit_positions─┐
│ [0]           │
└───────────────┘
```

查询：

```sql
SELECT bitPositionsToArray(toInt8(-1)) AS bit_positions;
```

结果：

```text
┌─bit_positions─────┐
│ [0,1,2,3,4,5,6,7] │
└───────────────────┘
```

## mortonEncode {#mortonencode}

计算一组无符号整数的 Morton 编码（ZCurve）。

该函数有两种操作模式：
- 简单
- 扩展

### 简单模式 {#simple-mode}

接受最多 8 个无符号整数作为参数，产生一个 UInt64 代码。

**语法**

```sql
mortonEncode(args)
```

**参数**

- `args`: 最多 8 个 [无符号整数](../data-types/int-uint.md) 或上述类型的列。

**返回值**

- 一个 UInt64 代码。[UInt64](../data-types/int-uint.md)

**示例**

查询：

```sql
SELECT mortonEncode(1, 2, 3);
```
结果：

```response
53
```

### 扩展模式 {#expanded-mode}

接受一个范围掩码（[tuple](../data-types/tuple.md)）作为第一个参数，并接受最多 8 个 [无符号整数](../data-types/int-uint.md) 作为其他参数。

掩码中的每个数字配置范围扩展的数量：<br/>
1 - 无扩展<br/>
2 - 2 倍扩展<br/>
3 - 3 倍扩展<br/>
...<br/>
最多 8 倍扩展。<br/>

**语法**

```sql
mortonEncode(range_mask, args)
```

**参数**
- `range_mask`: 1-8。
- `args`: 最多 8 个 [无符号整数](../data-types/int-uint.md) 或上述类型的列。

注意：使用列作为 `args` 时，提供的 `range_mask` 元组应仍为常量。

**返回值**

- 一个 UInt64 代码。[UInt64](../data-types/int-uint.md)


**示例**

范围扩展对于需要具有不同范围（或基数）参数的类似分布时是有利的。
例如：“IP 地址”（0...FFFFFFFF）和“国家代码”（0...FF）。

查询：

```sql
SELECT mortonEncode((1,2), 1024, 16);
```

结果：

```response
1572864
```

注意：元组大小必须等于其他参数的数量。

**示例**

一个参数的 Morton 编码始终为参数本身：

查询：

```sql
SELECT mortonEncode(1);
```

结果：

```response
1
```

**示例**

扩展一个参数也是可能的：

查询：

```sql
SELECT mortonEncode(tuple(2), 128);
```

结果：

```response
32768
```

**示例**

您还可以在函数中使用列名。

查询：

首先创建表并插入一些数据。

```sql
create table morton_numbers(
    n1 UInt32,
    n2 UInt32,
    n3 UInt16,
    n4 UInt16,
    n5 UInt8,
    n6 UInt8,
    n7 UInt8,
    n8 UInt8
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into morton_numbers (*) values(1,2,3,4,5,6,7,8);
```
使用列名代替常量作为 `mortonEncode` 的函数参数。

查询：

```sql
SELECT mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8) FROM morton_numbers;
```

结果：

```response
2155374165
```

**实现细节**

请注意，您最多只能将如此多的信息位嵌入 Morton 代码中，因为 [UInt64](../data-types/int-uint.md) 的位数有限。两个参数的最大范围为 2^32（64/2），三个参数的最大范围为 2^21（64/3），依此类推。所有溢出将被限制为零。

## mortonDecode {#mortondecode}

将 Morton 编码（ZCurve）解码为相应的无符号整数元组。

与 `mortonEncode` 函数一样，该函数也有两种操作模式：
- 简单
- 扩展

### 简单模式 {#simple-mode-1}

接受作为第一个参数的结果元组大小和作为第二个参数的代码。

**语法**

```sql
mortonDecode(tuple_size, code)
```

**参数**
- `tuple_size`: 整数值，不超过 8。
- `code`: [UInt64](../data-types/int-uint.md) 代码。

**返回值**

- 指定大小的 [tuple](../data-types/tuple.md)。 [UInt64](../data-types/int-uint.md)

**示例**

查询：

```sql
SELECT mortonDecode(3, 53);
```

结果：

```response
["1","2","3"]
```

### 扩展模式 {#expanded-mode-1}

接受范围掩码（元组）作为第一个参数，代码作为第二个参数。
掩码中的每个数字配置范围缩小的数量：<br/>
1 - 不缩小<br/>
2 - 2 倍缩小<br/>
3 - 3 倍缩小<br/>
...<br/>
最多 8 倍缩小。<br/>

范围扩展对于需要对具有不同范围（或基数）参数进行类似分布时非常有利。
例如：“IP 地址”（0...FFFFFFFF）和“国家代码”（0...FF）。
与编码函数一样，它最多限制为 8 个数字。

**示例**

查询：

```sql
SELECT mortonDecode(1, 1);
```

结果：

```response
["1"]
```

**示例**

也可以缩小一个参数：

查询：

```sql
SELECT mortonDecode(tuple(2), 32768);
```

结果：

```response
["128"]
```

**示例**

您还可以在函数中使用列名。

首先创建表并插入一些数据。

查询：
```sql
create table morton_numbers(
    n1 UInt32,
    n2 UInt32,
    n3 UInt16,
    n4 UInt16,
    n5 UInt8,
    n6 UInt8,
    n7 UInt8,
    n8 UInt8
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into morton_numbers (*) values(1,2,3,4,5,6,7,8);
```
使用列名代替常量作为 `mortonDecode` 的函数参数。

查询：

```sql
select untuple(mortonDecode(8, mortonEncode(n1, n2, n3, n4, n5, n6, n7, n8))) from morton_numbers;
```

结果：

```response
1    2    3    4    5    6    7    8
```

## hilbertEncode {#hilbertencode}

计算一组无符号整数的 Hilbert 曲线代码。

该函数有两种操作模式：
- 简单
- 扩展

### 简单模式 {#simple-mode-2}

简单：接受最多 2 个无符号整数作为参数，并生成一个 UInt64 代码。

**语法**

```sql
hilbertEncode(args)
```

**参数**

- `args`: 最多 2 个 [无符号整数](../../sql-reference/data-types/int-uint.md) 或上述类型的列。

**返回值**

- 一个 UInt64 代码

类型：[UInt64](../../sql-reference/data-types/int-uint.md)

**示例**

查询：

```sql
SELECT hilbertEncode(3, 4);
```
结果：

```response
31
```

### 扩展模式 {#expanded-mode-2}

接受范围掩码（[tuple](../../sql-reference/data-types/tuple.md)）作为第一个参数，最多接受 2 个 [无符号整数](../../sql-reference/data-types/int-uint.md) 作为其他参数。

掩码中的每个数字配置相应参数将向左移动的位数，从而有效地缩放参数在其范围内。

**语法**

```sql
hilbertEncode(range_mask, args)
```

**参数**
- `range_mask`: ([tuple](../../sql-reference/data-types/tuple.md))
- `args`: 最多 2 个 [无符号整数](../../sql-reference/data-types/int-uint.md) 或上述类型的列。

注意：当使用列作为 `args` 时，提供的 `range_mask` 元组仍应为常量。

**返回值**

- 一个 UInt64 代码

类型：[UInt64](../../sql-reference/data-types/int-uint.md)


**示例**

范围扩展对于需要对具有不同范围（或基数）参数进行类似分布时非常有利。
例如：“IP 地址”（0...FFFFFFFF）和“国家代码”（0...FF）。

查询：

```sql
SELECT hilbertEncode((10,6), 1024, 16);
```

结果：

```response
4031541586602
```

注意：元组大小必须等于其他参数的数量。

**示例**

对于没有元组的单个参数，该函数返回参数本身作为 Hilbert 索引，因为不需要维度映射。

查询：

```sql
SELECT hilbertEncode(1);
```

结果：

```response
1
```

**示例**

如果提供一个参数，且一个元组指定位移，则该函数将相应地将参数向左移动。

查询：

```sql
SELECT hilbertEncode(tuple(2), 128);
```

结果：

```response
512
```

**示例**

该函数还接受作为参数的列：

查询：

首先创建表并插入一些数据。

```sql
create table hilbert_numbers(
    n1 UInt32,
    n2 UInt32
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into hilbert_numbers (*) values(1,2);
```
使用列名代替常量作为 `hilbertEncode` 的函数参数。

查询：

```sql
SELECT hilbertEncode(n1, n2) FROM hilbert_numbers;
```

结果：

```response
13
```

**实现细节**

请注意，您最多只能将如此多的信息位嵌入 Hilbert 代码，由于 [UInt64](../../sql-reference/data-types/int-uint.md) 的位数有限。两个参数的最大范围为 2^32（64/2）。所有溢出将被限制为零。

## hilbertDecode {#hilbertdecode}

将 Hilbert 曲线索引解码回无符号整数元组，表示多维空间中的坐标。

与 `hilbertEncode` 函数一样，该函数有两种操作模式：
- 简单
- 扩展

### 简单模式 {#simple-mode-3}

接受最多 2 个无符号整数作为参数，并生成一个 UInt64 代码。

**语法**

```sql
hilbertDecode(tuple_size, code)
```

**参数**
- `tuple_size`: 整数值，不超过 2。
- `code`: [UInt64](../../sql-reference/data-types/int-uint.md) 代码。

**返回值**

- 指定大小的 [tuple](../../sql-reference/data-types/tuple.md)。

类型：[UInt64](../../sql-reference/data-types/int-uint.md)

**示例**

查询：

```sql
SELECT hilbertDecode(2, 31);
```

结果：

```response
["3", "4"]
```

### 扩展模式 {#expanded-mode-3}

作为第一个参数接受范围掩码（元组），并接受最多 2 个无符号整数作为其他参数。
掩码中的每个数字配置相应参数将向左移动的位数，从而有效地缩放参数在其范围内。

范围扩展对于需要对具有不同范围（或基数）参数进行类似分布时非常有利。
例如：“IP 地址”（0...FFFFFFFF）和“国家代码”（0...FF）。
与编码函数一样，它最多限制为 8 个数字。

**示例**

对于一个参数，Hilbert 代码始终为参数本身（作为元组）。

查询：

```sql
SELECT hilbertDecode(1, 1);
```

结果：

```response
["1"]
```

**示例**

单个参数的元组指定位移时，将会进行相应的右移。

查询：

```sql
SELECT hilbertDecode(tuple(2), 32768);
```

结果：

```response
["128"]
```

**示例**

该函数接受作为第二个参数的代码列：

首先创建表并插入一些数据。

查询：
```sql
create table hilbert_numbers(
    n1 UInt32,
    n2 UInt32
)
Engine=MergeTree()
ORDER BY n1 SETTINGS index_granularity = 8192, index_granularity_bytes = '10Mi';
insert into hilbert_numbers (*) values(1,2);
```
使用列名代替常量作为 `hilbertDecode` 的函数参数。

查询：

```sql
select untuple(hilbertDecode(2, hilbertEncode(n1, n2))) from hilbert_numbers;
```

结果：

```response
1    2
```
