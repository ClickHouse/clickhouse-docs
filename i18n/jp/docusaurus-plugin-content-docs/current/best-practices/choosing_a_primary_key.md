---
slug: '/best-practices/choosing-a-primary-key'
sidebar_position: 10
sidebar_label: '主キーの選択'
title: '主キーの選択'
description: 'ClickHouse で主キーを選択する方法について説明したページ'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> このページでは、「ordering key」という用語を「primary key」と同義で使用します。厳密には[ClickHouseではこれらは異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)が、本書の目的においては、読者はこれを同義として扱うことができ、ordering keyは`ORDER BY`で指定されたカラムを指します。

ClickHouseの主キーは、PostgresのようなOLTPデータベースでの類似の用語に慣れている人には[非常に異なります](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

ClickHouseで効果的な主キーを選択することは、クエリのパフォーマンスとストレージ効率にとって非常に重要です。ClickHouseはデータをパーツに分けて管理し、それぞれに独自のスパース主インデックスを持たせます。このインデックスはスキャンするデータの量を減少させることにより、クエリを大幅に高速化します。さらに、主キーはディスク上のデータの物理的な順序を決定するため、圧縮効率にも直接影響します。最適に順序付けられたデータはより効果的に圧縮され、I/Oを減らすことでさらなるパフォーマンス向上を図ります。

1. ordering keyを選択する際は、クエリフィルター（つまり`WHERE`句）で頻繁に使用されるカラムを優先します。特に、大量の行を除外するカラムが重要です。
2. テーブル内の他のデータと高い相関があるカラムも有益で、連続的なストレージが圧縮率とメモリ効率を改善します、特に`GROUP BY`や`ORDER BY`操作中に。

<br/>
ordering keyを選定する際に適用できる簡単なルールがあります。以下の項目は時に対立する可能性があるため、順番に考慮してください。**ユーザーはこのプロセスからいくつかのキーを特定でき、通常は4-5個で十分です**。

:::note 念のため
ordering keyはテーブル作成時に定義する必要があり、後から追加することはできません。追加のorderingは、データ挿入後（または前）にプロジェクションとして知られる機能を用いてテーブルに追加できます。この結果、データの重複が生じることに注意してください。詳細については[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::

## 例 {#example}

以下の`posts_unordered`テーブルを考察してください。これはStack Overflowの各ポストに対して1行を持ちます。

このテーブルには主キーがありません - `ORDER BY tuple()`で示されています。

```sql
CREATE TABLE posts_unordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 
  'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime,
  `Score` Int32,
  `ViewCount` UInt32,
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime,
  `LastActivityDate` DateTime,
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16,
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime,
  `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

ユーザーが2024年以降に提出された質問の数を計算することを希望していると仮定しましょう。これは彼らの最も一般的なアクセスパターンを表しています。

```sql
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.055 sec. Processed 59.82 million rows, 361.34 MB (1.09 billion rows/s., 6.61 GB/s.)
```

このクエリによって読み取られた行数とバイト数に注意してください。主キーがないため、クエリはデータセット全体をスキャンする必要があります。

`EXPLAIN indexes=1`を使用すると、インデックスの不足によりフルテーブルスキャンであることが確認されています。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain───────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                 │
│   Aggregating                                             │
│     Expression (Before GROUP BY)                          │
│       Expression                                          │
│         ReadFromMergeTree (stackoverflow.posts_unordered) │
└───────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.003 sec.
```

もし`posts_ordered`というテーブルが、同じデータを持ち、`ORDER BY`が`(PostTypeId, toDate(CreationDate))`として定義されていると仮定します。

```sql
CREATE TABLE posts_ordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 
  'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
...
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate))
```

`PostTypeId`は8のカーディナリティを持ち、我们のordering keyの最初のエントリとして論理的に選ばれるべきです。日付の粒度フィルタリングが十分であると認識されるため（それでもdatetimeフィルターには有利である）、`toDate(CreationDate)`を私たちのキーの第2コンポーネントとして使用します。これにより、日付が16ビットで表現できるため、インデックスが小さくなり、フィルター処理が速くなります。

以下のアニメーションは、Stack Overflowポストテーブルのために最適化されたスパース主インデックスがどのように作成されるかを示しています。個々の行をインデックス化するのではなく、行のブロックをターゲットにします：

<Image img={create_primary_key} size="lg" alt="Primary key" />

同じクエリがこのordering keyを持つテーブルで繰り返される場合：

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.013 sec. Processed 196.53 thousand rows, 1.77 MB (14.64 million rows/s., 131.78 MB/s.)
```

このクエリは今やスパースインデックスを利用し、読み取られるデータ量を大幅に減少させ、実行時間を4倍に短縮します - 読み取られた行数とバイト数の減少に注目してください。

インデックスの使用は`EXPLAIN indexes=1`で確認できます。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain─────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                                                   │
│   Aggregating                                                                               │
│     Expression (Before GROUP BY)                                                            │
│       Expression                                                                            │
│         ReadFromMergeTree (stackoverflow.posts_ordered)                                     │
│         Indexes:                                                                            │
│           PrimaryKey                                                                        │
│             Keys:                                                                           │
│               PostTypeId                                                                    │
│               toDate(CreationDate)                                                          │
│             Condition: and((PostTypeId in [1, 1]), (toDate(CreationDate) in [19723, +Inf))) │
│             Parts: 14/14                                                                    │
│             Granules: 39/7578                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

13 rows in set. Elapsed: 0.004 sec.
```

さらに、スパースインデックスが、私たちの例のクエリに対する一致が不可能なすべての行ブロックをどのようにプルーニングするかを可視化します：

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
テーブル内のすべてのカラムは、指定されたordering keyの値に基づいてソートされます。キーそのものに含まれているかどうかに関係なく。たとえば、`CreationDate`をキーとして使用すると、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数のordering keyを指定できます - これは`SELECT`クエリの`ORDER BY`句と同様の意味でソートされます。
:::

主キーを選択するための完全な高度なガイドは[こちら](/guides/best-practices/sparse-primary-indexes)にあります。

ordering keyが圧縮を改善し、ストレージをさらに最適化する方法についての深い洞察は、[ClickHouseの圧縮](/data-compression/compression-in-clickhouse)および[カラム圧縮コーデック](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)に関する公式ガイドを探求してください。
