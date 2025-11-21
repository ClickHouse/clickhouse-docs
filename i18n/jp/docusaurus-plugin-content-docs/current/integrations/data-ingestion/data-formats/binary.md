---
sidebar_label: 'バイナリ形式とネイティブ形式'
slug: /integrations/data-formats/binary-native
title: 'ClickHouse におけるネイティブ形式とバイナリ形式の使用'
description: 'ClickHouse でネイティブ形式およびバイナリ形式を使用する方法を説明するページ'
keywords: ['バイナリ形式', 'ネイティブ形式', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', 'データ形式', 'パフォーマンス', '圧縮']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouse におけるネイティブ形式とバイナリ形式の利用

ClickHouse は複数のバイナリ形式をサポートしており、これによりパフォーマンスとストレージ効率が向上します。バイナリ形式ではデータがバイナリとして保存されるため、文字エンコーディングの面でも安全です。

ここでは例として some_data [テーブル](assets/some_data.sql) と [データ](assets/some_data.tsv) を使用します。お使いの ClickHouse インスタンス上で自由に再現してみてください。



## ネイティブClickHouse形式でのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouseノード間でデータをエクスポートおよびインポートする際に最も効率的なデータ形式は[Native](/interfaces/formats/Native)形式です。エクスポートは`INTO OUTFILE`句を使用して行います:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブ形式の[data.clickhouse](assets/data.clickhouse)ファイルが作成されます。

### ネイティブ形式からのインポート {#importing-from-a-native-format}

データをインポートするには、小さなファイルや探索目的で[file()](/sql-reference/table-functions/file.md)を使用できます:

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
`file()`関数を使用する場合、ClickHouse Cloudではファイルが存在するマシン上で`clickhouse client`を使用してコマンドを実行する必要があります。別の方法として、[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用してローカルでファイルを探索することもできます。
:::

本番環境では、`FROM INFILE`を使用してデータをインポートします:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブ形式の圧縮 {#native-format-compression}

`COMPRESSION`句を使用することで、ネイティブ形式(および他のほとんどの形式)へのデータエクスポート時に圧縮を有効にすることもできます:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートにはLZ4圧縮を使用しました。データをインポートする際にも同様に指定する必要があります:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```


## RowBinaryへのエクスポート {#exporting-to-rowbinary}

サポートされているもう一つのバイナリ形式は[RowBinary](/interfaces/formats/RowBinary)で、バイナリ形式の行でデータのインポートとエクスポートが可能です：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、バイナリ行形式の[data.binary](assets/data.binary)ファイルが生成されます。

### RowBinaryファイルの確認 {#exploring-rowbinary-files}

この形式では自動スキーマ推論がサポートされていないため、読み込み前に確認するにはスキーマを明示的に定義する必要があります：

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

列リストを含むヘッダー行を追加する[RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)の使用を検討してください。[RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)は、列の型を含む追加のヘッダー行も追加します。

### RowBinaryファイルからのインポート {#importing-from-rowbinary-files}

RowBinaryファイルからデータを読み込むには、`FROM INFILE`句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```


## RawBLOBを使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

バイナリファイル全体を読み込んでテーブルのフィールドに保存したい場合を想定します。
このような場合に[RawBLOB形式](/interfaces/formats/RawBLOB)を使用できます。この形式は単一カラムのテーブルでのみ直接使用可能です:

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

画像ファイルを`images`テーブルに保存してみましょう:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data`フィールドの長さを確認できます。これは元のファイルサイズと一致します:

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOBデータのエクスポート {#exporting-rawblob-data}

この形式は`INTO OUTFILE`句を使用したデータのエクスポートにも使用できます:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

複数の値をエクスポートすると破損したファイルが作成されるため、`LIMIT 1`を使用する必要があります。


## MessagePack {#messagepack}

ClickHouseは[MsgPack](/interfaces/formats/MsgPack)を使用して[MessagePack](https://msgpack.org/)形式のインポートおよびエクスポートをサポートしています。MessagePack形式にエクスポートするには:

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePackファイル](assets/data.msgpk)からデータをインポートするには:

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```


## Protocol Buffers {#protocol-buffers}

<CloudNotSupportedBadge />

[Protocol Buffers](/interfaces/formats/Protobuf)を使用するには、まず[スキーマファイル](assets/schema.proto)を定義する必要があります：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイルへのパス(この例では`schema.proto`)は、[Protobuf](/interfaces/formats/Protobuf)形式の`format_schema`設定オプションで指定します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これにより、データが[proto.bin](assets/proto.bin)ファイルに保存されます。ClickHouseはProtobufデータのインポートおよびネストされたメッセージもサポートしています。単一のProtocol Bufferメッセージを扱う場合は、[ProtobufSingle](/interfaces/formats/ProtobufSingle)の使用を検討してください(この場合、長さ区切り文字は省略されます)。


## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge />

ClickHouseがサポートするもう一つの一般的なバイナリシリアライゼーション形式は[Cap'n Proto](https://capnproto.org/)です。`Protobuf`形式と同様に、この例ではスキーマファイル([`schema.capnp`](assets/schema.capnp))を定義する必要があります:

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

これで、[CapnProto](/interfaces/formats/CapnProto)形式とこのスキーマを使用してインポートおよびエクスポートが可能になります:

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

`Date`カラムを`UInt32`にキャストして[対応する型と一致させる](/interfaces/formats/CapnProto#data_types-matching-capnproto)必要があることに注意してください。


## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するため、テキスト形式とバイナリ形式の両方を含む多数のフォーマットをサポートしています。以下の記事で、その他のフォーマットとその使用方法を確認できます。

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリ形式**
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もご確認ください。これはClickHouseサーバーを起動せずに、ローカル/リモートファイルを操作できるポータブルなフル機能ツールです。
