---
title: 'JSON スキーマの設計'
slug: /integrations/data-formats/json/schema
description: 'JSON スキーマを最適に設計する方法'
keywords: ['json', 'clickhouse', 'inserting', 'loading', 'formats', 'schema', 'structured', 'semi-structured']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# スキーマ設計 \{#designing-your-schema\}

JSON データの初期スキーマを確立したり、たとえば S3 上の JSON データファイルに対してそのままクエリを実行するために [schema inference](/integrations/data-formats/json/inference) を利用することはできますが、最終的にはデータに対して最適化されたバージョン付きスキーマを確立することを目指すべきです。以下では、JSON 構造をモデリングするための推奨アプローチについて説明します。

## 静的 JSON と動的 JSON \{#static-vs-dynamic-json\}

JSON のスキーマを定義する際の主な作業は、各キーの値に対して適切な型を決定することです。JSON の階層内の各キーに対して、以下のルールを再帰的に適用し、各キーに対する適切な型を決定することを推奨します。

1. **プリミティブ型** - キーの値がプリミティブ型である場合、サブオブジェクトの一部かルート直下かに関わらず、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)および[型の最適化ルール](/data-modeling/schema-design#optimizing-types)に従って型を選択してください。以下の `phone_numbers` のようなプリミティブ型の配列は、`Array(<type>)`（例: `Array(String)`）としてモデリングできます。
2. **静的 vs 動的** - キーの値が複合オブジェクト、すなわちオブジェクト、またはオブジェクトの配列である場合、その構造が変更されるかどうかを判断します。新しいキーが追加されることがまれであり、その追加を [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) を用いたスキーマ変更で予測し対処できるオブジェクトは **静的 (static)** と見なせます。これには、一部の JSON ドキュメントでしか提供されないキーのサブセットを持つオブジェクトも含まれます。一方、新しいキーが頻繁に追加される、または予測できないオブジェクトは **動的 (dynamic)** と見なすべきです。**ここでの例外は、数百から数千のサブキーを持つ構造であり、運用上の便宜から動的とみなすことができます。**

値が **静的 (static)** か **動的 (dynamic)** かを判断するには、以下の [**静的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-static-structures) および [**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) の該当セクションを参照してください。

<p />

**重要:** 上記のルールは再帰的に適用する必要があります。あるキーの値が動的であると判断された場合、それ以上の評価は不要で、[**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) のガイドラインに従うことができます。オブジェクトが静的である場合は、キーの値がプリミティブになるか、動的なキーに遭遇するまでサブキーを評価し続けてください。

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

これらのルールを適用すると次のようになります:

* ルートキー `name`、`username`、`email`、`website` は型 `String` として表現できます。カラム `phone_numbers` は `Array(String)` 型のプリミティブな配列であり、`dob` と `id` はそれぞれ `Date` と `UInt32` 型です。
* 新しいキーは `address` オブジェクト自体には追加されず（新しい address オブジェクトが追加されるだけで）、そのためこれは **静的** と見なせます。再帰的にたどると、`geo` を除くすべてのサブカラムはプリミティブ（かつ型 `String`）と見なせます。`geo` もまた `lat` と `lon` という 2 つの `Float32` カラムを持つ静的な構造です。
* `tags` カラムは **動的** です。このオブジェクトには、任意の型・構造の新しいタグが追加され得ると想定します。
* `company` オブジェクトは **静的** であり、常に指定された最大 3 つのキーのみを含みます。サブキー `name` と `catchPhrase` は型 `String` です。キー `labels` は **動的** です。このオブジェクトに新しい任意のタグが追加され得ると想定します。値は常に、キーおよび値がいずれも文字列型のペアになります。


:::note
数百から数千もの静的キーを持つ構造は、それらに対応するカラムを静的に宣言するのは現実的でない場合が多いため、動的なものと見なすことができます。ただし、可能な限り不要なパスは[スキップ](#using-type-hints-and-skipping-paths)して、ストレージと推論の両方のオーバーヘッドを削減してください。
:::

## 静的な構造の扱い方 \{#handling-static-structures\}

静的な構造は名前付きタプル、すなわち `Tuple` を使用して扱うことを推奨します。オブジェクトの配列は、タプルの配列、つまり `Array(Tuple)` として保持できます。タプル内のカラムとその型も、同じルールに従って定義する必要があります。これにより、以下のように、入れ子になったオブジェクトを表現するために入れ子の `Tuple` を使用できます。

これを説明するために、前述の JSON の person の例から動的オブジェクトを省いたものを使用します。

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

`company` カラムが `Tuple(catchPhrase String, name String)` として定義されている点に注目してください。`address` キーは `Array(Tuple)` を使用しており、入れ子の `Tuple` で `geo` カラムを表現しています。

JSON は、この現在の構造のままこのテーブルに挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上記の例ではデータ量は最小限ですが、次に示すように、ピリオドで区切られた名前を使ってタプルのカラムにクエリを実行できます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street` カラムが `Array` として返されている点に注目してください。配列内の特定のオブジェクトを位置でクエリするには、カラム名の後ろに配列のオフセットを指定する必要があります。たとえば、最初の住所の street にアクセスするには次のようにします：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

サブカラムは、[`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) からはソートキーとしても使用できます。

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


### デフォルト値の扱い \{#handling-default-values\}

JSON オブジェクトは構造化されていても、多くの場合は既知のキーの一部しか含まれないスパースな形になります。幸い、`Tuple` 型では JSON ペイロード内のすべてのカラムが存在する必要はありません。指定されていない場合は、デフォルト値が使用されます。

先ほどの `people` テーブルと、`suite`、`geo`、`phone_numbers`、`catchPhrase` キーが欠落している、次のスパースな JSON を考えてみてください。

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

次のとおり、この行は正常に挿入できていることがわかります。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この1行だけをクエリしてみると、省略されたカラム（サブオブジェクトを含む）にはデフォルト値が使われていることが分かります。

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

:::note 空の値とnullの区別
値が空である場合と、値が指定されていない場合を区別する必要がある場合は、[Nullable](/sql-reference/data-types/nullable) 型を使用できます。ただし、これは絶対に必要な場合を除き[避けるべきです](/best-practices/select-data-types#avoid-nullable-columns)。これらのカラムに対しては、ストレージおよびクエリのパフォーマンスに悪影響を与えるためです。
:::


### 新しいカラムの扱い \{#handling-new-columns\}

JSON のキーが固定されている場合には構造化されたアプローチが最も簡単ですが、スキーマ変更を事前に計画できる、つまり新しいキーがあらかじめ分かっており、それに応じてスキーマを変更できるのであれば、このアプローチはその場合でも引き続き利用できます。

ClickHouse はデフォルトで、ペイロード内に含まれていてもスキーマに存在しない JSON キーを無視する点に注意してください。`nickname` キーを追加した、次のような変更済みの JSON ペイロードを考えてみます。

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

この JSON は、`nickname` キーを無視しても正常に挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

カラムは、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用してスキーマに追加できます。デフォルト値は `DEFAULT` 句で指定でき、その後の挿入時に値が指定されなかった場合に使用されます。このカラムの値を持たない行（カラムが作成される前に挿入された行）も、このデフォルト値を返します。`DEFAULT` 値が指定されていない場合は、その型のデフォルト値が使用されます。

例:

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


## 半構造化／動的な構造の扱い方 \{#handling-semi-structured-dynamic-structures\}

キーが動的に追加されたり、複数の型を取り得るような半構造化された JSON データの場合は、[`JSON`](/sql-reference/data-types/newjson) 型を推奨します。

より具体的には、次のような場合に JSON 型を使用します:

* 時間とともに変化し得る **予測不能なキー** を持っている。
* **さまざまな型の値** を含んでいる（例: あるパスには文字列が入ることもあれば、数値が入ることもある）。
* 厳密な型付けが現実的ではなく、スキーマの柔軟性が必要である。
* パスが **数百から数千** 存在し、それらは静的だが、明示的に宣言するのが現実的ではない場合（これはまれなケースです）。

[`company.labels`](/integrations/data-formats/json/schema#static-vs-dynamic-json) オブジェクトが動的であると判断された、[先ほどの person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) を考えてみます。

`company.labels` が任意のキーを含んでいると仮定しましょう。さらに、この構造内の任意のキーの型は、行ごとに一貫していない可能性があります。例えば、次のようなケースです:

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

`company.labels` カラムはオブジェクト間でキーや型の点で動的な性質を持つため、このデータをモデリングする方法としてはいくつかの選択肢があります。

* **単一の JSON カラム** - スキーマ全体を 1 つの `JSON` カラムとして表現し、その配下のすべての構造を動的に扱えるようにします。
* **対象を絞った JSON カラム** - `company.labels` カラムに対してのみ `JSON` 型を使用し、それ以外のすべてのカラムについては上記で使用した構造化スキーマを保持します。

最初のアプローチは[前述の手法とは整合しません](#static-vs-dynamic-json)が、単一 JSON カラムのアプローチはプロトタイピングやデータエンジニアリング作業には有用です。

大規模な本番環境で ClickHouse をデプロイする場合は、構造をできるだけ明確にし、可能な箇所では JSON 型を対象を絞った動的なサブ構造に対して使用することを推奨します。

厳密なスキーマには、いくつかの利点があります。


- **データ検証** – 厳密なスキーマを強制することで、特定の構造を除き、カラム数の爆発的増加リスクを回避できます。
- **カラムの爆発的増加リスクの回避** - JSON 型は、サブカラムが専用のカラムとして保存されることにより潜在的には数千のカラムまでスケール可能ですが、その結果として過剰な数のカラムファイルが作成され、パフォーマンスに影響する「カラムファイルの爆発」が発生する可能性があります。これを軽減するために、JSON で使用される基盤となる [Dynamic 型](/sql-reference/data-types/dynamic) は [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータを提供しており、個別のカラムファイルとして保存される一意のパスの数を制限します。このしきい値に達すると、追加のパスはコンパクトなエンコード形式を用いた共有カラムファイルに保存され、柔軟なデータインジェストを可能にしつつ、パフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスは、専用カラムほど高性能ではありません。また、JSON カラムは [type hints](#using-type-hints-and-skipping-paths) と併用できる点に注意してください。「ヒント付き」のカラムは専用カラムと同等のパフォーマンスを提供します。
- **パスと型のより単純なイントロスペクション** - JSON 型は、推論された型やパスを判定するための [イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions) をサポートしていますが、`DESCRIBE` などを用いて静的な構造を探索する方が簡単な場合もあります。

### 単一の JSON カラム \{#single-json-column\}

このアプローチは、プロトタイピングやデータエンジニアリングのタスクに有用です。本番環境では、必要な場合にのみ動的なサブ構造に対して `JSON` を使用するようにしてください。

:::note パフォーマンスに関する考慮事項
単一の JSON カラムは、不要な JSON パスをスキップ（保存しない）し、[type hints](#using-type-hints-and-skipping-paths) を使用することで最適化できます。type hints を使用すると、ユーザーはサブカラムの型を明示的に定義できるため、クエリ時の推論および間接処理を省略できます。これにより、明示的なスキーマを使用した場合と同等のパフォーマンスを実現できます。詳細については [&quot;Using type hints and skipping paths&quot;](#using-type-hints-and-skipping-paths) を参照してください。
:::

ここで扱う単一の JSON カラム用のスキーマはシンプルです。

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
`username` カラムをソートや主キーで使用するため、JSON 定義内で `username` カラムに対して [type hint](#using-type-hints-and-skipping-paths) を指定しています。これにより、ClickHouse はこのカラムが null にならないことを把握でき、どの `username` サブカラムを使用すべきかを判別できます（型ごとに複数存在し得るため、指定しないとあいまいになります）。
:::

上記テーブルへの行の挿入は、`JSONAsObject` フォーマットを使用して行えます。

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

[introspection functions](/sql-reference/data-types/newjson#introspection-functions) を使用して、推論されたサブカラムとその型を特定できます。例えば次のようにします：

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

[サブパスには](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) `.` 記法を使ってアクセスできます。例:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

行に含まれていないカラムは `NULL` として返されることに注意してください。


さらに、同じパスであっても型ごとに個別のサブカラムが作成されます。たとえば、`company.labels.type` に対しては、`String` と `Array(Nullable(String))` のそれぞれにサブカラムが存在します。両方とも可能な場合には返されますが、`.:` 構文を使用することで特定のサブカラムだけを対象にできます。

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

ネストされたサブオブジェクトを取得するには、`^` が必要です。これは、明示的に要求されない限り多数のカラムを読み込まないようにするための設計上の方針です。`^` を付けずにアクセスしたオブジェクトは、以下に示すように `NULL` を返します。

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


### ターゲットを絞った JSON カラム \{#targeted-json-column\}

プロトタイプ作成やデータエンジニアリング上の課題の解決には有用ですが、本番環境では可能な限り明示的なスキーマを使用することを推奨します。

先ほどの例は、`company.labels` を単一の `JSON` カラムとしてモデリングできます。

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

このテーブルには `JSONEachRow` フォーマットを使用してデータを挿入できます。

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

[Introspection functions](/sql-reference/data-types/newjson#introspection-functions) を使用して、`company.labels` カラムに対して推論されたパスとデータ型を特定できます。


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


### 型ヒントの利用とパスのスキップ \{#using-type-hints-and-skipping-paths\}

型ヒントを使うと、あるパスおよびそのサブカラムの型を指定できるため、不要な型推論処理を防ぐことができます。次の例では、JSON カラム `company.labels` 内の JSON キー `dissolved`、`employees`、`founded` に対して型を指定する場合を考えます。

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

これらのカラムに、先ほど明示的に指定した型が設定されていることに注目してください。

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

さらに、JSON 内の保存する必要のないパスを [`SKIP` および `SKIP REGEXP`](/sql-reference/data-types/newjson) パラメータでスキップすることで、ストレージ使用量を最小限に抑え、不要なパスに対する無駄な推論を避けることができます。たとえば、上記のデータに対して単一の JSON カラムを使用する場合、`address` および `company` パスをスキップできます。


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

カラムがデータから除外されていることがわかるでしょう。

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


#### 型ヒントによるパフォーマンス最適化 \\{#optimizing-performance-with-type-hints\\}

型ヒントは、不要な型推論を回避する手段以上のものを提供します。ストレージおよび処理における間接参照を完全になくし、さらに[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)を指定できるようにします。型ヒント付きの JSON パスは常に従来のカラムと同様のかたちで格納されるため、[**判別カラム (discriminator columns)**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) や、クエリ実行時の動的な解決が不要になります。 

つまり、型ヒントが適切に定義されていれば、ネストされた JSON キーは、最初からトップレベルのカラムとしてモデリングされていた場合と同等のパフォーマンスと効率を実現できます。 

そのため、ほとんどが一貫しているものの、なお JSON の柔軟性も活かしたいデータセットに対して、型ヒントはスキーマやデータ取り込みパイプラインを再構成することなくパフォーマンスを維持するための便利な手段となります。

### 動的パスの設定 \{#configuring-dynamic-paths\}

ClickHouse は各 JSON パスを真の列指向レイアウト内のサブカラムとして保存し、圧縮や SIMD による高速処理、最小限のディスク I/O など、従来のカラムで得られるのと同じパフォーマンス上の利点を実現します。JSON データ内の各一意なパスと型の組み合わせは、ディスク上で独立したカラムファイルになります。

<Image img={json_column_per_type} size="md" alt="JSON パスごとのカラム" />

例えば、2 つの JSON パスが異なる型で挿入された場合、ClickHouse はそれぞれの[具体的な型の値を別々のサブカラムに保存します](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。これらのサブカラムは個別に参照できるため、不要な I/O を最小化できます。複数の型を持つカラムに対してクエリを実行した場合でも、その値は 1 つの列指向の結果セットとして返される点に注意してください。

さらに、オフセットを活用することで、ClickHouse はこれらのサブカラムがスパースにならないよう高密度に保ち、存在しない JSON パスについてはデフォルト値を保存しません。このアプローチにより圧縮効率が最大化され、I/O もさらに削減されます。

<Image img={json_offsets} size="md" alt="JSON オフセット" />

しかし、テレメトリパイプライン、ログ、機械学習の特徴量ストアなど、高カーディナリティ、あるいは構造のばらつきが大きい JSON を扱うシナリオでは、この挙動によりカラムファイルが爆発的に増加する可能性があります。一意な JSON パスが追加されるたびに新しいカラムファイルが作成され、そのパス配下の型のバリアントごとにさらに追加のカラムファイルが作成されます。これは読み取りパフォーマンスの観点では最適ですが、多数の小さなファイルが存在することで、ファイルディスクリプタの枯渇、メモリ使用量の増加、マージ処理の低速化といった運用上の課題を引き起こします。

これを軽減するために、ClickHouse はオーバーフローサブカラムという概念を導入しています。異なる JSON パスの数が閾値を超えると、それ以降のパスはコンパクトにエンコードされた形式で、単一の共有ファイルに保存されます。このファイルもクエリ可能ですが、専用のサブカラムと同じパフォーマンス特性は得られません。

<Image img={shared_json_column} size="md" alt="共有 JSON カラム" />

この閾値は、JSON 型の定義内で指定する [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) パラメータによって制御されます。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを過度に大きな値に設定しないでください** — 値が大きいほどリソース消費が増加し、効率が低下します。経験則としては、10,000 未満に抑えることを推奨します。構造が非常に動的なワークロードでは、型ヒントと `SKIP` パラメータを使用して、保存対象を絞り込んでください。

この新しいカラム型の実装に関心のある方は、詳細なブログ記事 [&quot;A New Powerful JSON Data Type for ClickHouse&quot;](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse) を参照することをお勧めします。
