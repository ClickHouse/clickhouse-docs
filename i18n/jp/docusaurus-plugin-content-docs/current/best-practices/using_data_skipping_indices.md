---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'データスキッピングインデックス'
title: '適切な場面でデータスキッピングインデックスを使用する'
description: 'データスキッピングインデックスをどのようにおよびいつ使用するかを説明するページ'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキップインデックスは、すでにこれまでのベストプラクティス、すなわち型の最適化、適切なプライマリキーの選択、およびマテリアライズドビューの活用が行われたうえで検討すべきものです。スキップインデックスが初めての場合は、[このガイド](/optimize/skipping-indexes) から始めるとよいでしょう。

これらの種類のインデックスは、その仕組みを理解したうえで慎重に使用すれば、クエリ性能を大きく向上させることができます。

ClickHouse は **データスキップインデックス** と呼ばれる強力な仕組みを提供しており、特に特定のフィルター条件に対してプライマリキーが有効でない場合に、クエリ実行中にスキャンされるデータ量を劇的に削減できます。行ベースのセカンダリインデックス（B-tree など）に依存する従来型データベースとは異なり、ClickHouse はカラムストアであり、そのような構造をサポートする形で行位置を保存していません。その代わりにスキップインデックスを使用し、クエリのフィルタ条件に一致しないことが保証されているデータブロックの読み取りを回避します。

スキップインデックスは、データブロックに関するメタデータ（最小値/最大値、値の集合、Bloom filter の表現など）を格納し、クエリ実行中にこのメタデータを使用して、完全にスキップできるデータブロックを判定することで機能します。これらは [MergeTree family](/engines/table-engines/mergetree-family/mergetree) のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、および各インデックス付きブロックのサイズを定義するグラニュラリティを用いて定義されます。これらのインデックスはテーブルデータとともに保存され、クエリフィルタがインデックス式と一致する場合に参照されます。

データスキップインデックスにはいくつかのタイプがあり、それぞれ異なる種類のクエリやデータ分布に適しています。

* **minmax**: ブロックごとに式の最小値と最大値を追跡します。緩やかにソートされたデータに対するレンジクエリに最適です。
* **set(N)**: 各ブロックについて、指定されたサイズ N までの値の集合を追跡します。ブロック内カーディナリティが低いカラムに有効です。
* **bloom&#95;filter**: ブロック内に値が存在するかどうかを確率的に判定し、集合メンバーシップに対する高速なおおよそのフィルタリングを可能にします。「干し草の山から針を探す」ような、ポジティブマッチが必要なクエリの最適化に有効です。
* **tokenbf&#95;v1 / ngrambf&#95;v1**: 文字列内のトークンや文字列シーケンスを検索するために設計された特殊な Bloom filter 変種であり、特にログデータやテキスト検索ユースケースで有用です。

強力ではありますが、スキップインデックスは注意して使用する必要があります。意味のある数のデータブロックを除外できる場合にのみメリットがあり、クエリやデータ構造が適合しない場合は、実際にはオーバーヘッドを生む可能性があります。ブロック内に 1 つでもマッチする値が存在する場合、そのブロック全体を依然として読み取る必要があります。

**効果的なスキップインデックスの利用は、多くの場合、インデックス対象カラムとテーブルのプライマリキーとの強い相関、あるいは類似した値がまとまるようにデータを挿入する方法に依存します。**

一般的に、データスキップインデックスは、適切なプライマリキー設計と型の最適化を行ったうえで適用するのが最適です。特に次のようなケースで有用です。

* 全体としては高いカーディナリティだが、ブロック内では低いカーディナリティを持つカラム。
* 検索上重要となるレアな値（例: エラーコードや特定の ID）。
* 局所的な分布を持つ非プライマリキーカラムでフィルタリングが行われるケース。

常に次のことを行ってください。

1. 実データと現実的なクエリでスキップインデックスをテストします。異なるインデックスタイプやグラニュラリティ値を試してください。
2. send&#95;logs&#95;level=&#39;trace&#39; や `EXPLAIN indexes=1` などのツールを使用して、インデックスの有効性を確認し、その影響を評価します。
3. 常にインデックスのサイズと、それに対するグラニュラリティの影響を評価します。グラニュラリティのサイズを小さくすると、多くの場合、ある程度までは性能が向上し、より多くのグラニュールがフィルタ対象となり、スキャンが必要になるグラニュール数も変化します。しかし、グラニュラリティが低くなるにつれてインデックスサイズが増加するため、性能が低下することもあります。さまざまなグラニュラリティのデータポイントについて、性能とインデックスサイズを計測してください。これは特に Bloom filter インデックスで重要です。

<p />

**適切に使用すれば、スキップインデックスは大きなパフォーマンス向上をもたらしますが、無闇に使用すると不要なコストを増加させる可能性があります。**

Data Skipping Indices についてのより詳細なガイドは[こちら](/sql-reference/statements/alter/skipping-index)を参照してください。


## 例

次のように最適化されたテーブルを考えます。このテーブルには、Stack Overflow のデータが投稿 1 件につき 1 行で格納されています。

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

このテーブルは、投稿タイプや日付でフィルタリングおよび集計を行うクエリ向けに最適化されています。たとえば、2009年以降に公開され、閲覧数が 10,000,000 を超える投稿数を集計したいとします。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

このクエリでは、プライマリインデックスを使用して一部の行（およびグラニュール）を除外できます。しかし、上記の結果および次の `EXPLAIN indexes = 1` が示すように、依然として大部分の行を読み込む必要があります。

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

簡単な分析から、`ViewCount` は予想どおり `CreationDate`（主キー）と相関していることが分かります — 投稿が存在している期間が長いほど、閲覧される機会も増えるためです。


```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

したがって、これはデータスキッピングインデックスとして論理的な選択肢となります。型が数値であることを踏まえると、`minmax` インデックスが適切です。次の `ALTER TABLE` コマンドを使用してインデックスを追加します。まずインデックスを追加し、その後それを「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、テーブルを最初に作成する際に追加することもできます。DDL の一部として `minmax` インデックスを定義したスキーマは次のとおりです。

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

次のアニメーションは、サンプルテーブルに対して minmax スキップインデックスがどのように構築されるかを示しています。テーブル内の各行ブロック（granule）ごとに、`ViewCount` の最小値と最大値を追跡します。

<Image img={building_skipping_indices} size="lg" alt="スキッピングインデックスの構築" />

先ほどのクエリを再度実行すると、大幅なパフォーマンス向上が確認できます。スキャンされる行数が減少している点に注目してください。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行が結果セットに含まれています。経過時間: 0.012秒。処理された行数: 39.11千行、321.39 KB (3.40百万行/秒、27.93 MB/秒)
```

`EXPLAIN indexes = 1` により、インデックスが利用されていることを確認できます。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ 式 ((Project names + Projection))                                 │
│   集約処理                                                        │
│     式 (GROUP BY 前)                                              │
│       式                                                           │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         インデックス:                                             │
│           MinMax                                                   │
│             キー:                                                 │
│               CreationDate                                         │
│             条件: (CreationDate in (&#39;1230768000&#39;, +Inf))           │
│             パーツ: 123/128                                       │
│             グラニュール: 8513/8545                                │
│           Partition                                                │
│             キー:                                                 │
│               toYear(CreationDate)                                 │
│             条件: (toYear(CreationDate) in [2009, +Inf))           │
│             パーツ: 123/123                                       │
│             グラニュール: 8513/8513                                │
│           PrimaryKey                                               │
│             キー:                                                 │
│               toDate(CreationDate)                                 │
│             条件: (toDate(CreationDate) in [14245, +Inf))          │
│             パーツ: 123/123                                       │
│             グラニュール: 8513/8513                                │
│           Skip                                                     │
│             名前: view&#95;count&#95;idx                               │
│             説明: minmax GRANULARITY 1                            │
│             パーツ: 5/123                                         │
│             グラニュール: 23/8513                                  │
└────────────────────────────────────────────────────────────────────┘

29 行の結果が返されました。経過時間: 0.211 秒。

```

以下のアニメーションでは、サンプルクエリの`ViewCount` > 10,000,000という条件に一致する可能性のないすべての行ブロックを、minmaxスキッピングインデックスがどのように除外するかを示しています:

<Image img={using_skipping_indices} size="lg" alt="スキッピングインデックスの使用"/>
```


## 関連ドキュメント {#related-docs}
- [データスキッピングインデックスガイド](/optimize/skipping-indexes)
- [データスキッピングインデックスの例](/optimize/skipping-indexes/examples)
- [データスキッピングインデックスの操作](/sql-reference/statements/alter/skipping-index)
- [システムテーブル情報](/operations/system-tables/data_skipping_indices)
