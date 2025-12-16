---
title: 'JSON スキーマの設計'
slug: /integrations/data-formats/json/schema
description: '最適な JSON スキーマ設計の方法'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'formats', 'schema', 'structured', 'semi-structured']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# スキーマ設計 {#designing-your-schema}

[スキーマ推論](/integrations/data-formats/json/inference) を利用すると、JSON データの初期スキーマを定義したり、S3 上などにある JSON データファイルに対してその場でクエリを実行したりできますが、最終的にはデータに対して最適化されたバージョン管理可能なスキーマを確立することを目指すべきです。以下では、JSON 構造をモデリングするための推奨アプローチについて説明します。

## 静的 JSON と動的 JSON {#static-vs-dynamic-json}

JSON 用のスキーマを定義する際の主な作業は、各キーの値に対して適切な型を決定することです。JSON 階層内の各キーについて適切な型を決定するために、以下のルールを再帰的に適用することを推奨します。

1. **プリミティブ型** - キーの値がプリミティブ型である場合、それがサブオブジェクトの一部かルートにあるかに関係なく、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)と[型最適化ルール](/data-modeling/schema-design#optimizing-types)に従って型を選択してください。下記の `phone_numbers` のようなプリミティブ型の配列は、`Array(<type>)`（例: `Array(String)`）としてモデリングできます。
2. **静的 vs 動的** - キーの値が複合オブジェクト、すなわちオブジェクトまたはオブジェクトの配列である場合、それが変更されやすいかどうかを判断します。新しいキーが追加されることがまれであり、その追加が予測可能で、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) によるスキーマ変更で対応できるオブジェクトは、**静的**と見なすことができます。これは、一部の JSON ドキュメントでのみキーのサブセットが提供されるようなオブジェクトも含みます。新しいキーが頻繁に追加される、または予測不可能なオブジェクトは、**動的**と見なすべきです。**ここでの例外は、利便性のために動的と見なすことができる、数百または数千のサブキーを持つ構造です。**

値が **静的** か **動的** かを判断する方法については、以下の [**静的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-static-structures) および [**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) の各セクションを参照してください。

<p />

**重要:** 上記のルールは再帰的に適用する必要があります。キーの値が動的であると判断された場合、それ以上の評価は不要であり、[**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) のガイドラインに従うことができます。オブジェクトが静的である場合は、キー値がプリミティブになるか動的なキーが見つかるまで、サブキーを評価し続けてください。

これらのルールを説明するために、人物を表す次の JSON の例を使用します。

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
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

これらのルールを適用すると、次のようになります:

* ルートキー `name`, `username`, `email`, `website` は型 `String` として表現できます。カラム `phone_numbers` はプリミティブ型の配列で、型は `Array(String)` です。`dob` と `id` はそれぞれ型 `Date` および `UInt32` です。
* 新しいキーは `address` オブジェクトには追加されず（新しい address オブジェクトが追加されるだけ）であるため、これは **静的** と見なせます。再帰的にたどっていくと、`geo` を除くすべてのサブカラムはプリミティブ（かつ型 `String`）として扱えます。`geo` も `lat` と `lon` という 2 つの `Float32` カラムを持つ静的な構造です。
* `tags` カラムは **動的** です。このオブジェクトには任意の型と構造の新しいタグが追加され得ると仮定します。
* `company` オブジェクトは **静的** で、常に最大でも指定された 3 つのキーのみを含みます。サブキー `name` と `catchPhrase` は型 `String` です。キー `labels` は **動的** です。このオブジェクトにも任意のタグが追加され得ると仮定します。値は常に文字列型のキーと値のペアです。


:::note
数百から数千の静的キーを持つ構造体は、これらのカラムを静的に宣言するのが現実的でない場合が多いため、動的なものとして扱うことができます。ただし可能な限り、ストレージと推論の両方のオーバーヘッドを削減するために、不要な[パスをスキップ](#using-type-hints-and-skipping-paths)してください。
:::

## 静的な構造の扱い方 {#handling-static-structures}

静的な構造は、名前付きタプル（`Tuple`）を使って扱うことを推奨します。オブジェクトの配列は、`Array(Tuple)` のようにタプルの配列として保持できます。タプル内でも、カラムとその型は同じルールに従って定義する必要があります。これにより、以下に示すように、入れ子になったオブジェクトを表現するために入れ子の `Tuple` を使用できます。

これを説明するために、前述の JSON の person の例を用い、動的なオブジェクトは省略します。

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

このテーブルのスキーマは次のとおりです。

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

`company` カラムが `Tuple(catchPhrase String, name String)` として定義されていることに着目してください。`address` キーは `Array(Tuple)` を使用し、ネストされた `Tuple` によって `geo` カラムを表現しています。

このテーブルには、現在の構造のまま JSON を挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上の例ではデータ量は少ないですが、以下のように、ピリオドで区切られた名前を使ってタプルカラムにクエリを実行できます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street`カラムが`Array`として返されている点に注目してください。配列内の特定のオブジェクトを位置で参照するには、カラム名の後ろに配列のオフセットを指定する必要があります。たとえば、最初の住所のstreetにアクセスするには、次のようにします。`

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

サブカラムは、[`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) 以降、ソートキーとしても使用できます。

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
```


### デフォルト値の扱い {#handling-default-values}

JSON オブジェクトは構造化されていても、既知のキーの一部だけが提供されるスパースな形になっていることがよくあります。幸い、`Tuple` 型は JSON ペイロード内のすべてのカラムを必須とはしません。指定されなかった場合は、デフォルト値が使用されます。

前述の `people` テーブルと、`suite`、`geo`、`phone_numbers`、`catchPhrase` のキーが欠けている、次のようなスパースな JSON を考えます。

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

以下の行は正常に挿入できることが確認できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この単一行をクエリすると、省略されたカラム（サブオブジェクトを含む）にはデフォルト値が使用されていることを確認できます。

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

:::note 空値とNULLを区別する
値が空である場合と、そもそも指定されていない場合を区別する必要がある場合は、[Nullable](/sql-reference/data-types/nullable) 型を使用できます。ただし、これはストレージおよびこれらのカラムに対するクエリ性能に悪影響を与えるため、絶対に必要な場合を除いては[避けるべきです](/best-practices/select-data-types#avoid-nullable-columns)。
:::


### 新しいカラムの扱い {#handling-new-columns}

JSON のキーが固定であれば構造化アプローチが最も簡単ですが、新しいキーが事前に分かっており、スキーマ変更を計画できる場合には、スキーマをそれに合わせて更新することで、このアプローチを引き続き利用できます。

ClickHouse はデフォルトでは、ペイロード内に含まれていてもスキーマに存在しない JSON キーを無視する点に注意してください。`nickname` キーを追加した、次のような変更済み JSON ペイロードを考えてみます。

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics"
  },
  "dob": "2007-03-31"
}
```

この JSON は `nickname` キーを無視して正常に挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

カラムは、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用してスキーマに追加できます。`DEFAULT` 句でデフォルト値を指定でき、後続の挿入時に値が指定されなかった場合にそのデフォルト値が使用されます。そのカラムが作成される前に挿入された行など、値が存在しない行に対しても、このデフォルト値が返されます。`DEFAULT` 値が指定されていない場合は、その型のデフォルト値が使用されます。

例えば次のとおりです。

```sql
-- insert initial row (nickname will be ignored)
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- add column
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- insert new row (same data different id)
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- select 2 rows
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```


## 半構造化／動的な構造の扱い方 {#handling-semi-structured-dynamic-structures}

キーが動的に追加されたり、複数の型を取り得るような半構造化 JSON データの場合は、[`JSON`](/sql-reference/data-types/newjson) 型を推奨します。

より具体的には、次のような場合に JSON 型を使用します:

* 時間の経過とともに変化しうる **予測不能なキー** を持っている場合。
* **さまざまな型の値** を含んでいる場合（例: あるパスには文字列が入ることもあれば、数値が入ることもある）。
* 厳密な型付けが現実的ではなく、スキーマの柔軟性が必要な場合。
* **数百から数千** に及ぶパスがあり静的ではあるものの、それらを明示的に宣言するのが現実的ではない場合。このようなケースはまれです。

[`company.labels`](/integrations/data-formats/json/schema#static-vs-dynamic-json) オブジェクトが動的であると判断された、先ほどの person の JSON データを考えてみましょう。

`company.labels` が任意のキーを持ちうると仮定します。さらに、この構造内の任意のキーの型は、行ごとに一貫していない可能性があります。例えば、次のような場合です:

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
  "phone_numbers": [
    "010-692-6593",
    "020-192-3333"
  ],
  "website": "clickhouse.com",
  "company": {
    "name": "ClickHouse",
    "catchPhrase": "The real-time data warehouse for analytics",
    "labels": {
      "type": "database systems",
      "founded": "2021",
      "employees": 250
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

```json
{
  "id": 2,
  "name": "Analytica Rowe",
  "username": "Analytica",
  "address": [
    {
      "street": "Maple Avenue",
      "suite": "Apt. 402",
      "city": "Dataford",
      "zipcode": "11223-4567",
      "geo": {
        "lat": 40.7128,
        "lng": -74.006
      }
    }
  ],
  "phone_numbers": [
    "123-456-7890",
    "555-867-5309"
  ],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": [
        "real-time processing"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "Running simulations",
    "holidays": [
      {
        "year": 2023,
        "location": "Kyoto, Japan"
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

`company.labels` カラムは、オブジェクト間でキーや型が動的に変化する性質があるため、このデータをモデリングする方法としてはいくつかの選択肢があります。

* **単一の JSON カラム** - スキーマ全体を 1 つの `JSON` カラムとして表現し、その配下のすべての構造を動的にできるようにします。
* **対象を絞った JSON カラム** - `company.labels` カラムに対してのみ `JSON` 型を使用し、それ以外のカラムには上記で使用した構造化スキーマを維持します。

最初のアプローチは[これまでの手法とは一致しません](#static-vs-dynamic-json)が、単一の JSON カラム方式はプロトタイピングやデータエンジニアリングの作業には有用です。

大規模に ClickHouse を本番運用する場合は、可能な限り構造を明確に定義し、動的なサブ構造に対してのみ JSON 型を使用することを推奨します。

厳格なスキーマには、いくつかの利点があります。


- **データ検証** – 特定の構造を用いる場合を除き、厳密なスキーマを適用することでカラム数の爆発的増加リスクを回避できます。 
- **カラムの爆発的増加リスクの回避** - JSON 型は、サブカラムを専用カラムとして保存することで潜在的に数千のカラムまでスケールできますが、その結果として過剰な数のカラムファイルが作成され、パフォーマンスに悪影響を与える「カラムファイルの爆発」が発生する可能性があります。これを軽減するために、JSON が内部で利用する [Dynamic type](/sql-reference/data-types/dynamic) は [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータを提供しており、個別のカラムファイルとして保存されるユニークなパスの数を制限します。しきい値に達すると、追加のパスはコンパクトにエンコードされた形式で共有カラムファイル内に保存され、柔軟なデータインジェストを可能にしつつ、パフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスは、専用カラムファイルの場合ほど高いパフォーマンスは得られません。また、JSON カラムは [type hints](#using-type-hints-and-skipping-paths) と併用できる点にも注意してください。「ヒント付き」のカラムは、専用カラムと同等のパフォーマンスを提供します。
- **パスと型のイントロスペクションがより容易** - JSON 型は、推論された型やパスを判定するための [イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions) をサポートしていますが、`DESCRIBE` などで確認する場合、静的な構造の方が探索しやすいことがあります。

### 単一の JSON カラム {#single-json-column}

このアプローチは、プロトタイピングやデータエンジニアリングのタスクに有用です。本番環境では、必要な場合にのみ動的なサブ構造に対して `JSON` を使用することを検討してください。

:::note パフォーマンス上の考慮事項
単一の JSON カラムは、不要な JSON パスをスキップ（保存しない）し、[type hints](#using-type-hints-and-skipping-paths) を使用することで最適化できます。type hint を使用すると、ユーザーはサブカラムの型を明示的に定義できるため、クエリ実行時の推論および間接処理を省略できます。これにより、明示的なスキーマを使用した場合と同等のパフォーマンスを実現できます。詳細は「[Using type hints and skipping paths](#using-type-hints-and-skipping-paths)」を参照してください。
:::

ここでの単一 JSON カラムのスキーマは単純です：

```sql
SET enable_json_type = 1;

CREATE TABLE people
(
    `json` JSON(username String)
)
ENGINE = MergeTree
ORDER BY json.username;
```

:::note
`username` を並び順/主キーで使用するため、JSON 定義内の `username` カラムに対して [型ヒント](#using-type-hints-and-skipping-paths) を指定しています。これにより、ClickHouse はこのカラムが null になり得ないことを把握でき、どの `username` サブカラムを使用すべきかを認識できます（型ごとに複数存在しうるため、型ヒントがないと曖昧になります）。
:::

上記テーブルへの行の挿入は、`JSONAsObject` 形式を使用して実行できます。

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.004 sec.
```


```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2 rows in set. Elapsed: 0.005 sec.
```

[introspection functions](/sql-reference/data-types/newjson#introspection-functions) を使用して、推論されたサブカラムとその型を特定できます。例えば次のようになります。

```sql
SELECT JSONDynamicPathsWithTypes(json) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.employees": "Int64",
        "company.labels.founded": "String",
        "company.labels.type": "String",
        "company.name": "String",
        "dob": "Date",
        "email": "String",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}
{
    "paths": {
        "address": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "company.catchPhrase": "String",
        "company.labels.dissolved": "Int64",
        "company.labels.employees": "Int64",
        "company.labels.founded": "Int64",
        "company.labels.type": "Array(Nullable(String))",
        "company.name": "String",
        "dob": "Date",
        "id": "Int64",
        "name": "String",
        "phone_numbers": "Array(Nullable(String))",
        "tags.car.model": "String",
        "tags.car.year": "Int64",
        "tags.hobby": "String",
        "tags.holidays": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
        "website": "String"
 }
}

2 rows in set. Elapsed: 0.009 sec.
```

イントロスペクション関数の完全な一覧については、[「Introspection functions」](/sql-reference/data-types/newjson#introspection-functions) を参照してください。

[サブパスには](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) `.` 記法を使ってアクセスできます（例: ）。

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

行内で存在しないカラムは `NULL` として返されることに注意してください。


さらに、同じパスでも型ごとに別々のサブカラムが作成されます。たとえば、`String` 型と `Array(Nullable(String))` 型の両方に対して、`company.labels.type` 用のサブカラムが存在します。どちらも可能な限り返されますが、`.:` 構文を使用することで、特定のサブカラムを指定できます。

```sql
SELECT json.company.labels.type
FROM people

┌─json.company.labels.type─┐
│ database systems         │
│ ['real-time processing'] │
└──────────────────────────┘

2 rows in set. Elapsed: 0.007 sec.

SELECT json.company.labels.type.:String
FROM people

┌─json.company⋯e.:`String`─┐
│ ᴺᵁᴸᴸ                     │
│ database systems         │
└──────────────────────────┘

2 rows in set. Elapsed: 0.009 sec.
```

ネストされたサブオブジェクトを返すには、`^` が必要です。これは、明示的に要求されない限り多数のカラムを読み出さないようにするための設計上の判断です。`^` を付けずにアクセスしたオブジェクトは、以下に示すように `NULL` を返します。

```sql
-- sub objects will not be returned by default
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- return sub objects using ^ notation
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```


### 対象を絞った JSON カラム {#targeted-json-column}

プロトタイピングやデータエンジニアリング上の課題では有用ですが、本番環境では可能な限り明示的なスキーマを使用することを推奨します。

先ほどの例は、`company.labels` を 1 つの `JSON` カラムとして表現する形でモデリングできます。

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
    `company` Tuple(catchPhrase String, name String, labels JSON),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

このテーブルには、`JSONEachRow` フォーマットでデータを挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical

Row 1:
──────
id:            2
name:          Analytica Rowe
username:      Analytica
email:
address:       [('Dataford',(40.7128,-74.006),'Maple Avenue','Apt. 402','11223-4567')]
phone_numbers: ['123-456-7890','555-867-5309']
website:       fastdata.io
company:       ('Streamlined analytics at scale','FastData Inc.','{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]}')
dob:           1992-07-15
tags:          {"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}

Row 2:
──────
id:            1
name:          Clicky McCliickHouse
username:      Clicky
email:         clicky@clickhouse.com
address:       [('Wisokyburgh',(-43.9509,-34.4618),'Victor Plains','Suite 879','90566-7771')]
phone_numbers: ['010-692-6593','020-192-3333']
website:       clickhouse.com
company:       ('The real-time data warehouse for analytics','ClickHouse','{"employees":"250","founded":"2021","type":"database systems"}')
dob:           2007-03-31
tags:          {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}

2 rows in set. Elapsed: 0.005 sec.
```

[Introspection functions](/sql-reference/data-types/newjson#introspection-functions) を使用して、`company.labels` カラムに対して推論されたパスと型を確認できます。


```sql
SELECT JSONDynamicPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "Int64",
        "employees": "Int64",
        "founded": "Int64",
        "type": "Array(Nullable(String))"
 }
}
{
    "paths": {
        "employees": "Int64",
        "founded": "String",
        "type": "String"
 }
}

2 rows in set. Elapsed: 0.003 sec.
```


### 型ヒントの使用とパスのスキップ {#using-type-hints-and-skipping-paths}

型ヒントを使用すると、パスおよびそのサブカラムの型を明示的に指定でき、不必要な型推論を避けられます。次の例では、JSON カラム `company.labels` 内の JSON キー `dissolved`、`employees`、`founded` に対して型を指定しています。

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(
        city String,
        geo Tuple(
            lat Float32,
            lng Float32),
        street String,
        suite String,
        zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(
        catchPhrase String,
        name String,
        labels JSON(dissolved UInt16, employees UInt16, founded UInt16)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

これらのカラムに、いまや明示的な型が割り当てられていることに注目してください。

```sql
SELECT JSONAllPathsWithTypes(company.labels) AS paths
FROM people
FORMAT PrettyJsonEachRow

{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "String"
 }
}
{
    "paths": {
        "dissolved": "UInt16",
        "employees": "UInt16",
        "founded": "UInt16",
        "type": "Array(Nullable(String))"
 }
}

2 rows in set. Elapsed: 0.003 sec.
```

さらに、保存したくない JSON 内のパスは、[`SKIP` および `SKIP REGEXP`](/sql-reference/data-types/newjson) パラメータを使ってスキップすることで、ストレージ使用量を最小限に抑え、不要なパスに対する無駄な推論を避けることができます。たとえば、上記のデータに対して 1 つの JSON カラムを使用する場合、`address` および `company` のパスをスキップできます。


```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.
```

カラムがデータから除外されていることに注目してください。

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

{
    "json": {
        "dob" : "1992-07-15",
        "id" : "2",
        "name" : "Analytica Rowe",
        "phone_numbers" : [
            "123-456-7890",
            "555-867-5309"
        ],
        "tags" : {
            "car" : {
                "model" : "Audi e-tron",
                "year" : "2022"
            },
            "hobby" : "Running simulations",
            "holidays" : [
                {
                    "location" : "Kyoto, Japan",
                    "year" : "2023"
                }
            ]
        },
        "username" : "Analytica",
        "website" : "fastdata.io"
    }
}
{
    "json": {
        "dob" : "2007-03-31",
        "email" : "clicky@clickhouse.com",
        "id" : "1",
        "name" : "Clicky McCliickHouse",
        "phone_numbers" : [
            "010-692-6593",
            "020-192-3333"
        ],
        "tags" : {
            "car" : {
                "model" : "Tesla",
                "year" : "2023"
            },
            "hobby" : "Databases",
            "holidays" : [
                {
                    "location" : "Azores, Portugal",
                    "year" : "2024"
                }
            ]
        },
        "username" : "Clicky",
        "website" : "clickhouse.com"
    }
}

2 rows in set. Elapsed: 0.004 sec.
```


#### 型ヒントによるパフォーマンス最適化 {#optimizing-performance-with-type-hints}  

型ヒントは、不要な型推論を避けるだけでなく、ストレージおよび処理における間接参照を完全になくし、さらに[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)を指定できるようにします。型ヒント付きの JSON パスは、従来のカラムと同様の形で保存されるようになり、[**discriminator カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的な解決が不要になります。 

これは、型ヒントが適切に定義されていれば、ネストされた JSON キーが、最初からトップレベルのカラムとしてモデリングされていた場合と同等のパフォーマンスと効率を得られることを意味します。 

その結果、大部分が一貫していながらも JSON の柔軟性から恩恵を受けたいデータセットに対して、型ヒントは、スキーマや取り込みパイプラインを再構成することなくパフォーマンスを維持するための有効な手段となります。

### 動的パスの設定 {#configuring-dynamic-paths}

ClickHouse は各 JSON パスを真の列指向レイアウトにおけるサブカラムとして保存し、圧縮、SIMD による高速処理、最小限のディスク I/O など、従来のカラムと同様のパフォーマンス上の利点を実現します。JSON データ内のパスと型の組み合わせごとに、ディスク上で独立したカラムファイルとして保存されます。

<Image img={json_column_per_type} size="md" alt="JSON パスごとのカラム" />

例えば、2 つの JSON パスが異なる型で挿入された場合、ClickHouse はそれぞれの[具体的な型を別々のサブカラムに保存します](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。これらのサブカラムは個別にアクセスできるため、不要な I/O を最小限に抑えられます。複数の型を持つカラムに対してクエリを実行した場合でも、その値は単一のカラムとして返される点に注意してください。

さらに、オフセットを活用することで、ClickHouse はこれらのサブカラムが密な構造を保つようにし、存在しない JSON パスに対してデフォルト値を保存しません。このアプローチにより圧縮率が最大化され、I/O が一層削減されます。

<Image img={json_offsets} size="md" alt="JSON のオフセット" />

しかし、テレメトリパイプライン、ログ、機械学習のフィーチャーストアなど、高カーディナリティまたは構造が大きく変動する JSON 構造を扱うシナリオでは、この動作によってカラムファイルが爆発的に増加する可能性があります。新しい JSON パスが 1 つ増えるごとに新しいカラムファイルが作成され、そのパスごとの型のバリエーションごとに追加のカラムファイルが作成されます。これは読み取りパフォーマンスの観点では最適ですが、小さいファイルが大量に存在することでファイルディスクリプタの枯渇、メモリ使用量の増加、マージ処理の遅延といった運用上の課題を引き起こします。

これを軽減するために、ClickHouse はオーバーフロー・サブカラムという概念を導入しています。異なる JSON パスの数がしきい値を超えると、それ以降のパスはコンパクトにエンコードされた形式を用いて、単一の共有ファイルに格納されます。このファイルもクエリ可能ですが、専用のサブカラムと同等のパフォーマンス特性は得られません。

<Image img={shared_json_column} size="md" alt="共有 JSON カラム" />

このしきい値は、JSON 型の定義における [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) パラメータで制御されます。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを必要以上に大きな値に設定しないでください** - 値を大きくするとリソース消費が増加し、効率が低下します。経験則としては 10,000 未満に抑えることを推奨します。構造が高度に動的なワークロードでは、型ヒントや `SKIP` パラメータを使用して、保存する内容を制限してください。

この新しいカラム型の実装の詳細に関心があるユーザーは、詳細なブログ記事「[A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)」を参照することをおすすめします。
