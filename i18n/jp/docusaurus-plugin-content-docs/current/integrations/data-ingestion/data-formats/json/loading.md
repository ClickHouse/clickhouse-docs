---
sidebar_label: 'JSONのロード'
sidebar_position: 20
title: 'JSONの操作'
slug: /integrations/data-formats/json/loading
description: 'JSONのロード'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'inserting']
score: 15
doc_type: 'guide'
---

# JSONのロード \{#loading-json\}

以下の例では、構造化および半構造化JSONデータをロードする非常にシンプルな例を示します。ネストされた構造を含むより複雑なJSONについては、ガイド[**JSONスキーマの設計**](/integrations/data-formats/json/schema)を参照してください。

## 構造化JSONのロード \{#loading-structured-json\}

このセクションでは、JSONデータが[`NDJSON`](https://github.com/ndjson/ndjson-spec)(改行区切りJSON)形式であることを前提としています。ClickHouseでは[`JSONEachRow`](/interfaces/formats/JSONEachRow)として知られており、列名と型が固定されている、つまり適切に構造化されていることを前提としています。`NDJSON`は、その簡潔さと効率的なスペース使用のため、JSONをロードするのに好ましい形式ですが、[入力と出力](/interfaces/formats/JSON)の両方で他の形式もサポートされています。

次のJSONサンプルを考えてみましょう。これは、[Python PyPIデータセット](https://clickpy.clickhouse.com/)の行を表しています:

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

このJSONオブジェクトをClickHouseにロードするには、テーブルスキーマを定義する必要があります。

この単純なケースでは、構造は静的で、列名はわかっており、その型は明確に定義されています。

ClickHouseは、キー名とその型が動的であるJSON型を通じて半構造化データをサポートしていますが、ここでは不要です。

:::note 可能な限り静的スキーマを優先する
列が固定された名前と型を持ち、新しい列が予期されない場合、本番環境では常に静的に定義されたスキーマを優先してください。

JSON型は、列の名前と型が変更される可能性がある高度に動的なデータに適しています。この型は、プロトタイピングとデータ探索にも役立ちます。
:::

これに対する単純なスキーマを以下に示します。**JSONキーは列名にマッピング**されます:

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

:::note 順序キー
`ORDER BY`句を介してここで順序キーを選択しました。順序キーとその選択方法の詳細については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouseは、いくつかの形式でJSONデータをロードでき、拡張子と内容から型を自動的に推論します。[S3関数](/sql-reference/table-functions/s3)を使用して、上記のテーブルのJSONファイルを読み取ることができます:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

ファイル形式を指定する必要がないことに注意してください。代わりに、グロブパターンを使用して、バケット内のすべての`*.json.gz`ファイルを読み取ります。ClickHouseは、ファイル拡張子と内容から形式が`JSONEachRow`(ndjson)であることを自動的に推論します。ClickHouseが検出できない場合は、パラメータ関数を介して形式を手動で指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルも圧縮されています。これはClickHouseによって自動的に検出され、処理されます。
:::

これらのファイルの行をロードするには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用できます:

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

[`FORMAT`句](/sql-reference/statements/select/format)を使用して、インラインで行をロードすることもできます。例:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

これらの例は、`JSONEachRow`形式の使用を前提としています。他の一般的なJSON形式もサポートされており、これらのロード例は[こちら](/integrations/data-formats/json/other-formats)で提供されています。

## 半構造化JSONのロード \{#loading-semi-structured-json\}

前の例では、既知のキー名と型を持つ静的なJSONをロードしました。これは必ずしもそうではありません - キーが追加されたり、型が変更されたりする可能性があります。これは、観測性データなどのユースケースで一般的です。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)型を通じてこれを処理します。

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

ここでのtags列は予測不可能であるため、モデル化することは不可能です。このデータをロードするには、前のスキーマを使用できますが、[`JSON`](/sql-reference/data-types/newjson)型の追加の`tags`列を提供します:

```sql
SET enable_json_type = 1;

CREATE TABLE pypi_with_tags
(
    `date` Date,
    `country_code` String,
    `project` String,
    `type` String,
    `installer` String,
    `python_minor` String,
    `system` String,
    `version` String,
    `tags` JSON
)
ENGINE = MergeTree
ORDER BY (project, date);
```

元のデータセットと同じアプローチを使用してテーブルにデータを入力します:

```sql
INSERT INTO pypi_with_tags SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')
```

```sql
INSERT INTO pypi_with_tags SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')

Ok.

0 rows in set. Elapsed: 255.679 sec. Processed 1.00 million rows, 29.00 MB (3.91 thousand rows/s., 113.43 KB/s.)
Peak memory usage: 2.00 GiB.

SELECT *
FROM pypi_with_tags
LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┬─tags─────────────────────────────────────────────────────┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"nsBM":"5194603446944555691"}                           │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"4zD5MYQz4JkP1QqsJIS":"0","name":"8881321089124243208"} │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┴──────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.149 sec.
```

データのロード時のパフォーマンスの違いに注意してください。JSON列は、挿入時に型推論を必要とし、複数の型を持つ列が存在する場合は追加のストレージも必要とします。JSON型は([JSONスキーマの設計](/integrations/data-formats/json/schema)を参照)、列を明示的に宣言するのと同等のパフォーマンスに設定できますが、デフォルトでは意図的に柔軟です。ただし、この柔軟性にはいくらかのコストが伴います。

### JSON型を使用するタイミング \{#when-to-use-the-json-type\}

次の場合にJSON型を使用します:

* 時間の経過とともに変更される可能性がある**予測不可能なキー**を持つデータ。
* **異なる型の値**を含むデータ(たとえば、パスに文字列が含まれる場合もあれば、数値が含まれる場合もある)。
* 厳密な型指定が実行可能でないスキーマの柔軟性が必要な場合。

データ構造がわかっており一貫している場合、データがJSON形式であっても、JSON型が必要になることはほとんどありません。具体的には、データに次のようなものがある場合:

* **既知のキーを持つフラットな構造**: 標準の列型(例: String)を使用します。
* **予測可能なネスト**: これらの構造にはTuple、Array、またはNested型を使用します。
* **異なる型を持つ予測可能な構造**: 代わりにDynamicまたはVariant型を検討してください。

上記の例で行ったように、アプローチを組み合わせることもできます。予測可能なトップレベルのキーには静的列を使用し、ペイロードの動的セクションには単一のJSON列を使用します。
