---
alias: []
description: 'RowBinary 格式文档'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 描述 \{#description\}

`RowBinary` 格式按行以二进制形式解析数据。
行和数值按顺序连续列出，没有分隔符。
由于数据以二进制形式表示，`FORMAT RowBinary` 之后的分隔符必须严格按如下方式指定：

* 任意数量的空白字符：
  * `' '` (空格 - 代码 `0x20`) 
  * `'\t'` (制表符 - 代码 `0x09`) 
  * `'\f'` (换页符 - 代码 `0x0C`) 
* 后面紧跟且只能跟一个换行序列：
  * Windows 风格 `"\r\n"`
  * 或 Unix 风格 `'\n'`
* 紧接着就是二进制数据。

:::note
由于是按行存储，该格式比 [Native](../Native.md) 格式效率更低。
:::

## 数据类型的线路格式 \{#data-types-wire-format\}

:::tip
示例中提供的大多数查询都可以使用 curl 执行，并将结果输出到文件。

```bash
curl -XPOST "http://localhost:8123?default_format=RowBinary" \
  --data-binary "SELECT 42 :: UInt32"  > out.bin
```

:::

然后，可以使用十六进制编辑器查看数据。


### 无符号 LEB128 (小端 Base 128)  \{#unsigned-leb128\}

一种**无符号小端序**的可变宽度整数编码，用于编码 `String`、`Array` 和 `Map` 等可变大小数据类型的长度。示例实现可参见 [LEB128 维基页面](https://en.wikipedia.org/wiki/LEB128#Decode_unsigned_integer)。

### (U)Int8, (U)Int16, (U)Int32, (U)Int64, (U)Int128, (U)Int256 \{#integer-types\}

所有整数类型都按 **小端序** 字节序、使用相应数量的字节进行编码。有符号类型 (`Int8` 到 `Int256`) 采用 **two's complement** 表示。大多数语言都支持借助内置工具或常用库，从字节数组中提取这类整数。对于 `Int128`/`Int256` 和 `UInt128`/`UInt256`，由于它们超出了大多数语言的原生整数范围，可能需要进行自定义反序列化。

### Bool \{#bool\}

布尔值编码为单个字节，并且可以像 `UInt8` 一样进行反序列化。

* `0` 表示 `false`
* `1` 表示 `true`

### Float32, Float64 \{#float32-float64\}

**小端序**浮点数，其中 `Float32` 编码为 4 字节，`Float64` 编码为 8 字节。与整数类似，大多数编程语言都提供了合适的工具来反序列化这些值。

### BFloat16 \{#bfloat16\}

[BFloat16](https://clickhouse.com/docs/sql-reference/data-types/float#bfloat16) (Brain Floating Point) 是一种 16 位浮点格式，具有 Float32 的取值范围但精度较低，因此适用于机器学习工作负载。其在线路格式中本质上就是 Float32 值的高 16 位。如果您的编程语言不原生支持它，最简单的处理方式是按 UInt16 读取和写入，再与 Float32 相互转换：

将 BFloat16 转换为 Float32 (伪代码) ：

```text
// Read 2 bytes as little-endian UInt16
// Left-shift by 16 bits to get Float32 bits
bfloat16Bits = readUInt16()
float32Bits = bfloat16Bits << 16
floatValue = reinterpretAsFloat32(float32Bits)
```

将 Float32 转换为 BFloat16 (伪代码) ：

```text
// Right-shift Float32 bits by 16 to truncate to BFloat16
float32Bits = reinterpretAsUInt32(floatValue)
bfloat16Bits = float32Bits >> 16
writeUInt16(bfloat16Bits)
```

`BFloat16` 的底层表示示例：

```sql
SELECT CAST(1.25, 'BFloat16')
```

```text
0xA0, 0x3F, // 1.25 as BFloat16
```


### Decimal32, Decimal64, Decimal128, Decimal256 \{#decimal\}

Decimal 类型使用相应位宽的**小端序**整数表示。

* `Decimal32` - 4 字节，或 `Int32`。
* `Decimal64` - 8 字节，或 `Int64`。
* `Decimal128` - 16 字节，或 `Int128`。
* `Decimal256` - 32 字节，或 `Int256`。

反序列化 Decimal 值时，可以使用以下伪代码计算出整数部分和小数部分：

```text
let scale_multiplier = 10 ** scale
let whole_part = trunc(value / scale_multiplier)  // truncate toward zero
let fractional_part = value % scale_multiplier
let result = Decimal(whole_part, fractional_part)
```

其中，`trunc` 表示向零截断 (不是向下取整除法，后者在处理负值时结果会不同) ，而 `scale` 表示小数点后的位数。例如，对于 `Decimal(10, 2)` (等价于 `Decimal32(2)`) ，`scale` 为 `2`，值 `12345` 将表示为 `(123, 45)`。

序列化需要进行反向操作：

```text
let scale_multiplier = 10 ** scale
let result = whole_part * scale_multiplier + fractional_part
```

更多详情请参见 [ClickHouse Decimal 类型文档](https://clickhouse.com/docs/sql-reference/data-types/decimal).


### String \{#string\}

ClickHouse 字符串是**任意字节序列**。它们不必是有效的 UTF-8。长度前缀表示的是**字节长度**，而不是字符数。

编码分为两部分：

1. 一个可变长度整数 (LEB128) ，用于表示字符串的字节长度。
2. 字符串的原始字节。

例如，字符串 `foobar` 将按如下方式编码，占用 *七个* 字节：

```text
0x06, // LEB128 length of the string (6)
0x66, // 'f'
0x6f, // 'o'
0x6f, // 'o'
0x62, // 'b'
0x61, // 'a'
0x72, // 'r'
```


### FixedString \{#fixedstring\}

与 `String` 不同，`FixedString` 的长度是固定的，由 schema 定义。它编码为字节序列；如果值短于 `N`，则会在末尾填充零字节。

:::note
读取 `FixedString` 时，末尾的零字节可能是填充，也可能是数据中的实际 `\0` 字符；二者在传输中无法区分。ClickHouse 本身会原样保留全部 `N` 个字节。
:::

空的 `FixedString(3)` 只包含作为填充的零字节：

```text
0x00, 0x00, 0x00
```

包含字符串 `hi` 的非空 `FixedString(3)`：

```text
0x68, // 'h'
0x69, // 'i'
0x00, // padding zero
```

值为字符串 `bar` 的非空 `FixedString(3)`：

```text
0x62, // 'b'
0x61, // 'a'
0x72, // 'r'
```

在最后一个示例中，不需要填充，因为 *三个* 字节都已被使用。


### Date \{#date\}

存储为 `UInt16`（两个字节），表示自 `1970-01-01` ***起*** 的天数。

支持的取值范围：`[1970-01-01, 2149-06-06]`。

`Date` 的底层值示例：

```sql
SELECT CAST('2024-01-15', 'Date') AS d
```

```text
0x19, 0x4D, // 19737 as UInt16 (little-endian) = 19737 days since 1970-01-01
```

### Date32 \{#date32\}

以 `Int32`（4 字节）存储，表示相对于 `1970-01-01` ***之前或之后*** 的天数。

支持的取值范围：`[1900-01-01, 2299-12-31]`。

`Date32` 的底层值示例：

```sql
SELECT CAST('2024-01-15', 'Date32') AS d
```

```text
0x19, 0x4D, 0x00, 0x00, // 19737 as Int32 (little-endian) = 19737 days since 1970-01-01
```

纪元之前的日期：

```sql
SELECT CAST('1900-01-01', 'Date32') AS d
```

```text
0x21, 0x9C, 0xFF, 0xFF, // -25567 as Int32 (little-endian) = 25567 days before 1970-01-01
```

### DateTime \{#datetime\}

存储为 `UInt32` (四字节) ，表示自 `1970-01-01 00:00:00 UTC` ***以来*** 的秒数。

语法：

```text
DateTime([timezone])
```

例如，`DateTime` 或 `DateTime('UTC')`。

:::note
二进制值始终是 UTC 纪元偏移量。时区不会改变编码。不过，时区**确实**会影响插入时字符串值的解释方式：将 `'2024-01-15 10:30:00'` 插入 `DateTime('America/New_York')` 列时，存储的纪元值会不同于将同一字符串插入 `DateTime('UTC')` 列时的结果，因为该字符串会按该列时区中的本地时间进行解释。在线路传输中，两者都只是 `UInt32` 纪元 Seconds。
:::

支持的值范围：`[1970-01-01 00:00:00, 2106-02-07 06:28:15]`。

`DateTime` 的底层值示例：

```sql
SELECT CAST('2024-01-15 10:30:00', 'DateTime(\'UTC\')') AS d
```

```text
0x28, 0x09, 0xA5, 0x65, // 1705314600 as UInt32 (little-endian)
```


### DateTime64 \{#datetime64\}

以 `Int64` (8 字节) 形式存储，表示 `1970-01-01 00:00:00 UTC` ***之前或之后*** 的 **tick** 数。tick 的精度由 `precision` 参数定义，参见下面的语法：

```text
DateTime64(precision, [timezone])
```

其中，`precision` 是介于 `0` 到 `9` 之间的整数。通常只使用以下值：`3` (毫秒) 、`6` (微秒) 、
`9` (纳秒) 。

有效的 DateTime64 定义示例包括：`DateTime64(0)`、`DateTime64(3)`、`DateTime64(6, 'UTC')` 或 `DateTime64(9, 'Europe/Amsterdam')`。

:::note
与 `DateTime` 一样，二进制值始终是相对于 UTC 纪元的偏移量。timezone 会影响插入时字符串值的解释方式 (参见 [DateTime](#datetime) 中的说明) ，但编码本身始终是自 UTC 纪元以来的 `Int64` 时间刻度。
:::

`DateTime64` 类型的底层 `Int64` 值可以解释为 UNIX 纪元之前或之后以下单位的数量：

* `DateTime64(0)` - 秒。
* `DateTime64(3)` - 毫秒。
* `DateTime64(6)` - 微秒。
* `DateTime64(9)` - 纳秒。

支持的值范围：`[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`。

`DateTime64` 的底层值示例：

* `DateTime64(3)`：值 `1546300800000` 表示 `2019-01-01 00:00:00 UTC`。
* `DateTime64(6)`：值 `1705314600123456` 表示 `2024-01-15 10:30:00.123456 UTC`。
* `DateTime64(9)`：值 `1705314600123456789` 表示 `2024-01-15 10:30:00.123456789 UTC`。

:::note
最大值的精度为 8。如果使用 9 位精度 (纳秒) ，则支持的最大值为 UTC 时间 2262-04-11 23:47:16。
:::


### Time \{#time\}

以 `Int32` 存储，表示以秒为单位的时间值。负值也有效。

支持的取值范围：`[-999:59:59, 999:59:59]` (即 `[-3599999, 3599999]` Seconds) 。

:::note
目前，必须将设置 `enable_time_time64_type` 设为 `1`，才能使用 `Time` 或 `Time64`。
:::

`Time` 的底层值示例：

```sql
SET enable_time_time64_type = 1;
SELECT CAST('15:32:16', 'Time') AS t
```

```text
0x80, 0xDA, 0x00, 0x00, // 55936 seconds = 15:32:16
```


### Time64 \{#time64\}

在内部，Time64 以 `Decimal64` 的形式存储 (而 `Decimal64` 又以 `Int64` 的形式存储) ，表示带有秒小数部分的时间值，精度可配置。负值也是有效的。

Syntax:

```text
Time64(precision)
```

其中，`precision` 是 `0` 到 `9` 之间的整数。常见值包括：`3` (毫秒) 、`6` (微秒) 、`9` (纳秒) 。

支持的取值范围：`[-999:59:59.xxxxxxxxx, 999:59:59.xxxxxxxxx]`。

:::note
目前，必须将设置 `enable_time_time64_type` 设为 `1`，才能使用 `Time` 或 `Time64`。
:::

底层 `Int64` 值表示按 `10^precision` 缩放的秒的小数部分。

`Time64` 的底层值示例：

```sql
SET enable_time_time64_type = 1;
SELECT CAST('15:32:16.123456', 'Time64(6)') AS t
```

```text
0x40, 0x82, 0x0D, 0x06,
0x0D, 0x00, 0x00, 0x00, // 55936123456 as Int64
// 55936123456 / 10^6 = 55936.123456 seconds = 15:32:16.123456
```


### Interval 类型 \{#interval-types\}

所有 Interval 类型都以 `Int64` (8 字节，小端序) 存储。该值表示相应时间单位的数量。负值是有效的。

Interval 类型包括：`IntervalNanosecond`、`IntervalMicrosecond`、`IntervalMillisecond`、`IntervalSecond`、`IntervalMinute`、`IntervalHour`、`IntervalDay`、`IntervalWeek`、`IntervalMonth`、`IntervalQuarter`、`IntervalYear`。

:::note
Interval 类型名称 (例如 `IntervalSecond` 与 `IntervalDay`) 决定了存储值的单位。线上的编码格式始终相同。
:::

底层值示例：

```sql
SELECT INTERVAL 5 SECOND   AS a,
     INTERVAL 10 DAY     AS b,
     INTERVAL -7 DAY     AS c,
     INTERVAL 3 YEAR     AS d,
     INTERVAL 500 MICROSECOND AS e
```

```text
// IntervalSecond: 5
0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// IntervalDay: 10
0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// IntervalDay: -7
0xF9, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
// IntervalYear: 3
0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// IntervalMicrosecond: 500
0xF4, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
```


### Enum8, Enum16 \{#enum8-enum16\}

存储为单字节 (`Enum8` == `Int8`) 或双字节 (`Enum16` == `Int16`) ，表示枚举定义中枚举值的索引。请注意，存储类型为**有符号**——枚举值可以是负数 (例如，`Enum8('a' = -128, 'b' = 0)`) 。

Enum 可以按如下简单方式定义：

```sql
SELECT 1 :: Enum8('hello' = 1, 'world' = 2) AS e;
```

```text
   ┌─e─────┐
1. │ hello │
   └───────┘
```

上述定义的 Enum8 在客户端中将映射为以下值：

```text
Map<Int8, String> {
  1: 'hello',
  2: 'world'
}
```

或者采用更复杂的方式，例如这样：

```sql
SELECT 42 :: Enum16('f\'' = 1, 'x =' = 2, 'b\'\'' = 3, '\'c=4=' = 42, '4' = 1234) AS e;
```

```text
   ┌─e─────┐
1. │ 'c=4= │
   └───────┘
```

上面定义的 Enum16 在客户端中映射为以下值：

```text
Map<Int16, String> {
  1:    'f\'',
  2:    'x =',
  3:    'b\'',
  42:   '\'c=4=',
  1234: '4'
}
```

对于数据类型解析器，主要挑战在于跟踪枚举定义中的转义符号，例如 `\'`，以及可能出现在带引号字符串内的特殊符号 (如 `=`) 。


### UUID \{#uuid\}

表示为一个由 16 个字节组成的序列。UUID 存储为**两个小端序 `UInt64` 值**：标准 UUID 表示中的前 8 个字节会按字节顺序反转，后 8 个字节也会分别按字节顺序反转。

例如，给定 UUID `61f0c404-5cb3-11e7-907b-a6006ad3dba0`：

* 标准字节表示：`61 f0 c4 04 5c b3 11 e7` | `90 7b a6 00 6a d3 db a0`
* 前半部分反转 (LE UInt64) ：`e7 11 b3 5c 04 c4 f0 61`
* 后半部分反转 (LE UInt64) ：`a0 db d3 6a 00 a6 7b 90`

`UUID` 的底层值示例：

* `61f0c404-5cb3-11e7-907b-a6006ad3dba0` 表示为：

```text
0xE7, 0x11, 0xB3, 0x5C, 0x04, 0xC4, 0xF0, 0x61,
0xA0, 0xDB, 0xD3, 0x6A, 0x00, 0xA6, 0x7B, 0x90,
```

* 默认值 UUID `00000000-0000-0000-0000-000000000000` 以 16 个零字节表示：

```text
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
```

它可用于插入新记录时未指定 UUID 值的情况。


### IPv4 \{#ipv4\}

以四字节 `UInt32` 的形式存储，采用 **小端序** 字节顺序。请注意，这与 IP 地址通常使用的传统网络字节顺序 (大端序) 不同。`IPv4` 的底层值示例：

```sql
SELECT    
  CAST('0.0.0.0',         'IPv4') AS a,
  CAST('127.0.0.1',       'IPv4') AS b,
  CAST('192.168.0.1',     'IPv4') AS c,
  CAST('255.255.255.255', 'IPv4') AS d,
  CAST('168.212.226.204', 'IPv4') AS e
```

```text
0x00, 0x00, 0x00, 0x00, // 0.0.0.0
0x01, 0x00, 0x00, 0x7f, // 127.0.0.1
0x01, 0x00, 0xa8, 0xc0, // 192.168.0.1
0xff, 0xff, 0xff, 0xff, // 255.255.255.255
0xcc, 0xe2, 0xd4, 0xa8, // 168.212.226.204
```


### IPv6 \{#ipv6\}

以 **大端序 / 网络字节序** (最高有效字节优先，MSB first) 存储为 16 字节。`IPv6` 的底层值示例：

```sql
SELECT
    CAST('2a02:aa08:e000:3100::2',        'IPv6') AS a,
    CAST('2001:44c8:129:2632:33:0:252:2', 'IPv6') AS b,
    CAST('2a02:e980:1e::1',               'IPv6') AS c
```

```text
// 2a02:aa08:e000:3100::2
0x2A, 0x02, 0xAA, 0x08, 0xE0, 0x00, 0x31, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
// 2001:44c8:129:2632:33:0:252:2
0x20, 0x01, 0x44, 0xC8, 0x01, 0x29, 0x26, 0x32, 
0x00, 0x33, 0x00, 0x00, 0x02, 0x52, 0x00, 0x02,
// 2a02:e980:1e::1
0x2A, 0x02, 0xE9, 0x80, 0x00, 0x1E, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
```


### Nullable \{#nullable\}

Nullable 数据类型的编码方式如下：

1. 一个字节，用于指示该值是否为 `NULL`：
   * `0x00` 表示该值不是 `NULL`。
   * `0x01` 表示该值是 `NULL`。
2. 如果该值不是 `NULL`，则按常规方式编码其底层数据类型。如果该值是 `NULL`，则**不会**为底层类型写入任何额外字节。

例如，一个 `Nullable(UInt32)` 值：

```sql
SELECT    
   CAST(42,   'Nullable(UInt32)') AS a,
   CAST(NULL, 'Nullable(UInt32)') AS b
```

```text
0x00,                   // Not NULL - the value follows
0x2A, 0x00, 0x00, 0x00, // UInt32(42)
0x01,                   // NULL - nothing follows
```


### LowCardinality \{#lowcardinality\}

在 RowBinary 格式中，低基数标记不会影响线格式。例如，`LowCardinality(String)` 的编码方式与普通 `String` 相同。

:::warning
这仅适用于 RowBinary。在 Native 格式中，`LowCardinality` 使用不同的基于字典的编码方式。
:::

:::note
列可以定义为 `LowCardinality(Nullable(T))`，但不能定义为 `Nullable(LowCardinality(T))`——这始终会导致服务器返回错误。
:::

在测试期间，可将 [allow_suspicious_low_cardinality_types](https://clickhouse.com/docs/operations/settings/settings#allow_suspicious_low_cardinality_types) 设置为 `1`，以允许在 `LowCardinality` 中使用大多数数据类型，从而获得更好的覆盖率。

### Array \{#array\}

数组按以下方式编码：

1. 一个[可变长度整数 (LEB128) ](#unsigned-leb128)，表示数组中的元素个数。
2. 数组中的各个元素，其编码方式与底层数据类型相同。

例如，一个包含 `UInt32` 值的数组：

```sql
SELECT CAST(array(1, 2, 3), 'Array(UInt32)') AS arr
```

```text
0x03,                   // LEB128 - the array has 3 elements
0x01, 0x00, 0x00, 0x00, // UInt32(1)
0x02, 0x00, 0x00, 0x00, // UInt32(2)
0x03, 0x00, 0x00, 0x00, // UInt32(3)
```

一个稍复杂一些的示例：

```sql
SELECT array('foobar', 'qaz') AS arr
```

```text
0x02,             // LEB128 - the array has 2 elements
0x06,             // LEB128 - the first string has 6 bytes
0x66, 0x6f, 0x6f, 
0x62, 0x61, 0x72, // 'foobar'
0x03,             // LEB128 - the second string has 3 bytes
0x71, 0x61, 0x7a, // 'qaz'
```

:::note
数组可以包含 Nullable 值，但数组本身不能是 Nullable 类型。
:::

以下内容是有效的：

```sql
SELECT CAST([NULL, 'foo'], 'Array(Nullable(String))') AS arr;
```

```text
   ┌─arr──────────┐
1. │ [NULL,'foo'] │
   └──────────────┘
```

编码如下：

```text
0x02,             // LEB128  - the array has 2 elements
0x01,             // Is NULL - nothing follows for this element
0x00,             // Is NOT NULL - the data follows
0x03,             // LEB128  - the string has 3 bytes
0x66, 0x6f, 0x6f, // 'foo'
```

有关如何处理多维数组的示例，请参见 [Geo 部分](#geo-types)。


### Tuple \{#tuple\}

元组会被编码为：元组中的所有元素按照各自对应的线格式首尾相接，不包含任何额外的元信息或分隔符。

```sql
CREATE OR REPLACE TABLE foo
(
    `t` Tuple(
           UInt32,
           String,
           Array(UInt8)
        )
)
ENGINE = Memory;
INSERT INTO foo VALUES ((42, 'foo', array(99, 144)));
```

```text
0x2a, 0x00, 0x00, 0x00, // 42 as UInt32
0x03,                   // LEB128 - the string has 3 bytes
0x66, 0x6f, 0x6f,       // 'foo'
0x02,                   // LEB128 - the array has 2 elements
0x63,                   // 99 as UInt8
0x90,                   // 144 as UInt8
```

Tuple 数据类型的字符串编码会带来与 [Enum type](#enum8-enum16) 类似的挑战，例如需要跟踪转义符号和特殊字符；而对于 Tuple，还必须跟踪左右括号。此外，请注意，较为复杂的 Tuple 还可能包含其他嵌套的 Tuple、Array、Map，甚至 enum。

例如，在下表中，tuple 包含一个名称中带有反引号和括号的 enum；如果处理不当，可能会导致解析问题：

```sql
CREATE OR REPLACE TABLE foo
(
   `t` Tuple(
          Enum8('f\'()' = 0),
          Array(Nullable(Tuple(UInt32, String)))
       )
) ENGINE = Memory;
```


### Map \{#map\}

Map 可以视为 `Array(Tuple(K, V))`，其中 `K` 是键类型，`V` 是值类型。Map 按如下方式编码：

1. 使用一个[变长整数 (LEB128) ](#unsigned-leb128)表示 Map 中的元素数量。
2. Map 的元素以键值对形式编码，并按照各自对应的类型进行编码。

例如，一个键为 `String`、值为 `UInt32` 的 Map：

```sql
SELECT CAST(map('foo', 1, 'bar', 2), 'Map(String, UInt32)') AS m
```

```text
0x02,                   // LEB128 - the map has 2 elements
0x03,                   // LEB128 - the first key has 3 bytes
0x66, 0x6f, 0x6f,       // 'foo'
0x01, 0x00, 0x00, 0x00, // UInt32(1)
0x03,                   // LEB128 - the second key has 3 bytes
0x62, 0x61, 0x72,       // 'bar'
0x02, 0x00, 0x00, 0x00, // UInt32(2)
```

:::note
也可以使用具有深层嵌套结构的 Map，例如 `Map(String, Map(Int32, Array(Nullable(String))))`，其编码方式与上文所述类似。
:::


### Variant \{#variant\}

此类型表示其他数据类型的联合类型。类型 `Variant(T1, T2, ..., TN)` 表示该类型的每一行的值可以是 `T1`、`T2`、……、`TN` 中的任一种类型，也可以都不是 (即 `NULL` 值) 。

:::warning
虽然对最终用户来说，`Variant(T1, T2)` 与 `Variant(T2, T1)` 的含义完全相同，但在线路格式中，定义里类型的顺序很重要：定义中的类型始终按字母顺序排序，这一点非常关键，因为具体是哪种变体是通过“判别值”编码的——也就是该类型在定义中的数据类型索引。
:::

请看下面的示例：

```sql
SET allow_experimental_variant_type = 1,
    allow_suspicious_variant_types = 1;
CREATE OR REPLACE TABLE foo
(
  -- It does not matter what is the order of types in the user input;
  -- the types are always sorted alphabetically in the wire format.
  `var` Variant(
           Array(Int16),
           Bool,
           Date,
           FixedString(6),
           Float32, Float64,
           Int128, Int16, Int32, Int64, Int8,
           String,
           UInt128, UInt16, UInt32, UInt64, UInt8
       )
)
ENGINE = MergeTree
ORDER BY ();
INSERT INTO foo VALUES (true), ('foobar' :: FixedString(6)), (100.5 :: Float64), (100 :: Int128), ([1, 2, 3] :: Array(Int16));
SELECT * FROM foo FORMAT RowBinary;
```

```text
0x01,                               // type index -> Bool
 0x01,                               // true
 0x03,                               // type index -> FixedString(6)
 0x66, 0x6F, 0x6F, 0x62, 0x61, 0x72, // 'foobar' 
 0x05,                               // type index -> Float64
 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x20, 0x59, 0x40,             // 100.5 as Float64
 0x06,                               // type index -> Int128
 0x64, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00,             // 100 as Int128
 0x00,                               // type index -> Array(Int16)
 0x03,                               // LEB128 - the array has 3 elements
 0x01, 0x00,                         // 1 as Int16
 0x02, 0x00,                         // 2 as Int16
 0x03, 0x00,                         // 3 as Int16
```

`NULL` 值使用 `0xFF` 作为标识字节进行编码：

```sql
SELECT NULL :: Variant(UInt32, String)
```

```text
0xFF, // discriminant = NULL
```

可以使用 [allow&#95;suspicious&#95;variant&#95;types](https://clickhouse.com/docs/operations/settings/settings#allow_suspicious_variant_types) 设置，以便对 `Variant` 类型进行更充分的测试。


### Dynamic \{#dynamic\}

`Dynamic` 类型可以保存任意类型的值，具体类型在运行时确定。在 RowBinary 格式中，每个值都是自描述的：第一部分是按[此处格式](https://clickhouse.com/docs/sql-reference/data-types/data-types-binary-encoding)编码的类型说明，随后是具体内容，其值编码方式如本文档所述。因此，要解析某个值，你只需使用类型索引确定正确的解析器，然后复用你在其他地方已有的 RowBinary 解析逻辑。

```text
[BinaryTypeIndex][type-specific parameters...][value]
```

其中，`BinaryTypeIndex` 是一个用于标识类型的单字节。有关类型索引和参数，请参阅[此处](https://clickhouse.com/docs/sql-reference/data-types/data-types-binary-encoding)的参考文档。

`NULL` Dynamic 值使用 `BinaryTypeIndex` `0x00` (即 `Nothing` 类型) 编码，不包含其他字节：

```sql
SELECT NULL::Dynamic
```

```text
00                        # BinaryTypeIndex: Nothing (0x00), represents NULL
```

**示例：**

```sql
SELECT 42::Dynamic
```

```text
0a                        # BinaryTypeIndex: Int64 (0x0A)
2a 00 00 00 00 00 00 00   # Int64 value: 42
```

```sql
SELECT toDateTime64('2024-01-15 10:30:00', 3, 'America/New_York')::Dynamic
```

```text
14                        # BinaryTypeIndex: DateTime64WithTimezone (0x14)
03                        # UInt8: precision
10                        # VarUInt: timezone name length
41 6d 65 72 69 63 61 2f   # "America/"
4e 65 77 5f 59 6f 72 6b   # "New_York"
c0 6c be 0d 8d 01 00 00   # Int64: timestamps
```


### JSON \{#json\}

JSON 类型将数据编码为两个不同的类别：

1. **类型化路径** - 在 schema 中以显式 type 声明的路径 (例如，`JSON(user_id UInt32, name String)`)
2. **超出动态路径限制时的动态路径/溢出路径** - 在运行时发现的路径会存储为 `Dynamic` 类型。值的编码以前置的类型定义开头。

这两类的传输格式和规则各不相同。

| Path 类别   | 序列化时包含           | 值编码方式     | 是否允许 Variant/Nullable |
| --------- | ---------------- | --------- | --------------------- |
| **强类型路径** | 始终包含 (即使为 NULL)  | 类型专用二进制格式 | 是                     |
| **动态路径**  | 仅当非空时            | 动态        | 否                     |

Path 按三组依次序列化：typed paths、dynamic paths，以及 shared data (溢出) paths。Typed paths 和 dynamic paths 按实现定义的顺序写入 (由内部 hash map 的迭代顺序决定) ，而 shared data paths 则按字母顺序写入。读取方不应依赖任何特定的 path 排列顺序。反序列化器按名称而非位置来分派每个 path。

RowBinary 格式中的每个 JSON 行的序列化方式如下：

```text
[VarUInt: number_of_paths]
[String: path_1][value_1]
[String: path_2][value_2]
...
```

**示例：**

**1. 仅包含类型化路径的简单 JSON：**

Schema：`JSON(user_id UInt32, active Bool)`

行: `{"user_id": 42, "active": true}`

二进制编码 (带注释的十六进制) ：

```text
02                              # VarUInt: 2 paths total

# Typed path "active"
06 61 63 74 69 76 65            # String: "active" (length 6 + bytes)
01                              # Bool/UInt8 value: true (1)

# Typed path "user_id"
07 75 73 65 72 5F 69 64         # String: "user_id" (length 7 + bytes)
2A 00 00 00                     # UInt32 value: 42 (little-endian)
```

**2. 带有类型化和动态 Path 的简单 JSON：**

Schema: `JSON(user_id UInt32, active Bool)`

行: `{"user_id": 42, "active": true, "name": "Alice"}`

二进制编码 (带注释的十六进制) ：

```text
03                              # VarUInt: 3 paths total

# Typed path "active"
06 61 63 74 69 76 65            # String: "active" (length 6 + bytes)
01                              # Bool/UInt8 value: true (1)

# Dynamic path "name"
04 6E 61 6D 65                  # String: "name" (length 4 + bytes)
15                              # BinaryTypeIndex: String (0x15)
05 41 6C 69 63 65               # String value: "Alice" (length 5 + bytes)

# Typed path "user_id"
07 75 73 65 72 5F 69 64         # String: "user_id" (length 7 + bytes)
2A 00 00 00                     # UInt32 value: 42 (little-endian)

```

**3. Null 值处理：**

使用带类型的 Nullable 列时，您将得到 null：

Schema: `JSON(score Nullable(Int32))`

行: `{"score": null }`

二进制编码 (带注释的十六进制) ：

```text
01                              # VarUInt: 1 path total

# Typed path "score" (Nullable)
05 73 63 6f 72 65               # String: "score" (length 5 + bytes)
01                              # Nullable flag: 1 (is NULL, no value follows)
```

对于有类型的非 Nullable 列，您将得到默认值：

Schema: `JSON(name String)`

行: `{"name": null}`

二进制编码：

```text
01                              # VarUInt: 1 path (dynamic NULL paths are skipped!)

04 6e 61 6d 65  # "name"
00              # String length 0 (empty string)
```

使用动态路径时，该项将被忽略：

Schema: `JSON(id UInt64)`

行: `{"id": 100, "metadata": null}`

二进制编码：

```text
01                              # VarUInt: 1 path (dynamic NULL paths are skipped!)

# Typed path "id"
02 69 64                        # String: "id" (length 2 + bytes)
64 00 00 00 00 00 00 00         # UInt64 value: 100 (little-endian)

```

注意：值为 NULL 的 `metadata` 路径**不会被包含**，因为动态路径仅在非空时才会被序列化。这是与类型化路径的关键区别。

**4. 嵌套 JSON 对象：**

Schema: `JSON()`

行：`{"user": {"name": "Bob", "age": 30}}`

二进制编码 (带注释的十六进制) ：

```text
02                              # VarUInt: 2 paths (nested objects are flattened)

# Dynamic path "user.age"
08 75 73 65 72 2E 61 67 65      # String: "user.age" (length 8 + bytes)
0A                              # BinaryTypeIndex: Int64 (0x0A)
1E 00 00 00 00 00 00 00         # Int64 value: 30 (little-endian)

# Dynamic path "user.name"
09 75 73 65 72 2E 6E 61 6D 65   # String: "user.name" (length 9 + bytes)
15                              # BinaryTypeIndex: String (0x15)
03 42 6F 62                     # String value: "Bob" (length 3 + bytes)

```

注意：嵌套对象会被展平为以点分隔的路径 (例如，`user.name`，而不是嵌套结构) 。

**另一种方式：将 JSON 作为字符串模式**

启用设置 `output_format_binary_write_json_as_string=1` 后，JSON 列会序列化为单个 JSON 文本字符串，而不是结构化的二进制格式。对于写入 JSON 列，也有一个对应的设置 `input_format_binary_read_json_as_string`。此处具体选择哪种设置，取决于你希望在客户端还是服务器端解析 JSON。


### Geo 类型 \{#geo-types\}

Geo 是一类用于表示地理数据的数据类型，包括：

* `Point` - 表示为 `Tuple(Float64, Float64)`。
* `Ring` - 表示为 `Array(Point)`，或 `Array(Tuple(Float64, Float64))`。
* `Polygon` - 表示为 `Array(Ring)`，或 `Array(Array(Tuple(Float64, Float64)))`。
* `MultiPolygon` - 表示为 `Array(Polygon)`，或 `Array(Array(Array(Tuple(Float64, Float64))))`。
* `LineString` - 表示为 `Array(Point)`，或 `Array(Tuple(Float64, Float64))`。
* `MultiLineString` - 表示为 `Array(LineString)`，或 `Array(Array(Tuple(Float64, Float64)))`。

Geo 值的线上传输格式与 Tuple 和 Array 完全相同。`RowBinaryWithNamesAndTypes` 格式的头部将包含这些类型的别名，例如 `Point`、`Ring`、`Polygon`、`MultiPolygon`、`LineString` 和 `MultiLineString`。

```sql
SELECT    (1.0, 2.0)                                       :: Point           AS point,
    [(3.0, 4.0), (5.0, 6.0)]                         :: Ring            AS ring,
    [[(7.0, 8.0), (9.0, 10.0)], [(11.0, 12.0)]]      :: Polygon         AS polygon,
    [[[(13.0, 14.0), (15.0, 16.0)], [(17.0, 18.0)]]] :: MultiPolygon    AS multi_polygon,
    [(19.0, 20.0), (21.0, 22.0)]                     :: LineString      AS line_string,
    [[(23.0, 24.0), (25.0, 26.0)], [(27.0, 28.0)]]   :: MultiLineString AS multi_line_string
```


```text
// Point - or Tuple(Float64, Float64)
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F, // Point.X
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, // Point.Y
// Ring - or Array(Tuple(Float64, Float64))
0x02, // LEB128 - the "ring" array has 2 points
   // Ring - Point #1
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x40, 
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x40, 
   // Ring - Point #2
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x40, 
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x40, 
// Polygon - or Array(Array(Tuple(Float64, Float64)))
0x02, // LEB128 - the "polygon" array has 2 rings
   0x02, // LEB128 - the first ring has 2 points
      // Polygon - Ring #1 - Point #1
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1C, 0x40, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x40,
      // Polygon - Ring #1 - Point #2
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x22, 0x40, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x40, 
  0x01, // LEB128 - the second ring has 1 point
      // Polygon - Ring #2 - Point #1 (the only one)
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0x40, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x40, 
// MultiPolygon - or Array(Array(Array(Tuple(Float64, Float64))))
0x01, // LEB128 - the "multi_polygon" array has 1 polygon
   0x02, // LEB128 - the first polygon has 2 rings
      0x02, // LEB128 - the first ring has 2 points
         // MultiPolygon - Polygon #1 - Ring #1 - Point #1
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A, 0x40, 
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x40,
         // MultiPolygon - Polygon #1 - Ring #1 - Point #2
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x40, 
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x40, 
      0x01, // LEB128 - the second ring has 1 point
        // MultiPolygon - Polygon #1 - Ring #2 - Point #1 (the only one)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x40, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x40, 
 // LineString - or Array(Tuple(Float64, Float64))
 0x02, // LEB128 - the line string has 2 points
    // LineString - Point #1
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x40, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x34, 0x40,
    // LineString - Point #2
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x35, 0x40, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x40, 
 // MultiLineString - or Array(Array(Tuple(Float64, Float64)))
 0x02, // LEB128 - the multi line string has 2 line strings
   0x02, // LEB128 - the first line string has 2 points
     // MultiLineString - LineString #1 - Point #1
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x37, 0x40, 
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x40, 
     // MultiLineString - LineString #1 - Point #2
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x39, 0x40, 
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3A, 0x40, 
   0x01, // LEB128 - the second line string has 1 point
     // MultiLineString - LineString #2 - Point #1 (the only one)
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3B, 0x40, 
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x40,
```

### Geometry \{#geometry\}

`Geometry` 是一种 `Variant` 类型，可容纳上文列出的任意 Geo 类型。在线路传输中，它的编码方式与 `Variant` 完全相同，使用一个判别字节来指示后续的 geo 类型。

Geometry 的判别索引如下：

| Index | Type            |
| ----- | --------------- |
| 0     | LineString      |
| 1     | MultiLineString |
| 2     | MultiPolygon    |
| 3     | Point           |
| 4     | Polygon         |
| 5     | Ring            |

线路格式结构：

```text
// 1 byte discriminant (0-5)
// followed by the corresponding geo type data
```

`Point` 编码为 `Geometry` 的示例：

```sql
SELECT ((1.0, 2.0)::Point)::Geometry
```

```text
0x03,                                           // discriminant = 3 (Point)
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F, // Point.X = 1.0 as Float64
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, // Point.Y = 2.0 as Float64
```

将 `Ring` 编码为 `Geometry` 的示例：

```text
0x05,       // discriminant = 5 (Ring)
0x02,       // LEB128 - array has 2 points
// Point #1
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x40, // X = 3.0
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x40, // Y = 4.0
// Point #2
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x40, // X = 5.0
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x40, // Y = 6.0
```


### Nested \{#nested\}

`Nested` 的线格式取决于 `flatten_nested` 设置。

:::warning
单行中的所有组件数组**必须长度相同**。这是由服务器强制执行的约束。长度不一致会导致插入错误。
:::

#### `flatten_nested = 1` (默认值)  \{#nested-flattened\}

在默认设置下，`Nested` 会被展平为独立的数组。每个子列都会成为单独的 `Array` 列，并采用以点分隔的名称：

```sql
CREATE OR REPLACE TABLE foo
(
    n Nested(a String, b Int32)
) ENGINE = MergeTree ORDER BY ();
-- flatten_nested=1 is the default
INSERT INTO foo VALUES (['foo', 'bar'], [42, 144]);
```

`DESCRIBE TABLE foo` 显示扁平化后的列：

```text
   ┌─name─┬─type──────────┐
1. │ n.a  │ Array(String) │
2. │ n.b  │ Array(Int32)  │
   └──────┴───────────────┘
```

每个数组都会单独序列化，如 [Array](#array) 一节所述：

```text
0x02,                   // LEB128 - 2 String elements in the first array (n.a)
 0x03,                   // LEB128 - the first string has 3 bytes
 0x66, 0x6F, 0x6F,       // 'foo'
 0x03,                   // LEB128 - the second string has 3 bytes
 0x62, 0x61, 0x72,       // 'bar'
0x02,                   // LEB128 - 2 Int32 elements in the second array (n.b)
 0x2A, 0x00, 0x00, 0x00, // 42 as Int32
 0x90, 0x00, 0x00, 0x00, // 144 as Int32
```


#### `flatten_nested = 0` \{#nested-unflattened\}

当 `flatten_nested = 0` 时，`Nested` 会保留为一个类型为 `Array(Tuple(...))` 的单列。列名不会以点号分隔：

```sql
SET flatten_nested = 0;
CREATE OR REPLACE TABLE foo
(
    n Nested(a String, b Int32)
) ENGINE = MergeTree ORDER BY ();
INSERT INTO foo VALUES ([('foo', 42), ('bar', 144)]);
```

`DESCRIBE TABLE foo` 会显示一列：

```text
   ┌─name─┬─type───────────────────────┐
1. │ n    │ Nested(a String, b Int32)  │
   └──────┴────────────────────────────┘
```

编码格式为 `Array(Tuple(String, Int32))`：先写入数组长度前缀，再按顺序写入每个元素的元组字段：

```text
0x02,                   // LEB128 - 2 elements in the array
 0x03,                   // LEB128 - first tuple, field a: 3 bytes
 0x66, 0x6F, 0x6F,       // 'foo'
 0x2A, 0x00, 0x00, 0x00, // first tuple, field b: 42 as Int32
 0x03,                   // LEB128 - second tuple, field a: 3 bytes
 0x62, 0x61, 0x72,       // 'bar'
 0x90, 0x00, 0x00, 0x00, // second tuple, field b: 144 as Int32
```

请注意，这些字段是按元素交错排列的 (a₁、b₁、a₂、b₂) ，而不是像扁平化表示中那样按列分组 (a₁、a₂、b₁、b₂) 。


### SimpleAggregateFunction \{#simpleaggregatefunction\}

`SimpleAggregateFunction(func, T)` 的编码方式与其底层数据类型 `T` 完全一致。聚合函数名称不会影响线格式。

例如，`SimpleAggregateFunction(max, UInt32)` 的编码方式与普通的 `UInt32` 相同：

```sql
CREATE TABLE test_saf
(
    key UInt32,
    val SimpleAggregateFunction(max, UInt32)
) ENGINE = AggregatingMergeTree ORDER BY key;

INSERT INTO test_saf VALUES (1, 42);
SELECT val FROM test_saf;
```

RowBinaryWithNamesAndTypes 头部将类型标示为 `SimpleAggregateFunction(max, UInt32)`，但在线上传输的值只是 `UInt32`：

```text
0x2A, 0x00, 0x00, 0x00, // 42 as UInt32
```

### AggregateFunction \{#aggregatefunction\}

`AggregateFunction(func, T)` 存储聚合函数的完整中间状态。与 `SimpleAggregateFunction` 不同，后者虽然也存储中间状态，但其编码方式与底层数据类型完全一致；`AggregateFunction` 存储的是不透明的二进制 blob，其格式由各个聚合函数自行定义。

:::warning
聚合状态在 RowBinary 中**没有长度前缀**。解析器必须理解每个特定聚合函数的内部序列化格式，才能知道需要读取多少字节。实际使用中，大多数客户端会将聚合状态视为不透明数据，并使用 `*State` / `*Merge` 组合器，由服务器处理序列化。
:::

内部格式因函数而异。下面是一些简单示例：

**`countState`** — 将计数存储为 VarUInt (LEB128) ：

```sql
SELECT countState(number) FROM numbers(5)
```

```text
0x05, // VarUInt: 5
```

**`sumState`** — 将累积和存储在固定宽度的整数中。其位宽取决于参数类型 (整数参数使用 `UInt64`) ：

```sql
SELECT sumState(toUInt32(number)) FROM numbers(5) -- sum = 0+1+2+3+4 = 10
```

```text
0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 10 as UInt64
```

**`minState` / `maxState`** — 存储一个标志字节，后面跟着底层类型的值。空状态 (即未见任何值) 时，该标志为 `0x00`；存在值时，该标志为 `0x01`：

```sql
SELECT maxState(toUInt32(number)) FROM numbers(5) -- max = 4
```

```text
0x01,                   // flag: has value
0x04, 0x00, 0x00, 0x00, // 4 as UInt32
```

空状态 (未聚合出任何行) ：

```sql
SELECT minState(toUInt32(number)) FROM numbers(0)
```

```text
0x00, // flag: no value
```

:::note
`uniq`、`quantile` 或 `groupArray` 等较复杂的函数会使用特定于实现的格式。如果你需要读取或写入这些状态，请查阅相应函数的 ClickHouse 源代码。
:::


### QBit \{#qbit\}

`QBit` 是一种向量类型，可在不同精度级别下进行高效查找。其内部采用转置格式存储。在传输过程中，QBit 只是由底层元素类型 (`Float32`、`Float64` 或 `BFloat16`) 组成的 `Array`。用于存储的位转置优化发生在服务端，而不是在 RowBinary 协议中。

语法：

```text
QBit(element_type, dimension)
```

其中，`element_type` 为 `Float32`、`Float64` 或 `BFloat16`，`dimension` 为固定向量的维度。

线格式：与 `Array(element_type)` 完全相同：

```text
// LEB128 length
// followed by `length` elements of `element_type`
```

`QBit(Float32, 4)` 对 `[1.0, 2.0, 3.0, 4.0]` 的编码示例：

```sql
SELECT [1.0, 2.0, 3.0, 4.0]::QBit(Float32, 4)
```

```text
0x04,                   // LEB128 - array has 4 elements
0x00, 0x00, 0x80, 0x3F, // 1.0 as Float32
0x00, 0x00, 0x00, 0x40, // 2.0 as Float32
0x00, 0x00, 0x40, 0x40, // 3.0 as Float32
0x00, 0x00, 0x80, 0x40, // 4.0 as Float32
```


## 格式设置 \{#format-settings\}

<RowBinaryFormatSettings/>