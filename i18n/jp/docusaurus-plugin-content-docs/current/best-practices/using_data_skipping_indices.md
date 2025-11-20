---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'データスキッピングインデックス'
title: '適切な場面でデータスキッピングインデックスを活用する'
description: 'データスキッピングインデックスの使い方と有効な利用シーンについて解説するページ'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、すでに前述のベストプラクティス（型の最適化、適切な主キーの選択、マテリアライズドビューの活用）が守られている場合に検討すべきものです。スキップインデックスを初めて利用する場合は、[このガイド](/optimize/skipping-indexes) から始めるとよいでしょう。

これらの種類のインデックスは、その仕組みを理解したうえで慎重に使用すれば、クエリ性能を向上させるために利用できます。

ClickHouse は **data skipping indices** と呼ばれる強力な仕組みを提供しており、クエリ実行中にスキャンされるデータ量を劇的に削減できます。特に、主キーが特定のフィルター条件に対して有効でない場合に効果的です。行ベースのセカンダリインデックス（B-tree など）に依存する従来のデータベースとは異なり、ClickHouse はカラムストアであり、そのような構造をサポートできる形で行の位置情報を保持していません。その代わりに、スキップインデックスを利用して、クエリのフィルタ条件に一致しないことが保証されているデータブロックの読み取りを回避します。

スキップインデックスは、データブロックに関するメタデータ（最小値/最大値、値の集合、Bloom フィルター表現など）を保存し、クエリ実行時にこのメタデータを利用して、完全にスキップできるデータブロックを判定します。これらは [MergeTree ファミリー](/engines/table-engines/mergetree-family/mergetree) のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、および各インデックス付きブロックのサイズを定義する granularity を用いて定義されます。これらのインデックスはテーブルデータと一緒に保存され、クエリのフィルタがインデックス式と一致したときに参照されます。

データスキッピングインデックスにはいくつかのタイプがあり、それぞれ異なる種類のクエリやデータ分布に適しています。

* **minmax**: 各ブロックごとに式の最小値と最大値を追跡します。粗くソートされたデータに対する範囲クエリに最適です。
* **set(N)**: 各ブロックについて、指定されたサイズ N までの値の集合を追跡します。ブロック内のカーディナリティが低いカラムに効果的です。
* **bloom&#95;filter**: ある値がブロック内に存在するかを確率的に判定し、集合メンバーシップに対する高速なおおよそのフィルタリングを可能にします。「干し草の山から針を探す」ような、ヒット件数が少ない検索クエリの最適化に有効です。
* **tokenbf&#95;v1 / ngrambf&#95;v1**: 文字列中のトークンや文字シーケンスを検索するために設計された、特化型の Bloom フィルターです。特にログデータやテキスト検索のユースケースに有用です。

強力ではありますが、スキップインデックスは慎重に使用する必要があります。意味のある数のデータブロックを排除できる場合にのみメリットがあり、クエリやデータ構造が適合していないと、かえってオーバーヘッドを増やしてしまうことがあります。単一の一致する値がブロック内に存在するだけでも、そのブロック全体を読み込む必要があります。

**効果的なスキップインデックスの利用は、多くの場合、インデックス対象カラムとテーブルの主キーとの間に強い相関があること、あるいは似た値がまとまるような形でデータを挿入することに依存します。**

一般的に、データスキッピングインデックスは、適切な主キー設計と型の最適化が行われた後に適用するのが最適です。特に有用なのは次のようなケースです。

* 全体としてはカーディナリティが高いが、ブロック内のカーディナリティが低いカラム。
* 検索上重要となるまれな値（例: エラーコード、特定の ID）。
* 局所的な分布を持つ非主キー列に対してフィルタリングが行われるケース。

常に次を実施してください。

1. 実データと現実的なクエリでスキップインデックスをテストします。異なるインデックスタイプや granularity の値を試してください。
2. send&#95;logs&#95;level=&#39;trace&#39; や `EXPLAIN indexes=1` などのツールを使って、インデックスの有効性を確認します。
3. インデックスのサイズと、それが granularity によってどのように影響を受けるかを常に評価します。granularity のサイズを小さくすると、多くの場合、より多くの granule がフィルタリングされスキャン不要になるため、ある程度までは性能が向上します。しかし、granularity を下げるとインデックスサイズが増加するため、性能が低下することもあります。さまざまな granularity の設定値に対して、性能とインデックスサイズを測定してください。これは特に Bloom フィルターインデックスで重要です。

<p />

**適切に使用すれば、スキップインデックスは大きな性能向上をもたらしますが、無計画に使用すると不要なコストを増やすことになります。**

Data Skipping Indices のより詳細なガイドについては [こちら](/sql-reference/statements/alter/skipping-index) を参照してください。


## 例 {#example}

以下の最適化されたテーブルを考えます。このテーブルには、投稿ごとに1行のStack Overflowデータが含まれています。

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

このテーブルは、投稿タイプと日付でフィルタリングおよび集計を行うクエリに最適化されています。2009年以降に公開された、閲覧数が10,000,000を超える投稿の数をカウントしたいとします。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

このクエリは、プライマリインデックスを使用して一部の行（およびグラニュール）を除外できます。しかし、上記のレスポンスと以下の`EXPLAIN indexes = 1`が示すように、大部分の行は依然として読み取る必要があります。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
LIMIT 1

┌─explain──────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                        │
│   Limit (preliminary LIMIT (without OFFSET))                     │
│     Aggregating                                                  │
│       Expression (Before GROUP BY)                               │
│         Expression                                               │
│           ReadFromMergeTree (stackoverflow.posts)                │
│           Indexes:                                               │
│             MinMax                                               │
│               Keys:                                              │
│                 CreationDate                                     │
│               Condition: (CreationDate in ('1230768000', +Inf))  │
│               Parts: 123/128                                     │
│               Granules: 8513/8545                                │
│             Partition                                            │
│               Keys:                                              │
│                 toYear(CreationDate)                             │
│               Condition: (toYear(CreationDate) in [2009, +Inf))  │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
│             PrimaryKey                                           │
│               Keys:                                              │
│                 toDate(CreationDate)                             │
│               Condition: (toDate(CreationDate) in [14245, +Inf)) │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
└──────────────────────────────────────────────────────────────────┘

25 rows in set. Elapsed: 0.070 sec.
```

簡単な分析により、予想通り`ViewCount`は`CreationDate`（プライマリキー）と相関していることがわかります。投稿が存在する期間が長いほど、閲覧される機会も多くなります。


```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

したがって、これはデータスキップインデックスとして理にかなった選択肢になります。型が数値であることを踏まえると、`minmax` インデックスを用いるのが適切です。次の `ALTER TABLE` コマンドでインデックスを追加します。まずインデックスを追加し、その後それを「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、テーブルの初回作成時に追加しておくこともできます。`minmax` インデックスを DDL の一部として定義したスキーマは次のとおりです。

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC'),
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --インデックスはここ
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

次のアニメーションは、例のテーブルにおいて、テーブル内の各行ブロック（granule）ごとに `ViewCount` の最小値と最大値を追跡することで、minmax スキッピングインデックスがどのように構築されるかを示しています。

<Image img={building_skipping_indices} size="lg" alt="スキッピングインデックスの構築" />

先ほどのクエリを再実行すると、パフォーマンスが大きく向上していることがわかります。スキャンされる行数が減っている点に注目してください。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行が結果セットに含まれています。経過時間: 0.012秒。処理された行数: 39.11千行、321.39 KB (3.40百万行/秒、27.93 MB/秒)
```

`EXPLAIN indexes = 1` によって、インデックスが使用されていることを確認できます。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│     Expression (Before GROUP BY)                                   │
│       Expression                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         Indexes:                                                   │
│           MinMax                                                   │
│             Keys:                                                  │
│               CreationDate                                         │
│             Condition: (CreationDate in (&#39;1230768000&#39;, +Inf))      │
│             Parts: 123/128                                         │
│             Granules: 8513/8545                                    │
│           Partition                                                │
│             Keys:                                                  │
│               toYear(CreationDate)                                 │
│             Condition: (toYear(CreationDate) in [2009, +Inf))      │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           PrimaryKey                                               │
│             Keys:                                                  │
│               toDate(CreationDate)                                 │
│             Condition: (toDate(CreationDate) in [14245, +Inf))     │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           Skip                                                     │
│             Name: view&#95;count&#95;idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 行が結果セットに含まれています。経過時間: 0.211 秒。

```

また、minmaxスキッピングインデックスが、サンプルクエリの`ViewCount` > 10,000,000という条件に一致する可能性のないすべての行ブロックを除外する様子をアニメーションで示します:

<Image img={using_skipping_indices} size="lg" alt="スキッピングインデックスの使用"/>
```


## 関連ドキュメント {#related-docs}

- [データスキッピングインデックスガイド](/optimize/skipping-indexes)
- [データスキッピングインデックスの例](/optimize/skipping-indexes/examples)
- [データスキッピングインデックスの操作](/sql-reference/statements/alter/skipping-index)
- [システムテーブル情報](/operations/system-tables/data_skipping_indices)
