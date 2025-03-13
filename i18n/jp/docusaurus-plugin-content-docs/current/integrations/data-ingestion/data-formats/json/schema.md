---
title: JSONスキーマの設計
slug: /integrations/data-formats/json/schema
description: JSONスキーマを最適に設計する方法
keywords: [json, clickhouse, inserting, loading, formats, schema]
---

# スキーマの設計

[schema inference](/integrations/data-formats/json/inference) を使用して、JSONデータの最初のスキーマを確立し、S3などの場所でJSONデータファイルをクエリすることは可能ですが、ユーザーはデータの最適化されたバージョン管理スキーマを確立することを目指すべきです。以下に、JSON構造をモデリングするためのオプションを説明します。

## 抽出可能な場合は抽出する {#extract-where-possible}

可能な限り、ユーザーは頻繁にクエリするJSONキーをスキーマのルートにあるカラムに抽出することを推奨します。これにより、クエリ構文が単純化されるだけでなく、必要に応じてこれらのカラムを `ORDER BY` 句で使用したり、[secondary index](/optimize/skipping-indexes)を指定したりできます。

以下は、ガイド [**JSONスキーマ推論**](/integrations/data-formats/json/inference) で探求された [arXiv データセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download) の例です：

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
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

`versions.created` の最初の値をメインのオーダリングキーにしたいと考えているとします。理想的には、これは挿入前に抽出されるか、挿入時に ClickHouse の [materialized views](/docs/materialized-view/incremental-materialized-view) または [materialized columns](/sql-reference/statements/alter/column#materialize-column) を使用して行われるべきです。

Materialized columns は、クエリ時にデータを抽出する最も簡単な手段を表し、抽出ロジックが単純な SQL 式として捉えられる場合は好まれます。たとえば、`published_date` を arXiv スキーマに materialized column として追加し、オーダリングキーとして以下のように定義できます：

```sql
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
    `authors_parsed` Array(Array(String)),
    `published_date` DateTime DEFAULT parseDateTimeBestEffort(versions[1].1)
)
ENGINE = MergeTree
ORDER BY published_date
```

<!--TODO: Find a better way-->
:::note ネストされたカラムの式
上記では、タプルに `versions[1].1` という表記法を使用し、位置によって `created` カラムにアクセスする必要があります。これは、好ましい構文である `versions.created_at[1]` とは異なります。
:::

データを読み込むと、カラムが抽出されます：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
0 rows in set. Elapsed: 39.827 sec. Processed 2.52 million rows, 1.39 GB (63.17 thousand rows/s., 34.83 MB/s.)

SELECT published_date
FROM arxiv_2
LIMIT 2
┌──────published_date─┐
│ 2007-03-31 02:26:18 │
│ 2007-03-31 03:16:14 │
└─────────────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

:::note Materialized columnの動作
Materialized columns の値は常に挿入時に計算され、`INSERT` クエリで指定することはできません。デフォルトでは、materialized columns は `SELECT *` に返されません。これは、`SELECT *` の結果が常に INSERT を使用してテーブルに戻されることを保持するためです。この動作は、`asterisk_include_materialized_columns=1` を設定することで無効化できます。
:::

より複雑なフィルタリングや変換タスクについては、[materialized views](/materialized-view/incremental-materialized-view) の使用を推奨します。

## 静的 vs 動的 JSON {#static-vs-dynamic-json}

JSON のスキーマを定義する主なタスクは、各キーの値に対する適切なタイプを決定することです。ユーザーは、各キーに対して適切なタイプを決定するために、JSON 階層内の各キーに次のルールを再帰的に適用することを推奨します。

1. **プリミティブタイプ** - キーの値がプリミティブタイプである場合（それがサブオブジェクトの一部かルートにあるかにかかわらず）、一般的なスキーマの [設計ベストプラクティス](/data-modeling/schema-design) および [タイプ最適化ルール](/data-modeling/schema-design#optimizing-types) に従ってそのタイプを選択するようにしてください。以下の `phone_numbers` のようなプリミティブの配列は、`Array(<type>)` 例えば、`Array(String)` としてモデル化できます。
2. **静的 vs 動的** - キーの値が複雑なオブジェクト、すなわちオブジェクトまたはオブジェクトの配列である場合、それが変更される可能性があるかどうかを確立します。新しいキーがほとんど追加されないオブジェクトでは、新しいキーの追加が予測可能であり、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) によるスキーマ変更で処理できる場合は、これを **静的** と見なすことができます。これは、いくつかの JSON ドキュメントでのみキーのサブセットが提供されるオブジェクトを含みます。新しいキーが頻繁に追加され、または予測できないオブジェクトは **動的** と見なされるべきです。その値が **静的** か **動的** かを判断するために、以下の関連セクション [**静的オブジェクトの処理**](/integrations/data-formats/json/schema#handling-static-objects) および [**動的オブジェクトの処理**](/integrations/data-formats/json/schema#handling-dynamic-objects) を参照してください。

<p></p>

**重要:** 上記のルールは再帰的に適用されるべきです。キーの値が動的であると判断された場合、それ以上の評価は必要なく、[**動的オブジェクトの処理**](/integrations/data-formats/json/schema#handling-dynamic-objects) ガイドラインに従うことができます。オブジェクトが静的である場合は、サブキーを評価し続け、キーの値がプリミティブであるか動的キーに遭遇するまで評価を続けます。

これらのルールを示すために、以下のJSON例を使用して人を表現します：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "Databases",
    "holidays": [
      {
        "year": 2024,
        "location": "Azores, Portugal"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

これらのルールを適用すると：

- ルートキー `name`, `username`, `email`, `website` は、タイプ `String` として表されます。カラム `phone_numbers` は型 `Array(String)` のプリミティブの配列で、`dob` と `id` はそれぞれ型 `Date` と `UInt32` です。
- `address` オブジェクトには新しいキーが追加されないため（新しい住所オブジェクトのみ）、これは **静的** と見なすことができます。再帰的に評価すると、`geo` を除くすべてのサブカラムはプリミティブ（型 `String`）と見なすことができます。これは、`lat` と `lng` の2つの `Float32` カラムを持つ静的な構造でもあります。
- `tags` カラムは **動的** です。このオブジェクトには任意のタイプと構造の新しいタグを追加できると仮定します。
- `company` オブジェクトは **静的** で、常に指定された3つのキーのうちの最大数を含むことになります。サブキー `name` と `catchPhrase` はタイプ `String` です。キー `labels` は **動的** です。このオブジェクトには新しい任意のタグが追加されると仮定します。値は常に文字列のキーと値のペアになります。

## 静的オブジェクトの処理 {#handling-static-objects}

静的オブジェクトは、名前付きタプル、すなわち `Tuple` を使用して処理されることを推奨します。オブジェクトの配列は、すなわち `Array(Tuple)` を使用して保持できます。タプル内では、カラムとそれに対応するタイプも同じルールを使用して定義されるべきです。これは、ネストされたオブジェクトを表すためのネストされたタプルを生成する可能性があります。

これを説明するために、以前のJSON人の例を使用し、動的オブジェクトを省略します：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

このテーブルのスキーマは以下のようになります：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY username
```

`company` カラムは `Tuple(catchPhrase String, name String)` として定義されていることに注意してください。`address` フィールドは `Array(Tuple)` を使用し、`geo` カラムを表すためにネストされた `Tuple` を使用しています。

JSON はこの構造のテーブルに挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上記の例ではデータが最小限ですが、以下のように期間区切りの名前でタプルフィールドをクエリできます。

```sql
SELECT
    address.street,
    company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street` カラムが `Array` として返されることに注意してください。配列内の特定のオブジェクトに位置によってクエリするには、カラム名の後に配列オフセットを指定する必要があります。たとえば、最初の住所から通りにアクセスするには：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

タプルの主な欠点は、サブカラムをオーダリングキーに使用できないことです。したがって、以下は失敗します：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date
)
ENGINE = MergeTree
ORDER BY company.name

Code: 47. DB::Exception: Missing columns: 'company.name' while processing query: 'company.name', required columns: 'company.name' 'company.name'. (UNKNOWN_IDENTIFIER)
```

:::note オーダリングキーのタプル
タプル列はオーダリングキーで使用できませんが、全体のタプルは使用できます。可能ではありますが、これは稀にしか意味を持ちません。
:::

### デフォルト値の処理 {#handling-default-values}

JSONオブジェクトが構造化されている場合であっても、提供されるキーのサブセットのみでスパースであることがよくあります。幸いなことに、`Tuple`タイプはJSONペイロード内のすべてのカラムを必要としません。提供されていない場合は、デフォルト値が使用されます。

以前の `people` テーブルと次のスパースなJSONを考慮し、`suite`、`geo`、`phone_numbers`、および `catchPhrase` キーが欠けています。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771"
    }
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse"
  },
  "dob": "2007-03-31"
}
```

以下のように、この行が正常に挿入されることが確認できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この単一行をクエリすると、省略されたカラム（サブオブジェクトを含む）にデフォルト値が使用されることが確認できます：

```sql
SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
    "id": "1",
    "name": "Clicky McCliickHouse",
    "username": "Clicky",
    "email": "clicky@clickhouse.com",
    "address": [
        {
            "city": "Wisokyburgh",
            "geo": {
                "lat": 0,
                "lng": 0
            },
            "street": "Victor Plains",
            "suite": "",
            "zipcode": "90566-7771"
        }
    ],
    "phone_numbers": [],
    "website": "clickhouse.com",
    "company": {
        "catchPhrase": "",
        "name": "ClickHouse"
    },
    "dob": "2007-03-31"
}

1 row in set. Elapsed: 0.001 sec.
```

:::note 空とnullの区別
ユーザーが、値が空であることと提供されていないことを区別する必要がある場合は、[Nullable](/sql-reference/data-types/nullable) タイプを使用できます。この [avoid nullable columns](https://cloud.bestpractices/avoid-nullable-columns) で明示的に回避するべきです。そうでないと、これらのカラムでのストレージとクエリパフォーマンスに悪影響を及ぼします。
:::

### 新しいカラムの処理 {#handling-new-columns}

静的なJSONキーに対して構造化されたアプローチが最も簡単ですが、スキーマ変更が計画できる場合でもこのアプローチを使用できます。つまり、新しいキーが事前に知られており、そのスキーマを適宜変更できる場合です。

ClickHouseは、デフォルトでペイロード内に提供されているJSONキーを無視し、スキーマに存在しないものに対して無視します。たとえば、`nickname`キーの追加を伴う次の修正されたJSONペイロードを考えてください：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "nickname": "Clicky",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": -43.9509,
        "lng": -34.4618
      }
    }
  ],
  "phone_numbers": ["010-692-6593", "020-192-3333"],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

このJSONは正常に挿入され、`nickname`キーは無視されます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

カラムは [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用してスキーマに追加できます。デフォルトは `DEFAULT` 句を介して指定でき、変更後の挿入時に指定されていない場合に使用されます。この値が存在しない行（それが作成された前に挿入されたため）もこのデフォルト値を返します。デフォルト値が指定されていない場合は、タイプのデフォルト値が使用されます。

たとえば：

```sql
-- 最初の行を挿入（nicknameは無視される）
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- カラムを追加
ALTER TABLE people
    (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- 新しい行を挿入（同じデータ異なるid）
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- 2行を選択
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```

## 動的オブジェクトの処理 {#handling-dynamic-objects}

動的オブジェクトを処理するための推奨される2つのアプローチがあります：

- [Map(String,V)](/sql-reference/data-types/map) タイプ
- [String](/sql-reference/data-types/string) と JSON 関数

最も適切なものを決定するために、以下のルールを適用できます。

1. オブジェクトが非常に動的であり、予測可能な構造がなく、任意のネストされたオブジェクトを含む場合は、`String` タイプを使用すべきです。値は、以下に示すように、クエリ時にJSON関数を使用して抽出できます。
2. オブジェクトが主に同じタイプの任意のキーを格納するために使用される場合は、`Map` タイプを使用することを考慮してください。理想的には、一意のキーの数は数百を超えないべきです。また、サブオブジェクトに一貫性がある場合も、`Map` タイプを考慮できます。一般に、ラベルやタグ用に `Map` タイプを使用することを推奨します。たとえば、ログデータにおけるKubernetesポッドのラベルなどです。

<br />

:::note オブジェクトレベルアプローチを適用
同じスキーマ内の異なるオブジェクトに異なる手法を適用できます。一部のオブジェクトは `String` で最もよく解決できるかもしれませんが、他のオブジェクトは `Map` で最も適しています。`String` タイプを使用すると、それ以上のスキーマ決定は必要ありません。逆に、以下に示すように、`Map` キー内にネストされたサブオブジェクトを配置することも可能です。
:::

### Stringの使用 {#using-string}

上記のように構造化されたアプローチを使用したデータ管理は、動的なJSONを持つユーザーにとっては実行可能でないことが多いです。これは変更の対象であるか、スキーマが十分に理解されていないものです。絶対的な柔軟性を求める場合、ユーザーは単にJSONを `String` として格納し、その後必要に応じてフィールドを抽出するための関数を使用できます。これは、JSONを構造化されたオブジェクトとして扱うことの極端な反対を表しています。この柔軟性は、クエリ構文の複雑さとパフォーマンスの低下を招くという大きなコストがかかります。

前述のように、[元の人オブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json) において、`tags` カラムの構造を保証することはできません。元の行を挿入します（ここでは `company.labels` も含めますが、ここでは無視します）。`Tags` カラムを `String` と宣言します：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

`tags` カラムを選択すると、JSONが文字列として挿入されたことがわかります：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

このJSONから値を取得するために、[JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用できます。以下の単純な例を考えてみましょう：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数は `tags` という `String` カラムへの参照と、抽出するJSON内のパスを両方とも必要とします。ネストされたパスは関数をネストする必要があり、たとえば、`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` のように、カラム `tags.car.year` を抽出します。ネストされたパスの抽出は、[JSON_QUERY](/sql-reference/functions/json-functions#json_query) および [JSON_VALUE](/sql-reference/functions/json-functions#json_value) 関数を介して簡略化できます。

`arxiv` データセットの極端なケースを考えてみましょう。この場合、全体のボディを `String` と見なします。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマに挿入するには、`JSONAsString` 形式を使用する必要があります：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

年ごとの公開論文数をカウントしたいとします。次のように、[構造化されたバージョン](/integrations/data-formats/json/inference#creating-tables) のスキーマと文字列のみを使用した場合のクエリを対比します：

```sql
-- 構造化されたスキーマを使用
SELECT
    toYear(parseDateTimeBestEffort(versions.created[1])) AS published_year,
    count() AS c
FROM arxiv_v2
GROUP BY published_year
ORDER BY c ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.264 sec. Processed 2.31 million rows, 153.57 MB (8.75 million rows/s., 582.58 MB/s.)

-- 非構造化された文字列を使用

SELECT
    toYear(parseDateTimeBestEffort(JSON_VALUE(body, '$.versions[0].created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 1.281 sec. Processed 2.49 million rows, 4.22 GB (1.94 million rows/s., 3.29 GB/s.)
Peak memory usage: 205.98 MiB.
```

ここで、`JSON_VALUE(body, '$.versions[0].created')` のXPath式を使用して、JSONをメソッドでフィルタリングしていることに注意してください。

文字列関数は明示的な型変換よりもかなり遅く（> 10倍）なります。上記のクエリは常にテーブルスキャンとすべての行の処理を必要とします。これらのクエリは、このような小さなデータセットでは依然として速くなりますが、大きなデータセットではパフォーマンスが低下します。

このアプローチの柔軟性は、明確なパフォーマンスと構文のコストと引き換えであり、高度に動的なオブジェクトのスキーマにのみ使用するべきです。

#### 簡単なJSON関数 {#simple-json-functions}

上記の例では、JSON*関数のファミリーを使用しています。これらは[simdjson](https://github.com/simdjson/simdjson) に基づく完全なJSONパーサーを利用しており、その解析は厳格で、異なるレベルにネストされた同じフィールドを区別します。これらの関数は、構文的には正しいが、整形が不十分なJSONにも対処できます。例えば、キーの間に余分な空白がある場合などです。

より速く、さらに厳密な機能セットが利用可能です。これらの `simpleJSON*` 関数は、主にJSONの構造とフォーマットに関する厳格な仮定を行うことによって、優れたパフォーマンスを提供します。具体的には：

* フィールド名は定数である必要があります
* フィールド名の一貫したエンコーディングが必要です。たとえば、`simpleJSONHas('{"abc":"def"}', 'abc') = 1` ですが、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0` です。
* フィールド名はすべてのネストされた構造内でユニークでなければなりません。ネストレベル間の区別は行わず、マッチングは無差別です。複数の一致するフィールドがある場合は、最初の出現を使用します。
* 文字列リテラルの外に特別な文字を含めることはできません。これには空白が含まれます。以下は無効であり、解析されません。

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    以下は、正しく解析されます。

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

パフォーマンスが重要な場合で、JSONが上記の要件を満たす場合、これらを使用することが適切な場合があります。以下に、前のクエリを `simpleJSON*` 関数を使用して書き換えた例を示します：

```sql
SELECT
    toYear(parseDateTimeBestEffort(simpleJSONExtractString(simpleJSONExtractRaw(body, 'versions'), 'created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.964 sec. Processed 2.48 million rows, 4.21 GB (2.58 million rows/s., 4.36 GB/s.)
```

上記は、`simpleJSONExtractString` を使用して `created` キーを抽出します。ここでは、公開日には最初の値のみが必要であることを利用しています。この場合、`simpleJSON*` 関数の制限は、パフォーマンス上の利点として受け入れるべきです。

### Mapの使用 {#using-map}

オブジェクトが主に同じタイプの任意のキーを格納するために使用される場合は、`Map` タイプの使用を考慮してください。理想的には、一意のキーの数は数百を超えないように設計してください。`Map` タイプはタグやラベル用に使用することをお勧めします。例えば、ログデータにおけるKubernetesポッドのラベルなどです。`Map`はネストされた構造を表現するシンプルな方法ですが、いくつかの顕著な制限があります：

- フィールドはすべて同じタイプでなければなりません。
- サブカラムにアクセスするには特別なマップ構文が必要です。フィールドはカラムとして存在せず、オブジェクト全体がカラムです。
- サブカラムへのアクセスは、全体の `Map` 値（すべての兄弟およびそれぞれの値を含む）をロードします。大きなマップの場合、これにより大幅なパフォーマンスのペナルティが発生する可能性があります。

:::note 文字列キー
オブジェクトを `Map` としてモデル化する際は、JSONキー名を保存するために `String` キーが使用されます。マップはしたがって常に `Map(String, T)` で、ここで `T` はデータに応じます。
:::
#### プリミティブ値 {#primitive-values}

`Map`の最も単純な適用は、オブジェクトが値として同じプリミティブ型を含む場合です。ほとんどの場合、これは値 `T` に対して `String` 型を使用することが含まれます。

以前の[人のJSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えてみましょう。ここで `company.labels` オブジェクトは動的であると判断されました。重要なのは、私たちがこのオブジェクトに追加されることを期待しているのは、String 型のキーとバリューのペアだけであるということです。したがって、これを `Map(String, String)` と宣言することができます：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String, labels Map(String,String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

私たちは元の完全なJSONオブジェクトを挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

リクエストオブジェクト内のこれらのフィールドをクエリするには、マップの構文が必要です。例：

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

この時点での `Map` 関数の完全なセットは、[こちら](/sql-reference/functions/tuple-map-functions.md)で説明されています。データが一貫性のある型でない場合は、[必要な型強制](/sql-reference/functions/type-conversion-functions)を実行するための関数が存在します。

#### オブジェクト値 {#object-values}

`Map`型は、サブオブジェクトを持つオブジェクトにも考慮される場合があります。ただし、後者はその型に一貫性が必要です。

たとえば、`persons`オブジェクトの `tags` キーが一貫した構造を必要とし、各 `tag` のサブオブジェクトが `name` および `time` カラムを持つ場合を考えます。このようなJSONドキュメントの簡略化された例は次のようになります：

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

これは次のように `Map(String, Tuple(name String, time DateTime))` でモデル化できます：

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `tags` Map(String, Tuple(name String, time DateTime))
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"},"car":{"name":"Tesla","time":"2024-07-11 15:18:23"}}}

Ok.

1 row in set. Elapsed: 0.002 sec.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 row in set. Elapsed: 0.001 sec.
```

この場合におけるマップの適用は通常稀であり、データが動的なキー名を持ってサブオブジェクトを持たないように再モデル化されるべきであることを示唆しています。たとえば、上記は以下のように再モデル化され、`Array(Tuple(key String, name String, time DateTime))`の使用を可能にします。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```
