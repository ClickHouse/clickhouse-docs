---
title: 'JSONスキーマ推論'
slug: /integrations/data-formats/json/inference
description: 'JSONスキーマ推論の使い方'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouseは、JSONデータの構造を自動的に判断できます。これは、`clickhouse-local`を使用したディスク上やS3バケット内のJSONデータを直接クエリするため、および/またはClickHouseにデータをロードする前にスキーマを自動的に作成するために使用できます。

## 型推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - 型を推論しようとするデータに、興味のあるすべてのキーが含まれている必要があります。型推論は、[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)または[バイト数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)までデータをサンプリングすることに基づいています。サンプル後の追加の列を持つデータは無視され、クエリできません。
* **一貫した型** - 特定のキーのデータ型は互換性がある必要があります。つまり、ある型を別の型に自動的に強制変換できる必要があります。

新しいキーが追加され、同じパスに対して複数の型が可能な、より動的なJSONがある場合は、["半構造化および動的データの操作"](/integrations/data-formats/json/inference#working-with-semi-structured-data)を参照してください。

## 型の検出 {#detecting-types}

以下では、JSONが一貫して構造化され、各パスに単一の型があることを前提としています。

以前の例では、`NDJSON`形式の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の簡単なバージョンを使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセット、250万件の学術論文を含む[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探索します。`NDJSON`として配布されるこのデータセットの各行は、公開された学術論文を表しています。例の行を以下に示します:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

このデータは、以前の例よりもはるかに複雑なスキーマを必要とします。以下では、このスキーマを定義するプロセスの概要を説明し、`Tuple`や`Array`などの複雑な型を紹介します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz`のパブリックS3バケットに保存されています。

上記のデータセットにはネストされたJSONオブジェクトが含まれていることがわかります。スキーマをドラフトしてバージョン管理する必要がありますが、推論により型をデータから推論できます。これにより、スキーマDDLを自動生成でき、手動で構築する必要がなくなり、開発プロセスが加速されます。

:::note 自動フォーマット検出
スキーマの検出に加えて、JSONスキーマ推論は、ファイル拡張子と内容からデータのフォーマットを自動的に推論します。上記のファイルは、その結果として自動的にNDJSONとして検出されます。
:::

[s3関数](/sql-reference/table-functions/s3)を`DESCRIBE`コマンドと共に使用すると、推論される型が表示されます。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS describe_compact_output = 1
```
```response
┌─name───────────┬─type────────────────────────────────────────────────────────────────────┐
│ id             │ Nullable(String)                                                        │
│ submitter      │ Nullable(String)                                                        │
│ authors        │ Nullable(String)                                                        │
│ title          │ Nullable(String)                                                        │
│ comments       │ Nullable(String)                                                        │
│ journal-ref    │ Nullable(String)                                                        │
│ doi            │ Nullable(String)                                                        │
│ report-no      │ Nullable(String)                                                        │
│ categories     │ Nullable(String)                                                        │
│ license        │ Nullable(String)                                                        │
│ abstract       │ Nullable(String)                                                        │
│ versions       │ Array(Tuple(created Nullable(String),version Nullable(String)))         │
│ update_date    │ Nullable(Date)                                                          │
│ authors_parsed │ Array(Array(Nullable(String)))                                          │
└────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
:::note Nullの回避
多くの列がNullableとして検出されていることがわかります。絶対に必要でない限り、[Nullable型の使用はお勧めしません](/sql-reference/data-types/nullable#storage-features)。[schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)を使用して、Nullableが適用されるタイミングの動作を制御できます。
:::

ほとんどの列が自動的に`String`として検出され、`update_date`列は正しく`Date`として検出されていることがわかります。`versions`列は、オブジェクトのリストを保存するために`Array(Tuple(created String, version String))`として作成され、`authors_parsed`はネストされた配列に対して`Array(Array(String))`として定義されています。

:::note 型検出の制御
日付と日時の自動検出は、設定[`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates)と[`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)でそれぞれ制御できます(両方ともデフォルトで有効)。オブジェクトをタプルとして推論することは、設定[`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)によって制御されます。数値の自動検出など、JSONのスキーマ推論を制御するその他の設定は、[こちら](/interfaces/schema-inference#text-formats)で見つけることができます。
:::

## JSONのクエリ {#querying-json}

以下では、JSONが一貫して構造化され、各パスに単一の型があることを前提としています。

スキーマ推論を利用して、JSONデータをその場でクエリできます。以下では、日付と配列が自動的に検出されることを利用して、各年のトップ著者を見つけます。

```sql
SELECT
 toYear(update_date) AS year,
 authors,
    count() AS c
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
GROUP BY
    year,
 authors
ORDER BY
    year ASC,
 c DESC
LIMIT 1 BY year

┌─year─┬─authors────────────────────────────────────┬───c─┐
│ 2007 │ The BABAR Collaboration, B. Aubert, et al  │  98 │
│ 2008 │ The OPAL collaboration, G. Abbiendi, et al │  59 │
│ 2009 │ Ashoke Sen                                 │  77 │
│ 2010 │ The BABAR Collaboration, B. Aubert, et al  │ 117 │
│ 2011 │ Amelia Carolina Sparavigna                 │  21 │
│ 2012 │ ZEUS Collaboration                         │ 140 │
│ 2013 │ CMS Collaboration                          │ 125 │
│ 2014 │ CMS Collaboration                          │  87 │
│ 2015 │ ATLAS Collaboration                        │ 118 │
│ 2016 │ ATLAS Collaboration                        │ 126 │
│ 2017 │ CMS Collaboration                          │ 122 │
│ 2018 │ CMS Collaboration                          │ 138 │
│ 2019 │ CMS Collaboration                          │ 113 │
│ 2020 │ CMS Collaboration                          │  94 │
│ 2021 │ CMS Collaboration                          │  69 │
│ 2022 │ CMS Collaboration                          │  62 │
│ 2023 │ ATLAS Collaboration                        │ 128 │
│ 2024 │ ATLAS Collaboration                        │ 120 │
└──────┴────────────────────────────────────────────┴─────┘

18 rows in set. Elapsed: 20.172 sec. Processed 2.52 million rows, 1.39 GB (124.72 thousand rows/s., 68.76 MB/s.)
```

スキーマ推論により、スキーマを指定せずにJSONファイルをクエリでき、アドホックなデータ分析タスクが加速されます。

## テーブルの作成 {#creating-tables}

スキーマ推論を利用して、テーブルのスキーマを作成できます。次の`CREATE AS EMPTY`コマンドにより、テーブルのDDLが推論され、テーブルが作成されます。これはデータをロードしません:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

テーブルスキーマを確認するには、`SHOW CREATE TABLE`コマンドを使用します:

```sql
SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

上記は、このデータの正しいスキーマです。スキーマ推論は、データのサンプリングと行ごとのデータ読み取りに基づいています。列の値はフォーマットに従って抽出され、再帰パーサーとヒューリスティックを使用して各値の型が決定されます。スキーマ推論でデータから読み取られる最大行数とバイト数は、設定[`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)(デフォルトで25000)と[`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)(デフォルトで32MB)によって制御されます。検出が正しくない場合は、[こちら](/operations/settings/formats#schema_inference_make_columns_nullable)で説明されているようにヒントを提供できます。

### スニペットからテーブルを作成する {#creating-tables-from-snippets}

上記の例では、S3上のファイルを使用してテーブルスキーマを作成しています。1行のスニペットからスキーマを作成したい場合もあるでしょう。これは、以下に示すように[format](/sql-reference/table-functions/format)関数を使用して実現できます:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Withdisks and networks providing gigabytes per second ","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

## JSONデータのロード {#loading-json-data}

以下では、JSONが一貫して構造化され、各パスに単一の型があることを前提としています。

前のコマンドは、データをロードできるテーブルを作成しました。次の`INSERT INTO SELECT`を使用して、データをテーブルに挿入できます:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

ファイルなどの他のソースからデータをロードする例については、[こちら](/sql-reference/statements/insert-into)を参照してください。

ロード後、データをクエリでき、オプションで`PrettyJSONEachRow`フォーマットを使用して、行を元の構造で表示できます:

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
  "id": "0704.0004",
  "submitter": "David Callan",
  "authors": "David Callan",
  "title": "A determinant of Stirling cycle numbers counts unlabeled acyclic",
  "comments": "11 pages",
  "journal-ref": "",
  "doi": "",
  "report-no": "",
  "categories": "math.CO",
  "license": "",
  "abstract": "  We show that a determinant of Stirling cycle numbers counts unlabeled acyclic\nsingle-source automata.",
  "versions": [
    {
      "created": "Sat, 31 Mar 2007 03:16:14 GMT",
      "version": "v1"
    }
  ],
  "update_date": "2007-05-23",
  "authors_parsed": [
    [
      "Callan",
      "David"
    ]
  ]
}

1 row in set. Elapsed: 0.009 sec.
```

## エラーの処理 {#handling-errors}

不正なデータがある場合があります。たとえば、正しい型を持たない特定の列や、不適切にフォーマットされたJSONオブジェクトなどです。このような場合、データが挿入エラーを引き起こしている場合に、一定数の行を無視できるようにする設定[`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num)と[`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)を使用できます。さらに、[ヒント](/operations/settings/formats#schema_inference_hints)を提供して推論を支援できます。

## 半構造化および動的データの操作 {#working-with-semi-structured-data}

前の例では、既知のキー名と型を持つ静的なJSONを使用しました。これは必ずしもそうではありません - キーが追加されたり、型が変更されたりする可能性があります。これは、観測性データなどのユースケースで一般的です。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)型を通じてこれを処理します。

JSONが多くのユニークなキーと同じキーに対する複数の型を持つ非常に動的であることがわかっている場合、データが改行区切りのJSON形式であっても、各キーに対して列を推論しようとする`JSONEachRow`でスキーマ推論を使用することはお勧めしません。

上記の[Python PyPIデータセット](https://clickpy.clickhouse.com/)データセットの拡張バージョンからの次の例を考えてみましょう。ここでは、ランダムなキーと値のペアを持つ任意の`tags`列を追加しました。

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}
```

このデータのサンプルは、改行区切りのJSON形式で公開されています。このファイルでスキーマ推論を試みると、非常に冗長な応答でパフォーマンスが低下することがわかります:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- 簡潔にするため結果は省略

9 rows in set. Elapsed: 127.066 sec.
```

ここでの主な問題は、推論に`JSONEachRow`形式が使用されていることです。これは、[`JSON`](/sql-reference/data-types/newjson)型を使用せずに、**JSONの各キーに対して列の型を推論**しようとします - 事実上、データに静的スキーマを適用しようとします。

数千のユニークな列がある場合、この推論へのアプローチは遅くなります。代わりに、`JSONAsObject`形式を使用できます。

`JSONAsObject`は、入力全体を単一のJSONオブジェクトとして扱い、[`JSON`](/sql-reference/data-types/newjson)型の単一の列に保存するため、高度に動的またはネストされたJSONペイロードに適しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

この形式は、調整できない複数の型を持つ列がある場合にも不可欠です。たとえば、次の改行区切りJSONを含む`sample.json`ファイルを考えてみましょう:

```json
{"a":1}
{"a":"22"}
```

この場合、ClickHouseは型の衝突を強制変換し、列`a`を`Nullable(String)`として解決できます。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 型強制変換
この型強制変換は、多くの設定を通じて制御できます。上記の例は、設定[`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)に依存しています。
:::

ただし、一部の型は互換性がありません。次の例を考えてみましょう:

```json
{"a":1}
{"a":{"b":2}}
```

この場合、ここでの型変換は不可能です。したがって、`DESCRIBE`コマンドは失敗します:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

この場合、`JSONAsObject`は各行を単一の[`JSON`](/sql-reference/data-types/newjson)型として扱います(同じ列が複数の型を持つことをサポート)。これは不可欠です:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## さらに読む {#further-reading}

データ型推論の詳細については、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
