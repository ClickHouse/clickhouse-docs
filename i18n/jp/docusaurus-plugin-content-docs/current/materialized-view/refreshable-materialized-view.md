---
'slug': '/materialized-view/refreshable-materialized-view'
'title': 'リフレッシュ可能な Materialized View'
'description': 'クエリを高速化するための Materialized View の使用方法'
'keywords':
- 'refreshable materialized view'
- 'refresh'
- 'materialized views'
- 'speed up queries'
- 'query optimization'
'doc_type': 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[Refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view) は、概念的には従来のOLTPデータベースにおけるマテリアライズドビューに類似しており、指定されたクエリの結果を保存して迅速に取得できるようにし、リソース集約型のクエリを繰り返し実行する必要を減らします。ClickHouseの[インクリメンタルマテリアライズドビュー](/materialized-view/incremental-materialized-view)とは異なり、これはフルデータセットに対してクエリを定期的に実行する必要があり、その結果はクエリ用のターゲットテーブルに保存されます。この結果セットは理論上、元のデータセットよりも小さくなるはずで、そのため、後続のクエリがより高速に実行されることが期待されます。

この図は、Refreshable Materialized Viewsがどのように機能するかを説明しています：

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Refreshable materialized view diagram"/>

次のビデオもご覧いただけます：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Refreshable materialized viewsはいつ使用するべきか？ {#when-should-refreshable-materialized-views-be-used}

ClickHouseのインクリメンタルマテリアライズドビューは非常に強力であり、特に単一のテーブルに対する集約が必要な場合には、Refreshable Materialized Viewsで使用されるアプローチよりもはるかにスケールが向上します。データの各ブロックの挿入時に集約を計算し、最終テーブルにインクリメンタル状態をマージすることにより、クエリは常にデータの一部に対してのみ実行されます。この方法は潜在的にペタバイトのデータにまでスケールし、通常は推奨される方法です。

しかし、このインクリメンタルプロセスが必要ない、または適用できないユースケースもあります。一部の問題はインクリメンタルアプローチと互換性がないか、リアルタイムの更新を必要としないため、定期的な再構築がより適切です。たとえば、複雑な結合を使用しているため、フルデータセットに対してビューの完全な再計算を定期的に行いたい場合があります。

> Refreshable materialized viewsは、デノーマライゼーションなどのタスクを実行するバッチプロセスを実行できます。Refreshable materialized views間に依存関係を作成でき、あるビューが他のビューの結果に依存し、完了するまで実行されないようにできます。これは、スケジュールされたワークフローや[dbt](https://www.getdbt.com/)ジョブのようなシンプルなDAGを置き換えることができます。Refreshable materialized views間の依存関係を設定する方法についての詳細は、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies)の`Dependencies`セクションにアクセスしてください。

## Refreshable materialized viewをどのように更新しますか？ {#how-do-you-refresh-a-refreshable-materialized-view}

Refreshable materialized viewsは、作成時に定義された間隔で自動的に更新されます。
たとえば、次のマテリアライズドビューは毎分更新されます：

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

マテリアライズドビューを強制的に更新したい場合は、`SYSTEM REFRESH VIEW`句を使用できます：

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

また、ビューをキャンセルしたり、停止したり、開始したりすることができます。
詳細については、[refreshable materialized viewsの管理](/sql-reference/statements/system#refreshable-materialized-views)ドキュメントを参照してください。

## Refreshable materialized viewが最後に更新されたのはいつですか？ {#when-was-a-refreshable-materialized-view-last-refreshed}

Refreshable materialized viewが最後に更新されたのがいつかを知るには、次のように[`system.view_refreshes`](/operations/system-tables/view_refreshes)システムテーブルをクエリできます：

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

## 更新頻度を変更するにはどうすればよいですか？ {#how-can-i-change-the-refresh-rate}

Refreshable materialized viewの更新頻度を変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement)構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

それが完了したら、[Refreshable materialized viewが最後に更新されたのはいつですか？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed)クエリを使用して、頻度が更新されたことを確認できます：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## 新しい行を追加するための`APPEND`の使用 {#using-append-to-add-new-rows}

`APPEND`機能を使用すると、ビュー全体を置き換えるのではなく、テーブルの末尾に新しい行を追加できます。

この機能の1つの使用例は、特定の時点での値のスナップショットをキャプチャすることです。たとえば、[Kafka](https://kafka.apache.org/)や[Redpanda](https://www.redpanda.com/)などのストリーミングデータプラットフォームからのメッセージのストリームによって populated された`events`テーブルを想像してみましょう。

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

このデータセットは、`uuid`カラムに`4096`の値を含んでいます。次のクエリを作成して、合計カウントが最も高いものを見つけることができます：

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

10秒ごとに各`uuid`のカウントをキャプチャし、新しいテーブル`events_snapshot`に保存したいとしましょう。`events_snapshot`のスキーマは次のようになります：

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

次に、このテーブルを埋めるためのrefreshable materialized viewを作成できます：

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

その後、特定の`uuid`のカウントを時間の経過で取得するために`events_snapshot`をクエリできます：

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

次に、いくつかの例データセットを使用して、refreshable materialized viewsをどのように使用するかを見ていきましょう。

### Stack Overflow {#stack-overflow}

[データのデノーマライズガイド](/data-modeling/denormalization)では、Stack Overflowデータセットを使用してデータのデノーマライズのさまざまな技術を示しています。我々は次のテーブルにデータを入力します： `votes`、`users`、`badges`、`posts`、および`postlinks`。

そのガイドでは、次のクエリを使用して`postlinks`データセットを`posts`テーブルにデノーマライズする方法を示しました：

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

次に、このデータを`posts_with_links`テーブルに一度挿入する方法を示しましたが、プロダクションシステムではこの操作を定期的に実行したいと考えています。

`posts`と`postlinks`テーブルの両方は更新される可能性があります。したがって、この結合をインクリメンタルマテリアライズドビューを使用して実装しようとするのではなく、指定された間隔、たとえば1時間に1回、結果を`post_with_links`テーブルに保存するためにこのクエリをスケジュールすれば十分です。

ここでrefreshable materialized viewが役立ちます。次のクエリで作成できます：

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

ビューは即座に実行され、その後は設定された毎時実行され、ソーステーブルへの更新が反映されることが保証されます。重要なのは、クエリが再実行されると、結果セットが原子的かつ透過的に更新されることです。

:::note
ここでの構文はインクリメンタルマテリアライズドビューと同じですが、 [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view)句を含めます：
:::

### IMDb {#imdb}

[dbtとClickHouseの統合ガイド](/integrations/dbt)では、次のテーブルを使用してIMDbデータセットを populated しました： `actors`、`directors`、`genres`、`movie_directors`、`movies`、および`roles`。

次に、各俳優を、最も多く映画に出演した順にサマリー計算するために次のクエリを使用できます。

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

結果が返るまでにあまり時間はかかりませんが、さらに迅速で計算コストの低い結果を望むとしましょう。
このデータセットが常に更新される場合を考えてみましょう - 映画は常に新しい俳優や監督が登場して公開されます。

ここでrefreshable materialized viewの出番ですので、まず結果のターゲットテーブルを作成しましょう：

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

次に、ビューを定義できます：

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

ビューは即座に実行され、その後は設定に従って毎分実行され、ソーステーブルへの更新が反映されることが保証されます。我々の以前の俳優サマリークエリは、構文がよりシンプルになり、著しく高速になります！

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

新しい俳優「Clicky McClickHouse」をソースデータに追加したとしましょう。彼は多くの映画に出演しています！

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

60秒も経たないうちに、ターゲットテーブルはClickyの演技の prolific な性質を反映するように更新されます：

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
