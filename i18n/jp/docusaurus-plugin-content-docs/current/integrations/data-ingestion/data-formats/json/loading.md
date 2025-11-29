---
sidebar_label: 'JSON の読み込み'
sidebar_position: 20
title: 'JSON を取り扱う'
slug: /integrations/data-formats/json/loading
description: 'JSON の読み込み'
keywords: ['json', 'clickhouse', '挿入', '読み込み', '挿入']
score: 15
doc_type: 'guide'
---



# JSON の読み込み {#loading-json}

次の例では、構造化および半構造化された JSON データを読み込むための、非常に単純なケースを示します。ネストされた構造を含む、より複雑な JSON については、ガイド [**JSON スキーマの設計**](/integrations/data-formats/json/schema) を参照してください。



## 構造化された JSON の読み込み {#loading-structured-json}

このセクションでは、JSON データが [`NDJSON`](https://github.com/ndjson/ndjson-spec) (Newline delimited JSON) 形式であり、ClickHouse では [`JSONEachRow`](/interfaces/formats/JSONEachRow) として知られ、かつ列名と型が固定された適切に構造化されたデータであると仮定します。`NDJSON` は、その簡潔さとストレージ効率の良さから JSON を読み込む際に推奨される形式ですが、他の形式も [入力と出力](/interfaces/formats/JSON) の両方でサポートされています。

次の JSON サンプルは、[Python PyPI データセット](https://clickpy.clickhouse.com/) の 1 行を表しています。

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

この JSON オブジェクトを ClickHouse に読み込むには、テーブルスキーマを定義する必要があります。

このシンプルなケースでは、構造は静的であり、カラム名は既知で、それぞれの型も明確に定義されています。

ClickHouse は JSON 型を通じて、キー名やその型が動的になり得るセミ構造化データをサポートしていますが、このケースではそれは不要です。

:::note 可能な限り静的スキーマを優先する
カラム名と型が固定であり、新しいカラムが追加されることが想定されない場合は、本番環境では常に静的に定義されたスキーマを優先してください。

JSON 型は、カラム名や型が頻繁に変化しうるような、非常に動的なデータに適しています。また、プロトタイピングやデータ探索にも有用です。
:::

この場合の単純なスキーマを以下に示します。ここでは、**JSON のキーがカラム名にマッピングされています**。

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

:::note 並び替えキー
ここでは `ORDER BY` 句を使って並び替えキーを選択しています。並び替えキーの詳細および選び方については[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouse は JSON データを複数のフォーマットで読み込むことができ、拡張子と内容からフォーマットを自動的に推論します。上記のテーブルについては、[S3 関数](/sql-reference/table-functions/s3)を使用して JSON ファイルを読み取ることができます。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1行が返されました。経過時間: 1.232秒。
```

ここではファイル形式を明示的に指定する必要がない点に注目してください。その代わりに、バケット内のすべての `*.json.gz` ファイルを読み取るために glob パターンを使用します。ClickHouse は、ファイル拡張子と内容から、フォーマットが `JSONEachRow`（ndjson）であることを自動的に推論します。ClickHouse が形式を検出できない場合には、パラメータ関数を使ってフォーマットを手動で指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルは圧縮形式でも提供されています。ClickHouse が自動的に検出して処理します。
:::

これらのファイル内の行をロードするには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用できます。

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

2 行が結果として返されました。経過時間: 0.005 秒。処理件数 8.19 千行、908.03 KB（1.63 百万行/秒、180.38 MB/秒）。

````

[`FORMAT`句](/sql-reference/statements/select/format)を使用して、行をインラインで読み込むこともできます。例：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
````

これらの例では、`JSONEachRow` 形式の使用を想定しています。その他の一般的な JSON 形式もサポートされており、それらを取り込む例は[こちら](/integrations/data-formats/json/other-formats)にあります。


## セミ構造化 JSON の読み込み {#loading-semi-structured-json}

前の例では、キー名と型がよく分かっている静的な JSON を読み込みました。実際にはそうとは限らず、キーが追加されたり、その型が変化したりします。これは Observability データなどのユースケースでよく見られます。

ClickHouse はこのようなケースに専用の [`JSON`](/sql-reference/data-types/newjson) 型で対応します。

上記で扱った [Python PyPI dataset](https://clickpy.clickhouse.com/) の拡張版から、次の例を考えます。ここでは、ランダムなキーと値のペアを持つ任意の `tags` 列を追加しています。

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

ここでの tags 列は値が予測できず、そのためモデル化することはできません。このデータを取り込むには、以前と同じスキーマを使用しつつ、型が [`JSON`](/sql-reference/data-types/newjson) の `tags` 列を追加で定義します。

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

元のデータセットのときと同じ手順でテーブルにデータを投入します。

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

ここではデータ読み込み時のパフォーマンスの違いに注目してください。`JSON` 列は、挿入時に型推論が必要であり、さらに 1 つの列に複数の型が存在する場合は追加のストレージも必要になります。`JSON` 型は（[JSON スキーマの設計](/integrations/data-formats/json/schema)を参照）明示的に列を宣言した場合と同等のパフォーマンスになるように設定できますが、デフォルトではあえて柔軟に使えるように設計されています。しかし、この柔軟性にはある程度のコストが伴います。

### JSON 型を使用するタイミング {#when-to-use-the-json-type}

次のようなデータの場合は JSON 型を使用します:

* 時間の経過とともに変化しうる、**予測不能なキー**を持つ。
* **型が異なる値**を含む（例: あるパスには文字列が入ることもあれば、数値が入ることもある）。
* 厳密な型付けが現実的でないような、スキーマの柔軟性を必要とする。

データ構造が既知で一貫している場合、データが JSON 形式であっても JSON 型が必要になることはほとんどありません。特に、次のようなデータであればなおさらです:


* **既知のキーを持つフラットな構造**: 標準的なカラム型（例: String 型）を使用します。
* **予測可能な入れ子構造**: これらの構造には Tuple 型、Array 型、Nested 型を使用します。
* **構造は予測可能だが型が変化する場合**: 代わりに Dynamic 型または Variant 型の利用を検討します。

上記の例で行ったように、予測可能なトップレベルのキーには静的カラムを使用し、ペイロード内の動的なセクションには単一の JSON カラムを使うことで、これらのアプローチを組み合わせることもできます。
