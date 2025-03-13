---
slug: /materialized-view/refreshable-materialized-view
title: 可刷新的物化视图
description: 如何使用物化视图加速查询
keywords: [可刷新的物化视图, 刷新, 物化视图, 加速查询, 查询优化]
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';

[可刷新的物化视图](/sql-reference/statements/create/view#refreshable-materialized-view) 在概念上类似于传统 OLTP 数据库中的物化视图，存储指定查询的结果以快速检索，从而减少重复执行资源密集型查询的需要。与 ClickHouse 的 [增量物化视图](/materialized-view/incremental-materialized-view) 不同，这需要定期在完整数据集上执行查询——其结果存储在目标表中以供查询。理论上，这个结果集应该比原始数据集小，从而使后续查询能够更快地执行。

下图说明了可刷新的物化视图的工作原理：

<img src={refreshableMaterializedViewDiagram}
  class="image"
  alt="可刷新的物化视图图"
  style={{width: '100%', background: 'none'}} />

您还可以观看以下视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## 何时应使用可刷新的物化视图？ {#when-should-refreshable-materialized-views-be-used}

ClickHouse 的增量物化视图功能强大，通常比可刷新的物化视图所使用的方法具有更好的扩展性，尤其是在需要对单一表执行聚合的情况下。通过仅计算按块插入的数据的聚合，并在最终表中合并增量状态，查询只会在部分数据上执行。这种方法可以扩展到潜在的 PB 级数据，通常是首选的方法。

但是，有些情况下不需要或不适用这种增量过程。一些问题与增量方法不兼容，或不需要实时更新，而周期性重建更为合适。例如，您可能希望定期对完整数据集重新计算视图，因为它使用了复杂的连接，这在增量方法中是不可兼容的。

> 可刷新的物化视图可以运行批处理过程，执行诸如去规范化的任务。可以在可刷新的物化视图之间创建依赖关系，以便一个视图依赖于另一个视图的结果，并只有在完成后才会执行。这可以替代计划工作流或简单的 DAG，如 [dbt](https://www.getdbt.com/) 作业。要了解有关如何设置可刷新的物化视图之间的依赖关系，请访问 [CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies) 的 `Dependencies` 部分。

## 如何刷新可刷新的物化视图？ {#how-do-you-refresh-a-refreshable-materialized-view}

可刷新的物化视图将在创建时定义的间隔内自动刷新。
例如，以下物化视图每分钟刷新一次：

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

如果您想强制刷新物化视图，可以使用 `SYSTEM REFRESH VIEW` 子句：

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

您还可以取消、停止或启动视图。
有关更多详细信息，请参见 [管理可刷新的物化视图](/sql-reference/statements/system#refreshable-materialized-views) 文档。

## 可刷新的物化视图上次刷新是何时？ {#when-was-a-refreshable-materialized-view-last-refreshed}

要找出可刷新的物化视图上次被刷新时，可以查询 [`system.view_refreshes`](/operations/system-tables/view_refreshes) 系统表，示例如下：

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

## 如何更改刷新频率？ {#how-can-i-change-the-refresh-rate}

要更改可刷新的物化视图的刷新频率，请使用 [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 语法。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

完成后，您可以使用 [可刷新的物化视图上次刷新是何时？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed) 查询来检查频率是否已更新：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## 使用 `APPEND` 添加新行 {#using-append-to-add-new-rows}

`APPEND` 功能允许您将新行添加到表的末尾，而不是替换整个视图。

此功能的一个用法是捕获某个时刻值的快照。例如，假设我们有一个从 [Kafka](https://kafka.apache.org/) 、 [Redpanda](https://www.redpanda.com/) 或其他流数据平台传入消息流填充的 `events` 表。

```sql
SELECT *
FROM events
LIMIT 10

查询 ID: 7662bc39-aaf9-42bd-b6c7-bc94f2881036

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

此数据集在 `uuid` 列中有 `4096` 个值。我们可以编写以下查询来找到总计数最高的值：

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

假设我们想要每 10 秒捕获一次每个 `uuid` 的计数，并将其存储在名为 `events_snapshot` 的新表中。 `events_snapshot` 的模式将如下所示：

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

然后我们可以创建一个可刷新的物化视图来填充此表：

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

然后我们可以查询 `events_snapshot`，以获取特定 `uuid` 随时间变化的计数：

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

## 示例 {#examples}

现在让我们看看如何使用可刷新的物化视图与一些示例数据集。

### Stack Overflow {#stack-overflow}

[去规范化数据指南](/data-modeling/denormalization)展示了使用 Stack Overflow 数据集去规范化数据的各种技术。我们将数据填充到以下表中：`votes`、`users`、`badges`、`posts` 和 `postlinks`。

在该指南中，我们展示了如何通过以下查询将 `postlinks` 数据集去规范化为 `posts` 表：

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

随后我们展示了如何一次性将该数据插入到 `posts_with_links` 表中，但在生产系统中，我们希望定期运行此操作。

`posts` 和 `postlinks` 表都有可能被更新。因此，与其尝试使用增量物化视图实施此连接，可能仅需安排此查询在设定的时间间隔内运行，例如每小时一次，将结果存储在 `post_with_links` 表中。

在这种情况下，可刷新的物化视图将大有裨益，我们可以通过以下查询创建一个：

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

该视图将立即执行，并在此后每小时根据配置确保源表的更新反映。重要的是，当查询重新运行时，结果集将原子性和透明地更新。

:::note
这里的语法与增量物化视图相同，只是我们加入了 [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view) 子句：
:::

### IMDb {#imdb}

在 [dbt 和 ClickHouse 集成指南](/integrations/dbt#dbt) 中，我们使用以下表填充了一个 IMDb 数据集：`actors`、`directors`、`genres`、`movie_directors`、`movies` 和 `roles`。

然后我们可以编写以下查询，以计算每位演员的总结，按电影出演最多的人进行排序。

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

虽然返回结果并不需要太长时间，但假设我们希望让它更快，并且计算开销更小。
假设该数据集也会不断更新——新电影持续上线，新的演员和导演也在出现。

这时候就该使用可刷新的物化视图了，所以我们首先为结果创建一个目标表：

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

现在我们可以定义视图：

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

该视图将立即执行，并在此后每分钟根据配置确保源表的更新反映。我们的原查询就变得语法上更简单，速度显著更快！

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

假设我们向源数据添加了一个新演员“Clicky McClickHouse”，他在很多电影中都出现过！

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

不到 60 秒后，我们的目标表更新以反映 Clicky 演出的丰硕成果：

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
