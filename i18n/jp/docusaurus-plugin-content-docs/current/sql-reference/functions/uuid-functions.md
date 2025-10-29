---
'description': 'UUIDsで作業するための関数に関するDocumentation'
'sidebar_label': 'UUIDs'
'slug': '/sql-reference/functions/uuid-functions'
'title': 'UUIDsで作業するための関数'
'doc_type': 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# UUIDsを操作するための関数

## UUIDv7生成 {#uuidv7-generation}

生成されたUUIDは、Unixミリ秒で表された48ビットのタイムスタンプ、バージョン「7」（4ビット）、ミリ秒内のUUIDを区別するためのカウンター（42ビット、バリアントフィールド「2」、2ビットを含む）、およびランダムフィールド（32ビット）を含みます。
特定のタイムスタンプ（`unix_ts_ms`）に対して、カウンターはランダムな値から開始され、タイムスタンプが変更されるまで新しいUUIDごとに1ずつインクリメントされます。カウンターがオーバーフローした場合、タイムスタンプフィールドは1つ増加し、カウンターはランダムな新しい開始値にリセットされます。
UUID生成関数は、同時に実行されるスレッドおよびクエリにおいて、タイムスタンプ内のカウンターフィールドがすべての関数呼び出しで単調増加することを保証します。

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

## Snowflake ID生成 {#snowflake-id-generation}

生成されたSnowflake IDは、現在のUnixタイムスタンプ（ミリ秒、41 + 1の上位ゼロビット）を含み、続いて機械ID（10ビット）、およびミリ秒内でのIDを区別するためのカウンター（12ビット）があります。特定のタイムスタンプ（`unix_ts_ms`）に対して、カウンターは0から開始され、タイムスタンプが変わるまで新しいSnowflake IDごとに1ずつインクリメントされます。カウンターがオーバーフローした場合、タイムスタンプフィールドは1つ増加し、カウンターは0にリセットされます。

:::note
生成されたSnowflake IDはUNIXエポック1970年1月1日を基にしています。Snowflake IDのエポックに対する標準や推奨は存在しませんが、他のシステムの実装では異なるエポック（例えば、Twitter/X（2010年11月4日）やMastodon（2015年1月1日））を使用している場合があります。
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

[バージョン4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に [共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination) をバイパスするために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるUUIDには影響しません。オプション。

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

**行ごとに複数のUUIDを生成する例**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

[バージョン7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)を生成します。

UUIDの構造、カウンター管理、並行保証の詳細については、「["UUIDv7生成"](#uuidv7-generation)」を参照してください。

:::note
2024年4月現在、バージョン7 UUIDはドラフトステータスであり、そのレイアウトは今後変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に [共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination) をバイパスするために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるUUIDには影響しません。オプション。

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

**行ごとに複数のUUIDを生成する例**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

指定された時間での[DateTime](../data-types/datetime.md)値を[UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)に変換します。

UUIDの構造、カウンター管理、並行保証の詳細については、「["UUIDv7生成"](#uuidv7-generation)」を参照してください。

:::note
2024年4月現在、バージョン7 UUIDはドラフトステータスであり、そのレイアウトは今後変更される可能性があります。
:::

**構文**

```sql
dateTimeToUUIDv7(value)
```

**引数**

- `value` — 時間付き日付。 [DateTime](../data-types/datetime.md)。

**返される値**

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

**同じタイムスタンプの複数のUUIDの例**

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

この関数は、同じタイムスタンプでの複数の呼び出しが一意で単調増加するUUIDを生成することを保証します。

## empty {#empty}

入力UUIDが空であるかどうかをチェックします。

**構文**

```sql
empty(UUID)
```

UUIDはすべてゼロ（ゼロUUID）を含む場合、空と見なされます。

この関数は、[Arrays](/sql-reference/functions/array-functions#empty)や[Strings](string-functions.md#empty)にも適用されます。

**引数**

- `x` — UUID。 [UUID](../data-types/uuid.md)。

**返される値**

- 空のUUIDの場合は`1`、非空のUUIDの場合は`0`を返します。 [UInt8](../data-types/int-uint.md)。

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

入力UUIDが非空であるかどうかをチェックします。

**構文**

```sql
notEmpty(UUID)
```

UUIDはすべてゼロ（ゼロUUID）を含む場合、空と見なされます。

この関数は、[Arrays](/sql-reference/functions/array-functions#notEmpty)や[Strings](string-functions.md#notempty)にも適用されます。

**引数**

- `x` — UUID。 [UUID](../data-types/uuid.md)。

**返される値**

- 非空のUUIDの場合は`1`、空のUUIDの場合は`0`を返します。 [UInt8](../data-types/int-uint.md)。

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

```sql
toUUID(string)
```

**返される値**

UUID型値。

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

- `string` — 36文字のStringまたはFixedString(36)。 [String](../syntax.md#string)。
- `default` — 最初の引数がUUID型に変換できない場合に使用されるデフォルトのUUID。 [UUID](../data-types/uuid.md)。

**返される値**

UUID

```sql
toUUIDOrDefault(string, default)
```

**返される値**

UUID型値。

**使用例**

最初の例は、変換可能なUUID型に変換された最初の引数を返します:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

結果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

2番目の例は、最初の引数がUUID型に変換できないため、2番目の引数（提供されたデフォルトUUID）を返します:

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

String型の引数を取り、UUIDにパースしようとします。失敗した場合はNULLを返します。

```sql
toUUIDOrNull(string)
```

**返される値**

Nullable(UUID)型値。

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

String型の引数を取り、UUIDにパースしようとします。失敗した場合はゼロUUIDを返します。

```sql
toUUIDOrZero(string)
```

**返される値**

UUID型値。

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

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`形式で36文字を含む`string`を受け取り、そのバイナリ表現として[FixedString(16)](../data-types/fixedstring.md)を返します。形式は`variant`によってオプションで指定できます（デフォルトは`Big-endian`）。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

- `string` — 36文字の[String](/sql-reference/data-types/string)または[FixedString](/sql-reference/data-types/string)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定された型を表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

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

UUIDのバイナリ表現を含む`binary`を受け取り、形式は`variant`（デフォルトは`Big-endian`）でオプションとして指定でき、テキスト形式で36文字を含む文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant = 1])
```

**引数**

- `binary` — UUIDのバイナリ表現としての[FixedString(16)](../data-types/fixedstring.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定された型を表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返される値**

String。

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

[UUID](../data-types/uuid.md)を受け取り、そのバイナリ表現を[FixedString(16)](../data-types/fixedstring.md)として返します。形式は`variant`（デフォルトは`Big-endian`）でオプションとして指定できます。この関数は、UUIDから文字列への中間変換を必要とせず、`UUIDStringToNum(toString(uuid))`という2つの別の関数への呼び出しを置き換えます。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

- `uuid` — [UUID](../data-types/uuid.md)。
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)で指定された型を表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

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
- `timezone` — 返される値のための[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。 [String](../data-types/string.md)。

**返される値**

- ミリ秒精度のタイムスタンプ。UUIDが有効なバージョン7 UUIDでない場合、1970-01-01 00:00:00.000を返します。 [DateTime64(3)](../data-types/datetime64.md)。

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

ClickHouseサーバーの最初の起動時に生成されたランダムUUIDを返します。UUIDはClickHouseサーバーディレクトリ（例：`/var/lib/clickhouse/`）内のファイル`uuid`に保存され、サーバーの再起動間で保持されます。

**構文**

```sql
serverUUID()
```

**返される値**

- サーバーのUUID。 [UUID](../data-types/uuid.md)。

## generateSnowflakeID {#generatesnowflakeid}

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)を生成します。
この関数は、同時に実行されるスレッドおよびクエリにおいて、タイムスタンプ内のカウンターフィールドがすべての関数呼び出しで単調増加することを保証します。

実装の詳細については、「["Snowflake ID生成"](#snowflake-id-generation)」を参照してください。

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

- `expr` — クエリ内で関数が複数回呼び出される場合に [共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination) をバイパスするために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返されるSnowflake IDには影響しません。オプション。
- `machine_id` — 機械ID、最下位10ビットが使用されます。 [Int64](../data-types/int-uint.md)。オプション。

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

**行ごとに複数のSnowflake IDを生成する例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式と機械IDを持つ例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
この関数は廃止されており、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効な場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに[snowflakeIDToDateTime](#snowflakeidtodatetime)関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)形式で抽出します。

**構文**

```sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は、タイムゾーンに従って`time_string`を解析します。オプション。 [String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)型で返します。

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
この関数は廃止されており、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効な場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに[snowflakeIDToDateTime64](#snowflakeidtodatetime64)関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime64](../data-types/datetime64.md)形式で抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

- `value` — Snowflake ID。 [Int64](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は、タイムゾーンに従って`time_string`を解析します。オプション。 [String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを、スケール=3の[DateTime64](../data-types/datetime64.md)型（つまりミリ秒精度）で返します。

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
この関数は廃止されており、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効な場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに[dateTimeToSnowflakeID](#datetimetosnowflakeid)関数を使用してください。
:::

[DateTime](../data-types/datetime.md)値を指定された時間での最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

- `value` — 時間付き日付。 [DateTime](../data-types/datetime.md)。

**返される値**

- 指定された時間での最初のSnowflake IDとして[ Int64](../data-types/int-uint.md)データ型に変換された入力値。

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
この関数は廃止されており、設定 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) が有効な場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに[dateTime64ToSnowflakeID](#datetime64tosnowflakeid)関数を使用してください。
:::

[DateTime64](../data-types/datetime64.md)を指定された時間での最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

- `value` — 時間付き日付。 [DateTime64](../data-types/datetime64.md)。

**返される値**

- 指定された時間での最初のSnowflake IDとして[ Int64](../data-types/int-uint.md)データ型に変換された入力値。

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

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

- `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - 1970年1月1日からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0（1970年1月1日）。Twitter/Xのエポック（2015年1月1日）の場合は1288834974657を指定します。オプション。 [UInt*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は、タイムゾーンに従って`time_string`を解析します。オプション。 [String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントを[DateTime](../data-types/datetime.md)型で返します。

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

- `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
- `epoch` - 1970年1月1日からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0（1970年1月1日）。Twitter/Xのエポック（2015年1月1日）の場合は1288834974657を指定します。オプション。 [UInt*](../data-types/int-uint.md)。
- `time_zone` — [タイムゾーン](/operations/server-configuration-parameters/settings.md#timezone)。関数は、タイムゾーンに従って`time_string`を解析します。オプション。 [String](../data-types/string.md)。

**返される値**

- `value`のタイムスタンプコンポーネントをスケール=3の[DateTime64](../data-types/datetime64.md)型（つまりミリ秒精度）で返します。

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

[DateTime](../data-types/datetime.md)値を指定された時間での最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 時間付き日付。 [DateTime](../data-types/datetime.md)。
- `epoch` - 1970年1月1日からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0（1970年1月1日）。Twitter/Xのエポック（2015年1月1日）の場合は1288834974657を指定します。オプション。 [UInt*](../data-types/int-uint.md)。

**返される値**

- 指定された時間での最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)に変換された入力値。

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

[DateTime64](../data-types/datetime64.md)を指定された時間での最初の[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)に変換します。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

- `value` — 時間付き日付。 [DateTime64](../data-types/datetime64.md)。
- `epoch` - 1970年1月1日からのミリ秒単位でのSnowflake IDのエポック。デフォルトは0（1970年1月1日）。Twitter/Xのエポック（2015年1月1日）の場合は1288834974657を指定します。オプション。 [UInt*](../data-types/int-uint.md)。

**返される値**

- 指定された時間での最初のSnowflake IDとして[UInt64](../data-types/int-uint.md)に変換された入力値。

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

## また見る {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
