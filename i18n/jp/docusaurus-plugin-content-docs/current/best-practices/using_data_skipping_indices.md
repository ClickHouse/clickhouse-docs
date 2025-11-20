---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'データスキップインデックス'
title: '適切な場面でデータスキップインデックスを使用する'
description: 'データスキップインデックスをいつ、どのように使用すべきかを説明するページ'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、型の最適化、適切なプライマリキーの選択、マテリアライズドビューの活用といった、これまでのベストプラクティスを実践した後に検討すべきものです。スキッピングインデックスを初めて使用する場合は、[このガイド](/optimize/skipping-indexes)から始めることをお勧めします。

これらのインデックスは、その動作原理を理解した上で慎重に使用することで、クエリパフォーマンスを大幅に向上させることができます。

ClickHouseは**データスキッピングインデックス**と呼ばれる強力な機能を提供しており、クエリ実行時にスキャンするデータ量を劇的に削減できます。特に、プライマリキーが特定のフィルタ条件に対して有効でない場合に威力を発揮します。行ベースのセカンダリインデックス(B-treeなど)に依存する従来のデータベースとは異なり、ClickHouseはカラムストア型であり、そのような構造をサポートする形式で行の位置情報を保存しません。代わりに、スキップインデックスを使用して、クエリのフィルタリング条件に一致しないことが確実なデータブロックの読み取りを回避します。

スキップインデックスは、データブロックに関するメタデータ(最小値/最大値、値のセット、Bloomフィルタ表現など)を保存し、クエリ実行時にこのメタデータを利用して、完全にスキップできるデータブロックを判断します。これらは[MergeTreeファミリー](/engines/table-engines/mergetree-family/mergetree)のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、および各インデックスブロックのサイズを定義する粒度(granularity)を使用して定義されます。これらのインデックスはテーブルデータと共に保存され、クエリフィルタがインデックス式と一致する場合に参照されます。

データスキッピングインデックスにはいくつかのタイプがあり、それぞれ異なるクエリやデータ分布に適しています。

* **minmax**: ブロックごとに式の最小値と最大値を追跡します。緩やかにソートされたデータに対する範囲クエリに最適です。
* **set(N)**: 各ブロックに対して指定されたサイズNまでの値のセットを追跡します。ブロックごとのカーディナリティが低いカラムで効果的です。
* **bloom&#95;filter**: 値がブロックに存在するかどうかを確率的に判断し、集合メンバーシップの高速な近似フィルタリングを可能にします。正の一致が必要な「干し草の中から針を探す」ようなクエリの最適化に効果的です。
* **tokenbf&#95;v1 / ngrambf&#95;v1**: 文字列内のトークンや文字シーケンスを検索するために設計された特殊なBloomフィルタの変種です。ログデータやテキスト検索のユースケースに特に有用です。

強力な機能ではありますが、スキップインデックスは慎重に使用する必要があります。これらは、相当数のデータブロックを排除できる場合にのみ効果を発揮し、クエリやデータ構造が適合しない場合は、逆にオーバーヘッドを引き起こす可能性があります。ブロック内に一致する値が1つでも存在する場合、そのブロック全体を読み取る必要があります。

**効果的なスキップインデックスの使用は、多くの場合、インデックス対象カラムとテーブルのプライマリキーとの強い相関関係、または類似した値をまとめてグループ化する形でのデータ挿入に依存します。**

一般的に、データスキッピングインデックスは、適切なプライマリキー設計と型の最適化を確保した後に適用するのが最適です。特に以下のような場合に有用です。

* 全体的なカーディナリティは高いが、ブロック内のカーディナリティが低いカラム
* 検索において重要な稀な値(エラーコード、特定のIDなど)
* 局所的な分布を持つ非プライマリキーカラムでフィルタリングが発生する場合

常に以下を実行してください。

1. 実際のデータと現実的なクエリでスキップインデックスをテストします。異なるインデックスタイプと粒度の値を試してください。
2. send&#95;logs&#95;level=&#39;trace&#39;や`EXPLAIN indexes=1`などのツールを使用して、インデックスの効果を確認し、その影響を評価します。
3. 常にインデックスのサイズと、それが粒度によってどのように影響を受けるかを評価してください。粒度サイズを小さくすると、ある程度まではパフォーマンスが向上し、フィルタリングされてスキャンが必要な粒度(granule)が増えます。ただし、粒度が低くなるとインデックスサイズが増加し、パフォーマンスが低下する可能性もあります。さまざまな粒度のデータポイントでパフォーマンスとインデックスサイズを測定してください。これは特にBloomフィルタインデックスに関連します。

<p />

**適切に使用すれば、スキップインデックスは大幅なパフォーマンス向上をもたらすことができますが、盲目的に使用すると不要なコストを追加する可能性があります。**

データスキッピングインデックスに関するより詳細なガイドについては、[こちら](/sql-reference/statements/alter/skipping-index)を参照してください。


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

簡単な分析により、`ViewCount`は予想通り`CreationDate`（プライマリキー）と相関していることがわかります。投稿が存在する期間が長いほど、閲覧される機会も多くなります。


```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

したがって、これはデータスキッピングインデックスとして妥当な選択となります。数値型であることを踏まえると、`minmax` インデックスが適しています。次の `ALTER TABLE` コマンドを使用してインデックスを追加します。まずインデックスを追加し、その後それを「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、テーブルの初期作成時に追加することもできます。`minmax` インデックスを DDL の一部として定義したスキーマは次のとおりです。

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

次のアニメーションは、例のテーブルに対して `minmax` スキップインデックスがどのように構築されるかを示しています。テーブル内の各行ブロック（granule）ごとに、`ViewCount` の最小値と最大値を記録します。

<Image img={building_skipping_indices} size="lg" alt="スキップインデックスの構築" />

先ほどのクエリを再実行すると、パフォーマンスが大幅に向上していることが分かります。スキャンされる行数が減っている点に注目してください。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行が結果セットに含まれています。経過時間: 0.012秒。処理された行数: 39.11千行、321.39 KB (3.40百万行/秒、27.93 MB/秒)
```

`EXPLAIN indexes = 1` を実行すると、インデックスが利用されていることを確認できます。

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
