---
title: 'JSON スキーマの設計'
slug: /integrations/data-formats/json/schema
description: 'JSON スキーマを最適に設計する方法'
keywords: ['json', 'clickhouse', '挿入', '読み込み', 'フォーマット', 'スキーマ', '構造化', '半構造化']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';


# スキーマの設計

[S3] などに配置された JSON データファイルに対して、初期スキーマの確立やその場所にあるファイルへのクエリ実行には [schema inference](/integrations/data-formats/json/inference) を利用できますが、ユーザーは自分たちのデータに対して最適化されたバージョン管理スキーマを確立することを目指すべきです。以下では、JSON 構造をモデリングするための推奨アプローチについて説明します。



## 静的JSONと動的JSON {#static-vs-dynamic-json}

JSONのスキーマを定義する際の主要なタスクは、各キーの値に対して適切な型を決定することです。JSON階層内の各キーに対して以下のルールを再帰的に適用し、各キーに適切な型を決定することを推奨します。

1. **プリミティブ型** - キーの値がプリミティブ型である場合、サブオブジェクトの一部であるかルートにあるかに関わらず、一般的なスキーマ[設計のベストプラクティス](/data-modeling/schema-design)および[型最適化ルール](/data-modeling/schema-design#optimizing-types)に従って型を選択してください。以下の`phone_numbers`のようなプリミティブの配列は、`Array(<type>)`(例:`Array(String)`)としてモデル化できます。
2. **静的と動的** - キーの値が複合オブジェクト(オブジェクトまたはオブジェクトの配列)である場合、それが変更の対象となるかどうかを判断してください。新しいキーがほとんど追加されず、新しいキーの追加が予測可能で[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column)によるスキーマ変更で対応できるオブジェクトは、**静的**と見なすことができます。これには、一部のJSONドキュメントでキーのサブセットのみが提供される場合のオブジェクトも含まれます。新しいキーが頻繁に追加される、または予測不可能なオブジェクトは、**動的**と見なすべきです。**ここでの例外は、数百または数千のサブキーを持つ構造で、利便性の観点から動的と見なすことができます**。

値が**静的**か**動的**かを判断するには、以下の関連セクション[**静的オブジェクトの処理**](/integrations/data-formats/json/schema#handling-static-structures)および[**動的オブジェクトの処理**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)を参照してください。

<p></p>

**重要:** 上記のルールは再帰的に適用する必要があります。キーの値が動的であると判断された場合、それ以上の評価は不要であり、[**動的オブジェクトの処理**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)のガイドラインに従うことができます。オブジェクトが静的である場合は、キーの値がプリミティブになるか、動的キーに遭遇するまで、サブキーの評価を続けてください。

これらのルールを説明するために、人物を表す以下のJSON例を使用します:

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

これらのルールを適用すると:

- ルートキー`name`、`username`、`email`、`website`は`String`型として表現できます。カラム`phone_numbers`は`Array(String)`型の配列プリミティブであり、`dob`と`id`はそれぞれ`Date`型と`UInt32`型です。
- `address`オブジェクトには新しいキーは追加されず(新しいaddressオブジェクトのみが追加される)、したがって**静的**と見なすことができます。再帰的に評価すると、`geo`を除くすべてのサブカラムはプリミティブ(`String`型)と見なすことができます。`geo`も静的構造であり、2つの`Float32`カラム`lat`と`lng`を持ちます。
- `tags`カラムは**動的**です。このオブジェクトには任意の型と構造の新しいタグを追加できると想定します。
- `company`オブジェクトは**静的**であり、常に指定された最大3つのキーを含みます。サブキー`name`と`catchPhrase`は`String`型です。キー`labels`は**動的**です。このオブジェクトには新しい任意のタグを追加できると想定します。値は常に文字列型のキーと値のペアになります。


:::note
数百または数千の静的キーを持つ構造体は、これらの列を静的に宣言することが現実的でない場合が多いため、動的とみなすことができます。ただし、可能な限り、ストレージと推論のオーバーヘッドの両方を削減するために、不要な[パスはスキップ](#using-type-hints-and-skipping-paths)してください。
:::



## 静的構造の処理 {#handling-static-structures}

静的構造は名前付きタプル(`Tuple`)を使用して処理することを推奨します。オブジェクトの配列はタプルの配列(`Array(Tuple)`)を使用して保持できます。タプル内では、カラムとそれぞれの型を同じルールに従って定義する必要があります。これにより、以下に示すようにネストされたオブジェクトを表現するためのネストされたタプルが生成されます。

これを説明するために、動的オブジェクトを省略した先ほどのJSON personの例を使用します:

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

このテーブルのスキーマは以下の通りです:

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

`company`カラムが`Tuple(catchPhrase String, name String)`として定義されていることに注目してください。`address`キーは`Array(Tuple)`を使用し、`geo`カラムを表現するためにネストされた`Tuple`を含んでいます。

JSONは現在の構造のままこのテーブルに挿入できます:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上記の例では最小限のデータしかありませんが、以下に示すように、ピリオド区切りの名前でタプルカラムをクエリできます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street`カラムが`Array`として返されることに注目してください。配列内の特定のオブジェクトを位置で指定してクエリするには、カラム名の後に配列のオフセットを指定する必要があります。例えば、最初のアドレスからstreetにアクセスするには:

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

サブカラムは[`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key)から順序キーでも使用できます:

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

JSONオブジェクトが構造化されている場合でも、既知のキーのサブセットのみが提供されることが多く、疎な構造になりがちです。幸いなことに、`Tuple`型はJSONペイロード内のすべてのカラムを必要としません。提供されない場合は、デフォルト値が使用されます。


先ほどの`people`テーブルと、`suite`、`geo`、`phone_numbers`、`catchPhrase`のキーが欠けている以下のスパースなJSONを考えます。

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

以下のように、この行は正常に挿入できます:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この単一行をクエリすると、省略されたカラム(サブオブジェクトを含む)にはデフォルト値が使用されていることが確認できます:

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
値が空であることと提供されていないことを区別する必要がある場合は、[Nullable](/sql-reference/data-types/nullable)型を使用できます。ただし、これらのカラムのストレージとクエリパフォーマンスに悪影響を及ぼすため、絶対に必要な場合を除き[使用を避けるべき](/best-practices/select-data-types#avoid-nullable-columns)です。
:::

### 新しいカラムの処理 {#handling-new-columns}

JSONキーが静的である場合、構造化されたアプローチが最もシンプルですが、スキーマへの変更を計画できる場合、つまり新しいキーが事前に判明しており、それに応じてスキーマを変更できる場合は、このアプローチを引き続き使用できます。

ClickHouseは、デフォルトでペイロードに含まれているがスキーマに存在しないJSONキーを無視することに注意してください。`nickname`キーが追加された以下の変更されたJSONペイロードを考えます:

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

このJSONは、`nickname`キーが無視された状態で正常に挿入できます:


```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1行のセット。経過時間: 0.002秒
```

[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用して、スキーマにカラムを追加できます。`DEFAULT` 句を指定すると、後続の INSERT で値が指定されなかった場合に、そのデフォルト値が使用されます。そのカラムが作成される前に挿入された行のように、この値を持たない行についても、このデフォルト値が返されます。`DEFAULT` 値が指定されていない場合は、その型のデフォルト値が使用されます。

例えば次のようになります。

```sql
-- 初期行を挿入（nicknameは無視されます）
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- カラムを追加
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- 新しい行を挿入（同じデータで異なるid）
INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- 2行を選択
SELECT id, nickname FROM people

┌─id─┬─nickname────┐
│  2 │ Clicky      │
│  1 │ no_nickname │
└────┴─────────────┘

2行が返されました。経過時間: 0.001秒
```


## 半構造化/動的構造の処理 {#handling-semi-structured-dynamic-structures}

キーが動的に追加される、または複数の型を持つ半構造化JSONデータの場合、[`JSON`](/sql-reference/data-types/newjson)型の使用を推奨します。

より具体的には、以下の場合にJSON型を使用してください：

- 時間とともに変化する**予測不可能なキー**を持つ場合
- **異なる型の値**を含む場合（例：あるパスが文字列を含むこともあれば、数値を含むこともある）
- 厳密な型付けが実用的でない場合にスキーマの柔軟性が必要な場合
- 静的ではあるが明示的に宣言することが現実的でない**数百または数千のパス**を持つ場合。これは稀なケースです。

`company.labels`オブジェクトが動的であると判断された[以前のperson JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えてみましょう。

`company.labels`が任意のキーを含むと仮定しましょう。さらに、この構造内のキーの型は行間で一貫していない可能性があります。例えば：

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
  "phone_numbers": ["123-456-7890", "555-867-5309"],
  "website": "fastdata.io",
  "company": {
    "name": "FastData Inc.",
    "catchPhrase": "Streamlined analytics at scale",
    "labels": {
      "type": ["real-time processing"],
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

オブジェクト間での`company.labels`カラムの動的な性質を考慮すると、キーと型に関して、このデータをモデル化するためのいくつかのオプションがあります：

- **単一のJSONカラム** - スキーマ全体を単一の`JSON`カラムとして表現し、その下のすべての構造を動的にします。
- **対象を絞ったJSONカラム** - `company.labels`カラムにのみ`JSON`型を使用し、他のすべてのカラムには上記で使用した構造化スキーマを保持します。

最初のアプローチは[以前の方法論と一致しません](#static-vs-dynamic-json)が、単一のJSONカラムアプローチはプロトタイピングやデータエンジニアリングタスクに有用です。

大規模なClickHouseの本番環境デプロイメントでは、構造を明確にし、可能な限り対象を絞った動的なサブ構造にJSON型を使用することを推奨します。

厳密なスキーマには多くの利点があります：


- **データ検証** – 厳密なスキーマを適用することで、特定の構造以外でのカラム爆発のリスクを回避できます。
- **カラム爆発のリスクを回避** - JSON型は潜在的に数千のカラムまでスケールし、サブカラムが専用カラムとして保存されますが、これにより過剰な数のカラムファイルが作成され、パフォーマンスに影響を与えるカラムファイル爆発につながる可能性があります。これを軽減するため、JSONで使用される基盤の[Dynamic型](/sql-reference/data-types/dynamic)は[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)パラメータを提供しており、個別のカラムファイルとして保存される一意のパスの数を制限します。閾値に達すると、追加のパスはコンパクトなエンコード形式を使用して共有カラムファイルに保存され、柔軟なデータ取り込みをサポートしながらパフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスは、専用カラムほどパフォーマンスが高くありません。なお、JSONカラムは[型ヒント](#using-type-hints-and-skipping-paths)と併用できます。「ヒント付き」カラムは専用カラムと同等のパフォーマンスを提供します。
- **パスと型のより簡潔なイントロスペクション** - JSON型は推論された型とパスを判定するための[イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions)をサポートしていますが、静的構造は`DESCRIBE`などでより簡単に探索できます。

### 単一のJSONカラム {#single-json-column}

このアプローチはプロトタイピングやデータエンジニアリングタスクに有用です。本番環境では、必要な動的サブ構造に対してのみ`JSON`を使用するようにしてください。

:::note パフォーマンスに関する考慮事項
単一のJSONカラムは、不要なJSONパスをスキップ(保存しない)し、[型ヒント](#using-type-hints-and-skipping-paths)を使用することで最適化できます。型ヒントを使用すると、サブカラムの型を明示的に定義でき、クエリ時の推論と間接処理をスキップできます。これにより、明示的なスキーマを使用した場合と同等のパフォーマンスを実現できます。詳細については["型ヒントの使用とパスのスキップ"](#using-type-hints-and-skipping-paths)を参照してください。
:::

単一のJSONカラムのスキーマは次のようにシンプルです:

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
順序付け/主キーで使用するため、JSON定義内の`username`カラムに[型ヒント](#using-type-hints-and-skipping-paths)を提供しています。これにより、ClickHouseはこのカラムがnullにならないことを認識し、どの`username`サブカラムを使用すべきかを確実に把握できます(各型に対して複数存在する可能性があるため、そうでなければ曖昧になります)。
:::

上記のテーブルへの行の挿入は、`JSONAsObject`フォーマットを使用して実行できます:

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

```


行 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

行 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2 rows in set. Elapsed: 0.005 sec.

````

[イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions)を使用して、推論されたサブカラムとその型を確認できます。例:

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
````

イントロスペクション関数の完全なリストについては、["イントロスペクション関数"](/sql-reference/data-types/newjson#introspection-functions)を参照してください。

[サブパスへのアクセス](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)は`.`記法を使用して行えます。例:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2 rows in set. Elapsed: 0.006 sec.
```

行に存在しないカラムは`NULL`として返されることに注意してください。


さらに、同じ型を持つパスに対して個別のサブカラムが作成されます。例えば、`company.labels.type`には`String`と`Array(Nullable(String))`の両方のサブカラムが存在します。可能な場合は両方が返されますが、`.:`構文を使用して特定のサブカラムを指定することができます:

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

ネストされたサブオブジェクトを返すには、`^`が必要です。これは、明示的に要求されない限り、大量のカラムを読み取ることを避けるための設計上の選択です。`^`を使用せずにアクセスされたオブジェクトは、以下に示すように`NULL`を返します:

```sql
-- サブオブジェクトはデフォルトでは返されません
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- ^記法を使用してサブオブジェクトを返す
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### 対象を絞ったJSONカラム {#targeted-json-column}

プロトタイピングやデータエンジニアリングの課題では有用ですが、本番環境では可能な限り明示的なスキーマを使用することを推奨します。

前述の例は、`company.labels`カラムに単一の`JSON`カラムを使用してモデル化できます。

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

`JSONEachRow`形式を使用してこのテーブルにデータを挿入できます:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1 row in set. Elapsed: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

```


1行のセット。経過時間: 0.440秒

````

```sql
SELECT *
FROM people
FORMAT Vertical

行 1:
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

行 2:
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

2行のセット。経過時間: 0.005秒
````

[イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions)を使用して、`company.labels`列の推論されたパスと型を判定できます。

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

2行のセット。経過時間: 0.003秒
```

### 型ヒントの使用とパスのスキップ {#using-type-hints-and-skipping-paths}

型ヒントを使用すると、パスとそのサブ列の型を指定でき、不要な型推論を防ぐことができます。以下の例では、JSON列`company.labels`内のJSONキー`dissolved`、`employees`、`founded`の型を指定しています。

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

1行のセット。経過時間: 0.450秒

```


INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1 row in set. Elapsed: 0.440 sec.

````

これらのカラムに明示的な型が指定されていることに注目してください：

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
````

さらに、[`SKIP`および`SKIP REGEXP`](/sql-reference/data-types/newjson)パラメータを使用することで、保存する必要のないJSON内のパスをスキップし、ストレージを最小化して不要なパスに対する型推論を回避できます。例えば、上記のデータに単一のJSONカラムを使用する場合、`address`と`company`のパスをスキップできます：

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

データからこれらのカラムが除外されていることに注目してください：

```sql

SELECT *
FROM people
FORMAT PrettyJSONEachRow

```


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

2行が返されました。経過時間: 0.004秒。

```

#### 型ヒントによるパフォーマンスの最適化 {#optimizing-performance-with-type-hints}

型ヒントは、不要な型推論を回避する手段以上の役割を果たします。ストレージと処理における間接参照を完全に排除し、[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)の指定を可能にします。型ヒントを持つJSONパスは常に従来の列と同様に格納されるため、[**判別列**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的解決が不要になります。

つまり、適切に定義された型ヒントを使用することで、ネストされたJSONキーは、最初からトップレベルの列としてモデル化された場合と同等のパフォーマンスと効率を実現できます。

その結果、ほぼ一貫性のあるデータセットでありながらJSONの柔軟性の恩恵を受ける場合、型ヒントはスキーマや取り込みパイプラインを再構築することなくパフォーマンスを維持する便利な手段となります。

### 動的パスの設定 {#configuring-dynamic-paths}

ClickHouseは各JSONパスを真の列形式レイアウトでサブ列として格納し、圧縮、SIMD高速化処理、最小限のディスクI/Oなど、従来の列で得られるのと同じパフォーマンス上の利点を実現します。JSONデータ内の各一意のパスと型の組み合わせは、ディスク上で独自の列ファイルとして保存されます。

<Image img={json_column_per_type} size="md" alt="Column per JSON path" />

例えば、異なる型を持つ2つのJSONパスが挿入されると、ClickHouseは各[具象型の値を個別のサブ列](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)に格納します。これらのサブ列は独立してアクセスでき、不要なI/Oを最小限に抑えます。なお、複数の型を持つ列をクエリする場合でも、その値は単一の列形式レスポンスとして返されます。

さらに、オフセットを活用することで、ClickHouseはこれらのサブ列を密に保ち、存在しないJSONパスに対してデフォルト値を格納しません。このアプローチにより圧縮が最大化され、I/Oがさらに削減されます。

<Image img={json_offsets} size="md" alt="JSON offsets" />

しかし、テレメトリパイプライン、ログ、機械学習特徴量ストアなど、高カーディナリティまたは高度に可変的なJSON構造を持つシナリオでは、この動作により列ファイルが爆発的に増加する可能性があります。新しい一意のJSONパスごとに新しい列ファイルが作成され、そのパス配下の各型バリアントごとに追加の列ファイルが作成されます。これは読み取りパフォーマンスには最適ですが、ファイルディスクリプタの枯渇、メモリ使用量の増加、多数の小さなファイルによるマージの遅延といった運用上の課題をもたらします。

これを軽減するため、ClickHouseはオーバーフローサブ列の概念を導入しています。個別のJSONパスの数がしきい値を超えると、追加のパスはコンパクトなエンコード形式を使用して単一の共有ファイルに格納されます。このファイルは依然としてクエリ可能ですが、専用サブ列と同等のパフォーマンス特性は得られません。

<Image img={shared_json_column} size="md" alt="Shared JSON column" />

このしきい値は、JSON型宣言の[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)パラメータによって制御されます。

```


```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを過度に大きく設定しないでください** ― 値を大きくしすぎるとリソース消費が増加し、効率が低下します。経験則としては、10,000 未満に設定することを推奨します。構造が非常に動的なワークロードでは、型ヒントや `SKIP` パラメータを使用して、保存対象を絞り込んでください。

この新しいカラム型の実装について詳しく知りたい方は、詳細を解説したブログ記事 [「A New Powerful JSON Data Type for ClickHouse」](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse) を参照してください。
