---
sidebar_label: 'バイナリ形式とネイティブ形式'
slug: /integrations/data-formats/binary-native
title: 'ClickHouse におけるネイティブ形式とバイナリ形式の利用'
description: 'ClickHouse でネイティブ形式およびバイナリ形式を利用する方法を説明するページ'
keywords: ['バイナリ形式', 'ネイティブ形式', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', 'データ形式', 'パフォーマンス', '圧縮']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# ClickHouse におけるネイティブ形式とバイナリ形式の利用 \\{#using-native-and-binary-formats-in-clickhouse\\}

ClickHouse は複数のバイナリ形式をサポートしており、高いパフォーマンスと優れたスペース効率を実現します。バイナリ形式では、データがバイナリのまま保存されるため、文字エンコーディングの点でも安全です。

このガイドでは、デモ用に some_data [テーブル](assets/some_data.sql) と [データ](assets/some_data.tsv) を使用します。お使いの ClickHouse インスタンスでも自由に再現して試してみてください。

## ネイティブ ClickHouse 形式でのエクスポート \\{#exporting-in-a-native-clickhouse-format\\}

ClickHouse ノード間でデータをエクスポートおよびインポートする際に最も効率的なのは、[Native](/interfaces/formats/Native) 形式です。エクスポートは `INTO OUTFILE` 句を使用して行います。

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブ形式の [data.clickhouse](assets/data.clickhouse) ファイルが作成されます。

### ネイティブ形式からのインポート \\{#importing-from-a-native-format\\}

データをインポートするには、小さなファイルやデータ探索の目的であれば、[file()](/sql-reference/table-functions/file.md) を使用できます。

```sql
DESCRIBE file('data.clickhouse', Native);
```

```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

:::tip
`file()` 関数を使用する場合、ClickHouse Cloud を利用しているときは、ファイルが存在するマシン上で `clickhouse client` を実行する必要があります。別の方法として、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルでファイルを確認できます。
:::

本番環境では、データのインポートに `FROM INFILE` を使用します。

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブ形式での圧縮 \\{#native-format-compression\\}

`COMPRESSION` 句を使用して、データをネイティブ形式（およびほとんどの他の形式）でエクスポートする際に圧縮を有効にすることもできます。

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートには LZ4 圧縮を使用しました。データをインポートする際にも、同じ圧縮方式を指定する必要があります。

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinary へのエクスポート \\{#exporting-to-rowbinary\\}

サポートされている別のバイナリ形式として [RowBinary](/interfaces/formats/RowBinary) があり、この形式を使うと、行単位でバイナリ表現されたデータのインポートおよびエクスポートが可能です。

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これはバイナリ行形式で [data.binary](assets/data.binary) ファイルを生成します。

### RowBinary ファイルの確認 \\{#exploring-rowbinary-files\\}

この形式ではスキーマの自動推論はサポートされていないため、ロード前に内容を確認するには、スキーマを明示的に定義する必要があります。

```sql
SELECT *
FROM file('data.binary', RowBinary, 'path String, month Date, hits UInt32')
LIMIT 5
```

```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

[RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames) の使用を検討してください。これは列リストを含むヘッダー行も追加します。[RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes) は、さらに列の型を含むヘッダー行を追加します。

### RowBinary ファイルからのインポート \\{#importing-from-rowbinary-files\\}

RowBinary ファイルからデータを読み込むには、`FROM INFILE` 句を使用します。

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOB を使用した単一のバイナリ値のインポート \\{#importing-single-binary-value-using-rawblob\\}

バイナリファイル全体を読み取り、その内容をテーブルのフィールドに保存したいとします。
このような場合には [RawBLOB フォーマット](/interfaces/formats/RawBLOB) を使用できます。このフォーマットは、1 列だけを持つテーブルでのみ直接使用できます。

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

それでは、`images` テーブルに画像ファイルを保存してみましょう:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data` フィールドの長さを確認すると、元のファイルサイズと等しいことが確認できます。

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOB データのエクスポート \\{#exporting-rawblob-data\\}

この形式は、`INTO OUTFILE` 句を使用したデータのエクスポートにも利用できます。

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

なお、`LIMIT 1` を使用する必要があるのは、複数の値をエクスポートするとファイルが破損してしまうためです。

## MessagePack \\{#messagepack\\}

ClickHouse は、[MsgPack](/interfaces/formats/MsgPack) フォーマットを使用して [MessagePack](https://msgpack.org/) 形式でのインポートおよびエクスポートをサポートしています。MessagePack 形式でエクスポートするには、次のとおりです。

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePack ファイル](assets/data.msgpk) からデータをインポートするには、次のようにします。

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## Protocol Buffers \\{#protocol-buffers\\}

<CloudNotSupportedBadge />

[Protocol Buffers](/interfaces/formats/Protobuf) を利用するには、まず [スキーマファイル](assets/schema.proto) を定義する必要があります。

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイルへのパス（ここでは `schema.proto`）は、[Protobuf](/interfaces/formats/Protobuf) 形式の `format_schema` 設定オプションで指定します。

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これはデータを [proto.bin](assets/proto.bin) ファイルに保存します。ClickHouse では Protobuf データおよびネストされたメッセージのインポートもサポートしています。単一の Protocol Buffer メッセージを扱う場合は、[ProtobufSingle](/interfaces/formats/ProtobufSingle) の使用を検討してください（この場合、長さ区切りは省略されます）。

## Cap&#39;n Proto \\{#capn-proto\\}

<CloudNotSupportedBadge />

ClickHouse がサポートしている、もう 1 つの一般的なバイナリシリアライゼーション形式が [Cap&#39;n Proto](https://capnproto.org/) です。`Protobuf` フォーマットの場合と同様に、この例でもスキーマファイル（[`schema.capnp`](assets/schema.capnp)）を定義する必要があります。

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

これで、[CapnProto](/interfaces/formats/CapnProto) 形式と次のスキーマを使ってインポートおよびエクスポートできます。

```sql
SELECT
    path,
    CAST(month, 'UInt32') AS month,
    hits
FROM some_data
INTO OUTFILE 'capnp.bin'
FORMAT CapnProto
SETTINGS format_schema = 'schema:PathStats'
```

`Date` 列を `UInt32` にキャストして、[対応する型を揃える](/interfaces/formats/CapnProto#data_types-matching-capnproto)必要がある点に注意してください。

## その他のフォーマット \\{#other-formats\\}

ClickHouse は、多くのフォーマット（テキストおよびバイナリの両方）をサポートしており、さまざまなシナリオやプラットフォームをカバーします。以下の記事で、より多くのフォーマットとその扱い方を確認してください。

- [CSV および TSV フォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON フォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリフォーマット**
- [SQL フォーマット](sql.md)

あわせて [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も参照してください。ClickHouse サーバーを起動せずに、ローカル／リモートのファイルを操作できる、ポータブルなフル機能ツールです。
