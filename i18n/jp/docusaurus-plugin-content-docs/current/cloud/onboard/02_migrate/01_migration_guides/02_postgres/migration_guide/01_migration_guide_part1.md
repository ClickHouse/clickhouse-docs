---
slug: /migrations/postgresql/dataset
title: 'データの移行'
description: 'PostgreSQL から ClickHouse へ移行するためのデータセットの例'
keywords: ['Postgres']
show_related_blogs: true
sidebar_label: 'パート 1'
doc_type: 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> これは、PostgreSQL から ClickHouse への移行に関するガイドの **パート 1** です。具体例を用いて、リアルタイムレプリケーション（CDC）方式により効率的に移行を行う方法を示します。ここで扱う多くの概念は、PostgreSQL から ClickHouse への手動での一括データ転送にも適用できます。

## データセット {#dataset}

Postgres から ClickHouse への典型的なマイグレーション例を示すサンプルデータセットとして、[こちら](/getting-started/example-datasets/stackoverflow) で説明している Stack Overflow データセットを使用します。これは、2008 年から 2024 年 4 月までに Stack Overflow 上で発生したすべての `post`、`vote`、`user`、`comment`、`badge` を含みます。このデータ用の PostgreSQL スキーマを以下に示します。

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*PostgreSQL でテーブルを作成するための DDL コマンドは [こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==) から利用できます。*

このスキーマは必ずしも最適というわけではありませんが、主キー、外部キー、パーティショニング、インデックスなど、PostgreSQL の一般的な機能をいくつか活用しています。

これらそれぞれの概念を、ClickHouse の対応する機能へマイグレーションしていきます。

マイグレーション手順を検証する目的で、このデータセットを PostgreSQL インスタンスに読み込みたいユーザー向けに、DDL とともにダウンロード可能な `pg_dump` 形式のデータを用意しています。続いて、データロード用コマンドを以下に示します。

```bash
# ユーザー {#users}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql
```

# posts {#posts}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql

# posthistory {#posthistory}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql

# コメント {#comments}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql

# 投票 {#votes}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql

# badges {#badges}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql

# postlinks {#postlinks}

wget [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz)
gzip -d postlinks.sql.gz
psql &lt; postlinks.sql

```

ClickHouseにとっては小規模ですが、このデータセットはPostgresにとっては大規模です。上記は2024年の最初の3か月分のサブセットです。

> この例ではPostgresとClickHouseのパフォーマンス差を示すために完全なデータセットを使用していますが、以下に記載されているすべての手順は、小規模なサブセットでも同様に機能します。完全なデータセットをPostgresにロードする場合は[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)を参照してください。上記のスキーマで定義された外部キー制約により、PostgreSQL用の完全なデータセットには参照整合性を満たす行のみが含まれています。このような制約のない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接ロードできます。
```

## データの移行 {#migrating-data}

### リアルタイムレプリケーション（CDC） {#real-time-replication-or-cdc}

PostgreSQL 用の ClickPipes をセットアップするには、この[ガイド](/integrations/clickpipes/postgres)を参照してください。このガイドでは、さまざまな種類のソースとなる Postgres インスタンスを扱っています。

ClickPipes または PeerDB を用いた CDC アプローチでは、PostgreSQL データベース内のすべてのテーブルが ClickHouse に自動的にレプリケートされます。

更新と削除をほぼリアルタイムで処理するために、ClickPipes は Postgres のテーブルを、更新や削除の処理に特化した [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) エンジンを使って ClickHouse のテーブルに対応付けます。ClickPipes を使用してデータがどのように ClickHouse にレプリケートされるかについての詳細は[こちら](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)を参照してください。CDC を用いたレプリケーションでは、更新または削除操作をレプリケートする際に、ClickHouse 内に重複した行が作成される点に注意することが重要です。ClickHouse でそれらを処理するための、[FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 修飾子を使用した[手法](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)を参照してください。

ClickPipes を使用して ClickHouse に `users` テーブルがどのように作成されるかを見ていきましょう。

```sql
CREATE TABLE users
(
    `id` Int32,
    `reputation` String,
    `creationdate` DateTime64(6),
    `displayname` String,
    `lastaccessdate` DateTime64(6),
    `aboutme` String,
    `views` Int32,
    `upvotes` Int32,
    `downvotes` Int32,
    `websiteurl` String,
    `location` String,
    `accountid` Int32,
    `_peerdb_synced_at` DateTime64(9) DEFAULT now64(),
    `_peerdb_is_deleted` Int8,
    `_peerdb_version` Int64
)
ENGINE = ReplacingMergeTree(_peerdb_version)
PRIMARY KEY id
ORDER BY id;
```

セットアップが完了すると、ClickPipes は PostgreSQL から ClickHouse へのすべてのデータ移行を開始します。ネットワークやデプロイメントの規模によって所要時間は異なりますが、Stack Overflow データセットであれば数分程度で完了するはずです。

### 手動による一括ロードと定期更新 {#initial-bulk-load-with-periodic-updates}

手動アプローチを用いる場合、データセットの初回一括ロードは次の方法で実施できます。

* **テーブル関数** - ClickHouse の [Postgres テーブル関数](/sql-reference/table-functions/postgresql) を使用して、Postgres からデータを `SELECT` し、ClickHouse のテーブルに `INSERT` します。数百 GB 規模までの一括ロードに適しています。
* **エクスポート** - CSV や SQL スクリプトファイルといった中間形式へエクスポートします。これらのファイルは、クライアントから `INSERT FROM INFILE` 句を使うか、オブジェクトストレージとそれ用の関数（例: s3, gcs）を利用して ClickHouse にロードできます。

PostgreSQL から手動でデータをロードする場合は、まず ClickHouse 上にテーブルを作成する必要があります。ClickHouse におけるテーブルスキーマの最適化については、Stack Overflow データセットを用いた例も含む [データモデリングのドキュメント](/data-modeling/schema-design#establish-initial-schema) を参照してください。

PostgreSQL と ClickHouse の間ではデータ型が異なる場合があります。各テーブルのカラムに対応する同等の型を確認するために、[Postgres テーブル関数](/sql-reference/table-functions/postgresql) と併せて `DESCRIBE` コマンドを使用できます。次のコマンドは PostgreSQL の `posts` テーブルを `DESCRIBE` する例です。自身の環境に合わせて修正して利用してください。

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQL と ClickHouse 間のデータ型マッピングの概要については、[付録ドキュメント](/migrations/postgresql/appendix#data-type-mappings)を参照してください。

このスキーマに対して型を最適化する手順は、データが他のソース（例：S3 上の Parquet）からロードされている場合と同じです。[Parquet を使用する別のガイド](/data-modeling/schema-design)で説明されている手順を適用すると、次のスキーマになります。

```sql title="Query"
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '最適化された型'
```

PostgreSQL からデータを読み込み、ClickHouse に挿入する単純な `INSERT INTO SELECT` 文で、これを埋めることができます。

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

増分ロードはスケジュール実行することもできます。Postgres テーブルが挿入のみを受け付け、単調増加する id もしくはタイムスタンプが存在する場合、ユーザーは上記のテーブル関数アプローチを用いて増分分のみをロードできます。すなわち、`SELECT` に `WHERE` 句を適用できます。このアプローチは、同じカラムが更新されることが保証されている場合には更新の取り込みにも利用できます。一方で、削除をサポートするには完全な再ロードが必要となりますが、テーブルが大きくなると、これを実現するのは難しくなる可能性があります。

ここでは、`CreationDate` を用いた初回ロードと増分ロードを示します（行が更新された場合、このカラムも更新されると仮定します）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse は、`=`, `!=`, `>`,`>=`, `<`, `<=`, および IN といった単純な `WHERE` 句を PostgreSQL サーバー側へプッシュダウンします。これにより、変更セットの識別に使用されるカラムにインデックスを作成しておくことで、増分ロードをより効率的に実行できます。

> クエリレプリケーションを使用している場合に UPDATE 操作を検出する 1 つの方法として、[`XMIN` システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクション ID）をウォーターマークとして利用することが挙げられます。このカラムの変化は変更を示すため、その変更を宛先テーブルに適用できます。この方法を用いるユーザーは、`XMIN` の値はラップアラウンドする可能性があり、比較には全表スキャンが必要となるため、変更の追跡がより複雑になることに注意してください。

[パート 2 はこちら](/migrations/postgresql/rewriting-queries)
