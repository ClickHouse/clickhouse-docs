---
sidebar_label: バイナリとネイティブ
slug: /integrations/data-formats/binary-native
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ClickHouseにおけるネイティブおよびバイナリフォーマットの使用

ClickHouseは複数のバイナリフォーマットをサポートしており、これによりパフォーマンスとスペース効率が向上します。バイナリフォーマットは、データがバイナリ形式で保存されるため、文字エンコーディングに対しても安全です。

デモ用に some_data [テーブル](assets/some_data.sql) と [データ](assets/some_data.tsv) を使用しますので、あなたのClickHouseインスタンスで再現してみてください。

## ネイティブClickHouseフォーマットでのエクスポート {#exporting-in-a-native-clickhouse-format}

ClickHouseノード間でデータをエクスポートおよびインポートするための最も効率的なデータフォーマットは [Native](/interfaces/formats.md/#native) フォーマットです。エクスポートは `INTO OUTFILE` 句を使用して行います：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

これにより、ネイティブフォーマットの [data.clickhouse](assets/data.clickhouse) ファイルが作成されます。

### ネイティブフォーマットからのインポート {#importing-from-a-native-format}

データをインポートするには、[file()](/sql-reference/table-functions/file.md) を使用できます。ただし、これは小さいファイルや探索目的の場合に適しています：

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
`file()` 関数を使用する場合、ClickHouse Cloudでは、ファイルが存在するマシン上の `clickhouse client` でコマンドを実行する必要があります。別のオプションとして [`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用してローカルでファイルを探索することもできます。
:::

本番環境では、データをインポートするために `FROM INFILE` を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### ネイティブフォーマットの圧縮 {#native-format-compression}

データをネイティブフォーマットにエクスポートする際に圧縮を有効にすることもできます（他の多くのフォーマットでも同様です）。これには `COMPRESSION` 句を使用します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

エクスポートにはLZ4圧縮を使用しました。データをインポートする際にも指定する必要があります：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## RowBinaryへのエクスポート {#exporting-to-rowbinary}

別のバイナリフォーマットとして [RowBinary](/interfaces/formats.md/#rowbinary) がサポートされています。これにより、バイナリ形式で表現された行としてデータをインポートおよびエクスポートできます：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

これにより、バイナリ行形式の [data.binary](assets/data.binary) ファイルが生成されます。

### RowBinaryファイルの探索 {#exploring-rowbinary-files}

このフォーマットでは自動スキーマ推論がサポートされていないため、ロードする前にスキーマを明示的に定義する必要があります：

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

[RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames) を使用することを考慮してください。これにより、カラムのリストを含むヘッダー行も追加されます。[RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) は、カラムタイプを含む追加のヘッダー行も追加します。

### RowBinaryファイルからのインポート {#importing-from-rowbinary-files}

RowBinaryファイルからデータをロードするには、`FROM INFILE` 句を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## RawBLOBを使用した単一バイナリ値のインポート {#importing-single-binary-value-using-rawblob}

完全なバイナリファイルを読み込み、テーブル内のフィールドに保存したいとします。この場合、[RawBLOBフォーマット](/interfaces/formats.md/#rawblob) を使用できます。このフォーマットは、単一カラムテーブルでのみ直接使用できます：

```sql
CREATE TABLE images(data String) Engine = Memory
```

画像ファイルを `images` テーブルに保存してみましょう：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

`data` フィールドの長さを確認すると、元のファイルサイズと等しくなります：

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### RawBLOBデータのエクスポート {#exporting-rawblob-data}

このフォーマットは、`INTO OUTFILE` 句を使用してデータをエクスポートするためにも使用できます：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

複数の値をエクスポートするとファイルが破損するため、`LIMIT 1` を使用する必要があることに注意してください。

## MessagePack {#messagepack}

ClickHouseは、[MessagePack](https://msgpack.org/) へのインポートおよびエクスポートを [MsgPack](/interfaces/formats.md/#msgpack) を使用してサポートしています。MessagePackフォーマットにエクスポートするには：

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

## プロトコルバッファー {#protocol-buffers}

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

このスキーマファイルへのパス（この場合は `schema.proto`）は、[Protobuf](/interfaces/formats.md/#protobuf) フォーマットのための `format_schema` 設定オプションで設定します：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

これにより、[proto.bin](assets/proto.bin) ファイルにデータが保存されます。ClickHouseは、Protobufデータのインポートやネストされたメッセージのサポートも行っています。単一のProtocol Bufferメッセージを扱うには、[ProtobufSingle](/interfaces/formats.md/#protobufsingle) を使用してください（この場合は長さの区切りが省略されます）。

## Cap’n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouseがサポートする別の人気のバイナリシリアル化フォーマットは [Cap’n Proto](https://capnproto.org/) です。`Protobuf`フォーマットと同様に、今回の例ではスキーマファイル（[`schema.capnp`](assets/schema.capnp)）を定義する必要があります：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

次に、このスキーマを使用して [CapnProto](/interfaces/formats.md/#capnproto) フォーマットでインポートおよびエクスポートします：

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

`Date` カラムを `UInt32` にキャストする必要があったことに注意してください。これは [データ型の対応](/interfaces/formats.md/#data_types-matching-capnproto) のためです。

## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、多くのテキストおよびバイナリフォーマットのサポートを導入しています。その他のフォーマットやそれらの扱い方については、以下の記事を参照してください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- **ネイティブおよびバイナリフォーマット**
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) もチェックしてください。これは、ClickHouseサーバーを起動せずにローカル/リモートファイルを扱うためのポータブルでフル機能のツールです。
