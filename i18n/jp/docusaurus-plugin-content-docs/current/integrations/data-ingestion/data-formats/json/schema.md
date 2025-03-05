---
title: JSONスキーマの設計
slug: /integrations/data-formats/json/schema
description: JSONスキーマを最適に設計する方法
keywords: [json, clickhouse, inserting, loading, formats, schema]
---

# スキーマの設計

[schema inference](/integrations/data-formats/json/inference) を使用して、JSONデータの初期スキーマを確立し、S3などの場所にあるJSONデータファイルをクエリすることができますが、ユーザーは自分のデータの最適化されたバージョン付きスキーマを確立することを目指すべきです。以下にJSON構造をモデリングする選択肢について説明します。
## 可能な限りの抽出 {#extract-where-possible}

可能な限り、ユーザーは頻繁にクエリされるJSONキーをスキーマのルートにあるカラムに抽出することを推奨します。これにより、クエリの構文が単純化され、必要に応じてこれらのカラムを `ORDER BY` 句で使用したり、[secondary index](/optimize/skipping-indexes)を指定したりできます。

例として、[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を考えてみましょう。これはガイド[**JSON schema inference**](/integrations/data-formats/json/inference)で探求されています：

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

`versions.created` の最初の値を主な順序付けキー（理想的には `published_date` という名前）にしたいとします。これは、挿入前に抽出するか、挿入時にClickHouseの[materialized views](/docs/materialized-view/incremental-materialized-view)または[materialized columns](/sql-reference/statements/alter/column#materialize-column)を使用して行う必要があります。

物理カラムは、クエリ時に データを抽出する最も簡単な手段を表し、抽出ロジックが単純なSQL式としてキャッチできる場合は推奨されます。たとえば、`published_date` はarXivスキーマに物理カラムとして追加され、以下のように順序付けキーとして定義されることができます：

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
:::note ネストされたカラムの表現
上記は、位置に基づいて `created` カラムを参照するために `versions[1].1` の記法を使用する必要があります。これは、推奨される構文である `versions.created_at[1]` ではありません。
:::

データをロードすると、カラムが抽出されます：

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

:::note 物理カラムの動作
物理カラムの値は常に挿入時に計算され、`INSERT` クエリに指定することはできません。物理カラムはデフォルトでは `SELECT *` に含まれません。これは、`SELECT *` の結果は常にINSERTを使用してテーブルに戻すことができるという不変性を保持するためです。この動作は、`asterisk_include_materialized_columns=1`を設定することで無効にできます。
:::

より複雑なフィルタリングと変換タスクには、[materialized views](/materialized-view/incremental-materialized-view)の使用を推奨します。
## 静的JSONと動的JSON {#static-vs-dynamic-json}

JSONのスキーマを定義する上での主なタスクは、各キーの値に適切なタイプを決定することです。ユーザーは、各キーに対して適切なタイプを決定するために、以下のルールを再帰的に適用することを推奨します。

1. **原始タイプ** - キーの値が原始タイプである場合、サブオブジェクトの一部であろうとなかろうと、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)や[タイプ最適化ルール](/data-modeling/schema-design#optimizing-types)に従ってそのタイプを選択してください。たとえば、以下の`phone_numbers`のような原始の配列は`Array(<type>)`、つまり `Array(String)` としてモデル化できます。
2. **静的 vs 動的** - キーの値が複雑なオブジェクト（すなわち、オブジェクトまたはオブジェクトの配列）である場合、そのオブジェクトが変更の対象であるかどうかを確認します。新しいキーが追加されることがほとんどないオブジェクトや、新しいキーの追加が予測でき、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)を通じてスキーマの変更を行うことができる場合、それを **静的** とみなすことができます。不完全なJSONドキュメントでは、提供されるキーのサブセットのみが存在するオブジェクトを含めます。新しいキーが頻繁に追加される、または予測できないオブジェクトは、**動的**として考慮する必要があります。値が **静的** か **動的** かを確定するには、以下の関連セクション[**Handling static objects**](/integrations/data-formats/json/schema#handling-static-objects)と[**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-dynamic-objects)を参照してください。

<p></p>

**重要:** 上記のルールは再帰的に適用すべきです。キーの値が動的であると判断された場合、さらなる評価は必要なく[**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-dynamic-objects) のガイドラインに従うことができます。オブジェクトが静的な場合は、サブキーを評価し続けて、どちらかのキーが原始的であるか、動的なキーが見つかるまで評価します。

これらのルールを示すために、以下のJSON例を使用して人を表します：

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

- ルートキー `name`、`username`、`email`、`website` は `String` タイプで表現できます。カラム `phone_numbers` は `Array(String)` の原始の配列であり、`dob` と `id` はそれぞれ `Date` と `UInt32` 型です。
- `address` オブジェクトには新しいキーが追加されないため（新しいアドレスオブジェクトのみ）、これを **静的** と見ることができます。再帰的に評価すると、すべてのサブカラムは原始的（タイプ `String`）と考えることができ、`geo` だけが静的構造で2つの `Float32` カラム、`lat` と `lng` を持ちます。
- `tags` カラムは **動的** です。このオブジェクトに新しい任意のタグが追加できると仮定します。
- `company` オブジェクトは **静的** で、常に指定された3つのキーのうちの最大を含みます。サブキー `name` と `catchPhrase` は `String` 型です。キー `labels` は **動的** です。このオブジェクトに新しい任意のタグが追加されると仮定します。値は常に文字列のキーと値のペアです。
## 静的オブジェクトの扱い {#handling-static-objects}

静的オブジェクトは、名前付きタプルすなわち `Tuple` を使用して扱うことを推奨します。オブジェクトの配列は、タプルの配列すなわち `Array(Tuple)` を使用して保持できます。タプル内では、カラムとそれぞれのタイプに対して同じルールを適用する必要があります。これにより、ネストされたオブジェクトを表現するためのネストされたタプルを作成できます。

具体例として、先ほどのJSON人の例を使用し、動的なオブジェクトを省略します：

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

`company` カラムが `Tuple(catchPhrase String, name String)` として定義されている様子に注意してください。`address` フィールドは `Array(Tuple)` を使用し、`geo` カラムを表すためにネストされたタプルを使用しています。

この構造のJSONは次のようにこのテーブルに挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上記の例では、データが最小限になりますが、以下のように、タプルフィールドをドット区切りの名前でクエリすることができます。

```sql
SELECT
    address.street,
    company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street` カラムが `Array` として返される様子に注意してください。位置によって配列内の特定のオブジェクトをクエリするには、列名の後に配列オフセットを指定する必要があります。たとえば、最初の住所から通りを取得するには：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

タプルの主な欠点は、サブカラムを順序キーとして使用できないことです。したがって、次は失敗します：

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

:::note 順序キーにおけるタプル
タプルカラムは順序キーとして使用できませんが、全体のタプルは使用可能です。しかし、これは通常あまり意味を成しません。
:::
### デフォルト値の扱い {#handling-default-values}

JSONオブジェクトは構造化されている場合でも、知られているキーのサブセットのみが提供され、しばしばスパースです。幸運なことに、`Tuple` 型ではJSONペイロード中のすべてのカラムが必要なわけではありません。提供されない場合は、デフォルト値が使用されます。

先ほどの `people` テーブルと、次のスパースJSON（`suite`、`geo`、`phone_numbers`、`catchPhrase`のキーが欠落）を考えてみましょう。

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

以下のようにこの行を正常に挿入できることがわかります：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この1行をクエリすると、省略されたカラム（サブオブジェクトを含む）にはデフォルト値が使用されていることがわかります：

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

:::note 空とヌルの区別
値が空であることと提供されていないことの区別が必要な場合は、[Nullable](/sql-reference/data-types/nullable)型を使用できます。この場合、[は避けるべきです](/cloud/bestpractices/avoid-nullable-columns)が、絶対に必要でない限り、これを使用することは推奨されません。なぜなら、これがストレージとクエリパフォーマンスに悪影響を及ぼすためです。
:::
### 新しいカラムの扱い {#handling-new-columns}

スキーマの変更を計画できる場合は、静的キーのスキーマに構造化されたアプローチを用いることができます。すなわち、新しいキーが事前に知られており、スキーマをそれに応じて変更できる場合です。

注意すべき点は、ClickHouseはデフォルトでペイロード内で提供され、スキーマに存在しないJSONキーを無視することです。以下のように、`nickname` キーが追加された修正されたJSONペイロードを考えてみましょう：

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

このJSONは、`nickname` キーが無視された状態で正常に挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

スキーマへのカラムを追加するには、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用します。デフォルトは `DEFAULT` 句経由で指定でき、その指定が次の挿入時に存在しない場合に使用されます。この値が存在しない行（作成前に挿入されたもの）も、このデフォルト値が返されます。デフォルト値が指定されていない場合は、そのタイプのデフォルト値が使用されます。

例えば：

```sql
-- 初期行挿入 (ニックネームは無視される)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- カラムの追加
ALTER TABLE people
    (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- 新しい行を挿入 (同じデータ異なるID)
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
## 動的オブジェクトの扱い {#handling-dynamic-objects}

動的オブジェクトを扱うために推奨されるアプローチは2つあります：

- [Map(String,V)](/sql-reference/data-types/map) タイプ
- [String](/sql-reference/data-types/string) とJSON関数

これらを検討し、最も適切なものを決定するためのルールを適用できます。

1. オブジェクトが予測可能な構造を持たず、任意のネストされたオブジェクトを含む、高度に動的な場合、ユーザーは `String` タイプを使用するべきです。値は、以下に示すJSON関数を使用してクエリ時に抽出できます。
2. オブジェクトが主に1つのタイプの任意のキーを格納するために使用される場合は、`Map` タイプの使用を検討してください。理想的には、一意のキーの数が数百を超えてはいけません。`Map` タイプは、サブオブジェクトを持つオブジェクトにも考慮されますが、その場合はそのタイプに均一性が必要です。一般的に、`Map` タイプはラベルやタグに使用することを推奨しています。例えば、ログデータ内のKubernetesポッドラベル。

<br />

:::note オブジェクトレベルのアプローチを適用
同じスキーマ内の異なるオブジェクトに対して異なる技術を適用できます。いくつかのオブジェクトは `String` で、他のオブジェクトは `Map` で最良の解決策です。`String` タイプが使用されると、以降のスキーマの決定は必要ありません。逆に、以下のように `Map` キー内にサブオブジェクトをネストすることは可能です。
:::
### Stringを使用する {#using-string}

上記で説明した構造化アプローチを用いてデータを扱うことは、変更対象であるか、スキーマが十分に理解されていない動的JSONを持つユーザーにはしばしば実現不可能です。絶対的な柔軟性を持たせるために、ユーザーは単にJSONを `String` として格納し、必要に応じて関数を使用してフィールドを抽出できます。これは、JSONを構造化されたオブジェクトとして扱うことの極端な反対を示しています。この柔軟性は、クエリ構文の複雑さの増加とパフォーマンスの低下という明確なコストを伴います。

前述の通り、[元の人物オブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)では `tags` カラムの構造を保証できません。元の行を挿入します（`company.labels` も含めますが、今回は無視します）：

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

`tags` カラムを選択してJSONが文字列として挿入されたことを確認します：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用してこのJSONから値を取得できます。以下は単純な例です：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数は、`String` カラム `tags` への参照と、抽出するJSON内のパスの両方を必要とします。ネストされたパスは、例えば `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` のように、関数がネストされる必要があります。ネストされたパスの抽出は、[JSON_QUERY](/sql-reference/functions/json-functions.md/#json_queryjson-path) と [JSON_VALUE](/sql-reference/functions/json-functions.md/#json_valuejson-path) 関数を使って簡素化できます。

arXivデータセットの極端なケースを考えてみましょう。全体を `String` と見なします。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマに挿入するには、`JSONAsString` フォーマットを使用する必要があります：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

リリースされた論文の数を年ごとに数えたいとしましょう。スキーマの[構造化版](/integrations/data-formats/json/inference#creating-tables)と、単に文字列を使用した場合のクエリを対比してみましょう：

```sql
-- 構造化スキーマを使用する
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

-- 構造化されていない文字列を使用する
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

ここでは、JSONをフィルタリングするためにXPath式を使用していることに注意してください。すなわち、`JSON_VALUE(body, '$.versions[0].created')`。

文字列関数は、明らかに遅く（> 10倍）なり、インデックスによる明示的な型変換よりも遅くなります。これらのクエリは常にフルテーブルスキャンが必要であり、すべての行を処理します。このようなクエリは、このような小さなデータセットではまだ迅速ですが、データセットが大きくなるにつれてパフォーマンスが低下します。

このアプローチの柔軟性は、明確なパフォーマンスと構文のコストを伴い、スキーマ内の高度に動的なオブジェクトのみに使用するべきです。
#### シンプルなJSON関数 {#simple-json-functions}

上記の例では、JSON*ファミリーの関数を使用しています。これらは、[simdjson](https://github.com/simdjson/simdjson) に基づくフルJSONパーサーを使用しており、厳密な解析を行い、異なるレベルにネストされている同じフィールドを区別します。これらの関数は、文法的には正しいが整形が不十分なJSON（例：キー間の二重スペース）を扱うことができます。

より高速で厳密なセットの関数も利用可能です。`simpleJSON*`関数は、主にJSONの構造とフォーマットにおいて厳密な仮定を行うことにより、優れたパフォーマンスを提供します。具体的には：

* フィールド名は定数でなければなりません。
* フィールド名の一貫したエンコーディング（例： `simpleJSONHas('{"abc":"def"}', 'abc') = 1` ただし、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`）
* フィールド名はすべてのネストされた構造の間でユニークである必要があります。ネストレベルを区別せず、一致は無 discriminated です。複数の一致するフィールドがある場合、最初の出現が使用されます。
* 文字列リテラル以外の特殊文字（空白を含む）は使用できません。以下は無効であり、パースされません。

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    これに対し、以下は正常にパースされます：

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

パフォーマンスが重要で、JSONが上記の要件を満たす場合、これらは適切な選択肢となる場合があります。先ほどのクエリの例を、`simpleJSON*` 関数を使って書き換えたものは以下のようになります：

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
Peak memory usage: 211.49 MiB.
```

上記では、`simpleJSONExtractString` を使用して `created` キーを抽出し、最初の値しか必要としないことを活用しています。この場合、`simpleJSON*` 関数の制限はパフォーマンス向上のために容認できます。
### Mapを使用する {#using-map}

オブジェクトが主に1つのタイプの任意のキーを格納するために使用される場合は、`Map` タイプを使用してください。理想的には、一意のキーの数は数百を超えてはいけません。`Map` タイプは、ラベルやタグに使用することが推奨されています。ログデータのKubernetesポッドラベルなど、ネストされた構造を表現する簡単な方法として、`Map`にはいくつかの顕著な制限があります。

- フィールドはすべて同じタイプでなければなりません。
- サブカラムにアクセスするには特別なマップ構文が必要です。フィールドがカラムとして存在しないため、オブジェクト全体がカラムとなります。
- サブカラムにアクセスすると、全ての兄弟兄妹とそれぞれの値をロードします。大きなマップでは、これにより大幅なパフォーマンスペナルティが生じる可能性があります。

:::note 文字列キー
オブジェクトを `Map` としてモデル化する際には、JSONキー名を格納するために `String` キーが使用されます。したがって、マップは常に `Map(String, T)` となります。ここで、`T` はデータによって異なります。
:::

#### プリミティブ値 {#primitive-values}

`Map`の最も単純な適用は、オブジェクトが同じプリミティブ型を値として含む場合です。ほとんどの場合、これは値 `T` に `String` 型を使用することを含みます。

私たちの[以前の人物JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えてみましょう。ここで `company.labels` オブジェクトは動的であると判断されました。重要なことは、このオブジェクトにはタイプが `String` のキー-バリューペアのみが追加されることを期待していることです。このため、これを `Map(String, String)` として宣言できます。

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

1 行がセットされました。 経過時間: 0.002 秒。
```

リクエストオブジェクト内でこれらのフィールドをクエリするには、マップ構文が必要です。例えば：

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 行がセットされました。 経過時間: 0.001 秒。

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 行がセットされました。 経過時間: 0.001 秒。
```

この時にクエリを実行するための `Map` 関数の完全なセットが利用可能で、[こちらで説明されています](/sql-reference/functions/tuple-map-functions.md)。データが一貫した型でない場合、[必要な型の強制変換](/sql-reference/functions/type-conversion-functions)を行うための関数が存在します。

#### オブジェクト値 {#object-values}

`Map`型は、サブオブジェクトがあるオブジェクトにも考慮できます。ただし、後者がその型において一貫性を持つ場合に限ります。

私たちの `persons` オブジェクトの `tags` キーが、一貫した構造を必要とし、それぞれの `tag` に対してのサブオブジェクトが `name` と `time` カラムを持つと仮定します。このようなJSONドキュメントの簡略化された例は次のようになります：

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

これは、次のように `Map(String, Tuple(name String, time DateTime))` でモデル化できます：

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

1 行がセットされました。 経過時間: 0.002 秒。

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 行がセットされました。 経過時間: 0.001 秒。
```

この場合のマップの適用は通常稀であり、データは動的なキー名がサブオブジェクトを持たないように再モデル化されるべきことを示唆しています。例えば、上記は次のようにモデル化され、 `Array(Tuple(key String, name String, time DateTime))` の使用が可能になります。

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
