---
'slug': '/best-practices/use-json-where-appropriate'
'sidebar_position': 10
'sidebar_label': 'JSON の使用'
'title': '適切な場面で JSON を使用する'
'description': 'JSON の使用タイミングについて説明したページ'
---



ClickHouseは、半構造化データおよび動的データ用に設計されたネイティブJSONカラム型を提供しています。重要なことは、**これはデータ形式ではなく、カラム型であることを明確にすること**です。 JSONを文字列としてClickHouseに挿入したり、[JSONEachRow](/docs/interfaces/formats/JSONEachRow)などのサポートされている形式を使用することができますが、JSONカラム型を使用することを意味するわけではありません。ユーザーは、自分のデータの構造が動的である場合にのみJSON型を使用すべきです。単にJSONを保存している場合には使用すべきではありません。

## JSON型を使用するタイミング {#when-to-use-the-json-type}

データに次のような特徴がある場合、JSON型を使用してください：

* **予測できないキー**があり、時間とともに変化する可能性がある。
* **様々なタイプの値**を含む（例えば、パスには時々文字列が含まれ、時々数値が含まれる場合がある）。
* 厳格な型付けが実現できない場合でも、スキーマの柔軟性が必要。

データの構造が既知で一貫している場合、JSON型の必要性はほとんどありません。たとえデータがJSON形式であっても、特に次のような場合は：

* **既知のキーを持つ平坦な構造**：標準のカラム型（例：String）を使用してください。
* **予測可能なネスト**：これらの構造にはTuple、Array、またはNested型を使用してください。
* **様々なタイプを持つ予測可能な構造**：代わりにDynamicまたはVariant型を検討してください。

アプローチを組み合わせることも可能です。例えば、予測可能なトップレベルフィールドに静的カラムを使用し、ペイロードの動的セクションに対して単一のJSONカラムを使用することができます。

## JSONを使用するための考慮事項とヒント {#considerations-and-tips-for-using-json}

JSON型は、パスをサブカラムにフラット化することによって効率的な列指向ストレージを実現します。しかし、柔軟性には責任が伴います。効果的に使用するためには：

* **カラム定義においてパスタイプを指定**し、既知のサブカラムの型を指定して不必要な型推論を回避します。 [hints in the column definition](/sql-reference/data-types/newjson)を使用してください。
* **必要ない場合はパスをスキップ**し、[SKIPやSKIP REGEXP](/sql-reference/data-types/newjson)を使用してストレージを削減し、パフォーマンスを向上させます。
* あまりにも高く[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)を設定しないようにしてください。大きな値はリソース消費を増加させ、効率を低下させます。目安としては10,000未満にしてください。

:::note 型ヒント
型ヒントは、不必要な型推論を回避する方法を提供するだけでなく、ストレージと処理の間接指向を完全に排除します。型ヒントのあるJSONパスは、従来のカラムと同様に常にストレージされ、[**識別子カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的解決の必要がありません。したがって、明確に定義された型ヒントを使用することで、ネストされたJSONフィールドは、最初からトップレベルフィールドとしてモデル化されていたかのように同じパフォーマンスと効率を実現します。その結果、ほとんど一貫しているがJSONの柔軟性の恩恵を受けるデータセットに対して、型ヒントはスキーマやインジェストパイプラインを再構築することなくパフォーマンスを維持する便利な方法を提供します。
:::

## 高度な機能 {#advanced-features}

* JSONカラムは、他のカラムと同様に**主キーに使用できます**。サブカラムのためのコーデックは指定できません。
* [`JSONAllPathsWithTypes()`や`JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions)などの関数を介してイントロスペクションをサポートしています。
* `.^`構文を使用してネストされたサブオブジェクトを読むことができます。
* クエリ構文は標準SQLと異なる場合があり、ネストされたフィールドのために特別なキャスティングや演算子が必要になることがあります。

追加のガイダンスについては、[ClickHouse JSONドキュメント](/sql-reference/data-types/newjson)を参照するか、ブログ投稿[ClickHouseのための新しい強力なJSONデータ型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)を探ってください。

## 例 {#examples}

次のJSONサンプルを考えてみましょう。これは[Python PyPIデータセット](https://clickpy.clickhouse.com/)からの行を表しています。

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

このスキーマが静的であり、型が明確に定義できると仮定しましょう。データがNDJSON形式（各行がJSON）であっても、そのようなスキーマに対してJSON型を使用する必要はありません。単に従来の型を使用してスキーマを定義します。

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

そして、JSON行を挿入します。

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)には250万件の学術論文が含まれています。このデータセット内の各行は、公開された学術論文を表しています。以下に例行を示します。

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

このJSONは複雑でネストされた構造を持っていますが、予測可能です。フィールドの数とタイプは変わりません。この例にはJSON型を使用することもできますが、[Tuples](/sql-reference/data-types/tuple)および[Nested](/sql-reference/data-types/nested-data-structures/nested)型を使用して構造を明示的に定義することもできます。

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

再度、データをJSONとして挿入できます。

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

例えば、`tags`という別のカラムが追加されたとします。これは単なる文字列のリストであれば`Array(String)`としてモデル化できますが、ユーザーが混合タイプの任意のタグ構造を追加できると仮定します（スコアが文字列または整数であることに注意してください）。修正したJSONドキュメント：

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

この場合、arXivのドキュメントをすべてJSONとしてモデル化するか、単にJSONの`tags`カラムを追加することができます。以下に両方の例を提供します。

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
JSON定義内で`update_date`カラムの型ヒントを提供します。これはオーダリング/主キーで使用するためです。これにより、ClickHouseはこのカラムがnullではないことを把握し、どの`update_date`サブカラムを使用すべきかを把握します（各タイプごとに複数が存在する場合があるため、そうでなければあいまいになります）。
:::

このテーブルに挿入し、次に[`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#jsonallpathswithtypes)関数と[`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow)出力形式を使用して推論されたスキーマを確認できます。

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

1行の結果。経過時間：0.003秒。
```

あるいは、先ほどのスキーマを使用し、JSON `tags`カラムを持つモデル化を行うこともできます。これは一般的に好まれ、ClickHouseによる推論を最小限に抑えます：

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

`tags`のサブカラムの型を推論することができます。

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

1行の結果。経過時間：0.002秒。
