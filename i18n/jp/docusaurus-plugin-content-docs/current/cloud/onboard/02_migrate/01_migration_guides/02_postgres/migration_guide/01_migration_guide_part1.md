---
slug: /migrations/postgresql/dataset
title: 'データの移行'
description: 'PostgreSQL から ClickHouse へのデータ移行用サンプルデータセット'
keywords: ['Postgres']
show_related_blogs: true
sidebar_label: 'パート 1'
doc_type: 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> これは、PostgreSQL から ClickHouse への移行ガイドの **パート 1** です。実践的な例を用いて、リアルタイムレプリケーション（CDC）方式で、どのように効率的に移行を行えるかを示します。ここで扱う多くの概念は、PostgreSQL から ClickHouse への手動によるバルクデータ転送にも適用できます。


## データセット {#dataset}

PostgreSQLからClickHouseへの典型的な移行例を示すために、[こちら](/getting-started/example-datasets/stackoverflow)に記載されているStack Overflowデータセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、`badge`が含まれています。このデータのPostgreSQLスキーマを以下に示します:

<Image
  img={postgres_stackoverflow_schema}
  size='lg'
  alt='PostgreSQL Stack Overflowスキーマ'
/>

_PostgreSQLでテーブルを作成するためのDDLコマンドは[こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)から入手できます。_

このスキーマは必ずしも最適ではありませんが、主キー、外部キー、パーティショニング、インデックスなど、PostgreSQLの一般的な機能を活用しています。

これらの各概念をClickHouseの同等機能に移行します。

移行手順をテストするためにこのデータセットをPostgreSQLインスタンスに投入したいユーザー向けに、DDLと共にダウンロード可能な`pg_dump`形式でデータを提供しており、その後のデータロードコマンドを以下に示します:


```bash
# ユーザー
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql
```


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
psql &lt; badges.sql



# postlinks

wget [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz)
gzip -d postlinks.sql.gz
psql &lt; postlinks.sql

```

ClickHouseにとっては小規模ですが、このデータセットはPostgresにとってはかなりの規模です。上記は2024年の最初の3か月をカバーするサブセットを表しています。

> この例の結果ではPostgresとClickHouseのパフォーマンス差を示すために完全なデータセットを使用していますが、以下に記載されているすべての手順は小規模なサブセットでも機能的に同一です。完全なデータセットをPostgresにロードしたい場合は[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)を参照してください。上記のスキーマによって課される外部キー制約のため、PostgreSQL用の完全なデータセットには参照整合性を満たす行のみが含まれています。このような制約のない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接ロードできます。
```


## データの移行 {#migrating-data}

### リアルタイムレプリケーション（CDC） {#real-time-replication-or-cdc}

PostgreSQL用のClickPipesをセットアップするには、この[ガイド](/integrations/clickpipes/postgres)を参照してください。このガイドでは、さまざまなタイプのソースPostgresインスタンスについて説明しています。

ClickPipesまたはPeerDBを使用したCDCアプローチでは、PostgreSQLデータベース内の各テーブルがClickHouseに自動的にレプリケートされます。

ほぼリアルタイムで更新と削除を処理するために、ClickPipesは[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用してPostgresテーブルをClickHouseにマッピングします。このエンジンは、ClickHouseでの更新と削除を処理するために特別に設計されています。ClickPipesを使用してデータがClickHouseにレプリケートされる仕組みの詳細については、[こちら](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)を参照してください。CDCを使用したレプリケーションでは、更新または削除操作をレプリケートする際にClickHouseで重複行が作成されることに注意が必要です。ClickHouseでこれらを処理するための[FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier)修飾子を使用した[テクニック](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)を参照してください。

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

セットアップが完了すると、ClickPipesはPostgreSQLからClickHouseへのすべてのデータの移行を開始します。ネットワークとデプロイメントのサイズによって異なりますが、Stack Overflowデータセットの場合、数分で完了するはずです。

### 定期的な更新を伴う手動一括ロード {#initial-bulk-load-with-periodic-updates}

手動アプローチを使用する場合、データセットの初期一括ロードは次の方法で実現できます：

- **テーブル関数** - ClickHouseの[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用してPostgresからデータを`SELECT`し、ClickHouseテーブルに`INSERT`します。数百GBまでのデータセットの一括ロードに適しています。
- **エクスポート** - CSVやSQLスクリプトファイルなどの中間フォーマットにエクスポートします。これらのファイルは、クライアントから`INSERT FROM INFILE`句を使用するか、オブジェクトストレージとその関連関数（s3、gcsなど）を使用してClickHouseにロードできます。

PostgreSQLから手動でデータをロードする場合、まずClickHouseでテーブルを作成する必要があります。Stack Overflowデータセットを使用してClickHouseのテーブルスキーマを最適化する方法については、この[データモデリングドキュメント](/data-modeling/schema-design#establish-initial-schema)を参照してください。

PostgreSQLとClickHouseの間でデータ型が異なる場合があります。各テーブルカラムの同等の型を確立するには、[Postgresテーブル関数](/sql-reference/table-functions/postgresql)と共に`DESCRIBE`コマンドを使用できます。次のコマンドはPostgreSQLの`posts`テーブルを記述します。環境に応じて変更してください：

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQLとClickHouse間のデータ型マッピングの概要については、[付録ドキュメント](/migrations/postgresql/appendix#data-type-mappings)を参照してください。

このスキーマの型を最適化する手順は、S3上のParquetなど他のソースからデータがロードされた場合と同じです。この[Parquetを使用した代替ガイド](/data-modeling/schema-design)で説明されているプロセスを適用すると、次のスキーマになります：


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

PostgresSQL からデータを読み取り、ClickHouse に挿入する単純な `INSERT INTO SELECT` を使って、これにデータを投入できます。

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

増分ロードはスケジューリングすることもできます。Postgres テーブルが挿入のみを受け付け、かつ単調に増加する id またはタイムスタンプが存在する場合、ユーザーは上記のテーブル関数アプローチを利用して増分をロードできます。つまり、`SELECT` に対して `WHERE` 句を適用できます。このアプローチは、常に同じカラムが更新されることが保証されている場合には、更新をサポートするためにも利用できます。一方で削除をサポートするには完全な再ロードが必要となりますが、テーブルが大きくなるにつれてこれは困難になる可能性があります。

ここでは、`CreationDate` を使用した初回ロードと増分ロードを示します（行が更新された場合、この値も更新されると仮定します）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse は、`=`, `!=`, `>`,`>=`, `<`, `<=`, `IN` といった単純な `WHERE` 句を PostgreSQL サーバーにプッシュダウンします。そのため、変更セットの特定に使用するカラムにインデックスを作成しておくことで、増分ロードをより効率的に行うことができます。

> クエリレプリケーションを使用する場合に UPDATE 操作を検出する 1 つの方法として、[`XMIN` システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクション ID）をウォーターマークとして利用することが挙げられます。このカラムの値が変化していれば変更があったことを示すため、その変更を宛先テーブルに反映できます。この方法を採用するユーザーは、`XMIN` の値がラップアラウンドする可能性があること、また比較には全表スキャンが必要となり、変更追跡がより複雑になることに留意してください。

[Part 2 はこちら](/migrations/postgresql/rewriting-queries)
