---
sidebar_label: 'JSON の読み込み'
sidebar_position: 20
title: 'JSON を扱う'
slug: /integrations/data-formats/json/loading
description: 'JSON の読み込み'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'inserting']
score: 15
doc_type: 'guide'
---



# JSONの読み込み {#loading-json}

以下の例では、構造化および半構造化JSONデータの読み込みに関する基本的な例を示します。ネストされた構造を含むより複雑なJSONについては、[**JSONスキーマの設計**](/integrations/data-formats/json/schema)ガイドを参照してください。


## 構造化JSONの読み込み {#loading-structured-json}

このセクションでは、JSONデータが[`NDJSON`](https://github.com/ndjson/ndjson-spec)(改行区切りJSON)形式であり、ClickHouseでは[`JSONEachRow`](/interfaces/formats/JSONEachRow)として知られ、適切に構造化されている(つまり、列名と型が固定されている)ことを前提としています。`NDJSON`は簡潔性と効率的な空間利用により、JSONを読み込むための推奨形式ですが、[入力と出力](/interfaces/formats/JSON)の両方で他の形式もサポートされています。

以下のJSONサンプルは、[Python PyPIデータセット](https://clickpy.clickhouse.com/)の1行を表しています:

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

この単純なケースでは、構造は静的であり、列名は既知で、その型は明確に定義されています。

ClickHouseはJSON型を通じて半構造化データをサポートしており、キー名とその型を動的にすることができますが、ここではそれは不要です。

:::note 可能な限り静的スキーマを優先する
列名と型が固定されており、新しい列が予想されない場合は、本番環境では常に静的に定義されたスキーマを優先してください。

JSON型は、列の名前と型が変更される可能性がある高度に動的なデータに適しています。この型は、プロトタイピングやデータ探索にも有用です。
:::

これに対する単純なスキーマを以下に示します。ここでは**JSONキーが列名にマッピング**されています:

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
ここでは`ORDER BY`句を使用してソートキーを選択しています。ソートキーとその選択方法の詳細については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouseは複数の形式でJSONデータを読み込むことができ、拡張子と内容から型を自動的に推測します。上記のテーブルに対するJSONファイルは、[S3関数](/sql-reference/table-functions/s3)を使用して読み取ることができます:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

ファイル形式を指定する必要がないことに注意してください。代わりに、globパターンを使用してバケット内のすべての`*.json.gz`ファイルを読み取ります。ClickHouseは、ファイル拡張子と内容から形式が`JSONEachRow`(ndjson)であることを自動的に推測します。ClickHouseが検出できない場合は、パラメータ関数を通じて形式を手動で指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルは圧縮されています。これはClickHouseによって自動的に検出され、処理されます。
:::

これらのファイル内の行を読み込むには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用できます:

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

```


┌───────date─┬─country&#95;code─┬─project────────────┬─type──┬─installer────┬─python&#95;minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 行が結果セットに含まれています。経過時間: 0.005 秒。8.19 千行、908.03 KB を処理しました (1.63 百万行/秒、180.38 MB/秒)。

````

[`FORMAT`句](/sql-reference/statements/select/format)を使用して、行をインラインで読み込むこともできます。例：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
````

以下の例では `JSONEachRow` フォーマットの使用を前提としています。その他の一般的な JSON フォーマットもサポートされており、それらの読み込み方法の例は[こちら](/integrations/data-formats/json/other-formats)で確認できます。


## 半構造化JSONの読み込み {#loading-semi-structured-json}

前の例では、既知のキー名と型を持つ静的なJSONを読み込みました。しかし実際には、キーが追加されたり型が変更されたりすることが多くあります。これは、Observabilityデータなどのユースケースでよく見られます。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)型でこれに対応しています。

上記の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の拡張版から、次の例を考えてみましょう。ここでは、ランダムなキーと値のペアを持つ任意の`tags`カラムを追加しています。

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

ここでのtagsカラムは予測不可能であり、モデル化することができません。このデータを読み込むには、前のスキーマを使用しつつ、[`JSON`](/sql-reference/data-types/newjson)型の`tags`カラムを追加します。

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

元のデータセットと同じ方法でテーブルにデータを投入します。

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

データ読み込み時のパフォーマンスの違いに注目してください。JSONカラムは挿入時に型推論が必要であり、複数の型を持つカラムが存在する場合は追加のストレージも必要になります。JSON型は、明示的にカラムを宣言する場合と同等のパフォーマンスを得るために設定することができますが([JSONスキーマの設計](/integrations/data-formats/json/schema)を参照)、初期状態では意図的に柔軟性を持たせています。ただし、この柔軟性にはコストが伴います。

### JSON型を使用すべき場合 {#when-to-use-the-json-type}

次のような場合にJSON型を使用してください。

- 時間とともに変化する可能性のある**予測不可能なキー**を持つ場合
- **型が変化する値**を含む場合(例:パスが文字列の場合もあれば数値の場合もある)
- 厳密な型付けが実現できない場合にスキーマの柔軟性が必要な場合

データ構造が既知で一貫している場合、データがJSON形式であってもJSON型が必要になることはほとんどありません。具体的には、データが次のような場合です。


* **既知のキーを持つフラットな構造**: 標準的なカラム型（例: String）を使用します。
* **ネスト構造が予測可能な場合**: そのような構造には Tuple、Array、Nested 型を使用します。
* **構造は予測可能だが型が変動する場合**: 代わりに Dynamic 型または Variant 型の利用を検討します。

上記の例のように、予測可能なトップレベルのキーには静的カラムを使用し、ペイロード内の動的なセクションには単一の JSON カラムを使用することで、これらのアプローチを組み合わせることもできます。
