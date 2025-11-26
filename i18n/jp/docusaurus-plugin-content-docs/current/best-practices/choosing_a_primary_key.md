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

> このページでは、用語「ordering key」を「primary key」と同義で使用します。厳密には[ClickHouse ではこれらは異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)が、本ドキュメントの範囲では同じものとして扱って構いません。このとき ordering key は、テーブルの `ORDER BY` で指定された列を指します。

ClickHouse の primary key は、Postgres のような OLTP データベースで類似の用語に慣れている方にとっては[挙動が大きく異なる](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)点に注意してください。

ClickHouse で効果的な primary key を選択することは、クエリ性能とストレージ効率の両方にとって極めて重要です。ClickHouse はデータをパーツと呼ばれる単位に分割して保持し、各パーツは独自の疎な primary index を持ちます。このインデックスにより、スキャンするデータ量を削減してクエリを大幅に高速化できます。さらに、primary key はディスク上のデータの物理的な並び順を決定するため、圧縮効率にも直接影響します。最適に並んだデータはより高い圧縮率を実現でき、その結果として I/O が削減され、性能が一層向上します。

1. ordering key を選ぶ際は、クエリフィルタ（`WHERE` 句）で頻繁に使用される列、特に大量の行を除外する列を優先してください。
2. テーブル内の他のデータと高い相関がある列も有用です。連続した配置により、`GROUP BY` や `ORDER BY` 処理中の圧縮率およびメモリ効率が向上するためです。

<br />

ordering key を選ぶ際に役立つ、いくつかの単純なルールを適用できます。以下のルールは互いに矛盾する場合があるため、ここに示す順序で検討してください。**このプロセスから複数の候補キーを洗い出すことができ、通常は 4〜5 個あれば十分です。**

:::note Important
ordering key はテーブル作成時に定義する必要があり、後から追加することはできません。追加の並び順は、projections と呼ばれる機能を用いて、データ挿入の前後を問わずテーブルに付与できます。ただし、その結果データが重複して保存される点に注意してください。詳細は[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::


## 例

次の `posts_unordered` テーブルを考えます。これは Stack Overflow の投稿 1 件ごとに 1 行のデータを含んでいます。

このテーブルには、`ORDER BY tuple()` で示されているように、プライマリキーがありません。

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

あるユーザーが、2024年以降に送信された質問の件数を計算したいとします。そのための処理が、そのユーザーにとって最も一般的なアクセスパターンであると仮定します。

```sql
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.055 sec. Processed 59.82 million rows, 361.34 MB (10.9億行/秒、6.61 GB/秒)
```

このクエリで読み込まれた行数とバイト数に注目してください。プライマリキーがない場合、クエリはデータセット全体をスキャンする必要があります。

`EXPLAIN indexes=1` を使用すると、インデックスが存在しないためにテーブル全体がスキャンされていることが確認できます。

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

同じデータを含む `posts_ordered` というテーブルがあり、そのテーブルの `ORDER BY` が `(PostTypeId, toDate(CreationDate))` として定義されていると仮定します。つまり、

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

`PostTypeId` はカーディナリティが 8 であり、ソートキーの最初の要素として論理的に適した選択です。日付粒度でのフィルタリングで十分である可能性が高いと判断できるため（それでも日時でのフィルタの恩恵は受けます）、キーの 2 番目の構成要素として `toDate(CreationDate)` を使用します。これは日付を 16 ビットで表現できるため、より小さいインデックスが生成され、フィルタリングが高速になります。

次のアニメーションは、Stack Overflow の posts テーブルに対して最適化されたスパースなプライマリインデックスがどのように作成されるかを示しています。個々の行をインデックスする代わりに、行のブロックを対象とします。

<Image img={create_primary_key} size="lg" alt="プライマリキー" />

このソートキーを持つテーブルに対して同じクエリを繰り返し実行した場合:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
```


┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 行が結果セットに含まれます。経過時間: 0.013 秒。処理件数: 196.53 千行、1.77 MB（14.64 百万行/秒、131.78 MB/秒）。

````

このクエリはスパースインデックスを活用し、読み取るデータ量を大幅に削減することで、実行時間を4倍高速化します。読み取る行数とバイト数の削減に注目してください。 

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

さらに、疎インデックスが、サンプルクエリで一致する可能性のないすべての行ブロックをどのように除外するかを視覚的に示します。

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
テーブル内のすべてのカラムは、指定されたオーダリングキーの値に基づいてソートされます。これは、そのカラムがキー自体に含まれているかどうかに関係ありません。たとえば、`CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の順序は、`CreationDate` カラムの値の順序に対応します。複数のオーダリングキーを指定することもでき、その場合、`SELECT` クエリの `ORDER BY` 句と同じセマンティクスで並べ替えが行われます。
:::

プライマリキーの選択に関する詳細な上級者向けガイドは[こちら](/guides/best-practices/sparse-primary-indexes)にあります。

オーダリングキーがどのように圧縮率を高め、ストレージをさらに最適化するかについてより深く理解するには、[Compression in ClickHouse](/data-compression/compression-in-clickhouse) および [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に関する公式ガイドを参照してください。
