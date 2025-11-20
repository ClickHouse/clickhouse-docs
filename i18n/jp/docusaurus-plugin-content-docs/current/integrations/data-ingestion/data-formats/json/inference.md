---
title: 'JSON スキーマ推論'
slug: /integrations/data-formats/json/inference
description: 'JSON スキーマ推論の使用方法'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouse は JSON データの構造を自動的に判別できます。これにより、`clickhouse-local` を使ってディスク上や S3 バケット上の JSON データを直接クエリしたり、データを ClickHouse にロードする前にスキーマを自動生成したりできます。



## 型推論を使用する場合 {#when-to-use-type-inference}

- **一貫した構造** - 型を推論する元となるデータに、必要なすべてのキーが含まれていること。型推論は、[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)または[最大バイト数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)までデータをサンプリングすることに基づいています。サンプル後の追加カラムを含むデータは無視され、クエリできません。
- **一貫した型** - 特定のキーのデータ型に互換性があること。つまり、ある型から別の型への自動変換が可能である必要があります。

新しいキーが追加され、同じパスに対して複数の型が存在する可能性がある、より動的なJSONを扱う場合は、[「半構造化データと動的データの操作」](/integrations/data-formats/json/inference#working-with-semi-structured-data)を参照してください。


## 型の検出 {#detecting-types}

以下では、JSONが一貫した構造を持ち、各パスに対して単一の型を持つことを前提としています。

これまでの例では、`NDJSON`形式の[Python PyPIデータセット](https://clickpy.clickhouse.com/)のシンプル版を使用していました。このセクションでは、ネストされた構造を持つより複雑なデータセットである[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探索します。このデータセットには250万件の学術論文が含まれています。`NDJSON`として配布されるこのデータセットの各行は、公開された学術論文を表しています。以下に行の例を示します:

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
  "authors_parsed": [["Lemire", "Daniel", ""]]
}
```

このデータは、これまでの例よりもはるかに複雑なスキーマを必要とします。以下では、`Tuple`や`Array`などの複雑な型を導入しながら、このスキーマを定義するプロセスを概説します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz`のパブリックS3バケットに保存されています。

上記のデータセットにはネストされたJSONオブジェクトが含まれていることがわかります。ユーザーはスキーマを作成しバージョン管理すべきですが、推論機能によりデータから型を推測することができます。これにより、スキーマDDLを自動生成でき、手動で構築する必要がなくなり、開発プロセスが加速されます。

:::note 自動フォーマット検出
スキーマの検出に加えて、JSONスキーマ推論はファイル拡張子と内容からデータのフォーマットを自動的に推測します。その結果、上記のファイルは自動的にNDJSONとして検出されます。
:::

[s3関数](/sql-reference/table-functions/s3)を`DESCRIBE`コマンドと共に使用すると、推測される型が表示されます。

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

:::note nullの回避
多くのカラムがNullableとして検出されていることがわかります。絶対に必要でない限り、[Nullable型の使用は推奨しません](/sql-reference/data-types/nullable#storage-features)。[schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)を使用して、Nullableが適用されるタイミングの動作を制御できます。
:::

ほとんどのカラムが自動的に`String`として検出され、`update_date`カラムは正しく`Date`として検出されていることがわかります。`versions`カラムはオブジェクトのリストを格納するために`Array(Tuple(created String, version String))`として作成され、`authors_parsed`はネストされた配列のために`Array(Array(String))`として定義されています。


:::note 型検出の制御
日付と日時の自動検出は、それぞれ設定 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) および [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) によって制御できます（どちらもデフォルトで有効です）。オブジェクトをタプルとして推論する処理は、設定 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects) によって制御されます。数値の自動検出など、JSON のスキーマ推論を制御する他の設定については[こちら](/interfaces/schema-inference#text-formats)を参照してください。
:::



## JSONのクエリ {#querying-json}

以下では、JSONが一貫した構造を持ち、各パスに対して単一の型を持つことを前提としています。

スキーマ推論を利用して、JSONデータをその場でクエリすることができます。以下では、日付と配列が自動的に検出される機能を活用して、各年のトップ著者を見つけます。

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

スキーマ推論により、スキーマを指定せずにJSONファイルをクエリでき、アドホックなデータ分析タスクを高速化できます。


## テーブルの作成 {#creating-tables}

スキーマ推論を利用してテーブルのスキーマを作成できます。以下の`CREATE AS EMPTY`コマンドは、テーブルのDDLを推論し、テーブルを作成します。このコマンドではデータの読み込みは行われません:

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

上記がこのデータの正しいスキーマです。スキーマ推論は、データをサンプリングし、行ごとにデータを読み取ることに基づいています。カラム値はフォーマットに従って抽出され、再帰的パーサーとヒューリスティックを使用して各値の型が決定されます。スキーマ推論でデータから読み取られる最大行数とバイト数は、設定[`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)(デフォルトは25000)と[`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)(デフォルトは32MB)によって制御されます。検出が正しくない場合、ユーザーは[こちら](/operations/settings/formats#schema_inference_make_columns_nullable)で説明されているヒントを提供できます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、S3上のファイルを使用してテーブルスキーマを作成しています。単一行のスニペットからスキーマを作成したい場合もあります。これは、以下に示すように[format](/sql-reference/table-functions/format)関数を使用して実現できます:

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


## JSONデータの読み込み {#loading-json-data}

以下では、JSONが一貫した構造を持ち、各パスに対して単一の型を持つことを前提としています。

前述のコマンドでデータを読み込むためのテーブルが作成されました。次の`INSERT INTO SELECT`を使用して、テーブルにデータを挿入できます:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

ファイルなど他のソースからデータを読み込む例については、[こちら](/sql-reference/statements/insert-into)を参照してください。

読み込みが完了したら、データをクエリできます。オプションで`PrettyJSONEachRow`フォーマットを使用して、行を元の構造で表示することもできます:

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

データに不備がある場合があります。例えば、特定のカラムの型が正しくない場合や、JSONオブジェクトのフォーマットが不適切な場合などです。このような場合、[`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num)および[`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)の設定を使用することで、データが挿入エラーを引き起こす際に一定数の行をスキップできます。また、スキーマ推論を補助するために[ヒント](/operations/settings/formats#schema_inference_hints)を指定することも可能です。


## 半構造化データと動的データの操作 {#working-with-semi-structured-data}

前の例では、既知のキー名と型を持つ静的なJSONを使用しました。しかし、実際にはそうでない場合が多く、キーが追加されたり、その型が変更されたりすることがあります。これは、Observabilityデータなどのユースケースでよく見られます。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)型を通じてこれに対応しています。

JSONが多数の一意なキーを持ち、同じキーに対して複数の型が存在する高度に動的なものである場合、データが改行区切りのJSON形式であっても、`JSONEachRow`でスキーマ推論を使用して各キーに対してカラムを推論しようとすることは推奨しません。

上記の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の拡張版から次の例を考えてみましょう。ここでは、ランダムなキーと値のペアを持つ任意の`tags`カラムを追加しています。

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

このデータのサンプルは、改行区切りのJSON形式で公開されています。このファイルに対してスキーマ推論を試みると、パフォーマンスが低く、非常に冗長な応答が返されることがわかります。

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- 結果は簡潔性のため省略

9 rows in set. Elapsed: 127.066 sec.
```

ここでの主な問題は、推論に`JSONEachRow`形式が使用されていることです。これは**JSON内の各キーに対してカラム型を推論**しようとするもので、[`JSON`](/sql-reference/data-types/newjson)型を使用せずにデータに静的スキーマを適用しようとしています。

数千の一意なカラムがある場合、この推論アプローチは遅くなります。代替手段として、ユーザーは`JSONAsObject`形式を使用できます。

`JSONAsObject`は、入力全体を単一のJSONオブジェクトとして扱い、[`JSON`](/sql-reference/data-types/newjson)型の単一カラムに格納するため、高度に動的またはネストされたJSONペイロードに適しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

この形式は、カラムが調整できない複数の型を持つ場合にも不可欠です。例えば、次の改行区切りのJSONを含む`sample.json`ファイルを考えてみましょう。

```json
{"a":1}
{"a":"22"}
```

この場合、ClickHouseは型の衝突を強制的に変換し、カラム`a`を`Nullable(String)`として解決できます。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 型の強制変換
この型の強制変換は、複数の設定を通じて制御できます。上記の例は、[`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)設定に依存しています。
:::

ただし、一部の型は互換性がありません。次の例を考えてみましょう。

```json
{"a":1}
{"a":{"b":2}}
```

この場合、いかなる形式の型変換も不可能です。したがって、`DESCRIBE`コマンドは失敗します。

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

```


サーバー (バージョン 24.12.1) から例外を受信しました:
コード: 636. DB::Exception: sql-clickhouse.clickhouse.com:9440 から受信。DB::Exception: テーブル構造を JSON 形式のファイルから抽出できません。エラー:
コード: 53. DB::Exception: 行 1 のカラム &#39;a&#39; に対して自動的に推論された型 Tuple(b Int64) が、前の行で定義された型 Int64 と異なります。このカラムの型は、設定 schema&#95;inference&#95;hints を使用して指定できます。

````

この場合、`JSONAsObject`は各行を単一の[`JSON`](/sql-reference/data-types/newjson)型として扱います(同じカラムが複数の型を持つことをサポートします)。これは重要です:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
````


## 参考資料 {#further-reading}

データ型推論の詳細については、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
