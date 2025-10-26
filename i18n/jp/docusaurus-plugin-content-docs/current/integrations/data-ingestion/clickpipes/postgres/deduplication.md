---
'sidebar_label': '重複排除戦略'
'description': '重複および削除された行を処理します。'
'slug': '/integrations/clickpipes/postgres/deduplication'
'title': '重複排除戦略 (CDCを使用)'
'doc_type': 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Updates and deletes replicated from Postgres to ClickHouse result in duplicated rows in ClickHouse due to its data storage structure and the replication process. This page covers why this happens and the strategies to use in ClickHouse to handle duplicates.

## データはどのようにレプリケートされるのか？ {#how-does-data-get-replicated}

### PostgreSQL論理デコーディング {#PostgreSQL-logical-decoding}

ClickPipesは、[Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication)を使用して、Postgresでの変更をリアルタイムで取得します。Postgresにおける論理デコーディングプロセスは、ClickPipesのようなクライアントが人間が読める形式、つまり一連のINSERT、UPDATE、およびDELETEとして変更を受け取ることを可能にします。

### ReplacingMergeTree {#replacingmergetree}

ClickPipesは、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用して、PostgresのテーブルをClickHouseにマッピングします。ClickHouseは追加専用のワークロードに最適化されており、頻繁なUPDATEは推奨されません。この点で、ReplacingMergeTreeは特に強力です。

ReplacingMergeTreeでは、更新は行の新しいバージョン（`_peerdb_version`）として挿入としてモデル化され、削除は新しいバージョンの挿入および`_peerdb_is_deleted`がtrueとしてマークされます。ReplacingMergeTreeエンジンは、バックグラウンドでデータを重複除去/マージし、特定の主キー（id）に対して最新の行バージョンを保持し、バージョン付き挿入としてのUPDATEおよびDELETEを効率的に処理します。

以下は、ClickPipesによってClickHouseでテーブルを作成するために実行されたCREATE Table文の例です。

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

### 例示的な例 {#illustrative-example}

以下の図は、ClickPipesを使用してPostgreSQLとClickHouse間でテーブル`users`の基本的な同期を説明しています。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**ステップ1**では、PostgreSQLにおける2行の初期スナップショットと、ClickPipesがその2行をClickHouseに初期ロードする様子が示されています。見るとおり、両方の行はそのままClickHouseにコピーされています。

**ステップ2**では、usersテーブルに対する3つの操作：新しい行の挿入、既存の行の更新、および別の行の削除が示されています。

**ステップ3**では、ClickPipesがINSERT、UPDATE、およびDELETE操作をClickHouseにバージョン付きの挿入としてレプリケートする様子が示されています。UPDATEはID 2の行の新しいバージョンとして現れ、DELETEは`_is_deleted`を使用してtrueとしてマークされるID 1の新しいバージョンとして現れます。このため、ClickHouseにはPostgreSQLに比べて3行が追加されていることになります。

その結果、`SELECT count(*) FROM users;`のような簡単なクエリを実行すると、ClickHouseとPostgreSQLで異なる結果が返される可能性があります。[ClickHouseマージのドキュメント](/merges#replacing-merges)によれば、古い行バージョンはマージプロセス中に最終的に破棄されます。ただし、このマージのタイミングは予測できないため、ClickHouseではマージが発生するまでクエリが不一致な結果を返す可能性があります。

ClickHouseとPostgreSQLで同一のクエリ結果を確保するにはどうすればよいでしょうか？

### FINALキーワードを使用して重複を排除する {#deduplicate-using-final-keyword}

ClickHouseクエリでデータを重複除去する推奨方法は、[FINAL修飾子](/sql-reference/statements/select/from#final-modifier)を使用することです。これにより、重複が排除された行のみが返されます。

これを3つの異なるクエリに適用する方法を見てみましょう。

_以下のクエリでは、削除された行をフィルタリングするためにWHERE句に注意してください。_

- **単純なカウントクエリ**：投稿の数をカウントする。

これは、同期が正常に行われたかどうかを確認するための最も簡単なクエリです。2つのクエリは同じカウントを返すべきです。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

- **JOINを使用した単純な集計**：最も多くのビューを蓄積したトップ10ユーザー。

単一のテーブルに対する集計の例です。ここに重複があると、合計関数の結果に大きな影響を与えることになります。

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts p
LEFT JOIN users u ON u.id = p.owneruserid
-- highlight-next-line
WHERE p.owneruserid > 0
GROUP BY user_id, display_name
ORDER BY viewcount DESC
LIMIT 10;

-- ClickHouse 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
-- highlight-next-line
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
```

#### FINAL設定 {#final-setting}

クエリの各テーブル名にFINAL修飾子を追加するのではなく、[FINAL設定](/operations/settings/settings#final)を使用して、クエリ内のすべてのテーブルに自動的に適用できます。

この設定は、クエリごとにもセッション全体にも適用できます。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### 行ポリシー {#row-policy}

冗長な`_peerdb_is_deleted = 0`フィルターを隠す簡単な方法は、[行ポリシー](/docs/operations/access-rights#row-policy-management)を使用することです。以下は、votesテーブルのすべてのクエリから削除された行を除外する行ポリシーを作成する例です。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行ポリシーは、ユーザーとロールのリストに適用されます。この例では、すべてのユーザーとロールに適用されています。特定のユーザーまたはロールのみを対象に調整することができます。

### Postgresのようにクエリ {#query-like-with-postgres}

PostgreSQLからClickHouseに分析データセットを移行するには、データ処理やクエリ実行の違いを考慮して、アプリケーションクエリを変更する必要があります。

このセクションでは、元のクエリを変更せずにデータの重複を排除するための技術を探ります。

#### ビュー {#views}

[ビュー](/sql-reference/statements/create/view#normal-view)は、クエリからFINALキーワードを隠すための素晴らしい方法です。ビューはデータを保存せず、アクセスごとに別のテーブルから読み取りを行います。

以下は、FINALキーワードと削除された行のフィルターを使用して、ClickHouseのデータベースの各テーブルのビューを作成する例です。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

その後、PostgreSQLで使用するのと同じクエリを使用してビューをクエリすることができます。

```sql
-- Most viewed posts
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```

#### 更新可能なマテリアライズドビュー {#refreshable-material-view}

別のアプローチは、[更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)を使用することで、行の重複を排除するためにクエリ実行をスケジュールし、結果を宛先テーブルに保存できるようにします。各スケジュールされた更新で、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、FINALキーワードを使用したクエリが更新の間に1回だけ実行されるため、宛先テーブルでの後続のクエリがFINALを使用する必要がないことです。

ただし、欠点は、宛先テーブルのデータは最新の更新までのものであるということです。そのため、多くのユースケースにおいては、数分から数時間の更新間隔が十分である場合もあります。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

その後、`deduplicated_posts`テーブルを通常のようにクエリすることができます。

```sql
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM deduplicated_posts
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10;
```
