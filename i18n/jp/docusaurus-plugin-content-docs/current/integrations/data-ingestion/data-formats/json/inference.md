---
title: 'JSON スキーマ推論'
slug: /integrations/data-formats/json/inference
description: 'JSON スキーマ推論の使用方法'
keywords: ['json', 'schema', 'inference', 'schema inference']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

ClickHouse は、JSON データの構造を自動的に判断できます。これを利用して、`clickhouse-local` や S3 バケット上のディスクに直接 JSON データをクエリし、データを ClickHouse にロードする前にスキーマを自動的に作成できます。

## 型推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - 型を推測するためのデータに、興味のあるすべてのキーが含まれている必要があります。型推論は、[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)または[バイト数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)までデータをサンプリングすることに基づいています。サンプル後のデータは、追加のカラムとともに無視され、クエリできません。
* **一貫した型** - 特定のキーのデータ型が互換性を持つ必要があります。つまり、一方の型を自動的に他方に強制変換できる必要があります。

より動的な JSON があり、新しいキーが追加され、同じパスに対して複数の型が可能な場合は、["半構造化データおよび動的データの取り扱い"](/integrations/data-formats/json/inference#working-with-semi-structured-data)を参照してください。

## 型の検出 {#detecting-types}

以下は、JSON が一貫して構造化されており、各パスに対して単一のタイプがあると仮定します。

以前の例では、`NDJSON` 形式の[Python PyPI dataset](https://clickpy.clickhouse.com/)の簡単なバージョンを使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセット、つまり 250 万冊の学術論文を含む[arXiv データセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探ります。このデータセット内の各行は、公開された学術論文を表しています。例として以下のような行が示されます：

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

このデータは、前の例よりもはるかに複雑なスキーマを必要とします。このスキーマを定義するプロセスを以下に概説し、`Tuple` や `Array` などの複雑な型を導入します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz` のパブリック S3 バケットに保存されています。

上記のデータセットには、ネストされた JSON オブジェクトが含まれています。ユーザーは自らスキーマを設計しバージョン管理するべきですが、推論によってデータから型を推測することができます。これにより、スキーマの DDL が自動生成され、手動で構築する必要がなくなり、開発プロセスが加速します。

:::note 自動形式検出
スキーマを検出するだけでなく、JSON スキーマ推論はファイルの拡張子と内容からデータの形式を自動的に推測します。上記のファイルは、結果として自動的に NDJSON として検出されます。
:::

[`s3` 関数](/sql-reference/table-functions/s3)を使用して `DESCRIBE` コマンドを実行すると、推測されるタイプが表示されます。

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
たくさんのカラムが Nullable として検出されていることがわかります。絶対に必要でない時には [Nullable](/sql-reference/data-types/nullable#storage-features) 型を使用することは推奨しません。Nullable が適用される条件を制御するために、[schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable) を使用できます。
:::

ほとんどのカラムが自動的に `String` として検出されていることがわかりますが、`update_date` カラムは正しく `Date` として検出されています。`versions` カラムは、オブジェクトのリストを格納するために `Array(Tuple(created String, version String))` として作成され、`authors_parsed` はネストされた配列のために `Array(Array(String))` として定義されています。

:::note タイプ検出の制御
日時および日付の自動検出は、それぞれの設定 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) と [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) を介して制御できます（両方ともデフォルトで有効）。オブジェクトをタプルとして推測することは、設定 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) によって制御されます。JSON のスキーマ推論を制御する他の設定、例えば数字の自動検出などは [こちら](/interfaces/schema-inference#text-formats) で確認できます。
:::

## JSON クエリ {#querying-json}

以下は、JSON が一貫して構造化されており、各パスに対して単一の型があると仮定します。

スキーマ推論を使用してJSONデータをそのままクエリできます。以下に、各年のトップ著者を見つけるクエリを示します。これは日付と配列が自動的に検出されることを活用しています。

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

スキーマ推論を利用することで、スキーマを指定することなくJSONファイルをクエリでき、アドホックデータ分析タスクを加速します。

## テーブルの作成 {#creating-tables}

スキーマ推論を利用してテーブルのスキーマを作成できます。次の `CREATE AS EMPTY` コマンドにより、テーブルの DDL が推測され、テーブルが作成されます。これによりデータはロードされません：

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

テーブルスキーマを確認するために、`SHOW CREATE TABLE` コマンドを使用します：

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

上記は、このデータに対する正しいスキーマです。スキーマ推論はデータをサンプリングし、各行を読み取ることに基づいています。カラムの値は形式に応じて抽出され、再帰的なパーサーとヒューリスティクスを用いて各値の型を決定します。スキーマ推論でデータから読み取る最大行数とバイト数は、設定 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)（デフォルトは 25000）および [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)（デフォルトは 32MB）によって制御されます。検出が正しくない場合、ユーザーは[こちら](/operations/settings/formats#schema_inference_make_columns_nullable)に記載のヒントを提供できます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、S3 のファイルを使用してテーブルスキーマを作成しました。ユーザーは単一行のスニペットからスキーマを作成することを望むかもしれません。以下のように [format](/sql-reference/table-functions/format) 関数を使用して実現できます：

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

## JSON データのロード {#loading-json-data}

以下は、JSON が一貫して構造化されており、各パスに対して単一の型があると仮定します。

前のコマンドはデータをロードできるテーブルを作成しました。次の `INSERT INTO SELECT` を使用して、データをテーブルに挿入できます：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

他のソースからのデータのロード例（例：ファイル）は、[こちら](/sql-reference/statements/insert-into) を参照してください。

データがロードされたら、元の構造で行を表示するために、オプションで `PrettyJSONEachRow` 形式を使用してデータをクエリできます：

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

時には、悪いデータがあることがあります。特定のカラムが正しい型ではない、または不適切にフォーマットされた JSON オブジェクトなどです。この場合、設定 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) と [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) を使用して、データが挿入エラーを引き起こす場合に無視される行数を許容できます。さらに、推論を支援するための[ヒント](/operations/settings/formats#schema_inference_hints)を提供できます。

## 半構造化データおよび動的データの取り扱い {#working-with-semi-structured-data}

<PrivatePreviewBadge/>

以前の例では、キー名と型が明確に定義された静的 JSON を使用しました。必ずしもそうであるわけではなく、キーを追加したり、それらの型を変更することができます。これは、可観測性データのようなユースケースで一般的です。

ClickHouse は、専用の[`JSON`](/sql-reference/data-types/newjson)型を通じてこれに対処します。

あなたの JSON が非常に動的で、多くのユニークなキーや同じキーのために複数の型を持っているとわかっているなら、`JSONEachRow` を使用して型推論を試みることは推奨されません。たとえデータが改行区切りの JSON 形式であってもです。

以下に、上記の[Python PyPI データセット](https://clickpy.clickhouse.com/)の拡張バージョンからの例を考えます。ここでは、任意の `tags` カラムを追加し、ランダムなキー値ペアを持たせています。

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

このデータのサンプルは、改行区切りの JSON 形式で公開されています。このファイルに対してスキーマ推論を試みると、パフォーマンスが悪く、非常に冗長な応答が得られます。

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

ここでの主な問題は、推論に使用される形式が `JSONEachRow` であることです。これは、JSON の各キーごとに**カラム型を推測しようとする**ためのもので、データに対して静的スキーマを適用しようとしています[`JSON`](/sql-reference/data-types/newjson) 型を使用せずに。

ユニークなカラムが数千ある場合、この推論アプローチは遅くなります。代わりに、ユーザーは `JSONAsObject` 形式を使用できます。

`JSONAsObject` は、入力全体を単一の JSON オブジェクトとして扱い、それを単一の[`JSON`](/sql-reference/data-types/newjson)型のカラムに保存します。これにより、非常に動的またはネストされた JSON ペイロードに適した形式になります。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

この形式は、型が一致しない複数の型を持つカラムのケースでも重要です。たとえば、以下の改行区切りの JSON を持つ `sample.json` ファイルを考えてみましょう。

```json
{"a":1}
{"a":"22"}
```

この場合、ClickHouse は型衝突を強制でき、カラム `a` を `Nullable(String)` として解決します。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 型強制
この型強制は、いくつかの設定を介して制御できます。上記の例は、設定 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings) に依存しています。
:::

しかし、いくつかの型は互換性がありません。次の例を考えてみましょう：

```json
{"a":1}
{"a":{"b":2}}
```

この場合、型変換を行うことは不可能です。したがって、`DESCRIBE` コマンドは失敗します：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

この場合、`JSONAsObject` は各行を単一の[`JSON`](/sql-reference/data-types/newjson)型として扱います（同じカラムが複数の型をサポート）。これは必須です：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## さらなる情報 {#further-reading}

データ型推論の詳細については、[こちら](/interfaces/schema-inference) のドキュメントページを参照できます。
