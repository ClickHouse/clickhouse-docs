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


# CREATE VIEW

创建新的视图。视图可以是[普通视图](#normal-view)、[物化视图](#materialized-view)、[可刷新的物化视图](#refreshable-materialized-view)以及[窗口视图](/sql-reference/statements/create/view#window-view)。



## 普通视图 {#normal-view}

语法:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

普通视图不存储任何数据。它们只是在每次访问时从另一个表中读取数据。换句话说,普通视图本质上就是一个保存的查询。从视图读取数据时,这个保存的查询会作为子查询用在 [FROM](../../../sql-reference/statements/select/from.md) 子句中。

例如,假设您创建了一个视图:

```sql
CREATE VIEW view AS SELECT ...
```

并编写了一个查询:

```sql
SELECT a, b, c FROM view
```

此查询完全等同于使用子查询:

```sql
SELECT a, b, c FROM (SELECT ...)
```


## 参数化视图 {#parameterized-view}

参数化视图与普通视图类似,但可以在创建时使用不立即解析的参数。这些视图可以作为表函数使用,其中视图名称作为函数名,参数值作为函数参数。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

上述语句为表创建了一个视图,通过替换参数可以将其作为表函数使用,如下所示。

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
这里有一份关于使用[物化视图](/guides/developer/cascading-materialized-views.md)的分步指南。
:::

物化视图存储由相应的 [SELECT](../../../sql-reference/statements/select/index.md) 查询转换后的数据。

创建不带 `TO [db].[table]` 的物化视图时,必须指定 `ENGINE` —— 用于存储数据的表引擎。

创建带有 `TO [db].[table]` 的物化视图时,不能同时使用 `POPULATE`。

物化视图的实现方式如下:当向 `SELECT` 中指定的表插入数据时,部分插入的数据会被该 `SELECT` 查询转换,转换结果会插入到视图中。

:::note
ClickHouse 中的物化视图在插入目标表时使用**列名**而非列顺序。如果某些列名在 `SELECT` 查询结果中不存在,ClickHouse 会使用默认值,即使该列不是 [Nullable](../../data-types/nullable.md) 类型。使用物化视图时,为每个列添加别名是一种安全的做法。

ClickHouse 中的物化视图更像是插入触发器。如果视图查询中包含聚合操作,它仅应用于新插入的数据批次。对源表现有数据的任何更改(如更新、删除、删除分区等)都不会影响物化视图。

ClickHouse 中的物化视图在出现错误时不具有确定性行为。这意味着已经写入的数据块将保留在目标表中,但错误之后的所有数据块都不会被写入。

默认情况下,如果向某个视图推送数据失败,则 INSERT 查询也会失败,并且某些数据块可能不会写入目标表。可以使用 `materialized_views_ignore_errors` 设置来改变这一行为(应该为 `INSERT` 查询设置该参数),如果设置 `materialized_views_ignore_errors=true`,则向视图推送数据时的任何错误都将被忽略,所有数据块都会写入目标表。

另请注意,对于 `system.*_log` 表,`materialized_views_ignore_errors` 默认设置为 `true`。
:::

如果指定 `POPULATE`,则在创建视图时会将现有表数据插入视图,就像执行 `CREATE TABLE ... AS SELECT ...` 一样。否则,查询仅包含创建视图后插入表中的数据。我们**不建议**使用 `POPULATE`,因为在视图创建期间插入表中的数据不会被插入到视图中。

:::note
鉴于 `POPULATE` 的工作方式类似于 `CREATE TABLE ... AS SELECT ...`,它有以下限制:

- 不支持 Replicated 数据库
- 在 ClickHouse Cloud 中不支持

可以使用单独的 `INSERT ... SELECT` 来代替。
:::

`SELECT` 查询可以包含 `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`。请注意,相应的转换会在每个插入数据块上独立执行。例如,如果设置了 `GROUP BY`,数据会在插入期间进行聚合,但仅限于单个插入数据包内。数据不会进一步聚合。例外情况是使用独立执行数据聚合的 `ENGINE`,例如 `SummingMergeTree`。

在物化视图上执行 [ALTER](/sql-reference/statements/alter/view.md) 查询有一些限制,例如,无法更新 `SELECT` 查询,这可能会带来不便。如果物化视图使用 `TO [db.]name` 结构,可以先 `DETACH` 视图,对目标表运行 `ALTER`,然后 `ATTACH` 之前分离(`DETACH`)的视图。

请注意,物化视图会受到 [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 设置的影响。数据在插入视图之前会被合并。

视图看起来与普通表相同。例如,它们会列在 `SHOW TABLES` 查询的结果中。

要删除视图,请使用 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)。不过 `DROP TABLE` 对视图也同样有效。


## SQL 安全性 {#sql_security}

`DEFINER` 和 `SQL SECURITY` 允许您指定执行视图底层查询时使用的 ClickHouse 用户。
`SQL SECURITY` 有三个有效值:`DEFINER`、`INVOKER` 或 `NONE`。您可以在 `DEFINER` 子句中指定任何现有用户或 `CURRENT_USER`。

下表说明了从视图中查询数据时,不同用户需要哪些权限。
请注意,无论使用哪种 SQL 安全选项,都必须具有 `GRANT SELECT ON <view>` 权限才能从视图中读取数据。

| SQL 安全选项 | 视图                                                            | 物化视图                                                                                                 |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `DEFINER alice`     | `alice` 必须对视图的源表具有 `SELECT` 授权。 | `alice` 必须对视图的源表具有 `SELECT` 授权,并对视图的目标表具有 `INSERT` 授权。 |
| `INVOKER`           | 用户必须对视图的源表具有 `SELECT` 授权。    | 物化视图不能指定 `SQL SECURITY INVOKER`。                                                 |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE` 是一个已弃用的选项。任何有权使用 `SQL SECURITY NONE` 创建视图的用户都能够执行任意查询。
因此,使用此选项创建视图需要具有 `GRANT ALLOW SQL SECURITY NONE TO <user>` 权限。
:::

如果未指定 `DEFINER`/`SQL SECURITY`,则使用以下默认值:

- `SQL SECURITY`:普通视图为 `INVOKER`,物化视图为 `DEFINER`([可通过设置配置](../../../operations/settings/settings.md#default_normal_view_sql_security))
- `DEFINER`:`CURRENT_USER`([可通过设置配置](../../../operations/settings/settings.md#default_view_definer))

如果附加视图时未指定 `DEFINER`/`SQL SECURITY`,则物化视图的默认值为 `SQL SECURITY NONE`,普通视图的默认值为 `SQL SECURITY INVOKER`。

要更改现有视图的 SQL 安全性,请使用

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

<DeprecatedBadge />

此功能已弃用,将在未来版本中移除。

为方便查阅,旧版文档位于[此处](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)


## 可刷新物化视图 {#refreshable-materialized-view}

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

其中 `interval` 是一系列简单时间间隔:

```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期运行相应的查询并将结果存储在表中。

- 如果查询中指定了 `APPEND`,每次刷新会向表中插入行而不删除现有行。插入操作不是原子性的,与常规的 INSERT SELECT 相同。
- 否则,每次刷新会以原子方式替换表的先前内容。
  与常规不可刷新物化视图的区别:
- 无插入触发器。即当新数据插入到 SELECT 中指定的表时,_不会_自动推送到可刷新物化视图。定期刷新会运行完整的查询。\* 对 SELECT 查询无限制。表函数(例如 `url()`)、视图、UNION、JOIN 均可使用。

:::note
查询中 `REFRESH ... SETTINGS` 部分的设置是刷新设置(例如 `refresh_retries`),与常规设置(例如 `max_threads`)不同。常规设置可以在查询末尾使用 `SETTINGS` 指定。
:::

### 刷新计划 {#refresh-schedule}

刷新计划示例:

```sql
REFRESH EVERY 1 DAY -- 每天午夜(UTC)
REFRESH EVERY 1 MONTH -- 每月第1天午夜
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 每月第6天凌晨2:00
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 每隔一个星期六下午3:10
REFRESH EVERY 30 MINUTE -- 在 00:00、00:30、01:00、01:30 等时刻
REFRESH AFTER 30 MINUTE -- 在上一次刷新完成后30分钟,不与一天中的时间对齐
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 语法错误,OFFSET 不允许与 AFTER 一起使用
REFRESH EVERY 1 WEEK 2 DAYS -- 每9天,不在一周或一月的任何特定日期;
                            -- 具体来说,当天数(自1969-12-29起)可被9整除时
REFRESH EVERY 5 MONTHS -- 每5个月,每年不同的月份(因为12不能被5整除);
                       -- 具体来说,当月数(自1970-01起)可被5整除时
```

`RANDOMIZE FOR` 随机调整每次刷新的时间,例如:

```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 每天在01:30到02:30之间的随机时间
```

对于给定的视图,同一时间最多只能运行一次刷新。例如,如果一个设置了 `REFRESH EVERY 1 MINUTE` 的视图需要2分钟来刷新,它实际上会每2分钟刷新一次。如果之后变快并在10秒内完成刷新,它会恢复到每分钟刷新一次。(特别是,它不会每10秒刷新一次来弥补错过的刷新 - 不存在这样的积压。)

此外,除非在 `CREATE` 查询中指定了 `EMPTY`,否则在创建物化视图后会立即启动刷新。如果指定了 `EMPTY`,第一次刷新将按计划执行。

### 在复制数据库中 {#in-replicated-db}

如果可刷新物化视图位于[复制数据库](../../../engines/database-engines/replicated.md)中,副本之间会相互协调,以便在每个计划时间只有一个副本执行刷新。需要使用 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 表引擎,以便所有副本都能看到刷新产生的数据。

在 `APPEND` 模式下,可以使用 `SETTINGS all_replicas = 1` 禁用协调。这使得副本彼此独立地执行刷新。在这种情况下不需要 ReplicatedMergeTree。


在非 `APPEND` 模式下,仅支持协调刷新。对于非协调刷新,请使用 `Atomic` 数据库和 `CREATE ... ON CLUSTER` 查询在所有副本上创建可刷新物化视图。

协调通过 Keeper 完成。znode 路径由 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 服务器设置决定。

### 依赖关系 {#refresh-dependencies}

`DEPENDS ON` 用于同步不同表的刷新。例如,假设有一个由两个可刷新物化视图组成的链:

```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```

如果没有 `DEPENDS ON`,两个视图都会在午夜开始刷新,`destination` 通常会看到 `source` 中昨天的数据。如果添加依赖关系:

```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```

那么 `destination` 的刷新只会在 `source` 当天的刷新完成后才开始,因此 `destination` 将基于最新数据。

或者,也可以通过以下方式实现相同的效果:

```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```

其中 `1 HOUR` 可以是任何小于 `source` 刷新周期的时长。依赖表的刷新频率不会超过其任何依赖项的刷新频率。这是一种有效的方式来设置可刷新视图链,而无需多次指定实际的刷新周期。

更多示例:

- `REFRESH EVERY 1 DAY OFFSET 10 MINUTE` (`destination`) 依赖于 `REFRESH EVERY 1 DAY` (`source`)<br/>
  如果 `source` 刷新耗时超过 10 分钟,`destination` 将等待其完成。
- `REFRESH EVERY 1 DAY OFFSET 1 HOUR` 依赖于 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br/>
  与上述类似,即使相应的刷新发生在不同的日历日。
  第 X+1 天的 `destination` 刷新将等待第 X 天的 `source` 刷新完成(如果耗时超过 2 小时)。
- `REFRESH EVERY 2 HOUR` 依赖于 `REFRESH EVERY 1 HOUR`<br/>
  2 小时刷新在每隔一小时的 1 小时刷新之后发生,例如在午夜刷新之后,然后在凌晨 2 点刷新之后,依此类推。
- `REFRESH EVERY 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
  `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH EVERY 2 HOUR`<br/>
  `REFRESH AFTER 1 MINUTE` 依赖于 `REFRESH AFTER 2 HOUR`<br/>
  `destination` 在每次 `source` 刷新后刷新一次,即每 2 小时一次。`1 MINUTE` 实际上被忽略。
- `REFRESH AFTER 1 HOUR` 依赖于 `REFRESH AFTER 1 HOUR`<br/>
  目前不推荐这样做。

:::note
`DEPENDS ON` 仅在可刷新物化视图之间有效。在 `DEPENDS ON` 列表中列出常规表将阻止视图刷新(可以使用 `ALTER` 删除依赖关系,见下文)。
:::

### 设置 {#settings}

可用的刷新设置:

- `refresh_retries` - 当刷新查询因异常失败时的重试次数。如果所有重试都失败,则跳到下一个计划的刷新时间。0 表示不重试,-1 表示无限重试。默认值:0。
- `refresh_retry_initial_backoff_ms` - 当 `refresh_retries` 不为零时,第一次重试前的延迟。每次后续重试将延迟加倍,最多到 `refresh_retry_max_backoff_ms`。默认值:100 毫秒。
- `refresh_retry_max_backoff_ms` - 刷新尝试之间延迟指数增长的上限。默认值:60000 毫秒(1 分钟)。

### 更改刷新参数 {#changing-refresh-parameters}

要更改刷新参数:

```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
这会一次性替换_所有_刷新参数:调度、依赖关系、设置和 APPEND 属性。例如,如果表有 `DEPENDS ON`,执行不带 `DEPENDS ON` 的 `MODIFY REFRESH` 将删除依赖关系。
:::

### 其他操作 {#other-operations}


所有可刷新物化视图的状态都可以在表 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 中查看。其中包括刷新进度（若正在运行）、上次和下次刷新时间，以及当刷新失败时的异常消息。

要手动停止、启动、触发或取消刷新，请使用 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)。

要等待某次刷新完成，请使用 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)。这在创建视图后等待初次刷新完成时尤其有用。

:::note
趣闻：刷新查询可以从正在刷新的视图中读取数据，看到的是刷新前版本的数据。这意味着你可以实现康威的生命游戏（Conway's Game of Life）：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::



## 窗口视图 {#window-view}

<ExperimentalBadge />
<CloudNotSupportedBadge />

:::info
这是一个实验性功能,在未来版本中可能会以不向后兼容的方式发生变化。使用 [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 设置来启用窗口视图和 `WATCH` 查询。输入命令 `set allow_experimental_window_view = 1`。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

窗口视图可以按时间窗口聚合数据,并在窗口准备就绪时输出结果。它将部分聚合结果存储在内部(或指定的)表中以降低延迟,并可以将处理结果推送到指定的表,或使用 WATCH 查询推送通知。

创建窗口视图类似于创建 `MATERIALIZED VIEW`。窗口视图需要一个内部存储引擎来存储中间数据。可以使用 `INNER ENGINE` 子句指定内部存储,窗口视图默认使用 `AggregatingMergeTree` 作为内部引擎。

在创建不带 `TO [db].[table]` 的窗口视图时,必须指定 `ENGINE` — 用于存储数据的表引擎。

### 时间窗口函数 {#time-window-functions}

[时间窗口函数](../../functions/time-window-functions.md) 用于获取记录的窗口下界和上界。窗口视图需要与时间窗口函数配合使用。

### 时间属性 {#time-attributes}

窗口视图支持**处理时间**和**事件时间**两种处理方式。

**处理时间**允许窗口视图基于本地机器的时间生成结果,这是默认使用的方式。它是最直接的时间概念,但不提供确定性。处理时间属性可以通过将时间窗口函数的 `time_attr` 设置为表列或使用函数 `now()` 来定义。以下查询创建一个使用处理时间的窗口视图。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**事件时间**是每个事件在其生成设备上发生的时间。这个时间通常在生成记录时嵌入到记录中。事件时间处理即使在出现乱序事件或延迟事件的情况下也能保证结果的一致性。窗口视图通过使用 `WATERMARK` 语法支持事件时间处理。

窗口视图提供三种水位线策略:

- `STRICTLY_ASCENDING`:发出到目前为止观察到的最大时间戳作为水位线。时间戳小于最大时间戳的行不算延迟。
- `ASCENDING`:发出到目前为止观察到的最大时间戳减 1 作为水位线。时间戳等于或小于最大时间戳的行不算延迟。
- `BOUNDED`:WATERMARK=INTERVAL。发出水位线,即观察到的最大时间戳减去指定的延迟时间。

以下查询是创建带有 `WATERMARK` 的窗口视图的示例:

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

默认情况下,窗口将在水位线到达时触发,而在水位线之后到达的元素将被丢弃。窗口视图通过设置 `ALLOWED_LATENESS=INTERVAL` 支持延迟事件处理。延迟处理的示例如下:

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

请注意,延迟触发发出的元素应被视为先前计算的更新结果。窗口视图不会在窗口结束时触发,而是在延迟事件到达时立即触发。因此,同一个窗口会产生多个输出。用户需要考虑这些重复的结果或对其进行去重处理。


您可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改窗口视图中指定的 `SELECT` 查询。新 `SELECT` 查询产生的数据结构应与原始 `SELECT` 查询相同,无论是否使用 `TO [db.]name` 子句。请注意,当前窗口中的数据将会丢失,因为中间状态无法重用。

### 监控新窗口 {#monitoring-new-windows}

窗口视图支持使用 [WATCH](../../../sql-reference/statements/watch.md) 查询来监控变化,或使用 `TO` 语法将结果输出到表中。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

可以指定 `LIMIT` 来设置在终止查询之前接收的更新次数。`EVENTS` 子句可用于获取 `WATCH` 查询的简化形式,此时您将只获得最新的查询水位线,而不是查询结果。

### 设置 {#settings-1}

- `window_view_clean_interval`: 窗口视图清理过期数据的时间间隔(以秒为单位)。系统将根据系统时间或 `WATERMARK` 配置保留尚未完全触发的窗口,其他数据将被删除。
- `window_view_heartbeat_interval`: 心跳间隔(以秒为单位),用于指示 watch 查询处于活动状态。
- `wait_for_window_view_fire_signal_timeout`: 在事件时间处理中等待窗口视图触发信号的超时时间。

### 示例 {#example}

假设我们需要统计名为 `data` 的日志表中每 10 秒的点击日志数量,其表结构如下:

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

首先,我们创建一个时间间隔为 10 秒的滚动窗口视图:

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

然后,我们使用 `WATCH` 查询来获取结果。

```sql
WATCH wv
```

当日志插入到表 `data` 中时,

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 查询应打印如下结果:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

或者,我们可以使用 `TO` 语法将输出附加到另一个表。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

更多示例可以在 ClickHouse 的有状态测试中找到(它们在那里被命名为 `*window_view*`)。

### 窗口视图使用场景 {#window-view-usage}

窗口视图在以下场景中非常有用:

- **监控**: 按时间聚合和计算指标日志,并将结果输出到目标表。仪表板可以使用目标表作为数据源。
- **分析**: 在时间窗口内自动聚合和预处理数据。这在分析大量日志时非常有用。预处理消除了多个查询中的重复计算,并降低了查询延迟。


## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客：[使用 ClickHouse 构建可观测性解决方案 - 第 2 部分 - 链路追踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)


## 临时视图 {#temporary-views}

ClickHouse 支持**临时视图**，具有以下特性（在适用情况下与临时表保持一致）：

- **会话生命周期**
  临时视图仅在当前会话期间存在。会话结束时自动删除。

- **无数据库**
  **不能**为临时视图指定数据库名称。它存在于数据库之外（会话命名空间）。

- **不复制 / 无 ON CLUSTER**
  临时对象是会话本地的，**不能**使用 `ON CLUSTER` 创建。

- **名称解析**
  如果临时对象（表或视图）与持久对象同名，且查询引用该名称时**未指定**数据库，则使用**临时**对象。

- **逻辑对象（无存储）**
  临时视图仅存储其 `SELECT` 文本（内部使用 `View` 存储）。它不持久化数据，且不能接受 `INSERT`。

- **引擎子句**
  **无需**指定 `ENGINE`；如果提供 `ENGINE = View`，会被忽略/视为相同的逻辑视图。

- **安全性 / 权限**
  创建临时视图需要 `CREATE TEMPORARY VIEW` 权限，该权限由 `CREATE VIEW` 隐式授予。

- **SHOW CREATE**
  使用 `SHOW CREATE TEMPORARY VIEW view_name;` 打印临时视图的 DDL。

### 语法 {#temporary-views-syntax}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

临时视图**不**支持 `OR REPLACE`（与临时表保持一致）。如果需要"替换"临时视图，请先删除再重新创建。

### 示例 {#temporary-views-examples}

创建一个临时源表及其上的临时视图：

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

删除它：

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- 临时视图使用 TEMPORARY TABLE 语法删除
```

### 不允许的操作 / 限制 {#temporary-views-limitations}

- `CREATE OR REPLACE TEMPORARY VIEW ...` → **不允许**（使用 `DROP` + `CREATE`）。
- `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **不允许**。
- `CREATE TEMPORARY VIEW db.view AS ...` → **不允许**（无数据库限定符）。
- `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **不允许**（临时对象是会话本地的）。
- `POPULATE`、`REFRESH`、`TO [db.table]`、内部引擎以及所有物化视图特定子句 → **不适用于**临时视图。

### 分布式查询注意事项 {#temporary-views-distributed-notes}

临时**视图**只是一个定义；没有数据需要传递。如果临时视图引用临时**表**（例如 `Memory`），在分布式查询执行期间，这些表的数据可以像临时表一样传输到远程服务器。

#### 示例 {#temporary-views-distributed-example}

```sql
-- 会话范围的内存表
CREATE TEMPORARY TABLE temp_ids (id UInt64) ENGINE = Memory;

INSERT INTO temp_ids VALUES (1), (5), (42);

-- 基于临时表的会话范围视图（纯逻辑）
CREATE TEMPORARY VIEW v_ids AS
SELECT id FROM temp_ids;

-- 将 'test' 替换为您的集群名称。
-- GLOBAL JOIN 强制 ClickHouse *传输*小的连接端（通过 v_ids 的 temp_ids）
-- 到执行左侧的每个远程服务器。
SELECT count()
FROM cluster('test', system.numbers) AS n
GLOBAL ANY INNER JOIN v_ids USING (id)
WHERE n.number < 100;

```
