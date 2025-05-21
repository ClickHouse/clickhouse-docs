---
sidebar_label: 'バイナリおよびネイティブ'
slug: /integrations/data-formats/binary-native
title: 'ClickHouseにおけるネイティブおよびバイナリフォーマットの使用'
description: 'ClickHouseにおけるネイティブおよびバイナリフォーマットの使用方法を説明するページ'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouseにおけるネイティブおよびバイナリフォーマットの使用

ClickHouseは複数のバイナリフォーマットをサポートしており、これによりパフォーマンスとスペース効率が向上します。バイナリフォーマットは、データがバイナリ形式で保存されるため、文字エンコーディングに対しても安全です。

デモンストレーションのために some_data [テーブル](assets/some_data.sql) と [データ](assets/some_data.tsv) を使用しますので、あなたのClickHouseインスタンスで再現してみてください。

## ネイティブClickHouseフォーマットでのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouseノード間でデータをエクスポートおよびインポートするための最も効率的なデータフォーマットは [ネイティブ](/interfaces/formats.md/#native) フォーマットです。エクスポートは `INTO OUTFILE` 句を使用して行います：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブフォーマットの [data.clickhouse](assets/data.clickhouse) ファイルが作成されます。

### ネイティブフォーマットからのインポート {#importing-from-a-native-format}

データをインポートするには、小さなファイルや探索の目的で [file()](/sql-reference/table-functions/file.md) を使用することができます：

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
`file()` 関数を使用する場合、ClickHouse Cloudでは、ファイルが存在するマシンの `clickhouse client` でコマンドを実行する必要があります。別のオプションとして、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルでファイルを探索することができます。
:::

本番環境では、データをインポートするために `FROM INFILE` を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブフォーマットの圧縮 {#native-format-compression}

データをネイティブフォーマットにエクスポートする際に、`COMPRESSION` 句を使用して圧縮を有効にすることもできます（他のほとんどのフォーマットでも可能です）：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートのためにLZ4圧縮を使用しました。データをインポートする際にもこれを指定する必要があります：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinaryへのエクスポート {#exporting-to-rowbinary}

サポートされている別のバイナリフォーマットは [RowBinary](/interfaces/formats.md/#rowbinary) で、これはバイナリで表現された行のデータのインポートおよびエクスポートを可能にします：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、バイナリ行形式の [data.binary](assets/data.binary) ファイルが生成されます。

### RowBinaryファイルの探索 {#exploring-rowbinary-files}
このフォーマットでは自動的なスキーマ推論はサポートされていないため、読み込み前にスキーマを明示的に定義する必要があります：

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

カラムのリストを持つヘッダー行も追加される [RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames) の使用を考慮してください。[RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) は、カラムタイプを含む追加のヘッダー行も追加します。

### RowBinaryファイルからのインポート {#importing-from-rowbinary-files}
RowBinaryファイルからデータを読み込むには、`FROM INFILE` 句を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOBを使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

バイナリファイル全体を読み取り、テーブルのフィールドに保存したいとします。
これは、[RawBLOBフォーマット](/interfaces/formats.md/#rawblob) を使用できる場合です。このフォーマットは、単一カラムのテーブルでのみ直接使用できます：

```sql
CREATE TABLE images(data String) Engine = Memory
```

`images` テーブルに画像ファイルを保存してみましょう：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

元のファイルサイズと等しい `data` フィールドの長さを確認できます：

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOBデータのエクスポート {#exporting-rawblob-data}

このフォーマットも、`INTO OUTFILE` 句を使用してデータをエクスポートするために使用できます：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

単一の値以上をエクスポートすると壊れたファイルが作成されるため、`LIMIT 1` を使用する必要があります。

## MessagePack {#messagepack}

ClickHouseは [MessagePack](https://msgpack.org/) へのインポートおよびエクスポートを [MsgPack](/interfaces/formats.md/#msgpack) フォーマットを使用してサポートしています。MessagePackフォーマットにエクスポートするには：

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

[MessagePackファイル](assets/data.msgpk) からデータをインポートするには：

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## プロトコルバッファー {#protocol-buffers}

<CloudNotSupportedBadge/>

[プロトコルバッファー](/interfaces/formats.md/#protobuf) を使用するには、まず [スキーマファイル](assets/schema.proto) を定義する必要があります：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイルへのパス（この場合は `schema.proto`）は、[Protobuf](/interfaces/formats.md/#protobuf) フォーマットのための `format_schema` 設定オプションに設定されます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これは [proto.bin](assets/proto.bin) ファイルにデータを保存します。ClickHouseはProtobufデータのインポートもサポートしており、ネストされたメッセージも扱えます。単一のプロトコルバッファメッセージと作業するために [ProtobufSingle](/interfaces/formats.md/#protobufsingle) の使用を検討してください（この場合、長さの区切りは省略されます）。

## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouseがサポートするもう一つの人気のあるバイナリ直列化フォーマットは [Cap'n Proto](https://capnproto.org/) です。`Protobuf` フォーマットと同様に、例としてスキーマファイル（[`schema.capnp`](assets/schema.capnp)）を定義する必要があります：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

このスキーマを使用して [CapnProto](/interfaces/formats.md/#capnproto) フォーマットでエクスポートおよびインポートすることができます：

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

`Date` カラムを `UInt32` としてキャストする必要があることに注意してください [対応するタイプをマッチさせる](/interfaces/formats/CapnProto#data_types-matching-capnproto)。

## その他のフォーマット {#other-formats}

ClickHouseはさまざまなシナリオやプラットフォームをカバーするために、多くのテキストおよびバイナリフォーマットのサポートを導入しています。以下の記事で、より多くのフォーマットとそれらを操作する方法を探求してください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリフォーマット**
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) をチェックしてください - ClickHouseサーバーを起動せずにローカル/リモートファイルで作業するためのポータブルなフル機能ツールです。
