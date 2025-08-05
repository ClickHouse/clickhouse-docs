---
slug: '/best-practices/use-data-skipping-indices-where-appropriate'
sidebar_position: 10
sidebar_label: 'データスキッピングインデックス'
title: '適切な場所でデータスキッピングインデックスを使用する'
description: 'データスキッピングインデックスの使用方法とタイミングについて説明するページ'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、前のベストプラクティスが守られている場合に考慮されるべきです。つまり、型が最適化され、良好な主キーが選択され、マテリアライズドビューが活用されている必要があります。

これらのインデックスは、どのように機能するかを理解した上で注意深く使用されると、クエリパフォーマンスを加速するために使用できます。

ClickHouseは、クエリ実行中にスキャンされるデータ量を劇的に減少させることができる**データスキッピングインデックス**という強力なメカニズムを提供します。特に、特定のフィルタ条件に対して主キーが役立たない場合に有効です。従来のデータベースが行ベースの二次インデックス（Bツリーなど）に依存しているのに対し、ClickHouseは列指向であり、そのような構造をサポートする形で行の位置を保存しません。代わりにスキップインデックスを使用し、クエリのフィルタ条件と一致しないことが保証されているデータブロックの読み込みを回避します。

スキップインデックスは、データブロックに関するメタデータ（最小値/最大値、値のセット、またはブルームフィルタ表現など）を保存し、クエリ実行中にこのメタデータを使用してどのデータブロックを完全にスキップできるかを判断します。これらは[MergeTreeファミリー](/engines/table-engines/mergetree-family/mergetree)のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、およびインデックスされた各ブロックのサイズを定義する粒度を使用して定義されます。これらのインデックスは、テーブルデータとともに保存され、クエリフィルタがインデックス式に一致するときに参照されます。

データスキッピングインデックスには、さまざまなクエリとデータ分布に適したいくつかのタイプがあります：

* **minmax**: 各ブロックごとの式の最小値と最大値を追跡します。緩やかにソートされたデータに対する範囲クエリに最適です。
* **set(N)**: 各ブロックごとに指定されたサイズNまでの値のセットを追跡します。ブロックごとの低いカーディナリティのカラムに効果的です。
* **bloom_filter**: 値がブロックに存在するかどうかを確率的に判断し、セットメンバーシップのための高速近似フィルタリングを可能にします。「干し草の中の針」を探すクエリを最適化するために効果的です。
* **tokenbf_v1 / ngrambf_v1**: 文字列内のトークンや文字列シーケンスを検索するために設計された特化型ブルームフィルタのバリアント - ログデータやテキスト検索のユースケースに特に役立ちます。

強力である一方で、スキップインデックスは注意して使用する必要があります。意味のある数のデータブロックを排除する場合にのみベネフィットを提供し、クエリやデータ構造が合致しない場合はオーバーヘッドを引き起こす可能性があります。ブロックに一致する値が1つでも存在する場合、そのブロック全体はまだ読み込まれる必要があります。

**効果的なスキップインデックスの使用は、インデックスされたカラムとテーブルの主キーとの強い相関関係、または類似の値をグループ化する形でのデータ挿入に依存することが多いです。**

一般的に、データスキッピングインデックスは、適切な主キー設計と型最適化を確認した後に適用するのが最適です。特に役立つのは：

* 全体的なカーディナリティが高いが、ブロック内のカーディナリティが低いカラム。
* 検索において重要な稀な値（例：エラーコード、特定のID）。
* 非主キーのカラムでのフィルタリングがローカライズされた分布で発生する場合。

常に：

1. 実データで現実的なクエリを使用してスキップインデックスをテストします。異なるインデックスタイプと粒度の値を試してください。
2. send_logs_level='trace' や `EXPLAIN indexes=1` などのツールを使用して、インデックスの効果を評価します。
3. インデックスのサイズと、それが粒度によってどのように影響を受けるかを常に評価します。粒度サイズを減少させることは、しばしばパフォーマンスを向上させ、より多くのグラニュールがフィルタリングされ、スキャンされる必要が生じます。ただし、インデックスサイズが粒度の低下に伴って増加する場合、パフォーマンスが低下することもあります。さまざまな粒度データポイントに対するパフォーマンスとインデックスサイズを測定します。これは特にブルームフィルタインデックスに関連しています。

<p/>
**適切に使用される場合、スキップインデックスは大幅なパフォーマンスブーストを提供しますが、盲目的に使用すると不必要なコストを加える可能性があります。**

データスキッピングインデックスに関する詳細なガイドについては、[こちら](/sql-reference/statements/alter/skipping-index)を参照してください。

## 例 {#example}

次の最適化されたテーブルを考慮してください。これは、各投稿に対して行があるStack Overflowのデータを含んでいます。

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

このテーブルは、投稿の種類と日付でフィルタリングおよび集約するクエリに最適化されています。たとえば、2009年以降に公開された、ビュー数が10,000,000を超える投稿の数をカウントしたいとしましょう。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行がセットされました。経過時間: 0.720秒。59.55百万行、230.23 MBが処理されました (82.66百万行/秒, 319.56 MB/秒)。
```

このクエリは、主インデックスを使用して一部の行（およびグラニュール）を除外することができます。しかし、上記の応答および次の`EXPLAIN indexes=1`で示されているように、大多数の行はまだ読み込む必要があります。

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

25行がセットされました。経過時間: 0.070秒。
```

簡単な分析により、`ViewCount`が`CreationDate`（主キー）と相関していることが示されています。予想通り、投稿が存在する時間が長くなるほど、より多くの閲覧が得られます。

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

したがって、これはデータスキッピングインデックスの論理的な選択になります。数値型であるため、min_maxインデックスが適していると言えます。次の`ALTER TABLE`コマンドを使用してインデックスを追加します - 最初に追加し、その後「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、初期のテーブル作成時に追加することもできます。DDLの一部として定義されたスキーマは次の通りです：

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
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --インデックスここ
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

次のアニメーションは、最小値と最大値の`ViewCount`値をテーブル内の各行（グラニュール）のブロックに対して追跡するために、私たちのminmaxスキッピングインデックスがどのように構築されるかを示しています。

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

以前のクエリを繰り返すと、パフォーマンスが大幅に改善されたことがわかります。スキャンされた行数が大幅に削減されたことに注意してください：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1行がセットされました。経過時間: 0.012秒。39.11千行、321.39 KBが処理されました (3.40百万行/秒, 27.93 MB/秒)。
```

`EXPLAIN indexes=1`はインデックスを使用していることを確認しています。

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

29行がセットされました。経過時間: 0.211秒。
```

また、minmaxスキッピングインデックスが、例のクエリ内の`ViewCount` > 10,000,000の条件に対して一致を持たないすべての行ブロックをいかに剪定するかを示すアニメーションも示します：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
