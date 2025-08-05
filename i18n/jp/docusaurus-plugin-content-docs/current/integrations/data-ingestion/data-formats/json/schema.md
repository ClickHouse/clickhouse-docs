---
title: 'JSONスキーマの設計'
slug: '/integrations/data-formats/json/schema'
description: 'JSONスキーマを最適に設計する方法'
keywords:
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'formats'
- 'schema'
- 'structured'
- 'semi-structured'
score: 20
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';



# スキーマの設計

[スキーマ推論](/integrations/data-formats/json/inference)を使用して、JSONデータの初期スキーマを確立し、S3などでJSONデータファイルをクエリすることができますが、ユーザーはデータに対して最適化されたバージョン管理されたスキーマを確立することを目指すべきです。以下に、JSON構造のモデリングに推奨されるアプローチを示します。
## 静的JSONと動的JSON {#static-vs-dynamic-json}

JSONのスキーマを定義する際の主なタスクは、各キーの値に適切な型を決定することです。ユーザーには、JSON階層内の各キーに対して以下のルールを再帰的に適用して、各キーの適切な型を決定することを推奨します。

1. **プリミティブ型** - キーの値がプリミティブ型である場合、サブオブジェクトの一部であるかルート上にあるかに関係なく、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)および[type optimization rules](/data-modeling/schema-design#optimizing-types)に従ってその型を選択してください。以下の`phone_numbers`のようなプリミティブの配列は、`Array(<type>)`としてモデル化できます。例えば、`Array(String)`。
2. **静的 vs 動的** - キーの値が複雑なオブジェクト（すなわち、オブジェクトまたはオブジェクトの配列）である場合、そのオブジェクトが変化する可能性があるかどうかを決定してください。新しいキーが稀に追加されるオブジェクトでは、新しいキーの追加が予測可能であり、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)を介したスキーマ変更で対処できる場合、これらは**静的**と見なされます。これは、いくつかのJSONドキュメントに提供されるのはキーのサブセットのみであるオブジェクトを含みます。新しいキーが頻繁に追加されるオブジェクトや予測不可能な場合は、**動的**と見なすべきです。**ここでの例外は、数百または数千のサブキーを持つ構造であり、便利さのために動的と見なすことができます**。

値が**静的**か**動的**かを確認するには、以下の関連セクション[**静的オブジェクトの取り扱い**](/integrations/data-formats/json/schema#handling-static-structures)および[**動的オブジェクトの取り扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)を参照してください。

<p></p>

**重要:** 上記のルールは再帰的に適用する必要があります。キーの値が動的であると判断された場合、さらなる評価は必要なく、[**動的オブジェクトの取り扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)のガイドラインに従うことができます。オブジェクトが静的な場合は、サブキーを評価し続け、キーの値がプリミティブであるか動的キーが見つかるまで続けます。

これらのルールを示すために、以下のJSON例を使用して人格を表現します:

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

これらのルールを適用すると:

- ルートキー`name`、`username`、`email`、`website`はタイプ`String`として表現できます。カラム`phone_numbers`は型`Array(String)`のプリミティブの配列で、`dob`と`id`はそれぞれタイプ`Date`と`UInt32`です。
- `address`オブジェクトに新しいキーが追加されることはなく（新しい住所オブジェクトのみ）、したがってそれは**静的**と見なされます。再帰処理を続けると、すべてのサブカラムはプリミティブ（タイプ`String`）と見なすことができますが、`geo`を除く。これもまた、２つの`Float32`カラム（`lat`と`lon`）を持つ静的構造です。
- `tags`カラムは**動的**です。このオブジェクトに新しい任意のタグが追加されることを想定します。
- `company`オブジェクトは**静的**で、常に指定された3つのキーしか含まれません。サブキー`name`と`catchPhrase`は`String`タイプです。キー`labels`は**動的**です。このオブジェクトに新しい任意のタグが追加されることを想定しています。値は常に文字列タイプのキーと値のペアになります。

:::note
数百または数千の静的キーを持つ構造は動的と見なすことができます。これは、これらに対して静的にカラムを宣言することは現実的ではありません。ただし、可能であれば、ストレージと推論のオーバーヘッドを節約するために[スキップパス](#using-type-hints-and-skipping-paths)を使用してください。
:::

## 静的な構造の取り扱い {#handling-static-structures}

静的な構造は、名前付きタプル、すなわち`Tuple`を使用して処理することを推奨します。オブジェクトの配列は、タプルの配列、すなわち`Array(Tuple)`を使用して保持できます。タプル内でも、カラムとそのそれぞれの型は同じルールを使用して定義する必要があります。これにより、以下に示すようにネストされたオブジェクトを表すためのネストされたタプルが作成される可能性があります。

これを説明するために、動的オブジェクトを省略した先のJSON人物例を使用します:

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

このテーブルのスキーマは以下のようになります:

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

`company`カラムが`Tuple(catchPhrase String, name String)`として定義されていることに注目してください。`address`キーは`Array(Tuple)`を使用し、`geo`カラムを表現するためにネストされた`Tuple`を使用します。

現在の構造のJSONをこのテーブルに挿入できます:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上記の例では、データが最小限ですが、以下に示すように、タプルカラムをその期間区切り名でクエリできます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street`カラムが`Array`として返される点に注意してください。配列内の特定のオブジェクトに位置でアクセスするには、カラム名の後に配列オフセットを指定する必要があります。たとえば、最初の住所から通りにアクセスするには:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

サブカラムは、[`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key)からのキーの順序付けにも使用できます:

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
### デフォルト値の処理 {#handling-default-values}

JSONオブジェクトが構造化されている場合でも、提供されるキーのサブセットのみでスパースなことがよくあります。幸いにも、`Tuple`型はJSONペイロード内のすべてのカラムを必要としません。提供されていない場合は、デフォルト値が使用されます。

先の`people`テーブルと、キー`suite`、`geo`、`phone_numbers`、および`catchPhrase`が欠けている次のスパースJSONを考えます。

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

以下のように、この行を正常に挿入できることがわかります:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この単一行をクエリすると、欠落したカラム（サブオブジェクトを含む）にデフォルト値が使用されることがわかります:

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
ユーザーが値が空であることと提供されていないことを区別する必要がある場合、[Nullable](/sql-reference/data-types/nullable)型を使用できます。これは、ストレージとクエリのパフォーマンスに悪影響を与えるため、絶対に必要ない限り[避けるべきです](/best-practices/select-data-types#avoid-nullable-columns)。
:::
### 新しいカラムの扱い {#handling-new-columns}

静的なJSONキーの場合、構造化されたアプローチが最も簡単ですが、スキーマに対する変更を計画できる場合（すなわち、新しいキーが事前に知られていて、それに応じてスキーマを変更できる場合）でもこのアプローチを使用できます。

ClickHouseは、デフォルトでペイロード内に提供され、スキーマに存在しないJSONキーを無視することに注意してください。次の修正されたJSONペイロードの`nickname`キーが追加された場合を考えます:

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

このJSONは、`nickname`キーが無視されて正常に挿入されます:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)コマンドを使用してスキーマにカラムを追加できます。`DEFAULT`句を使用してデフォルトを指定できます。これは、後続の挿入中に指定されていない場合に使用されます。この値が存在しない行（それは作成前に挿入されたため）もこのデフォルト値を返します。デフォルト値が指定されていない場合、型のデフォルト値が使用されます。

例えば:

```sql
-- 初期行を挿入します（nicknameは無視されます）
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- カラムを追加します
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- 新しい行を挿入します（同じデータで異なるid）
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- ２行を選択します
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2 rows in set. Elapsed: 0.001 sec.
```
## 半構造化/動的構造の取り扱い {#handling-semi-structured-dynamic-structures}

<PrivatePreviewBadge/>

JSONデータが半構造化されており、キーが動的に追加できたり、複数の型を持つ場合は、[`JSON`](/sql-reference/data-types/newjson)型を推奨します。

特に、データに以下の条件がある場合はJSON型を使用します：

- **予測不可能なキー**を持ち、時間と共に変わる可能性がある。
- **異なる型の値**（例えば、パスが時々文字列を含み、時々数値を含む）を含む。
- 厳密な型指定が実現できないスキーマ柔軟性が必要。
- 幾つかの**静的なパス**があるが明示的に宣言することは現実的ではない場合。これは稀である傾向があります。

先の[人物JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)では、`company.labels`オブジェクトが動的であると判断されました。

`company.labels`が任意のキーを含むと仮定しましょう。さらに、この構造内の任意のキーの型は行ごとに一貫していない可能性があります。例えば:

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

`company.labels`カラムの動的な性質を考慮するにあたり、以下のようなオプションでこのデータをモデル化できます：

- **単一JSONカラム** - スキーマ全体を単一の`JSON`カラムとして表すことで、すべての構造がその下で動的になります。
- **ターゲットJSONカラム** - `company.labels`カラムにのみ`JSON`型を使用し、他のすべてのカラムに対して上記の構造化されたスキーマを維持します。

最初のアプローチ[は先の方法論と一致しません](#static-vs-dynamic-json)が、単一のJSONカラムアプローチはプロトタイピングやデータエンジニアリングタスクに役立ちます。

ClickHouseのスケールでの本番展開では、構造を明示的にし、可能であれば動的なサブ構造に対してJSON型を使用することを推奨します。

厳密なスキーマには多くの利点があります：

- **データ検証** - 厳密なスキーマを強制することで、特定の構造を除いてカラムの爆発のリスクを回避します。
- **カラムの爆発のリスクを回避** - JSON型は潜在的に千のカラムにスケールしますが、サブカラムが専用カラムとして保存される場合、数えきれないカラムファイルが作成され、パフォーマンスに影響を与える可能性があります。これを軽減するために、JSONで使用される基本の[Dynamic type](/sql-reference/data-types/dynamic)には、個別のカラムファイルとして保存されるユニークなパスの数を制限する[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)パラメータがあります。閾値に達すると、追加のパスはコンパクトなエンコーディング形式を使用して共有カラムファイルに保存され、パフォーマンスとストレージの効率を維持しながら、柔軟なデータ取り込みをサポートします。ただし、この共有カラムファイルへのアクセスは、パフォーマンスが劣ることがあります。ただし、JSONカラムは[タイプヒント](#using-type-hints-and-skipping-paths)と共に使用できます。「ヒント付け」されたカラムは、専用のカラムと同じパフォーマンスを提供します。
- **パスと型の簡単な内省** - JSON型は、推論された型とパスを特定するための[内省関数](/sql-reference/data-types/newjson#introspection-functions)をサポートしていますが、静的構造は探るのに簡単です。例えば`DESCRIBE`を使って。

### 単一JSONカラム {#single-json-column}

このアプローチはプロトタイピングやデータエンジニアリングタスクに役立ちます。本番では、必要に応じて動的なサブ構造にのみ`JSON`を使用するようにしてください。

:::note パフォーマンスの考慮
単一のJSONカラムは、必要でないJSONパスをスキップ（保存しない）することで最適化できます。また、[タイプヒント](#using-type-hints-and-skipping-paths)を使用することもできます。タイプヒントを使用することで、ユーザーはサブカラムの型を明示的に定義でき、推論と間接処理をクエリ時にスキップできます。これにより、明示的なスキーマを使用している場合と同じパフォーマンスを提供できます。[“タイプヒントを使用してパスをスキップする”](#using-type-hints-and-skipping-paths)の詳細を参照してください。
:::

単一JSONカラムのスキーマは次のようにシンプルです：

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
`username`カラムのJSON定義には[タイプヒント](#using-type-hints-and-skipping-paths)を提供しています。これは、順序付け/主キーで使用するためです。これにより、ClickHouseはこのカラムがnullにならないことを知り、使用すべき`username`サブカラムを把握します（各タイプごとに複数存在する可能性があるため、さもなければあいまいです）。
:::

上記のテーブルに行を挿入するには、`JSONAsObject`形式を使用できます：

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

推論されたサブカラムとその型をは、[内省関数](/sql-reference/data-types/newjson#introspection-functions)を使用して決定できます。例えば:

```sql
SELECT JSONDynamicPathsWithTypes(json) as paths
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

内省関数による完全なリストについては、["内省関数"](/sql-reference/data-types/newjson#introspection-functions)を参照してください。

[サブパスにアクセスできます](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) `.`記法を使用して、例えば：

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴺᴺ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

行に欠けているカラムは`NULL`として返される点に注意してください。

さらに、同じ型のパスに対しては別々のサブカラムが作成されます。例えば、`company.labels.type`に対して、`String`型と`Array(Nullable(String))`型の両方にサブカラムが存在します。両方が可能な限り返されますが、特定のサブカラムを`.:`記法を使用してターゲットすることができます。

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
│ ᴺᵁᴺᴺ                     │
│ database systems         │
└──────────────────────────┘

2 rows in set. Elapsed: 0.009 sec.
```

ネストされたサブオブジェクトを返すには、`^`が必要です。これは、読み取るカラムの数が多すぎないようにするための設計上の選択です。明示的に要求されない限り、オブジェクトにアクセスすると`NULL`が返されるでしょう。

```sql
-- サブオブジェクトはデフォルトで返されません
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴺᴺ                │
│ ᴺᵁᴺᴺ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- `^`記法を使ってサブオブジェクトを返します
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```
### ターゲットとした JSON カラム {#targeted-json-column}

プロトタイピングやデータエンジニアリングの課題では便利ですが、可能な限りプロダクションでは明示的なスキーマを使用することをお勧めします。

以前の例は、`company.labels` カラムのための単一の `JSON` カラムでモデル化できます。

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

このテーブルには、`JSONEachRow` フォーマットを使用して挿入できます:

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

[Introspection functions](/sql-reference/data-types/newjson#introspection-functions)を使用して、`company.labels` カラムの推測されたパスとタイプを確認できます。

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
### 型ヒントとパスのスキップを使用する {#using-type-hints-and-skipping-paths}

型ヒントを使用することで、パスおよびそのサブカラムのタイプを指定し、不必要な型推論を防ぐことができます。以下の例を考えると、JSON カラム `company.labels` 内の JSON キー `dissolved`、`employees`、`founded` のタイプを指定します。

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

これらのカラムには、今や明示的な型があります:

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

さらに、私たちは、ストレージを最小化し、不要なパスの推論を避けるために、[`SKIP` および `SKIP REGEXP`](/sql-reference/data-types/newjson) パラメータを使用して、保存したくない JSON 内のパスをスキップすることができます。たとえば、上記のデータに対して単一の JSON カラムを使用する場合を考えてみましょう。`address` と `company` パスをスキップできます:

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

私たちのカラムにデータが除外されていることに注目してください:

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
#### 型ヒントでパフォーマンスを最適化する {#optimizing-performance-with-type-hints}  

型ヒントは、不必要な型推論を回避する方法以上のものを提供します - ストレージと処理の間接を完全に排除し、[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)を指定できるようにします。型ヒントを持つ JSON パスは、常に従来のカラムのように保存され、[**識別子カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的解決の必要性を回避します。

これにより、定義された型ヒントを使用すれば、ネストされた JSON キーは、最初から最上位カラムとしてモデル化されている場合と同じパフォーマンスと効率を実現します。

その結果、ほとんど一貫しているが、JSON の柔軟性から利益を得るデータセットに対して、型ヒントはスキーマやインジェストパイプラインを再構築する必要なくパフォーマンスを維持する便利な方法を提供します。
### ダイナミックパスの設定 {#configuring-dynamic-paths}

ClickHouse は、各 JSON パスを真の列指向レイアウトでサブカラムとして保存し、従来のカラムと同様のパフォーマンス上の利点（圧縮、SIMD 加速処理、最小限のディスク I/O など）を可能にします。JSON データ内の各ユニークなパスと型の組み合わせは、ディスク上でそれ自身のカラムファイルになります。

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

たとえば、異なる型で 2 つの JSON パスが挿入されると、ClickHouse はそれぞれの[具体的な型の値を異なるサブカラムに保存します](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。これらのサブカラムには独立してアクセスでき、不必要な I/O を最小限に抑えます。複数の型を持つカラムをクエリする際、値は依然として単一の列指向応答として返されます。

さらに、オフセットを活用することで、ClickHouse はこれらのサブカラムが密度を保つようにし、存在しない JSON パスのためにデフォルト値を保存しません。このアプローチは圧縮を最大化し、さらに I/O を削減します。

<Image img={json_offsets} size="md" alt="JSON offsets" />

しかし、高いカーディナリティまたは高い変動のある JSON 構造（テレメトリパイプライン、ログ、または機械学習の特徴ストアなど）におけるシナリオでは、この動作はカラムファイルの爆発を引き起こす可能性があります。各新しいユニークな JSON パスは新しいカラムファイルをもたらし、各型バリアントはそのパスの下で追加のカラムファイルをもたらします。これはリードパフォーマンスには最適ですが、運用上の課題（ファイルディスクリプタの枯渇、メモリ使用量の増加、小さなファイルの数が多いためマージが遅くなる）を導入します。

これを軽減するために、ClickHouse はオーバーフローサブカラムの概念を導入します。異なる JSON パスの数が閾値を超えた場合、追加のパスはコンパクトにエンコードされた形式で単一の共有ファイルに保存されます。このファイルは依然としてクエリ可能ですが、専用のサブカラムと同じ性能特性の利益を享受することはありません。

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

この閾値は、JSON 型宣言における[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) パラメータで制御されます。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを高すぎる設定は避けてください** - 大きな値はリソース消費を増加させ、効率を低下させます。一般的な指針として、10,000 を下回るように保ってください。高い動的構造を持つワークロードには、型ヒントと `SKIP` パラメータを使用して、保存されるものを制限してください。

この新しいカラム型の実装に興味があるユーザーには、私たちの詳細なブログ記事 ["ClickHouse のための新しい強力な JSON データ型"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse) の読解をお勧めします。
