---
description: 'CREATE VIEW 语句文档'
sidebar_label: 'VIEW'
sidebar_position: 37
slug: /sql-reference/statements/create/view
title: 'CREATE VIEW'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW \{#create-view\}

创建一个新视图。视图可以是[普通视图](#normal-view)、[物化视图](#materialized-view)、[可刷新的物化视图](#refreshable-materialized-view)以及[窗口视图](/sql-reference/statements/create/view#window-view)。

## 普通视图 \{#normal-view\}

语法：

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

普通视图本身不存储任何数据。它只是会在每次访问时从另一张表中读取数据。换句话说，普通视图不过是一个已保存的查询。从视图读取数据时，这个已保存的查询会作为子查询用于 [FROM](../../../sql-reference/statements/select/from.md) 子句中。

例如，假设你已经创建了一个视图：

```sql
CREATE VIEW view AS SELECT ...
```

并编写了如下查询：

```sql
SELECT a, b, c FROM view
```

此查询完全等价于使用子查询：

```sql
SELECT a, b, c FROM (SELECT ...)
```


## 参数化视图 \{#parameterized-view\}

参数化视图与普通视图类似，但在创建时可以指定不会立即解析的参数。这类视图可以配合表函数使用：将视图名称作为函数名，将参数值作为函数参数传入。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

上述操作为该表创建了一个视图，通过如下方式替换参数，可以将其作为表函数使用。

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```


## 物化视图 \{#materialized-view\}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
以下是一份关于如何使用[物化视图](/guides/developer/cascading-materialized-views.md)的分步指南。
:::

物化视图会存储由对应的 [SELECT](../../../sql-reference/statements/select/index.md) 查询转换后的数据。

在创建未指定 `TO [db].[table]` 的物化视图时，必须指定用于存储数据的表引擎 `ENGINE`。

在创建带有 `TO [db].[table]` 的物化视图时，不能同时使用 `POPULATE`。

物化视图的实现方式如下：当向 `SELECT` 中指定的表插入数据时，插入数据的一部分会通过该 `SELECT` 查询进行转换，并将结果插入到视图中。

:::note
ClickHouse 中的物化视图在向目标表插入数据时使用的是**列名**而不是列顺序。如果某些列名在 `SELECT` 查询结果中不存在，ClickHouse 会使用默认值，即使该列不是 [Nullable](../../data-types/nullable.md)。一种更安全的做法是在使用物化视图时为每一列添加别名。

ClickHouse 中的物化视图在实现上更类似于插入触发器。如果视图查询中包含聚合操作，它只会应用于新近插入的这一批数据。对源表中已有数据的任何修改（例如 update、delete、drop partition 等）都不会改变物化视图。

在出现错误的情况下，ClickHouse 中的物化视图行为不是确定性的。这意味着已经写入的块会保留在目标表中，而错误之后的所有块都不会写入。

默认情况下，如果向某个视图写入失败，那么对应的 INSERT 查询也会失败，并且某些数据块可能不会写入目标表。可以通过设置 `materialized_views_ignore_errors` 来改变这一行为（需要在 `INSERT` 查询中设置）。如果将 `materialized_views_ignore_errors=true`，则在向视图写入时出现的任何错误都会被忽略，所有数据块都会写入目标表。

另请注意，对于 `system.*_log` 表，`materialized_views_ignore_errors` 默认设置为 `true`。
:::

如果指定了 `POPULATE`，在创建视图时会将已有表数据插入到视图中，其行为类似于执行 `CREATE TABLE ... AS SELECT ...`。否则，视图中只包含在创建视图之后插入到表中的数据。我们**不推荐**使用 `POPULATE`，因为在视图创建过程中插入到表中的数据不会被插入到视图中。

:::note
鉴于 `POPULATE` 的行为类似于 `CREATE TABLE ... AS SELECT ...`，它存在以下限制：

* 不支持在 Replicated 数据库中使用
* 不支持在 ClickHouse Cloud 中使用

可以改用单独的 `INSERT ... SELECT`。
:::

`SELECT` 查询可以包含 `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`。请注意，相应的转换会在每个插入数据块上独立执行。例如，如果设置了 `GROUP BY`，则数据会在插入时聚合，但仅限于单个插入数据包内。数据之后不会再进行进一步聚合。例外情况是使用会独立执行数据聚合的 `ENGINE`，例如 `SummingMergeTree`。

如果物化视图使用 `TO [db.]name` 这种写法，可以先 `DETACH` 视图，对目标表执行 `ALTER`，然后再 `ATTACH` 之前被 `DETACH` 的视图。

请注意，物化视图会受到 [optimize&#95;on&#95;insert](/operations/settings/settings#optimize_on_insert) 设置的影响。数据会在插入到视图之前进行合并。

视图看起来与普通表相同。例如，它们会出现在 `SHOW TABLES` 查询的结果中。

要删除视图，请使用 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)。尽管 `DROP TABLE` 对 VIEW 也同样可用。


## SQL 安全性 \{#sql_security\}

`DEFINER` 和 `SQL SECURITY` 允许你指定在执行视图底层查询时要使用的 ClickHouse 用户。
`SQL SECURITY` 有三个合法取值：`DEFINER`、`INVOKER` 或 `NONE`。你可以在 `DEFINER` 子句中指定任意已存在的用户或者 `CURRENT_USER`。

下表说明了为了从视图中进行查询，不同用户需要具备哪些权限。
注意：无论 `SQL SECURITY` 选项为何，在所有情况下，读取视图都必须具备 `GRANT SELECT ON <view>` 权限。

| SQL SECURITY 选项 | 视图                              | 物化视图                                                    |
| --------------- | ------------------------------- | ------------------------------------------------------- |
| `DEFINER alice` | `alice` 必须对视图的源表拥有 `SELECT` 权限。 | `alice` 必须对视图的源表拥有 `SELECT` 权限，并且对视图的目标表拥有 `INSERT` 权限。 |
| `INVOKER`       | 用户必须对视图的源表拥有 `SELECT` 权限。       | 物化视图不允许指定 `SQL SECURITY INVOKER`。                       |
| `NONE`          | -                               | -                                                       |

:::note
`SQL SECURITY NONE` 是一个已弃用选项。任何有权限创建带有 `SQL SECURITY NONE` 的视图的用户，都能够执行任意查询。
因此，要创建使用该选项的视图，需要具备 `GRANT ALLOW SQL SECURITY NONE TO <user>` 权限。
:::

如果未指定 `DEFINER`/`SQL SECURITY`，则会使用默认值：

* `SQL SECURITY`：普通视图为 `INVOKER`，物化视图为 `DEFINER`（[可通过设置进行配置](../../../operations/settings/settings.md#default_normal_view_sql_security)）
* `DEFINER`：`CURRENT_USER`（[可通过设置进行配置](../../../operations/settings/settings.md#default_view_definer)）

如果在附加视图时未指定 `DEFINER`/`SQL SECURITY`，则物化视图的默认值为 `SQL SECURITY NONE`，普通视图的默认值为 `SQL SECURITY INVOKER`。

要修改已有视图的 SQL 安全性，请使用

```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```


### 示例 \{#examples\}

```sql
CREATE VIEW test_view
DEFINER = alice SQL SECURITY DEFINER
AS SELECT ...
```

```sql
CREATE VIEW test_view
SQL SECURITY INVOKER
AS SELECT ...
```


## 实时视图 \\{#live-view\\}

<DeprecatedBadge/>

此功能已被弃用，并将在未来的版本中移除。

为方便查阅，旧版文档位于[此处](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)

## 可刷新物化视图 \{#refreshable-materialized-view\}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
REFRESH EVERY|AFTER interval [OFFSET interval]
[RANDOMIZE FOR interval]
[DEPENDS ON [db.]name [, [db.]name [, ...]]]
[SETTINGS name = value [, name = value [, ...]]]
[APPEND]
[TO[db.]name] [(columns)] [ENGINE = engine]
[EMPTY]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

其中 `interval` 是由简单区间组成的序列：

```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期运行相应的查询，并将其结果存储在一个表中。

* 如果查询中包含 `APPEND`，每次刷新都会向表中插入新行，而不会删除现有行。该插入操作不是原子的，与常规的 INSERT SELECT 一样。
* 否则，每次刷新都会以原子方式替换表中之前的内容。
  与常规的不可刷新的物化视图的区别：
* 没有插入触发器。也就是说，当向 SELECT 中指定的表插入新数据时，这些数据*不会*自动推送到可刷新的物化视图中。周期性刷新会运行整个查询。
* 对 SELECT 查询没有限制。表函数（例如 `url()`）、视图、UNION、JOIN 都是允许的。

:::note
查询中 `REFRESH ... SETTINGS` 部分中的设置是刷新设置（例如 `refresh_retries`），与常规设置（例如 `max_threads`）不同。常规设置可以在查询末尾使用 `SETTINGS` 指定。
:::


### 刷新计划 \{#refresh-schedule\}

刷新计划示例：

```sql
REFRESH EVERY 1 DAY -- every day, at midnight (UTC)
REFRESH EVERY 1 MONTH -- on 1st day of every month, at midnight
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- on 6th day of every month, at 2:00 am
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- every other Saturday, at 3:10 pm
REFRESH EVERY 30 MINUTE -- at 00:00, 00:30, 01:00, 01:30, etc
REFRESH AFTER 30 MINUTE -- 30 minutes after the previous refresh completes, no alignment with time of day
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- syntax error, OFFSET is not allowed with AFTER
REFRESH EVERY 1 WEEK 2 DAYS -- every 9 days, not on any particular day of the week or month;
                            -- specifically, when day number (since 1969-12-29) is divisible by 9
REFRESH EVERY 5 MONTHS -- every 5 months, different months each year (as 12 is not divisible by 5);
                       -- specifically, when month number (since 1970-01) is divisible by 5
```

`RANDOMIZE FOR` 会随机调整每次刷新的时间，例如：

```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

对于给定的视图，同一时间最多只能运行一个刷新任务。比如，如果一个带有 `REFRESH EVERY 1 MINUTE` 的视图需要 2 分钟才能刷新完成，那么它实际上就会每 2 分钟刷新一次。如果之后刷新变快，开始在 10 秒内完成刷新，它就会恢复为每分钟刷新一次。（特别地，它不会为了“追赶”错过的刷新而每 10 秒刷新一次——系统中并不存在这样的积压队列。）

此外，在创建物化视图之后，会立即启动一次刷新，除非在 `CREATE` 查询中指定了 `EMPTY`。如果指定了 `EMPTY`，则第一次刷新会按照预定的计划执行。


### 在 Replicated 数据库中 \\{#in-replicated-db\\}

如果可刷新的物化视图位于 [Replicated 数据库](../../../engines/database-engines/replicated.md) 中，副本之间会相互协调，使得在每个计划的刷新时间点仅有一个副本执行刷新。需要使用 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 表引擎，以确保所有副本都能看到刷新产生的数据。

在 `APPEND` 模式下，可以通过 `SETTINGS all_replicas = 1` 禁用这种协调。这样会使各个副本彼此独立地执行刷新。在这种情况下，不再需要使用 ReplicatedMergeTree。

在非 `APPEND` 模式下，只支持协同刷新。若要使用不协同的刷新方式，请使用 `Atomic` 数据库，并结合 `CREATE ... ON CLUSTER` 查询在所有副本上创建可刷新物化视图。

这种协调通过 Keeper 实现。znode 路径由 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 服务器设置决定。

### 依赖关系 \{#refresh-dependencies\}

`DEPENDS ON` 用于同步不同表的刷新。举例来说，假设存在一条由两个可刷新物化视图组成的依赖链：

```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```

如果不使用 `DEPENDS ON`，两个视图都会在午夜开始刷新，这时 `destination` 通常只能在 `source` 中看到昨天的数据。若我们添加依赖关系：

```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```

这样一来，只有在当日 `source` 的刷新完成后，`destination` 的刷新才会开始，因此 `destination` 将基于最新的数据。

或者，可以通过以下方式达到相同的效果：

```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```

其中 `1 HOUR` 可以是任何小于 `source` 刷新周期的持续时间。依赖表的刷新频率不会高于其任何一个依赖项。这是一种有效的方式，可以在不重复多次指定实际刷新周期的情况下，构建可刷新的视图链。

更多示例：

* `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）依赖于 `REFRESH EVERY 1 DAY`（`source`）<br />
  如果 `source` 的刷新耗时超过 10 分钟，则 `destination` 会等待它完成。
* `REFRESH EVERY 1 DAY OFFSET 1 HOUR` 依赖于 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br />
  与上面类似，即使对应的刷新发生在不同的日历日。
  `destination` 在第 X+1 天的刷新会等待 `source` 在第 X 天的刷新（如果耗时超过 2 小时）。
* `REFRESH EVERY 2 HOUR` 依赖于 `REFRESH EVERY 1 HOUR`<br />
  2 小时的刷新会在每隔一小时的 1 小时刷新之后执行，例如在午夜刷新之后、然后在凌晨 2 点刷新之后，依此类推。
* `REFRESH EVERY 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br />
  `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br />
  `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH AFTER 2 HOUR`<br />
  `destination` 会在每次 `source` 刷新后被刷新一次，即每 2 小时刷新一次。`1 MINUTE` 实际上会被忽略。
* `REFRESH AFTER 1 HOUR` 依赖于 `REFRESH AFTER 1 HOUR`<br />
  目前不推荐这样配置。

:::note
`DEPENDS ON` 仅在可刷新的物化视图之间生效。将普通表列入 `DEPENDS ON` 列表会导致该视图永远不会刷新（可以使用 `ALTER` 移除依赖关系，见下文）。
:::


### Settings \\{#settings\\}

可用的刷新设置：

* `refresh_retries` - 当刷新查询因异常失败时重试的次数。如果所有重试都失败，则跳过本次并等待下一个计划刷新时间。0 表示不重试，-1 表示无限重试。默认值：0。
* `refresh_retry_initial_backoff_ms` - 如果 `refresh_retries` 不为零，第一次重试前的延迟。之后每次重试会将延迟翻倍，直到达到 `refresh_retry_max_backoff_ms`。默认值：100 ms。
* `refresh_retry_max_backoff_ms` - 刷新重试之间延迟的指数增长上限。默认值：60000 ms（1 分钟）。

### Changing Refresh Parameters \{#changing-refresh-parameters\}

要更改刷新参数：

```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
这会一次性替换刷新参数的*所有*内容：调度、依赖关系、设置以及是否为 APPEND 模式。例如，如果表之前有 `DEPENDS ON`，在执行不带 `DEPENDS ON` 的 `MODIFY REFRESH` 时将会移除这些依赖关系。
:::


### 其他操作 \\{#other-operations\\}

所有可刷新的 materialized view 的状态都可以在表 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 中查看。该表包含刷新进度（如果正在运行）、上次和下次刷新时间，以及在刷新失败时的异常消息。

要手动停止、启动、触发或取消刷新，请使用 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)。

要等待某次刷新完成，请使用 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)。这在创建视图后等待其完成初始刷新时尤其有用。

:::note
趣闻：刷新查询可以从正在刷新的视图中读取数据，读取到的是刷新前版本的数据。这意味着你可以实现康威生命游戏（Conway's Game of Life）：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## 窗口视图 \{#window-view\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
这是一个实验性功能，在未来的版本中可能会发生不向后兼容的变更。请通过 [allow&#95;experimental&#95;window&#95;view](/operations/settings/settings#allow_experimental_window_view) 设置启用窗口视图和 `WATCH` 查询功能。输入命令 `set allow_experimental_window_view = 1`。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

窗口视图（window view）可以按时间窗口聚合数据，并在窗口触发时输出结果。它将部分聚合结果存储在内部表（或指定的表）中以降低延迟，并且可以将处理结果推送到指定表，或者通过 `WATCH` 查询推送通知。

创建窗口视图与创建 `MATERIALIZED VIEW` 类似。窗口视图需要一个内部存储引擎来保存中间数据。可以通过使用 `INNER ENGINE` 子句来指定内部存储；未显式指定时，窗口视图将使用 `AggregatingMergeTree` 作为默认内部引擎。

在创建未带 `TO [db].[table]` 子句的窗口视图时，必须指定 `ENGINE`——用于存储数据的表引擎。


### 时间窗口函数 \\{#time-window-functions\\}

[时间窗口函数](../../functions/time-window-functions.md) 用于获取记录所在窗口的下界和上界。窗口视图需要配合时间窗口函数一起使用。

### 时间属性 \{#time-attributes\}

窗口视图支持 **processing time** 和 **event time** 两种时间属性。

**Processing time** 允许窗口视图基于本机时间生成结果，并且是默认使用的时间属性。它是最直接的时间概念，但不具备确定性。Processing time 属性可以通过将时间窗口函数的 `time_attr` 设置为某个表列，或使用函数 `now()` 来定义。下面的查询创建了一个使用 processing time 的窗口视图。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**事件时间（Event time）** 指的是每个独立事件在其产生设备上实际发生的时间。该时间通常在记录生成时就被写入其中。基于事件时间的处理，即使在事件乱序或延迟到达的情况下，也能够得到一致的结果。Window view 通过使用 `WATERMARK` 语法来支持基于事件时间的处理。

Window view 提供三种 watermark 策略：

* `STRICTLY_ASCENDING`：发出截至目前观测到的最大时间戳作为 watermark。时间戳小于该最大时间戳的行不被视为延迟事件。
* `ASCENDING`：发出截至目前观测到的最大时间戳减 1 作为 watermark。时间戳小于或等于该最大时间戳的行不被视为延迟事件。
* `BOUNDED`：`WATERMARK=INTERVAL`。发出的 watermark 为截至目前观测到的最大时间戳减去指定的延迟时间。

下面的查询是使用 `WATERMARK` 创建 window view 的示例：

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

默认情况下，当水印到达时窗口会触发，且在水印之后到达的元素会被丢弃。通过设置 `ALLOWED_LATENESS=INTERVAL`，窗口视图支持处理迟到事件。迟到事件处理的一个示例如下：

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

请注意，由延迟触发产生的元素应被视为对先前计算结果的更新。与在窗口结束时触发不同，窗口视图会在延迟事件到达时立即触发。因此，同一个窗口将产生多次输出。用户需要将这些重复结果纳入考虑，或对其进行去重处理。

可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改在窗口视图中指定的 `SELECT` 查询。新的 `SELECT` 查询生成的结果数据结构，无论是否包含 `TO [db.]name` 子句，都必须与原始 `SELECT` 查询保持一致。请注意，当前窗口中的数据会丢失，因为中间状态无法复用。


### 监控新窗口 \{#monitoring-new-windows\}

window view 支持使用 [WATCH](../../../sql-reference/statements/watch.md) 查询来监控变更，或者使用 `TO` 语法将结果输出到一个表中。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

可以通过指定 `LIMIT` 来限定在终止查询前要接收的更新次数。`EVENTS` 子句可用于得到 `WATCH` 查询的一种精简形式，在这种形式下，不会返回查询结果本身，而只会返回最新的查询水位线。


### 设置 \\{#settings-1\\}

* `window_view_clean_interval`：窗口视图的清理间隔时间（秒），用于释放过期数据。系统会保留根据系统时间或 `WATERMARK` 配置尚未完全触发的窗口，其余数据将被删除。
* `window_view_heartbeat_interval`：心跳间隔时间（秒），用于表示 `WATCH` 查询仍然处于活动状态。
* `wait_for_window_view_fire_signal_timeout`：在事件时间处理模式下等待窗口视图触发信号的超时时间。

### 示例 \{#example\}

假设我们需要统计日志表 `data` 中每 10 秒的点击日志数量，该表的结构为：

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

首先，我们创建一个使用 10 秒间隔滚动窗口的窗口视图：

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

接着使用 `WATCH` 查询获取结果。

```sql
WATCH wv
```

当向表 `data` 插入日志时，

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 查询应按如下方式输出结果：

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

或者，我们可以使用 `TO` 语法将结果输出到另一张表中。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

在 ClickHouse 的有状态测试中可以找到更多示例（这些测试的名称都包含 `*window_view*`）。


### Window View 用法 \\{#window-view-usage\\}

Window View 在以下场景中非常有用：

* **监控**：按时间对指标日志进行聚合和计算，并将结果输出到目标表。Dashboard 可以将该目标表作为数据源表使用。
* **分析**：在时间窗口内自动聚合和预处理数据，这在分析海量日志时尤其有用。预处理可以消除多个查询中的重复计算，降低查询延迟。

## 相关内容 \\{#related-content\\}

- 博客文章：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客文章：[使用 ClickHouse 构建可观测性解决方案（第二部分：链路追踪）](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## 临时视图 \\{#temporary-views\\}

ClickHouse 支持具有以下特性的 **临时视图**（在适用情况下与临时表的行为一致）：

* **会话生命周期**
  临时视图仅在当前会话期间存在。会话结束时会自动被删除。

* **无数据库归属**
  **不能** 使用数据库名限定临时视图。它存在于数据库之外（会话命名空间）。

* **不复制 / 不支持 ON CLUSTER**
  临时对象是会话本地的，**不能** 使用 `ON CLUSTER` 创建。

* **名称解析**
  如果一个临时对象（表或视图）与一个持久对象同名，并且查询在引用该名称时 **没有** 指定数据库，则会优先使用 **临时** 对象。

* **逻辑对象（无存储）**
  临时视图仅存储其 `SELECT` 语句文本（内部使用 `View` 存储引擎）。它不持久化数据，且不能接收 `INSERT`。

* **ENGINE 子句**
  **无需** 指定 `ENGINE`；如果显式指定为 `ENGINE = View`，该设置会被忽略 / 视为同一个逻辑视图。

* **安全性 / 权限**
  创建临时视图需要 `CREATE TEMPORARY VIEW` 权限，而该权限会被 `CREATE VIEW` 隐式授予。

* **SHOW CREATE**
  使用 `SHOW CREATE TEMPORARY VIEW view_name;` 来显示临时视图的 DDL。

### 语法 \{#temporary-views-syntax\}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

`OR REPLACE` **不**支持用于临时视图（与临时表的行为保持一致）。如果你需要“替换”临时视图，请先将其删除，然后再创建一次。


### 示例 \{#temporary-views-examples\}

创建一个临时源表以及基于该表的临时视图：

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

显示其 DDL：

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

将其删除：

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```


### 不允许的用法 / 限制 \\{#temporary-views-limitations\\}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **不允许**（请使用 `DROP` + `CREATE`）。
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **不允许**。
* `CREATE TEMPORARY VIEW db.view AS ...` → **不允许**（不支持数据库限定名）。
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **不允许**（临时对象是会话本地的）。
* `POPULATE`、`REFRESH`、`TO [db.table]`、内部引擎以及所有 MV 特有子句 → 对临时视图**不适用**。

### 关于分布式查询的说明 \\{#temporary-views-distributed-notes\\}

临时**视图**仅是一个定义，本身不包含需要传输的数据。如果你的临时视图引用了临时**表**（例如 `Memory`），那么在分布式查询执行期间，它们的数据会像临时表一样被传输到远程服务器上。

#### 示例 \{#temporary-views-distributed-example\}

```sql
-- A session-scoped, in-memory table
CREATE TEMPORARY TABLE temp_ids (id UInt64) ENGINE = Memory;

INSERT INTO temp_ids VALUES (1), (5), (42);

-- A session-scoped view over the temp table (purely logical)
CREATE TEMPORARY VIEW v_ids AS
SELECT id FROM temp_ids;

-- Replace 'test' with your cluster name.
-- GLOBAL JOIN forces ClickHouse to *ship* the small join-side (temp_ids via v_ids)
-- to every remote server that executes the left side.
SELECT count()
FROM cluster('test', system.numbers) AS n
GLOBAL ANY INNER JOIN v_ids USING (id)
WHERE n.number < 100;

```
