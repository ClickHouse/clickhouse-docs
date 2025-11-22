---
description: 'UUID を扱う関数に関するドキュメント'
sidebar_label: 'UUIDs'
slug: /sql-reference/functions/uuid-functions
title: 'UUID を扱う関数'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# UUID を扱う関数



## UUIDv7の生成 {#uuidv7-generation}

生成されるUUIDには、Unixミリ秒単位の48ビットタイムスタンプ、バージョン「7」(4ビット)、ミリ秒内でUUIDを区別するためのカウンタ(42ビット、バリアントフィールド「2」の2ビットを含む)、およびランダムフィールド(32ビット)が含まれます。
任意のタイムスタンプ(`unix_ts_ms`)において、カウンタはランダムな値から開始され、タイムスタンプが変更されるまで新しいUUIDごとに1ずつ増分されます。カウンタがオーバーフローした場合、タイムスタンプフィールドが1増分され、カウンタはランダムな新しい開始値にリセットされます。
UUID生成関数は、同時実行されるスレッドとクエリのすべての関数呼び出しにおいて、タイムスタンプ内のカウンタフィールドが単調増加することを保証します。

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


## Snowflake IDの生成 {#snowflake-id-generation}

生成されるSnowflake IDには、現在のUnixタイムスタンプ(ミリ秒単位、41ビット + 最上位ゼロビット1ビット)、マシンID(10ビット)、およびミリ秒内でIDを区別するためのカウンタ(12ビット)が含まれます。任意のタイムスタンプ(`unix_ts_ms`)に対して、カウンタは0から始まり、タイムスタンプが変わるまで新しいSnowflake IDごとに1ずつ増加します。カウンタがオーバーフローした場合、タイムスタンプフィールドが1増加し、カウンタは0にリセットされます。

:::note
生成されるSnowflake IDは、UNIXエポック1970-01-01を基準としています。Snowflake IDのエポックに関する標準や推奨事項は存在しませんが、他のシステムの実装では異なるエポックを使用する場合があります(例:Twitter/X(2010-11-04)やMastodon(2015-01-01))。
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

[バージョン4](https://tools.ietf.org/html/rfc4122#section-4.4)の[UUID](../data-types/uuid.md)を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に[共通部分式の削除](/sql-reference/functions/overview#common-subexpression-elimination)をバイパスするために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるUUIDに影響を与えません。省略可能。

**戻り値**

UUIDv4型の値。

**例**

まず、UUID型のカラムを持つテーブルを作成し、生成されたUUIDv4をテーブルに挿入します。

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

**行ごとに複数のUUIDを生成する例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7 {#generateUUIDv7}

[バージョン7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)の[UUID](../data-types/uuid.md)を生成します。

UUIDの構造、カウンタ管理、および同時実行保証の詳細については、["UUIDv7の生成"](#uuidv7-generation)セクションを参照してください。

:::note
2024年4月時点で、バージョン7のUUIDはドラフト状態であり、将来的にレイアウトが変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に[共通部分式の削除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるUUIDに影響しません。省略可能。

**戻り値**

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

**行ごとに複数のUUIDを生成する例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## dateTimeToUUIDv7 {#datetimetouuidv7}

[DateTime](../data-types/datetime.md)値を、指定された時刻の[UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)に変換します。

UUID構造、カウンタ管理、および並行性保証の詳細については、["UUIDv7 generation"](#uuidv7-generation)セクションを参照してください。

:::note
2024年4月時点で、バージョン7のUUIDはドラフト状態であり、そのレイアウトは将来変更される可能性があります。
:::

**構文**

```sql
dateTimeToUUIDv7(value)
```

**引数**

- `value` — 日時。[DateTime](../data-types/datetime.md)。

**戻り値**

UUIDv7型の値。

**例**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

結果:

```response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**同じタイムスタンプに対する複数のUUIDの例**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

**結果**

```response
   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
   └──────────────────────────────────────┘

   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
   └──────────────────────────────────────┘
```

この関数は、同じタイムスタンプで複数回呼び出された場合でも、一意で単調増加するUUIDを生成することを保証します。


## empty {#empty}

入力されたUUIDが空かどうかを確認します。

**構文**

```sql
empty(UUID)
```

UUIDはすべてゼロ(ゼロUUID)である場合に空とみなされます。

この関数は配列と文字列でも使用できます。

**引数**

- `x` — UUID。[UUID](../data-types/uuid.md)。

**戻り値**

- 空のUUIDの場合は`1`を、空でないUUIDの場合は`0`を返します。[UInt8](../data-types/int-uint.md)。

**例**

UUID値を生成するには、ClickHouseが提供する[generateUUIDv4](#generateuuidv4)関数を使用します。

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

入力されたUUIDが空でないかを確認します。

**構文**

```sql
notEmpty(UUID)
```

UUIDはすべてゼロ(ゼロUUID)である場合に空とみなされます。

この関数は配列と文字列に対しても動作します。

**引数**

- `x` — UUID。[UUID](../data-types/uuid.md)。

**戻り値**

- 空でないUUIDの場合は`1`を、空のUUIDの場合は`0`を返します。[UInt8](../data-types/int-uint.md)。

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

String型の値をUUIDに変換します。

```sql
toUUID(string)
```

**戻り値**

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

- `string` — 36文字の文字列またはFixedString(36)。[String](../syntax.md#string)。
- `default` — 第1引数をUUID型に変換できない場合にデフォルトとして使用されるUUID。[UUID](../data-types/uuid.md)。

**戻り値**

UUID

```sql
toUUIDOrDefault(string, default)
```

**戻り値**

UUID型の値。

**使用例**

最初の例では、第1引数が変換可能なため、UUID型に変換された第1引数を返します:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

結果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

2番目の例では、第1引数をUUID型に変換できないため、第2引数(指定されたデフォルトUUID)を返します:

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

結果:

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull {#touuidornull}

String型の引数を受け取り、UUIDへのパースを試みます。失敗した場合はNULLを返します。

```sql
toUUIDOrNull(string)
```

**戻り値**

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

String型の引数を受け取り、UUIDへのパースを試みます。失敗した場合は、ゼロUUIDを返します。

```sql
toUUIDOrZero(string)
```

**戻り値**

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

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`形式の36文字を含む`string`を受け取り、そのバイナリ表現として[FixedString(16)](../data-types/fixedstring.md)を返します。形式は`variant`でオプション指定できます(デフォルトは`Big-endian`)。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

- `string` — 36文字の[String](/sql-reference/data-types/string)または[FixedString](/sql-reference/data-types/string)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定されたバリアントを表す整数。1 = `Big-endian`(デフォルト)、2 = `Microsoft`

**戻り値**

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

UUIDのバイナリ表現を含む`binary`を受け取り、`variant`でオプション指定される形式(デフォルトは`Big-endian`)に従って、36文字のテキスト形式の文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant = 1])
```

**引数**

- `binary` — UUIDのバイナリ表現としての[FixedString(16)](../data-types/fixedstring.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で規定されたバリアントを表す整数。1 = `Big-endian`(デフォルト)、2 = `Microsoft`。

**戻り値**

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

[UUID](../data-types/uuid.md)を受け取り、そのバイナリ表現を[FixedString(16)](../data-types/fixedstring.md)として返します。形式は`variant`でオプション指定できます(デフォルトは`Big-endian`)。この関数は2つの別々の関数`UUIDStringToNum(toString(uuid))`の呼び出しを置き換えるもので、UUIDからバイトを抽出する際にUUIDから文字列への中間変換が不要になります。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — 整数。[RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で規定されているバリアントを表します。1 = `Big-endian`(デフォルト)、2 = `Microsoft`。

**戻り値**

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

UUIDバージョン7のタイムスタンプコンポーネントを返します。

**構文**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

- `uuid` — バージョン7の[UUID](../data-types/uuid.md)。
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- ミリ秒精度のタイムスタンプ。UUIDが有効なバージョン7のUUIDでない場合は、1970-01-01 00:00:00.000を返します。[DateTime64(3)](../data-types/datetime64.md)。

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

ClickHouseサーバーの初回起動時に生成されたランダムなUUIDを返します。このUUIDは、ClickHouseサーバーディレクトリ(例:`/var/lib/clickhouse/`)内の`uuid`ファイルに保存され、サーバー再起動後も保持されます。

**構文**

```sql
serverUUID()
```

**戻り値**

- サーバーのUUID。[UUID](../data-types/uuid.md)


## generateSnowflakeID {#generatesnowflakeid}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)を生成します。
この関数は、並行実行されるスレッドとクエリのすべての関数呼び出しにおいて、タイムスタンプ内のカウンターフィールドが単調増加することを保証します。

実装の詳細については、["Snowflake ID generation"](#snowflake-id-generation)セクションを参照してください。

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に[共通部分式の削除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるSnowflake IDに影響しません。省略可能。
- `machine_id` — マシンID。下位10ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可能。

**返される値**

UInt64型の値。

**例**

まず、UInt64型のカラムを持つテーブルを作成し、生成されたSnowflake IDをテーブルに挿入します。

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

**行ごとに複数のSnowflake IDを生成する例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシンIDを使用した例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効になっている場合にのみ使用できます。
この関数は将来のバージョンで削除される予定です。

代わりに関数 [snowflakeIDToDateTime](#snowflakeidtodatetime) を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) からタイムスタンプ部分を [DateTime](../data-types/datetime.md) 形式で抽出します。

**構文**

```sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は指定されたタイムゾーンに従って `time_string` を解析します。省略可能。[String](../data-types/string.md)。

**戻り値**

- `value` のタイムスタンプ部分を [DateTime](../data-types/datetime.md) 値として返します。

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

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効になっている場合にのみ使用できます。
この関数は将来削除される予定です。

代わりに関数 [snowflakeIDToDateTime64](#snowflakeidtodatetime64) を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプコンポーネントを [DateTime64](../data-types/datetime64.md) 形式で抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数はタイムゾーンに従って `time_string` を解析します。省略可能。[String](../data-types/string.md)。

**戻り値**

- `value` のタイムスタンプコンポーネントを、scale = 3（ミリ秒精度）の [DateTime64](../data-types/datetime64.md) として返します。

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

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効になっている場合にのみ使用できます。
この関数は将来削除される予定です。

代わりに関数 [dateTimeToSnowflakeID](#datetimetosnowflakeid) を使用してください。
:::

[DateTime](../data-types/datetime.md) 値を、指定された時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

- `value` — 日時。[DateTime](../data-types/datetime.md)。

**戻り値**

- その時刻における最初の Snowflake ID として [Int64](../data-types/int-uint.md) データ型に変換された入力値。

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

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効になっている場合にのみ使用できます。
この関数は将来削除される予定です。

代わりに関数 [dateTime64ToSnowflakeID](#datetime64tosnowflakeid) を使用してください。
:::

指定された時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に [DateTime64](../data-types/datetime64.md) を変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

- `value` — 日時。[DateTime64](../data-types/datetime64.md)。

**戻り値**

- その時刻における最初のSnowflake IDとして [Int64](../data-types/int-uint.md) データ型に変換された入力値。

**例**

クエリ:

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

結果:

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```


## snowflakeIDToDateTime {#snowflakeidtodatetime}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプ部分を[DateTime](../data-types/datetime.md)型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
- `epoch` - 1970-01-01からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0(1970-01-01)。Twitter/Xのエポック(2015-01-01)の場合は1288834974657を指定します。省略可能。[UInt\*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は指定されたタイムゾーンに従って`time_string`を解析します。省略可能。[String](../data-types/string.md)。

**戻り値**

- `value`のタイムスタンプ部分を[DateTime](../data-types/datetime.md)値として返します。

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
- `epoch` - 1970-01-01からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0(1970-01-01)。Twitter/Xのエポック(2015-01-01)の場合は1288834974657を指定します。省略可能。[UInt\*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は指定されたタイムゾーンに従って`time_string`を解析します。省略可能。[String](../data-types/string.md)。

**戻り値**

- `value`のタイムスタンプコンポーネントを、scale = 3(ミリ秒精度)の[DateTime64](../data-types/datetime64.md)として返します。

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

[DateTime](../data-types/datetime.md)値を、指定された時刻における最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 日時。[DateTime](../data-types/datetime.md)。
- `epoch` - 1970-01-01からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0(1970-01-01)。Twitter/Xのエポック(2015-01-01)の場合は1288834974657を指定します。オプション。[UInt\*](../data-types/int-uint.md)。

**戻り値**

- その時刻における最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)に変換された入力値。

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

[DateTime64](../data-types/datetime64.md)を、指定された時刻における最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 日時。[DateTime64](../data-types/datetime64.md)。
- `epoch` - 1970-01-01からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0（1970-01-01）。Twitter/Xのエポック（2015-01-01）の場合は1288834974657を指定します。オプション。[UInt\*](../data-types/int-uint.md)。

**戻り値**

- その時刻における最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)に変換された入力値。

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

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->


<!--AUTOGENERATED_START-->

## UUIDNumToString {#UUIDNumToString}

導入バージョン: v1.1

UUIDのバイナリ表現を受け取り、`variant`でオプションとして指定されたフォーマット(デフォルトは`Big-endian`)に従って、テキスト形式で36文字の文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant])
```

**引数**

- `binary` — UUIDのバイナリ表現。[`FixedString(16)`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で規定されたバリアント。1 = `Big-endian`(デフォルト)、2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

UUIDを文字列として返します。[`String`](/sql-reference/data-types/string)

**例**

**使用例**

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

**Microsoftバリアント**

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

導入バージョン: v1.1

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`形式の36文字を含む文字列を受け取り、そのバイナリ表現として[FixedString(16)](../data-types/fixedstring.md)を返します。形式は`variant`でオプション指定でき、デフォルトは`Big-endian`です。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

- `string` — 36文字の文字列または固定長文字列 [`String`](/sql-reference/data-types/string)または[`FixedString(36)`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で規定されたバリアント。1 = `Big-endian`(デフォルト)、2 = `Microsoft` [`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

`string`のバイナリ表現を返します。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**例**

**使用例**

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

**Microsoftバリアント**

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

導入バージョン: v24.5

[UUID](../data-types/uuid.md)を受け取り、そのバイナリ表現を[FixedString(16)](../data-types/fixedstring.md)として返します。形式は`variant`でオプション指定でき、デフォルトは`Big-endian`です。
この関数は、2つの別々の関数呼び出し`UUIDStringToNum(toString(uuid))`を置き換えるため、UUIDからバイトを抽出する際にUUIDから文字列への中間変換が不要になります。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

- `uuid` — UUID。[`String`](/sql-reference/data-types/string)または[`FixedString`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で規定されたバリアント。1 = `Big-endian`(デフォルト)、2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

UUIDのバイナリ表現を返します。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**例**

**使用例**

```sql title=クエリ
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

```response title=レスポンス
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoftバリアント**

```sql title=クエリ
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

```response title=レスポンス
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```


## UUIDv7ToDateTime {#UUIDv7ToDateTime}

導入バージョン: v24.5

UUIDバージョン7のタイムスタンプコンポーネントを返します。

**構文**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

- `uuid` — UUIDバージョン7。[`String`](/sql-reference/data-types/string)
- `timezone` — オプション。返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)。[`String`](/sql-reference/data-types/string)

**返り値**

ミリ秒精度のタイムスタンプを返します。UUIDが有効なバージョン7のUUIDでない場合は、`1970-01-01 00:00:00.000`を返します。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=クエリ
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=レスポンス
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**タイムゾーン指定あり**

```sql title=クエリ
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=レスポンス
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```


## dateTime64ToSnowflake {#dateTime64ToSnowflake}

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)が有効になっている場合のみ使用できます。
この関数は将来的に削除される予定です。

代わりに関数[dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID)を使用してください。
:::

指定された時刻における最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に[DateTime64](../data-types/datetime64.md)を変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

- `value` — 日時。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

その時刻における最初のSnowflake IDに変換された入力値を返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=Response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```


## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

導入バージョン: v24.6

[`DateTime64`](../data-types/datetime64.md)を、指定された時刻における最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

実装の詳細については、["Snowflake ID generation"](#snowflake-id-generation)セクションを参照してください。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 日時。[`DateTime`](/sql-reference/data-types/datetime)または[`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — 1970-01-01からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0(1970-01-01)。Twitter/Xのエポック(2015-01-01)の場合は1288834974657を指定します。[`UInt*`](/sql-reference/data-types/int-uint)

**戻り値**

その時刻における最初のSnowflake IDとして入力値を返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT toDateTime64('2025-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────────dt─┬─────────────────res─┐
│ 2025-08-15 18:57:56.493 │ 7362075066076495872 │
└─────────────────────────┴─────────────────────┘
```


## dateTimeToSnowflake {#dateTimeToSnowflake}

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)を有効にした場合のみ使用できます。
この関数は将来のバージョンで削除される予定です。

代わりに関数[dateTimeToSnowflakeID](#dateTimeToSnowflakeID)を使用してください。
:::

[DateTime](../data-types/datetime.md)値を、指定された時刻における最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

- `value` — 日時。[`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

その時刻における最初のSnowflake IDとして入力値を返します。[`Int64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```


## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

導入バージョン: v24.6

[DateTime](../data-types/datetime.md)値を、指定された時刻における最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 日時。[`DateTime`](/sql-reference/data-types/datetime)または[`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — オプション。1970-01-01からのミリ秒単位のSnowflake IDエポック。デフォルトは0（1970-01-01）。Twitter/Xエポック（2015-01-01）の場合は1288834974657を指定します。[`UInt*`](/sql-reference/data-types/int-uint)

**戻り値**

指定された時刻における最初のSnowflake IDを返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```


## dateTimeToUUIDv7 {#dateTimeToUUIDv7}

導入バージョン: v25.9

指定された時刻の[DateTime](../data-types/datetime.md)値を[UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)に変換します。

UUID構造、カウンタ管理、および並行性保証の詳細については、["UUIDv7生成"](#uuidv7-generation)セクションを参照してください。

:::note
2025年9月時点で、バージョン7のUUIDはドラフト状態であり、そのレイアウトは将来変更される可能性があります。
:::

**構文**

```sql
dateTimeToUUIDv7(value)
```

**引数**

- `value` — 日時。[`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

UUIDv7を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**同じタイムスタンプに対する複数のUUID**

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

導入バージョン: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)を生成します。

関数`generateSnowflakeID`は、並行実行されるスレッドとクエリ内のすべての関数呼び出しにおいて、タイムスタンプ内のカウンターフィールドが単調増加することを保証します。

実装の詳細については、["Snowflake ID生成"](#snowflake-id-generation)のセクションを参照してください。

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に[共通部分式の削除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるSnowflake IDに影響しません。省略可能。
- `machine_id` — マシンID。下位10ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可能。

**戻り値**

Snowflake IDを返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=クエリ
CREATE TABLE tab (id UInt64)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

```response title=レスポンス
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**行ごとに複数のSnowflake IDを生成**

```sql title=クエリ
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=レスポンス
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシンIDを使用**

```sql title=クエリ
SELECT generateSnowflakeID('expr', 1);
```

```response title=レスポンス
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## generateUUIDv4 {#generateUUIDv4}

導入バージョン: v1.1

[バージョン4](https://tools.ietf.org/html/rfc4122#section-4.4)の[UUID](../data-types/uuid.md)を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

- `expr` — オプション。クエリ内で関数が複数回呼び出される場合に[共通部分式の除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の式。式の値は返されるUUIDに影響を与えません。

**戻り値**

UUIDv4を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

```sql title=クエリ
SELECT generateUUIDv4(number) FROM numbers(3);
```

```response title=レスポンス
┌─generateUUIDv4(number)───────────────┐
│ fcf19b77-a610-42c5-b3f5-a13c122f65b6 │
│ 07700d36-cb6b-4189-af1d-0972f23dc3bc │
│ 68838947-1583-48b0-b9b7-cf8268dd343d │
└──────────────────────────────────────┘
```

**共通部分式の除去**

```sql title=クエリ
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=レスポンス
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7 {#generateUUIDv7}

導入バージョン: v24.5

[バージョン7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)の[UUID](../data-types/uuid.md)を生成します。

UUIDの構造、カウンタ管理、および並行処理の保証に関する詳細については、["UUIDv7の生成"](#uuidv7-generation)のセクションを参照してください。

:::note
2025年9月時点で、バージョン7のUUIDはドラフト状態であり、将来的にそのレイアウトが変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

- `expr` — オプション。クエリ内で関数が複数回呼び出される場合に[共通部分式の削除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の式。式の値は返されるUUIDに影響しません。[`Any`](/sql-reference/data-types)

**戻り値**

UUIDv7を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

```sql title=クエリ
SELECT generateUUIDv7(number) FROM numbers(3);
```

```response title=レスポンス
┌─generateUUIDv7(number)───────────────┐
│ 019947fb-5766-7ed0-b021-d906f8f7cebb │
│ 019947fb-5766-7ed0-b021-d9072d0d1e07 │
│ 019947fb-5766-7ed0-b021-d908dca2cf63 │
└──────────────────────────────────────┘
```

**共通部分式の削除**

```sql title=クエリ
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=レスポンス
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## readWKTLineString {#readWKTLineString}

導入バージョン: v

LineStringジオメトリのWell-Known Text（WKT）表現を解析し、ClickHouseの内部形式で返します。

**構文**

```sql
readWKTLineString(wkt_string)
```

**引数**

- `wkt_string` — LineStringジオメトリを表すWKT文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

この関数は、LineStringジオメトリのClickHouse内部表現を返します。

**例**

**最初の呼び出し**

```sql title=Query
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Response
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**2番目の呼び出し**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeIDToDateTime {#snowflakeIDToDateTime}

導入バージョン: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — オプション。1970-01-01を起点としたミリ秒単位のSnowflake IDエポック。デフォルトは0(1970-01-01)。Twitter/Xエポック(2015-01-01)の場合は1288834974657を指定します。[`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — オプション。[タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は指定されたタイムゾーンに従って`time_string`を解析します。[`String`](/sql-reference/data-types/string)

**返り値**

`value`のタイムスタンプコンポーネントを返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeIDToDateTime64 {#snowflakeIDToDateTime64}

導入バージョン: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプ部分を[DateTime64](../data-types/datetime64.md)型の値として返します。

**構文**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — オプション。1970-01-01を起点としたミリ秒単位のSnowflake IDエポック。デフォルトは0(1970-01-01)。Twitter/Xエポック(2015-01-01)の場合は1288834974657を指定します。[`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — オプション。[タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は指定されたタイムゾーンに従って`time_string`を解析します。[`String`](/sql-reference/data-types/string)

**戻り値**

`value`のタイムスタンプ部分をscale = 3(ミリ秒精度)の`DateTime64`として返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=クエリ
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=レスポンス
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeToDateTime {#snowflakeToDateTime}

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)を有効にした場合のみ使用できます。
この関数は将来のバージョンで削除される予定です。

代わりに[`snowflakeIDToDateTime`](#snowflakeIDToDateTime)関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプ部分を[DateTime](../data-types/datetime.md)形式で抽出します。

**構文**

```sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — オプション。[タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は指定されたタイムゾーンに従って`time_string`を解析します。[`String`](/sql-reference/data-types/string)

**戻り値**

`value`のタイムスタンプ部分を返します。[`DateTime`](/sql-reference/data-types/datetime)

**例**

**使用例**

```sql title=Query
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeToDateTime64 {#snowflakeToDateTime64}

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)を有効にした場合のみ使用できます。
この関数は将来のバージョンで削除される予定です。

代わりに[`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64)関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプ部分を[DateTime64](../data-types/datetime64.md)形式で抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — オプション。[タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。この関数は指定されたタイムゾーンに従って`time_string`を解析します。[`String`](/sql-reference/data-types/string)

**戻り値**

`value`のタイムスタンプ部分を返します。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrDefault {#toUUIDOrDefault}

導入バージョン: v21.1

文字列値をUUID型に変換します。変換に失敗した場合、エラーをスローせずにデフォルトのUUID値を返します。

この関数は、標準的なUUID形式(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)の36文字の文字列を解析します。
文字列が有効なUUIDに変換できない場合、関数は指定されたデフォルトのUUID値を返します。

**構文**

```sql
toUUIDOrDefault(string, default)
```

**引数**

- `string` — UUIDに変換する36文字の文字列またはFixedString(36)。
- `default` — 第1引数がUUID型に変換できない場合に返されるUUID値。

**戻り値**

変換に成功した場合は変換されたUUIDを、変換に失敗した場合はデフォルトのUUIDを返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**変換成功時は解析されたUUIDを返す**

```sql title=クエリ
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=レスポンス
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**変換失敗時はデフォルトのUUIDを返す**

```sql title=クエリ
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=レスポンス
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull {#toUUIDOrNull}

導入バージョン: v20.12

入力値を`UUID`型の値に変換しますが、エラーが発生した場合は`NULL`を返します。
[`toUUID`](#touuid)と同様ですが、変換エラー時に例外をスローする代わりに`NULL`を返します。

サポートされる引数:

- 標準形式(8-4-4-4-12の16進数桁)のUUID文字列表現
- ハイフンなし(32の16進数桁)のUUID文字列表現

サポートされない引数(`NULL`を返す):

- 無効な文字列形式
- 文字列型以外の型
- 不正な形式のUUID

**構文**

```sql
toUUIDOrNull(x)
```

**引数**

- `x` — UUIDの文字列表現。[`String`](/sql-reference/data-types/string)

**返り値**

成功した場合はUUID値を返し、それ以外の場合は`NULL`を返します。[`UUID`](/sql-reference/data-types/uuid)または[`NULL`](/sql-reference/syntax#null)

**例**

**使用例**

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

<!--AUTOGENERATED_END-->
