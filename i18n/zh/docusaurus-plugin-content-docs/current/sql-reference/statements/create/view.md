---
slug: /sql-reference/statements/create/view
sidebar_position: 37
sidebar_label: VIEW
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 创建视图

创建一个新的视图。视图可以是 [普通](#normal-view)、[物化](#materialized-view)、[可刷新的物化](#refreshable-materialized-view) 和 [窗口](/sql-reference/statements/create/view#window-view)（可刷新的物化视图和窗口视图是实验性功能）。

## 普通视图 {#normal-view}

语法：

``` sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

普通视图不存储任何数据。它们在每次访问时仅从另一个表中读取数据。换句话说，普通视图只是一个保存的查询。当从视图中读取时，这个保存的查询被用作 [FROM](../../../sql-reference/statements/select/from.md) 子查询。

例如，假设您创建了一个视图：

``` sql
CREATE VIEW view AS SELECT ...
```

并编写了一个查询：

``` sql
SELECT a, b, c FROM view
```

这个查询与使用子查询完全等价：

``` sql
SELECT a, b, c FROM (SELECT ...)
```

## 参数化视图 {#parameterized-view}

参数化视图类似于普通视图，但可以创建带有未立即解析的参数。这些视图可以与表函数一起使用，指定视图名称作为函数名称，参数值作为其参数。

``` sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上述语句为一个表创建了一个视图，可以通过替换参数来作为表函数使用，如下所示。

``` sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```

## 物化视图 {#materialized-view}

``` sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
以下是使用 [物化视图](/guides/developer/cascading-materialized-views.md) 的逐步指南。
:::

物化视图存储通过相应的 [SELECT](../../../sql-reference/statements/select/index.md) 查询转换的数据。

在创建没有 `TO [db].[table]` 的物化视图时，必须指定 `ENGINE` 作为存储数据的表引擎。

在创建带有 `TO [db].[table]` 的物化视图时，不能使用 `POPULATE`。

物化视图的实现方式如下：当向 `SELECT` 指定的表插入数据时，部分插入的数据通过此 `SELECT` 查询进行转换，其结果被插入到视图中。

:::note
在 ClickHouse 中，物化视图在插入目标表时使用 **列名** 而不是列的顺序。如果 `SELECT` 查询结果中缺少某些列名，ClickHouse 会使用默认值，即使该列不是 [Nullable](../../data-types/nullable.md)。安全的做法是为每个列添加别名以使用物化视图。

在 ClickHouse 中，物化视图更像是插入触发器。如果视图查询中有聚合，则只对新插入的数据批次应用它。对源表的现有数据（如更新、删除、删除分区等）的任何更改都不会改变物化视图。

在 ClickHouse 中，物化视图在错误情况下没有确定性行为。这意味着已经写入的块将保留在目标表中，但错误之后的所有块将不被保留。

默认情况下，如果将数据推送到其中一个视图失败，则 INSERT 查询也将失败，可能有些块未写入目标表。这可以通过使用 `materialized_views_ignore_errors` 设置进行更改（您应该为 `INSERT` 查询设置它），如果您将 `materialized_views_ignore_errors=true`，则在推送到视图时的任何错误将被忽略，所有块都将被写入目标表。

另外，请注意，对于 `system.*_log` 表，默认情况下 `materialized_views_ignore_errors` 设置为 `true`。
:::

如果您指定 `POPULATE`，在创建视图时，现有表数据将插入到视图中，就像执行 `CREATE TABLE ... AS SELECT ...`。否则，查询仅包括在创建视图后插入到表中的数据。我们 **不推荐** 使用 `POPULATE`，因为在创建视图期间插入到表中的数据不会被插入到视图中。

:::note
因为 `POPULATE` 的工作方式与 `CREATE TABLE ... AS SELECT ...` 类似，所以它有一些限制：
- 不支持在复制的数据库中使用
- 不支持在 ClickHouse 云中使用

相反，可以使用单独的 `INSERT ... SELECT`。
:::

`SELECT` 查询可以包含 `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`。请注意，相应的转换在每个插入数据的块上独立执行。例如，如果设置了 `GROUP BY`，则在插入过程中对数据进行聚合，但仅在单个插入数据包内部。不会进一步聚合数据。例外情况是使用独立执行数据聚合的 `ENGINE`，例如 `SummingMergeTree`。

对物化视图执行的 [ALTER](/sql-reference/statements/alter/view.md) 查询有一些限制，例如，您不能更新 `SELECT` 查询，因此这可能不方便。如果物化视图使用 `TO [db.]name` 构造，您可以 `DETACH` 视图，针对目标表运行 `ALTER`，然后 `ATTACH` 先前被分离（`DETACH`）的视图。

注意，物化视图受到 [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 设置的影响。数据在插入视图之前会被合并。

视图与普通表看起来相同。例如，它们在 `SHOW TABLES` 查询的结果中列出。

要删除视图，请使用 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)。虽然 `DROP TABLE` 对于视图也有效。

## SQL 安全性 {#sql_security}

`DEFINER` 和 `SQL SECURITY` 允许您指定执行视图底层查询时使用哪个 ClickHouse 用户。
`SQL SECURITY` 有三个合法值：`DEFINER`、`INVOKER` 或 `NONE`。您可以在 `DEFINER` 子句中指定任何现有用户或 `CURRENT_USER`。

下表将说明每个用户在选择视图时所需的权限。
请注意，无论 SQL 安全性选项如何，仍然必须拥有 `GRANT SELECT ON <view>` 才能读取视图。

| SQL 安全性选项 | 视图                                                            | 物化视图                                                                                                      |
|------------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`  | `alice` 必须对视图的源表具有 `SELECT` 权限。                   | `alice` 必须对视图的源表具有 `SELECT` 权限，并对视图的目标表具有 `INSERT` 权限。                          |
| `INVOKER`        | 用户必须对视图的源表具有 `SELECT` 权限。                      | `SQL SECURITY INVOKER` 不能为物化视图指定。                                                                  |
| `NONE`           | -                                                               | -                                                                                                            |

:::note
`SQL SECURITY NONE` 是一个不推荐使用的选项。任何有权创建使用 `SQL SECURITY NONE` 的视图的用户都可以执行任意查询。
因此，必须有 `GRANT ALLOW SQL SECURITY NONE TO <user>` 才能创建使用此选项的视图。
:::

如果没有指定 `DEFINER`/`SQL SECURITY`，则使用默认值：
- `SQL SECURITY`：对于普通视图，默认是 `INVOKER`，对于物化视图，默认是 `DEFINER`（[可通过设置配置](../../../operations/settings/settings.md#default_normal_view_sql_security)）。
- `DEFINER`：默认是 `CURRENT_USER`（[可通过设置配置](../../../operations/settings/settings.md#default_view_definer)）。

如果视图在没有指定 `DEFINER`/`SQL SECURITY` 的情况下被附加，则物化视图的默认值为 `SQL SECURITY NONE`，而普通视图的默认值为 `SQL SECURITY INVOKER`。

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

此功能已经不推荐使用，并将在未来移除。

为了方便您，旧文档位于 [这里](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)

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
AS SELECT ...
[COMMENT 'comment']
```
其中 `interval` 是一系列简单的时间间隔：
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期运行相应的查询并将其结果存储在表中。
 * 如果查询中有 `APPEND`，每次刷新会将行插入到表中，而不删除现有行。插入不是原子的，就像常规的 INSERT SELECT 一样。
 * 否则每次刷新原子性地替换表中的先前内容。

与常规非可刷新的物化视图的不同之处：
 * 没有插入触发器。即，当新数据插入到 `SELECT` 指定的表中时，*不会* 自动推送到可刷新的物化视图中。定期刷新会运行整个查询。
 * 对 SELECT 查询没有限制。表函数（例如 `url()`）、视图、UNION、JOIN 全部允许。

:::note
查询的 `REFRESH ... SETTINGS` 部分中的设置是刷新设置（例如 `refresh_retries`），与常规设置（例如 `max_threads`）不同。常规设置可以在查询末尾通过 `SETTINGS` 指定。
:::

### 刷新调度 {#refresh-schedule}

示例刷新的调度：
```sql
REFRESH EVERY 1 DAY -- 每天在午夜（UTC）
REFRESH EVERY 1 MONTH -- 每月的第一天，在午夜
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 每月的第六天，在凌晨2点
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 每隔一个星期六，在下午3:10
REFRESH EVERY 30 MINUTE -- 在 00:00、00:30、01:00、01:30 等
REFRESH AFTER 30 MINUTE -- 在上次刷新完成后的 30 分钟，不与日间时间对齐
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 语法错误，不允许与 AFTER 一起使用 OFFSET
REFRESH EVERY 1 WEEK 2 DAYS -- 每 9 天，不在任何特定的星期或月份；
                            -- 具体来说，当天数（自 1969-12-29 起）能够被 9 整除时
REFRESH EVERY 5 MONTHS -- 每 5 个月，不同的月份（因为 12 不能被 5 整除）；
                       -- 具体来说，当月份数（自 1970-01 起）能够被 5 整除时
```

`RANDOMIZE FOR` 随机调整每次刷新的时间，例如：
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 每天在 01:30 和 02:30 之间的随机时间
```

在给定视图中，最多只能同时运行一个刷新。例如，如果一个 `REFRESH EVERY 1 MINUTE` 的视图需要 2 分钟才能刷新，它将每 2 分钟刷新一次。如果它变得更快并开始在 10 秒内刷新，它将回到每分钟刷新一次。（特别是，它不会每 10 秒刷新一次以赶上错过的刷新的积压 - 不存在这样的积压。）

此外，在创建物化视图后，将立即开始刷新，除非在 `CREATE` 查询中指定了 `EMPTY`。如果指定了 `EMPTY`，则第一次刷新根据调度进行。

### 在复制数据库中 {#in-replicated-db}

如果可刷新的物化视图位于 [复制的数据库](../../../engines/database-engines/replicated.md) 中，则副本之间会进行协调，以确保每个调度时间仅有一个副本执行刷新。需要 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 表引擎，以便所有副本看到由刷新产生的数据。

在 `APPEND` 模式下，可以使用 `SETTINGS all_replicas = 1` 禁用协调。这使得副本独立执行刷新。在这种情况下，不需要 ReplicatedMergeTree。

在非 `APPEND` 模式下，仅支持协调刷新。要实现不协调，可以使用 Atomic 数据库和 `CREATE ... ON CLUSTER` 查询在所有副本上创建可刷新的物化视图。

协调是通过 Keeper 完成的。znode 路径由 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 服务器设置确定。

### 依赖关系 {#refresh-dependencies}

`DEPENDS ON` 实现不同表的刷新同步。举个例子，假设有两个可刷新的物化视图的链：
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
没有 `DEPENDS ON`，两个视图将在午夜开始刷新，而 `destination` 通常会看到 `source` 中昨日的数据。如果添加依赖关系：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
那么 `destination` 的刷新将仅在 `source` 的当天刷新的完成后开始，因此 `destination` 将基于新鲜数据。

另外，可以用以下方式实现相同的结果：
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
在这里，`1 HOUR` 可以是小于 `source` 刷新周期的任何持续时间。依赖表不会比任何依赖关系刷新得更频繁。这是一种有效的方式来设置可刷新的视图的链，而无需多次指定真实的刷新周期。

更多示例：
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）依赖于 `REFRESH EVERY 1 DAY`（`source`）<br/>
   如果 `source` 刷新的时间超过 10 分钟，则 `destination` 将等待它。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR` 依赖于 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br/>
   类似于上述，即使相应的刷新发生在不同的日历日。
   `destination` 在第 X+1 天的刷新将等待第 X 天的 `source` 刷新（如果需要超过 2 小时）。
 * `REFRESH EVERY 2 HOUR` 依赖于 `REFRESH EVERY 1 HOUR`<br/>
   2 小时的刷新发生在每隔一小时的刷新之后，例如在午夜刷新之后，然后在清晨 2 点刷新等等。
 * `REFRESH EVERY 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
   `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
   `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH AFTER 2 HOUR`<br/>
   `destination` 在每次 `source` 刷新后刷新一次，即每 2 小时刷新一次。`1 MINUTE` 实际上被忽略。
 * `REFRESH AFTER 1 HOUR` 依赖于 `REFRESH AFTER 1 HOUR`<br/>
   目前不推荐这种做法。

:::note
`DEPENDS ON` 仅在可刷新的物化视图之间有效。在 `DEPENDS ON` 列表中列出常规表将导致该视图无法刷新（可以通过 `ALTER` 删除依赖关系，见下文）。
:::

### 设置 {#settings}

可用的刷新设置：
 * `refresh_retries` - 如果刷新查询因异常失败，重试的次数。如果所有重试都失败，则跳过下一个计划的刷新时间。0 表示不重试，-1 表示无限重试。默认值：0。
 * `refresh_retry_initial_backoff_ms` - 如果 `refresh_retries` 不为零，则重试之前的延迟。每次随后的重试将延迟加倍，直到 `refresh_retry_max_backoff_ms`。默认值：100 ms。
 * `refresh_retry_max_backoff_ms` - 刷新尝试之间延迟的增长限制。默认值：60000 ms（1 分钟）。

### 更改刷新参数 {#changing-refresh-parameters}

要更改刷新参数：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
这会一次性替换 *所有* 刷新参数：调度、依赖关系、设置和 APPEND 状态。例如，如果表有 `DEPENDS ON`，在没有 `DEPENDS ON` 的情况下进行 `MODIFY REFRESH` 将删除依赖关系。
:::

### 其他操作 {#other-operations}

所有可刷新的物化视图的状态可在表 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 中获得。特别是，它包含刷新进度（如果正在进行），最后和下一个刷新时间，如果刷新失败则包含异常消息。

要手动停止、启动、触发或取消刷新，请使用 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)。

要等待刷新完成，请使用 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)。特别是，在创建视图后等待初始刷新的时候非常有用。

:::note
有趣的是，刷新查询被允许从正在刷新的视图中读取，看到数据的预刷新版本。这意味着您可以实现康威的生命游戏： https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## 窗口视图 {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
这是一个实验性功能，未来的版本中可能会以不向后兼容的方式发生变化。启用窗口视图和 `WATCH` 查询的使用，请使用 [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 设置。输入命令 `set allow_experimental_window_view = 1`。
:::

``` sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

窗口视图可以按时间窗口聚合数据，并在窗口准备好时输出结果。它将部分聚合结果存储在内表（或指定表）中，以减少延迟，并可以将处理结果推送到指定表或通过 `WATCH` 查询推送通知。

创建窗口视图类似于创建 `MATERIALIZED VIEW`。窗口视图需要一个内存存储引擎来存储中间数据。可以通过使用 `INNER ENGINE` 子句来指定内部存储，窗口视图将使用 `AggregatingMergeTree` 作为默认的内部引擎。

在创建窗口视图时，如果不使用 `TO [db].[table]`，则必须指定 `ENGINE` 作为存储数据的表引擎。

### 时间窗口函数 {#time-window-functions}

[时间窗口函数](../../functions/time-window-functions.md) 用于获取记录的下限和上限窗口。窗口视图需要与时间窗口函数一起使用。

### 时间属性 {#time-attributes}

窗口视图支持 **处理时间** 和 **事件时间** 处理。

**处理时间** 允许窗口视图根据本地机器的时间产生结果，默认使用。这是时间的最简单概念，但不提供确定性。处理时间属性可以通过将时间窗口函数的 `time_attr` 设置为表列或使用函数 `now()` 来定义。以下查询创建了具有处理时间的窗口视图。

``` sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**事件时间** 是每个单独事件在其生成设备上发生的时间。这个时间通常在生成时嵌入记录中。事件时间处理允许即使在事件顺序混乱或事件延迟的情况下也能产生一致的结果。窗口视图通过使用 `WATERMARK` 语法来支持事件时间处理。

窗口视图提供三种水印策略：

* `STRICTLY_ASCENDING`：发出当前观察到的最大时间戳的水印。时间戳小于最大时间戳的行不算延迟。
* `ASCENDING`：发出当前观察到的最大时间戳减去 1 的水印。时间戳等于或小于最大时间戳的行不算延迟。
* `BOUNDED`：WATERMARK=INTERVAL。发出水印，即最大观察到的时间戳减去指定的延迟。

以下查询是使用 `WATERMARK` 创建窗口视图的示例：

``` sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

默认情况下，当水印到达时，窗口将触发，超过水印的元素将被丢弃。窗口视图支持延迟事件处理，通过设置 `ALLOWED_LATENESS=INTERVAL`。延迟处理的示例是：

``` sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

注意，延迟触发的元素应视为之前计算的更新结果。窗口视图不会在窗口结束时触发，而是在延迟事件到达时立即触发。因此，它将导致对同一窗口的多次输出。用户需要考虑这些重复的结果或对此进行去重。

您可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改在窗口视图中指定的 `SELECT` 查询。生成的新 `SELECT` 查询的数据结构应与原始 `SELECT` 查询的数据结构相同，无论是否带有 `TO [db.]name` 子句。请注意，当前窗口中的数据将丢失，因为中间状态无法重用。

### 监控新窗口 {#monitoring-new-windows}

窗口视图支持 [WATCH](../../../sql-reference/statements/watch.md) 查询来监控变化，或使用 `TO` 语法将结果输出到表中。

``` sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH` 查询的作用类似于 `LIVE VIEW`。可以指定 `LIMIT` 设置在终止查询之前接收的更新数量。`EVENTS` 子句可用于获取 `WATCH` 查询的简短形式，您将仅获得最新的查询水印，而不是查询结果。

### 设置 {#settings-1}

- `window_view_clean_interval`：以秒为单位的窗口视图的清理间隔，以清理过时数据。系统将保留未根据系统时间或 `WATERMARK` 配置完全触发的窗口，其他数据将被删除。
- `window_view_heartbeat_interval`：以秒为单位的心跳间隔，以指示观察查询处于活动状态。
- `wait_for_window_view_fire_signal_timeout`：等待窗口视图触发信号的超时，在事件时间处理中使用。

### 示例 {#example}

假设我们需要在名为 `data` 的日志表中每 10 秒计算一次点击日志的数量，其表结构为：

``` sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

首先，我们创建一个具有 10 秒间隔的滑动窗口的窗口视图：

``` sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

然后，我们使用 `WATCH` 查询获取结果。

``` sql
WATCH wv
```

当日志插入到表 `data` 中时，

``` sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 查询应打印如下结果：

``` text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

或者，我们可以使用 `TO` 语法将输出附加到另一个表。

``` sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

其他示例可以在 ClickHouse 的有状态测试中找到（它们被命名为 `*window_view*`）。

### 窗口视图的使用 {#window-view-usage}

窗口视图在以下场景中非常有用：

* **监控**：按时间聚合和计算指标日志，并将结果输出到目标表中。仪表板可以将目标表用作源表。
* **分析**：自动聚合和预处理时间窗口的数据。当分析大量日志时，这非常有用。预处理消除了在多个查询中的重复计算，减少了查询延迟。

## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客：[使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
