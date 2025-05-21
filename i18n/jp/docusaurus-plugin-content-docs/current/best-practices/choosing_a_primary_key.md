---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: '主キーの選択'
title: '主キーの選択'
description: 'ClickHouseにおける主キーの選択方法を説明するページ'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> このページでは、「主キー」を指す用語として「ordering key」を交互に使用します。厳密には、[これらはClickHouseで異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)が、本文書の目的上、読者はこれを互換的に使用でき、「ordering key」は`ORDER BY`で指定されたカラムを指します。

ClickHouseの主キーの動作は、PostgresのようなOLTPデータベースにおける類似用語に慣れているユーザーにとっては[非常に異なる](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)ことに注意してください。

ClickHouseで効果的な主キーを選択することは、クエリ性能とストレージ効率にとって重要です。ClickHouseはデータをパーツに整理し、それぞれが独自のスパース主インデックスを持っています。このインデックスはスキャンされるデータ量を削減することでクエリを大幅に高速化します。さらに、主キーはディスク上のデータの物理的な順序を決定するため、圧縮効率にも直接影響を与えます。最適に順序付けされたデータはより効果的に圧縮され、I/Oを削減することによって性能がさらに向上します。

1. ordering keyを選択する際は、特に多くの行を除外するクエリフィルターで頻繁に使用されるカラムを優先してください（つまり、`WHERE`句）。
2. テーブル内の他のデータと高い相関関係を持つカラムも有益です。連続したストレージは、圧縮率と`GROUP BY`および`ORDER BY`操作中のメモリ効率を改善します。
<br/>
ordering keyを選択する際に適用できるいくつかの簡単なルールがあります。以下は時に矛盾することがあるため、順番に考慮してください。**ユーザーはこのプロセスからいくつかのキーを特定でき、通常は4-5で十分です**：

:::note 重要
ordering keyはテーブル作成時に定義する必要があり、追加することはできません。データ挿入後（または前）にプロジェクションと呼ばれる機能を介してテーブルに追加のorderingを加えることができます。この結果、データの重複が生じることに注意してください。詳細は[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::

## 例 {#example}

以下の`posts_unordered`テーブルを考えます。これはStack Overflowの投稿ごとに行を持ちます。

このテーブルには主キーがありません - `ORDER BY tuple()`によって示されています。

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
  `ContentLicense`LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime,
  `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

ユーザーが2024年以降に提出された質問の数を計算したい場合、これが最も一般的なアクセスパターンを表します。

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

このクエリによって読み取られた行数とバイト数に注意してください。主キーがないため、クエリは全データセットをスキャンする必要があります。

`EXPLAIN indexes=1`を使用すると、インデックスが欠如しているためフルテーブルスキャンであることが確認できます。

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

同じデータを持つ`posts_ordered`テーブルが、`ORDER BY`を`(PostTypeId, toDate(CreationDate))`として定義されているとします。

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

`PostTypeId`は8の基数を持ち、ordering keyの最初に入れるための論理的な選択肢を示しています。日付の粒度フィルタリングが十分であることを認識し（それでもdatetimeフィルタに恩恵を与えます）、2番目の要素として`toDate(CreationDate)`を使用します。これにより、日付は16ビットで表現できるため、インデックスも小さくなり、フィルタリングが高速化されます。

次のアニメーションは、Stack Overflowの投稿テーブルに対して最適化されたスパース主インデックスがどのように作成されるかを示しています。個々の行をインデックスするのではなく、行のブロックをターゲットにします：

<Image img={create_primary_key} size="lg" alt="主キー" />

このordering keyを持つテーブルで同じクエリを繰り返すと：

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

このクエリは現在、スパースインデックスを活用しており、読み取られるデータ量を大幅に削減し、実行時間を4倍高速化しています - 読まれる行とバイト数の減少に注意してください。

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

加えて、スパースインデックスがどのようにして、我々の例のクエリに対してマッチを含む可能性がない全行ブロックをプルーニングするかを視覚化します：

<Image img={primary_key} size="lg" alt="主キー" />

:::note
テーブル内のすべてのカラムは、指定されたordering keyの値に基づいてソートされます。キー自体に含まれているかどうかに関係なく、例えば`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数のordering keyを指定することができ、これは`SELECT`クエリにおける`ORDER BY`句と同じ意味論で順序付けられます。
:::

主キーの選択に関する完全な高度なガイドは[こちら](/guides/best-practices/sparse-primary-indexes)で確認できます。

ordering keyが圧縮を改善し、ストレージをさらに最適化する方法に関する詳細な洞察については、[ClickHouseにおける圧縮](/data-compression/compression-in-clickhouse)および[カラム圧縮コーデック](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)に関する公式ガイドを探索してください。
