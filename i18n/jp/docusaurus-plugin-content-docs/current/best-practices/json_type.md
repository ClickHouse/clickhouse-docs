---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'JSON の使用'
title: '適切な場面で JSON を使用する'
description: 'JSON をいつ使用すべきかを説明するページ'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

import WhenToUseJson from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_when-to-use-json.md';

ClickHouse には、半構造化データや動的なデータ向けに設計されたネイティブな JSON カラム型が用意されています。**これはカラム型であり、データ形式ではない**ことを明確にしておくことが重要です。JSON は文字列として、あるいは [JSONEachRow](/interfaces/formats/JSONEachRow) のようなサポートされているフォーマット経由で ClickHouse に挿入できますが、それは必ずしも JSON カラム型を使用していることを意味しません。JSON 型は、データの構造が動的な場合にのみ使用し、単に JSON を保存したいだけの場合には使用しないでください。

<WhenToUseJson />

## JSON を使用する際の考慮事項とヒント \\{#considerations-and-tips-for-using-json\\}

JSON 型は、パスをサブカラムとしてフラット化することで効率的な列指向ストレージを実現します。ただし、高い柔軟性にはそれ相応の注意が必要です。効果的に利用するには次の点に留意してください。

* 既知のサブカラムに対して型を指定し、不要な型推論を避けるために、[カラム定義内のヒント](/sql-reference/data-types/newjson) を使って **パスの型を指定** します。
* 値が不要な場合は、[SKIP および SKIP REGEXP](/sql-reference/data-types/newjson) を使用して **パスをスキップ** し、ストレージ使用量を削減してパフォーマンスを向上させます。
* **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) を高く設定しすぎないように** します。大きな値はリソース消費を増加させ、効率を低下させます。目安としては、10,000 未満に保つことを推奨します。

:::note Type hints 
Type hints は、不要な型推論を避けるための仕組みにとどまらず、ストレージおよび処理における間接参照を完全に排除します。Type hints が指定された JSON パスは、常に従来のカラムと同様の方法で保存されるため、[**discriminator カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data) やクエリ時の動的な解決は不要になります。つまり、適切に定義された type hints を用いれば、ネストされた JSON フィールドは、最初からトップレベルフィールドとしてモデリングされていた場合と同等のパフォーマンスと効率を実現できます。その結果、ほとんど一貫しているものの、なお JSON の柔軟性からも恩恵を受けたいデータセットに対して、スキーマや取り込みパイプラインを再構成することなくパフォーマンスを維持する、便利な手段を type hints が提供します。
:::

## 高度な機能 \\{#advanced-features\\}

* JSON カラムは、他のカラムと同様に**主キーとして使用できます**。サブカラムには codec を指定できません。
* [`JSONAllPathsWithTypes()` および `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) のような関数によるイントロスペクションをサポートします。
* `.^` 構文を使用して、ネストされたサブオブジェクトを読み取ることができます。
* クエリ構文は標準 SQL と異なる場合があり、ネストされたフィールドに対して特別なキャストや演算子が必要になることがあります。

詳細については、[ClickHouse JSON ドキュメント](/sql-reference/data-types/newjson) を参照するか、ブログ記事 [A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse) を参照してください。

## 例 \{#examples\}

次の JSON サンプルは、[Python PyPI データセット](https://clickpy.clickhouse.com/) の 1 行を表しています。

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

このスキーマが静的であり、型を明確に定義できると仮定します。たとえデータが NDJSON 形式（1 行あたり 1 件の JSON データ）であっても、このようなスキーマでは `JSON` 型を使用する必要はありません。従来の型を使ってスキーマを定義するだけで十分です。

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

JSON 行を挿入します:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

[arXiv データセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download) には 250 万件の学術論文が含まれています。NDJSON 形式で配布されているこのデータセットでは、各行が出版済みの学術論文 1 本を表します。以下に例となる 1 行を示します。

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

ここで扱う JSON はネストされた構造を含んでいて複雑ですが、予測可能です。フィールドの数や型は変わりません。この例では `JSON` 型を使うこともできますが、[Tuples](/sql-reference/data-types/tuple) 型や [Nested](/sql-reference/data-types/nested-data-structures/nested) 型を使ってその構造を明示的に定義することもできます。

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

今回もデータを JSON 形式で挿入できます:


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

`tags` という別のカラムが追加されたとします。これが単なる文字列のリストであれば、`Array(String)` として表現できますが、ここでは混在した型を持つ任意のタグ構造を追加できると仮定します（`score` が文字列または整数である点に注目してください）。変更後の JSON ドキュメントは次のとおりです。

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

この場合、arXiv のドキュメントは、すべてを JSON としてモデル化することも、JSON 型の `tags` カラムを追加するだけにすることもできます。以下に両方の例を示します。

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
`update_date` カラムを並び順や主キーで使用するため、JSON 定義内で型ヒントを指定しています。これにより、ClickHouse はこのカラムが null にならないことを認識し、どの `update_date` サブカラムを使用すべきかを判断できます（型ごとに複数存在する可能性があるため、そのままではあいまいになります）。
:::

このテーブルにデータを挿入し、その後に推論されたスキーマを [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 関数と [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 出力形式を使って確認できます。


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

あるいは、先ほどのスキーマを使い、JSON の `tags` カラムでこれを表現することもできます。こちらの方が一般的に好まれ、ClickHouse が行うべき推論を最小限に抑えられます。

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


これでサブカラム `tags` の型を推論できるようになりました。

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
