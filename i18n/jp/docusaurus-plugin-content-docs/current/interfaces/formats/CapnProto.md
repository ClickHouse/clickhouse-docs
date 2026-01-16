---
alias: []
description: 'CapnProto に関するドキュメント'
input_format: true
keywords: ['CapnProto']
output_format: true
slug: /interfaces/formats/CapnProto
title: 'CapnProto'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✔  |       |

## 説明 \\{#description\\}

`CapnProto` フォーマットは、[`Protocol Buffers`](https://developers.google.com/protocol-buffers/) フォーマットや [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift) に似たバイナリメッセージフォーマットであり、[JSON](./JSON/JSON.md) や [MessagePack](https://msgpack.org/) とは異なります。
CapnProto メッセージは厳密に型付けされており、自己記述的ではないため、外部のスキーマ記述が必要です。スキーマは動的に適用され、クエリごとにキャッシュされます。

[Format Schema](/interfaces/formats/#formatschema) も参照してください。

## データ型の対応 \\{#data_types-matching-capnproto\\}

以下の表は、サポートされているデータ型と、それらが `INSERT` クエリおよび `SELECT` クエリで ClickHouse の [データ型](/sql-reference/data-types/index.md) とどのように対応するかを示します。

| CapnProto データ型 (`INSERT`)                        | ClickHouse データ型                                                                                                                                                          | CapnProto データ型 (`SELECT`)                        |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| `UINT8`, `BOOL`                                      | [UInt8](/sql-reference/data-types/int-uint.md)                                                                                                                         | `UINT8`                                              |
| `INT8`                                               | [Int8](/sql-reference/data-types/int-uint.md)                                                                                                                          | `INT8`                                               |
| `UINT16`                                             | [UInt16](/sql-reference/data-types/int-uint.md), [Date](/sql-reference/data-types/date.md)                                                                     | `UINT16`                                             |
| `INT16`                                              | [Int16](/sql-reference/data-types/int-uint.md)                                                                                                                         | `INT16`                                              |
| `UINT32`                                             | [UInt32](/sql-reference/data-types/int-uint.md), [DateTime](/sql-reference/data-types/datetime.md)                                                             | `UINT32`                                             |
| `INT32`                                              | [Int32](/sql-reference/data-types/int-uint.md), [Decimal32](/sql-reference/data-types/decimal.md)                                                              | `INT32`                                              |
| `UINT64`                                             | [UInt64](/sql-reference/data-types/int-uint.md)                                                                                                                        | `UINT64`                                             |
| `INT64`                                              | [Int64](/sql-reference/data-types/int-uint.md), [DateTime64](/sql-reference/data-types/datetime.md), [Decimal64](/sql-reference/data-types/decimal.md) | `INT64`                                              |
| `FLOAT32`                                            | [Float32](/sql-reference/data-types/float.md)                                                                                                                          | `FLOAT32`                                            |
| `FLOAT64`                                            | [Float64](/sql-reference/data-types/float.md)                                                                                                                          | `FLOAT64`                                            |
| `TEXT, DATA`                                         | [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md)                                                         | `TEXT, DATA`                                         |
| `union(T, Void), union(Void, T)`                     | [Nullable(T)](/sql-reference/data-types/date.md)                                                                                                                       | `union(T, Void), union(Void, T)`                     |
| `ENUM`                                               | [Enum(8/16)](/sql-reference/data-types/enum.md)                                                                                                                        | `ENUM`                                               |
| `LIST`                                               | [Array](/sql-reference/data-types/array.md)                                                                                                                            | `LIST`                                               |
| `STRUCT`                                             | [Tuple](/sql-reference/data-types/tuple.md)                                                                                                                            | `STRUCT`                                             |
| `UINT32`                                             | [IPv4](/sql-reference/data-types/ipv4.md)                                                                                                                              | `UINT32`                                             |
| `DATA`                                               | [IPv6](/sql-reference/data-types/ipv6.md)                                                                                                                              | `DATA`                                               |
| `DATA`                                               | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                                                                 | `DATA`                                               |
| `DATA`                                               | [Decimal128/Decimal256](/sql-reference/data-types/decimal.md)                                                                                                          | `DATA`                                               |
| `STRUCT(entries LIST(STRUCT(key Key, value Value)))` | [Map](/sql-reference/data-types/map.md)                                                                                                                                | `STRUCT(entries LIST(STRUCT(key Key, value Value)))` |

- 整数型は、入出力時に相互に変換できます。
- CapnProto 形式で `Enum` を扱う場合は、[format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode) 設定を使用してください。
- 配列は入れ子にでき、引数として `Nullable` 型の値を持つことができます。`Tuple` 型および `Map` 型も入れ子にできます。

## 使用例 \\{#example-usage\\}

### データの挿入と選択 \\{#inserting-and-selecting-data-capnproto\\}

次のコマンドを実行すると、ファイル内の CapnProto データを ClickHouse のテーブルに挿入できます。

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

`schema.capnp` は次のような内容です：

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

次のコマンドを使用して、ClickHouse テーブルからデータを抽出し、`CapnProto` 形式のファイルに保存できます。

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```

### 自動生成スキーマの使用 \\{#using-autogenerated-capn-proto-schema\\}

データ用の外部 `CapnProto` スキーマがない場合でも、自動生成されたスキーマを使用して、`CapnProto` 形式でデータを出力および入力できます。

例:

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

この場合、ClickHouse はテーブル構造に基づいて関数 [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structureToCapnProtoSchema) を使用して CapnProto スキーマを自動生成し、このスキーマを用いてデータを CapnProto 形式でシリアライズします。

自動生成されたスキーマを使って CapnProto ファイルを読み込むこともできます（この場合、そのファイルは同じスキーマから生成されている必要があります）:

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```

## フォーマット設定 \\{#format-settings\\}

設定 [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) はデフォルトで有効になっており、[`format_schema`](/interfaces/formats#formatschema) が設定されていない場合に適用されます。

また、[`output_format_schema`](/operations/settings/formats#output_format_schema) 設定を使用して、入出力時に自動生成されたスキーマをファイルに保存することもできます。

例：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```

この場合、自動生成された `CapnProto` スキーマは `path/to/schema/schema.capnp` というファイルに保存されます。
