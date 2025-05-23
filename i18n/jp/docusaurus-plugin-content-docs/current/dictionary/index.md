---
'slug': '/dictionary'
'title': 'Dictionary'
'keywords':
- 'dictionary'
- 'dictionaries'
'description': 'A dictionary provides a key-value representation of data for fast
  lookups.'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Dictionary

ClickHouseの辞書は、さまざまな [内部および外部ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのインメモリ [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低レイテンシのルックアップクエリを最適化します。

辞書は次のために便利です：
- 特に `JOIN` と共に使用することで、クエリのパフォーマンスを向上させる
- データ取り込みプロセスを遅延させずに、取得したデータをその場で豊かにする

<Image img={dictionaryUseCases} size="lg" alt="ClickHouseにおける辞書の利用ケース"/>

## 辞書を使ったJOINの高速化 {#speeding-up-joins-using-a-dictionary}

辞書は特定のタイプの `JOIN` を高速化するために使用できます： [`LEFT ANY` タイプ](/sql-reference/statements/select/join#supported-types-of-join) で、結合キーが基礎となるキーバリューストレージのキー属性に一致する必要があります。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="LEFT ANY JOINでの辞書の使用"/>

この場合、ClickHouseは辞書を活用して [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join) を実行できます。これはClickHouseの最も高速な結合アルゴリズムであり、右側のテーブルの基礎となる [テーブルエンジン](/engines/table-engines) が低レイテンシのキーバリューリクエストをサポートしている場合に適用可能です。ClickHouseにはこれを提供する3つのテーブルエンジンがあります：[Join](/engines/table-engines/special/join)（基本的には事前計算されたハッシュテーブル）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) および [Dictionary](/engines/table-engines/special/dictionary)。辞書ベースのアプローチについて説明しますが、メカニズムは3つのエンジンで同じです。

ダイレクトジョインアルゴリズムでは、右側のテーブルが辞書でバックアップされている必要があります。そのため、結合されるデータはすでにメモリ内に低レイテンシのキーバリューデータ構造の形で存在している必要があります。

### 例 {#example}

Stack Overflowのデータセットを使用して、次の質問に答えましょう：
*Hacker NewsでSQLに関する最も物議を醸す投稿は何ですか？*

物議を醸すとは、投稿が似たような数のアップ票とダウン票を持つ場合と定義します。この絶対的な差を計算し、値が0に近いほど物議を醸すものとします。投稿には最低10のアップ票とダウン票が必要であると仮定します - 票を投じられない投稿はあまり物議を醸しません。

データを正規化すると、現在このクエリは `posts` テーブルと `votes` テーブルを使用した `JOIN` を必要とします：

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

>**`JOIN`の右側に小さいデータセットを使用する**：このクエリは、`PostId` に対するフィルタリングが外部および内部両方のクエリで行われているため、必要以上に冗長に見えるかもしれません。これは、クエリ応答時間を速くするためのパフォーマンス最適化です。最適なパフォーマンスのためには、常に `JOIN` の右側がより小さいセットであることを確認し、できるだけ小さくします。 `JOIN` のパフォーマンスを最適化し、利用可能なアルゴリズムを理解するためのヒントについては、[このブログ記事のシリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1) をお勧めします。

このクエリは速いですが、良好なパフォーマンスを達成するために `JOIN` を慎重に書く必要があります。理想的には、`UpVote` と `DownVote` のカウントを確認する前に、"SQL" を含む投稿にフィルターをかけたいところです。

#### 辞書の適用 {#applying-a-dictionary}

これらの概念を示すために、私たちは投票データのために辞書を使用します。辞書は通常、メモリ内に保持されます（[ssd_cache](/sql-reference/dictionaries#ssd_cache) は例外です）、ユーザーはデータのサイズに注意する必要があります。`votes` テーブルのサイズを確認します：

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

データは辞書に未圧縮で保存されるため、すべてのカラムを辞書に保存する場合は、少なくとも4GBのメモリが必要です（実際には保存しません）。辞書はクラスタ全体にレプリケートされるため、このメモリ量は*ノードごと*に予約する必要があります。

> 下記の例では、私たちの辞書のデータはClickHouseテーブルに由来しています。これは辞書の最も一般的なソースですが、[ファイル](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)、http、および [Postgres](/sql-reference/dictionaries#postgresql) を含むデータベースを含む多くのソースがサポートされています。辞書は自動的に更新されることができ、頻繁に変更される小さなデータセットが直接結合に利用できるようにする理想的な方法です。

私たちの辞書は、ルックアップが行われる主キーを必要とします。これは、トランザクショナルデータベースの主キーと概念的に同じで、一意である必要があります。上記のクエリでは、結合キー `PostId` に対してルックアップが必要です。辞書は、その結果、`votes` テーブルからの `PostId` ごとのアップ票とダウン票の合計で埋め込まれるべきです。以下は、この辞書データを取得するためのクエリです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

辞書を作成するには、次のDDLが必要です - 上述のクエリを使用していることに注意してください：

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

> セルフマネージドOSSでは、上記のコマンドはすべてのノードで実行する必要があります。ClickHouse Cloudでは、辞書は自動的にすべてのノードにレプリケートされます。上記は64GBのRAMを持つClickHouse Cloudノードで実行され、読み込みに36秒かかりました。

辞書によって消費されるメモリを確認するには：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の `PostId` に対してアップ票とダウン票を取得するのは、単純な `dictGet` 関数を使用して実行できます。以下に、投稿 `11227902` の値を取得します：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

これを以前のクエリに利用することで、JOINを削除できます：

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

このクエリははるかにシンプルで、速度も2倍以上向上しています！これはさらに最適化でき、10以上のアップ票とダウン票を持つ投稿のみを辞書に読み込むこと及び事前計算された物議の値を保存することも可能です。

## クエリ時の補強 {#query-time-enrichment}

辞書はクエリ時に値をルックアップするためにも使用できます。これらの値は結果に返されるか、集計に使用されます。ユーザーIDを場所にマッピングする辞書を作成しましょう：

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

この辞書を使用して投稿結果を補強できます：

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

上記のJOINの例と同様に、この辞書を使って、最も多くの投稿がどこから来ているかを効率的に特定することもできます：

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

## インデックス時の補強 {#index-time-enrichment}

上記の例では、JOINを削除するためにクエリ時に辞書を使用しました。辞書は挿入時に行を補強するためにも使用できます。これは、補強値が変更されず、辞書を埋め込むために使用できる外部ソースに存在する場合に一般的に適切です。この場合、挿入時に行を補強することで、辞書へのクエリ時のルックアップを回避できます。

もしStack Overflowのユーザーの `Location` が決して変更されないと仮定しましょう（実際には変更されますが） - 明確には `users` テーブルの `Location` 列です。ポストテーブルに対してロケーション別の分析クエリを行いたいとします。ここには `UserId` が含まれています。

辞書はユーザーIDからロケーションへのマッピングを提供し、`users` テーブルでバックアップされます：

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

> `Id < 0` のユーザーを省略し、`Hashed` 辞書タイプを使用できるようにします。 `Id < 0` のユーザーはシステムユーザーです。

この辞書を投稿テーブルの挿入時に利用するには、スキーマを変更する必要があります：

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

上記の例では、`Location` が `MATERIALIZED` カラムとして宣言されています。これは、値を `INSERT` クエリの一部として提供でき、常に計算されることを意味します。

> ClickHouseは [`DEFAULT` カラム](/sql-reference/statements/create/table#default_values) もサポートしています（値は提供されない場合に挿入または計算できます）。

テーブルを埋めるために、通常の `INSERT INTO SELECT` をS3から使用できます：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

今や、最も多くの投稿がどこから来ているのかを得ることができます：

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

### 辞書の `LAYOUT` の選択 {#choosing-the-dictionary-layout}

`LAYOUT` 句は、辞書の内部データ構造を制御します。いくつかのオプションが存在し、[こちらで文書化されています](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)。正しいレイアウトを選択するためのヒントは[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)にあります。

### 辞書の更新 {#refreshing-dictionaries}

辞書に対して `LIFETIME` を `MIN 600 MAX 900` と指定しました。LIFETIMEは、辞書の更新間隔で、ここでの値は600秒から900秒の間のランダムな間隔での定期的な再読み込みを引き起こします。このランダムな間隔は、大規模なサーバーで更新する際に辞書ソースへの負荷を分散するために必要です。更新中は、古いバージョンの辞書もクエリ可能で、初期読み込みのみがクエリをブロックします。`(LIFETIME(0))`を設定すると、辞書の更新が防止されます。
ClickHouseやPostgresなどのデータベースソースでは、クエリの応答が実際に変わった場合にのみ辞書を更新するクエリを設定できます（定期的な間隔ではなく）。詳細は[こちら](https://sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)で確認できます。

### その他の辞書タイプ {#other-dictionary-types}

ClickHouseは、[階層的](/sql-reference/dictionaries#hierarchical-dictionaries)、[多角形](/sql-reference/dictionaries#polygon-dictionaries)、および [正規表現](/sql-reference/dictionaries#regexp-tree-dictionary) 辞書もサポートしています。

### さらに読む {#more-reading}

- [辞書を使用してクエリを加速する](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書の高度な構成](/sql-reference/dictionaries)
