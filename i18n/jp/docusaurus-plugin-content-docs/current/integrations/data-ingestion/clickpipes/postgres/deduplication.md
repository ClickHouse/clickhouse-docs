---
sidebar_label: '重複除去戦略'
description: '重複と削除された行の処理。'
slug: '/integrations/clickpipes/postgres/deduplication'
title: '重複除去戦略 (CDCを使用)'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Updates and deletes replicated from Postgres to ClickHouse result in duplicated rows in ClickHouse due to its data storage structure and the replication process. This page covers why this happens and the strategies to use in ClickHouse to handle duplicates.

## データはどのようにレプリケートされますか？ {#how-does-data-get-replicated}

### PostgreSQLの論理デコーディング {#PostgreSQL-logical-decoding}

ClickPipesは、[Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication)を使用して、Postgres内で発生する変更を消費します。Postgresの論理デコーディングプロセスにより、ClickPipesのようなクライアントは、INSERT、UPDATE、およびDELETEの一連の操作として、人間が読みやすい形式で変更を受け取ることができます。

### ReplacingMergeTree {#replacingmergetree}

ClickPipesは、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用してPostgresテーブルをClickHouseにマップします。ClickHouseは、追加専用のワークロードで最も良いパフォーマンスを発揮し、頻繁なUPDATEを推奨していません。ここで、ReplacingMergeTreeが特に強力になります。

ReplacingMergeTreeでは、更新は、新しいバージョン(`_peerdb_version`)を持つ行の挿入としてモデル化され、削除は新しいバージョンを持ち、`_peerdb_is_deleted`がtrueとしてマークされた挿入としてモデル化されます。ReplacingMergeTreeエンジンは、バックグラウンドでデデュプリケート/マージを行い、特定の主キー(id)の最新バージョンの行を保持し、バージョン付きのINSERTとしてUPDATEとDELETEを効率的に処理します。

以下は、ClickPipesによってClickHouseでテーブルを作成するために実行されたCREATE TABLEステートメントの例です。

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

以下のイラストは、PostgreSQLとClickHouse間のテーブル`users`の同期の基本的な例を示しています。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**ステップ1**では、PostgreSQL内の2行の初期スナップショットとClickPipesがそれらの2行をClickHouseに初期ロードしている様子が示されています。観察できるように、両方の行はそのままClickHouseにコピーされます。

**ステップ2**では、ユーザーテーブルに対する3つの操作が示されています：新しい行の挿入、既存の行の更新、別の行の削除。

**ステップ3**では、ClickPipesがINSERT、UPDATE、DELETE操作をClickHouseにバージョン付きの挿入としてレプリケートする様子が示されています。UPDATEはID2の行の新しいバージョンとして現れ、一方でDELETEはID1の新しいバージョンとして現れ、`_is_deleted`を使用してtrueとしてマークされます。このため、ClickHouseにはPostgreSQLに比べて3つの追加行があります。

その結果、`SELECT count(*) FROM users;`のようなシンプルなクエリを実行すると、ClickHouseとPostgreSQLで異なる結果が得られることがあります。[ClickHouseマージドキュメント](/merges#replacing-merges)によると、古くなった行のバージョンは最終的にマージプロセス中に破棄されます。しかし、このマージのタイミングは予測できず、ClickHouseのクエリはそれが行われるまで一貫性のない結果を返す可能性があります。

ClickHouseとPostgreSQLの両方で同じクエリ結果を保証するにはどうすればよいでしょうか？

### FINALキーワードを使用してデデュプリケートする {#deduplicate-using-final-keyword}

ClickHouseクエリでデデュプリケートデータを処理する推奨方法は、[FINAL修飾子](/sql-reference/statements/select/from#final-modifier)を使用することです。これにより、デデュプリケートされた行のみが返されます。

これを3つの異なるクエリに適用する方法を見てみましょう。

_次のクエリのWHERE句に注意してください。これは削除された行を除外するために使用されます。_

- **単純なカウントクエリ**：投稿の数をカウントします。

これは、同期が正常かどうかを確認するために実行できる最も簡単なクエリです。両方のクエリは同じカウントを返すべきです。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL where _peerdb_is_deleted=0;
```

- **JOINを使用した単純な集計**：最も多くのビューを獲得した上位10ユーザー。

単一のテーブルに対する集計の例です。ここに重複があると、SUM関数の結果に大きな影響を与えるでしょう。

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid as user_id,
    u.displayname as display_name
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

クエリ内の各テーブル名にFINAL修飾子を追加する代わりに、[FINAL設定](/operations/settings/settings#final)を使用して、クエリ内のすべてのテーブルに自動的に適用することができます。

この設定は、クエリごとまたはセッション全体に適用できます。

```sql
-- クエリごとのFINAL設定
SELECT count(*) FROM posts SETTINGS final = 1;

-- セッションに対してFINALを設定
SET final = 1;
SELECT count(*) FROM posts; 
```

#### ROWポリシー {#row-policy}

冗長な`_peerdb_is_deleted = 0`フィルターを隠す簡単な方法は、[ROWポリシー](/operations/access-rights#row-policy-management)を使用することです。以下は、テーブルvotesのすべてのクエリから削除された行を除外するための行ポリシーを作成する例です。

```sql
-- すべてのユーザーに行ポリシーを適用
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行ポリシーは、ユーザーとロールのリストに適用されます。この例では、すべてのユーザーとロールに適用されています。これは特定のユーザーやロールのみに調整できます。

### PostgreSQLのようにクエリする {#query-like-with-postgres}

PostgreSQLからClickHouseに分析データセットを移行するには、データ処理とクエリ実行の違いを考慮してアプリケーションクエリを変更する必要があります。

このセクションでは、オリジナルのクエリを変更せずにデータをデデュプリケートする技術を探ります。

#### ビュー {#views}

[ビュー](/sql-reference/statements/create/view#normal-view)は、クエリからFINALキーワードを隠すのに最適な方法です。なぜなら、ビューはデータを格納せず、各アクセス時に別のテーブルから単に読み込みを行うからです。

以下に、削除された行のフィルターとFINALキーワードを使用して、ClickHouseのデータベース内の各テーブルのビューを作成する例を示します。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

その後、PostgreSQLで使用するのと同じクエリを使ってビューをクエリできます。

```sql
-- 最も閲覧された投稿
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

別のアプローチとして、[更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)を使用することができます。これにより、行のデデュプリケーションのためのクエリの実行をスケジュールし、その結果を宛先テーブルに保存できます。各スケジュールされた更新時に、宛先テーブルは最新のクエリ結果に置き換えられます。

この方法の主な利点は、FINALキーワードを使用するクエリが更新時に1回だけ実行され、その後の宛先テーブルに対するクエリでFINALを使用する必要がなくなることです。

ただし、欠点は、宛先テーブルのデータは最も最近の更新時点のものに過ぎないということです。それでも、多くのユースケースでは、数分から数時間の更新間隔が十分であるかもしれません。

```sql
-- デデュプリケートされた投稿テーブルの作成 
CREATE TABLE deduplicated_posts AS posts;

-- マテリアライズドビューを作成し、毎時実行されるようにスケジュール
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

その後、`deduplicated_posts`テーブルを通常通りクエリできます。

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
