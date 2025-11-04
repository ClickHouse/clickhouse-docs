---
'description': 'CREATE VIEW 的文档'
'sidebar_label': 'VIEW'
'sidebar_position': 37
'slug': '/sql-reference/statements/create/view'
'title': 'CREATE VIEW'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# 创建视图

创建一个新的视图。视图可以是 [普通](#normal-view)、[物化](#materialized-view)、[可刷新的物化](#refreshable-materialized-view) 和 [窗口](/sql-reference/statements/create/view#window-view)。

## 普通视图 {#normal-view}

语法：

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

普通视图不存储任何数据。它们仅在每次访问时执行从另一个表的读取。换句话说，普通视图只是一个保存的查询。当从视图中读取数据时，这个保存的查询作为子查询在 [FROM](../../../sql-reference/statements/select/from.md) 子句中使用。

例如，假设您创建了一个视图：

```sql
CREATE VIEW view AS SELECT ...
```

并编写了一个查询：

```sql
SELECT a, b, c FROM view
```

这个查询完全等价于使用子查询：

```sql
SELECT a, b, c FROM (SELECT ...)
```

## 带参数视图 {#parameterized-view}

带参数视图类似于普通视图，但可以创建时带有未立即解析的参数。这些视图可以与表函数一起使用，其指定视图名称作为函数名称，参数值作为其参数。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上述创建了一个可以通过如下面所示的方式替换参数的表函数的视图。

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```

## 物化视图 {#materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
这是使用 [物化视图](/guides/developer/cascading-materialized-views.md) 的逐步指导。
:::

物化视图存储通过相应的 [SELECT](../../../sql-reference/statements/select/index.md) 查询转换的数据。

在没有 `TO [db].[table]` 的情况下创建物化视图时，您必须指定 `ENGINE` – 用于存储数据的表引擎。

在使用 `TO [db].[table]` 创建物化视图时，您不能同时使用 `POPULATE`。

物化视图的实现方式如下：当向在 `SELECT` 中指定的表插入数据时，部分插入的数据通过此 `SELECT` 查询转换，并将结果插入视图。

:::note
ClickHouse 中的物化视图使用 **列名** 而不是列的顺序在目标表中插入数据。如果在 `SELECT` 查询结果中没有某些列名，ClickHouse 将使用默认值，即使该列不是 [Nullable](../../data-types/nullable.md)。在使用物化视图时，安全的做法是为每个列添加别名。

ClickHouse 中的物化视图更像是插入触发器的实现。如果视图查询中有某些聚合，它仅应用于批量新插入的数据。对源表的现有数据的任何更改（例如更新、删除、丢弃分区等）不会改变物化视图。

ClickHouse 中的物化视图在发生错误时没有确定性行为。这意味着已经写入的块将在目标表中保留，但错误后的所有块将不保留。

默认情况下，如果推送到某个视图失败，则 INSERT 查询也将失败，某些块可能不会写入目标表。可以通过使用 `materialized_views_ignore_errors` 设置来更改此行为（应为 `INSERT` 查询设置该选项），如果您设置 `materialized_views_ignore_errors=true`，那么在向视图推送时的任何错误将被忽略，所有块将被写入目标表。

还要注意，`materialized_views_ignore_errors` 在 `system.*_log` 表中默认设置为 `true`。
:::

如果指定了 `POPULATE`，则在创建视图时，现有表数据将插入到视图中，类似于执行 `CREATE TABLE ... AS SELECT ...`。否则，查询仅包含在创建视图后插入到表中的数据。我们 **不推荐** 使用 `POPULATE`，因为在创建视图期间插入到表中的数据将不会插入该视图。

:::note
由于 `POPULATE` 的作用类似于 `CREATE TABLE ... AS SELECT ...`，它有以下限制：
- 不支持复制数据库
- 不支持 ClickHouse 云

可以使用单独的 `INSERT ... SELECT`。
:::

`SELECT` 查询可以包含 `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`。注意，相应的转换在插入的每个块上独立执行。例如，如果设置了 `GROUP BY`，则数据在插入过程中进行聚合，但仅在单个插入数据包中。数据不会进一步聚合。例外情况是使用独立执行数据聚合的 `ENGINE`，例如 `SummingMergeTree`。

对物化视图执行 [ALTER](/sql-reference/statements/alter/view.md) 查询时有限制，例如，不能更新 `SELECT` 查询，因此这可能不方便。如果物化视图使用了 `TO [db.]name` 的构造，则可以 `DETACH` 视图，为目标表运行 `ALTER`，然后 `ATTACH` 先前分离的 (`DETACH`) 视图。

请注意，物化视图受 [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 设置的影响。数据在插入视图之前会被合并。

视图看起来与普通表相同。例如，它们在 `SHOW TABLES` 查询的结果中列出。

要删除视图，请使用 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)。尽管 `DROP TABLE` 对视图也有效。

## SQL 安全性 {#sql_security}

`DEFINER` 和 `SQL SECURITY` 允许您指定执行视图底层查询时使用哪个 ClickHouse 用户。
`SQL SECURITY` 有三个合法值：`DEFINER`、`INVOKER` 或 `NONE`。您可以在 `DEFINER` 子句中指定任何现有用户或 `CURRENT_USER`。

以下表格将解释每个用户选择视图所需的权限。
请注意，无论 SQL 安全性选项如何，在每种情况下仍然需要有 `GRANT SELECT ON <view>` 才能读取。

| SQL 安全性选项 | 视图                                                            | 物化视图                                                                                                   |
|-------------------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`   | `alice` 必须对视图的源表具有 `SELECT` 授权。                  | `alice` 必须对视图的源表具有 `SELECT` 授权，以及对视图目标表具有 `INSERT` 授权。                         |
| `INVOKER`         | 用户必须对视图的源表具有 `SELECT` 授权。                      | `SQL SECURITY INVOKER` 不能为物化视图指定。                                                                   |
| `NONE`            | -                                                               | -                                                                                                         |

:::note
`SQL SECURITY NONE` 是一个已弃用的选项。任何具有使用 `SQL SECURITY NONE` 创建视图的权限的用户都能够执行任何任意查询。
因此，要求有 `GRANT ALLOW SQL SECURITY NONE TO <user>` 才能创建具有此选项的视图。
:::

如果未指定 `DEFINER` / `SQL SECURITY`，则使用默认值：
- `SQL SECURITY`：对于普通视图为 `INVOKER`，对于物化视图为 `DEFINER`（[通过设置可配置](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`：`CURRENT_USER`（[通过设置可配置](../../../operations/settings/settings.md#default_view_definer)）

如果视图在未指定 `DEFINER` / `SQL SECURITY` 的情况下被附加，则默认值为物化视图的 `SQL SECURITY NONE` 和普通视图的 `SQL SECURITY INVOKER`。

要更改现有视图的 SQL 安全性，请使用
```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```

### 示例 {#examples}
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

## 实时视图 {#live-view}

<DeprecatedBadge/>

此功能已弃用，并将在未来删除。

为了您的方便，旧文档位于 [这里](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)

## 可刷新的物化视图 {#refreshable-materialized-view}

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
* 如果查询中说 `APPEND`，则每次刷新将向表中插入行，而不会删除现有行。插入不是原子性的，类似于常规的 INSERT SELECT。
* 否则，每次刷新会原子性地替换表的先前内容。
与常规的不可刷新物化视图的区别：
* 没有插入触发器。即当新数据插入于 SELECT 指定的表中时，它不会自动推送到可刷新的物化视图。定期刷新的运行将整个查询运行。* SELECT 查询没有限制。表函数（例如 `url()`）、视图、UNION、JOIN 均被允许。

:::note
查询中 `REFRESH ... SETTINGS` 部分的设置是刷新设置（例如 `refresh_retries`），与常规设置（例如 `max_threads`）不同。常规设置可以在查询末尾使用 `SETTINGS` 指定。
:::

### 刷新计划 {#refresh-schedule}

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

一次最多只能运行一个刷新，针对给定视图。例如，如果具有 `REFRESH EVERY 1 MINUTE` 的视图需要 2 分钟刷新，它只会每 2 分钟刷新一次。如果刷新速度更快并开始在 10 秒内刷新的话，它将恢复到每分钟刷新一次。（特别是，它不会每 10 秒刷新一次以追赶错过的刷新 - 没有这样的积压。）

此外，在创建物化视图后，刷新会立即启动，除非在 `CREATE` 查询中指定了 `EMPTY`。如果指定了 `EMPTY`，第一次刷新会根据计划进行。

### 在复制数据库中 {#in-replicated-db}

如果可刷新的物化视图位于 [复制数据库](../../../engines/database-engines/replicated.md) 中，副本之间相互协调，以便每次调度时只有一个副本执行刷新。要求使用 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 表引擎，以便所有副本都能看到由刷新生成的数据。

在 `APPEND` 模式下，可以使用 `SETTINGS all_replicas = 1` 禁用协调。这使得副本独立执行刷新。在这种情况下，无需使用 ReplicatedMergeTree。

在非 `APPEND` 模式下，仅支持协调刷新。对于不协调的情况，使用 `Atomic` 数据库和 `CREATE ... ON CLUSTER` 查询在所有副本上创建可刷新的物化视图。

协调通过 Keeper 完成。znode 路径由 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 服务器设置确定。

### 依赖 {#refresh-dependencies}

`DEPENDS ON` 同步不同表的刷新。例如，假设有一链两个可刷新的物化视图：
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
没有 `DEPENDS ON`，两个视图将在午夜开始刷新，`destination` 通常会看到 `source` 中昨天的数据。如果我们添加依赖：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
然后 `destination` 的刷新将仅在 `source` 的刷新在那天完成后开始，因此 `destination` 将基于新鲜的数据。

另外，可以通过使用以下方式实现相同的结果：
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
其中 `1 HOUR` 可以是任何少于 `source` 刷新周期的持续时间。依赖表的刷新频率不会超过其依赖项。这是在不多次指定实际刷新周期的情况下设置可刷新的视图链的有效方式。

再举几个例子：
* `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）依赖于 `REFRESH EVERY 1 DAY`（`source`）<br/>
  如果 `source` 刷新耗时超过 10 分钟，则 `destination` 将等待它。
* `REFRESH EVERY 1 DAY OFFSET 1 HOUR` 依赖于 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br/>
  类似于上面，尽管相应的刷新发生在不同的日历天。
  `destination` 在第 X+1 天的刷新将等待 `source` 在第 X 天的刷新（如果需要超过 2 小时）。
* `REFRESH EVERY 2 HOUR` 依赖于 `REFRESH EVERY 1 HOUR`<br/>
  2 小时的刷新会在每小时的 1 小时刷新之后发生，例如在午夜刷新之后，然后在凌晨 2 点刷新等。
* `REFRESH EVERY 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
  `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
  `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH AFTER 2 HOUR`<br/>
  `destination` 在每次 `source` 刷新后刷新一次，即每 2 小时刷新一次。`1 MINUTE` 实际上被忽略。
* `REFRESH AFTER 1 HOUR` 依赖于 `REFRESH AFTER 1 HOUR`<br/>
  目前不推荐这样做。

:::note
`DEPENDS ON` 仅在可刷新的物化视图之间有效。在 `DEPENDS ON` 列表中列出常规表将阻止该视图刷新（依赖项可通过 `ALTER` 删除，见下文）。
:::

### 设置 {#settings}

可用的刷新设置：
* `refresh_retries` - 如果刷新查询因异常失败，要重试多少次。如果所有重试失败，则跳到下一个调度刷新时间。0 意味着不重试，-1 意味着无限重试。默认值：0。
* `refresh_retry_initial_backoff_ms` - 第一次重试之前的延迟，如果 `refresh_retries` 不为零。每次后续重试都会将延迟加倍，直到达到 `refresh_retry_max_backoff_ms`。默认值：100 毫秒。
* `refresh_retry_max_backoff_ms` - 刷新尝试之间延迟的指数增长限制。默认值：60000 毫秒（1 分钟）。

### 更改刷新参数 {#changing-refresh-parameters}

要更改刷新参数：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
这将一次替换 *所有* 刷新参数：计划、依赖关系、设置和 APPEND 状态。例如，如果表有 `DEPENDS ON`，则在不包含 `DEPENDS ON` 的情况下执行 `MODIFY REFRESH` 将删除依赖关系。
:::

### 其他操作 {#other-operations}

所有可刷新的物化视图的状态可在表 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 中查看。特别是，它包含刷新进度（如果正在运行）、最后一次和下一次刷新时间、如果刷新失败则显示异常消息。

要手动停止、启动、触发或取消刷新，请使用 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)。

要等待刷新完成，请使用 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)。特别是，有助于在创建视图后等待初次刷新。

:::note
有趣的是：刷新查询被允许从正在刷新的视图中读取，查看预刷新版本的数据。这意味着您可以实现康威的生命游戏：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## 窗口视图 {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
这是一个实验性功能，可能会在未来的版本中发生向后不兼容的变化。通过 [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 设置启用使用窗口视图和 `WATCH` 查询。输入命令 `set allow_experimental_window_view = 1`。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

窗口视图可以通过时间窗口聚合数据，并在窗口准备好时输出结果。它将部分聚合结果存储在内部（或指定）表中以减少延迟，并可以将处理结果推送到指定表或使用 WATCH 查询推送通知。

创建窗口视图类似于创建 `MATERIALIZED VIEW`。窗口视图需要一个内部存储引擎来存储中间数据。可以通过使用 `INNER ENGINE` 子句指定内部存储，窗口视图将默认使用 `AggregatingMergeTree` 作为内部引擎。

在没有 `TO [db].[table]` 的情况下创建窗口视图时，您必须指定 `ENGINE` – 用于存储数据的表引擎。

### 时间窗口函数 {#time-window-functions}

[时间窗口函数](../../functions/time-window-functions.md) 用于获取记录的下限和上限窗口。窗口视图需要与时间窗口函数一起使用。

### 时间属性 {#time-attributes}

窗口视图支持 **处理时间** 和 **事件时间** 处理。

**处理时间** 允许窗口视图基于本地机器的时间生成结果，默认使用。它是对时间的最简单的概念，但并不提供确定性。处理时间属性可以通过将时间窗口函数的 `time_attr` 设置为表列或使用函数 `now()` 定义。以下查询创建一个带处理时间的窗口视图。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**事件时间** 是每个单独事件在其产生设备上发生的时间。此时间通常在生成时嵌入到记录中。事件时间处理允许在事件乱序或延迟的情况下获得一致的结果。窗口视图通过使用 `WATERMARK` 语法支持事件时间处理。

窗口视图提供三种水印策略：

* `STRICTLY_ASCENDING`：发出迄今为止观察到的最大时间戳的水印。时间戳小于最大时间戳的行不算晚到。
* `ASCENDING`：发出迄今为止观察到的最大时间戳减去 1 的水印。时间戳等于或小于最大时间戳的行不算晚到。
* `BOUNDED`：WATERMARK=INTERVAL。发出水印，即最大观察到的时间戳减去指定的延迟。

以下查询是创建带 `WATERMARK` 的窗口视图的示例：

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

默认情况下，当水印到达时，窗口将被触发，滞后水印到达的元素将被丢弃。窗口视图通过设置 `ALLOWED_LATENESS=INTERVAL` 支持滞后事件处理。滞后处理的一个示例是：

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

注意，由滞后触发的元素应视为先前计算的更新结果。窗口视图不会在窗口结束时触发，而是在滞后事件到达时立即触发。因此，它将导致同一窗口输出多次。用户需要考虑这些重复结果或对其去重。

您可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改窗口视图中指定的 `SELECT` 查询。形成新 `SELECT` 查询的数据结构应与原始 `SELECT` 查询在有或没有 `TO [db.]name` 子句时相同。请注意，当前窗口中的数据将丢失，因为中间状态无法重用。

### 监控新窗口 {#monitoring-new-windows}

窗口视图支持 [WATCH](../../../sql-reference/statements/watch.md) 查询以监控变化，或使用 `TO` 语法将结果输出到表。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH` 查询的作用类似于 `LIVE VIEW`。可以指定 `LIMIT` 来设置在终止查询之前接收的更新数量。`EVENTS` 子句可用于获得 `WATCH` 查询的简短形式，在该形式中，您将仅获得最新的查询水印，而不是查询结果。

### 设置 {#settings-1}

- `window_view_clean_interval`：窗口视图的清理间隔（以秒为单位）以释放过时数据。系统将保留根据系统时间或 `WATERMARK` 配置尚未完全触发的窗口，其他数据将被删除。
- `window_view_heartbeat_interval`：心跳间隔（以秒为单位），以指示观察查询处于活动状态。
- `wait_for_window_view_fire_signal_timeout`：事件时间处理中等待窗口视图触发信号的超时。

### 示例 {#example}

假设我们需要计算名为 `data` 的日志表中每 10 秒的点击日志数量，其表结构为：

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

首先，我们创建一个以 10 秒为间隔的滚动窗口视图：

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

然后，我们使用 `WATCH` 查询来获取结果。

```sql
WATCH wv
```

当日志插入到表 `data` 中时，

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 查询应如下所示打印结果：

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

另外，我们可以使用 `TO` 语法将输出附加到另一个表中。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

有关更多示例，可以在 ClickHouse 的有状态测试中找到（它们命名为 `*window_view*`）。

### 窗口视图的使用 {#window-view-usage}

窗口视图在以下场景中非常有用：

* **监控**：按时间聚合和计算指标日志，并将结果输出到目标表。仪表板可以使用目标表作为源表。
* **分析**：自动聚合和预处理时间窗口中的数据。在分析大量日志时，这非常有用。预处理消除了多个查询中的重复计算，减少了查询延迟。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客: [使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## 临时视图 {#temporary-views}

ClickHouse 支持 **临时视图**，具有以下特性（在适用情况下与临时表匹配）：

* **会话生命周期**
  临时视图仅在当前会话期间存在。会话结束时会自动删除。

* **没有数据库**
  您 **无法** 用数据库名限定临时视图。它生活在数据库之外（会话命名空间）。

* **不复制 / 无 ON CLUSTER**
  临时对象仅对会话本地，**不能** 使用 `ON CLUSTER` 创建。

* **名称解析**
  如果一个临时对象（表或视图）与持久对象同名，并且查询 **不** 带数据库引用，则使用 **临时** 对象。

* **逻辑对象（没有存储）**
  临时视图仅存储其 `SELECT` 文本（内部使用 `View` 存储）。它不持久化数据，无法接受 `INSERT`。

* **引擎子句**
  您 **不** 需要指定 `ENGINE`；如果提供为 `ENGINE = View`，则会被忽略/视为相同的逻辑视图。

* **安全性 / 权限**
  创建临时视图需要 `CREATE TEMPORARY VIEW` 权限，该权限由 `CREATE VIEW` 隐式授予。

* **SHOW CREATE**
  使用 `SHOW CREATE TEMPORARY VIEW view_name;` 打印临时视图的 DDL。

### 语法 {#temporary-views-syntax}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

`OR REPLACE` **不** 支持临时视图（以匹配临时表）。如果您需要“替换”临时视图，请先删除它，然后再创建。

### 示例 {#temporary-views-examples}

创建一个临时源表和一个临时视图：

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

显示它的 DDL：

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

删除它：

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```

### 不允许 / 限制 {#temporary-views-limitations}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **不允许**（使用 `DROP` + `CREATE`）。
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `LIVE VIEW` / `WINDOW VIEW` → **不允许**。
* `CREATE TEMPORARY VIEW db.view AS ...` → **不允许**（无数据库限定）。
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **不允许**（临时对象是会话本地的）。
* `POPULATE`、`REFRESH`、`TO [db.table]`、内部引擎和所有与 MV 特有的子句 → **不适用于** 临时视图。

### 有关分布式查询的说明 {#temporary-views-distributed-notes}

临时 **视图** 只是一个定义；没有数据流动。如果您的临时视图引用临时 **表**（例如，`Memory`），在执行分布式查询时，它们的数据可以像临时表一样被传输到远程服务器。

#### 示例 {#temporary-views-distributed-example}

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
