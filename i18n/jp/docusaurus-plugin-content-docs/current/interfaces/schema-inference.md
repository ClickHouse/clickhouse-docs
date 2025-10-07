---
'description': 'ClickHouseにおける入力データからの自動スキーマ推論を説明するページ'
'sidebar_label': 'スキーマ推論'
'slug': '/interfaces/schema-inference'
'title': '入力データからの自動スキーマ推論'
'doc_type': 'reference'
---

ClickHouseは、ほとんどすべてのサポートされている [Input formats](formats.md) の入力データの構造を自動的に特定できます。この文書では、スキーマ推論がどのように使用されるか、異なる入力形式に対してどのように機能するか、及びそれを制御できる設定について説明します。

## 使用法 {#usage}

スキーマ推論は、ClickHouseが特定のデータ形式でデータを読み取る必要があり、構造が不明な場合に使用されます。

## テーブル関数 [file](../sql-reference/table-functions/file.md)、[s3](../sql-reference/table-functions/s3.md)、[url](../sql-reference/table-functions/url.md)、[hdfs](../sql-reference/table-functions/hdfs.md)、[azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md) {#table-functions-file-s3-url-hdfs-azureblobstorage}

これらのテーブル関数には、入力データの構造を指定するオプションの引数 `structure` があります。この引数が指定されていない場合、または `auto` に設定されている場合、構造はデータから推論されます。

**例：**

`user_files` ディレクトリに `hobbies.jsonl` という JSONEachRow 形式のファイルがあり、次の内容が含まれているとします。
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouseは、構造を指定せずにこのデータを読み取ることができます：
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

注：形式 `JSONEachRow` は、ファイル拡張子 `.jsonl` によって自動的に特定されました。

自動的に特定された構造は、`DESCRIBE` クエリを使用して見ることができます：
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

## テーブルエンジン [File](../engines/table-engines/special/file.md)、[S3](../engines/table-engines/integrations/s3.md)、[URL](../engines/table-engines/special/url.md)、[HDFS](../engines/table-engines/integrations/hdfs.md)、[azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) {#table-engines-file-s3-url-hdfs-azureblobstorage}

`CREATE TABLE` クエリでカラムのリストが指定されていない場合、テーブルの構造はデータから自動的に推論されます。

**例：**

`hobbies.jsonl` ファイルを使用しましょう。このファイルのデータで `File` エンジンのテーブルを作成できます：
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

`clickhouse-local` には、入力データの構造を指定するオプションのパラメータ `-S/--structure` があります。このパラメータが指定されていない場合、または `auto` に設定されている場合、構造はデータから推論されます。

**例：**

`hobbies.jsonl` ファイルを使用しましょう。このファイルから `clickhouse-local` を使用してデータをクエリできます：
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='DESCRIBE TABLE hobbies'
```
```response
id    Nullable(Int64)
age    Nullable(Int64)
name    Nullable(String)
hobbies    Array(Nullable(String))
```
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='SELECT * FROM hobbies'
```
```response
1    25    Josh    ['football','cooking','music']
2    19    Alan    ['tennis','art']
3    32    Lana    ['fitness','reading','shopping']
4    47    Brayan    ['movies','skydiving']
```

## 挿入テーブルからの構造の使用 {#using-structure-from-insertion-table}

テーブル関数 `file/s3/url/hdfs` を使用してデータをテーブルに挿入する場合、データから抽出するのではなく、挿入テーブルから構造を使用するオプションがあります。これによりスキーマ推論にかかる時間を短縮でき、テーブルが最適化されたスキーマを持っている場合、型間の変換が行われないため、挿入パフォーマンスが向上します。

この動作を制御する特別な設定 [use_structure_from_insertion_table_in_table_functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions) があり、次の3つの値を持っています：
- 0 - テーブル関数はデータから構造を抽出します。
- 1 - テーブル関数は挿入テーブルから構造を使用します。
- 2 - ClickHouseは挿入テーブルから構造を使用することが可能か、またはスキーマ推論を使用するかを自動的に判断します。デフォルト値。

**例1：**

次の構造でテーブル `hobbies1` を作成しましょう：
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

そして、ファイル `hobbies.jsonl` からデータを挿入します：

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

この場合、ファイルのすべてのカラムが変更無しでテーブルに挿入されるため、ClickHouseはスキーマ推論ではなく挿入テーブルからの構造を使用します。

**例2：**

次の構造でテーブル `hobbies2` を作成しましょう：
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

そして、ファイル `hobbies.jsonl` からデータを挿入します：

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリのすべてのカラムがテーブルに存在するため、ClickHouseは挿入テーブルからの構造を使用します。これは、JSONEachRow、TSKV、Parquetなどのサブセットのカラムを読み取ることをサポートする入力フォーマットに対してのみ機能します（したがって、TSV形式のように機能しません）。

**例3：**

次の構造でテーブル `hobbies3` を作成しましょう：

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

そして、ファイル `hobbies.jsonl` からデータを挿入します：

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリでカラム `id` が使用されますが、テーブルにはこのカラムは存在せず（`identifier` という名前のカラムが存在します）、ClickHouseは挿入テーブルからの構造を使用できないため、スキーマ推論が使用されます。

**例4：**

次の構造でテーブル `hobbies4` を作成しましょう：

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

そして、ファイル `hobbies.jsonl` からデータを挿入します：

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリでカラム `hobbies` にいくつかの操作が行われるため、ClickHouseは挿入テーブルからの構造を使用できず、スキーマ推論が使用されます。

## スキーマ推論キャッシュ {#schema-inference-cache}

ほとんどの入力形式では、スキーマ推論はデータの一部を読み取ってその構造を決定し、このプロセスには時間がかかることがあります。同じファイルから ClickHouse がデータを再度読み取る際に、同じスキーマを推論するのを防ぐために、推論されたスキーマがキャッシュされ、同じファイルにアクセスするときに ClickHouse はキャッシュからスキーマを使用します。

このキャッシュを制御する特別な設定があります：
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 対応するテーブル関数のための最大キャッシュスキーマ数。デフォルト値は `4096` です。これらの設定はサーバー構成に設定する必要があります。
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - スキーマ推論にキャッシュを使用する／使用しないを切り替えることを許可します。これらの設定はクエリで使用できます。

ファイルのスキーマは、データを変更するか、形式設定を変更することによって変更できます。このため、スキーマ推論キャッシュは、ファイルソース、形式名、使用された形式の設定、及びファイルの最終修正時間によってスキーマを特定します。

注：`url` テーブル関数内の `url` によってアクセスされた一部のファイルは、最終修正時間の情報を含まない場合があります。これに対する特別な設定`schema_inference_cache_require_modification_time_for_url`があります。この設定を無効にすると、そのようなファイルに対して最終修正時間なしでキャッシュからのスキーマの使用が可能になります。

また、すべての現在のキャッシュスキーマが含まれるシステムテーブル [schema_inference_cache](../operations/system-tables/schema_inference_cache.md) と、すべてのソース、または特定のソースに対してスキーマキャッシュをクリーンアップできるシステムクエリ `SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]` があります。

**例：**

s3 のサンプルデータセット `github-2022.ndjson.gz` の構造を推論してみて、スキーマ推論のキャッシュがどのように機能するかを見てみましょう：

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

5 rows in set. Elapsed: 0.601 sec.
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

5 rows in set. Elapsed: 0.059 sec.
```

ご覧のとおり、2回目のクエリはほぼ瞬時に成功しました。

推論されたスキーマに影響を与える可能性のあるいくつかの設定を変更してみましょう：

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

5 rows in set. Elapsed: 0.611 sec
```

ご覧のとおり、推論されたスキーマに影響を与える設定が変更されたため、同じファイルに対してキャッシュからのスキーマは使用されませんでした。

`system.schema_inference_cache` テーブルの内容をチェックしてみましょう：

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Object(Nullable('json')), repo Object(Nullable('json')), created_at Nullable(String), payload Object(Nullable('json')) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                         │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

ご覧のとおり、同じファイルに対して2つの異なるスキーマがあります。

システムクエリを使用してスキーマキャッシュをクリアできます：
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

## テキスト形式 {#text-formats}

テキスト形式の場合、ClickHouseはデータを行単位で読み取り、形式に従ってカラム値を抽出し、その後いくつかの再帰的パーサーやヒューリスティックを使用して各値の型を決定します。スキーマ推論で読み取る最大行数とバイト数は、設定 `input_format_max_rows_to_read_for_schema_inference`（デフォルト25000）と `input_format_max_bytes_to_read_for_schema_inference`（デフォルト32Mb）で制御されます。デフォルトでは、すべての推論された型は [Nullable](../sql-reference/data-types/nullable.md) ですが、`schema_inference_make_columns_nullable` を設定することでこれを変更できます（[settings](#settings-for-text-formats) セクションの例を参照）。

### JSON 形式 {#json-formats}

JSON 形式では、ClickHouse は値を JSON 仕様に従って解析し、その後最も適切なデータ型を見つけるようにします。

これがどのように機能し、どの型が推論でき、JSON形式で使用できる特定の設定を見てみましょう。

**例**

ここ以降、例では [format](../sql-reference/table-functions/format.md) テーブル関数が使用されます。

整数、浮動小数点、ブール値、文字列：
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

日付、日時：

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

配列：
```sql
DESC format(JSONEachRow, '{"arr" : [1, 2, 3], "nested_arrays" : [[1, 2, 3], [4, 5, 6], []]}')
```
```response
┌─name──────────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr           │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ nested_arrays │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に `null` が含まれている場合、ClickHouse は他の配列要素の型を使用します：
```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に異なる型の値が含まれており、設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` が有効になっている場合（デフォルトで有効）、その型は `Array(Dynamic)` になります：
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"arr" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Dynamic) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

名前付きタプル：

設定 `input_format_json_try_infer_named_tuples_from_objects` が有効になっている場合、スキーマ推論中に ClickHouse は JSON オブジェクトから名前付きタプルを推論しようとします。結果として得られる名前付きタプルは、サンプルデータのすべての対応する JSON オブジェクトからすべての要素を含みます。

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

名前なしタプル：

設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` が無効になっている場合、異なる型の要素を持つ配列は、JSON 形式の名前なしタプルとして扱われます。
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

値が `null` または空の場合、他の行の対応する値の型を使用します：
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=0;
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

マップ：

JSONでは、同じ型の値を持つオブジェクトをマップ型として読み取ることができます。注：設定 `input_format_json_read_objects_as_strings` と `input_format_json_try_infer_named_tuples_from_objects` が無効な場合にのみ機能します。

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

JSONオブジェクト型（設定 `allow_experimental_object_type` が有効になっている場合）：

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

ネストされた複雑な型：
```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse が特定のキーの型を決定できない場合、データが `null` / 空オブジェクト / 空配列のみを含むため、設定 `input_format_json_infer_incomplete_types_as_strings` が有効にされている場合は、型 `String` が使用され、それ以外の場合は例外がスローされます：
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

#### JSON 設定 {#json-settings}
##### input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}

この設定を有効にすると、文字列値から数値を推論することができます。

デフォルトではこの設定は無効です。

**例：**

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

この設定を有効にすると、JSONオブジェクトから名前付きタプルを推論できます。結果として得られる名前付きタプルは、サンプルデータのすべての対応するJSONオブジェクトからすべての要素を含みます。JSONデータがスパースでない場合、サンプルデータにはすべての可能なオブジェクトキーが含まれるため、便利です。

この設定はデフォルトで有効です。

**例**

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

結果：

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"array" : [{"a" : 42, "b" : "Hello"}, {}, {"c" : [1,2,3]}, {"d" : "2020-01-01"}]}')
```

結果：

```markdown
┌─name──┬─type────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │              │                    │         │                  │                │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

この設定を有効にすると、JSONオブジェクトから名前付きタプルの推論中に、あいまいなパスについて例外の代わりに文字列型を使用できるようになります（`input_format_json_try_infer_named_tuples_from_objects` が有効な場合）。それは、あいまいなパスがあっても名前付きタプルとして JSON オブジェクトを読むことを可能にします。

デフォルトでは無効です。

**例**

無効にした設定を用いて：
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```
結果：

```response
Code: 636. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'a' has type 'Int64' and in some - 'Tuple(b String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'a'. (INCORRECT_DATA) (version 24.3.1.1).
You can specify the structure manually. (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

有効にした設定を用いて：
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : "a" : 42}, {"obj" : {"a" : {"b" : "Hello"}}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

結果：
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

この設定を有効にすると、ネストされたJSONオブジェクトを文字列として読み取ることができます。この設定は、JSONオブジェクト型を使用せずに、ネストされたJSONオブジェクトを読み取るために使用できます。

この設定はデフォルトで有効です。

注：この設定を有効にすると、設定 `input_format_json_try_infer_named_tuples_from_objects` が無効な場合にのみ効果があります。

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

この設定を有効にすると、数値値を文字列として読み取ることができます。

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

この設定を有効にすると、ブール値を数値として読み取ることができます。

この設定はデフォルトで有効です。

**例：**

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

この設定を有効にすると、ブール値を文字列として読み取ることができます。

この設定はデフォルトで有効です。

**例：**

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

この設定を有効にすると、JSON配列値を文字列として読み取ることができます。

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

この設定を有効にすると、スキーマ推論中にデータサンプル内の `Null` / `{}` / `[]` のみを含むJSONキーに対して文字列型を使用できます。JSON形式では、対応するすべての設定が有効になっている場合、任意の値を文字列として読み取れます（デフォルトで全て有効です）、型が不明なキーに対して文字列型を使用することで、スキーマ推論中のエラー `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` を回避できます。

例：

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

結果：
```markdown
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

### CSV {#csv}

CSV形式では、ClickHouseは区切り文字に従って行からカラム値を抽出します。ClickHouseは、数字と文字列以外のすべての型が二重引用符で囲まれていることを期待します。値が二重引用符で囲まれている場合、ClickHouseは、内部のデータを再帰的なパーサーを使用して解析し、最も適切なデータ型を見つけようとします。値が二重引用符で囲まれていない場合、ClickHouseはそれを数値として解析し、値が数値でない場合は文字列として扱います。

ClickHouse が複雑な型を推論しようとしないようにしたい場合は、設定 `input_format_csv_use_best_effort_in_schema_inference` を無効にし、ClickHouse はすべてのカラムを文字列として扱います。

設定 `input_format_csv_detect_header` が有効になっている場合、ClickHouse はスキーマ推論中にカラム名（おそらく型）を検出しようとします。この設定はデフォルトで有効です。

**例：**

整数、浮動小数点、ブール値、文字列：
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

引用なしの文字列：
```sql
DESC format(CSV, 'Hello world!,World hello!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日付、日時：

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

配列：
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

配列に null が含まれている場合、ClickHouse は他の配列要素の型を使用します：
```sql
DESC format(CSV, '"[NULL, 42, NULL]"')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

マップ：
```sql
DESC format(CSV, $$"{'key1' : 42, 'key2' : 24}"$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた配列とマップ：
```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```
```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse が引用内の型を決定できない場合、データが null のみを含むため、ClickHouse はそれを String として扱います：
```sql
DESC format(CSV, '"[NULL, NULL]"')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

設定 `input_format_csv_use_best_effort_in_schema_inference` が無効になっている例：
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

ヘッダーの自動検出の例（`input_format_csv_detect_header` が有効な場合）：

名前のみ：
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

名前と型：

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

ヘッダーは、少なくとも1つの非文字列型のカラムがある場合にのみ検出できます。すべてのカラムが文字列型の場合、ヘッダーは検出されません：

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

#### CSV 設定 {#csv-settings}
##### input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

この設定を有効にすると、文字列値から数値を推論することができます。

デフォルトではこの設定は無効です。

**例：**

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

TSV/TSKV形式では、ClickHouseはタブ区切り文字に従って行からカラム値を抽出し、その後、再帰的パーサーを使用して抽出された値を解析し、最も適切な型を決定します。型を決定できない場合、ClickHouseはこの値を文字列として扱います。

ClickHouse が複雑な型を推論しようとしないようにしたい場合は、設定 `input_format_tsv_use_best_effort_in_schema_inference` を無効にし、ClickHouse はすべてのカラムを文字列として扱います。

設定 `input_format_tsv_detect_header` が有効になっている場合、ClickHouse はスキーマ推論中にカラム名（おそらく型）を検出しようとします。この設定はデフォルトで有効です。

**例：**

整数、浮動小数点、ブール値、文字列：
```sql
DESC format(TSV, '42    42.42    true    Hello,World!')
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
DESC format(TSKV, 'int=42    float=42.42    bool=true    string=Hello,World!\n')
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

日付、日時：

```sql
DESC format(TSV, '2020-01-01    2020-01-01 00:00:00    2022-01-01 00:00:00.000')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列：
```sql
DESC format(TSV, '[1,2,3]    [[1, 2], [], [3, 4]]')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSV, '[''Hello'', ''world'']    [[''Abc'', ''Def''], []]')
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に null が含まれている場合、ClickHouse は他の配列要素の型を使用します：
```sql
DESC format(TSV, '[NULL, 42, NULL]')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

タプル：
```sql
DESC format(TSV, $$(42, 'Hello, world!')$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

マップ：
```sql
DESC format(TSV, $${'key1' : 42, 'key2' : 24}$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた配列、タプル、マップ：
```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse が型を決定できない場合、データが null のみを含むため、ClickHouse はそれを文字列として扱います：
```sql
DESC format(TSV, '[NULL, NULL]')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

設定 `input_format_tsv_use_best_effort_in_schema_inference` が無効になっている例：
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ヘッダーの自動検出の例（`input_format_tsv_detect_header` が有効な場合）：

名前のみ：
```sql
SELECT * FROM format(TSV,
$$number    string    array
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$);
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

名前と型：

```sql
DESC format(TSV,
$$number    string    array
UInt32    String    Array(UInt16)
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ヘッダーは、少なくとも1つの非文字列型のカラムがある場合にのみ検出できます。すべてのカラムが文字列型の場合、ヘッダーは検出されません：

```sql
SELECT * FROM format(TSV,
$$first_column    second_column
Hello    World
World    Hello
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```
### 値 {#values}

Values形式では、ClickHouseは行からカラム値を抽出し、その後、リテラルと同様に再帰的パーサーを使用して解析します。

**例：**

整数、浮動小数点、ブール値、文字列：
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

日付、日時：

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

配列：
```sql
DESC format(Values, '([1,2,3], [[1, 2], [], [3, 4]])')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に null が含まれている場合、ClickHouse は他の配列要素の型を使用します：
```sql
DESC format(Values, '([NULL, 42, NULL])')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

タプル：
```sql
DESC format(Values, $$((42, 'Hello, world!'))$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

マップ：
```sql
DESC format(Values, $$({'key1' : 42, 'key2' : 24})$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた配列、タプル、マップ：
```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse が型を決定できない場合、データが null のみを含むため、例外がスローされます：
```sql
DESC format(Values, '([NULL, NULL])')
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'c1' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

設定 `input_format_tsv_use_best_effort_in_schema_inference` が無効になっている例：
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### カスタム区切り {#custom-separated}

CustomSeparated形式では、ClickHouseは最初に指定された区切り文字に従って行からすべてのカラム値を抽出し、その後、エスケープ規則に従って各値のデータ型を推論しようとします。

設定 `input_format_custom_detect_header` が有効になっている場合、ClickHouse はスキーマ推論中にカラム名（おそらく型）を検出しようとします。この設定はデフォルトで有効です。

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

ヘッダーの自動検出の例（`input_format_custom_detect_header` が有効な場合）：

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
### テンプレート {#template}

Template形式では、ClickHouseは最初に指定されたテンプレートに従って行からすべてのカラム値を抽出し、その後、エスケープ規則に従って各値のデータ型を推論しようとします。

**例**

`resultset` というファイルに次の内容が含まれていると仮定します：
```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

また、`row_format` というファイルに次の内容が含まれていると仮定します：

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

次に、次のクエリを実行できます：

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
### 正規表現 {#regexp}

Templateと同様に、Regexp形式では、ClickHouseは最初に指定された正規表現に従って行からすべてのカラム値を抽出し、その後、指定されたエスケープ規則に従って各値のデータ型を推論しようとします。

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
### テキスト形式の設定 {#settings-for-text-formats}
#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference {#input-format-max-rows-to-read-for-schema-inference}

これらの設定は、スキーマ推論中に読み取るデータの量を制御します。多くの行／バイトが読み取られるほど、スキーマ推論にかかる時間が増えますが、正しく型を決定する可能性が高くなります（特に、データに null が多く含まれている場合）。

デフォルト値：
- `input_format_max_rows_to_read_for_schema_inference` のデフォルトは `25000`
- `input_format_max_bytes_to_read_for_schema_inference` のデフォルトは `33554432`（32 MB）

#### column_names_for_schema_inference {#column-names-for-schema-inference}

明示的なカラム名がない形式のスキーマ推論に使用するカラム名のリスト。指定された名前はデフォルトの `c1,c2,c3,...` の代わりに使用されます。形式: `column1,column2,column3,...`。

**例**

```sql
DESC format(TSV, 'Hello, World!    42    [1, 2, 3]') settings column_names_for_schema_inference = 'str,int,arr'
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ str  │ Nullable(String)       │              │                    │         │                  │                │
│ int  │ Nullable(Int64)        │              │                    │         │                  │                │
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_hints {#schema-inference-hints}

自動的に決定された型の代わりにスキーマ推論で使用するカラム名と型のリスト。形式: 'column_name1 column_type1, column_name2 column_type2, ...'。この設定を使用して、自動的に決定できなかったカラムの型を指定したり、スキーマを最適化したりできます。

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

スキーマ推論における推論された型を `Nullable` にするかどうかを制御します。nullabilityに関する情報がない形式に対して可能な値：
* 0 - 推論された型は決して `Nullable` になりません。
* 1 - すべての推論された型は `Nullable` になります。
* 2 または "auto" - テキスト形式の場合、スキーマ推論中に解析されるサンプルに `NULL` が含まれている場合のみ、推論された型は `Nullable` になります。強く型付けされた形式（Parquet、ORC、Arrow）については、nullability情報がファイルメタデータから取得されます。
* 3 - テキスト形式の場合 `Nullable` を使用。強く型付けされた形式については、ファイルメタデータを使用します。

デフォルト：3。

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

:::note
この設定は `JSON` データ型には適用されません。
:::

有効にすると、ClickHouseはテキスト形式のスキーマ推論中に、浮動小数点の代わりに整数を推論しようとします。サンプルデータのカラム内のすべての数が整数であれば、結果の型は `Int64` になり、少なくとも1つの数が浮動小数点であれば、結果の型は `Float64` になります。サンプルデータが整数のみを含み、少なくとも1つの整数が正で `Int64` をオーバーフローする場合、ClickHouse は `UInt64` を推論します。

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

有効にすると、ClickHouseはテキスト形式のスキーマ推論中に、文字列フィールドから `DateTime` または `DateTime64` 型を推論しようとします。サンプルデータのカラム内のすべてのフィールドが正常に日付時刻として解析された場合、結果の型は `DateTime` または `DateTime64(9)` になります（小数部分がある場合）、少なくとも1つのフィールドが日付時刻として解析されなかった場合、結果の型は `String` になります。

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
#### input_format_try_infer_datetimes_only_datetime64 {#input-format-try-infer-datetimes-only-datetime64}

有効にすると、ClickHouseは、`input_format_try_infer_datetimes` が有効になっている場合でも、小数部分を含まない日時値があっても、常に `DateTime64(9)` を推論します。

デフォルトで無効です。

**例**

```sql
SET input_format_try_infer_datetimes = 1;
SET input_format_try_infer_datetimes_only_datetime64 = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```

```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

注：スキーマ推論中の日付時刻の解析は、設定 [date_time_input_format](/operations/settings/settings-formats.md#date_time_input_format) を尊重します。

#### input_format_try_infer_dates {#input-format-try-infer-dates}

有効にすると、ClickHouseはテキスト形式のスキーマ推論中に文字列フィールドから `Date` 型を推論しようとします。サンプルデータのカラム内のすべてのフィールドが正常に日付として解析された場合、結果の型は `Date` になります。少なくとも1つのフィールドが日付として解析されなかった場合、結果の型は `String` になります。

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

有効にすると、ClickHouseはテキスト形式の指数形式の浮動小数点数を推論しようとします（JSONでは、指数形式の数値は常に推論されます）。

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
## セルフ記述フォーマット {#self-describing-formats}

セルフ記述フォーマットには、データの構造に関する情報が含まれています。それは、説明が含まれたヘッダー、バイナリ型ツリー、または何らかの表形式かもしれません。このような形式のファイルからスキーマを自動的に推論するために、ClickHouseは型に関する情報を含むデータの一部を読み取り、それをClickHouseテーブルのスキーマに変換します。

### -WithNamesAndTypes サフィックス付き形式 {#formats-with-names-and-types}

ClickHouseは、-WithNamesAndTypesというサフィックスを持ついくつかのテキスト形式をサポートしています。このサフィックスは、データが実際のデータの前にカラム名と型を含む2つの追加行を含むことを意味します。このような形式のスキーマ推論中、ClickHouseは最初の2行を読み取り、カラム名と型を抽出します。

**例**

```sql
DESC format(TSVWithNamesAndTypes,
$$num    str    arr
UInt8    String    Array(UInt8)
42    Hello, World!    [1,2,3]
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### メタデータ付きJSON形式 {#json-with-metadata}

一部のJSON入力形式（[JSON](formats.md#json)、[JSONCompact](/interfaces/formats/JSONCompact)、[JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)）には、カラム名と型のメタデータが含まれています。そのような形式のスキーマ推論では、ClickHouseはこのメタデータを読み取ります。

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

Avro形式では、ClickHouseはデータからスキーマを読み取り、次の型のマッチングを使用してClickHouseスキーマに変換します：

| Avroデータ型                     | ClickHouseデータ型                                                           |
|----------------------------------|------------------------------------------------------------------------------|
| `boolean`                        | [Bool](../sql-reference/data-types/boolean.md)                               |
| `int`                            | [Int32](../sql-reference/data-types/int-uint.md)                             |
| `int (date)` \*                  | [Date32](../sql-reference/data-types/date32.md)                              |
| `long`                           | [Int64](../sql-reference/data-types/int-uint.md)                             |
| `float`                          | [Float32](../sql-reference/data-types/float.md)                              |
| `double`                         | [Float64](../sql-reference/data-types/float.md)                              |
| `bytes`, `string`                | [String](../sql-reference/data-types/string.md)                              |
| `fixed`                          | [FixedString(N)](../sql-reference/data-types/fixedstring.md)                 |
| `enum`                           | [Enum](../sql-reference/data-types/enum.md)                                  |
| `array(T)`                       | [Array(T)](../sql-reference/data-types/array.md)                             |
| `union(null, T)`, `union(T, null)` | [Nullable(T)](../sql-reference/data-types/date.md)                        |
| `null`                           | [Nullable(Nothing)](../sql-reference/data-types/special-data-types/nothing.md) |
| `string (uuid)` \*               | [UUID](../sql-reference/data-types/uuid.md)                                  |
| `binary (decimal)` \*            | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                     |

\* [Avro logical types](https://avro.apache.org/docs/current/spec.html#Logical+Types)

他のAvro型はサポートされていません。
### Parquet {#parquet}

Parquetフォーマットにおいて、ClickHouseはデータからスキーマを読み取り、以下の型マッチを使用してClickHouseスキーマに変換します。

| Parquetデータ型                | ClickHouseデータ型                                    |
|------------------------------|---------------------------------------------------------|
| `BOOL`                       | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                      | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                       | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                     | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                      | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                     | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                      | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                     | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                      | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`                      | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                     | [Float64](../sql-reference/data-types/float.md)         |
| `DATE`                       | [Date32](../sql-reference/data-types/date32.md)         |
| `TIME (ms)`                  | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME (us, ns)` | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`           | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL`                    | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                       | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                     | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                        | [Map](../sql-reference/data-types/map.md)               |

他のParquetタイプはサポートされていません。
### Arrow {#arrow}

Arrowフォーマットにおいて、ClickHouseはデータからスキーマを読み取り、以下の型マッチを使用してClickHouseスキーマに変換します。

| Arrowデータ型                 | ClickHouseデータ型                                    |
|---------------------------------|---------------------------------------------------------|
| `BOOL`                          | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                         | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                          | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                        | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                         | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                        | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                         | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                        | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                         | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`, `HALF_FLOAT`           | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                        | [Float64](../sql-reference/data-types/float.md)         |
| `DATE32`                        | [Date32](../sql-reference/data-types/date32.md)         |
| `DATE64`                        | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME32`, `TIME64` | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`              | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL128`, `DECIMAL256`      | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                          | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                        | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                           | [Map](../sql-reference/data-types/map.md)               |

他のArrowタイプはサポートされていません。
### ORC {#orc}

ORCフォーマットにおいて、ClickHouseはデータからスキーマを読み取り、以下の型マッチを使用してClickHouseスキーマに変換します。

| ORCデータ型                        | ClickHouseデータ型                                    |
|--------------------------------------|---------------------------------------------------------|
| `Boolean`                            | [Bool](../sql-reference/data-types/boolean.md)          |
| `Tinyint`                            | [Int8](../sql-reference/data-types/int-uint.md)         |
| `Smallint`                           | [Int16](../sql-reference/data-types/int-uint.md)        |
| `Int`                                | [Int32](../sql-reference/data-types/int-uint.md)        |
| `Bigint`                             | [Int64](../sql-reference/data-types/int-uint.md)        |
| `Float`                              | [Float32](../sql-reference/data-types/float.md)         |
| `Double`                             | [Float64](../sql-reference/data-types/float.md)         |
| `Date`                               | [Date32](../sql-reference/data-types/date32.md)         |
| `Timestamp`                          | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `String`, `Char`, `Varchar`,`BINARY` | [String](../sql-reference/data-types/string.md)         |
| `Decimal`                            | [Decimal](../sql-reference/data-types/decimal.md)       |
| `List`                               | [Array](../sql-reference/data-types/array.md)           |
| `Struct`                             | [Tuple](../sql-reference/data-types/tuple.md)           |
| `Map`                                | [Map](../sql-reference/data-types/map.md)               |

他のORCタイプはサポートされていません。
### Native {#native}

ネイティブフォーマットはClickHouse内部で使用され、データ内にスキーマを含んでいます。
スキーマ推論において、ClickHouseは変換なしでデータからスキーマを読み取ります。
## 外部スキーマを持つフォーマット {#formats-with-external-schema}

このようなフォーマットは、特定のスキーマ言語でデータを説明するスキーマを別のファイルに必要とします。
このようなフォーマットのファイルから自動的にスキーマを推論するために、ClickHouseは別のファイルから外部スキーマを読み取り、ClickHouseテーブルスキーマに変換します。
### Protobuf {#protobuf}

Protobufフォーマットのスキーマ推論では、ClickHouseは以下の型マッチを使用します。

| Protobufデータ型            | ClickHouseデータ型                              |
|-------------------------------|---------------------------------------------------|
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

CapnProtoフォーマットのスキーマ推論では、ClickHouseは以下の型マッチを使用します。

| CapnProtoデータ型                | ClickHouseデータ型                                   |
|------------------------------------|--------------------------------------------------------|
| `Bool`                             | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int8`                             | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UInt8`                            | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int16`                            | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UInt16`                           | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `Int32`                            | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UInt32`                           | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `Int64`                            | [Int64](../sql-reference/data-types/int-uint.md)       |
| `UInt64`                           | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `Float32`                          | [Float32](../sql-reference/data-types/float.md)        |
| `Float64`                          | [Float64](../sql-reference/data-types/float.md)        |
| `Text`, `Data`                     | [String](../sql-reference/data-types/string.md)        |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)            |
| `List`                             | [Array](../sql-reference/data-types/array.md)          |
| `struct`                           | [Tuple](../sql-reference/data-types/tuple.md)          |
| `union(T, Void)`, `union(Void, T)` | [Nullable(T)](../sql-reference/data-types/nullable.md) |
## 強い型付けバイナリフォーマット {#strong-typed-binary-formats}

このようなフォーマットでは、各シリアライズされた値がその型（おそらくその名前についても）に関する情報を含んでいますが、全体のテーブルに関する情報はありません。
このようなフォーマットのスキーマ推論では、ClickHouseはデータを行単位で読み取り（`input_format_max_rows_to_read_for_schema_inference` 行 または `input_format_max_bytes_to_read_for_schema_inference` バイトまで）、各値の型（およびおそらく名前）をデータから抽出し、これらの型をClickHouse型に変換します。
### MsgPack {#msgpack}

MsgPackフォーマットでは行間に区切りがないため、このフォーマットでスキーマ推論を使用するには、設定 `input_format_msgpack_number_of_columns` を使用してテーブルのカラム数を指定する必要があります。ClickHouseは以下の型マッチを使用します。

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

デフォルトでは、すべての推論された型は `Nullable` 内にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
### BSONEachRow {#bsoneachrow}

BSONEachRowでは、データの各行がBSONドキュメントとして表現されます。スキーマ推論において、ClickHouseはBSONドキュメントを1つずつ読み取り、データから値、名前、および型を抽出し、次に以下の型マッチを使用してこれらの型をClickHouse型に変換します。

| BSONタイプ                                                                                     | ClickHouse型                                                                                                             |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                              |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                             |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                     |
| `\x05` binary with`\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                             |
| `\x07` ObjectId,                                                                              | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                               |
| `\x05` binary with `\x04` uuid subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                                 |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md) (ネストされた型が異なる場合) |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md) (文字列キーによる)            |

デフォルトでは、すべての推論された型は `Nullable` 内にありますが、`schema_inference_make_columns_nullable` 設定を使用して変更できます。
## 一定のスキーマを持つフォーマット {#formats-with-constant-schema}

このようなフォーマットのデータは常に同じスキーマを持ちます。
### LineAsString {#line-as-string}

このフォーマットでは、ClickHouseはデータから全行を単一のカラムに `String` データ型として読み込みます。このフォーマットに対する推論型は常に `String` で、カラム名は `line` です。

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

このフォーマットでは、ClickHouseはデータから全てのJSONオブジェクトを単一のカラムに `String` データ型として読み込みます。このフォーマットに対する推論型は常に `String` で、カラム名は `json` です。

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

このフォーマットでは、ClickHouseはデータから全てのJSONオブジェクトを単一のカラムに `Object('json')` データ型として読み込みます。このフォーマットに対する推論型は常に `String` で、カラム名は `json` です。

注意：このフォーマットは `allow_experimental_object_type` が有効になっている場合のみ機能します。

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

データファイルのセットからのスキーマ推論は、`default` と `union` の2つの異なるモードで動作します。
モードは、設定 `schema_inference_mode` で制御されます。
### デフォルトモード {#default-schema-inference-mode}

デフォルトモードでは、ClickHouseはすべてのファイルが同じスキーマを持っていると仮定し、ファイルを1つずつ読み取って推論に成功するまでスキーマを推論します。

例：

`data1.jsonl`、`data2.jsonl`、`data3.jsonl`の3つのファイルが次の内容を持っているとしましょう。

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

これらの3つのファイルでスキーマ推論を試みてみましょう：
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

ご覧のとおり、`data3.jsonl`ファイルには`field3`がありません。
これは、ClickHouseが最初に`data1.jsonl`ファイルからスキーマを推論しようとし、`field2`がすべてnullのために失敗し、その後`data2.jsonl`からスキーマを推論しようとし、成功したため、`data3.jsonl`ファイルのデータは読み取られなかったからです。
### ユニオンモード {#default-schema-inference-mode-1}

ユニオンモードでは、ClickHouseはファイルが異なるスキーマを持つ可能性があると仮定し、すべてのファイルのスキーマを推論した後、それらを共通のスキーマに統合します。

例：

`data1.jsonl`、`data2.jsonl`、`data3.jsonl`の3つのファイルが次の内容を持っているとしましょう。

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

これらの3つのファイルでスキーマ推論を試みてみましょう：
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

ご覧のとおり、すべてのファイルからすべてのフィールドを持っています。

注意：
- 結果のスキーマから某些カラムを含まないファイルがある場合があるため、ユニオンモードはカラムの部分集合を読み取ることをサポートするフォーマット（JSONEachRow、Parquet、TSVWithNamesなど）のみをサポートし、他のフォーマット（CSV、TSV、JSONCompactEachRowなど）では機能しません。
- ClickHouseがファイルのいずれかからスキーマを推測できない場合、例外が発生します。
- 多くのファイルがある場合、すべてのファイルからスキーマを読み取るのに多くの時間がかかることがあります。
## 自動フォーマット検出 {#automatic-format-detection}

データフォーマットが指定されておらず、ファイル拡張子から判別できない場合、ClickHouseはその内容に基づいてファイルフォーマットを検出しようとします。

**例：**

データが次の内容を持っているとしましょう：
```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

形式または構造を指定せずにこのファイルを検査およびクエリすることができます：
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
ClickHouseは一部の形式しか検出できず、この検出には時間がかかるため、常に明示的に形式を指定する方が良いです。
:::
