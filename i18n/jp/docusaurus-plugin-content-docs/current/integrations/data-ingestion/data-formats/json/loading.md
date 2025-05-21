---
sidebar_label: 'JSONの読み込み'
sidebar_position: 20
title: 'JSONを使用する'
slug: /integrations/data-formats/json/loading
description: 'JSONの読み込み'
keywords: ['json', 'clickhouse', '挿入', '読み込み', '挿入']
score: 15
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# JSONの読み込み {#loading-json}

以下の例は、構造化および半構造化されたJSONデータの読み込みに関する非常にシンプルな例を提供します。ネストされた構造を含むより複雑なJSONについては、ガイド [**JSONスキーマの設計**](/integrations/data-formats/json/schema) を参照してください。

## 構造化JSONの読み込み {#loading-structured-json}

このセクションでは、JSONデータが [`NDJSON`](https://github.com/ndjson/ndjson-spec)（改行区切りJSON）形式であり、ClickHouseでは [`JSONEachRow`](/interfaces/formats#jsoneachrow) として知られ、カラム名とタイプが固定されていると仮定します。`NDJSON` は、簡潔さと効率的なスペース利用のために、JSONを読み込む際の推奨形式ですが、他の形式も [入力と出力](/interfaces/formats#json) の両方でサポートされています。

次のJSONサンプルは、[Python PyPIデータセット](https://clickpy.clickhouse.com/) からの行を表しています。

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

このJSONオブジェクトをClickHouseに読み込むには、テーブルスキーマを定義する必要があります。 

このシンプルなケースでは、構造は静的であり、カラム名は分かっており、そのタイプは明確に定義されています。

ClickHouseは、キー名とそのタイプが動的であるJSONタイプを通じて半構造化データをサポートしていますが、ここではそれは必要ありません。

:::note 可能な限り静的スキーマを優先
カラム名とタイプが固定されており、新しいカラムの追加が期待されない場合は、常に本番環境では静的に定義されたスキーマを優先してください。

JSONタイプは、カラムの名前とタイプが変更される可能性が高いデータに推奨されます。このタイプは、プロトタイピングやデータ探索にも便利です。
:::

これに対するシンプルなスキーマは以下の通りで、**JSONキーがカラム名にマッピングされています**：

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

:::note ソートキー
ここで`ORDER BY`句を使用してソートキーを選択しました。ソートキーの詳細や選定方法については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouseは、拡張子と内容から自動的にタイプを推測し、複数の形式でJSONデータを読み込むことができます。上記のテーブル用のJSONファイルは、[S3関数](/sql-reference/table-functions/s3) を使用して読み取ることができます：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

ファイル形式を指定する必要がないことに注意してください。代わりに、バケット内のすべての `*.json.gz` ファイルを読み込むためにワイルドカードパターンを使用します。ClickHouseは、ファイルの拡張子と内容から形式が `JSONEachRow`（ndjson）であることを自動的に推測します。ClickHouseが形式を検出できない場合、パラメータ関数を通じて形式を手動で指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルも圧縮されています。これはClickHouseによって自動的に検出され、処理されます。
:::

これらのファイル内の行を読み込むには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用できます：

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

行は、[`FORMAT`句](/sql-reference/statements/select/format) を使用してインラインで読み込むこともできます。例：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

これらの例では、`JSONEachRow`形式を使用することを前提としています。他の一般的なJSON形式もサポートされており、これらを読み込む例は [こちら](/integrations/data-formats/json/other-formats) に提供されています。

## 半構造化JSONの読み込み {#loading-semi-structured-json}

<PrivatePreviewBadge/>

前の例では、固定のカラム名とタイプを持つ静的なJSONを読み込みましたが、これは常にそうではありません - キーが追加されたり、そのタイプが変更されたりする可能性があります。これは、可観測性データなどのユースケースでは一般的です。

ClickHouseは、専用の [`JSON`](/sql-reference/data-types/newjson) タイプを通じてこれを処理します。

前述の[Python PyPIデータセット](https://clickpy.clickhouse.com/) の拡張版の例を考えてみましょう。ここでは、ランダムなキーと値のペアを持つ任意の `tags` カラムを追加しました。

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

ここでのtagsカラムは予測不可能であり、したがってモデル化することは不可能です。このデータを読み込むには、前のスキーマを使用しつつ、[`JSON`](/sql-reference/data-types/newjson)タイプの追加 `tags` カラムを提供します：

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

テーブルには、元のデータセットと同じアプローチでデータを挿入します：

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

データの読み込み時のパフォーマンスの違いに注意してください。JSONカラムは挿入時にタイプ推論を必要とし、複数のタイプのカラムが存在する場合は追加のストレージも必要です。JSONタイプは構成可能ですが（[JSONスキーマの設計](/integrations/data-formats/json/schema) を参照）、明示的にカラムを宣言するのと同等のパフォーマンスを得るために設計されているわけではなく、意図的にデフォルトは柔軟です。この柔軟性には、いくらかのコストが伴います。

### JSONタイプを使用するタイミング {#when-to-use-the-json-type}

データのキーが時間と共に**予測不可能**である場合、または**異なるタイプ**の値が含まれている場合（例：パスが時には文字列、時には数値を含む）、スキーマの柔軟性が必要であり、厳密な型指定が実行できない場合は、JSONタイプを使用してください。

データ構造が明確で一貫している場合、データがJSON形式であっても、JSONタイプを使用する必要はほとんどありません。具体的には、データが以下の場合：

* **知られているキーを持つフラット構造**：標準のカラムタイプ（例：String）を使用します。
* **予測可能なネスト**：これらの構造にはTuple、Array、またはNestedタイプを使用してください。
* **異なるタイプを持つ予測可能な構造**：代わりにDynamicまたはVariantタイプを考慮してください。

私たちが上記の例で行ったように、予測可能なトップレベルのキーには静的カラムを使用し、ペイロードの動的部分には単一のJSONカラムを混在させることもできます。
