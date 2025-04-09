---
sidebar_label: JSONの読み込み
sidebar_position: 20
title: JSONの操作
slug: /integrations/data-formats/json/loading
description: JSONの読み込み
keywords: [json, clickhouse, inserting, loading]
---


# JSONの読み込み

このセクションでは、JSONデータが[NDJSON](https://github.com/ndjson/ndjson-spec)（改行区切りJSON）フォーマットであると仮定します。これは、ClickHouseでは[`JSONEachRow`](/interfaces/formats#jsoneachrow)として知られています。この形式は、その簡潔さと効率的なスペース使用のため、JSONの読み込みに推奨されるフォーマットですが、他のフォーマットも[入力と出力](/interfaces/formats#json)のためにサポートされています。

以下は、[Python PyPIデータセット](https://clickpy.clickhouse.com/)からの行を示すJSONサンプルです。

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

このJSONオブジェクトをClickHouseに読み込むためには、テーブルスキーマを定義する必要があります。以下に、**JSONキーがカラム名にマッピングされた**シンプルなスキーマを示します。

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
ここでは、`ORDER BY`句を使用してソートキーを選択しています。ソートキーについての詳細や選び方については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouseは、拡張子と内容から自動的に型を推測し、複数のフォーマットでJSONデータを読み込むことができます。上のテーブルのために、[S3関数](/sql-reference/table-functions/s3)を使用してJSONファイルを読み取ることができます。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

ファイル形式を指定する必要がないことに注意してください。代わりに、バケット内のすべての`*.json.gz`ファイルを読み取るためにグロブパターンを使用します。ClickHouseは自動的にファイルの拡張子と内容からフォーマットが`JSONEachRow`（ndjson）であると推測します。ClickHouseがフォーマットを検出できない場合には、パラメータ関数を通じてフォーマットを手動で指定することができます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルも圧縮されています。これはClickHouseによって自動的に検出され、処理されます。
:::

これらのファイルの行を読み込むには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用できます。

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┐
│ 2022-05-26 │ CN       	│ clickhouse-connect │
│ 2022-05-26 │ CN       	│ clickhouse-connect │
└────────────┴──────────────┴────────────────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

行は、[`FORMAT`句](/sql-reference/statements/select/format)を使用してインラインで読み込むこともできます。例えば：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

これらの例はJSONEachRowフォーマットの使用を想定しています。他の一般的なJSONフォーマットもサポートされており、それらの読み込みの例は[こちら](/integrations/data-formats/json/other-formats)に提供されています。

以上はJSONデータの非常にシンプルな読み込み例を提供しました。ネストされた構造を含むより複雑なJSONについては、ガイド[**JSONスキーマの設計**](/integrations/data-formats/json/schema)を参照してください。
