---
'title': 'JSON スキーマ推論'
'slug': '/integrations/data-formats/json/inference'
'description': 'JSON スキーマ推論の使用方法'
'keywords':
- 'json'
- 'schema'
- 'inference'
- 'schema inference'
'doc_type': 'guide'
---

ClickHouseは、JSONデータの構造を自動的に判別することができます。これにより、`clickhouse-local`やS3バケット上のJSONデータを直接クエリすることが可能であり、またClickHouseにデータをロードする前にスキーマを自動的に作成することも可能です。

## 型推論を使用するタイミング {#when-to-use-type-inference}

* **一貫した構造** - タイプを推論するためのデータには、興味のある全てのキーが含まれています。型推論は、[最大行数](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)または[バイト数](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)までデータをサンプリングすることに基づいています。サンプル以降のデータは、追加のカラムを含む場合には無視され、クエリすることはできません。
* **一貫したタイプ** - 特定のキーのデータ型は互換性がある必要があります。すなわち、一方のタイプから他方のタイプに自動的に変換できなければなりません。

もしより動的なJSONがあり、新しいキーが追加され、同じパスに対して複数のタイプが存在する場合は、["半構造化データや動的データの扱い"](/integrations/data-formats/json/inference#working-with-semi-structured-data)を参照してください。

## 型の検出 {#detecting-types}

以下は、JSONが一貫した構造を持ち、各パスに対して単一の型があると仮定しています。

前の例では、`NDJSON`形式の単純な[Python PyPIデータセット](https://clickpy.clickhouse.com/)を使用しました。このセクションでは、ネストされた構造を持つより複雑なデータセット、すなわち250万件の学術論文を含む[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を探ります。このデータセットの各行は、発表された学術論文を表しています。以下に例となる行を示します。

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

このデータは、前の例よりもはるかに複雑なスキーマを必要とします。スキーマを定義するプロセスを以下に示し、`Tuple`や`Array`などの複雑なタイプを導入します。

このデータセットは、公共のS3バケット` s3://datasets-documentation/arxiv/arxiv.json.gz `に保存されています。

上記のデータセットにはネストされたJSONオブジェクトが含まれていることがわかります。ユーザーはスキーマを策定し、バージョン管理を行うべきですが、推論によりデータから型を推定できます。これにより、スキーマDDLが自動生成され、手動で構築する必要がなくなり、開発プロセスが加速されます。

:::note 自動フォーマット検出
スキーマを検出するだけでなく、JSONスキーマの推論は、ファイル拡張子および内容からデータのフォーマットも自動的に推測します。上記のファイルは、結果として自動的にNDJSONとして検出されます。
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
:::note NULLを避ける
多くのカラムがNullableとして検出されていることがわかります。絶対に必要でない場合は、[Nullableタイプの使用を推奨しません](/sql-reference/data-types/nullable#storage-features)。Nullableが適用される際の動作を制御するには、[schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)を使用できます。
:::

ほとんどのカラムは自動的に`String`として検出され、正しく`update_date`カラムは`Date`として検出されました。`versions`カラムはオブジェクトのリストを保存するために`Array(Tuple(created String, version String))`として作成され、`authors_parsed`はネストされた配列用に`Array(Array(String))`として定義されています。

:::note 型検出の制御
日付と日時の自動検出は、設定[`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates)および[`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)を通じて制御できます（両方ともデフォルトで有効です）。オブジェクトをタプルとして推論することは、設定[`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)によって制御されます。数字の自動検出など、JSONのスキーマ推論を制御する他の設定については、[こちら](/interfaces/schema-inference#text-formats)を参照してください。
:::

## JSONのクエリ {#querying-json}

以下は、JSONが一貫した構造を持ち、各パスに対して単一の型があると仮定しています。

スキーマ推論を利用して、インプレースでJSONデータをクエリすることができます。以下では、日付と配列が自動的に検出される事実を利用して、各年のトップ著者を見つけます。

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

スキーマ推論を使用することで、スキーマを指定することなくJSONファイルをクエリできるため、AD-HOCデータ分析タスクが加速されます。

## テーブルの作成 {#creating-tables}

スキーマ推論を利用して、テーブルのスキーマを作成できます。以下の`CREATE AS EMPTY`コマンドを実行すると、テーブルのDDLが推論され、テーブルが作成されます。これはデータをロードしません：

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

上記がこのデータの正しいスキーマです。スキーマ推論は、データをサンプリングし、行ごとにデータを読み込むことに基づいています。カラム値はフォーマットに従って抽出され、各値の型を決定するために再帰的なパーサーおよびヒューリスティックが使用されます。スキーマ推論においてデータから読み取る最大行数とバイト数は、設定[`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference)(デフォルトは25000)と[`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)(デフォルトは32MB)によって制御されます。検出が正しくない場合、ユーザーは[こちら](/operations/settings/formats#schema_inference_make_columns_nullable)で説明されているようにヒントを提供することができます。

### スニペットからのテーブル作成 {#creating-tables-from-snippets}

上記の例では、S3上のファイルを使用してテーブルスキーマを作成しました。ユーザーは単一行のスニペットからスキーマを作成したい場合があります。これは、[format](/sql-reference/table-functions/format)関数を使用することで実現できます。以下のように：

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

以下は、JSONが一貫した構造を持ち、各パスに対して単一の型があると仮定しています。

前のコマンドは、データをロードするためのテーブルを作成しました。以下の`INSERT INTO SELECT`を使用して、テーブルにデータを挿入できます：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

他のソースからデータをロードする例については、[こちら](/sql-reference/statements/insert-into)を参照してください。

データがロードされたら、元の構造で行を表示するためにオプションで`PrettyJSONEachRow`フォーマットを使用してクエリを実行できます：

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

## エラー処理 {#handling-errors}

時には、不正なデータが存在する場合があります。特定のカラムが正しい型を持っていないか、不適切にフォーマットされたJSONオブジェクトが含まれていることがあります。そのためには、設定[`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num)および[`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)を使用して、データが挿入エラーを引き起こす場合に無視できる特定の行数を許可できます。さらに、推論を支援するために[ヒント](/operations/settings/formats#schema_inference_hints)を提供することができます。

## 半構造化データおよび動的データの扱い {#working-with-semi-structured-data}

前の例では、キー名とタイプがよく知られている静的なJSONを使用しましたが、これが常に当てはまるわけではありません。キーが追加されたり、その型が変わったりすることがあります。これは、観測可能性データなどのユースケースで一般的です。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)型を通じてこれを処理します。

JSONが非常に動的で、多くのユニークなキーと同じキーに対する複数の型が存在することがわかっている場合は、`JSONEachRow`を使用して型推論を試みて、それぞれのキーにカラムを推定することはお勧めしません。たとえデータが改行区切りのJSON形式であってもです。

以下は、上記の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の拡張バージョンからの例です。ここでは、任意の`tags`カラムにランダムなキー値ペアを追加しました。

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

このデータのサンプルは、改行区切りのJSON形式で公開されています。このファイルでスキーマ推論を試みると、パフォーマンスが悪く、非常に冗長な応答が返されることがわかります：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

ここでの主な問題は、推論に`JSONEachRow`フォーマットが使用されていることです。これは**JSON内の各キーごとにカラム型を推測しようとします** - 実質的に、[`JSON`](/sql-reference/data-types/newjson)型を使用せずにデータに静的なスキーマを適用しようとしています。

ユニークなカラムが何千もある場合、このアプローチの推論は遅くなります。代わりに、ユーザーは`JSONAsObject`フォーマットを使用できます。

`JSONAsObject`は、全ての入力を単一のJSONオブジェクトとして扱い、型[`JSON`](/sql-reference/data-types/newjson)の単一カラムに保存します。これにより、高度に動的またはネストされたJSONペイロードに対してより適しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

このフォーマットは、カラムが調整できない複数の型を持つ場合にも重要です。たとえば、以下の改行区切りのJSONを持つ`sample.json`ファイルを考えてみてください：

```json
{"a":1}
{"a":"22"}
```

この場合、ClickHouseは型の衝突を強制的に解決し、カラム`a`を`Nullable(String)`として解決できることがわかります。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 型の強制変換
この型の強制変換は、いくつかの設定を通じて制御できます。上記の例は、設定[`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)に依存しています。
:::

ただし、一部の型は互換性がありません。次の例を考えてみてください：

```json
{"a":1}
{"a":{"b":2}}
```

この場合、ここでの型変換のどの形式も不可能です。そのため、`DESCRIBE`コマンドは失敗します：

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

この場合、`JSONAsObject`は各行を単一の[`JSON`](/sql-reference/data-types/newjson)型として扱います（これは同じカラムが複数の型を持つことをサポートします）。これは不可欠です：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## さらに読む {#further-reading}

データ型推論について詳しく知りたい場合は、[こちら](/interfaces/schema-inference)のドキュメントページを参照してください。
