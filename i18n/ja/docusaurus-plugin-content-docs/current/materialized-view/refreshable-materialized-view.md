---
slug: /materialized-view/refreshable-materialized-view
title: リフレッシャブルマテリアライズドビュー
description: マテリアライズドビューを使用してクエリを高速化する方法
keywords: [リフレッシャブルマテリアライズドビュー, リフレッシュ, マテリアライズドビュー, クエリの高速化, クエリ最適化]
---

[リフレッシャブルマテリアライズドビュー](/sql-reference/statements/create/view#refreshable-materialized-view)は、伝統的なOLTPデータベースにおけるマテリアライズドビューと概念的に類似しており、特定のクエリの結果を素早く取得するために保存し、リソースを多く消費するクエリを繰り返し実行する必要を削減します。ClickHouseの[インクリメンタルマテリアライズドビュー](/materialized-view)とは異なり、これはフルデータセットに対して定期的にクエリを実行することを必要とし、その結果がクエリ用にターゲットテーブルに保存されます。この結果セットは理論的には元のデータセットよりも小さくなるため、以降のクエリはより速く実行できます。

この図は、リフレッシャブルマテリアライズドビューの動作を説明しています：

<img src={require('./images/refreshable-materialized-view-diagram.png').default}
  class='image'
  alt='リフレッシャブルマテリアライズドビューの図'
  style={{width: '100%', background: 'none' }} />

次のビデオもご覧いただけます：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTubeビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## リフレッシャブルマテリアライズドビューはいつ使用すべきですか？ {#when-should-refreshable-materialized-views-be-used}

ClickHouseのインクリメンタルマテリアライズドビューは非常に強力で、特に単一のテーブル上で集計を行う必要があるケースにおいて、リフレッシャブルマテリアライズドビューのアプローチよりもはるかにスケールします。データのブロックごとに集計を計算し、最終テーブルにインクリメンタルな状態をマージすることで、クエリはデータのサブセットでのみ実行されます。この方法はペタバイトのデータにスケールする可能性があり、通常は好ましい方法です。

ただし、このインクリメンタルプロセスが必要ない、または適用できない使用ケースもあります。いくつかの問題はインクリメンタルアプローチと互換性がないか、リアルタイムの更新を必要とせず、定期的な再構築がより適切です。たとえば、複雑な結合を使用しているため、全データセットに対してビューの完全再計算を定期的に実行したい場合があります。

> リフレッシャブルマテリアライズドビューは、非正規化などのタスクを実行するバッチプロセスを実行することができます。リフレッシャブルマテリアライズドビュー間に依存関係を作成することができ、一つのビューがもう一つの結果に依存し、完了するまで実行しないようにすることができます。これはスケジュールされたワークフローや[dbt](https://www.getdbt.com/)ジョブのようなシンプルなDAGに置き換えることができます。リフレッシャブルマテリアライズドビュー間の依存関係を設定する方法については、[CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies)の`Dependencies`セクションをご覧ください。

## リフレッシャブルマテリアライズドビューはどのようにリフレッシュしますか？ {#how-do-you-refresh-a-refreshable-materialized-view}

リフレッシャブルマテリアライズドビューは、作成時に定義した間隔で自動的にリフレッシュされます。
たとえば、次のマテリアライズドビューは毎分リフレッシュされます：

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
詳細については、[リフレッシャブルマテリアライズドビューの管理](/sql-reference/statements/system#refreshable-materialized-views)ドキュメントをご覧ください。

## リフレッシャブルマテリアライズドビューは最後にいつリフレッシュされましたか？ {#when-was-a-refreshable-materialized-view-last-refreshed}

リフレッシャブルマテリアライズドビューが最後にリフレッシュされた時期を確認するには、下記の[`system.view_refreshes`](/operations/system-tables/view_refreshes)システムテーブルをクエリできます：

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

リフレッシャブルマテリアライズドビューのリフレッシュレートを変更するには、[`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement)構文を使用します。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

これを行った後、[リフレッシャブルマテリアライズドビューは最後にいつリフレッシュされましたか？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed)クエリを使用して、レートが更新されたかどうかを確認できます：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## `APPEND`を使用して新しい行を追加する {#using-append-to-add-new-rows}

`APPEND`機能を使用すると、ビュー全体を置き換えるのではなく、テーブルの末尾に新しい行を追加できます。

この機能の一つの使用法は、ある時点での値のスナップショットをキャプチャすることです。たとえば、`Kafka`、`Redpanda`、または他のストリーミングデータプラットフォームからのメッセージのストリームによって`events`テーブルが populatedされていると想像してみてください。

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

このデータセットには、`uuid`カラムに`4096`の値があります。次のクエリを書いて、合計カウントが最も高いものを見つけることができます：

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

例えば、各`uuid`のカウントを10秒ごとにキャプチャし、新しいテーブル`events_snapshot`に保存することを考えましょう。`events_snapshot`のスキーマは次のようになります：

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
) 
ENGINE = MergeTree 
ORDER BY uuid;
```

次に、このテーブルをポピュレートするためのリフレッシャブルマテリアライズドビューを作成します：

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

その後、特定の`uuid`の時間経過に伴うカウントを取得するために、`events_snapshot`をクエリできます：

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

では、いくつかの例データセットを使用して、リフレッシャブルマテリアライズドビューの使い方を見てみましょう。

### Stack Overflow {#stack-overflow}

[データの非正規化ガイド](/data-modeling/denormalization)では、Stack Overflowデータセットを使用してデータを非正規化するためのさまざまな技術を示しています。以下のテーブルにデータを投入します：`votes`、`users`、`badges`、`posts`、および`postlinks`。

そのガイドでは、以下のクエリを使用して`postlinks`データセットを`posts`テーブルに非正規化する方法を示しました：

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

このデータを`posts_with_links`テーブルに一度だけ挿入する方法も示しましたが、実際のシステムでは、この操作を定期的に実行したいと思うでしょう。

`posts`テーブルと`postlinks`テーブルの両方は更新される可能性があります。したがって、インクリメンタルマテリアライズドビューを使用してこの結合を実装しようとするのではなく、単にこのクエリを設定された間隔で実行するようにスケジュールすることが十分であるかもしれません。たとえば、毎時一度、結果を`post_with_links`テーブルに保存するという方法です。

ここでリフレッシャブルマテリアライズドビューが役立ちます。次のクエリで作成できます：

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

ビューは即座に実行され、その後は毎時更新されるように設定され、ソーステーブルへの更新が反映されます。重要なことに、クエリが再実行される際に、結果セットは原子的かつ透過的に更新されます。

:::note
ここでの構文はインクリメンタルマテリアライズドビューと同じですが、`REFRESH`(/sql-reference/statements/create/view#refreshable-materialized-view)句を含めます：
:::

### IMDb {#imdb}

[dbtとClickHouseの統合ガイド](/integrations/dbt#dbt)では、`actors`、`directors`、`genres`、`movie_directors`、`movies`、`roles`の各テーブルを使用してIMDbデータセットを populatesします。

次に、各俳優の映画出演数で並べ替えた要約を計算するために、次のクエリを使用できます。

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

結果を返すのにそれほど時間はかかりませんが、さらに迅速に、かつ計算コストを低くしたい場合があります。
このデータセットが継続的に更新される対象であるとします。映画がどんどん発売され、新しい俳優や監督も登場しています。

リフレッシャブルマテリアライズドビューの出番です。まず、結果用のターゲットテーブルを作成します：

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

そして、ビューを定義できます：

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

ビューは即座に実行され、その後は1分ごとに設定された間隔で、それによってソーステーブルの更新が反映されます。以前の俳優の要約を取得するクエリは、構文的に簡単になり、さらに大幅に高速化されます！

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

例えば、「Clicky McClickHouse」という新しい俳優をソースデータに追加するとしましょう。彼は多くの映画に出ています！

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

60秒と経たないうちに、ターゲットテーブルはClickyの出演の多さを反映するように更新されます：

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
