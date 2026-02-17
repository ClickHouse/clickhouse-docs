---
sidebar_label: '重複排除の戦略'
description: '重複データと削除済みの行を扱います。'
slug: /integrations/clickpipes/postgres/deduplication
title: '重複排除の戦略（CDC を使用）'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Postgres から ClickHouse へレプリケートされる更新および削除は、ClickHouse のデータ保存構造とレプリケーション処理の仕組みにより、ClickHouse 内で行の重複を引き起こします。このページでは、なぜこの現象が起きるのか、そして重複を処理するために ClickHouse で利用できる戦略について説明します。


## データはどのように複製されるか？ \{#how-does-data-get-replicated\}

### PostgreSQL logical decoding \{#PostgreSQL-logical-decoding\}

ClickPipes は、Postgres で発生した変更を取り込むために [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) を使用します。Postgres の Logical Decoding プロセスにより、ClickPipes のようなクライアントは、人間が読みやすい形式、すなわち一連の INSERT、UPDATE、DELETE として変更を受け取ることができます。

### ReplacingMergeTree \{#replacingmergetree\}

ClickPipes は [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) エンジンを使用して、Postgres テーブルを ClickHouse にマッピングします。ClickHouse は追記専用ワークロードに最適化されており、頻繁な UPDATE の実行は推奨されません。ここで ReplacingMergeTree が特に威力を発揮します。

ReplacingMergeTree では、更新はその行の新しいバージョン（`_peerdb_version`）を持つ挿入として表現され、削除はさらに新しいバージョンの挿入で `_peerdb_is_deleted` が true に設定されたものとして表現されます。ReplacingMergeTree エンジンはバックグラウンドでデータの重複排除とマージを行い、指定された主キー（id）ごとに行の最新バージョンを保持することで、UPDATE および DELETE をバージョン付き挿入として効率的に処理できるようにします。

以下は、ClickPipes が ClickHouse 上にテーブルを作成するために実行する CREATE TABLE 文の例です。

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


### 図解例 \{#illustrative-example\}

以下の図では、PostgreSQL と ClickHouse 間で、ClickPipes を使ってテーブル `users` を同期する基本的な例を順を追って説明します。

<Image img={clickpipes_initial_load} alt="ClickPipes の初回ロード" size="lg"/>

**ステップ 1** では、PostgreSQL 上の 2 行の初期スナップショットと、ClickPipes がそれら 2 行を ClickHouse に初回ロードする様子を示しています。ご覧のとおり、両方の行はそのままの形で ClickHouse にコピーされます。

**ステップ 2** では、users テーブルに対して 3 つの操作が行われます。新しい行の挿入、既存行の更新、別の行の削除です。

**ステップ 3** では、ClickPipes が INSERT、UPDATE、DELETE の各操作を、バージョン付きの挿入として ClickHouse にレプリケートする方法を示しています。UPDATE は ID 2 の行の新しいバージョンとして表現され、DELETE は `_is_deleted` を true に設定した ID 1 の新しいバージョンとして表現されます。このため、ClickHouse には PostgreSQL と比べて 3 行分多くの行が含まれることになります。

その結果、`SELECT count(*) FROM users;` のような単純なクエリを実行すると、ClickHouse と PostgreSQL で異なる結果が返される可能性があります。[ClickHouse のマージに関するドキュメント](/merges#replacing-merges)によると、古いバージョンの行はマージ処理の過程で最終的には破棄されます。しかし、このマージがいつ実行されるかは予測できないため、実行されるまでの間、ClickHouse のクエリ結果が一時的に不整合になる可能性があります。

ClickHouse と PostgreSQL の両方で、クエリ結果を同一にするにはどうすればよいでしょうか？

### FINAL キーワードを使った重複排除 \{#deduplicate-using-final-keyword\}

ClickHouse のクエリでデータを重複排除する推奨方法は、[FINAL 修飾子](/sql-reference/statements/select/from#final-modifier)を使用することです。これにより、重複排除された行のみが返されます。

3 つの異なるクエリにどのように適用するかを見ていきます。

*以下のクエリでは、削除された行を除外するために使用される WHERE 句に注目してください。*

* **単純なカウントクエリ**: 投稿数をカウントします。

これは、同期が正常に行われたかどうかを確認するために実行できる最も単純なクエリです。2 つのクエリは同じ件数になるはずです。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

* **JOIN を用いたシンプルな集計**: 最も多くの `views` を獲得した上位 10 人のユーザー。

単一テーブルに対する集計の例です。このテーブルに重複行があると、`sum` 関数の結果に大きな影響を与えます。

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


#### FINAL 設定 \{#final-setting\}

クエリ内の各テーブル名に FINAL 修飾子を追加する代わりに、[FINAL 設定](/operations/settings/settings#final) を使用すると、クエリ内のすべてのテーブルに自動的に適用されます。

この設定は、クエリ単位またはセッション全体に対して適用できます。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```


#### ROW policy \{#row-policy\}

冗長なフィルタ `_peerdb_is_deleted = 0` を明示的に書かずに済むようにする簡単な方法は、[ROW policy](/docs/operations/access-rights#row-policy-management) を使用することです。以下は、テーブル `votes` に対するすべてのクエリから削除済みの行を除外する ROW policy を作成する例です。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行ポリシーは、ユーザーおよびロールの一覧に対して適用されます。この例では、すべてのユーザーとロールに適用されています。必要に応じて、特定のユーザーやロールのみに適用されるように設定できます。


### Postgres と同様にクエリする \{#query-like-with-postgres\}

分析用データセットを PostgreSQL から ClickHouse に移行する際には、多くの場合、データの扱いやクエリ実行の違いを考慮してアプリケーションのクエリを変更する必要があります。

このセクションでは、元のクエリを変更することなくデータの重複排除を行うための手法を解説します。

#### ビュー \{#views\}

[ビュー](/sql-reference/statements/create/view#normal-view) は、クエリから `FINAL` キーワードを隠すための便利な方法です。ビュー自体はデータを一切保持せず、各アクセス時に単に別のテーブルから読み取ります。

以下は、ClickHouse のデータベース内の各テーブルに対して、`FINAL` キーワードと削除済みの行を除外するフィルタ条件を組み込んだビューを作成する例です。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

次に、PostgreSQL で VIEW に対して実行するのと同じクエリを使って、これらの VIEW をクエリできます。

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


#### リフレッシャブルmaterialized view \{#refreshable-material-view\}

別の方法として、[リフレッシャブルmaterialized view](/materialized-view/refreshable-materialized-view) を使用することもできます。これにより、行の重複排除を行うクエリ実行をスケジュールし、その結果を宛先テーブルに保存できます。スケジュールされたリフレッシュが行われるたびに、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、`FINAL` キーワードを使用するクエリがリフレッシュ時に一度だけ実行されるため、その後に宛先テーブルに対して実行するクエリでは `FINAL` を使用する必要がない点です。

一方の欠点として、宛先テーブル内のデータは、直近のリフレッシュ時点までしか最新にはなりません。とはいえ、多くのユースケースでは、数分から数時間程度のリフレッシュ間隔で十分な場合が少なくありません。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

これで、テーブル `deduplicated_posts` に対して通常どおりクエリを実行できます。

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
