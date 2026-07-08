---
alias: []
description: 'RowBinary フォーマットのドキュメント'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \{#description\}

`RowBinary` フォーマットは、バイナリ形式で行ごとにデータをパースします。
行および値は区切り文字なしで連続して並びます。
データがバイナリ形式であるため、`FORMAT RowBinary` の後に続く区切り文字は次のように厳密に決められています。

* 任意数の空白文字:
  * `' '` (スペース - コード `0x20`)
  * `'\t'` (タブ - コード `0x09`)
  * `'\f'` (フォームフィード - コード `0x0C`)
* 続いて、正確に 1 つの改行シーケンス:
  * Windows スタイルの `"\r\n"`
  * または Unix スタイルの `'\n'`
* その直後にバイナリデータが続きます。

:::note
このフォーマットは行ベースであるため、[Native](../Native.md) フォーマットより効率が劣ります。
:::

## データ型のワイヤ形式 \{#data-types-wire-format\}

:::tip
例で示されているクエリのほとんどは、curl を使ってファイルに出力する形で実行できます。

```bash
curl -XPOST "http://localhost:8123?default_format=RowBinary" \
  --data-binary "SELECT 42 :: UInt32"  > out.bin
```

:::

その後、データを16進エディタで確認できます。


### 符号なし LEB128 (リトルエンディアンベース128)  \{#unsigned-leb128\}

`String`、`Array`、`Map` などの可変長データ型の長さをエンコードするために使用される、**符号なしリトルエンディアン**の可変長整数エンコーディングです。実装例は [LEB128 の wiki ページ](https://en.wikipedia.org/wiki/LEB128#Decode_unsigned_integer) にあります。

### (U)Int8, (U)Int16, (U)Int32, (U)Int64, (U)Int128, (U)Int256 \{#integer-types\}

すべての整数型は、適切なバイト数の**リトルエンディアン**でエンコードされます。符号付き型 (`Int8` から `Int256`) は、**2 の補数**表現を使用します。ほとんどの言語では、組み込みツールまたは広く利用されているライブラリを使って、このような整数をバイト配列から取り出せます。`Int128`/`Int256` および `UInt128`/`UInt256` は、多くの言語のネイティブ整数型のサイズを超えるため、カスタムのデシリアライズが必要になる場合があります。

### Bool \{#bool\}

ブール値は1バイトでエンコードされ、`UInt8` と同様にデシリアライズできます。

* `0` は `false`
* `1` は `true`

### Float32, Float64 \{#float32-float64\}

`Float32` は 4 バイト、`Float64` は 8 バイトでエンコードされる**リトルエンディアン**の浮動小数点数です。整数と同様に、ほとんどの言語ではこれらの値をデシリアライズするための適切なツールが提供されています。

### BFloat16 \{#bfloat16\}

[BFloat16](https://clickhouse.com/docs/sql-reference/data-types/float#bfloat16) (Brain Floating Point) は、Float32と同じ範囲を持ちながら精度を抑えた16ビット浮動小数点形式で、機械学習ワークロードに適しています。ワイヤ形式は、基本的にFloat32値の上位16ビットです。使用している言語がこれをネイティブでサポートしていない場合、最も簡単な方法は `UInt16` として読み書きし、`Float32` との間で変換することです。

BFloat16をFloat32に変換するには (擬似コード) :

```text
// Read 2 bytes as little-endian UInt16
// Left-shift by 16 bits to get Float32 bits
bfloat16Bits = readUInt16()
float32Bits = bfloat16Bits << 16
floatValue = reinterpretAsFloat32(float32Bits)
```

Float32 を BFloat16 に変換するには (擬似コード) :

```text
// Right-shift Float32 bits by 16 to truncate to BFloat16
float32Bits = reinterpretAsUInt32(floatValue)
bfloat16Bits = float32Bits >> 16
writeUInt16(bfloat16Bits)
```

`BFloat16` の内部値の例:

```sql
SELECT CAST(1.25, 'BFloat16')
```

```text
0xA0, 0x3F, // 1.25 as BFloat16
```


### Decimal32, Decimal64, Decimal128, Decimal256 \{#decimal\}

Decimal 型は、それぞれのビット幅に対応する**リトルエンディアン**の整数として表現されます。

* `Decimal32` - 4 バイト、つまり `Int32`。
* `Decimal64` - 8 バイト、つまり `Int64`。
* `Decimal128` - 16 バイト、つまり `Int128`。
* `Decimal256` - 32 バイト、つまり `Int256`。

Decimal 値をデシリアライズする際、整数部と小数部は次の疑似コードで求められます。

```text
let scale_multiplier = 10 ** scale
let whole_part = trunc(value / scale_multiplier)  // truncate toward zero
let fractional_part = value % scale_multiplier
let result = Decimal(whole_part, fractional_part)
```

ここで、`trunc` は 0 方向への切り捨てを行います (負の値では結果が異なるため、床除算ではありません) 。また、`scale` は小数点以下の桁数です。例えば、`Decimal(10, 2)` (`Decimal32(2)` と同等) の場合、`scale` は `2` で、値 `12345` は `(123, 45)` として表されます。

シリアライズには、この逆の操作が必要です。

```text
let scale_multiplier = 10 ** scale
let result = whole_part * scale_multiplier + fractional_part
```

詳細は、[ClickHouse ドキュメントの Decimal 型](https://clickhouse.com/docs/sql-reference/data-types/decimal)を参照してください。


### String \{#string\}

ClickHouse の文字列は**任意のバイト列**です。有効な UTF-8 である必要はありません。長さのプレフィックスは、**文字数**ではなく**バイト長**です。

次の 2 つのパートでエンコードされます。

1. 文字列の長さをバイト単位で示す可変長整数 (LEB128) 。
2. 文字列の生のバイト列。

たとえば、文字列 `foobar` は次のように *7* バイトでエンコードされます。

```text
0x06, // LEB128 length of the string (6)
0x66, // 'f'
0x6f, // 'o'
0x6f, // 'o'
0x62, // 'b'
0x61, // 'a'
0x72, // 'r'
```


### FixedString \{#fixedstring\}

`String` とは異なり、`FixedString` は固定長で、その長さは schema で定義されます。バイト列としてエンコードされ、値が `N` より短い場合は末尾がゼロバイトで埋められます。

:::note
`FixedString` を読み取る際、末尾のゼロバイトはパディングの場合もあれば、データ中の実際の `\0` 文字の場合もあり、ワイヤ上では区別できません。ClickHouse 自体は `N` バイトすべてをそのまま保持します。
:::

空の `FixedString(3)` には、パディング用のゼロのみが含まれます。

```text
0x00, 0x00, 0x00
```

文字列 `hi` を含む空でない `FixedString(3)`:

```text
0x68, // 'h'
0x69, // 'i'
0x00, // padding zero
```

文字列 `bar` を含む空ではない `FixedString(3)`:

```text
0x62, // 'b'
0x61, // 'a'
0x72, // 'r'
```

最後の例では、*3* バイトすべてが使われているため、パディングは不要です。


### Date \{#date\}

`1970-01-01` ***からの経過日数*** を表す `UInt16` (2 バイト) として格納されます。

サポートされる値の範囲: `[1970-01-01, 2149-06-06]`。

`Date` の内部値の例:

```sql
SELECT CAST('2024-01-15', 'Date') AS d
```

```text
0x19, 0x4D, // 19737 as UInt16 (little-endian) = 19737 days since 1970-01-01
```


### Date32 \{#date32\}

`1970-01-01` ***以前または以後***&#x306E;日数を表す `Int32` (4 バイト) として格納されます。

サポートされる値の範囲: `[1900-01-01, 2299-12-31]`。

`Date32` の内部値の例:

```sql
SELECT CAST('2024-01-15', 'Date32') AS d
```

```text
0x19, 0x4D, 0x00, 0x00, // 19737 as Int32 (little-endian) = 19737 days since 1970-01-01
```

エポック以前の日付:

```sql
SELECT CAST('1900-01-01', 'Date32') AS d
```

```text
0x21, 0x9C, 0xFF, 0xFF, // -25567 as Int32 (little-endian) = 25567 days before 1970-01-01
```


### DateTime \{#datetime\}

`1970-01-01 00:00:00 UTC` ***からの*** 経過秒数を表す `UInt32` (4 バイト) として格納されます。

構文:

```text
DateTime([timezone])
```

たとえば、`DateTime` または `DateTime('UTC')` です。

:::note
バイナリ値は常に UTC エポックオフセットです。タイムゾーンによってエンコーディングが変わることはありません。ただし、挿入時に文字列値がどのように解釈されるかにはタイムゾーンが**確かに**影響します。たとえば、`'2024-01-15 10:30:00'` を `DateTime('America/New_York')` カラムに挿入すると、同じ文字列を `DateTime('UTC')` カラムに挿入した場合とは異なるエポック値が格納されます。これは、その文字列がカラムのタイムゾーンにおけるローカル時刻として解釈されるためです。ワイヤ上では、どちらも単なる `UInt32` のエポック秒です。
:::

サポートされる値の範囲: `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`。

`DateTime` の基になる値の例:

```sql
SELECT CAST('2024-01-15 10:30:00', 'DateTime(\'UTC\')') AS d
```

```text
0x28, 0x09, 0xA5, 0x65, // 1705314600 as UInt32 (little-endian)
```


### DateTime64 \{#datetime64\}

`1970-01-01 00:00:00 UTC`を基準として、そ&#x306E;***前後***&#x306E;**ティック**数を表す`Int64` (8バイト) として格納されます。ティックの分解能は`precision`パラメータで定義されます。以下の構文を参照してください。

```text
DateTime64(precision, [timezone])
```

ここで `precision` は `0` から `9` までの整数です。通常使用されるのは、`3` (ミリ秒) 、`6` (マイクロ秒) 、
`9` (ナノ秒) のみです。

有効な DateTime64 定義の例: `DateTime64(0)`、`DateTime64(3)`、`DateTime64(6, 'UTC')`、`DateTime64(9, 'Europe/Amsterdam')`。

:::note
`DateTime` と同様に、バイナリ値は常に UTC エポックからのオフセットです。タイムゾーンは、文字列値が insert 時にどのように解釈されるかに影響します ([DateTime](#datetime) の注記を参照) が、エンコーディング自体は常に UTC エポックからの `Int64` ティックです。
:::

`DateTime64` 型の基になる `Int64` 値は、UNIX エポックの前後における以下の単位数として解釈できます。

* `DateTime64(0)` - 秒。
* `DateTime64(3)` - ミリ秒。
* `DateTime64(6)` - マイクロ秒。
* `DateTime64(9)` - ナノ秒。

サポートされる値の範囲: `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`。

`DateTime64` の基になる値の例:

* `DateTime64(3)`: 値 `1546300800000` は `2019-01-01 00:00:00 UTC` を表します。
* `DateTime64(6)`: 値 `1705314600123456` は `2024-01-15 10:30:00.123456 UTC` を表します。
* `DateTime64(9)`: 値 `1705314600123456789` は `2024-01-15 10:30:00.123456789 UTC` を表します。

:::note
最大値の精度は 8 桁です。最大精度の 9 桁 (ナノ秒) を使用する場合、サポートされる最大値は UTC で 2262-04-11 23:47:16 です。
:::


### Time \{#time\}

秒単位の時刻値を表す `Int32` として格納されます。負の値も有効です。

サポートされる値の範囲: `[-999:59:59, 999:59:59]` (つまり `[-3599999, 3599999]` 秒) 。

:::note
現時点では、`Time` または `Time64` を使用するには、設定 `enable_time_time64_type` を `1` に設定する必要があります。
:::

`Time` の内部値の例:

```sql
SET enable_time_time64_type = 1;
SELECT CAST('15:32:16', 'Time') AS t
```

```text
0x80, 0xDA, 0x00, 0x00, // 55936 seconds = 15:32:16
```


### Time64 \{#time64\}

内部的には `Decimal64` (`Int64` として格納) で保持され、小数秒を含む時刻値を表します。精度は設定可能です。負の値も有効です。

構文:

```text
Time64(precision)
```

ここで `precision` は `0` から `9` までの整数です。一般的な値は、`3` (ミリ秒) 、`6` (マイクロ秒) 、`9` (ナノ秒) です。

サポートされる値の範囲は `[-999:59:59.xxxxxxxxx, 999:59:59.xxxxxxxxx]` です。

:::note
現時点では、`Time` または `Time64` を使用するには、設定 `enable_time_time64_type` を `1` に設定する必要があります。
:::

内部の `Int64` 値は、`10^precision` 倍された秒の小数部を表します。

`Time64` の内部値の例:

```sql
SET enable_time_time64_type = 1;
SELECT CAST('15:32:16.123456', 'Time64(6)') AS t
```

```text
0x40, 0x82, 0x0D, 0x06,
0x0D, 0x00, 0x00, 0x00, // 55936123456 as Int64
// 55936123456 / 10^6 = 55936.123456 seconds = 15:32:16.123456
```


### Interval 型 \{#interval-types\}

すべての Interval 型は `Int64` (8 バイト、リトルエンディアン) として格納されます。値は対応する時間単位の個数を表します。負の値も有効です。

Interval 型は次のとおりです: `IntervalNanosecond`, `IntervalMicrosecond`, `IntervalMillisecond`, `IntervalSecond`, `IntervalMinute`, `IntervalHour`, `IntervalDay`, `IntervalWeek`, `IntervalMonth`, `IntervalQuarter`, `IntervalYear`.

:::note
Interval 型名 (例: `IntervalSecond` と `IntervalDay`) によって、格納される値の単位が決まります。wire エンコーディングは常に同一です。
:::

基になる値の例:

```sql
SELECT INTERVAL 5 SECOND   AS a,
     INTERVAL 10 DAY     AS b,
     INTERVAL -7 DAY     AS c,
     INTERVAL 3 YEAR     AS d,
     INTERVAL 500 MICROSECOND AS e
```

```text
// IntervalSecond: 5
0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// IntervalDay: 10
0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// IntervalDay: -7
0xF9, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
// IntervalYear: 3
0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
// IntervalMicrosecond: 500
0xF4, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
```


### Enum8, Enum16 \{#enum8-enum16\}

enum 定義内の列挙値の索引を表す 1 バイト (`Enum8` == `Int8`) または 2 バイト (`Enum16` == `Int16`) の値として格納されます。storage type は**符号付き**である点に注意してください。つまり、列挙値には負の値を指定できます (例: `Enum8('a' = -128, 'b' = 0)`) 。

Enum は、次のようにシンプルに定義できます。

```sql
SELECT 1 :: Enum8('hello' = 1, 'world' = 2) AS e;
```

```text
   ┌─e─────┐
1. │ hello │
   └───────┘
```

上記で定義したEnum8は、クライアントでは以下の値にマップされます：

```text
Map<Int8, String> {
  1: 'hello',
  2: 'world'
}
```

あるいは、次のように、より複雑な方法で行うこともできます。

```sql
SELECT 42 :: Enum16('f\'' = 1, 'x =' = 2, 'b\'\'' = 3, '\'c=4=' = 42, '4' = 1234) AS e;
```

```text
   ┌─e─────┐
1. │ 'c=4= │
   └───────┘
```

上で定義した Enum16 では、Client 側で以下の値にマップされます:

```text
Map<Int16, String> {
  1:    'f\'',
  2:    'x =',
  3:    'b\'',
  42:   '\'c=4=',
  1234: '4'
}
```

データ型パーサーにおける主な課題は、`\'` のような enum 定義内のエスケープされた記号や、引用符で囲まれた文字列内に現れる可能性のある `=` のような特殊記号を追跡することです。


### UUID \{#uuid\}

16 バイトのシーケンスとして表されます。UUID は **2 つのリトルエンディアン `UInt64` 値**として格納されます。標準的な UUID 表現の先頭 8 バイトはバイト順が反転され、後続の 8 バイトも独立してバイト順が反転されます。

例えば、UUID `61f0c404-5cb3-11e7-907b-a6006ad3dba0` の場合:

* 標準のバイト表現: `61 f0 c4 04 5c b3 11 e7` | `90 7b a6 00 6a d3 db a0`
* 前半を反転 (LE UInt64): `e7 11 b3 5c 04 c4 f0 61`
* 後半を反転 (LE UInt64): `a0 db d3 6a 00 a6 7b 90`

`UUID` の内部値の例:

* `61f0c404-5cb3-11e7-907b-a6006ad3dba0` は次のように表されます:

```text
0xE7, 0x11, 0xB3, 0x5C, 0x04, 0xC4, 0xF0, 0x61,
0xA0, 0xDB, 0xD3, 0x6A, 0x00, 0xA6, 0x7B, 0x90,
```

* デフォルトの UUID `00000000-0000-0000-0000-000000000000` は、16個のゼロバイトで表されます:

```text
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
```

新しいレコードがinsertされたが、UUID値が指定されていない場合に使用できます。


### IPv4 \{#ipv4\}

4バイトの `UInt32` として、**リトルエンディアン** のバイト順で格納されます。これは、IPアドレスで一般的に使われる従来のネットワークバイトオーダー (ビッグエンディアン) とは異なる点に注意してください。`IPv4` の内部値の例:

```sql
SELECT    
  CAST('0.0.0.0',         'IPv4') AS a,
  CAST('127.0.0.1',       'IPv4') AS b,
  CAST('192.168.0.1',     'IPv4') AS c,
  CAST('255.255.255.255', 'IPv4') AS d,
  CAST('168.212.226.204', 'IPv4') AS e
```

```text
0x00, 0x00, 0x00, 0x00, // 0.0.0.0
0x01, 0x00, 0x00, 0x7f, // 127.0.0.1
0x01, 0x00, 0xa8, 0xc0, // 192.168.0.1
0xff, 0xff, 0xff, 0xff, // 255.255.255.255
0xcc, 0xe2, 0xd4, 0xa8, // 168.212.226.204
```


### IPv6 \{#ipv6\}

**ビッグエンディアン / ネットワークバイトオーダー** (MSB が先頭) の16バイトで格納されます。`IPv6` の内部値の例:

```sql
SELECT
    CAST('2a02:aa08:e000:3100::2',        'IPv6') AS a,
    CAST('2001:44c8:129:2632:33:0:252:2', 'IPv6') AS b,
    CAST('2a02:e980:1e::1',               'IPv6') AS c
```

```text
// 2a02:aa08:e000:3100::2
0x2A, 0x02, 0xAA, 0x08, 0xE0, 0x00, 0x31, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
// 2001:44c8:129:2632:33:0:252:2
0x20, 0x01, 0x44, 0xC8, 0x01, 0x29, 0x26, 0x32, 
0x00, 0x33, 0x00, 0x00, 0x02, 0x52, 0x00, 0x02,
// 2a02:e980:1e::1
0x2A, 0x02, 0xE9, 0x80, 0x00, 0x1E, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
```


### Nullable \{#nullable\}

Nullable データ型は、次のようにエンコードされます。

1. 値が `NULL` かどうかを示す 1 バイト:
   * `0x00` は、値が `NULL` ではないことを示します。
   * `0x01` は、値が `NULL` であることを示します。
2. 値が `NULL` ではない場合、基になるデータ型は通常どおりエンコードされます。値が `NULL` の場合、基になる型に対して**追加のバイトは一切**書き込まれません。

たとえば、`Nullable(UInt32)` 型の値:

```sql
SELECT    
   CAST(42,   'Nullable(UInt32)') AS a,
   CAST(NULL, 'Nullable(UInt32)') AS b
```

```text
0x00,                   // Not NULL - the value follows
0x2A, 0x00, 0x00, 0x00, // UInt32(42)
0x01,                   // NULL - nothing follows
```


### LowCardinality \{#lowcardinality\}

RowBinary フォーマットでは、low-cardinality マーカーはワイヤ形式に影響しません。たとえば、`LowCardinality(String)` は通常の `String` と同じ方法でエンコードされます。

:::warning
これは RowBinary にのみ適用されます。Native フォーマットでは、`LowCardinality` は辞書ベースの別のエンコードを使用します。
:::

:::note
カラムは `LowCardinality(Nullable(T))` として定義できますが、`Nullable(LowCardinality(T))` として定義することはできません。これは常にサーバーからのエラーになります。
:::

テスト時には、[allow_suspicious_low_cardinality_types](https://clickhouse.com/docs/operations/settings/settings#allow_suspicious_low_cardinality_types) を `1` に設定すると、カバレッジ向上のために `LowCardinality` 内でほとんどのデータ型を許可できます。

### Array \{#array\}

配列は次のようにエンコードされます。

1. 配列内の要素数を示す [可変長整数 (LEB128) ](#unsigned-leb128)。
2. 配列の各要素。基になるデータ型と同じ方法でエンコードされます。

たとえば、`UInt32` 値の配列:

```sql
SELECT CAST(array(1, 2, 3), 'Array(UInt32)') AS arr
```

```text
0x03,                   // LEB128 - the array has 3 elements
0x01, 0x00, 0x00, 0x00, // UInt32(1)
0x02, 0x00, 0x00, 0x00, // UInt32(2)
0x03, 0x00, 0x00, 0x00, // UInt32(3)
```

少し複雑な例:

```sql
SELECT array('foobar', 'qaz') AS arr
```

```text
0x02,             // LEB128 - the array has 2 elements
0x06,             // LEB128 - the first string has 6 bytes
0x66, 0x6f, 0x6f, 
0x62, 0x61, 0x72, // 'foobar'
0x03,             // LEB128 - the second string has 3 bytes
0x71, 0x61, 0x7a, // 'qaz'
```

:::note
配列には Nullable の値を含めることができますが、配列自体を Nullable にすることはできません。
:::

次は有効です。

```sql
SELECT CAST([NULL, 'foo'], 'Array(Nullable(String))') AS arr;
```

```text
   ┌─arr──────────┐
1. │ [NULL,'foo'] │
   └──────────────┘
```

次のようにエンコードされます：

```text
0x02,             // LEB128  - the array has 2 elements
0x01,             // Is NULL - nothing follows for this element
0x00,             // Is NOT NULL - the data follows
0x03,             // LEB128  - the string has 3 bytes
0x66, 0x6f, 0x6f, // 'foo'
```

多次元配列の扱い方の例は、[Geoセクション](#geo-types)にあります。


### Tuple \{#tuple\}

タプルは、追加のメタ情報や区切り文字を付けずに、タプル内のすべての要素をそれぞれ対応するワイヤ形式で順に並べてエンコードしたものです。

```sql
CREATE OR REPLACE TABLE foo
(
    `t` Tuple(
           UInt32,
           String,
           Array(UInt8)
        )
)
ENGINE = Memory;
INSERT INTO foo VALUES ((42, 'foo', array(99, 144)));
```

```text
0x2a, 0x00, 0x00, 0x00, // 42 as UInt32
0x03,                   // LEB128 - the string has 3 bytes
0x66, 0x6f, 0x6f,       // 'foo'
0x02,                   // LEB128 - the array has 2 elements
0x63,                   // 99 as UInt8
0x90,                   // 144 as UInt8
```

タプルデータ型の文字列表現では、[Enum type](#enum8-enum16) と同様に、エスケープされた記号や特殊文字の追跡といった課題があります。さらに、Tuple では開き括弧と閉じ括弧についても追跡する必要があります。加えて、より複雑な Tuple には、ネストされた別の Tuple、Array、マップ、さらには enum が含まれる場合もあります。

たとえば、次のテーブルでは、タプルに名前の中にバッククォートと括弧を含む enum が含まれており、適切に処理しないとパースの問題を引き起こす可能性があります:

```sql
CREATE OR REPLACE TABLE foo
(
   `t` Tuple(
          Enum8('f\'()' = 0),
          Array(Nullable(Tuple(UInt32, String)))
       )
) ENGINE = Memory;
```


### マップ \{#map\}

マップは `Array(Tuple(K, V))` と見なすことができます。ここで、`K` はキーの型、`V` は値の型です。マップは次のようにエンコードされます。

1. マップ内の要素数を示す [可変長整数 (LEB128) ](#unsigned-leb128)。
2. マップの要素をキーと値のペアとして、それぞれの対応する型でエンコードしたもの。

たとえば、キーが `String`、値が `UInt32` のマップ:

```sql
SELECT CAST(map('foo', 1, 'bar', 2), 'Map(String, UInt32)') AS m
```

```text
0x02,                   // LEB128 - the map has 2 elements
0x03,                   // LEB128 - the first key has 3 bytes
0x66, 0x6f, 0x6f,       // 'foo'
0x01, 0x00, 0x00, 0x00, // UInt32(1)
0x03,                   // LEB128 - the second key has 3 bytes
0x62, 0x61, 0x72,       // 'bar'
0x02, 0x00, 0x00, 0x00, // UInt32(2)
```

:::note
`Map(String, Map(Int32, Array(Nullable(String))))` のような深くネストされた構造のマップも使用でき、この場合も上記で説明したのと同様にエンコードされます。
:::


### Variant \{#variant\}

この型は、他のデータ型の共用体を表します。型 `Variant(T1, T2, ..., TN)` は、この型の各行が `T1`、`T2`、…、`TN` のいずれかの型の値、またはそれらのいずれにも属さない値 (`NULL` 値) を持つことを意味します。

:::warning
エンドユーザーにとっては `Variant(T1, T2)` と `Variant(T2, T1)` はまったく同じ意味ですが、ワイヤ形式では定義内の型の順序が重要です。定義内の型は常にアルファベット順に並べ替えられますが、これは重要です。というのも、どのバリアントであるかは &quot;discriminant&quot;、つまり定義内のデータ型の索引によってエンコードされるためです。
:::

次の例を見てください。

```sql
SET allow_experimental_variant_type = 1,
    allow_suspicious_variant_types = 1;
CREATE OR REPLACE TABLE foo
(
  -- It does not matter what is the order of types in the user input;
  -- the types are always sorted alphabetically in the wire format.
  `var` Variant(
           Array(Int16),
           Bool,
           Date,
           FixedString(6),
           Float32, Float64,
           Int128, Int16, Int32, Int64, Int8,
           String,
           UInt128, UInt16, UInt32, UInt64, UInt8
       )
)
ENGINE = MergeTree
ORDER BY ();
INSERT INTO foo VALUES (true), ('foobar' :: FixedString(6)), (100.5 :: Float64), (100 :: Int128), ([1, 2, 3] :: Array(Int16));
SELECT * FROM foo FORMAT RowBinary;
```

```text
0x01,                               // type index -> Bool
 0x01,                               // true
 0x03,                               // type index -> FixedString(6)
 0x66, 0x6F, 0x6F, 0x62, 0x61, 0x72, // 'foobar' 
 0x05,                               // type index -> Float64
 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x20, 0x59, 0x40,             // 100.5 as Float64
 0x06,                               // type index -> Int128
 0x64, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00, 
 0x00, 0x00, 0x00, 0x00,             // 100 as Int128
 0x00,                               // type index -> Array(Int16)
 0x03,                               // LEB128 - the array has 3 elements
 0x01, 0x00,                         // 1 as Int16
 0x02, 0x00,                         // 2 as Int16
 0x03, 0x00,                         // 3 as Int16
```

`NULL` 値は、識別バイト `0xFF` でエンコードされます：

```sql
SELECT NULL :: Variant(UInt32, String)
```

```text
0xFF, // discriminant = NULL
```

[allow&#95;suspicious&#95;variant&#95;types](https://clickhouse.com/docs/operations/settings/settings#allow_suspicious_variant_types) 設定を使用すると、`Variant` 型のより網羅的なテストを行えます。


### Dynamic \{#dynamic\}

`Dynamic` 型は、実行時に決まる任意の型の値を保持できます。RowBinary形式では、各値は自己記述的になっています。最初のパートは、[この形式](https://clickhouse.com/docs/sql-reference/data-types/data-types-binary-encoding)による型指定です。その後に内容が続き、値はこのドキュメントで説明されているとおりにエンコードされます。したがって、値を解析するには、型の索引を使って適切なパーサーを特定し、その後はすでに別の箇所で使っているRowBinaryの解析処理を再利用するだけで済みます。

```text
[BinaryTypeIndex][type-specific parameters...][value]
```

ここで、`BinaryTypeIndex` は型を識別する 1 バイトの値です。型のインデックスとパラメーターについては、[こちら](https://clickhouse.com/docs/sql-reference/data-types/data-types-binary-encoding)のリファレンスを参照してください。

`NULL` の Dynamic 値は、追加のバイトを伴わずに `BinaryTypeIndex` `0x00` (`Nothing` 型) でエンコードされます:

```sql
SELECT NULL::Dynamic
```

```text
00                        # BinaryTypeIndex: Nothing (0x00), represents NULL
```

**例:**

```sql
SELECT 42::Dynamic
```

```text
0a                        # BinaryTypeIndex: Int64 (0x0A)
2a 00 00 00 00 00 00 00   # Int64 value: 42
```

```sql
SELECT toDateTime64('2024-01-15 10:30:00', 3, 'America/New_York')::Dynamic
```

```text
14                        # BinaryTypeIndex: DateTime64WithTimezone (0x14)
03                        # UInt8: precision
10                        # VarUInt: timezone name length
41 6d 65 72 69 63 61 2f   # "America/"
4e 65 77 5f 59 6f 72 6b   # "New_York"
c0 6c be 0d 8d 01 00 00   # Int64: timestamps
```


### JSON \{#json\}

JSON typeは、データを2つの異なるカテゴリにエンコードします：

1. **型付きパス** - スキーマ内で明示的な型を指定して宣言されたパス (例: `JSON(user_id UInt32, name String)`)
2. **動的パスの上限を超えた場合の動的パス/オーバーフローパス** - 実行時に検出されたパスは`Dynamic`型として保存されます。値のエンコーディングの前に型定義が付加されます。

これら2つのカテゴリでは、ワイヤフォーマットとルールが異なります。

| パスカテゴリ    | シリアル化に含まれるか           | 値のエンコーディング | Variant/Nullable の使用可否 |
| --------- | --------------------- | ---------- | ---------------------- |
| **型付きパス** | 常に含まれる (NULL の場合も含む)  | 型固有のバイナリ形式 | はい                     |
| **動的パス**  | NULL でない場合のみ          | 動的         | 不可                     |

パスは3つのグループに分けてシリアライズされ、順番に書き込まれます。typed paths、dynamic paths、shared data (オーバーフロー) pathsの順です。typed pathsとdynamic pathsは実装定義の順序 (内部ハッシュマップのイテレーションによって決定) で書き込まれ、shared data pathsはアルファベット順で書き込まれます。読み取り側は特定のパスの順序に依存しないでください。デシリアライザは各パスを位置ではなく名前によってディスパッチします。

RowBinary形式の各JSON行は次のようにシリアライズされます：

```text
[VarUInt: number_of_paths]
[String: path_1][value_1]
[String: path_2][value_2]
...
```

**例:**

**1. 型付きパスのみを含むシンプルなJSON：**

Schema: `JSON(user_id UInt32, active Bool)`

行: `{"user_id": 42, "active": true}`

バイナリエンコーディング (アノテーション付き16進数) ：

```text
02                              # VarUInt: 2 paths total

# Typed path "active"
06 61 63 74 69 76 65            # String: "active" (length 6 + bytes)
01                              # Bool/UInt8 value: true (1)

# Typed path "user_id"
07 75 73 65 72 5F 69 64         # String: "user_id" (length 7 + bytes)
2A 00 00 00                     # UInt32 value: 42 (little-endian)
```

**2. 型付きおよび動的パスを持つシンプルなJSON：**

Schema: `JSON(user_id UInt32, active Bool)`

行: `{"user_id": 42, "active": true, "name": "Alice"}`

バイナリエンコーディング (アノテーション付き16進数) ：

```text
03                              # VarUInt: 3 paths total

# Typed path "active"
06 61 63 74 69 76 65            # String: "active" (length 6 + bytes)
01                              # Bool/UInt8 value: true (1)

# Dynamic path "name"
04 6E 61 6D 65                  # String: "name" (length 4 + bytes)
15                              # BinaryTypeIndex: String (0x15)
05 41 6C 69 63 65               # String value: "Alice" (length 5 + bytes)

# Typed path "user_id"
07 75 73 65 72 5F 69 64         # String: "user_id" (length 7 + bytes)
2A 00 00 00                     # UInt32 value: 42 (little-endian)

```

**3. Nullの処理:**

型付きNullableカラムでは、nullが得られます：

Schema: `JSON(score Nullable(Int32))`

行: `{"score": null }`

バイナリエンコーディング (アノテーション付き16進数) ：

```text
01                              # VarUInt: 1 path total

# Typed path "score" (Nullable)
05 73 63 6f 72 65               # String: "score" (length 5 + bytes)
01                              # Nullable flag: 1 (is NULL, no value follows)
```

型付きの非Nullableカラムでは、デフォルト値が返されます：

スキーマ: `JSON(name String)`

行: `{"name": null}`

Binary encoding:

```text
01                              # VarUInt: 1 path (dynamic NULL paths are skipped!)

04 6e 61 6d 65  # "name"
00              # String length 0 (empty string)
```

動的パスの場合、これは無視されます：

Schema: `JSON(id UInt64)`

行: `{"id": 100, "metadata": null}`

Binary encoding:

```text
01                              # VarUInt: 1 path (dynamic NULL paths are skipped!)

# Typed path "id"
02 69 64                        # String: "id" (length 2 + bytes)
64 00 00 00 00 00 00 00         # UInt64 value: 100 (little-endian)

```

Note: NULL値を持つ`metadata`パスは**含まれません**。これは、動的パスがnull以外の場合にのみシリアライズされるためです。型付きパスとの重要な違いです。

**4. ネストされたJSON object:**

スキーマ: `JSON()`

行: `{"user": {"name": "Bob", "age": 30}}`

バイナリエンコーディング (注釈付き16進数) :

```text
02                              # VarUInt: 2 paths (nested objects are flattened)

# Dynamic path "user.age"
08 75 73 65 72 2E 61 67 65      # String: "user.age" (length 8 + bytes)
0A                              # BinaryTypeIndex: Int64 (0x0A)
1E 00 00 00 00 00 00 00         # Int64 value: 30 (little-endian)

# Dynamic path "user.name"
09 75 73 65 72 2E 6E 61 6D 65   # String: "user.name" (length 9 + bytes)
15                              # BinaryTypeIndex: String (0x15)
03 42 6F 62                     # String value: "Bob" (length 3 + bytes)

```

注記: ネストされたオブジェクトは、ネスト構造ではなくドット区切りのパス (例: `user.name`) にフラット化されます。

**代替: JSON を文字列として扱うモード**

設定 `output_format_binary_write_json_as_string=1` を使用すると、JSON カラムは構造化されたバイナリ形式ではなく、単一の JSON テキスト文字列としてシリアライズされます。JSON カラムへの書き込みに対応する設定として、`input_format_binary_read_json_as_string` もあります。ここでどちらの設定を選ぶかは、JSON をクライアント側で解析するか、サーバー側で解析するかによって決まります。


### Geo 型 \{#geo-types\}

Geo は、地理データを表すデータ型のカテゴリです。これには次のものが含まれます。

* `Point` - `Tuple(Float64, Float64)` として表されます。
* `Ring` - `Array(Point)` または `Array(Tuple(Float64, Float64))` として表されます。
* `Polygon` - `Array(Ring)` または `Array(Array(Tuple(Float64, Float64)))` として表されます。
* `MultiPolygon` - `Array(Polygon)` または `Array(Array(Array(Tuple(Float64, Float64))))` として表されます。
* `LineString` - `Array(Point)` または `Array(Tuple(Float64, Float64))` として表されます。
* `MultiLineString` - `Array(LineString)` または `Array(Array(Tuple(Float64, Float64)))` として表されます。

Geo 値のワイヤフォーマットは、Tuple および Array の場合と完全に同一です。`RowBinaryWithNamesAndTypes` 形式のヘッダーには、これらの型の別名 (たとえば `Point`、`Ring`、`Polygon`、`MultiPolygon`、`LineString`、`MultiLineString`) が含まれます。

```sql
SELECT    (1.0, 2.0)                                       :: Point           AS point,
    [(3.0, 4.0), (5.0, 6.0)]                         :: Ring            AS ring,
    [[(7.0, 8.0), (9.0, 10.0)], [(11.0, 12.0)]]      :: Polygon         AS polygon,
    [[[(13.0, 14.0), (15.0, 16.0)], [(17.0, 18.0)]]] :: MultiPolygon    AS multi_polygon,
    [(19.0, 20.0), (21.0, 22.0)]                     :: LineString      AS line_string,
    [[(23.0, 24.0), (25.0, 26.0)], [(27.0, 28.0)]]   :: MultiLineString AS multi_line_string
```


```text
// Point - or Tuple(Float64, Float64)
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F, // Point.X
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, // Point.Y
// Ring - or Array(Tuple(Float64, Float64))
0x02, // LEB128 - the "ring" array has 2 points
   // Ring - Point #1
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x40, 
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x40, 
   // Ring - Point #2
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x40, 
   0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x40, 
// Polygon - or Array(Array(Tuple(Float64, Float64)))
0x02, // LEB128 - the "polygon" array has 2 rings
   0x02, // LEB128 - the first ring has 2 points
      // Polygon - Ring #1 - Point #1
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1C, 0x40, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x40,
      // Polygon - Ring #1 - Point #2
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x22, 0x40, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x40, 
  0x01, // LEB128 - the second ring has 1 point
      // Polygon - Ring #2 - Point #1 (the only one)
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0x40, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x40, 
// MultiPolygon - or Array(Array(Array(Tuple(Float64, Float64))))
0x01, // LEB128 - the "multi_polygon" array has 1 polygon
   0x02, // LEB128 - the first polygon has 2 rings
      0x02, // LEB128 - the first ring has 2 points
         // MultiPolygon - Polygon #1 - Ring #1 - Point #1
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A, 0x40, 
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x40,
         // MultiPolygon - Polygon #1 - Ring #1 - Point #2
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x40, 
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x40, 
      0x01, // LEB128 - the second ring has 1 point
        // MultiPolygon - Polygon #1 - Ring #2 - Point #1 (the only one)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x31, 0x40, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x32, 0x40, 
 // LineString - or Array(Tuple(Float64, Float64))
 0x02, // LEB128 - the line string has 2 points
    // LineString - Point #1
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x40, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x34, 0x40,
    // LineString - Point #2
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x35, 0x40, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x40, 
 // MultiLineString - or Array(Array(Tuple(Float64, Float64)))
 0x02, // LEB128 - the multi line string has 2 line strings
   0x02, // LEB128 - the first line string has 2 points
     // MultiLineString - LineString #1 - Point #1
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x37, 0x40, 
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x40, 
     // MultiLineString - LineString #1 - Point #2
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x39, 0x40, 
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3A, 0x40, 
   0x01, // LEB128 - the second line string has 1 point
     // MultiLineString - LineString #2 - Point #1 (the only one)
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3B, 0x40, 
     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x40,
```

### Geometry \{#geometry\}

`Geometry` は、上記に挙げた任意の Geo 型を保持できる `Variant` 型です。ワイヤ形式では、後続の Geo 型を示す識別子バイトを持つ `Variant` とまったく同じようにエンコードされます。

Geometry の識別インデックスは次のとおりです。

| Index | Type            |
| ----- | --------------- |
| 0     | LineString      |
| 1     | MultiLineString |
| 2     | MultiPolygon    |
| 3     | Point           |
| 4     | Polygon         |
| 5     | Ring            |

ワイヤ形式の構造:

```text
// 1 byte discriminant (0-5)
// followed by the corresponding geo type data
```

`Point` を `Geometry` としてエンコードした例:

```sql
SELECT ((1.0, 2.0)::Point)::Geometry
```

```text
0x03,                                           // discriminant = 3 (Point)
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F, // Point.X = 1.0 as Float64
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, // Point.Y = 2.0 as Float64
```

`Ring` を `Geometry` としてエンコードする例:

```text
0x05,       // discriminant = 5 (Ring)
0x02,       // LEB128 - array has 2 points
// Point #1
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x40, // X = 3.0
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x40, // Y = 4.0
// Point #2
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x40, // X = 5.0
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x40, // Y = 6.0
```


### Nested \{#nested\}

`Nested` のワイヤ形式は、`flatten_nested` 設定に依存します。

:::warning
1 つの行内のすべてのコンポーネント配列は、**同じ長さでなければなりません**。これはサーバー側で強制される制約です。長さが一致しない場合、挿入エラーが発生します。
:::

#### `flatten_nested = 1` (デフォルト) \{#nested-flattened\}

デフォルト設定では、`Nested` は個別の配列にフラット化されます。各サブカラムは、ドット区切りの名前を持つ個別の `Array` 型のカラムになります：

```sql
CREATE OR REPLACE TABLE foo
(
    n Nested(a String, b Int32)
) ENGINE = MergeTree ORDER BY ();
-- flatten_nested=1 is the default
INSERT INTO foo VALUES (['foo', 'bar'], [42, 144]);
```

`DESCRIBE TABLE foo` には、フラット化されたカラムが表示されます：

```text
   ┌─name─┬─type──────────┐
1. │ n.a  │ Array(String) │
2. │ n.b  │ Array(Int32)  │
   └──────┴───────────────┘
```

各配列は、[Array](#array) セクションで説明されているように、それぞれ独立してシリアル化されます：

```text
0x02,                   // LEB128 - 2 String elements in the first array (n.a)
 0x03,                   // LEB128 - the first string has 3 bytes
 0x66, 0x6F, 0x6F,       // 'foo'
 0x03,                   // LEB128 - the second string has 3 bytes
 0x62, 0x61, 0x72,       // 'bar'
0x02,                   // LEB128 - 2 Int32 elements in the second array (n.b)
 0x2A, 0x00, 0x00, 0x00, // 42 as Int32
 0x90, 0x00, 0x00, 0x00, // 144 as Int32
```


#### `flatten_nested = 0` \{#nested-unflattened\}

`flatten_nested = 0` の場合、`Nested` は `Array(Tuple(...))` 型の単一カラムとして保持されます。カラム名はドット区切りになりません。

```sql
SET flatten_nested = 0;
CREATE OR REPLACE TABLE foo
(
    n Nested(a String, b Int32)
) ENGINE = MergeTree ORDER BY ();
INSERT INTO foo VALUES ([('foo', 42), ('bar', 144)]);
```

`DESCRIBE TABLE foo` では、1 つのカラムが表示されます:

```text
   ┌─name─┬─type───────────────────────┐
1. │ n    │ Nested(a String, b Int32)  │
   └──────┴────────────────────────────┘
```

エンコーディングは `Array(Tuple(String, Int32))` です。まず配列長のプレフィックスがあり、その後に各要素のタプルフィールドが順に続きます:

```text
0x02,                   // LEB128 - 2 elements in the array
 0x03,                   // LEB128 - first tuple, field a: 3 bytes
 0x66, 0x6F, 0x6F,       // 'foo'
 0x2A, 0x00, 0x00, 0x00, // first tuple, field b: 42 as Int32
 0x03,                   // LEB128 - second tuple, field a: 3 bytes
 0x62, 0x61, 0x72,       // 'bar'
 0x90, 0x00, 0x00, 0x00, // second tuple, field b: 144 as Int32
```

フィールドは、フラット化された表現のようにカラムごと (a₁, a₂, b₁, b₂) にまとめられるのではなく、要素ごとに交互に並んでいる (a₁, b₁, a₂, b₂) ことに注意してください。


### SimpleAggregateFunction \{#simpleaggregatefunction\}

`SimpleAggregateFunction(func, T)` は、基になるデータ型 `T` と同一の形式でエンコードされます。集約関数名はワイヤ形式に影響しません。

たとえば、`SimpleAggregateFunction(max, UInt32)` は通常の `UInt32` と同じ方法でエンコードされます。

```sql
CREATE TABLE test_saf
(
    key UInt32,
    val SimpleAggregateFunction(max, UInt32)
) ENGINE = AggregatingMergeTree ORDER BY key;

INSERT INTO test_saf VALUES (1, 42);
SELECT val FROM test_saf;
```

RowBinaryWithNamesAndTypes ヘッダーでは型は `SimpleAggregateFunction(max, UInt32)` として報告されますが、ワイヤ上の値は単なる `UInt32` です。

```text
0x2A, 0x00, 0x00, 0x00, // 42 as UInt32
```

### AggregateFunction \{#aggregatefunction\}

`AggregateFunction(func, T)` は、集約関数の完全な中間状態を格納します。同じく中間状態を格納するものの、基になるデータ型と同一の形式でエンコードされる `SimpleAggregateFunction` とは異なり、`AggregateFunction` は各集約関数に固有の形式を持つ不透明なバイナリblobを格納します。

:::warning
集約状態には、RowBinary では**長さプレフィックスがありません**。パーサーは、何バイト読み取るべきかを把握するために、それぞれの集約関数固有の内部シリアライズ形式を理解している必要があります。実際には、ほとんどのクライアントは集約状態を不透明なものとして扱い、シリアライズ処理をサーバーに任せるために `*State` / `*Merge` コンビネータを使用します。
:::

内部形式は関数ごとに異なります。簡単な例をいくつか示します。

**`countState`** — カウント値を VarUInt (LEB128) として格納します。

```sql
SELECT countState(number) FROM numbers(5)
```

```text
0x05, // VarUInt: 5
```

**`sumState`** — 累積した合計を固定長整数に格納します。ビット幅は引数の型に依存します (整数型の引数では `UInt64`) ：

```sql
SELECT sumState(toUInt32(number)) FROM numbers(5) -- sum = 0+1+2+3+4 = 10
```

```text
0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 10 as UInt64
```

**`minState` / `maxState`** — 基底の型で、フラグバイトに続けて値を格納します。フラグは、空の状態 (値が一度も現れていない) では `0x00`、値が存在する場合は `0x01` です:

```sql
SELECT maxState(toUInt32(number)) FROM numbers(5) -- max = 4
```

```text
0x01,                   // flag: has value
0x04, 0x00, 0x00, 0x00, // 4 as UInt32
```

空の状態 (集計された行がない場合) :

```sql
SELECT minState(toUInt32(number)) FROM numbers(0)
```

```text
0x00, // flag: no value
```

:::note
`uniq`、`quantile`、`groupArray` のような、より複雑な関数では、実装固有の形式が使用されます。これらの状態を読み書きする必要がある場合は、対象の関数に対応する ClickHouse のソースコードを参照してください。
:::


### QBit \{#qbit\}

`QBit` は、異なる精度レベルで効率的にルックアップを行うためのベクトル型です。内部的には、転置形式で格納されます。転送時には、`QBit` は単に基になる要素型 (`Float32`、`Float64`、または `BFloat16`) の `Array` です。格納のためのビット転置最適化はサーバー側で行われ、RowBinary プロトコルでは行われません。

構文:

```text
QBit(element_type, dimension)
```

`element_type` は `Float32`、`Float64`、または `BFloat16` で、`dimension` は固定のベクトル次元です。

ワイヤ形式: `Array(element_type)` と同一です。

```text
// LEB128 length
// followed by `length` elements of `element_type`
```

`[1.0, 2.0, 3.0, 4.0]` を格納した `QBit(Float32, 4)` のエンコーディング例:

```sql
SELECT [1.0, 2.0, 3.0, 4.0]::QBit(Float32, 4)
```

```text
0x04,                   // LEB128 - array has 4 elements
0x00, 0x00, 0x80, 0x3F, // 1.0 as Float32
0x00, 0x00, 0x00, 0x40, // 2.0 as Float32
0x00, 0x00, 0x40, 0x40, // 3.0 as Float32
0x00, 0x00, 0x80, 0x40, // 4.0 as Float32
```


## フォーマット設定 \{#format-settings\}

<RowBinaryFormatSettings/>