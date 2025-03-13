---
slug: /dictionary
title: 辞書
keywords: [辞書, 辞書]
description: ディクショナリーは、データのキーと値の表現を提供し、高速なルックアップを実現します。
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';


# 辞書

ClickHouse のディクショナリーは、さまざまな [内部および外部ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのインメモリ [キーと値](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低遅延のルックアップクエリを最適化します。

ディクショナリーは以下の用途に役立ちます：
- 特に `JOIN` と併用したときのクエリパフォーマンスを向上させる
- データの取り込みプロセスを遅延させずに、取り込まれたデータをその場でリッチ化する

<img src={dictionaryUseCases}
  class="image"
  alt="ClickHouseにおけるディクショナリーの使用ケース"
  style={{width: '100%', background: 'none'}} />

## Speeding up joins using a Dictionary {#speeding-up-joins-using-a-dictionary}

ディクショナリーは、特定のタイプの `JOIN` を高速化するために使用できます： [`LEFT ANY` タイプ](/sql-reference/statements/select/join#supported-types-of-join) で、結合キーは基となるキーと値のストレージのキー属性と一致する必要があります。

<img src={dictionaryLeftAnyJoin}
  class="image"
  alt="LEFT ANY JOINでのディクショナリーの使用"
  style={{width: '300px', background: 'none'}} />

この場合、ClickHouse はディクショナリーを活用して [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join) を実行できます。これはClickHouseの最速の結合アルゴリズムであり、右側のテーブルが低遅延のキーと値のリクエストをサポートするテーブルエンジンを使用している場合に適用されます。ClickHouse には、この機能を提供する3つのテーブルエンジンがあります：[Join](/engines/table-engines/special/join)（基本的に事前計算されたハッシュテーブル）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、および [Dictionary](/engines/table-engines/special/dictionary) です。ここではディクショナリーに基づくアプローチを説明しますが、メカニズムはすべての3つのエンジンで同じです。

直接結合アルゴリズムでは、右側のテーブルがディクショナリーにバックアップされている必要があり、そのテーブルから結合するデータがすでにメモリ内に低遅延のキーと値のデータ構造の形で存在している必要があります。

### Example {#example}

Stack Overflow データセットを使用して、次の質問に答えます：
*Hacker News の SQL に関する最も物議を醸す投稿は何ですか？*

物議を醸すとは、投稿のアップおよびダウン投票の数が類似している場合と定義します。私たちはこの絶対的な差を計算し、0 に近い値がより物議を醸すことを意味します。投稿は少なくとも10のアップとダウンの投票が必要だと仮定します - 投票されない投稿はあまり物議を醸しません。

データが正規化されている場合、このクエリは現在 `posts` テーブルと `votes` テーブルを使用して `JOIN` を必要とします：

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

>**右側の `JOIN` で小さなデータセットを使用する**：このクエリは、必要以上に冗長に見えるかもしれません。`PostId` でのフィルタリングが外側のクエリとサブクエリの両方で発生します。これは、クエリの応答時間を迅速にするためのパフォーマンス最適化です。最適なパフォーマンスを得るためには、常に `JOIN` の右側が小さいセットで、可能な限り小さいことを確認してください。`JOIN` のパフォーマンスを最適化し、利用可能なアルゴリズムを理解するためのヒントについては、[この一連のブログ記事](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)をお勧めします。

このクエリは迅速ですが、良好なパフォーマンスを達成するためには、`JOIN` を慎重に記述する必要があります。理想的には、`UpVote` と `DownVote` のカウントを計算するために、`SQL` を含む投稿をフィルタリングするだけで済むはずです。

#### Applying a dictionary {#applying-a-dictionary}

これらの概念を示すために、私たちは投票データにディクショナリーを使用します。ディクショナリーは通常メモリ内に保持されますが、[ssd_cache](/sql-reference/dictionaries#ssd_cache) が例外ですので、ユーザーはデータのサイズに注意する必要があります。`votes` テーブルのサイズを確認します：

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

データはディクショナリー内で非圧縮で保存されるため、すべてのカラム（私たちはそうしませんが）をディクショナリーに保存する場合、少なくとも4GBのメモリが必要です。ディクショナリーはクラスタ全体にレプリケートされるため、このメモリ量は *各ノードごと* に確保する必要があります。

> 以下の例では、ディクショナリーのデータは ClickHouse テーブルから派生しています。これはディクショナリーの最も一般的なソースですが、ファイル、http、[Postgres](/sql-reference/dictionaries#postgresql) などのデータベースを含む [多くのソース](/sql-reference/dictionaries#dictionary-sources) がサポートされています。例示するように、ディクショナリーは自動的に更新され、小さいデータセットが頻繁に変更される場合に直接結合に利用できる理想的な方法を提供します。

私たちのディクショナリーは、ルックアップを実行するための主キーが必要です。これは、トランザクショナルデータベースの主キーと概念的に同じで、ユニークである必要があります。上記のクエリは、結合キー - `PostId` のルックアップを必要とします。ディクショナリーは、`votes` テーブルからの各 `PostId` に対するアップ票とダウン票の合計で構成される必要があります。このディクショナリーのデータを取得するためのクエリは次の通りです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

ディクショナリーを作成するには、次の DDL が必要です - 上記のクエリを使用しています：

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

> セルフマネージド OSS では、上記のコマンドはすべてのノードで実行する必要があります。ClickHouse Cloud では、ディクショナリーがすべてのノードに自動的にレプリケートされます。上記は、64GBのRAMを搭載したClickHouse Cloudノードで実行され、36秒でロードされました。

ディクショナリーによって消費されるメモリを確認します：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の `PostId` のアップ票とダウン票を取得するためには、シンプルな `dictGet` 関数を使用できます。以下に、投稿 `11227902` の値を取得します：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

以前のクエリにこれを活用することで、`JOIN` を削除できます：

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

このクエリは非常にシンプルであるだけでなく、実行速度も2倍以上向上しています！さらに最適化するためには、10票以上のアップ票とダウン票を持つ投稿のみをディクショナリーにロードし、予め計算された物議の値を保存することが可能です。

## Query time enrichment {#query-time-enrichment}

ディクショナリーは、クエリ時に値をルックアップするために使用できます。これらの値は結果に返されるか、集計に使用されます。たとえば、ユーザーIDをその場所にマッピングするディクショナリーを作成しましょう：

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

このディクショナリーを使用して、投稿結果をリッチ化できます：

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

上記の結合の例と同様に、同じディクショナリーを使用して、投稿の多くがどこから来ているのかを効率的に特定できます：

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

## Index time enrichment {#index-time-enrichment}

上の例では、クエリ時にディクショナリーを使用して結合を削除しました。ディクショナリーは、挿入時に行をリッチ化するためにも使用できます。これは通常、強化値が変更せず、外部ソースに存在していてディクショナリーをポピュレートするために使用できる場合に適しています。この場合、挿入時に行をリッチ化することで、ディクショナリーへのクエリ時のルックアップを回避します。

Stack Overflow のユーザーの `Location` が変更されないと仮定します（実際には変更されます） - 特に `users` テーブルの `Location` カラムです。投稿テーブルを場所別に分析したいとしましょう。このテーブルには `UserId` が含まれています。

ディクショナリーは、ユーザーIDを場所にマッピングするもので、`users` テーブルによってバックアップされています：

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

> `Id < 0` のユーザーは除外します。これにより、`Hashed` ディクショナリータイプを使用できます。`Id < 0` のユーザーはシステムユーザーです。

このディクショナリーを利用して挿入時に投稿テーブルを強化するには、スキーマを変更する必要があります：

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

上記の例では、`Location` が `MATERIALIZED` カラムとして宣言されています。これは、値が `INSERT` クエリの一部として提供され、常に計算されることを意味します。

> ClickHouse は、提供されない場合に値を挿入または計算できる [`DEFAULT` カラム](/sql-reference/statements/create/table#default_values) もサポートしています。

テーブルをポピュレートするには、S3 から通常の `INSERT INTO SELECT` を使用できます：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これで、ほとんどの投稿がどこから来ているのかを示す場所の名前を取得できます：

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

## Advanced Dictionary Topics {#advanced-dictionary-topics}

### Choosing the Dictionary `LAYOUT` {#choosing-the-dictionary-layout}

`LAYOUT` 句は、ディクショナリーの内部データ構造を制御します。いくつかのオプションが存在し、[ここ](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) に文書化されています。正しいレイアウトを選択するためのいくつかのヒントは [ここ](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory) にあります。

### Refreshing dictionaries {#refreshing-dictionaries}

ディクショナリーに `LIFETIME` を `MIN 600 MAX 900` と指定しています。LIFETIME はディクショナリーの更新間隔であり、ここでの値は600秒から900秒の間のランダムな間隔での定期的なリロードを引き起こします。このランダムな間隔は、大量のサーバーで更新する際にディクショナリーソースへの負荷を分散させるために必要です。更新中、ディクショナリーの古いバージョンはまだクエリでき、初回のロードのみがクエリをブロックします。`(LIFETIME(0))`を設定すると、ディクショナリーが更新されないことに注意してください。
ディクショナリーは `SYSTEM RELOAD DICTIONARY` コマンドを使用して強制的にリロードできます。

ClickHouse や Postgres などのデータベースソースでは、ディクショナリーを更新するためのクエリを設定して、定期的な間隔で更新されるのではなく、実際に変更があった場合のみ更新することができます。これについての詳細は [ここ](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) にあります。

### Other dictionary types {#other-dictionary-types}

ClickHouse は、[階層型](/sql-reference/dictionaries#hierarchical-dictionaries)、[ポリゴン](/sql-reference/dictionaries#polygon-dictionaries)、および [正規表現](/sql-reference/dictionaries#regexp-tree-dictionary) ディクショナリーもサポートしています。

### More reading {#more-reading}

- [ディクショナリーを使用してクエリを高速化する](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [ディクショナリーの高度な設定](/sql-reference/dictionaries)
