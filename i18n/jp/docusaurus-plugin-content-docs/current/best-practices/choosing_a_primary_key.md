---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: '主キーの選び方'
title: '主キーの選び方'
description: 'ClickHouse における主キーの選び方を説明するページ'
keywords: ['主キー']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> このページでは「ordering key」という用語を「primary key」と同じ意味で入れ替えて使用しています。厳密には[ClickHouse では両者は異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)が、本ドキュメントにおいてはどちらも同じものとして扱って構いません。ここでいう ordering key とは、テーブルの `ORDER BY` 句で指定された列を指します。

ClickHouse の primary key は、Postgres のような OLTP データベースにおける同様の用語に慣れている方にとっては[挙動が大きく異なる](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)ことに注意してください。

ClickHouse において効果的な primary key を選択することは、クエリ性能およびストレージ効率にとって極めて重要です。ClickHouse はデータをパーツに分割して管理し、それぞれのパーツは独自の疎な primary index を保持します。このインデックスにより走査するデータ量が削減され、クエリが大幅に高速化されます。さらに、primary key はディスク上のデータの物理的な並び順を決定するため、圧縮効率にも直接影響します。最適に並べ替えられたデータはより高い圧縮率を実現でき、その結果として I/O が削減され、性能がさらに向上します。

1. ordering key を選択する際は、クエリフィルタ（`WHERE` 句）で頻繁に使用される列、特に大量の行を除外できる列を優先してください。
2. テーブル内の他のデータと非常に相関の高い列も有用です。連続した配置によって圧縮率が向上し、`GROUP BY` や `ORDER BY` の処理中のメモリ効率も改善されます。

<br />

ordering key を選ぶ際に役立つ、いくつかの単純なルールを適用できます。以下のルールは互いに矛盾することもあるため、記載順に検討してください。**このプロセスを通じて複数のキー候補を洗い出すことができ、通常は 4〜5 個あれば十分です**:

:::note Important
ordering key はテーブル作成時に定義する必要があり、後から追加することはできません。追加の並び順は、projections と呼ばれる機能を用いることで、データ挿入の後（または前）にテーブルへ付与できますが、その結果としてデータが重複して保存される点に注意してください。詳細は[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::


## 例 {#example}

以下の `posts_unordered` テーブルを考えます。このテーブルには、Stack Overflow の投稿ごとに1行が含まれています。

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

以下のアニメーションは、Stack Overflow の投稿テーブルに対して最適化されたスパース主インデックスがどのように作成されるかを示しています。個々の行をインデックス化する代わりに、インデックスは行のブロックを対象とします。

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
1 行が結果セットに含まれます。経過時間: 0.013 秒。処理済み 196.53 千行、1.77 MB (14.64 百万行/秒、131.78 MB/秒)。

````

このクエリはスパースインデックスを活用することで、読み取るデータ量を大幅に削減し、実行時間を4倍高速化します。読み取られる行数とバイト数が削減されていることに注目してください。 

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

さらに、疎インデックスが、例のクエリでマッチを含む可能性のない行ブロックをどのようにすべて刈り込む（除外する）かを可視化します：

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
テーブル内のすべての列は、指定されたオーダリングキーの値に基づいてソートされます。これは、その列がキー自体に含まれているかどうかに関係ありません。たとえば、`CreationDate` がキーとして使用されている場合、他のすべての列の値の並び順は、`CreationDate` 列の値の並び順に対応します。複数のオーダリングキーを指定することもでき、その場合の並び順は `SELECT` クエリの `ORDER BY` 句と同じセマンティクスになります。
:::

主キーの選択に関する包括的な上級ガイドは[こちら](/guides/best-practices/sparse-primary-indexes)にあります。

オーダリングキーが圧縮をどのように改善し、ストレージをさらに最適化するかをより深く理解するには、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) と [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に関する公式ガイドを参照してください。
