---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'データスキッピングインデックス'
title: '適切な場所でデータスキッピングインデックスを使用する'
description: 'データスキッピングインデックスの使用方法とタイミングについて説明するページ'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、以前のベストプラクティスが遵守されている場合に考慮されるべきです。すなわち、タイプが最適化され、適切な主キーが選択され、マテリアライズドビューが活用されています。

これらのインデックスは、クエリのパフォーマンスを加速するために注意深く使用される場合、効果を発揮します。

ClickHouse は、クエリ実行中にスキャンされるデータ量を劇的に削減できる強力なメカニズムである **データスキッピングインデックス** を提供します。特に、主キーが特定のフィルタ条件に対して役立たない場合にこれが当てはまります。従来のデータベースは行ベースのセカンダリインデックス（B-tree など）に依存していますが、ClickHouse は列指向ストレージであり、そのような構造をサポートする形で行の位置を保存しません。代わりに、スキップインデックスを使用して、クエリのフィルタ条件に一致しないことが保証されているデータブロックを読み込まないようにします。

スキップインデックスは、データのブロックに関するメタデータ（最小値/最大値、値のセット、またはブルームフィルターの表現など）を保存し、クエリ実行時にこのメタデータを使用してスキップできるデータブロックを決定します。これらは [MergeTree ファミリー](/engines/table-engines/mergetree-family/mergetree) のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、インデックスブロックのサイズを定義する粒度を指定して定義されます。これらのインデックスはテーブルデータと同等に保存され、クエリフィルタがインデックス式に一致した場合に参照されます。

データスキッピングインデックスの種類は、さまざまなクエリタイプやデータ分布に適したものがいくつかあります。

* **minmax**: 各ブロックの式の最小値と最大値を追跡します。緩やかにソートされたデータに対する範囲クエリに最適です。
* **set(N)**: 各ブロックに対して指定したサイズ N までの値のセットを追跡します。ブロックあたりのカーディナリティが低いカラムに効果的です。
* **bloom_filter**: ブロック内に値が存在するかを確率的に判断し、セットメンバーシップのための高速近似フィルタリングを可能にします。「針を探す」クエリの最適化に効果的です。
* **tokenbf_v1 / ngrambf_v1**: 文字列内のトークンまたは文字シーケンスを検索するために設計された特殊なブルームフィルターのバリアントで、ログデータやテキスト検索のユースケースに特に有用です。

強力ではあるものの、スキップインデックスは注意して使用する必要があります。意味のある数のデータブロックを排除する場合にのみ利益が得られ、クエリまたはデータ構造が一致しない場合はオーバーヘッドが発生することがあります。ブロック内に一致する値が1つでも存在する場合、そのブロック全体はまだ読み込む必要があります。

**効果的なスキップインデックスの使用は、インデックスカラムとテーブルの主キーとの間に強い相関関係があるか、類似の値をグループ化する方法でデータを挿入することに依存することが多いです。**

一般的に、データスキッピングインデックスは、適切な主キー設計とタイプの最適化を確保した後に適用するのが最良です。これらは特に以下のような場合に有用です。

* 全体的に高いカーディナリティを持つが、ブロック内では低いカーディナリティを持つカラム。
* 検索に不可欠なまれな値（例：エラーコード、特定のID）。
* 非主キーのカラムで局所的分布にフィルタリングが行われる場合。

常に：

1. 現実のデータで現実的なクエリを使用してスキップインデックスをテストします。さまざまなインデックスタイプや粒度の値を試してください。
2. send_logs_level='trace' や `EXPLAIN indexes=1` のようなツールを使用してその影響を評価し、インデックスの効果を確認してください。
3. インデックスのサイズと、粒度による影響を常に評価します。粒度のサイズを減らすことでパフォーマンスが改善されることが多く、より多くのグラニュールがフィルタリングされ、スキャンされる必要があります。ただし、インデックスサイズが小さくなると性能が向上しますが、過度に粒度を下げすぎると性能が劣化する可能性があります。さまざまな粒度のデータポイントに対してパフォーマンスとインデックスのサイズを測定することが特に重要です。

<p/>
**適切に使用すれば、スキップインデックスは大幅なパフォーマンス向上を提供できるが、盲目的に使用すれば不要なコストを追加する可能性があります。**

データスキッピングインデックスについての詳細なガイドは [こちら](/sql-reference/statements/alter/skipping-index) を参照してください。

## 例 {#example}

以下の最適化されたテーブルを考慮します。これは投稿ごとに1行を持つ Stack Overflow のデータを含んでいます。

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

このテーブルは、投稿タイプや日付でフィルタリングおよび集計するクエリに最適化されています。2009年以降に発表された10,000,000以上のビューを持つ投稿の数をカウントしたいとしましょう。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行のセットが返されました。経過時間: 0.720秒。59.55百万行が処理され、230.23 MB（82.66百万行/s、319.56 MB/s）。
```

このクエリは、主インデックスを使用して一部の行（およびグラニュール）を除外できます。ただし、上記の応答と `EXPLAIN indexes=1` に示されるように、依然として大多数の行が読み込まれる必要があります。

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

25行のセットが返されました。経過時間: 0.070秒。
```

単純な分析を行うと、`ViewCount` は `CreationDate`（主キー）と相関関係にあることがわかります。予想される通り、投稿が存在する期間が長いほど、見る機会が増えます。

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

これはデータスキッピングインデックスにとって論理的な選択です。数値型であるため、min_max インデックスが適しています。次の `ALTER TABLE` コマンドを使用してインデックスを追加します。最初に追加し、その後「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、初期テーブル作成中にも追加できました。DDL の一部として定義されたスキーマを含みます。

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

以下のアニメーションは、各行ブロック（グラニュール）ごとに最小値と最大値の `ViewCount` を追跡するために、例のテーブル用に minmax スキッピングインデックスが構築される様子を示しています。

<Image img={building_skipping_indices} size="lg" alt="スキッピングインデックス構築" />

先ほどのクエリを繰り返すと、大幅なパフォーマンス向上が見られます。スキャンされた行数が大幅に減少していることに注意してください。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行のセットが返されました。経過時間: 0.012秒。39.11千行が処理され、321.39 KB（3.40百万行/s、27.93 MB/s）。
```

`EXPLAIN indexes=1` によりインデックスの使用が確認されます。

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

29行のセットが返されました。経過時間: 0.211秒。
```

また、例のクエリ内で `ViewCount` > 10,000,000 の述語に対して一致しない行ブロックをすべてプルーニングする様子を示すアニメーションも表示します。

<Image img={using_skipping_indices} size="lg" alt="スキッピングインデックスの使用" />
