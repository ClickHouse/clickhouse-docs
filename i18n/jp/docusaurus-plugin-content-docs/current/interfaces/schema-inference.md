---
slug: /interfaces/schema-inference
sidebar_position: 21
sidebar_label: スキーマ推論
title: 入力データからの自動スキーマ推論
---

ClickHouseは、ほぼすべてのサポートされている [入力フォーマット](formats.md) から、入力データの構造を自動的に判断できます。この文書では、スキーマ推論が使用される場面、異なる入力フォーマットでの動作、そしてそれを制御できる設定について説明します。

## 使用法 {#usage}

スキーマ推論は、ClickHouseが特定のデータフォーマットでデータを読み取る必要があり、その構造が不明な場合に使用されます。

## テーブル関数 [file](../sql-reference/table-functions/file.md), [s3](../sql-reference/table-functions/s3.md), [url](../sql-reference/table-functions/url.md), [hdfs](../sql-reference/table-functions/hdfs.md), [azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md) {#table-functions-file-s3-url-hdfs-azureblobstorage}

これらのテーブル関数には、入力データの構造を指定するオプション引数 `structure` があります。この引数が指定されていないか、`auto` に設定されている場合、構造はデータから推論されます。

**例:**

`user_files` ディレクトリに次の内容の `hobbies.jsonl` というJSONEachRow形式のファイルがあるとします:
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouseは、このデータをその構造を指定せずに読み取ることができます:
```sql
SELECT * FROM file('hobbies.jsonl')
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```

注意: フォーマット `JSONEachRow` は、ファイル拡張子 `.jsonl` によって自動的に判断されました。

次の `DESCRIBE` クエリを使用すると、自動的に判断された構造を確認できます:
```sql
DESCRIBE file('hobbies.jsonl')
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## テーブルエンジン [File](../engines/table-engines/special/file.md), [S3](../engines/table-engines/integrations/s3.md), [URL](../engines/table-engines/special/url.md), [HDFS](../engines/table-engines/integrations/hdfs.md), [azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) {#table-engines-file-s3-url-hdfs-azureblobstorage}

`CREATE TABLE` クエリでカラムのリストが指定されていない場合、テーブルの構造はデータから自動的に推論されます。

**例:**

`hobbies.jsonl` ファイルを使って、エンジン `File` を使ったテーブルを作成することができます:
```sql
CREATE TABLE hobbies ENGINE=File(JSONEachRow, 'hobbies.jsonl')
```
```response
Ok.
```
```sql
SELECT * FROM hobbies
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```
```sql
DESCRIBE TABLE hobbies
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## clickhouse-local {#clickhouse-local}

`clickhouse-local` には、入力データの構造を指定するオプションパラメーター `-S/--structure` があります。このパラメーターが指定されていないか、`auto` に設定されている場合、構造はデータから推論されます。

**例:**

`hobbies.jsonl` ファイルを使用しましょう。このファイルからデータをクエリできる `clickhouse-local` を使います:
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='DESCRIBE TABLE hobbies'
```
```response
id	Nullable(Int64)
age	Nullable(Int64)
name	Nullable(String)
hobbies	Array(Nullable(String))
```
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='SELECT * FROM hobbies'
```
```response
1	25	Josh	['football','cooking','music']
2	19	Alan	['tennis','art']
3	32	Lana	['fitness','reading','shopping']
4	47	Brayan	['movies','skydiving']
```
## 挿入テーブルからの構造の使用 {#using-structure-from-insertion-table}

テーブル関数 `file/s3/url/hdfs` を使ってデータをテーブルに挿入する際、データから抽出する代わりに挿入テーブルから構造を使用するオプションがあります。これは、スキーマ推論に時間がかかる可能性があるため、挿入パフォーマンスを向上させることができます。また、テーブルが最適化されたスキーマを持つ場合、型間の変換が行われないので有用です。

この動作を制御する特別な設定 [use_structure_from_insertion_table_in_table_functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions) があります。可能な値は次のとおりです:
- 0 - テーブル関数はデータから構造を抽出します。
- 1 - テーブル関数は挿入テーブルから構造を使用します。
- 2 - ClickHouseが挿入テーブルから構造を使用するか、スキーマ推論を使用するかを自動的に判断します（デフォルト値）。

**例 1:**

次の構造でテーブル `hobbies1` を作成します:
```sql
CREATE TABLE hobbies1
(
    `id` UInt64,
    `age` LowCardinality(UInt8),
    `name` String,
    `hobbies` Array(String)
)
ENGINE = MergeTree
ORDER BY id;
```

次に、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

この場合、ファイルのすべてのカラムが変更なしでテーブルに挿入されるため、ClickHouseはスキーマ推論ではなく挿入テーブルから構造を使用します。

**例 2:**

次の構造でテーブル `hobbies2` を作成します:
```sql
CREATE TABLE hobbies2
(
  `id` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

次に、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリのすべてのカラムがテーブルに存在するため、ClickHouseは挿入テーブルから構造を使用します。これは、JSONEachRow、TSKV、Parquet などの、カラムのサブセットを読み取ることをサポートする入力フォーマットでのみ機能します（例えば、TSVフォーマットでは機能しません）。

**例 3:**

次の構造でテーブル `hobbies3` を作成します:

```sql
CREATE TABLE hobbies3
(
  `identifier` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY identifier;
```

次に、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリで `id` カラムが使用されますが、テーブルにはこのカラムがありません（`identifier` という名前のカラムがあります）。したがって、ClickHouseは挿入テーブルから構造を使用できず、スキーマ推論が使用されます。

**例 4:**

次の構造でテーブル `hobbies4` を作成します:

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

次に、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

この場合、挿入テーブルに入れるための `SELECT` クエリでカラム `hobbies` に対していくつかの操作が行われるため、ClickHouseは挿入テーブルから構造を使用できず、スキーマ推論が使用されます。

## スキーマ推論キャッシュ {#schema-inference-cache}

ほとんどの入力フォーマットでは、スキーマ推論がデータを読み取ってその構造を判断するためにいくつかのデータを読み取ります。このプロセスは時間がかかる場合があります。同じファイルからデータを再度読み取る際に毎回同じスキーマを推論することを防ぐために、推論されたスキーマはキャッシュされ、同じファイルに再アクセスする際にはキャッシュからスキーマが使用されます。

このキャッシュを制御する特別な設定があります:
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 対応するテーブル関数用のキャッシュされたスキーマの最大数。デフォルト値は `4096` です。これらの設定は、サーバー構成に設定する必要があります。
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - スキーマ推論にキャッシュを使用するかどうかをオン/オフします。これらの設定は、クエリ内で使用できます。

ファイルのスキーマは、データを変更したり、フォーマット設定を変更したりすることで変更できます。このため、スキーマ推論キャッシュは、ファイルソース、フォーマット名、使用されたフォーマット設定、ファイルの最終変更時刻によってスキーマを特定します。

注意: `url` テーブル関数でアクセスされる一部のファイルには、最終変更時刻の情報が含まれていない場合があります。この場合、特別な設定 `schema_inference_cache_require_modification_time_for_url` があります。この設定を無効にすると、そのようなファイルに対して最終変更時刻なしでキャッシュからスキーマを使用できます。

また、キャッシュ内のすべての現在のスキーマを含むシステムテーブル [schema_inference_cache](../operations/system-tables/schema_inference_cache.md) があり、`SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]` というシステムクエリが、すべてのソースまたは特定のソースのスキーマキャッシュをクリアすることを可能にします。

**例:**

`s3` のサンプルデータセット `github-2022.ndjson.gz` の構造を推論して、スキーマ推論キャッシュがどのように機能するかを見てみましょう:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS allow_experimental_object_type = 1
```
```response
┌─name───────┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String)         │              │                    │         │                  │                │
│ actor      │ Object(Nullable('json')) │              │                    │         │                  │                │
│ repo       │ Object(Nullable('json')) │              │                    │         │                  │                │
│ created_at │ Nullable(String)         │              │                    │         │                  │                │
│ payload    │ Object(Nullable('json')) │              │                    │         │                  │                │
└────────────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5行がセットで返されました。経過時間: 0.601秒。
```
```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS allow_experimental_object_type = 1
```
```response
┌─name───────┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String)         │              │                    │         │                  │                │
│ actor      │ Object(Nullable('json')) │              │                    │         │                  │                │
│ repo       │ Object(Nullable('json')) │              │                    │         │                  │                │
│ created_at │ Nullable(String)         │              │                    │         │                  │                │
│ payload    │ Object(Nullable('json')) │              │                    │         │                  │                │
└────────────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5行がセットで返されました。経過時間: 0.059秒。
```

ご覧のように、2回目のクエリはほぼ瞬時に成功しました。

推論されたスキーマに影響を与える可能性のある設定のいくつかを変更してみましょう:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS input_format_json_read_objects_as_strings = 1

┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String) │              │                    │         │                  │                │
│ actor      │ Nullable(String) │              │                    │         │                  │                │
│ repo       │ Nullable(String) │              │                    │         │                  │                │
│ created_at │ Nullable(String) │              │                    │         │                  │                │
│ payload    │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5行がセットで返されました。経過時間: 0.611秒
```

ご覧のように、同じファイルに対してはキャッシュのスキーマが使用されなかったため、推論されたスキーマが変更されました。

`system.schema_inference_cache` テーブルの内容を確認してみましょう:

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Object(Nullable('json')), repo Object(Nullable('json')), created_at Nullable(String), payload Object(Nullable('json')) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                         │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

同じファイルに対して2つの異なるスキーマがあります。

システムクエリを使ってスキーマキャッシュをクリアできます:
```sql
SYSTEM DROP SCHEMA CACHE FOR S3
```
```response
Ok.
```
```sql
SELECT count() FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─count()─┐
│       0 │
└─────────┘
```
## テキストフォーマット {#text-formats}

テキストフォーマットでは、ClickHouseはデータを行ごとに読み取り、フォーマットに応じてカラム値を抽出し、次にいくつかの再帰的なパーサーとヒューリスティックを使用して各値の型を決定します。スキーマ推論において読み取る最大行数とバイト数は、設定 `input_format_max_rows_to_read_for_schema_inference` （デフォルトは25000）と `input_format_max_bytes_to_read_for_schema_inference` （デフォルトは32Mb）によって制御されます。デフォルトでは、すべて推論された型は [Nullable](../sql-reference/data-types/nullable.md) ですが、これを `schema_inference_make_columns_nullable` の設定によって変更できます（[設定](#settings-for-text-formats) セクションの例を参照してください）。

### JSONフォーマット {#json-formats}

JSONフォーマットでは、ClickHouseはJSON仕様に従って値をパースし、それから最も適切なデータ型を見つけようとします。

それがどのように機能するか、どの型が推論できるか、そしてJSONフォーマットで使用できる特定の設定を見てみましょう。

**例**

ここでの例には、[format](../sql-reference/table-functions/format.md) テーブル関数が使用されます。

整数、浮動小数点数、ブール値、文字列:
```sql
DESC format(JSONEachRow, '{"int" : 42, "float" : 42.42, "string" : "Hello, World!"}');
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日付、日付時間:

```sql
DESC format(JSONEachRow, '{"date" : "2022-01-01", "datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}')
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date       │ Nullable(Date)          │              │                    │         │                  │                │
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列:
```sql
DESC format(JSONEachRow, '{"arr" : [1, 2, 3], "nested_arrays" : [[1, 2, 3], [4, 5, 6], []]}')
```
```response
┌─name──────────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr           │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ nested_arrays │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に `null` が含まれている場合、ClickHouseは他の配列要素の型を使用します:
```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

名前付きタプル:

`input_format_json_try_infer_named_tuples_from_objects` の設定が有効な場合、スキーマ推論中にClickHouseはJSONオブジェクトから名前付きタプルを推論しようとします。結果の名前付きタプルは、サンプルデータのすべての対応するJSONオブジェクトのすべての要素を含みます。

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

名前のないタプル:

JSONフォーマットでは、異なる型の要素を持つ配列を名前のないタプルとして扱います。
```sql
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

もし値が `null` または空である場合、他の行からの対応する値の型を使用します:
```sql
DESC format(JSONEachRow, $$
                              {"tuple" : [1, null, null]}
                              {"tuple" : [null, "Hello, World!", []]}
                              {"tuple" : [null, null, [1, 2, 3]]}
                         $$)
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

地図:

JSONでは、同じ型の値を持つオブジェクトをマップ型として読み取ることができます。
注意: `input_format_json_read_objects_as_strings` と `input_format_json_try_infer_named_tuples_from_objects` の設定が無効な場合のみ機能します。

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

JSONオブジェクト型 (設定 `allow_experimental_object_type` が有効な場合):

```sql
SET allow_experimental_object_type = 1
DESC format(JSONEachRow, $$
                            {"obj" : {"key1" : 42}}
                            {"obj" : {"key2" : "Hello, World!"}}
                            {"obj" : {"key1" : 24, "key3" : {"a" : 42, "b" : null}}}
                         $$)
```
```response
┌─name─┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Object(Nullable('json')) │              │                    │         │                  │                │
└──────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた複雑な型:
```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouseが一部のキーの型を決定できない場合（データが `null` のみ、空のオブジェクト、空の配列を含むため）、`input_format_json_infer_incomplete_types_as_strings` の設定が有効な場合は型 `String` が使用され、それ以外の場合は例外がスローされます:
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 1;
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(String)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 0;
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'arr' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```
#### JSON設定 {#json-settings}
##### input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}

この設定を有効にすると、文字列値から数値を推論することができます。

この設定はデフォルトで無効です。

**例:**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(JSONEachRow, $$
                              {"value" : "42"}
                              {"value" : "424242424242"}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_try_infer_named_tuples_from_objects {#input_format_json_try_infer_named_tuples_from_objects}

この設定を有効にすると、JSONオブジェクトから名前付きタプルを推論することができます。結果の名前付きタプルは、サンプルデータのすべての対応するJSONオブジェクトのすべての要素を含みます。これはJSONデータがスパースでない場合に有用で、データのサンプルにはすべての可能なオブジェクトキーが含まれます。

この設定はデフォルトで有効です。

**例**

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

結果:

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"array" : [{"a" : 42, "b" : "Hello"}, {}, {"c" : [1,2,3]}, {"d" : "2020-01-01"}]}')
```

結果:

```markdown
┌─name──┬─type────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │              │                    │         │                  │                │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

この設定を有効にすると、JSONオブジェクトからの名前付きタプルの推論中に、あいまいなパスに対して文字列型を使用できます（`input_format_json_try_infer_named_tuples_from_objects`が有効な場合）。これにより、あいまいなパスがあっても、JSONオブジェクトを名前付きタプルとして読み取ることができます。

デフォルトでは無効です。

**例**

設定が無効な場合:
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```
結果:

```response
Code: 636. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'a' has type 'Int64' and in some - 'Tuple(b String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'a'. (INCORRECT_DATA) (version 24.3.1.1).
You can specify the structure manually. (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

設定が有効な場合:
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

結果:
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(String))     │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
┌─obj─────────────────┐
│ ('42')              │
│ ('{"b" : "Hello"}') │
└─────────────────────┘
```
##### input_format_json_read_objects_as_strings {#input_format_json_read_objects_as_strings}

この設定を有効にすると、ネストされたJSONオブジェクトを文字列として読み込むことができます。
この設定は、JSONオブジェクト型を使用せずにネストされたJSONオブジェクトを読み取るために使用できます。

この設定はデフォルトで有効です。

注: この設定を有効にしても、`input_format_json_try_infer_named_tuples_from_objects`が無効である場合にのみ効果があります。

```sql
SET input_format_json_read_objects_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, $$
                             {"obj" : {"key1" : 42, "key2" : [1,2,3,4]}}
                             {"obj" : {"key3" : {"nested_key" : 1}}}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}

この設定を有効にすると、数値を文字列として読み込むことができます。

この設定はデフォルトで有効です。

**例**

```sql
SET input_format_json_read_numbers_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : 1055}
                                {"value" : "unknown"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}

この設定を有効にすると、Bool値を数値として読み込むことができます。

この設定はデフォルトで有効です。

**例:**

```sql
SET input_format_json_read_bools_as_numbers = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : 42}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}

この設定を有効にすると、Bool値を文字列として読み込むことができます。

この設定はデフォルトで有効です。

**例:**

```sql
SET input_format_json_read_bools_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : "Hello, World"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_arrays_as_strings {#input_format_json_read_arrays_as_strings}

この設定を有効にすると、JSON配列の値を文字列として読み込むことができます。

この設定はデフォルトで有効です。

**例**

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```
```response
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```
##### input_format_json_infer_incomplete_types_as_strings {#input_format_json_infer_incomplete_types_as_strings}

この設定を有効にすると、スキーマ推測中にデータサンプルに`Null`/`{}`/`[]`のみを含むJSONキーに対して文字列型を使用できます。
JSON形式では、すべての対応する設定が有効であれば（すべてデフォルトで有効）、任意の値は文字列として読み取ることができ、スキーマ推測中に`Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps`のようなエラーを回避できます。

例:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

結果:
```markdown
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```
### CSV {#csv}

CSV形式では、ClickHouseは区切り文字に従って行から列の値を抽出します。ClickHouseは数値や文字列を除くすべてのタイプを二重引用符で囲むことを期待します。値が二重引用符で囲まれている場合、ClickHouseは再帰解析器を使用して引用符内のデータを解析し、最も適切なデータ型を見つけようとします。値が二重引用符で囲まれていない場合、ClickHouseはそれを数値として解析し、値が数値でない場合、ClickHouseはそれを文字列として扱います。

ClickHouseが複雑なタイプをいくつかの解析器とヒューリスティックを使用して決定しないようにするには、設定 `input_format_csv_use_best_effort_in_schema_inference` を無効にすると、ClickHouseはすべての列を文字列として扱います。

設定 `input_format_csv_detect_header` が有効になっている場合、ClickHouseはスキーマ推測中に列名（おそらく型）のヘッダーを検出しようとします。この設定はデフォルトで有効です。

**例:**

整数、浮動小数点、ブール、文字列:
```sql
DESC format(CSV, '42,42.42,true,"Hello,World!"')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

引用符なしの文字列:
```sql
DESC format(CSV, 'Hello world!,World hello!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日付、日付時刻:

```sql
DESC format(CSV, '"2020-01-01","2020-01-01 00:00:00","2022-01-01 00:00:00.000"')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列:
```sql
DESC format(CSV, '"[1,2,3]","[[1, 2], [], [3, 4]]"')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(CSV, $$"['Hello', 'world']","[['Abc', 'Def'], []]"$$)
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列にnullが含まれている場合、ClickHouseは他の配列要素の型を使用します:
```sql
DESC format(CSV, '"[NULL, 42, NULL]"')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

マップ:
```sql
DESC format(CSV, $$"{'key1' : 42, 'key2' : 24}"$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた配列とマップ:
```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```
```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouseが型を決定できない場合、データがnullのみを含む場合、ClickHouseはそれを文字列として扱います:
```sql
DESC format(CSV, '"[NULL, NULL]"')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

設定`input_format_csv_use_best_effort_in_schema_inference`を無効にした例:
```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
DESC format(CSV, '"[1,2,3]",42.42,Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ヘッダーの自動検出の例（`input_format_csv_detect_header`が有効な場合）:

名前のみ:
```sql
SELECT * FROM format(CSV,
$$"number","string","array"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

名前と型:

```sql
DESC format(CSV,
$$"number","string","array"
"UInt32","String","Array(UInt16)"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ヘッダーは少なくとも1つの非文字列型の列がある場合にのみ検出できることに注意してください。すべての列が文字列型の場合、ヘッダーは検出されません:

```sql
SELECT * FROM format(CSV,
$$"first_column","second_column"
"Hello","World"
"World","Hello"
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```
#### CSV設定 {#csv-settings}
##### input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

この設定を有効にすると、文字列値から数値を推測できるようになります。

この設定はデフォルトで無効です。

**例:**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(CSV, '42,42.42');
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### TSV/TSKV {#tsv-tskv}

TSV/TSKV形式では、ClickHouseはタブ区切りの区切り文字に従って行から列の値を抽出し、抽出された値を再帰解析器を使用して解析して最も適切な型を決定します。型が決定できない場合、ClickHouseはこの値を文字列として扱います。

ClickHouseが複雑なタイプをいくつかの解析器とヒューリスティックを使用して決定しないようにするには、設定 `input_format_tsv_use_best_effort_in_schema_inference` を無効にすると、ClickHouseはすべての列を文字列として扱います。

設定 `input_format_tsv_detect_header` が有効になっている場合、ClickHouseはスキーマ推測中に列名（おそらく型）のヘッダーを検出しようとします。この設定はデフォルトで有効です。

**例:**

整数、浮動小数点、ブール、文字列:
```sql
DESC format(TSV, '42	42.42	true	Hello,World!')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSKV, 'int=42	float=42.42	bool=true	string=Hello,World!\n')
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日付、日付時刻:

```sql
DESC format(TSV, '2020-01-01	2020-01-01 00:00:00	2022-01-01 00:00:00.000')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列:
```sql
DESC format(TSV, '[1,2,3]	[[1, 2], [], [3, 4]]')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSV, '[''Hello'', ''world'']	[[''Abc'', ''Def''], []]')
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列にnullが含まれている場合、ClickHouseは他の配列要素の型を使用します:
```sql
DESC format(TSV, '[NULL, 42, NULL]')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

タプル:
```sql
DESC format(TSV, $$(42, 'Hello, world!')$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

マップ:
```sql
DESC format(TSV, $${'key1' : 42, 'key2' : 24}$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた配列、タプル、マップ:
```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouseが型を決定できない場合、データがnullのみを含む場合、ClickHouseはそれを文字列として扱います:
```sql
DESC format(TSV, '[NULL, NULL]')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

設定`input_format_tsv_use_best_effort_in_schema_inference`を無効にした例:
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]	42.42	Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ヘッダーの自動検出の例（`input_format_tsv_detect_header`が有効な場合）:

名前のみ:
```sql
SELECT * FROM format(TSV,
$$number	string	array
42	Hello	[1, 2, 3]
43	World	[4, 5, 6]
$$);
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

名前と型:

```sql
DESC format(TSV,
$$number	string	array
UInt32	String	Array(UInt16)
42	Hello	[1, 2, 3]
43	World	[4, 5, 6]
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
``` 

```
### Values {#values}

Values フォーマットでは、ClickHouse は行からカラムの値を抽出し、その後、リテラルが解析される方法に似た再帰パーサを使用して解析します。

**例:**

整数、浮動小数点、ブール値、文字列:
```sql
DESC format(Values, $$(42, 42.42, true, 'Hello,World!')$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日付、日時:

```sql
 DESC format(Values, $$('2020-01-01', '2020-01-01 00:00:00', '2022-01-01 00:00:00.000')$$)
 ```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列:
```sql
DESC format(Values, '([1,2,3], [[1, 2], [], [3, 4]])')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に null が含まれている場合、ClickHouse は他の配列要素から型を使用します:
```sql
DESC format(Values, '([NULL, 42, NULL])')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

タプル:
```sql
DESC format(Values, $$((42, 'Hello, world!'))$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

マップ:
```sql
DESC format(Values, $$({'key1' : 42, 'key2' : 24})$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

入れ子の配列、タプル、マップ:
```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse が型を特定できない場合、データが null のみを含む場合など、例外がスローされます:
```sql
DESC format(Values, '([NULL, NULL])')
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'c1' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

`input_format_tsv_use_best_effort_in_schema_inference` を無効にした例:
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]	42.42	Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### CustomSeparated {#custom-separated}

CustomSeparated フォーマットでは、ClickHouse は最初に指定された区切りに従って行からすべてのカラム値を抽出し、その後、エスケープルールに従って各値のデータ型を推測しようとします。

`input_format_custom_detect_header` 設定が有効になっている場合、ClickHouse はスキーマを推測する際にカラム名（およびおそらく型）のヘッダを検出しようとします。この設定はデフォルトで有効です。

**例**

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64)      │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ヘッダの自動検出の例（`input_format_custom_detect_header` が有効な場合）:

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>'number'<field_delimiter>'string'<field_delimiter>'array'<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```

```response
┌─number─┬─string────────┬─array──────┐
│  42.42 │ Some string 1 │ [1,NULL,3] │
│   ᴺᵁᴸᴸ │ Some string 3 │ [1,2,NULL] │
└────────┴───────────────┴────────────┘
```
### Template {#template}

Template フォーマットでは、ClickHouse は最初に指定されたテンプレートに従って行からすべてのカラム値を抽出し、その後、各値のデータ型をそのエスケープルールに従って推測します。

**例**

ファイル `resultset` に次の内容があるとしましょう:
```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

ファイル `row_format` に次の内容があります:

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

次のクエリを実行することができます:

```sql
SET format_template_rows_between_delimiter = '<row_between_delimiter>\n',
       format_template_row = 'row_format',
       format_template_resultset = 'resultset_format'

DESC format(Template, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter_1>'Some string 1'<field_delimiter_2>[1, null, 2]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>\N<field_delimiter_1>'Some string 3'<field_delimiter_2>[1, 2, null]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─────┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ column_1 │ Nullable(Float64)      │              │                    │         │                  │                │
│ column_2 │ Nullable(String)       │              │                    │         │                  │                │
│ column_3 │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### Regexp {#regexp}

Template と同様に、Regexp フォーマットでは、ClickHouse は最初に指定された正規表現に従って行からすべてのカラム値を抽出し、その後、指定されたエスケープルールに従って各値のデータ型を推測します。

**例**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'
       
DESC format(Regexp, $$Line: value_1=42, value_2="Some string 1", value_3="[1, NULL, 3]"
Line: value_1=2, value_2="Some string 2", value_3="[4, 5, NULL]"$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### Settings for text formats {#settings-for-text-formats}
#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference {#input-format-max-rows-to-read-for-schema-inference}

これらの設定は、スキーマ推測のために読み取るデータの量を制御します。
読み取られる行/バイトが多いほど、スキーマ推測に費やされる時間は長くなりますが、それにより型を正しく特定する可能性が高くなります（特にデータに多くの null が含まれる場合）。

デフォルトの値:
-   `input_format_max_rows_to_read_for_schema_inference` は `25000`
-   `input_format_max_bytes_to_read_for_schema_inference` は `33554432`（32 Mb）

#### column_names_for_schema_inference {#column-names-for-schema-inference}

明示的なカラム名がないフォーマットの場合にスキーマ推測で使用するカラム名のリスト。指定された名前は、デフォルトの `c1,c2,c3,...` の代わりに使用されます。フォーマット: `column1,column2,column3,...`。

**例**

```sql
DESC format(TSV, 'Hello, World!	42	[1, 2, 3]') settings column_names_for_schema_inference = 'str,int,arr'
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ str  │ Nullable(String)       │              │                    │         │                  │                │
│ int  │ Nullable(Int64)        │              │                    │         │                  │                │
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_hints {#schema-inference-hints}

自動的に決定された型の代わりにスキーマ推測で使用するカラム名と型のリスト。フォーマット: 'column_name1 column_type1, column_name2 column_type2, ...'。
この設定は、自动的に決定できなかったカラムの型を指定したり、スキーマを最適化したりするために使用できます。

**例**

```sql
DESC format(JSONEachRow, '{"id" : 1, "age" : 25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}') SETTINGS schema_inference_hints = 'age LowCardinality(UInt8), status Nullable(String)', allow_suspicious_low_cardinality_types=1
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ LowCardinality(UInt8)   │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_make_columns_nullable {#schema-inference-make-columns-nullable}

nullability 情報がないフォーマットのスキーマ推測において、推測された型を `Nullable` にする制御。
設定が有効な場合、推測されたすべての型は `Nullable` になります。無効な場合、推測された型は決して `Nullable` になりません。`auto` に設定された場合、推測された型は、スキーマ推測中に解析されたサンプルに `NULL` が含まれている場合またはファイルのメタデータにカラムの nullability に関する情報が含まれている場合にのみ `Nullable` になります。

デフォルトで有効です。

**例**

```sql
SET schema_inference_make_columns_nullable = 1
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET schema_inference_make_columns_nullable = 'auto';
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64            │              │                    │         │                  │                │
│ age     │ Int64            │              │                    │         │                  │                │
│ name    │ String           │              │                    │         │                  │                │
│ status  │ Nullable(String) │              │                    │         │                  │                │
│ hobbies │ Array(String)    │              │                    │         │                  │                │
└─────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET schema_inference_make_columns_nullable = 0;
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response

┌─name────┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64         │              │                    │         │                  │                │
│ age     │ Int64         │              │                    │         │                  │                │
│ name    │ String        │              │                    │         │                  │                │
│ status  │ String        │              │                    │         │                  │                │
│ hobbies │ Array(String) │              │                    │         │                  │                │
└─────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_integers {#input-format-try-infer-integers}

有効な場合、ClickHouse はテキストフォーマットのスキーマ推測において浮動小数点の代わりに整数を推測しようとします。
サンプルデータのカラム内のすべての数値が整数であれば、結果の型は `Int64` になります。1 つ以上の数値が浮動小数点であれば、結果の型は `Float64` になります。
サンプルデータが整数のみを含み、少なくとも 1 つの整数が正で `Int64` をオーバーフローする場合、ClickHouse は `UInt64` を推測します。

デフォルトで有効です。

**例**

```sql
SET input_format_try_infer_integers = 0
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_integers = 1
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Int64) │              │                    │         │                  │                │
└────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 18446744073709551615}
                         $$)
```
```response
┌─name───┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(UInt64) │              │                    │         │                  │                │
└────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2.2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_datetimes {#input-format-try-infer-datetimes}

有効な場合、ClickHouse はテキストフォーマットのスキーマ推測において文字列フィールドから `DateTime` または `DateTime64` を推測しようとします。
もしサンプルデータのカラム内のすべてのフィールドが成功裏に日付時刻として解析された場合、結果の型は `DateTime` または `DateTime64(9)` になります（任意の日付時刻に小数部分があれば）。
少なくとも 1 つのフィールドが日付時刻として解析されなかった場合、結果の型は `String` になります。

デフォルトで有効です。

**例**

```sql
SET input_format_try_infer_datetimes = 0;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_datetimes = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "unknown", "datetime64" : "unknown"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_dates {#input-format-try-infer-dates}

有効な場合、ClickHouse はテキストフォーマットのスキーマ推測において文字列フィールドから `Date` を推測しようとします。
もしサンプルデータのカラム内のすべてのフィールドが成功裏に日付として解析された場合、結果の型は `Date` になります。
少なくとも 1 つのフィールドが日付として解析されなかった場合、結果の型は `String` になります。

デフォルトで有効です。

**例**

```sql
SET input_format_try_infer_datetimes = 0, input_format_try_infer_dates = 0
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_dates = 1
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(Date) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "unknown"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_exponent_floats {#input-format-try-infer-exponent-floats}

有効な場合、ClickHouse はテキストフォーマットで指数形式の浮動小数点を推測しようとします（JSON での指数形式の数値は常に推測されます）。

デフォルトで無効です。

**例**

```sql
SET input_format_try_infer_exponent_floats = 1;
DESC format(CSV,
$$1.1E10
2.3e-12
42E00
$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## Self describing formats {#self-describing-formats}

自己記述フォーマットは、データ自体の中にスキーマに関する情報を含んでいます。これは、説明を含むヘッダや、バイナリ型ツリー、または何らかのテーブルを含むことができます。
ClickHouse は、ファイルからこれらのフォーマットでスキーマを自動的に推測するために、型に関する情報を含むデータの一部を読み取り、それを ClickHouse テーブルのスキーマに変換します。
### Formats with -WithNamesAndTypes suffix {#formats-with-names-and-types}

ClickHouse は、`-WithNamesAndTypes` 接尾辞のあるいくつかのテキストフォーマットをサポートしています。この接尾辞は、データが実際のデータの前にカラム名と型を含む2つの追加行を持っていることを意味します。
そのようなフォーマットのスキーマ推測中、ClickHouse は最初の 2 行を読み取り、カラム名と型を抽出します。

**例**

```sql
DESC format(TSVWithNamesAndTypes,
$$num	str	arr
UInt8	String	Array(UInt8)
42	Hello, World!	[1,2,3]
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### メタデータを含むJSONフォーマット {#json-with-metadata}

いくつかのJSON入力フォーマット ([JSON](formats.md#json), [JSONCompact](/interfaces/formats/JSONCompact), [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)) は、カラム名とタイプを含むメタデータが含まれています。
ClickHouseは、このようなフォーマットのスキーマ推論の際にこのメタデータを読み取ります。

**例**
```sql
DESC format(JSON, $$
{
	"meta":
	[
		{
			"name": "num",
			"type": "UInt8"
		},
		{
			"name": "str",
			"type": "String"
		},
		{
			"name": "arr",
			"type": "Array(UInt8)"
		}
	],

	"data":
	[
		{
			"num": 42,
			"str": "Hello, World",
			"arr": [1,2,3]
		}
	],

	"rows": 1,

	"statistics":
	{
		"elapsed": 0.005723915,
		"rows_read": 1,
		"bytes_read": 1
	}
}
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### Avro {#avro}

Avroフォーマットでは、ClickHouseはデータからスキーマを読み取り、以下のタイプマッチを使用してClickHouseスキーマに変換します。

| Avroデータ型                      | ClickHouseデータ型                                                           |
|------------------------------------|--------------------------------------------------------------------------------|
| `boolean`                          | [Bool](../sql-reference/data-types/boolean.md)                                 |
| `int`                              | [Int32](../sql-reference/data-types/int-uint.md)                               |
| `int (date)` \*                   | [Date32](../sql-reference/data-types/date32.md)                                |
| `long`                             | [Int64](../sql-reference/data-types/int-uint.md)                               |
| `float`                            | [Float32](../sql-reference/data-types/float.md)                                |
| `double`                           | [Float64](../sql-reference/data-types/float.md)                                |
| `bytes`, `string`                  | [String](../sql-reference/data-types/string.md)                                |
| `fixed`                            | [FixedString(N)](../sql-reference/data-types/fixedstring.md)                   |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)                                    |
| `array(T)`                         | [Array(T)](../sql-reference/data-types/array.md)                               |
| `union(null, T)`, `union(T, null)` | [Nullable(T)](../sql-reference/data-types/date.md)                             |
| `null`                             | [Nullable(Nothing)](../sql-reference/data-types/special-data-types/nothing.md) |
| `string (uuid)` \*                 | [UUID](../sql-reference/data-types/uuid.md)                                    |
| `binary (decimal)` \*              | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                         |

\* [Avro logical types](https://avro.apache.org/docs/current/spec.html#Logical+Types)

他のAvroタイプはサポートされていません。
### Parquet {#parquet}

Parquetフォーマットでは、ClickHouseはデータからスキーマを読み取り、以下のタイプマッチを使用してClickHouseスキーマに変換します。

| Parquetデータ型                 | ClickHouseデータ型                                    |
|----------------------------------|---------------------------------------------------------|
| `BOOL`                           | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                         | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                          | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                        | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                         | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                        | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                         | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                        | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                         | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`                         | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                        | [Float64](../sql-reference/data-types/float.md)         |
| `DATE`                          | [Date32](../sql-reference/data-types/date32.md)         |
| `TIME (ms)`                     | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME (us, ns)`    | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`              | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL`                       | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                          | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                        | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                           | [Map](../sql-reference/data-types/map.md)               |

他のParquetタイプはサポートされていません。デフォルトでは、すべての推論された型は `Nullable` の中にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
### Arrow {#arrow}

Arrowフォーマットでは、ClickHouseはデータからスキーマを読み取り、以下のタイプマッチを使用してClickHouseスキーマに変換します。

| Arrowデータ型                  | ClickHouseデータ型                                    |
|--------------------------------|---------------------------------------------------------|
| `BOOL`                         | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                       | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                        | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                      | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                       | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                      | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                       | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                      | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                       | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`, `HALF_FLOAT`          | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                      | [Float64](../sql-reference/data-types/float.md)         |
| `DATE32`                      | [Date32](../sql-reference/data-types/date32.md)         |
| `DATE64`                      | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME32`, `TIME64` | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`            | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL128`, `DECIMAL256`     | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                        | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                      | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                         | [Map](../sql-reference/data-types/map.md)               |

他のArrowタイプはサポートされていません。デフォルトでは、すべての推論された型は `Nullable` の中にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
### ORC {#orc}

ORCフォーマットでは、ClickHouseはデータからスキーマを読み取り、以下のタイプマッチを使用してClickHouseスキーマに変換します。

| ORCデータ型                     | ClickHouseデータ型                                    |
|----------------------------------|---------------------------------------------------------|
| `Boolean`                        | [Bool](../sql-reference/data-types/boolean.md)          |
| `Tinyint`                        | [Int8](../sql-reference/data-types/int-uint.md)         |
| `Smallint`                       | [Int16](../sql-reference/data-types/int-uint.md)        |
| `Int`                            | [Int32](../sql-reference/data-types/int-uint.md)        |
| `Bigint`                         | [Int64](../sql-reference/data-types/int-uint.md)        |
| `Float`                          | [Float32](../sql-reference/data-types/float.md)         |
| `Double`                         | [Float64](../sql-reference/data-types/float.md)         |
| `Date`                           | [Date32](../sql-reference/data-types/date32.md)         |
| `Timestamp`                      | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `String`, `Char`, `Varchar`,`BINARY` | [String](../sql-reference/data-types/string.md)         |
| `Decimal`                        | [Decimal](../sql-reference/data-types/decimal.md)       |
| `List`                           | [Array](../sql-reference/data-types/array.md)           |
| `Struct`                         | [Tuple](../sql-reference/data-types/tuple.md)           |
| `Map`                            | [Map](../sql-reference/data-types/map.md)               |

他のORCタイプはサポートされていません。デフォルトでは、すべての推論された型は `Nullable` の中にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
### ネイティブ {#native}

ネイティブフォーマットはClickHouse内で使用され、データ内にスキーマが含まれています。
スキーマ推論の際、ClickHouseはデータからスキーマを読み取り、変換を行いません。
## 外部スキーマを持つフォーマット {#formats-with-external-schema}

そのようなフォーマットでは、特定のスキーマ言語でデータを記述するスキーマを別ファイルに必要とします。
そのようなフォーマットのファイルから自動的にスキーマを推論するために、ClickHouseは別のファイルから外部スキーマを読み取ってClickHouseテーブルスキーマに変換します。
### Protobuf {#protobuf}

Protobufフォーマットのスキーマ推論の際、ClickHouseは以下のタイプマッチを使用します。

| Protobufデータ型               | ClickHouseデータ型                              |
|--------------------------------|---------------------------------------------------|
| `bool`                        | [UInt8](../sql-reference/data-types/int-uint.md)  |
| `float`                       | [Float32](../sql-reference/data-types/float.md)   |
| `double`                      | [Float64](../sql-reference/data-types/float.md)   |
| `int32`, `sint32`, `sfixed32` | [Int32](../sql-reference/data-types/int-uint.md)  |
| `int64`, `sint64`, `sfixed64` | [Int64](../sql-reference/data-types/int-uint.md)  |
| `uint32`, `fixed32`           | [UInt32](../sql-reference/data-types/int-uint.md) |
| `uint64`, `fixed64`           | [UInt64](../sql-reference/data-types/int-uint.md) |
| `string`, `bytes`             | [String](../sql-reference/data-types/string.md)   |
| `enum`                        | [Enum](../sql-reference/data-types/enum.md)       |
| `repeated T`                  | [Array(T)](../sql-reference/data-types/array.md)  |
| `message`, `group`            | [Tuple](../sql-reference/data-types/tuple.md)     |
### CapnProto {#capnproto}

CapnProtoフォーマットのスキーマ推論の際、ClickHouseは以下のタイプマッチを使用します。

| CapnProtoデータ型                | ClickHouseデータ型                                   |
|----------------------------------|--------------------------------------------------------|
| `Bool`                           | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int8`                           | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UInt8`                          | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int16`                          | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UInt16`                         | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `Int32`                          | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UInt32`                         | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `Int64`                          | [Int64](../sql-reference/data-types/int-uint.md)       |
| `UInt64`                         | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `Float32`                        | [Float32](../sql-reference/data-types/float.md)        |
| `Float64`                        | [Float64](../sql-reference/data-types/float.md)        |
| `Text`, `Data`                   | [String](../sql-reference/data-types/string.md)        |
| `enum`                           | [Enum](../sql-reference/data-types/enum.md)            |
| `List`                           | [Array](../sql-reference/data-types/array.md)          |
| `struct`                         | [Tuple](../sql-reference/data-types/tuple.md)          |
| `union(T, Void)`, `union(Void, T)` | [Nullable(T)](../sql-reference/data-types/nullable.md) |
## 強型バイナリフォーマット {#strong-typed-binary-formats}

そのようなフォーマットでは、各シリアライズされた値がその型の情報（おそらく名前についての情報も）を含みますが、テーブル全体に関する情報はありません。
そのようなフォーマットのスキーマ推論の際、ClickHouseはデータを行単位で読み取り（最大 `input_format_max_rows_to_read_for_schema_inference` 行または `input_format_max_bytes_to_read_for_schema_inference` バイト）、各値の型（おそらく名前も）をデータから抽出し、これらの型をClickHouse型に変換します。
### MsgPack {#msgpack}

MsgPackフォーマットには行間の区切りがないため、このフォーマットのスキーマ推論を使用するには、設定 `input_format_msgpack_number_of_columns` を使用してテーブルのカラム数を指定する必要があります。ClickHouseは以下のタイプマッチを使用します。

| MessagePackデータ型 (`INSERT`)                                   | ClickHouseデータ型                                      |
|--------------------------------------------------------------------|-----------------------------------------------------------|
| `int N`, `uint N`, `negative fixint`, `positive fixint`            | [Int64](../sql-reference/data-types/int-uint.md)          |
| `bool`                                                             | [UInt8](../sql-reference/data-types/int-uint.md)          |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [String](../sql-reference/data-types/string.md)           |
| `float 32`                                                         | [Float32](../sql-reference/data-types/float.md)           |
| `float 64`                                                         | [Float64](../sql-reference/data-types/float.md)           |
| `uint 16`                                                          | [Date](../sql-reference/data-types/date.md)               |
| `uint 32`                                                          | [DateTime](../sql-reference/data-types/datetime.md)       |
| `uint 64`                                                          | [DateTime64](../sql-reference/data-types/datetime.md)     |
| `fixarray`, `array 16`, `array 32`                                 | [Array](../sql-reference/data-types/array.md)             |
| `fixmap`, `map 16`, `map 32`                                       | [Map](../sql-reference/data-types/map.md)                 |

デフォルトでは、すべての推論された型は `Nullable` の中にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
### BSONEachRow {#bsoneachrow}

BSONEachRowでは、データの各行がBSONドキュメントとして表示されます。スキーマ推論の際、ClickHouseはBSONドキュメントを1つずつ読み取り、データから値、名前、型を抽出し、これらの型を以下のタイプマッチを使用してClickHouse型に変換します。

| BSONタイプ                                                                                     | ClickHouse型                                                                                                             |
|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                          |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                        |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                        |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                         |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                 |
| `\x05` binary with`\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                         |
| `\x07` ObjectId,                                                                              | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                           |
| `\x05` binary with `\x04` uuid subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                             |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md) （ネストされた型が異なる場合） |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md) （文字列キーを持つ）                 |

デフォルトでは、すべての推論された型は `Nullable` の中にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
## 定数スキーマを持つフォーマット {#formats-with-constant-schema}

そのようなフォーマットのデータは常に同じスキーマを持ちます。
### LineAsString {#line-as-string}

このフォーマットでは、ClickHouseはデータから全行を単一のカラムに `String` データ型として読み込みます。このフォーマットの推論された型は常に `String` で、カラム名は `line` です。

**例**

```sql
DESC format(LineAsString, 'Hello\nworld!')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ line │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### JSONAsString {#json-as-string}

このフォーマットでは、ClickHouseはデータから全JSONオブジェクトを単一のカラムに `String` データ型として読み込みます。このフォーマットの推論された型は常に `String` で、カラム名は `json` です。

**例**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### JSONAsObject {#json-as-object}

このフォーマットでは、ClickHouseはデータから全JSONオブジェクトを単一のカラムに `Object('json')` データ型として読み込みます。このフォーマットの推論された型は常に `String` で、カラム名は `json` です。

注意：このフォーマットは `allow_experimental_object_type` が有効な場合にのみ機能します。

**例**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}') SETTINGS allow_experimental_object_type=1
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ Object('json') │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## スキーマ推論モード {#schema-inference-modes}

データファイルのセットからのスキーマ推論は、`default` と `union` の2つの異なるモードで動作できます。
モードは設定 `schema_inference_mode` によって制御されます。
### デフォルトモード {#default-schema-inference-mode}

デフォルトモードでは、ClickHouseはすべてのファイルが同じスキーマを持つと仮定し、成功するまでファイルを一つずつ読み取ってスキーマを推論しようとします。

例：

`data1.jsonl`, `data2.jsonl`, `data3.jsonl` という3つのファイルが次の内容を持っているとしましょう。

`data1.jsonl`:
```json
{"field1" :  1, "field2" :  null}
{"field1" :  2, "field2" :  null}
{"field1" :  3, "field2" :  null}
```

`data2.jsonl`:
```json
{"field1" :  4, "field2" :  "Data4"}
{"field1" :  5, "field2" :  "Data5"}
{"field1" :  6, "field2" :  "Data5"}
```

`data3.jsonl`:
```json
{"field1" :  7, "field2" :  "Data7", "field3" :  [1, 2, 3]}
{"field1" :  8, "field2" :  "Data8", "field3" :  [4, 5, 6]}
{"field1" :  9, "field2" :  "Data9", "field3" :  [7, 8, 9]}
```

これらの3つのファイルに対してスキーマ推論を使用してみましょう：
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='default'
```

結果：

```response
┌─name───┬─type─────────────┐
│ field1 │ Nullable(Int64)  │
│ field2 │ Nullable(String) │
└────────┴──────────────────┘
```

見ての通り、`data3.jsonl` の `field3` はありません。
これはClickHouseがまず `data1.jsonl` からスキーマを推論しようとして失敗し（`field2` に対してnullのみ）、次に `data2.jsonl` から推論し成功し、したがって `data3.jsonl` のデータが読み取られなかったからです。
### ユニオンモード {#default-schema-inference-mode-1}

ユニオンモードでは、ClickHouseはファイルが異なるスキーマを持つ可能性があると見なし、すべてのファイルのスキーマを推論し、それらを共通スキーマにユニオンします。

`data1.jsonl`, `data2.jsonl`, `data3.jsonl` という3つのファイルが次の内容を持っているとしましょう。

`data1.jsonl`:
```json
{"field1" :  1}
{"field1" :  2}
{"field1" :  3}
```

`data2.jsonl`:
```json
{"field2" :  "Data4"}
{"field2" :  "Data5"}
{"field2" :  "Data5"}
```

`data3.jsonl`:
```json
{"field3" :  [1, 2, 3]}
{"field3" :  [4, 5, 6]}
{"field3" :  [7, 8, 9]}
```

これらの3つのファイルに対してスキーマ推論を使用してみましょう：
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='union'
```

結果：

```response
┌─name───┬─type───────────────────┐
│ field1 │ Nullable(Int64)        │
│ field2 │ Nullable(String)       │
│ field3 │ Array(Nullable(Int64)) │
└────────┴────────────────────────┘
```

見ると、すべてのファイルからのフィールドがあります。

注意：
- 一部のファイルに結果スキーマからのカラムが存在しない可能性があるため、ユニオンモードはカラムのサブセットを読み取ることがサポートされているフォーマット（例えば、JSONEachRow、Parquet、TSVWithNamesなど）のみにサポートされ、他のフォーマット（例えば、CSV、TSV、JSONCompactEachRowなど）では機能しません。
- ClickHouseがファイルの一つからスキーマを推論できない場合、例外がスローされます。
- もし多くのファイルがある場合、すべてのファイルからスキーマを読み取ることは時間がかかる可能性があります。
## 自動フォーマット検出 {#automatic-format-detection}

データフォーマットが指定されず、ファイル拡張子で決定できない場合、ClickHouseは内容によってファイルフォーマットを検出しようとします。

**例：**

`data` というファイルの内容が以下のようになっているとしましょう：
```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

フォーマットや構造を指定せずにこのファイルを調べてクエリできます：
```sql
:) desc file(data);
```

```repsonse
┌─name─┬─type─────────────┐
│ a    │ Nullable(Int64)  │
│ b    │ Nullable(String) │
└──────┴──────────────────┘
```

```sql
:) select * from file(data);
```

```response
┌─a─┬─b─────┐
│ 1 │ Data1 │
│ 2 │ Data2 │
│ 3 │ Data3 │
└───┴───────┘
```

:::note
ClickHouseは一部のフォーマットのみしか検出できず、検出には時間がかかるため、常にフォーマットを明示的に指定することをお勧めします。
:::
