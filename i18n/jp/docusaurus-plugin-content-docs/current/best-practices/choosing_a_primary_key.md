---
'slug': '/best-practices/choosing-a-primary-key'
'sidebar_position': 10
'sidebar_label': '主キーの選択'
'title': '主キーの選択'
'description': 'ClickHouseで主キーを選択する方法を説明するページ'
'keywords':
- 'primary key'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> このページでは、「ordering key」という用語を「primary key」を指すために同義語として使用します。厳密には、[ClickHouseではこれらは異なります](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)が、この文書の目的のために、読者はそれらを同じ意味で使うことができ、ordering key は `ORDER BY` で指定されたカラムを指します。

ClickHouse の主キーは、OLTP データベースのような Postgres での類似用語に慣れている人にとっては [非常に異なる動作をします](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

ClickHouse で効果的な主キーを選択することは、クエリパフォーマンスとストレージ効率にとって重要です。ClickHouse はデータをパーツに整理し、各パーツには独自のスパース主インデックスが含まれています。このインデックスはスキャンされるデータ量を減少させることによって、クエリを大幅に高速化します。また、主キーはディスク上のデータの物理的な順序を決定するため、圧縮効率にも直接影響を与えます。最適に順序付けられたデータはより効果的に圧縮され、I/O を減らすことによってパフォーマンスをさらに向上させます。

1. ordering key を選定する際は、特に多くの行を除外するフィルタ（すなわち「WHERE」句）で頻繁に使用されるカラムを優先します。
2. テーブル内の他のデータと高度に相関しているカラムも有益です。連続したストレージは、`GROUP BY` や `ORDER BY` 操作中の圧縮率とメモリ効率を改善します。
<br/>
ordering key を選択するためのいくつかの簡単なルールを適用できます。以下のルールは時には対立することがあるため、順番に考慮してください。**このプロセスから多くのキーを特定することができ、通常は 4-5 で十分です**：

:::note 重要
Ordering key はテーブル作成時に定義する必要があり、追加することはできません。データ挿入後にプロジェクションと呼ばれる機能を通じてテーブルに追加の ordering を加えることができます。これによりデータの重複が発生することに注意してください。さらに詳しくは[こちら](/sql-reference/statements/alter/projection)を参照してください。
:::

## 例 {#example}

次の `posts_unordered` テーブルを考えます。これは Stack Overflow の投稿ごとに行を含みます。

このテーブルには主キーがありません - `ORDER BY tuple()` で示されているように。

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

ユーザーが 2024 年以降に提出された質問の数を計算したいと仮定します。これが彼らの最も一般的なアクセスパターンを表します。

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

このクエリによって読み取られる行数とバイト数に注意してください。主キーがないため、クエリはデータセット全体をスキャンする必要があります。

`EXPLAIN indexes=1` を使用すると、インデックスが欠如しているためにフルテーブルスキャンが確認されます。

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

同じデータを含む `posts_ordered` テーブルが `(PostTypeId, toDate(CreationDate))` という `ORDER BY` で定義されていると仮定します。すなわち、

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

`PostTypeId` は 8 のカーディナリティを持っており、ordering key の最初のエントリとして論理的な選択を示します。日付の粒度フィルタリングが十分であることを認識し（date 時間フィルタにも利益がある）、私たちは `toDate(CreationDate)` をキーの2番目のコンポーネントとして使用します。これによってデータは 16 ビットで表すことができるため、フィルタリングを高速化させるより小さなインデックスを生成します。

以下のアニメーションは、Stack Overflow の投稿テーブルのために最適化されたスパース主インデックスがどのように作成されるかを示しています。個々の行のインデックスを作成するのではなく、行のブロックにターゲットを絞ります：

<Image img={create_primary_key} size="lg" alt="主キー" />

この ordering key を持つテーブルで同じクエリが繰り返されると：

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

このクエリは現在、スパースインデックスを活用しており、読み取られるデータ量を大幅に削減し、実行時間を 4 倍高速化しています - 読み取られる行数とバイト数の削減に注目してください。

インデックスの使用は `EXPLAIN indexes=1` で確認できます。

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

さらに、スパースインデックスが私たちの例のクエリに一致しない行ブロックをすべてプルーニングする様子を視覚化します：

<Image img={primary_key} size="lg" alt="主キー" />

:::note
テーブル内のすべてのカラムは、指定された ordering key の値に基づいてソートされます。キー自体に含まれているかどうかに関わらず。例えば、`CreationDate` がキーとして使用されると、他のすべてのカラムの値の順序は `CreationDate` カラムの値の順序に対応します。複数の ordering key を指定することも可能であり、これは `SELECT` クエリの `ORDER BY` 句と同じ意味で順序付けられます。
:::

主キーを選択するための完全な高度なガイドは [こちら](/guides/best-practices/sparse-primary-indexes) で見ることができます。

圧縮を改善し、ストレージをさらに最適化する方法についての詳細は、[ClickHouse における圧縮](/data-compression/compression-in-clickhouse) および [カラム圧縮コーデック](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に関する公式ガイドを探ってください。
