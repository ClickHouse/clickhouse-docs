---
description: 'UUID 相关函数文档'
sidebar_label: 'UUID 函数'
slug: /sql-reference/functions/uuid-functions
title: 'UUID 相关函数'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 用于操作 UUID 的函数



## UUIDv7 生成 {#uuidv7-generation}

生成的 UUID 包含一个 48 位的 Unix 毫秒时间戳,后跟版本号 "7"(4 位)、一个计数器(42 位,用于区分同一毫秒内的 UUID,包括变体字段 "2" 的 2 位),以及一个随机字段(32 位)。
对于任何给定的时间戳(`unix_ts_ms`),计数器从一个随机值开始,每生成一个新 UUID 时递增 1,直到时间戳发生变化。如果计数器溢出,时间戳字段将递增 1,同时计数器重置为一个新的随机起始值。
UUID 生成函数保证在并发运行的线程和查询中的所有函数调用里,时间戳内的计数器字段单调递增。

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


## Snowflake ID 生成 {#snowflake-id-generation}

生成的 Snowflake ID 包含当前的 Unix 时间戳(以毫秒为单位)(41 位加 1 位高位零位),后跟机器 ID(10 位)和计数器(12 位)以区分同一毫秒内的 ID。对于任何给定的时间戳(`unix_ts_ms`),计数器从 0 开始,每生成一个新的 Snowflake ID 就递增 1,直到时间戳发生变化。如果计数器溢出,时间戳字段递增 1,计数器重置为 0。

:::note
生成的 Snowflake ID 基于 UNIX 纪元 1970-01-01。虽然 Snowflake ID 的纪元没有标准或推荐规范,但其他系统的实现可能使用不同的纪元,例如 Twitter/X(2010-11-04)或 Mastodon(2015-01-01)。
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

生成一个 [version 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

- `expr` — 任意[表达式](/sql-reference/syntax#expressions),用于在查询中多次调用该函数时绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不影响返回的 UUID。可选参数。

**返回值**

UUIDv4 类型的值。

**示例**

首先创建一个包含 UUID 类型列的表,然后向表中插入生成的 UUIDv4。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv4();

SELECT * FROM tab;
```

结果:

```response
┌─────────────────────────────────uuid─┐
│ f4bf890f-f9dc-4332-ad5c-0c18e73f28e9 │
└──────────────────────────────────────┘
```

**每行生成多个 UUID 的示例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7 {#generateUUIDv7}

生成一个[版本 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)。

有关 UUID 结构、计数器管理和并发保证的详细信息,请参阅["UUIDv7 生成"](#uuidv7-generation)章节。

:::note
截至 2024 年 4 月,版本 7 UUID 处于草案状态,其布局在未来可能会发生变化。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

- `expr` — 任意[表达式](/sql-reference/syntax#expressions),用于在查询中多次调用该函数时绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不影响返回的 UUID。可选参数。

**返回值**

UUIDv7 类型的值。

**示例**

首先,创建一个包含 UUID 类型列的表,然后将生成的 UUIDv7 插入表中。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv7();

SELECT * FROM tab;
```

结果:

```response
┌─────────────────────────────────uuid─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b │
└──────────────────────────────────────┘
```

**每行生成多个 UUID 的示例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## dateTimeToUUIDv7 {#datetimetouuidv7}

将 [DateTime](../data-types/datetime.md) 值转换为指定时间的 [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)。

有关 UUID 结构、计数器管理和并发保证的详细信息,请参阅 ["UUIDv7 生成"](#uuidv7-generation) 章节。

:::note
截至 2024 年 4 月,版本 7 UUID 仍处于草案状态,其布局在未来可能会发生变化。
:::

**语法**

```sql
dateTimeToUUIDv7(value)
```

**参数**

- `value` — 日期时间。[DateTime](../data-types/datetime.md)。

**返回值**

UUIDv7 类型的值。

**示例**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

结果:

```response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**相同时间戳生成多个 UUID 的示例**

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

该函数确保使用相同时间戳的多次调用生成唯一且单调递增的 UUID。


## empty {#empty}

检查输入的 UUID 是否为空。

**语法**

```sql
empty(UUID)
```

如果 UUID 的所有位都为零(零 UUID),则认为该 UUID 为空。

该函数也适用于数组(Arrays)和字符串(Strings)。

**参数**

- `x` — UUID 值。[UUID](../data-types/uuid.md)。

**返回值**

- 空 UUID 返回 `1`,非空 UUID 返回 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

ClickHouse 提供了 [generateUUIDv4](#generateuuidv4) 函数用于生成 UUID 值。

查询:

```sql
SELECT empty(generateUUIDv4());
```

结果:

```response
┌─empty(generateUUIDv4())─┐
│                       0 │
└─────────────────────────┘
```


## notEmpty {#notempty}

检查输入的 UUID 是否为非空。

**语法**

```sql
notEmpty(UUID)
```

如果 UUID 的所有位均为零(零 UUID),则视为空。

该函数同样适用于数组和字符串。

**参数**

- `x` — UUID 值。[UUID](../data-types/uuid.md)。

**返回值**

- 非空 UUID 返回 `1`,空 UUID 返回 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

ClickHouse 提供了 [generateUUIDv4](#generateuuidv4) 函数用于生成 UUID 值。

查询:

```sql
SELECT notEmpty(generateUUIDv4());
```

结果:

```response
┌─notEmpty(generateUUIDv4())─┐
│                          1 │
└────────────────────────────┘
```


## toUUID {#touuid}

将 String 类型的值转换为 UUID。

```sql
toUUID(string)
```

**返回值**

UUID 类型值。

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

- `string` — 36 个字符的字符串或 FixedString(36)。[String](../syntax.md#string)。
- `default` — 当第一个参数无法转换为 UUID 类型时使用的默认 UUID。[UUID](../data-types/uuid.md)。

**返回值**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返回值**

UUID 类型值。

**使用示例**

第一个示例返回转换为 UUID 类型的第一个参数,因为它可以被转换:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

结果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

第二个示例返回第二个参数(提供的默认 UUID),因为第一个参数无法转换为 UUID 类型:

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

结果:

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull {#touuidornull}

接受一个 String 类型的参数并尝试将其解析为 UUID。如果失败,则返回 NULL。

```sql
toUUIDOrNull(string)
```

**返回值**

Nullable(UUID) 类型的值。

**使用示例**

```sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

结果:

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```


## toUUIDOrZero {#touuidorzero}

接受一个 String 类型的参数并尝试将其解析为 UUID。如果解析失败,则返回零值 UUID。

```sql
toUUIDOrZero(string)
```

**返回值**

UUID 类型的值。

**使用示例**

```sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

结果:

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```


## UUIDStringToNum {#uuidstringtonum}

接受包含 36 个字符的 `string`,格式为 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,并返回一个 [FixedString(16)](../data-types/fixedstring.md) 作为其二进制表示形式,其格式可通过 `variant` 参数指定(默认为 `Big-endian`)。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

- `string` — 包含 36 个字符的 [String](/sql-reference/data-types/string) 或 [FixedString](/sql-reference/data-types/string)
- `variant` — 整数,表示 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 中指定的变体。1 = `Big-endian`(默认),2 = `Microsoft`。

**返回值**

FixedString(16)

**使用示例**

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

结果:

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

结果:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```


## UUIDNumToString {#uuidnumtostring}

接受包含 UUID 二进制表示的 `binary` 参数,其格式可通过 `variant` 参数选择性指定(默认为 `Big-endian`),并返回包含 36 个字符的文本格式字符串。

**语法**

```sql
UUIDNumToString(binary[, variant = 1])
```

**参数**

- `binary` — [FixedString(16)](../data-types/fixedstring.md),UUID 的二进制表示形式。
- `variant` — 整数,表示 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 规范中指定的变体。1 = `Big-endian`(默认值),2 = `Microsoft`。

**返回值**

字符串。

**使用示例**

```sql
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

结果:

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

结果:

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```


## UUIDToNum {#uuidtonum}

接受一个 [UUID](../data-types/uuid.md) 并返回其二进制表示,类型为 [FixedString(16)](../data-types/fixedstring.md),可通过 `variant` 参数指定格式(默认为 `Big-endian`)。此函数替代了对两个独立函数 `UUIDStringToNum(toString(uuid))` 的调用,因此无需先将 UUID 转换为字符串即可从 UUID 中提取字节。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — 整数,表示 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 中指定的变体。1 = `Big-endian`(默认),2 = `Microsoft`。

**返回值**

UUID 的二进制表示。

**使用示例**

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

结果:

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

结果:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```


## UUIDv7ToDateTime {#uuidv7todatetime}

返回 UUID 版本 7 的时间戳部分。

**语法**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**参数**

- `uuid` — 版本 7 的 [UUID](../data-types/uuid.md)。
- `timezone` — 返回值的[时区名称](../../operations/server-configuration-parameters/settings.md#timezone)(可选)。[String](../data-types/string.md)。

**返回值**

- 毫秒精度的时间戳。如果 UUID 不是有效的版本 7 UUID,则返回 1970-01-01 00:00:00.000。[DateTime64(3)](../data-types/datetime64.md)。

**使用示例**

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

结果:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

结果:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```


## serverUUID {#serveruuid}

返回 ClickHouse 服务器首次启动时生成的随机 UUID。该 UUID 存储在 ClickHouse 服务器目录下的 `uuid` 文件中(例如 `/var/lib/clickhouse/`),并在服务器重启之间保持不变。

**语法**

```sql
serverUUID()
```

**返回值**

- 服务器的 UUID。[UUID](../data-types/uuid.md)。


## generateSnowflakeID {#generatesnowflakeid}

生成一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。
该函数保证在并发运行的线程和查询中的所有函数调用里,时间戳内的计数器字段单调递增。

有关实现细节,请参阅 ["Snowflake ID 生成"](#snowflake-id-generation) 部分。

**语法**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**参数**

- `expr` — 任意[表达式](/sql-reference/syntax#expressions),用于在查询中多次调用该函数时绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不影响返回的 Snowflake ID。可选参数。
- `machine_id` — 机器 ID,使用最低 10 位。类型为 [Int64](../data-types/int-uint.md)。可选参数。

**返回值**

返回 UInt64 类型的值。

**示例**

首先创建一个包含 UInt64 类型列的表,然后将生成的 Snowflake ID 插入表中。

```sql
CREATE TABLE tab (id UInt64) ENGINE = Memory;

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

结果:

```response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**每行生成多个 Snowflake ID 的示例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**使用表达式和机器 ID 的示例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge />

:::warning
此函数已弃用,仅在启用 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 设置时可用。
该函数将在未来某个时间点被移除。

请改用 [snowflakeIDToDateTime](#snowflakeidtodatetime) 函数。
:::

从 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中提取时间戳部分,并以 [DateTime](../data-types/datetime.md) 格式返回。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据时区解析 `time_string`。可选参数。[String](../data-types/string.md)。

**返回值**

- `value` 的时间戳部分,以 [DateTime](../data-types/datetime.md) 值返回。

**示例**

查询:

```sql
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

结果:

```response

┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeToDateTime64 {#snowflaketodatetime64}

<DeprecatedBadge />

:::warning
此函数已弃用,仅在启用 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 设置时可用。
该函数将在未来某个时间点被移除。

请改用函数 [snowflakeIDToDateTime64](#snowflakeidtodatetime64)。
:::

从 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中提取时间戳组件,并以 [DateTime64](../data-types/datetime64.md) 格式返回。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据时区解析 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

- `value` 的时间戳组件,以 [DateTime64](../data-types/datetime64.md) 格式返回,scale = 3,即毫秒精度。

**示例**

查询:

```sql
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

结果:

```response

┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```


## dateTimeToSnowflake {#datetimetosnowflake}

<DeprecatedBadge />

:::warning
此函数已弃用,仅在启用设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时可用。
该函数将在未来某个时间点被移除。

请改用函数 [dateTimeToSnowflakeID](#datetimetosnowflakeid)。
:::

将 [DateTime](../data-types/datetime.md) 值转换为指定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

- `value` — 日期时间。[DateTime](../data-types/datetime.md)。

**返回值**

- 输入值转换为 [Int64](../data-types/int-uint.md) 数据类型,表示该时间的第一个 Snowflake ID。

**示例**

查询:

```sql
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

结果:

```response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```


## dateTime64ToSnowflake {#datetime64tosnowflake}

<DeprecatedBadge />

:::warning
此函数已弃用,仅在启用设置 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时可用。
该函数将在未来某个时间点被移除。

请改用函数 [dateTime64ToSnowflakeID](#datetime64tosnowflakeid)。
:::

将 [DateTime64](../data-types/datetime64.md) 转换为指定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

- `value` — 日期时间。[DateTime64](../data-types/datetime64.md)。

**返回值**

- 输入值转换为 [Int64](../data-types/int-uint.md) 数据类型,表示该时间的第一个 Snowflake ID。

**示例**

查询:

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

结果:

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```


## snowflakeIDToDateTime {#snowflakeidtodatetime}

将 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分转换为 [DateTime](../data-types/datetime.md) 类型的值。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` — Snowflake ID 的纪元起始时间,以 1970-01-01 以来的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 纪元(2015-01-01),请使用 1288834974657。可选。[UInt\*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据指定时区解析 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

- `value` 的时间戳部分,返回类型为 [DateTime](../data-types/datetime.md)。

**示例**

查询:

```sql
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

结果:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeIDToDateTime64 {#snowflakeidtodatetime64}

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分,返回值类型为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` — Snowflake ID 的纪元起始时间,以自 1970-01-01 以来的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 纪元(2015-01-01),请使用 1288834974657。可选参数。[UInt\*](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据指定时区解析 `time_string`。可选参数。[String](../data-types/string.md)。

**返回值**

- `value` 的时间戳部分,返回类型为 [DateTime64](../data-types/datetime64.md),scale = 3,即毫秒精度。

**示例**

查询:

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

结果:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## dateTimeToSnowflakeID {#datetimetosnowflakeid}

将 [DateTime](../data-types/datetime.md) 值转换为指定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 日期时间。[DateTime](../data-types/datetime.md)。
- `epoch` - Snowflake ID 的纪元时间,以自 1970-01-01 起的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 纪元(2015-01-01),请使用 1288834974657。可选。[UInt\*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为 [UInt64](../data-types/int-uint.md) 类型,表示该时间的第一个 Snowflake ID。

**示例**

查询:

```sql
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

结果:

```response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```


## dateTime64ToSnowflakeID {#datetime64tosnowflakeid}

将 [DateTime64](../data-types/datetime64.md) 转换为指定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 日期时间。[DateTime64](../data-types/datetime64.md)。
- `epoch` — Snowflake ID 的纪元起始时间,以自 1970-01-01 起的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 纪元(2015-01-01),请使用 1288834974657。可选参数。[UInt\*](../data-types/int-uint.md)。

**返回值**

- 输入值转换为 [UInt64](../data-types/int-uint.md) 类型,表示该时间点的第一个 Snowflake ID。

**示例**

查询:

```sql
SELECT toDateTime('2021-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

结果:

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

## UUIDNumToString {#UUIDNumToString}

引入版本:v1.1

接受 UUID 的二进制表示,其格式可通过 `variant` 参数选择性指定(默认为 `Big-endian`),并返回包含 36 个字符的文本格式字符串。

**语法**

```sql
UUIDNumToString(binary[, variant])
```

**参数**

- `binary` — UUID 的二进制表示。[`FixedString(16)`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 规范中定义的变体。1 = `Big-endian`(默认),2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**返回值**

以字符串形式返回 UUID。[`String`](/sql-reference/data-types/string)

**示例**

**使用示例**

```sql title=查询
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

```response title=响应
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

**Microsoft 变体**

```sql title=查询
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

```response title=响应
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```


## UUIDStringToNum {#UUIDStringToNum}

引入版本:v1.1

接受一个包含 36 个字符的字符串,格式为 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,并返回一个 [FixedString(16)](../data-types/fixedstring.md) 作为其二进制表示形式,其格式可通过 `variant` 参数选择性指定(默认为 `Big-endian`)。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

- `string` — 包含 36 个字符的字符串或固定字符串 [`String`](/sql-reference/data-types/string) 或 [`FixedString(36)`](/sql-reference/data-types/fixedstring)
- `variant` — 由 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 规范指定的变体。1 = `Big-endian`(默认),2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**返回值**

返回 `string` 的二进制表示形式。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**示例**

**使用示例**

```sql title=查询
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

```response title=响应
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft 变体**

```sql title=查询
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

```response title=响应
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```


## UUIDToNum {#UUIDToNum}

引入版本：v24.5

接受一个 [UUID](../data-types/uuid.md) 并返回其二进制表示，类型为 [FixedString(16)](../data-types/fixedstring.md)，可通过 `variant` 参数指定格式（默认为 `Big-endian`）。
此函数替代了对两个独立函数 `UUIDStringToNum(toString(uuid))` 的调用，从 UUID 提取字节时无需进行 UUID 到字符串的中间转换。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

- `uuid` — UUID。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 规范中定义的变体。1 = `Big-endian`（默认），2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**返回值**

返回 UUID 的二进制表示。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**示例**

**使用示例**

```sql title=查询
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

```response title=响应
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft 变体**

```sql title=查询
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

```response title=响应
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```


## UUIDv7ToDateTime {#UUIDv7ToDateTime}

引入版本:v24.5

返回 UUID 版本 7 的时间戳部分。

**语法**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**参数**

- `uuid` — UUID 版本 7。[`String`](/sql-reference/data-types/string)
- `timezone` — 可选参数。返回值的[时区名称](../../operations/server-configuration-parameters/settings.md#timezone)。[`String`](/sql-reference/data-types/string)

**返回值**

返回毫秒精度的时间戳。如果 UUID 不是有效的版本 7 UUID,则返回 `1970-01-01 00:00:00.000`。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**示例**

**使用示例**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**指定时区**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```


## dateTime64ToSnowflake {#dateTime64ToSnowflake}

引入版本：v21.10

<DeprecatedBadge />

:::warning
此函数已弃用，仅在启用设置 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时才能使用。
该函数将在未来某个时间点被移除。

请改用函数 [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID)。
:::

将 [DateTime64](../data-types/datetime64.md) 转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

- `value` — 日期时间。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

返回输入值转换后的该时间第一个 Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=查询
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=响应
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```


## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

引入版本:v24.6

将 [`DateTime64`](../data-types/datetime64.md) 转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

有关实现细节,请参阅 ["Snowflake ID 生成"](#snowflake-id-generation) 部分。

**语法**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 日期时间。[`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — Snowflake ID 的纪元时间,以自 1970-01-01 以来的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 纪元时间(2015-01-01),请提供 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)

**返回值**

返回输入值对应时间的第一个 Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT toDateTime64('2025-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────────dt─┬─────────────────res─┐
│ 2025-08-15 18:57:56.493 │ 7362075066076495872 │
└─────────────────────────┴─────────────────────┘
```


## dateTimeToSnowflake {#dateTimeToSnowflake}

引入版本:v21.10

<DeprecatedBadge />

:::warning
此函数已弃用,仅在启用设置 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时可用。
该函数将在未来某个时间点被移除。

请改用函数 [dateTimeToSnowflakeID](#dateTimeToSnowflakeID)。
:::

将 [DateTime](../data-types/datetime.md) 值转换为给定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

- `value` — 日期时间。[`DateTime`](/sql-reference/data-types/datetime)

**返回值**

返回输入值对应时间的第一个 Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```


## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

引入版本:v24.6

将 [DateTime](../data-types/datetime.md) 值转换为指定时间的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**参数**

- `value` — 日期时间值。[`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — 可选参数。Snowflake ID 的纪元时间,以自 1970-01-01 起的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 纪元(2015-01-01),请使用 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)

**返回值**

返回指定时间对应的第一个 Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```


## dateTimeToUUIDv7 {#dateTimeToUUIDv7}

引入版本：v25.9

将 [DateTime](../data-types/datetime.md) 值转换为指定时间的 [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)。

有关 UUID 结构、计数器管理和并发保证的详细信息，请参阅 ["UUIDv7 生成"](#uuidv7-generation) 部分。

:::note
截至 2025 年 9 月，版本 7 UUID 处于草案状态，其布局未来可能会发生变化。
:::

**语法**

```sql
dateTimeToUUIDv7(value)
```

**参数**

- `value` — 日期时间。[`DateTime`](/sql-reference/data-types/datetime)

**返回值**

返回 UUIDv7。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**使用示例**

```sql title=查询
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=响应
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**同一时间戳生成多个 UUID**

```sql title=查询
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

```response title=响应
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
└──────────────────────────────────────┘
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
└──────────────────────────────────────┘
```


## generateSnowflakeID {#generateSnowflakeID}

引入版本:v24.6

生成 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

函数 `generateSnowflakeID` 保证在并发运行的线程和查询中,所有函数调用的时间戳内计数器字段单调递增。

实现细节请参阅 ["Snowflake ID 生成"](#snowflake-id-generation) 部分。

**语法**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**参数**

- `expr` — 任意[表达式](/sql-reference/syntax#expressions),用于在查询中多次调用该函数时绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。表达式的值不影响返回的 Snowflake ID。可选参数。 - `machine_id` — 机器 ID,使用最低 10 位。类型:[Int64](../data-types/int-uint.md)。可选参数。

**返回值**

返回 Snowflake ID。类型:[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=查询
CREATE TABLE tab (id UInt64)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

```response title=响应
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**每行生成多个 Snowflake ID**

```sql title=查询
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=响应
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**使用表达式和机器 ID**

```sql title=查询
SELECT generateSnowflakeID('expr', 1);
```

```response title=响应
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## generateUUIDv4 {#generateUUIDv4}

引入版本:v1.1

生成一个 [version 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

- `expr` — 可选参数。用于绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)的任意表达式,当函数在查询中被多次调用时使用。该表达式的值不影响返回的 UUID。

**返回值**

返回一个 UUIDv4 类型的值。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**使用示例**

```sql title=Query
SELECT generateUUIDv4(number) FROM numbers(3);
```

```response title=Response
┌─generateUUIDv4(number)───────────────┐
│ fcf19b77-a610-42c5-b3f5-a13c122f65b6 │
│ 07700d36-cb6b-4189-af1d-0972f23dc3bc │
│ 68838947-1583-48b0-b9b7-cf8268dd343d │
└──────────────────────────────────────┘
```

**公共子表达式消除**

```sql title=Query
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Response
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7 {#generateUUIDv7}

引入版本：v24.5

生成一个 [版本 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)。

有关 UUID 结构、计数器管理和并发保证的详细信息，请参阅 ["UUIDv7 生成"](#uuidv7-generation) 章节。

:::note
截至 2025 年 9 月，版本 7 UUID 仍处于草案状态，其布局在未来可能会发生变化。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

- `expr` — 可选。用于绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)的任意表达式，当函数在查询中被多次调用时使用。该表达式的值不影响返回的 UUID。[`Any`](/sql-reference/data-types)

**返回值**

返回一个 UUIDv7。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**使用示例**

```sql title=Query
SELECT generateUUIDv7(number) FROM numbers(3);
```

```response title=Response
┌─generateUUIDv7(number)───────────────┐
│ 019947fb-5766-7ed0-b021-d906f8f7cebb │
│ 019947fb-5766-7ed0-b021-d9072d0d1e07 │
│ 019947fb-5766-7ed0-b021-d908dca2cf63 │
└──────────────────────────────────────┘
```

**公共子表达式消除**

```sql title=Query
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Response
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## readWKTLineString {#readWKTLineString}

引入版本:v

解析 LineString 几何图形的 Well-Known Text (WKT) 表示,并以 ClickHouse 内部格式返回。

**语法**

```sql
readWKTLineString(wkt_string)
```

**参数**

- `wkt_string` — 表示 LineString 几何图形的输入 WKT 字符串。[`String`](/sql-reference/data-types/string)

**返回值**

该函数返回 LineString 几何图形的 ClickHouse 内部表示。

**示例**

**第一次调用**

```sql title=Query
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Response
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**第二次调用**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeIDToDateTime {#snowflakeIDToDateTime}

引入版本:v24.6

将 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分转换为 [DateTime](../data-types/datetime.md) 类型的值。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — 可选参数。Snowflake ID 的纪元起始时间,以自 1970-01-01 起的毫秒数表示。默认值为 0(1970-01-01)。若使用 Twitter/X 纪元(2015-01-01),请提供 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — 可选参数。[时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据指定时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**使用示例**

```sql title=Query
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeIDToDateTime64 {#snowflakeIDToDateTime64}

引入版本:v24.6

将 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分转换为 [DateTime64](../data-types/datetime64.md) 类型的值。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

- `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — 可选参数。Snowflake ID 的起始纪元时间,以自 1970-01-01 起的毫秒数表示。默认值为 0(1970-01-01)。对于 Twitter/X 的起始纪元时间(2015-01-01),请使用 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — 可选参数。[时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据指定时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分,类型为 `DateTime64`,scale = 3,即毫秒精度。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**使用示例**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeToDateTime {#snowflakeToDateTime}

引入版本:v21.10

<DeprecatedBadge />

:::warning
此函数已弃用,仅在启用 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 设置时可用。
该函数将在未来某个时间点被移除。

请改用 [`snowflakeIDToDateTime`](#snowflakeIDToDateTime) 函数。
:::

从 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中提取时间戳部分,并以 [DateTime](../data-types/datetime.md) 格式返回。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — 可选。[时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**使用示例**

```sql title=查询
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=响应
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeToDateTime64 {#snowflakeToDateTime64}

引入版本：v21.10

<DeprecatedBadge />

:::warning
此函数已弃用，仅在启用设置 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时可用。
该函数将在未来某个时间点被移除。

请改用函数 [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64)。
:::

以 [DateTime64](../data-types/datetime64.md) 格式提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

- `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — 可选。[时区](/operations/server-configuration-parameters/settings.md#timezone)。函数根据时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**示例**

**使用示例**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrDefault {#toUUIDOrDefault}

引入版本:v21.1

将字符串值转换为 UUID 类型。如果转换失败,则返回默认的 UUID 值,而不是抛出错误。

此函数尝试解析符合标准 UUID 格式(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)的 36 字符字符串。
如果字符串无法转换为有效的 UUID,函数将返回提供的默认 UUID 值。

**语法**

```sql
toUUIDOrDefault(string, default)
```

**参数**

- `string` — 要转换为 UUID 的 36 字符字符串或 FixedString(36)。
- `default` — 当第一个参数无法转换为 UUID 类型时返回的 UUID 值。

**返回值**

转换成功时返回转换后的 UUID,转换失败时返回默认 UUID。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**转换成功时返回解析后的 UUID**

```sql title=查询
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=响应
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**转换失败时返回默认 UUID**

```sql title=查询
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=响应
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull {#toUUIDOrNull}

引入版本:v20.12

将输入值转换为 `UUID` 类型的值,但在出错时返回 `NULL`。
类似于 [`toUUID`](#touuid),但在转换错误时返回 `NULL` 而不是抛出异常。

支持的参数:

- 标准格式的 UUID 字符串表示(8-4-4-4-12 十六进制数字)。
- 不带连字符的 UUID 字符串表示(32 个十六进制数字)。

不支持的参数(返回 `NULL`):

- 无效的字符串格式。
- 非字符串类型。
- 格式错误的 UUID。

**语法**

```sql
toUUIDOrNull(x)
```

**参数**

- `x` — UUID 的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回 UUID 值,否则返回 `NULL`。[`UUID`](/sql-reference/data-types/uuid) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=查询
SELECT
    toUUIDOrNull('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrNull('invalid-uuid') AS invalid_uuid
```

```response title=响应
┌─valid_uuid───────────────────────────┬─invalid_uuid─┐
│ 550e8400-e29b-41d4-a716-446655440000 │         ᴺᵁᴸᴸ │
└──────────────────────────────────────┴──────────────┘
```

<!--AUTOGENERATED_END-->
