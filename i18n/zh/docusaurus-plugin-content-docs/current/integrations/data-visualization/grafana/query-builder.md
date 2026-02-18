---
sidebar_label: '查询构建器'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: '在 Grafana ClickHouse 插件中使用查询构建器'
title: '查询构建器'
doc_type: '指南'
keywords: ['grafana', '查询构建器', '可视化', '仪表盘', '插件']
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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


# 查询构建器 \{#query-builder\}

<ClickHouseSupportedBadge/>

可以使用 ClickHouse 插件运行任意查询。
查询构建器是处理较简单查询的便捷选项，但对于复杂查询，则需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个[查询类型](#query-types)，并且至少需要选择一列。

可用的查询类型包括：

- [表格](#table)：用于以表格形式展示数据的最简单查询类型。适合作为包含聚合函数的简单和复杂查询的通用选项。
- [日志](#logs)：针对构建日志查询进行了优化。在已[配置默认值](./config.md#logs)的 Explore 视图中效果最佳。
- [时间序列](#time-series)：最适合用于构建时间序列查询。允许选择专用时间列并添加聚合函数。
- [追踪](#traces)：针对搜索和查看追踪数据进行了优化。在已[配置默认值](./config.md#traces)的 Explore 视图中效果最佳。
- [SQL 编辑器](#sql-editor)：当需要对查询进行完全控制时可以使用 SQL 编辑器。在此模式下，可以执行任意 SQL 查询。

## 查询类型 \{#query-types\}

*Query Type* 设置会更改查询构建器的布局，以匹配正在构建的查询类型。
查询类型还会决定在可视化数据时使用哪个面板。

### 表 \{#table\}

最灵活的查询类型是表查询。它是为其他查询构建器提供通用支持的类型，用于处理简单查询和聚合查询。

| 字段 | 描述 |
|----|----|
| Builder Mode  | 简单查询会排除 Aggregates 和 Group By，而聚合查询则包含这些选项。 |
| Columns | 已选列。可以在此字段中输入原始 SQL，以使用函数和列别名。 |
| Aggregates | [聚合函数](/sql-reference/aggregate-functions/index.md) 列表。允许为函数和列指定自定义值。仅在 Aggregate 模式下可见。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在 Aggregate 模式下可见。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。 |
| Limit | 在查询末尾追加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则会被省略。某些可视化可能需要将其设置为 `0` 才能显示全部数据。 |
| Filters | 将应用于 `WHERE` 子句的过滤条件列表。 |

<Image size="md" img={demo_table_query} alt="聚合表查询示例" border />

此查询类型会以表格形式渲染数据。

### 日志 \{#logs\}

日志查询类型提供了一个专门用于日志数据的查询构建器。
默认值可以在数据源的[日志配置](./config.md#logs)中进行配置，以便让查询构建器预加载默认的数据库/表和列。
也可以启用 OpenTelemetry，根据 schema 版本自动选择列。

**Time** 和 **Level** 过滤器会默认添加，同时会为 Time 列添加一个 ORDER BY。
这些过滤器与各自的字段绑定，当列发生变更时会自动更新。
**Level** 过滤器在默认情况下不会包含在 SQL 中，将其从 `IS ANYTHING` 选项更改为其他值后会启用该过滤器。

日志查询类型支持[数据链接](#data-links)。

| Field | Description |
|----|----|
| Use OTel | 启用 OpenTelemetry 列。会覆盖当前选择的列，改为使用所选 OTel schema 版本中定义的列（禁用列选择）。 |
| Columns | 要添加到日志行中的额外列。可以在此字段中输入原始 SQL，以便使用函数和列别名。 |
| Time | 日志的主时间戳列。会优先显示时间类型，但也允许自定义值/函数。 |
| Log Level | 可选。日志的*级别*或*严重性*。典型值类似于 `INFO`、`error`、`Debug` 等。 |
| Message | 日志消息内容。 |
| Order By | 一组 [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式。 |
| Limit | 在查询末尾追加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。若设置为 `0` 则会被忽略，但对于大型日志数据集不推荐这样做。 |
| Filters | 在 `WHERE` 子句中要应用的过滤器列表。 |
| Message Filter | 用于便捷地使用 `LIKE %value%` 过滤日志的文本输入框。输入为空时会被忽略。 |

<Image size="md" img={demo_logs_query} alt="OTel 日志查询示例" border />

<br/>

此查询类型会在日志面板中渲染数据，并在顶部显示一个日志直方图面板。

在查询中选取的额外列可以在展开的日志行中查看：

<Image size="md" img={demo_logs_query_fields} alt="日志查询中额外字段示例" border />

### 时间序列 \{#time-series\}

时间序列查询类型与[表格](#table)类似，但更侧重于时间序列数据。

这两种视图大体相同，但有以下显著差异：

- 独立的 *Time* 字段。
- 在 Aggregate 模式下，会自动应用时间间隔宏，并对 Time 字段添加 Group By。
- 在 Aggregate 模式下，“Columns” 字段会被隐藏。
- 会为 **Time** 字段自动添加时间范围过滤器和 ORDER BY。

:::important 可视化中缺少数据？
在某些情况下，时间序列面板看起来像是被截断了，因为默认上限为 `1000`。

如果数据集允许，可以尝试将 `LIMIT` 子句设置为 `0` 以移除该限制。
:::

| 字段 | 描述 |
|----|----|
| Builder Mode  | 简单查询不包含 Aggregates 和 Group By，而聚合查询则包含这些选项。  |
| Time | 查询的主时间列。会显示时间类型或类似时间的类型，同时也支持自定义值/函数。 |
| Columns | 选中的列。可以在该字段中输入原始 SQL 语句，以使用函数和列别名。仅在 Simple 模式下可见。 |
| Aggregates | [聚合函数](/sql-reference/aggregate-functions/index.md)列表。允许为函数和列自定义值。仅在 Aggregate 模式下可见。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在 Aggregate 模式下可见。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。 |
| Limit | 在查询末尾追加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则不会追加。对于某些时间序列数据集，建议使用此设置以展示完整的可视化结果。 |
| Filters | `WHERE` 子句中要应用的过滤器列表。 |

<Image size="md" img={demo_time_series_query} alt="时间序列查询示例" border />

此查询类型会使用时间序列面板来渲染数据。

### Traces \{#traces\}

Trace 查询类型提供了一个查询构建器，便于搜索和查看 trace。
它为 OpenTelemetry 数据设计，但也可以通过选择不同的列，从其他 schema 渲染 trace。
可以在数据源的 [trace 配置](./config.md#traces) 中配置默认值，使查询构建器预加载默认的数据库/表和列。
如果配置了默认值，列选择区域将默认折叠。
也可以启用 OpenTelemetry，以根据 schema 版本自动选择列。

默认过滤器旨在仅显示顶层 span。
还会为 Time 和 Duration Time 列添加一个 Order By。
这些过滤器与各自的字段绑定，当列发生更改时会自动更新。
**Service Name** 过滤器默认不会包含在 SQL 中，将其从 `IS ANYTHING` 选项更改为其他值会启用该过滤器。

Trace 查询类型支持 [data links](#data-links)。

| Field | Description |
|----|----|
| Trace Mode | 将查询模式从 Trace Search 切换为 Trace ID 查找。 |
| Use OTel | 启用 OpenTelemetry 列。会覆盖已选择的列，改为使用选定 OTel schema 版本定义的列（禁用列选择）。 |
| Trace ID Column | trace 的 ID。 |
| Span ID Column | span 的 ID。 |
| Parent Span ID Column | 父 span 的 ID。对于顶层 trace 通常为空。 |
| Service Name Column | 服务名称。 |
| Operation Name Column | 操作名称。 |
| Start Time Column | trace span 的主时间列，即 span 开始的时间。 |
| Duration Time Column | span 的持续时间。默认情况下，Grafana 期望这是以毫秒为单位的浮点数。会通过 `Duration Unit` 下拉框自动进行转换。 |
| Duration Unit | 持续时间所使用的时间单位。默认是纳秒。所选单位将转换为 Grafana 所需的以毫秒为单位的浮点数。 |
| Tags Column | span 标签。如果未使用基于 OTel 的 schema，请排除该列，因为它需要特定的 Map 列类型。 |
| Service Tags Column | 服务标签。如果未使用基于 OTel 的 schema，请排除该列，因为它需要特定的 Map 列类型。 |
| Order By | 一组 [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式。 |
| Limit | 在查询末尾追加一个 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` 则会被省略，但对于大型 trace 数据集不建议这样做。 |
| Filters | 要应用于 `WHERE` 子句的一组过滤器。 |
| Trace ID | 用于过滤的 Trace ID。仅在 Trace ID 模式下使用，以及打开 Trace ID [data link](#data-links) 时使用。 |

<Image size="md" img={demo_trace_query} alt="OTel trace 查询示例" border />

此查询类型会在 Trace Search 模式下以表格视图渲染数据，在 Trace ID 模式下以 trace 面板渲染数据。

## SQL 编辑器 \{#sql-editor\}

对于使用查询构建器难以构建的复杂查询，可以使用 SQL 编辑器。
通过编写并运行纯 ClickHouse SQL，你可以对查询进行完全控制。

可以在查询编辑器顶部选择 "SQL Editor" 来打开 SQL 编辑器。

在此模式下仍然可以使用 [Macro functions](#macros)。

你可以在不同查询类型之间切换，以获得最适合当前查询的可视化结果。
即使在仪表板视图中，此切换同样会产生影响，尤其是对于时间序列数据。

<Image size="md" img={demo_raw_sql_query} alt="原始 SQL 查询示例" border />

## 数据链接 \{#data-links\}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可用于跳转到新的查询。
此功能已在 ClickHouse 插件中启用，可用于在 trace 和日志之间互相跳转。当在 [数据源配置](./config.md#opentelemetry) 中为日志和 trace 同时配置 OpenTelemetry 时效果最佳。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表格中 trace 链接示例
  <Image size="sm" img={trace_id_in_table} alt="表格中的 Trace 链接" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中 trace 链接示例
  <Image size="md" img={trace_id_in_logs} alt="日志中的 Trace 链接" border />
</div>

### 如何创建数据链接 \{#how-to-make-a-data-link\}

可以通过在查询中选择名为 `traceID` 的列来创建数据链接。该名称不区分大小写，并且支持在 "ID" 前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在启用 OpenTelemetry 的[日志](#logs)或[追踪](#traces)查询中，系统会自动包含一个 trace ID 列。

当查询结果中包含 trace ID 列时，"**View Trace**" 和 "**View Logs**" 链接将会附加到数据上。

### 链接功能 \{#linking-abilities\}

有了数据链接后，你可以使用提供的 trace ID 打开 traces 和 logs。

“**View Trace**” 会打开一个包含 trace 的分栏面板，而 “**View Logs**” 则会打开一个按该 trace ID 过滤的 logs 查询。
如果从 dashboard 而不是 Explore 视图中点击该链接，该链接会在 Explore 视图中的新标签页中打开。

在跨查询类型（从 logs 到 traces，或从 traces 到 logs）时，需要为 [logs](./config.md#logs) 和 [traces](./config.md#traces) 都配置默认值。对于同一查询类型的链接，则不需要默认值，因为查询可以直接复制。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从 logs 查询（左侧面板）查看 trace（右侧面板）的示例
  <Image size="md" img={demo_data_links} alt="Example of data links linking" border />
</div>

## 宏 \{#macros\}

宏是在查询中添加动态 SQL 的一种简单方式。
在查询被发送到 ClickHouse 服务器之前，插件会展开宏，并将其替换为完整的表达式。

来自 SQL 编辑器和查询构建器的查询都可以使用宏。

### 使用宏 \{#using-macros\}

宏可以在查询的任意位置使用，如果需要，可以多次使用。

以下是一个使用 `$__timeFilter` 宏的示例：

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

在此示例中，Grafana 仪表板的时间范围会应用到 `log_time` 列。

该插件也支持使用大括号 `{}` 的表示法。当需要在[参数](/sql-reference/syntax.md#defining-and-using-query-parameters)中使用查询时，请使用这种表示法。


### 宏列表 \{#list-of-macros\}

下面是插件中可用的所有宏：

| 宏                                            | 描述                                                                                                                                                                              | 输出示例                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 使用 Grafana 面板的时间范围，在给定列上替换为时间范围过滤条件，并将该列视为 [Date](/sql-reference/data-types/date.md)。                                                          | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 使用 Grafana 面板的时间范围，在给定列上替换为时间范围过滤条件，并将该列视为 [DateTime](/sql-reference/data-types/datetime.md)。                                                | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 使用 Grafana 面板的时间范围，在给定列上替换为时间范围过滤条件，并将该列视为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                            | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 使用单独的 Date 和 DateTime 列，将 `$__dateFilter()` 和 `$__timeFilter()` 组合在一起的简写形式。别名为 `$__dt()`                                                                | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | 替换为 Grafana 面板时间范围的起始时间，并将其转换为 [DateTime](/sql-reference/data-types/datetime.md)。                                   | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 替换为面板时间范围的起始时间，并将其转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | 替换为 Grafana 面板时间范围的结束时间，并将其转换为 [DateTime](/sql-reference/data-types/datetime.md)。                                   | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | 替换为 Grafana 面板时间范围的结束时间，并将其转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。                               | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 替换为一个根据窗口大小（以秒为单位）计算时间区间的函数。                                                                                                                         | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | 替换为一个根据窗口大小（以毫秒为单位）计算时间区间的函数。                                                                                                                       | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 替换为仪表板的时间间隔（以秒为单位）。                                                                                                                                            | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量未选择所有值时，替换为第一个参数；当模板变量选择了所有值时，替换为 `1=1`。                                                                               | `condition` 或 `1=1`                                                                                              |