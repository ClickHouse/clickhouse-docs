---
sidebar_label: '重複排除戦略'
description: '重複と削除された行を処理します。'
slug: /integrations/clickpipes/postgres/deduplication
title: '重複排除戦略（CDCを使用）'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

PostgresからClickHouseにレプリケーションされた更新および削除は、ClickHouseのデータストレージ構造とレプリケーションプロセスのために、重複した行を生じさせます。このページでは、なぜこれが起こるのか、ClickHouseで重複を処理するための戦略を説明します。

## データはどのようにレプリケートされるのか？ {#how-does-data-get-replicated}

### PostgreSQLの論理デコーディング {#PostgreSQL-logical-decoding}

ClickPipesは、[Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication)を使用して、Postgresで発生する変更を取得します。Postgresの論理デコーディングプロセスにより、ClickPipesのようなクライアントは、INSERT、UPDATE、DELETEの一連の操作を人間が読みやすい形式で受け取ることができます。

### ReplacingMergeTree {#replacingmergetree}

ClickPipesは、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用して、PostgresテーブルをClickHouseにマッピングします。ClickHouseは、追加専用のワークロードで最もパフォーマンスが高く、頻繁なUPDATEは推奨されません。ここで、ReplacingMergeTreeが特に強力です。

ReplacingMergeTreeでは、更新は行の新しいバージョン（`_peerdb_version`）としてモデル化され、削除は新しいバージョンと`_peerdb_is_deleted`がtrueとしてマークされた挿入としてモデル化されます。ReplacingMergeTreeエンジンは、バックグラウンドでデータを重複排除/マージし、特定の主キー（id）に対して最新の行のバージョンを保持するため、バージョン付きの挿入としてUPDATEおよびDELETEを効率的に処理できます。

以下は、ClickPipesがClickHouseにテーブルを作成するために実行したCREATE TABLEステートメントの例です。

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

### 具体的な例 {#illustrative-example}

以下のイラストは、ClickPipesを使用してPostgreSQLとClickHouse間で`users`テーブルの同期を行う基本的な例を示しています。

<Image img={clickpipes_initial_load} alt="ClickPipes初期ロード" size="lg"/>

**ステップ1**では、PostgreSQLとClickPipesにおける2行の初期スナップショットを示し、ClickHouseへのそれらの2行の初期ロードを行っています。ご覧の通り、両方の行がそのままClickHouseにコピーされます。

**ステップ2**では、usersテーブルに対して新しい行を挿入し、既存の行を更新し、別の行を削除するという三つの操作を示します。

**ステップ3**では、ClickPipesがINSERT、UPDATE、DELETE操作をClickHouseにバージョン付きの挿入としてレプリケートする様子を示しています。UPDATEはID 2の行の新しいバージョンとして現れ、DELETEはID 1の新しいバージョンとして現れ、これは`_is_deleted`を用いてtrueとしてマークされています。そのため、ClickHouseはPostgreSQLと比較して3つの追加行を持つことになります。

その結果、`SELECT count(*) FROM users;`のようなシンプルなクエリを実行すると、ClickHouseとPostgreSQLで異なる結果が得られるかもしれません。 [ClickHouseのマージに関するドキュメント](/merges#replacing-merges)によると、古い行のバージョンは最終的にマージプロセス中に破棄されます。しかし、このマージのタイミングは予測できず、ClickHouseのクエリはそれが発生するまで不整合な結果を返す可能性があります。

ClickHouseとPostgreSQLで同一のクエリ結果をどのように確保できますか？

### FINALキーワードを使用して重複排除 {#deduplicate-using-final-keyword}

ClickHouseクエリでデータを重複排除する推奨方法は、[FINAL修飾子](/sql-reference/statements/select/from#final-modifier)を使用することです。これにより、重複排除された行のみが返されます。

以下の3つの異なるクエリにどのように適用するか見てみましょう。

_以下のクエリのWHERE句に注意してください。これは削除された行を除外するために使用されます。_

- **シンプルなカウントクエリ**: 投稿の数をカウントする。

これは同期が正常に行われたか確認するための最もシンプルなクエリです。両方のクエリは同じカウントを返すべきです。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL where _peerdb_is_deleted=0;
```

- **JOINを用いたシンプルな集計**: 最もビューを蓄積した上位10ユーザー。

単一のテーブルに対する集計の一例です。ここに重複があると、合計関数の結果に大きな影響を与えます。

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

クエリ内の各テーブル名にFINAL修飾子を追加する代わりに、[FINAL設定](/operations/settings/settings#final)を使用することで、自動的にすべてのテーブルに適用することができます。

この設定は、クエリごとまたはセッション全体に適用できます。

```sql
-- クエリごとのFINAL設定
SELECT count(*) FROM posts SETTINGS final = 1;

-- セッションでFINALを設定
SET final = 1;
SELECT count(*) FROM posts; 
```

#### 行ポリシー {#row-policy}

冗長な`_peerdb_is_deleted = 0`のフィルターを隠す簡単な方法は、[行ポリシー](/docs/operations/access-rights#row-policy-management)を使用することです。以下は、votesテーブルのすべてのクエリから削除された行を除外するための行ポリシーを作成する例です。

```sql
-- すべてのユーザーに行ポリシーを適用
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行ポリシーはユーザーおよびロールのリストに適用されます。この例では、すべてのユーザーおよびロールに適用されています。特定のユーザーまたはロールのみを調整して適用することも可能です。

### Postgresと同様のクエリ {#query-like-with-postgres}

分析データセットをPostgreSQLからClickHouseに移行する際、データ処理やクエリ実行の違いを考慮してアプリケーションクエリを修正する必要があります。

このセクションでは、元のクエリを変更せずにデータの重複を排除する手法を探ります。

#### ビュー {#views}

[ビュー](/sql-reference/statements/create/view#normal-view)は、クエリからFINALキーワードを隠すのに最適な方法です。これにより、データを保存せず、各アクセス時に別のテーブルから単に読み取ります。

以下は、削除された行のフィルターとFINALキーワードを用いて、ClickHouse内のデータベースの各テーブルに対してビューを作成する例です。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

その後、PostgreSQLで使用するのと同じクエリを使用してビューをクエリできます。

```sql
-- 最もビューされた投稿
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```

#### リフレッシュ可能なマテリアライズドビュー {#refreshable-material-view}

別のアプローチは、[リフレッシュ可能マテリアライズドビュー](/materialized-view/refreshable-materialized-view)を使用することです。これにより、行の重複を排除し、その結果を宛先テーブルに保存するためのクエリの実行をスケジュールできます。各スケジュールされたリフレッシュ時に、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、FINALキーワードを使用したクエリがリフレッシュ中に一度だけ実行され、その後に宛先テーブルでのクエリがFINALを使用する必要がないことです。

しかし、欠点は、宛先テーブルのデータが最も最近のリフレッシュまでのものであることです。それでも、多くのユースケースでは数分から数時間のリフレッシュ間隔が十分かもしれません。

```sql
-- 重複排除された投稿テーブルを作成
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
