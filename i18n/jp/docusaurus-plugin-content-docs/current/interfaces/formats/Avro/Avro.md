---
title: Avro
slug: /interfaces/formats/Avro
keywords: [Avro]
input_format: true
output_format: true
alias: []
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Avro](https://avro.apache.org/)は、ApacheのHadoopプロジェクト内で開発された行指向データシリアライゼーションフレームワークです。
ClickHouseの`Avro`形式は、[Avroデータファイル](https://avro.apache.org/docs/current/spec.html#Object+Container+Files)の読み取りと書き込みをサポートしています。

## データ型の一致 {#data-types-matching}

<DataTypesMatching/>

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

AvroファイルからClickHouseテーブルにデータを挿入するには：

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

取り込むAvroファイルのルートスキーマは`record`型である必要があります。

テーブルカラムとAvroスキーマのフィールドの対応を見つけるために、ClickHouseはそれらの名前を比較します。この比較は大文字と小文字を区別し、未使用のフィールドはスキップされます。

ClickHouseテーブルのカラムデータ型は、挿入されたAvroデータの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouseは上記のテーブルに従ってデータ型を解釈し、その後、対応するカラムタイプに[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。

データをインポートする際、スキーマにフィールドが見つからない場合で、[`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields)の設定が有効になっていると、エラーを投げる代わりにデフォルト値が使用されます。

### データの選択 {#selecting-data}

ClickHouseテーブルからAvroファイルにデータを選択するには：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

カラム名は次の条件を満たす必要があります：

- `[A-Za-z_]`で始まる
- 続けて`[A-Za-z0-9_]`のみが続く

出力Avroファイルの圧縮と同期間隔は、それぞれ設定[`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec)および[`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval)で構成できます。

### データの例 {#example-data}

ClickHouseの[`DESCRIBE`](/sql-reference/statements/describe-table)関数を使用すると、次の例のようにAvroファイルの推論された形式を迅速に表示できます。この例には、ClickHouseのS3パブリックバケットにある公開アクセス可能なAvroファイルのURLが含まれています：

```sql title="クエリ"
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);
```
```response title="レスポンス"
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

## フォーマット設定 {#format-settings}

| 設定                                         | 説明                                                                                                  | デフォルト |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | Avro/AvroConfluent形式の場合：スキーマにフィールドが見つからない場合、エラーの代わりにデフォルト値を使用 | `0`     |
| `input_format_avro_null_as_default`         | Avro/AvroConfluent形式の場合：ヌルおよび非Nullableカラムの場合にデフォルトを挿入                       |   `0`   |
| `format_avro_schema_registry_url`           | AvroConfluent形式の場合：ConfluentスキーマレジストリのURL。                                           |         |
| `output_format_avro_codec`                  | 出力に使用される圧縮コーデック。可能な値：'null', 'deflate', 'snappy', 'zstd'。                    |         |
| `output_format_avro_sync_interval`          | バイト単位の同期間隔。                                                                            | `16384` |
| `output_format_avro_string_column_pattern`  | Avro形式の場合：AVRO文字列として選択するStringカラムの正規表現。                                     |         |
| `output_format_avro_rows_in_file`           | ファイル内の最大行数（ストレージが許可する場合）                                                       | `1`     |
