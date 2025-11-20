---
slug: /materialized-view/refreshable-materialized-view
title: 'リフレッシュ可能なマテリアライズドビュー'
description: 'マテリアライズドビューを使ってクエリを高速化する方法'
keywords: ['refreshable materialized view', 'refresh', 'materialized views', 'speed up queries', 'query optimization']
doc_type: 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[リフレッシュ可能マテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view) は、従来の OLTP データベースにおけるマテリアライズドビューと概念的には似ており、特定のクエリ結果を保存して高速に取得できるようにすることで、リソース負荷の高いクエリを繰り返し実行する必要性を減らします。ClickHouse の [インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view) と異なり、こちらはクエリを全データセットに対して定期的に実行する必要があり、その結果がクエリ用のターゲットテーブルに保存されます。この結果セットは、理論的には元のデータセットよりも小さくなるため、その後のクエリをより高速に実行できるようになります。

次の図は、リフレッシュ可能マテリアライズドビューの動作を説明しています。

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="リフレッシュ可能マテリアライズドビューの図" />

次の動画も参照してください。

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## リフレッシュ可能なマテリアライズドビューはいつ使用すべきか？ {#when-should-refreshable-materialized-views-be-used}

ClickHouseのインクリメンタルマテリアライズドビューは非常に強力であり、特に単一テーブルに対する集計を実行する必要がある場合、リフレッシュ可能なマテリアライズドビューで使用されるアプローチよりも通常ははるかに優れたスケーラビリティを発揮します。データが挿入される際に各ブロックに対してのみ集計を計算し、最終テーブルでインクリメンタルな状態をマージすることで、クエリは常にデータのサブセットに対してのみ実行されます。この方法は潜在的にペタバイト規模のデータまでスケールし、通常は推奨される方法です。

しかし、このインクリメンタルプロセスが不要である、または適用できないユースケースも存在します。一部の問題はインクリメンタルアプローチと互換性がないか、リアルタイム更新を必要とせず、定期的な再構築の方が適切な場合があります。例えば、複雑な結合を使用しているためインクリメンタルアプローチと互換性がない場合、データセット全体に対してビューの完全な再計算を定期的に実行したい場合があります。

> リフレッシュ可能なマテリアライズドビューは、非正規化などのタスクを実行するバッチプロセスを実行できます。リフレッシュ可能なマテリアライズドビュー間に依存関係を作成することができ、あるビューが別のビューの結果に依存し、それが完了した後にのみ実行されるようにできます。これにより、スケジュールされたワークフローや[dbt](https://www.getdbt.com/)ジョブのようなシンプルなDAGを置き換えることができます。リフレッシュ可能なマテリアライズドビュー間の依存関係を設定する方法の詳細については、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies)の`Dependencies`セクションを参照してください。


## リフレッシュ可能なマテリアライズドビューをリフレッシュする方法 {#how-do-you-refresh-a-refreshable-materialized-view}

リフレッシュ可能なマテリアライズドビューは、作成時に定義された間隔で自動的にリフレッシュされます。
例えば、以下のマテリアライズドビューは1分ごとにリフレッシュされます:

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

マテリアライズドビューを強制的にリフレッシュする場合は、`SYSTEM REFRESH VIEW`句を使用します:

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

ビューのキャンセル、停止、開始も可能です。
詳細については、[リフレッシュ可能なマテリアライズドビューの管理](/sql-reference/statements/system#refreshable-materialized-views)のドキュメントを参照してください。


## リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされたのはいつですか? {#when-was-a-refreshable-materialized-view-last-refreshed}

リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされた時刻を確認するには、以下のように[`system.view_refreshes`](/operations/system-tables/view_refreshes)システムテーブルをクエリします:

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


## リフレッシュ間隔を変更するにはどうすればよいですか？ {#how-can-i-change-the-refresh-rate}

リフレッシュ可能なマテリアライズドビューのリフレッシュ間隔を変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

変更後、[リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされたのはいつですか？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed)のクエリを使用して、間隔が更新されたことを確認できます：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```


## `APPEND`を使用した新しい行の追加 {#using-append-to-add-new-rows}

`APPEND`機能を使用すると、ビュー全体を置き換える代わりに、テーブルの末尾に新しい行を追加できます。

この機能の用途の1つは、特定の時点における値のスナップショットをキャプチャすることです。例えば、[Kafka](https://kafka.apache.org/)、[Redpanda](https://www.redpanda.com/)、またはその他のストリーミングデータプラットフォームからのメッセージストリームによって入力される`events`テーブルがあるとします。

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

このデータセットの`uuid`列には`4096`個の値があります。次のクエリを記述して、合計カウントが最も高いものを見つけることができます:

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

各`uuid`のカウントを10秒ごとにキャプチャし、`events_snapshot`という新しいテーブルに保存したいとします。`events_snapshot`のスキーマは次のようになります:

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

次に、このテーブルにデータを投入するための更新可能なマテリアライズドビューを作成できます:

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

その後、`events_snapshot`をクエリして、特定の`uuid`の経時的なカウントを取得できます:

```sql
SELECT *
FROM events_snapshot
WHERE uuid = 'fff'
ORDER BY ts ASC
FORMAT PrettyCompactMonoBlock

```


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
```


## 例 {#examples}

それでは、いくつかのサンプルデータセットを使用して、リフレッシュ可能なマテリアライズドビューの使用方法を見ていきましょう。

### Stack Overflow {#stack-overflow}

[データの非正規化ガイド](/data-modeling/denormalization)では、Stack Overflowデータセットを使用したデータ非正規化のさまざまな手法を紹介しています。以下のテーブルにデータを投入します:`votes`、`users`、`badges`、`posts`、`postlinks`。

そのガイドでは、以下のクエリを使用して`postlinks`データセットを`posts`テーブルに非正規化する方法を示しました:

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

次に、このデータを`posts_with_links`テーブルに一度だけ挿入する方法を示しましたが、本番システムでは、この操作を定期的に実行する必要があります。

`posts`テーブルと`postlinks`テーブルの両方が更新される可能性があります。そのため、インクリメンタルマテリアライズドビューを使用してこの結合を実装するのではなく、このクエリを一定の間隔(例えば1時間ごと)で実行するようにスケジュールし、結果を`post_with_links`テーブルに格納するだけで十分な場合があります。

ここでリフレッシュ可能なマテリアライズドビューが役立ちます。以下のクエリで作成できます:

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

このビューは即座に実行され、その後は設定に従って1時間ごとに実行され、ソーステーブルの更新が反映されます。重要な点として、クエリが再実行されると、結果セットがアトミックかつ透過的に更新されます。

:::note
ここでの構文は、[`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view)句を含めることを除いて、インクリメンタルマテリアライズドビューと同じです:
:::

### IMDb {#imdb}

[dbtとClickHouseの統合ガイド](/integrations/dbt)では、以下のテーブルを持つIMDbデータセットを投入しました:`actors`、`directors`、`genres`、`movie_directors`、`movies`、`roles`。

次に、各俳優の要約を計算し、映画出演数の多い順に並べるために、以下のクエリを使用できます。

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
ピークメモリ使用量: 1.38 GiB
```

結果が返ってくるまでそれほど時間はかかりませんが、これをさらに高速にし、計算コストも抑えたいとしましょう。
また、このデータセットは常に更新されており、新作映画が次々と公開されるのに伴い、新しい俳優や監督も登場しているとします。

ここでリフレッシュ可能なマテリアライズドビューの出番です。まずは結果を格納するためのターゲットテーブルを作成しましょう。

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

では、ビューを定義しましょう:

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

このビューは直ちに実行され、その後は設定どおり毎分実行されるため、ソーステーブルへの更新が反映されるようになります。これにより、先ほどの俳優の集計を取得するクエリは、構文的により単純になり、かつ大幅に高速になります。

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

5行が返されました。経過時間: 0.007秒
```

たくさんの映画に出演している新しい俳優「Clicky McClickHouse」をソースデータに追加するとしましょう。

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

60秒もしないうちに、Clickyの大活躍ぶりを反映してターゲットテーブルが更新されます。

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
