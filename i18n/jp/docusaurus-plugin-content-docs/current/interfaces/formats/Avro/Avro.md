---
'alias': []
'description': 'Avroフォーマットのドキュメント'
'input_format': true
'keywords':
- 'Avro'
'output_format': true
'slug': '/interfaces/formats/Avro'
'title': 'Avro'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Avro](https://avro.apache.org/) は、Apache の Hadoop プロジェクト内で開発された行指向のデータシリアル化フレームワークです。
ClickHouse の `Avro` フォーマットは、[Avro データファイル](https://avro.apache.org/docs/current/spec.html#Object+Container+Files)の読み書きをサポートしています。

## データ型の対応 {#data-types-matching}

<DataTypesMatching/>

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

Avro ファイルから ClickHouse テーブルにデータを挿入するには：

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

取り込む Avro ファイルのルートスキーマは `record` タイプでなければなりません。

テーブルのカラムと Avro スキーマのフィールドの対応を見つけるために、ClickHouse はそれらの名前を比較します。
この比較は大文字小文字を区別し、未使用のフィールドはスキップされます。

ClickHouse テーブルカラムのデータ型は、挿入される Avro データの対応するフィールドと異なる場合があります。データを挿入する際、ClickHouse は上記のテーブルに従ってデータ型を解釈し、その後に[キャスト](/sql-reference/functions/type-conversion-functions#cast)して対応するカラムタイプに変換します。

データをインポートする際に、スキーマにフィールドが見つからず、設定 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) が有効になっている場合、エラーをスローするのではなく、デフォルト値が使用されます。

### データの選択 {#selecting-data}

ClickHouse テーブルから Avro ファイルにデータを選択するには：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

カラム名は以下の条件を満たさなければなりません：

- `[A-Za-z_]` で始まる
- 続けて `[A-Za-z0-9_]` のみが使用される

出力 Avro ファイルの圧縮と同期間隔は、設定 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) および [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) によってそれぞれ構成できます。

### 例データ {#example-data}

ClickHouse の [`DESCRIBE`](/sql-reference/statements/describe-table) 関数を使用することで、次の例のように Avro ファイルの推測フォーマットを迅速に表示できます。
この例には、ClickHouse S3 パブリックバケットにある公開アクセス可能な Avro ファイルの URL が含まれています：

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

| 設定                                     | 説明                                                                                         | デフォルト |
|------------------------------------------|----------------------------------------------------------------------------------------------|-----------|
| `input_format_avro_allow_missing_fields` | Avro/AvroConfluent フォーマット用：スキーマにフィールドが見つからない場合、エラーの代わりにデフォルト値を使用 | `0`       |
| `input_format_avro_null_as_default`      | Avro/AvroConfluent フォーマット用：null と非 Nullable カラムの場合にデフォルトを挿入する                |   `0`     |
| `format_avro_schema_registry_url`        | AvroConfluent フォーマット用：Confluent スキーマレジストリ URL。                                        |           |
| `output_format_avro_codec`               | 出力に使用される圧縮コーデック。可能な値：'null', 'deflate', 'snappy', 'zstd'。                          |           |
| `output_format_avro_sync_interval`       | バイト単位の同期間隔。                                                                           | `16384`   |
| `output_format_avro_string_column_pattern`| Avro フォーマット用：AVRO 文字列として選択する String カラムの正規表現。                             |           |
| `output_format_avro_rows_in_file`        | ファイル内の最大行数（ストレージが許可する場合）                                                    | `1`       |
