---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'Using JSON'
title: '適切な場面で JSON を使用する'
description: 'JSON をいつ使用すべきかを説明するページ'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

ClickHouse には、半構造化データや動的なデータ向けに設計されたネイティブな JSON 列型が用意されています。**これは列型であって、データ形式ではない**ことを明確にしておくことが重要です。JSON を文字列として、あるいは [JSONEachRow](/interfaces/formats/JSONEachRow) のようなサポートされているフォーマット経由で ClickHouse に挿入することはできますが、それだけでは JSON 列型を使用していることにはなりません。JSON 型は、データの構造自体が動的な場合にのみ使用すべきであり、単に JSON 形式のデータを保存しているというだけの理由で使用すべきではありません。



## JSON型を使用する場合 {#when-to-use-the-json-type}

以下のような場合にJSON型を使用します：

- 時間の経過とともに変化する可能性のある**予測不可能なキー**を持つ
- **型が変化する値**を含む（例：あるパスが文字列を含む場合もあれば、数値を含む場合もある）
- 厳密な型付けが現実的でない場合にスキーマの柔軟性が必要

データ構造が既知で一貫している場合、データがJSON形式であってもJSON型が必要になることはほとんどありません。具体的には、データが以下のような場合です：

- **既知のキーを持つフラットな構造**：標準的なカラム型（例：String）を使用します
- **予測可能なネスト構造**：これらの構造にはTuple、Array、またはNested型を使用します
- **型が変化する予測可能な構造**：代わりにDynamic型またはVariant型の使用を検討します

アプローチを組み合わせることも可能です。例えば、予測可能なトップレベルのフィールドには静的カラムを使用し、ペイロードの動的なセクションには単一のJSONカラムを使用できます。


## JSONを使用する際の考慮事項とヒント {#considerations-and-tips-for-using-json}

JSON型は、パスをサブカラムに平坦化することで効率的なカラムナストレージを実現します。しかし、柔軟性には責任が伴います。効果的に使用するには:

- **パスの型を指定する** [カラム定義でのヒント](/sql-reference/data-types/newjson)を使用して既知のサブカラムの型を指定し、不要な型推論を回避します。
- **パスをスキップする** 値が不要な場合は、[SKIPおよびSKIP REGEXP](/sql-reference/data-types/newjson)を使用してストレージを削減し、パフォーマンスを向上させます。
- **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)を高く設定しすぎない**—大きな値はリソース消費を増加させ、効率を低下させます。経験則として、10,000未満に保つことを推奨します。

:::note 型ヒント
型ヒントは、不要な型推論を回避する手段以上のものを提供します—ストレージと処理の間接参照を完全に排除します。型ヒントを持つJSONパスは、常に従来のカラムと同様に格納され、クエリ時に[**識別子カラム**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)や動的解決の必要性を回避します。つまり、適切に定義された型ヒントを使用すると、ネストされたJSONフィールドは、最初からトップレベルフィールドとしてモデル化されていた場合と同じパフォーマンスと効率を実現します。その結果、ほぼ一貫性のあるデータセットでありながらJSONの柔軟性の恩恵を受ける場合、型ヒントはスキーマやインジェストパイプラインを再構築することなくパフォーマンスを維持する便利な方法を提供します。
:::


## 高度な機能 {#advanced-features}

- JSON列は他の列と同様に**プライマリキーで使用できます**。サブカラムに対してコーデックを指定することはできません。
- [`JSONAllPathsWithTypes()`および`JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions)などの関数によるイントロスペクションをサポートしています。
- `.^`構文を使用してネストされたサブオブジェクトを読み取ることができます。
- クエリ構文は標準SQLと異なる場合があり、ネストされたフィールドに対して特別なキャストや演算子が必要になることがあります。

詳細については、[ClickHouse JSONドキュメント](/sql-reference/data-types/newjson)を参照するか、ブログ記事[ClickHouseの新しい強力なJSONデータ型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)をご覧ください。


## 例 {#examples}

以下のJSONサンプルを考えてみましょう。これは[Python PyPIデータセット](https://clickpy.clickhouse.com/)の1行を表しています：

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

このスキーマが静的で、型を明確に定義できると仮定しましょう。データがNDJSON形式(1行につき1つのJSON)であっても、このようなスキーマにJSON型を使用する必要はありません。従来の型でスキーマを定義するだけで十分です。

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

250万件の学術論文を含む[arXivデータセット](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)を考えてみましょう。NDJSONとして配布されるこのデータセットの各行は、公開された学術論文を表しています。以下に行の例を示します：

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
  "authors_parsed": [["Lemire", "Daniel", ""]]
}
```

ここでのJSONは入れ子構造を持つ複雑なものですが、予測可能です。フィールドの数と型は変わりません。この例ではJSON型を使用することもできますが、[Tuple](/sql-reference/data-types/tuple)型と[Nested](/sql-reference/data-types/nested-data-structures/nested)型を使用して構造を明示的に定義することもできます：

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

同様に、データをJSONとして挿入できます：


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

`tags` という別のカラムが追加されたとします。これが単なる文字列のリストであれば `Array(String)` としてモデリングできますが、ユーザーが混在した型を持つ任意のタグ構造を追加できると仮定しましょう（`score` が文字列または整数になり得る点に注意してください）。変更後の JSON ドキュメントは次のとおりです。

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "毎秒ギガバイトの数値パース処理",
 "comments": "ソフトウェアは https://github.com/fastfloat/fast_float および\n  https://github.com/lemire/simple_fastfloat_benchmark/ で入手可能",
 "journal-ref": "Software: Practice and Experience 51 (8), 2021",
 "doi": "10.1002/spe.2984",
 "report-no": null,
 "categories": "cs.DS cs.MS",
 "license": "http://creativecommons.org/licenses/by/4.0/",
 "abstract": "ディスクとネットワークが毎秒ギガバイトのスループットを提供する環境において....\n",
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
     "name": "ClickHouseユーザー",
     "score": "A+",
     "comment": "有益な内容で、ClickHouseに適用可能",
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "あまり得るものがなかった",
     "updates": [
       {
         "name": "professor X",
         "comment": "Wolverineの方がより興味深かった",
       }
     ]
   }
 }
}
```

この場合、arXiv のドキュメント全体を JSON でモデリングすることも、単に JSON 型の `tags` 列を追加することもできます。以下に両方の例を示します。

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
`update_date` 列を並び替え/主キーに使用するため、JSON 定義内でこの列に型ヒントを指定しています。これにより ClickHouse はこの列が null にならないことを認識し、どの `update_date` サブカラムを使用すべきかを判断できます（型ごとに複数存在する場合があるため、型ヒントがないとあいまいになります）。
:::

このテーブルにデータを挿入し、その後に推論されたスキーマを [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 関数と [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 出力フォーマットを使って確認できます。


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"毎秒ギガバイトの数値パース","comments":"ソフトウェアは https://github.com/fastfloat/fast_float および\n  https://github.com/lemire/simple_fastfloat_benchmark/ で入手可能","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"ディスクとネットワークが毎秒ギガバイトを提供する環境において....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouseユーザー","score":"A+","comment":"有益な内容で、ClickHouseに適用可能"},"28_03_2025":{"name":"X教授","score":10,"comment":"得られた知見は少なかった","updates":[{"name":"X教授","comment":"Wolverineの方がより興味深かった"}]}}}
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

別の方法として、先ほどのスキーマと JSON の `tags` カラムを使ってこれをモデリングすることもできます。こちらの方が一般的に好ましく、ClickHouse による推論を最小限に抑えられます。

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
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"毎秒ギガバイトの数値パース","comments":"ソフトウェアは https://github.com/fastfloat/fast_float および\n  https://github.com/lemire/simple_fastfloat_benchmark/ で入手可能","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"ディスクとネットワークが毎秒ギガバイトを提供する環境において....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouseユーザー","score":"A+","comment":"有益な内容で、ClickHouseに適用可能"},"28_03_2025":{"name":"X教授","score":10,"comment":"得られた知見は少ない","updates":[{"name":"X教授","comment":"ウルヴァリンの方がより興味深いと判断"}]}}}
```


これで、サブカラム `tags` の型を推論できるようになりました。

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
