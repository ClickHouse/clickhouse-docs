---
'description': '处理UUID的函数的文档'
'sidebar_label': 'UUIDs'
'sidebar_position': 205
'slug': '/sql-reference/functions/uuid-functions'
'title': '处理UUID的函数'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 操作UUID的函数

## generateUUIDv4 {#generateuuidv4}

生成一个 [版本 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

- `expr` — 一个任意的 [表达式](/sql-reference/syntax#expressions)，用于在查询中多次调用该函数时绕过 [常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值对返回的UUID没有影响。可选。

**返回值**

UUIDv4 类型的值。

**示例**

首先，创建一个类型为 UUID 的列的表，然后将生成的 UUIDv4 插入到表中。

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

生成一个 [版本 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)。

生成的UUID包含当前的Unix时间戳（毫秒，48位），后跟版本 "7"（4位），一个计数器（42位）用于区分毫秒内的UUID（包括变体字段 "2"，2位），以及一个随机字段（32位）。
对于任何给定的时间戳（unix_ts_ms），计数器从一个随机值开始，并在每次生成新UUID时加1，直到时间戳改变。
如果计数器溢出，时间戳字段加1，计数器重置为一个新的随机起始值。

函数 `generateUUIDv7` 确保在并发运行的线程和查询中，时间戳内的计数器字段在所有函数调用中的增加是单调的。

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

:::note
截至2024年4月，版本7的UUID处于草案状态，其布局可能会在未来发生改变。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

- `expr` — 一个任意的 [表达式](/sql-reference/syntax#expressions)，用于在查询中多次调用该函数时绕过 [常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值对返回的UUID没有影响。可选。

**返回值**

UUIDv7 类型的值。

**示例**

首先，创建一个类型为 UUID 的列的表，然后将生成的 UUIDv7 插入到表中。

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

## empty {#empty}

检查输入UUID是否为空。

**语法**

```sql
empty(UUID)
```

如果UUID包含所有零（零UUID），则视为 empty。

该函数也适用于 [数组](/sql-reference/functions/array-functions#empty) 和 [字符串](string-functions.md#empty)。

**参数**

- `x` — UUID。 [UUID](../data-types/uuid.md)。

**返回值**

- 对于空UUID返回 `1`，对于非空UUID返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

要生成UUID值，ClickHouse提供了 [generateUUIDv4](#generateuuidv4) 函数。

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

检查输入UUID是否非空。

**语法**

```sql
notEmpty(UUID)
```

如果UUID包含所有零（零UUID），则视为 empty。

该函数也适用于 [数组](/sql-reference/functions/array-functions#notempty) 或 [字符串](string-functions.md#notempty)。

**参数**

- `x` — UUID。 [UUID](../data-types/uuid.md)。

**返回值**

- 对于非空UUID返回 `1`，对于空UUID返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

要生成UUID值，ClickHouse提供了 [generateUUIDv4](#generateuuidv4) 函数。

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

将类型为字符串的值转换为UUID。

```sql
toUUID(string)
```

**返回值**

UUID类型的值。

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

- `string` — 36个字符的字符串或 FixedString(36)。 [字符串](../syntax.md#string)。
- `default` — 如果第一个参数无法转换为UUID类型，则使用此UUID作为默认值。 [UUID](../data-types/uuid.md)。

**返回值**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返回值**

UUID类型的值。

**使用示例**

第一个示例将返回第一个参数转换为UUID类型，因为可以转换：

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' as UUID));
```

结果：

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

第二个示例将返回第二个参数（提供的默认UUID），因为第一个参数无法转换为UUID类型：

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' as UUID));
```

结果：

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#touuidornull}

接受字符串类型的参数，并尝试将其解析为UUID。如果失败，则返回NULL。

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

接受字符串类型的参数，并尝试将其解析为UUID。如果失败，则返回零UUID。

```sql
toUUIDOrZero(string)
```

**返回值**

UUID类型的值。

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

接受包含36个字符的 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 格式的 `string`，并返回 [FixedString(16)](../data-types/fixedstring.md) 作为其二进制表示，格式可以由`variant`指明（默认是 `Big-endian`）。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

- `string` — 一个含有36个字符的 [字符串](/sql-reference/data-types/string) 或 [FixedString](/sql-reference/data-types/string)
- `variant` — 整数，表示由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

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

接受 `binary`，其包含UUID的二进制表示，格式可以由`variant`指明（默认是 `Big-endian`），并返回一个包含36个字符的文本格式字符串。

**语法**

```sql
UUIDNumToString(binary[, variant = 1])
```

**参数**

- `binary` — [FixedString(16)](../data-types/fixedstring.md)，作为UUID的二进制表示。
- `variant` — 整数，表示由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

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

接受一个 [UUID](../data-types/uuid.md)，并将其二进制表示返回为 [FixedString(16)](../data-types/fixedstring.md)，格式可以由`variant`指明（默认是 `Big-endian`）。这个函数替代了两个独立调用的函数 `UUIDStringToNum(toString(uuid))`，因此无需从UUID到字符串的中间转换以提取UUID的字节。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — 整数，表示由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

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

- `uuid` — 版本7的 [UUID](../data-types/uuid.md)。
- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。 [字符串](../data-types/string.md)。

**返回值**

- 具有毫秒精度的时间戳。如果UUID不是有效的版本7 UUID，则返回 1970-01-01 00:00:00.000。 [DateTime64(3)](../data-types/datetime64.md)。

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

返回在ClickHouse服务器首次启动时生成的随机UUID。UUID存储在ClickHouse服务器目录中的 `uuid` 文件中（例如 `/var/lib/clickhouse/`），并在服务器重启时保留。

**语法**

```sql
serverUUID()
```

**返回值**

- 服务器的UUID。 [UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

生成一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

生成的Snowflake ID包含当前的Unix时间戳（毫秒，41 + 1个顶部零位），后跟一个机器ID（10位），以及一个计数器（12位）以区分毫秒内的ID。
对于任何给定的时间戳（unix_ts_ms），计数器从0开始，并在每次生成新Snowflake ID时加1，直到时间戳变化。
如果计数器溢出，时间戳字段加1，计数器重置为0。

函数 `generateSnowflakeID` 确保在并发运行的线程和查询中，时间戳内的计数器字段在所有函数调用中的增加是单调的。

:::note
生成的Snowflake ID基于UNIX纪元1970-01-01。
虽然Snowflake ID的纪元没有标准或建议，但其他系统中的实现可能使用不同的纪元，例如Twitter/X（2010-11-04）或Mastodon（2015-01-01）。
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

**语法**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**参数**

- `expr` — 一个任意的 [表达式](/sql-reference/syntax#expressions)，用于在查询中多次调用该函数时绕过 [常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值对返回的Snowflake ID没有影响。可选。
- `machine_id` — 机器ID，使用最低的10位。 [Int64](../data-types/int-uint.md)。可选。

**返回值**

UInt64 类型的值。

**示例**

首先，创建一个类型为UInt64的列的表，然后将生成的Snowflake ID插入到表中。

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

**每行生成多个Snowflake ID的示例**

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
此函数已弃用，仅在设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 启用时可以使用。
该函数将在未来某个时候被移除。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，以 [DateTime](../data-types/datetime.md) 格式返回。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [字符串](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件作为 [DateTime](../data-types/datetime.md) 值。

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
此函数已弃用，仅在设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 启用时可以使用。
该函数将在未来某个时候被移除。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，以 [DateTime64](../data-types/datetime64.md) 格式返回。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [字符串](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件作为 [DateTime64](../data-types/datetime64.md)，其刻度 = 3，即毫秒精度。

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
此函数已弃用，仅在设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 启用时可以使用。
该函数将在未来某个时候被移除。
:::

将 [DateTime](../data-types/datetime.md) 值转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

- `value` — 带有时间的日期。 [DateTime](../data-types/datetime.md)。

**返回值**

- 输入值转换为 [Int64](../data-types/int-uint.md) 数据类型，作为该时间的第一个Snowflake ID。

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
此函数已弃用，仅在设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 启用时可以使用。
该函数将在未来某个时候被移除。
:::

将 [DateTime64](../data-types/datetime64.md) 转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

- `value` — 带有时间的日期。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 输入值转换为 [Int64](../data-types/int-uint.md) 数据类型，作为该时间的第一个Snowflake ID。

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

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，作为 [DateTime](../data-types/datetime.md) 类型的值。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake ID的纪元，自1970-01-01以来的毫秒。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。 [UInt*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [字符串](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件作为 [DateTime](../data-types/datetime.md) 值。

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

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，作为 [DateTime64](../data-types/datetime64.md) 类型的值。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake ID的纪元，自1970-01-01以来的毫秒。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。 [UInt*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [字符串](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件作为 [DateTime64](../data-types/datetime64.md)，其刻度 = 3，即毫秒精度。

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

将 [DateTime](../data-types/datetime.md) 值转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 带有时间的日期。 [DateTime](../data-types/datetime.md)。
- `epoch` - Snowflake ID的纪元，自1970-01-01以来的毫秒。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。 [UInt*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为 [UInt64](../data-types/int-uint.md)，作为该时间的第一个Snowflake ID。

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

将 [DateTime64](../data-types/datetime64.md) 转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 带有时间的日期。 [DateTime64](../data-types/datetime64.md)。
- `epoch` - Snowflake ID的纪元，自1970-01-01以来的毫秒。默认为0（1970-01-01）。对于Twitter/X纪元（2015-01-01），提供1288834974657。可选。 [UInt*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为 [UInt64](../data-types/int-uint.md)，作为该时间的第一个Snowflake ID。

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

## 另见 {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
