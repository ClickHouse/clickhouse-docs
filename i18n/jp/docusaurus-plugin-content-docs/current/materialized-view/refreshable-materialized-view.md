---
slug: /materialized-view/refreshable-materialized-view
title: 'リフレッシュ可能なマテリアライズドビュー'
description: 'マテリアライズドビューを使用してクエリを高速化する方法'
keywords: ['リフレッシュ可能なマテリアライズドビュー', 'リフレッシュ', 'マテリアライズドビュー', 'クエリの高速化', 'クエリ最適化']
doc_type: 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[リフレッシュ可能なマテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view) は、指定したクエリの結果を保存して高速に取得し、リソース負荷の高いクエリを何度も実行する必要を減らすという点で、従来の OLTP データベースにおけるマテリアライズドビューと概念的に類似しています。ClickHouse の [インクリメンタルなマテリアライズドビュー](/materialized-view/incremental-materialized-view) とは異なり、この方式では対象となるクエリを全データセットに対して定期的に実行し、その結果がクエリ用のターゲットテーブルに保存されます。この結果セットは理論上、元のデータセットよりも小さくなるため、その後に実行されるクエリを高速化できます。

次の図は、リフレッシュ可能なマテリアライズドビューの動作を説明しています：

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="リフレッシュ可能なマテリアライズドビューの図" />

次の動画も参照してください：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube 動画プレイヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## リフレッシュ可能なマテリアライズドビューはいつ使用すべきか \\{#when-should-refreshable-materialized-views-be-used\\}

ClickHouse のインクリメンタルマテリアライズドビューは非常に強力であり、特に単一テーブルに対する集約を行うケースでは、リフレッシュ可能なマテリアライズドビューで用いられる手法よりもはるかに高いスケーラビリティを発揮するのが一般的です。データが挿入されるたびに各データブロックに対してのみ集約を計算し、そのインクリメンタルな状態を最終テーブルでマージすることで、クエリは常にデータの一部に対してのみ実行されます。この手法は理論上ペタバイト規模のデータまでスケールし、通常は推奨される手法です。

しかし、このインクリメンタルな処理が不要、または適用できないユースケースも存在します。問題によってはインクリメンタルなアプローチと両立しないものや、リアルタイム更新を必要とせず、定期的な再構築の方が適切なものがあります。例えば、インクリメンタルなアプローチと互換性のない複雑な `JOIN` を使用しているため、フルデータセットに対するビューの完全な再計算を定期的に行いたい場合などです。

>  リフレッシュ可能なマテリアライズドビューは、非正規化のようなタスクを実行するバッチ処理を行うことができます。リフレッシュ可能なマテリアライズドビュー同士の間に依存関係を作成し、一方のビューが別のビューの結果に依存し、それが完了した後にのみ実行されるようにすることができます。これは、[dbt](https://www.getdbt.com/) ジョブのようなスケジュールされたワークフローや単純な DAG を置き換えることができます。リフレッシュ可能なマテリアライズドビュー間の依存関係の設定方法については、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies) の `Dependencies` セクションを参照してください。

## リフレッシュ可能なマテリアライズドビューはどのように更新されますか？ \\{#how-do-you-refresh-a-refreshable-materialized-view\\}

リフレッシュ可能なマテリアライズドビューは、作成時に定義された間隔で自動的に更新されます。
例えば、次のマテリアライズドビューは 1 分ごとにリフレッシュされます。

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

マテリアライズドビューを強制的に更新したい場合は、`SYSTEM REFRESH VIEW` 句を使用できます。

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

ビューをキャンセル、停止、開始することもできます。
詳細については、[リフレッシュ可能なマテリアライズドビューの管理](/sql-reference/statements/system#refreshable-materialized-views) ドキュメントを参照してください。

## リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされたのはいつですか？ \\{#when-was-a-refreshable-materialized-view-last-refreshed\\}

リフレッシュ可能なマテリアライズドビューが最後にいつリフレッシュされたかを確認するには、次のように [`system.view_refreshes`](/operations/system-tables/view_refreshes) システムテーブルをクエリします。

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

## リフレッシュ間隔はどのように変更できますか？ \\{#how-can-i-change-the-refresh-rate\\}

リフレッシュ可能なマテリアライズドビューのリフレッシュ間隔を変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

その作業が完了したら、[更新可能なマテリアライズドビューが最後にリフレッシュされたのはいつか？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed) クエリを使用して、レートが更新されていることを確認できます。

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## `APPEND` を使用して新しい行を追加する \\{#using-append-to-add-new-rows\\}

`APPEND` 機能を使用すると、ビュー全体を置き換えるのではなく、テーブルの末尾に新しい行を追記できます。

この機能の用途の 1 つは、ある時点における値のスナップショットを取得することです。たとえば、[Kafka](https://kafka.apache.org/)、[Redpanda](https://www.redpanda.com/) などのストリーミングデータプラットフォームからのメッセージストリームによって `events` テーブルにデータが取り込まれていると仮定してみましょう。

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

このデータセットには、`uuid` 列に `4096` 個の値があります。合計件数が最も多いものを見つけるには、次のクエリを実行します。

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

例えば、各 `uuid` ごとのカウントを 10 秒ごとに取得し、`events_snapshot` という新しいテーブルに保存したいとします。`events_snapshot` のスキーマは次のようになります。

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

次に、このテーブルにデータを投入するためのリフレッシュ可能なマテリアライズドビューを作成します。

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

次に、特定の `uuid` について時間経過に伴うカウントを取得するために `events_snapshot` をクエリします：

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

## 例 \\{#examples\\}

ここでは、いくつかのサンプルデータセットを使って、リフレッシュ可能なマテリアライズドビューの使用方法を見ていきます。

### Stack Overflow \\{#stack-overflow\\}

[非正規化データガイド](/data-modeling/denormalization)では、Stack Overflow のデータセットを使ってデータを非正規化するさまざまな手法を紹介しています。`votes`、`users`、`badges`、`posts`、`postlinks` の各テーブルにデータを格納します。

そのガイドでは、次のクエリを使用して、`postlinks` データセットを `posts` テーブルに非正規化する方法を示しました。

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

次に、このデータを一度だけ `posts_with_links` テーブルに挿入する方法を示しましたが、本番システムではこの操作を定期的に実行したくなります。

`posts` テーブルと `postlinks` テーブルの両方が更新される可能性があります。したがって、この結合を増分的なマテリアライズドビューで実装しようとするのではなく、このクエリを例えば 1 時間ごとなど一定の間隔で実行し、その結果を `post_with_links` テーブルに保存するだけで十分な場合もあります。

ここでリフレッシュ可能なマテリアライズドビューが役立ちます。次のクエリで作成できます。

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

ビューは直ちに実行され、その後は設定されたスケジュールに従って毎時実行され、ソーステーブルへの更新が反映されるようにします。重要な点として、クエリが再実行される際には、結果セットはアトミックかつ透過的に更新されます。

:::note
ここでの構文はインクリメンタルなマテリアライズドビューと同一ですが、[`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view) 句を含めている点が異なります。
:::

### IMDb \\{#imdb\\}

[dbt と ClickHouse の統合ガイド](/integrations/dbt) では、`actors`、`directors`、`genres`、`movie_directors`、`movies`、`roles` というテーブルを用いて IMDb データセットを用意しました。

次に、各俳優ごとの集計を算出し、出演作品数が多い順に並べるために、次のクエリを実行します。

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

5行を取得しました。経過時間: 0.393秒。処理済み: 545万行、86.82 MB (1387万行/秒、221.01 MB/秒)
ピークメモリ使用量: 1.38 GiB。
```

結果が返ってくるまでそれほど時間はかかりませんが、さらに処理を高速化し、計算コストも減らしたいとします。
このデータセットは常に更新されているとも仮定しましょう。映画は次々と公開され、新しい俳優や監督も登場し続けています。

ここでリフレッシュ可能なマテリアライズドビューの出番です。まずは結果を書き込むためのターゲットテーブルを作成しましょう。

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

では、ビューを定義します:

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

このビューは、構成どおり即時に実行され、その後は毎分実行されるため、ソーステーブルへの更新が確実に反映されます。先ほどの俳優のサマリーを取得するクエリは、構文がよりシンプルになり、パフォーマンスも大幅に向上します。

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

5行のセット。経過時間: 0.007秒
```

たとえば、ソースデータに新しい俳優「Clicky McClickHouse」を追加し、この人物が非常に多くの映画に出演しているとします。

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

60 秒も経たないうちに、ターゲットテーブルが更新され、Clicky の大活躍ぶりが反映されます。

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

5行のセット。経過時間: 0.006秒。
```
