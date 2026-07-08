---
alias: []
description: 'Native フォーマットのドキュメント'
input_format: true
keywords: ['Native']
output_format: true
slug: /interfaces/formats/Native
title: 'Native'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 \{#description\}

`Native` フォーマットは、カラムを行に変換しないという意味で真の「列指向」であり、ClickHouse において最も効率的なフォーマットです。

このフォーマットでは、データはバイナリ形式で [ブロック](/development/architecture#block) ごとに書き込みおよび読み取りが行われます。各ブロックについて、行数、カラム数、カラム名と型、およびブロック内の各カラムのデータが順番に記録されます。

このフォーマットは、サーバー間のやり取りに使われるネイティブインターフェイス、コマンドラインクライアント、および C++ クライアントで使用されます。

:::tip
このフォーマットを使用して、ClickHouse DBMS でのみ読み取ることができるダンプを高速に生成できます。
ただし、このフォーマットを手作業で扱うのは現実的ではない場合があります。
:::

## データ型のワイヤーフォーマット \{#data-types-wire-format\}

データは列指向フォーマットで送信されます。つまり、各カラムは個別に送信され、
1 つのカラム内のすべての値が 1 つの配列としてまとめて送信されます。

ブロック内の各カラムには、[RowBinaryWithNamesAndTypes](../formats/RowBinary/RowBinaryWithNamesAndTypes.md) と同様のヘッダーが含まれます。

:::note
ネイティブ TCP バイナリプロトコルを使用する場合 (または HTTP エンドポイントが `?client_protocol_version=<n>` を受け取る場合) 、
カラム数と行数の前に `BlockInfo` 構造体が書き込まれます。このセクションの例では、
プロトコルバージョンを指定しない通常の HTTP インターフェイスを使用しているため、`BlockInfo` は省略されます。
:::

### ブロック構造 \{#block-structure\}

次のクエリは、`number` と `str` の 2 つのカラムを持つ 3 行を返します。

```bash
curl -XPOST "http://localhost:8123?default_format=Native" --data-binary "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3" > out.bin
```

出力データは1つのClickHouseブロックに収まり、次のようになります。

```js
const data = new Uint8Array([
  // --- Block Header ---
  0x02,                   // 2 columns
  0x03,                   // 3 rows
  // -- Column 1 Header --
  0x06,                   // LEB128 - column name 'number' has 6 bytes
  0x6e, 0x75, 0x6d,       
  0x62, 0x65, 0x72,       // column name: 'number'
  0x06,                   // LEB128 - column type 'UInt64' has 6 bytes
  0x55, 0x49, 0x6e,
  0x74, 0x36, 0x34,       // 'UInt64'
  0x00, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00, // 0 as UInt64
  0x01, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00, // 1 as UInt64
  0x02, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00, // 2 as UInt64
  0x03,                   // LEB128 - column name 'str' has 3 bytes
  0x73, 0x74, 0x72,       // column name: 'str'
  0x06,                   // LEB128 - column type 'String' has 6 bytes
  0x53, 0x74, 0x72, 
  0x69, 0x6e, 0x67,       // 'String'
  0x01,                   // LEB128 - the string has 1 byte
  0x30,                   // '0' as String
  0x01,                   // LEB128 - the string has 1 byte
  0x31,                   // '1' as String
  0x01,                   // LEB128 - the string has 1 byte
  0x32,                   // '2' as String
])
```

### 複数のブロック \{#multiple-blocks\}

ただし、多くの場合、データは1つのブロックには収まらず、ClickHouse は複数のブロックに分けてデータを送信します。
次のクエリでは、ブロックサイズを小さくして、2行のデータが1ブロックにつき1行となるよう強制的に分割しています。

```bash
curl -XPOST "http://localhost:8123?default_format=Native" --data-binary "SELECT number, toString(number) AS str                FROM system.numbers LIMIT 2                 SETTINGS max_block_size=1" \  > out.bin
```

出力:

```js
const data = new Uint8Array([
 
  // ----- Block 1 ----- 
  0x02,                   // 2 columns
  0x01,                   // 1 row
  0x06,                   // LEB128 - column name 'number' has 6 bytes
  0x6E, 0x75, 0x6D, 
  0x62, 0x65, 0x72,       // column name: 'number' 
  0x06,                   // LEB128 - column type 'UInt64' has 6 bytes
  0x55, 0x49, 0x6E, 
  0x74, 0x36, 0x34,       // 'UInt64' 
  0x00, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00, // 0 as UInt64
  0x03,                   // LEB128 - column name 'str' has 3 bytes
  0x73, 0x74, 0x72,       // column name: 'str'
  0x06,                   // LEB128 - column type 'String' has 6 bytes
  0x53, 0x74, 0x72, 
  0x69, 0x6E, 0x67,       // 'String'
  0x01,                   // LEB128 - the string has 1 byte
  0x30,                   // '0' as String
  
  // ----- Block 2 -----
  0x02,                   // 2 columns
  0x01,                   // 1 row
  0x06,                   // LEB128 - column name 'number' has 6 bytes
  0x6E, 0x75, 0x6D,  
  0x62, 0x65, 0x72,       // column name: 'number'
  0x06,                   // LEB128 - column type 'UInt64' has 6 bytes
  0x55, 0x49, 0x6E,  
  0x74, 0x36, 0x34,       // 'UInt64'
  0x01, 0x00, 0x00, 0x00,  
  0x00, 0x00, 0x00, 0x00, // 1 as UInt64
  0x03,                   // LEB128 - column name 'str' has 3 bytes
  0x73, 0x74, 0x72,       // column name: 'str'
  0x06,                   // LEB128 - column type 'String' has 6 bytes
  0x53, 0x74, 0x72,  
  0x69, 0x6E, 0x67,       // 'String'
  0x01,                   // LEB128 - the string has 1 byte
  0x31,                   // '1' as String
]);
```

### 単純なデータ型 \{#simple-data-types\}

より単純なデータ型に属する個々の値のワイヤーフォーマットは、`RowBinary`/`RowBinaryWithNamesAndTypes` とほぼ同じです。
この説明に該当する型の一覧は次のとおりです。

* (U)Int8, (U)Int16, (U)Int32, (U)Int64, (U)Int128, (U)Int256
* Float32, Float64
* Bool
* String
* FixedString(N)
* Date
* Date32
* DateTime
* DateTime64
* IPv4
* IPv6
* UUID

詳細については、[&quot;RowBinary data types wire format&quot;](/interfaces/formats/RowBinary#data-types-wire-format) にある上記の型の説明を参照してください。

### 複合データ型 \{#complex-data-types\}

以下の型のエンコード形式は、`RowBinary` および `RowBinaryWithNamesAndTypes` とは異なります。

* Nullable
* LowCardinality
* Array
* Map
* Variant
* Dynamic
* JSON

#### Nullable \{#nullable\}

`Native`フォーマットでは、Nullableカラムでは実際のデータの前に、ブロック内の行数と同じだけのバイト列が付加されます。各バイトは、その値が`NULL`かどうかを示します。たとえば、このクエリでは、奇数の値はそれぞれ`NULL`になります。

```bash
curl -XPOST "http://localhost:8123?default_format=Native" \  --data-binary "SELECT if(number % 2 = 0, number, NULL) :: Nullable(UInt64) AS maybe_null                 FROM system.numbers LIMIT 5" \  > out.bin
```

出力は次のようになります。

```js
const data = new Uint8Array([
  // --- Block Header ---
  0x01,                         // LEB128 - 1 column
  0x05,                         // LEB128 - 5 rows
  
  // -- Column Header --
  0x0A,                         // LEB128 - column name has 10 bytes
  0x6D, 0x61, 0x79, 0x62, 0x65, 
  0x5F, 0x6E, 0x75, 0x6C, 0x6C, // column name: 'maybe_null'
  
  0x10,                         // LEB128 - column type has 16 bytes
  0x4E, 0x75, 0x6C, 0x6C, 
  0x61, 0x62, 0x6C, 0x65, 
  0x28, 0x55, 0x49, 0x6E, 
  0x74, 0x36, 0x34, 0x29,       // column type: 'Nullable(UInt64)'
  
  // -- Nullable mask --
  0x00,                         // Row 0 is NOT NULL
  0x01,                         // Row 1 is NULL
  0x00,                         // Row 2 is NOT NULL
  0x01,                         // Row 3 is NULL
  0x00,                         // Row 4 is NOT NULL
  
  // -- UInt64 values --
  0x00, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00,       // Row 0: 0 as UInt64

  // even though we still might have a proper value for this number 
  // in the block, it should be still returned as NULL to the user!
  0x01, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,       // Row #1: NULL
  
  0x02, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,       // Row #2: 2 as UInt64
  
  0x03, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00,       // Row #3: NULL, similar to Row #1
  
  0x04, 0x00, 0x00, 0x00, 
  0x00, 0x00, 0x00, 0x00,       // Row #4: 4 as UInt64
]);
```

`Nullable(String)` でも同様です。null インジケーターは常に nullable マスクバイトから取得され、
マスク値が `0x01` の場合は、文字列の内容に関係なく、その行は `NULL` です。`NULL` の行では、
基になる文字列は空文字列 (LEB128 長 `0`) として格納されます。なお、`NULL` ではない空
文字列も LEB128 長は `0` であるため、この 2 つのケースを区別できるのはマスクバイトだけです。例えば、次のクエリです:

```bash
curl -XPOST "http://localhost:8123?default_format=Native" \  --data-binary "SELECT if(number % 2 = 0, toString(number), NULL) :: Nullable(String) AS maybe_str                 FROM system.numbers LIMIT 5" \  > out.bin
```

出力は次のようになります。

```js
const data = new Uint8Array([
  // --- Block Header ---
  0x01, // LEB128 - 1 column
  0x05, // LEB128 - 5 rows

  // -- Column Header --
  0x09, // LEB128 - column name has 9 bytes
  0x6d,
  0x61,
  0x79,
  0x62,
  0x65,
  0x5f,
  0x73,
  0x74,
  0x72, // column name: 'maybe_str'

  0x10, // LEB128 - column type has 16 bytes
  0x4e,
  0x75,
  0x6c,
  0x6c,
  0x61,
  0x62,
  0x6c,
  0x65,
  0x28,
  0x53,
  0x74,
  0x72,
  0x69,
  0x6e,
  0x67,
  0x29, // column type: 'Nullable(String)'

  // -- Nullable mask --
  0x00, // Row 0 is NOT NULL
  0x01, // Row 1 is NULL
  0x00, // Row 2 is NOT NULL
  0x01, // Row 3 is NULL
  0x00, // Row 4 is NOT NULL

  // -- String values --
  0x01,
  0x30, // Row 0: LEB128 == 1, '0' as String
  0x00, // Row 1: LEB128 == 0, NULL
  0x01,
  0x32, // Row 2: LEB128 == 1, '2' as String
  0x00, // Row 3: LEB128 == 0, NULL
  0x01,
  0x34, // Row 4: LEB128 == 1, '4' as String
])
```

#### LowCardinality \{#lowcardinality\}

`LowCardinality` が透過的な [RowBinary](RowBinary/RowBinary.md#lowcardinality) とは異なり、Native フォーマットでは辞書ベースの列指向エンコーディングを使用します。カラムは、バージョンプレフィックス、一意な値の辞書、その辞書を参照する整数の索引配列の順にエンコードされます。

:::note
カラムは `LowCardinality(Nullable(T))` として定義できますが、`Nullable(LowCardinality(T))` として定義することはできません。これは常にサーバーエラーになります。
:::

バージョンプレフィックスは値 `1` の `UInt64(LE)` で、カラムごとに 1 回だけ書き込まれます。続いて、ブロックごとに以下が書き込まれます。

* `UInt64(LE)` — `IndexesSerializationType` ビットフィールド。ビット 0–7 は索引の幅をエンコードします (0 = UInt8、1 = UInt16、2 = UInt32、3 = UInt64) 。ビット 8 (`NeedGlobalDictionaryBit`) は Native フォーマットでは決して設定されません (これが現れた場合、サーバーは例外を送出します) 。ビット 9 は追加の辞書キーが存在することを示します。ビット 10 は辞書をリセットする必要があることを示します。
* `UInt64(LE)` — 辞書キーの数。これに続いて、内部型のエンコーディングを使用してキーがまとめてシリアライズされます。
* `UInt64(LE)` — 行数。これに続いて、適切な UInt 幅を使用して索引値がまとめてシリアライズされます。

辞書には常に索引 0 に既定値が含まれます (たとえば、`String` では空文字列、数値型では 0) 。`LowCardinality(Nullable(T))` の場合、索引 0 は `NULL` を表し、キーは `Nullable` ラッパーなしでシリアライズされます。

たとえば、5 行 `['foo', 'bar', 'baz', 'foo', 'bar']` を持つ `LowCardinality(String)` の場合:

```text
// Version prefix
01 00 00 00 00 00 00 00    // UInt64(LE) = 1

// IndexesSerializationType: UInt8 indexes, has keys, update dictionary
00 06 00 00 00 00 00 00    // UInt64(LE) = 0x0600

04 00 00 00 00 00 00 00    // 4 dictionary keys
00                          // key 0: "" (default)
03 66 6f 6f                 // key 1: "foo"
03 62 61 72                 // key 2: "bar"
03 62 61 7a                 // key 3: "baz"

05 00 00 00 00 00 00 00    // 5 rows
01 02 03 01 02              // indexes → "foo", "bar", "baz", "foo", "bar"
```

`LowCardinality(Nullable(String))` では、インデックス 0 は `NULL` になります:

```text
01 00 00 00 00 00 00 00    // version
00 06 00 00 00 00 00 00    // IndexesSerializationType
03 00 00 00 00 00 00 00    // 3 keys
00                          // key 0: NULL
00                          // key 1: "" (default)
03 79 65 73                 // key 2: "yes"
05 00 00 00 00 00 00 00    // 5 rows
02 00 02 00 02              // indexes → "yes", NULL, "yes", NULL, "yes"
```

#### Array \{#array\}

各配列の先頭に LEB128 形式の要素数が付く [RowBinary](RowBinary/RowBinary.md#array) とは異なり、Native フォーマットでは配列は次の 2 つの列指向サブストリームとしてエンコードされます。

* 累積 `UInt64` オフセットが N 個 (リトルエンディアン、各 8 バイト) 。行 `i` の要素数は `offset[i] - offset[i-1]` で、`offset[-1]` は暗黙的に 0 とみなされます。
* すべての行にまたがるネストされた全要素を、連続した領域にまとめてシリアライズします。

たとえば、3 行の `[[0, 10], [1, 11], [2, 12]]` を持つ `Array(UInt32)` の場合:

```text
// Offsets
02 00 00 00 00 00 00 00    // 2 (row 0: 2 elements)
04 00 00 00 00 00 00 00    // 4 (row 1: 2 elements)
06 00 00 00 00 00 00 00    // 6 (row 2: 2 elements)

// Nested UInt32 values (6 total)
00 00 00 00                 // 0
0a 00 00 00                 // 10
01 00 00 00                 // 1
0b 00 00 00                 // 11
02 00 00 00                 // 2
0c 00 00 00                 // 12
```

空の配列のオフセットは、前の行と同じです。たとえば、4 行の `Array(String)` が `[[], ['0'], ['0','1'], ['0','1','2']]` の場合:

```text
00 00 00 00 00 00 00 00    // 0 (empty)
01 00 00 00 00 00 00 00    // 1
03 00 00 00 00 00 00 00    // 3
06 00 00 00 00 00 00 00    // 6
01 30                       // "0"
01 30                       // "0"
01 31                       // "1"
01 30                       // "0"
01 31                       // "1"
01 32                       // "2"
```

#### Map \{#map\}

`Map(K, V)` は `Array(Tuple(K, V))` としてエンコードされます。つまり、配列オフセットの後にすべてのキーが続き、その後にすべての値が続きます。これは、各エントリごとにキーと値が交互に並ぶ [RowBinary](RowBinary/RowBinary.md#map) とは異なります。

たとえば、3 行の `Map(String, UInt64)` `[{'a':0,'b':10}, {'a':1,'b':11}, {'a':2,'b':12}]` は次のとおりです。

```text
// Array offsets
02 00 00 00 00 00 00 00    // 2
04 00 00 00 00 00 00 00    // 4
06 00 00 00 00 00 00 00    // 6

// All keys (6 Strings)
01 61                       // "a"
01 62                       // "b"
01 61                       // "a"
01 62                       // "b"
01 61                       // "a"
01 62                       // "b"

// All values (6 UInt64s)
00 00 00 00 00 00 00 00    // 0
0a 00 00 00 00 00 00 00    // 10
01 00 00 00 00 00 00 00    // 1
0b 00 00 00 00 00 00 00    // 11
02 00 00 00 00 00 00 00    // 2
0c 00 00 00 00 00 00 00    // 12
```

#### Variant \{#variant\}

各行がそれぞれ識別バイトを持ち、その直後に値がインラインで続く [RowBinary](RowBinary/RowBinary.md#variant) とは異なり、Native フォーマットでは識別子とデータが分離されています。

:::warning
RowBinary と同様に、定義内の型は常にアルファベット順にソートされ、識別子はそのソート済みリストにおけるインデックスです。`0xFF` (255) は `NULL` を表します。
:::

`Variant` カラムは次のようにエンコードされます。

* `UInt64(LE)` の識別子モードプレフィックス (`0` = BASIC、`1` = COMPACT) 。Native フォーマットの出力では通常 BASIC (`0`) が使用されます。COMPACT モードは、`use_compact_variant_discriminators_serialization` を有効にして保存されたデータを読み込む場合に現れることがあります。
* N 個の `UInt8` 識別子。各行につき 1 つです。
* 各 variant 型のデータ。該当する行のみを含む個別のバルクカラムとして、識別子の順序で格納されます。

たとえば、5 行の `[0::UInt32, 'hello', NULL, 3::UInt32, 'hello']` を持つ `Variant(String, UInt32)` の場合 (ソート順: `String` = 0、`UInt32` = 1) :

```text
00 00 00 00 00 00 00 00    // discriminators mode = BASIC
01 00 ff 01 00              // UInt32, String, NULL, UInt32, String

// String (2 values, rows 1 and 4)
05 68 65 6c 6c 6f          // "hello"
05 68 65 6c 6c 6f          // "hello"

// UInt32 (2 values, rows 0 and 3)
00 00 00 00                 // 0
03 00 00 00                 // 3
```

#### Dynamic \{#dynamic\}

各値が自己記述的 (型プレフィックス + 値) である [RowBinary](RowBinary/RowBinary.md#dynamic) とは異なり、Native フォーマットでは `Dynamic` は構造プレフィックスの後に続く [Variant](#variant) カラムとしてシリアライズされます。

構造プレフィックスには、まず `UInt64(LE)` のシリアル化バージョン、次に動的型の数 (VarUInt として) 、その後に型名が文字列として含まれます。バージョン V1 では、互換性のため型の数が 2 回書き込まれます。後続のデータは `Variant` カラムであり、その型リストは動的型に内部の `SharedVariant` 型を加えたもので、アルファベット順に並べられます。

たとえば、5 行の `Dynamic` `[0::UInt32, 'hello', NULL, 3::UInt32, 'hello']` は次のようになります:

```text
// Structure prefix (V1)
01 00 00 00 00 00 00 00    // version = V1
02                          // num types (V1 writes twice)
02                          // num types
06 53 74 72 69 6e 67       // "String"
06 55 49 6e 74 33 32       // "UInt32"

// Variant data: Variant(SharedVariant, String, UInt32)
// discriminants: SharedVariant=0, String=1, UInt32=2
00 00 00 00 00 00 00 00    // discriminators mode = BASIC
02 01 ff 02 01              // UInt32, String, NULL, UInt32, String
// SharedVariant: 0 values
05 68 65 6c 6c 6f          // String: "hello"
05 68 65 6c 6c 6f          // String: "hello"
00 00 00 00                 // UInt32: 0
03 00 00 00                 // UInt32: 3
```

#### JSON \{#json\}

各行がパス名と値を含む自己記述的な [RowBinary](RowBinary/RowBinary.md#json) とは異なり、Native フォーマットでは `JSON` は列指向構造でシリアライズされます。このエンコードは複雑で、バージョンにも依存します。内容は、シリアル化バージョン、動的パス名、共有データのレイアウトを含む構造プレフィックスに続き、型付きパス (各パスは一括カラム) 、動的パス (各パスは [Dynamic](#dynamic) カラム) 、およびオーバーフローパス用の共有データで構成されます。

よりシンプルに相互運用したい場合は、設定 `output_format_native_write_json_as_string=1` の使用を検討してください。これにより、JSON カラムはプレーンな JSON テキスト文字列 (各行に `String` を 1 つ) としてシリアライズされます。