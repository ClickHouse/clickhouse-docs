---
'title': 'JSONスキーマの設計'
'slug': '/integrations/data-formats/json/schema'
'description': 'JSONスキーマを最適に設計する方法'
'keywords':
- 'json'
- 'clickhouse'
- 'inserting'
- 'loading'
- 'formats'
- 'schema'
- 'structured'
- 'semi-structured'
'score': 20
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# スキーマの設計

[schema inference](/integrations/data-formats/json/inference)を使用して、JSONデータの初期スキーマを確立し、S3などの場所でJSONデータファイルをクエリすることができますが、ユーザーはデータの最適化されたバージョン管理スキーマを確立することを目指すべきです。以下では、JSON構造をモデル化するための推奨アプローチについて説明します。

## 静的JSON対動的JSON {#static-vs-dynamic-json}

JSONのスキーマを定義する主なタスクは、各キーの値に適切なタイプを決定することです。我々は、各JSON階層の各キーに対して、適切なタイプを決定するために次のルールを再帰的に適用することをお勧めします。

1. **プリミティブ型** - キーの値がプリミティブ型である場合、サブオブジェクトの一部であるかどうかに関係なく、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)と[type optimization rules](/data-modeling/schema-design#optimizing-types)に従ってその型を選択することを確認してください。プリミティブの配列、例えば以下の`phone_numbers`は、`Array(<type>)`としてモデル化できます。例: `Array(String)`。
2. **静的対動的** - キーの値が複雑なオブジェクト、すなわちオブジェクトまたはオブジェクトの配列である場合、変更の対象となるかどうかを確立します。新しいキーがめったに追加されないオブジェクトは、新しいキーの追加を予測でき、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)を使用してスキーマの変更で処理できるため、**静的**と見なすことができます。これは、一部のJSONドキュメントでのみサブセットのキーが提供されるオブジェクトを含みます。新しいキーが頻繁に追加されるオブジェクトや/または予測できないオブジェクトは**動的**と見なすべきです。 **ここでの例外は、便利な目的のために動的と見なすことができる数百または数千のサブキーを持つ構造です**。

値が**静的**か**動的**であるかを確立するには、以下の関連セクションを参照してください：[**Handling static objects**](/integrations/data-formats/json/schema#handling-static-structures)および[**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。

<p></p>

**重要:** 上記のルールは再帰的に適用する必要があります。キーの値が動的であると判断された場合、さらなる評価は必要なく、[**Handling dynamic objects**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)のガイドラインに従うことができます。オブジェクトが静的な場合、すべてのサブキーを評価し続け、キーの値がプリミティブであるか動的キーに遭遇するまで続けます。

これらのルールを説明するために、以下の人を表すJSONの例を使用します：

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

これらのルールを適用すると：

- ルートキー`name`、`username`、`email`、`website`は、型`String`として表現できます。カラム`phone_numbers`は`Array<String>`型のプリミティブの配列です。`dob`と`id`はそれぞれ型が`Date`と`UInt32`です。
- `address`オブジェクトには新しいキーは追加されないため（新しいアドレスオブジェクトのみ）、**静的**と見なすことができます。再帰すると、すべてのサブカラムはプリミティブ（型`String`）と見なされ、`geo`を除きます。これは、`lat`と`lon`という2つの`Float32`カラムを持つ静的構造でもあります。
- `tags`カラムは**動的**です。新しい任意のタグがこのオブジェクトに追加される可能性があると仮定します。
- `company`オブジェクトは**静的**であり、常に特定の3つのキーを最大で含むことになります。サブキー`name`と`catchPhrase`は型が`String`です。キー`labels`は**動的**です。このオブジェクトに新しい任意のタグが追加される可能性があると仮定します。値は常に文字列型のキー-バリューペアになります。

:::note
数百または数千の静的キーを持つ構造は動的と見なすことができます。なぜなら、そのような構造に対して静的にカラムを宣言するのは現実的ではないからです。ただし、可能な限り[skip paths](#using-type-hints-and-skipping-paths)を使用して、保存が必要でないものをスキップし、ストレージと推論のオーバーヘッドを保存してください。
:::

## 静的構造の取り扱い {#handling-static-structures}

静的構造は、名前付きタプル、すなわち`Tuple`を使用して処理することをお勧めします。オブジェクトの配列は、タプルの配列、すなわち`Array(Tuple)`を使用して保持できます。タプル内のカラムとそれぞれの型は、同じルールを使用して定義する必要があります。これにより、以下のようにネストされたオブジェクトを表現するためのネストされたタプルが作成できます。

これを示すために、動的オブジェクトを省いた先のJSON人の例を使用します：

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

`company`カラムが`Tuple(catchPhrase String, name String)`として定義されていることに注意してください。`address`キーは`Array(Tuple)`を使用し、`geo`カラムを表すためにネストされた`Tuple`があります。

この構造のJSONをこのテーブルに挿入することができます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

前述の例では最小限のデータがありますが、以下のように、タプルカラムをピリオドで区切られた名前によってクエリできます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street`カラムが`Array`として返されることに注意してください。配列内の特定のオブジェクトを位置によってクエリするには、カラム名の後に配列オフセットを指定する必要があります。たとえば、最初の住所から通りを取得するには：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

サブカラムは、[`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key)からのオーダリングキーで使用することもできます：

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

JSONオブジェクトが構造化されていても、提供される既知のキーのサブセットによってスパースであることがよくあります。幸いなことに、`Tuple`型はJSONペイロード内のすべてのカラムを必要としません。指定されていない場合、デフォルト値が使用されます。

以前の`people`テーブルと次のスパースJSONを考慮し、`suite`、`geo`、`phone_numbers`、および`catchPhrase`キーが欠落しています。

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

以下で、この行が成功裏に挿入できることがわかります：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この単一行をクエリすると、除外されたカラム（サブオブジェクトを含む）にはデフォルト値が使用されていることがわかります：

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
ユーザーが値が空であることと提供されていないことの区別が必要な場合、[Nullable](/sql-reference/data-types/nullable)型を使用できます。ただし、これはほとんど必要ない限り[避けるべきです](/best-practices/select-data-types#avoid-nullable-columns)。これにより、ストレージとクエリパフォーマンスに悪影響を及ぼします。
:::

### 新しいカラムの取り扱い {#handling-new-columns}

JSONキーが静的な場合には構造化されたアプローチが最も簡単ですが、スキーマの変更が計画できる場合には、このアプローチを引き続き使用できます。すなわち、新しいキーが事前に知られていて、スキーマがそれに応じて変更できる場合です。

ClickHouseは、デフォルトでペイロード内で提供され、スキーマ内に存在しないJSONキーを無視します。`nickname`キーの追加を含む以下の変更されたJSONペイロードを考慮してください：

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

このJSONは、`nickname`キーを無視して成功裏に挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

カラムは[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)コマンドを使用してスキーマに追加できます。`DEFAULT`句を通じてデフォルトを指定することができ、これはその後の挿入中に指定されなかった場合に使用されます。この値が存在しない行（作成前に挿入された行）は、デフォルト値を返します。`DEFAULT`値が指定されていない場合、その型のデフォルト値が使用されます。

例：

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

## 半構造化/動的構造の取り扱い {#handling-semi-structured-dynamic-structures}

JSONデータが半構造化され、キーを動的に追加できたり複数のタイプを持ったりする場合は、[`JSON`](/sql-reference/data-types/newjson)型を推奨します。

具体的には、データが以下の条件を満たす場合にJSON型を使用します：

- **予測不可能なキー**が時間とともに変化する可能性がある。
- **異なる型を持つ値**が含まれている（例：パスには時に文字列、時に数値が含まれる場合）。
- 厳密な型付けが実行不可能な場合で、スキーマの柔軟性が必要。
- **数百または数千**のパスが静的だが、明示的に宣言するのが現実的ではない場合。これは珍しいことです。

以前の[人のJSON](https://integrations.data-formats.json/schema#static-vs-dynamic-json)を考えると、`company.labels`オブジェクトが動的であると判断されました。

`company.labels`が任意のキーを含んでいると仮定しましょう。さらに、この構造内の任意のキーの型は行ごとに一貫性がない場合があります。例：

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

`company.labels`カラムのキーと型間の動的な性質を考慮すると、データをモデル化するためのいくつかのオプションがあります。

- **単一のJSONカラム** - スキーマ全体を単一の`JSON`カラムとして表現し、その下で全ての構造を動的にします。
- **ターゲットとなるJSONカラム** - `company.labels`カラムに対してのみ`JSON`型を使用し、他のカラムには上記で使用した構造化スキーマを維持します。

最初のアプローチは[以前の方法論に一致しませんが](#static-vs-dynamic-json)、単一のJSONカラムのアプローチはプロトタイピングやデータエンジニアリング作業に役立ちます。

大規模なClickHouseの本番展開では、構造について具体的であり、可能であればターゲット動的サブ構造にJSON型を使用することを推奨します。

厳密なスキーマには多くの利点があります：

- **データの検証** – 厳密なスキーマを強制することで、特定の構造以外でのカラムの増加リスクを回避できます。
- **カラム増加のリスクを回避** - JSON型は潜在的に数千のカラムにスケールしますが、サブカラムが専用のカラムとして保存されると、過剰な数のカラムファイルが作成され、パフォーマンスに影響を与える可能性があります。これを緩和するために、JSONによって使用される[Dynamic type](/sql-reference/data-types/dynamic)は、別のカラムファイルとして保存されるユニークなパスの数を制限する[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)パラメータを提供します。しきい値に達すると、追加のパスは共有カラムファイルに暗号化されたコンパクトな形式で保存され、柔軟なデータの取り込みをサポートしつつ、パフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスは、専用のサブカラムの性能ほどではありません。ただし、JSONカラムは[type hints](#using-type-hints-and-skipping-paths)とともに使用できます。「ヒント付き」カラムは、専用なカラムと同じパフォーマンスを提供します。
- **パスおよび型のより簡単なインストロペクション** - JSON型は、推論された型およびパスを確認するための[introspection functions](/sql-reference/data-types/newjson#introspection-functions)をサポートしていますが、静的な構造はより簡単に探索できます。例えば、`DESCRIBE`で。

### 単一JSONカラム {#single-json-column}

このアプローチは、プロトタイピングおよびデータエンジニアリングタスクに役立ちます。本番のためには、必要なところでのみ動的サブ構造に`JSON`を使用することをお勧めします。

:::note パフォーマンスの考慮事項
単一のJSONカラムは、必要のないJSONパスをスキップ（保存しない）し、[type hints](#using-type-hints-and-skipping-paths)を使用することで最適化できます。タイプのヒントを使用すると、サブカラムの型を明示的に定義でき、推論やクエリ時の間接処理をスキップできます。これにより、明示的なスキーマが使用された場合と同じパフォーマンスを提供できます。「[Using type hints and skipping paths](#using-type-hints-and-skipping-paths)」を参照してください。
:::

ここでの単一JSONカラムのスキーマはシンプルです：

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
`username`カラムのJSON定義に[type hint](#using-type-hints-and-skipping-paths)を提供しています。これは、オーダリング/プライマリーキーで使用する際に、ClickHouseがこのカラムがnullでないことを知るために役立ち、どの`username`サブカラムを使用すべきかを明確にします（各タイプに対して複数の可能性があるため、そうでなければあいまいになります）。
:::

上記のテーブルに行を挿入するには、`JSONAsObject`形式を使用します：

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

推論されたサブカラムとその型を確認するには、[introspection functions](/sql-reference/data-types/newjson#introspection-functions)を使用できます。例えば：

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

推論されたすべての関数の完全なリストは、["Introspection functions"](/sql-reference/data-types/newjson#introspection-functions)を参照してください。

[サブパスには](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)`.`記法を使用してアクセスできます。例：

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

行に欠けているカラムは`NULL`として返されることに注意してください。

さらに、同じ型のパスには別のサブカラムが作成されます。例えば、`company.labels.type`の`String`と`Array(Nullable(String))`の両方にサブカラムがあります。両方が可能な限り返されますが、`.:`記法を使用して特定のサブカラムをターゲットにできます：

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

ネストされたサブオブジェクトを返すには、`^`が必要です。これは多くのカラムを読み込まないための設計上の選択です。明示的に要求されない限り、`^`なしでアクセスされたオブジェクトは`NULL`を返します。以下のように：

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

### ターゲットJSONカラム {#targeted-json-column}

プロトタイピングやデータエンジニアリングの課題に役立ちますが、可能な場合は本番では明示的スキーマを使用することをお勧めします。

前の例は、`company.labels`カラムのための単一の`JSON`カラムでモデル化できます。

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

このテーブルに挿入するには、`JSONEachRow`形式を使用できます：

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

[Introspection functions](/sql-reference/data-types/newjson#introspection-functions)は、`company.labels`カラムの推論されたパスと型を特定するために使用できます。

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

### タイプヒントを使用してパスをスキップする {#using-type-hints-and-skipping-paths}

タイプヒントを使用すると、パスとそのサブカラムの型を指定でき、不要な型推論を防ぎます。次の例では、JSONカラム`company.labels`内のJSONキー`dissolved`、`employees`、および`founded`の型を指定します。

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

これらのカラムが今や明示的な型を持っていることに注意してください：

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

さらに、ストレージを最小限に抑え、不要なパスに対する推論を避けるために、[`SKIP`および`SKIP REGEXP`](/sql-reference/data-types/newjson)パラメータを使用して、保存したくないJSON内のパスをスキップできます。例えば、上記のデータに対して単一のJSONカラムを使用する場合、`address`および`company`パスをスキップできます：

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

データからカラムが除外されていることに注意してください：

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

#### タイプヒントでパフォーマンスを最適化する {#optimizing-performance-with-type-hints}  

タイプヒントは、不要な型推論を回避する方法を提供するだけでなく、ストレージと処理の間接的処理を完全に排除し、[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)を指定することも可能にします。タイプヒントを持つJSONパスは、従来のカラムと同様に保存され、[**discriminator columns**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的解決の必要がなくなります。

これは、明確に定義されたタイプヒントを使用することで、ネストされたJSONキーが最初からトップレベルのカラムとしてモデル化されているかのように、同じパフォーマンスと効率を達成することを意味します。

その結果、ほとんど一貫性のあるデータセットでありながらJSONの柔軟性の恩恵を受けるデータセットに対して、タイプヒントはスキーマや取り込みパイプラインを再構築せずにパフォーマンスを維持するための便利な方法を提供します。

### 動的パスの設定 {#configuring-dynamic-paths}

ClickHouseは、各JSONパスを真の列指向レイアウト内のサブカラムとして保存し、従来のカラムで見られるのと同様のパフォーマンスの利点をもたらします。圧縮、SIMD加速処理、最小限のディスクI/Oなど。

JSONデータにおける各ユニークなパスと型の組み合わせは、ディスク上の独自のカラムファイルになる可能性があります。

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

たとえば、異なる型で挿入された2つのJSONパスがあると、ClickHouseは各[具体的な型の値を異なるサブカラムに保存します](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)。これらのサブカラムは独立してアクセスでき、不要なI/Oを最小限に抑えます。複数の型を持つカラムをクエリする際、その値は依然として単一のカラムによる応答として返されます。

さらに、オフセットを利用することで、ClickHouseはこれらのサブカラムが密になるようにし、JSONパスが存在しないためにデフォルト値が保存されないようにします。このアプローチは圧縮を最大化し、さらにI/Oを削減します。

<Image img={json_offsets} size="md" alt="JSON offsets" />

ただし、高いカーディナリティや非常に変動の多いJSON構造（例：テレメトリーパイプライン、ログ、機械学習の特徴ストア）において、この動作はカラムファイルの爆発を引き起こす可能性があります。新しいユニークなJSONパスごとに新しいカラムファイルが結果として作成され、そのパス下の各型バリアントに対して追加のカラムファイルが作成されます。これは読み取りパフォーマンスには最適ですが、運用上の課題を引き起こします：ファイルディスクリプタの枯渇、メモリ使用の増加、そして多数の小さなファイルによるマージの遅延。

これを緩和するために、ClickHouseはオーバーフローサブカラムの概念を導入します：ユニークなJSONパスの数がしきい値を超えると、追加のパスはコンパクトなエンコード形式で共有ファイルに保存されます。このファイルは依然としてクエリ可能ですが、専用のサブカラムと同じパフォーマンス特性からは利益を得られません。

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

このしきい値は、JSON型宣言の[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)パラメータによって制御されます。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを高すぎるに設定しないでください** - 大きな値はリソース消費を増加させ、効率を低下させます。経験則として、10,000未満に保ってください。動的構造の非常に高いワークロードのためには、タイプヒントと`SKIP`パラメータを使用して、保存されるものを制限してください。

この新しいカラム型の実装に興味があるユーザーには、我々の詳細なブログ投稿["A New Powerful JSON Data Type for ClickHouse"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)の読了をお勧めします。
