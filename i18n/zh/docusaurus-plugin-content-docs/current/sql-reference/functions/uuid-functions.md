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

**Microsoft 版本**

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

自 v1.1 起提供

接受一个包含 36 个字符且格式为 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 的字符串，并返回其二进制表示形式的 [FixedString(16)](../data-types/fixedstring.md)，其格式可以通过 `variant` 参数进行可选指定（默认使用 `Big-endian`）。

**语法**

```sql
UUIDStringToNum(string[, variant = 1])
```

**参数**

* `string` — 由 36 个字符组成的字符串或定长字符串 [`String`](/sql-reference/data-types/string) 或 [`FixedString(36)`](/sql-reference/data-types/fixedstring)
* `variant` — 按 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 定义的 Variant。1 = `Big-endian`（默认），2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**返回值**

返回 `string` 的二进制表示形式。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**示例**

**使用示例**

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

**Microsoft 变体**

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

引入版本：v24.5

接受一个 [UUID](../data-types/uuid.md)，并返回其二进制表示形式，类型为 [FixedString(16)](../data-types/fixedstring.md)，其格式可以通过可选参数 `variant` 指定（默认是 `Big-endian`）。
此函数取代了对两个独立函数 `UUIDStringToNum(toString(uuid))` 的组合调用，因此在从 UUID 中提取字节时，无需先将 UUID 中间转换为字符串。

**语法**

```sql
UUIDToNum(uuid[, variant = 1])
```

**参数**

* `uuid` — UUID。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)
* `variant` — 按照 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) 定义的变体（Variant）。1 = `Big-endian`（默认），2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**返回值**

返回 UUID 的二进制表示形式。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**示例**

**用法示例**

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

**Microsoft 版本**

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

引入于：v24.5

返回 UUID 第 7 版的时间戳部分。

**语法**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**参数**

* `uuid` — 版本 7 的 UUID。[`String`](/sql-reference/data-types/string)
* `timezone` — 可选。用于返回值的[时区名称](../../operations/server-configuration-parameters/settings.md#timezone)。[`String`](/sql-reference/data-types/string)

**返回值**

返回一个具有毫秒级精度的时间戳。如果 UUID 不是有效的版本 7 UUID，则返回 `1970-01-01 00:00:00.000`。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**含时区**

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
该函数已弃用，且只有在启用 SETTING [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时才能使用。
该函数将在未来的某个时间点被移除。

请改用函数 [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID)。
:::

将 [DateTime64](../data-types/datetime64.md) 在给定时间点转换为第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTime64ToSnowflake(value)
```

**参数**

* `value` — 日期时间值。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

返回将输入值转换为该时间点对应的第一个 Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=Response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

自 v24.6 版本引入

将 [`DateTime64`](../data-types/datetime64.md) 转换为给定时间点的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

有关实现细节，请参阅“[Snowflake ID generation](#snowflake-id-generation)”一节。

**语法**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**参数**

* `value` — 带时间的日期。[`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64)
* `epoch` — Snowflake ID 的纪元时间，从 1970-01-01 起按毫秒计。默认值为 0（1970-01-01）。对于 Twitter/X 的纪元时间（2015-01-01），请提供 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)

**返回值**

返回该时间点对应的第一个 Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)

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

引入版本：v21.10

<DeprecatedBadge />

:::warning
此函数已弃用，仅当启用了 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 该 SETTING 时才可使用。
该函数将在未来的某个时间点被移除。

请改用函数 [dateTimeToSnowflakeID](#dateTimeToSnowflakeID)。
:::

将一个 [DateTime](../data-types/datetime.md) 值转换为指定时间点对应的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflake(value)
```

**参数**

* `value` — 日期时间值。[`DateTime`](/sql-reference/data-types/datetime)

**返回值**

返回输入值在该时间点对应的第一个 Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)

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

自 v24.6 引入

将一个 [DateTime](../data-types/datetime.md) 值转换为该时间点对应的第一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

**语法**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**参数**

* `value` — 带时间的日期。[`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64)
* `epoch` — 可选。Snowflake ID 的纪元时间（毫秒），自 1970-01-01 起算。默认值为 0（1970-01-01）。对于 Twitter/X 的纪元时间（2015-01-01），请使用 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)

**返回值**

将输入时间转换为该时间点的第一个 Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)

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

将给定时间点的 [DateTime](../data-types/datetime.md) 值转换为 [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)。

有关 UUID 结构、计数器管理以及并发保证的详细信息，请参阅 [&quot;UUIDv7 generation&quot;](#uuidv7-generation) 一节。

:::note
截至 2025 年 9 月，UUID 版本 7 仍处于草案阶段，其格式在未来可能会发生变化。
:::

**语法**

```sql
dateTimeToUUIDv7(value)
```

**参数**

* `value` — 日期时间值。[`DateTime`](/sql-reference/data-types/datetime)

**返回值**

返回一个 UUIDv7。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**用法示例**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**同一时间戳对应多个 UUID**

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

引入版本：v24.6

生成一个 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)。

函数 `generateSnowflakeID` 保证在并发运行的线程和查询中，同一时间戳内的计数字段在所有函数调用之间单调递增。

有关实现细节，请参阅 [&quot;Snowflake ID generation&quot;](#snowflake-id-generation) 一节。

**语法**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**参数**

* `expr` — 任意[expression](/sql-reference/syntax#expressions)，在单个查询中多次调用该函数时，用于绕过[common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination)。该表达式的值不会影响返回的 Snowflake ID。可选。
* `machine_id` — 机器 ID，会使用其最低的 10 位。[Int64](../data-types/int-uint.md)。可选。

**返回值**

返回 Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

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

**为每行生成多个 Snowflake ID**

```sql title=Query
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=Response
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**结合表达式和机器 ID**

```sql title=Query
SELECT generateSnowflakeID('expr', 1);
```

```response title=Response
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## generateUUIDv4 {#generateUUIDv4}

自 v1.1 起引入

生成一个 [版本 4](https://tools.ietf.org/html/rfc4122#section-4.4) 的 [UUID](../data-types/uuid.md)。

**语法**

```sql
generateUUIDv4([expr])
```

**参数**

* `expr` — 可选。任意表达式，用于在函数在同一查询中被多次调用时绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。该表达式的值不会影响返回的 UUID。

**返回值**

返回 UUIDv4。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**用法示例**

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

引入于：v24.5

生成一个 [版本 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) 的 [UUID](../data-types/uuid.md)。

关于 UUID 结构、计数器管理以及并发保证的详细信息，参见 [&quot;UUIDv7 generation&quot;](#uuidv7-generation) 一节。

:::note
截至 2025 年 9 月，版本 7 UUID 仍处于草案状态，其格式和布局在未来可能会发生变化。
:::

**语法**

```sql
generateUUIDv7([expr])
```

**参数**

* `expr` — 可选。任意表达式，用于在函数在单个查询中被多次调用时绕过[公共子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)。该表达式的值不会影响返回的 UUID。[`Any`](/sql-reference/data-types)

**返回值**

返回一个 UUIDv7。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**用法示例**

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

自 v 版本引入

解析 LineString 几何体的 Well-Known Text（WKT）表示，并以 ClickHouse 的内部格式返回。

**语法**

```sql
readWKTLineString(wkt_string)
```

**参数**

* `wkt_string` — 表示 LineString 几何对象的输入 WKT 字符串。[`String`](/sql-reference/data-types/string)

**返回值**

该函数返回 ClickHouse 对 LineString 几何对象的内部表示形式。

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

自 v24.6 引入

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中的时间戳部分，类型为 [DateTime](../data-types/datetime.md)。

**语法**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**参数**

* `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
* `epoch` — 可选。Snowflake ID 的纪元（自 1970-01-01 起的毫秒数）。默认值为 0（1970-01-01）。对于 Twitter/X 的纪元（2015-01-01），请使用 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。[时区](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

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

自 v24.6 版本引入

返回 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 的时间戳部分，类型为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**参数**

* `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
* `epoch` — 可选。Snowflake ID 的纪元（自 1970-01-01 起的毫秒数）。默认值为 0（1970-01-01）。对于 Twitter/X 的纪元（2015-01-01），请使用 1288834974657。[`UInt*`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分，类型为 `DateTime64`，scale = 3，即毫秒级精度。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeToDateTime {#snowflakeToDateTime}

引入版本：v21.10

<DeprecatedBadge />

:::warning
此函数已弃用，仅当启用了设置项 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时才可使用。
该函数将在未来的某个版本中移除。

请改用函数 [`snowflakeIDToDateTime`](#snowflakeIDToDateTime)。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中的时间戳部分，并以 [DateTime](../data-types/datetime.md) 格式返回。

**语法**

```sql
snowflakeToDateTime(value[, time_zone])
```

**参数**

* `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选参数。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会按照该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**使用示例**

```sql title=Query
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflakeToDateTime64}

引入版本：v21.10

<DeprecatedBadge />

:::warning
该函数已弃用，仅当启用设置项 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 时才能使用。
该函数将在未来的某个版本中移除。

请改用函数 [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64)。
:::

提取 [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) 中的时间戳部分，并以 [DateTime64](../data-types/datetime64.md) 格式返回。

**语法**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**参数**

* `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据 `time_zone` 指定的时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `value` 的时间戳部分。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrDefault {#toUUIDOrDefault}

引入自：v21.1

将 String 值转换为 UUID 类型。如果转换失败，则返回默认 UUID 值，而不会抛出错误。

该函数会尝试将长度为 36 的字符串解析为标准 UUID 格式（xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）。
如果该字符串无法转换为有效 UUID，函数将返回提供的默认 UUID 值。

**语法**

```sql
toUUIDOrDefault(string, default)
```

**参数**

* `string` — 将要转换为 UUID 的 36 个字符的字符串或 FixedString(36)。
* `default` — 当第一个参数无法转换为 UUID 类型时返回的 UUID 值。

**返回值**

转换成功时返回转换后的 UUID，转换失败时返回默认 UUID。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**转换成功时返回解析得到的 UUID**

```sql title=Query
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**转换失败时会返回默认 UUID**

```sql title=Query
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#toUUIDOrNull}

自 v20.12 引入

将输入值转换为 `UUID` 类型的值，但在发生错误时返回 `NULL`。
类似于 [`toUUID`](/sql-reference/functions/uuid-functions#touuid)，但在转换出错时返回 `NULL`，而不是抛出异常。

支持的参数：

* 标准格式的 UUID 字符串表示（8-4-4-4-12 个十六进制数字）。
* 去掉连字符的 UUID 字符串表示（32 个十六进制数字）。

不支持的参数（返回 `NULL`）：

* 无效的字符串格式。
* 非字符串类型。
* 格式错误的 UUID。

**语法**

```sql
toUUIDOrNull(x)
```

**参数**

* `x` — UUID 的字符串形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回 UUID 值，否则返回 `NULL`。[`UUID`](/sql-reference/data-types/uuid) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

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
