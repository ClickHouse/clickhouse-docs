---
slug: /dictionary
title: '辞書'
keywords: ['辞書', '辞書型']
description: '辞書は、高速なルックアップのためにデータをキーと値のペアで表現する構造です。'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Dictionary

ClickHouse における Dictionary は、さまざまな[内部および外部ソース](/sql-reference/dictionaries#dictionary-sources)からのデータをメモリ上の [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式で表現し、きわめて低レイテンシなルックアップクエリ向けに最適化したものです。

Dictionary は次のような用途に役立ちます:
- 特に `JOIN` と組み合わせて使用する場合に、クエリのパフォーマンスを向上させる
- インジェスト処理を低速化させることなく、その場でインジェストされたデータを拡充する

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse における Dictionary のユースケース"/>



## Dictionary を使用した JOIN の高速化

Dictionary は、特定タイプの `JOIN`、すなわち結合キーが基礎となるキー・バリュー型ストレージのキー属性と一致する必要がある [`LEFT ANY` 型](/sql-reference/statements/select/join#supported-types-of-join) を高速化するために利用できます。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="LEFT ANY JOIN で Dictionary を使用する" />

この条件が満たされる場合、ClickHouse は Dictionary を利用して [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join) を実行できます。これは ClickHouse における最速の JOIN アルゴリズムであり、右側のテーブルに対して使用されている [table engine](/engines/table-engines) が低レイテンシなキー・バリュー要求をサポートしている場合に適用可能です。ClickHouse にはこれに対応する table engine が 3 種類あります: [Join](/engines/table-engines/special/join)（事前計算済みのハッシュテーブルに相当）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb)、および [Dictionary](/engines/table-engines/special/dictionary) です。ここでは Dictionary ベースのアプローチについて説明しますが、仕組み自体は 3 つのエンジンで共通です。

Direct Join アルゴリズムでは、右側のテーブルが Dictionary をバックエンドとして持っている必要があります。これにより、そのテーブルから結合対象となるデータが、低レイテンシなキー・バリュー型データ構造としてすでにメモリ上に存在している状態になります。

### 例

Stack Overflow データセットを使用して、次の疑問に答えてみます:
*Hacker News において、SQL に関する最も「物議を醸した」投稿はどれか？*

ここでは「物議を醸した」を、賛成票と反対票の数が近い投稿と定義します。この絶対差を計算し、値が 0 に近いほど議論を呼んでいるとみなします。また、投稿には少なくとも 10 件以上の賛成票と反対票があるものに限定します — そもそもほとんど投票されていない投稿は、あまり物議を醸しているとはいえないためです。

データが正規化されている前提では、このクエリには現在、`posts` テーブルと `votes` テーブルを用いた `JOIN` が必要です:

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

1行を取得しました。経過時間: 1.283秒。処理行数: 4億1844万行、7.23 GB (3億2607万行/秒、5.63 GB/秒)
ピークメモリ使用量: 3.18 GiB。
```

> **`JOIN` の右側にはより小さいデータセットを使用する**: このクエリでは、外側とサブクエリの両方で `PostId` をフィルタリングしているため、必要以上に冗長に見えるかもしれません。これは、クエリの応答時間を高速に保つためのパフォーマンス最適化です。最適なパフォーマンスを得るには、常に `JOIN` の右側がより小さな集合となるようにし、可能な限り小さく保ってください。`JOIN` のパフォーマンス最適化や利用可能なアルゴリズムの理解に関するヒントとしては、[このブログ記事シリーズ](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)を参照することを推奨します。

このクエリは高速ですが、良好なパフォーマンスを得るには `JOIN` を慎重に記述する必要があります。本来であれば、まず投稿を「SQL」を含むものだけにフィルタリングし、その後で対象となる一部のブログについて `UpVote` と `DownVote` の数を確認してメトリクスを計算したいところです。

#### 辞書の適用

これらの概念を示すために、投票データに辞書を使用します。辞書は通常メモリ上に保持されるため（例外は [ssd&#95;cache](/sql-reference/dictionaries#ssd_cache)）、ユーザーはデータサイズを意識する必要があります。次に `votes` テーブルのサイズを確認します:


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

データはディクショナリ内に非圧縮のまま保存されるため、すべてのカラム（実際にはそうしません）をディクショナリに保存すると仮定すると、少なくとも 4GB のメモリが必要になります。ディクショナリはクラスター全体にレプリケートされるため、このメモリ量は *ノードごとに* 確保する必要があります。

> 以下の例では、ディクショナリ用のデータは ClickHouse テーブルに由来しています。これはディクショナリの最も一般的なソースですが、ファイル、HTTP、[Postgres](/sql-reference/dictionaries#postgresql) を含むデータベースなど、[多数のソース](/sql-reference/dictionaries#dictionary-sources) がサポートされています。後述するように、ディクショナリは自動的に更新できるため、頻繁に変更される小さなデータセットを直接結合で利用可能にする理想的な方法となります。

ディクショナリには、ルックアップを行うための主キーが必要です。これは概念的にはトランザクションデータベースの主キーと同様であり、一意である必要があります。上記のクエリでは、結合キー `PostId` に対するルックアップが必要です。ディクショナリには、`votes` テーブルから各 `PostId` について賛成票と反対票の合計値が格納されている必要があります。以下が、このディクショナリデータを取得するためのクエリです：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

このディクショナリを作成するには、次の DDL が必要です。ここで、先ほどのクエリを使用している点に注意してください。

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

> 自己管理の OSS 環境では、上記のコマンドをすべてのノードで実行する必要があります。ClickHouse Cloud では、ディクショナリはすべてのノードに自動的にレプリケートされます。上記の処理は、RAM 64GB の ClickHouse Cloud ノード上で実行しており、ロードに 36 秒を要しました。

ディクショナリが消費しているメモリ量を確認するには、次のようにします。

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

特定の `PostId` に対する賛成票と反対票は、シンプルな `dictGet` 関数で取得できるようになりました。以下の例では、投稿 `11227902` の値を取得しています。

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

3行のセット。経過時間: 0.551秒。処理: 1億1964万行、3.29 GB (毎秒2億1696万行、毎秒5.97 GB)。
ピークメモリ使用量: 552.26 MiB。
```

このクエリははるかに単純なだけでなく、実行速度も2倍以上高速です！ さらに最適化するには、賛成票と反対票の合計が10を超える投稿だけを辞書に読み込み、あらかじめ計算した「controversial」値だけを保存するようにします。


## クエリ時の拡張

辞書は、クエリ実行時に値を参照するために使用できます。これらの値は結果として返したり、集約処理で使用したりできます。たとえば、ユーザー ID をロケーションに対応付ける辞書を作成するとします。

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

この辞書を使用して、POST の結果に情報を付加できます。

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
│ 52296928 │ ClickHouseにおける2つの文字列の比較                            │ Spain                 │
│ 52345137 │ ファイルを使用してMySQLからClickHouseにデータを移行する方法    │ 中国江苏省Nanjing Shi   │
│ 61452077 │ ClickHouseでPARTITIONを変更する方法                           │ Guangzhou, 广东省中国   │
│ 55608325 │ ClickHouseでmax()を使わずにテーブルの最後のレコードを選択      │ Moscow, Russia        │
│ 55758594 │ ClickHouseで一時テーブルを作成                                │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5行を取得しました。経過時間: 0.033秒。処理行数: 425万行、82.84 MB (1億3062万行/秒、2.55 GB/秒)
ピークメモリ使用量: 249.32 MiB。
```

先ほどの結合の例と同様に、同じ辞書を使って、投稿のおもな発信元を効率的に判定できます。

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


## インデックス時のエンリッチメント

上記の例では、クエリ時に辞書を使用して結合を排除しました。辞書は、挿入時に行をエンリッチするためにも使用できます。これは通常、エンリッチに用いる値が変わらず、かつ辞書を埋めるために利用できる外部ソースに存在する場合に適しています。この場合、挿入時に行をエンリッチしておけば、クエリ時の辞書ルックアップを回避できます。

Stack Overflow におけるユーザーの `Location` が決して変わらないと仮定します（実際には変わります）— 具体的には、`users` テーブルの `Location` 列です。投稿テーブルをロケーション別に分析するクエリを実行したいとします。このテーブルには `UserId` が含まれています。

辞書は、`users` テーブルをデータソースとして、ユーザー ID からロケーションへのマッピングを提供します。

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

> `Hashed` 辞書型を使用できるようにするため、`Id < 0` のユーザーを除外しています。`Id < 0` のユーザーはシステムユーザーです。

この辞書を posts テーブルへの挿入時に利用するには、スキーマを変更する必要があります。

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

上記の例では、`Location` は `MATERIALIZED` カラムとして宣言されています。これは、値を `INSERT` クエリの一部として指定することもできますが、その値に関わらず常に計算されることを意味します。

> ClickHouse は [`DEFAULT` カラム](/sql-reference/statements/create/table#default_values) もサポートしています（値を明示的に挿入することも、指定されていない場合に計算させることもできます）。

テーブルにデータを投入するには、通常どおり S3 からの `INSERT INTO SELECT` を使用できます。

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

これで、投稿の大半がどの場所から発信されているか、その場所名を取得できます。

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


## 辞書に関する高度なトピック {#advanced-dictionary-topics}

### 辞書の `LAYOUT` の選択 {#choosing-the-dictionary-layout}

`LAYOUT` 句は、辞書の内部データ構造を制御します。利用可能なオプションはいくつかあり、その内容は[こちら](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)に記載されています。適切なレイアウトを選択するためのヒントは[こちら](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)にあります。

### 辞書の更新 {#refreshing-dictionaries}

辞書の `LIFETIME` として `MIN 600 MAX 900` を指定しました。LIFETIME は辞書の更新間隔であり、ここで指定した値により 600～900 秒のランダムな間隔で定期的に再読み込みが行われます。このランダムな間隔は、多数のサーバーで更新を行う際に辞書のソースへの負荷を分散するために必要です。更新中でも、古いバージョンの辞書には引き続きクエリを実行できます。初回の読み込みのみがクエリをブロックします。`(LIFETIME(0))` を設定すると、辞書は更新されなくなる点に注意してください。
辞書は `SYSTEM RELOAD DICTIONARY` コマンドを使用して強制的に再読み込みできます。

ClickHouse や Postgres のようなデータベースソースでは、一定間隔ではなく、実際に変更があった場合にのみ辞書を更新するクエリを設定できます（クエリの応答結果によって更新の要否が決まります）。詳細は[こちら](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)を参照してください。

### その他の辞書タイプ {#other-dictionary-types}

ClickHouse は [階層型](/sql-reference/dictionaries#hierarchical-dictionaries)、[Polygon](/sql-reference/dictionaries#polygon-dictionaries)、[正規表現](/sql-reference/dictionaries#regexp-tree-dictionary) 辞書もサポートしています。

### 参考資料 {#more-reading}

- [Using Dictionaries to Accelerate Queries](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Advanced Configuration for Dictionaries](/sql-reference/dictionaries)
