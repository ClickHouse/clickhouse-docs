---
description: 'UUIDを扱うための関数のドキュメント'
sidebar_label: 'UUIDs'
sidebar_position: 205
slug: /sql-reference/functions/uuid-functions
title: 'UUIDを扱うための関数'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# UUIDを扱うための関数

## generateUUIDv4 {#generateuuidv4}

[バージョン4](https://tools.ietf.org/html/rfc4122#section-4.4)の[UUID](../data-types/uuid.md)を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼ばれる場合に[共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるUUIDには影響しません。省略可能。

**返される値**

UUIDv4型の値。

**例**

まず、UUID型のカラムを持つテーブルを作成し、次に生成されたUUIDv4をテーブルに挿入します。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv4();

SELECT * FROM tab;
```

結果:

```response
┌─────────────────────────────────uuid─┐
│ f4bf890f-f9dc-4332-ad5c-0c18e73f28e9 │
└──────────────────────────────────────┘
```

**複数のUUIDを行ごとに生成する例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

[バージョン7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)の[UUID](../data-types/uuid.md)を生成します。

生成されるUUIDは現在のUnixタイムスタンプをミリ秒単位で含み（48ビット）、続いてバージョン「7」（4ビット）、ミリ秒内のUUIDを区別するためのカウンタ（42ビット）、およびランダムフィールド（32ビット）を含みます。
任意の指定されたタイムスタンプ（unix_ts_ms）について、カウンタはランダムな値から始まり、タイムスタンプが変わるまで新しいUUIDごとに1ずつ増加します。
カウンタがオーバーフローした場合、タイムスタンプフィールドは1増加し、カウンタはランダムな新しい開始値にリセットされます。

関数`generateUUIDv7`は、並行して実行されるスレッドやクエリ内でのすべての関数呼び出しに対して、タイムスタンプ内のカウンタフィールドが単調に増加することを保証します。

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
2024年4月現在、バージョン7のUUIDはドラフト状態であり、そのレイアウトは今後変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼ばれる場合に[共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるUUIDには影響しません。省略可能。

**返される値**

UUIDv7型の値。

**例**

まず、UUID型のカラムを持つテーブルを作成し、次に生成されたUUIDv7をテーブルに挿入します。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv7();

SELECT * FROM tab;
```

結果:

```response
┌─────────────────────────────────uuid─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b │
└──────────────────────────────────────┘
```

**複数のUUIDを行ごとに生成する例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## empty {#empty}

入力UUIDが空かどうかをチェックします。

**構文**

```sql
empty(UUID)
```

UUIDは全てゼロ（ゼロUUID）を含む場合に空と見なされます。
この関数は[配列](/sql-reference/functions/array-functions#empty)や[文字列](string-functions.md#empty)にも対応しています。

**引数**

- `x` — UUID。[UUID](../data-types/uuid.md)。

**返される値**

- 空のUUIDの場合は`1`、非空のUUIDの場合は`0`を返します。[UInt8](../data-types/int-uint.md)。

**例**

UUID値を生成するために、ClickHouseは[generateUUIDv4](#generateuuidv4)関数を提供しています。

クエリ:

```sql
SELECT empty(generateUUIDv4());
```

結果:

```response
┌─empty(generateUUIDv4())─┐
│                       0 │
└─────────────────────────┘
```

## notEmpty {#notempty}

入力UUIDが非空かどうかをチェックします。

**構文**

```sql
notEmpty(UUID)
```

UUIDは全てゼロ（ゼロUUID）を含む場合に空と見なされます。
この関数は[配列](/sql-reference/functions/array-functions#notempty)や[文字列](string-functions.md#notempty)にも対応しています。

**引数**

- `x` — UUID。[UUID](../data-types/uuid.md)。

**返される値**

- 非空のUUIDの場合は`1`、空のUUIDの場合は`0`を返します。[UInt8](../data-types/int-uint.md)。

**例**

UUID値を生成するために、ClickHouseは[generateUUIDv4](#generateuuidv4)関数を提供しています。

クエリ:

```sql
SELECT notEmpty(generateUUIDv4());
```

結果:

```response
┌─notEmpty(generateUUIDv4())─┐
│                          1 │
└────────────────────────────┘
```

## toUUID {#touuid}

文字列型の値をUUIDに変換します。

```sql
toUUID(string)
```

**返される値**

UUID型の値。

**使用例**

```sql
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

結果:

```response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```

## toUUIDOrDefault {#touuidordefault}

**引数**

- `string` — 36文字の文字列またはFixedString(36)。 [String](../syntax.md#string)。
- `default` — 最初の引数をUUID型に変換できない場合に使用されるデフォルトのUUID。[UUID](../data-types/uuid.md)。

**返される値**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返される値**

UUID型の値。

**使用例**

この最初の例は、最初の引数がUUID型に変換できるため、UUID型として変換された値を返します。

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' as UUID));
```

結果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

この2番目の例は、最初の引数がUUID型に変換できないため、2番目の引数（提供されたデフォルトのUUID）を返します。

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' as UUID));
```

結果:

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#touuidornull}

文字列型の引数を取り、それをUUIDにパースしようとします。失敗した場合、NULLを返します。

```sql
toUUIDOrNull(string)
```

**返される値**

Nullable(UUID)型の値。

**使用例**

```sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

結果:

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```

## toUUIDOrZero {#touuidorzero}

文字列型の引数を取り、それをUUIDにパースしようとします。失敗した場合、ゼロUUIDを返します。

```sql
toUUIDOrZero(string)
```

**返される値**

UUID型の値。

**使用例**

```sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

結果:

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```

## UUIDStringToNum {#uuidstringtonum}

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`形式で36文字を含む`string`を受け入れ、バイナリ表現として[FixedString(16)](../data-types/fixedstring.md)を返します。形式は`variant`によってオプションで指定できます（デフォルトは`Big-endian`）。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

- `string` — 36文字の[String](/sql-reference/data-types/string)または[FixedString](/sql-reference/data-types/string)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

FixedString(16)

**使用例**

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

結果:

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

結果:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDNumToString {#uuidnumtostring}

バイナリ表現のUUIDを含む`binary`を受け入れ、その形式はオプションで`variant`（デフォルトは`Big-endian`）で指定できます。そしてテキスト形式の36文字を含む文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant = 1])
```

**引数**

- `binary` — UUIDのバイナリ表現としての[FixedString(16)](../data-types/fixedstring.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

文字列。

**使用例**

```sql
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

結果:

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

結果:

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

## UUIDToNum {#uuidtonum}

[UUID](../data-types/uuid.md)を受け入れ、そのバイナリ表現を[FixedString(16)](../data-types/fixedstring.md)として返します。形式はオプションで`variant`（デフォルトは`Big-endian`）で指定できます。この関数は、UUIDからバイトを抽出するためにUUIDStringToNum(toString(uuid))という2つの別々の関数を呼び出す代わりに使用されますので、UUIDから文字列への中間変換は必要ありません。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

UUIDのバイナリ表現。

**使用例**

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

結果:

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

結果:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDv7ToDateTime {#uuidv7todatetime}

バージョン7のUUIDのタイムスタンプコンポーネントを返します。

**構文**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

- `uuid` — バージョン7の[UUID](../data-types/uuid.md)。
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（省略可）。[String](../data-types/string.md)。

**返される値**

- ミリ秒精度のタイムスタンプ。UUIDが有効なバージョン7 UUIDでない場合、1970-01-01 00:00:00.000を返します。[DateTime64(3)](../data-types/datetime64.md)。

**使用例**

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

結果:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

結果:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## serverUUID {#serveruuid}

ClickHouseサーバの最初の起動時に生成されたランダムなUUIDを返します。このUUIDはClickHouseサーバディレクトリ内の`uuid`ファイル（例：`/var/lib/clickhouse/`）に保存され、サーバの再起動間で保持されます。

**構文**

```sql
serverUUID()
```

**返される値**

- サーバのUUID。[UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)を生成します。

生成されたSnowflake IDは現在のUnixタイムスタンプをミリ秒単位で含み（41 + 1の最高ビット）、続いてマシンID（10ビット）およびカウンタ（12ビット）が含まれ、ミリ秒内のIDを区別します。
任意の指定されたタイムスタンプ（unix_ts_ms）について、カウンタは0から始まり、タイムスタンプが変更されるまで新しいSnowflake IDごとに1ずつ増加します。
カウンタがオーバーフローした場合、タイムスタンプフィールドは1増加し、カウンタは0にリセットされます。

関数`generateSnowflakeID`は、並行して実行されるスレッドやクエリ内のすべての関数呼び出しでタイムスタンプ内のカウンタフィールドが単調に増加することを保証します。

:::note
生成されたSnowflake IDはUNIXエポック1970-01-01に基づいています。
Snowflake IDのエポックについて標準または推奨事項は存在しませんが、他のシステムの実装では異なるエポック（例：Twitter/X (2010-11-04) や Mastodon (2015-01-01)）を使用することがあります。
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

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

- `expr` — クエリ内で関数が複数回呼ばれる場合に[共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるSnowflake IDには影響しません。省略可能。
- `machine_id` — マシンID、下位10ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可能。

**返される値**

UInt64型の値。

**例**

まず、UInt64型のカラムを持つテーブルを作成し、次に生成されたSnowflake IDをテーブルに挿入します。

```sql
CREATE TABLE tab (id UInt64) ENGINE = Memory;

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

結果:

```response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**複数のSnowflake IDを行ごとに生成する例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシンIDによる例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
この関数は廃止予定であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効な場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)形式で抽出します。

**構文**

```sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は`time_string`をタイムゾーンに従って解析します。省略可。[String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントとしての[DateTime](../data-types/datetime.md)値。

**例**

クエリ:

```sql
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

結果:

```response

┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflaketodatetime64}

<DeprecatedBadge/>

:::warning
この関数は廃止予定であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効な場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime64](../data-types/datetime64.md)形式で抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は`time_string`をタイムゾーンに従って解析します。省略可。[String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントとしての[DateTime64](../data-types/datetime64.md)スケール= 3、つまりミリ秒精度。

**例**

クエリ:

```sql
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

結果:

```response

┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## dateTimeToSnowflake {#datetimetosnowflake}

<DeprecatedBadge/>

:::warning
この関数は廃止予定であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効な場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[DateTime](../data-types/datetime.md)値を指定された時間に最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

- `value` — 日付と時間。[DateTime](../data-types/datetime.md)。

**返される値**

- 入力値がその時間の最初のSnowflake IDに変換された[Int64](../data-types/int-uint.md)データ型。

**例**

クエリ:

```sql
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

結果:

```response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTime64ToSnowflake {#datetime64tosnowflake}

<DeprecatedBadge/>

:::warning
この関数は廃止予定であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効な場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[DateTime64](../data-types/datetime64.md)を指定された時間に最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

- `value` — 日付と時間。[DateTime64](../data-types/datetime64.md)。

**返される値**

- 入力値がその時間の最初のSnowflake IDに変換された[Int64](../data-types/int-uint.md)データ型。

**例**

クエリ:

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

結果:

```yaml
┌──────────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56.493 │ 6832626394434895872 │
└─────────────────────────┴─────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeidtodatetime}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は`time_string`をタイムゾーンに従って解析します。省略可。[String](../data-types/string.md)。

**返される値**

`value`のタイムスタンプコンポーネントとしての[DateTime](../data-types/datetime.md)値。

**例**

クエリ:

```sql
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

結果:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeIDToDateTime64 {#snowflakeidtodatetime64}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime64](../data-types/datetime64.md)型の値として返します。

**構文**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は`time_string`をタイムゾーンに従って解析します。省略可。[String](../data-types/string.md)。

**返される値**

`value`のタイムスタンプコンポーネントとしての[DateTime64](../data-types/datetime64.md)型の値、スケール= 3、すなわちミリ秒精度。

**例**

クエリ:

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

結果:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## dateTimeToSnowflakeID {#datetimetosnowflakeid}

[DateTime](../data-types/datetime.md)値を指定された時間に最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 日付と時間。[DateTime](../data-types/datetime.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**返される値**

入力値がその時間の最初のSnowflake IDに変換された[UInt64](../data-types/int-uint.md)型。

**例**

クエリ:

```sql
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

結果:

```response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTime64ToSnowflakeID {#datetime64tosnowflakeid}

[DateTime64](../data-types/datetime64.md)を指定された時間に最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 日付と時間。[DateTime64](../data-types/datetime64.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**返される値**

入力値がその時間の最初のSnowflake IDに変換された[UInt64](../data-types/int-uint.md)型。

**例**

クエリ:

```sql
SELECT toDateTime('2021-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

結果:

```yaml
┌──────────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56.493 │ 6832626394434895872 │
└─────────────────────────┴─────────────────────┘
```

## 関連項目 {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)
