---
'alias': []
'description': 'Avro フォーマットのドキュメント'
'input_format': true
'keywords':
- 'Avro'
'output_format': true
'slug': '/interfaces/formats/Avro'
'title': 'Avro'
'doc_type': 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Avro](https://avro.apache.org/) は、効率的なデータ処理のためにバイナリエンコーディングを使用する行指向のシリアル化フォーマットです。`Avro` フォーマットは、[Avro データファイル](https://avro.apache.org/docs/++version++/specification/#object-container-files)の読み書きをサポートしています。このフォーマットは、埋め込まれたスキーマを持つ自己記述メッセージを期待します。スキーマレジストリと共に Avro を使用している場合は、[`AvroConfluent`](./AvroConfluent.md) フォーマットを参照してください。

## データ型のマッピング {#data-type-mapping}

<DataTypeMapping/>

## フォーマット設定 {#format-settings}

| 設定                                             | 説明                                                                                                         | デフォルト |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------|-----------|
| `input_format_avro_allow_missing_fields`         | スキーマにフィールドが見つからなかった場合、エラーを投げる代わりにデフォルト値を使用するかどうか。                         | `0`       |
| `input_format_avro_null_as_default`              | 非 Nullable カラムに `null` 値を挿入する場合、エラーを投げる代わりにデフォルト値を使用するかどうか。                      | `0`       |
| `output_format_avro_codec`                        | Avro 出力ファイルに対する圧縮アルゴリズム。可能な値：`null`、`deflate`、`snappy`、`zstd`。                     |           |
| `output_format_avro_sync_interval`               | Avro ファイル内の同期マーカーの頻度（バイト数単位）。                                                           | `16384`   |
| `output_format_avro_string_column_pattern`       | Avro 文字列型マッピングのための `String` カラムを識別する正規表現。デフォルトでは、ClickHouse の `String` カラムは Avro `bytes` 型として書き込まれます。 |           |
| `output_format_avro_rows_in_file`                | Avro 出力ファイルあたりの最大行数。この制限に達すると、新しいファイルが作成されます（ストレージシステムがファイル分割をサポートしている場合）。       | `1`       |

## 例 {#examples}

### Avro データの読み込み {#reading-avro-data}

Avro ファイルから ClickHouse テーブルにデータを読み込むには：

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

取り込まれた Avro ファイルのルートスキーマは `record` 型である必要があります。

テーブルのカラムと Avro スキーマのフィールドの対応を見つけるために、ClickHouse はそれらの名前を比較します。
この比較は大文字小文字を区別し、未使用のフィールドはスキップされます。

ClickHouse テーブルのカラムのデータ型は、挿入された Avro データの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouse は上のテーブルに基づいてデータ型を解釈し、その後に [キャスト](/sql-reference/functions/type-conversion-functions#cast) して対応するカラム型に変換します。

データをインポートする際、スキーマ内にフィールドが見つからず、設定 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) が有効になっている場合、エラーを投げる代わりにデフォルト値が使用されます。

### Avro データの書き込み {#writing-avro-data}

ClickHouse テーブルから Avro ファイルにデータを書き込むには：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

カラム名は以下を満たす必要があります：

- `[A-Za-z_]` で始まる
- その後は `[A-Za-z0-9_]` のみ

Avro ファイルの出力圧縮と同期間隔はそれぞれ、[`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) および [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 設定を使用して構成できます。

### Avro スキーマの推測 {#inferring-the-avro-schema}

ClickHouse の [`DESCRIBE`](/sql-reference/statements/describe-table) 関数を使用すると、次の例のように Avro ファイルの推測された形式を迅速に表示できます。
この例には、ClickHouse S3 パブリックバケット内の公にアクセス可能な Avro ファイルの URL が含まれています：

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
