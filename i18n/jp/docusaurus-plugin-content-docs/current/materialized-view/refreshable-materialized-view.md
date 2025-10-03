---
slug: '/materialized-view/refreshable-materialized-view'
title: 'リフレッシュ可能なMaterialized View'
description: 'Materialized Viewを使用してクエリの速度を向上させる方法'
keywords:
- 'refreshable materialized view'
- 'refresh'
- 'materialized views'
- 'speed up queries'
- 'query optimization'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[Refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view) は、従来の OLTP データベースにおけるマテリアライズドビューと概念的に似ており、特定のクエリの結果を保存して迅速な取得を可能にし、リソースを集中的に使用するクエリを繰り返し実行する必要を減少させます。ClickHouse の [incremental materialized views](/materialized-view/incremental-materialized-view) とは異なり、これはフルデータセットに対して定期的にクエリを実行する必要があり、その結果がクエリ用のターゲットテーブルに保存されます。この結果セットは理論的にはオリジナルのデータセットよりも小さくなり、その後のクエリがより迅速に実行されることが期待されます。

この図は、Refreshable Materialized Views の動作を説明しています：

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Refreshable materialized view diagram"/>

以下の動画もご覧いただけます：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Refreshable Materialized Views はいつ使用すべきか？ {#when-should-refreshable-materialized-views-be-used}

ClickHouse のインクリメンタルマテリアライズドビューは非常に強力で、特に単一テーブルに対して集約が必要な場合には、リフレッシュ可能なマテリアライズドビューのアプローチよりも一般にスケールが良好です。データが挿入される際に各データブロックに対してのみ集約を計算し、最終テーブルでインクリメンタル状態をマージすることで、クエリは常にデータのサブセット上でのみ実行されます。この方法は潜在的にペタバイトのデータにスケールし、通常は好まれる方法です。

ただし、このインクリメンタルプロセスが必要ない、または適用できないユースケースも存在します。いくつかの問題はインクリメンタルアプローチとは互換性がないか、リアルタイムでの更新を必要とせず、定期的な再構築がより適切です。たとえば、複雑な結合を使用するため、全データセットにわたるビューの完全な再計算を定期的に実行したい場合があります。

> Refreshable Materialized Views は、非正規化などのタスクを実行するバッチ処理を実行できます。リフレッシュ可能なマテリアライズドビュー間に依存関係を設定することができ、一方のビューは他方の結果に依存し、完了するとのみ実行されます。これは、スケジュールされたワークフローや、[dbt](https://www.getdbt.com/) ジョブのような単純な DAG の代替となります。リフレッシュ可能なマテリアライズドビュー間の依存関係の設定方法については、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies) の `Dependencies` セクションを参照してください。

## Refreshable Materialized View をどうリフレッシュしますか？ {#how-do-you-refresh-a-refreshable-materialized-view}

リフレッシュ可能なマテリアライズドビューは、作成時に定義された間隔で自動的にリフレッシュされます。
たとえば、以下のマテリアライズドビューは毎分リフレッシュされます：

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
```

マテリアライズドビューを強制的にリフレッシュしたい場合は、`SYSTEM REFRESH VIEW` 構文を使用できます：

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

ビューのキャンセル、停止、開始も可能です。
詳細については、[refreshable materialized views の管理](/sql-reference/statements/system#refreshable-materialized-views) ドキュメントを参照してください。

## 最後にリフレッシュされたのはいつか？ {#when-was-a-refreshable-materialized-view-last-refreshed}

リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされた時期を確認するには、以下のように [`system.view_refreshes`](/operations/system-tables/view_refreshes) システムテーブルをクエリできます：

```sql
SELECT database, view, status,
       last_success_time, last_refresh_time, next_refresh_time,
       read_rows, written_rows
FROM system.view_refreshes;
```

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:10:00 │ 2024-11-11 12:10:00 │ 2024-11-11 12:11:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## リフレッシュレートを変更するにはどうすればよいですか？ {#how-can-i-change-the-refresh-rate}

リフレッシュ可能なマテリアライズドビューのリフレッシュレートを変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

これを行った後、[最後にリフレッシュされたのはいつか？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed) クエリを使用して、レートが更新されたことを確認できます：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## `APPEND` を使用して新しい行を追加する {#using-append-to-add-new-rows}

`APPEND` 機能を使用することで、ビュー全体を置き換えるのではなく、テーブルの末尾に新しい行を追加することができます。

この機能の一つの使用方法は、時点ごとの値のスナップショットをキャプチャすることです。たとえば、[Kafka](https://kafka.apache.org/)、[Redpanda](https://www.redpanda.com/) または他のストリーミングデータプラットフォームからのメッセージストリームによって埋め込まれた `events` テーブルがあるとしましょう。

```sql
SELECT *
FROM events
LIMIT 10

Query id: 7662bc39-aaf9-42bd-b6c7-bc94f2881036

┌──────────────────ts─┬─uuid─┬─count─┐
│ 2008-08-06 17:07:19 │ 0eb  │   547 │
│ 2008-08-06 17:07:19 │ 60b  │   148 │
│ 2008-08-06 17:07:19 │ 106  │   750 │
│ 2008-08-06 17:07:19 │ 398  │   875 │
│ 2008-08-06 17:07:19 │ ca0  │   318 │
│ 2008-08-06 17:07:19 │ 6ba  │   105 │
│ 2008-08-06 17:07:19 │ df9  │   422 │
│ 2008-08-06 17:07:19 │ a71  │   991 │
│ 2008-08-06 17:07:19 │ 3a2  │   495 │
│ 2008-08-06 17:07:19 │ 598  │   238 │
└─────────────────────┴──────┴───────┘
```

このデータセットには `uuid` 列に `4096` の値があります。最も合計カウントが多い `uuid` を見つけるには、以下のクエリを書くことができます：

```sql
SELECT
    uuid,
    sum(count) AS count
FROM events
GROUP BY ALL
ORDER BY count DESC
LIMIT 10

┌─uuid─┬───count─┐
│ c6f  │ 5676468 │
│ 951  │ 5669731 │
│ 6a6  │ 5664552 │
│ b06  │ 5662036 │
│ 0ca  │ 5658580 │
│ 2cd  │ 5657182 │
│ 32a  │ 5656475 │
│ ffe  │ 5653952 │
│ f33  │ 5653783 │
│ c5b  │ 5649936 │
└──────┴─────────┘
```

たとえば、各 `uuid` のカウントを10秒ごとにキャプチャして、`events_snapshot` という新しいテーブルに保存したいとしましょう。`events_snapshot` のスキーマは次のようになります：

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

次に、このテーブルをポピュレートするためのリフレッシュ可能なマテリアライズドビューを作成できます：

```sql
CREATE MATERIALIZED VIEW events_snapshot_mv
REFRESH EVERY 10 SECOND APPEND TO events_snapshot
AS SELECT
    now() AS ts,
    uuid,
    sum(count) AS count
FROM events
GROUP BY ALL;
```

次に、特定の `uuid` に対する時間の経過に伴うカウントを取得するために `events_snapshot` をクエリすることができます：

```sql
SELECT *
FROM events_snapshot
WHERE uuid = 'fff'
ORDER BY ts ASC
FORMAT PrettyCompactMonoBlock

┌──────────────────ts─┬─uuid─┬───count─┐
│ 2024-10-01 16:12:56 │ fff  │ 5424711 │
│ 2024-10-01 16:13:00 │ fff  │ 5424711 │
│ 2024-10-01 16:13:10 │ fff  │ 5424711 │
│ 2024-10-01 16:13:20 │ fff  │ 5424711 │
│ 2024-10-01 16:13:30 │ fff  │ 5674669 │
│ 2024-10-01 16:13:40 │ fff  │ 5947912 │
│ 2024-10-01 16:13:50 │ fff  │ 6203361 │
│ 2024-10-01 16:14:00 │ fff  │ 6501695 │
└─────────────────────┴──────┴─────────┘
```

## 例 {#examples}

リフレッシュ可能なマテリアライズドビューをいくつかの例データセットで使用する方法を見てみましょう。

### Stack Overflow {#stack-overflow}

[データの非正規化ガイド](/data-modeling/denormalization) では、Stack Overflow データセットを使用したデータの非正規化に関するさまざまな技術を示しています。以下のテーブルにデータをポピュレートします: `votes`、`users`、`badges`、`posts`、および `postlinks`。

そのガイドでは、次のクエリを使って `postlinks` データセットを `posts` テーブルに非正規化する方法を示しました：

```sql
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
         PostId,
         groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts_types_codecs_ordered.Id = postlinks.PostId;
```

このデータを `posts_with_links` テーブルに一度の挿入で行う方法も示しましたが、実際のシステムではこの操作を定期的に実行することが望ましいです。

`posts` テーブルと `postlinks` テーブルの両方は常に更新される可能性があります。したがって、インクリメンタルマテリアライズドビューを使用してこの結合を実装しようとするよりも、単にこのクエリを一定の間隔で実行するようにスケジュールを設定し、結果を `post_with_links` テーブルに保存する方が十分です。

ここでリフレッシュ可能なマテリアライズドビューが役立ちます。次のクエリでこれを作成できます：

```sql
CREATE MATERIALIZED VIEW posts_with_links_mv
REFRESH EVERY 1 HOUR TO posts_with_links AS
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
         PostId,
         groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts_types_codecs_ordered.Id = postlinks.PostId;
```

このビューは、即座に、そしてその後も毎時実行され、ソーステーブルの更新が反映されることを確認します。重要なのは、クエリが再実行されたときに、結果セットが原子的かつ透明に更新されることです。

:::note
ここでの構文は、インクリメンタルマテリアライズドビューと同じですが、[`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view) 句を含めます：
:::

### IMDb {#imdb}

[dbt と ClickHouse の統合ガイド](/integrations/dbt#dbt) では、次のテーブル `actors`、`directors`、`genres`、`movie_directors`、`movies`、および `roles` で IMDb データセットをポピュレートしました。

以下のクエリを使用して、各俳優の概要を、映画の出演数が多い順に計算することができます。

```sql
SELECT
  id, any(actor_name) AS name, uniqExact(movie_id) AS movies,
  round(avg(rank), 2) AS avg_rank, uniqExact(genre) AS genres,
  uniqExact(director_name) AS directors, max(created_at) AS updated_at
FROM (
  SELECT
    imdb.actors.id AS id,
    concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
    imdb.movies.id AS movie_id, imdb.movies.rank AS rank, genre,
    concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
    created_at
  FROM imdb.actors
  INNER JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
  LEFT JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
  LEFT JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
  LEFT JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
  LEFT JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
)
GROUP BY id
ORDER BY movies DESC
LIMIT 5;
```

```text
┌─────id─┬─name─────────┬─num_movies─┬───────────avg_rank─┬─unique_genres─┬─uniq_directors─┬──────────updated_at─┐
│  45332 │ Mel Blanc    │        909 │ 5.7884792542982515 │            19 │            148 │ 2024-11-11 12:01:35 │
│ 621468 │ Bess Flowers │        672 │  5.540605094212635 │            20 │            301 │ 2024-11-11 12:01:35 │
│ 283127 │ Tom London   │        549 │ 2.8057034230202023 │            18 │            208 │ 2024-11-11 12:01:35 │
│ 356804 │ Bud Osborne  │        544 │ 1.9575342420755093 │            16 │            157 │ 2024-11-11 12:01:35 │
│  41669 │ Adoor Bhasi  │        544 │                  0 │             4 │            121 │ 2024-11-11 12:01:35 │
└────────┴──────────────┴────────────┴────────────────────┴───────────────┴────────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.393 sec. Processed 5.45 million rows, 86.82 MB (13.87 million rows/s., 221.01 MB/s.)
Peak memory usage: 1.38 GiB.
```

結果が返されるのにそれほど時間はかかりませんが、さらに迅速で計算が少ないものにしたいとします。仮に、このデータセットが定常的に更新される場合 - 映画が常にリリースされ、新たな俳優や監督も登場するわけです。

ここでリフレッシュ可能なマテリアライズドビューの出番です。まずは結果を格納するターゲットテーブルを作成します：

```sql
CREATE TABLE imdb.actor_summary
(
        `id` UInt32,
        `name` String,
        `num_movies` UInt16,
        `avg_rank` Float32,
        `unique_genres` UInt16,
        `uniq_directors` UInt16,
        `updated_at` DateTime
)
ENGINE = MergeTree
ORDER BY num_movies
```

そして、ビューを定義します：

```sql
CREATE MATERIALIZED VIEW imdb.actor_summary_mv
REFRESH EVERY 1 MINUTE TO imdb.actor_summary AS
SELECT
        id,
        any(actor_name) AS name,
        uniqExact(movie_id) AS num_movies,
        avg(rank) AS avg_rank,
        uniqExact(genre) AS unique_genres,
        uniqExact(director_name) AS uniq_directors,
        max(created_at) AS updated_at
FROM
(
        SELECT
        imdb.actors.id AS id,
        concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
        imdb.movies.id AS movie_id,
        imdb.movies.rank AS rank,
        genre,
        concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
        created_at
        FROM imdb.actors
    INNER JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
    LEFT JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
    LEFT JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
    LEFT JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
    LEFT JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
)
GROUP BY id
ORDER BY num_movies DESC;
```

このビューは即座に実行され、その後毎分実行され、ソーステーブルの更新が反映されることになります。俳優の概要を取得するための以前のクエリは、構文が簡素化され、かなり迅速になります！

```sql
SELECT *
FROM imdb.actor_summary
ORDER BY num_movies DESC
LIMIT 5
```

```text
┌─────id─┬─name─────────┬─num_movies─┬──avg_rank─┬─unique_genres─┬─uniq_directors─┬──────────updated_at─┐
│  45332 │ Mel Blanc    │        909 │ 5.7884793 │            19 │            148 │ 2024-11-11 12:01:35 │
│ 621468 │ Bess Flowers │        672 │  5.540605 │            20 │            301 │ 2024-11-11 12:01:35 │
│ 283127 │ Tom London   │        549 │ 2.8057034 │            18 │            208 │ 2024-11-11 12:01:35 │
│ 356804 │ Bud Osborne  │        544 │ 1.9575342 │            16 │            157 │ 2024-11-11 12:01:35 │
│  41669 │ Adoor Bhasi  │        544 │         0 │             4 │            121 │ 2024-11-11 12:01:35 │
└────────┴──────────────┴────────────┴───────────┴───────────────┴────────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.007 sec.
```

仮に新たな俳優「Clicky McClickHouse」が多くの映画に出演したとしたら、ソースデータに追加します！

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
INSERT INTO imdb.roles SELECT
        845466 AS actor_id,
        id AS movie_id,
        'Himself' AS role,
        now() AS created_at
FROM imdb.movies
LIMIT 10000, 910;
```

60秒も経たないうちに、ターゲットテーブルは Clicky の prolific な演技を反映するように更新されます。

```sql
SELECT *
FROM imdb.actor_summary
ORDER BY num_movies DESC
LIMIT 5;
```

```text
┌─────id─┬─name────────────────┬─num_movies─┬──avg_rank─┬─unique_genres─┬─uniq_directors─┬──────────updated_at─┐
│ 845466 │ Clicky McClickHouse │        910 │ 1.4687939 │            21 │            662 │ 2024-11-11 12:53:51 │
│  45332 │ Mel Blanc           │        909 │ 5.7884793 │            19 │            148 │ 2024-11-11 12:01:35 │
│ 621468 │ Bess Flowers        │        672 │  5.540605 │            20 │            301 │ 2024-11-11 12:01:35 │
│ 283127 │ Tom London          │        549 │ 2.8057034 │            18 │            208 │ 2024-11-11 12:01:35 │
│  41669 │ Adoor Bhasi         │        544 │         0 │             4 │            121 │ 2024-11-11 12:01:35 │
└────────┴─────────────────────┴────────────┴───────────┴───────────────┴────────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.006 sec.
```
