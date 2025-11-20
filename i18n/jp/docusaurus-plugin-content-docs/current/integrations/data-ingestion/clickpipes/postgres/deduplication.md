---
sidebar_label: '重複排除戦略'
description: '重複行および削除行を処理します。'
slug: /integrations/clickpipes/postgres/deduplication
title: '重複排除戦略（CDC の使用）'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Postgres から ClickHouse へレプリケートされた更新および削除は、ClickHouse のデータ保存構造とレプリケーション処理の仕組みにより、ClickHouse 側で行が重複してしまうことがあります。このページでは、なぜそのようなことが起こるのか、そして重複を処理するために ClickHouse で利用できる戦略について説明します。


## データはどのようにレプリケートされるか？ {#how-does-data-get-replicated}

### PostgreSQL論理デコーディング {#PostgreSQL-logical-decoding}

ClickPipesは[Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication)を使用して、Postgresで発生する変更をリアルタイムで取得します。Postgresの論理デコーディングプロセスにより、ClickPipesのようなクライアントは、人間が読める形式、つまりINSERT、UPDATE、DELETEの一連の操作として変更を受け取ることができます。

### ReplacingMergeTree {#replacingmergetree}

ClickPipesは、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)エンジンを使用してPostgresテーブルをClickHouseにマッピングします。ClickHouseは追記専用のワークロードで最高のパフォーマンスを発揮し、頻繁なUPDATEは推奨されません。ReplacingMergeTreeはこのような場合に特に有効です。

ReplacingMergeTreeでは、更新は新しいバージョン（`_peerdb_version`）を持つ行の挿入としてモデル化され、削除は新しいバージョンを持ち`_peerdb_is_deleted`がtrueにマークされた挿入としてモデル化されます。ReplacingMergeTreeエンジンはバックグラウンドでデータの重複排除とマージを行い、指定されたプライマリキー（id）に対して最新バージョンの行を保持することで、UPDATEとDELETEをバージョン管理された挿入として効率的に処理します。

以下は、ClickPipesがClickHouseでテーブルを作成する際に実行するCREATE Table文の例です。

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

### 実例 {#illustrative-example}

以下の図は、ClickPipesを使用してPostgreSQLとClickHouse間で`users`テーブルを同期する基本的な例を示しています。

<Image img={clickpipes_initial_load} alt='ClickPipes initial load' size='lg' />

**ステップ1**は、PostgreSQLの2行の初期スナップショットと、ClickPipesがこれらの2行をClickHouseに初期ロードする様子を示しています。ご覧のとおり、両方の行はそのままClickHouseにコピーされます。

**ステップ2**は、usersテーブルに対する3つの操作を示しています：新しい行の挿入、既存の行の更新、別の行の削除です。

**ステップ3**は、ClickPipesがINSERT、UPDATE、DELETE操作をバージョン管理された挿入としてClickHouseにレプリケートする方法を示しています。UPDATEはID 2の行の新しいバージョンとして表示され、DELETEは`_is_deleted`を使用してtrueとマークされたID 1の新しいバージョンとして表示されます。このため、ClickHouseはPostgreSQLと比較して3つの追加行を持つことになります。

その結果、`SELECT count(*) FROM users;`のような単純なクエリを実行すると、ClickHouseとPostgreSQLで異なる結果が生成される可能性があります。[ClickHouseマージドキュメント](/merges#replacing-merges)によると、古いバージョンの行はマージプロセス中に最終的に破棄されます。ただし、このマージのタイミングは予測不可能であり、マージが発生するまでClickHouseのクエリは一貫性のない結果を返す可能性があります。

ClickHouseとPostgreSQLの両方で同一のクエリ結果を保証するにはどうすればよいでしょうか？

### FINALキーワードを使用した重複排除 {#deduplicate-using-final-keyword}

ClickHouseクエリでデータの重複を排除する推奨方法は、[FINAL修飾子](/sql-reference/statements/select/from#final-modifier)を使用することです。これにより、重複排除された行のみが返されることが保証されます。

3つの異なるクエリへの適用方法を見てみましょう。

_以下のクエリのWHERE句に注目してください。これは削除された行をフィルタリングするために使用されます。_

- **単純なカウントクエリ**：投稿数をカウントします。

これは、同期が正常に行われたかどうかを確認するために実行できる最も単純なクエリです。2つのクエリは同じカウントを返すはずです。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

- **JOINを使用した単純な集計**：最も多くのビューを蓄積した上位10人のユーザー。

単一テーブルに対する集計の例です。ここで重複があると、合計関数の結果に大きな影響を与えます。


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

クエリ内の各テーブル名にFINAL修飾子を追加する代わりに、[FINAL設定](/operations/settings/settings#final)を使用することで、クエリ内のすべてのテーブルに自動的に適用できます。

この設定は、クエリ単位またはセッション全体に適用できます。

```sql
-- クエリ単位のFINAL設定
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- セッションにFINALを設定
SET final = 1;
SELECT count(*) FROM posts;
```

#### ROWポリシー {#row-policy}

冗長な`_peerdb_is_deleted = 0`フィルタを隠す簡単な方法は、[ROWポリシー](/docs/operations/access-rights#row-policy-management)を使用することです。以下は、votesテーブルに対するすべてのクエリから削除済み行を除外するROWポリシーを作成する例です。

```sql
-- すべてのユーザーにROWポリシーを適用
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> ROWポリシーは、ユーザーとロールのリストに適用されます。この例では、すべてのユーザーとロールに適用されています。特定のユーザーまたはロールのみに限定することもできます。

### Postgresと同様のクエリ {#query-like-with-postgres}

PostgreSQLからClickHouseへ分析データセットを移行する際、データ処理とクエリ実行の違いに対応するため、アプリケーションクエリの変更が必要になることがよくあります。

このセクションでは、元のクエリを変更せずにデータの重複を排除する手法について説明します。

#### ビュー {#views}

[ビュー](/sql-reference/statements/create/view#normal-view)は、クエリからFINALキーワードを隠す優れた方法です。ビューはデータを保存せず、アクセスごとに別のテーブルから読み取りを実行するだけです。

以下は、ClickHouseのデータベース内の各テーブルに対して、FINALキーワードと削除済み行のフィルタを使用してビューを作成する例です。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

その後、PostgreSQLで使用するのと同じクエリを使用してビューをクエリできます。

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

#### リフレッシュ可能なマテリアライズドビュー {#refreshable-material-view}

別のアプローチは、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)を使用することです。これにより、行の重複排除とその結果を宛先テーブルに保存するクエリ実行をスケジュールできます。スケジュールされたリフレッシュごとに、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、FINALキーワードを使用するクエリがリフレッシュ時に一度だけ実行されるため、宛先テーブルに対する後続のクエリでFINALを使用する必要がなくなることです。

ただし、欠点として、宛先テーブルのデータは最新のリフレッシュ時点のものに限られます。とはいえ、多くのユースケースでは、数分から数時間のリフレッシュ間隔で十分な場合があります。

```sql
-- 重複排除されたpostsテーブルを作成
CREATE TABLE deduplicated_posts AS posts;

-- マテリアライズドビューを作成し、1時間ごとに実行するようスケジュール
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
