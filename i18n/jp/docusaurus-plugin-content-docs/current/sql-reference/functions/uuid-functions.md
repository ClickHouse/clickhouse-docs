---
slug: '/sql-reference/functions/uuid-functions'
sidebar_position: 205
sidebar_label: 'UUIDs'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# UUIDsを扱う関数

## generateUUIDv4 {#generateuuidv4}

[バージョン4](https://tools.ietf.org/html/rfc4122#section-4.4)の[UUID](../data-types/uuid.md)を生成します。

**構文**

``` sql
generateUUIDv4([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼ばれた場合に[共通部分式の排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は返されるUUIDに影響を与えません。省略可能。

**返される値**

UUIDv4型の値。

**例**

まず、UUID型のカラムを持つテーブルを作成し、次に生成されたUUIDv4をテーブルに挿入します。

``` sql
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

**行ごとに複数のUUIDが生成される例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

[バージョン7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)の[UUID](../data-types/uuid.md)を生成します。

生成されたUUIDは、現在のUnixタイムスタンプをミリ秒（48ビット）で含み、次にバージョン「7」（4ビット）、ミリ秒内のUUIDを区別するためのカウンタ（42ビット）（バリアントフィールド「2」を含む、2ビット）およびランダムフィールド（32ビット）が続きます。
任意の理想的なタイムスタンプ（unix_ts_ms）について、カウンタはランダムな値から始まり、新しいUUIDごとに1ずつ増加します。タイムスタンプが変更されるまで。
カウンタがオーバーフローした場合、タイムスタンプフィールドが1増加し、カウンタはランダムな新しい開始値にリセットされます。

関数`generateUUIDv7`は、タイムスタンプ内のカウンタフィールドがすべての関数呼び出しで単調増加することを保証します。

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
2024年4月現在、バージョン7のUUIDはドラフト状態であり、将来的にレイアウトが変更される可能성이あることに注意してください。
:::

**構文**

``` sql
generateUUIDv7([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼ばれた場合に[共通部分式の排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は返されるUUIDに影響を与えません。省略可能。

**返される値**

UUIDv7型の値。

**例**

まず、UUID型のカラムを持つテーブルを作成し、次に生成されたUUIDv7をテーブルに挿入します。

``` sql
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

**行ごとに複数のUUIDが生成される例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## empty {#empty}

入力UUIDが空かどうかを確認します。

**構文**

```sql
empty(UUID)
```

UUIDがすべてゼロ（ゼロUUID）を含む場合、それは空と見なされます。

この関数は、[配列](/sql-reference/functions/array-functions#empty)や[文字列](string-functions.md#empty)にも機能します。

**引数**

- `x` — UUID。[UUID](../data-types/uuid.md)。

**返される値**

- 空のUUIDには`1`を、空でないUUIDには`0`を返します。[UInt8](../data-types/int-uint.md)。

**例**

UUID値を生成するために、ClickHouseは[generateUUIDv4](#generateuuidv4)関数を提供します。

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

入力UUIDが空でないかどうかを確認します。

**構文**

```sql
notEmpty(UUID)
```

UUIDがすべてゼロ（ゼロUUID）を含む場合、それは空と見なされます。

この関数は、[配列](/sql-reference/functions/array-functions#notempty)や[文字列](string-functions.md#notempty)にも機能します。

**引数**

- `x` — UUID。[UUID](../data-types/uuid.md)。

**返される値**

- 空でないUUIDには`1`を、空のUUIDには`0`を返します。[UInt8](../data-types/int-uint.md)。

**例**

UUID値を生成するために、ClickHouseは[generateUUIDv4](#generateuuidv4)関数を提供します。

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

String型の値をUUIDに変換します。

``` sql
toUUID(string)
```

**返される値**

UUID型の値。

**使用例**

``` sql
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

- `string` — 36文字の文字列またはFixedString(36)。[String](../syntax.md#string)。
- `default` — 最初の引数がUUID型に変換できない場合にデフォルトとして使用されるUUID。[UUID](../data-types/uuid.md)。

**返される値**

UUID

``` sql
toUUIDOrDefault(string, default)
```

**返される値**

UUID型の値。

**使用例**

この最初の例では、変換できる最初の引数をUUID型に変換します。

``` sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' as UUID));
```

結果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

この第2の例では、最初の引数がUUID型に変換できないため、提供されたデフォルトUUID（第2引数）が返されます。

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

String型の引数を受け取り、UUIDにパースを試みます。失敗した場合はNULLを返します。

``` sql
toUUIDOrNull(string)
```

**返される値**

Nullable(UUID)型の値。

**使用例**

``` sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

結果:

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```

## toUUIDOrZero {#touuidorzero}

String型の引数を受け取り、UUIDにパースを試みます。失敗した場合はゼロUUIDを返します。

``` sql
toUUIDOrZero(string)
```

**返される値**

UUID型の値。

**使用例**

``` sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

結果:

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```

## UUIDStringToNum {#uuidstringtonum}

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`形式の36文字を含む`string`を受け取り、そのバイナリ表現として[FixedString(16)](../data-types/fixedstring.md)を返します。形式は`variant`（デフォルトは`Big-endian`）でオプション指定できます。

**構文**

``` sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

- `string` — 36文字の[文字列](/sql-reference/data-types/string)または[FixedString](/sql-reference/data-types/string)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

FixedString(16)

**使用例**

``` sql
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

``` sql
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

UUIDのバイナリ表現としての`binary`を含み、指定された`variant`（デフォルトは`Big-endian`）によってオプションでその形式を指定し、テキスト形式の36文字を含む文字列を返します。

**構文**

``` sql
UUIDNumToString(binary[, variant = 1])
```

**引数**

- `binary` — UUIDのバイナリ表現としての[FixedString(16)](../data-types/fixedstring.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

文字列。

**使用例**

``` sql
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

``` sql
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

[UUID](../data-types/uuid.md)を受け取り、そのバイナリ表現を[FixedString(16)](../data-types/fixedstring.md)として返します。形式はオプションで`variant`（デフォルトは`Big-endian`）によって指定できます。この関数は、UUIDからUUIDを抽出するために`UUIDStringToNum(toString(uuid))`を2つの異なる関数を呼び出す必要がなくします。

**構文**

``` sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

UUIDのバイナリ表現。

**使用例**

``` sql
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

``` sql
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

UUIDバージョン7のタイムスタンプコンポーネントを返します。

**構文**

``` sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

- `uuid` — バージョン7の[UUID](../data-types/uuid.md)。
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（省略可能）。[String](../data-types/string.md)。

**返される値**

- ミリ秒精度のタイムスタンプ。UUIDが無効なバージョン7 UUIDの場合は1970-01-01 00:00:00.000を返します。[DateTime64(3)](../data-types/datetime64.md)。

**使用例**

``` sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

結果:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

``` sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

結果:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## serverUUID {#serveruuid}

ClickHouseサーバーの最初の起動時に生成されたランダムなUUIDを返します。UUIDはClickHouseサーバーディレクトリ（例：`/var/lib/clickhouse/`）内のファイル`uuid`に保存され、サーバーの再起動の間も保持されます。

**構文**

```sql
serverUUID()
```

**返される値**

- サーバーのUUID。[UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)を生成します。

生成されたSnowflake IDは、現在のUnixタイムスタンプをミリ秒（41 + 1の上位ゼロビット）で含み、次にマシンID（10ビット）およびカウンタ（12ビット）が続き、ミリ秒内でIDを区別します。
任意の理想的なタイムスタンプ（unix_ts_ms）について、カウンタは0から始まり、新しいSnowflake IDごとに1ずつ増加します。タイムスタンプが変更されるまで。
カウンタがオーバーフローした場合、タイムスタンプフィールドが1増加し、カウンタは0にリセットされます。

関数`generateSnowflakeID`は、タイムスタンプ内のカウンタフィールドがすべての関数呼び出しで単調増加することを保証します。

:::note
生成されたSnowflake IDはUNIXエポック1970-01-01を基にしています。
Snowflake IDのエポックに関する標準や推奨は存在しませんが、他のシステムの実装では異なるエポック（例：Twitter/X（2010-11-04）、Mastodon（2015-01-01））を使用することがあります。
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

``` sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

- `expr` — クエリ内で関数が複数回呼ばれた場合に[共通部分式の排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は返されるSnowflake IDに影響を与えません。省略可能。
- `machine_id` — マシンIDで、最下位10ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可能。

**返される値**

UInt64型の値。

**例**

まず、UInt64型のカラムを持つテーブルを作成し、次に生成されたSnowflake IDをテーブルに挿入します。

``` sql
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

**行ごとに複数のSnowflake IDが生成される例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシンIDを使用する例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
この関数は非推奨であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効である場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)形式で抽出します。

**構文**

``` sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数はタイムゾーンに従って`time_string`を解析します。省略可能。[String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)値として返します。

**例**

クエリ:

``` sql
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
この関数は非推奨であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効である場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime64](../data-types/datetime64.md)形式で抽出します。

**構文**

``` sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数はタイムゾーンに従って`time_string`を解析します。省略可能。[String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを、スケール=3の[DateTime64](../data-types/datetime64.md)として返します。すなわち、ミリ秒精度です。

**例**

クエリ:

``` sql
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
この関数は非推奨であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効である場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[DateTime](../data-types/datetime.md)値を指定された時刻の最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

``` sql
dateTimeToSnowflake(value)
```

**引数**

- `value` — 時間を含む日付。[DateTime](../data-types/datetime.md)。

**返される値**

- 入力値をその時が最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)データ型に変換します。

**例**

クエリ:

``` sql
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
この関数は非推奨であり、設定[allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効である場合にのみ使用できます。
将来的にこの関数は削除される予定です。
:::

[DateTime64](../data-types/datetime64.md)を指定された時刻の最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

``` sql
dateTime64ToSnowflake(value)
```

**引数**

- `value` — 時間を含む日付。[DateTime64](../data-types/datetime64.md)。

**返される値**

- 入力値をその時の最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)データ型に変換します。

**例**

クエリ:

``` sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

結果:

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeidtodatetime}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)型の値として返します。

**構文**

``` sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）。デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数はタイムゾーンに従って`time_string`を解析します。省略可能。[String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)値として返します。

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

``` sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）。デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数はタイムゾーンに従って`time_string`を解析します。省略可能。[String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを、スケール=3の[DateTime64](../data-types/datetime64.md)として返します。すなわち、ミリ秒精度です。

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

[DateTime](../data-types/datetime.md)値を指定された時刻の最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

``` sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 時間を含む日付。[DateTime](../data-types/datetime.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）。デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**返される値**

- 入力値をその時の最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)に変換します。

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

[DateTime64](../data-types/datetime64.md)を指定された時刻の最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

``` sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 時間を含む日付。[DateTime64](../data-types/datetime64.md)。
- `epoch` - Snowflake IDのエポック（1970-01-01からのミリ秒）。デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合、1288834974657を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**返される値**

- 入力値をその時の最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)に変換します。

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

## 参照 {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)
