---
sidebar_label: バイナリとネイティブ
slug: /integrations/data-formats/binary-native
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# ClickHouse におけるネイティブおよびバイナリ形式の使用

ClickHouse は、パフォーマンスとスペース効率の向上を実現する複数のバイナリ形式をサポートしています。バイナリ形式は、データがバイナリ形式で保存されるため、文字エンコーディングにおいても安全です。

デモンストレーションのために、some_data [テーブル](assets/some_data.sql) と [データ](assets/some_data.tsv) を使用しますので、あなたの ClickHouse インスタンスで再現してみてください。

## ネイティブ ClickHouse 形式でのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouse ノード間でデータをエクスポートおよびインポートするのに最も効率的なデータ形式は [ネイティブ](/interfaces/formats.md/#native) 形式です。エクスポートは `INTO OUTFILE` 句を使用して行います：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブ形式の [data.clickhouse](assets/data.clickhouse) ファイルが作成されます。

### ネイティブ形式からのインポート {#importing-from-a-native-format}

データをインポートするには、[file()](/sql-reference/table-functions/file.md) 関数を小さなファイルや探索目的で使用します：

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
`file()` 関数を使用する際、ClickHouse Cloud ではファイルが存在するマシンの `clickhouse client` でコマンドを実行する必要があります。別のオプションとして、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルでファイルを探索することができます。
:::

本番環境では、データをインポートするために `FROM INFILE` を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブ形式の圧縮 {#native-format-compression}

データをネイティブ形式にエクスポートする際に、圧縮を有効にすることもできます（ほとんどの他の形式でも同様です）：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートには LZ4 圧縮を使用しました。データをインポートする際にも指定する必要があります：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinary へのエクスポート {#exporting-to-rowbinary}

サポートされている別のバイナリ形式は [RowBinary](/interfaces/formats.md/#rowbinary) で、バイナリ表現の行でデータをインポートおよびエクスポートできます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、バイナリ行形式の [data.binary](assets/data.binary) ファイルが生成されます。

### RowBinary ファイルの探索 {#exploring-rowbinary-files}
この形式では、自動的なスキーマ推測はサポートされていないため、読み込む前にスキーマを明示的に定義する必要があります：

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

カラムリストを追加するヘッダー行も追加される [RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames) の使用を検討してください。また、カラム型を追加したヘッダー行が追加される [RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) もあります。

### RowBinary ファイルからのインポート {#importing-from-rowbinary-files}
RowBinary ファイルからデータをロードするには、`FROM INFILE` 句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOB を使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

全体のバイナリファイルを読み込み、テーブルのフィールドに保存したいとします。
この場合、[RawBLOB 形式](/interfaces/formats.md/#rawblob) を使用できます。この形式は、単一カラムのテーブルでのみ直接使用できます：

```sql
CREATE TABLE images(data String) Engine = Memory
```

画像ファイルを `images` テーブルに保存してみましょう：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data` フィールドの長さは、元のファイルサイズと等しいことを確認できます：

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOB データのエクスポート {#exporting-rawblob-data}

この形式は、`INTO OUTFILE` 句を使用してデータをエクスポートするためにも使用できます：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

1つ以上の値をエクスポートするとファイルが破損するため、`LIMIT 1` を使用する必要があります。

## MessagePack {#messagepack}

ClickHouse は、[MessagePack](https://msgpack.org/) へのインポートおよびエクスポートを [MsgPack](/interfaces/formats.md/#msgpack) を使用してサポートしています。MessagePack 形式にエクスポートするには：

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePack ファイル](assets/data.msgpk) からデータをインポートするには：

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## プロトコルバッファ {#protocol-buffers}

<CloudNotSupportedBadge/>

[Protocol Buffers](/interfaces/formats.md/#protobuf) を使用するには、まず [スキーマファイル](assets/schema.proto) を定義する必要があります：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイル（この場合は `schema.proto`）へのパスは、[Protobuf](/interfaces/formats.md/#protobuf) 形式の `format_schema` 設定オプションで設定します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これにより、データが [proto.bin](assets/proto.bin) ファイルに保存されます。ClickHouse は、Protobuf データのインポートとネストされたメッセージのインポートもサポートしています。単一のプロトコルバッファメッセージを扱うために [ProtobufSingle](/interfaces/formats.md/#protobufsingle) の使用を検討してください（この場合、長さデリミタは省略されます）。

## Cap’n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouse がサポートするもう1つの人気のあるバイナリシリアリゼーション形式は [Cap’n Proto](https://capnproto.org/) です。`Protobuf` 形式と同様に、スキーマファイル（この例では [`schema.capnp`](assets/schema.capnp)）を定義する必要があります：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

これで [CapnProto](/interfaces/formats.md/#capnproto) 形式とこのスキーマを使用してインポートおよびエクスポートできます：

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

`Date` カラムを [対応する型](/interfaces/formats.md/#data_types-matching-capnproto) に合わせて `UInt32` にキャストする必要があったことに注意してください。

## その他の形式 {#other-formats}

ClickHouse は、多くのテキストおよびバイナリ形式をサポートし、さまざまなシナリオやプラットフォームに対応しています。以下の記事で、さらに多くの形式とそれらとの作業方法を探ってみてください：

- [CSV および TSV 形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリ形式**
- [SQL 形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) を確認してください - ClickHouse サーバーを起動せずにローカル/リモートファイルで作業するためのポータブルなフル機能のツールです。
