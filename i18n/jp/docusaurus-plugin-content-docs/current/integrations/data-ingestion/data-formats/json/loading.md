---
'sidebar_label': 'Loading JSON'
'sidebar_position': 20
'title': 'Working with JSON'
'slug': '/integrations/data-formats/json/loading'
'description': 'Loading JSON'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'inserting'
'score': 15
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# JSONの読み込み {#loading-json}

以下の例は、構造化データおよび半構造化データのJSONの読み込みについての非常にシンプルな例を提供します。ネストされた構造を含むより複雑なJSONについては、ガイド[**JSONスキーマの設計**](/integrations/data-formats/json/schema)を参照してください。

## 構造化JSONの読み込み {#loading-structured-json}

このセクションでは、JSONデータが[`NDJSON`](https://github.com/ndjson/ndjson-spec)（Newline Delimited JSON）フォーマットであり、ClickHouseでは[`JSONEachRow`](/interfaces/formats#jsoneachrow)として知られている、また、よく構造化されている、つまりカラム名とタイプが固定されていますと仮定します。`NDJSON`は、その簡潔さと効率的なスペース利用のため、JSONの読み込みには推奨されるフォーマットですが、その他のフォーマットも[入力と出力](/interfaces/formats#json)の両方でサポートされています。

次のJSONサンプルを考えてみましょう。これは[Python PyPIデータセット](https://clickpy.clickhouse.com/)からの行を表しています。

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

このJSONオブジェクトをClickHouseに読み込むためには、テーブルスキーマを定義する必要があります。

このシンプルなケースでは、構造は静的で、カラム名は既知であり、そのタイプも明確に定義されています。

ClickHouseは、キー名とそのタイプが動的であるJSONタイプを通じて半構造化データをサポートしていますが、ここでは必要ありません。

:::note 静的スキーマの優先
カラムに固定名とタイプがあり、新しいカラムが期待されない場合は、必ず生産環境では静的に定義されたスキーマを優先してください。

JSONタイプは、カラムの名前やタイプが変更される可能性のある高い動的データに好まれます。このタイプは、プロトタイピングやデータ探索にも便利です。
:::

以下に示すのは、**JSONキーをカラム名にマッピングする**シンプルなスキーマです。

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

:::note オーダリングキー
ここで、`ORDER BY`句を通じてオーダリングキーを選択しました。オーダリングキーの詳細や選択方法については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。
:::

ClickHouseは、拡張子と内容から型を自動的に推測して、さまざまなフォーマットのJSONデータを読み込むことができます。上記のテーブルのためにJSONファイルを[システム関数](/sql-reference/table-functions/s3)を使用して読み取ることができます。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1行の結果が返されました。経過時間: 1.232秒。
```

ファイルフォーマットを指定する必要がないことに注意してください。代わりに、バケット内のすべての`*.json.gz`ファイルを読み取るためにグロブパターンを使用しています。ClickHouseは、自動的にファイル拡張子と内容から形式を`JSONEachRow`（ndjson）であると推測します。ClickHouseが形式を検出できない場合は、パラメータ関数を通じて手動で形式を指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルは圧縮されています。これはClickHouseによって自動的に検出され、処理されます。
:::

これらのファイル内の行を読み込むには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用できます。

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0行の結果が返されました。経過時間: 10.445秒。処理した行数: 19.49百万行、サイズ: 35.71 MB（1.87百万行/秒、3.42 MB/秒）。

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2行の結果が返されました。経過時間: 0.005秒。処理した行数: 8.19千行、サイズ: 908.03 KB（1.63百万行/秒、180.38 MB/秒）。
```

行は、`[`FORMAT`句](/sql-reference/statements/select/format)を使用してインラインで読み込むこともできます。例えば：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

これらの例は`JSONEachRow`形式の使用を前提としています。他の一般的なJSON形式もサポートされており、これらの読み込みに関する例は[こちら](/integrations/data-formats/json/other-formats)で提供されています。

## 半構造化JSONの読み込み {#loading-semi-structured-json}

<PrivatePreviewBadge/>

前の例では、既知のキー名とタイプを持つ静的なJSONを読み込みました。これはしばしば当てはまりません—キーが追加されたり、キーのタイプが変わることがあります。これは、Observabilityデータなどのユースケースで一般的です。

ClickHouseは、専用の[`JSON`](/sql-reference/data-types/newjson)タイプを通じてこれに対応しています。

以下の例は、上記の[Python PyPIデータセット](https://clickpy.clickhouse.com/)の拡張バージョンからのものです。ここでは、ランダムなキー値ペアを持つ任意の`tags`カラムを追加しました。


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

この`tags`カラムは予測できず、したがってモデリングが不可能です。このデータを読み込むには、上記のスキーマを使用しますが、[`JSON`](/sql-reference/data-types/newjson)タイプの追加の`tags`カラムを提供します：

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

元のデータセットと同じアプローチを使用してテーブルをポピュレートします：

```sql
INSERT INTO pypi_with_tags SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')
```

```sql
INSERT INTO pypi_with_tags SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')

Ok.

0行の結果が返されました。経過時間: 255.679秒。処理した行数: 1.00百万行、サイズ: 29.00 MB（3.91千行/秒、113.43 KB/秒）。
ピークメモリ使用量: 2.00 GiB。

SELECT *
FROM pypi_with_tags
LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┬─tags─────────────────────────────────────────────────────┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"nsBM":"5194603446944555691"}                           │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"4zD5MYQz4JkP1QqsJIS":"0","name":"8881321089124243208"} │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┴──────────────────────────────────────────────────────────┘

2行の結果が返されました。経過時間: 0.149秒。
```

ここでのデータの読み込みのパフォーマンスの違いに注意してください。JSONカラムは、挿入時に型推論を必要とし、1つの型より多くの型を持つカラムが存在する場合、追加のストレージも必要です。JSONタイプは構成可能ですが（[JSONスキーマの設計](/integrations/data-formats/json/schema)を参照）、明示的にカラムを宣言する場合と同等のパフォーマンスを提供しますが、初期設定では意図的に柔軟です。この柔軟性は、ある程度のコストを伴います。

### JSONタイプを使用する場合 {#when-to-use-the-json-type}

データに次のような特性がある場合は、JSONタイプを使用してください：

* **予測できないキー**があり、時間の経過とともに変更される可能性がある。
* **異なるタイプの値**を含む（例：パスが文字列のこともあれば、数値のこともある）。
* 厳密なタイプ付けが実行できない場合にスキーマの柔軟性が必要です。

データ構造が既知で一貫している場合、データがJSON形式であっても、JSONタイプが必要となることはほとんどありません。特に、データが次のようである場合：

* **知られたキーを持つフラットな構造**：標準のカラムタイプ（例：String）を使用します。
* **予測可能なネスト**：Tuple、Array、またはNestedタイプをこれらの構造に使用します。
* **異なるタイプを持つ予測可能な構造**：DynamicまたはVariantタイプなどを検討してください。

上記の例のように、静的カラムを予測可能なトップレベルキーに使用し、ペイロードの動的セクションに対して単一のJSONカラムを使用するという方法のミックスも可能です。
