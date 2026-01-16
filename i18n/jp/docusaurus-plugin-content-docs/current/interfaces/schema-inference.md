---
description: 'ClickHouse における入力データからの自動スキーマ推論について説明するページ'
sidebar_label: 'スキーマ推論'
slug: /interfaces/schema-inference
title: '入力データからの自動スキーマ推論'
doc_type: 'reference'
---

ClickHouse は、サポートされているほぼすべての[入力フォーマット](formats.md)において、入力データの構造を自動的に判定できます。
このドキュメントでは、スキーマ推論がいつ使用されるか、各種入力フォーマットでどのように動作するか、およびどの設定によって制御できるかについて説明します。

## 使用方法 \\{#usage\\}

スキーマ推論は、ClickHouse が特定のデータ形式でデータを読み取る必要があるものの、その構造が不明な場合に使用されます。

## テーブル関数 [file](../sql-reference/table-functions/file.md)、[s3](../sql-reference/table-functions/s3.md)、[url](../sql-reference/table-functions/url.md)、[hdfs](../sql-reference/table-functions/hdfs.md)、[azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md)。 \\{#table-functions-file-s3-url-hdfs-azureblobstorage\\}

これらのテーブル関数には、入力データの構造を表すオプションの引数 `structure` があります。この引数が指定されていないか、`auto` に設定されている場合は、構造がデータから自動的に推論されます。

**例:**

`user_files` ディレクトリ内に、次の内容を持つ JSONEachRow 形式のファイル `hobbies.jsonl` があるとします:

```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouse は、このデータの構造を事前に定義しなくても読み取ることができます。

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

注記: フォーマット `JSONEachRow` は、ファイル拡張子 `.jsonl` によって自動的に認識されました。

`DESCRIBE` クエリを使用して、自動的に認識された構造を確認できます。

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

## テーブルエンジン [File](../engines/table-engines/special/file.md)、[S3](../engines/table-engines/integrations/s3.md)、[URL](../engines/table-engines/special/url.md)、[HDFS](../engines/table-engines/integrations/hdfs.md)、[azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) \\{#table-engines-file-s3-url-hdfs-azureblobstorage\\}

`CREATE TABLE` クエリでカラムのリストを指定しない場合、テーブルの構造はデータから自動的に推論されます。

**例:**

ファイル `hobbies.jsonl` を使用するとします。このファイルのデータを使って、次のようにエンジン `File` のテーブルを作成できます。

```sql
CREATE TABLE hobbies ENGINE=File(JSONEachRow, 'hobbies.jsonl')
```

```response
OK
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

## clickhouse-local \\{#clickhouse-local\\}

`clickhouse-local` には、入力データの構造を指定するためのオプションのパラメータ `-S/--structure` があります。このパラメータが指定されていないか、`auto` に設定されている場合、構造はデータから自動的に推論されます。

**例:**

ファイル `hobbies.jsonl` を使ってみましょう。このファイルのデータは `clickhouse-local` を使ってクエリすることができます。

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

## 挿入先テーブルの構造を使用する \\{#using-structure-from-insertion-table\\}

テーブル関数 `file/s3/url/hdfs` を使用してテーブルにデータを挿入する場合、
データから構造を推論する代わりに、挿入先テーブルの構造を使用するオプションがあります。
スキーマ推論には時間がかかることがあるため、挿入性能を向上させることができます。また、テーブルに最適化されたスキーマが定義されている場合は、
型間の変換が発生しないため有用です。

この挙動を制御する専用の設定 [use&#95;structure&#95;from&#95;insertion&#95;table&#95;in&#95;table&#95;functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions)
があります。取り得る値は 3 つです:

* 0 - テーブル関数はデータから構造を抽出します。
* 1 - テーブル関数は挿入先テーブルの構造を使用します。
* 2 - ClickHouse は、挿入先テーブルの構造を使用できるか、スキーマ推論を使用する必要があるかを自動的に判断します。デフォルト値です。

**例 1:**

次の構造を持つテーブル `hobbies1` を作成します:

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

次に、ファイル `hobbies.jsonl` からデータを挿入します：

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

この場合、ファイルのすべての列が一切変更されることなくテーブルに挿入されるため、ClickHouse はスキーマ推論ではなく、挿入先テーブルの構造を使用します。

**例 2:**

次の構造を持つテーブル `hobbies2` を作成してみましょう：

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

`hobbies.jsonl` ファイルからデータを挿入します：

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリ内のすべての列がテーブル内に存在するため、ClickHouse は挿入先テーブルの構造を使用します。
なお、これは JSONEachRow、TSKV、Parquet などのように列のサブセットの読み取りをサポートする入力フォーマットでのみ機能します（したがって、たとえば TSV フォーマットでは動作しません）。

**例 3:**

次の構造を持つテーブル `hobbies3` を作成してみましょう。

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

次に、`hobbies.jsonl` ファイルからデータを挿入します：

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

この場合、`SELECT` クエリでは列 `id` が使用されていますが、テーブルにはこの列は存在せず（`identifier` という名前の列があります）、
ClickHouse は挿入テーブルの構造を使用できないため、スキーマ推論が行われます。

**例 4:**

次の構造でテーブル `hobbies4` を作成してみましょう：

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

次に、ファイル `hobbies.jsonl` からデータを挿入します。

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

この場合、テーブルに挿入するための `SELECT` クエリ内でカラム `hobbies` に対していくつかの操作が実行されているため、ClickHouse は挿入元テーブルの構造を利用できず、スキーマ推論が行われます。

## スキーマ推論キャッシュ \\{#schema-inference-cache\\}

ほとんどの入力フォーマットでは、スキーマ推論のために一部のデータを読み取り、その構造を判定しますが、この処理には一定の時間がかかります。
同じファイルからデータを読むたびに毎回同じスキーマを推論しないようにするため、推論されたスキーマはキャッシュされ、同じファイルへ再度アクセスする際には、ClickHouse はキャッシュからそのスキーマを利用します。

このキャッシュを制御するための専用設定があります:
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 対応するテーブル関数ごとにキャッシュできるスキーマの最大数を指定します。デフォルト値は `4096` です。これらの設定はサーバー構成で指定する必要があります。
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - スキーマ推論でキャッシュを使用するかどうかを切り替えます。これらの設定はクエリ内で使用できます。

ファイルのスキーマは、データを変更したり、フォーマット設定を変更したりすることで変わる可能性があります。
このため、スキーマ推論キャッシュは、ファイルのソース、フォーマット名、使用されたフォーマット設定、およびファイルの最終更新時刻によってスキーマを識別します。

注意: `url` テーブル関数で URL 経由でアクセスされる一部のファイルには、最終更新時刻に関する情報が含まれない場合があります。そのようなケースのために、特別な設定
`schema_inference_cache_require_modification_time_for_url` が用意されています。この設定を無効にすると、そのようなファイルについて最終更新時刻がなくてもキャッシュされたスキーマを使用できるようになります。

さらに、現在キャッシュされている全スキーマを保持しているシステムテーブル [schema_inference_cache](../operations/system-tables/schema_inference_cache.md) と、全ソースまたは特定ソースのスキーマキャッシュを削除できるシステムクエリ `SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]` があります。

**例:**

S3 上のサンプルデータセット `github-2022.ndjson.gz` の構造推論を試し、スキーマ推論キャッシュがどのように動作するか確認してみます:

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

5 行の結果セット。経過時間: 0.059 秒。

```

ご覧のとおり、2回目のクエリはほぼ瞬時に成功しました。

推論されるスキーマに影響を与える可能性のある設定を変更してみましょう。

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
```

ご覧のとおり、同じファイルに対してキャッシュからのスキーマは使用されていません。これは、推論されるスキーマに影響を与える設定が変更されたためです。

`system.schema_inference_cache` テーブルの内容を確認してみましょう：

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```

```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Tuple(avatar_url Nullable(String), display_login Nullable(String), id Nullable(Int64), login Nullable(String), url Nullable(String)), repo Tuple(id Nullable(Int64), name Nullable(String), url Nullable(String)), created_at Nullable(String), payload Tuple(action Nullable(String), distinct_size Nullable(Int64), pull_request Tuple(author_association Nullable(String), base Tuple(ref Nullable(String), sha Nullable(String)), head Tuple(ref Nullable(String), sha Nullable(String)), number Nullable(Int64), state Nullable(String), title Nullable(String), updated_at Nullable(String), user Tuple(login Nullable(String))), ref Nullable(String), ref_type Nullable(String), size Nullable(Int64)) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

ご覧のとおり、同じファイルに対して 2 つの異なるスキーマがあります。

システムクエリを使用してスキーマキャッシュをクリアできます。

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

テキスト形式では、ClickHouse はデータを 1 行ずつ読み取り、フォーマットに従ってカラム値を抽出し、その後、再帰的なパーサーとヒューリスティクスを用いて各値の型を判定します。スキーマ推論時にデータから読み取られる最大行数および最大バイト数は、設定 `input_format_max_rows_to_read_for_schema_inference`（デフォルト 25000）および `input_format_max_bytes_to_read_for_schema_inference`（デフォルト 32MB）によって制御されます。
デフォルトでは、推論された型はすべて [Nullable](../sql-reference/data-types/nullable.md) になりますが、`schema_inference_make_columns_nullable` を設定することでこれを変更できます（[settings](#settings-for-text-formats) セクションの例を参照）。

### JSON 形式 {#json-formats}

JSON 形式では、ClickHouse は JSON 仕様に従って値をパースし、その後、それぞれに最も適切なデータ型を推論しようとします。

ここでは、その動作の仕組み、推論可能な型、および JSON 形式で使用できる特定の設定について説明します。

**例**

この先の例では、[format](../sql-reference/table-functions/format.md) テーブル関数を使用します。

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

日付・日時:

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

配列に `null` が含まれている場合、ClickHouse は他の配列要素から型を推論します。

```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```

```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

配列に異なる型の値が含まれていて、`input_format_json_infer_array_of_dynamic_from_array_of_different_types` 設定が有効になっている場合（デフォルトで有効）、その配列は `Array(Dynamic)` 型になります。

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"arr" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Dynamic) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

名前付きタプル:

`input_format_json_try_infer_named_tuples_from_objects` 設定が有効な場合、スキーマ推論時に ClickHouse は JSON オブジェクトから名前付きタプルを推論しようとします。
生成される名前付きタプルには、サンプルデータ中の対応するすべての JSON オブジェクトに含まれるすべての要素が含まれます。

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

名前なしタプル:

`input_format_json_infer_array_of_dynamic_from_array_of_different_types` 設定が無効になっている場合、異なる型の要素を含む配列は、JSON 形式において名前なしタプルとして扱われます。

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

いくつかの値が `null` または空である場合は、他の行の対応する値の型を使用します。

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

マップ:

JSON から、値が Map 型の値と同じ型で揃っているオブジェクトを Map 型として読み取ることができます。
注意: これは、設定 `input_format_json_read_objects_as_strings` と `input_format_json_try_infer_named_tuples_from_objects` が無効になっている場合にのみ有効です。

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```

```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ネストされた複合型：

```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

あるキーについて、データが null／空オブジェクト／空配列のみを含んでいて ClickHouse が型を決定できない場合、設定 `input_format_json_infer_incomplete_types_as_strings` が有効であれば型 `String` が使用され、無効であれば例外がスローされます。

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
Code: 652. DB::Exception: localhost:9000から受信。DB::Exception:
最初の1行のデータから列'arr'の型を判定できません。
この列にはNullまたは空のArray/Mapのみが含まれている可能性があります。
...
```

#### JSON 設定 {#json-settings}

##### input&#95;format&#95;json&#95;try&#95;infer&#95;numbers&#95;from&#95;strings {#input_format_json_try_infer_numbers_from_strings}

この設定を有効にすると、文字列の値から数値を推論できるようになります。

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

##### input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects {#input_format_json_try_infer_named_tuples_from_objects}

この設定を有効にすると、JSON オブジェクトから名前付きタプルを推論できるようになります。生成される名前付きタプルには、サンプルデータ中の対応するすべての JSON オブジェクトに含まれる要素がすべて含まれます。
JSON データがスパースでない場合には、サンプルデータにあらゆるオブジェクトキーが含まれるため、とくに有用です。

この設定はデフォルトで有効になっています。

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

結果:

```markdown
┌─name──┬─type────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │              │                    │         │                  │                │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

##### input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

この設定を有効にすると、`input_format_json_try_infer_named_tuples_from_objects` が有効な場合に、JSON オブジェクトから named Tuple を推論する際、あいまいなパスに対して例外をスローする代わりに String 型を使用できるようになります。
これにより、パスにあいまいさがある JSON オブジェクトであっても、named Tuple として読み取ることができます。

デフォルトでは無効です。

**使用例**

設定を無効にした場合:

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

結果:

```response
コード: 636. DB::Exception: JSONEachRow形式ファイルからテーブル構造を抽出できません。エラー:
コード: 117. DB::Exception: JSONオブジェクトに曖昧なデータが含まれています: 一部のオブジェクトではパス 'a' の型が 'Int64' ですが、他のオブジェクトでは 'Tuple(b String)' です。パス 'a' にString型を使用するには、設定 input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects を有効化してください。(INCORRECT_DATA) (バージョン 24.3.1.1)。
構造は手動で指定することができます。(CANNOT_EXTRACT_TABLE_STRUCTURE)
```

この設定を有効にしている場合:

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

##### input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings {#input_format_json_read_objects_as_strings}

この設定を有効にすると、ネストされた JSON オブジェクトを文字列として読み取ることができます。
この設定を使用すると、JSON オブジェクト型を使用せずにネストされた JSON オブジェクトを読み取ることができます。

この設定はデフォルトで有効になっています。

注意: この設定の有効化は、設定 `input_format_json_try_infer_named_tuples_from_objects` が無効になっている場合にのみ効果があります。

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

##### input&#95;format&#95;json&#95;read&#95;numbers&#95;as&#95;strings {#input_format_json_read_numbers_as_strings}

この設定を有効にすると、数値を文字列として読み取ります。

この設定はデフォルトで有効になっています。

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

##### input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;numbers {#input_format_json_read_bools_as_numbers}

この設定を有効にすると、Bool 型の値を数値として読み取れるようになります。

この設定はデフォルトで有効になっています。

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

##### input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;strings {#input_format_json_read_bools_as_strings}

この設定を有効にすると、Bool 型の値を文字列として読み取ることができます。

この設定は既定で有効になっています。

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

##### input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings {#input_format_json_read_arrays_as_strings}

この設定を有効にすると、JSON 配列の値を文字列として読み取ります。

この設定は既定で有効になっています。

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

##### input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings {#input_format_json_infer_incomplete_types_as_strings}

この設定を有効にすると、スキーマ推論時に、サンプルデータ内で `Null`・`{}`・`[]` のみを含む JSON キーに `String` 型を使用できるようになります。
JSON フォーマットでは、関連する設定がすべて有効になっている場合（既定でいずれも有効）には、任意の値を String として読み取ることができるため、スキーマ推論時に `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` のようなエラーが発生する状況でも、型が不明なキーに対して String 型を使用することでこれを回避できます。

例:

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

CSV 形式では、ClickHouse は区切り文字に従って行から列の値を抽出します。ClickHouse は、数値と文字列以外のすべての型が二重引用符で囲まれていることを前提とします。値が二重引用符で囲まれている場合、ClickHouse は再帰パーサーを使って引用符内のデータを解析し、その値に最も適したデータ型を判定しようとします。値が二重引用符で囲まれていない場合、ClickHouse はそれを数値として解析しようとし、その値が数値でない場合は文字列として扱います。

ClickHouse にパーサーやヒューリスティクスを使って複雑な型を推定させたくない場合は、`input_format_csv_use_best_effort_in_schema_inference` 設定を無効化すると、ClickHouse はすべての列を String 型として扱います。

`input_format_csv_detect_header` 設定が有効な場合、ClickHouse はスキーマ推論時に、列名（および場合によっては型）を含むヘッダー行を検出しようとします。この設定はデフォルトで有効になっています。

**例:**

整数、浮動小数点数、ブール値、文字列:

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

引用符で囲まれていない文字列:

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

配列に null が含まれている場合、ClickHouse は他の配列要素の型に基づいて型を決定します。

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

データに null しか含まれず、引用符で囲まれた値の型を ClickHouse が判別できない場合、ClickHouse はそれを String 型として扱います。

```sql
DESC format(CSV, '"[NULL, NULL]"')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`input_format_csv_use_best_effort_in_schema_inference` 設定を無効化した場合の例:

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

`input_format_csv_detect_header` が有効な場合のヘッダー自動検出の例：

列名のみ：

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

ヘッダーが検出されるのは、少なくとも1つの列が String 以外の型である場合のみです。すべての列が String 型の場合、ヘッダーは検出されません。

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

##### input&#95;format&#95;csv&#95;try&#95;infer&#95;numbers&#95;from&#95;strings {#input_format_csv_try_infer_numbers_from_strings}

この設定を有効にすると、文字列の値から数値を推論できるようになります。

この設定は既定では無効です。

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

TSV/TSKV 形式では、ClickHouse はタブ区切りに従って行から列の値を抽出し、その後、再帰パーサーを使って抽出した値を解析し、最も適切な型を決定します。型を決定できない場合、ClickHouse はこの値を String として扱います。

ClickHouse に一部のパーサーやヒューリスティックを用いた複雑な型の推論を行わせたくない場合は、`input_format_tsv_use_best_effort_in_schema_inference`
設定を無効にしてください。そうすると ClickHouse はすべての列を String として扱います。

`input_format_tsv_detect_header` 設定が有効な場合、ClickHouse はスキーマ推論時に、列名（および場合によっては型）を含むヘッダーを検出しようとします。この設定はデフォルトで有効です。

**例:**

整数、浮動小数点数、ブール値、文字列:

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

Date 型、DateTime 型：

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

配列に null が含まれている場合、ClickHouse は他の要素から型を決定します。

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

データに null しか含まれておらず、ClickHouse が型を決定できない場合、ClickHouse はそれを String として扱います。

```sql
DESC format(TSV, '[NULL, NULL]')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

設定 `input_format_tsv_use_best_effort_in_schema_inference` を無効にした状態での例:

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

ヘッダー自動検出の例（`input_format_tsv_detect_header` が有効な場合）:

列名のみの場合:

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

ヘッダーが検出されるのは、少なくとも1つの列が String 型以外の場合のみです。すべての列が String 型の場合、ヘッダーは検出されません。

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

Values 形式では、ClickHouse は行から列の値を抽出し、その後リテラルを解析する場合と同様に、再帰パーサーを使って値を解析します。

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

Date、DateTime:

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

配列に null が含まれている場合、ClickHouse は他の配列要素の型を使用します。

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

ネストされた配列、タプル、マップ:

```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```

```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

データに null 値しか含まれておらず、ClickHouse が型を判別できない場合は、例外がスローされます。

```sql
DESC format(Values, '([NULL, NULL])')
```

```response
コード: 652. DB::Exception: localhost:9000から受信。DB::Exception:
最初の1行のデータから列'c1'の型を判定できません。
この列にはNullまたは空のArray/Mapのみが含まれている可能性があります。
...
```

`input_format_tsv_use_best_effort_in_schema_inference` 設定を無効にした状態での例:

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

CustomSeparated フォーマットでは、ClickHouse はまず指定された区切り文字に従って行からすべての列の値を抽出し、その後、エスケープ規則に基づいて各値のデータ型を推論します。

設定 `input_format_custom_detect_header` が有効な場合、ClickHouse はスキーマ推論中に列名（および場合によっては型）を含むヘッダー行を検出しようとします。この設定はデフォルトで有効になっています。

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

ヘッダーの自動検出例（`input_format_custom_detect_header` が有効化されている場合）:

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

Template 形式では、ClickHouse はまず指定されたテンプレートに従って行からすべてのカラム値を抽出し、その後、それぞれの値に対してエスケープ規則に基づいてデータ型を推論します。

**例**

次の内容を持つ `resultset` というファイルがあるとします。

```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

また、次の内容の `row_format` ファイルを用意します。

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

次に、以下のクエリを実行します。

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

Template 形式と同様に、Regexp 形式では ClickHouse はまず、指定された正規表現に従って行からすべての列の値を抽出し、その後、指定されたエスケープ規則に基づいて各値のデータ型を自動的に推定します。

**例**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'
```

DESC format(Regexp, $$Line: value&#95;1=42, value&#95;2=&quot;Some string 1&quot;, value&#95;3=&quot;[1, NULL, 3]&quot;
Line: value&#95;1=2, value&#95;2=&quot;Some string 2&quot;, value&#95;3=&quot;[4, 5, NULL]&quot;$$)

```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### テキスト形式用の設定 {#settings-for-text-formats}

#### input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference {#input-format-max-rows-to-read-for-schema-inference}

これらの設定は、スキーマ推論を行う際に読み取るデータ量を制御します。
より多くの行やバイト数を読み取るほどスキーマ推論に時間はかかりますが、型を正しく判定できる
可能性が高くなります（特に、データに `null` が多く含まれる場合）。

デフォルト値:

* `input_format_max_rows_to_read_for_schema_inference`: `25000`
* `input_format_max_bytes_to_read_for_schema_inference`: `33554432`（32 MB）

#### column&#95;names&#95;for&#95;schema&#95;inference \\{#column-names-for-schema-inference\\}

明示的なカラム名を持たないフォーマットに対して、スキーマ推論で使用するカラム名のリストです。指定した名前は、デフォルトの `c1,c2,c3,...` の代わりに使用されます。形式: `column1,column2,column3,...`。

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

#### schema&#95;inference&#95;hints {#schema-inference-hints}

自動的に決定される型の代わりに、スキーマ推論で使用する列名と型のリストです。形式は &#39;column&#95;name1 column&#95;type1, column&#95;name2 column&#95;type2, ...&#39; のようになります。
この設定は、自動的に型を決定できなかった列の型を指定する場合や、スキーマを最適化する目的で使用できます。

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

#### schema&#95;inference&#95;make&#95;columns&#95;nullable $ {#schema-inference-make-columns-nullable}

NULL 許容性に関する情報を持たないフォーマットに対して、スキーマ推論時に推論された型を `Nullable` にするかどうかを制御します。設定可能な値:

* 0 - 推論された型は決して `Nullable` になりません。
* 1 - すべての推論された型が `Nullable` になります。
* 2 または &#39;auto&#39; - テキストフォーマットでは、スキーマ推論中に解析されるサンプル内で列に `NULL` が含まれている場合にのみ、推論された型が `Nullable` になります。強く型付けされたフォーマット（Parquet、ORC、Arrow）では、NULL 許容性の情報はファイルメタデータから取得されます。
* 3 - テキストフォーマットでは常に `Nullable` を使用し、強く型付けされたフォーマットではファイルメタデータを使用します。

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

#### input&#95;format&#95;try&#95;infer&#95;integers {#input-format-try-infer-integers}

:::note
この設定は `JSON` データ型には適用されません。
:::

有効化されている場合、ClickHouse はテキストフォーマットのスキーマ推論時に、浮動小数点数ではなく整数として推論しようとします。
サンプルデータの列内のすべての数値が整数であれば、結果の型は `Int64` になり、1 つでも浮動小数点数が含まれていれば、結果の型は `Float64` になります。
サンプルデータが整数のみを含み、かつ少なくとも 1 つの整数が正で `Int64` をオーバーフローする場合、ClickHouse は `UInt64` として推論します。

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

#### input&#95;format&#95;try&#95;infer&#95;datetimes {#input-format-try-infer-datetimes}

有効にすると、ClickHouse はテキスト形式のスキーマ推論を行う際に、文字列フィールドから型 `DateTime` または `DateTime64` を推定しようとします。
サンプルデータのある列に含まれるすべてのフィールドが日時として正常にパースできた場合、結果の型は `DateTime` または `DateTime64(9)`（いずれかの日時に小数部が含まれていた場合）になり、
少なくとも 1 つのフィールドが日時としてパースできなかった場合、結果の型は `String` になります。

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

#### input&#95;format&#95;try&#95;infer&#95;datetimes&#95;only&#95;datetime64 {#input-format-try-infer-datetimes-only-datetime64}

この設定を有効にすると、`input_format_try_infer_datetimes` が有効な場合、日時の値に小数部が含まれていなくても、ClickHouse は常に `DateTime64(9)` 型として推論します。

既定では無効です。

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

注記: スキーマ推論時の日時のパースは、設定 [date&#95;time&#95;input&#95;format](/operations/settings/settings-formats.md#date_time_input_format) に従います。

#### input&#95;format&#95;try&#95;infer&#95;dates {#input-format-try-infer-dates}

有効にすると、ClickHouse はテキストフォーマットに対するスキーマ推論時に、文字列フィールドから型 `Date` を推定しようとします。
サンプルデータ内のあるカラムのすべてのフィールドが日付として正常にパースされた場合、その結果型は `Date` になります。
少なくとも 1 つのフィールドが日付としてパースできなかった場合、その結果型は `String` になります。

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

#### input&#95;format&#95;try&#95;infer&#95;exponent&#95;floats {#input-format-try-infer-exponent-floats}

有効にすると、ClickHouse はテキストフォーマットにおいて、指数表記された数値を浮動小数点数として解釈しようとします（指数表記の数値が常に浮動小数点数として解釈される JSON を除く）。

デフォルトでは無効です。

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

## 自己記述フォーマット {#self-describing-formats}

自己記述フォーマットは、データ自体の中にデータ構造に関する情報を含むフォーマットです。
ヘッダーに記述が含まれていたり、バイナリの型ツリーや、ある種のテーブルとして表現されている場合があります。
このようなフォーマットのファイルからスキーマを自動的に推論するために、ClickHouse は型に関する情報を含むデータの一部を読み取り、
それを ClickHouse テーブルのスキーマに変換します。

### -WithNamesAndTypes サフィックス付きフォーマット {#formats-with-names-and-types}

ClickHouse は、サフィックス -WithNamesAndTypes を持ついくつかのテキストフォーマットをサポートしています。このサフィックスは、実データの前にカラム名と型を含む追加の 2 行がデータに含まれていることを意味します。
このようなフォーマットに対してスキーマ推論を行う際、ClickHouse は最初の 2 行を読み取り、カラム名と型を抽出します。

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

### メタデータを含む JSON フォーマット \\{#json-with-metadata\\}

一部の JSON 入力フォーマット（[JSON](/interfaces/formats/JSON)、[JSONCompact](/interfaces/formats/JSONCompact)、[JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)）には、列名およびデータ型に関するメタデータが含まれます。
そのようなフォーマットでスキーマ推論を行う際、ClickHouse はこのメタデータを参照します。

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

Avro 形式では、ClickHouse はデータからスキーマを読み取り、以下の型の対応付けに基づいて ClickHouse のスキーマに変換します。

| Avro データ型                     | ClickHouse データ型                                                           |
|------------------------------------|--------------------------------------------------------------------------------|
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
| `binary (decimal)` \*              | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                         |

\* [Avro logical types](https://avro.apache.org/docs/current/spec.html#Logical+Types)

その他の Avro 型はサポートされていません。

### Parquet {#parquet}

Parquet フォーマットでは、ClickHouse はデータからスキーマを読み取り、次の型対応に従って ClickHouse のスキーマに変換します。

| Parquet データ型            | ClickHouse データ型                                    |
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

その他の Parquet 型はサポートされていません。

### Arrow \\{#arrow\\}

Arrow フォーマットでは、ClickHouse はデータからスキーマを読み取り、次の型対応に従って ClickHouse のスキーマに変換します。

| Arrow データ型                 | ClickHouse データ型                                    |
|---------------------------------|---------------------------------------------------------|
| `BOOL`                          | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                         | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                          | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                        | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                        | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                        | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                        | [Int32](../sql-reference/data-types/int-uint.md)        |
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

その他の Arrow 型はサポートされていません。

### ORC \\{#orc\\}

ORC 形式では、ClickHouse はスキーマをデータから読み取り、以下の型対応に従って ClickHouse のスキーマに変換します。

| ORC データ型                        | ClickHouse データ型                                    |
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

その他の ORC 型はサポートされていません。

### Native \\{#native\\}

Native 形式は ClickHouse 内部で使用され、スキーマをデータ内に含みます。
スキーマ推論では、ClickHouse は変換を一切行わずにデータからスキーマを読み取ります。

## 外部スキーマを用いるフォーマット {#formats-with-external-schema}

この種のフォーマットでは、特定のスキーマ言語で記述された、データを表すスキーマを別ファイルで用意する必要があります。
これらのフォーマットのファイルからスキーマを自動推論するために、ClickHouse は外部スキーマを別ファイルから読み込み、ClickHouse のテーブルスキーマに変換します。

### Protobuf \\{#protobuf\\}

Protobuf フォーマットのスキーマ推論では、ClickHouse は次の型の対応関係を使用します。

| Protobuf data type            | ClickHouse data type                              |
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

### CapnProto \\{#capnproto\\}

CapnProto フォーマットのスキーマ推論では、ClickHouse は次の型の対応関係を使用します。

| CapnProto data type                | ClickHouse data type                                   |
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

## 強い型付けのバイナリ形式 {#strong-typed-binary-formats}

この種の形式では、シリアル化された各値にはその型（および場合によっては名前）に関する情報が含まれますが、テーブル全体に関する情報は含まれません。
このような形式に対するスキーマ推論では、ClickHouse は行ごとにデータを読み込み（最大 `input_format_max_rows_to_read_for_schema_inference` 行または `input_format_max_bytes_to_read_for_schema_inference` バイト）、データから各値の
型（および場合によっては名前）を抽出し、その後それらの型を ClickHouse の型に変換します。

### MsgPack {#msgpack}

MsgPack 形式では行の区切りが存在しないため、この形式に対してスキーマ推論を行うには、設定 `input_format_msgpack_number_of_columns` を用いて
テーブル内の列数を指定する必要があります。ClickHouse は次の型対応を使用します。

| MessagePack data type (`INSERT`)                                   | ClickHouse data type                                      |
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

デフォルトでは、推論されたすべての型は `Nullable` でラップされますが、これは設定 `schema_inference_make_columns_nullable` を使用して変更できます。

### BSONEachRow {#bsoneachrow}

BSONEachRow では、各データ行は BSON ドキュメントとして表現されます。スキーマ推論では、ClickHouse は BSON ドキュメントを 1 つずつ読み込み、
データから値、名前、および型を抽出し、その後次の型対応を使用してそれらの型を ClickHouse の型に変換します。

| BSON Type                                                                                     | ClickHouse type                                                                                                             |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                              |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                             |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                     |
| `\x05` binary with `\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                             |
| `\x07` ObjectId,                                                                              | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                               |
| `\x05` binary with `\x04` UUID subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                                 |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md)（ネストされた型が異なる場合） |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md)（キーは String）            |

デフォルトでは、推論されたすべての型は `Nullable` でラップされますが、これは設定 `schema_inference_make_columns_nullable` を使用して変更できます。

## 固定スキーマを持つフォーマット {#formats-with-constant-schema}

このようなフォーマットのデータは、常に同じスキーマを持ちます。

### LineAsString {#line-as-string}

このフォーマットでは、ClickHouse はデータから1行全体を `String` 型の1つのカラムとして読み込みます。このフォーマットで推論されるデータ型は常に `String` であり、カラム名は `line` です。

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

このフォーマットでは、ClickHouse はデータ内の JSON オブジェクト全体を `String` 型の単一の列として読み取ります。このフォーマットで推論される型は常に `String` で、列名は `json` です。

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

この形式では、ClickHouse はデータ内の JSON オブジェクト全体を `JSON` データ型の単一の列として読み取ります。この形式で推論されるデータ型は常に `JSON` であり、列名は `json` です。

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

データファイルの集合からのスキーマ推論は、`default` と `union` の 2 つのモードで動作します。
モードは設定項目 `schema_inference_mode` で制御されます。

### `default` モード {#default-schema-inference-mode}

`default` モードでは、ClickHouse はすべてのファイルが同一のスキーマを持つと仮定し、スキーマの推論に成功するまでファイルを 1 つずつ読み込みます。

例:

`data1.jsonl`、`data2.jsonl`、`data3.jsonl` の 3 つのファイルがあり、その内容が次のようになっているとします。

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

`data3.jsonl`：

```json
{"field1" :  7, "field2" :  "Data7", "field3" :  [1, 2, 3]}
{"field1" :  8, "field2" :  "Data8", "field3" :  [4, 5, 6]}
{"field1" :  9, "field2" :  "Data9", "field3" :  [7, 8, 9]}
```

これら3つのファイルに対してスキーマ推論を試してみましょう。

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

ご覧のとおり、ファイル `data3.jsonl` には `field3` がありません。
これは、ClickHouse がまずファイル `data1.jsonl` からスキーマの推論を行おうとしましたが、`field2` フィールドがすべて null だったために失敗し、
その後 `data2.jsonl` からスキーマ推論を行って成功した結果、ファイル `data3.jsonl` のデータが読み込まれなかったためです。

### Union モード {#default-schema-inference-mode-1}

Union モードでは、ClickHouse はファイルごとに異なるスキーマを持つ可能性があるとみなし、すべてのファイルのスキーマを推論してから、それらを共通スキーマに対して union します。

`data1.jsonl`、`data2.jsonl`、`data3.jsonl` という 3 つのファイルがあり、その内容が次のようであるとします。

`data1.jsonl`:

```json
{"field1" :  1}
{"field1" :  2}
{"field1" :  3}
```

`data2.jsonl`：

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

これら 3 つのファイルに対してスキーマ推論を試してみましょう。

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

ご覧のとおり、すべてのファイルからすべてのフィールドが取得されています。

注意:

* 一部のファイルには結果のスキーマに含まれる特定のカラムが存在しない場合があるため、union モードはカラムのサブセット読み取りをサポートするフォーマット（JSONEachRow、Parquet、TSVWithNames など）でのみ使用でき、それ以外のフォーマット（CSV、TSV、JSONCompactEachRow など）では動作しません。
* ClickHouse がファイルの 1 つからスキーマを推論できない場合は、例外がスローされます。
* ファイル数が多い場合、すべてのファイルからスキーマを読み取る処理に多くの時間がかかる可能性があります。

## 自動フォーマット検出 {#automatic-format-detection}

データのフォーマットが指定されておらず、かつファイル拡張子からも判定できない場合、ClickHouse はファイルの内容に基づいてフォーマットの検出を試みます。

**例:**

`data` というファイルに次のような内容があるとします:

```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

形式や構造を指定せずに、このファイルを確認しクエリを実行できます。

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
ClickHouse は一部のフォーマットしか自動検出できず、検出にも時間がかかるため、フォーマットは明示的に指定することをお勧めします。
:::
