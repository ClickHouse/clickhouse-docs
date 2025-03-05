---
title: JSON スキーマの推測
slug: /integrations/data-formats/json/inference
description: JSON スキーマの推測の使用方法
keywords: [json, schema, inference, schema inference]
---

ClickHouseは、JSONデータの構造を自動的に特定できます。これを使用して、`clickhouse-local`やS3バケット上のディスクでJSONデータを直接クエリしたり、データをClickHouseにロードする前にスキーマを自動的に作成することができます。

## 型推測を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - 型を推測するデータには、あなたが興味を持つすべてのカラムが含まれている必要があります。型推測後に追加されたカラムを含むデータは無視され、クエリを実行できません。
* **一貫した型** - 特定のカラムのデータ型は互換性がある必要があります。

:::note 重要
より動的なJSON(例えば、Kubernetesのログで十分な通知なしに新しいキーが追加される場合)をお持ちの場合は、[**JSONスキーマの設計**](/integrations/data-formats/json/schema)を読むことをお勧めします。
:::

## 型の検出 {#detecting-types}

以前の例では、NDJSON形式の[Python PyPIデータセット](https://clickpy.clickhouse.com/)のシンプルなバージョンを使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセット - 250万件の学術論文を含む[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探ります。このデータセットの各行は、公開された学術論文を表します。以下に例となる行を示します:

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

このデータは、以前の例よりもはるかに複雑なスキーマを必要とします。以下に、このスキーマを定義するプロセスを示し、`Tuple`や`Array`のような複雑な型を導入します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz`の公共S3バケットに保存されています。

上記のデータセットには、ネストされたJSONオブジェクトが含まれています。ユーザーはスキーマをドラフトしてバージョン管理する必要がありますが、推測によりデータから型を推測できます。これにより、スキーマDDLが自動生成され、手動でスキーマを構築する必要がなくなり、開発プロセスが加速します。

:::note 自動フォーマット検出
スキーマを検出するだけでなく、JSONスキーマ推測はファイル拡張子と内容からデータのフォーマットを自動的に推測します。上記のファイルは、その結果NDJSONとして自動的に検出されます。
:::

[s3 function](/sql-reference/table-functions/s3)を使用し、`DESCRIBE`コマンドを実行すると、推測される型が表示されます。

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
:::note NULLを避ける
多くのカラムがNullableとして検出されているのがわかります。絶対に必要でない限り、[Nullable](/sql-reference/data-types/nullable#storage-features)型の使用はお勧めできません。[schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)を使用して、Nullableが適用される状況を制御できます。
:::

ほとんどのカラムが自動的に`String`として検出され、`update_date`カラムは正しく`Date`として検出されています。`versions`カラムはオブジェクトのリストを格納するために`Array(Tuple(created String, version String))`として作成され、`authors_parsed`はネストされた配列のために`Array(Array(String))`として定義されています。

:::note 型検出の制御
日付や日時の自動検出は、設定[`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates)および[`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)を通じて制御できます（どちらもデフォルトで有効）。オブジェクトをタプルとして推測することは、設定[`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)によって制御されます。数字の自動検出など、JSONのスキーマ推測を制御する他の設定に関しては、[こちら](/interfaces/schema-inference#text-formats)で確認できます。
:::

## JSONのクエリ {#querying-json}

スキーマ推測を使用して、JSONデータをそのままクエリできます。以下では、日付と配列が自動的に検出されることを利用して、各年の主要な著者を見つけます。

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

18行のセット。経過時間: 20.172秒。2.52百万行を処理しました。1.39 GB (124.72千行/s、68.76 MB/s)
```

スキーマ推測により、スキーマを指定することなくJSONファイルをクエリでき、アドホックデータ分析のタスクを加速します。

## テーブルの作成 {#creating-tables}

スキーマ推測を利用してテーブルのスキーマを作成できます。以下の`CREATE AS EMPTY`コマンドは、テーブルのDDLを推測し、テーブルを作成します。これはデータをロードしません:

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
SETTINGS index_granularity = 8192
```

上記は、このデータに対する正しいスキーマです。スキーマ推測は、データをサンプリングし、行ごとにデータを読み取ることに基づいています。カラム値はフォーマットに応じて抽出され、再帰的なパーサーとヒューリスティックスを使用して各値の型を決定します。スキーマ推測で読み取る最大行数とバイト数は、それぞれの設定[`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)（デフォルト25000行）および[`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)（デフォルト32MB）によって制御されます。検出が正しくない場合、ユーザーは[こちら](/operations/settings/formats#schema_inference_make_columns_nullable)で説明されているヒントを提供できます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、S3上のファイルを使用してテーブルスキーマを作成しました。ユーザーは、1行のスニペットからスキーマを作成したい場合があります。これは、以下のように[format](/sql-reference/table-functions/format)関数を使用することで実現できます:

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

前述のコマンドでデータをロードできるテーブルが作成されました。次に、以下の`INSERT INTO SELECT`を使用して、テーブルにデータを挿入できます:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0行のセット。経過時間: 38.498秒。2.52百万行を処理しました。1.39 GB (65.35千行/s、36.03 MB/s)
ピークメモリ使用量: 870.67 MiB。
```

他のソースからデータをロードする例（例えばファイルなど）については、[こちら](/sql-reference/statements/insert-into)を参照してください。

データがロードされたら、クエリを実行でき、オプションで`PrettyJSONEachRow`形式を使用して、元の構造のまま行を表示できます:

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

1行のセット。経過時間: 0.009秒。
```

## エラー処理 {#handling-errors}

時には、悪いデータが存在することがあります。特定のカラムが正しい型を持っていないか、不適切にフォーマットされたJSONがあります。この場合、設定[`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)を使用して、データが挿入エラーを引き起こす場合に無視される行数を許可できます。さらに、推測を補助するために[ヒント](/operations/settings/formats#schema_inference_hints)を提供できます。

## さらなる読み物 {#further-reading}

データ型推測について詳しく学びたい場合は、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
