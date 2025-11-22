---
alias: []
description: 'Avro フォーマットのドキュメント'
input_format: true
keywords: ['Avro']
output_format: true
slug: /interfaces/formats/Avro
title: 'Avro'
doc_type: 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✔  |       |


## Description {#description}

[Apache Avro](https://avro.apache.org/)は、効率的なデータ処理のためにバイナリエンコーディングを使用する行指向のシリアライゼーション形式です。`Avro`形式は、[Avroデータファイル](https://avro.apache.org/docs/++version++/specification/#object-container-files)の読み取りと書き込みに対応しています。この形式では、スキーマが埋め込まれた自己記述型メッセージを前提としています。スキーマレジストリと併用してAvroを使用する場合は、[`AvroConfluent`](./AvroConfluent.md)形式を参照してください。


## データ型マッピング {#data-type-mapping}

<DataTypeMapping />


## フォーマット設定 {#format-settings}

| 設定                                    | 説明                                                                                                                                             | デフォルト |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `input_format_avro_allow_missing_fields`   | スキーマ内にフィールドが見つからない場合に、エラーをスローせずにデフォルト値を使用するかどうか。                                                    | `0`     |
| `input_format_avro_null_as_default`        | NULL不可カラムに`null`値を挿入する際に、エラーをスローせずにデフォルト値を使用するかどうか。                                   | `0`     |
| `output_format_avro_codec`                 | Avro出力ファイルの圧縮アルゴリズム。指定可能な値:`null`、`deflate`、`snappy`、`zstd`。                                                      |         |
| `output_format_avro_sync_interval`         | Avroファイル内の同期マーカーの頻度(バイト単位)。                                                                                                         | `16384` |
| `output_format_avro_string_column_pattern` | Avro文字列型マッピングのために`String`カラムを識別する正規表現。デフォルトでは、ClickHouseの`String`カラムはAvroの`bytes`型として書き込まれます。 |         |
| `output_format_avro_rows_in_file`          | Avro出力ファイルあたりの最大行数。この制限に達すると、新しいファイルが作成されます(ストレージシステムがファイル分割をサポートしている場合)。         | `1`     |


## 例 {#examples}

### Avroデータの読み取り {#reading-avro-data}

AvroファイルからClickHouseテーブルにデータを読み取るには:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

取り込むAvroファイルのルートスキーマは`record`型である必要があります。

テーブルカラムとAvroスキーマのフィールド間の対応関係を見つけるため、ClickHouseはそれらの名前を比較します。
この比較は大文字小文字を区別し、未使用のフィールドはスキップされます。

ClickHouseテーブルカラムのデータ型は、挿入されるAvroデータの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouseは上記の表に従ってデータ型を解釈し、その後データを対応するカラム型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。

データをインポートする際、スキーマ内にフィールドが見つからず、設定[`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields)が有効になっている場合、エラーをスローする代わりにデフォルト値が使用されます。

### Avroデータの書き込み {#writing-avro-data}

ClickHouseテーブルからAvroファイルにデータを書き込むには:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

カラム名は以下の条件を満たす必要があります:

- `[A-Za-z_]`で始まる
- その後は`[A-Za-z0-9_]`のみが続く

Avroファイルの出力圧縮と同期間隔は、それぞれ[`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec)および[`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval)設定を使用して構成できます。

### Avroスキーマの推論 {#inferring-the-avro-schema}

ClickHouseの[`DESCRIBE`](/sql-reference/statements/describe-table)関数を使用すると、次の例のようにAvroファイルの推論されたフォーマットを素早く確認できます。
この例には、ClickHouse S3パブリックバケット内の公開アクセス可能なAvroファイルのURLが含まれています:

```sql
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);

┌─name───────────────────────┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ WatchID                    │ Int64           │              │                    │         │                  │                │
│ JavaEnable                 │ Int32           │              │                    │         │                  │                │
│ Title                      │ String          │              │                    │         │                  │                │
│ GoodEvent                  │ Int32           │              │                    │         │                  │                │
│ EventTime                  │ Int32           │              │                    │         │                  │                │
│ EventDate                  │ Date32          │              │                    │         │                  │                │
│ CounterID                  │ Int32           │              │                    │         │                  │                │
│ ClientIP                   │ Int32           │              │                    │         │                  │                │
│ ClientIP6                  │ FixedString(16) │              │                    │         │                  │                │
│ RegionID                   │ Int32           │              │                    │         │                  │                │
...
│ IslandID                   │ FixedString(16) │              │                    │         │                  │                │
│ RequestNum                 │ Int32           │              │                    │         │                  │                │
│ RequestTry                 │ Int32           │              │                    │         │                  │                │
└────────────────────────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
