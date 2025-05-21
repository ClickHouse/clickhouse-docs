---
slug: '/best-practices/use-json-where-appropriate'
sidebar_position: 10
sidebar_label: 'JSONの使用'
title: '適切な場合にJSONを使用する'
description: 'JSONを使用するタイミングについてのページ'
---

ClickHouseでは、半構造化データおよび動的データ用に設計されたネイティブのJSONカラムタイプが提供されています。重要な点は、**これはデータフォーマットではなくカラムタイプである**ことを明確にすることです—ClickHouseには、文字列または[JSONEachRow](/docs/interfaces/formats/JSONEachRow)などのサポートされているフォーマットを介してJSONを挿入できますが、JSONカラムタイプを使用することを意味するものではありません。ユーザーは、データの構造が動的な場合のみJSONタイプを使用すべきであり、単にJSONを保存するためだけに使用してはいけません。

## JSONタイプを使用するべきとき {#when-to-use-the-json-type}

データが以下の条件を満たす場合、JSONタイプを使用します：

* **予測不可能なキー**があり、時間とともに変更される可能性がある。
* **異なるタイプの値**を含む（例えば、パスは時には文字列、時には数値を含むことがある）。
* 厳格な型付けが実用的でない場合に、スキーマの柔軟性が必要。

データ構造が既知かつ一貫している場合、たとえデータがJSON形式であっても、JSONタイプを使用する必要はほとんどありません。具体的には、データに以下が含まれている場合：

* **既知のキーを持つフラットな構造**: 標準カラムタイプ（例えば、String）を使用します。
* **予測可能なネスト**: これらの構造に対して、Tuple、Array、またはNestedタイプを使用します。
* **異なる型の予測可能な構造**: その代わりにDynamicまたはVariantタイプを検討します。

また、アプローチを組み合わせることもできます—例えば、予測可能な最上位フィールドには静的カラムを使用し、ペイロードの動的セクションには単一のJSONカラムを使用することができます。

## JSON使用に関する考慮事項とヒント {#considerations-and-tips-for-using-json}

JSONタイプは、パスをサブカラムにフラット化することによって効率的な列指向ストレージを可能にします。しかし、柔軟性には責任が伴います。効果的に使用するためには：

* **パスタイプを指定**します。[カラム定義のヒント](/sql-reference/data-types/newjson)を使用して、既知のサブカラムの型を指定し、不必要な型推論を避けます。
* **不要な値のパスをスキップ**します。[SKIP および SKIP REGEXP](/sql-reference/data-types/newjson)を使用して、ストレージを削減し、パフォーマンスを向上させます。
* **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)を高く設定しすぎない**ようにします—大きな値はリソース消費を増加させ、効率を低下させます。おおよその目安として、10,000未満に保ちます。

:::note 型ヒント
型ヒントは、不必要な型推論を避ける手段以上のものを提供します—それらはストレージと処理の間接的な操作を完全に排除します。型ヒントのあるJSONパスは、従来のカラムと同様に常にストレージされ、[**識別子カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的な解決の必要がありません。つまり、明確に定義された型ヒントを持つことで、ネストされたJSONフィールドは、最初から最上位フィールドとしてモデル化されていたかのように同じパフォーマンスと効率を達成します。その結果、ほとんど一貫しているがJSONの柔軟性の恩恵を受けるデータセットに対して、型ヒントはスキーマや取り込みパイプラインを再構築することなくパフォーマンスを維持する便利な方法を提供します。
:::

## 高度な機能 {#advanced-features}

* JSONカラムは**主キーに使用できる**他のカラムと同様です。サブカラムにはコーデックを指定できません。
* [`JSONAllPathsWithTypes()` および `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions)などの関数を介して自己調査をサポートします。
* `.^`構文を使用してネストされたサブオブジェクトを読み取ることができます。
* クエリ構文は標準SQLと異なる場合があり、ネストされたフィールド用の特別なキャストや演算子が必要な場合があります。

追加のガイダンスについては、[ClickHouse JSONドキュメント](/sql-reference/data-types/newjson)またはブログ記事[ClickHouseの新しい強力なJSONデータ型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)をご覧ください。

## 例 {#examples}

次のJSONサンプルを考えてみましょう。[Python PyPIデータセット](https://clickpy.clickhouse.com/)からの行を表しています：

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

このスキーマが静的であり、型が明確に定義できると仮定します。データがNDJSON形式（行ごとのJSON）であっても、このようなスキーマにJSONタイプを使用する必要はありません。単に古典的な型でスキーマを定義します。

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

次に、JSON行を挿入します：

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を考えてみましょう。このデータセットは250万の学術論文を含んでいます。このデータセットの各行は、公開された学術論文を表しています。例として以下の行を示します：

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

ここにあるJSONは複雑ですが、ネストされた構造を持っていますが、予測可能です。フィールドの数と型は変わりません。この例のためにJSONタイプを使用することもできますが、単に[Tuples](/sql-reference/data-types/tuple)や[Nested](/sql-reference/data-types/nested-data-structures/nested)タイプを使用して構造を明示的に定義することもできます。

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
  `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

また、データをJSONとして挿入することもできます：

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

別の`tags`というカラムが追加されたとしましょう。もしこれが単に文字列のリストであれば`Array(String)`としてモデル化できるかもしれませんが、ユーザーが混合型の任意のタグ構造を追加できると仮定します（スコアが文字列または整数であることに注意）。修正されたJSONドキュメントは次のとおりです：

```sql
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
 ],
 "tags": {
   "tag_1": {
     "name": "ClickHouse user",
     "score": "A+",
     "comment": "A good read, applicable to ClickHouse"
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "Didn't learn much",
     "updates": [
       {
         "name": "professor X",
         "comment": "Wolverine found more interesting"
       }
     ]
   }
 }
}
```

この場合、arXivのドキュメントをすべてJSONとしてモデル化するか、単にJSONの`tags`カラムを追加することができます。以下に両方の例を示します。

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
JSON定義で`update_date`カラムに型ヒントを提供しています。これをオーダリングおよびプライマリキーに使用します。これによりClickHouseはこのカラムがnullではないことを認識し、どの`update_date`サブカラムを使用するかを知ることができ（各型に対して複数のものがある可能性があるため、そうでないとあいまいになります）、明確性が向上します。
:::

このテーブルにデータを挿入し、[`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#jsonallpathswithtypes)関数と[`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow)出力フォーマットを使用して、推測されるスキーマを表示できます：

```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```

```sql
SELECT JSONAllPathsWithTypes(doc)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(doc)": {
    "abstract": "String",
    "authors": "String",
    "authors_parsed": "Array(Array(Nullable(String)))",
    "categories": "String",
    "comments": "String",
    "doi": "String",
    "id": "String",
    "journal-ref": "String",
    "license": "String",
    "submitter": "String",
    "tags.28_03_2025.comment": "String",
    "tags.28_03_2025.name": "String",
    "tags.28_03_2025.score": "Int64",
    "tags.28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tags.tag_1.comment": "String",
    "tags.tag_1.name": "String",
    "tags.tag_1.score": "String",
    "title": "String",
    "update_date": "Date",
    "versions": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))"
  }
}

1 row in set. Elapsed: 0.003 sec.
```

あるいは、前述のスキーマを使用し、JSONの`tags`カラムを追加することもできます。これを一般的に好まれ、ClickHouseによる推測を最小限に抑えます。

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
    `tags` JSON()
)
ENGINE = MergeTree
ORDER BY update_date
```

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```

この後、サブカラム`tags`の型を推測することができます。

```sql
SELECT JSONAllPathsWithTypes(tags)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(tags)": {
    "28_03_2025.comment": "String",
    "28_03_2025.name": "String",
    "28_03_2025.score": "Int64",
    "28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tag_1.comment": "String",
    "tag_1.name": "String",
    "tag_1.score": "String"
  }
}

1 row in set. Elapsed: 0.002 sec.
```
