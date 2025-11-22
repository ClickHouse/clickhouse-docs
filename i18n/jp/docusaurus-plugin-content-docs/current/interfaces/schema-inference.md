---
description: 'ClickHouse における入力データからの自動スキーマ推論について説明するページ'
sidebar_label: 'スキーマ推論'
slug: /interfaces/schema-inference
title: '入力データからの自動スキーマ推論'
doc_type: 'reference'
---

ClickHouse は、サポートされているほぼすべての [入力フォーマット](formats.md) において、入力データの構造を自動的に判別できます。
このドキュメントでは、スキーマ推論がいつ使用されるのか、さまざまな入力フォーマットでどのように動作するのか、およびどの設定で制御できるかについて説明します。



## 使用方法 {#usage}

スキーマ推論は、ClickHouseが特定のデータ形式でデータを読み取る必要があるものの、その構造が不明な場合に使用されます。


## テーブル関数 [file](../sql-reference/table-functions/file.md)、[s3](../sql-reference/table-functions/s3.md)、[url](../sql-reference/table-functions/url.md)、[hdfs](../sql-reference/table-functions/hdfs.md)、[azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md) {#table-functions-file-s3-url-hdfs-azureblobstorage}

これらのテーブル関数には、入力データの構造を指定するオプション引数 `structure` があります。この引数が指定されていない場合、または `auto` に設定されている場合、データから構造が推測されます。

**例:**

`user_files` ディレクトリに、次の内容を持つ JSONEachRow 形式のファイル `hobbies.jsonl` があるとします:

```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouse は構造を指定せずにこのデータを読み取ることができます:

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

注: フォーマット `JSONEachRow` はファイル拡張子 `.jsonl` から自動的に判定されました。

`DESCRIBE` クエリを使用して、自動的に判定された構造を確認できます:

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

`CREATE TABLE`クエリでカラムリストが指定されていない場合、テーブル構造はデータから自動的に推測されます。

**例:**

ファイル`hobbies.jsonl`を使用してみましょう。このファイルのデータを使って、`File`エンジンでテーブルを作成できます:

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

`clickhouse-local`には、入力データの構造を指定するオプションパラメータ`-S/--structure`があります。このパラメータが指定されていない場合、または`auto`に設定されている場合、構造はデータから自動的に推測されます。

**例:**

ファイル`hobbies.jsonl`を使用してみましょう。`clickhouse-local`を使用して、このファイルからデータをクエリできます:

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


## 挿入先テーブルの構造を使用する {#using-structure-from-insertion-table}

テーブル関数 `file/s3/url/hdfs` を使用してテーブルにデータを挿入する際、データから構造を抽出する代わりに、挿入先テーブルの構造を使用するオプションがあります。
スキーマ推論には時間がかかる場合があるため、これにより挿入パフォーマンスを向上させることができます。また、テーブルが最適化されたスキーマを持つ場合にも有用で、型変換が実行されません。

この動作を制御する特別な設定 [use_structure_from_insertion_table_in_table_functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions) があります。この設定には3つの値があります:

- 0 - テーブル関数はデータから構造を抽出します。
- 1 - テーブル関数は挿入先テーブルの構造を使用します。
- 2 - ClickHouseは挿入先テーブルの構造を使用できるか、スキーマ推論を使用するかを自動的に判断します。デフォルト値です。

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

そして、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

この場合、ファイルのすべての列が変更なしでテーブルに挿入されるため、ClickHouseはスキーマ推論の代わりに挿入先テーブルの構造を使用します。

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

そして、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリのすべての列がテーブルに存在するため、ClickHouseは挿入先テーブルの構造を使用します。
これは、JSONEachRow、TSKV、Parquetなど、列のサブセットの読み取りをサポートする入力フォーマットでのみ機能することに注意してください(例えば、TSVフォーマットでは機能しません)。

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

そして、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリで列 `id` が使用されていますが、テーブルにはこの列が存在しません(`identifier` という名前の列があります)。そのため、ClickHouseは挿入先テーブルの構造を使用できず、スキーマ推論が使用されます。

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

そして、ファイル `hobbies.jsonl` からデータを挿入します:

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

この場合、テーブルに挿入するために `SELECT` クエリで列 `hobbies` に対して操作が実行されているため、ClickHouseは挿入先テーブルの構造を使用できず、スキーマ推論が使用されます。


## スキーマ推論キャッシュ {#schema-inference-cache}

ほとんどの入力形式では、スキーマ推論がデータ構造を判定するために一部のデータを読み取りますが、この処理には時間がかかることがあります。
ClickHouseが同じファイルからデータを読み取るたびに同じスキーマを推論することを防ぐため、推論されたスキーマはキャッシュされ、同じファイルに再度アクセスする際には、ClickHouseはキャッシュからスキーマを使用します。

このキャッシュを制御する特別な設定があります:

- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 対応するテーブル関数でキャッシュされるスキーマの最大数。デフォルト値は`4096`です。これらの設定はサーバー設定ファイルで指定する必要があります。
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - スキーマ推論のキャッシュ使用を有効/無効にします。これらの設定はクエリ内で使用できます。

ファイルのスキーマは、データの変更または形式設定の変更によって変わる可能性があります。
このため、スキーマ推論キャッシュは、ファイルソース、形式名、使用された形式設定、およびファイルの最終更新時刻によってスキーマを識別します。

注意: `url`テーブル関数でURLによってアクセスされる一部のファイルには、最終更新時刻の情報が含まれていない場合があります。このような場合のために、特別な設定
`schema_inference_cache_require_modification_time_for_url`があります。この設定を無効にすると、そのようなファイルに対して最終更新時刻なしでキャッシュからスキーマを使用できます。

また、キャッシュ内のすべての現在のスキーマを含むシステムテーブル[schema_inference_cache](../operations/system-tables/schema_inference_cache.md)と、すべてのソースまたは特定のソースのスキーマキャッシュをクリアするシステムクエリ`SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]`があります。

**例:**

S3のサンプルデータセット`github-2022.ndjson.gz`の構造を推論し、スキーマ推論キャッシュがどのように機能するかを見てみましょう:


```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
```

```response
┌─name───────┬─type─────────────────────────────────────────┐
│ type       │ Nullable(String)                             │
│ actor      │ Tuple(                                      ↴│
│            │↳    avatar_url Nullable(String),            ↴│
│            │↳    display_login Nullable(String),         ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    login Nullable(String),                 ↴│
│            │↳    url Nullable(String))                    │
│ repo       │ Tuple(                                      ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    name Nullable(String),                  ↴│
│            │↳    url Nullable(String))                    │
│ created_at │ Nullable(String)                             │
│ payload    │ Tuple(                                      ↴│
│            │↳    action Nullable(String),                ↴│
│            │↳    distinct_size Nullable(Int64),          ↴│
│            │↳    pull_request Tuple(                     ↴│
│            │↳        author_association Nullable(String),↴│
│            │↳        base Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        head Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        number Nullable(Int64),             ↴│
│            │↳        state Nullable(String),             ↴│
│            │↳        title Nullable(String),             ↴│
│            │↳        updated_at Nullable(String),        ↴│
│            │↳        user Tuple(                         ↴│
│            │↳            login Nullable(String))),       ↴│
│            │↳    ref Nullable(String),                   ↴│
│            │↳    ref_type Nullable(String),              ↴│
│            │↳    size Nullable(Int64))                    │
└────────────┴──────────────────────────────────────────────┘
5行を取得しました。経過時間: 0.601秒
```

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
```

```response
┌─name───────┬─type─────────────────────────────────────────┐
│ type       │ Nullable(String)                             │
│ actor      │ Tuple(                                      ↴│
│            │↳    avatar_url Nullable(String),            ↴│
│            │↳    display_login Nullable(String),         ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    login Nullable(String),                 ↴│
│            │↳    url Nullable(String))                    │
│ repo       │ Tuple(                                      ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    name Nullable(String),                  ↴│
│            │↳    url Nullable(String))                    │
│ created_at │ Nullable(String)                             │
│ payload    │ Tuple(                                      ↴│
│            │↳    action Nullable(String),                ↴│
│            │↳    distinct_size Nullable(Int64),          ↴│
│            │↳    pull_request Tuple(                     ↴│
│            │↳        author_association Nullable(String),↴│
│            │↳        base Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        head Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        number Nullable(Int64),             ↴│
│            │↳        state Nullable(String),             ↴│
│            │↳        title Nullable(String),             ↴│
│            │↳        updated_at Nullable(String),        ↴│
│            │↳        user Tuple(                         ↴│
│            │↳            login Nullable(String))),       ↴│
│            │↳    ref Nullable(String),                   ↴│
│            │↳    ref_type Nullable(String),              ↴│
│            │↳    size Nullable(Int64))                    │
└────────────┴──────────────────────────────────────────────┘
```

5 行が返されました。経過時間: 0.059 秒。

````

ご覧のとおり、2回目のクエリはほぼ瞬時に成功しました。

推論されるスキーマに影響を与える可能性のある設定を変更してみましょう:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS input_format_json_try_infer_named_tuples_from_objects=0, input_format_json_read_objects_as_strings = 1

┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String) │              │                    │         │                  │                │
│ actor      │ Nullable(String) │              │                    │         │                  │                │
│ repo       │ Nullable(String) │              │                    │         │                  │                │
│ created_at │ Nullable(String) │              │                    │         │                  │                │
│ payload    │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.611 sec
````

ご覧のとおり、推論されるスキーマに影響し得る設定が変更されたため、同じファイルに対してはキャッシュされたスキーマは使用されませんでした。

`system.schema_inference_cache` テーブルの内容を確認しましょう：

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```

```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Tuple(avatar_url Nullable(String), display_login Nullable(String), id Nullable(Int64), login Nullable(String), url Nullable(String)), repo Tuple(id Nullable(Int64), name Nullable(String), url Nullable(String)), created_at Nullable(String), payload Tuple(action Nullable(String), distinct_size Nullable(Int64), pull_request Tuple(author_association Nullable(String), base Tuple(ref Nullable(String), sha Nullable(String)), head Tuple(ref Nullable(String), sha Nullable(String)), number Nullable(Int64), state Nullable(String), title Nullable(String), updated_at Nullable(String), user Tuple(login Nullable(String))), ref Nullable(String), ref_type Nullable(String), size Nullable(Int64)) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

ご覧のとおり、同じファイルに対して 2 種類の異なるスキーマが存在します。

システムクエリを使ってスキーマキャッシュをクリアできます。

```sql
SYSTEM DROP SCHEMA CACHE FOR S3
```

```response
OK。
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

テキスト形式の場合、ClickHouseはデータを行ごとに読み取り、形式に従ってカラム値を抽出した後、
再帰的パーサーとヒューリスティックを使用して各値の型を判定します。スキーマ推論においてデータから読み取る行数とバイト数の最大値は、
設定`input_format_max_rows_to_read_for_schema_inference`(デフォルトは25000)と`input_format_max_bytes_to_read_for_schema_inference`(デフォルトは32Mb)によって制御されます。
デフォルトでは、推論されたすべての型は[Nullable](../sql-reference/data-types/nullable.md)ですが、`schema_inference_make_columns_nullable`を設定することで変更できます([settings](#settings-for-text-formats)セクションの例を参照)。

### JSON形式 {#json-formats}

JSON形式では、ClickHouseはJSON仕様に従って値を解析し、それらに最も適したデータ型を見つけます。

JSON形式における動作の仕組み、推論可能な型、および使用可能な特定の設定について見ていきましょう。

**例**

以降の例では、[format](../sql-reference/table-functions/format.md)テーブル関数を使用します。

整数、浮動小数点数、真偽値、文字列:

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

日付、日時:

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

配列に`null`が含まれている場合、ClickHouseは他の配列要素から型を使用します:

```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```

```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


ある配列に異なる型の値が含まれており、かつ `input_format_json_infer_array_of_dynamic_from_array_of_different_types` 設定が有効な場合（デフォルトで有効）、その配列の型は `Array(Dynamic)` になります。

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

`input_format_json_try_infer_named_tuples_from_objects` 設定を有効にすると、スキーマ推論を行う際に ClickHouse は JSON オブジェクトから名前付き Tuple を推論しようとします。
生成される名前付き Tuple には、サンプルデータ内の該当するすべての JSON オブジェクトに含まれるすべての要素が含まれます。

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Unnamed タプル:

`input_format_json_infer_array_of_dynamic_from_array_of_different_types` 設定が無効になっている場合、異なる型の要素を含む Array は、JSON フォーマットにおいて Unnamed タプルとして扱われます。

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

一部の値が `null` または空の場合は、他の行の対応する値の型が使用されます。

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

Maps:

JSON では、値が Map 型と同じ型であるオブジェクトを Map 型として読み取ることができます。
注意: これは、設定 `input_format_json_read_objects_as_strings` および `input_format_json_try_infer_named_tuples_from_objects` が無効になっている場合にのみ機能します。


```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```

```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた複合型:

```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

データにnull/空のオブジェクト/空の配列のみが含まれているためにClickHouseが特定のキーの型を判定できない場合、設定`input_format_json_infer_incomplete_types_as_strings`が有効であれば`String`型が使用され、そうでなければ例外がスローされます:

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

この設定を有効にすると、文字列値から数値を推論できます。

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

この設定を有効にすると、JSONオブジェクトから名前付きタプルを推論できます。結果として得られる名前付きタプルには、サンプルデータ内の対応するすべてのJSONオブジェクトからのすべての要素が含まれます。
JSONデータが疎でない場合に有用で、データのサンプルにすべての可能なオブジェクトキーが含まれます。

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
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │ │ │ │ │ │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

この設定を有効にすると、JSONオブジェクトから名前付きタプルを推論する際（`input_format_json_try_infer_named_tuples_from_objects`が有効な場合）、例外をスローする代わりに曖昧なパスに対してString型を使用できます。
これにより、曖昧なパスが存在する場合でも、JSONオブジェクトを名前付きタプルとして読み取ることが可能になります。

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
DESC format(JSONEachRow, '{"obj" : "a" : 42}, {"obj" : {"a" : {"b" : "Hello"}}}');
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

この設定を有効にすると、ネストされたJSONオブジェクトを文字列として読み取ることができます。
この設定を使用することで、JSONオブジェクト型を使用せずにネストされたJSONオブジェクトを読み取ることが可能です。

この設定はデフォルトで有効です。

注意: この設定は、`input_format_json_try_infer_named_tuples_from_objects`設定が無効になっている場合にのみ有効になります。


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

この設定を有効にすると、数値を文字列として読み取ることができます。

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

この設定を有効にすると、Bool値を数値として読み取ることができます。

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

この設定を有効にすると、Bool値を文字列として読み取ることができます。

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

この設定を有効にすると、JSON配列の値を文字列として読み取ることができます。

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


この設定を有効にすると、スキーマ推論時にデータサンプル内で`Null`/`{}`/`[]`のみを含むJSONキーに対してString型を使用できます。
JSON形式では、対応するすべての設定が有効な場合(デフォルトではすべて有効)、任意の値をStringとして読み取ることができます。型が不明なキーに対してString型を使用することで、スキーマ推論時に`Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps`のようなエラーを回避できます。

例:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

結果:

```markdown
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │ │ │ │ │ │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

### CSV {#csv}

CSV形式では、ClickHouseは区切り文字に従って行から列の値を抽出します。ClickHouseは、数値と文字列を除くすべての型が二重引用符で囲まれていることを想定しています。値が二重引用符で囲まれている場合、ClickHouseは再帰パーサーを使用して引用符内のデータを解析し、最も適切なデータ型を見つけようとします。値が二重引用符で囲まれていない場合、ClickHouseはそれを数値として解析しようとし、数値でない場合は文字列として扱います。

パーサーやヒューリスティックを使用して複雑な型を判定させたくない場合は、`input_format_csv_use_best_effort_in_schema_inference`設定を無効にすることで、ClickHouseはすべての列をStringとして扱います。

`input_format_csv_detect_header`設定が有効な場合、ClickHouseはスキーマ推論時に列名(および場合によっては型)を含むヘッダーを検出しようとします。この設定はデフォルトで有効です。

**例:**

整数、浮動小数点数、真偽値、文字列:

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

日付、日時:


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

配列に `null` が含まれている場合、ClickHouse は他の配列要素から型を決定します。

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


引用符内のデータにnullのみが含まれているため、ClickHouseが型を判定できない場合、ClickHouseはそれをStringとして扱います:

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

ヘッダー自動検出の例(`input_format_csv_detect_header`が有効な場合):

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

ヘッダーは、String型以外の型を持つ列が少なくとも1つ存在する場合にのみ検出されることに注意してください。すべての列がString型の場合、ヘッダーは検出されません:

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

この設定を有効にすると、文字列値から数値を推論できます。

この設定はデフォルトで無効になっています。

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

TSV/TSKV形式では、ClickHouseは表形式の区切り文字に従って行から列値を抽出し、再帰的パーサーを使用して抽出された値を解析することで、最も適切な型を決定します。型を決定できない場合、ClickHouseはこの値をString型として扱います。

パーサーやヒューリスティックを使用して複雑な型を決定することをClickHouseに試行させたくない場合は、`input_format_tsv_use_best_effort_in_schema_inference`設定を無効にすることができます。これにより、ClickHouseはすべての列をString型として扱います。

`input_format_tsv_detect_header`設定が有効になっている場合、ClickHouseはスキーマ推論時に列名(および場合によっては型)を含むヘッダーの検出を試みます。この設定はデフォルトで有効になっています。

**例:**

整数、浮動小数点数、真偽値、文字列:

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

日付、日時:

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

配列に `null` が含まれている場合、ClickHouse は他の配列要素から型を決定します。

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


ClickHouseがデータ型を判定できない場合(データにnullのみが含まれている場合)、ClickHouseはそれをStringとして扱います:

```sql
DESC format(TSV, '[NULL, NULL]')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

設定`input_format_tsv_use_best_effort_in_schema_inference`を無効にした場合の例:

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

ヘッダー自動検出の例(`input_format_tsv_detect_header`が有効な場合):

名前のみ:

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

名前と型:

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

注意: ヘッダーが検出されるのは、String型以外の型を持つ列が少なくとも1つ存在する場合のみです。すべての列がString型の場合、ヘッダーは検出されません:

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

### Values {#values}

Values形式では、ClickHouseは行から列の値を抽出し、リテラルの解析と同様の再帰的パーサーを使用して解析します。

**例:**


整数、浮動小数点数、ブール値、文字列：

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

日付と日時：

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

配列に `null` が含まれている場合、ClickHouse は他の配列要素の型に基づいて型を決定します。

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

マップ：

```sql
DESC format(Values, $$({'key1' : 42, 'key2' : 24})$$)
```

```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


ネストされた配列、タプル、マップ:

```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```

```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

データにnullのみが含まれているためClickHouseが型を判定できない場合、例外がスローされます:

```sql
DESC format(Values, '([NULL, NULL])')
```

```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
最初の1行のデータからカラム'c1'の型を判定できません。
このカラムにはNullまたは空の配列/マップのみが含まれている可能性が高いです。
...
```

設定`input_format_tsv_use_best_effort_in_schema_inference`を無効にした例:

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

### CustomSeparated {#custom-separated}

CustomSeparated形式では、ClickHouseはまず指定された区切り文字に従って行からすべてのカラム値を抽出し、次にエスケープルールに従って各値のデータ型を推論しようとします。

設定`input_format_custom_detect_header`が有効な場合、ClickHouseはスキーマ推論時にカラム名(および場合によっては型)を含むヘッダーの検出を試みます。この設定はデフォルトで有効です。

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

ヘッダー自動検出の例(`input_format_custom_detect_header`が有効な場合):


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

Template形式では、ClickHouseはまず指定されたテンプレートに従って行からすべての列値を抽出し、次に各値のエスケープルールに従ってデータ型を推論しようとします。

**例**

以下の内容を持つファイル`resultset`があるとします:

```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

そして、以下の内容を持つファイル`row_format`があるとします:

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

この場合、以下のクエリを実行できます:

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

Templateと同様に、Regexp形式では、ClickHouseはまず指定された正規表現に従って行からすべての列値を抽出し、次に指定されたエスケープルールに従って各値のデータ型を推論しようとします。

**例**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'

```


DESC format(Regexp, $$Line: value_1=42, value_2="Some string 1", value_3="[1, NULL, 3]"
Line: value_1=2, value_2="Some string 2", value_3="[4, 5, NULL]"$$)

````
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
````

### テキストフォーマットの設定 {#settings-for-text-formats}

#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference {#input-format-max-rows-to-read-for-schema-inference}

これらの設定は、スキーマ推論時に読み取るデータ量を制御します。
読み取る行数/バイト数が多いほど、スキーマ推論に要する時間は長くなりますが、型を正しく判定できる可能性が高まります（特にデータに多数のnullが含まれる場合）。

デフォルト値:

- `25000` for `input_format_max_rows_to_read_for_schema_inference`.
- `33554432` (32 Mb) for `input_format_max_bytes_to_read_for_schema_inference`.

#### column_names_for_schema_inference {#column-names-for-schema-inference}

明示的なカラム名を持たないフォーマットのスキーマ推論で使用するカラム名のリストです。指定された名前は、デフォルトの `c1,c2,c3,...` の代わりに使用されます。形式: `column1,column2,column3,...`

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

自動判定された型の代わりにスキーマ推論で使用するカラム名と型のリストです。形式: 'column_name1 column_type1, column_name2 column_type2, ...'
この設定は、自動判定できなかったカラムの型を指定する場合や、スキーマを最適化する場合に使用できます。

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


NULL 可能性に関する情報を持たないフォーマットに対するスキーマ推論で、推論された型を `Nullable` にするかどうかを制御します。取りうる値は次のとおりです。

* 0 - 推論された型は一切 `Nullable` にはなりません。
* 1 - すべての推論された型が `Nullable` になります。
* 2 または &#39;auto&#39; - テキストフォーマットでは、スキーマ推論中に解析されるサンプル内で、その列に `NULL` が含まれている場合にのみ、その列の推論された型は `Nullable` になります。強く型付けされたフォーマット（Parquet、ORC、Arrow）の場合は、NULL 可能性に関する情報はファイルメタデータから取得されます。
* 3 - テキストフォーマットでは `Nullable` を使用し、強く型付けされたフォーマットではファイルメタデータを使用します。

デフォルト: 3。

**例**

```sql
SET schema_inference_make_columns_nullable = 1;
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
この設定は`JSON`データ型には適用されません。
:::

有効にすると、ClickHouseはテキスト形式のスキーマ推論において、浮動小数点数ではなく整数を推論しようとします。
サンプルデータの列内のすべての数値が整数である場合、結果の型は`Int64`になります。少なくとも1つの数値が浮動小数点数である場合、結果の型は`Float64`になります。
サンプルデータに整数のみが含まれ、かつ少なくとも1つの整数が正の値で`Int64`をオーバーフローする場合、ClickHouseは`UInt64`を推論します。

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

有効にすると、ClickHouseはテキスト形式のスキーマ推論において、文字列フィールドから`DateTime`または`DateTime64`型を推論しようとします。
サンプルデータの列内のすべてのフィールドが日時として正常に解析された場合、結果の型は`DateTime`または`DateTime64(9)`(いずれかの日時に小数部分がある場合)になります。
少なくとも1つのフィールドが日時として解析されなかった場合、結果の型は`String`になります。

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

有効にすると、`input_format_try_infer_datetimes`が有効な場合、datetime値に小数部分が含まれていない場合でも、ClickHouseは常に`DateTime64(9)`を推論します。

デフォルトでは無効です。

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

注意: スキーマ推論中のdatetimeの解析は、設定[date_time_input_format](/operations/settings/settings-formats.md#date_time_input_format)に準拠します。


#### input_format_try_infer_dates {#input-format-try-infer-dates}

有効にすると、ClickHouseはテキスト形式のスキーマ推論において、文字列フィールドから`Date`型の推論を試みます。
サンプルデータ内のカラムのすべてのフィールドが日付として正常に解析された場合、結果の型は`Date`になります。
少なくとも1つのフィールドが日付として解析されなかった場合、結果の型は`String`になります。

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

有効にすると、ClickHouseはテキスト形式において指数表記の浮動小数点数の推論を試みます(指数表記の数値が常に推論されるJSONを除く)。

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


## 自己記述型フォーマット {#self-describing-formats}

自己記述型フォーマットは、データ自体の中にデータ構造に関する情報を含んでいます。
これは、説明を含むヘッダー、バイナリ型ツリー、または何らかのテーブルの形式を取ることができます。
このようなフォーマットのファイルからスキーマを自動的に推論するために、ClickHouseは型に関する情報を含むデータの一部を読み取り、それをClickHouseテーブルのスキーマに変換します。

### -WithNamesAndTypes接尾辞を持つフォーマット {#formats-with-names-and-types}

ClickHouseは-WithNamesAndTypesという接尾辞を持ついくつかのテキストフォーマットをサポートしています。この接尾辞は、実際のデータの前に列名と型を含む2つの追加行がデータに含まれていることを意味します。
このようなフォーマットのスキーマ推論では、ClickHouseは最初の2行を読み取り、列名と型を抽出します。

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

### メタデータを含むJSONフォーマット {#json-with-metadata}

一部のJSON入力フォーマット（[JSON](/interfaces/formats/JSON)、[JSONCompact](/interfaces/formats/JSONCompact)、[JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)）には、列名と型を含むメタデータが含まれています。
このようなフォーマットのスキーマ推論では、ClickHouseはこのメタデータを読み取ります。

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

Avroフォーマットでは、ClickHouseはデータからスキーマを読み取り、以下の型マッピングを使用してClickHouseスキーマに変換します。


| Avroデータ型                     | ClickHouseデータ型                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `boolean`                          | [Bool](../sql-reference/data-types/boolean.md)                                 |
| `int`                              | [Int32](../sql-reference/data-types/int-uint.md)                               |
| `int (date)` \*                    | [Date32](../sql-reference/data-types/date32.md)                                |
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
| `binary (decimal)` \*              | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                        |

\* [Avro論理型](https://avro.apache.org/docs/current/spec.html#Logical+Types)

その他のAvro型はサポートされていません。

### Parquet {#parquet}

Parquet形式では、ClickHouseはデータからスキーマを読み取り、以下の型マッピングを使用してClickHouseスキーマに変換します:

| Parquetデータ型            | ClickHouseデータ型                                    |
| ---------------------------- | ------------------------------------------------------- |
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

その他のParquet型はサポートされていません。

### Arrow {#arrow}

Arrow形式では、ClickHouseはデータからスキーマを読み取り、以下の型マッピングを使用してClickHouseスキーマに変換します:


| Arrowデータ型                 | ClickHouseデータ型                                    |
| ------------------------------- | ------------------------------------------------------- |
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

その他のArrow型はサポートされていません。

### ORC {#orc}

ORC形式では、ClickHouseはデータからスキーマを読み取り、以下の型マッピングを使用してClickHouseスキーマに変換します:

| ORCデータ型                        | ClickHouseデータ型                                    |
| ------------------------------------ | ------------------------------------------------------- |
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

その他のORC型はサポートされていません。

### Native {#native}

Native形式はClickHouse内部で使用され、データ内にスキーマが含まれています。
スキーマ推論では、ClickHouseは変換を行わずにデータからスキーマを直接読み取ります。


## 外部スキーマを使用するフォーマット {#formats-with-external-schema}

これらのフォーマットでは、特定のスキーマ言語で記述されたデータを説明するスキーマを別ファイルで必要とします。
このようなフォーマットのファイルからスキーマを自動的に推論するために、ClickHouseは別ファイルから外部スキーマを読み取り、それをClickHouseテーブルスキーマに変換します。

### Protobuf {#protobuf}

Protobufフォーマットのスキーマ推論において、ClickHouseは以下の型マッピングを使用します:

| Protobufデータ型              | ClickHouseデータ型                                |
| ----------------------------- | ------------------------------------------------- |
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

CapnProtoフォーマットのスキーマ推論において、ClickHouseは以下の型マッピングを使用します:

| CapnProtoデータ型                  | ClickHouseデータ型                                     |
| ---------------------------------- | ------------------------------------------------------ |
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


## 強く型付けされたバイナリ形式 {#strong-typed-binary-formats}

このような形式では、シリアライズされた各値にその型(および場合によっては名前)に関する情報が含まれますが、テーブル全体に関する情報はありません。
このような形式のスキーマ推論では、ClickHouseはデータを行ごとに(最大`input_format_max_rows_to_read_for_schema_inference`行または`input_format_max_bytes_to_read_for_schema_inference`バイトまで)読み取り、データから各値の型(および場合によっては名前)を抽出し、これらの型をClickHouseの型に変換します。

### MsgPack {#msgpack}

MsgPack形式では行間に区切り文字がないため、この形式でスキーマ推論を使用するには、設定`input_format_msgpack_number_of_columns`を使用してテーブルの列数を指定する必要があります。ClickHouseは以下の型マッピングを使用します:

| MessagePackデータ型(`INSERT`)                                   | ClickHouseデータ型                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| `int N`, `uint N`, `negative fixint`, `positive fixint`            | [Int64](../sql-reference/data-types/int-uint.md)      |
| `bool`                                                             | [UInt8](../sql-reference/data-types/int-uint.md)      |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [String](../sql-reference/data-types/string.md)       |
| `float 32`                                                         | [Float32](../sql-reference/data-types/float.md)       |
| `float 64`                                                         | [Float64](../sql-reference/data-types/float.md)       |
| `uint 16`                                                          | [Date](../sql-reference/data-types/date.md)           |
| `uint 32`                                                          | [DateTime](../sql-reference/data-types/datetime.md)   |
| `uint 64`                                                          | [DateTime64](../sql-reference/data-types/datetime.md) |
| `fixarray`, `array 16`, `array 32`                                 | [Array](../sql-reference/data-types/array.md)         |
| `fixmap`, `map 16`, `map 32`                                       | [Map](../sql-reference/data-types/map.md)             |

デフォルトでは、推論されたすべての型は`Nullable`内に配置されますが、設定`schema_inference_make_columns_nullable`を使用して変更できます。

### BSONEachRow {#bsoneachrow}

BSONEachRowでは、データの各行がBSONドキュメントとして表現されます。スキーマ推論では、ClickHouseはBSONドキュメントを1つずつ読み取り、データから値、名前、型を抽出し、以下の型マッピングを使用してこれらの型をClickHouseの型に変換します:

| BSON型                                                                                     | ClickHouse型                                                                                                             |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                              |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                             |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                     |
| `\x05` binary with `\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                             |
| `\x07` ObjectId,                                                                              | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                               |
| `\x05` binary with `\x04` uuid subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                                 |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md)(ネストされた型が異なる場合) |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md)(文字列キーを使用)            |

デフォルトでは、推論されたすべての型は`Nullable`内に配置されますが、設定`schema_inference_make_columns_nullable`を使用して変更できます。


## 固定スキーマを持つフォーマット {#formats-with-constant-schema}

このようなフォーマットのデータは常に同じスキーマを持ちます。

### LineAsString {#line-as-string}

このフォーマットでは、ClickHouseはデータから行全体を読み取り、`String`データ型の単一カラムに格納します。このフォーマットで推論される型は常に`String`であり、カラム名は`line`です。

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

このフォーマットでは、ClickHouseはデータからJSONオブジェクト全体を読み取り、`String`データ型の単一カラムに格納します。このフォーマットで推論される型は常に`String`であり、カラム名は`json`です。

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

このフォーマットでは、ClickHouseはデータからJSONオブジェクト全体を読み取り、`JSON`データ型の単一カラムに格納します。このフォーマットで推論される型は常に`JSON`であり、カラム名は`json`です。

**例**

```sql
DESC format(JSONAsObject, '{"x" : 42, "y" : "Hello, World!"}');
```

```response
┌─name─┬─type─┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ JSON │              │                    │         │                  │                │
└──────┴──────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


## スキーマ推論モード {#schema-inference-modes}

データファイルのセットからのスキーマ推論は、`default`と`union`の2つの異なるモードで動作します。
モードは`schema_inference_mode`設定で制御されます。

### デフォルトモード {#default-schema-inference-mode}

デフォルトモードでは、ClickHouseはすべてのファイルが同じスキーマを持つと仮定し、成功するまでファイルを1つずつ読み取ってスキーマを推論します。

例:

次の内容を持つ3つのファイル`data1.jsonl`、`data2.jsonl`、`data3.jsonl`があるとします:

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

これら3つのファイルに対してスキーマ推論を使用してみましょう:

```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='default'
```

結果:

```response
┌─name───┬─type─────────────┐
│ field1 │ Nullable(Int64)  │
│ field2 │ Nullable(String) │
└────────┴──────────────────┘
```

ご覧のとおり、ファイル`data3.jsonl`の`field3`が含まれていません。
これは、ClickHouseが最初にファイル`data1.jsonl`からスキーマを推論しようとしましたが、フィールド`field2`がすべてnullであったため失敗し、
次に`data2.jsonl`からスキーマを推論して成功したため、ファイル`data3.jsonl`のデータが読み取られなかったためです。

### ユニオンモード {#default-schema-inference-mode-1}

ユニオンモードでは、ClickHouseはファイルが異なるスキーマを持つ可能性があると仮定し、すべてのファイルのスキーマを推論してから、それらを共通のスキーマに統合します。

Let's say we have 3 files `data1.jsonl`, `data2.jsonl` and `data3.jsonl` with the next content:

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

これら3つのファイルに対してスキーマ推論を使用してみましょう:

```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='union'
```

結果:

```response
┌─name───┬─type───────────────────┐
│ field1 │ Nullable(Int64)        │
│ field2 │ Nullable(String)       │
│ field3 │ Array(Nullable(Int64)) │
└────────┴────────────────────────┘
```

ご覧のとおり、すべてのファイルからすべてのフィールドが含まれています。

注意:

- 一部のファイルには結果のスキーマの一部のカラムが含まれていない可能性があるため、ユニオンモードはカラムのサブセットの読み取りをサポートする形式(JSONEachRow、Parquet、TSVWithNamesなど)でのみサポートされ、他の形式(CSV、TSV、JSONCompactEachRowなど)では動作しません。
- ClickHouseがいずれかのファイルからスキーマを推論できない場合、例外がスローされます。
- 多数のファイルがある場合、それらすべてからスキーマを読み取るには多くの時間がかかる可能性があります。


## 自動フォーマット検出 {#automatic-format-detection}

データフォーマットが指定されておらず、ファイル拡張子からも判断できない場合、ClickHouseはファイルの内容からフォーマットの検出を試みます。

**例:**

次の内容を持つ`data`ファイルがあるとします:

```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

フォーマットや構造を指定せずに、このファイルを検査およびクエリすることができます:

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
ClickHouseは一部のフォーマットのみ検出可能であり、この検出処理には時間を要するため、フォーマットを明示的に指定することを推奨します。
:::
