---
title: 'JSON スキーマ推論'
slug: /integrations/data-formats/json/inference
description: 'JSON スキーマ推論の使用方法'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouse は JSON データの構造を自動的に推論できます。これを利用すると、ディスク上のデータや S3 バケット上の JSON データを `clickhouse-local` などから直接クエリしたり、データを ClickHouse にロードする前にスキーマを自動生成したりできます。

## 型推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - 型を推論しようとしているデータに、関心のあるすべてのキーが含まれていること。型推論は、[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)または[バイト数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)までデータをサンプリングすることで行われます。サンプル以降のデータで追加のカラムがあっても無視され、クエリすることはできません。
* **一貫した型** - 特定のキーに対するデータ型は互換性がある必要があります。つまり、一方の型を他方の型へ自動的に変換できなければなりません。

より動的な JSON の場合で、新しいキーが追加され、同じパスに対して複数の型が存在し得る場合は、「[半構造化データおよび動的データの扱い](/integrations/data-formats/json/inference#working-with-semi-structured-data)」を参照してください。

## 型の検出 {#detecting-types}

以下では、JSON が一貫した構造を持ち、各パスごとに単一の型を持つことを前提とします。

これまでの例では、`NDJSON` 形式の [Python PyPI データセット](https://clickpy.clickhouse.com/) の簡易版を使用してきました。このセクションでは、ネストされた構造を含む、より複雑なデータセットである [arXiv データセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)（250 万件の学術論文を含む）を扱います。`NDJSON` として配布されるこのデータセットの各行は、公開された学術論文 1 本を表します。以下にその一例を示します。

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

このデータには、これまでの例よりもはるかに複雑なスキーマが必要です。以下で、このスキーマを定義する手順を概説し、`Tuple` や `Array` といった複雑な型を紹介します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz` というパブリックな S3 バケットに保存されています。

上記のデータセットにはネストされた JSON オブジェクトが含まれていることが分かります。ユーザーはスキーマを作成しバージョン管理すべきですが、推論機能によりデータから型を推測できます。これによりスキーマの DDL を自動生成でき、手作業で構築する必要がなくなり、開発プロセスを加速できます。

:::note Auto format detection
スキーマの検出に加えて、JSON のスキーマ推論機能は、ファイル拡張子と内容からデータのフォーマットも自動的に推測します。上記のファイルは NDJSON 形式として自動的に認識されます。
:::

`DESCRIBE` コマンドと組み合わせて [s3 関数](/sql-reference/table-functions/s3) を使用すると、推論される型を確認できます。

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

:::note Null を避ける
多くのカラムが Nullable として検出されていることがわかります。[Nullable 型の使用は、どうしても必要な場合を除き推奨されません](/sql-reference/data-types/nullable#storage-features)。Nullable を適用するかどうかの挙動は、[schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable) で制御できます。
:::

ほとんどのカラムが自動的に `String` として検出されており、`update_date` カラムは正しく `Date` として検出されています。`versions` カラムはオブジェクトのリストを格納するために `Array(Tuple(created String, version String))` として作成されており、`authors_parsed` は入れ子の配列用に `Array(Array(String))` として定義されています。


:::note 型検出の制御
日付および日時の自動検出は、それぞれ設定 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) と [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) で制御できます（どちらもデフォルトで有効）。オブジェクトをタプルとして推論するかどうかは、設定 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) で制御されます。数値の自動検出など、JSON のスキーマ推論を制御するその他の設定は[こちら](/interfaces/schema-inference#text-formats)で確認できます。
:::

## JSON のクエリ {#querying-json}

以下では、JSON が一貫した構造を持ち、各パスごとに単一の型になっていることを前提とします。

スキーマ推論を利用することで、JSON データに対してそのままクエリを実行できます。以下の例では、日付や配列が自動検出されることを利用して、各年ごとの上位の著者を抽出します。

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

スキーマ推論を利用することで、スキーマを明示的に定義しなくても JSON ファイルに対してクエリを実行できるため、アドホックなデータ分析タスクを高速化できます。


## テーブルの作成 {#creating-tables}

テーブルのスキーマを作成するために、スキーマ推論を利用できます。次の `CREATE AS EMPTY` コマンドは、テーブルの DDL を推論してテーブルを作成します。これはデータを一切読み込みません。

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

テーブルのスキーマを確認するために、`SHOW CREATE TABLE` コマンドを使用します。

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

上記は、このデータに対して正しいスキーマです。スキーマ推論は、データのサンプリングと、データを行単位で読み取る処理に基づいて実行されます。カラム値はフォーマットに従って抽出され、各値の型を決定するために再帰的なパーサーとヒューリスティクスが使用されます。スキーマ推論時にデータから読み取られる最大行数および最大バイト数は、設定 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)（デフォルトでは 25000）および [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)（デフォルトでは 32MB）によって制御されます。検出結果が正しくない場合、[こちら](/operations/settings/formats#schema_inference_make_columns_nullable)で説明されているようにヒントを指定できます。


### スニペットからテーブルを作成する {#creating-tables-from-snippets}

上記の例では、S3 上のファイルを使用してテーブルスキーマを作成しました。1 行だけを含むスニペットからスキーマを作成したい場合もあるでしょう。これは、以下に示すように [format](/sql-reference/table-functions/format) 関数を使用することで実現できます。

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


## JSON データの読み込み {#loading-json-data}

以下では、JSON が一貫した構造を持ち、各パスごとに単一の型を持つことを前提としています。

前のコマンドで、データを格納するテーブルを作成しました。次の `INSERT INTO SELECT` を使用して、このテーブルにデータを挿入します。

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

他のデータソース（例: ファイル）からデータをロードする例については、[こちら](/sql-reference/statements/insert-into)を参照してください。

データの読み込みが完了したら、必要に応じて `PrettyJSONEachRow` フォーマットを使用して行を元の構造のまま表示しながら、データに対してクエリを実行できます。

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

ときどき、不正な形式のデータが含まれていることがあります。たとえば、特定のカラムの型が正しくない場合や、JSON オブジェクトの形式が不適切な場合などです。このような場合には、設定 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) と [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) を使用して、データ挿入エラーを引き起こした行について、一定数または一定割合まで無視することを許可できます。さらに、推論を支援するための [hints](/operations/settings/formats#schema_inference_hints) を指定することもできます。

## 半構造化データと動的データの扱い {#working-with-semi-structured-data}

前の例では、キー名と型がよく知られた静的な JSON を使用しました。実際にはそうでないことが多く、キーが追加されたり、その型が変化したりします。これは Observability データなどのユースケースでよく見られます。

ClickHouse は、専用の [`JSON`](/sql-reference/data-types/newjson) 型によってこれに対応します。

JSON が非常に動的で、固有のキーが多数存在し、同じキーに対して複数の型が現れることが分かっている場合、たとえデータが改行区切りの JSON 形式であっても、`JSONEachRow` によるスキーマ推論を使って各キーごとにカラムを推論しようとすることは推奨しません。

上記の [Python PyPI dataset](https://clickpy.clickhouse.com/) の拡張版からの、次の例を考えてみましょう。ここでは任意のキーと値のペアを持つランダムな `tags` カラムを追加しています。

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

このデータのサンプルは、改行区切りの JSON 形式で公開されています。このファイルに対してスキーマ推論を行おうとすると、処理性能が低く、結果も極めて冗長になることが分かります。

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

ここでの主な問題は、型推論に `JSONEachRow` フォーマットが使用されていることです。これは **JSON 内のキーごとにカラム型を推論しようとする** もので、[`JSON`](/sql-reference/data-types/newjson) 型を使用せずに、実質的にデータに静的スキーマを適用しようとします。

何千ものユニークなカラムがある場合、この推論手法では処理が遅くなります。代替案として、ユーザーは `JSONAsObject` フォーマットを使用できます。

`JSONAsObject` は入力全体を単一の JSON オブジェクトとして扱い、[`JSON`](/sql-reference/data-types/newjson) 型の単一カラムに保存するため、非常に動的、あるいはネスト構造が深い JSON ペイロードに適しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

この形式は、同一カラム内に複数の型が混在し、単一の型に揃えられない場合にも不可欠です。たとえば、次のような改行区切りの JSON を含む `sample.json` ファイルを考えてみます。

```json
{"a":1}
{"a":"22"}
```

この場合、ClickHouse は型の不一致を型変換によって解消し、カラム `a` を `Nullable(String)` 型として解釈します。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 型変換
この型変換は、いくつかの設定によって制御できます。上記の例は、設定 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings) に依存しています。
:::

しかし、一部の型どうしには互換性がありません。次の例を考えてみましょう。

```json
{"a":1}
{"a":{"b":2}}
```

この場合、ここで型変換を行うことは一切できません。その結果、`DESCRIBE` コマンドは次のように失敗します：


```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

この場合、`JSONAsObject` は各行を 1 つの [`JSON`](/sql-reference/data-types/newjson) 型（同じカラムに複数の型が存在することを許容する型）として扱います。これは重要です:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```


## さらに詳しく知る {#further-reading}

データ型推論の詳細については、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。