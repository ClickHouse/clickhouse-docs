---
title: 'JSON schema inference'
slug: '/integrations/data-formats/json/inference'
description: 'How to use JSON schema inference'
keywords:
- 'json'
- 'schema'
- 'inference'
- 'schema inference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

ClickHouseは、JSONデータの構造を自動的に特定できます。これにより、`clickhouse-local`やS3バケットを介してディスク上のJSONデータを直接クエリすることができ、また、ClickHouseにデータを読み込む前にスキーマを自動的に作成することも可能です。

## 型推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - タイプを推測するためのデータには、興味のあるすべてのキーが含まれています。タイプ推論は、[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)または[バイト数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)までのデータをサンプリングすることに基づいています。サンプル後のデータで追加のカラムがある場合、それらは無視され、クエリすることはできません。
* **一貫した型** - 特定のキーのデータ型は互換性がある必要があります。つまり、一方の型を他方に自動的に強制変換できる必要があります。

もし、新しいキーが追加される動的なJSONがある場合や、同じパスに対して複数の型が可能な場合は、["非構造化データと動的データの扱い"](/integrations/data-formats/json/inference#working-with-semi-structured-data)を参照してください。

## 型の検出 {#detecting-types}

以下の内容は、JSONが一貫した構造を持ち、各パスに対して単一の型を持つと仮定しています。

前述の例では、`NDJSON`形式の[Python PyPIデータセット](https://clickpy.clickhouse.com/)のシンプルなバージョンを使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセット－2.5百万の学術論文を含む[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探ります。このデータセットの各行は、公開された学術論文を表しています。以下に例を示します：

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

このデータには、前の例よりも遥かに複雑なスキーマが必要です。以下にこのスキーマの定義プロセスを概説し、`Tuple`や`Array`などの複雑な型を紹介します。

このデータセットは、`s3://datasets-documentation/arxiv/arxiv.json.gz`というパブリックS3バケットに保存されています。

上記のデータセットにはネストされたJSONオブジェクトが含まれていることがわかります。ユーザーはスキーマをドラフトし、バージョン管理する必要がありますが、推論によりデータから型を推測できます。これにより、スキーマのDDLが自動生成され、手動で作成する必要がなくなり、開発プロセスが加速します。

:::note 自動フォーマット検出
スキーマを検出するだけでなく、JSONスキーマ推論はファイル拡張子と内容から自動的にデータのフォーマットを推測します。上記のファイルは、その結果としてNDJSONとして自動的に検出されます。
:::

[s3関数](/sql-reference/table-functions/s3)を使用した`DESCRIBE`コマンドは、推測される型を示します。

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
多くのカラムがNullableとして検出されていることがわかります。私たちは[Nullable](/sql-reference/data-types/nullable#storage-features)型の使用を必要な場合を除いて推奨していません。[schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)を使用して、Nullableが適用される場合の動作を制御できます。
:::

ほとんどのカラムは自動的に`String`として検出され、`update_date`カラムは正しく`Date`として検出されました。`versions`カラムは`Array(Tuple(created String, version String))`として生成され、オブジェクトのリストを保存します。`authors_parsed`はネストされた配列のために`Array(Array(String))`として定義されています。

:::note 型検出の制御
日付や日時の自動検出は、それぞれ[`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates)および[`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)の設定で制御できます（両方ともデフォルトで有効）。オブジェクトをタプルとして推測することは、[`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)の設定で制御されます。他のJSONのスキーマ推論を制御する設定、数値の自動検出などは、[こちら](/interfaces/schema-inference#text-formats)で見つけることができます。
:::

## JSONのクエリ {#querying-json}

以下の内容は、JSONが一貫した構造を持ち、各パスに対して単一の型を持つと仮定しています。

スキーマ推論に依存して、JSONデータをその場でクエリできます。以下では、日付と配列が自動的に検出されるという事実を利用して、各年のトップ著者を見つけます。

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

18行の結果がセットに含まれています。経過時間: 20.172秒。処理された行数: 252万、サイズ: 1.39 GB (124.72千行/秒、68.76 MB/秒)
```

スキーマ推論により、スキーマを指定することなくJSONファイルをクエリでき、アドホックなデータ分析タスクを加速することができます。

## テーブルの作成 {#creating-tables}

スキーマ推論に依存して、テーブルのスキーマを作成できます。以下の`CREATE AS EMPTY`コマンドは、テーブルのDDLを推論させ、テーブルを作成します。これはデータを読み込むことはありません：

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
```

上記がこのデータの正しいスキーマです。スキーマ推論はデータをサンプリングして読み取り、行ごとにデータを読み取ります。カラムの値はフォーマットに従って抽出され、型を決定するために再帰的なパーサーとヒューリスティクスが使用されます。スキーマ推論において読み取る最大行数とバイト数は、設定[`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)（デフォルト25000行）および[`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)（デフォルト32MB）で制御されます。検出が正しくない場合、ユーザーは[こちら]( /operations/settings/formats#schema_inference_make_columns_nullable)に記載されているようにヒントを提供できます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、S3上のファイルを使用してテーブルスキーマを作成しました。ユーザーは単一の行スニペットからスキーマを作成したいかもしれません。これは、以下のように[format](/sql-reference/table-functions/format)関数を使用して達成できます：

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

以下の内容は、JSONが一貫した構造を持ち、各パスに対して単一の型を持つと仮定しています。

前述のコマンドで、データを読み込むことができるテーブルが作成されました。次に、以下のように`INSERT INTO SELECT`を使用してデータをテーブルに挿入できます：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0行の結果がセットに含まれています。経過時間: 38.498秒。処理された行数: 252万、サイズ: 1.39 GB (65.35千行/秒、36.03 MB/秒)
ピークメモリ使用量: 870.67 MiB.
```

他のソースからのデータの読み込みの例（例：ファイル）については、[こちら]( /sql-reference/statements/insert-into)を参照してください。

データが読み込まれたら、元の構造で行を表示するために形式`PrettyJSONEachRow`を使用してデータをクエリできます：

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

1行の結果がセットに含まれています。経過時間: 0.009秒。
```

## エラーの処理 {#handling-errors}

時には、不正なデータを持つことがあります。特定のカラムが正しい型でない場合や、不正にフォーマットされたJSONオブジェクトが考えられます。その場合、設定[`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num)および[`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)を使用して、データが挿入エラーを引き起こす場合に無視できる行の数を許可できます。また、推論を補助するために[ヒント](/operations/settings/formats#schema_inference_hints)を提供することができます。

## 非構造化データと動的データの扱い {#working-with-semi-structured-data}

<PrivatePreviewBadge/>

前述の例では、静的でよく知られたキー名と型を持つJSONを使用しました。しかし、これはしばしば当てはまりません。キーが追加されたり、型が変更されたりすることがあります。これは、可観測性データなどのユースケースで一般的です。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)型を通じてこれに対応します。

もしあなたのJSONが非常に動的で、ユニークなキーが多数あり、同じキーに対して複数の型がある場合、`JSONEachRow`でスキーマ推論を使用して各キーのカラムを推測することはお勧めしません – たとえデータが改行区切りJSON形式であっても。

以下は、前述の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の拡張バージョンの例です。ここでは、ランダムなキー値ペアを持つ任意の`tags`カラムを追加しました。

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

このデータのサンプルは改行区切りJSON形式で公開されています。このファイルでスキーマ推論を試みると、パフォーマンスが悪く、非常に冗長な応答が得られることがわかります：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- 結果は簡略化のため省略

9行の結果がセットに含まれています。経過時間: 127.066秒。
```

ここでの主な問題は、スキーマ推論のために`JSONEachRow`フォーマットが使用されていることです。これは、JSONの**各キーに対してカラム型を推測しようとします** – つまり、[`JSON`](/sql-reference/data-types/newjson)型を使用せずにデータに静的なスキーマを適用しようとすることです。 

ユニークなカラムが何千もあるため、この推論のアプローチは遅くなります。代わりに、ユーザーは`JSONAsObject`フォーマットを使用できます。

`JSONAsObject`は、入力全体を単一のJSONオブジェクトとして扱い、それを[`JSON`](/sql-reference/data-types/newjson)型の単一カラムに保存します。これにより、非常に動的またはネストされたJSONペイロードに適しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1行の結果がセットに含まれています。経過時間: 0.005秒。
```

このフォーマットは、カラムに複数の型があり、それらが調和できない場合にも重要です。たとえば、次のような改行区切りJSONを持つ`sample.json`ファイルを考えてください：

```json
{"a":1}
{"a":"22"}
```

この場合、ClickHouseは型の衝突を強制変換し、カラム`a`を`Nullable(String)`として解決できます。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1行の結果がセットに含まれています。経過時間: 0.081秒。
```

:::note 型強制変換
この型の強制変換は、いくつかの設定を通じて制御できます。上記の例は、設定[`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)に依存しています。
:::

しかし、互換性のない型も存在します。次の例を考えてみてください：

```json
{"a":1}
{"a":{"b":2}}
```

この場合、ここでの型変換は不可能です。したがって、`DESCRIBE`コマンドは失敗します：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

経過時間: 0.755秒。

サーバーから受け取った例外 (バージョン 24.12.1):
コード: 636. DB::Exception: sql-clickhouse.clickhouse.com:9440 から受信しました。DB::Exception: JSON形式ファイルからテーブル構造を抽出できません。エラー:
コード: 53. DB::Exception: 行1のカラム'a'に対して自動的に定義された型Tuple(b Int64)が、前の行で定義された型: Int64 と異なります。このカラムの型を設定schema_inference_hintsを使用して指定できます。
```

この場合、`JSONAsObject`は各行を単一の[`JSON`](/sql-reference/data-types/newjson)型としてみなします（同じカラムが複数の型を持つことをサポートします）。これは不可欠です：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1行の結果がセットに含まれています。経過時間: 0.010秒。
```

## さらなる情報 {#further-reading}

データ型の推論についてもっと知りたい場合は、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
