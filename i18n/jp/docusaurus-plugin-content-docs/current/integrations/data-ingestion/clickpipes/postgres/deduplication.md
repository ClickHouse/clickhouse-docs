---
sidebar_label: '重複排除戦略'
description: '重複行や削除済み行を処理します。'
slug: /integrations/clickpipes/postgres/deduplication
title: '重複排除戦略（CDC の利用）'
keywords: ['重複排除', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Postgres から ClickHouse へレプリケーションされた更新および削除は、ClickHouse のデータ格納構造とレプリケーション処理の仕組みにより、ClickHouse 側で行が重複する原因になります。このページでは、その理由と、ClickHouse で重複を処理するための戦略について説明します。

## データはどのように複製されるのか？ {#how-does-data-get-replicated}

### PostgreSQL のロジカルデコーディング {#PostgreSQL-logical-decoding}

ClickPipes は、Postgres で発生した変更を取り込むために [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) を使用します。Postgres の Logical Decoding プロセスにより、ClickPipes のようなクライアントは、変更を人間が読みやすい形式、すなわち一連の INSERT、UPDATE、DELETE として受け取ることができます。

### ReplacingMergeTree {#replacingmergetree}

ClickPipes は、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) エンジンを使用して Postgres のテーブルを ClickHouse にマッピングします。ClickHouse は追記専用（append-only）のワークロードで最も高いパフォーマンスを発揮し、頻繁な UPDATE を推奨していません。この点で ReplacingMergeTree は特に強力です。

ReplacingMergeTree では、UPDATE は、その行の新しいバージョン（`_peerdb_version`）を持つ INSERT としてモデル化され、DELETE は、`_peerdb_is_deleted` が true に設定された、さらに新しいバージョンの INSERT としてモデル化されます。ReplacingMergeTree エンジンはバックグラウンドでデータの重複排除とマージを行い、指定されたプライマリキー（id）ごとに最新バージョンの行のみを保持します。これにより、UPDATE と DELETE をバージョン付き INSERT として効率的に処理できます。

以下は、ClickPipes が ClickHouse にテーブルを作成する際に実行する CREATE TABLE ステートメントの例です。

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

### 説明用の例 {#illustrative-example}

以下の図は、PostgreSQL と ClickHouse 間で `users` テーブルを ClickPipes を使って同期する基本的な例を順を追って説明したものです。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg" />

**ステップ 1** では、PostgreSQL 上の 2 行の初期スナップショットと、それら 2 行を ClickHouse に初回ロードしている ClickPipes の様子を示しています。わかるように、両方の行はそのままの形で ClickHouse にコピーされています。

**ステップ 2** では、users テーブルに対する 3 つの操作を示しています: 新しい行の挿入、既存行の更新、別の行の削除です。

**ステップ 3** では、ClickPipes が INSERT、UPDATE、DELETE 操作を ClickHouse にバージョン付きの挿入としてどのように複製するかを示しています。UPDATE は ID 2 の行の新しいバージョンとして現れ、DELETE は `_is_deleted` を使って true とマークされた ID 1 の新しいバージョンとして現れます。このため、ClickHouse には PostgreSQL よりも 3 行多く存在することになります。

その結果、`SELECT count(*) FROM users;` のような単純なクエリを実行すると、ClickHouse と PostgreSQL で異なる結果が返る場合があります。[ClickHouse のマージに関するドキュメント](/merges#replacing-merges) によると、古いバージョンの行はマージ処理の過程で最終的には破棄されます。ただし、このマージがいつ行われるかは予測できないため、それが行われるまでの間、ClickHouse のクエリ結果は一貫しない可能性があります。

どのようにすれば、ClickHouse と PostgreSQL の両方で同一のクエリ結果を得られるようにできるでしょうか。

### FINAL キーワードを使った重複排除 {#deduplicate-using-final-keyword}

ClickHouse のクエリでデータの重複排除を行う推奨方法は、[FINAL 修飾子](/sql-reference/statements/select/from#final-modifier) を使用することです。これにより、重複排除後の行のみが返されます。

これを 3 種類のクエリにどのように適用するかを見ていきます。

*以下のクエリにおける WHERE 句に注目してください。削除済みの行を除外するために使用されています。*

* **単純なカウントクエリ**: 投稿数をカウントする。

これは、同期が正しく行われたかを確認するために実行できる最も単純なクエリです。2 つのクエリは同じ件数を返すはずです。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

* **JOIN を用いた単純な集計**: 表示回数の合計が最も多いトップ 10 ユーザー。

単一テーブルに対する集計の例です。ここに重複行があると、`sum` 関数の結果に大きな影響を与えます。

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

#### FINAL 設定 {#final-setting}

クエリ内の各テーブル名に FINAL 修飾子を付ける代わりに、[FINAL 設定](/operations/settings/settings#final) を使用して、クエリ内のすべてのテーブルに自動的に適用できます。

この設定は、クエリ単位、またはセッション全体に対して適用できます。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### ROW ポリシー {#row-policy}

冗長な `_peerdb_is_deleted = 0` フィルターを明示的に記述しなくて済むようにする簡単な方法は、[ROW ポリシー](/docs/operations/access-rights#row-policy-management) を使用することです。以下は、votes テーブルに対するすべてのクエリから削除済み行を除外する ROW ポリシーを作成する例です。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行ポリシーは、ユーザーおよびロールの一覧に対して適用されます。この例では、すべてのユーザーおよびロールに適用されています。必要に応じて、特定のユーザーまたはロールのみに絞り込むこともできます。

### Postgres と同じようにクエリする {#query-like-with-postgres}

分析用データセットを PostgreSQL から ClickHouse に移行する場合、多くの場合、データの扱いやクエリ実行方法の違いを考慮してアプリケーションのクエリを変更する必要があります。

このセクションでは、元のクエリを変更せずにデータの重複排除を行うための手法を説明します。

#### ビュー {#views}

[ビュー](/sql-reference/statements/create/view#normal-view) は、クエリから `FINAL` キーワードを隠すための優れた方法です。ビュー自体はデータを保持せず、アクセスのたびに別のテーブルを読み取るだけです。

以下は、ClickHouse 上のデータベース内の各テーブルに対して、`FINAL` キーワードおよび削除済み行を除外するためのフィルタ条件を含んだビューを作成する例です。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

次に、PostgreSQL で使用するのと同じクエリをビューに対して実行できます。

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

#### リフレッシュ可能なマテリアライズドビュー {#refreshable-material-view}

別のアプローチとして、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view) を使用する方法があります。これにより、行の重複排除を行うクエリの実行をスケジュールし、その結果を宛先テーブルに保存できます。各スケジュールされたリフレッシュのたびに、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、`FINAL` キーワードを使用するクエリがリフレッシュ時に 1 回だけ実行され、その後は宛先テーブルに対するクエリで `FINAL` を使用する必要がなくなる点です。

一方で、この方法の欠点は、宛先テーブル内のデータが直近のリフレッシュ時点までしか最新ではないことです。とはいえ、多くのユースケースでは、数分から数時間程度のリフレッシュ間隔で十分である場合が少なくありません。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

その後は、`deduplicated_posts` テーブルに対して通常どおりクエリを実行できます。

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
