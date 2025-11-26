---
description: 'ClickHouse を使用した Stack Overflow のデータの分析'
sidebar_label: 'Stack Overflow'
slug: /getting-started/example-datasets/stackoverflow
title: 'ClickHouse を使用した Stack Overflow のデータの分析'
keywords: ['StackOverflow']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import stackoverflow from '@site/static/images/getting-started/example-datasets/stackoverflow.png'

このデータセットには、Stack Overflow 上で発生したすべての `Posts`、`Users`、`Votes`、`Comments`、`Badges`、`PostHistory`、`PostLinks` のデータが含まれています。

ユーザーは、2024 年 4 月までのすべての投稿を含むあらかじめ用意された Parquet 版のデータをダウンロードするか、最新データを XML 形式でダウンロードして読み込むことができます。Stack Overflow はこのデータを定期的に更新しており、これまでのところおおむね 3 か月ごとに更新が提供されています。

以下の図は、Parquet 形式を前提とした利用可能なテーブルのスキーマを示しています。

<Image img={stackoverflow} alt="Stack Overflow スキーマ" size="md" />

このデータのスキーマの詳細な説明は[こちら](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede)を参照してください。


## あらかじめ用意されたデータ

このデータのコピーを Parquet 形式で提供しており、内容は 2024 年 4 月時点のものです。行数（6,000 万件の投稿）の点では ClickHouse にとっては小規模ですが、このデータセットには大量のテキストとサイズの大きな String 型の列が含まれています。

```sql
CREATE DATABASE stackoverflow
```

以下の計測結果は、`eu-west-2` リージョンにある 96 GiB、24 vCPU 構成の ClickHouse Cloud クラスターに対するものです。データセットは `eu-west-3` に配置されています。

### 投稿

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

投稿データは年別のファイルとしても利用できます。例: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet)

### 投票

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

投票データは年別のものも利用できます。例: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)

### コメント

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


コメントも年ごとのファイルとして利用できます。例: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)

### ユーザー

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

結果セット 0 行。経過時間: 10.988 秒。22.48 百万行 (1.36 GB) を処理しました (2.05 百万行/秒、124.10 MB/秒)。
```

### バッジ

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

### PostLinks

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

0 行が返されました。Elapsed: 1.534 sec. Processed 6.55 million rows, 129.70 MB (4.27 million rows/s., 84.57 MB/s.)
```

### PostHistory

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

セット内の行数：0 行。経過時間：422.795 秒。処理済み 1.6079 億行、67.08 GB（38.03 万行/秒、158.67 MB/秒）。
```


## 元のデータセット

元のデータセットは、圧縮された (7zip) の XML 形式で [https://archive.org/download/stackexchange](https://archive.org/download/stackexchange) にて公開されています。`stackoverflow.com*` という接頭辞を持つファイルです。

### ダウンロード

```bash
wget https://archive.org/download/stackexchange/stackoverflow.com-Badges.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Comments.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostHistory.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostLinks.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Posts.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Users.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Votes.7z
```

これらのファイルは最大で 35GB あり、インターネット接続環境によってはダウンロードに約 30 分かかる場合があります。ダウンロードサーバーのスループットは約 20MB/秒に制限されています。

### JSON への変換

本ドキュメント執筆時点では、ClickHouse は入力フォーマットとして XML をネイティブにはサポートしていません。データを ClickHouse にロードするため、まず NDJSON に変換します。

XML を JSON に変換するには、XML ドキュメント向けのシンプルな `jq` ラッパーである [`xq`](https://github.com/kislyuk/yq) Linux ツールの利用を推奨します。

xq と jq をインストールします:

```bash
sudo apt install jq
pip install yq
```

上記のいずれのファイルにも、以下の手順を適用できます。ここでは例として `stackoverflow.com-Posts.7z` ファイルを使用します。必要に応じて読み替えてください。

[p7zip](https://p7zip.sourceforge.net/) を使用してファイルを展開します。これにより、1 つの XML ファイルが生成されます。この例では `Posts.xml` です。

> ファイルはおよそ 4.5 倍に圧縮されています。圧縮時 22GB の Posts ファイルは、展開後には約 97GB の容量が必要になります。

```bash
p7zip -d stackoverflow.com-Posts.7z
```

次のコマンドは、XML ファイルを 1万行ごとのファイルに分割します。


```bash
mkdir posts
cd posts
# 以下は入力XMLファイルを10000行ごとのサブファイルに分割します
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

上記のコマンドを実行すると、1 万行ずつ含まれる複数のファイルが作成されます。これにより、次のコマンドのメモリオーバーヘッドが過大にならないようにしています（XML から JSON への変換はメモリ上で行われます）。

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

上記のコマンドを実行すると、1つの `posts.json` ファイルが生成されます。

次のコマンドで ClickHouse にロードします。`posts.json` ファイル用のスキーマが指定されている点に注意してください。ターゲットテーブルに合わせるため、データ型ごとに調整する必要があります。

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```


## クエリ例

使い始めるにあたって役立つ、いくつかの簡単なクエリを紹介します。

### Stack Overflow で最も人気の高いタグ

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

10行を取得しました。経過時間: 1.013秒。処理済み: 5982万行、1.21 GB (5907万行/秒、1.19 GB/秒)
ピークメモリ使用量: 224.03 MiB
```

### 回答数が最も多いユーザー（アクティブアカウント）

アカウントには `UserId` が必要です。

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

5行のセット。経過時間: 0.154秒。処理済み: 3,583万行、193.39 MB (毎秒2億3,233万行、1.25 GB/秒)
ピークメモリ使用量: 206.45 MiB。
```

### 最も閲覧された ClickHouse 関連の投稿

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
│ 52355143 │ ClickHouse テーブルから古いレコードを削除できますか？                            │     41462 │           3 │
│ 37954203 │ ClickHouse データのインポート                                                    │     38735 │           3 │
│ 37901642 │ ClickHouse のデータ更新                                                          │     36236 │           6 │
│ 58422110 │ Pandas：DataFrame を ClickHouse に挿入する方法                                   │     29731 │           4 │
│ 63621318 │ DBeaver - ClickHouse - SQL エラー [159]: 読み取りタイムアウト                    │     27350 │           1 │
│ 47591813 │ 配列カラムの内容に基づいて ClickHouse テーブルをフィルタリングする方法は？      │     27078 │           2 │
│ 58728436 │ ClickHouse データベースで、大文字小文字を区別せずにクエリ内の文字列を検索するには？ │     26567 │           3 │
│ 65316905 │ ClickHouse: DB::Exception: メモリ制限（クエリ用）を超過しました                  │     24899 │           2 │
│ 49944865 │ ClickHouse にカラムを追加する方法                                                │     24424 │           1 │
│ 59712399 │ ClickHouse で拡張パースを利用して日付文字列を DateTime 形式にキャストするには？  │     22620 │           1 │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┴───────────┴─────────────┘

10 行。経過時間: 0.472 秒。59.82 百万行 (1.91 GB) を処理しました (126.63 百万行/秒、4.03 GB/秒)。
ピークメモリ使用量: 240.01 MiB。
```


### 最も物議を醸している投稿

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

3行のセット。経過時間: 4.779秒。処理済み: 2億9,880万行、3.16 GB (毎秒6,252万行、661.05 MB/秒)
ピークメモリ使用量: 6.05 GiB
```


## 帰属表示 {#attribution}

`cc-by-sa 4.0` ライセンスの下でこのデータを提供している Stack Overflow に感謝するとともに、その貢献およびデータの原典である [https://archive.org/details/stackexchange](https://archive.org/details/stackexchange) を明記します。
