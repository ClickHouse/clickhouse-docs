---
description: 'ClickHouse を使って Stack Overflow データを分析する'
sidebar_label: 'Stack Overflow'
slug: /getting-started/example-datasets/stackoverflow
title: 'ClickHouse を使って Stack Overflow データを分析する'
keywords: ['StackOverflow']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import stackoverflow from '@site/static/images/getting-started/example-datasets/stackoverflow.png'

このデータセットには、Stack Overflow 上で発生したすべての `Posts`、`Users`、`Votes`、`Comments`、`Badges`、`PostHistory`、`PostLinks` が含まれています。

ユーザーは、2024 年 4 月までのすべての投稿を含むあらかじめ用意された Parquet 形式のデータをダウンロードするか、最新データを XML 形式でダウンロードして取り込むことができます。Stack Overflow では、このデータの更新版が定期的に公開されており、これまでのところおおむね 3 か月ごとに更新されています。

次の図は、Parquet 形式を前提とした利用可能なテーブルのスキーマを示しています。

<Image img={stackoverflow} alt="Stack Overflow スキーマ" size="md" />

このデータのスキーマの説明は[こちら](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede)で確認できます。


## あらかじめ用意されたデータ {#pre-prepared-data}

このデータのコピーを Parquet 形式で提供しており、内容は 2024 年 4 月時点のものです。行数（6,000 万件の投稿）の点では ClickHouse にとっては小規模ですが、このデータセットには大量のテキストと大きな String 型カラムが含まれています。

```sql
CREATE DATABASE stackoverflow
```

以下の計測結果は、`eu-west-2` に配置された 96 GiB・24 vCPU 構成の ClickHouse Cloud クラスターに対するものです。データセットは `eu-west-3` にあります。


### 投稿 {#posts}

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


### 投票 {#votes}

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

投票データも年ごとに利用できます。例: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)


### コメント {#comments}

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

コメントについても年ごとのデータが利用可能です。例: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)


### ユーザー {#users}

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


### バッジ {#badges}

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


## 元のデータセット {#original-dataset}

元のデータセットは、7zip 形式で圧縮された XML ファイルとして [https://archive.org/download/stackexchange](https://archive.org/download/stackexchange) から入手できます。`stackoverflow.com*` というプレフィックスを持つファイルが対象です。

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

これらのファイルは最大 35GB あり、インターネット接続状況によってはダウンロードに約 30 分かかる場合があります。ダウンロードサーバー側で帯域が制限されており、おおよそ 20MB/秒が上限となります。


### JSON への変換 {#convert-to-json}

本ドキュメント執筆時点では、ClickHouse は入力フォーマットとして XML をネイティブにサポートしていません。ClickHouse にデータをロードするため、まず NDJSON に変換します。

XML を JSON に変換するには、XML ドキュメント向けのシンプルな `jq` ラッパーである [`xq`](https://github.com/kislyuk/yq) という Linux 用ツールを使用することを推奨します。

xq と jq をインストールします：

```bash
sudo apt install jq
pip install yq
```

上記のいずれのファイルにも、次の手順が適用されます。ここでは例として `stackoverflow.com-Posts.7z` ファイルを使用します。必要に応じて読み替えてください。

[p7zip](https://p7zip.sourceforge.net/) を使ってファイルを解凍します。これにより単一の XML ファイルが生成されます。この例では `Posts.xml` になります。

> ファイルサイズはおよそ 4.5 分の 1 に圧縮されています。圧縮サイズが 22GB の場合、Posts ファイルは解凍後に約 97GB を必要とします。

```bash
p7zip -d stackoverflow.com-Posts.7z
```

次の処理では、XML ファイルを 1 万行ごとの複数ファイルに分割します。

```bash
mkdir posts
cd posts
# 以下は入力XMLファイルを10000行ごとのサブファイルに分割します {#the-following-splits-the-input-xml-file-into-sub-files-of-10000-rows}
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

上記を実行すると、1 ファイルあたり 10000 行のファイルが複数作成されます。これは、次のコマンドのメモリオーバーヘッドが大きくなりすぎないようにするためです（XML から JSON への変換はメモリ上で行われます）。

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

上記のコマンドにより、1つの `posts.json` ファイルが生成されます。

次のコマンドで ClickHouse に読み込みます。`posts.json` ファイル用のスキーマが指定されている点に注意してください。これはデータ型に応じて調整し、対象テーブルと整合するようにする必要があります。

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```


## クエリ例 {#example-queries}

ここから始めるための、いくつかの簡単なクエリです。

### Stack Overflowで最も人気の高いタグ {#most-popular-tags-on-stack-overflow}

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


### 最も多く回答しているユーザー（アクティブなアカウント） {#user-with-the-most-answers-active-accounts}

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

5行を取得しました。経過時間: 0.154秒。処理済み: 3,583万行、193.39 MB (毎秒2億3,233万行、1.25 GB/秒)
ピークメモリ使用量: 206.45 MiB。
```


### 閲覧数が多い ClickHouse 関連記事 {#clickhouse-related-posts-with-the-most-views}

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
│ 52355143 │ ClickHouseテーブルから古いレコードを削除することは可能ですか?                      │     41462 │           3 │
│ 37954203 │ ClickHouseデータインポート                                                           │     38735 │           3 │
│ 37901642 │ ClickHouseでのデータ更新                                                      │     36236 │           6 │
│ 58422110 │ Pandas: データフレームをClickHouseに挿入する方法                                  │     29731 │           4 │
│ 63621318 │ DBeaver - ClickHouse - SQLエラー [159] .. 読み取りタイムアウト                         │     27350 │           1 │
│ 47591813 │ 配列カラムの内容でClickHouseテーブルをフィルタリングする方法は?                         │     27078 │           2 │
│ 58728436 │ ClickHouseデータベースで大文字小文字を区別せずにクエリ内の文字列を検索する方法は?  │     26567 │           3 │
│ 65316905 │ ClickHouse: DB::Exception: メモリ制限(クエリ用)を超過しました                     │     24899 │           2 │
│ 49944865 │ ClickHouseでカラムを追加する方法                                                │     24424 │           1 │
│ 59712399 │ ClickHouseで拡張解析を使用して日付文字列をDateTime形式にキャストする方法は? │     22620 │           1 │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┴───────────┴─────────────┘

10行を取得しました。経過時間: 0.472秒。処理済み: 5982万行、1.91 GB (1億2663万行/秒、4.03 GB/秒)
ピークメモリ使用量: 240.01 MiB。
```


### 最も物議を醸した投稿 {#most-controversial-posts}

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
│   583177 │ VB.NET 無限Forループ                               │      12 │        12 │                   0 │
│  9756797 │ コンソール入力を列挙可能として読み取る - 1つのステートメント? │      16 │        16 │                   0 │
│ 13329132 │ RubyにおけるARGVの意義とは?                        │      22 │        22 │                   0 │
└──────────┴───────────────────────────────────────────────────┴─────────┴───────────┴─────────────────────┘

3行を取得。経過時間: 4.779秒。処理: 2億9880万行、3.16 GB (6252万行/秒、661.05 MB/秒)
ピークメモリ使用量: 6.05 GiB。
```


## 謝辞 {#attribution}

`cc-by-sa 4.0` ライセンスの下でこのデータを提供している Stack Overflow に感謝するとともに、その尽力およびデータの元の出典である [https://archive.org/details/stackexchange](https://archive.org/details/stackexchange) を明記します。