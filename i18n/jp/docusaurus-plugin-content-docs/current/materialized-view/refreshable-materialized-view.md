---
slug: /materialized-view/refreshable-materialized-view
title: 'リフレッシュ可能なマテリアライズドビュー'
description: 'マテリアライズドビューを使用してクエリを高速化する方法'
keywords: ['リフレッシュ可能なマテリアライズドビュー', 'リフレッシュ', 'マテリアライズドビュー', 'クエリを高速化', 'クエリ最適化']
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[リフレッシュ可能なマテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view)は、伝統的なOLTPデータベースにおけるマテリアライズドビューに概念的に類似しており、特定のクエリの結果を迅速に取得するために保存し、リソース集約型のクエリを何度も実行する必要を減らします。ClickHouseの[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)とは異なり、これはフルデータセットに対して定期的にクエリを実行することを必要とします - その結果はターゲットテーブルに保存され、クエリの対象となります。この結果セットは理論的には元のデータセットよりも小さく、次のクエリの実行を速くできます。

この図は、リフレッシュ可能なマテリアライズドビューがどのように機能するかを説明しています：

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="リフレッシュ可能なマテリアライズドビューの図"/>

以下のビデオもご覧いただけます：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTubeビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## いつリフレッシュ可能なマテリアライズドビューを使用すべきか? {#when-should-refreshable-materialized-views-be-used}

ClickHouseのインクリメンタルマテリアライズドビューは非常に強力で、リフレッシュ可能なマテリアライズドビューのアプローチよりもはるかにスケールが良いことが一般的です。特に、単一テーブルに対して集約を行う必要がある場合においてです。各データブロックが挿入される際に、集約を計算し、最終テーブルでインクリメンタル状態をマージすることにより、クエリはデータのサブセットでのみ実行されます。この方法は、ペタバイトのデータにスケールし、通常は好まれる方法です。

ただし、インクリメンタルプロセスが必要ない、または適用できないユースケースもあります。一部の問題はインクリメンタルアプローチと互換性がないか、リアルタイムの更新が必要ない場合があり、定期的な再構築がより適切です。例えば、複雑な結合を使用するため、フルデータセットに対してビューの完全な再計算を定期的に実行したい場合があります。

> リフレッシュ可能なマテリアライズドビューは、非正規化などのタスクを実行するバッチプロセスを実行できます。リフレッシュ可能なマテリアライズドビュー間に依存関係を構築することも可能で、一つのビューが別のビューの結果に依存し、完了するまで実行されないようにできます。これは、スケジュールされたワークフローやシンプルなDAG（例: [dbt](https://www.getdbt.com/)ジョブ）を置き換えられます。リフレッシュ可能なマテリアライズドビュー間の依存関係の設定方法の詳細は、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies)を参照してください。`Dependencies` セクション。

## リフレッシュ可能なマテリアライズドビューをどのようにリフレッシュしますか? {#how-do-you-refresh-a-refreshable-materialized-view}

リフレッシュ可能なマテリアライズドビューは、作成時に定義された間隔で自動的にリフレッシュされます。
例えば、以下のマテリアライズドビューは毎分リフレッシュされます：

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

マテリアライズドビューを強制的にリフレッシュしたい場合は、`SYSTEM REFRESH VIEW`句を使用できます：

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

ビューをキャンセル、停止、または開始することもできます。
詳細については、[リフレッシュ可能なマテリアライズドビューの管理](/sql-reference/statements/system#refreshable-materialized-views)に関するドキュメントを参照してください。

## リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされたのはいつですか? {#when-was-a-refreshable-materialized-view-last-refreshed}

リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされたのはいつかを確認するには、以下のように[`system.view_refreshes`](/operations/system-tables/view_refreshes)システムテーブルをクエリします：

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

## リフレッシュレートを変更するにはどうすればよいですか? {#how-can-i-change-the-refresh-rate}

リフレッシュ可能なマテリアライズドビューのリフレッシュレートを変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement)構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

これを行ったら、[リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされたのはいつか?](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed)クエリを使用して、レートが更新されたかどうかを確認できます：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## `APPEND`を使用して新しい行を追加する {#using-append-to-add-new-rows}

`APPEND`機能を使用すると、ビュー全体を置き換えるのではなく、テーブルの末尾に新しい行を追加できます。

この機能の一つの用途は、特定の時点における値のスナップショットを取得することです。例えば、次のように[Kafka](https://kafka.apache.org/)や[Redpanda](https://www.redpanda.com/)からのメッセージのストリームによって人口された`events`テーブルがあるとします。

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

このデータセットには、`uuid`カラムに`4096`の値があります。次のように、合計カウントが最も高いものを見つけるクエリを書けます：

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

例えば、`uuid`ごとのカウントを10秒ごとにキャプチャして新しいテーブル`events_snapshot`に保存した場合、`events_snapshot`のスキーマは次のようになります：

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

その後、特定の`uuid`に対する時間の経過に伴うカウントを取得するために`events_snapshot`をクエリできます：

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

リフレッシュ可能なマテリアライズドビューを利用したいくつかの例データセットを見てみましょう。

### Stack Overflow {#stack-overflow}

[非正規化データガイド](/data-modeling/denormalization)では、Stack Overflowデータセットを使用してデータを非正規化するさまざまな技術を示しています。以下のテーブルにデータを投入します: `votes`, `users`, `badges`, `posts`, および `postlinks`。

そのガイドでは、次のクエリで`postlinks`データセットを`posts`テーブルに非正規化する方法を示しました：

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

このデータを`posts_with_links`テーブルに一度だけ挿入する方法を示しましたが、実稼働システムではこの操作を定期的に実行することが望ましいです。

`posts`と`postlinks`テーブルの両方は更新される可能性があります。そのため、インクリメンタルマテリアライズドビューを使ってこの結合を実装しようとするよりも、単にこのクエリを設定された間隔で実行し、結果を`post_with_links`テーブルに保存する方が十分かもしれません。

ここでリフレッシュ可能なマテリアライズドビューが役に立ち、次のクエリで作成できます：

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

ビューはすぐに実行され、その後も指定された毎時実行され、ソーステーブルの更新が反映されるようにします。重要なのは、クエリが再実行される時、結果セットが原子的かつ透過的に更新されることです。

:::note
ここでの構文はインクリメンタルマテリアライズドビューと同じですが、[`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view)句が含まれます：
:::

### IMDb {#imdb}

[dbtとClickHouseの統合ガイド](/integrations/dbt#dbt)では、`actors`, `directors`, `genres`, `movie_directors`, `movies`, および `roles`テーブルを使用してIMDbデータセットを投入しました。

次に、映画の出演数が最も多い俳優の要約を計算するために次のクエリを使用できます。

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

結果を取得するのにそれほど時間はかかりませんが、さらに迅速で計算コストが低くなることを望んでいると仮定しましょう。
例えば、このデータセットは常に更新されるので、映画が常にリリースされ、新しい俳優や監督が現れています。

リフレッシュ可能なマテリアライズドビューの出番です。まず、結果のためのターゲットテーブルを作成しましょう：

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

では、ビューを定義できます：

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

ビューは即座に実行され、その後毎分実行されて、ソーステーブルの更新が反映されるようにします。俳優の要約取得のための以前のクエリは構文的にシンプルになり、大幅に高速化されます。

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

もし新しい俳優「Clicky McClickHouse」をソースデータに追加した場合、彼は多くの映画に出演していると仮定します！

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

60秒も経たないうちに、ターゲットテーブルはClickyの俳優としての多才さを反映するように更新されます：

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
