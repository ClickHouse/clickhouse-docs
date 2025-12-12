---
description: '用于处理 UUID 的函数文档'
sidebar_label: 'UUID'
slug: /sql-reference/functions/uuid-functions
title: '用于处理 UUID 的函数'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# 用于处理 UUID 的函数 {#functions-for-working-with-uuids}

## UUIDv7 生成 {#uuidv7-generation}

生成的 UUID 包含一个以毫秒为单位的 Unix 48 位时间戳，随后是版本号 &quot;7&quot;（4 位）、用于区分同一毫秒内 UUID 的计数器（42 位，其中包括变体字段值为 &quot;2&quot; 的 2 位），以及一个随机字段（32 位）。
对于任意给定的时间戳（`unix_ts_ms`），计数器从一个随机值开始，对每个新的 UUID 加 1，直到时间戳发生变化为止。如果计数器溢出，则将时间戳字段加 1，并将计数器重置为新的随机起始值。
UUID 生成函数保证，在并发运行的线程和查询中，对于同一时间戳的所有函数调用，计数器字段都是单调递增的。

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

生成的 Snowflake ID 包含当前以毫秒为单位的 Unix 时间戳（41 位时间戳位 + 1 位最高为 0 的比特），随后是机器 ID（10 位）以及用于在同一毫秒内区分 ID 的计数器（12 位）。对于任意给定的时间戳（`unix_ts_ms`），计数器从 0 开始，每生成一个新的 Snowflake ID 就加 1，直到时间戳发生变化。如果计数器溢出，则将时间戳字段加 1，并将计数器重置为 0。

:::note
生成的 Snowflake ID 是基于 UNIX 纪元 1970-01-01 的。由于 Snowflake ID 的纪元没有统一的标准或推荐方案，不同系统中的实现可能会使用不同的纪元，例如 Twitter/X（2010-11-04）或 Mastodon（2015-01-01）。
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

生成[第 4 版](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

* `expr` — 任意[表达式](/sql-reference/syntax#expressions)，在查询中多次调用该函数时，用于绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。该表达式的取值不会影响返回的 UUID。可选。

**返回值**

UUIDv4 类型的值。

**示例**

首先，创建一个包含 UUID 类型列的表，然后向该表插入一个生成的 UUIDv4。

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

**示例：为每行生成多个 UUID**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

生成[版本 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) 的 [UUID](../data-types/uuid.md)。

有关 UUID 结构、计数器管理和并发保证的详细信息，详见 [&quot;UUIDv7 generation&quot;](#uuidv7-generation) 一节。

:::note
截至 2024 年 4 月，版本 7 的 UUID 仍处于草案状态，其布局未来可能会发生变化。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

* `expr` — 任意[表达式](/sql-reference/syntax#expressions)，在查询中多次调用该函数时，用于绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。该表达式的值不会影响返回的 UUID。可选。

**返回值**

类型为 UUIDv7 的值。

**示例**

首先，创建一个包含 UUID 类型列的表，然后将生成的 UUIDv7 插入到该表中。

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

**每行生成多个 UUID 的示例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

将给定时间的 [DateTime](../data-types/datetime.md) 值转换为 [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)。

有关 UUID 结构、计数器管理以及并发保证的详细信息，请参阅 [&quot;UUIDv7 generation&quot;](#uuidv7-generation) 部分。

:::note
截至 2024 年 4 月，UUID 第 7 版仍处于草案状态，其布局未来可能会发生变化。
:::

**语法**

```sql
dateTimeToUUIDv7(value)
```

**参数**

* `value` — 日期时间值。[DateTime](../data-types/datetime.md)。

**返回值**

UUIDv7 类型的值。

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

**针对同一时间戳的多个 UUID 示例**

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

该函数确保在以相同时间戳多次调用时，仍能生成唯一且单调递增的 UUID。

## empty {#empty}

检查输入的 UUID 是否为空值。

**语法**

```sql
empty(UUID)
```

如果一个 UUID 中所有位都是零（零 UUID），则被视为空。

该函数同样适用于数组和字符串。

**参数**

* `x` — 一个 UUID。参见 [UUID](../data-types/uuid.md)。

**返回值**

* 对空 UUID 返回 `1`，对非空 UUID 返回 `0`。参见 [UInt8](../data-types/int-uint.md)。

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

如果一个 UUID 的所有位都是零（零 UUID），则认为该 UUID 为空。

该函数同样适用于 `Array` 和 `String` 类型。

**参数**

* `x` — 一个 UUID。参见 [UUID](../data-types/uuid.md)。

**返回值**

* 非空 UUID 返回 `1`，空 UUID 返回 `0`。参见 [UInt8](../data-types/int-uint.md)。

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

将 String 类型的值转换为 UUID。

```sql
toUUID(string)
```

**返回值**

UUID 类型的值。

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

* `string` — 由 36 个字符组成的字符串，或 FixedString(36)。[String](../syntax.md#string)。
* `default` — 当第一个参数无法转换为 UUID 类型时使用的默认 UUID。[UUID](../data-types/uuid.md)。

**返回值**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返回值**

UUID 类型的值。

**使用示例**

第一个示例会在第一个参数可被转换时，将其转换为 UUID 类型并返回：

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

结果：

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

第二个示例返回第二个参数（提供的默认 UUID），因为第一个参数无法转换为 UUID 类型：

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

接收一个 String 类型的参数，并尝试将其解析为 UUID。若解析失败，则返回 NULL。

```sql
toUUIDOrNull(string)
```

**返回值**

`Nullable(UUID)` 类型的值。

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

它接受一个 `String` 类型的参数，并尝试将其解析为 UUID。若解析失败，则返回全零 UUID 值。

```sql
toUUIDOrZero(string)
```

**返回值**

UUID 类型的值。

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

接受一个包含 36 个字符、格式为 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 的 `string`，并返回一个以其二进制形式表示的 [FixedString(16)](../data-types/fixedstring.md)，其格式可以通过可选参数 `variant` 指定（默认使用 `Big-endian`）。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

* `string` — 长度为 36 个字符的 [String](/sql-reference/data-types/string) 或 [FixedString](/sql-reference/data-types/string)
* `variant` — 整数，用于表示 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 中定义的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

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

接受包含 UUID 二进制表示的 `binary`，其格式可以通过 `variant` 指定（默认为 `Big-endian`），并返回一个包含 36 个字符的文本格式字符串。

**语法**

```sql
UUIDNumToString(binary[, variant = 1])
```

**参数**

* `binary` — [FixedString(16)](../data-types/fixedstring.md)，表示 UUID 的二进制形式。
* `variant` — 整数类型，对应 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 中定义的变体。1 = `Big-endian`（默认），2 = `Microsoft`。

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

接受一个 [UUID](../data-types/uuid.md)，并返回其以 [FixedString(16)](../data-types/fixedstring.md) 表示的二进制形式，其格式可通过 `variant` 参数进行指定（默认为 `Big-endian`）。此函数用于替代对两个独立函数 `UUIDStringToNum(toString(uuid))` 的调用，因此在从 UUID 中提取字节时不再需要先将 UUID 中间转换为字符串。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

* `uuid` — [UUID](../data-types/uuid.md)。
* `variant` — 整型值，表示 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 中定义的变体类型。1 = `Big-endian`（默认），2 = `Microsoft`。

**返回值**

UUID 的二进制表示形式。

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

返回版本 7 UUID 的时间戳部分。

**语法**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**参数**

* `uuid` — 版本 7 的 [UUID](../data-types/uuid.md)。
* `timezone` — 返回值使用的[时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。[String](../data-types/string.md)。

**返回值**

* 毫秒精度的时间戳。如果 UUID 不是有效的版本 7 UUID，则返回 1970-01-01 00:00:00.000。[DateTime64(3)](../data-types/datetime64.md)。

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

返回在首次启动 ClickHouse 服务器时生成的随机 UUID。该 UUID 保存在 ClickHouse 服务器目录中的 `uuid` 文件中（例如 `/var/lib/clickhouse/`），并在服务器重启后仍会保留不变。

**语法**

```sql
serverUUID()
```

**返回值**

* 服务器的 UUID。[UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

生成一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。
此函数保证在并发运行的线程和查询中，所有函数调用的时间戳内计数字段都按单调递增顺序增长。

实现细节参见“[Snowflake ID generation](#snowflake-id-generation)”一节。

**语法**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**参数**

* `expr` — 任意[表达式](/sql-reference/syntax#expressions)，当在查询中多次调用该函数时，用于绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)优化。该表达式的取值不会影响返回的 Snowflake ID 值。可选。
* `machine_id` — 机器标识，仅使用其最低 10 位。[Int64](../data-types/int-uint.md)。可选。

**返回值**

类型为 UInt64 的值。

**示例**

首先，创建一个包含 UInt64 类型列的表，然后将生成的 Snowflake ID 插入到该表中。

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

**每行生成多个 Snowflake ID 的示例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**包含表达式和机器 ID 的示例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge />

:::warning
此函数已弃用，仅在启用了 [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 设置时才能使用。
该函数将在未来的某个时间点移除。

请改用函数 [snowflakeIDToDateTime](#snowflakeidtodatetime)。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中的时间戳部分，并以 [DateTime](../data-types/datetime.md) 格式返回。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

* `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析参数 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

* `value` 的时间戳部分，作为 [DateTime](../data-types/datetime.md) 类型的值返回。

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

<DeprecatedBadge />

:::warning
此函数已弃用，仅当启用了 [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 设置时才可使用。
该函数将在未来的某个时间被移除。

请改用函数 [snowflakeIDToDateTime64](#snowflakeidtodatetime64)。
:::

从 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中提取时间戳部分，并以 [DateTime64](../data-types/datetime64.md) 格式返回。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

* `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。可选参数。[String](../data-types/string.md)。

**返回值**

* `value` 的时间戳部分，类型为 [DateTime64](../data-types/datetime64.md)，scale = 3，即毫秒级精度。

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

<DeprecatedBadge />

:::warning
此函数已弃用，且只有在启用 [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 设置时才能使用。
该函数将在未来的某个时间被移除。

请改用函数 [dateTimeToSnowflakeID](#datetimetosnowflakeid)。
:::

将一个 [DateTime](../data-types/datetime.md) 值转换为对应时间点的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

* `value` — 日期时间。[DateTime](../data-types/datetime.md)。

**返回值**

* 输入值被转换为 [Int64](../data-types/int-uint.md) 数据类型，对应于该时间点的第一个 Snowflake ID。

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

<DeprecatedBadge />

:::warning
此函数已弃用，仅当启用了设置 [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时才能使用。
该函数将在未来的某个时间被移除。

请改用函数 [dateTime64ToSnowflakeID](#datetime64tosnowflakeid)。
:::

将 [DateTime64](../data-types/datetime64.md) 转换为给定时间点对应的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

* `value` — 日期时间值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将输入值转换为 [Int64](../data-types/int-uint.md) 数据类型，作为该时刻的第一个 Snowflake ID。

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

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分，并以 [DateTime](../data-types/datetime.md) 类型的值表示。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

* `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
* `epoch` - Snowflake ID 的纪元（epoch），以自 1970-01-01 起的毫秒数表示。默认为 0（1970-01-01）。对于 Twitter/X 纪元（2015-01-01），请使用 1288834974657。可选。[UInt*](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

* `value` 的时间戳部分，类型为 [DateTime](../data-types/datetime.md) 值。

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

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分，并以 [DateTime64](../data-types/datetime64.md) 类型的值表示。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

* `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
* `epoch` — Snowflake ID 的纪元（epoch），自 1970-01-01 起以毫秒为单位。默认为 0（1970-01-01）。对于 Twitter/X 的纪元（2015-01-01），请提供 1288834974657。可选。[UInt*](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

* `value` 的时间戳部分，类型为 [DateTime64](../data-types/datetime64.md)，scale = 3，即毫秒级精度。

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

将一个 [DateTime](../data-types/datetime.md) 值转换为给定时间点对应的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**参数**

* `value` — 日期时间值。[DateTime](../data-types/datetime.md)。
* `epoch` - Snowflake ID 所使用的纪元时间（自 1970-01-01 起的毫秒数）。默认为 0（1970-01-01）。对于 Twitter/X 的纪元（2015-01-01），使用 1288834974657。可选。[UInt*](../data-types/int-uint.md)。

**返回值**

* 将输入值转换为对应时间点的第一个 Snowflake ID，类型为 [UInt64](../data-types/int-uint.md)。

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

将 [DateTime64](../data-types/datetime64.md) 转换为给定时间点对应的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**参数**

* `value` — 日期时间值。[DateTime64](../data-types/datetime64.md)。
* `epoch` - Snowflake ID 的纪元时间，单位为自 1970-01-01 起的毫秒数。默认为 0（1970-01-01）。对于 Twitter/X 纪元（2015-01-01），请输入 1288834974657。可选。[UInt*](../data-types/int-uint.md)。

**返回值**

* 将输入值转换为 [UInt64](../data-types/int-uint.md)，表示在该时间点上的第一个 Snowflake ID。

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

* [dictGetUUID](/sql-reference/functions/ext-dict-functions#dictGetUUID)

{/*
  以下标签内的内容会在文档框架构建时
  被 system.functions 生成的文档替换。请不要修改或移除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## UUIDNumToString {#UUIDNumToString}

引入于：v1.1

接受 UUID 的二进制表示形式，其格式可通过可选参数 `variant` 指定（默认为 `Big-endian`），并返回一个包含 36 个字符的文本格式字符串。

**语法**

```sql
UUIDNumToString(binary[, variant])
```

**参数**

* `binary` — UUID 的二进制表示。[`FixedString(16)`](/sql-reference/data-types/fixedstring)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 中定义的变体。1 = `Big-endian`（默认），2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**返回值**

返回 UUID 的字符串表示。[`String`](/sql-reference/data-types/string)

**示例**

**用法示例**

```sql title=Query
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

```response title=Response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

**Microsoft variant**

```sql title=Query
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

```response title=Response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```



## UUIDStringToNum {#UUIDStringToNum}

Introduced in: v1.1


Accepts a string containing 36 characters in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, and returns a [FixedString(16)](../data-types/fixedstring.md) as its binary representation, with its format optionally specified by `variant` (`Big-endian` by default).
    

**Syntax**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Arguments**

- `string` — A string or fixed-string of 36 characters) [`String`](/sql-reference/data-types/string) or [`FixedString(36)`](/sql-reference/data-types/fixedstring)
- `variant` — Variant as specified by [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (default), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the binary representation of `string`. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**Examples**

**Usage example**

```sql title=Query
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft variant**

```sql title=Query
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```



## UUIDToNum {#UUIDToNum}

Introduced in: v24.5


Accepts a [UUID](../data-types/uuid.md) and returns its binary representation as a [FixedString(16)](../data-types/fixedstring.md), with its format optionally specified by `variant` (`Big-endian` by default).
This function replaces calls to two separate functions `UUIDStringToNum(toString(uuid))` so no intermediate conversion from UUID to string is required to extract bytes from a UUID.
    

**Syntax**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Arguments**

- `uuid` — UUID. [`String`](/sql-reference/data-types/string) or [`FixedString`](/sql-reference/data-types/fixedstring)
- `variant` — Variant as specified by [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (default), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns a binary representation of the UUID. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**Examples**

**Usage example**

```sql title=Query
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft variant**

```sql title=Query
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```



## UUIDv7ToDateTime {#UUIDv7ToDateTime}

Introduced in: v24.5


Returns the timestamp component of a UUID version 7.
    

**Syntax**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Arguments**

- `uuid` — A UUID version 7. [`String`](/sql-reference/data-types/string)
- `timezone` — Optional. [Timezone name](../../operations/server-configuration-parameters/settings.md#timezone) for the returned value. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns a timestamp with milliseconds precision. If the UUID is not a valid version 7 UUID, it returns `1970-01-01 00:00:00.000`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Examples**

**Usage example**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**With timezone**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```



## dateTime64ToSnowflake {#dateTime64ToSnowflake}

Introduced in: v21.10


<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID) instead.
:::

Converts a [DateTime64](../data-types/datetime64.md) to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.
    

**Syntax**

```sql
dateTime64ToSnowflake(value)
```

**Arguments**

- `value` — Date with time. [`DateTime64`](/sql-reference/data-types/datetime64)


**Returned value**

Returns the input value converted as the first Snowflake ID at that time. [`Int64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=Response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```



## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

Introduced in: v24.6


Converts a [`DateTime64`](../data-types/datetime64.md) to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.

See section ["Snowflake ID generation"](#snowflake-id-generation) for implementation details.
    

**Syntax**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime) or [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the input value as the first Snowflake ID at that time. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT toDateTime64('2025-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────────dt─┬─────────────────res─┐
│ 2025-08-15 18:57:56.493 │ 7362075066076495872 │
└─────────────────────────┴─────────────────────┘
```



## dateTimeToSnowflake {#dateTimeToSnowflake}

Introduced in: v21.10



<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [dateTimeToSnowflakeID](#dateTimeToSnowflakeID) instead.
:::

Converts a [DateTime](../data-types/datetime.md) value to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.
    

**Syntax**

```sql
dateTimeToSnowflake(value)
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime)


**Returned value**

Returns the input value as the first Snowflake ID at that time. [`Int64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```



## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

Introduced in: v24.6


Converts a [DateTime](../data-types/datetime.md) value to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.
    

**Syntax**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime) or [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — Optional. Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the input value as the first Snowflake ID at that time. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```



## dateTimeToUUIDv7 {#dateTimeToUUIDv7}

Introduced in: v25.9


Converts a [DateTime](../data-types/datetime.md) value to a [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) at the given time.

See section ["UUIDv7 generation"](#uuidv7-generation) for details on UUID structure, counter management, and concurrency guarantees.

:::note
As of September 2025, version 7 UUIDs are in draft status and their layout may change in future.
:::
    

**Syntax**

```sql
dateTimeToUUIDv7(value)
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime)


**Returned value**

Returns a UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Usage example**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**multiple UUIDs for the same timestamp**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

```response title=Response
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
└──────────────────────────────────────┘
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
└──────────────────────────────────────┘
```



## generateSnowflakeID {#generateSnowflakeID}

Introduced in: v24.6


Generates a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).

Function `generateSnowflakeID` guarantees that the counter field within a timestamp increments monotonically across all function invocations in concurrently running threads and queries.

See section ["Snowflake ID generation"](#snowflake-id-generation) for implementation details.
    

**Syntax**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Arguments**

- `expr` — An arbitrary [expression](/sql-reference/syntax#expressions) used to bypass [common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination) if the function is called multiple times in a query. The value of the expression has no effect on the returned Snowflake ID. Optional. - `machine_id` — A machine ID, the lowest 10 bits are used. [Int64](../data-types/int-uint.md). Optional. 

**Returned value**

Returns the Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
CREATE TABLE tab (id UInt64)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

```response title=Response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**Multiple Snowflake IDs generated per row**

```sql title=Query
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=Response
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**With expression and a machine ID**

```sql title=Query
SELECT generateSnowflakeID('expr', 1);
```

```response title=Response
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```



## generateUUIDv4 {#generateUUIDv4}

Introduced in: v1.1

Generates a [version 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md).

**Syntax**

```sql
generateUUIDv4([expr])
```

**Arguments**

- `expr` — Optional. An arbitrary expression used to bypass [common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination) if the function is called multiple times in a query. The value of the expression has no effect on the returned UUID. 

**Returned value**

Returns a UUIDv4. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Usage example**

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

**Common subexpression elimination**

```sql title=Query
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Response
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```



## generateUUIDv7 {#generateUUIDv7}

Introduced in: v24.5


Generates a [version 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md).

See section ["UUIDv7 generation"](#uuidv7-generation) for details on UUID structure, counter management, and concurrency guarantees.

:::note
As of September 2025, version 7 UUIDs are in draft status and their layout may change in future.
:::
    

**Syntax**

```sql
generateUUIDv7([expr])
```

**Arguments**

- `expr` — Optional. An arbitrary expression used to bypass [common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination) if the function is called multiple times in a query. The value of the expression has no effect on the returned UUID. [`Any`](/sql-reference/data-types)


**Returned value**

Returns a UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Usage example**

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

**Common subexpression elimination**

```sql title=Query
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Response
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```



## readWKTLineString {#readWKTLineString}

Introduced in: v


Parses a Well-Known Text (WKT) representation of a LineString geometry and returns it in the internal ClickHouse format.


**Syntax**

```sql
readWKTLineString(wkt_string)
```

**Arguments**

- `wkt_string` — The input WKT string representing a LineString geometry. [`String`](/sql-reference/data-types/string)


**Returned value**

The function returns a ClickHouse internal representation of the linestring geometry.

**Examples**

**first call**

```sql title=Query
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Response
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**second call**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```



## snowflakeIDToDateTime {#snowflakeIDToDateTime}

Introduced in: v24.6


Returns the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) as a value of type [DateTime](../data-types/datetime.md).
    

**Syntax**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Arguments**

- `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — Optional. Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value`. [`DateTime`](/sql-reference/data-types/datetime)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```



## snowflakeIDToDateTime64 {#snowflakeIDToDateTime64}

Introduced in: v24.6


Returns the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) as a value of type [DateTime64](../data-types/datetime64.md).
    

**Syntax**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Arguments**

- `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — Optional. Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value` as a `DateTime64` with scale = 3, i.e. millisecond precision. [`DateTime64`](/sql-reference/data-types/datetime64)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```



## snowflakeToDateTime {#snowflakeToDateTime}

Introduced in: v21.10


<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [`snowflakeIDToDateTime`](#snowflakeIDToDateTime) instead.
:::

Extracts the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) in [DateTime](../data-types/datetime.md) format.
    

**Syntax**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Arguments**

- `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value`. [`DateTime`](/sql-reference/data-types/datetime)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```



## snowflakeToDateTime64 {#snowflakeToDateTime64}

Introduced in: v21.10


<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64) instead.
:::

Extracts the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) in [DateTime64](../data-types/datetime64.md) format.

    

**Syntax**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Arguments**

- `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```



## toUUIDOrDefault {#toUUIDOrDefault}

Introduced in: v21.1


Converts a String value to UUID type. If the conversion fails, returns a default UUID value instead of throwing an error.

This function attempts to parse a string of 36 characters in the standard UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
If the string cannot be converted to a valid UUID, the function returns the provided default UUID value.
    

**Syntax**

```sql
toUUIDOrDefault(string, default)
```

**Arguments**

- `string` — String of 36 characters or FixedString(36) to be converted to UUID. - `default` — UUID value to be returned if the first argument cannot be converted to UUID type. 

**Returned value**

Returns the converted UUID if successful, or the default UUID if conversion fails. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Successful conversion returns the parsed UUID**

```sql title=Query
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Failed conversion returns the default UUID**

```sql title=Query
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```



## toUUIDOrNull {#toUUIDOrNull}

Introduced in: v20.12


Converts an input value to a value of type `UUID` but returns `NULL` in case of an error.
Like [`toUUID`](#touuid) but returns `NULL` instead of throwing an exception on conversion errors.

Supported arguments:
- String representations of UUID in standard format (8-4-4-4-12 hexadecimal digits).
- String representations of UUID without hyphens (32 hexadecimal digits).

Unsupported arguments (return `NULL`):
- Invalid string formats.
- Non-string types.
- Malformed UUIDs.
    

**Syntax**

```sql
toUUIDOrNull(x)
```

**Arguments**

- `x` — A string representation of a UUID. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns a UUID value if successful, otherwise `NULL`. [`UUID`](/sql-reference/data-types/uuid) or [`NULL`](/sql-reference/syntax#null)

**Examples**

**Usage examples**

```sql title=Query
SELECT
    toUUIDOrNull('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrNull('invalid-uuid') AS invalid_uuid
```

```response title=Response
┌─valid_uuid───────────────────────────┬─invalid_uuid─┐
│ 550e8400-e29b-41d4-a716-446655440000 │         ᴺᵁᴸᴸ │
└──────────────────────────────────────┴──────────────┘
```

{/*AUTOGENERATED_END*/ }
