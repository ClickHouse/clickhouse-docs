---
alias: []
description: 'Avro 形式に関するドキュメント'
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


## 説明 {#description}

[Apache Avro](https://avro.apache.org/) は、効率的なデータ処理のためにバイナリエンコーディングを使用する行指向のシリアル化形式です。`Avro` 形式は、[Avro data files](https://avro.apache.org/docs/++version++/specification/#object-container-files) の読み書きをサポートします。この形式では、スキーマを埋め込んだ自己記述的なメッセージを想定しています。スキーマレジストリと共に Avro を使用している場合は、[`AvroConfluent`](./AvroConfluent.md) 形式を参照してください。



## データ型マッピング {#data-type-mapping}

<DataTypeMapping/>



## フォーマット設定 {#format-settings}

| Setting                                     | Description                                                                                         | Default |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | スキーマ内にフィールドが見つからない場合に、エラーとせずデフォルト値を使用するかどうか。 | `0`     |
| `input_format_avro_null_as_default`         | NULL 非許容列に `null` 値を挿入する際に、エラーとせずデフォルト値を使用するかどうか。 |   `0`   |
| `output_format_avro_codec`                  | Avro 出力ファイルの圧縮アルゴリズム。指定可能な値: `null`, `deflate`, `snappy`, `zstd`.            |         |
| `output_format_avro_sync_interval`          | Avro ファイル内の同期マーカーの頻度（バイト単位）。 | `16384` |
| `output_format_avro_string_column_pattern`  | Avro の string 型にマッピングするために `String` 列を識別する正規表現。デフォルトでは、ClickHouse の `String` 列は Avro の `bytes` 型として書き込まれます。                                 |         |
| `output_format_avro_rows_in_file`           | Avro 出力ファイルあたりの最大行数。この上限に達すると、新しいファイルが作成されます（ストレージシステムがファイル分割をサポートしている場合）。                                                         | `1`     |



## 例

### Avro データの読み取り

Avro ファイルから ClickHouse テーブルにデータを読み込むには、次のようにします。

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

取り込まれた Avro ファイルのルートスキーマは、型 `record` である必要があります。

テーブルのカラムと Avro スキーマのフィールドの対応関係を特定するために、ClickHouse はそれらの名前を比較します。
この比較は大文字と小文字を区別し、使用されないフィールドはスキップされます。

ClickHouse テーブルのカラムのデータ型は、挿入される Avro データ内の対応するフィールドの型と異なる場合があります。データを挿入する際、ClickHouse は上記の表に従ってデータ型を解釈し、その後データを対応するカラム型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。

データをインポートする際に、スキーマ内でフィールドが見つからず、かつ設定[`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields)が有効になっている場合は、エラーをスローする代わりにデフォルト値が使用されます。

### Avro データの書き込み

ClickHouse テーブルから Avro ファイルにデータを書き出すには、次のようにします。

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

列名は次の条件を満たす必要があります。

* `[A-Za-z_]` で始まること
* 後続は `[A-Za-z0-9_]` のみで構成されること

Avro ファイルの出力圧縮方式と同期間隔は、それぞれ [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 設定および [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 設定を使用して設定できます。

### Avro スキーマの推論

ClickHouse の [`DESCRIBE`](/sql-reference/statements/describe-table) 関数を使用すると、次の例のように、Avro ファイルから推論された形式をすばやく確認できます。
この例には、ClickHouse の S3 パブリックバケット内にある、公開アクセス可能な Avro ファイルの URL が含まれています。

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
