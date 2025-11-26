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


# スキーマ設計

[スキーマ推論](/integrations/data-formats/json/inference) を使用すると、JSON データの初期スキーマを確立し、S3 上などにある JSON データファイルに対してそのままクエリを実行できますが、データに対しては最適化され、バージョン管理されたスキーマを確立することを目指すべきです。以下では、JSON 構造をモデリングするための推奨アプローチについて説明します。



## 静的 JSON と動的 JSON

JSON のスキーマを定義する際の主なタスクは、各キーの値に対して適切な型を決定することです。各キーに対して適切な型を決めるために、JSON 階層内のそれぞれのキーに対して以下のルールを再帰的に適用することを推奨します。

1. **プリミティブ型** - キーの値がプリミティブ型である場合、子オブジェクト内かルート直下かを問わず、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)および[型の最適化ルール](/data-modeling/schema-design#optimizing-types)に従って型を選択してください。下記の `phone_numbers` のようなプリミティブの配列は、`Array(<type>)`（例：`Array(String)`）としてモデリングできます。
2. **静的か動的か** - キーの値が複合オブジェクト、すなわちオブジェクトまたはオブジェクトの配列である場合、そのキー構造が変化するかどうかを判断します。新しいキーが追加されることがまれであり、その追加が予測可能で、[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) によるスキーマ変更で対処できるオブジェクトは**静的**とみなせます。これには、一部の JSON ドキュメントでのみキーのサブセットが提供されるオブジェクトも含まれます。一方で、新しいキーが頻繁に、かつ／または予測不能な形で追加されるオブジェクトは**動的**とみなすべきです。**ここでの例外は、サブキーが数百〜数千に及ぶ構造であり、利便性の観点から動的として扱ってよいものです。**

値が **静的** か **動的** かを判断するには、以下の該当セクション [**静的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-static-structures) および [**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) を参照してください。

<p />

**重要:** 上記のルールは再帰的に適用する必要があります。あるキーの値が動的と判断された場合、それ以上の評価は不要であり、[**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)のガイドラインに従ってください。オブジェクトが静的である場合は、キーの値がプリミティブになるか、動的キーに遭遇するまでサブキーの評価を続けます。

これらのルールを説明するために、人物を表現した次の JSON 例を使用します。

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
    "catchPhrase": "アナリティクスのためのリアルタイムデータウェアハウス",
    "labels": {
      "type": "データベースシステム",
      "founded": "2021"
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "データベース",
    "holidays": [
      {
        "year": 2024,
        "location": "アゾレス諸島、ポルトガル"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

これらのルールを適用すると、次のようになります。

* ルートキー `name`, `username`, `email`, `website` は型 `String` として表現できます。カラム `phone_numbers` はプリミティブ型の配列であり、型は `Array(String)` です。また、`dob` と `id` の型はそれぞれ `Date` と `UInt32` です。
* 新しいキーは `address` オブジェクトには追加されず（新しい address オブジェクトのみが追加されます）、そのためこれは**静的**と見なせます。再帰的に辿ると、`geo` を除くすべてのサブカラムはプリミティブ（かつ型は `String`）と見なせます。`geo` もまた静的な構造であり、`lat` と `lon` という 2 つの `Float32` カラムを持ちます。
* `tags` カラムは**動的**です。このオブジェクトには、任意の型および構造の新しい任意のタグが追加され得るものと仮定します。
* `company` オブジェクトは**静的**であり、常に最大で指定された 3 つのキーのみを含みます。サブキー `name` と `catchPhrase` の型は `String` です。キー `labels` は**動的**です。このオブジェクトには新しい任意のタグが追加され得るものと仮定します。値は常に、キーおよび値がいずれも文字列型であるキー・バリューのペアになります。


:::note
数百から数千に及ぶ静的キーを持つ構造体は、これらのカラムを静的に宣言するのが現実的でないことが多いため、動的なものと見なすことができます。ただし、可能な限り、ストレージと推論のオーバーヘッドの両方を削減するために、不要な[パスをスキップ](#using-type-hints-and-skipping-paths)してください。
:::



## 静的な構造の扱い方

静的な構造は、`Tuple` のような名前付きタプルを使って扱うことを推奨します。オブジェクトの配列は、`Array(Tuple)` のようにタプルの配列として保持できます。タプル内の列とそれぞれの型も、同じルールに従って定義する必要があります。これにより、以下に示すように、ネストしたオブジェクトを表現するためにネストした `Tuple` を使用できます。

これを説明するために、先ほどの JSON の person オブジェクトの例を用い、動的なオブジェクトを省略して示します。

```json
{
  "id": 1,
  "name": "クリッキー・マクリックハウス",
  "username": "クリッキー",
  "email": "clicky@clickhouse.com",
  "address": [
    {
      "street": "ビクター・プレインズ",
      "suite": "スイート879",
      "city": "ウィソキーバーグ",
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
    "catchPhrase": "アナリティクスのためのリアルタイムデータウェアハウス"
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

`company` 列が `Tuple(catchPhrase String, name String)` として定義されている点に注目してください。`address` キーは `Array(Tuple)` を使用しており、`geo` 列を表現するためにネストされた `Tuple` を利用しています。

JSON は、このテーブルに現在の構造のまま挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}
```

上記の例ではデータは最小限しかありませんが、次に示すように、ピリオド区切りの名前でタプル列をクエリできます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street` 列が `Array` 型として返されていることに注意してください。配列内の特定の要素を位置でクエリするには、配列のオフセットを列名の後ろに指定する必要があります。たとえば、最初の `address` の `street` にアクセスするには、次のようにします。

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1行が返されました。経過時間: 0.001秒
```

サブカラムは、[`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) からソートキーとしても使用できます:

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

### デフォルト値の扱い

JSON オブジェクトには構造があっても、既知のキーのうち一部だけが含まれる疎なデータになっていることがよくあります。幸い、`Tuple` 型では JSON ペイロード内のすべての列を含める必要はありません。指定されていない列には、デフォルト値が使用されます。


先ほどの `people` テーブルと、`suite`、`geo`、`phone_numbers`、`catchPhrase` キーが存在しない次のようなスパースな JSON を考えてみましょう。

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

次のとおり、この行が正常に挿入できていることが確認できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この 1 行をクエリしてみると、省略されたカラム（サブオブジェクトを含む）にはデフォルト値が使用されていることが分かります。

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

1行が結果セットに含まれています。経過時間: 0.001秒。
```

:::note 空値と NULL を区別する
ユーザーが「値が空である」ことと「値が指定されていない」ことを区別する必要がある場合は、[Nullable](/sql-reference/data-types/nullable) 型を使用できます。ただし、これらのカラムではストレージおよびクエリのパフォーマンスに悪影響を与えるため、絶対に必要な場合を除き、[使用は避けるべきです](/best-practices/select-data-types#avoid-nullable-columns)。
:::

### 新しいカラムの扱い

JSON のキーが固定されている場合、構造化されたアプローチが最も単純ですが、新しいキーが事前にわかっており、それに応じてスキーマを変更できるなど、スキーマの変更を計画できる場合には、このアプローチを引き続き利用できます。

ClickHouse はデフォルトで、ペイロード内に含まれていてもスキーマに存在しない JSON キーを無視することに注意してください。`nickname` キーを追加した、次の変更後の JSON ペイロードを考えます。

```json
{
  "id": 1,
  "name": "Clicky McClickHouse",
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
    "catchPhrase": "分析のためのリアルタイムデータウェアハウス"
  },
  "dob": "2007-03-31"
}
```

この JSON は、`nickname` キーを無視しても正常に挿入できます。


```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 row in set. 経過時間: 0.002秒
```

[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用して、スキーマにカラムを追加できます。`DEFAULT` 句を指定すると、後続の挿入時にそのカラム値が明示的に指定されなかった場合に、その値が使用されます。この値が存在しない行（カラム作成前に挿入された行）についても、このデフォルト値が返されます。`DEFAULT` 値が指定されていない場合は、その型に対するデフォルト値が使用されます。

例:

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

2 rows in set. Elapsed: 0.001 sec.
```


## 半構造化／動的な構造の扱い

キーが動的に追加されたり複数の型を取りうるような半構造化 JSON データの場合は、[`JSON`](/sql-reference/data-types/newjson) 型を推奨します。

より具体的には、次のような場合に JSON 型を使用します:

* 時間の経過とともに変化しうる**予測がつかないキー**を持つ場合。
* **さまざまな型の値**を含む場合（例: あるパスには文字列が入ることもあれば、数値が入ることもある）。
* 厳密な型付けが実現できないようなスキーマの柔軟性が必要な場合。
* **数百から数千**のパスがあり、それらは静的だが、すべてを明示的に宣言するのが現実的ではない場合。これはまれなケースです。

`company.labels` オブジェクトが動的と判断された、[前述の person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) を考えてみましょう。

`company.labels` に任意のキーが含まれているとします。さらに、この構造内の任意のキーの型は、行ごとに一貫していない可能性があります。例えば次のようなケースです:

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
    "catchPhrase": "分析のためのリアルタイムデータウェアハウス",
    "labels": {
      "type": "データベースシステム",
      "founded": "2021",
      "employees": 250
    }
  },
  "dob": "2007-03-31",
  "tags": {
    "hobby": "データベース",
    "holidays": [
      {
        "year": 2024,
        "location": "ポルトガル、アゾレス諸島",
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
  "name": "アナリティカ・ロウ",
  "username": "Analytica",
  "address": [
    {
      "street": "メープル・アベニュー",
      "suite": "402号室",
      "city": "データフォード",
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
    "catchPhrase": "スケーラブルで効率的な分析",
    "labels": {
      "type": [
        "リアルタイム処理"
      ],
      "founded": 2019,
      "dissolved": 2023,
      "employees": 10
    }
  },
  "dob": "1992-07-15",
  "tags": {
    "hobby": "シミュレーション実行",
    "holidays": [
      {
        "year": 2023,
        "location": "日本、京都",
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

`company.labels` 列はオブジェクト間でキーや型が動的に変化する性質を持つため、このデータをモデリングするにはいくつかの選択肢があります。

* **単一の JSON 列** - スキーマ全体を 1 つの `JSON` 列として表現し、その配下のすべての構造を動的にできるようにします。
* **対象を絞った JSON 列** - `company.labels` 列に対してのみ `JSON` 型を使用し、他のすべての列については上記で使用した構造化スキーマを維持します。

最初のアプローチは[以前の手法と一致しない](#static-vs-dynamic-json)ものの、単一の JSON 列によるアプローチはプロトタイピングやデータエンジニアリング作業には有用です。

大規模な本番環境で ClickHouse をデプロイする場合は、構造を明確に定義し、可能な限り対象を絞った動的なサブ構造に対してのみ JSON 型を使用することを推奨します。

厳密なスキーマにはいくつかの利点があります。


* **データ検証** – 厳密なスキーマを適用することで、特定の構造を除き、カラム数の爆発的増加のリスクを回避できます。
* **カラム数の爆発的増加のリスクを回避** - JSON 型は、サブカラムが専用カラムとして保存されるため、潜在的には数千のカラムまでスケール可能ですが、その結果として過剰な数のカラムファイルが作成され、パフォーマンスに影響する「カラムファイルの爆発的増加」が発生する可能性があります。これを軽減するために、JSON で使用される基盤の [Dynamic type](/sql-reference/data-types/dynamic) では、[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータを提供しており、個別のカラムファイルとして保存される一意なパスの数を制限します。このしきい値に達すると、追加のパスはコンパクトにエンコードされた形式で共有カラムファイルに保存され、柔軟なデータのインジェストをサポートしつつ、パフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスのパフォーマンスは、それほど高くありません。なお、JSON カラムは [type hints](#using-type-hints-and-skipping-paths) と併用できます。「ヒント付き」のカラムは、専用カラムと同等のパフォーマンスを発揮します。
* **パスと型のイントロスペクションがより簡単** - JSON 型は推論された型やパスを判定するための [イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions) をサポートしていますが、静的な構造の方が、たとえば `DESCRIBE` で探索する際により単純になることがあります。

### 単一の JSON カラム

このアプローチは、プロトタイピングやデータエンジニアリングのタスクに有用です。本番環境では、必要な場合にのみ動的なサブ構造に対して `JSON` を使用するようにしてください。

:::note Performance considerations
単一の JSON カラムは、不要な JSON パスをスキップ（保存しない）し、[type hints](#using-type-hints-and-skipping-paths) を使用することで最適化できます。Type hint によって、ユーザーはサブカラムの型を明示的に定義できるため、クエリ時の推論および間接参照処理をスキップできます。これにより、明示的なスキーマを使用した場合と同等のパフォーマンスを実現できます。詳細は [&quot;Using type hints and skipping paths&quot;](#using-type-hints-and-skipping-paths) を参照してください。
:::

ここでの単一の JSON カラム用のスキーマは単純です。

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
`username` カラムを並び替えや主キーとして使用するため、JSON 定義内で [type hint](#using-type-hints-and-skipping-paths) を指定しています。これにより ClickHouse はこのカラムが null になり得ないことを把握し、どの `username` サブカラムを使用すべきかを判別できます（型ごとに複数存在し得るため、指定しないとあいまいになります）。
:::

上記のテーブルに行を挿入するには、`JSONAsObject` フォーマットを使用します。

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1行が設定されました。経過時間: 0.028 sec.

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1行が設定されました。経過時間: 0.004 sec.
```

```sql
SELECT *
FROM people
FORMAT Vertical
```


Row 1:
──────
json: {"address":[{"city":"Dataford","geo":{"lat":40.7128,"lng":-74.006},"street":"Maple Avenue","suite":"Apt. 402","zipcode":"11223-4567"}],"company":{"catchPhrase":"Streamlined analytics at scale","labels":{"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]},"name":"FastData Inc."},"dob":"1992-07-15","id":"2","name":"Analytica Rowe","phone_numbers":["123-456-7890","555-867-5309"],"tags":{"car":{"model":"Audi e-tron","year":"2022"},"hobby":"Running simulations","holidays":[{"location":"Kyoto, Japan","year":"2023"}]},"username":"Analytica","website":"fastdata.io"}

Row 2:
──────
json: {"address":[{"city":"Wisokyburgh","geo":{"lat":-43.9509,"lng":-34.4618},"street":"Victor Plains","suite":"Suite 879","zipcode":"90566-7771"}],"company":{"catchPhrase":"The real-time data warehouse for analytics","labels":{"employees":"250","founded":"2021","type":"database systems"},"name":"ClickHouse"},"dob":"2007-03-31","email":"clicky@clickhouse.com","id":"1","name":"Clicky McCliickHouse","phone_numbers":["010-692-6593","020-192-3333"],"tags":{"car":{"model":"Tesla","year":"2023"},"hobby":"Databases","holidays":[{"location":"Azores, Portugal","year":"2024"}]},"username":"Clicky","website":"clickhouse.com"}

2行のセット。経過時間: 0.005秒

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

2行のセット。経過時間: 0.009秒
````

イントロスペクション関数の完全なリストについては、[「イントロスペクション関数」](/sql-reference/data-types/newjson#introspection-functions)を参照してください。

[サブパスへのアクセス](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)は`.`記法を使用します。例:

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2行のセット。経過時間: 0.006秒
```

行に存在しないカラムは`NULL`として返されることに注意してください。


さらに、同じ型の各パスごとに個別のサブカラムが作成されます。たとえば、`company.labels.type` には `String` と `Array(Nullable(String))` の両方に対応するサブカラムが存在します。可能であれば両方が返されますが、`.:` 構文を使うことで特定のサブカラムだけを指定して扱うことができます。

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

ネストされたサブオブジェクトを返すには、`^` が必要です。これは、明示的に要求されない限り多数の列を読み込まないようにするための設計上の判断です。`^` を付けずにアクセスした場合、そのオブジェクトは、以下に示すように `NULL` を返します。

```sql
-- サブオブジェクトはデフォルトでは返されません
SELECT json.company.labels
FROM people

┌─json.company.labels─┐
│ ᴺᵁᴸᴸ                │
│ ᴺᵁᴸᴸ                │
└─────────────────────┘

2 rows in set. Elapsed: 0.002 sec.

-- ^ 記法を使用してサブオブジェクトを返します
SELECT json.^company.labels
FROM people

┌─json.^`company`.labels─────────────────────────────────────────────────────────────────┐
│ {"employees":"250","founded":"2021","type":"database systems"}                         │
│ {"dissolved":"2023","employees":"10","founded":"2019","type":["real-time processing"]} │
└────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

### 対象の JSON 列

プロトタイピングやデータエンジニアリング上の課題では有用ですが、本番環境では可能な限り明示的なスキーマを使用することを推奨します。

先ほどの例は、`company.labels` 列を単一の `JSON` 列としてモデリングできます。

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

このテーブルには、`JSONEachRow` 形式で挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1行のセット。経過時間: 0.450秒

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}
```


1 行の結果。経過時間: 0.440 秒。

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

[イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions) を使用して、`company.labels` 列の推論されたパスと型を判別できます。

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

### 型ヒントの使用とパスのスキップ

型ヒントを使用すると、パスおよびそのサブカラムに対して明示的に型を指定できるため、不要な型推論を防ぐことができます。次の例では、JSON カラム `company.labels` 内の JSON キー `dissolved`、`employees`、`founded` に対して型を指定しています。

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
```


INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1行を挿入しました。経過時間: 0.440秒

````

これらのカラムに明示的な型が指定されていることを確認してください:

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

2行を取得しました。経過時間: 0.003秒
````

さらに、[`SKIP`および`SKIP REGEXP`](/sql-reference/data-types/newjson)パラメータを使用することで、保存する必要のないJSON内のパスをスキップし、ストレージを最小化して不要なパスに対する型推論を回避できます。例えば、上記のデータに単一のJSONカラムを使用する場合、`address`と`company`のパスをスキップできます:

```sql
CREATE TABLE people
(
    `json` JSON(username String, SKIP address, SKIP company)
)
ENGINE = MergeTree
ORDER BY json.username

INSERT INTO people FORMAT JSONAsObject
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1行を挿入しました。経過時間: 0.450秒

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1行を挿入しました。経過時間: 0.440秒
```

データから該当のカラムが除外されていることを確認してください:

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

2行が返されました。経過時間: 0.004秒

```

#### 型ヒントによるパフォーマンスの最適化 {#optimizing-performance-with-type-hints}

型ヒントは、不要な型推論を回避する手段以上の役割を果たします。ストレージと処理における間接参照を完全に排除し、[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)の指定を可能にします。型ヒントを持つJSONパスは常に従来のカラムと同様に保存されるため、[**識別子カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的解決が不要になります。

つまり、適切に定義された型ヒントを使用すれば、ネストされたJSONキーは、最初からトップレベルのカラムとしてモデル化された場合と同等のパフォーマンスと効率を実現します。

その結果、ほぼ一貫性のあるデータセットでありながらJSONの柔軟性の恩恵を受ける場合、型ヒントはスキーマや取り込みパイプラインを再構築することなくパフォーマンスを維持する便利な手段となります。

### 動的パスの設定 {#configuring-dynamic-paths}

ClickHouseは各JSONパスを真のカラムレイアウトでサブカラムとして保存し、圧縮、SIMD高速化処理、最小限のディスクI/Oなど、従来のカラムと同等のパフォーマンス上の利点を実現します。JSONデータ内の各一意のパスと型の組み合わせは、ディスク上で独自のカラムファイルとなります。

<Image img={json_column_per_type} size="md" alt="JSONパスごとのカラム" />

例えば、異なる型を持つ2つのJSONパスが挿入された場合、ClickHouseは各[具象型の値を個別のサブカラム](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)に保存します。これらのサブカラムは独立してアクセスでき、不要なI/Oを最小限に抑えます。なお、複数の型を持つカラムをクエリする場合でも、その値は単一のカラム形式のレスポンスとして返されます。

さらに、オフセットを活用することで、ClickHouseはこれらのサブカラムを密に保ち、存在しないJSONパスに対してデフォルト値を保存しません。このアプローチにより圧縮が最大化され、I/Oがさらに削減されます。

<Image img={json_offsets} size="md" alt="JSONオフセット" />

しかし、テレメトリパイプライン、ログ、機械学習特徴量ストアなど、高カーディナリティまたは高度に可変的なJSON構造を持つシナリオでは、この動作によりカラムファイルが爆発的に増加する可能性があります。新しい一意のJSONパスごとに新しいカラムファイルが作成され、そのパス配下の各型バリアントごとに追加のカラムファイルが作成されます。これは読み取りパフォーマンスには最適ですが、ファイルディスクリプタの枯渇、メモリ使用量の増加、多数の小さなファイルによるマージの遅延といった運用上の課題が生じます。

これを軽減するため、ClickHouseはオーバーフローサブカラムの概念を導入しています。個別のJSONパスの数が閾値を超えると、追加のパスはコンパクトなエンコード形式を使用して単一の共有ファイルに保存されます。このファイルは依然としてクエリ可能ですが、専用サブカラムと同等のパフォーマンス特性は得られません。

<Image img={shared_json_column} size="md" alt="共有JSONカラム" />

この閾値は、JSON型宣言の[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)パラメータによって制御されます。

```


```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを高く設定しすぎないでください** - 値を大きくするとリソース消費が増加し、効率が低下します。経験則としては 10,000 未満に保つことを推奨します。データ構造の変化が激しいワークロードでは、型ヒントや `SKIP` パラメータを使用して保存対象を制限してください。

この新しいカラム型の実装に関心のある方は、詳細を解説したブログ記事 [&quot;A New Powerful JSON Data Type for ClickHouse&quot;](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse) をご覧ください。
