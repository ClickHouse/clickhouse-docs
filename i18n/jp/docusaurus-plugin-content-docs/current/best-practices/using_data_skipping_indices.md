---
'slug': '/best-practices/use-data-skipping-indices-where-appropriate'
'sidebar_position': 10
'sidebar_label': 'データスキッピングインデックス'
'title': '適切な場合にデータスキッピングインデックスを使用する'
'description': 'データスキッピングインデックスを使用する方法とタイミングを説明するページ'
'keywords':
- 'data skipping index'
- 'skip index'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

データスキッピングインデックスは、以前のベストプラクティスが遵守された場合、すなわち、最適化されたタイプ、適切な主キーが選択され、マテリアライズドビューが利用された場合に考慮すべきです。

この種のインデックスは、それがどのように機能するかを理解して慎重に使用することで、クエリのパフォーマンスを加速するために利用できます。

ClickHouse は、クエリ実行中にスキャンされるデータ量を劇的に減少させることができる **データスキッピングインデックス** と呼ばれる強力なメカニズムを提供します - 特に、主キーが特定のフィルター条件に役立たない場合。従来のデータベースが行ベースの追加インデックス（B-tree のような）に依存しているのに対し、ClickHouse は列指向ストレージであり、そのような構造をサポートする形で行の位置を格納しません。代わりに、データのブロックを読み取るのを回避するのに役立つスキップインデックスを使用しています。これにより、クエリのフィルタリング条件に一致しないことが保証されているデータブロックを読み込む必要がなくなります。

スキップインデックスは、データブロックのメタデータ（最小/最大値、値のセット、またはブルームフィルタ表現など）を格納し、クエリ実行中にこのメタデータを使用して、どのデータブロックを完全にスキップできるかを判断します。これらは [MergeTreeファミリー](/engines/table-engines/mergetree-family/mergetree) のテーブルエンジンにのみ適用され、式、インデックスタイプ、名前、および各インデックスブロックのサイズを定義する粒度を使用して定義されます。これらのインデックスはテーブルデータとともに保存され、クエリフィルターがインデックス式に一致する場合に参照されます。

データスキッピングインデックスには、さまざまなタイプがあり、それぞれ異なる種類のクエリおよびデータ分布に適しています：

* **minmax**: ブロックごとに式の最小値と最大値を追跡します。おおよそ整列されたデータに対する範囲クエリに理想的です。
* **set(N)**: 各ブロックに対して指定されたサイズ N までの値のセットを追跡します。ブロックあたりのカーディナリティが低いカラムに効果的です。
* **bloom_filter**: ブロック内の値が存在するかの確率的判断を行い、セットメンバーシップのための迅速な近似フィルタリングを可能にします。"針を探す"クエリの最適化に効果的です。
* **tokenbf_v1 / ngrambf_v1**: トークンや文字列の検索のために設計された特別なブルームフィルタ変種 - 特にログデータやテキスト検索のユースケースに有用です。

強力な一方で、スキップインデックスは注意して使用する必要があります。意味のある数のデータブロックを排除する場合にのみ利益を提供し、クエリやデータ構造が一致しない場合にはオーバーヘッドを引き起こす可能性があります。ブロック内に一致する値が1つでも存在する場合、そのブロック全体を読み込む必要があります。

**スキップインデックスの効果的な使用は、インデックスされたカラムとテーブルの主キーとの間に強い相関関係があること、またはデータを挿入する際に類似の値をまとめるようにすることに依存することが多いです。**

一般的に、データスキッピングインデックスは、適切な主キー設計とタイプ最適化が確保された後に適用されるべきです。特に以下のような場合に有用です：

* 全体的なカーディナリティが高いが、ブロック内のカーディナリティが低いカラム。
* 検索に重要な希少値（例：エラーコード、特定のID）。
* 非主キーのカラムで、局所的な分布があるフィルタリングが行われるケース。

常に：

1. 実際のデータに対して現実的なクエリでスキップインデックスをテストします。異なるインデックスタイプや粒度値を試してみてください。
2. `send_logs_level='trace'` や `EXPLAIN indexes=1` のようなツールを使用してその影響を評価し、インデックスの効果を確認します。
3. インデックスのサイズとその粒度の影響を常に評価します。粒度サイズを減少させることでパフォーマンスが向上することが多いですが、インデックスサイズが小さくなった場合のパフォーマンスの低下にも注意が必要です。さまざまな粒度データポイントでパフォーマンスとインデックスサイズを測定します。これは特にブルームフィルタインデックスにおいて重要です。

<p/>
**適切に使用されれば、スキップインデックスは大幅なパフォーマンス向上を提供します - 無分別に使用されると不必要なコストを追加する可能性があります。**

データスキッピングインデックスに関する詳細なガイドは [こちら](/sql-reference/statements/alter/skipping-index) をご覧ください。

## 例 {#example}

最適化された以下のテーブルを考えてみましょう。これは、ポストごとに1行を含む Stack Overflow のデータです。

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

このテーブルは、ポストタイプと日付でフィルタリングおよび集約するクエリに最適化されています。2009年以降に公開された、1,000万以上のビューを持つ投稿の数をカウントしたいとしましょう。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

このクエリは、主インデックスを使用していくつかの行（およびグラニュール）を除外することができます。しかし、上記のレスポンスおよび次の `EXPLAIN indexes=1` に示されるように、依然として大部分の行を読み取る必要があります。

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

簡単な分析では、`ViewCount` が `CreationDate`（主キー）と相関していることがわかります - 投稿が存在する時間が長いほど、より多く表示されることができるからです。

```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

これにより、データスキッピングインデックスを選択する論理的な選択がなされます。数値タイプであるため、min_max インデックスが適しています。次の `ALTER TABLE` コマンドを使用してインデックスを追加します - まずそれを追加し、次に「マテリアライズ」します。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

このインデックスは、初回テーブル作成時に追加されることもありました。DDLの一部として定義された min max インデックスを含むスキーマ：

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
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --index here
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

以下のアニメーションは、例のテーブルに対して、各行ブロック（グラニュール）ごとに最小および最大の `ViewCount` 値を追跡する minmax スキッピングインデックスがどのように構築されるかを示しています：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

以前のクエリを繰り返すと、顕著なパフォーマンス向上が見られます。スキャンされた行数が減少していることに注意してください：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes=1` でインデックスの使用が確認されます。

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

また、minmax スキッピングインデックスが、例のクエリにおける `ViewCount` > 10,000,000 の条件に一致する可能性がないすべての行ブロックをプルーニングする様子を示すアニメーションも表示します：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
