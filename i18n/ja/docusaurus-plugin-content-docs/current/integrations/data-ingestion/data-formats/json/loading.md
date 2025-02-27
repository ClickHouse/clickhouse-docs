---
sidebar_label: JSONの読み込み
sidebar_position: 20
title: JSONの扱い
slug: /integrations/data-formats/json/loading
description: JSONの読み込み
keywords: [json, clickhouse, 挿入, 読み込み]
---

# JSONの読み込み

このセクションでは、JSONデータが[NDJSON](https://github.com/ndjson/ndjson-spec)（新行区切りJSON）形式であると仮定します。これはClickHouseでは[`JSONEachRow`](/interfaces/formats#jsoneachrow)として知られており、JSONの読み込みに推奨される形式です。この形式は簡潔で、スペースの効率的な使用が可能ですが、他の形式も[入力と出力](/interfaces/formats#json)の両方でサポートされています。

以下のJSONサンプルは、[Python PyPIデータセット](https://clickpy.clickhouse.com/)の行を表しています。

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

このJSONオブジェクトをClickHouseに読み込むためには、テーブルスキーマを定義する必要があります。以下に示すのはそのシンプルなスキーマで、**JSONキーがカラム名にマッピングされています**：

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
ここで`ORDER BY`句を通じて順序キーを選択しました。順序キーについてのさらなる詳細や選択方法については[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouseは、拡張子と内容から自動的に型を推論し、複数の形式でJSONデータを読み込むことができます。上記のテーブルに対してJSONファイルを[ S3関数](/sql-reference/table-functions/s3)を使って読み込むことができます：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 行がセットされました。経過時間: 1.232 秒。
```

ファイル形式を指定する必要がないことに注意してください。代わりに、バケット内のすべての`*.json.gz`ファイルを読み込むためにグロブパターンを使用しています。ClickHouseは自動的にファイル拡張子と内容から形式が`JSONEachRow`（ndjson）であると推論します。ClickHouseが形式を検出できない場合は、パラメータ関数を通じて手動で形式を指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルは圧縮されています。これはClickHouseによって自動的に検出され、処理されます。
:::

これらのファイル内の行を読み込むためには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用できます：

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 行がセットされました。経過時間: 10.445 秒。処理した行数: 19.49百万行、35.71 MB（1.87百万行/s、3.42 MB/s）。

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┐
│ 2022-05-26 │ CN       	│ clickhouse-connect │
│ 2022-05-26 │ CN       	│ clickhouse-connect │
└────────────┴──────────────┴────────────────────┘

2 行がセットされました。経過時間: 0.005 秒。処理した行数: 8.19千行、908.03 KB（1.63百万行/s、180.38 MB/s）
```

行は、[`FORMAT`句](/sql-reference/statements/select/format)を使用してインラインで読み込むこともできます。例えば：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

これらの例はJSONEachRow形式を使用することを前提としています。他の一般的なJSON形式もサポートされており、これらの読み込みに関する例は[こちら](/integrations/data-formats/json/other-formats)で提供されています。

上記ではJSONデータの非常にシンプルな読み込み例を示しました。ネストされた構造を含むより複雑なJSONについては、ガイド[**JSONスキーマの設計**](/integrations/data-formats/json/schema)を参照してください。
