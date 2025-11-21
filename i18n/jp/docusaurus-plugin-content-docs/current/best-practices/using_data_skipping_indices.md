---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'データスキッピングインデックス'
title: '適切な場面でデータスキッピングインデックスを使用する'
description: 'データスキッピングインデックスをどのように、どのような場合に使用すべきかを説明するページ'
keywords: ['データスキッピングインデックス', 'スキップインデックス']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、すでにこれまでのベストプラクティス（型の最適化、適切な主キーの選択、マテリアライズドビューの活用）が守られている場合に検討するべきです。スキッピングインデックスが初めての場合は、[このガイド](/optimize/skipping-indexes) から読み始めるとよいでしょう。

これらのインデックスは、その仕組みを理解したうえで慎重に用いることで、クエリ性能の向上に役立てることができます。

ClickHouse は **データスキッピングインデックス** と呼ばれる強力なメカニズムを提供しており、クエリ実行中にスキャンされるデータ量を劇的に削減できます。特に、特定のフィルタ条件に対して主キーが有効に働かない場合に有用です。行ベースのセカンダリインデックス（B-tree など）に依存する従来のデータベースとは異なり、ClickHouse はカラムストアであり、そのような構造を前提とした形で行位置を保持していません。その代わりに、ClickHouse はスキップインデックスを使用し、クエリのフィルタ条件に一致しないことが保証されているデータブロックの読み取りを回避します。

スキップインデックスは、データブロックに関するメタデータ（最小値 / 最大値、値の集合、Bloom filter による表現など）を保存し、クエリ実行時にこのメタデータを利用して、完全にスキップできるデータブロックを判定することで動作します。これらは [MergeTree ファミリー](/engines/table-engines/mergetree-family/mergetree) のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、および各インデックス対象ブロックのサイズを定義するグラニュラリティによって定義されます。これらのインデックスはテーブルデータと共に格納され、クエリのフィルタがインデックス式に一致する場合に参照されます。

データスキッピングインデックスには、クエリの種類やデータ分布に応じて適した、いくつかのタイプがあります。

* **minmax**: ブロックごとに、式の最小値と最大値を追跡します。緩やかにソートされたデータに対する範囲クエリに最適です。
* **set(N)**: 各ブロックに対して、指定されたサイズ N までの値の集合を追跡します。ブロック内カーディナリティが低いカラムに有効です。
* **bloom&#95;filter**: 値がブロック内に存在するかどうかを確率的に判定し、集合メンバーシップに対する高速なおおよそのフィルタリングを可能にします。「干し草の山から針を探す」ような、少数の一致が必要となるクエリの最適化に有効です。
* **tokenbf&#95;v1 / ngrambf&#95;v1**: 文字列内のトークンや文字シーケンスを検索するために設計された Bloom filter の特殊なバリアントであり、特にログデータやテキスト検索のユースケースで有用です。

強力ではありますが、スキップインデックスは慎重に使用する必要があります。意味のある数のデータブロックを排除できる場合にのみ効果があり、クエリやデータ構造が適合しないと、逆にオーバーヘッドを招くことがあります。ブロック内に 1 つでも一致する値が存在する場合、そのブロック全体を読み取る必要があります。

**スキップインデックスを効果的に利用するには、多くの場合、インデックス対象カラムとテーブルの主キーとの間に強い相関があること、あるいは類似した値をまとめて挿入することが重要です。**

一般に、データスキッピングインデックスは、適切な主キー設計と型の最適化が行われた後に適用するのが最適です。特に次のような場合に有用です。

* 全体としてはカーディナリティが高いが、ブロック内カーディナリティが低いカラム。
* 検索上重要なレアな値（例：エラーコード、特定の ID）。
* 非主キー列に対して、局所的な分布を持つフィルタが行われるケース。

常に次の点を実施してください。

1. 実データと現実的なクエリでスキップインデックスをテストします。異なるインデックスタイプやグラニュラリティ値を試してください。
2. send&#95;logs&#95;level=&#39;trace&#39; や `EXPLAIN indexes=1` のようなツールを用いてインデックスの効果を確認し、その影響を評価します。
3. 常にインデックスのサイズと、それがグラニュラリティによってどのような影響を受けるかを評価します。グラニュラリティサイズを小さくすると、多くの場合、特定の点までは性能が向上し、フィルタされスキャンされる必要のあるグラニュールが増えます。しかし、グラニュラリティを小さくするとインデックスサイズも増大するため、性能が低下する可能性もあります。さまざまなグラニュラリティ設定における性能とインデックスサイズを測定してください。これは特に Bloom filter インデックスで重要になります。

<p />

**適切に使用された場合、スキップインデックスは大きな性能向上をもたらしますが、無分別に使用すると不要なコストを増やすことになり得ます。**

データスキッピングインデックスに関するより詳細なガイドについては [こちら](/sql-reference/statements/alter/skipping-index) を参照してください。


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

このテーブルは、投稿タイプと日付でフィルタリングおよび集計を行うクエリに最適化されています。2009年以降に公開された閲覧数が10,000,000を超える投稿の数をカウントしたいとします。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

このクエリは、プライマリインデックスを使用して一部の行(およびグラニュール)を除外できます。しかし、上記のレスポンスと以下の`EXPLAIN indexes = 1`が示すように、大部分の行は依然として読み取る必要があります。

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

簡単な分析により、予想通り`ViewCount`は`CreationDate`(プライマリキー)と相関していることがわかります。投稿が存在する期間が長いほど、閲覧される機会が多くなります。


```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

したがって、これはデータスキップインデックスとして妥当な選択肢となります。型が数値であることを踏まえると、`minmax` インデックスが適切です。次の `ALTER TABLE` コマンドを使用してインデックスを追加します。まずインデックスを追加し、その後インデックスを「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、テーブルの作成時に追加することもできます。`minmax` インデックスを DDL の一部として定義したスキーマは次のとおりです。

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

次のアニメーションは、例のテーブルに対して、テーブル内の各行ブロック（グラニュール）ごとに `ViewCount` の最小値と最大値を追跡することで、minmax スキッピングインデックスがどのように構築されるかを示しています：

<Image img={building_skipping_indices} size="lg" alt="スキッピングインデックスの構築" />

先ほどのクエリを再度実行すると、大幅なパフォーマンス向上が確認できます。スキャンされた行数が少なくなっていることに注目してください：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行が結果セットに含まれています。経過時間: 0.012秒。処理された行数: 39.11千行、321.39 KB (3.40百万行/秒、27.93 MB/秒)
```

`EXPLAIN indexes = 1` を実行すると、インデックスが使用されていることを確認できます。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ 式 ((Project names + Projection))                                  │
│   集約                                                             │
│     式 (GROUP BY 前)                                               │
│       式                                                           │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         インデックス:                                              │
│           MinMax                                                   │
│             キー:                                                  │
│               CreationDate                                         │
│             条件: (CreationDate in (&#39;1230768000&#39;, +Inf))          │
│             パーツ: 123/128                                        │
│             グラニュール: 8513/8545                                │
│           パーティション                                           │
│             キー:                                                  │
│               toYear(CreationDate)                                 │
│             条件: (toYear(CreationDate) in [2009, +Inf))           │
│             パーツ: 123/123                                        │
│             グラニュール: 8513/8513                                │
│           プライマリキー                                           │
│             キー:                                                  │
│               toDate(CreationDate)                                 │
│             条件: (toDate(CreationDate) in [14245, +Inf))          │
│             パーツ: 123/123                                        │
│             グラニュール: 8513/8513                                │
│           スキップ                                                 │
│             名前: view&#95;count&#95;idx                               │
│             説明: minmax GRANULARITY 1                             │
│             パーツ: 5/123                                          │
│             グラニュール: 23/8513                                  │
└────────────────────────────────────────────────────────────────────┘

29 行が返されました。経過時間: 0.211 秒。

```

また、minmaxスキッピングインデックスが、サンプルクエリの`ViewCount` > 10,000,000という条件に一致する可能性のないすべての行ブロックを除外する様子をアニメーションで示します:

<Image img={using_skipping_indices} size="lg" alt="スキッピングインデックスの使用"/>
```


## 関連ドキュメント {#related-docs}

- [データスキッピングインデックスガイド](/optimize/skipping-indexes)
- [データスキッピングインデックスの例](/optimize/skipping-indexes/examples)
- [データスキッピングインデックスの操作](/sql-reference/statements/alter/skipping-index)
- [システムテーブル情報](/operations/system-tables/data_skipping_indices)
