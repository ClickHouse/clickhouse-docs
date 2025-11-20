---
slug: /dictionary
title: 'ディクショナリ'
keywords: ['dictionary', 'dictionaries', 'ディクショナリ']
description: 'ディクショナリは、高速な検索を実現するためのキーバリュー形式のデータ表現を提供します。'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Dictionary

ClickHouseのDictionaryは、様々な[内部および外部ソース](/sql-reference/dictionaries#dictionary-sources)からのデータをメモリ内で[キー・バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)形式で表現し、超低レイテンシの検索クエリに最適化します。

Dictionaryは以下の用途に有用です:
- 特に`JOIN`と併用する場合のクエリパフォーマンスの向上
- データ取り込みプロセスを遅延させることなく、取り込み時にデータをリアルタイムで補完

<Image img={dictionaryUseCases} size="lg" alt="ClickHouseにおけるDictionaryのユースケース"/>



## Dictionaryを使用したJOINの高速化 {#speeding-up-joins-using-a-dictionary}

Dictionaryは、特定のタイプの`JOIN`を高速化するために使用できます。具体的には、結合キーが基盤となるキーバリューストレージのキー属性と一致する必要がある[`LEFT ANY`タイプ](/sql-reference/statements/select/join#supported-types-of-join)です。

<Image
  img={dictionaryLeftAnyJoin}
  size='sm'
  alt='LEFT ANY JOINでDictionaryを使用'
/>

この場合、ClickHouseはdictionaryを活用して[Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)を実行できます。これはClickHouseで最も高速な結合アルゴリズムであり、右側のテーブルの基盤となる[テーブルエンジン](/engines/table-engines)が低レイテンシのキーバリューリクエストをサポートしている場合に適用可能です。ClickHouseには、これを提供する3つのテーブルエンジンがあります:[Join](/engines/table-engines/special/join)(基本的に事前計算されたハッシュテーブル)、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、および[Dictionary](/engines/table-engines/special/dictionary)です。ここではdictionaryベースのアプローチについて説明しますが、3つのエンジンすべてで仕組みは同じです。

direct joinアルゴリズムでは、右側のテーブルがdictionaryによって支えられている必要があります。これにより、そのテーブルから結合されるデータが、低レイテンシのキーバリューデータ構造の形式で既にメモリ内に存在している状態になります。

### 例 {#example}

Stack Overflowデータセットを使用して、次の質問に答えてみましょう:
_Hacker NewsでSQLに関する最も議論を呼んだ投稿は何か?_

議論を呼んだ投稿とは、賛成票と反対票の数が同程度である投稿と定義します。この絶対差を計算し、0に近い値ほど議論を呼んだことを意味します。投稿には少なくとも10票の賛成票と反対票が必要であると仮定します。人々が投票しない投稿はあまり議論を呼んでいないためです。

データが正規化されている状態では、このクエリは現在、`posts`テーブルと`votes`テーブルを使用した`JOIN`が必要です:

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

> **`JOIN`の右側には小さなデータセットを使用する**: このクエリは、外側のクエリとサブクエリの両方で`PostId`のフィルタリングが行われているため、必要以上に冗長に見えるかもしれません。これはクエリの応答時間を高速に保つためのパフォーマンス最適化です。最適なパフォーマンスを得るには、常に`JOIN`の右側が小さなセットであり、可能な限り小さくなるようにしてください。JOINのパフォーマンス最適化のヒントと利用可能なアルゴリズムの理解については、[この一連のブログ記事](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を推奨します。

このクエリは高速ですが、良好なパフォーマンスを達成するには`JOIN`を慎重に記述する必要があります。理想的には、メトリックを計算するためにブログのサブセットの`UpVote`と`DownVote`のカウントを確認する前に、単に「SQL」を含む投稿にフィルタリングするだけで済むはずです。

#### dictionaryの適用 {#applying-a-dictionary}

これらの概念を実証するために、投票データにdictionaryを使用します。dictionaryは通常メモリ内に保持されるため([ssd_cache](/sql-reference/dictionaries#ssd_cache)は例外)、ユーザーはデータのサイズに注意する必要があります。`votes`テーブルのサイズを確認します:


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

辞書内のデータは非圧縮で保存されるため、すべてのカラムを辞書に格納する場合（実際には格納しませんが）、少なくとも4GBのメモリが必要になります。辞書はクラスタ全体で複製されるため、このメモリ量を*ノードごと*に確保する必要があります。

> 以下の例では、辞書のデータはClickHouseテーブルから取得されます。これは辞書の最も一般的なソースですが、ファイル、HTTP、[Postgres](/sql-reference/dictionaries#postgresql)を含むデータベースなど、[多数のソース](/sql-reference/dictionaries#dictionary-sources)がサポートされています。後述するように、辞書は自動更新が可能なため、頻繁に変更される小規模データセットを直接結合で利用できるようにする理想的な手段となります。

辞書には、検索を実行するための主キーが必要です。これは概念的にはトランザクショナルデータベースの主キーと同一であり、一意である必要があります。上記のクエリでは、結合キー`PostId`での検索が必要です。辞書には、`votes`テーブルから`PostId`ごとの賛成票と反対票の合計値を格納する必要があります。この辞書データを取得するクエリは以下の通りです:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

辞書を作成するには、以下のDDLが必要です。上記のクエリを使用している点に注意してください:

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

> セルフマネージド OSS では、上記のコマンドをすべてのノードで実行する必要があります。ClickHouse Cloud では、辞書は自動的にすべてのノードにレプリケートされます。上記は 64GB の RAM を搭載した ClickHouse Cloud ノードで実行され、ロードに 36 秒かかりました。

辞書が消費しているメモリを確認するには:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の`PostId`に対する賛成票と反対票の取得は、シンプルな`dictGet`関数で実現できます。以下では、投稿`11227902`の値を取得しています：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

これを先ほどのクエリに適用することで、JOINを削除できます:

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

3行のセット。経過時間: 0.551秒。処理済み: 1億1964万行、3.29 GB (毎秒2億1696万行、毎秒5.97 GB)
ピークメモリ使用量: 552.26 MiB。
```

このクエリはシンプルになっただけでなく、2倍以上高速化されました！さらに最適化するには、アップ投票とダウン投票がそれぞれ10以上ある投稿のみをディクショナリに読み込み、事前計算された論争値のみを保存する方法があります。


## クエリ時のデータエンリッチメント {#query-time-enrichment}

ディクショナリを使用すると、クエリ実行時に値を検索できます。これらの値は結果として返したり、集計処理に使用したりできます。例として、ユーザーIDを所在地にマッピングするディクショナリを作成してみましょう。

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

このディクショナリを使用して、投稿結果をエンリッチできます。

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

上記のJOINの例と同様に、同じディクショナリを使用して、投稿の大半がどの地域から発信されているかを効率的に判定できます。

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

上記の例では、クエリ時にディクショナリを使用してJOINを削除しました。ディクショナリは、挿入時に行をエンリッチするためにも使用できます。これは通常、エンリッチメント値が変更されず、ディクショナリの生成に使用できる外部ソースに存在する場合に適しています。この場合、挿入時に行をエンリッチすることで、クエリ時のディクショナリ参照を回避できます。

Stack Overflowのユーザーの`Location`が変更されないと仮定します(実際には変更されます)- 具体的には`users`テーブルの`Location`カラムです。postsテーブルに対して場所別の分析クエリを実行したいとします。このテーブルには`UserId`が含まれています。

ディクショナリは、`users`テーブルを基にしたユーザーIDから場所へのマッピングを提供します:

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

> `Id < 0`のユーザーを除外することで、`Hashed`ディクショナリタイプを使用できます。`Id < 0`のユーザーはシステムユーザーです。

postsテーブルの挿入時にこのディクショナリを活用するには、スキーマを変更する必要があります:

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

上記の例では、`Location`は`MATERIALIZED`カラムとして宣言されています。これは、値が常に計算され、`INSERT`クエリの一部として提供することはできないことを意味します。

> ClickHouseは[`DEFAULT`カラム](/sql-reference/statements/create/table#default_values)もサポートしています(値が提供されない場合、挿入または計算できます)。

テーブルにデータを投入するには、S3からの通常の`INSERT INTO SELECT`を使用できます:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これで、最も多くの投稿が発信された場所の名前を取得できます:

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


## 辞書の高度なトピック {#advanced-dictionary-topics}

### 辞書の`LAYOUT`の選択 {#choosing-the-dictionary-layout}

`LAYOUT`句は辞書の内部データ構造を制御します。複数のオプションが存在し、[こちら](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)に記載されています。適切なレイアウトを選択するためのヒントは[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)で確認できます。

### 辞書の更新 {#refreshing-dictionaries}

辞書に対して`MIN 600 MAX 900`の`LIFETIME`を指定しています。LIFETIMEは辞書の更新間隔であり、ここでの値は600秒から900秒の間のランダムな間隔で定期的な再読み込みを実行します。このランダムな間隔は、多数のサーバーで更新する際に辞書ソースへの負荷を分散するために必要です。更新中も辞書の古いバージョンに対してクエリを実行できますが、初回の読み込み時のみクエリがブロックされます。`(LIFETIME(0))`を設定すると辞書の更新が無効になることに注意してください。
辞書は`SYSTEM RELOAD DICTIONARY`コマンドを使用して強制的に再読み込みできます。

ClickHouseやPostgresなどのデータベースソースの場合、定期的な間隔ではなく、実際に変更があった場合にのみ辞書を更新するクエリを設定できます(クエリの応答がこれを判断します)。詳細は[こちら](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)で確認できます。

### その他の辞書タイプ {#other-dictionary-types}

ClickHouseは[階層型](/sql-reference/dictionaries#hierarchical-dictionaries)、[ポリゴン](/sql-reference/dictionaries#polygon-dictionaries)、[正規表現](/sql-reference/dictionaries#regexp-tree-dictionary)辞書もサポートしています。

### 参考資料 {#more-reading}

- [辞書を使用したクエリの高速化](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書の高度な設定](/sql-reference/dictionaries)
