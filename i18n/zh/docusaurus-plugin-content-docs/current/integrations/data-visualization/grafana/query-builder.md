---
sidebar_label: '查询构建器'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: '在 ClickHouse Grafana 插件中使用查询构建器'
---

import demo_table_query from '@site/static/images/integrations/data-visualization/grafana/demo_table_query.png';
import demo_logs_query from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query.png';
import demo_logs_query_fields from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query_fields.png';
import demo_time_series_query from '@site/static/images/integrations/data-visualization/grafana/demo_time_series_query.png';
import demo_trace_query from '@site/static/images/integrations/data-visualization/grafana/demo_trace_query.png';
import demo_raw_sql_query from '@site/static/images/integrations/data-visualization/grafana/demo_raw_sql_query.png';
import trace_id_in_table from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_table.png';
import trace_id_in_logs from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_logs.png';
import demo_data_links from '@site/static/images/integrations/data-visualization/grafana/demo_data_links.png';


# 查询构建器

任何查询都可以使用 ClickHouse 插件运行。
查询构建器是一个便捷的选项，适用于简单的查询，但对于复杂查询，您将需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个 [查询类型](#query-types)，并且至少需要选择一个列。

可用的查询类型包括：
- [表](#table)：最简单的查询类型，用于以表格格式显示数据。适合简单和包含聚合函数的复杂查询。
- [日志](#logs)：特别针对构建日志查询进行优化。最适合在探索视图中使用，需 [配置默认值](./config.md#logs)。
- [时间序列](#time-series)：最适合于构建时间序列查询。允许选择专门的时间列并添加聚合函数。
- [追踪](#traces)：特别优化用于搜索/查看追踪。最适合在探索视图中使用，需 [配置默认值](./config.md#traces)。
- [SQL 编辑器](#sql-editor)：当您希望完全控制查询时，可以使用 SQL 编辑器。在此模式下，可以执行任何 SQL 查询。

## 查询类型 {#query-types}

*查询类型* 设置将改变查询构建器的布局，以匹配正在构建的查询类型。
查询类型还决定在可视化数据时使用哪个面板。

### 表 {#table}

最灵活的查询类型是表查询。这是一个包含其他查询构建器的所有查询类型，适用于处理简单和聚合查询。

| 字段 | 描述 |
|----|----|
| 构建模式 | 简单查询排除聚合和分组，而聚合查询包括这些选项。 |
| 列 | 选择的列。可以在此字段中输入原始 SQL 以允许功能和列别名。 |
| 聚合 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许自定义函数和列的值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则将被排除。有些可视化可能需要此设置为 `0` 以显示所有数据。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |

<img src={demo_table_query} class="image" alt="示例聚合表查询" />

此查询类型将数据呈现为表。

### 日志 {#logs}

日志查询类型提供一个专注于查询日志数据的查询构建器。
可以在数据源的 [日志配置](./config.md#logs) 中配置默认值，以便查询构建器预加载默认数据库/表和列。
还可以启用 OpenTelemetry，以根据模式版本自动选择列。

**时间** 和 **级别** 过滤器默认添加，并为时间列添加了排序。
这些过滤器与各自字段绑定，并在列更改时更新。
**级别** 过滤器默认情况下排除在 SQL 中，更改为 `IS ANYTHING` 选项将启用它。

日志查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖选择的列以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 列 | 要添加到日志行中的额外列。可以在此字段中输入原始 SQL 以允许功能和列别名。 |
| 时间 | 日志的主要时间戳列。将显示类似时间的类型，但允许自定义值/函数。 |
| 日志级别 | 可选。日志的 *级别* 或 *严重性*。值通常类似于 `INFO`、`error`、`Debug` 等。 |
| 消息 | 日志消息内容。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则将被排除，但不建议对大日志数据集这样做。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |
| 消息过滤器 | 一个文本输入，方便使用 `LIKE %value%` 过滤日志。当输入为空时排除。 |

<img src={demo_logs_query} class="image" alt="示例 OTel 日志查询" />

<br/>
此查询类型将在日志面板中呈现数据，并在顶部显示日志直方图面板。

在扩展日志行中可以查看查询中选择的额外列：
<img src={demo_logs_query_fields} class="image" alt="示例的日志查询额外字段" />

### 时间序列 {#time-series}

时间序列查询类型类似于 [表](#table)，但专注于时间序列数据。

这两种视图大致相同，主要有以下不同之处：
  - 一个专用的 *时间* 字段。
  - 在聚合模式下，自动应用时间间隔宏并对时间字段进行分组。
  - 在聚合模式下，隐藏“列”字段。
  - 自动为 **时间** 字段添加时间范围过滤器和排序。

:::important 你的可视化缺少数据吗？
在某些情况下，时间序列面板似乎被截断，因为限制默认设置为 `1000`。

尝试通过将 `LIMIT` 子句设置为 `0` 来移除它（如果你的数据集允许的话）。
:::

| 字段 | 描述 |
|----|----|
| 构建模式 | 简单查询排除聚合和分组，而聚合查询包括这些选项。 |
| 时间 | 查询的主要时间列。将显示类似时间的类型，但允许自定义值/函数。 |
| 列 | 选择的列。可以在此字段中输入原始 SQL 以允许功能和列别名。仅在简单模式下可见。 |
| 聚合 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许自定义函数和列的值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则将被排除，建议在一些时间序列数据集中这样做，以显示完整的可视化。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |

<img src={demo_time_series_query} class="image" alt="示例时间序列查询" />

此查询类型将在时间序列面板中呈现数据。

### 追踪 {#traces}

追踪查询类型提供一个用于轻松搜索和查看追踪的查询构建器。
它专为 OpenTelemetry 数据设计，但可以选择列以从不同模式呈现追踪。
可以在数据源的 [追踪配置](./config.md#traces) 中配置默认值，以便查询构建器预加载默认数据库/表和列。如果配置了默认值，列选择将默认折叠。
还可以启用 OpenTelemetry，以根据模式版本自动选择列。

默认过滤器被添加，以显示仅有顶级跨度。
还包括对时间和持续时间时间列的排序。
这些过滤器与各自字段绑定，并在列更改时更新。
**服务名称** 过滤器默认情况下排除在 SQL 中，更改为 `IS ANYTHING` 选项将启用它。

追踪查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 追踪模式 | 将查询从追踪搜索更改为追踪 ID 查找。 |
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖选择的列以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 追踪 ID 列 | 追踪的 ID。 |
| Span ID 列 | Span ID。 |
| Parent Span ID 列 | 父跨度 ID。通常在顶级追踪中为空。 |
| 服务名称列 | 服务名称。 |
| 操作名称列 | 操作名称。 |
| 起始时间列 | 追踪跨度的主要时间列。跨度开始时的时间。 |
| 持续时间时间列 | 跨度的持续时间。默认情况下，Grafana 期望这是以毫秒为单位的浮点数。通过 `Duration Unit` 下拉框自动应用转换。 |
| 持续时间单位 | 用于持续时间的时间单位。默认以纳秒为单位。所选单位将根据 Grafana 的要求转换为毫秒浮点数。 |
| 标签列 | Span 标签。如果没有使用 OTel 基于模式，则排除，因为它期望特定的 Map 列类型。 |
| 服务标签列 | 服务标签。如果没有使用 OTel 基于模式，则排除，因为它期望特定的 Map 列类型。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则将被排除，但不建议对大追踪数据集这样做。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |
| 追踪 ID | 过滤的追踪 ID。仅在追踪 ID 模式中使用，并在打开追踪 ID [数据链接](#data-links) 时使用。 |

<img src={demo_trace_query} class="image" alt="示例 OTel 追踪查询" />

此查询类型将在追踪搜索模式下以表格视图呈现数据，在追踪 ID 模式下以追踪面板呈现数据。

## SQL 编辑器 {#sql-editor}

对于查询构建器无法处理的复杂查询，您可以使用 SQL 编辑器。
这使您可以完全控制查询，允许您编写和运行原始的 ClickHouse SQL。

通过在查询编辑器顶部选择“SQL 编辑器”可以打开 SQL 编辑器。

在此模式下仍然可以使用 [宏函数](#macros)。

您可以在查询类型之间切换，以获得最佳适合您的查询的可视化。
此切换在仪表板视图中也有效，尤其是对于时间序列数据。

<img src={demo_raw_sql_query} class="image" alt="示例原始 SQL 查询" />

## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可用于链接到新的查询。
在 ClickHouse 插件中启用了此功能，以便将追踪链接到日志，反之亦然。对于在 [数据源配置](./config.md#opentelemetry) 中为日志和追踪都配置好的 OpenTelemetry，它的效果最佳。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表中追踪链接示例
  <img src={trace_id_in_table} class="image" alt="表中的追踪链接" />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中追踪链接示例
  <img src={trace_id_in_logs} class="image" alt="日志中的追踪链接" />
</div>

### 如何创建数据链接 {#how-to-make-a-data-link}

您可以通过选择查询中名为 `traceID` 的列来创建数据链接。此名称不区分大小写，并支持在“ID”之前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在 [日志](#logs) 或 [追踪](#traces) 查询中启用了 OpenTelemetry，则将自动包含追踪 ID 列。

通过包括追踪 ID 列，"**查看追踪**" 和 "**查看日志**" 链接将附加到数据上。

### 链接功能 {#linking-abilities}

使用数据链接，您可以使用提供的追踪 ID 打开追踪和日志。

"**查看追踪**" 将打开一个分割面板，其中显示追踪，"**查看日志**" 将打开一个按追踪 ID 过滤的日志查询。
如果链接是从仪表板而不是探索视图中点击的，则链接将在探索视图中以新标签页打开。

配置默认值以便于 [日志](./config.md#logs) 和 [追踪](./config.md#traces) 的链接类型之间交叉时是必需的（日志到追踪和追踪到日志）。在打开相同查询类型的链接时不需要配置默认值，因为查询可以简单复制。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从日志查询（左面板）查看追踪（右面板）的示例
  <img src={demo_data_links} class="image" alt="数据链接的示例" />
</div>

## 宏 {#macros}

宏是将动态 SQL 添加到查询的简单方法。
在查询发送到 ClickHouse 服务器之前，插件将扩展宏并将其替换为完整表达式。

来自 SQL 编辑器和查询构建器的查询均可以使用宏。

### 使用宏 {#using-macros}

宏可以在查询的任何位置包含，多次使用也可以。

以下是使用 `$__timeFilter` 宏的示例：

输入：
```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最终查询输出：
```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

在这个例子中，使用了 Grafana 仪表板的时间范围应用于 `log_time` 列。

插件还支持使用大括号 `{}` 的表示法。在需要在 [参数](/sql-reference/syntax.md#defining-and-using-query-parameters) 内的查询中使用此表示法。

### 宏列表 {#list-of-macros}

以下是插件中所有可用宏的列表：

| 宏                                           | 描述                                                                                                                                                                              | 输出示例                                                                                                       |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `$__dateFilter(columnName)`                  | 用提供列的时间范围过滤器替换，使用 Grafana 面板的时间范围作为 [日期](/sql-reference/data-types/date.md)。                                                                  | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                     |
| `$__timeFilter(columnName)`                  | 用提供列的时间范围过滤器替换，使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md)。                                                        | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                              |
| `$__timeFilter_ms(columnName)`               | 用提供列的时间范围过滤器替换，使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                                    | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 组合 `$__dateFilter()` 和 `$__timeFilter()` 的简写，使用独立的日期和 DateTime 列。别名为 `$__dt()`                                                                 | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                       |
| `$__fromTime`                                | 用 Grafana 面板范围的起始时间替换并转换为 [DateTime](/sql-reference/data-types/datetime.md)。                                                                              | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 用面板范围的起始时间替换并转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                                                                 | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | 用 Grafana 面板范围的结束时间替换并转换为 [DateTime](/sql-reference/data-types/datetime.md)。                                                                               | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | 用面板范围的结束时间替换并转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                                                                  | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 用计算基于窗口大小（以秒为单位）间隔的函数替换。                                                                                                                                 | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                  |
| `$__timeInterval_ms(columnName)`             | 用计算基于窗口大小（以毫秒为单位）间隔的函数替换。                                                                                                                                 | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 用面板间隔（以秒为单位）替换。                                                                                                                                                   | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量不选择所有值时，用第一个参数替换。当模板变量选择所有值时，用 1=1 替换。                                                                             | `condition` 或 `1=1`                                                                                              |
