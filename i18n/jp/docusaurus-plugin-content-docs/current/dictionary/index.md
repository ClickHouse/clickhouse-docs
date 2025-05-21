---
slug: /dictionary
title: '辞書'
keywords: ['辞書', '辞書一覧']
description: '辞書はデータのキー-バリュー表現を提供し、高速な検索を実現します。'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# 辞書

ClickHouseの辞書は、さまざまな [内部および外部ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのインメモリ [キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低遅延の検索クエリを最適化します。

辞書は以下の用途に役立ちます：
- 特に `JOIN` とともに使用することでクエリのパフォーマンスを向上させる
- データの取り込みプロセスを遅くすることなく、インジェストされたデータを即座に豊かにする

<Image img={dictionaryUseCases} size="lg" alt="ClickHouseにおける辞書のユースケース"/>

## 辞書を使用したJOINの高速化 {#speeding-up-joins-using-a-dictionary}

辞書は特定のタイプの `JOIN` を高速化するために使用できます： [`LEFT ANY`タイプ](/sql-reference/statements/select/join#supported-types-of-join)、ここでは結合キーが基礎となるキー-バリュー ストレージのキー属性と一致する必要があります。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="LEFT ANY JOINとの辞書の使用"/>

この場合、ClickHouseは辞書を利用して [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join) を実行できます。これはClickHouseの最も高速なJOINアルゴリズムであり、右側のテーブルの [テーブルエンジン](/engines/table-engines) が低遅延のキー-バリューリクエストをサポートしている場合に適用されます。ClickHouseにはこれを提供するテーブルエンジンが3つあります：[Join](/engines/table-engines/special/join)（基本的には事前計算されたハッシュテーブル）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、および [Dictionary](/engines/table-engines/special/dictionary)です。ここでは辞書を用いたアプローチについて説明しますが、メカニズムは3つのエンジンすべてに対して同じです。

ダイレクトJOINアルゴリズムでは、右側のテーブルが辞書によってバックアップされている必要があります。このため、結合対象のデータが低遅延のキー-バリュー データ構造としてメモリに既に存在している必要があります。

### 例 {#example}

Stack Overflowデータセットを使用して、以下の質問に答えます：
*Hacker NewsでのSQLに関する最も物議を醸す投稿は何ですか？*

物議を醸すというのは、投稿に類似した数のアップ票とダウン票があることを意味します。我々はこの絶対値の差を計算し、値が0に近いほど物議を醸していると見なします。投稿は少なくとも10のアップ票とダウン票を持つ必要があると仮定します - 投票されない投稿はあまり物議を醸しません。

データが正規化されると、このクエリは現在 `posts` と `votes` テーブルを使って `JOIN` を必要とします：

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

行 1:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**`JOIN`の右側で小さいデータセットを使用する**：このクエリは、`PostId`のフィルタリングが外部とサブクエリの両方で行われているため、必須より冗長に見えるかもしれません。これは、クエリの応答時間を迅速にするためのパフォーマンス最適化です。最適なパフォーマンスを得るためには、`JOIN`の右側は小さいセットで、できるだけ小さくなるようにしてください。JOINのパフォーマンスを最適化し、利用可能なアルゴリズムを理解するためのヒントについては、[このシリーズのブログ記事](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。

このクエリは迅速ですが、良好なパフォーマンスを実現するためには、注意深く `JOIN` を記述する必要があります。理想的には、`UpVote` および `DownVote` のカウントを参照する前に、「SQL」を含む投稿にフィルタリングするだけで済みます。

#### 辞書の適用 {#applying-a-dictionary}

これらの概念を示すために、投票データのために辞書を使用します。辞書は通常メモリ内に保持されるため（[ssd_cache](/sql-reference/dictionaries#ssd_cache)が例外）、ユーザーはデータのサイズに注意する必要があります。`votes` テーブルのサイズを確認します：

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

データは辞書内に未圧縮で保存されるため、全カラム（すべてを保存するわけではありませんが）を辞書に保存するには、少なくとも4GBのメモリが必要です。この辞書はクラスター全体にレプリケートされるため、このメモリ量は*ノードごと*に確保する必要があります。

> 下記の例では、我々の辞書のデータはClickHouseのテーブルから派生しています。これは辞書の最も一般的なソースを表していますが、ファイル、HTTP、およびデータベース（[Postgres](/sql-reference/dictionaries#postgresql)を含む）など、複数のソースがサポートされています。辞書は自動的に更新できるため、頻繁に変更される小さいデータセットがダイレクトJOINに利用できる理想的な方法です。

我々の辞書には、検索が行われる主キーが必要です。これはトランザクショナルデータベースの主キーに概念的に一致し、一意である必要があります。上記のクエリは、結合キー - `PostId` に基づいた検索を必要とします。辞書は、`votes` テーブルから `PostId` ごとのアップ票とダウン票の合計で埋められるべきです。これが辞書データを取得するためのクエリです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

辞書を作成するには、以下のDDLが必要です - 上記のクエリの使用に注意してください：

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

> セルフマネージドOSSでは、上記のコマンドはすべてのノードで実行する必要があります。ClickHouse Cloudでは、辞書はすべてのノードに自動的にレプリケートされます。上記は、36秒かけてロードされた64GBのRAMを持つClickHouse Cloudノードで実行されました。

辞書が消費するメモリを確認します：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の `PostId` に対するアップ票とダウン票を取得するには、単純な `dictGet` 関数を使用できます。ここでは `11227902` の投稿に対する値を取得します：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘


これを以前のクエリで利用することで、JOINを削除できます：

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

このクエリはかなりシンプルになり、しかも2倍以上も速くなります！さらに最適化するには、10以上のアップ票とダウン票を持つ投稿のみを辞書に読み込むようにし、物議を醸す値を事前計算して保存することができます。

## クエリ時のエンリッチメント {#query-time-enrichment}

辞書はクエリ時に値を検索するために使用できます。これらの値は結果として返されたり、集計で使用されたりすることができます。ユーザーIDをその場所にマッピングする辞書を作成するとしましょう：

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

我々はこの辞書を使用して投稿結果を豊かにできます：

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
│ 52296928 │ Comparision between two Strings in ClickHouse                 │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

上記のJOIN例と同様に、同じ辞書を使用して投稿がどこから来ているかを効率的に特定することができます：

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

## インデックス時のエンリッチメント {#index-time-enrichment}

上記の例では、クエリ時に辞書を使用してJOINを削除しました。辞書は挿入時に行を豊かにするためにも使用できます。これは通常、エンリッチメント値が変更されず、辞書を populated するために使用できる外部ソースが存在する場合に適しています。この場合、挿入時に行をエンリッチすることで、クエリ時に辞書を検索することを回避します。

Stack Overflowのユーザーの `Location` が決して変わらない（実際には変わりますが）、具体的には `users` テーブルの `Location` カラムだと仮定しましょう。投稿テーブルを場所別に分析クエリを行いたいとします。これには `UserId` が含まれます。

辞書はユーザーIDから場所へのマッピングを提供し、`users` テーブルによってバックアップされています：

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

> `Id < 0` のユーザーは除外されているため、[`Hashed`](https://clickhouse.com/blog/using-dictionaries-to-accelerate-queries) 辞書タイプを使用できます。`Id < 0`のユーザーはシステムユーザーです。

投稿テーブルに対して挿入時にこの辞書を利用するには、スキーマを変更する必要があります：

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

上記の例では、`Location` が `MATERIALIZED` カラムとして宣言されています。これは、値は `INSERT` クエリの一部として提供され、常に計算されることを意味します。

> ClickHouseはまた、[`DEFAULT`](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) カラムもサポートしています（値は指定しない場合に挿入または計算できます）。

テーブルをポピュレーターするために、通常の `INSERT INTO SELECT` を使用します：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これで、最も多くの投稿がどこから来ているかの場所の名前を取得できます：

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

## 応用辞書トピック {#advanced-dictionary-topics}

### 辞書 `LAYOUT` の選択 {#choosing-the-dictionary-layout}

`LAYOUT` 句は辞書の内部データ構造を制御します。いくつかのオプションが存在し、[ここ](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) に文書化されています。

### 辞書の更新 {#refreshing-dictionaries}

我々は辞書の `LIFETIME` を `MIN 600 MAX 900` と指定しました。LIFETIMEは辞書の更新間隔であり、ここでの値は600秒から900秒の間でランダムに再読み込みを引き起こします。このランダムな間隔は、大規模なサーバーで更新時の負荷を分散させるために必要です。更新時には、辞書の古いバージョンへのクエリは依然として可能であり、最初のロードのみがクエリをブロックします。`(LIFETIME(0))` を設定すると、辞書の更新が防止されます。

ClickHouseやPostgresのようなデータベースソースの場合、辞書が実際に変更された場合のみ更新されるクエリを設定できます（クエリの応答がこれを決定します）。さらに詳細は、[こちら](https://clickhouse.com/blog/using-dictionaries-to-accelerate-queries)で確認できます。

### その他の辞書タイプ {#other-dictionary-types}

ClickHouseは、[階層型](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)、[ポリゴン型](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)、および[正規表現](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)辞書もサポートしています。

### さらに読む {#more-reading}

- [辞書を使用してクエリを加速する](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書の高度な設定](/sql-reference/dictionaries)
