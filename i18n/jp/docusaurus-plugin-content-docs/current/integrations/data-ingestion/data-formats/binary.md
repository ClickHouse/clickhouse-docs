---
sidebar_label: 'バイナリとネイティブ'
slug: '/integrations/data-formats/binary-native'
title: 'ClickHouse でのネイティブおよびバイナリ形式の使用'
description: 'ClickHouse でのネイティブおよびバイナリ形式の使用方法について説明したページ'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouseでのネイティブおよびバイナリ形式の使用

ClickHouseは複数のバイナリ形式をサポートしており、これによりパフォーマンスとスペース効率が向上します。バイナリ形式は、データがバイナリ形式で保存されるため、文字エンコーディングにおいても安全です。

デモ用に、some_data [テーブル](assets/some_data.sql)と[data](assets/some_data.tsv)を使用しますので、あなたのClickHouseインスタンスで再現してみてください。

## ネイティブClickHouse形式でのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouseノード間でデータをエクスポートおよびインポートするのに最も効率的なデータ形式は[Native](/interfaces/formats.md/#native)形式です。エクスポートは`INTO OUTFILE`句を使用して実行します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブ形式の[data.clickhouse](assets/data.clickhouse)ファイルが作成されます。

### ネイティブ形式からのインポート {#importing-from-a-native-format}

データをインポートするには、[file()](/sql-reference/table-functions/file.md)を使用して小さなファイルや探索目的の場合の操作を行います：

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
`file()`関数を使用する場合、ClickHouse Cloudではファイルが存在するマシン上で`clickhouse client`のコマンドを実行する必要があります。もう1つのオプションは、[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用してローカルでファイルを探索することです。
:::

プロダクション環境では、`FROM INFILE`を使用してデータをインポートします：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブ形式の圧縮 {#native-format-compression}

データをネイティブ形式にエクスポートする際に圧縮を有効にすることもできます（ほとんどの他の形式と同様）し、`COMPRESSION`句を使用します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポート時にLZ4圧縮を使用しました。データをインポートする際にも指定する必要があります：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinary形式へのエクスポート {#exporting-to-rowbinary}

もう一つのサポートされているバイナリ形式は[RowBinary](/interfaces/formats.md/#rowbinary)で、バイナリで表現された行でデータをインポートおよびエクスポートできます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、[data.binary](assets/data.binary)ファイルがバイナリ行形式で生成されます。

### RowBinaryファイルの探索 {#exploring-rowbinary-files}
この形式では自動スキーマ推論はサポートされていないため、ロードする前にスキーマを明示的に定義する必要があります：

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

[RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames)の使用を検討してください。これはカラムリストのヘッダー行も追加します。[RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes)はカラム型を含む追加のヘッダー行も追加します。

### RowBinaryファイルからのインポート {#importing-from-rowbinary-files}
RowBinaryファイルからデータをロードするには、`FROM INFILE`句を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOBを使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

ファイル全体を読み込み、テーブルのフィールドに保存したいとしましょう。
この場合、[RawBLOB形式](/interfaces/formats.md/#rawblob)を使用できます。この形式は単一カラムのテーブルとのみ直接使用できます：

```sql
CREATE TABLE images(data String) Engine = Memory
```

ここでは、`images`テーブルに画像ファイルを保存します：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data`フィールドの長さをチェックすると、元のファイルサイズと等しくなります：

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOBデータのエクスポート {#exporting-rawblob-data}

この形式は、`INTO OUTFILE`句を使用してデータをエクスポートするためにも使用できます：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

1つの値以上をエクスポートするとファイルが破損するため、`LIMIT 1`を使用する必要があることに注意してください。

## MessagePack {#messagepack}

ClickHouseは、[MessagePack](https://msgpack.org/)へのインポートおよびエクスポートを、[MsgPack](/interfaces/formats.md/#msgpack)を使用してサポートしています。MessagePack形式へエクスポートするには：

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePackファイル](assets/data.msgpk)からデータをインポートするには：

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## プロトコルバッファ {#protocol-buffers}

<CloudNotSupportedBadge/>

[Protocol Buffers](/interfaces/formats.md/#protobuf)を使用するには、最初に[スキーマファイル](assets/schema.proto)を定義する必要があります：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイルへのパス（この場合`schema.proto`）は、[Protobuf](/interfaces/formats.md/#protobuf)形式の`format_schema`設定オプションに設定します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これにより、[proto.bin](assets/proto.bin)ファイルにデータが保存されます。ClickHouseは、Protobufデータのインポートとネストされたメッセージもサポートしています。単一のProtocol Bufferメッセージで作業するには、[ProtobufSingle](/interfaces/formats.md/#protobufsingle)を使用してください（この場合、長さ区切り子は省略されます）。

## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouseがサポートするもう一つの人気のバイナリシリアル化形式は[Cap'n Proto](https://capnproto.org/)です。`Protobuf`形式と同様に、私たちの例ではスキーマファイル（[`schema.capnp`](assets/schema.capnp)）を定義する必要があります：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

このスキーマを使用して、[CapnProto](/interfaces/formats.md/#capnproto)形式でデータをインポートおよびエクスポートできます：

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

`Date`カラムを`UInt32`にキャストする必要があったことに注意してください。これは[対応する型の一致](/interfaces/formats/CapnProto#data_types-matching-capnproto)が必要だからです。

## その他の形式 {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するために、テキスト形式とバイナリ形式の両方をサポートします。さまざまな形式やそれらとの作業方法については、以下の記事を参照してください：

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリ形式**
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もチェックしてください。これは、ClickHouseサーバーを起動せずにローカルやリモートのファイルで作業するための、持ち運び可能なフル機能ツールです。
