---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: '主キーの選び方'
title: '主キーの選び方'
description: 'ClickHouse で主キーをどのように選ぶかを説明するページ'
keywords: ['primary key']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> このページでは、「primary key」を指す用語として「ordering key」という表現を同義で用いています。厳密には [ClickHouse では両者は異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key) が、本ドキュメントの範囲では、テーブルの `ORDER BY` で指定された列を ordering key と呼ぶものとし、読み手は両者を同義として扱って問題ありません。

ClickHouse の primary key は、Postgres などの OLTP データベースにおける同様の用語に慣れている人にとっては [挙動が大きく異なります](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

ClickHouse で効果的な primary key を選ぶことは、クエリ性能とストレージ効率の両方にとって極めて重要です。ClickHouse はデータを複数のパーツに分割して管理し、それぞれのパーツが独自のスパースな primary index を持ちます。このインデックスは、スキャンするデータ量を削減することでクエリを大幅に高速化します。さらに、primary key はディスク上のデータの物理的な並び順を決定するため、圧縮効率にも直接影響します。最適な順序で並んだデータはより高い圧縮率を達成でき、その結果として I/O が減少し、性能向上につながります。

1. ordering key を選ぶ際には、クエリのフィルタ（`WHERE` 句）で頻繁に使用される列、特に多数の行を除外できる列を優先してください。
2. テーブル内の他のデータと高い相関を持つ列も有用です。連続した配置で保存されることで、`GROUP BY` や `ORDER BY` の処理中の圧縮率およびメモリ効率が向上します。

<br />

ordering key を選択する際には、いくつかの簡単なルールを適用できます。以下の指針は互いに矛盾する場合もあるため、この順序で検討してください。**このプロセスから複数のキー候補を洗い出すことができ、通常は 4〜5 個あれば十分です**：

:::note Important
ordering key はテーブル作成時に定義する必要があり、後から追加することはできません。追加の ordering は、projection と呼ばれる機能を通じて、データ挿入の後（または前）にテーブルへ付与できます。ただし、これによりデータが重複して保存される点に注意してください。詳細は[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::


## 例 {#example}

以下の `posts_unordered` テーブルを考えてみましょう。このテーブルには Stack Overflow の投稿ごとに1行が含まれています。

このテーブルには主キーがありません。これは `ORDER BY tuple()` で示されています。

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

ユーザーが2024年以降に投稿された質問の数を計算したいとします。これが最も一般的なアクセスパターンであるとします。

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

このクエリで読み取られた行数とバイト数に注目してください。主キーがない場合、クエリはデータセット全体をスキャンする必要があります。

`EXPLAIN indexes=1` を使用すると、インデックスがないためフルテーブルスキャンが実行されていることが確認できます。

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

同じデータを含むテーブル `posts_ordered` が、`ORDER BY` を `(PostTypeId, toDate(CreationDate))` として定義されているとします。つまり、

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

`PostTypeId` のカーディナリティは8であり、順序キーの最初のエントリとして論理的な選択となります。日付粒度のフィルタリングで十分である可能性が高いこと（datetime フィルタにも引き続き有効です）を認識し、キーの2番目のコンポーネントとして `toDate(CreationDate)` を使用します。これにより、日付は16ビットで表現できるため、より小さなインデックスが生成され、フィルタリングが高速化されます。

以下のアニメーションは、Stack Overflow 投稿テーブルに対して最適化されたスパース主インデックスがどのように作成されるかを示しています。個々の行をインデックス化する代わりに、インデックスは行のブロックを対象とします。

<Image img={create_primary_key} size='lg' alt='Primary key' />

この順序キーを持つテーブルで同じクエリを実行すると、

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

```


┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 行がセット内にあります。経過時間: 0.013 秒。処理済み 196.53 千行, 1.77 MB (14.64 百万行/秒, 131.78 MB/秒)

````

このクエリはスパースインデックスを活用し、読み取るデータ量を大幅に削減することで、実行時間を4倍高速化します。読み取られる行数とバイト数の削減に注目してください。 

インデックスの使用状況は `EXPLAIN indexes=1` で確認できます。

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
````

さらに、このサンプルクエリに対してマッチする可能性のない行ブロックを、疎インデックスがどのようにすべて除外していくかを可視化します。

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
テーブル内のすべての列は、指定されたオーダリングキーの値に基づいてソートされます。これは、その列がオーダリングキー自体に含まれているかどうかに関係ありません。たとえば `CreationDate` がキーとして使用されている場合、他のすべての列の値の並び順は、`CreationDate` 列の値の並び順に対応します。複数のオーダリングキーを指定することもでき、その場合の並び順の意味論は、`SELECT` クエリの `ORDER BY` 句と同じになります。
:::

主キーの選び方に関する詳細な上級ガイドは[こちら](/guides/best-practices/sparse-primary-indexes)にあります。

オーダリングキーがどのように圧縮を改善し、さらなるストレージの最適化につなげられるかをより深く理解するには、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) と [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に関する公式ガイドを参照してください。
