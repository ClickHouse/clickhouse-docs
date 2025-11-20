---
sidebar_label: '查询生成器'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: '在 ClickHouse Grafana 插件中使用查询生成器'
title: '查询生成器'
doc_type: 'guide'
keywords: ['grafana', 'query builder', 'visualization', 'dashboards', 'plugin']
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


# 查询构建器

<ClickHouseSupportedBadge/>

任何查询都可以通过 ClickHouse 插件运行。
查询构建器适用于较为简单的查询；对于复杂查询，你需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个[查询类型](#query-types)，并且至少需要选择一个列。

可用的查询类型包括：
- [Table](#table)：最简单的查询类型，用于以表格形式展示数据。适用于包含聚合函数的简单或复杂查询，可作为通用选项。
- [Logs](#logs)：针对日志查询构建进行了优化。在已[配置默认值](./config.md#logs)的探索视图中效果最佳。
- [Time Series](#time-series)：最适合构建时序查询。允许选择专用的时间列并添加聚合函数。
- [Traces](#traces)：针对跟踪数据的搜索/查看进行了优化。在已[配置默认值](./config.md#traces)的探索视图中效果最佳。
- [SQL Editor](#sql-editor)：当你需要对查询进行完全控制时，可以使用 SQL 编辑器。在此模式下，可以执行任意 SQL 查询。



## 查询类型 {#query-types}

_Query Type_（查询类型）设置会根据正在构建的查询类型调整查询构建器的布局。
查询类型还会决定在可视化数据时使用哪个面板。

### 表 {#table}

最灵活的查询类型是表查询。它是一个通用查询构建器，用于处理简单查询和聚合查询。

| 字段         | 说明                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Builder Mode | 构建模式。简单查询会排除聚合和 Group By，而聚合查询则会包含这些选项。                                                                                                                                        |
| Columns      | 选中的列。可以在此字段中输入原始 SQL，从而使用函数和列别名。                                                                                                                                                |
| Aggregates   | [聚合函数](/sql-reference/aggregate-functions/index.md)列表。支持为函数和列设置自定义值。仅在聚合模式下可见。                                                                                               |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在聚合模式下可见。                                                                                                                   |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                                                        |
| Limit        | 在查询末尾追加 [LIMIT](/sql-reference/statements/select/limit.md) 子句。如果设置为 `0`，则不会追加该子句。某些可视化可能需要将其设置为 `0` 才能展示全部数据。                                                |
| Filters      | 要应用到 `WHERE` 子句中的过滤条件列表。                                                                                                                                                                     |

<Image
  size='md'
  img={demo_table_query}
  alt='表格聚合查询示例'
  border
/>

此查询类型会以表格形式呈现数据。

### 日志 {#logs}

日志查询类型提供了一个专门用于查询日志数据的查询构建器。
可以在数据源的[日志配置](./config.md#logs)中设置默认值，使查询构建器预先加载默认的数据库/表以及列。
还可以启用 OpenTelemetry，根据架构版本自动选择列。

默认会添加 **Time** 和 **Level** 过滤器，并为 Time 列添加一个 Order By。
这些过滤器与各自的字段绑定，在列发生变化时会自动更新。
默认情况下，**Level** 过滤器不会包含在生成的 SQL 中；将其从 `IS ANYTHING` 选项修改为其他值后即会启用该过滤器。

日志查询类型支持[数据链接](#data-links)。

| 字段           | 说明                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Use OTel       | 启用 OpenTelemetry 列。会覆盖当前选中的列，改为使用所选 OTel 架构版本中定义的列（此时无法手动选择列）。                                                                                       |
| Columns        | 要添加到日志行中的额外列。可以在此字段中输入原始 SQL，从而使用函数和列别名。                                                                                                               |
| Time           | 日志的主时间戳列。会显示时间类型或类时间类型，但也允许自定义值或函数。                                                                                                                     |
| Log Level      | 可选。日志的 _级别_ 或 _严重性_。典型取值包括 `INFO`、`error`、`Debug` 等。                                                                                                                 |
| Message        | 日志消息内容。                                                                                                                                                                             |
| Order By       | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                                       |
| Limit          | 在查询末尾追加 [LIMIT](/sql-reference/statements/select/limit.md) 子句。如果设置为 `0`，则不会追加该子句，但对于大型日志数据集不建议这样做。                                                |
| Filters        | 要应用到 `WHERE` 子句中的过滤条件列表。                                                                                                                                                    |
| Message Filter | 文本输入框，用于便捷地通过 `LIKE %value%` 过滤日志。输入为空时不会包含在查询中。                                                                                                           |

<Image size='md' img={demo_logs_query} alt='OTel 日志查询示例' border />

<br />
此查询类型会在日志面板中呈现数据，并在顶部显示一个日志直方图面板。

在查询中选中的额外列可以通过展开日志行来查看：

<Image
  size='md'
  img={demo_logs_query_fields}
  alt='日志查询中额外字段示例'
  border
/>

### 时间序列 {#time-series}

时间序列查询类型与[表](#table)类似，但更侧重于时间序列数据。

这两种视图大体相同，但存在以下显著差异：

- 提供专门的 _Time_ 字段。
- 在聚合模式下，会自动应用时间间隔宏，并为 Time 字段添加 Group By。
- 在聚合模式下，会隐藏“Columns”字段。
- 会自动为 **Time** 字段添加时间范围过滤器和 Order By。

:::important 你的可视化是否缺少数据？
在某些情况下，时间序列面板看起来像是被截断，这是因为默认的 LIMIT 为 `1000`。

如果数据集允许，可以尝试将 `LIMIT` 设置为 `0` 来移除该子句。
:::


| 字段        | 描述                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Builder Mode | 简单查询不包含聚合和 Group By,而聚合查询包含这些选项。                                                                                                                                     |
| Time         | 查询的主时间列。将显示时间类型,但允许使用自定义值/函数。                                                                                                                       |
| Columns      | 选定的列。可以在此字段中输入原始 SQL 以支持函数和列别名。仅在简单模式下可见。                                                                                                |
| Aggregates   | [聚合函数](/sql-reference/aggregate-functions/index.md)列表。允许为函数和列设置自定义值。仅在聚合模式下可见。                                                                    |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在聚合模式下可见。                                                                                                                    |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                                                                    |
| Limit        | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则将被排除,对于某些时间序列数据集,建议这样做以显示完整的可视化效果。 |
| Filters      | 要在 `WHERE` 子句中应用的过滤器列表。                                                                                                                                                                             |

<Image
  size='md'
  img={demo_time_series_query}
  alt='时间序列查询示例'
  border
/>

此查询类型将使用时间序列面板呈现数据。

### Traces(追踪) {#traces}

追踪查询类型提供了一个查询构建器,用于轻松搜索和查看追踪。
它专为 OpenTelemetry 数据设计,但可以选择列来呈现来自不同模式的追踪。
可以在数据源的[追踪配置](./config.md#traces)中配置默认值,以允许查询构建器预加载默认数据库/表和列。如果配置了默认值,列选择将默认折叠。
还可以启用 OpenTelemetry 以根据模式版本自动选择列。

默认添加过滤器以仅显示顶级 span。
还包括对 Time 和 Duration Time 列的 Order By。
这些过滤器与各自的字段绑定,并将随着列的更改而更新。
默认情况下,**Service Name** 过滤器从 SQL 中排除,将其从 `IS ANYTHING` 选项更改将启用它。

追踪查询类型支持[数据链接](#data-links)。

| 字段                 | 描述                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trace Mode            | 将查询从追踪搜索更改为 Trace ID 查找。                                                                                                                                      |
| Use OTel              | 启用 OpenTelemetry 列。将覆盖选定的列以使用所选 OTel 模式版本定义的列(禁用列选择)。                                   |
| Trace ID Column       | 追踪的 ID。                                                                                                                                                                              |
| Span ID Column        | Span ID。                                                                                                                                                                                     |
| Parent Span ID Column | 父 span ID。对于顶级追踪,这通常为空。                                                                                                                                  |
| Service Name Column   | 服务名称。                                                                                                                                                                                |
| Operation Name Column | 操作名称。                                                                                                                                                                              |
| Start Time Column     | 追踪 span 的主时间列。span 开始的时间。                                                                                                                  |
| Duration Time Column  | span 的持续时间。默认情况下,Grafana 期望这是以毫秒为单位的浮点数。通过 `Duration Unit` 下拉菜单自动应用转换。                             |
| Duration Unit         | 用于持续时间的时间单位。默认为纳秒。所选单位将根据 Grafana 的要求转换为以毫秒为单位的浮点数。                                       |
| Tags Column           | Span 标签。如果不使用基于 OTel 的模式,请排除此项,因为它需要特定的 Map 列类型。                                                                                          |
| Service Tags Column   | 服务标签。如果不使用基于 OTel 的模式,请排除此项,因为它需要特定的 Map 列类型。                                                                                       |
| Order By              | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                              |
| Limit                 | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则将被排除,但对于大型追踪数据集不建议这样做。 |
| Filters               | 要在 `WHERE` 子句中应用的过滤器列表。                                                                                                                                       |
| Trace ID              | 要过滤的 Trace ID。仅在 Trace ID 模式下使用,以及打开 trace ID [数据链接](#data-links)时使用。                                                                                 |

<Image size='md' img={demo_trace_query} alt='OTel 追踪查询示例' border />

此查询类型将在追踪搜索模式下使用表格视图呈现数据,在 Trace ID 模式下使用追踪面板呈现数据。


## SQL 编辑器 {#sql-editor}

对于查询构建器难以处理的复杂查询,您可以使用 SQL 编辑器。
通过编写和运行原生 ClickHouse SQL,您可以完全掌控查询。

在查询编辑器顶部选择"SQL Editor"即可打开 SQL 编辑器。

在此模式下仍可使用[宏函数](#macros)。

您可以切换查询类型,以获得最适合您查询的可视化效果。

此切换在仪表板视图中同样生效,尤其适用于时间序列数据。

<Image size='md' img={demo_raw_sql_query} alt='原生 SQL 查询示例' border />


## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)可用于链接到新的查询。

ClickHouse 插件已启用此功能,用于在追踪和日志之间建立链接。当在[数据源配置](./config.md#opentelemetry)中为日志和追踪都配置了 OpenTelemetry 时,此功能效果最佳。

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "15px"
  }}
>
  表格中追踪链接的示例
  <Image size='sm' img={trace_id_in_table} alt='表格中的追踪链接' border />
</div>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  }}
>
  日志中追踪链接的示例
  <Image size='md' img={trace_id_in_logs} alt='日志中的追踪链接' border />
</div>

### 如何创建数据链接 {#how-to-make-a-data-link}

您可以通过在查询中选择名为 `traceID` 的列来创建数据链接。此名称不区分大小写,并支持在 "ID" 前添加下划线。例如:`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在[日志](#logs)或[追踪](#traces)查询中启用了 OpenTelemetry,则会自动包含追踪 ID 列。

通过包含追踪 ID 列,数据将附带"**查看追踪**"和"**查看日志**"链接。

### 链接功能 {#linking-abilities}

有了数据链接后,您可以使用提供的追踪 ID 打开追踪和日志。

"**查看追踪**"将打开一个包含追踪信息的拆分面板,"**查看日志**"将打开一个按追踪 ID 过滤的日志查询。
如果从仪表板而不是探索视图中点击链接,该链接将在探索视图的新标签页中打开。

在跨查询类型(从日志到追踪以及从追踪到日志)时,需要为[日志](./config.md#logs)和[追踪](./config.md#traces)都配置默认值。当打开相同查询类型的链接时不需要配置默认值,因为可以直接复制查询。

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  }}
>
  从日志查询(左侧面板)查看追踪(右侧面板)的示例
  <Image
    size='md'
    img={demo_data_links}
    alt='数据链接关联示例'
    border
  />
</div>


## 宏 {#macros}

宏是向查询添加动态 SQL 的简便方法。
在查询发送到 ClickHouse 服务器之前,插件会展开宏并将其替换为完整表达式。

SQL 编辑器和查询构建器中的查询都可以使用宏。

### 使用宏 {#using-macros}

宏可以在查询中的任意位置使用,如有需要可以多次使用。

以下是使用 `$__timeFilter` 宏的示例:

输入:

```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最终查询输出:

```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

在此示例中,Grafana 仪表板的时间范围应用于 `log_time` 列。

插件还支持使用大括号 `{}` 的表示法。当需要在[参数](/sql-reference/syntax.md#defining-and-using-query-parameters)内部使用查询时,请使用此表示法。

### 宏列表 {#list-of-macros}

以下是插件中所有可用宏的列表:

| 宏                                        | 描述                                                                                                                                                                         | 输出示例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 使用 Grafana 面板的时间范围作为 [Date](/sql-reference/data-types/date.md) 类型,替换为对指定列的时间范围过滤器。                                         | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md) 类型,替换为对指定列的时间范围过滤器。                                 | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md) 类型,替换为对指定列的时间范围过滤器。                             | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 使用独立的 Date 和 DateTime 列组合 `$__dateFilter()` 和 `$__timeFilter()` 的简写形式。别名为 `$__dt()`                                                           | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | 替换为 Grafana 面板范围的起始时间,转换为 [DateTime](/sql-reference/data-types/datetime.md) 类型。                                                               | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 替换为面板范围的起始时间,转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 类型。                                                                   | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | 替换为 Grafana 面板范围的结束时间,转换为 [DateTime](/sql-reference/data-types/datetime.md) 类型。                                                                 | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | 替换为面板范围的结束时间,转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 类型。                                                                     | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 替换为根据窗口大小(以秒为单位)计算时间间隔的函数。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | 替换为根据窗口大小(以毫秒为单位)计算时间间隔的函数。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 替换为仪表板时间间隔(以秒为单位)。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量未选择所有值时,替换为第一个参数。当模板变量选择所有值时,替换为 1=1。 | `condition` 或 `1=1`                                                                                              |
