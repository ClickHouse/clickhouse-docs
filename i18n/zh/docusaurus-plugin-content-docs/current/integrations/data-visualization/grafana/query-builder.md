---
sidebar_label: '查询构建器'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: '在 ClickHouse Grafana 插件中使用查询构建器'
title: '查询构建器'
doc_type: 'guide'
keywords: ['grafana', '查询构建器', '可视化', '仪表板', '插件']
---

import Image from '@theme/IdealImage';
import demo_table_query from '@site/static/images/integrations/data-visualization/grafana/demo_table_query.png';
import demo_logs_query from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query.png';
import demo_logs_query_fields from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query_fields.png';
import demo_time_series_query from '@site/static/images/integrations/data-visualization/grafana/demo_time_series_query.png';
import demo_trace_query from '@site/static/images/integrations/data-visualization/grafana/demo_trace_query.png';
import demo_raw_sql_query from '@site/static/images/integrations/data-visualization/grafana/demo_raw_sql_query.png';
import trace_id_in_table from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_table.png';
import trace_id_in_logs from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_logs.png';
import demo_data_links from '@site/static/images/integrations/data-visualization/grafana/demo_data_links.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 查询构建器 {#query-builder}

<ClickHouseSupportedBadge/>

任何查询都可以使用 ClickHouse 插件运行。
查询构建器适用于较为简单的查询；对于复杂查询，你需要使用 [SQL 编辑器](#sql-editor)。

在查询构建器中的所有查询都有一个 [查询类型](#query-types)，并且至少需要选择一列。

可用的查询类型包括：
- [表](#table)：最简单的查询类型，以表格形式显示数据。适合作为包含聚合函数的简单和复杂查询的通用选项。
- [日志](#logs)：针对构建日志查询进行了优化。在配置了[默认值](./config.md#logs)的探索视图中效果最佳。
- [时间序列](#time-series)：最适合构建时间序列查询。允许选择专用的时间列并添加聚合函数。
- [追踪](#traces)：针对搜索和查看追踪数据进行了优化。在配置了[默认值](./config.md#traces)的探索视图中效果最佳。
- [SQL 编辑器](#sql-editor)：当你需要对查询进行完全控制时，可以使用 SQL 编辑器。在此模式下，可以执行任意 SQL 查询。



## 查询类型 {#query-types}

*Query Type* 设置会更改查询构建器的布局，以匹配正在构建的查询类型。
查询类型还决定在可视化数据时使用哪个面板。

### 表格 {#table}

最灵活的查询类型是表格查询。它是一个通用查询构建器，用于处理简单查询和聚合查询。

| 字段 | 描述 |
|----|----|
| Builder Mode  | 简单查询会排除 Aggregates 和 Group By，而聚合查询则会包含这些选项。 |
| Columns | 已选中的列。可以在此字段中输入原始 SQL，以便使用函数和列别名。 |
| Aggregates | [聚合函数](/sql-reference/aggregate-functions/index.md) 列表。允许为函数和列设置自定义值。仅在 Aggregate 模式下可见。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在 Aggregate 模式下可见。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。 |
| Limit | 在查询末尾追加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则会被省略。某些可视化可能需要将其设置为 `0` 才能显示所有数据。 |
| Filters | 要应用在 `WHERE` 子句中的过滤器列表。 |

<Image size="md" img={demo_table_query} alt="聚合表查询示例" border />

此查询类型会将数据渲染为表格。

### 日志 {#logs}

日志查询类型提供了一个专注于查询日志数据的查询构建器。
可以在数据源的[日志配置](./config.md#logs)中配置默认值，使查询构建器预加载默认数据库/表和列。
也可以启用 OpenTelemetry，根据 schema 版本自动选择列。

默认会添加 **Time** 和 **Level** 过滤器，并为 Time 列添加一个 Order By。
这些过滤器会绑定到各自的字段，当列发生变化时会自动更新。
**Level** 过滤器默认不会包含在 SQL 中，将其从 `IS ANYTHING` 选项更改后才会启用。

日志查询类型支持 [data links](#data-links)。

| 字段 | 描述 |
|----|----|
| Use OTel | 启用 OpenTelemetry 列。会覆盖已选择的列，改为使用所选 OTel schema 版本定义的列（同时禁用列选择）。 |
| Columns | 要添加到日志行中的额外列。可以在此字段中输入原始 SQL，以便使用函数和列别名。 |
| Time | 日志的主时间戳列。会显示类似时间的类型，但也允许使用自定义值/函数。 |
| Log Level | 可选。日志的 *级别* 或 *严重性*。典型取值类似 `INFO`、`error`、`Debug` 等。 |
| Message | 日志消息内容。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。 |
| Limit | 在查询末尾追加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则会被省略，但对于大型日志数据集不推荐这样做。 |
| Filters | 要应用在 `WHERE` 子句中的过滤器列表。 |
| Message Filter | 用于通过 `LIKE %value%` 便捷过滤日志的文本输入框。当输入为空时会被省略。 |

<Image size="md" img={demo_logs_query} alt="OTel 日志查询示例" border />

<br/>
此查询类型会在日志面板中渲染数据，并在顶部显示一个日志直方图面板。

在查询中选取的额外列可以在展开的日志行中查看：
<Image size="md" img={demo_logs_query_fields} alt="日志查询中额外字段示例" border />

### 时间序列 {#time-series}

时间序列查询类型与 [table](#table) 类似，但重点针对时间序列数据。

两种视图大体相同，主要差异包括：
- 专用的 *Time* 字段。
- 在 Aggregate 模式下，会自动应用时间间隔宏，并对 Time 字段添加 Group By。
- 在 Aggregate 模式下会隐藏 "Columns" 字段。
- 会为 **Time** 字段自动添加时间范围过滤器和 Order By。

:::important 可视化中是否缺少数据？
在某些情况下，时间序列面板看起来会被截断，因为 limit 默认值为 `1000`。

如果数据集允许，请尝试通过将其设置为 `0` 来移除 `LIMIT` 子句。
:::



| Field | Description |
|----|----|
| Builder Mode  | 简单查询会排除 Aggregates 和 Group By，而聚合查询会包含这些选项。 |
| Time | 查询的主时间列。会显示时间及类似时间的类型，同时也允许自定义值/函数。 |
| Columns | 选定的列。可以在此字段中输入原生 SQL，以使用函数和列别名。仅在 Simple 模式下可见。 |
| Aggregates | [聚合函数](/sql-reference/aggregate-functions/index.md)列表。允许为函数和列指定自定义值。仅在 Aggregate 模式下可见。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在 Aggregate 模式下可见。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。 |
| Limit | 在查询末尾追加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则会被省略；对于某些时间序列数据集，建议这样设置以展示完整的可视化结果。 |
| Filters | 要应用在 `WHERE` 子句中的过滤器列表。 |

<Image size="md" img={demo_time_series_query} alt="时间序列查询示例" border />

此查询类型会使用时间序列面板来渲染数据。

### Traces {#traces}

Trace 查询类型提供了一个查询构建器，用于便捷地搜索和查看 traces。
它是为 OpenTelemetry 数据设计的，但也可以选择不同 schema 中的列来渲染 traces。
可以在数据源的 [trace 配置](./config.md#traces) 中配置默认值，使查询构建器预加载默认数据库/表和列。如果配置了默认值，列选择将默认折叠。
还可以启用 OpenTelemetry，根据 schema 版本自动选择列。

默认过滤器旨在仅显示顶层 span。
同时包含对 Time 和 Duration Time 列的 Order By 排序。
这些过滤器与各自字段绑定，在列发生变更时会自动更新。
**Service Name** 过滤器默认不会包含在 SQL 中，将其从 `IS ANYTHING` 选项修改后才会启用。

Trace 查询类型支持 [data links](#data-links)。

| Field | Description |
|----|----|
| Trace Mode | 将查询在 Trace Search 和 Trace ID 查找之间切换。 |
| Use OTel | 启用 OpenTelemetry 列。会覆盖当前选定列，改用所选 OTel schema 版本定义的列（禁用列选择）。 |
| Trace ID Column | Trace 的 ID。 |
| Span ID Column | Span ID。 |
| Parent Span ID Column | 父 span ID。对于顶层 trace 通常为空。 |
| Service Name Column | 服务名称。 |
| Operation Name Column | 操作名称。 |
| Start Time Column | trace span 的主时间列，即 span 开始的时间。 |
| Duration Time Column | span 的持续时间。默认情况下 Grafana 期望此值为以毫秒为单位的浮点数。会通过 `Duration Unit` 下拉菜单自动进行转换。 |
| Duration Unit | 持续时间所使用的时间单位。默认是纳秒。所选单位会按 Grafana 要求转换为以毫秒为单位的浮点数。 |
| Tags Column | Span Tags。如果不是使用基于 OTel 的 schema，请排除此列，因为它期望一个特定的 Map 列类型。 |
| Service Tags Column | Service Tags。如果不是使用基于 OTel 的 schema，请排除此列，因为它期望一个特定的 Map 列类型。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。 |
| Limit | 在查询末尾追加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则会被省略，但对于大型 trace 数据集不推荐这样做。 |
| Filters | 要应用在 `WHERE` 子句中的过滤器列表。 |
| Trace ID | 要过滤的 Trace ID。仅在 Trace ID 模式下使用，以及打开 Trace ID [data link](#data-links) 时使用。 |

<Image size="md" img={demo_trace_query} alt="OTel trace 查询示例" border />

此查询类型会在 Trace Search 模式下使用表格视图渲染数据，在 Trace ID 模式下使用 trace 面板渲染数据。



## SQL 编辑器 {#sql-editor}

对于过于复杂而无法通过查询构建器完成的查询，你可以使用 SQL 编辑器。
这使你能够直接编写并运行原生 ClickHouse SQL，从而完全掌控查询。

可以在查询编辑器顶部选择“SQL Editor”来打开 SQL 编辑器。

在此模式下仍然可以使用[宏函数](#macros)。

你可以在不同查询类型之间切换，以获得最适合当前查询的可视化效果。
该切换在仪表盘视图中同样会产生影响，尤其是在处理时间序列数据时。

<Image size="md" img={demo_raw_sql_query} alt="原始 SQL 查询示例" border />



## 数据链接 {#data-links}

Grafana 的 [data links](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可用于跳转到新的查询。
此功能已在 ClickHouse 插件中启用，用于在 trace 与日志之间互相跳转。当在数据源配置（[data source's config](./config.md#opentelemetry)）中为日志和 trace 同时启用 OpenTelemetry 时，效果最佳。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表格中 trace 链接示例
  <Image size="sm" img={trace_id_in_table} alt="表格中的 trace 链接" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中 trace 链接示例
  <Image size="md" img={trace_id_in_logs} alt="日志中的 trace 链接" border />
</div>

### 如何创建数据链接 {#how-to-make-a-data-link}

您可以在查询中选择名为 `traceID` 的列来创建数据链接。该名称不区分大小写，并且支持在 “ID” 前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在 [log](#logs) 或 [trace](#traces) 查询中启用了 OpenTelemetry，将会自动包含一个 trace ID 列。

通过包含 trace ID 列，数据上会自动附加 “**View Trace**” 和 “**View Logs**” 链接。

### 链接功能 {#linking-abilities}

在配置了数据链接后，可以使用提供的 trace ID 打开 trace 和日志。

“**View Trace**” 会打开一个包含该 trace 的分屏面板，而 “**View Logs**” 会打开一个按该 trace ID 过滤的日志查询。
如果在仪表盘而不是 Explore 视图中点击该链接，该链接会在 Explore 视图中的新标签页中打开。

当跨查询类型（从日志到 trace，或从 trace 到日志）跳转时，需要为 [logs](./config.md#logs) 和 [traces](./config.md#traces) 都配置默认值。打开同一查询类型的链接时则不需要默认值，因为查询可以直接复制。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从日志查询（左侧面板）查看 trace（右侧面板）的示例
  <Image size="md" img={demo_data_links} alt="数据链接跳转示例" border />
</div>



## 宏 {#macros}

宏是一种在查询中添加动态 SQL 的简单方式。
在查询被发送到 ClickHouse 服务器之前，插件会展开宏并将其替换为完整的表达式。

来自 SQL Editor 和 Query Builder 的查询都可以使用宏。

### 使用宏 {#using-macros}

宏可以出现在查询中的任意位置，必要时可以多次使用。

下面是使用 `$__timeFilter` 宏的示例：

输入：

```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最终查询结果：

```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

在此示例中，Grafana 仪表板的时间范围应用到了 `log_time` 列。

该插件还支持使用花括号 `{}` 的语法。当需要在[参数](/sql-reference/syntax.md#defining-and-using-query-parameters)中编写查询时，请使用这种语法。

### 宏列表 {#list-of-macros}

下面列出了插件中可用的所有宏：

| Macro                                        | Description                                                                                         | Output example                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 使用 Grafana 面板的时间范围，将其视为 [Date](/sql-reference/data-types/date.md)，在指定列上替换为基于该时间范围的过滤条件。             | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 使用 Grafana 面板的时间范围，将其视为 [DateTime](/sql-reference/data-types/datetime.md)，在指定列上替换为基于该时间范围的过滤条件。     | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 使用 Grafana 面板的时间范围，将其视为 [DateTime64](/sql-reference/data-types/datetime64.md)，在指定列上替换为基于该时间范围的过滤条件。 | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 一个简写形式，将 `$__dateFilter()` 和 `$__timeFilter()` 组合起来，分别作用于 Date 和 DateTime 列。别名为 `$__dt()`           | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | 替换为 Grafana 面板时间范围的起始时间，并将其转换为 [DateTime](/sql-reference/data-types/datetime.md)。                   | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 替换为面板时间范围的起始时间，并将其转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。                        | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | 替换为 Grafana 面板时间范围的结束时间，并将其转换为 [DateTime](/sql-reference/data-types/datetime.md)。                   | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | 替换为 Grafana 面板时间范围的结束时间，并将其转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。               | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 替换为一个根据窗口大小（以秒为单位）计算时间区间的函数。                                                                        | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | 替换为一个根据窗口大小（以毫秒为单位）计算时间区间的函数。                                                                       | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 替换为仪表板时间区间的秒数。                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量未选择所有值时，替换为第一个参数；当模板变量选择了所有值时，替换为 `1=1`。                                                | `condition` 或 `1=1`                                                                                               |
