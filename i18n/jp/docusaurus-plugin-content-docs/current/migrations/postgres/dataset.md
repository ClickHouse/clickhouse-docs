---
'slug': '/migrations/postgresql/dataset'
'title': 'データの移行'
'description': 'PostgreSQLからClickHouseへの移行のためのデータセットの例'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> これは**パート1**であり、PostgreSQLからClickHouseへの移行に関するガイドです。実用的な例を使用して、リアルタイムレプリケーション（CDC）アプローチを使用して効率的に移行を実行する方法を示しています。取り上げられている多くの概念は、PostgreSQLからClickHouseへの手動バルクデータ転送にも適用されます。

## データセット {#dataset}

PostgresからClickHouseへの典型的な移行を示すための例のデータセットとして、[こちらに文書化されたStack Overflowデータセット](https://stackoverflow.com/)を使用します。これは、2008年から2024年4月までの間にStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、および`badge`を含みます。このデータのPostgreSQLスキーマは、以下に示されています：

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*PostgreSQLにテーブルを作成するためのDDLコマンドは[こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)にあります。*

このスキーマは必ずしも最適ではありませんが、主キー、外部キー、パーティショニング、インデックスなど、多くの一般的なPostgreSQL機能を利用しています。

これらの概念をそれぞれClickHouseの同等物に移行します。

このデータセットをPostgreSQLインスタンスにロードして移行手順をテストしたいユーザーのために、DDLとその後のデータロードコマンドを含む`pg_dump`形式でデータをダウンロードできるように提供しています：

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

ClickHouseにとっては小規模ですが、このデータセットはPostgresには大規模です。上記は2024年の最初の3か月をカバーするサブセットを表しています。

> 私たちの例は、PostgresとClickhouseの間のパフォーマンスの違いを示すためにフルデータセットを使用しますが、以下のすべての手順は小さなサブセットでも機能的に同じです。フルデータセットをPostgresにロードしたいユーザーは[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)を参照してください。上記のスキーマによって課された外部制約により、PostgreSQLのフルデータセットには参照整合性を満たす行のみが含まれています。制約のない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接ロードできます。

## データの移行 {#migrating-data}

### リアルタイムレプリケーション（CDC） {#real-time-replication-or-cdc}

ClickPipesをPostgreSQL用に設定するには、この[ガイド](/integrations/clickpipes/postgres)を参照してください。このガイドでは、さまざまなタイプのソースPostgresインスタンスをカバーしています。

ClickPipesまたはPeerDBを使用したCDCアプローチでは、PostgreSQLデータベース内の各テーブルがClickHouseに自動的にレプリケートされます。

近いリアルタイムでの更新と削除に対応するために、ClickPipesは、ClickHouseの更新と削除を処理するために特別に設計された[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用してPostgresテーブルをClickHouseにマッピングします。ClickPipesを使用してデータがClickHouseにレプリケートされる方法に関する詳細はこちらを[こちら](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)で確認できます。CDCを使用したレプリケーションでは、更新または削除操作をレプリケートする際にClickHouseに重複行が作成されることに注意することが重要です。[FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier)修飾子を使用してClickHouseでそれらを処理するための[テクニック](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)を参照してください。

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

設定されると、ClickPipesはPostgreSQLからClickHouseへのすべてのデータ移行を開始します。ネットワークとデプロイメントのサイズによっては、Stack Overflowデータセットの場合、これには数分しかかからないはずです。

### 定期的な更新を伴う手動バルクロード {#initial-bulk-load-with-periodic-updates}

手動アプローチを使用して、データセットの初期バルクロードを実行できます：

- **テーブル関数** - ClickHouseの[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用してPostgresからデータを`SELECT`し、それをClickHouseテーブルに`INSERT`します。これは、数百GBのデータセットのバルクロードに関連します。
- **エクスポート** - CSVやSQLスクリプトファイルなどの中間形式にエクスポートします。これらのファイルは、`INSERT FROM INFILE`句を介してクライアントからClickHouseにロードするか、オブジェクトストレージと関連する機能（例：s3、gcs）を使用してロードします。

PostgreSQLから手動でデータをロードする場合、まずClickHouseにテーブルを作成する必要があります。この[データモデリングドキュメント](/data-modeling/schema-design#establish-initial-schema)を参照して、Stack Overflowデータセットを使用してClickHouseのテーブルスキーマを最適化します。

PostgreSQLとClickHouseのデータ型は異なる場合があります。それぞれのテーブルカラムに対する同等の型を確立するために、[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して`DESCRIBE`コマンドを使用します。以下のコマンドは、PostgreSQLで`posts`テーブルを記述し、環境に応じて修正してください：

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQLとClickHouseのデータ型マッピングの概要については、[付録ドキュメント](/migrations/postgresql/appendix#data-type-mappings)を参照してください。

このスキーマの型を最適化する手順は、Parquet形式の他のソースからデータがロードされた場合と同じです。この[Parquetを使用した別のガイド](/data-modeling/schema-design)で説明されているプロセスを適用することで、以下のスキーマが得られます：

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
COMMENT 'Optimized types'
```

これを使って、簡単な`INSERT INTO SELECT`を利用して、PostgresSQLからデータを読み取り、ClickHouseに挿入することができます：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

増分ロードはスケジュールすることができます。Postgresテーブルが挿入のみを受け、増分IDまたはタイムスタンプが存在する場合、ユーザーは上記のテーブル関数アプローチを使用して増分をロードすることができます。すなわち、`SELECT`に`WHERE`句を適用できます。このアプローチは、同じカラムが更新されることが保証されている場合に更新をサポートするためにも使用できます。しかし、削除をサポートするには完全な再ロードが必要で、テーブルが大きくなるにつれて難しくなることがあります。

私たちは、`CreationDate`を使用した初期ロードと増分ロードを示します（行が更新された場合、これが更新されると仮定します）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password>')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password>') WHERE CreationDate > ( SELECT max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouseは、`=`、`!=`、`>`、`>=`、`<`、`<=`、およびINなどの単純な`WHERE`句をPostgreSQLサーバーにプッシュダウンします。これにより、変更セットを特定するために使用されるカラムにインデックスが存在する場合、増分ロードをより効率的に行うことができます。

> クエリレプリケーションを使用してUPDATE操作を検出する1つの方法は、`XMIN`システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクションID）をウォーターマークとして使用することです。このカラムの変更は変更を示し、したがって宛先テーブルに適用できます。このアプローチを使用するユーザーは、`XMIN`の値がラップする可能性があり、比較が完全なテーブルスキャンを必要とし、変更の追跡がより複雑になることを理解しておくべきです。

[パート2はこちらをクリック](./rewriting-queries.md)
