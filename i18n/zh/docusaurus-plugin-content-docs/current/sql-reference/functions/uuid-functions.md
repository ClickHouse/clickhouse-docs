---
'description': '处理UUID的函数的文档'
'sidebar_label': 'UUIDs'
'slug': '/sql-reference/functions/uuid-functions'
'title': '处理UUID的函数'
'doc_type': 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 处理UUID的函数

## UUIDv7生成 {#uuidv7-generation}

生成的UUID包含一个48位的Unix毫秒时间戳，后跟版本“7”（4位），一个计数器（42位）以区分同一毫秒内的UUID（包括一个变体字段“2”，2位）和一个随机字段（32位）。
对于任何给定的时间戳（`unix_ts_ms`），计数器从一个随机值开始，并在时间戳变化之前每生成一个新的UUID时递增1。如果计数器溢出，时间戳字段会增加1，并且计数器重置为一个随机的新起始值。
UUID生成函数确保在并发运行的线程和查询中，时间戳内的计数器字段在所有函数调用中单调递增。

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                           unix_ts_ms                          |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|          unix_ts_ms           |  ver  |   counter_high_bits   |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|var|                   counter_low_bits                        |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                            rand_b                             |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

## 雪花ID生成 {#snowflake-id-generation}

生成的雪花ID包含当前Unix时间戳（以毫秒为单位，41 + 1位高零位），后跟机器ID（10位）和一个计数器（12位）以区分同一毫秒内的ID。对于任何给定的时间戳（`unix_ts_ms`），计数器从0开始，并在时间戳变化之前每生成一个新的雪花ID时递增1。如果计数器溢出，时间戳字段会增加1，计数器重置为0。

:::note
生成的雪花ID基于UNIX纪元1970-01-01。虽然没有标准或推荐的雪花ID纪元，但其他系统中的实现可能使用不同的纪元，例如Twitter/X（2010-11-04）或Mastodon（2015-01-01）。
:::

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|0|                         timestamp                           |
├─┼                 ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                   |     machine_id    |    machine_seq_num    |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

## generateUUIDv4 {#generateuuidv4}

生成一个[版本4](https://tools.ietf.org/html/rfc4122#section-4.4)的[UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

- `expr` — 一个任意的[表达式](/sql-reference/syntax#expressions)，用于绕过[常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)在查询中多次调用该函数时。表达式的值对返回的UUID没有影响。可选。

**返回值**

UUIDv4类型的值。

**示例**

首先，创建一个包含UUID类型列的表，然后将生成的UUIDv4插入到表中。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv4();

SELECT * FROM tab;
```

结果：

```response
┌─────────────────────────────────uuid─┐
│ f4bf890f-f9dc-4332-ad5c-0c18e73f28e9 │
└──────────────────────────────────────┘
```

**每行生成多个UUID的示例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

生成一个[版本7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)的[UUID](../data-types/uuid.md)。

有关UUID结构、计数器管理和并发保证的详细信息，请参阅["UUIDv7生成"](#uuidv7-generation)。

:::note
截至2024年4月，版本7 UUID处于草案状态，其布局可能会在未来发生变化。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

- `expr` — 一个任意的[表达式](/sql-reference/syntax#expressions)，用于绕过[常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)在查询中多次调用该函数时。表达式的值对返回的UUID没有影响。可选。

**返回值**

UUIDv7类型的值。

**示例**

首先，创建一个包含UUID类型列的表，然后将生成的UUIDv7插入到表中。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv7();

SELECT * FROM tab;
```

结果：

```response
┌─────────────────────────────────uuid─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b │
└──────────────────────────────────────┘
```

**每行生成多个UUID的示例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

将给定时间的[DateTime](../data-types/datetime.md)值转换为[UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)。

有关UUID结构、计数器管理和并发保证的详细信息，请参阅["UUIDv7生成"](#uuidv7-generation)。

:::note
截至2024年4月，版本7 UUID处于草案状态，其布局可能会在未来发生变化。
:::

**语法**

```sql
dateTimeToUUIDv7(value)
```

**参数**

- `value` — 日期和时间。 [DateTime](../data-types/datetime.md)。

**返回值**

UUIDv7类型的值。

**示例**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

结果：

```response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**对于相同时间戳生成多个UUID的示例**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

**结果**

```response
   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
   └──────────────────────────────────────┘

   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
   └──────────────────────────────────────┘
```

该函数确保对相同时间戳的多次调用生成唯一的、单调递增的UUID。

## empty {#empty}

检查输入的UUID是否为空。

**语法**

```sql
empty(UUID)
```

如果UUID全部为零（零UUID），则认为其为空。

该函数也适用于[数组](/sql-reference/functions/array-functions#empty)和[字符串](string-functions.md#empty)。

**参数**

- `x` — 一个UUID。 [UUID](../data-types/uuid.md)。

**返回值**

- 对于空UUID返回`1`，对于非空UUID返回`0`。 [UInt8](../data-types/int-uint.md)。

**示例**

要生成UUID值，ClickHouse提供了[generateUUIDv4](#generateuuidv4)函数。

查询：

```sql
SELECT empty(generateUUIDv4());
```

结果：

```response
┌─empty(generateUUIDv4())─┐
│                       0 │
└─────────────────────────┘
```

## notEmpty {#notempty}

检查输入的UUID是否非空。

**语法**

```sql
notEmpty(UUID)
```

如果UUID全部为零（零UUID），则认为其为空。

该函数也适用于[数组](/sql-reference/functions/array-functions#notEmpty)或[字符串](string-functions.md#notempty)。

**参数**

- `x` — 一个UUID。 [UUID](../data-types/uuid.md)。

**返回值**

- 对于非空UUID返回`1`，对于空UUID返回`0`。 [UInt8](../data-types/int-uint.md)。

**示例**

要生成UUID值，ClickHouse提供了[generateUUIDv4](#generateuuidv4)函数。

查询：

```sql
SELECT notEmpty(generateUUIDv4());
```

结果：

```response
┌─notEmpty(generateUUIDv4())─┐
│                          1 │
└────────────────────────────┘
```

## toUUID {#touuid}

将字符串类型的值转换为UUID。

```sql
toUUID(string)
```

**返回值**

UUID类型值。

**使用示例**

```sql
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

结果：

```response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```

## toUUIDOrDefault {#touuidordefault}

**参数**

- `string` — 36个字符或FixedString(36)的字符串。[字符串](../syntax.md#string)。
- `default` — 如果第一个参数无法转换为UUID类型，则用作默认值的UUID。[UUID](../data-types/uuid.md)。

**返回值**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返回值**

UUID类型值。

**使用示例**

第一个示例返回可以转换为UUID类型的第一个参数：

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

结果：

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

第二个示例返回第二个参数（提供的默认UUID），因为第一个参数无法转换为UUID类型：

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

结果：

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#touuidornull}

接受一个字符串类型的参数，并尝试将其解析为UUID。如果失败，则返回NULL。

```sql
toUUIDOrNull(string)
```

**返回值**

Nullable(UUID)类型的值。

**使用示例**

```sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

结果：

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```

## toUUIDOrZero {#touuidorzero}

接受一个字符串类型的参数，并尝试将其解析为UUID。如果失败，则返回零UUID。

```sql
toUUIDOrZero(string)
```

**返回值**

UUID类型值。

**使用示例**

```sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

结果：

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```

## UUIDStringToNum {#uuidstringtonum}

接受一个包含36个字符的`string`，格式为`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，并返回一个[FixedString(16)](../data-types/fixedstring.md)作为其二进制表示，可以选择性地通过`variant`指定格式（默认是`Big-endian`）。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

- `string` — 一种[字符串](/sql-reference/data-types/string)，包含36个字符或[FixedString](/sql-reference/data-types/string)
- `variant` — 整数，表示按照[RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

FixedString(16)

**使用示例**

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

结果：

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

结果：

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDNumToString {#uuidnumtostring}

接受一个包含UUID二进制表示的`binary`，可以选择性地通过`variant`指定格式（默认是`Big-endian`），并返回一个包含36个字符的字符串。

**语法**

```sql
UUIDNumToString(binary[, variant = 1])
```

**参数**

- `binary` — [FixedString(16)](../data-types/fixedstring.md)，作为UUID的二进制表示。
- `variant` — 整数，表示按照[RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

字符串。

**使用示例**

```sql
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

结果：

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

```sql
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

结果：

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

## UUIDToNum {#uuidtonum}

接受一个[UUID](../data-types/uuid.md)，并返回其二进制表示，作为[FixedString(16)](../data-types/fixedstring.md)，可以选择性地通过`variant`指定格式（默认是`Big-endian`）。该函数替代了对两个单独函数的调用`UUIDStringToNum(toString(uuid))`，因此无需将UUID转换为字符串以提取字节。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — 整数，表示按照[RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

UUID的二进制表示。

**使用示例**

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

结果：

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

结果：

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDv7ToDateTime {#uuidv7todatetime}

返回UUID版本7的时间戳组件。

**语法**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**参数**

- `uuid` — 版本7的[UUID](../data-types/uuid.md)。
- `timezone` — 返回值的[时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。[字符串](../data-types/string.md)。

**返回值**

- 带有毫秒精度的时间戳。如果UUID不是有效的版本7 UUID，则返回1970-01-01 00:00:00.000。 [DateTime64(3)](../data-types/datetime64.md)。

**使用示例**

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

结果：

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

结果：

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## serverUUID {#serveruuid}

返回在ClickHouse服务器首次启动时生成的随机UUID。该UUID存储在ClickHouse服务器目录（例如`/var/lib/clickhouse/`）中的文件`uuid`中，并在服务器重启之间保留。

**语法**

```sql
serverUUID()
```

**返回值**

- 服务器的UUID。 [UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

生成一个[雪花ID](https://en.wikipedia.org/wiki/Snowflake_ID)。
该函数确保在并发运行的线程和查询中，时间戳内的计数器字段在所有函数调用中单调递增。

有关实现的详细信息，请参阅["雪花ID生成"](#snowflake-id-generation)。

**语法**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**参数**

- `expr` — 一个任意的[表达式](/sql-reference/syntax#expressions)，用于绕过[常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)在查询中多次调用该函数时。表达式的值对返回的雪花ID没有影响。可选。
- `machine_id` — 一个机器ID，使用最低的10位。[Int64](../data-types/int-uint.md)。可选。

**返回值**

UInt64类型的值。

**示例**

首先，创建一个包含UInt64类型列的表，然后将生成的雪花ID插入到表中。

```sql
CREATE TABLE tab (id UInt64) ENGINE = Memory;

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

结果：

```response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**每行生成多个雪花ID的示例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**带有表达式和机器ID的示例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
该函数已弃用，仅在启用设置[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)时可用。
该函数将在未来某个时刻被移除。

请改用函数[snowflakeIDToDateTime](#snowflakeidtodatetime)。
:::

提取[Sowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)的时间戳组件，格式为[DateTime](../data-types/datetime.md)。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

- `value` — 雪花ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析`time_string`。可选。 [字符串](../data-types/string.md)。

**返回值**

- `value`的时间戳组件，格式为[DateTime](../data-types/datetime.md)值。

**示例**

查询：

```sql
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

结果：

```response

┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflaketodatetime64}

<DeprecatedBadge/>

:::warning
该函数已弃用，仅在启用设置[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)时可用。
该函数将在未来某个时刻被移除。

请改用函数[snowflakeIDToDateTime64](#snowflakeidtodatetime64)。
:::

提取[Sowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)的时间戳组件，格式为[DateTime64](../data-types/datetime64.md)。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

- `value` — 雪花ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析`time_string`。可选。 [字符串](../data-types/string.md)。

**返回值**

- `value`的时间戳组件，格式为[DateTime64](../data-types/datetime64.md)，其比例 = 3，即毫秒精度。

**示例**

查询：

```sql
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

结果：

```response

┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## dateTimeToSnowflake {#datetimetosnowflake}

<DeprecatedBadge/>

:::warning
该函数已弃用，仅在启用设置[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)时可用。
该函数将在未来某个时刻被移除。

请改用函数[dateTimeToSnowflakeID](#datetimetosnowflakeid)。
:::

将[DateTime](../data-types/datetime.md)值转换为给定时间的第一个[雪花ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

- `value` — 日期和时间。[DateTime](../data-types/datetime.md)。

**返回值**

- 输入值转换为[Int64](../data-types/int-uint.md)数据类型，作为该时间的第一个雪花ID。

**示例**

查询：

```sql
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

结果：

```response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTime64ToSnowflake {#datetime64tosnowflake}

<DeprecatedBadge/>

:::warning
该函数已弃用，仅在启用设置[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)时可用。
该函数将在未来某个时刻被移除。

请改用函数[dateTime64ToSnowflakeID](#datetime64tosnowflakeid)。
:::

将[DateTime64](../data-types/datetime64.md)转换为给定时间的第一个[雪花ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

- `value` — 日期和时间。[DateTime64](../data-types/datetime64.md)。

**返回值**

- 输入值转换为[Int64](../data-types/int-uint.md)数据类型，作为该时间的第一个雪花ID。

**示例**

查询：

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

结果：

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeidtodatetime}

返回[Sowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)的时间戳组件，类型为[DateTime](../data-types/datetime.md)。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

- `value` — 雪花ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - 雪花ID的纪元，以毫秒为单位，自1970-01-01起计算。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。[UInt*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析`time_string`。可选。[字符串](../data-types/string.md)。

**返回值**

- `value`的时间戳组件类型为[DateTime](../data-types/datetime.md)的值。

**示例**

查询：

```sql
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

结果：

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeIDToDateTime64 {#snowflakeidtodatetime64}

返回[Sowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)的时间戳组件，类型为[DateTime64](../data-types/datetime64.md)。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

- `value` — 雪花ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - 雪花ID的纪元，以毫秒为单位，自1970-01-01起计算。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。[UInt*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析`time_string`。可选。[字符串](../data-types/string.md)。

**返回值**

- `value`的时间戳组件，类型为[DateTime64](../data-types/datetime64.md)，其精度为3，即毫秒精度。

**示例**

查询：

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

结果：

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## dateTimeToSnowflakeID {#datetimetosnowflakeid}

将[DateTime](../data-types/datetime.md)值转换为给定时间的第一个[雪花ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 日期和时间。[DateTime](../data-types/datetime.md)。
- `epoch` - 雪花ID的纪元，以毫秒为单位，自1970-01-01起计算。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。[UInt*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为[UInt64](../data-types/int-uint.md)，作为该时间的第一个雪花ID。

**示例**

查询：

```sql
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

结果：

```response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTime64ToSnowflakeID {#datetime64tosnowflakeid}

将[DateTime64](../data-types/datetime64.md)转换为给定时间的第一个[雪花ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 日期和时间。[DateTime64](../data-types/datetime64.md)。
- `epoch` - 雪花ID的纪元，以毫秒为单位，自1970-01-01起计算。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。[UInt*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为[UInt64](../data-types/int-uint.md)，作为该时间的第一个雪花ID。

**示例**

查询：

```sql
SELECT toDateTime('2021-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

结果：

```yaml
┌──────────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56.493 │ 6832626394434895872 │
└─────────────────────────┴─────────────────────┘
```

## 另请参阅 {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
