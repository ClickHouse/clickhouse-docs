---
description: 'UUID を扱う関数のドキュメント'
sidebar_label: 'UUID 関数'
slug: /sql-reference/functions/uuid-functions
title: 'UUID を扱う関数'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# UUID を操作する関数 {#functions-for-working-with-uuids}

## UUIDv7 の生成 {#uuidv7-generation}

生成される UUID は、Unix エポックミリ秒の 48 ビットのタイムスタンプに続いて、バージョン「7」（4 ビット）、1 ミリ秒内で UUID を区別するためのカウンタ（バリアントフィールド「2」（2 ビット）を含む 42 ビット）、およびランダムフィールド（32 ビット）で構成されます。
任意のタイムスタンプ（`unix_ts_ms`）に対して、カウンタはランダムな値から開始し、タイムスタンプが変化するまで、新しい UUID が生成されるたびに 1 ずつ増加します。カウンタがオーバーフローした場合は、タイムスタンプフィールドが 1 増加し、カウンタは新しいランダムな開始値にリセットされます。
UUID 生成関数は、同時に実行されているスレッドおよびクエリにおけるすべての関数呼び出しにわたって、同一タイムスタンプ内のカウンタフィールドが単調に増加することを保証します。

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

## Snowflake ID の生成 {#snowflake-id-generation}

生成される Snowflake ID には、現在の Unix タイムスタンプ（ミリ秒単位、41 ビット + 先頭のゼロ 1 ビット）、それに続くマシン ID（10 ビット）、および同一ミリ秒内で ID を区別するためのカウンタ（12 ビット）が含まれます。任意のタイムスタンプ（`unix_ts_ms`）に対して、カウンタは 0 から開始し、新しい Snowflake ID が生成されるたびに 1 ずつインクリメントされ、タイムスタンプが変わるまで続きます。カウンタがオーバーフローした場合、タイムスタンプフィールドが 1 増加し、カウンタは 0 にリセットされます。

:::note
生成される Snowflake ID は UNIX エポック 1970-01-01 を基準としています。Snowflake ID のエポックについて標準化された規格や推奨値は存在せず、他のシステムでの実装では異なるエポックを使用している場合があります（例: Twitter/X は 2010-11-04、Mastodon は 2015-01-01）。
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

[バージョン4](https://tools.ietf.org/html/rfc4122#section-4.4) の [UUID](../data-types/uuid.md) を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

* `expr` — クエリ内で関数が複数回呼び出される場合に、[共通部分式の除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は返される UUID には影響しません。省略可能。

**戻り値**

UUIDv4 型の値。

**例**

まず、UUID 型の列を持つテーブルを作成し、その後、生成された UUIDv4 をそのテーブルに挿入します。

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

**行ごとに複数の UUID を生成する例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

[バージョン 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) の [UUID](../data-types/uuid.md) を生成します。

UUID の構造、カウンタの管理、および並行性に関する保証の詳細については、[「UUIDv7 の生成」](#uuidv7-generation) セクションを参照してください。

:::note
2024 年 4 月時点では、バージョン 7 UUID はドラフト段階の仕様であり、そのレイアウトは将来的に変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

* `expr` — クエリ内でこの関数が複数回呼び出される場合に、[共通部分式除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は、返される UUID には一切影響しません。省略可能。

**戻り値**

UUIDv7 型の値。

**例**

まず、UUID 型の列を持つテーブルを作成し、その後、生成された UUIDv7 をテーブルに挿入します。

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

**行ごとに複数の UUID を生成する例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

指定した時刻を表す [DateTime](../data-types/datetime.md) 値を [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) に変換します。

UUID の構造、カウンター管理、および並行性の保証については、「[UUIDv7 generation](#uuidv7-generation)」セクションを参照してください。

:::note
2024年4月時点では、バージョン7 UUIDはドラフト仕様であり、そのレイアウトは将来変更される可能性があります。
:::

**構文**

```sql
dateTimeToUUIDv7(value)
```

**引数**

* `value` — 日付と時刻。[DateTime](../data-types/datetime.md)。

**返される値**

UUIDv7 型の値。

**例**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

結果：

```response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**同一のタイムスタンプに対する複数の UUID の例**

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

この関数は、同じタイムスタンプで複数回呼び出されても、一意で単調増加する UUID を生成することを保証します。

## empty {#empty}

入力された UUID が空かどうかをチェックします。

**構文**

```sql
empty(UUID)
```

UUID がすべてゼロ（ゼロ UUID）で構成されている場合、それは空と見なされます。

この関数は Array および String に対しても動作します。

**引数**

* `x` — UUID。[UUID](../data-types/uuid.md)。

**戻り値**

* 空の UUID に対しては `1` を返し、空でない UUID に対しては `0` を返します。[UInt8](../data-types/int-uint.md)。

**例**

UUID 値を生成するには、ClickHouse は [generateUUIDv4](#generateuuidv4) 関数を提供しています。

クエリ:

```sql
SELECT empty(generateUUIDv4());
```

結果：

```response
┌─empty(generateUUIDv4())─┐
│                       0 │
└─────────────────────────┘
```

## notEmpty {#notempty}

入力された UUID が空でないことを確認します。

**構文**

```sql
notEmpty(UUID)
```

UUID がすべてゼロ（ゼロ UUID）で構成されている場合、その UUID は空と見なされます。

この関数は Array 型および String 型に対しても動作します。

**引数**

* `x` — UUID。 [UUID](../data-types/uuid.md)。

**戻り値**

* 空でない UUID の場合は `1`、空の UUID の場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

UUID 値を生成するには、ClickHouse は [generateUUIDv4](#generateuuidv4) 関数を提供しています。

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

String 型の値を UUID 型に変換します。

```sql
toUUID(string)
```

**戻り値**

UUID 型の値です。

**使用例**

```sql
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

結果：

```response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```

## toUUIDOrDefault {#touuidordefault}

**引数**

* `string` — 36 文字の String 型または FixedString(36) 型。[String](../syntax.md#string)。
* `default` — 最初の引数を UUID 型に変換できない場合にデフォルトとして使用される UUID。[UUID](../data-types/uuid.md)。

**戻り値**

UUID

```sql
toUUIDOrDefault(string, default)
```

**戻り値**

UUID 型の値。

**使用例**

この最初の例では、変換可能であるため、最初の引数を UUID 型に変換して返します。

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

結果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

この 2 番目の例では、最初の引数を UUID 型に変換できないため、2 番目の引数（指定されたデフォルトの UUID）が返されます。

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

String 型の引数を受け取り、UUID 型としてパースしようとします。失敗した場合は NULL を返します。

```sql
toUUIDOrNull(string)
```

**返り値**

Nullable(UUID) 型の値。

**使用例**

```sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

結果：

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```

## toUUIDOrZero {#touuidorzero}

String 型の引数を受け取り、UUID としての解析を試みます。失敗した場合は、ゼロ UUID を返します。

```sql
toUUIDOrZero(string)
```

**戻り値**

UUID 型の値です。

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

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` という形式の 36 文字の `string` を受け取り、そのバイナリ表現として [FixedString(16)](../data-types/fixedstring.md) を返します。戻り値の形式はオプションの `variant` で指定でき、指定しない場合は `Big-endian` になります。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

* `string` — 36 文字の [String](/sql-reference/data-types/string) または [FixedString](/sql-reference/data-types/string)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアントを表す整数値。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**戻り値**

FixedString(16)

**使用例**

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

結果：

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

UUID のバイナリ表現を含む `binary` を受け取り、その形式は任意の `variant` 引数（デフォルトは `Big-endian`）で指定できます。テキスト形式の 36 文字からなる文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant = 1])
```

**引数**

* `binary` — UUID をバイナリで表現した [FixedString(16)](../data-types/fixedstring.md)。
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

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

結果：

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

## UUIDToNum {#uuidtonum}

[UUID](../data-types/uuid.md) を受け取り、そのバイナリ表現を [FixedString(16)](../data-types/fixedstring.md) 型として返します。フォーマットはオプションの `variant`（デフォルトは `Big-endian`）で指定できます。この関数は、`UUIDStringToNum(toString(uuid))` という 2 段階の呼び出しを置き換えるため、UUID からバイト列を抽出する際に UUID を文字列へ中間変換する必要がなくなります。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

* `uuid` — [UUID](../data-types/uuid.md)。
* `variant` — 整数で、[RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアントを表します。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

UUID のバイナリ表現です。

**使用例**

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

結果：

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

結果：

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDv7ToDateTime {#uuidv7todatetime}

UUID バージョン 7 のタイムスタンプ部分を返します。

**構文**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

* `uuid` — バージョン 7 の [UUID](../data-types/uuid.md)。
* `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（省略可能）。[String](../data-types/string.md)。

**戻り値**

* ミリ秒精度のタイムスタンプ。UUID がバージョン 7 の有効な UUID でない場合は `1970-01-01 00:00:00.000` を返します。[DateTime64(3)](../data-types/datetime64.md)。

**使用例**

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

結果：

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

ClickHouse サーバーの初回起動時に生成されるランダムな UUID を返します。UUID は ClickHouse サーバーのディレクトリ（例: `/var/lib/clickhouse/`）内の `uuid` ファイルに保存され、サーバーを再起動しても保持されます。

**構文**

```sql
serverUUID()
```

**戻り値**

* サーバーの UUID。[UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) を生成します。
この関数は、同時に実行中のスレッドおよびクエリにおけるすべての関数呼び出しにわたって、タイムスタンプに含まれるカウンターフィールドが単調増加することを保証します。

実装の詳細については、[「Snowflake ID generation」](#snowflake-id-generation) セクションを参照してください。

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

* `expr` — クエリ内でこの関数が複数回呼び出される場合に、[共通部分式の除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は、返される Snowflake ID には影響しません。省略可能です。
* `machine_id` — マシン ID。下位 10 ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可能です。

**戻り値**

型 UInt64 の値。

**例**

まず、型 UInt64 の列を持つテーブルを作成し、その後、生成された Snowflake ID をテーブルに挿入します。

```sql
CREATE TABLE tab (id UInt64) ENGINE = Memory;

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

結果：

```response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**1 行ごとに複数の Snowflake ID が生成される例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシン ID を使用した例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge />

:::warning
この関数は非推奨で、[allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効になっている場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに [snowflakeIDToDateTime](#snowflakeidtodatetime) 関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) から [DateTime](../data-types/datetime.md) 形式のタイムスタンプ部分を抽出します。

**構文**

```sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

* `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は指定されたタイムゾーンに従って `time_string` を解析します。省略可能。[String](../data-types/string.md)。

**戻り値**

* `value` のタイムスタンプ成分を [DateTime](../data-types/datetime.md) の値として返します。

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
この関数は非推奨となっており、設定 [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効な場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに関数 [snowflakeIDToDateTime64](#snowflakeidtodatetime64) を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を [DateTime64](../data-types/datetime64.md) 形式で抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

* `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は `time_string` をこのタイムゾーンに基づいて解釈します。省略可能。[String](../data-types/string.md)。

**戻り値**

* `value` のタイムスタンプ成分を、スケール = 3（ミリ秒精度）の [DateTime64](../data-types/datetime64.md) として返します。

**例**

クエリ:

```sql
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

結果：

```response

┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## dateTimeToSnowflake {#datetimetosnowflake}

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効な場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに [dateTimeToSnowflakeID](#datetimetosnowflakeid) 関数を使用してください。
:::

[DateTime](../data-types/datetime.md) の値を、その時刻に対応する最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

* `value` — 日時。[DateTime](../data-types/datetime.md)。

**戻り値**

* 入力値を、その時刻における最初の Snowflake ID を表す [Int64](../data-types/int-uint.md) データ型の値に変換したもの。

**例**

クエリ:

```sql
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

結果：

```response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTime64ToSnowflake {#datetime64tosnowflake}

<DeprecatedBadge />

:::warning
この関数は非推奨であり、設定 [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効になっている場合にのみ利用できます。
この関数は将来のある時点で削除されます。

代わりに関数 [dateTime64ToSnowflakeID](#datetime64tosnowflakeid) を使用してください。
:::

[DateTime64](../data-types/datetime64.md) を、指定された時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

* `value` — 日時。[DateTime64](../data-types/datetime64.md)。

**返される値**

* 入力値に対応する、その時刻における最初の Snowflake ID を表す [Int64](../data-types/int-uint.md) 型の値。

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

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を、[DateTime](../data-types/datetime.md) 型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

* `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
* `epoch` - Snowflake ID のエポックを、1970-01-01 からの経過ミリ秒で指定します。デフォルトは 0（1970-01-01）です。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。省略可能。[UInt*](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` をこのタイムゾーンに従って解釈します。省略可能。[String](../data-types/string.md)。

**返される値**

* `value` のタイムスタンプコンポーネントを [DateTime](../data-types/datetime.md) 値として返します。

**例**

クエリ：

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

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプコンポーネントを、[DateTime64](../data-types/datetime64.md) 型の値として返します。

**構文**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**引数**

* `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
* `epoch` - Snowflake ID のエポック（1970-01-01 からの経過ミリ秒）。デフォルトは 0（1970-01-01）。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。省略可能。 [UInt*](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` をこのタイムゾーンに従って解釈します。省略可能。 [String](../data-types/string.md)。

**返り値**

* `value` のタイムスタンプ部分を、スケール = 3（ミリ秒精度）の [DateTime64](../data-types/datetime64.md) として返します。

**例**

クエリ：

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

結果：

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## dateTimeToSnowflakeID {#datetimetosnowflakeid}

[DateTime](../data-types/datetime.md) 型の値を、指定された時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

* `value` — 日時。[DateTime](../data-types/datetime.md)。
* `epoch` - Snowflake ID のエポックを、1970-01-01 からの経過ミリ秒で指定します。デフォルトは 0 (1970-01-01)。Twitter/X のエポック (2015-01-01) を使用する場合は 1288834974657 を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**戻り値**

* 入力値を、その時刻における最初の Snowflake ID に対応する [UInt64](../data-types/int-uint.md) 値に変換したもの。

**例**

クエリ:

```sql
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

結果：

```response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTime64ToSnowflakeID {#datetime64tosnowflakeid}

[DateTime64](../data-types/datetime64.md) を、指定された時刻に対応する最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

* `value` — 時刻付きの日付。[DateTime64](../data-types/datetime64.md)。
* `epoch` - Snowflake ID のエポックを、1970-01-01 からの経過ミリ秒で指定します。デフォルトは 0 (1970-01-01) です。Twitter/X のエポック (2015-01-01) を指定する場合は 1288834974657 を指定します。省略可能です。[UInt*](../data-types/int-uint.md)。

**戻り値**

* 入力値を、その時刻における最初の Snowflake ID を表す [UInt64](../data-types/int-uint.md) 値に変換したもの。

**例**

クエリ:

```sql
SELECT toDateTime('2021-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

結果：

```yaml
┌──────────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56.493 │ 6832626394434895872 │
└─────────────────────────┴─────────────────────┘
```

## 関連項目 {#see-also}

* [dictGetUUID](/sql-reference/functions/ext-dict-functions#dictGetUUID)

{/*
  以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
  system.functions から生成されたドキュメントで置き換えられます。タグを変更したり削除したりしないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

## UUIDNumToString {#UUIDNumToString}

導入バージョン: v1.1

UUID のバイナリ表現を受け取り、オプションの `variant` 引数（省略時は `Big-endian`）でその形式を指定し、テキスト形式の 36 文字からなる文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant])
```

**引数**

* `binary` — UUID のバイナリ表現。[`FixedString(16)`](/sql-reference/data-types/fixedstring)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアント。1 = `Big-endian` (デフォルト), 2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

UUID を文字列として返します。[`String`](/sql-reference/data-types/string)

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
