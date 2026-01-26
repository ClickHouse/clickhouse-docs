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

## 説明 \{#description\}

[Apache Avro](https://avro.apache.org/) は、効率的なデータ処理のためにバイナリエンコーディングを使用する行指向のシリアル化フォーマットです。`Avro` フォーマットは、[Avro データファイル](https://avro.apache.org/docs/++version++/specification/#object-container-files) の読み書きをサポートします。このフォーマットは、スキーマを埋め込んだ自己記述型のメッセージを前提としています。Avro をスキーマレジストリと併用している場合は、[`AvroConfluent`](./AvroConfluent.md) フォーマットを参照してください。

## データ型マッピング \{#data-type-mapping\}

<DataTypeMapping/>

## フォーマット設定 \{#format-settings\}

| 設定                                         | 説明                                                                                                  | デフォルト |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|-----------|
| `input_format_avro_allow_missing_fields`    | スキーマ内にフィールドが存在しない場合にエラーとする代わりにデフォルト値を使用するかどうか。 | `0`       |
| `input_format_avro_null_as_default`         | NULL 不可の列に `null` 値を挿入する際にエラーとする代わりにデフォルト値を使用するかどうか。 | `0`       |
| `output_format_avro_codec`                  | Avro 出力ファイルの圧縮アルゴリズム。指定可能な値: `null`, `deflate`, `snappy`, `zstd`.            |           |
| `output_format_avro_sync_interval`          | Avro ファイルにおける同期マーカーの頻度（バイト単位）。 | `16384`   |
| `output_format_avro_string_column_pattern`  | Avro の `string` 型にマッピングする対象となる `String` 列を識別するための正規表現。デフォルトでは、ClickHouse の `String` 列は Avro の `bytes` 型として書き出される。 |           |
| `output_format_avro_rows_in_file`           | 1 つの Avro 出力ファイルあたりの最大行数。この上限に達すると、新しいファイルが作成される（ストレージシステムがファイル分割をサポートしている場合）。 | `1`       |

## 例 \{#examples\}

### Avro データの読み取り \{#reading-avro-data\}

Avro ファイルから ClickHouse テーブルにデータを読み込むには、次のとおりです。

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

取り込まれた Avro ファイルのルートスキーマは、`record` 型でなければなりません。

テーブルのカラムと Avro スキーマのフィールドを対応付けるために、ClickHouse はそれらの名前を比較します。
この比較は大文字と小文字を区別し、未使用のフィールドはスキップされます。

ClickHouse テーブルのカラムのデータ型は、挿入される Avro データの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouse は上記のテーブルに従ってデータ型を解釈し、その後データを対応するカラム型に[キャスト](/sql-reference/functions/type-conversion-functions#CAST)します。

データをインポートする際、スキーマ内でフィールドが見つからず、設定 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) が有効になっている場合は、エラーを発生させる代わりにデフォルト値が使用されます。


### Avro データの書き込み \{#writing-avro-data\}

ClickHouse テーブルのデータを Avro ファイルに書き出すには、次のようにします。

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

列名は次を満たす必要があります：

* `[A-Za-z_]` で始まること
* 続く文字は `[A-Za-z0-9_]` のみであること

Avro ファイルの出力圧縮と同期間隔は、それぞれ [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) および [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 設定を使用して構成できます。

### Avro スキーマの推論 \{#inferring-the-avro-schema\}

ClickHouse の [`DESCRIBE`](/sql-reference/statements/describe-table) 関数を使用すると、次の例のように Avro ファイルの推論されたスキーマをすばやく確認できます。
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
