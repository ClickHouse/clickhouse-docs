---
slug: /migrations/postgresql/dataset
title: 'データの移行'
description: 'PostgreSQLからClickHouseへの移行用データセットの例'
keywords: ['Postgres']
show_related_blogs: true
sidebar_label: 'パート1'
doc_type: 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> これはPostgreSQLからClickHouseへの移行ガイドの**パート1**です。実践的な例を使用して、リアルタイムレプリケーション（CDC）アプローチで効率的に移行を行う方法を示します。ここで説明する概念の多くは、PostgreSQLからClickHouseへの手動による一括データ転送にも適用できます。

## データセット {#dataset}

PostgresからClickHouseへの典型的な移行を示すサンプルデータセットとして、[こちら](/getting-started/example-datasets/stackoverflow)で説明されているStack Overflowデータセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、`badge`が含まれています。このデータのPostgreSQLスキーマを以下に示します：

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflowスキーマ"/>

*PostgreSQLでテーブルを作成するためのDDLコマンドは[こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)で入手できます。*

このスキーマは、必ずしも最も最適化されているわけではありませんが、プライマリキー、外部キー、パーティショニング、インデックスなど、多くの一般的なPostgreSQL機能を活用しています。

これらの各概念をClickHouseの同等機能に移行します。

移行手順をテストするためにこのデータセットをPostgreSQLインスタンスに投入したいユーザーのために、DDL付きの`pg_dump`形式でダウンロードできるデータと、その後のデータロードコマンドを以下に提供します：

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

ClickHouseにとっては小さいですが、このデータセットはPostgresにとってはかなりの規模です。上記は2024年の最初の3か月をカバーするサブセットを表しています。

> サンプル結果ではPostgresとClickHouseのパフォーマンスの違いを示すために完全なデータセットを使用していますが、以下で説明するすべての手順は、より小さいサブセットでも機能的に同一です。Postgresに完全なデータセットをロードしたいユーザーは[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)をご覧ください。上記のスキーマで課される外部キー制約により、PostgreSQL用の完全なデータセットには参照整合性を満たす行のみが含まれています。そのような制約のない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接簡単にロードできます。

## データの移行 {#migrating-data}

### リアルタイムレプリケーション（CDC） {#real-time-replication-or-cdc}

PostgreSQL用のClickPipesを設定するには、この[ガイド](/integrations/clickpipes/postgres)を参照してください。このガイドでは、さまざまな種類のソースPostgresインスタンスについて説明しています。

ClickPipesまたはPeerDBを使用したCDCアプローチでは、PostgreSQLデータベース内の各テーブルが自動的にClickHouseにレプリケートされます。

更新と削除をほぼリアルタイムで処理するために、ClickPipesはPostgresテーブルを、ClickHouseで更新と削除を処理するために特別に設計された[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用してClickHouseにマッピングします。ClickPipesを使用したClickHouseへのデータレプリケーションの詳細については、[こちら](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)をご覧ください。CDCを使用したレプリケーションでは、更新または削除操作をレプリケートする際にClickHouseで重複行が作成されることに注意することが重要です。ClickHouseでこれらを処理するための[FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier)修飾子を使用した[テクニック](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)を参照してください。

ClickPipesを使用してClickHouseで`users`テーブルがどのように作成されるかを見てみましょう。

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

設定が完了すると、ClickPipesはPostgreSQLからClickHouseへのすべてのデータの移行を開始します。ネットワークとデプロイメントのサイズによって異なりますが、Stack Overflowデータセットの場合、これは数分で完了するはずです。

### 定期的な更新を伴う手動一括ロード {#initial-bulk-load-with-periodic-updates}

手動アプローチを使用する場合、データセットの初期一括ロードは以下の方法で実現できます：

- **テーブル関数** - ClickHouseで[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して、Postgresからデータを`SELECT`し、ClickHouseテーブルに`INSERT`します。数百GBまでのデータセットの一括ロードに適しています。
- **エクスポート** - CSVやSQLスクリプトファイルなどの中間形式にエクスポートします。これらのファイルは、クライアントから`INSERT FROM INFILE`句を使用するか、オブジェクトストレージとその関連関数（s3、gcsなど）を使用してClickHouseにロードできます。

PostgreSQLから手動でデータをロードする場合、最初にClickHouseでテーブルを作成する必要があります。ClickHouseでテーブルスキーマを最適化するためにStack Overflowデータセットも使用している[データモデリングドキュメント](/data-modeling/schema-design#establish-initial-schema)を参照してください。

PostgreSQLとClickHouse間のデータ型は異なる場合があります。各テーブルカラムの同等の型を確立するには、[Postgresテーブル関数](/sql-reference/table-functions/postgresql)で`DESCRIBE`コマンドを使用できます。以下のコマンドはPostgreSQLの`posts`テーブルを説明します。環境に応じて変更してください：

```sql title="クエリ"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQLとClickHouse間のデータ型マッピングの概要については、[付録ドキュメント](/migrations/postgresql/appendix#data-type-mappings)を参照してください。

このスキーマの型を最適化する手順は、他のソース（例：S3上のParquet）からデータがロードされた場合と同じです。この[Parquetを使用した代替ガイド](/data-modeling/schema-design)で説明されているプロセスを適用すると、以下のスキーマになります：

```sql title="クエリ"
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
COMMENT 'Optimized types'
```

PostgreSQLからデータを読み取り、ClickHouseに挿入するシンプルな`INSERT INTO SELECT`でこれを投入できます：

```sql title="クエリ"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

増分ロードは、スケジュールすることができます。Postgresテーブルが挿入のみを受け取り、インクリメントするIDまたはタイムスタンプが存在する場合、上記のテーブル関数アプローチを使用して増分をロードできます。つまり、`SELECT`に`WHERE`句を適用できます。このアプローチは、更新が同じカラムを更新することが保証されている場合、更新をサポートするためにも使用できます。ただし、削除をサポートするには完全な再ロードが必要であり、テーブルが大きくなるにつれて困難になる可能性があります。

`CreationDate`を使用した初期ロードと増分ロードを示します（行が更新された場合にこれが更新されると仮定しています）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouseは、`=`、`!=`、`>`、`>=`、`<`、`<=`、INなどのシンプルな`WHERE`句をPostgreSQLサーバーにプッシュダウンします。したがって、変更セットを識別するために使用されるカラムにインデックスが存在することを確認することで、増分ロードをより効率的にすることができます。

> クエリレプリケーションを使用する際にUPDATE操作を検出する可能な方法は、[`XMIN`システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクションID）をウォーターマークとして使用することです - このカラムの変更は変更を示し、したがって宛先テーブルに適用できます。このアプローチを採用するユーザーは、`XMIN`値がラップアラウンドする可能性があり、比較にはフルテーブルスキャンが必要なため、変更の追跡がより複雑になることに注意する必要があります。

[パート2はこちらをクリック](/migrations/postgresql/rewriting-queries)