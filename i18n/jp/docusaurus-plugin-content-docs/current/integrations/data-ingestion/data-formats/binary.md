---
sidebar_label: バイナリとネイティブ
slug: /integrations/data-formats/binary-native
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouseにおけるネイティブおよびバイナリ形式の使用

ClickHouseは複数のバイナリ形式をサポートしており、これによりパフォーマンスとスペース効率が向上します。バイナリ形式は、データがバイナリ形式で保存されるため、文字エンコーディングにおいても安全です。

デモンストレーションのために、some_data [テーブル](assets/some_data.sql) と [データ](assets/some_data.tsv) を使用しますので、あなたのClickHouseインスタンスで再現してみてください。

## ネイティブClickHouse形式でのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouseノード間でデータをエクスポートおよびインポートするための最も効率的なデータ形式は [Native](/interfaces/formats.md/#native) 形式です。エクスポートは `INTO OUTFILE` 句を使用して行います：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブ形式の [data.clickhouse](assets/data.clickhouse) ファイルが作成されます。

### ネイティブ形式からのインポート {#importing-from-a-native-format}

データをインポートするには、小さなファイルや探索目的の場合、[file()](/sql-reference/table-functions/file.md) を使用できます：

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
`file()` 関数を使用する場合、ClickHouse Cloud では、ファイルが存在するマシンの `clickhouse client` でコマンドを実行する必要があります。別のオプションは、[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルでファイルを探索することです。
:::

本番環境では、データをインポートするために `FROM INFILE` を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブ形式の圧縮 {#native-format-compression}

ネイティブ形式（およびほとんどの他の形式）にデータをエクスポートする際に圧縮を有効にすることもできます。`COMPRESSION` 句を使用します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートにはLZ4圧縮を使用しました。データをインポートする際にもこれを指定する必要があります：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinaryへのエクスポート {#exporting-to-rowbinary}

別のサポートされているバイナリ形式は [RowBinary](/interfaces/formats.md/#rowbinary) で、バイナリ表現の行にデータをインポートおよびエクスポートすることができます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、バイナリ行形式の [data.binary](assets/data.binary) ファイルが生成されます。

### RowBinaryファイルの探索 {#exploring-rowbinary-files}
この形式では自動的なスキーマ推論はサポートされていないため、ロードする前にスキーマを明示的に定義する必要があります：

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

[RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames) の使用を検討してください。これはカラムリストを含むヘッダー行も追加します。[RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) はカラムの型を含む追加のヘッダー行も追加します。

### RowBinaryファイルからのインポート {#importing-from-rowbinary-files}
RowBinaryファイルからデータをロードするには、`FROM INFILE` 句を使用できます：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOBを使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

例えば、完全なバイナリファイルを読み込み、テーブルのフィールドに保存したいとします。
この場合、[RawBLOB形式](/interfaces/formats.md/#rawblob)を使用できます。この形式は、単一列のテーブルと直接使用することができます：

```sql
CREATE TABLE images(data String) Engine = Memory
```

画像ファイルを `images` テーブルに保存しましょう：

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

この形式は、`INTO OUTFILE` 句を使用してデータをエクスポートするためにも使用できます：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

単一の値以上をエクスポートするとファイルが壊れるため、`LIMIT 1` を使用する必要がありました。

## MessagePack {#messagepack}

ClickHouseは、[MessagePack](https://msgpack.org/) に対するインポートおよびエクスポートを [MsgPack](/interfaces/formats.md/#msgpack) を使用してサポートしています。MessagePack形式にエクスポートするには：

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

[プロトコルバッファ](/interfaces/formats.md/#protobuf)で作業するには、最初に[スキーマファイル](assets/schema.proto)を定義する必要があります：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

このスキーマファイルへのパス（私たちの例では `schema.proto`）は、[Protobuf](/interfaces/formats.md/#protobuf)形式の `format_schema` 設定オプションで設定されます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これにより、[proto.bin](assets/proto.bin) ファイルにデータが保存されます。ClickHouseは、Protobufデータのインポートやネストされたメッセージもサポートしています。単一のプロトコルバッファメッセージで作業するには、[ProtobufSingle](/interfaces/formats.md/#protobufsingle)を使用することを検討してください（この場合、長さの区切りは省略されます）。

## Cap’n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouseがサポートする別の人気のあるバイナリシリアライズ形式は [Cap’n Proto](https://capnproto.org/) です。`Protobuf`形式と同様に、私たちの例ではスキーマファイル（[`schema.capnp`](assets/schema.capnp)）を定義する必要があります：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

このスキーマを使用して、[CapnProto](/interfaces/formats.md/#capnproto)形式でインポートおよびエクスポートできます：

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

[対応する型に一致させる](/interfaces/formats/CapnProto#data_types-matching-capnproto)ために、`Date`カラムを`UInt32`としてキャストする必要があることに注意してください。

## その他の形式 {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、多くの形式（テキスト形式およびバイナリ形式）のサポートを追加しています。次の文書で、より多くの形式やそれらとの作業方法を探求してください：

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリ形式**
- [SQL形式](sql.md)

そして、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) をもチェックしてください - ClickHouseサーバーを起動することなく、ローカル/リモートファイルで作業するための完全機能のポータブルツールです。
