---
'sidebar_label': 'バイナリとネイティブ'
'slug': '/integrations/data-formats/binary-native'
'title': 'ClickHouseにおけるネイティブおよびバイナリ形式の使用'
'description': 'ClickHouseにおけるネイティブおよびバイナリ形式の使用方法を説明するページ'
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouseにおけるネイティブおよびバイナリ形式の使用

ClickHouseは複数のバイナリ形式をサポートしており、これによりパフォーマンスとスペース効率が向上します。バイナリ形式は、データがバイナリ形式で保存されるため、文字エンコーディングに対しても安全です。

デモンストレーションには some_data [table](assets/some_data.sql) と [data](assets/some_data.tsv) を使用しますので、あなたのClickHouseインスタンスで再現しても構いません。

## ネイティブClickHouse形式でのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouseノード間でデータをエクスポートおよびインポートする最も効率的なデータ形式は、[Native](/interfaces/formats.md/#native)形式です。エクスポートは `INTO OUTFILE`句を使用して行います：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これによりネイティブ形式の[data.clickhouse](assets/data.clickhouse)ファイルが作成されます。

### ネイティブ形式からのインポート {#importing-from-a-native-format}

データをインポートするには、小さなファイルや探索目的の場合は[ file() ](/sql-reference/table-functions/file.md)を使用できます：

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
`file()`関数を使用する場合、ClickHouse Cloudではファイルが存在するマシンの `clickhouse client` でコマンドを実行する必要があります。もう一つの選択肢は、[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用してローカルでファイルを探索することです。
:::

本番環境では、`FROM INFILE`を使用してデータをインポートします：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブ形式の圧縮 {#native-format-compression}

データをネイティブ形式にエクスポートする際に（他のほとんどの形式と同様に）、`COMPRESSION`句を使用して圧縮を有効にすることもできます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートにはLZ4圧縮を使用しました。データをインポートする際にもそれを指定する必要があります：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinary形式へのエクスポート {#exporting-to-rowbinary}

もう一つのサポートされているバイナリ形式は[RowBinary](/interfaces/formats.md/#rowbinary)であり、これはバイナリ表現された行でデータをインポートおよびエクスポートすることができます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、バイナリ行形式の[data.binary](assets/data.binary)ファイルが生成されます。

### RowBinaryファイルの探索 {#exploring-rowbinary-files}
この形式では自動スキーマ推測はサポートされていないため、ロードする前にスキーマを明示的に定義する必要があります：

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

[RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames)を使用することを検討してください。これにより、カラムのリストを含むヘッダ行が追加されます。[RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes)では、カラムの型を含む追加のヘッダ行も追加されます。

### RowBinaryファイルからのインポート {#importing-from-rowbinary-files}
RowBinaryファイルからデータをロードするには、`FROM INFILE`句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOBを使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

完全なバイナリファイルを読み取り、テーブルのフィールドに保存したいとします。この場合、[RawBLOB形式](/interfaces/formats.md/#rawblob)を使用できます。この形式は、単一カラムのテーブルでのみ直接使用可能です：

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

`images`テーブルに画像ファイルを保存しましょう：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data`フィールドの長さを確認すると、それは元のファイルサイズと等しくなります：

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

注意点として、複数の値をエクスポートするには`LIMIT 1`を使用する必要があります。そうしないと、破損したファイルが作成されます。

## MessagePack {#messagepack}

ClickHouseは、[MessagePack](https://msgpack.org/)へのインポートおよびエクスポートを[MsgPack](/interfaces/formats.md/#msgpack)を使用してサポートしています。MessagePack形式にエクスポートするには：

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

[Protocol Buffers](/interfaces/formats.md/#protobuf)を使用するには、まず[スキーマファイル](assets/schema.proto)を定義する必要があります：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイルへのパス（この場合 `schema.proto`）は、[Protobuf](/interfaces/formats.md/#protobuf)形式の設定オプションである`format_schema`に設定されます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これにより[data.proto](assets/proto.bin)ファイルにデータが保存されます。ClickHouseはProtobufデータのインポートおよびネストされたメッセージもサポートしています。単一のProtocol Bufferメッセージで作業するために[ProtobufSingle](/interfaces/formats.md/#protobufsingle)を使用することを検討してください（この場合、長さデリミタは省略されます）。

## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouseがサポートするもう一つの人気のあるバイナリシリアライズ形式は[Cap'n Proto](https://capnproto.org/)です。`Protobuf`形式と同様に、私たちの例ではスキーマファイル（[`schema.capnp`](assets/schema.capnp)）を定義する必要があります：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

これで、[CapnProto](/interfaces/formats.md/#capnproto)形式とこのスキーマを使用してインポートおよびエクスポートが可能になります：

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

`Date`カラムを`UInt32`としてキャストする必要があることに注意してください。これは[対応する型を一致させるため](/interfaces/formats/CapnProto#data_types-matching-capnproto)です。

## その他の形式 {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、テキスト形式とバイナリ形式の多くをサポートしています。以下の記事でさらに多くの形式やそれらを扱う方法を探索してください：

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regexおよびテンプレート](templates-regex.md)
- **ネイティブおよびバイナリ形式**
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)をチェックしてください。これはClickHouseサーバーを起動せずにローカル/リモートファイルで作業できる、ポータブルでフル機能のツールです。
