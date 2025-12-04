---
title: 'JSON スキーマの設計'
slug: /integrations/data-formats/json/schema
description: 'JSON スキーマを最適に設計する方法'
keywords: ['json', 'clickhouse', '挿入', 'ロード', 'フォーマット', 'スキーマ', '構造化', '半構造化']
score: 20
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import json_column_per_type from '@site/static/images/integrations/data-ingestion/data-formats/json_column_per_type.png';
import json_offsets from '@site/static/images/integrations/data-ingestion/data-formats/json_offsets.png';
import shared_json_column from '@site/static/images/integrations/data-ingestion/data-formats/json_shared_column.png';

# スキーマの設計 {#designing-your-schema}

[スキーマ推論](/integrations/data-formats/json/inference) を使用すると、JSON データの初期スキーマを確立し、S3 上にあるなどの JSON データファイルをそのままクエリできますが、ユーザーは自分たちのデータに対して、最適化されたバージョン管理済みスキーマを確立することを目指すべきです。以下では、JSON 構造をモデリングする際の推奨アプローチについて説明します。

## 静的 JSON と動的 JSON {#static-vs-dynamic-json}

JSON のスキーマを定義する際の主なタスクは、各キーの値に対して適切な型を決定することです。各キーに対して適切な型を決定するため、JSON 階層内のそれぞれのキーに以下のルールを再帰的に適用することを推奨します。

1. **プリミティブ型** - キーの値がプリミティブ型である場合は、それがサブオブジェクトの一部であるか、ルート直下にあるかに関係なく、一般的なスキーマの[設計ベストプラクティス](/data-modeling/schema-design)および[型の最適化ルール](/data-modeling/schema-design#optimizing-types)に従って型を選択してください。`phone_numbers` のようなプリミティブ型の配列は `Array(<type>)`（例: `Array(String)`）としてモデリングできます。
2. **静的 vs 動的** - キーの値が複合オブジェクト、すなわちオブジェクト本体またはオブジェクトの配列である場合は、それが変更される可能性があるかどうかを判断します。新しいキーが追加されることがまれであり、その追加が予測可能で [`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) によるスキーマ変更で対応できるオブジェクトは**静的**と見なせます。これには、一部の JSON ドキュメントでのみキーのサブセットが提供されるオブジェクトも含まれます。一方で、新しいキーが頻繁に、または予測不能な形で追加されるオブジェクトは**動的**と見なすべきです。**ただし、サブキーが数百から数千に及ぶ構造については、利便性の観点から動的と見なして構いません。**

ある値が**静的**か**動的**かを判断するには、以下の関連セクション [**静的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-static-structures) と [**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures) を参照してください。

<p />

**重要:** 上記のルールは再帰的に適用する必要があります。キーの値が動的と判断された場合、それ以上の評価は不要であり、[**動的オブジェクトの扱い**](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)のガイドラインに従ってください。オブジェクトが静的である場合は、キーの値がプリミティブになるか、動的なキーが見つかるまでサブキーを評価し続けてください。

これらのルールを例示するために、人物を表す次の JSON 例を使用します。

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
        "location": "ポルトガル、アゾレス諸島"
      }
    ],
    "car": {
      "model": "Tesla",
      "year": 2023
    }
  }
}
```

これらのルールを適用します:

* ルートキー `name`, `username`, `email`, `website` は型 `String` として表現できます。カラム `phone_numbers` はプリミティブ型の配列であり、型は `Array(String)` です。`dob` と `id` はそれぞれ型 `Date` と `UInt32` です。
* 新しいキーは `address` オブジェクトには追加されず（新しい address オブジェクトのみが追加される）、そのためこれは**静的**と見なせます。再帰的に展開していくと、`geo` を除くすべてのサブカラムはプリミティブ（かつ型 `String`）と見なせます。`geo` も 2 つの `Float32` カラム `lat` と `lon` を持つ静的な構造です。
* `tags` カラムは**動的**です。このオブジェクトには任意の型・構造のタグが新たに追加されうると仮定します。
* `company` オブジェクトは**静的**で、常に最大で指定された 3 つのキーのみを含みます。サブキー `name` と `catchPhrase` は型 `String` です。キー `labels` は**動的**です。このオブジェクトには任意のタグが新たに追加されうると仮定します。値は常に文字列型のキーと値のペアです。

:::note
数百から数千もの静的キーを持つ構造体は、これらの列を静的に宣言するのが現実的でないことが多いため、動的なものと見なすことができます。ただし、可能な箇所では、ストレージと推論の両方のオーバーヘッドを削減するために、不要な[パスをスキップ](#using-type-hints-and-skipping-paths)してください。
:::

## 静的な構造の扱い方 {#handling-static-structures}

静的な構造は名前付きタプル、つまり `Tuple` 型で扱うことを推奨します。オブジェクトの配列は、`Array(Tuple)` のようにタプルの配列として保持できます。タプル内でも、カラムとその型は同じルールに従って定義する必要があります。その結果、以下のように入れ子オブジェクトを表現するためにタプルをネストして用いることになります。

これを説明するために、前述の JSON の person の例を使い、動的なオブジェクトを省略します。

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

このテーブルのスキーマは以下のとおりです：

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

`company` 列が `Tuple(catchPhrase String, name String)` として定義されている点に注目してください。`address` キーでは `Array(Tuple)` を使用しており、`geo` 列を表現するためにネストされた `Tuple` を利用しています。

JSON は、この構造のままテーブルに挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"リアルタイム分析用データウェアハウス"},"dob":"2007-03-31"}
```

上記の例ではデータ量は最小限ですが、以下のように、タプル列はピリオド区切りの名前でクエリできます。

```sql
SELECT
 address.street,
 company.name
FROM people

┌─address.street────┬─company.name─┐
│ ['Victor Plains'] │ ClickHouse   │
└───────────────────┴──────────────┘
```

`address.street` 列が `Array` として返されていることに注目してください。配列内の特定のオブジェクトをインデックスで参照するには、列名の後ろに配列のオフセットを指定する必要があります。たとえば、最初の address の street にアクセスするには次のようにします：

```sql
SELECT address.street[1] AS street
FROM people

┌─street────────┐
│ Victor Plains │
└───────────────┘

1 row in set. Elapsed: 0.001 sec.
```

サブカラムは、バージョン [`24.12`](https://clickhouse.com/blog/clickhouse-release-24-12#json-subcolumns-as-table-primary-key) から並び替えキーとしても使用できます。

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

JSON オブジェクトが構造化されていても、多くの場合は既知のキーの一部しか含まれない疎な形式になることがよくあります。幸い、`Tuple` 型では JSON ペイロード内のすべての列が必須というわけではありません。指定されていない場合にはデフォルト値が使用されます。

先ほどの `people` テーブルと、`suite`、`geo`、`phone_numbers`、`catchPhrase` のキーが欠けている、次のような疎な JSON を考えてみます。

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

次のとおり、この行が正常に挿入されたことが確認できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","city":"Wisokyburgh","zipcode":"90566-7771"}],"website":"clickhouse.com","company":{"name":"ClickHouse"},"dob":"2007-03-31"}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

この 1 行をクエリしてみると、省略された列（サブオブジェクトを含む）にはデフォルト値が設定されていることが確認できます。

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

:::note 空と null の区別
値が空であることと、指定されていないことを区別する必要がある場合は、[Nullable](/sql-reference/data-types/nullable) 型を使用できます。ただし、これらのカラムのストレージおよびクエリ性能に悪影響を与えるため、絶対に必要な場合を除き、[使用は避けてください](/best-practices/select-data-types#avoid-nullable-columns)。
:::

### 新しいカラムの扱い {#handling-new-columns}

JSON キーが静的な場合は構造化されたアプローチが最も簡単ですが、スキーマへの変更を事前に計画できる、つまり新しいキーがあらかじめ分かっており、それに応じてスキーマを変更できるのであれば、このアプローチはその場合でも引き続き使用できます。

なお、ClickHouse はデフォルトで、ペイロードに含まれていてもスキーマに存在しない JSON キーを無視します。`nickname` キーを追加した、次のような JSON ペイロードを考えてみましょう。

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
    "catchPhrase": "リアルタイム分析データウェアハウス"
  },
  "dob": "2007-03-31"
}
```

この JSON は、`nickname` キーを無視しても問題なく挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

Ok.

1 行のセット。経過時間: 0.002 秒。
```

[`ALTER TABLE ADD COLUMN`](/sql-reference/statements/alter/column#add-column) コマンドを使用して、スキーマにカラムを追加できます。`DEFAULT` 句でデフォルト値を指定でき、後続の INSERT で値が指定されなかった場合にこのデフォルト値が使用されます。このカラムが追加される前に挿入された行のように、この値を持たない行についても、このデフォルト値が返されます。`DEFAULT` 値が指定されていない場合は、その型のデフォルト値が使用されます。

例えば、次のようになります。

```sql
-- 初期行を挿入（nicknameは無視されます）
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","nickname":"Clicky","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics"},"dob":"2007-03-31"}

-- カラムを追加
ALTER TABLE people
 (ADD COLUMN `nickname` String DEFAULT 'no_nickname')

-- 新しい行を挿入（同じデータ、異なるid）
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

## 半構造化・動的な構造の扱い {#handling-semi-structured-dynamic-structures}

JSON データが半構造化されており、キーが動的に追加されたり、複数の型を取りうる場合は、[`JSON`](/sql-reference/data-types/newjson) 型を推奨します。

より具体的には、次のような場合に JSON 型を使用します:

* 時間の経過とともに変化しうる、**予測できないキー**を持つ。
* **型が異なりうる値**を含む（例: あるパスには文字列が入ることもあれば、別のときには数値が入ることもある）。
* 厳密な型付けが現実的でないようなスキーマの柔軟性が必要。
* 静的ではあるものの、明示的に宣言するのが現実的でない **何百〜何千ものパス** がある。このようなケースはまれです。

`company.labels` オブジェクトが動的であると判断された、[先ほどの person JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) を考えてみます。

`company.labels` に任意のキーが含まれていると仮定しましょう。さらに、この構造内のどのキーについても、その型は行ごとに一貫していない可能性があります。例えば、次のような場合があります:

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
        "location": "日本、京都"
      }
    ],
    "car": {
      "model": "Audi e-tron",
      "year": 2022
    }
  }
}
```

`company.labels` 列はオブジェクト間でキーや型が動的であるため、このデータをモデリングする方法としてはいくつかの選択肢があります。

* **単一の JSON 列** - 全体のスキーマを 1 つの `JSON` 列で表現し、その配下のあらゆる構造を動的に扱えるようにします。
* **対象を絞った JSON 列** - `company.labels` 列に対してのみ `JSON` 型を使用し、他のすべての列については上記で使用した構造化スキーマを維持します。

最初のアプローチは[以前の方針とは一致しません](#static-vs-dynamic-json)が、単一の JSON 列によるアプローチはプロトタイピングやデータエンジニアリングのタスクには有用です。

大規模な本番環境で ClickHouse をデプロイする場合、可能な限り構造を明示し、対象を絞った動的なサブ構造に対してのみ JSON 型を使用することを推奨します。

厳密なスキーマには、いくつかの利点があります。

- **データバリデーション** – 厳密なスキーマを適用することで、特定の構造を除き、カラム爆発のリスクを回避できます。
- **カラム爆発のリスク回避** - JSON 型はサブカラムを専用カラムとして保存することで潜在的に数千のカラムまでスケールできますが、その結果として過剰な数のカラムファイルが作成され、パフォーマンスに悪影響を与える「カラムファイル爆発」が発生する可能性があります。これを軽減するために、JSON で使用される基盤の [Dynamic 型](/sql-reference/data-types/dynamic) では、[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータが提供されており、個別のカラムファイルとして保存される一意なパスの数を制限します。しきい値に達すると、それ以降のパスはコンパクトなエンコード形式を用いて共有カラムファイル内に保存され、柔軟なデータのインジェストをサポートしつつ、パフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスは、専用カラムほど高速ではありません。なお、JSON カラムは [type hints](#using-type-hints-and-skipping-paths) と併用できます。「ヒント付き」のカラムは、専用カラムと同等のパフォーマンスを提供します。
- **パスおよび型のインスペクションの容易さ** - JSON 型は、推論された型やパスを判定するための [インスペクション関数](/sql-reference/data-types/newjson#introspection-functions) をサポートしていますが、`DESCRIBE` などを用いた静的な構造のほうが、確認・探索がより簡単な場合があります。

### 単一の JSON カラム {#single-json-column}

この手法はプロトタイピングやデータエンジニアリングのタスクに有用です。本番環境では、必要な場合に限り、動的なサブ構造に対してのみ `JSON` を使用することを推奨します。

:::note パフォーマンス上の考慮事項
単一の JSON カラムは、不要な JSON パスをスキップ（保存しない）することや、[type hints](#using-type-hints-and-skipping-paths) を使用することで最適化できます。Type hints により、サブカラムの型をユーザーが明示的に定義できるため、クエリ実行時の推論や間接処理を省略できます。これにより、明示的なスキーマを使用した場合と同等のパフォーマンスを実現できます。詳細については [&quot;Using type hints and skipping paths&quot;](#using-type-hints-and-skipping-paths) を参照してください。
:::

ここで扱う単一 JSON カラムのスキーマはシンプルです：

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
`username` カラムをソート/主キーに使用するため、JSON 定義内で [`type hint`](#using-type-hints-and-skipping-paths) を指定しています。これにより、ClickHouse はこのカラムが null にならないことを認識でき、どの `username` サブカラムを使用すべきかを判断できます（型ごとに複数存在しうるため、指定しないと曖昧になります）。
:::

上記のテーブルへの行の挿入は、`JSONAsObject` フォーマットを使用して行えます。

```sql
INSERT INTO people FORMAT JSONAsObject 
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1行が挿入されました。経過時間: 0.028秒。

INSERT INTO people FORMAT JSONAsObject
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1行が挿入されました。経過時間: 0.004秒。
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

2行が設定されました。経過時間: 0.005秒
```

[introspection functions](/sql-reference/data-types/newjson#introspection-functions) を使用して、推論されたサブカラムとその型を特定できます。例えば、次のようにします。

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
```

イントロスペクション関数の完全な一覧については、[「Introspection functions」](/sql-reference/data-types/newjson#introspection-functions) を参照してください。

[サブパスにはアクセスできます](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) `.` 記法を使用してアクセスします（例: ）。

```sql
SELECT json.name, json.email FROM people

┌─json.name────────────┬─json.email────────────┐
│ Analytica Rowe       │ ᴺᵁᴸᴸ                  │
│ Clicky McCliickHouse │ clicky@clickhouse.com │
└──────────────────────┴───────────────────────┘

2行が返されました。経過時間: 0.006秒
```

行に存在しない列は `NULL` として返されることに注意してください。

さらに、同じパス内で型ごとに個別のサブカラムが作成されます。たとえば、`company.labels.type` には `String` と `Array(Nullable(String))` の両方に対してサブカラムが存在します。可能な場合は両方が返されますが、`.:` 構文を使用して特定のサブカラムを指定できます。

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

ネストされたサブオブジェクトを返すには、`^` が必要です。これは、明示的に要求されない限り、多数のカラムを読み込まないようにするための設計上の方針です。`^` を付けずにアクセスしたオブジェクトは、以下に示すように `NULL` を返します。

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

### 対象の JSON 列 {#targeted-json-column}

プロトタイピングやデータエンジニアリング上の課題に対処するうえでは有用ですが、本番環境では可能な限り明示的なスキーマを使用することを推奨します。

先ほどの例は、`company.labels` を単一の `JSON` 列としてモデリングできます。

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

このテーブルには `JSONEachRow` フォーマットを使ってデータを挿入できます。

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021","employees":250}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

1行が設定されました。経過時間: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1行が設定されました。経過時間: 0.440 sec.
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

[Introspection 関数](/sql-reference/data-types/newjson#introspection-functions) を使用して、`company.labels` 列に対して推論されたパスと型を確認できます。

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

型ヒントを使うと、パスとそのサブカラムの型を指定できるため、不必要な型推論を防げます。次の例では、JSON カラム `company.labels` 内の JSON キー `dissolved`、`employees`、`founded` に対して型を指定しています。

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

1行が設定されました。経過時間: 0.450 sec.

INSERT INTO people FORMAT JSONEachRow
{"id":2,"name":"Analytica Rowe","username":"Analytica","address":[{"street":"Maple Avenue","suite":"Apt. 402","city":"Dataford","zipcode":"11223-4567","geo":{"lat":40.7128,"lng":-74.006}}],"phone_numbers":["123-456-7890","555-867-5309"],"website":"fastdata.io","company":{"name":"FastData Inc.","catchPhrase":"Streamlined analytics at scale","labels":{"type":["real-time processing"],"founded":2019,"dissolved":2023,"employees":10}},"dob":"1992-07-15","tags":{"hobby":"Running simulations","holidays":[{"year":2023,"location":"Kyoto, Japan"}],"car":{"model":"Audi e-tron","year":2022}}}

1行が設定されました。経過時間: 0.440 sec.
```

これらのカラムには、明示的な型が設定されていることに注目してください：

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

さらに、[`SKIP` および `SKIP REGEXP`](/sql-reference/data-types/newjson) パラメータを使って、保存したくない JSON 内のパスをスキップすることで、保存容量を最小化し、不要なパスに対する無駄な推論を避けることができます。たとえば、上記のデータに対して 1 つの JSON カラムを使用する場合、`address` と `company` のパスをスキップできます。

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

データからこれらの列が除外されていることに注目してください。

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

2行が返されました。経過時間: 0.004秒
```

#### 型ヒントによるパフォーマンス最適化 {#optimizing-performance-with-type-hints}  

型ヒントは、不要な型推論を避けるための手段にとどまらず、ストレージおよび処理における間接参照を完全に排除し、さらに[最適なプリミティブ型](/data-modeling/schema-design#optimizing-types)を指定できるようにします。型ヒント付きの JSON パスは、常に従来のカラムと同様に保存されるため、[**discriminator カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ実行時の動的な解決が不要になります。 

つまり、明確に定義された型ヒントがあれば、入れ子になった JSON キーでも、最初からトップレベルのカラムとしてモデリングされていた場合と同等のパフォーマンスと効率性を実現できます。 

その結果、大部分が一貫していながらも JSON の柔軟性が有用なデータセットに対して、型ヒントはスキーマやデータ取り込みパイプラインを再構成することなくパフォーマンスを維持する便利な手段となります。

### 動的パスの設定 {#configuring-dynamic-paths}

ClickHouse は各 JSON パスを純粋なカラム型レイアウトにおけるサブカラムとして保存し、圧縮、SIMD による高速処理、最小限のディスク I/O といった、従来のカラムと同様のパフォーマンス上の利点を実現します。JSON データ内のそれぞれの一意なパスと型の組み合わせは、それぞれ専用のカラムファイルとしてディスク上に保存されます。

<Image img={json_column_per_type} size="md" alt="JSON パスごとのカラム" />

例えば、2 つの JSON パスが異なる型で挿入された場合、ClickHouse はそれぞれの[具体的な型を別々のサブカラムに](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)保存します。これらのサブカラムは独立してアクセスできるため、不要な I/O を最小限に抑えられます。複数の型を持つカラムをクエリする場合でも、その値は単一のカラム形式のレスポンスとして返される点に注意してください。

さらに、オフセットを活用することで、ClickHouse は存在しない JSON パスに対してデフォルト値を保存することなく、これらのサブカラムの密度が高い状態を維持します。このアプローチにより圧縮効率を最大化し、I/O を一層削減できます。

<Image img={json_offsets} size="md" alt="JSON オフセット" />

しかし、テレメトリパイプライン、ログ、機械学習の feature store のようにカーディナリティが高い、あるいは構造が非常に可変な JSON を扱うシナリオでは、この挙動によってカラムファイルが爆発的に増加する可能性があります。一意な JSON パスごとに新しいカラムファイルが作成され、そのパスの下にある型のバリエーションごとにさらに別のカラムファイルが作成されます。これは読み取りパフォーマンスの観点では最適ですが、多数の小さなファイルが存在することでファイルディスクリプタの枯渇、メモリ使用量の増加、マージ処理の低速化といった運用上の課題を引き起こします。

これを軽減するために、ClickHouse はオーバーフロー・サブカラムという概念を導入しました。異なる JSON パスの数がしきい値を超えた場合、追加のパスはコンパクトにエンコードされた形式で単一の共有ファイルに保存されます。このファイルもクエリ可能ですが、専用サブカラムと同じパフォーマンス特性は得られません。

<Image img={shared_json_column} size="md" alt="共有 JSON カラム" />

このしきい値は、JSON 型宣言における [`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) パラメータで制御されます。

```sql
CREATE TABLE logs
(
    payload JSON(max_dynamic_paths = 500)
)
ENGINE = MergeTree
ORDER BY tuple();
```

**このパラメータを過度に大きく設定しないでください** — 値が大きいほどリソース消費が増加し、効率が低下します。目安として、10,000 未満に保つようにしてください。構造が非常に動的なワークロードでは、`type hints` と `SKIP` パラメータを使用して、保存する内容を制限してください。

この新しいカラム型の実装に興味がある方は、詳細を解説したブログ記事「[A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)」を参照することをおすすめします。
