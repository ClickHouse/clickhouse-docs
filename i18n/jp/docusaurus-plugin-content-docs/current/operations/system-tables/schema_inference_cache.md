---
'description': 'System table containing information about all cached file schemas.'
'keywords':
- 'system table'
- 'schema_inference_cache'
'slug': '/operations/system-tables/schema_inference_cache'
'title': 'system.schema_inference_cache'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.schema_inference_cache

<SystemTableCloud/>

キャッシュされたファイルスキーマについての情報を含みます。

カラム:
- `storage` ([String](/sql-reference/data-types/string.md)) — ストレージ名: File, URL, S3 または HDFS。
- `source` ([String](/sql-reference/data-types/string.md)) — ファイルのソース。
- `format` ([String](/sql-reference/data-types/string.md)) — フォーマット名。
- `additional_format_info` ([String](/sql-reference/data-types/string.md)) - スキーマを特定するために必要な追加情報。例えば、フォーマット特有の設定。
- `registration_time` ([DateTime](/sql-reference/data-types/datetime.md)) — スキーマがキャッシュに追加されたタイムスタンプ。
- `schema` ([String](/sql-reference/data-types/string.md)) - キャッシュされたスキーマ。

**例**

`data.jsonl` というファイルがあり、以下の内容が含まれているとします:
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

:::tip
`data.jsonl`を`user_files_path`ディレクトリに置いてください。これを見つけるには、ClickHouseの設定ファイルを調べてください。デフォルトは:
```sql
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
:::

`clickhouse-client`を開き、`DESCRIBE`クエリを実行します:

```sql
DESCRIBE file('data.jsonl') SETTINGS input_format_try_infer_integers=0;
```

```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Float64)       │              │                    │         │                  │                │
│ age     │ Nullable(Float64)       │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`system.schema_inference_cache`テーブルの内容を見てみましょう:

```sql
SELECT *
FROM system.schema_inference_cache
FORMAT Vertical
```
```response
Row 1:
──────
storage:                File
source:                 /home/droscigno/user_files/data.jsonl
format:                 JSONEachRow
additional_format_info: schema_inference_hints=, max_rows_to_read_for_schema_inference=25000, schema_inference_make_columns_nullable=true, try_infer_integers=false, try_infer_dates=true, try_infer_datetimes=true, try_infer_numbers_from_strings=true, read_bools_as_numbers=true, try_infer_objects=false
registration_time:      2022-12-29 17:49:52
schema:                 id Nullable(Float64), age Nullable(Float64), name Nullable(String), hobbies Array(Nullable(String))
```

**関連情報**
- [入力データからの自動スキーマ推論](/interfaces/schema-inference.md)
