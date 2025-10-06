---
'sidebar_label': 'JSONを読み込む'
'sidebar_position': 20
'title': 'JSONを扱う'
'slug': '/integrations/data-formats/json/loading'
'description': 'JSONを読み込む'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'inserting'
'score': 15
'doc_type': 'guide'
---


# JSONの読み込み {#loading-json}

以下の例は、構造化および半構造化JSONデータの読み込みの非常にシンプルな例を示しています。ネストされた構造を含むより複雑なJSONについては、ガイド [**JSONスキーマの設計**](/integrations/data-formats/json/schema) を参照してください。

## 構造化JSONの読み込み {#loading-structured-json}

このセクションでは、JSONデータが [`NDJSON`](https://github.com/ndjson/ndjson-spec) (改行区切りJSON) 形式であり、ClickHouseでは [`JSONEachRow`](/interfaces/formats#jsoneachrow) として知られ、カラム名とタイプが固定されていると仮定します。`NDJSON` はJSONを読み込むための好ましい形式であり、その簡潔さとスペースの効率的な使用が評価されますが、他の形式も [入力と出力](/interfaces/formats#json) の両方でサポートされています。

以下のJSONサンプルを考えてみましょう。これは [Python PyPIデータセット](https://clickpy.clickhouse.com/) の行を表しています。

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

この単純な場合、私たちの構造は静的で、カラム名はわかっており、タイプも明確です。

ClickHouseは、キー名とそのタイプがダイナミックであるJSONタイプを介して半構造化データをサポートしていますが、ここでは必要ありません。

:::note 静的スキーマを可能な限り優先する
カラムに固定の名前とタイプがあり、新しいカラムは予想されない場合、常に本番環境では静的に定義されたスキーマを優先してください。

JSONタイプは、カラムの名前とタイプが変更される可能性のある高いダイナミックデータに好まれます。このタイプは、プロトタイピングやデータ探索においても便利です。
:::

これに対するシンプルなスキーマは以下に示されています。ここでは **JSONキーがカラム名にマッピングされています**：

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

:::note キーの順序
ここでは `ORDER BY` 句を使用して順序付けキーを選択しました。順序付けキーの詳細とその選択方法については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key) を参照してください。
:::

ClickHouseは、拡張子と内容からタイプを自動的に推測し、複数の形式でJSONデータを読み込むことができます。上記のテーブルのJSONファイルを [S3関数](/sql-reference/table-functions/s3) を使用して読むことができます：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

ファイル形式を指定する必要がないことに注意してください。代わりに、バケット内のすべての `*.json.gz` ファイルを読み込むためにグロブパターンを使用しています。ClickHouseはファイル拡張子と内容から形式が `JSONEachRow` (ndjson) であることを自動的に推測します。 ClickHouseが形式を検出できない場合は、パラメータ関数を介して手動で形式を指定できます。

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note 圧縮ファイル
上記のファイルは圧縮されています。これはClickHouseによって自動的に検出および処理されます。
:::

これらのファイルの行を読み込むには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用できます：

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

行は、[`FORMAT`句](/sql-reference/statements/select/format) を使用してインラインでも読み込むことができます。例えば：

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

これらの例は、 `JSONEachRow` 形式の使用を想定しています。他の一般的なJSON形式もサポートされており、これらの読み込みの例は [こちら](/integrations/data-formats/json/other-formats) で提供されています。

## 半構造化JSONの読み込み {#loading-semi-structured-json}

前の例では、キー名とタイプがよく知られている静的なJSONを読み込みました。これはしばしば当てはまりません - キーが追加されたり、そのタイプが変わることがあります。これは、可観測性データのようなユースケースでは一般的です。

ClickHouseは、専用の [`JSON`](/sql-reference/data-types/newjson) タイプを介してこれを処理します。

前述の [Python PyPIデータセット](https://clickpy.clickhouse.com/) の拡張版の例を考えましょう。ここでは、ランダムなキー値ペアを持つ任意の `tags` 列を追加しています。

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

ここでのtags列は予測不可能であり、したがって私たちがモデル化することは不可能です。このデータを読み込むには、前のスキーマを使用し、[`JSON`](/sql-reference/data-types/newjson) タイプの追加の `tags` 列を提供します：

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

元のデータセットと同じアプローチでテーブルをポピュレートします：

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

ここでのデータ読み込みのパフォーマンスの違いに注目してください。JSONカラムは、挿入時にタイプ推測を必要とし、複数のタイプが存在するカラムがある場合は追加のストレージも必要です。JSONタイプは構成可能であり（[JSONスキーマの設計](/integrations/data-formats/json/schema) 参照）、カラムを明示的に宣言するのと同等のパフォーマンスを実現できますが、初めから柔軟性を持たせて設計されています。この柔軟性は、しかしいくらかのコストが伴います。

### JSONタイプを使用するタイミング {#when-to-use-the-json-type}

データが次の条件を満たす場合にJSONタイプを使用してください：

* **予測不可能なキー**が時間とともに変更される可能性がある。
* **異なるタイプの値**を含む (例：パスには時々文字列、時々数値が含まれる)。
* 厳密な型付けが実行不可能な場合にスキーマの柔軟性が必要。

データ構造が知られていて一貫している場合、JSONタイプが必要になることはほとんどありません。特に、データに以下の条件がある場合：

* **既知のキーを持つフラットな構造**：標準のカラムタイプ（例：String）を使用します。
* **予測可能なネスト**：これらの構造にはTuple、Array、またはNestedタイプを使用します。
* **異なるタイプの予測可能な構造**：その代わりにDynamicまたはVariantタイプを検討してください。

上記の例のように、予測可能な最上位キーに静的カラムを使用し、ペイロードの動的セクションに対して単一のJSONカラムを使用するなど、アプローチを組み合わせることもできます。
