---
slug: /dictionary
title: Dictionary
keywords: [dictionary, dictionaries]
description: 辞書は、データのキー-バリュー表現を提供し、迅速なルックアップを実現します。
---

# Dictionary

ClickHouseにおける辞書は、さまざまな[内部および外部データソース](/sql-reference/dictionaries#dictionary-sources)からのデータをメモリ上で[キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)として表現し、超低レイテンシのルックアップクエリに最適化されています。

辞書は以下の用途に役立ちます：
- 特に`JOIN`と併用した場合のクエリパフォーマンスの向上
- データの取り込みプロセスを遅延させることなく、インジェストされたデータの即時の強化

![ClickHouseにおける辞書の使用ケース](./images/dictionary-use-cases.png)

## 辞書を利用した結合の高速化 {#speeding-up-joins-using-a-dictionary}

辞書は特定のタイプの`JOIN`を高速化するために使用できます：[`LEFT ANY`タイプ](/sql-reference/statements/select/join#supported-types-of-join)で、結合キーが基盤となるキー-バリューストレージのキー属性に一致する必要があります。

<img src={require('./images/dictionary-left-any-join.png').default}    
  class='image'
  alt='LEFT ANY JOINでの辞書の使用'
  style={{width: '300px', background: 'none'}} />

この場合、ClickHouseは辞書を利用して[ダイレクトジョイン](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)を行うことができます。これはClickHouseの最も高速な結合アルゴリズムであり、右側のテーブルの[テーブルエンジン](/engines/table-engines)が低レイテンシのキー-バリューリクエストをサポートしている場合に適用されます。ClickHouseにはこれを提供する3つのテーブルエンジンがあります：[Join](/engines/table-engines/special/join)（基本的には事前に計算されたハッシュテーブル）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、および[Dictionary](/engines/table-engines/special/dictionary)です。辞書ベースのアプローチについて説明しますが、メカニズムはすべてのエンジンに対して同じです。

ダイレクトジョインアルゴリズムでは、右側のテーブルが辞書でサポートされている必要があり、そのテーブルから結合されるデータはすでにメモリ内に低レイテンシのキー-バリューデータ構造として存在している必要があります。

### 例 {#example}

Stack Overflowデータセットを使用して、次の質問に回答します：
*Hacker NewsにおけるSQLに関する最も物議を醸す投稿は何ですか？*

物議を醸すというのは、投稿が同じ数のアップ票とダウン票を持つ場合と定義します。この絶対差を計算し、0に近い値がより物議を醸すことを意味します。投稿は少なくとも10票のアップ票とダウン票を持つと仮定します - 人々が投票しない投稿はあまり物議を醸しません。

データが正規化されているため、このクエリは現在、`posts`と`votes`テーブルを使用した`JOIN`を必要とします：

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
Id:              	25372161
Title:           	How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:         	13
DownVotes:       	13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**`JOIN`の右側では小さいデータセットを使用してください**：このクエリは、`PostId`sに対するフィルタリングが外側と内部の両方のクエリで発生しているため、必要以上に冗長に見えるかもしれません。これは、クエリ応答時間を迅速にするためのパフォーマンスの最適化です。最適なパフォーマンスを得るためには、常に`JOIN`の右側が小さいセットであることを確認し、できるだけ小さくしてください。`JOIN`パフォーマンスを最適化し、利用可能なアルゴリズムを理解するためのヒントについては、[この一連のブログ記事](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を推奨します。

このクエリは速いですが、良好なパフォーマンスを得るためには`JOIN`を注意深く記述する必要があります。理想的には、「SQL」を含む投稿をフィルタリングした後で、対象のブログの`UpVote`と`DownVote`のカウントを調べてメトリックを計算したいところです。 

#### 辞書の適用 {#applying-a-dictionary}

これらの概念を示すために、私たちは投票データに辞書を使用します。辞書は通常メモリに保持されるため（[ssd_cache](/sql-reference/dictionaries#ssd_cache)が例外です）、ユーザーはデータのサイズに注意を払う必要があります。`votes`テーブルのサイズを確認します：

```sql
SELECT table,
	formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
	formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
	round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes │ 1.25 GiB    	│ 3.79 GiB      	│  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

データは辞書内に非圧縮で保存されるため、すべてのカラムを辞書に保存する場合、最低でも4GBのメモリが必要です（実際には保存しません）。辞書はクラスター全体にレプリケートされるため、このメモリ量は*ノードごとに*予約する必要があります。

>以下の例では、辞書のデータはClickHouseテーブルから取得されます。これは辞書の最も一般的なソースを表しますが、[さまざまなソース](/sql-reference/dictionaries#dictionary-sources)がサポートされており、ファイル、HTTP、[Postgres](/sql-reference/dictionaries#postgresql)を含むデータベースが含まれます。示すように、辞書は自動的に更新されるため、頻繁に変更される小さなデータセットがダイレクトジョインに利用可能になります。

私たちの辞書は、ルックアップを実行するために主キーを必要とします。これは、トランザクションデータベースの主キーと概念的に同じで、ユニークである必要があります。上記のクエリでは結合キー`PostId`のルックアップが必要です。辞書は、`votes`テーブルから各`PostId`のアップ票とダウン票の合計で構成される必要があります。これが辞書データを取得するためのクエリです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

辞書を作成するには、次のDDLが必要です。上記のクエリを使用してください：

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

> セルフマネージドOSSでは、上記のコマンドをすべてのノードで実行する必要があります。ClickHouse Cloudでは、辞書がすべてのノードに自動的にレプリケートされます。上記のコマンドは64GBのRAMを持つClickHouse Cloudノードで実行され、読み込みには36秒かかりました。

辞書が消費するメモリを確認します：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の`PostId`に対するアップ票とダウン票を取得するには、シンプルな`dictGet`関数を使用できるようになりました。以下は投稿`11227902`の値を取得します：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘


これを以前のクエリに活用すると、`JOIN`を除去できます：

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

このクエリはずっとシンプルであり、実行速度も2倍以上速いです！さらに、辞書に10票以上のアップ票とダウン票を持つ投稿のみをロードし、前計算された物議の値を保存することで、最適化を進めることができます。

## クエリ時の強化 {#query-time-enrichment}

辞書はクエリ時に値をルックアップするために使用できます。これらの値は結果として返されるか、集計のために使用されます。ユーザーIDを位置にマップする辞書を作成するとしましょう：

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

この辞書を使用して、投稿結果の強化を行うことができます：

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
│ 52296928 │ Comparision between two Strings in ClickHouse             	│ Spain             	│
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi │
│ 61452077 │ How to change PARTITION in clickhouse                     	│ Guangzhou, 广东省中国 │
│ 55608325 │ Clickhouse select last record without max() on all table  	│ Moscow, Russia    	│
│ 55758594 │ ClickHouse create temporary table                         	│ Perm', Russia     	│
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

上記の結合例と同様に、同じ辞書を使用して、投稿の大半がどこから来ているかを効率的に判断することもできます：

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
│ India              	│ 787814 │
│ Germany            	│ 685347 │
│ United States      	│ 595818 │
│ London, United Kingdom │ 538738 │
│ United Kingdom     	│ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## インデックス時の強化 {#index-time-enrichment}

上記の例では、結合を取り除くためにクエリ時に辞書を使用しました。辞書は、挿入時に行を強化するためにも使用できます。これは、強化された値が変更されず、外部ソースに存在する場合に通常適しています。この場合、挿入時に行を強化すると、辞書へのクエリ時のルックアップを回避できます。

Stack Overflowのユーザーの`Location`が決して変更されない（実際には変更されますが）と仮定します - 特に`users`テーブルの`Location`カラムです。位置で投稿テーブルの分析クエリを実行したいとしましょう。この投稿には`UserId`が含まれています。

辞書は、ユーザーIDから位置へのマッピングを提供し、`users`テーブルにバックアップされています：

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

> `Id < 0`のユーザーは省略しており、これにより`Hashed`辞書タイプを使用できます。`Id < 0`のユーザーはシステムユーザーです。

投稿テーブルの挿入時にこの辞書を活用するには、スキーマを変更する必要があります：

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
     …
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

上記の例では、`Location`が`MATERIALIZED`カラムとして宣言されています。これは、値が`INSERT`クエリの一部として提供され、常に計算されることを意味します。

> ClickHouseは[`DEFAULT`カラム](/sql-reference/statements/create/table#default_values)もサポートしており（値が提供されない場合に挿入または計算できます）。

テーブルを埋めるには、通常の`INSERT INTO SELECT`をS3から実行します：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これで、どの位置からほとんどの投稿が発信されているかを取得できるようになりました：

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

`LAYOUT`句は辞書の内部データ構造を制御します。いくつかのオプションが存在し、[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)に記載されているいくつかのヒントが含まれています。

### 辞書の更新 {#refreshing-dictionaries}

辞書には`LIFETIME`が`MIN 600 MAX 900`と指定されています。LIFETIMEは辞書の更新間隔であり、ここでの値は600秒から900秒の間のランダムな間隔で定期的に再読み込みされます。このランダムな間隔は、多数のサーバーで更新時に辞書ソースへの負荷を分散させるために必要です。更新中は、辞書の古いバージョンに対してのクエリが可能であり、初回の読み込みがクエリをブロックします。（LIFETIME(0)）を設定すると、辞書の更新を防ぎます。

ClickHouseやPostgresなどのデータベースソースでは、実際に変更があった場合のみ辞書を更新するクエリを設定できます（この応答がこれを決定します）ので、定期的な間隔での更新ではなくなります。詳細は[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#refreshing-dictionary-data-using-lifetime)にあります。

### その他の辞書の種類 {#other-dictionary-types}

ClickHouseは[階層型辞書](/sql-reference/dictionaries#hierarchical-dictionaries)、[ポリゴン辞書](/sql-reference/dictionaries#polygon-dictionaries)、および[正規表現辞書](/sql-reference/dictionaries#regexp-tree-dictionary)もサポートしています。

### さらに読む {#more-reading}

- [辞書を使用してクエリを加速する](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書の高度な設定](/sql-reference/dictionaries)
