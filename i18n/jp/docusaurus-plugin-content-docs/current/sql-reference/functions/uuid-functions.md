---
description: 'UUID を扱う関数に関するドキュメント'
sidebar_label: 'UUID'
slug: /sql-reference/functions/uuid-functions
title: 'UUID を扱う関数'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# UUID を扱う関数



## UUIDv7 の生成

生成される UUID には、Unix ミリ秒単位の 48 ビットのタイムスタンプに続いて、バージョン「7」（4 ビット）、同一ミリ秒内で UUID を区別するためのカウンタ（バリアントフィールドの値「2」（2 ビット）を含む 42 ビット）、およびランダムフィールド（32 ビット）が含まれます。
任意のタイムスタンプ（`unix_ts_ms`）に対して、カウンタはランダムな値から開始され、タイムスタンプが変化するまで新しい UUID が生成されるたびに 1 ずつ増分されます。カウンタがオーバーフローした場合、タイムスタンプフィールドが 1 増分され、カウンタは新しいランダムな開始値にリセットされます。
UUID 生成関数は、同時に実行されているスレッドおよびクエリにおけるすべての関数呼び出しにわたり、同一タイムスタンプ内のカウンタフィールドが単調に増加することを保証します。

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


## Snowflake ID の生成

生成される Snowflake ID には、現在の Unix タイムスタンプのミリ秒値（41 ビット + 最上位 1 ビットのゼロ）、続いてマシン ID（10 ビット）、さらに同一ミリ秒内の ID を区別するためのカウンタ（12 ビット）が含まれます。任意のタイムスタンプ（`unix_ts_ms`）に対して、カウンタは 0 から開始し、新しい Snowflake ID が生成されるたびに 1 ずつインクリメントされ、タイムスタンプが変わるまで続きます。カウンタがオーバーフローした場合、タイムスタンプフィールドが 1 増加し、カウンタは 0 にリセットされます。

:::note
生成される Snowflake ID は UNIX エポック 1970-01-01 を基準としています。Snowflake ID のエポックに関する標準や推奨値は存在しないため、他のシステムの実装では、たとえば Twitter/X（2010-11-04）や Mastodon（2015-01-01）のように、異なるエポックが用いられている場合があります。
:::

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|0|                         タイムスタンプ                           |
├─┼                 ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                   |     マシンID    |    マシンシーケンス番号    |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```


## generateUUIDv4

[バージョン 4](https://tools.ietf.org/html/rfc4122#section-4.4) の [UUID](../data-types/uuid.md) を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

* `expr` — クエリ内で関数が複数回呼び出される場合に、[共通部分式の除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は、返される UUID に影響を与えません。省略可能。

**戻り値**

UUIDv4 型の値。

**例**

まず、UUID 型の列を持つテーブルを作成し、次に生成した UUIDv4 をテーブルに挿入します。

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


## generateUUIDv7

[バージョン 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) の [UUID](../data-types/uuid.md) を生成します。

UUID の構造、カウンターの管理、および同時実行性に関する保証の詳細については、「[UUIDv7 generation](#uuidv7-generation)」セクションを参照してください。

:::note
2024 年 4 月時点では、バージョン 7 UUID はドラフト段階であり、そのレイアウトは将来変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

* `expr` — クエリ内でこの関数が複数回呼び出される場合に、[共通部分式除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。式の値は返される UUID に影響しません。省略可能。

**戻り値**

UUIDv7 型の値。

**例**

まず UUID 型の列を持つテーブルを作成し、次に生成された UUIDv7 をテーブルに挿入します。

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv7();

SELECT * FROM tab;
```

結果：

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


## dateTimeToUUIDv7

指定した時刻を表す [DateTime](../data-types/datetime.md) の値を、その時刻に対応する [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) に変換します。

UUID の構造、カウンタの管理、および並行性に関する保証の詳細については、「[UUIDv7 generation](#uuidv7-generation)」セクションを参照してください。

:::note
2024年4月時点では、バージョン 7 UUID はドラフト仕様であり、そのレイアウトは将来変更される可能性があります。
:::

**構文**

```sql
dateTimeToUUIDv7(value)
```

**引数**

* `value` — 日時。 [DateTime](../data-types/datetime.md)。

**戻り値**

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

この関数は、同じタイムスタンプで複数回呼び出された場合でも、一意で単調に増加する UUID が生成されることを保証します。


## empty

入力された UUID が空かどうかを判定します。

**構文**

```sql
empty(UUID)
```

UUID がすべてゼロ（ゼロ UUID）である場合、その UUID は空とみなされます。

この関数は Array および String に対しても動作します。

**引数**

* `x` — UUID。 [UUID](../data-types/uuid.md)。

**戻り値**

* 空の UUID の場合は `1`、空でない UUID の場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

UUID 値を生成するために、ClickHouse は [generateUUIDv4](#generateuuidv4) 関数を提供しています。

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


## notEmpty

入力された UUID が空でないかどうかを判定します。

**構文**

```sql
notEmpty(UUID)
```

UUID がすべてゼロで構成されている場合（ゼロ UUID）、空と見なされます。

この関数は Array や String に対しても動作します。

**引数**

* `x` — UUID。 [UUID](../data-types/uuid.md)。

**戻り値**

* 空でない UUID の場合は `1`、空の UUID の場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

UUID の値を生成するには、ClickHouse は [generateUUIDv4](#generateuuidv4) 関数を提供します。

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


## toUUID

String 型の値を UUID 型に変換します。

```sql
toUUID(string)
```

**戻り値**

UUID 型の値。

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


## toUUIDOrDefault

**引数**

* `string` — 36 文字の文字列、または FixedString(36)。[String](../syntax.md#string)。
* `default` — 最初の引数を UUID 型に変換できない場合にデフォルト値として使用される UUID。[UUID](../data-types/uuid.md)。

**返される値**

UUID

```sql
toUUIDOrDefault(文字列, デフォルト)
```

**戻り値**

`UUID` 型の値。

**使用例**

この最初の例では、変換可能な場合、最初の引数を `UUID` 型に変換して返します。

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

結果:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

この2番目の例では、最初の引数をUUID型に変換できないため、2番目の引数（指定されたデフォルトのUUID）が返されます。

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

結果:

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull

String 型の引数を受け取り、UUID 型としてパースを試みます。失敗した場合は NULL を返します。

```sql
toUUIDOrNull(文字列)
```

**戻り値**

`Nullable(UUID)` 型の値。

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


## toUUIDOrZero

`String` 型の引数を受け取り、UUID へのパースを試みます。パースに失敗した場合は、オールゼロの UUID を返します。

```sql
toUUIDOrZero(文字列)
```

**戻り値**

UUID 型の値。

**使用例**

```sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

結果：

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```


## UUIDStringToNum

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` という形式の 36 文字の `string` を受け取り、そのバイナリ表現として [FixedString(16)](../data-types/fixedstring.md) を返します。バイナリ表現の形式はオプションの `variant` で指定でき、デフォルトは `Big-endian` です。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

* `string` — 長さ 36 文字の [String](/sql-reference/data-types/string) または [FixedString](/sql-reference/data-types/string)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアントを表す整数。1 = `Big-endian` (デフォルト)、2 = `Microsoft`。

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

結果：

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```


## UUIDNumToString

UUID のバイナリ表現を格納した `binary` を受け取り、その形式を `variant` で任意指定できます（省略時は `Big-endian`）。テキスト形式の 36 文字からなる文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant = 1])
```

**引数**

* `binary` — UUID をバイナリで表現した [FixedString(16)](../data-types/fixedstring.md) 型。
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアントを表す整数。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**返り値**

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


## UUIDToNum

[UUID](../data-types/uuid.md) を受け取り、そのバイナリ表現を [FixedString(16)](../data-types/fixedstring.md) として返します。`variant`（デフォルトは `Big-endian`）でフォーマットを指定することもできます。この関数は、`UUIDStringToNum(toString(uuid))` という 2 つの個別の関数呼び出しを置き換えるものであり、UUID からバイト列を抽出する際に、UUID を文字列に変換する中間ステップが不要になります。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

* `uuid` — [UUID](../data-types/uuid.md)。
* `variant` — 整数で、[RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアントを表す。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。

**戻り値**

UUID のバイナリ表現。

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


## UUIDv7ToDateTime

UUID バージョン 7 のタイムスタンプ部分を返します。

**構文**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

* `uuid` — バージョン 7 の [UUID](../data-types/uuid.md)。
* `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**戻り値**

* ミリ秒単位の精度を持つタイムスタンプ。UUID が有効なバージョン 7 UUID でない場合は、1970-01-01 00:00:00.000 を返します。[DateTime64(3)](../data-types/datetime64.md)。

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

結果：

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```


## serverUUID

ClickHouse サーバーの初回起動時に生成されたランダムな UUID を返します。UUID は ClickHouse サーバーディレクトリ内の `uuid` ファイル（例: `/var/lib/clickhouse/`）に保存され、サーバーを再起動しても保持されます。

**構文**

```sql
serverUUID()
```

**返り値**

* サーバーの UUID。[UUID](../data-types/uuid.md)。


## generateSnowflakeID

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) を生成します。
この関数は、同時に実行されているスレッドやクエリ間でのすべての関数呼び出しにおいて、タイムスタンプ内のカウンタフィールドが単調に増加し続けることを保証します。

実装の詳細については、[「Snowflake ID generation」](#snowflake-id-generation) セクションを参照してください。

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

* `expr` — クエリ内でこの関数が複数回呼び出される場合に [共通部分式除去](/sql-reference/functions/overview#common-subexpression-elimination) を回避するために使用される任意の [式](/sql-reference/syntax#expressions)。式の値は返される Snowflake ID には影響しません。省略可。
* `machine_id` — マシン ID。下位 10 ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可。

**戻り値**

UInt64 型の値。

**例**

まず UInt64 型の列を持つテーブルを作成し、その後生成した Snowflake ID をテーブルに挿入します。

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

**1 行ごとに複数の Snowflake ID を生成する例**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシンIDを用いた例**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## snowflakeToDateTime

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効化されている場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに [snowflakeIDToDateTime](#snowflakeidtodatetime) 関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) から [DateTime](../data-types/datetime.md) 型のタイムスタンプ部分を抽出します。

**構文**

```sql
snowflakeToDateTime(値[, タイムゾーン])
```

**引数**

* `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は `time_string` を指定されたタイムゾーンに基づいて解析します。省略可能。[String](../data-types/string.md)。

**返される値**

* `value` に含まれるタイムスタンプ成分を [DateTime](../data-types/datetime.md) 値として返します。

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


## snowflakeToDateTime64

<DeprecatedBadge />

:::warning
この関数は非推奨で、[allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効になっている場合にのみ使用できます。
この関数は将来的に削除される予定です。

代わりに関数 [snowflakeIDToDateTime64](#snowflakeidtodatetime64) を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) から [DateTime64](../data-types/datetime64.md) 形式のタイムスタンプ部分を抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

* `value` — Snowflake ID。[Int64](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は、タイムゾーンに従って `time_string` を解析します。省略可能です。[String](../data-types/string.md)。

**戻り値**

* `value` のタイムスタンプ部分を、スケール = 3（ミリ秒精度）の [DateTime64](../data-types/datetime64.md) として返します。

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


## dateTimeToSnowflake

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) を有効にした場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに関数 [dateTimeToSnowflakeID](#datetimetosnowflakeid) を使用してください。
:::

[DateTime](../data-types/datetime.md) 値を、指定した時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

* `value` — 日時。[DateTime](../data-types/datetime.md)。

**返される値**

* 入力値を、その時刻に対応する最初の Snowflake ID を表す値として [Int64](../data-types/int-uint.md) データ型に変換したもの。

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


## dateTime64ToSnowflake

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効な場合にのみ使用できます。
この関数は将来削除される予定です。

代わりに [dateTime64ToSnowflakeID](#datetime64tosnowflakeid) 関数を使用してください。
:::

[DateTime64](../data-types/datetime64.md) を、指定された時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

* `value` — 日時。[DateTime64](../data-types/datetime64.md)。

**返される値**

* 入力値を、その時刻における最初の Snowflake ID として [Int64](../data-types/int-uint.md) データ型に変換した値。

**例**

クエリ:

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

結果：

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```


## snowflakeIDToDateTime

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を [DateTime](../data-types/datetime.md) 型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

* `value` — Snowflake ID。[UInt64](../data-types/int-uint.md)。
* `epoch` - Snowflake ID のエポック（基準時刻）。1970-01-01 からの経過ミリ秒。デフォルトは 0（1970-01-01）。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。省略可能。[UInt*](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` をこのタイムゾーンに従って解析します。省略可能。[String](../data-types/string.md)。

**返される値**

* `value` のタイムスタンプ成分を [DateTime](../data-types/datetime.md) 値として返します。

**例**

クエリ:

```sql
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

結果：

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeIDToDateTime64

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を、[DateTime64](../data-types/datetime64.md) 型の値として返します。

**構文**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**引数**

* `value` — Snowflake ID。 [UInt64](../data-types/int-uint.md)。
* `epoch` - Snowflake ID のエポック（1970-01-01 からの経過ミリ秒）。デフォルトは 0（1970-01-01）。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。省略可能。 [UInt*](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` をこのタイムゾーンに従って解釈します。省略可能。 [String](../data-types/string.md)。

**戻り値**

* `value` のタイムスタンプ部分を、スケール = 3（ミリ秒精度）の [DateTime64](../data-types/datetime64.md) として返します。

**例**

クエリ:

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

結果：

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## dateTimeToSnowflakeID

[DateTime](../data-types/datetime.md) 値を、与えられた時刻に対応する最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

* `value` — 時刻付きの日付。[DateTime](../data-types/datetime.md)。
* `epoch` - Snowflake ID のエポック時刻（1970-01-01 からのミリ秒）。デフォルトは 0（1970-01-01）。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**戻り値**

* 入力値を、その時刻における最初の Snowflake ID として [UInt64](../data-types/int-uint.md) に変換した値。

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


## dateTime64ToSnowflakeID

[DateTime64](../data-types/datetime64.md) を、与えられた時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

* `value` — 時刻付きの日付。[DateTime64](../data-types/datetime64.md)。
* `epoch` - Snowflake ID のエポックを、1970-01-01 からの経過ミリ秒で指定します。デフォルトは 0（1970-01-01）です。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。省略可能。[UInt*](../data-types/int-uint.md)。

**戻り値**

* 入力値を、その時刻における最初の Snowflake ID として [UInt64](../data-types/int-uint.md) に変換した値。

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


## 参照

* [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

{/*
  以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントで置き換えられます。タグを変更または削除しないでください。
  参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }


{/*AUTOGENERATED_START*/ }

## UUIDNumToString

導入: v1.1

UUID のバイナリ表現を受け取り、形式は省略可能な引数 `variant`（デフォルトは `Big-endian`）で指定でき、テキスト形式の 36 文字からなる文字列を返します。

**構文**

```sql
UUIDNumToString(binary[, variant])
```

**引数**

* `binary` — UUID のバイナリ表現。[`FixedString(16)`](/sql-reference/data-types/fixedstring)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で規定されているバリアント種別。1 = `Big-endian`（デフォルト）、2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

UUID を文字列で返します。[`String`](/sql-reference/data-types/string)

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

**Microsoft 版**

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


## UUIDStringToNum

導入バージョン: v1.1

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` という形式の 36 文字の文字列を受け取り、そのバイナリ表現として [FixedString(16)](../data-types/fixedstring.md) を返します。フォーマットは `variant` で指定でき、指定しない場合のデフォルトは `Big-endian` です。

**構文**

```sql
UUIDStringToNum(string[, variant = 1])
```

**引数**

* `string` — 36 文字の文字列または固定長文字列。[`String`](/sql-reference/data-types/string) または [`FixedString(36)`](/sql-reference/data-types/fixedstring)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で定義されているバリアント。1 = `Big-endian` (デフォルト)、2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

`string` のバイナリ形式を返します。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

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

**Microsoft 版**

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


## UUIDToNum

導入バージョン：v24.5

[UUID](../data-types/uuid.md) を受け取り、そのバイナリ表現を [FixedString(16)](../data-types/fixedstring.md) として返します。形式は `variant` で指定でき、デフォルトは `Big-endian` です。
この関数は、`UUIDStringToNum(toString(uuid))` という 2 段階の関数呼び出しを置き換えるもので、UUID からバイト列を取り出す際に UUID を文字列へ中間変換する必要がなくなります。

**構文**

```sql
UUIDToNum(uuid[, variant = 1])
```

**引数**

* `uuid` — UUID。[`String`](/sql-reference/data-types/string) または [`FixedString`](/sql-reference/data-types/fixedstring)
* `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1) で定義されているバリアント。1 = `Big-endian` (デフォルト)、2 = `Microsoft`。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

UUID のバイナリ表現を返します。[`FixedString(16)`](/sql-reference/data-types/fixedstring)

**例**

**使用例**

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

**Microsoft 版**

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


## UUIDv7ToDateTime

導入バージョン: v24.5

UUID バージョン 7 のタイムスタンプ部分を返します。

**構文**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**引数**

* `uuid` — バージョン 7 の UUID。[`String`](/sql-reference/data-types/string)
* `timezone` — 任意。返される値に対する[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)。[`String`](/sql-reference/data-types/string)

**戻り値**

ミリ秒精度のタイムスタンプを返します。UUID がバージョン 7 の有効な UUID でない場合は、`1970-01-01 00:00:00.000` を返します。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**タイムゾーン付き**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```


## dateTime64ToSnowflake

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効になっている場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID) 関数を使用してください。
:::

[DateTime64](../data-types/datetime64.md) を、指定された時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTime64ToSnowflake(value)
```

**引数**

* `value` — 時刻情報を含む日付。[`DateTime64`](/sql-reference/data-types/datetime64)

**戻り値**

入力値を、その時刻に対応する最初の Snowflake ID に変換して返します。[`Int64`](/sql-reference/data-types/int-uint)

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


## dateTime64ToSnowflakeID

導入: v24.6

[`DateTime64`](../data-types/datetime64.md) を、指定した時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

実装の詳細は、「[Snowflake ID generation](#snowflake-id-generation)」の節を参照してください。

**構文**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**引数**

* `value` — 時刻付きの日付。[`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64)
* `epoch` — Snowflake ID のエポック。1970-01-01 からの経過ミリ秒。既定値は 0（1970-01-01）。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。[`UInt*`](/sql-reference/data-types/int-uint)

**返り値**

指定した時刻に対応する最初の Snowflake ID を返します。[`UInt64`](/sql-reference/data-types/int-uint)

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


## dateTimeToSnowflake

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨で、[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効な場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに関数 [dateTimeToSnowflakeID](#dateTimeToSnowflakeID) を使用してください。
:::

[DateTime](../data-types/datetime.md) の値を、指定した時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflake(value)
```

**引数**

* `value` — 日時。[`DateTime`](/sql-reference/data-types/datetime)

**返される値**

指定した時刻における最初の Snowflake ID を返します。[`Int64`](/sql-reference/data-types/int-uint)

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


## dateTimeToSnowflakeID

導入バージョン: v24.6

[DateTime](../data-types/datetime.md) 値を、与えられた時刻における最初の [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) に変換します。

**構文**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**引数**

* `value` — 時刻情報を含む日付。[`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64)
* `epoch` — オプション。Snowflake ID のエポックを、1970-01-01 からの経過ミリ秒で指定します。デフォルトは 0（1970-01-01）です。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。[`UInt*`](/sql-reference/data-types/int-uint)

**戻り値**

指定した時刻における最初の Snowflake ID を表す値として、入力値を返します。[`UInt64`](/sql-reference/data-types/int-uint)

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


## dateTimeToUUIDv7

導入バージョン: v25.9

指定された時刻を基に、[DateTime](../data-types/datetime.md) の値を [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) に変換します。

UUIDv7 の構造、カウンター管理、および並行性に関する保証の詳細については、[「UUIDv7 generation」](#uuidv7-generation) セクションを参照してください。

:::note
2025 年 9 月時点では、バージョン 7 の UUID はドラフト段階であり、そのレイアウトは将来的に変更される可能性があります。
:::

**構文**

```sql
dateTimeToUUIDv7(value)
```

**引数**

* `value` — 日時。[`DateTime`](/sql-reference/data-types/datetime)

**戻り値**

UUIDv7 を返します。[`UUID`](/sql-reference/data-types/uuid)

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

**同一タイムスタンプに対する複数の UUID**

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


## generateSnowflakeID

導入バージョン: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) を生成します。

関数 `generateSnowflakeID` は、同時に実行されているスレッドおよびクエリにおけるすべての関数呼び出しに対して、タイムスタンプ内のカウンターフィールドが単調増加することを保証します。

実装の詳細については、「[Snowflake ID の生成](#snowflake-id-generation)」セクションを参照してください。

**構文**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**引数**

* `expr` — クエリ内でこの関数が複数回呼び出される場合に、[共通部分式除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の[式](/sql-reference/syntax#expressions)。この式の値は、返される Snowflake ID には影響しません。省略可。
* `machine_id` — マシン ID。下位 10 ビットが使用されます。[Int64](../data-types/int-uint.md)。省略可。

**戻り値**

Snowflake ID を返します。型は [`UInt64`](/sql-reference/data-types/int-uint) です。

**例**

**使用例**

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

**1 行あたり複数の Snowflake ID が生成される**

```sql title=Query
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=Response
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**式とマシン ID を使用する場合**

```sql title=Query
SELECT generateSnowflakeID('expr', 1);
```

```response title=Response
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## generateUUIDv4

導入バージョン: v1.1

[バージョン 4](https://tools.ietf.org/html/rfc4122#section-4.4) の [UUID](../data-types/uuid.md) を生成します。

**構文**

```sql
generateUUIDv4([expr])
```

**引数**

* `expr` — 省略可。クエリ内で関数が複数回呼び出される場合に、[共通部分式除去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用される任意の式です。この式の値は返される UUID には影響しません。

**戻り値**

UUIDv4 を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

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

**共通部分式除去**

```sql title=Query
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Response
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7

導入バージョン: v24.5

[バージョン7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04)の[UUID](../data-types/uuid.md)を生成します。

UUID の構造、カウンター管理、および同時実行性に関する保証の詳細については、「[UUIDv7 の生成](#uuidv7-generation)」セクションを参照してください。

:::note
2025年9月時点では、バージョン7 UUID はドラフト段階であり、そのレイアウトが将来変更される可能性があります。
:::

**構文**

```sql
generateUUIDv7([expr])
```

**引数**

* `expr` — 省略可。クエリ内でこの関数が複数回呼び出される場合に、[共通部分式の除去](/sql-reference/functions/overview#common-subexpression-elimination) を回避するために使用される任意の式。この式の値は、返される UUID には影響しません。[`Any`](/sql-reference/data-types)

**返り値**

UUIDv7 を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**使用例**

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

**共通部分式の除去**

```sql title=Query
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Response
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## readWKTLineString

導入バージョン: v

LineString 型ジオメトリの Well-Known Text (WKT) 表現を解析し、ClickHouse の内部形式で返します。

**構文**

```sql
readWKTLineString(wkt_string)
```

**引数**

* `wkt_string` — LineString ジオメトリを表す WKT 形式の入力文字列。[`String`](/sql-reference/data-types/string)

**戻り値**

この関数は、LineString ジオメトリの ClickHouse 内部表現を返します。

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

**2回目の呼び出し**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeIDToDateTime

導入バージョン: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を、[DateTime](../data-types/datetime.md) 型の値として返します。

**構文**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**引数**

* `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
* `epoch` — 省略可。Snowflake ID のエポックを、1970-01-01 からの経過ミリ秒で指定します。既定値は 0 (1970-01-01) です。Twitter/X エポック (2015-01-01) を使用する場合は 1288834974657 を指定します。[`UInt*`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は、タイムゾーンに従って `time_string` を解釈します。[`String`](/sql-reference/data-types/string)

**戻り値**

`value` のタイムスタンプ部分を返します。[`DateTime`](/sql-reference/data-types/datetime)

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


## snowflakeIDToDateTime64

導入バージョン: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を、[DateTime64](../data-types/datetime64.md) 型の値として返します。

**構文**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**引数**

* `value` — Snowflake ID。[`UInt64`](/sql-reference/data-types/int-uint)
* `epoch` — オプション。1970-01-01 からの経過時間（ミリ秒）で表される Snowflake ID のエポック。デフォルトは 0（1970-01-01）。Twitter/X のエポック（2015-01-01）の場合は 1288834974657 を指定します。[`UInt*`](/sql-reference/data-types/int-uint)
* `time_zone` — オプション。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は `time_string` をそのタイムゾーンに基づいて解析します。[`String`](/sql-reference/data-types/string)

**返される値**

`value` のタイムスタンプ成分を、スケール = 3（ミリ秒精度）の `DateTime64` として返します。[`DateTime64`](/sql-reference/data-types/datetime64)

**例**

**使用例**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```


## snowflakeToDateTime

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効な場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに [`snowflakeIDToDateTime`](#snowflakeIDToDateTime) 関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) から、[DateTime](../data-types/datetime.md) 形式のタイムスタンプ部分を抽出します。

**構文**

```sql
snowflakeToDateTime(value[, time_zone])
```

**引数**

* `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可能。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。関数は `time_string` をそのタイムゾーンに従って解析します。[`String`](/sql-reference/data-types/string)

**戻り値**

`value` のタイムスタンプ部分を返します。[`DateTime`](/sql-reference/data-types/datetime)

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


## snowflakeToDateTime64

導入バージョン: v21.10

<DeprecatedBadge />

:::warning
この関数は非推奨であり、[`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 設定が有効な場合にのみ使用できます。
この関数は将来のある時点で削除されます。

代わりに [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64) 関数を使用してください。
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) のタイムスタンプ部分を [DateTime64](../data-types/datetime64.md) 形式で抽出します。

**構文**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**引数**

* `value` — Snowflake ID。[`Int64`](/sql-reference/data-types/int-uint)
* `time_zone` — 省略可能。[Timezone](/operations/server-configuration-parameters/settings.md#timezone)。この関数は、指定されたタイムゾーンに従って `time_string` を解析します。[`String`](/sql-reference/data-types/string)

**返り値**

`value` のタイムスタンプ部分を返します。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

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


## toUUIDOrDefault

導入バージョン: v21.1

`String` 型の値を UUID 型に変換します。変換に失敗した場合は、エラーをスローする代わりにデフォルトの UUID 値を返します。

この関数は、標準的な UUID 形式（xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）の 36 文字からなる文字列の解析を試みます。
文字列を有効な UUID に変換できない場合、関数は指定されたデフォルトの UUID 値を返します。

**構文**

```sql
toUUIDOrDefault(文字列, デフォルト)
```

**引数**

* `string` — UUID に変換される 36 文字の String、または FixedString(36)。- `default` — 最初の引数が UUID 型に変換できない場合に返される UUID 値。

**戻り値**

変換に成功した場合は変換結果の UUID を返し、変換に失敗した場合は `default` の UUID を返します。[`UUID`](/sql-reference/data-types/uuid)

**例**

**変換が成功すると、パースされた UUID が返されます**

```sql title=Query
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**変換失敗時はデフォルトの UUID を返す**

```sql title=Query
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull

導入バージョン: v20.12

入力値を `UUID` 型の値に変換しますが、エラーが発生した場合は `NULL` を返します。
[`toUUID`](#touuid) と同様ですが、変換エラー時に例外をスローする代わりに `NULL` を返します。

サポートされる引数:

* 標準形式の UUID の文字列表現（8-4-4-4-12 個の 16 進数）。
* ハイフンなしの UUID の文字列表現（32 個の 16 進数）。

サポートされない引数（`NULL` を返す）:

* 無効な文字列形式。
* 文字列以外の型。
* 不正な形式の UUID。

**構文**

```sql
toUUIDOrNull(x)
```

**引数**

* `x` — UUID の文字列表現。[`String`](/sql-reference/data-types/string)

**返される値**

成功した場合は UUID 値を、それ以外の場合は `NULL` を返します。[`UUID`](/sql-reference/data-types/uuid) または [`NULL`](/sql-reference/syntax#null)

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

{/*AUTOGENERATED_END*/ }
