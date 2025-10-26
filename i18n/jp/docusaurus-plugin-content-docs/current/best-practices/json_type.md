---
'slug': '/best-practices/use-json-where-appropriate'
'sidebar_position': 10
'sidebar_label': 'JSONの使用'
'title': '適切な場所でJSONを使用する'
'description': 'JSONを使用するタイミングを説明するページ'
'keywords':
- 'JSON'
'show_related_blogs': true
'doc_type': 'reference'
---

ClickHouseは、半構造化および動的データを目的としたネイティブなJSONカラムタイプを提供しています。**これはデータフォーマットではなくカラムタイプである**ことを明確にすることが重要です。JSONを文字列として挿入することや、[JSONEachRow](/docs/interfaces/formats/JSONEachRow)のようなサポートされているフォーマットを通じて挿入することができますが、それはJSONカラムタイプを使うことを意味しません。ユーザーは、データの構造が動的な場合のみJSONタイプを使用するべきであり、単にJSONを保存するためだけには使用すべきではありません。

## JSONタイプを使用すべき時 {#when-to-use-the-json-type}

データが以下の条件を満たす場合、JSONタイプを使用します：

* **予測不可能なキー**があり、時間とともに変化する可能性がある。
* **さまざまな型の値**が含まれる（例：パスには時々文字列が含まれ、時々数値が含まれることがある）。
* 厳密な型付けが実現不可能なスキーマの柔軟性が必要である。

データ構造が既知で一貫している場合、データがJSON形式であってもJSONタイプを使用する必要はまれです。具体的には、データに次のような特徴がある場合：

* **既知のキーを持つフラットな構造**：標準のカラムタイプ（例：String）を使用します。
* **予測可能なネスティング**：これらの構造にはTuple、Array、またはNestedタイプを使用します。
* **さまざまな型を持つ予測可能な構造**：代わりにDynamicまたはVariantタイプを考慮します。

アプローチを組み合わせることも可能です - たとえば、予測可能なトップレベルのフィールドには静的カラムを、ペイロードの動的セクションには単一のJSONカラムを使用します。

## JSONを使用する際の考慮事項とヒント {#considerations-and-tips-for-using-json}

JSONタイプは、パスをサブカラムにフラット化することによって効率的な列指向ストレージを可能にします。しかし柔軟性には責任が伴います。効果的に使用するためには：

* **パスの型を指定する** [カラム定義におけるヒント](/sql-reference/data-types/newjson)を使用して、既知のサブカラムの型を指定し、不必要な型推論を避けます。
* **値が必要ないパスはスキップする** [SKIPおよびSKIP REGEXP](/sql-reference/data-types/newjson)を使用して、ストレージを削減し、パフォーマンスを向上させます。
* **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)を高く設定しない** - 大きな値はリソース消費を増加させ、効率を低下させます。目安として10,000未満に保ってください。

:::note タイプヒント
タイプヒントは、不必要な型推論を回避する方法以上のものを提供します。型ヒントのあるJSONパスは、常に従来のカラムのようにストレージされ、[**ディスクリミネータカラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ時の動的解決の必要を回避します。これにより、型ヒントが明確に定義されている場合、ネストされたJSONフィールドは、最初からトップレベルのフィールドとしてモデル化されたかのように、同じパフォーマンスと効率を実現します。その結果、ほぼ一貫しているがJSONの柔軟性を上手く活用するデータセットにとって、型ヒントはスキーマやインジェストパイプラインを再構築することなくパフォーマンスを保持する便利な方法を提供します。
:::

## 高度な機能 {#advanced-features}

* JSONカラムは他のカラムのように**主キーに使用できます**。サブカラムにコーデックを指定することはできません。
* [`JSONAllPathsWithTypes()`および`JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions)のような関数を介してインストロスペクションをサポートします。
* `.^`構文を使用してネストされたサブオブジェクトを読み取ることができます。
* クエリ構文は標準SQLとは異なる場合があり、ネストされたフィールドに対して特別なキャストや演算子が必要になる場合があります。

追加のガイダンスについては、[ClickHouse JSONドキュメント](/sql-reference/data-types/newjson)を参照するか、私たちのブログ記事[ClickHouseのための新しい強力なJSONデータタイプ](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)を探求してください。

## 例 {#examples}

以下のJSONサンプルを考えます。これは、[Python PyPIデータセット](https://clickpy.clickhouse.com/)の行を表しています。

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

このスキーマが静的で、型が明確に定義できると仮定します。データがNDJSON形式（行ごとのJSON）であっても、そのようなスキーマのためにJSONタイプを使う必要はありません。クラシックな型でスキーマを定義するだけです。

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

そしてJSON行を挿入します：

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)には250万の学術論文が含まれています。このデータセット内の各行は、発表された学術論文を表しています。下記に例を示します：

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

ここでのJSONは複雑で、ネストされた構造を持っていますが、予測可能です。フィールドの数と型は変化しません。この例にはJSONタイプを使用することができますが、[Tuples](/sql-reference/data-types/tuple)や[Nested](/sql-reference/data-types/nested-data-structures/nested)タイプを使用して構造を明示的に定義することもできます：

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

再び、データをJSONとして挿入できます：

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

別のカラムとして`tags`が追加されたと仮定します。もしこれが単なる文字列のリストであったなら、`Array(String)`としてモデル化できますが、ユーザーが混合型の任意のタグ構造を追加できると仮定しましょう（スコアが文字列または整数であることに注目してください）。私たちの修正されたJSONドキュメント：

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

この場合、arXivの文書をすべてJSONとしてモデル化するか、単にJSONの`tags`カラムを追加することができます。以下に両方の例を示します：

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
JSON定義内の`update_date`カラムに型ヒントを提供します。これは、順序付け/主キーで使用するためです。これにより、クリックハウスがこのカラムがnullにならないことを知り、どの`update_date`サブカラムを使用するべきかを確認できます（各型に対して複数存在する可能性があるため、それ以外は曖昧になります）。
:::

このテーブルに挿入し、その後推測されたスキーマを[`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes)関数と[`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow)出力フォーマットを使用して確認できます：

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

あるいは、以前のスキーマとJSONの`tags`カラムを使ってモデル化することができます。これは一般的に推奨され、クリックハウスによる推論を最小限にします：

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

私たちは、サブカラムの型を推測できるようになりました。

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
