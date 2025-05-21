---
slug: /migrations/postgresql/dataset
title: 'データの移行'
description: 'PostgreSQLからClickHouseに移行するためのデータセットの例'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> これはPostgreSQLからClickHouseへの移行ガイドの**パート1**です。実用的な例を使用して、リアルタイムレプリケーション（CDC）方式での移行の効率的な実行方法を示します。取り扱う多くの概念は、PostgreSQLからClickHouseへの手動でのバルクデータ転送にも適用可能です。

## データセット {#dataset}

PostgresからClickHouseへの典型的な移行を示す例として、Stack Overflowのデータセットを使用します。このデータセットには、2008年から2024年4月までのStack Overflowに発生したすべての`post`、`vote`、`user`、`comment`、および`badge`が含まれています。このデータのPostgreSQLスキーマは以下の通りです。

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow スキーマ"/>

*PostgreSQLでテーブルを作成するためのDDLコマンドは[こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)で入手できます。*

このスキーマは、必ずしも最適とは限りませんが、主キー、外部キー、パーティショニング、インデックスなどの多くの人気のあるPostgreSQLの機能を活用しています。

これらの概念をそれぞれClickHouseの同等なものに移行します。

このデータセットをPostgreSQLインスタンスにポピュレートして移行手順をテストしたいユーザーのために、DDL付きの`pg_dump`形式のデータをダウンロード用に提供し、その後のデータロードコマンドを以下に示します：

```bash

# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql


# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql


# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql


# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql


# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql


# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

ClickHouseにとっては小さいですが、このデータセットはPostgresにとっては大規模です。上記は2024年の最初の三か月をカバーするサブセットを表しています。

> 当社の例の結果は全データセットを使用してPostgresとClickHouse間のパフォーマンスの違いを示していますが、以下に文書化されたすべての手順は小さなサブセットでも機能的に同一です。完全なデータセットをPostgresにロードしたいユーザーは[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)を参照してください。上記のスキーマによって課せられた外部制約のため、PostgreSQLの完全なデータセットには参照整合性を満たす行のみが含まれています。制約のない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接簡単にロードできます。

## データの移行 {#migrating-data}

### リアルタイムレプリケーション（CDC） {#real-time-replication-or-cdc}

ClickPipesをPostgreSQL用に設定するには、この[ガイド](/integrations/clickpipes/postgres)を参照してください。このガイドでは、さまざまなタイプのソースPostgresインスタンスをカバーしています。

ClickPipesまたはPeerDBを使用したCDCアプローチでは、PostgreSQLデータベース内の各テーブルがClickHouseに自動的にレプリケートされます。

更新と削除をほぼリアルタイムで処理するために、ClickPipesはPostgresテーブルをClickHouseにマッピングし、更新と削除を処理するために特別に設計された[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用します。ClickPipesを使用してデータがClickHouseにレプリケートされる仕組みについては[こちら](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)をご覧ください。CDCを使用したレプリケーションでは、更新または削除操作をレプリケートする際にClickHouseに重複した行が作成されることに注意することが重要です。[FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier)修飾子を使用して、ClickHouseでそれを処理するための[技術](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)を参照してください。

ClickPipesを使用してClickHouseに`users`テーブルがどのように作成されるか見てみましょう。

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

設定が完了すると、ClickPipesはPostgreSQLからClickHouseへすべてのデータの移行を開始します。ネットワークとデプロイメントのサイズに応じて、Stack Overflowデータセットの移行には数分しかかからないはずです。

### 定期更新を伴う手動バルクロード {#initial-bulk-load-with-periodic-updates}

手動アプローチを使用して、データセットの初期バルクロードは次の方法で実現できます：

- **テーブル関数** - ClickHouseの[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して、Postgresからデータを`SELECT`してClickHouseテーブルに`INSERT`します。数百GBのデータセットまでのバルクロードに関連します。
- **エクスポート** - CSVやSQLスクリプトファイルなどの中間形式にエクスポートします。これらのファイルを、クライアント経由で`INSERT FROM INFILE`句を使用してClickHouseにロードするか、オブジェクトストレージとその関連機能（例：s3、gcs）を使用してロードできます。

PostgreSQLからデータを手動でロードする際は、まずClickHouseにテーブルを作成する必要があります。[データモデリングのドキュメント](/data-modeling/schema-design#establish-initial-schema)を参照して、Stack Overflowデータセットを使用してClickHouseでテーブルスキーマを最適化します。

PostgreSQLとClickHouseのデータ型は異なる場合があります。各テーブルカラムの同等の型を確立するために、[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して`DESCRIBE`コマンドを実行できます。次のコマンドはPostgreSQLの`posts`テーブルを記述しており、環境に応じて変更してください。

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQLとClickHouse間のデータ型マッピングの概要については、[付録のドキュメント](/migrations/postgresql/appendix#data-type-mappings)を参照してください。

このスキーマの型を最適化する手順は、他のソース（例：S3上のParquet）からデータがロードされた場合と同じです。この[代替ガイドを使用したParquet](/data-modeling/schema-design)のプロセスを適用すると、次のスキーマが得られます：

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
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '最適化された型'
```

これを簡単に`INSERT INTO SELECT`で埋めることができ、PostgreSQLからデータを読み取り、ClickHouseに挿入します：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

インクリメンタルロードもスケジュールできます。Postgresテーブルが挿入のみを受け取る場合、増加するidまたはタイムスタンプが存在するとき、ユーザーは上記のテーブル関数アプローチを使用してインクリメントをロードできます。つまり、`SELECT`に`WHERE`句を適用できます。このアプローチは、同じカラムを更新することが保証されている場合は更新のサポートにも使用できます。ただし、削除のサポートには完全な再ロードが必要で、テーブルが大きくなると実現が難しくなる場合があります。

最初のロードとインクリメンタルロードを`CreationDate`を使用して示します（行が更新されると仮定します）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouseは、`=`、`!=`、`>`、`>=`、`<`、`<=`、およびINのような単純な`WHERE`句をPostgreSQLサーバーにプッシュダウンします。インクリメンタルロードは、変更セットを特定するために使用されるカラムにインデックスが存在することを保証することでより効率的に行えます。

> クエリレプリケーションを使用する際にUPDATE操作を検出する可能性のある方法は、`XMIN`システムカラム（トランザクションID）をウォーターマークとして使用することです。このカラムの変化は、変更を示し、目的のテーブルに適用できるためです。このアプローチを使用するユーザーは、`XMIN`値がラップする可能性があり、比較が完全なテーブルスキャンを必要とするため、変更の追跡がより複雑であることに留意する必要があります。

[パート2はこちらをクリック](./rewriting-queries.md)
