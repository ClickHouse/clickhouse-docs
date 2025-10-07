---
'alias': []
'description': 'Capnprotoのドキュメンテーション'
'input_format': true
'keywords':
- 'CapnProto'
'output_format': true
'slug': '/interfaces/formats/CapnProto'
'title': 'CapnProto'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`CapnProto` フォーマットは、[`Protocol Buffers`](https://developers.google.com/protocol-buffers/) フォーマットや [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift) に似たバイナリメッセージフォーマットですが、[JSON](./JSON/JSON.md) や [MessagePack](https://msgpack.org/) とは異なります。
CapnProto メッセージは厳密に型付けされており、自己記述的ではないため、外部のスキーマ記述が必要です。スキーマはその場で適用され、各クエリのためにキャッシュされます。

[フォーマットスキーマ](/interfaces/formats/#formatschema)も参照してください。

## データ型の一致 {#data_types-matching-capnproto}

以下の表は、サポートされているデータ型とそれらが `INSERT` および `SELECT` クエリにおいて ClickHouse の [データ型](/sql-reference/data-types/index.md) にどのように対応するかを示しています。

| CapnProto データ型 (`INSERT`)                       | ClickHouse データ型                                                                                                                                                           | CapnProto データ型 (`SELECT`)                       |
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

- 整数型は、入力/出力時に相互に変換できます。
- CapnProtoフォーマットでの `Enum` を扱うには、[format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode) 設定を使用してください。
- 配列はネスト可能で、`Nullable` 型の値を引数に持つことができます。`Tuple` および `Map` 型もネスト可能です。

## 使用例 {#example-usage}

### データの挿入と選択 {#inserting-and-selecting-data-capnproto}

以下のコマンドを使用して、ファイルから ClickHouse テーブルに CapnProto データを挿入できます。

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

`schema.capnp` はこのようになります：

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

以下のコマンドを使用して、ClickHouse テーブルからデータを選択し、`CapnProto` フォーマットのファイルに保存できます。

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```

### 自動生成されたスキーマを使用する {#using-autogenerated-capn-proto-schema}

データの外部 `CapnProto` スキーマがない場合でも、自動生成されたスキーマを使用して `CapnProto` フォーマットでデータを出力/入力できます。

例えば：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

この場合、ClickHouse はテーブルの構造に基づいて関数 [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structure_to_capn_proto_schema) を使用して CapnProto スキーマを自動生成し、このスキーマを使用して CapnProto フォーマットでデータをシリアライズします。

自動生成されたスキーマの CapnProto ファイルを読み取ることもできます（この場合、ファイルは同じスキーマを使用して作成されている必要があります）。

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```

## フォーマット設定 {#format-settings}

設定 [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) はデフォルトで有効になっており、[`format_schema`](/interfaces/formats#formatschema) が設定されていない場合に適用されます。

また、設定 [`output_format_schema`](/operations/settings/formats#output_format_schema) を使用して、入出力中に自動生成されたスキーマをファイルに保存することもできます。

例えば：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```
この場合、自動生成された `CapnProto` スキーマがファイル `path/to/schema/schema.capnp` に保存されます。
