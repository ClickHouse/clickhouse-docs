---
slug: /materialized-view/refreshable-materialized-view
title: リフレッシュ可能なマテリアライズドビュー
description: マテリアライズドビューを使用してクエリを高速化する方法
keywords: [リフレッシュ可能なマテリアライズドビュー, リフレッシュ, マテリアライズドビュー, クエリの高速化, クエリ最適化]
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';

[リフレッシュ可能なマテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view)は、従来のOLTPデータベースにおけるマテリアライズドビューに概念的に類似しており、特定のクエリの結果を保存し、迅速な取得を可能にすることで、リソース集約型のクエリを繰り返し実行する必要を減らします。ClickHouseの[増分マテリアライズドビュー](/materialized-view/incremental-materialized-view)とは異なり、これは全データセットに対して定期的にクエリを実行する必要があります。その結果は、クエリ用にターゲットテーブルに保存されます。この結果セットは理論的には元のデータセットよりも小さいため、その後のクエリはより速く実行されることが期待されます。

以下の図は、リフレッシュ可能なマテリアライズドビューの動作を説明します。

<img src={refreshableMaterializedViewDiagram}
  class="image"
  alt="リフレッシュ可能なマテリアライズドビューの図"
  style={{width: '100%', background: 'none'}} />

次のビデオもご覧いただけます：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTubeビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## リフレッシュ可能なマテリアライズドビューはいつ使用すべきか？ {#when-should-refreshable-materialized-views-be-used}

ClickHouseの増分マテリアライズドビューは非常に強力で、リフレッシュ可能なマテリアライズドビューで使用されるアプローチよりも通常はスケールが良好です。特に、単一のテーブルに対して集計を実行する必要がある場合で、そのデータの各ブロックに対してのみ集計を行い、最終テーブルで増分状態をマージすることにより、クエリはデータのサブセットでのみ実行されます。この方法は数ペタバイトのデータにまでスケールし、通常は好ましい方法です。

しかし、この増分プロセスが必要ない、あるいは適用できないユースケースもあります。いくつかの問題は増分アプローチと互換性がなく、リアルタイム更新を必要としないため、定期的な再構築がより適切です。たとえば、複雑な結合を使用しているため、完全なデータセットに対するビューの完全な再計算を定期的に実行したい場合があります。

> リフレッシュ可能なマテリアライズドビューは、非正規化などのタスクを実行するバッチプロセスを実行できます。リフレッシュ可能なマテリアライズドビュー間に依存関係を作成することができ、あるビューが別のビューの結果に依存し、完了した後にのみ実行されるようにできます。これは、スケジュールされたワークフローや[dbt](https://www.getdbt.com/)ジョブなどのシンプルなDAGを置き換えることができます。リフレッシュ可能なマテリアライズドビュー間の依存関係の設定方法については、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies)、`Dependencies`セクションをご覧ください。

## リフレッシュ可能なマテリアライズドビューをどのようにリフレッシュしますか？ {#how-do-you-refresh-a-refreshable-materialized-view}

リフレッシュ可能なマテリアライズドビューは、作成時に定義されたインターバルで自動的にリフレッシュされます。
たとえば、以下のマテリアライズドビューは毎分リフレッシュされます：

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

マテリアライズドビューを強制的にリフレッシュしたい場合は、`SYSTEM REFRESH VIEW`句を使うことができます：

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

ビューをキャンセル、停止、または開始することもできます。
詳細については、[リフレッシュ可能なマテリアライズドビューの管理](/sql-reference/statements/system#refreshable-materialized-views)のドキュメントをご覧ください。

## リフレッシュ可能なマテリアライズドビューは最後にいつリフレッシュされましたか？ {#when-was-a-refreshable-materialized-view-last-refreshed}

リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされた時期を知るには、次のように[`system.view_refreshes`](/operations/system-tables/view_refreshes)システムテーブルをクエリします：

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

リフレッシュ可能なマテリアライズドビューのリフレッシュレートを変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement)構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

その後、リフレッシュ可能なマテリアライズドビューが最後にリフレッシュされた時期を確認するために、[リフレッシュ可能なマテリアライズドビューは最後にいつリフレッシュされましたか？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed)のクエリを使用できます：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## 新しい行を追加するための `APPEND` の使用 {#using-append-to-add-new-rows}

`APPEND`機能を使用すると、ビュー全体を置き換える代わりに、テーブルの末尾に新しい行を追加できます。

この機能の一例は、特定の時点での値のスナップショットをキャプチャすることです。たとえば、[Kafka](https://kafka.apache.org/)や[Redpanda](https://www.redpanda.com/)などのストリーミングデータプラットフォームからのメッセージのストリームによって人口が増加した`events`テーブルを考えてみましょう。

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

このデータセットには`uuid`カラムに`4096`の値があります。次のクエリを記述して、合計カウントが最も高いものを見つけることができます：

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

10秒ごとに各`uuid`のカウントをキャプチャし、`events_snapshot`という新しいテーブルに保存したいとしましょう。`events_snapshot`のスキーマは次のようになります：

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

次に、次のようにこのテーブルをポピュレートするためのリフレッシュ可能なマテリアライズドビューを作成します：

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

その後、特定の`uuid`のカウントを時間経過とともに取得するために`events_snapshot`をクエリできます：

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

リフレッシュ可能なマテリアライズドビューをいくつかの例のデータセットで使用する方法を見てみましょう。

### Stack Overflow {#stack-overflow}

[非正規化データガイド](/data-modeling/denormalization)では、Stack Overflowデータセットを使用してデータを非正規化するさまざまな技術を示しています。`votes`、`users`、`badges`、`posts`、および`postlinks`というテーブルにデータをポピュレートします。

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

このデータを`posts_with_links`テーブルに1回挿入する方法を示しましたが、本番システムではこの操作を定期的に実行したいでしょう。

`posts`テーブルと`postlinks`テーブルはどちらも更新される可能性があります。したがって、増分マテリアライズドビューを使用してこの結合を実装するのではなく、このクエリを設定された間隔で実行するようにスケジュールし、結果を`post_with_links`テーブルに保存するのが十分かもしれません。

ここで、リフレッシュ可能なマテリアライズドビューが役立ちます。次のクエリで作成できます：

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

このビューは即座に実行され、以降は設定された間隔ごとに実行され、ソーステーブルの更新が反映されるようになります。重要なことは、クエリが再実行されると、結果セットが原子的かつ透過的に更新されることです。

:::note
ここでの構文は、[`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view)句を含む限り、増分マテリアライズドビューと同じです：
:::

### IMDb {#imdb}

[dbtとClickHouseの統合ガイド](/integrations/dbt#dbt)では、`actors`、`directors`、`genres`、`movie_directors`、`movies`、および`roles`というテーブルでIMDbデータセットをポピュレートしました。

次のクエリを使用して、各俳優の要約を計算できます。ムービーの出現頻度によって並べ替えます。

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

結果を返すのにそれほど時間はかかりませんが、さらに迅速で計算負荷の少ないものにしたいとしましょう。
このデータセットは絶えず更新されており、映画も新しい俳優や監督とともに常にリリースされています。

リフレッシュ可能なマテリアライズドビューの出番です。結果用のターゲットテーブルをまず作成しましょう：

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

このビューは即座に実行され、その後、設定どおりに毎分実行され、ソーステーブルの更新が反映されるようになります。俳優の要約を取得するための前のクエリが、文法的に簡素化され、著しく高速になります！

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

新しい俳優 "Clicky McClickHouse" をソースデータに追加すると、彼は多くの映画に出演したことになります！

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

60秒も経たないうちに、ターゲットテーブルはClickyの俳優としての多才な側面を反映するために更新されます：

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
