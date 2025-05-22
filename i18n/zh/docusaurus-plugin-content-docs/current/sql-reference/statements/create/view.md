---
'description': 'CREATE VIEW 的文档'
'sidebar_label': 'VIEW'
'sidebar_position': 37
'slug': '/sql-reference/statements/create/view'
'title': 'CREATE VIEW'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW

创建一个新的视图。视图可以是 [普通视图](#normal-view)、[物化视图](#materialized-view)、[可刷新物化视图](#refreshable-materialized-view) 和 [窗口视图](/sql-reference/statements/create/view#window-view)（可刷新物化视图和窗口视图是实验性功能）。

## Normal View {#normal-view}

语法：

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

普通视图不存储任何数据。每次访问时，它仅从另一个表中读取数据。换句话说，普通视图不过是一个保存的查询。当从视图中读取数据时，这个保存的查询作为 [FROM](../../../sql-reference/statements/select/from.md) 子查询使用。

作为示例，假设您创建了一个视图：

```sql
CREATE VIEW view AS SELECT ...
```

并编写了一个查询：

```sql
SELECT a, b, c FROM view
```

这个查询与使用子查询是完全等效的：

```sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

参数化视图与普通视图类似，但可以使用未立即解析的参数创建。这些视图可以与表函数一起使用，表函数将视图的名称指定为函数名称，参数值作为参数。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上述创建了一个可以通过替换参数作为表函数使用的视图，如下所示。

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```

## Materialized View {#materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
这里有关于使用 [物化视图](/guides/developer/cascading-materialized-views.md) 的逐步指南。
:::

物化视图存储由相应的 [SELECT](../../../sql-reference/statements/select/index.md) 查询转换的数据。

创建物化视图时，如果未使用 `TO [db].[table]`，则必须指定 `ENGINE`，即用于存储数据的表引擎。

创建物化视图时使用 `TO [db].[table]`，则不能同时使用 `POPULATE`。

物化视图的实现如下：当向 `SELECT` 中指定的表插入数据时，部分插入的数据会通过这个 `SELECT` 查询进行转换，结果插入到视图中。

:::note
ClickHouse 中的物化视图在插入目标表时使用 **列名** 而不是列顺序。如果某些列名在 `SELECT` 查询结果中不存在，ClickHouse 会使用默认值，即使该列不是 [Nullable](../../data-types/nullable.md)。安全的做法是在使用物化视图时为每一列添加别名。

ClickHouse 中的物化视图的实现更像是插入触发器。如果视图查询中有某些聚合，它仅应用于新插入数据的批次。对源表的任何现有数据的更改（如更新、删除、删除分区等）不会改变物化视图。

ClickHouse 中的物化视图在出现错误时没有确定性行为。这意味着已经写入的块会保留在目标表中，但错误之后的所有块将不会。

默认情况下，如果推送到某个视图失败，则 INSERT 查询也会失败，可能导致某些块未写入目标表。这可以通过 `materialized_views_ignore_errors` 设置来改变（您应该为 `INSERT` 查询设置此选项），如果将 `materialized_views_ignore_errors=true`，则在推送到视图时的任何错误将被忽略，所有块将被写入到目标表。

还要注意，`materialized_views_ignore_errors` 默认值为 `true`，适用于 `system.*_log` 表。
:::

如果您指定了 `POPULATE`，则在创建视图时，现有表数据将插入视图，就像执行 `CREATE TABLE ... AS SELECT ...` 一样。否则，查询仅包含在创建视图后插入到表中的数据。我们 **不推荐** 使用 `POPULATE`，因为在创建视图期间插入到表中的数据将不会插入其中。

:::note
由于 `POPULATE` 像 `CREATE TABLE ... AS SELECT ...` 一样工作，它有一些限制：
- 在复制数据库中不受支持
- 在 ClickHouse Cloud 中不受支持

可以使用单独的 `INSERT ... SELECT`。
:::

`SELECT` 查询可以包含 `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`。请注意，相应的转换在插入数据的每个块上是独立执行的。例如，如果设置了 `GROUP BY`，数据在插入期间被聚合，但仅在单个插入数据包内。数据不会进一步聚合。例外情况是使用能够独立执行数据聚合的 `ENGINE`，例如 `SummingMergeTree`。

对物化视图执行的 [ALTER](/sql-reference/statements/alter/view.md) 查询有一些限制，例如，您不能更新 `SELECT` 查询，因此这可能会带来不便。如果物化视图使用构造 `TO [db.]name`，您可以 `DETACH` 该视图，在目标表上运行 `ALTER`，然后 `ATTACH` 先前分离的（`DETACH`）视图。

请注意，物化视图受 [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 设置的影响。在插入到视图之前，数据会合并。

视图看起来和普通表一样。例如，它们在 `SHOW TABLES` 查询的结果中列出。

要删除一个视图，请使用 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)。虽然 `DROP TABLE` 同样适用于视图。

## SQL security {#sql_security}

`DEFINER` 和 `SQL SECURITY` 允许您指定执行视图底层查询时使用哪个 ClickHouse 用户。
`SQL SECURITY` 有三个合法值：`DEFINER`、`INVOKER` 或 `NONE`。您可以在 `DEFINER` 子句中指定任何现有用户或 `CURRENT_USER`。

下表将解释每个用户选择视图所需的权限。
请注意，不管 SQL 安全选项如何，在每种情况下，依然需要有 `GRANT SELECT ON <view>` 才能从中读取。

| SQL 安全选项      | 视图                                                            | 物化视图                                                                                                    |
|------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`  | `alice` 必须对视图的源表拥有 `SELECT` 授权。                   | `alice` 必须对视图的源表拥有 `SELECT` 授权，并对视图的目标表拥有 `INSERT` 授权。                        |
| `INVOKER`        | 用户必须对视图的源表拥有 `SELECT` 授权。                      | `SQL SECURITY INVOKER` 不能为物化视图指定。                                                                 |
| `NONE`           | -                                                               | -                                                                                                           |

:::note
`SQL SECURITY NONE` 是一个已弃用的选项。任何拥有创建视图权限的用户都可以执行任何任意查询。
因此，必须拥有 `GRANT ALLOW SQL SECURITY NONE TO <user>` 才能使用此选项创建视图。
:::

如果未指定 `DEFINER`/`SQL SECURITY`，则使用默认值：
- `SQL SECURITY`：普通视图为 `INVOKER`，物化视图为 `DEFINER`（[可通过设置配置](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`：`CURRENT_USER` （[可通过设置配置](../../../operations/settings/settings.md#default_view_definer)）

如果视图被附加且未指定 `DEFINER`/`SQL SECURITY`，则默认为物化视图的 `SQL SECURITY NONE` 和普通视图的 `SQL SECURITY INVOKER`。

要更改现有视图的 SQL 安全性，请使用
```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```

### Examples {#examples}
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

## Live View {#live-view}

<DeprecatedBadge/>

此功能已弃用，并将在未来删除。

为了方便您，旧文档位于 [此处](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)

## Refreshable Materialized View {#refreshable-materialized-view}

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
其中 `interval` 是一系列简单间隔：
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期运行相应的查询并将其结果存储在表中。
 * 如果查询指示 `APPEND`，每次刷新都会向表中插入行，而不会删除现有行。插入不是原子的，就像常规的 INSERT SELECT。
 * 否则每次刷新原子性地替换表的先前内容。

与常规不可刷新的物化视图的区别：
 * 无插入触发器。即，当新数据插入到 `SELECT` 中指定的表时，它不会自动推送到可刷新的物化视图中。定期刷新将运行整个查询。
 * 对 SELECT 查询没有限制。允许使用表函数（例如 `url()`）、视图、UNION、JOIN 等。

:::note
查询的 `REFRESH ... SETTINGS` 部分中的设置是刷新设置（例如 `refresh_retries`），与常规设置（例如 `max_threads`）不同。常规设置可以通过在查询末尾使用 `SETTINGS` 指定。
:::

### Refresh Schedule {#refresh-schedule}

示例刷新计划：
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

`RANDOMIZE FOR` 随机调整每次刷新的时间，例如：
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

在给定的视图中，每次最多只能运行一个刷新。例如，如果具有 `REFRESH EVERY 1 MINUTE` 的视图需要 2 分钟才能刷新，它将每 2 分钟刷新一次。如果之后变得更快并开始在 10 秒内刷新，它将恢复为每分钟刷新一次。（特别地，它不会每 10 秒刷新一次以赶上错过的刷新 - 并没有这样的积压。）

此外，在创建物化视图后，会立即启动刷新，除非在 `CREATE` 查询中指定了 `EMPTY`。如果指定了 `EMPTY`，则第一次刷新将按照计划进行。

### In Replicated DB {#in-replicated-db}

如果可刷新的物化视图位于 [复制数据库](../../../engines/database-engines/replicated.md) 中，则副本之间协调，以便每次计划时间仅有一个副本执行刷新。需要 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 表引擎，以便所有副本都能看到刷新的数据。

在 `APPEND` 模式下，可以使用 `SETTINGS all_replicas = 1` 禁用协调。这使副本独立进行刷新。在这种情况下，不需要 ReplicatedMergeTree。

在非 `APPEND` 模式下，仅支持协调刷新。对于未协调的情况，请使用 `Atomic` 数据库，并使用 `CREATE ... ON CLUSTER` 查询在所有副本上创建可刷新的物化视图。

协调是通过 Keeper 完成的。znode 路径通过 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 服务器设置确定。

### Dependencies {#refresh-dependencies}

`DEPENDS ON` 同步不同表的刷新。例如，假设有两个可刷新的物化视图的链：
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
如果没有 `DEPENDS ON`，则两个视图都将在午夜启动刷新，通常 `destination` 将看到 `source` 中昨天的数据。如果我们添加依赖关系：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
那么 `destination` 的刷新只会在 `source` 的刷新在当天完成后开始，从而使得 `destination` 基于新鲜的数据。

另外，可以通过以下方式获得相同的结果：
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
其中 `1 HOUR` 可以是任何少于 `source` 刷新周期的持续时间。依赖的表不会比其任何依赖项刷新得更频繁。这是一种有效的设置可刷新的视图链的方法，而无需多次指定实际刷新周期。

还有更多的例子：
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）依赖于 `REFRESH EVERY 1 DAY`（`source`）<br/>
   如果 `source` 刷新需要超过 10 分钟，则 `destination` 将等待它。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR` 依赖于 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br/>
   与上述相似，即使相应的刷新发生在不同的日历日。
   `destination` 在 X+1 日的刷新将等待 X 日的 `source` 刷新（如果超过 2 小时）。
 * `REFRESH EVERY 2 HOUR` 依赖于 `REFRESH EVERY 1 HOUR`<br/>
   2 小时刷新发生在每个小时的 1 小时刷新之后，例如在午夜
   刷新之后，然后在凌晨 2 点刷新等。
 * `REFRESH EVERY 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
   `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
   `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH AFTER 2 HOUR`<br/>
   `destination` 每次在每个 `source` 刷新后刷新一次，即每 2 小时刷新一次。`1 MINUTE` 实际上被忽略。
 * `REFRESH AFTER 1 HOUR` 依赖于 `REFRESH AFTER 1 HOUR`<br/>
   当前不推荐这种做法。

:::note
`DEPENDS ON` 仅适用于可刷新的物化视图。在 `DEPENDS ON` 列表中列出常规表将导致视图永远无法刷新（可以使用 `ALTER` 移除依赖）。
:::

### Settings {#settings}

可用的刷新设置：
 * `refresh_retries` - 如果刷新查询因异常而失败，则重试多少次。如果所有重试均失败，则跳到下一个计划的刷新时间。0 意味着不重试，-1 意味着无限重试。默认值：0。
 * `refresh_retry_initial_backoff_ms` - 如果 `refresh_retries` 不为零，则第一次重试之前的延迟。每个后续重试将延迟翻倍，直到 `refresh_retry_max_backoff_ms`。默认值：100 毫秒。
 * `refresh_retry_max_backoff_ms` - 刷新尝试之间延迟的指数增长的限制。默认值：60000 毫秒（1 分钟）。

### Changing Refresh Parameters {#changing-refresh-parameters}

要更改刷新参数：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
这会一次性替换 *所有* 刷新参数：计划、依赖关系、设置和 APPEND 属性。例如，如果表具有 `DEPENDS ON`，则在不带 `DEPENDS ON` 的情况下执行 `MODIFY REFRESH` 将删除依赖项。
:::

### Other operations {#other-operations}

所有可刷新的物化视图的状态可在表 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 中查看。特别地，它包含刷新进度（如果正在运行）、上一次和下一次刷新时间、出错时的异常消息。

要手动停止、启动、触发或取消刷新，请使用 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)。

要等待刷新完成，请使用 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)。特别适合在创建视图后等待初始刷新。

:::note
有趣的事实：刷新查询可以从正在刷新的视图中读取，看到预刷新版本的数据。这意味着您可以实现康威的生命游戏：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
这是一个实验性功能，未来的版本可能会以向后不兼容的方式进行更改。启用窗口视图和 `WATCH` 查询的使用，请使用 [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 设置。输入命令 `set allow_experimental_window_view = 1`。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

窗口视图可以按时间窗口聚合数据，并在窗口准备好时输出结果。它将部分聚合结果存储在一个内部（或指定的）表中，以减少延迟，并可以将处理结果推送到指定表或使用 WATCH 查询推送通知。

创建窗口视图类似于创建 `MATERIALIZED VIEW`。窗口视图需要一个内部存储引擎来存储中间数据。可以使用 `INNER ENGINE` 子句指定内部存储，窗口视图将使用 `AggregatingMergeTree` 作为默认内部引擎。

在没有 `TO [db].[table]` 的情况下创建窗口视图时，必须指定 `ENGINE`，即用于存储数据的表引擎。

### Time Window Functions {#time-window-functions}

[时间窗口函数](../../functions/time-window-functions.md) 用于获取记录的下限和上限窗口。窗口视图需要与时间窗口函数一起使用。

### TIME ATTRIBUTES {#time-attributes}

窗口视图支持 **处理时间** 和 **事件时间** 处理。

**处理时间** 使窗口视图能够根据本地机器的时间生成结果，并作为默认使用。这是时间的最直观概念，但不提供确定性。处理时间属性可以通过将时间窗口函数的 `time_attr` 设置为表列或使用 `now()` 函数来定义。以下查询创建了一个具有处理时间的窗口视图。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**事件时间** 是每个独立事件在其产生设备上发生的时间。此时间通常在生成时嵌入到记录中。事件时间处理允许在事件顺序混乱或事件延迟的情况下提供一致的结果。窗口视图通过使用 `WATERMARK` 语法支持事件时间处理。

窗口视图提供三种水位线策略：

* `STRICTLY_ASCENDING`：发出到目前为止观察到的最大时间戳的水位线。时间戳小于最大时间戳的行不会被视为延迟。
* `ASCENDING`：发出到目前为止观察到的最大时间戳减去 1 的水位线。时间戳等于或小于最大时间戳的行不会被视为延迟。
* `BOUNDED`：WATERMARK=INTERVAL。发出水位线，即最大观察到的时间戳减去指定延迟。

以下查询是使用 `WATERMARK` 创建窗口视图的示例：

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

默认情况下，当水位线到达时窗口将被触发，已到达水位线的元素将被丢弃。窗口视图通过设置 `ALLOWED_LATENESS=INTERVAL` 支持延迟事件处理。延迟处理的示例如下：

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

请注意，由延迟触发发出的元素应视为先前计算的更新结果。窗口视图将在延迟事件到达时立即触发，而不是在窗口结束时触发。因此，它将导致同一窗口的多次输出。用户需要考虑这些重复结果或对其进行去重。

您可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改在窗口视图中指定的 `SELECT` 查询。生成的新 `SELECT` 查询的数据结构应与原始 `SELECT` 查询的数据结构相同，无论是否带有 `TO [db.]name` 子句。请注意，由于中间状态无法重用，当前窗口中的数据将丢失。

### Monitoring New Windows {#monitoring-new-windows}

窗口视图支持 [WATCH](../../../sql-reference/statements/watch.md) 查询以监控更改，或使用 `TO` 语法将结果输出到表中。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH` 查询的作用类似于 `LIVE VIEW`。可以指定 `LIMIT` 来设置在终止查询之前接收更新的数量。可以使用 `EVENTS` 子句获取 `WATCH` 查询的简短形式，其中您将仅获得最新的查询水位线，而不是查询结果。

### Settings {#settings-1}

- `window_view_clean_interval`：窗口视图的清理间隔（以秒为单位）以释放过时数据。系统将保留根据系统时间或 `WATERMARK` 配置未完全触发的窗口，其他数据将被删除。
- `window_view_heartbeat_interval`：以秒为单位的心跳间隔，以指示观察查询处于活动状态。
- `wait_for_window_view_fire_signal_timeout`：等待事件时间处理中的窗口视图触发信号的超时。

### Example {#example}

假设我们需要计算一个日志表中每 10 秒的点击日志数量，其表结构为：

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

首先，我们创建一个具有 10 秒间隔的窗口视图：

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

然后，我们使用 `WATCH` 查询获取结果。

```sql
WATCH wv
```

当日志插入到表 `data` 中时，

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 查询应该打印如下结果：

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

另外，我们可以使用 `TO` 语法将输出附加到另一个表。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

在 ClickHouse 的状态测试中可以找到其他示例（它们被命名为 `*window_view*`）。

### Window View Usage {#window-view-usage}

窗口视图在以下场景中非常有用：

* **监控**：按时间聚合和计算指标日志，并将结果输出到目标表。仪表板可以使用目标表作为源表。
* **分析**：自动聚合和预处理时间窗口中的数据。当分析大量日志时，这会很有用。预处理消除了多个查询中的重复计算，并减少了查询延迟。

## Related Content {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客：[使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
