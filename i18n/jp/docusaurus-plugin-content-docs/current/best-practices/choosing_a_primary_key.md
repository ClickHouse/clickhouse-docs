---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: '主キーの選び方'
title: '主キーの選び方'
description: 'ClickHouse で主キーをどのように選択するかを説明するページ'
keywords: ['primary key']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> このページでは、「primary key」を指す用語として「ordering key」という表現を同義的に使用します。厳密には[ClickHouse では両者は異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)が、本ドキュメントにおいては読者はこれらを同義として扱って構いません。このとき、ordering key はテーブルの `ORDER BY` で指定されたカラムを指します。

ClickHouse の primary key は、Postgres のような OLTP データベースで同様の用語に慣れている方にとっては[まったく別物のように動作します](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

ClickHouse で効果的な primary key を選択することは、クエリ性能とストレージ効率の両面で極めて重要です。ClickHouse はデータを複数のパーツに分割して管理し、各パーツは独自の疎な primary index を持ちます。このインデックスによりスキャンされるデータ量が削減され、クエリが大幅に高速化されます。さらに、primary key はディスク上のデータの物理的な並び順を決定するため、圧縮効率にも直接影響します。最適に並んだデータはより高い圧縮率を実現でき、その結果として I/O が削減され、パフォーマンスがさらに向上します。

1. ordering key を選択する際は、クエリフィルタ（`WHERE` 句）で頻繁に使用されるカラムを優先し、とくに多数の行を除外できるカラムを重視します。
2. テーブル内の他のデータと高い相関を持つカラムも有用です。連続した配置により、`GROUP BY` や `ORDER BY` 処理中の圧縮率およびメモリ効率が向上します。

<br />

ordering key を選択する際には、いくつかの簡単なルールを適用できます。以下のルールは相互に矛盾する場合があるため、記載順に検討してください。**このプロセスから複数のキー候補を洗い出せますが、通常は 4〜5 個あれば十分です。**

:::note Important
Ordering key はテーブル作成時に定義する必要があり、後から追加することはできません。追加の並び替えは、projections と呼ばれる機能を使うことで、データ挿入の前後を問わずテーブルに付与できますが、この場合データが重複して保持される点に注意してください。詳細は[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::


## 例 {#example}

以下の `posts_unordered` テーブルを考えてみましょう。このテーブルには Stack Overflow の投稿ごとに1行が含まれています。

このテーブルにはプライマリキーがありません。これは `ORDER BY tuple()` で示されています。

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

このクエリで読み取られた行数とバイト数に注目してください。プライマリキーがない場合、クエリはデータセット全体をスキャンする必要があります。

`EXPLAIN indexes=1` を使用すると、インデックスがないためフルテーブルスキャンが行われていることが確認できます。

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

`PostTypeId` のカーディナリティは8であり、順序キーの最初のエントリとして論理的な選択となります。日付粒度のフィルタリングで十分である（datetime フィルタにも有効です）と認識されるため、キーの2番目のコンポーネントとして `toDate(CreationDate)` を使用します。これにより、日付は16ビットで表現できるため、より小さなインデックスが生成され、フィルタリングが高速化されます。

以下のアニメーションは、Stack Overflow の投稿テーブルに対して最適化されたスパースプライマリインデックスがどのように作成されるかを示しています。個々の行をインデックス化する代わりに、インデックスは行のブロックを対象とします:

<Image img={create_primary_key} size='lg' alt='Primary key' />

この順序キーを持つテーブルで同じクエリを実行すると:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

```


┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 行が結果セットにあります。経過時間: 0.013 秒。処理行数 196.53 千行、データ量 1.77 MB (14.64 百万行/秒、131.78 MB/秒)。

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

さらに、スパースインデックスが、例のクエリでマッチする可能性のない行ブロックをどのようにすべて刈り込むかを可視化します。

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
テーブル内のすべてのカラムは、指定されたオーダリングキーの値に基づいてソートされます。これは、そのカラムがキー自体に含まれているかどうかに関係ありません。たとえば `CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の並び順は、`CreationDate` カラムの値の並び順に対応します。複数のオーダリングキーを指定することもでき、その場合は `SELECT` クエリの `ORDER BY` 句と同じセマンティクスでソートされます。
:::

プライマリキーの選択に関する高度なガイドの完全版は[こちら](/guides/best-practices/sparse-primary-indexes)を参照してください。

オーダリングキーが圧縮をどのように向上させ、さらにストレージを最適化するかについて詳しく知るには、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) と [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に関する公式ガイドを参照してください。
