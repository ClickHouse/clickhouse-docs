---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'データスキッピングインデックス'
title: '適切な場所でデータスキッピングインデックスを使用する'
description: 'データスキッピングインデックスの使用方法とタイミングを説明するページ'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、以前のベストプラクティスに従った後に検討する必要があります。つまり、型が最適化され、適切なプライマリキーが選択され、マテリアライズドビューが活用されている場合です。スキッピングインデックスが初めての場合は、[このガイド](/optimize/skipping-indexes)から始めるのが良いでしょう。

これらのタイプのインデックスは、その動作方法を理解して慎重に使用すれば、クエリパフォーマンスを向上させるために使用できます。

ClickHouseは、**データスキッピングインデックス**と呼ばれる強力なメカニズムを提供しています。これは、クエリ実行中にスキャンされるデータ量を劇的に削減できます - 特に、特定のフィルター条件に対してプライマリキーが役に立たない場合です。行ベースのセカンダリインデックス(B-treeなど)に依存する従来のデータベースとは異なり、ClickHouseはカラムストアであり、そのような構造をサポートする方法で行の位置を保存しません。代わりに、スキップインデックスを使用します。これは、クエリのフィルタリング条件に一致しないことが保証されているデータブロックの読み取りを回避するのに役立ちます。

スキップインデックスは、データブロックに関するメタデータ(最小値/最大値、値のセット、Bloomフィルター表現など)を保存し、クエリ実行中にこのメタデータを使用して、完全にスキップできるデータブロックを決定することで機能します。これらは[MergeTreeファミリー](/engines/table-engines/mergetree-family/mergetree)のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、および各インデックス付きブロックのサイズを定義する粒度tを使用して定義されます。これらのインデックスはテーブルデータと一緒に保存され、クエリフィルターがインデックス式と一致する場合に参照されます。

データスキッピングインデックスにはいくつかのタイプがあり、それぞれ異なるタイプのクエリとデータ分布に適しています:

* **minmax**: ブロックごとに式の最小値と最大値を追跡します。緩くソートされたデータの範囲クエリに最適です。
* **set(N)**: 各ブロックに対して指定されたサイズNまでの値のセットを追跡します。ブロックごとにカーディナリティが低い列に効果的です。
* **bloom_filter**: 値がブロックに存在するかどうかを確率的に判定し、セットメンバーシップの高速な近似フィルタリングを可能にします。ポジティブマッチが必要な「干し草の中の針」を探すクエリの最適化に効果的です。
* **tokenbf_v1 / ngrambf_v1**: 文字列内のトークンまたは文字シーケンスを検索するために設計された特殊なBloomフィルターバリアント - ログデータやテキスト検索のユースケースに特に役立ちます。

強力ですが、スキップインデックスは慎重に使用する必要があります。意味のある数のデータブロックを排除する場合にのみメリットがあり、クエリまたはデータ構造が一致しない場合は実際にオーバーヘッドが発生する可能性があります。ブロックに一致する値が1つでも存在する場合、そのブロック全体をまだ読み取る必要があります。

**効果的なスキップインデックスの使用は、多くの場合、インデックス付き列とテーブルのプライマリキーとの強い相関、または類似の値をグループ化する方法でデータを挿入することに依存します。**

一般的に、データスキッピングインデックスは、適切なプライマリキー設計と型の最適化を確保した後に適用するのが最適です。これらは特に以下の場合に役立ちます:

* 全体的なカーディナリティは高いが、ブロック内のカーディナリティは低い列
* 検索に重要なレアな値(例: エラーコード、特定のID)
* 局所的な分布を持つ非プライマリキー列でフィルタリングが行われる場合

常に:

1. リアルなクエリで実際のデータでスキップインデックスをテストします。さまざまなインデックスタイプと粒度の値を試してください。
2. `send_logs_level='trace'`や`EXPLAIN indexes=1`などのツールを使用して、インデックスの効果を確認し、影響を評価します。
3. インデックスのサイズと粒度による影響を常に評価します。粒度サイズを小さくすると、パフォーマンスがある点まで向上し、フィルタリングされてスキャンする必要がある粒度が増えます。ただし、粒度が低くなるとインデックスサイズが増加するため、パフォーマンスも低下する可能性があります。さまざまな粒度データポイントのパフォーマンスとインデックスサイズを測定してください。これは、bloomフィルターインデックスで特に関連しています。

<p/>
**適切に使用すると、スキップインデックスは大幅なパフォーマンスの向上をもたらすことができます - 盲目的に使用すると、不必要なコストが追加される可能性があります。**

データスキッピングインデックスに関するより詳細なガイドについては、[こちら](/sql-reference/statements/alter/skipping-index)を参照してください。

## 例 \\{#example\\}

次の最適化されたテーブルを考えてみましょう。これには、投稿ごとに1行のStack Overflowデータが含まれています。

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

このテーブルは、投稿タイプと日付でフィルタリングおよび集計するクエリに最適化されています。2009年以降に公開された、10,000,000回以上の閲覧数を持つ投稿の数をカウントしたいとします。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

このクエリは、プライマリインデックスを使用して一部の行(および粒度)を除外できます。ただし、上記の応答と次の`EXPLAIN indexes = 1`が示すように、大部分の行はまだ読み取る必要があります:

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

簡単な分析により、`ViewCount`が予想どおり`CreationDate`(プライマリキー)と相関していることがわかります - 投稿が存在する期間が長いほど、閲覧される時間が長くなります。

```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

したがって、これはデータスキッピングインデックスの論理的な選択肢です。数値型であるため、minmaxインデックスが理にかなっています。次の`ALTER TABLE`コマンドを使用してインデックスを追加します - 最初に追加してから、「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、最初のテーブル作成時にも追加できました。DDLの一部としてminmaxインデックスが定義されたスキーマ:

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
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --ここにインデックス
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

次のアニメーションは、サンプルテーブルのminmaxスキッピングインデックスがどのように構築されるかを示しています。テーブル内の行の各ブロック(粒度)の最小および最大`ViewCount`値を追跡しています:

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

以前のクエリを繰り返すと、大幅なパフォーマンスの向上が見られます。スキャンされた行数の減少に注意してください:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes = 1`は、インデックスの使用を確認します。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

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
│             Condition: (CreationDate in ('1230768000', +Inf))      │
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
│             Name: view_count_idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 rows in set. Elapsed: 0.211 sec.
```

また、minmaxスキッピングインデックスが、サンプルクエリの`ViewCount` > 10,000,000述語に一致する可能性のないすべての行ブロックをどのようにプルーニングするかを示すアニメーションも示します:

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>

## 関連ドキュメント \\{#related-docs\\}
- [データスキッピングインデックスガイド](/optimize/skipping-indexes)
- [データスキッピングインデックスの例](/optimize/skipping-indexes/examples)
- [データスキッピングインデックスの操作](/sql-reference/statements/alter/skipping-index)
- [システムテーブル情報](/operations/system-tables/data_skipping_indices)
