---
title: JSON スキーマ推論
slug: /integrations/data-formats/json/inference
description: JSON スキーマ推論の使い方
keywords: [json, スキーマ, 推論, スキーマ推論]
---

ClickHouse は JSON データの構造を自動的に判断することができます。これは、`clickhouse-local` や S3 バケットを使用してディスク上の JSON データを直接クエリしたり、データを ClickHouse にロードする前にスキーマを自動的に作成したりする際に利用できます。

## タイプ推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - タイプを推論するためのデータには、興味のあるすべてのカラムが含まれています。タイプ推論の後に追加されたカラムを持つデータは無視され、クエリを実行することはできません。
* **一貫したタイプ** - 特定のカラムのデータ型は互換性が必要です。

:::note 重要
もし動的な JSON があり、スキーマを変更するための十分な警告なしに新しいキーが追加される場合（例: ログ内の Kubernetes ラベル）、[**JSON スキーマの設計**](/integrations/data-formats/json/schema)を読むことをお勧めします。
:::

## タイプの検出 {#detecting-types}

私たちの以前の例では、NDJSON 形式の [Python PyPI データセット](https://clickpy.clickhouse.com/) の簡単なバージョンを使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセットである [arXiv データセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download) を調査します。このデータセットは250万件の学術論文を含んでいます。このデータセットの各行は、発表された学術論文を表します。以下に例を示します：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
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

このデータは、以前の例よりもはるかに複雑なスキーマを必要とします。このスキーマを定義するプロセスを以下に示し、`Tuple` や `Array` のような複雑なタイプを導入します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz` という公共の S3 バケットに保存されています。

上記のデータセットにはネストされた JSON オブジェクトが含まれていることがわかります。ユーザーはスキーマを草案し、バージョン管理すべきですが、推論によりデータからタイプを推測することができます。これによりスキーマの DDL が自動生成され、手動で作成する必要がなくなり、開発プロセスが加速します。

:::note 自動フォーマット検出
スキーマを検出するだけでなく、JSON スキーマ推論はファイルの拡張子と内容からデータのフォーマットも自動的に推測します。上記のファイルは自動的に NDJSON として検出されます。
:::

[s3 関数](/sql-reference/table-functions/s3) を使用し、`DESCRIBE` コマンドを実行すると、推論されるタイプが表示されます。

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
多くのカラムが Nullable として検出されていることがわかります。私たちは、必要がない場合は [Nullable](/sql-reference/data-types/nullable#storage-features) タイプの使用をお勧めしません。Nullable が適用される場合の動作を制御するには、[schema_inference_make_columns_nullable](/interfaces/schema-inference#schema_inference_make_columns_nullable) を使用できます。
:::

ほとんどのカラムは自動的に `String` として検出されており、`update_date` カラムは正しく `Date` として検出されています。`versions` カラムは `Array(Tuple(created String, version String))` として作成され、オブジェクトのリストを格納しています。また、`authors_parsed` はネストされた配列のために `Array(Array(String))` として定義されています。

:::note タイプ検出の制御
日付や日時の自動検出は、設定 [`input_format_try_infer_dates`](/interfaces/schema-inference#input_format_try_infer_dates) および [`input_format_try_infer_datetimes`](/interfaces/schema-inference#input_format_try_infer_datetimes)によって制御できます（どちらもデフォルトで有効）。オブジェクトをタプルとして推論することは、設定 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) によって制御されます。数字の自動検出など、JSON のスキーマ推論を制御する他の設定については [こちら](/interfaces/schema-inference#text-formats)を参照してください。
:::

## JSON をクエリする {#querying-json}

スキーマ推論を利用して、JSON データをそのままクエリすることができます。以下では、日付と配列が自動的に検出されることを利用し、年ごとのトップ著者を見つけます。

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

18 行がセットされました。経過時間: 20.172 秒。2.52 百万行、1.39 GB が処理されました (124.72 千行/秒, 68.76 MB/秒)。
```

スキーマ推論を利用することで、スキーマを指定せずに JSON ファイルをクエリでき、アドホックデータ分析タスクが加速します。

## テーブルの作成 {#creating-tables}

スキーマ推論を利用してテーブルのスキーマを作成することができます。次の `CREATE AS EMPTY` コマンドは、テーブルの DDL を推論し、テーブルを作成します。これはデータをロードしません：

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
SETTINGS index_granularity = 8192
```

上記はこのデータの正しいスキーマです。スキーマ推論はデータをサンプリングし、データを行ごとに読み取ることに基づいています。カラムの値はフォーマットに従って抽出され、各値の型を決定するために再帰的パーサとヒューリスティックが使用されます。スキーマ推論でデータから読み取る最大行数とバイト数は、設定 [`input_format_max_rows_to_read_for_schema_inference`](/interfaces/schema-inference#input_format_max_rows_to_read_for_schema_inferenceinput_format_max_bytes_to_read_for_schema_inference)（デフォルトで 25000）および [`input_format_max_bytes_to_read_for_schema_inference`](/interfaces/schema-inference#input_format_max_rows_to_read_for_schema_inferenceinput_format_max_bytes_to_read_for_schema_inference)（デフォルトで 32MB）によって制御されます。検出が正しくない場合は、ユーザーは [こちら](/interfaces/schema-inference#schema_inference_hints)に記載されたヒントを提供できます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、ファイルを S3 から取り出してテーブルのスキーマを作成しました。ユーザーは単一行のスニペットからスキーマを作成することも望むかもしれません。これは、以下のように [format](/sql-reference/table-functions/format) 関数を使用して実現できます：

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

前のコマンドによりデータがロードできるテーブルが作成されました。今、以下の `INSERT INTO SELECT` コマンドを使用してデータをテーブルに挿入できます：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 行がセットされました。経過時間: 38.498 秒。2.52 百万行、1.39 GB が処理されました (65.35 千行/秒, 36.03 MB/秒)。
ピークメモリ使用量: 870.67 MiB。
```

他のソースからのデータのロード例（例: ファイル）については、[こちら](/sql-reference/statements/insert-into)を参照してください。

データがロードされると、元の構造で行を表示するためにオプションでフォーマット `PrettyJSONEachRow` を使用してデータをクエリできます：

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

1 行がセットされました。経過時間: 0.009 秒。
```

## エラー処理 {#handling-errors}

時には、不良データが含まれることがあります。例えば、特定のカラムが正しいタイプを持っていなかったり、正しくフォーマットされていない JSON がある場合です。この場合、設定 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) を使用して、特定の行数を無視できるように設定できます。また、推論を支援するために [ヒント](/interfaces/schema-inference#schema_inference_hints)を提供することもできます。

## さらなる読書 {#further-reading}

データ型推論について詳しく知るには、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
