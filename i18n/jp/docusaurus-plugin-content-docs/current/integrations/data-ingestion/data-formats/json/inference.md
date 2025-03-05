---
title: JSONスキーマ推論
slug: /integrations/data-formats/json/inference
description: JSONスキーマ推論の使用方法
keywords: [json, スキーマ, 推論, スキーマ推論]
---

ClickHouseは、JSONデータの構造を自動的に判断することができます。これは、`clickhouse-local`やS3バケットにあるディスク上のJSONデータを直接クエリするために使用したり、データをClickHouseにロードする前にスキーマを自動的に作成するために使用できます。

## 型推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - 型を推論するためのデータには、興味のあるすべてのカラムが含まれている必要があります。型推論の後に追加されたカラムを持つデータは無視され、クエリを実行することができません。
* **一貫した型** - 特定のカラムのデータ型は互換性が必要です。

:::note 重要
動的なJSONがあり、新しいキーがスキーマを変更する十分な警告なしに追加される場合（例：Kubernetesのログ内のラベル）、[**JSONスキーマの設計**](/integrations/data-formats/json/schema)を読むことをお勧めします。
:::

## 型の検出 {#detecting-types}

以前の例では、NDJSON形式の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の簡単なバージョンを使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセット、すなわち250万件の学術論文を含む[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探ります。このデータセットの各行は、公開された学術論文を表します。以下に例となる行を示します。

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

このデータには、以前の例よりもはるかに複雑なスキーマが必要です。以下に、このスキーマを定義するプロセスを概説し、`Tuple`や`Array`といった複雑な型を紹介します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz`という公共のS3バケットに保存されています。

上記のデータセットには、ネストされたJSONオブジェクトが含まれていることがわかります。ユーザーはスキーマを草案し、バージョン管理を行うべきですが、推論によりデータから型が推測されるため、スキーマDDLを自動生成することができます。これにより、手動で構築する必要がなくなり、開発プロセスが加速されます。

:::note 自動フォーマット検出
スキーマを検出するだけでなく、JSONスキーマ推論はファイルの拡張子と内容からデータのフォーマットを自動的に推測します。上記のファイルは、自動的にNDJSONとして検出されます。
:::

[s3関数](/sql-reference/table-functions/s3)を使用して`DESCRIBE`コマンドを実行すると、推論される型が表示されます。

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
:::note Nullを避ける
多くのカラムがNullableとして検出されていることがわかります。絶対に必要でない限り、[Nullable](/sql-reference/data-types/nullable#storage-features)型の使用は推奨されません。Nullableが適用される際の挙動を制御するために、[schema_inference_make_columns_nullable](/interfaces/schema-inference#schema_inference_make_columns_nullable)を使用できます。
:::

ほとんどのカラムが自動的に`String`として検出され、`update_date`カラムが`Date`として正しく検出されています。`versions`カラムは、オブジェクトのリストを格納するために`Array(Tuple(created String, version String))`として作成され、`authors_parsed`はネストされた配列のために`Array(Array(String))`として定義されています。

:::note 型検出の制御
日付と日時の自動検出は、設定[`input_format_try_infer_dates`](/interfaces/schema-inference#input_format_try_infer_dates)および[`input_format_try_infer_datetimes`](/interfaces/schema-inference#input_format_try_infer_datetimes)で制御できます（どちらもデフォルトで有効）。オブジェクトをタプルとして推論することは、設定[`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)で制御されます。数字の自動検出など、JSONのスキーマ推論を制御するその他の設定は[こちら](/interfaces/schema-inference#text-formats)にあります。
:::

## JSONのクエリ {#querying-json}

私たちは、スキーマ推論を使用してJSONデータをその場でクエリできます。以下に、日付と配列が自動的に検出されることを利用して、各年のトップ著者を見つけるクエリを示します。

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

18件の行がセットにあります。経過時間: 20.172秒。処理した行数: 252万、サイズ: 1.39GB (124.72千行/秒、68.76MB/秒)。
```

スキーマ推論を利用することで、スキーマを指定することなくJSONファイルをクエリでき、アドホックデータ分析タスクを加速します。

## テーブルの作成 {#creating-tables}

スキーマ推論に基づいてテーブルのスキーマを作成できます。次の`CREATE AS EMPTY`コマンドを実行すると、テーブルのDDLが推測され、テーブルが作成されます。これにより、データはロードされません：

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

テーブルスキーマを確認するために、`SHOW CREATE TABLE`コマンドを使用します：

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

上記はこのデータの正しいスキーマです。スキーマ推論は、データをサンプリングし、行を逐次的に読み取ることに基づいています。カラム値はフォーマットに応じて抽出され、再帰的パーサーとヒューリスティックを使用して各値の型を決定します。スキーマ推論でデータから読み取る最大行数とバイト数は、設定[`input_format_max_rows_to_read_for_schema_inference`](/interfaces/schema-inference#input_format_max_rows_to_read_for_schema_inferenceinput_format_max_bytes_to_read_for_schema_inference)（デフォルトは25000）と[`input_format_max_bytes_to_read_for_schema_inference`](/interfaces/schema-inference#input_format_max_rows_to_read_for_schema_inferenceinput_format_max_bytes_to_read_for_schema_inference)（デフォルトは32MB）によって制御されます。検出が正しくない場合、ユーザーは[こちら](/interfaces/schema-inference#schema_inference_hints)に記載されたヒントを提供できます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、S3のファイルを使用してテーブルスキーマを作成しました。ユーザーは単一行のスニペットからスキーマを作成したい場合があります。これを達成するために、[format](/sql-reference/table-functions/format)関数を使用して次のように実行します：

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

前のコマンドでデータをロードできるテーブルを作成しました。次に、次の`INSERT INTO SELECT`を使用してテーブルにデータを挿入できます：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 行がセットにあります。経過時間: 38.498秒。処理した行数: 252万、サイズ: 1.39GB (65.35千行/秒、36.03MB/秒)。
ピークメモリ使用量: 870.67 MiB。
```

他のソースからデータをロードする例（ファイルなど）は[こちら](/sql-reference/statements/insert-into)で確認できます。

データをロードしたら、オプションで`PrettyJSONEachRow`フォーマットを使用して元の構造で行を表示できます：

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

1 行がセットにあります。経過時間: 0.009秒。
```

## エラー処理 {#handling-errors}

時には、悪いデータが含まれることがあります。特定のカラムが正しい型を持っていない場合や、正しくフォーマットされたJSONでない場合です。このような場合、設定[`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)を使用して、データが挿入エラーを引き起こす場合に無視する行数を一定数許可できます。また、推論を助けるために[ヒント](/interfaces/schema-inference#schema_inference_hints)を提供することも可能です。

## さらなる学習 {#further-reading}

データ型推論について詳しく学ぶには、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
