---
description: "ClickHouseでStack Overflowデータを分析する"
slug: /getting-started/example-datasets/stackoverflow
sidebar_label: Stack Overflow
sidebar_position: 1
title: "ClickHouseでStack Overflowデータを分析する"
---

このデータセットには、Stack Overflowで発生したすべての `Posts`, `Users`, `Votes`, `Comments`, `Badges`, `PostHistory`, および `PostLinks` が含まれています。

ユーザーは、2024年4月までのすべての投稿を含む事前準備されたParquetバージョンのデータをダウンロードするか、最新のデータをXML形式でダウンロードしてロードすることができます。Stack Overflowはこのデータに対して定期的に更新を提供しており、歴史上は3か月ごとに行われています。

以下の図は、Parquet形式の利用可能なテーブルのスキーマを示しています。

![Stack Overflowスキーマ](./images/stackoverflow.png)

このデータのスキーマの説明は[こちら](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede)で見つけられます。

## 事前準備されたデータ {#pre-prepared-data}

2024年4月現在の最新のParquet形式のデータのコピーを提供します。行数（6000万投稿）に関してはClickHouseには小さいですが、このデータセットには大量のテキストと大きなStringカラムが含まれています。

```sql
CREATE DATABASE stackoverflow
```

以下のタイミングは、`eu-west-2`にある96 GiB、24 vCPUのClickHouse Cloudクラスタ用です。データセットは`eu-west-3`にあります。

### Posts {#posts}

```sql
CREATE TABLE stackoverflow.posts
(
    `Id` Int32 CODEC(Delta(4), ZSTD(1)),
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
    `AcceptedAnswerId` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `Score` Int32,
    `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
    `Body` String,
    `OwnerUserId` Int32,
    `OwnerDisplayName` String,
    `LastEditorUserId` Int32,
    `LastEditorDisplayName` String,
    `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `LastActivityDate` DateTime64(3, 'UTC'),
    `Title` String,
    `Tags` String,
    `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
    `CommentCount` UInt8,
    `FavoriteCount` UInt8,
    `ContentLicense` LowCardinality(String),
    `ParentId` String,
    `CommunityOwnedDate` DateTime64(3, 'UTC'),
    `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)

INSERT INTO stackoverflow.posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 265.466 sec. Processed 59.82 million rows, 38.07 GB (225.34 thousand rows/s., 143.42 MB/s.)
```

投稿は年ごとにアクセスすることもできます。例えば [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet)

### Votes {#votes}

```sql
CREATE TABLE stackoverflow.votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId, UserId)

INSERT INTO stackoverflow.votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 21.605 sec. Processed 238.98 million rows, 2.13 GB (11.06 million rows/s., 98.46 MB/s.)
```

投票も年ごとに利用できます。例えば [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)

### Comments {#comments}

```sql
CREATE TABLE stackoverflow.comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY CreationDate

INSERT INTO stackoverflow.comments SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')

0 rows in set. Elapsed: 56.593 sec. Processed 90.38 million rows, 11.14 GB (1.60 million rows/s., 196.78 MB/s.)
```

コメントも年ごとに利用可能です。例えば [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)

### Users {#users}

```sql
CREATE TABLE stackoverflow.users
(
    `Id` Int32,
    `Reputation` LowCardinality(String),
    `CreationDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `DisplayName` String,
    `LastAccessDate` DateTime64(3, 'UTC'),
    `AboutMe` String,
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32,
    `WebsiteUrl` String,
    `Location` LowCardinality(String),
    `AccountId` Int32
)
ENGINE = MergeTree
ORDER BY (Id, CreationDate)

INSERT INTO stackoverflow.users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 10.988 sec. Processed 22.48 million rows, 1.36 GB (2.05 million rows/s., 124.10 MB/s.)
```

### Badges {#badges}

```sql
CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

INSERT INTO stackoverflow.badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 6.635 sec. Processed 51.29 million rows, 797.05 MB (7.73 million rows/s., 120.13 MB/s.)
```

### PostLinks {#postlinks}

```sql
CREATE TABLE stackoverflow.postlinks
(
    `Id` UInt64,
    `CreationDate` DateTime64(3, 'UTC'),
    `PostId` Int32,
    `RelatedPostId` Int32,
    `LinkTypeId` Enum8('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO stackoverflow.postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 1.534 sec. Processed 6.55 million rows, 129.70 MB (4.27 million rows/s., 84.57 MB/s.)
```

### PostHistory {#posthistory}

```sql
CREATE TABLE stackoverflow.posthistory
(
    `Id` UInt64,
    `PostHistoryTypeId` UInt8,
    `PostId` Int32,
    `RevisionGUID` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `Text` String,
    `ContentLicense` LowCardinality(String),
    `Comment` String,
    `UserDisplayName` String
)
ENGINE = MergeTree
ORDER BY (CreationDate, PostId)

INSERT INTO stackoverflow.posthistory SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posthistory/*.parquet')

0 rows in set. Elapsed: 422.795 sec. Processed 160.79 million rows, 67.08 GB (380.30 thousand rows/s., 158.67 MB/s.)
```

## オリジナルデータセット {#original-dataset}

オリジナルのデータセットは、[https://archive.org/download/stackexchange](https://archive.org/download/stackexchange)で圧縮（7zip）されたXML形式で利用可能であり、プレフィックス`stackoverflow.com*`のファイルが含まれています。

### ダウンロード {#download}

```bash
wget https://archive.org/download/stackexchange/stackoverflow.com-Badges.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Comments.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostHistory.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostLinks.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Posts.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Users.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Votes.7z
```

これらのファイルは最大35GBであり、インターネット接続に応じて約30分かかる可能性があります - ダウンロードサーバーは約20MB/secで制限されています。

### JSONに変換 {#convert-to-json}

執筆時点で、ClickHouseはXMLを入力フォーマットとしてネイティブにサポートしていません。データをClickHouseにロードするためには、まずNDJSONに変換する必要があります。

XMLをJSONに変換するために、[`xq`](https://github.com/kislyuk/yq)というLinuxツールをお勧めします。これはXMLドキュメントのためのシンプルな`jq`ラッパーです。

xqとjqをインストールします：

```bash
sudo apt install jq
pip install yq
```

上記のファイルのいずれかに適用される手順は次のとおりです。ここでは`stackoverflow.com-Posts.7z`ファイルを例として使用します。必要に応じて修正してください。

[**p7zip**](https://p7zip.sourceforge.net/)を使用してファイルを解凍します。これにより、単一のxmlファイル - この場合、`Posts.xml`が生成されます。

> ファイルは約4.5倍圧縮されています。圧縮された状態で22GBの投稿ファイルは、展開された状態で約97Gを必要とします。

```bash
p7zip -d stackoverflow.com-Posts.7z
```

次のコマンドは、xmlファイルを10000行ごとに分割します。

```bash
mkdir posts
cd posts

# 次のコマンドは、入力xmlファイルを10000行ごとのサブファイルに分割します
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

上記を実行した後、ユーザーはそれぞれ10000行のファイルを持つセットを得ることができます。これにより、次のコマンドのメモリオーバーヘッドが過剰にならないようになります（xmlからJSONへの変換はメモリ内で行われます）。

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

上記のコマンドは、単一の`posts.json`ファイルを生成します。

次のコマンドでClickHouseにロードします。スキーマは`posts.json`ファイル用に指定されています。これはターゲットテーブルとの整合性を持たせるためにデータ型ごとに調整する必要があります。

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```

## サンプルクエリ {#example-queries}

いくつかの簡単なクエリを示して、スタートを切りましょう。

### Stack Overflowで最も人気のあるタグ {#most-popular-tags-on-stack-overflow}

```sql

SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS Tags,
    count() AS c
FROM stackoverflow.posts
GROUP BY Tags
ORDER BY c DESC
LIMIT 10

┌─Tags───────┬───────c─┐
│ javascript │ 2527130 │
│ python     │ 2189638 │
│ java       │ 1916156 │
│ c#         │ 1614236 │
│ php        │ 1463901 │
│ android    │ 1416442 │
│ html       │ 1186567 │
│ jquery     │ 1034621 │
│ c++        │  806202 │
│ css        │  803755 │
└────────────┴─────────┘

10 rows in set. Elapsed: 1.013 sec. Processed 59.82 million rows, 1.21 GB (59.07 million rows/s., 1.19 GB/s.)
Peak memory usage: 224.03 MiB.
```

### 最も回答が多いユーザー（アクティブアカウント） {#user-with-the-most-answers-active-accounts}

アカウントには`UserId`が必要です。

```sql
SELECT
    any(OwnerUserId) UserId,
    OwnerDisplayName,
    count() AS c
FROM stackoverflow.posts WHERE OwnerDisplayName != '' AND PostTypeId='Answer' AND OwnerUserId != 0
GROUP BY OwnerDisplayName
ORDER BY c DESC
LIMIT 5

┌─UserId─┬─OwnerDisplayName─┬────c─┐
│  22656 │ Jon Skeet        │ 2727 │
│  23354 │ Marc Gravell     │ 2150 │
│  12950 │ tvanfosson       │ 1530 │
│   3043 │ Joel Coehoorn    │ 1438 │
│  10661 │ S.Lott           │ 1087 │
└────────┴──────────────────┴──────┘

5 rows in set. Elapsed: 0.154 sec. Processed 35.83 million rows, 193.39 MB (232.33 million rows/s., 1.25 GB/s.)
Peak memory usage: 206.45 MiB.
```

### ClickHouse関連の投稿で最もビュー数が多いもの {#clickhouse-related-posts-with-the-most-views}

```sql
SELECT
    Id,
    Title,
    ViewCount,
    AnswerCount
FROM stackoverflow.posts
WHERE Title ILIKE '%ClickHouse%'
ORDER BY ViewCount DESC
LIMIT 10

┌───────Id─┬─Title────────────────────────────────────────────────────────────────────────────┬─ViewCount─┬─AnswerCount─┐
│ 52355143 │ Is it possible to delete old records from clickhouse table?                      │     41462 │           3 │
│ 37954203 │ Clickhouse Data Import                                                           │     38735 │           3 │
│ 37901642 │ Updating data in Clickhouse                                                      │     36236 │           6 │
│ 58422110 │ Pandas: How to insert dataframe into Clickhouse                                  │     29731 │           4 │
│ 63621318 │ DBeaver - Clickhouse - SQL Error [159] .. Read timed out                         │     27350 │           1 │
│ 47591813 │ How to filter clickhouse table by array column contents?                         │     27078 │           2 │
│ 58728436 │ How to search the string in query with case insensitive on Clickhouse database?  │     26567 │           3 │
│ 65316905 │ Clickhouse: DB::Exception: Memory limit (for query) exceeded                     │     24899 │           2 │
│ 49944865 │ How to add a column in clickhouse                                                │     24424 │           1 │
│ 59712399 │ How to cast date Strings to DateTime format with extended parsing in ClickHouse? │     22620 │           1 │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┴───────────┴─────────────┘

10 rows in set. Elapsed: 0.472 sec. Processed 59.82 million rows, 1.91 GB (126.63 million rows/s., 4.03 GB/s.)
Peak memory usage: 240.01 MiB.
```

### 最も論争を呼んだ投稿 {#most-controversial-posts}

```sql
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM stackoverflow.posts
INNER JOIN
(
    SELECT
        PostId,
        countIf(VoteTypeId = 2) AS UpVotes,
        countIf(VoteTypeId = 3) AS DownVotes
    FROM stackoverflow.votes
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Title != ''
ORDER BY Controversial_ratio ASC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────┬─UpVotes─┬─DownVotes─┬─Controversial_ratio─┐
│   583177 │ VB.NET Infinite For Loop                          │      12 │        12 │                   0 │
│  9756797 │ Read console input as enumerable - one statement? │      16 │        16 │                   0 │
│ 13329132 │ What's the point of ARGV in Ruby?                 │      22 │        22 │                   0 │
└──────────┴───────────────────────────────────────────────────┴─────────┴───────────┴─────────────────────┘

3 rows in set. Elapsed: 4.779 sec. Processed 298.80 million rows, 3.16 GB (62.52 million rows/s., 661.05 MB/s.)
Peak memory usage: 6.05 GiB.
```

## 著作権表示 {#attribution}

Stack Overflowがこのデータを`cc-by-sa 4.0`ライセンスの下で提供していることに感謝し、彼らの努力とデータのオリジナルソースを[https://archive.org/details/stackexchange](https://archive.org/details/stackexchange)で認識します。
