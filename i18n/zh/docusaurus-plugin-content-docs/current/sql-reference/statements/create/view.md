import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# CREATE VIEW

创建一个新的视图。视图可以是 [普通](#normal-view)、[物化](#materialized-view)、[可刷新的物化](#refreshable-materialized-view) 和 [窗口](/sql-reference/statements/create/view#window-view)（可刷新的物化视图和窗口视图是实验性功能）。

## Normal View {#normal-view}

语法：

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

普通视图不存储任何数据。每次访问时，它们只是从另一个表中读取数据。换句话说，普通视图只是一个保存的查询。当从视图中读取数据时，这个保存的查询被用作 [FROM](../../../sql-reference/statements/select/from.md) 子句中的子查询。

例如，假设您创建了一个视图：

```sql
CREATE VIEW view AS SELECT ...
```

并编写了一个查询：

```sql
SELECT a, b, c FROM view
```

这个查询与使用子查询的方式完全等价：

```sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

参数化视图类似于普通视图，但可以创建参数而这些参数不会立即解析。这些视图可以与表函数一起使用，它们将视图的名称作为函数名，将参数值作为参数。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上述语句创建了一个表的视图，该视图可以通过替换参数如下所示作为表函数使用。

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
这里是使用 [物化视图](/guides/developer/cascading-materialized-views.md) 的逐步指南。
:::

物化视图存储通过相应的 [SELECT](../../../sql-reference/statements/select/index.md) 查询转换的数据。

创建物化视图时如果不使用 `TO [db].[table]`，则必须指定 `ENGINE`——用于存储数据的表引擎。

创建物化视图时如果使用 `TO [db].[table]`，则不能同时使用 `POPULATE`。

物化视图的实现方式如下：当向 `SELECT` 中指定的表插入数据时，插入的数据的一部分通过该 `SELECT` 查询进行转换，结果被插入到视图中。

:::note
ClickHouse 中的物化视图在插入目标表时使用 **列名** 而不是列顺序。如果某些列名在 `SELECT` 查询结果中不存在，ClickHouse 会使用默认值，即使该列并非 [Nullable](../../data-types/nullable.md)。一种安全的做法是在使用物化视图时为每一列添加别名。

ClickHouse 中的物化视图的实现更像是插入触发器。如果视图查询中有聚合，则仅对新插入的数据批次应用聚合。对源表现有数据（如更新、删除、丢弃分区等）的任何更改不会更改物化视图。

在发生错误的情况下，ClickHouse 中的物化视图没有确定性行为。这意味着已经写入的块将保留在目标表中，但错误之后的所有块将不会被写入。

默认情况下，如果向视图之一的推送失败，则 INSERT 查询也将失败，并且某些块可能未被写入目标表。这可以通过使用 `materialized_views_ignore_errors` 设置进行更改（您应该将其设置为 INSERT 查询），如果您将 `materialized_views_ignore_errors=true`，则在向视图推送时的任何错误将被忽略，所有块将被写入目标表。

还要注意，`materialized_views_ignore_errors` 默认设置为 `true` 用于 `system.*_log` 表。
:::

如果您指定了 `POPULATE`，则在创建视图时现有表数据会插入到视图中，就像执行`CREATE TABLE ... AS SELECT ...`。否则，该查询仅包含在创建视图后插入到表中的数据。我们 **不推荐** 使用 `POPULATE`，因为在视图创建期间插入到表中的数据将不会插入到视图中。

:::note
鉴于 `POPULATE` 像 `CREATE TABLE ... AS SELECT ...` 一样工作，因此它有一些限制：
- 不支持在复制数据库中使用
- 不支持在 ClickHouse 云中使用

相反，可以使用单独的 `INSERT ... SELECT`。
:::

一个 `SELECT` 查询可以包含 `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`。请注意，相应的转换在每个插入数据块上独立执行。例如，如果设置了 `GROUP BY`，则在插入期间对数据进行聚合，但仅在单个插入数据包内。数据不会进一步聚合。例外情况是使用独立执行数据聚合的引擎，例如 `SummingMergeTree`。

对物化视图执行 [ALTER](/sql-reference/statements/alter/view.md) 查询有一些限制，例如，不能更新 `SELECT` 查询，因此这可能会导致不便。如果物化视图使用结构 `TO [db.]name`，则可以 `DETACH` 视图，针对目标表运行 `ALTER`，然后 `ATTACH` 之前分离的（`DETACH`）视图。

请注意，物化视图受 [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 设置的影响。数据在插入视图之前进行合并。

视图看起来与普通表相同。例如，它们包含在 `SHOW TABLES` 查询的结果中。

要删除视图，请使用 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)。虽然 `DROP TABLE` 也可以适用于 VIEW。

## SQL security {#sql_security}

`DEFINER` 和 `SQL SECURITY` 允许您指定在执行视图基础查询时使用哪个 ClickHouse 用户。
`SQL SECURITY` 有三个合法值： `DEFINER`，`INVOKER`，或 `NONE`。您可以在 `DEFINER` 子句中指定任何现有用户或 `CURRENT_USER`。

下表将解释哪些用户需要哪些权限才能从视图中选择。
请注意，无论 SQL 安全选项如何，在任何情况下都需要执行 `GRANT SELECT ON <view>` 才能读取它。

| SQL security option | View                                                            | Materialized View                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice` 必须对视图的源表具有 `SELECT` 权限。                    | `alice` 必须对视图的源表具有 `SELECT` 权限，并且对视图的目标表具有 `INSERT` 权限。                            |
| `INVOKER`           | 用户必须对视图的源表具有 `SELECT` 权限。                        | `SQL SECURITY INVOKER` 不能为物化视图指定。                                                                        |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE` 是一个已弃用的选项。任何具有创建使用 `SQL SECURITY NONE` 视图权限的用户都将能够执行任何任意查询。
因此，需要执行 `GRANT ALLOW SQL SECURITY NONE TO <user>` 才能创建具有此选项的视图。
:::

如果未指定 `DEFINER`/`SQL SECURITY`，则使用默认值：
- `SQL SECURITY`：普通视图为 `INVOKER`，物化视图为 `DEFINER`（[通过设置可配置](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`：`CURRENT_USER`（[通过设置可配置](../../../operations/settings/settings.md#default_view_definer)）

如果一个视图在未指定 `DEFINER`/`SQL SECURITY` 的情况下被附加，则默认值为物化视图的 `SQL SECURITY NONE` 和普通视图的 `SQL SECURITY INVOKER`。

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

该功能已弃用，将来会被移除。

为方便起见，旧文档位于 [这里](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)

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
其中 `interval` 是一系列简单的时间间隔：
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期运行相应的查询并将结果存储在表中。
 * 如果查询中说 `APPEND`，则每次刷新都将行插入表中，而不删除现有行。插入不是原子的，就像常规的 INSERT SELECT 一样。
 * 否则，每次刷新原子性地替换表的先前内容。

与常规不可刷新的物化视图的区别：
 * 没有插入触发器。即，当新数据插入到在 SELECT 中指定的表中时，它不会自动推送到可刷新的物化视图。定期刷新将运行整个查询。
 * 对 SELECT 查询没有限制。允许使用表函数（例如 `url()`）、视图、UNION、JOIN。

:::note
查询的 `REFRESH ... SETTINGS` 部分中的设置是刷新设置（例如 `refresh_retries`），与常规设置（例如 `max_threads`）不同。常规设置可以通过查询末尾的 `SETTINGS` 指定。
:::

### Refresh Schedule {#refresh-schedule}

示例刷新时间表：
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

在给定视图的情况下，最多可以同时运行一次刷新的过程。例如，如果一个 `REFRESH EVERY 1 MINUTE` 的视图刷新的时间为 2 分钟，那么它将每 2 分钟刷新一次。如果后来的刷新时间为 10 秒，它将恢复为每分钟刷新一次。（特别是，它不会每 10 秒刷新一次，来赶上错过的刷新——没有这样的积压。）

此外，在创建物化视图后立即启动刷新，除非在 `CREATE` 查询中指定了 `EMPTY`。如果指定了 `EMPTY`，则第一次刷新将根据时间表进行。

### In Replicated DB {#in-replicated-db}

如果可刷新的物化视图位于 [复制的数据库](../../../engines/database-engines/replicated.md) 中，副本之间协调，以便在每个计划时间段仅有一个副本执行刷新。需要 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 表引擎，以便所有副本都看到刷新产生的数据。

在 `APPEND` 模式下，通过使用 `SETTINGS all_replicas = 1` 可以禁用协调。这使得副本独立地执行刷新。在这种情况下，不需要 ReplicatedMergeTree。

在非 `APPEND` 模式下，仅支持协调刷新的工作。在没有协调的情况下，请使用 `Atomic` 数据库并使用 `CREATE ... ON CLUSTER` 查询在所有副本上创建可刷新的物化视图。

协调通过 Keeper 完成。znode 路径由 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 服务器设置决定。

### Dependencies {#refresh-dependencies}

`DEPENDS ON` 同步不同表的刷新。举例来说，假设有一系列两个可刷新的物化视图：
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
若没有 `DEPENDS ON`，两个视图将在午夜开始刷新，`destination` 通常会看到 `source` 昨天的数据。如果我们添加依赖关系：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
则 `destination` 的刷新仅会在 `source` 的刷新完成后开始，因此 `destination` 将基于新鲜数据。

或者，可以通过以下语句获得相同的结果：
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
其中 `1 HOUR` 可以是任何小于 `source` 的刷新的时间段。依赖表不会比其任何依赖项刷新更频繁。这是在不多次指定实际刷新周期的情况下设置可刷新的视图链的有效方法。

还有更多示例：
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）依赖于 `REFRESH EVERY 1 DAY`（`source`）<br/>
   如果 `source` 的刷新时间超过 10 分钟，`destination` 将等待。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR` 依赖于 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br/>
   与上面相似，即使相应的刷新发生在不同的日历日。
   `destination` 在 X+1 天的刷新会等待 X 天的 `source` 刷新（如果超过 2 小时）。
 * `REFRESH EVERY 2 HOUR` 依赖于 `REFRESH EVERY 1 HOUR`<br/>
   每隔一小时，2 小时的刷新在 1 小时的刷新之后发生，例如在凌晨刷新之后，然后在早上 2 点的刷新之后等。
 * `REFRESH EVERY 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
   `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
   `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH AFTER 2 HOUR`<br/>
   `destination` 在每个 `source` 刷新后刷新一次，即每 2 小时执行一次。`1 MINUTE` 被有效忽略。
 * `REFRESH AFTER 1 HOUR` 依赖于 `REFRESH AFTER 1 HOUR`<br/>
   当前不推荐这样做。

:::note
`DEPENDS ON` 仅在可刷新的物化视图之间有效。在 `DEPENDS ON` 列表中列出常规表将防止视图刷新（可以使用 `ALTER` 移除依赖）。
:::

### Settings {#settings}

可用的刷新设置：
 * `refresh_retries` - 刷新查询如果因异常失败，重试的次数。如果所有重试都失败，则跳到下一个计划的刷新时间。0 表示不重试，-1 表示无限重试。默认值：0。
 * `refresh_retry_initial_backoff_ms` - 如果 `refresh_retries` 不为零，第一次重试前的延迟。每个后续重试都会将延迟加倍，最多到 `refresh_retry_max_backoff_ms`。默认值：100 毫秒。
 * `refresh_retry_max_backoff_ms` - 刷新尝试之间延迟的指数增长限制。默认值：60000 毫秒（1 分钟）。

### Changing Refresh Parameters {#changing-refresh-parameters}

要更改刷新参数：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
这会一次性替换 *所有* 刷新参数：时间表、依赖关系、设置和 APPEND 状态。例如，如果表有 `DEPENDS ON`，执行不带 `DEPENDS ON` 的 `MODIFY REFRESH` 将移除依赖关系。
:::

### Other operations {#other-operations}

所有可刷新的物化视图的状态在表 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 中可用。尤其是，它包含刷新进度（如果正在进行），上一次及下次刷新时间，如果刷新失败则包含异常消息。

要手动停止、开始、触发或取消刷新，请使用 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)。

要等待刷新完成，请使用 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)。特别是，等待创建视图后的初始刷新的完成非常有用。

:::note
有趣的是：刷新查询被允许从正在刷新的视图中读取数据，看到数据的预刷新版本。这意味着您可以实现康威的生命游戏：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
这是一个实验性特性，未来的版本可能会以向后不兼容的方式发生变化。使用 [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 设置启用窗口视图和 `WATCH` 查询的使用。输入命令 `set allow_experimental_window_view = 1`。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

窗口视图可以按时间窗口聚合数据，并在窗口准备好触发时输出结果。它将在内部（或指定）表中存储部分聚合结果，以减少延迟，并可以将处理结果推送到指定的表或使用 WATCH 查询推送通知。

创建窗口视图与创建 `MATERIALIZED VIEW` 类似。窗口视图需要一个内部存储引擎来存储中间数据。可通过 `INNER ENGINE` 子句指定内部存储引擎，窗口视图将使用 `AggregatingMergeTree` 作为默认内部引擎。

创建窗口视图时如果不使用 `TO [db].[table]`，则必须指定 `ENGINE`——用于存储数据的表引擎。

### Time Window Functions {#time-window-functions}

[时间窗口函数](../../functions/time-window-functions.md)用于获取记录的下边界和上边界。窗口视图需要与时间窗口函数一起使用。

### TIME ATTRIBUTES {#time-attributes}

窗口视图支持 **处理时间** 和 **事件时间** 处理。

**处理时间** 允许窗口视图基于本地机器的时间生成结果，并且默认情况下使用它。这是最直接的时间概念，但不提供确定性。处理时间属性可以通过将时间窗口函数的 `time_attr` 设置为表列或使用函数 `now()` 来定义。以下查询创建了一个使用处理时间的窗口视图。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**事件时间** 是每个单独事件发生在其生成设备上的时间。这个时间通常在记录生成时嵌入其中。事件时间处理即使在出现无序事件或迟到事件的情况下也允许一致的结果。窗口视图通过使用 `WATERMARK` 语法来支持事件时间处理。

窗口视图提供了三种水印策略：

* `STRICTLY_ASCENDING`：发出当前最大观察到的时间戳的水印。时间戳小于最大时间戳的行不是迟到的。
* `ASCENDING`：发出当前最大观察到的时间戳减去 1 的水印。时间戳等于或小于最大时间戳的行不是迟到的。
* `BOUNDED`：WATERMARK=INTERVAL。发出水印，即当前最大观察到的时间戳减去指定的延迟。

以下查询是创建带有 `WATERMARK` 的窗口视图示例：

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

默认情况下，窗口将在水印到达时触发，水印后到达的元素将被丢弃。窗口视图通过设置 `ALLOWED_LATENESS=INTERVAL` 来支持迟到事件处理。迟到处理的示例为：

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

注意，迟到触发发出的元素应被视为先前计算的更新结果。窗口视图将在迟到事件到达时立即触发，而不是在窗口结束时触发。因此，导致同一窗口产生多个输出。用户需要考虑这些重复结果或对其进行去重。

您可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改在窗口视图中指定的 `SELECT` 查询。导致新 `SELECT` 查询的数据结构应与原始 `SELECT` 查询相同，无论是否附带 `TO [db.]name` 子句。请注意，当前窗口中的数据将丢失，因为中间状态无法重用。

### Monitoring New Windows {#monitoring-new-windows}

窗口视图支持 [WATCH](../../../sql-reference/statements/watch.md) 查询来监控更改，或使用 `TO` 语法将结果输出到表中。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH` 查询的作用与 `LIVE VIEW` 类似。可以指定 `LIMIT` 来设置接收更新的数量，然后终止查询。`EVENTS` 子句可以用来获取 `WATCH` 查询的简短形式，在该形式中，您将只获得最新的查询水印，而不是查询结果。

### Settings {#settings-1}

- `window_view_clean_interval`：窗口视图的清理间隔（以秒为单位），以释放过期数据。系统将保留尚未根据系统时间或 `WATERMARK` 配置完全触发的窗口，其他数据将被删除。
- `window_view_heartbeat_interval`：以秒为单位的心跳间隔，以指示监视查询仍然有效。
- `wait_for_window_view_fire_signal_timeout`：在事件时间处理中等待窗口视图触发信号的超时。

### Example {#example}

假设我们需要在一个名为 `data` 的日志表中每 10 秒统计一次点击日志的数量，其表结构为：

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

首先，我们创建一个 10 秒间隔的时间窗口视图：

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

然后，我们使用 `WATCH` 查询来获取结果。

```sql
WATCH wv
```

当日志插入到表 `data` 中，

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 查询应输出如下结果：

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

另外，我们可以使用 `TO` 语法将输出附加到另一个表。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

在 ClickHouse 的有状态测试中可以找到更多示例（它们被命名为 `*window_view*`）。

### Window View Usage {#window-view-usage}

窗口视图在以下场景中非常有用：

* **监控**：按时间聚合和计算指标日志，并将结果输出到目标表。仪表板可以将目标表作为源表。
* **分析**：自动聚合和预处理时间窗口中的数据。这在分析大量日志时非常有用。预处理避免了多次查询中的重复计算并减少查询延迟。

## Related Content {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客：[使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
