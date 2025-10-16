---
'slug': '/migrations/postgresql/dataset'
'title': 'データ移行'
'description': 'PostgreSQLからClickHouseに移行するためのデータセットの例'
'keywords':
- 'Postgres'
'show_related_blogs': true
'sidebar_label': 'パート 1'
'doc_type': 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> これはPostgreSQLからClickHouseへの移行に関するガイドの**パート1**です。実用的な例を用いて、リアルタイム複製（CDC）アプローチを使用した移行の効率的な実施方法を示しています。ここでカバーされる多くの概念は、PostgreSQLからClickHouseへの手動バルクデータ転送にも適用可能です。

## データセット {#dataset}

PostgresからClickHouseへの典型的な移行を示すための例データセットとして、Stack Overflowデータセットを使用します。このデータセットは、2008年から2024年4月までの間にStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、および`badge`を含んでいます。これに関するPostgreSQLスキーマは以下の通りです：

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*PostgreSQLでテーブルを作成するためのDDLコマンドは[こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)で入手できます。*

このスキーマは必ずしも最適ではありませんが、主キー、外部キー、パーティショニング、インデックスなどの数多くの人気のあるPostgreSQLの機能を活用しています。

私たちはこれらの概念それぞれをClickHouseの同等物に移行します。

このデータセットをPostgreSQLインスタンスにロードして移行ステップをテストしたいユーザーのために、DDLを含む`pg_dump`形式のデータをダウンロード可能にしました。続くデータロードコマンドは以下の通りです：

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

ClickHouseにとっては小規模ですが、Postgresにとっては大規模なデータセットです。上記は2024年の最初の3か月をカバーするサブセットを表しています。

> 私たちの例の結果は、PostgresとClickHouse間のパフォーマンスの違いを示すために完全なデータセットを使用していますが、以下に記載されたすべてのステップは小規模なサブセットでも機能的に同じです。完全なデータセットをPostgresにロードしたいユーザーは[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)をご覧ください。上記のスキーマによって課せられた外部制約のため、PostgreSQL用の完全なデータセットには参照整合性を満たす行のみが含まれています。しかし、制約のない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接ロードすることができます。

## データの移行 {#migrating-data}

### リアルタイム複製（CDC） {#real-time-replication-or-cdc}

ClickPipesのPostgreSQL設定についてはこの[ガイド](/integrations/clickpipes/postgres)を参照してください。このガイドでは、さまざまなタイプのPostgresインスタンスについて説明しています。

ClickPipesまたはPeerDBを使用したCDCアプローチでは、PostgreSQLデータベース内の各テーブルがClickHouseに自動的に複製されます。

リアルタイムに近い形での更新および削除を処理するために、ClickPipesはPostgresテーブルをClickHouseにマッピングします。これは[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用しており、ClickHouseでの更新と削除を処理するために特に設計されています。ClickPipesを使用してデータがClickHouseにどのように複製されるかについての詳細は[こちら](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)で確認できます。CDCを使用した複製では、更新や削除の操作を複製する際にClickHouse内で重複した行が生成されることに注意が必要です。[FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier)修飾子を使用した重複排除の[手法](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)を参照してください。

次に、ClickPipesを使用して`users`テーブルがClickHouseでどのように作成されるかを見てみましょう。

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

設定が完了すると、ClickPipesはPostgreSQLからClickHouseへのすべてのデータの移行を開始します。ネットワークとデプロイのサイズによっては、Stack Overflowデータセットの移行は数分以内に完了するはずです。

### 手動バルクロードと定期的な更新 {#initial-bulk-load-with-periodic-updates}

手動アプローチを使用した最初のバルクロードは、以下の方法で実現できます：

- **テーブル関数** - ClickHouseの[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して、Postgresからデータを`SELECT`し、ClickHouseテーブルに`INSERT`します。数百GBに及ぶデータセットのバルクロードに関連しています。
- **エクスポート** - CSVやSQLスクリプトファイルなどの中間形式にエクスポートします。これらのファイルは、クライアントの`INSERT FROM INFILE`句を通じてClickHouseにロードするか、オブジェクトストレージおよびそれに関連する関数（例：s3、gcs）を用いてロードできます。

PostgreSQLからデータを手動でロードする際には、まずClickHouseにテーブルを作成する必要があります。ClickHouseでテーブルスキーマを最適化するためにStack Overflowデータセットを使用したこの[データモデリングドキュメント](/data-modeling/schema-design#establish-initial-schema)を参照してください。

PostgreSQLとClickHouse間でデータ型が異なる場合があります。各テーブルカラムの同等の型を確立するには、[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して`DESCRIBE`コマンドを実行します。以下のコマンドはPostgreSQL内の`posts`テーブルを記述します。ご自身の環境に応じて修正してください：

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQLとClickHouse間のデータ型マッピングの概観については、[付録ドキュメント](/migrations/postgresql/appendix#data-type-mappings)を参照してください。

このスキーマの型を最適化する手順は、ParquetやS3など他のソースからデータがロードされた場合の手順と同一です。この[代替ガイドを使用してParquet](/data-modeling/schema-design)で説明されているプロセスを適用すると、以下のスキーマが得られます：

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
COMMENT 'Optimized types'
```

これをシンプルな`INSERT INTO SELECT`で人口を増やすことができ、PostgresSQLからデータを読み込み、ClickHouseに挿入します：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

増分読み込みは、スケジュールすることができます。Postgresテーブルが挿入のみに受け取る場合、インクリメントIDまたはタイムスタンプが存在する場合、ユーザーは上記のテーブル関数アプローチを使用してインクリメントをロードできます。つまり、`SELECT`に`WHERE`句を適用することができます。このアプローチは、同じカラムを更新することが保証されていれば、更新をサポートするためにも使用できます。ただし、削除をサポートするには、完全な再ロードが必要になるため、テーブルが成長するにつれて達成が困難になる可能性があります。

私たちは、`CreationDate`（行が更新されると更新されると仮定しています）を使用して初期ロードと増分ロードを示します。

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouseは、`=`、`!=`、`>`、`>=`、`<`、`<=`、およびINなどの単純な`WHERE`句をPostgreSQLサーバーにプッシュダウンします。したがって、変更セットを識別するために使用されるカラムにインデックスが存在することを確認することで、増分読み込みをより効率的にすることができます。

> クエリ複製を使用してUPDATE操作を検出する可能性のある方法の一つは、ウォーターマークとして[`XMIN`システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクションID）を使用することです。このカラムの変化は変更を示し、したがって宛先テーブルに適用できます。このアプローチを使用するユーザーは、`XMIN`値がラップアラウンドされる可能性があり、比較にはフルテーブルスキャンが必要になるため、変更を追跡することがより複雑になることを認識する必要があります。

[こちらをクリックしてパート2へ](/migrations/postgresql/rewriting-queries)
