---
slug: /dictionary
title: Dictionary
keywords: [dictionary, dictionaries]
description: 辞書はデータのキーバリュー表現を提供し、高速な検索を実現します。
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';


# Dictionary

ClickHouseにおける辞書は、さまざまな [内部および外部ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのインメモリ [キーバリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低遅延の検索クエリに最適化されています。

辞書は以下の目的に便利です：
- 特に `JOIN` を使用したクエリのパフォーマンスを向上させる
- 取り込まれたデータをリアルタイムで強化し、取り込みプロセスを遅延させない

<img src={dictionaryUseCases}
  class="image"
  alt="ClickHouseにおける辞書の利用ケース"
  style={{width: '100%', background: 'none'}} />

## 辞書を利用したJOINの高速化 {#speeding-up-joins-using-a-dictionary}

辞書は特定のタイプの `JOIN` を高速化するために使用できます：[`LEFT ANY` タイプ](/sql-reference/statements/select/join#supported-types-of-join) で、JOINキーが基盤となるキーバリュー・ストレージのキー属性と一致する必要があります。

<img src={dictionaryLeftAnyJoin}
  class="image"
  alt="LEFT ANY JOINを用いた辞書の活用"
  style={{width: '300px', background: 'none'}} />

この場合、ClickHouseは辞書を活用して [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join) を実行することができます。これはClickHouseの最も高速なJOINアルゴリズムであり、右側のテーブルエンジンが低遅延のキーバリュー要求をサポートする場合に適用されます。ClickHouseにはこれを提供する3つのテーブルエンジンがあります：[Join](/engines/table-engines/special/join) （基本的には事前計算されたハッシュテーブル）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、[Dictionary](/engines/table-engines/special/dictionary)。ここでは辞書ベースのアプローチについて説明しますが、メカニズムは3つのエンジンすべてに共通です。

ダイレクトJOINアルゴリズムは、右側のテーブルが辞書でサポートされており、JOINされたデータがすでにメモリ内に低遅延のキーバリューデータ構造の形で存在することを必要とします。

### 例 {#example}

Stack Overflowのデータセットを使用して、次の質問に答えます：
*Hacker Newsに関するSQLについて最も論争のある投稿は何ですか？*

私たちは、投稿が類似のアップ票とダウン票の数を持つ場合を論争的と定義します。この絶対差を計算し、0に近い値がより多くの論争を意味します。投稿には少なくとも10のアップ票とダウン票が必要であると仮定します。投票されていない投稿はあまり論争的ではありません。

データが正規化されると、このクエリは現在 `posts` テーブルと `votes` テーブルを使用した `JOIN` を必要とします：

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

>**`JOIN` の右側には小さなデータセットを使用する**: このクエリは、PostIdに関するフィルタリングが外部およびサブクエリの両方で行われるため、必要以上に冗長に見えるかもしれません。これは、クエリの応答時間を速くするためのパフォーマンス最適化です。最適なパフォーマンスを得るためには、常に `JOIN` の右側が小さなセットであり、可能な限り小さくするようにしてください。JOINのパフォーマンスを最適化し、利用可能なアルゴリズムを理解するためのヒントについては、[この一連のブログ記事](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1) をお勧めします。

このクエリは速いですが、良好なパフォーマンスを得るためには私たちが `JOIN` を注意深く記述する必要があります。理想的には、「SQL」を含む投稿をフィルタリングした後、そのサブセットのブログの `UpVote` と `DownVote` のカウントを考慮してメトリックを計算するだけで済みます。

#### 辞書の適用 {#applying-a-dictionary}

これらの概念を示すために、私たちは投票データに辞書を使用します。辞書は通常メモリ内に保持され、[ssd_cache](/sql-reference/dictionaries#ssd_cache) は例外ですので、ユーザーはデータのサイズに留意する必要があります。我々の `votes` テーブルのサイズを確認します：

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

データは辞書内で非圧縮形式で保存されるため、もし全てのカラムを辞書内に保存する場合には、少なくとも4GBのメモリが必要です（実際には保存しません）。辞書はクラスター全体にレプリケートされるため、この量のメモリは*ノードごと*に確保する必要があります。

> 以下の例では、我々の辞書のデータはClickHouseのテーブルから取得されます。これは辞書の最も一般的なソースを表していますが、[さまざまなソース](/sql-reference/dictionaries#dictionary-sources)がサポートされています。ファイル、HTTP、Postgresなどのデータベースも含まれます。我々が示すように、辞書は自動的に更新可能であり、頻繁に変更される小規模データセットを直接JOIN可能に保つ理想的な方法を提供します。

我々の辞書には、検索が行われるプライマリキーが必要です。これは概念的にトランザクショナルデータベースの主キーに相当し、ユニークである必要があります。上記のクエリは、JOINキーに対して検索を必要とします - `PostId`。辞書は、`votes` テーブルからの `PostId` ごとのアップ票とダウン票の合計で満たされる必要があります。辞書データを取得するためのクエリは以下の通りです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

辞書を作成するには、次のDDLが必要です - 上記のクエリを使用することに注意してください：

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

> セルフマネージドのOSSでは、上記のコマンドはすべてのノードで実行する必要があります。ClickHouse Cloudでは、辞書は自動的にすべてのノードにレプリケートされます。上記は、36秒でロードされた64GBのRAMを持つClickHouse Cloudノードで実行されました。

我々の辞書が消費したメモリを確認します：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の `PostId` に対してアップ票とダウン票を取得することは、単純な `dictGet` 関数を用いて今や達成できます。以下では、投稿 `11227902` の値を取得します：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘


これを先ほどのクエリに活用すると、`JOIN` を削除できます：

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
WHERE (Id IN (PostIds)) AND (UpVotes > 10) AND (UpVotes > 10)
ORDER BY Controversial_ratio ASC
LIMIT 3

3 rows in set. Elapsed: 0.551 sec. Processed 119.64 million rows, 3.29 GB (216.96 million rows/s., 5.97 GB/s.)
Peak memory usage: 552.26 MiB.
```

このクエリは、単純であるだけでなく、二倍以上速いです！さらに、ダウン票とアップ票の両方が10以上の投稿のみを辞書にロードして、事前に計算された論争値を保存することでもっと最適化できる可能性があります。

## クエリ時間でのデータ強化 {#query-time-enrichment}

辞書はクエリ時間に値を検索するために使用できます。これらの値は結果に返されるか、集約に使用される可能性があります。ユーザーIDをその場所にマッピングする辞書を作成するとします：

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

この辞書を使用して、投稿結果を強化することができます：

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

上記のJOINの例と同様に、同じ辞書を使用して、どの場所から投稿が最も多く発生するかを効率的に判断できます：

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

## インデックス時間でのデータ強化 {#index-time-enrichment}

上記の例では、我々はクエリ時間に辞書を使用してJOINを削除しました。辞書はまた、挿入時間に行を強化するためにも使用できます。これは、強化された値が変更されず、辞書を構成するために使用できる外部ソースに存在する場合に通常適切です。この場合、挿入時間に行を強化することで、辞書へのクエリ時間の検索を回避します。

Stack Overflowのユーザーの`Location`が決して変わらないと仮定しましょう（実際には変わります）。特に、`users` テーブルの `Location` カラムです。投稿テーブルをロケーション別に分析するクエリを実行したいとします。これには `UserId` が含まれています。

辞書は、ユーザーIDを場所にマッピングし、`users` テーブルによってサポートされます：

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

> `Id < 0` のユーザーは省略しており、これにより `Hashed` 辞書タイプを使用することができます。`Id < 0` のユーザーはシステムユーザーです。

投稿テーブルでこの辞書を挿入時間に活用するには、スキーマを変更する必要があります：

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

> ClickHouseはまた、[`DEFAULT` カラム](/sql-reference/statements/create/table#default_values)（値が提供されていない場合に挿入または計算される可能性があるカラム）をサポートします。

テーブルをpopulationするには、通常の `INSERT INTO SELECT` を使用してS3から取得できます：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これで、最も多くの投稿が発生する場所の名前を取得できます：

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

### 辞書の`LAYOUT`を選択する {#choosing-the-dictionary-layout}

`LAYOUT` 句は、辞書の内部データ構造を制御します。いくつかのオプションが存在し、[ここ](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory) に記載されています。正しいレイアウトを選択するためのヒントは[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) にあります。

### 辞書の更新 {#refreshing-dictionaries}

我々は辞書に対して `LIFETIME` として `MIN 600 MAX 900` を指定しました。LIFETIMEは辞書の更新間隔であり、ここでの値により600秒から900秒の間でランダムな間隔で定期的にリロードが行われます。このランダムな間隔は、多数のサーバーで更新する際の辞書ソースへの負荷を分散させるために必要です。更新中は、辞書の古いバージョンに対してクエリを実行できますが、最初のロードのみがクエリをブロックします。`(LIFETIME(0))`を設定すると、辞書の更新を防ぎます。
データベースソース（ClickHouseやPostgresなど）に対しては、辞書を実際に変更された場合のみ更新するクエリを設定できます（クエリの応答がこれを決定します）。さらなる詳細は[こちら](https://sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) に記載されています。

### その他の辞書タイプ {#other-dictionary-types}

ClickHouseはまた、[階層的](/sql-reference/dictionaries#hierarchical-dictionaries)、[ポリゴン](/sql-reference/dictionaries#polygon-dictionaries)、[正規表現](/sql-reference/dictionaries#regexp-tree-dictionary) 辞書をサポートしています。

### さらなる情報 {#more-reading}

- [辞書を使用してクエリを加速する](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書の高度な設定](/sql-reference/dictionaries)
