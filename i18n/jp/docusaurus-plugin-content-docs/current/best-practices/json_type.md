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

ClickHouse には、半構造化データおよび動的なデータ向けに設計されたネイティブの JSON カラム型が用意されています。**これはデータ形式ではなくカラム型である**ことを明確にしておくことが重要です。JSON は文字列として、あるいは [JSONEachRow](/interfaces/formats/JSONEachRow) のようなサポートされているフォーマット経由で ClickHouse に挿入できますが、それは JSON カラム型を使用していることを意味しません。ユーザーは、単に JSON を保存しているというだけではなく、データ構造が動的な場合にのみ JSON 型を使用すべきです。

## JSON 型を使用するタイミング {#when-to-use-the-json-type}

次のようなデータには JSON 型を使用します:

* 時間の経過とともに変化しうる**予測不能なキー**を持つ。
* **さまざまな型の値**を含む（例: あるパスには文字列が入ることもあれば、数値が入ることもある）。
* 厳密な型付けが適さず、スキーマの柔軟性が求められる。

データ構造が既知で一貫している場合、データ自体が JSON 形式であっても、JSON 型が必要となることはほとんどありません。特に、データが次のような場合は JSON 型を使う必要はありません:

* **既知のキーを持つフラットな構造**: String などの標準的なカラム型を使用します。
* **予測可能なネスト構造**: その構造には Tuple、Array、Nested 型を使用します。
* **構造は予測可能だが値の型が変わりうる**: 代わりに Dynamic または Variant 型の利用を検討します。

アプローチを組み合わせることもできます。たとえば、予測可能なトップレベルのフィールドには静的なカラムを使用し、ペイロード内の動的な部分については 1 つの JSON カラムを使用するといった構成です。

## JSON を使用する際の考慮事項とヒント {#considerations-and-tips-for-using-json}

`JSON` 型は、パスをサブカラムにフラット化することで効率的な列指向ストレージを実現します。しかし、柔軟性には責任が伴います。効果的に使用するには、次の点に留意してください。

* 既知のサブカラムに対して型を指定し不要な型推論を避けるために、[カラム定義内のヒント](/sql-reference/data-types/newjson)を使用して**パスの型を指定**します。
* 値が不要な場合は、[SKIP および SKIP REGEXP](/sql-reference/data-types/newjson) を用いて**パスをスキップ**し、ストレージを削減しつつパフォーマンスを向上させます。
* **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json) を高く設定しすぎないように**します。大きすぎる値はリソース消費を増やし、効率を低下させます。目安としては、10,000 未満に保つことを推奨します。

:::note 型ヒント
型ヒントは、不要な型推論を避けるための仕組みにとどまりません。ストレージおよび処理における間接参照を完全に排除します。型ヒント付きの JSON パスは常に従来のカラムと同様に格納されるため、[**discriminator カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)やクエリ実行時の動的な解決が不要になります。これは、適切に定義された型ヒントを用いれば、ネストされた JSON フィールドであっても、最初からトップレベルのフィールドとしてモデリングされていた場合と同等のパフォーマンスと効率を得られることを意味します。その結果、大部分が一貫しているものの JSON の柔軟性の恩恵も受けたいデータセットに対して、スキーマや取り込みパイプラインを再構成することなくパフォーマンスを維持する便利な方法として、型ヒントを利用できます。
:::

## 高度な機能 {#advanced-features}

* JSON カラムは、他のカラムと同様に **主キーとして使用できます**。サブカラムにはコーデックを指定できません。
* [`JSONAllPathsWithTypes()` や `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions) などの関数によるイントロスペクションをサポートします。
* `.^` 構文を使用して、ネストされたサブオブジェクトを読み取ることができます。
* クエリ構文は標準 SQL と異なる場合があり、ネストされたフィールドに対して特別な型変換や演算子が必要になることがあります。

追加の詳細については [ClickHouse JSON ドキュメント](/sql-reference/data-types/newjson) を参照するか、ブログ記事 [A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse) をご覧ください。

## 例 {#examples}

次の JSON サンプルは、[Python PyPI データセット](https://clickpy.clickhouse.com/) に含まれる 1 行を表しています。

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

このスキーマが静的であり、型を適切に定義できると仮定します。データが NDJSON 形式（1 行ごとに 1 つの JSON オブジェクト）であっても、そのようなスキーマに対して `JSON` 型を使用する必要はありません。従来の基本的な型でスキーマを定義するだけでかまいません。

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

次に、JSON 行を挿入します:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

250万件の学術論文を含む [arXiv データセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download) を考えます。NDJSON 形式で配布されているこのデータセットでは、各行が 1 本の公開済み学術論文を表します。以下に例となる 1 行を示します。

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

ここで示している JSON はネストされた構造を含むため複雑ですが、構造は一定で、フィールド数や型が変化することはありません。この例では `JSON` 型を使うこともできますが、[Tuples](/sql-reference/data-types/tuple) 型や [Nested](/sql-reference/data-types/nested-data-structures/nested) 型を使って構造を明示的に定義することも可能です。

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

ここでもデータを JSON 形式で挿入できます：


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

`tags` という別のカラムが追加されたとします。これが単なる文字列のリストであれば `Array(String)` としてモデリングできますが、ユーザーが任意のタグ構造を追加でき、その中で型が混在していると仮定します（`score` が文字列または整数になり得る点に注意してください）。変更後の JSON ドキュメントは次のようになります。

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

この場合、arXiv ドキュメントは、すべてを JSON としてモデリングすることも、単に JSON の `tags` カラムを追加することもできます。以下に両方の例を示します。

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
`update_date` 列をソートや主キーで使用するため、JSON 定義内で `update_date` 列に対する型ヒントを指定しています。これにより、ClickHouse はこの列が null にならないことを認識し、どの `update_date` サブカラムを使うべきか（各型ごとに複数存在し得るため、そうでないと曖昧になります）を判断できます。
:::

このテーブルにデータを挿入し、そこから自動推論されたスキーマを [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 関数と [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 出力フォーマットを使って確認できます。


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"ギガバイト毎秒での数値パース","comments":"ソフトウェアは https://github.com/fastfloat/fast_float および\n  https://github.com/lemire/simple_fastfloat_benchmark/ で入手可能","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"ディスクとネットワークが毎秒ギガバイトを提供する環境において....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouseユーザー","score":"A+","comment":"良い読み物、ClickHouseに適用可能"},"28_03_2025":{"name":"professor X","score":10,"comment":"あまり学ぶことがなかった","updates":[{"name":"professor X","comment":"ウルヴァリンの方がより興味深かった"}]}}}
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

別の方法として、前述のスキーマを用い、JSON の `tags` カラムでこれをモデル化することもできます。一般的にはこちらの方が好まれ、ClickHouse 側で必要となる推論を最小限に抑えられます。

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
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"ギガバイト毎秒の数値パース","comments":"ソフトウェアは https://github.com/fastfloat/fast_float および\n  https://github.com/lemire/simple_fastfloat_benchmark/ で入手可能","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"ディスクとネットワークがギガバイト毎秒を提供する環境において....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouseユーザー","score":"A+","comment":"良い読み物、ClickHouseに適用可能"},"28_03_2025":{"name":"professor X","score":10,"comment":"あまり学ぶことがなかった","updates":[{"name":"professor X","comment":"ウルヴァリンの方がより興味深かった"}]}}}
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
