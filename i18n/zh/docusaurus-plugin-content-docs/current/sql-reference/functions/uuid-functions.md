---
'description': '处理UUID的函数的文档'
'sidebar_label': 'UUIDs'
'sidebar_position': 205
'slug': '/sql-reference/functions/uuid-functions'
'title': '处理UUID的函数'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';



# 用于处理 UUID 的函数

## generateUUIDv4 {#generateuuidv4}

生成一个 [版本 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

- `expr` — 一个任意的 [表达式](/sql-reference/syntax#expressions)，用于在查询中多次调用该函数时绕过 [公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不会影响返回的 UUID。可选。

**返回值**

类型为 UUIDv4 的值。

**示例**

首先，创建一个列类型为 UUID 的表，然后将生成的 UUIDv4 插入该表。

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

**示例，每行生成多个 UUID**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

生成一个 [版本 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)。

生成的 UUID 包含当前的 Unix 时间戳（毫秒，48位），后面是版本 “7”（4位），一个计数器（42位）用于区分同毫秒内的 UUID（包括一个变体字段 “2”，2位），和一个随机字段（32位）。
对于任何给定的时间戳 (unix_ts_ms)，计数器从一个随机值开始，每生成一个新的 UUID 计数器加 1 直到时间戳改变。
如果计数器溢出，时间戳字段加 1，并将计数器重置为一个新的随机起始值。

函数 `generateUUIDv7` 保证在并发运行的线程和查询中，时间戳内的计数器字段单调递增。

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
截至 2024 年 4 月，版本 7 的 UUID 处于草案状态，其布局可能在未来变化。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

- `expr` — 一个任意的 [表达式](/sql-reference/syntax#expressions)，用于在查询中多次调用该函数时绕过 [公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不会影响返回的 UUID。可选。

**返回值**

类型为 UUIDv7 的值。

**示例**

首先，创建一个列类型为 UUID 的表，然后将生成的 UUIDv7 插入该表。

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

**示例，每行生成多个 UUID**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## empty {#empty}

检查输入的 UUID 是否为空。

**语法**

```sql
empty(UUID)
```

如果 UUID 包含所有零（零 UUID），则视为为空。

该函数同样适用于 [数组](/sql-reference/functions/array-functions#empty) 和 [字符串](string-functions.md#empty)。

**参数**

- `x` — 一个 UUID。 [UUID](../data-types/uuid.md)。

**返回值**

- 如果 UUID 为空则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

要生成 UUID 值，ClickHouse 提供了 [generateUUIDv4](#generateuuidv4) 函数。

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

检查输入的 UUID 是否非空。

**语法**

```sql
notEmpty(UUID)
```

如果 UUID 包含所有零（零 UUID），则视为为空。

该函数同样适用于 [数组](/sql-reference/functions/array-functions#notempty) 或 [字符串](string-functions.md#notempty)。

**参数**

- `x` — 一个 UUID。 [UUID](../data-types/uuid.md)。

**返回值**

- 如果 UUID 非空则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

要生成 UUID 值，ClickHouse 提供了 [generateUUIDv4](#generateuuidv4) 函数。

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

将字符串类型的值转换为 UUID。

```sql
toUUID(string)
```

**返回值**

UUID 类型值。

**用法示例**

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

- `string` — 由 36 个字符组成的字符串或 FixedString(36)。 [String](../syntax.md#string)。
- `default` — 如果第一个参数无法转换为 UUID 类型时使用的默认 UUID。 [UUID](../data-types/uuid.md)。

**返回值**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返回值**

UUID 类型值。

**用法示例**

第一个示例将返回可以转换为 UUID 类型的第一个参数：

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' as UUID));
```

结果：

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

第二个示例将返回第二个参数（提供的默认 UUID），因为第一个参数无法转换为 UUID 类型：

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

接受一个字符串类型的参数，并尝试将其解析为 UUID。如果失败，则返回 NULL。

```sql
toUUIDOrNull(string)
```

**返回值**

类型为 Nullable(UUID) 的值。

**用法示例**

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

接受一个字符串类型的参数，并尝试将其解析为 UUID。如果失败，则返回零 UUID。

```sql
toUUIDOrZero(string)
```

**返回值**

UUID 类型值。

**用法示例**

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

接受一个包含 36 个字符的 `string`，格式为 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，并返回其二进制表示形式 [FixedString(16)](../data-types/fixedstring.md)，其格式可选由 `variant` 指定（默认是 `Big-endian`）。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

- `string` — 36 个字符的 [String](/sql-reference/data-types/string) 或 [FixedString](/sql-reference/data-types/string)
- `variant` — 整数，表示由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

FixedString(16)

**用法示例**

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

接受一个 `binary`，包含 UUID 的二进制表示形式，其格式可选由 `variant` 指定（默认是 `Big-endian`），并返回一个包含 36 个字符的文本格式字符串。

**语法**

```sql
UUIDNumToString(binary[, variant = 1])
```

**参数**

- `binary` — [FixedString(16)](../data-types/fixedstring.md)，作为 UUID 的二进制表示。
- `variant` — 整数，表示由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

字符串。

**用法示例**

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

接受一个 [UUID](../data-types/uuid.md)，并返回其二进制表示形式作为 [FixedString(16)](../data-types/fixedstring.md)，其格式可选由 `variant` 指定（默认是 `Big-endian`）。此函数取代对两个单独函数 `UUIDStringToNum(toString(uuid))` 的调用，因此不需要从 UUID 转换为字符串来提取 UUID 的字节。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — 整数，表示由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 指定的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

UUID 的二进制表示形式。

**用法示例**

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

返回 UUID 版本 7 的时间戳组件。

**语法**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**参数**

- `uuid` — 版本 7 的 [UUID](../data-types/uuid.md)。
- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。 [String](../data-types/string.md)。

**返回值**

- 精确到毫秒的时间戳。如果 UUID 不是有效的版本 7 UUID，则返回 1970-01-01 00:00:00.000。 [DateTime64(3)](../data-types/datetime64.md)。

**用法示例**

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

返回 ClickHouse 服务器首次启动时生成的随机 UUID。该 UUID 存储在 ClickHouse 服务器目录中的文件 `uuid` 中（例如 `/var/lib/clickhouse/`），并在服务器重启之间保留。

**语法**

```sql
serverUUID()
```

**返回值**

- 服务器的 UUID。 [UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

生成一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

生成的 Snowflake ID 包含当前的 Unix 时间戳（毫秒，41 + 1 位高零位），后面跟着机器 ID（10 位）和计数器（12 位）以区分同毫秒内的 ID。
对于任何给定的时间戳 (unix_ts_ms)，计数器从 0 开始，并在每生成一个新的 Snowflake ID 时加 1，直到时间戳改变。
如果计数器溢出，时间戳字段加 1，并将计数器重置为 0。

函数 `generateSnowflakeID` 保证在并发运行的线程和查询中，时间戳内的计数器字段单调递增。

:::note
生成的 Snowflake ID 是基于 UNIX 纪元 1970-01-01。
虽然对于 Snowflake ID 的纪元没有标准或建议，其他系统的实现可能使用不同的纪元，例如 Twitter/X（2010-11-04）或 Mastodon（2015-01-01）。
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

- `expr` — 一个任意的 [表达式](/sql-reference/syntax#expressions)，用于在查询中多次调用该函数时绕过 [公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不会影响返回的 Snowflake ID。可选。
- `machine_id` — 机器 ID，使用最低的 10 位。 [Int64](../data-types/int-uint.md)。可选。

**返回值**

类型为 UInt64 的值。

**示例**

首先，创建一个列类型为 UInt64 的表，然后将生成的 Snowflake ID 插入该表。

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

**示例，每行生成多个 Snowflake ID**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**示例，使用表达式和机器 ID**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
该函数已弃用，仅在开启设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时方可使用。
该函数将在未来某个时刻被移除。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，格式为 [DateTime](../data-types/datetime.md)。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [String](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件，作为 [DateTime](../data-types/datetime.md) 值。

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
该函数已弃用，仅在开启设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时方可使用。
该函数将在未来某个时刻被移除。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，格式为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [String](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件，作为 [DateTime64](../data-types/datetime64.md)，精度为 3，即毫秒。

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
该函数已弃用，仅在开启设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时方可使用。
该函数将在未来某个时刻被移除。
:::

将 [DateTime](../data-types/datetime.md) 值转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

- `value` — 带时间的日期。 [DateTime](../data-types/datetime.md)。

**返回值**

- 输入值转换为 [Int64](../data-types/int-uint.md) 数据类型，作为该时刻的第一个 Snowflake ID。

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
该函数已弃用，仅在开启设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时方可使用。
该函数将在未来某个时刻被移除。
:::

将 [DateTime64](../data-types/datetime64.md) 转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

- `value` — 带时间的日期。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 输入值转换为 [Int64](../data-types/int-uint.md) 数据类型，作为该时刻的第一个 Snowflake ID。

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

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，类型为 [DateTime](../data-types/datetime.md)。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake ID 的纪元时间，以毫秒为单位，自 1970-01-01 起。默认为 0（1970-01-01）。对于 Twitter/X 纪元（2015-01-01），请提供 1288834974657。可选。 [UInt*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [String](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件，作为 [DateTime](../data-types/datetime.md) 值。

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

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳组件，类型为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake ID 的纪元时间，以毫秒为单位，自 1970-01-01 起。默认为 0（1970-01-01）。对于 Twitter/X 纪元（2015-01-01），请提供 1288834974657。可选。 [UInt*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [String](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件，作为 [DateTime64](../data-types/datetime64.md)，精度为 3，即毫秒。

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

- `value` — 带时间的日期。 [DateTime](../data-types/datetime.md)。
- `epoch` - Snowflake ID 的纪元时间，以毫秒为单位，自 1970-01-01 起。默认为 0（1970-01-01）。对于 Twitter/X 纪元（2015-01-01），请提供 1288834974657。可选。 [UInt*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为 [UInt64](../data-types/int-uint.md)，作为该时刻的第一个 Snowflake ID。

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

- `value` — 带时间的日期。 [DateTime64](../data-types/datetime64.md)。
- `epoch` - Snowflake ID 的纪元时间，以毫秒为单位，自 1970-01-01 起。默认为 0（1970-01-01）。对于 Twitter/X 纪元（2015-01-01），请提供 1288834974657。可选。 [UInt*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为 [UInt64](../data-types/int-uint.md)，作为该时刻的第一个 Snowflake ID。

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

## 另请参见 {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)
