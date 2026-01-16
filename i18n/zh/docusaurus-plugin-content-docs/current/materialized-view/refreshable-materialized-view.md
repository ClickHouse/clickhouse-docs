---
slug: /materialized-view/refreshable-materialized-view
title: '可刷新物化视图'
description: '如何使用物化视图加速查询'
keywords: ['可刷新物化视图', '刷新', '物化视图', '加速查询', '查询优化']
doc_type: 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[可刷新的物化视图](/sql-reference/statements/create/view#refreshable-materialized-view) 在概念上类似于传统 OLTP 数据库中的物化视图：它们存储指定查询的结果，以便快速检索，并减少反复执行资源密集型查询的需求。与 ClickHouse 的[增量物化视图](/materialized-view/incremental-materialized-view)不同，这种方式需要定期在完整数据集上执行查询，其结果会被存储到目标表中以供查询使用。理论上，该结果集应当比原始数据集更小，从而使后续查询执行得更快。

下图说明了可刷新物化视图的工作原理：

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="可刷新物化视图示意图" />

你还可以观看以下视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## 何时应使用可刷新物化视图？ \\{#when-should-refreshable-materialized-views-be-used\\}

ClickHouse 增量物化视图功能极其强大，通常比可刷新物化视图的方案具有更好的可扩展性，尤其是在需要对单个表执行聚合的场景中。通过仅在数据块插入时对每个数据块进行聚合计算，并在最终表中合并这些增量状态，查询始终只在数据的子集上执行。此方法可以扩展到潜在的 PB 级别数据量，通常是首选方法。

然而，在某些用例中，这种增量处理不是必需的，或者并不适用。有些问题要么与增量方法不兼容，要么不需要实时更新，此时周期性重建会更合适。例如，你可能希望定期对整个数据集上的视图进行完整的重新计算，因为该视图使用了复杂的 `JOIN`，而这与增量方法不兼容。

>  可刷新物化视图可以运行批处理过程来执行诸如反规范化之类的任务。可以在可刷新物化视图之间创建依赖关系，使一个视图依赖另一个视图的结果，并仅在其完成后才执行。这可以替代预定的工作流或简单的有向无环图（DAG），例如 [dbt](https://www.getdbt.com/) 任务。要了解更多关于如何在可刷新物化视图之间设置依赖关系的信息，请参阅 [CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies) 中的 `Dependencies` 部分。

## 如何刷新可刷新物化视图？ \\{#how-do-you-refresh-a-refreshable-materialized-view\\}

可刷新物化视图会按照创建时定义的时间间隔自动刷新。
例如，下面的物化视图每分钟刷新一次：

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

如果要强制刷新物化视图，可以使用 `SYSTEM REFRESH VIEW` 子句：

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

你还可以取消、停止或启动视图。
有关更多信息，请参阅[管理可刷新的物化视图](/sql-reference/statements/system#refreshable-materialized-views)文档。

## 可刷新物化视图最近一次刷新是什么时候？ \\{#when-was-a-refreshable-materialized-view-last-refreshed\\}

要查找某个可刷新物化视图最近一次的刷新时间，可以按如下方式查询 [`system.view_refreshes`](/operations/system-tables/view_refreshes) 系统表：

```sql
SELECT database, view, status,
       last_success_time, last_refresh_time, next_refresh_time,
       read_rows, written_rows
FROM system.view_refreshes;
```

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ 已调度    │ 2024-11-11 12:10:00 │ 2024-11-11 12:10:00 │ 2024-11-11 12:11:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## 如何修改刷新频率？ \\{#how-can-i-change-the-refresh-rate\\}

要修改可刷新的物化视图的刷新频率，请使用 [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 语法。

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

完成上述操作后，可以使用 [可刷新物化视图上次刷新时间是什么时候？](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed) 查询来检查刷新频率是否已更新：

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ 已调度    │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## 使用 `APPEND` 添加新行 \\{#using-append-to-add-new-rows\\}

`APPEND` 功能允许在表的末尾追加新行，而不是替换整个视图。

此功能的一个用例是捕获某一时间点的数值快照。比如，假设我们有一张 `events` 表，它由来自 [Kafka](https://kafka.apache.org/)、[Redpanda](https://www.redpanda.com/) 或其他流式数据平台的消息流写入。

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

这个数据集在 `uuid` 列中包含 `4096` 个值。我们可以编写如下查询来找出总出现次数最高的那些值：

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

假设我们想要每 10 秒统计一次每个 `uuid` 的数量，并将结果存入一个名为 `events_snapshot` 的新表中。`events_snapshot` 的表结构如下：

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

接下来可以创建一个可刷新的物化视图来填充该表：

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

## 示例 \\{#examples\\}

现在让我们通过一些示例数据集来看看如何使用可刷新物化视图。

### Stack Overflow \\{#stack-overflow\\}

[数据反规范化指南](/data-modeling/denormalization) 展示了使用 Stack Overflow 数据集进行数据反规范化的多种技术。我们向以下表中填充数据：`votes`、`users`、`badges`、`posts` 和 `postlinks`。

在该指南中，我们演示了如何使用以下查询将 `postlinks` 数据集反规范化到 `posts` 表中：

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

然后我们展示了如何将这些数据一次性插入到 `posts_with_links` 表中，但在生产系统中，我们通常希望定期执行此操作。

`posts` 和 `postlinks` 两个表都有可能发生更新。因此，与其尝试使用增量物化视图来实现这个连接操作，不如简单地将该查询按固定时间间隔调度运行，例如每小时运行一次，并将结果存储到 `post_with_links` 表中，这样可能就足够了。

这正是可刷新物化视图大显身手的场景，我们可以通过以下查询来创建这样一个视图：

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

该视图会立即执行，并按照配置每小时执行一次，以确保源表中的更新得到反映。需要注意的是，当查询重新运行时，结果集会以原子且透明的方式更新。

:::note
此处的语法与增量物化视图完全相同，只是我们额外加入了一个 [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view) 子句：
:::

### IMDb \\{#imdb\\}

在 [dbt 和 ClickHouse 集成指南](/integrations/dbt) 中，我们使用下列表填充了一个 IMDb 数据集：`actors`、`directors`、`genres`、`movie_directors`、`movies` 和 `roles`。

然后我们可以编写如下查询，用于统计每位演员的汇总信息，并按出演电影次数从高到低排序。

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

返回结果所需的时间并不算长，但假设我们希望它更快一些、计算开销更低。
再假设这个数据集也在持续更新——电影不断上映，新演员和新导演也不断涌现。

现在是使用可刷新物化视图的时候了，先为结果创建一个目标表：

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

现在，我们可以来定义这个视图：

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

该视图会立即执行，并按配置此后每分钟执行一次，以确保源表中的更新能够被反映出来。我们之前用于获取演员汇总信息的查询在语法上更为简洁，执行速度也显著提升！

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

假设我们在源数据中添加了一位新演员 &quot;Clicky McClickHouse&quot;，并且他恰好出演了很多电影！

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

不到 60 秒钟后，我们的目标表就已更新，充分体现了 Clicky 在表演方面的高产：

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
