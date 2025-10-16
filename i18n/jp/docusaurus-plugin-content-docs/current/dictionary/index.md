---
'slug': '/dictionary'
'title': 'Dictionary'
'keywords':
- 'dictionary'
- 'dictionaries'
'description': '辞書はデータのキーと値の表現を提供し、高速な検索を可能にします。'
'doc_type': 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';



# Dictionary

ClickHouseの辞書は、さまざまな [内部および外部ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのインメモリ [キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低遅延の検索クエリを最適化します。

辞書は以下に役立ちます:
- 特に`JOIN`とともに使用する際のクエリのパフォーマンスを向上させる
- 取り込んだデータをリアルタイムで強化し、取り込みプロセスを遅くすることなく行う

<Image img={dictionaryUseCases} size="lg" alt="ClickHouseにおける辞書の使用例"/>

## 辞書を使用してJOINを加速する {#speeding-up-joins-using-a-dictionary}

辞書は特定のタイプの`JOIN`を加速するために使用できます：`[LEFT ANYタイプ](/sql-reference/statements/select/join#supported-types-of-join)`で、結合キーが基礎となるキー-バリューストレージのキー属性と一致する必要があります。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="LEFT ANY JOINと辞書を使用する"/>

この場合、ClickHouseは辞書を利用して [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join) を実行できます。これはClickHouseの最も高速な結合アルゴリズムであり、右側のテーブルの基礎となる [テーブルエンジン](/engines/table-engines) が低遅延のキー-バリューリクエストをサポートしている場合に適用されます。ClickHouseには、これを提供する3つのテーブルエンジンがあります：[Join](/engines/table-engines/special/join)（基本的には事前計算されたハッシュテーブル）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、および [Dictionary](/engines/table-engines/special/dictionary) です。辞書ベースのアプローチについて説明しますが、メカニズムは3つのエンジンすべてで同じです。

直接結合アルゴリズムは、右側のテーブルが辞書によって支えられていることを要求します。つまり、結合されるデータがすでに低遅延のキー-バリューデータ構造の形式でメモリに存在している必要があります。

### 例 {#example}

Stack Overflowデータセットを使用して、以下の質問に答えましょう：
*Hacker NewsにおけるSQLに関する最も論争のある投稿は何ですか？*

論争のある投稿とは、アップボートとダウンボートの数が同じくらいである投稿と定義します。私たちはこの絶対差を計算し、値が0に近いほど多くの論争を意味します。投稿は少なくとも10のアップボートとダウンボートを持っている必要があると仮定します - 投票が行われていない投稿はあまり論争の的ではありません。

データを正規化した状態で、現在このクエリは`posts`と`votes`テーブルを使用して`JOIN`を必要とします：

```sql
WITH PostIds AS
(
         SELECT Id
         FROM posts
         WHERE Title ILIKE '%SQL%'
)
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
INNER JOIN
(
    SELECT
         PostId,
         countIf(VoteTypeId = 2) AS UpVotes,
         countIf(VoteTypeId = 3) AS DownVotes
    FROM votes
    WHERE PostId IN (PostIds)
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Id IN (PostIds)
ORDER BY Controversial_ratio ASC
LIMIT 1

Row 1:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**`JOIN`の右側には小さなデータセットを使用することを推奨します**: このクエリは、`PostId`のフィルタリングが外側とサブクエリの両方に行われているため、必要以上に冗長に見えるかもしれません。これはクエリの応答時間を速くするためのパフォーマンス最適化です。最適なパフォーマンスを得るためには、常に`JOIN`の右側がより小さなセットであることを確認し、可能な限り小さくします。JOINパフォーマンスの最適化や利用可能なアルゴリズムの理解に関するヒントについては、[このシリーズのブログ記事](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。

このクエリは速いですが、良いパフォーマンスを達成するために慎重に`JOIN`を書くことに依存しています。理想的には、「SQL」を含む投稿のみにフィルターをかけた後、サブセットのブログの`UpVote`および`DownVote`のカウントを確認してメトリックを計算したいと思います。

#### 辞書を適用する {#applying-a-dictionary}

これらの概念を示すために、私たちは投票データに辞書を使用します。辞書は通常メモリに保持されるため（[ssd_cache](/sql-reference/dictionaries#ssd_cache)は例外です）、ユーザーはデータのサイズに注意を払う必要があります。`votes`テーブルのサイズを確認します：

```sql
SELECT table,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes           │ 1.25 GiB        │ 3.79 GiB          │  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

データは辞書内で未圧縮のまま保存されるため、すべてのカラムを辞書に保存すると少なくとも4GBのメモリが必要です（私たちはそうしません）。辞書はクラスター内で複製されるため、このメモリ量は*ノードごと*に確保する必要があります。

> 以下の例では、辞書のデータはClickHouseテーブルから発生します。これは最も一般的な辞書のソースを表しますが、[さまざまなソース](/sql-reference/dictionaries#dictionary-sources)（ファイル、http、データベースを含む[Postgres](/sql-reference/dictionaries#postgresql)）がサポートされています。私たちが示すように、辞書は自動的にリフレッシュされるため、頻繁に変更される小さなデータセットが直接のJOIN用に利用可能であることを保証する理想的な方法です。

私たちの辞書には、参照が行われる主キーが必要です。これは概念的にはトランザクショナルデータベースの主キーに同じであり、一意であるべきです。上記のクエリでは、結合キー - `PostId` に対する参照が必要です。辞書は、私たちの `votes` テーブルから各`PostId`ごとのアップボートとダウンボートの合計で満たされる必要があります。この辞書データを取得するためのクエリは次の通りです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

辞書を作成するには、次のDDLが必要です - 上記のクエリを使用していることに注目してください：

```sql
CREATE DICTIONARY votes_dict
(
  `PostId` UInt64,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
PRIMARY KEY PostId
SOURCE(CLICKHOUSE(QUERY 'SELECT PostId, countIf(VoteTypeId = 2) AS UpVotes, countIf(VoteTypeId = 3) AS DownVotes FROM votes GROUP BY PostId'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())

0 rows in set. Elapsed: 36.063 sec.
```

> セルフマネージドOSSでは、上記のコマンドをすべてのノードで実行する必要があります。ClickHouse Cloudでは、辞書は自動的にすべてのノードに複製されます。上記は、64GBのRAMを持つClickHouse Cloudノードで実行され、36秒でロードされました。

辞書によって消費されるメモリを確認するために：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の `PostId` に対するアップボートおよびダウンボートを取得するには、シンプルな `dictGet` 関数を使用できます。以下では、投稿 `11227902` の値を取得します：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

Exploiting this in our earlier query, we can remove the JOIN:

WITH PostIds AS
(
        SELECT Id
        FROM posts
        WHERE Title ILIKE '%SQL%'
)
SELECT Id, Title,
        dictGet('votes_dict', 'UpVotes', Id) AS UpVotes,
        dictGet('votes_dict', 'DownVotes', Id) AS DownVotes,
        abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
WHERE (Id IN (PostIds)) AND (UpVotes > 10) AND (DownVotes > 10)
ORDER BY Controversial_ratio ASC
LIMIT 3

3 rows in set. Elapsed: 0.551 sec. Processed 119.64 million rows, 3.29 GB (216.96 million rows/s., 5.97 GB/s.)
Peak memory usage: 552.26 MiB.
```

このクエリははるかに簡単であり、また2倍以上速いです！これをさらに最適化して、10以上のアップボートとダウンボートがある投稿のみを辞書にロードし、事前計算された論争の値のみを保存することができます。

## クエリ時の強化 {#query-time-enrichment}

辞書はクエリ時に値を参照するために使用できます。これらの値は結果として返されるか、集約に使用されることがあります。ユーザーIDとそのロケーションをマッピングする辞書を作成すると仮定しましょう：

```sql
CREATE DICTIONARY users_dict
(
  `Id` Int32,
  `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM stackoverflow.users'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

この辞書を使用して投稿結果を強化できます：

```sql
SELECT
        Id,
        Title,
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location
FROM posts
WHERE Title ILIKE '%clickhouse%'
LIMIT 5
FORMAT PrettyCompactMonoBlock

┌───────Id─┬─Title─────────────────────────────────────────────────────────┬─Location──────────────┐
│ 52296928 │ Comparison between two Strings in ClickHouse                  │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

上記のJOINの例と同様に、同じ辞書を使用してほとんどの投稿の出所を効率的に特定できます：

```sql
SELECT
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location,
        count() AS c
FROM posts
WHERE location != ''
GROUP BY location
ORDER BY c DESC
LIMIT 5

┌─location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
│ United Kingdom         │ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## インデックス時の強化 {#index-time-enrichment}

上記の例では、JOINを省くためにクエリ時に辞書を使用しました。辞書は、挿入時に行を補強するためにも使用できます。これは、強化の値が変わらず、外部ソースに存在し、辞書をポピュレートできる場合に通常は適切です。この場合、挿入時に行を強化することで、クエリ時の辞書のルックアップを回避できます。

Stack Overflowのユーザーの`Location`が決して変わらないと仮定しましょう（実際には変わりますが） - 特に`users`テーブルの`Location`カラムです。これを使用して、ロケーションによって投稿テーブルに対して分析クエリを実行するとします。これには`UserId`が含まれています。

辞書は、ユーザーIDを`users`テーブルによって支えられたロケーションにマッピングします：

```sql
CREATE DICTIONARY users_dict
(
    `Id` UInt64,
    `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM users WHERE Id >= 0'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

> `Id < 0` のユーザーは省略し、`Hashed`辞書タイプを使用できるようにします。`Id < 0`のユーザーはシステムユーザーです。

投稿テーブルの挿入時にこの辞書を利用するには、スキーマを修正する必要があります：

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
     ...
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

上記の例では、`Location`は`MATERIALIZED`カラムとして宣言されています。これは、値が`INSERT`クエリの一部として提供でき、常に計算されることを意味します。

> ClickHouseは[`DEFAULT`カラム](/sql-reference/statements/create/table#default_values)（値が提供されない場合に挿入または計算できるカラム）もサポートしています。

テーブルをポピュレートするには、通常の `INSERT INTO SELECT` をS3から使用できます：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これにより、最も多くの投稿が出所するロケーションの名前を取得できます：

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## 高度な辞書トピック {#advanced-dictionary-topics}

### 辞書の`LAYOUT`の選択 {#choosing-the-dictionary-layout}

`LAYOUT`句は辞書の内部データ構造を制御します。いくつかのオプションが存在し、[ここ](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)で文書化されています。正しいレイアウトを選択するためのヒントは[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)で確認できます。

### 辞書のリフレッシュ {#refreshing-dictionaries}

辞書に `LIFETIME` を `MIN 600 MAX 900` として指定しました。`LIFETIME`は辞書の更新間隔であり、ここでの値は600秒から900秒の間のランダムな間隔で定期的に再ロードされます。このランダムな間隔は、多数のサーバーで更新する際に辞書ソースへの負荷を分散するために必要です。更新中、古いバージョンの辞書はまだクエリできますが、初期ロードのみがクエリをブロックします。`(LIFETIME(0))`を設定すると辞書の更新が禁止されることに注意してください。
辞書は `SYSTEM RELOAD DICTIONARY` コマンドを使用して強制的に再ロードできます。

ClickHouseやPostgresなどのデータベースソースでは、辞書が実際に変更された場合にのみ更新するクエリを設定できます（クエリの応答がこれを判断します）、定期的な間隔ではなく。さらなる詳細は[こちら](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)。

### その他の辞書タイプ {#other-dictionary-types}

ClickHouseはまた、[階層型辞書](/sql-reference/dictionaries#hierarchical-dictionaries)、[ポリゴン辞書](/sql-reference/dictionaries#polygon-dictionaries)、および [正規表現辞書](/sql-reference/dictionaries#regexp-tree-dictionary) をサポートしています。

### さらなる読み物 {#more-reading}

- [辞書を使用してクエリを加速する](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書の高度な設定](/sql-reference/dictionaries)
