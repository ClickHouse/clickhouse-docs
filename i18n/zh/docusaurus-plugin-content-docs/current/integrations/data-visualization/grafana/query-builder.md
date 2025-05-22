---
'sidebar_label': '查询构建器'
'sidebar_position': 2
'slug': '/integrations/grafana/query-builder'
'description': '在 ClickHouse Grafana 插件中使用查询构建器'
'title': '查询构建器'
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
查询构建器是一个方便的选项，适用于简单查询，但对于复杂查询，您需要使用 [SQL 编辑器](#sql-editor)。

在查询构建器中的所有查询都有一个 [查询类型](#query-types)，并且至少需要选择一个列。

可用的查询类型有：
- [表](#table)：最简单的查询类型，用于以表格格式显示数据。适用于包含聚合函数的简单和复杂查询的通用方案。
- [日志](#logs)：优化用于构建日志查询。在配置了 [默认值](./config.md#logs) 的探查视图中效果最佳。
- [时间序列](#time-series)：最好用于构建时间序列查询。允许选择专用时间列并添加聚合函数。
- [跟踪](#traces)：优化用于搜索/查看跟踪。在配置了 [默认值](./config.md#traces) 的探查视图中效果最佳。
- [SQL 编辑器](#sql-editor)：当您想要完全控制查询时，可以使用 SQL 编辑器。在此模式下，可以执行任何 SQL 查询。

## 查询类型 {#query-types}

*查询类型* 设置将更改查询构建器的布局，以匹配所构建的查询类型。
查询类型还决定在可视化数据时使用哪个面板。

### 表 {#table}

最灵活的查询类型是表查询。这是为其他查询构建器设计的通用方案，能够处理简单和聚合查询。

| 字段 | 描述 |
|----|----|
| 构建模式  | 简单查询不包括聚合和分组，而聚合查询包括这些选项。  |
| 列 | 所选列。可以在此字段中输入原始 SQL 以允许函数和列别名。 |
| 聚合 | 聚合函数的列表 [aggregate functions](/sql-reference/aggregate-functions/index.md)。允许为函数和列提供自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0`，则将被排除。一些可视化可能需要将其设置为 `0` 以显示所有数据。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |

<Image size="md" img={demo_table_query} alt="示例聚合表查询" border />

此查询类型将以表格形式呈现数据。

### 日志 {#logs}

日志查询类型提供了一个专注于查询日志数据的查询构建器。
可以在数据源的 [日志配置](./config.md#logs) 中配置默认值，以允许查询构建器预加载默认数据库/表和列。
还可以启用 OpenTelemetry 以根据模式版本自动选择列。

默认情况下添加 **时间** 和 **级别** 过滤器，并为时间列添加排序。
这些过滤器与各自的字段绑定，并将在列更改时更新。
**级别** 过滤器默认情况下从 SQL 中排除，将其从 `IS ANYTHING` 选项更改将启用它。

日志查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖所选列以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 列 | 要添加到日志行的额外列。可以在此字段中输入原始 SQL 以允许函数和列别名。 |
| 时间 | 日志的主要时间戳列。将显示类似时间的类型，但允许自定义值/函数。 |
| 日志级别 | 可选。日志的 *级别* 或 *严重性*。值通常类似于 `INFO`、`error`、`Debug` 等。 |
| 消息 | 日志消息内容。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0`，则将被排除，但不建议这样做，以防大型日志数据集。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |
| 消息过滤器 | 一个文本输入，用于使用 `LIKE %value%` 方便地过滤日志。输入为空时排除。 |

<Image size="md" img={demo_logs_query} alt="示例 OTel 日志查询" border />

<br/>
此查询类型将以日志面板渲染数据，以及顶部的日志直方图面板。

在扩展的日志行中可以查看选中的额外列：
<Image size="md" img={demo_logs_query_fields} alt="日志查询中的额外字段示例" border />


### 时间序列 {#time-series}

时间序列查询类型类似于 [表](#table)，但专注于时间序列数据。

这两种视图基本相同，具有以下显著不同点：
  - 专用的 *时间* 字段。
  - 在聚合模式下，自动应用时间间隔宏，并为时间字段添加分组。
  - 在聚合模式下，隐藏“列”字段。
  - 自动为 **时间** 字段添加时间范围过滤器和排序。

:::important 您的可视化是否缺少数据？
在某些情况下，时间序列面板似乎被截断，因为限制默认设置为 `1000`。

尝试通过将 `LIMIT` 子句设置为 `0`（如果您的数据集允许）来删除此限制。
:::

| 字段 | 描述 |
|----|----|
| 构建模式  | 简单查询不包括聚合和分组，而聚合查询包括这些选项。  |
| 时间 | 查询的主要时间列。将显示类似时间的类型，但允许自定义值/函数。 |
| 列 | 所选列。可以在此字段中输入原始 SQL 以允许函数和列别名。仅在简单模式下可见。 |
| 聚合 | 聚合函数的列表 [aggregate functions](/sql-reference/aggregate-functions/index.md)。允许为函数和列提供自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0`，则将被排除，建议在某些时间序列数据集上显示完整可视化。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |

<Image size="md" img={demo_time_series_query} alt="示例时间序列查询" border />

此查询类型将与时间序列面板一起渲染数据。

### 跟踪 {#traces}

跟踪查询类型提供了一个查询构建器，便于搜索和查看跟踪。
它针对 OpenTelemetry 数据而设计，但可以选择列以从不同的模式呈现跟踪。
可以在数据源的 [跟踪配置](./config.md#traces) 中配置默认值，以允许查询构建器预加载默认数据库/表和列。如果配置了默认值，则列选择将默认折叠。
还可以启用 OpenTelemetry 以根据模式版本自动选择列。

默认过滤器会添加，仅显示顶级跨度。
还包括时间和持续时间时间列的排序。
这些过滤器与各自的字段绑定，并将在列更改时更新。
**服务名称** 过滤器默认情况下从 SQL 中排除，将其从 `IS ANYTHING` 选项更改将启用它。

跟踪查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 跟踪模式 | 将查询从跟踪搜索更改为跟踪 ID 查找。 |
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖所选列以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 跟踪 ID 列 | 跟踪的 ID。 |
| 段 ID 列 | 段 ID。 |
| 父段 ID 列 | 父段 ID。这通常为空，以用于顶级跟踪。 |
| 服务名称列 | 服务名称。 |
| 操作名称列 | 操作名称。 |
| 开始时间列 | 跟踪跨度的主要时间列。跨度开始时的时间。 |
| 持续时间时间列 | 段的持续时间。Grafana 默认期望这是毫秒的浮点数。通过 `Duration Unit` 下拉列表自动应用转换。 |
| 持续时间单位 | 用于持续时间的时间单位。默认是纳秒。所选单位将根据 Grafana 的要求转换为毫秒的浮点数。 |
| 标签列 | 段标签。如果不使用基于 OTel 的模式，请排除此选项，因为它要求特定的 Map 列类型。 |
| 服务标签列 | 服务标签。如果不使用基于 OTel 的模式，请排除此选项，因为它要求特定的 Map 列类型。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0`，则将被排除，但不建议这样做，以防大型跟踪数据集。 |
| 过滤器 | 要在 `WHERE` 子句中应用的过滤器列表。 |
| 跟踪 ID | 要筛选的跟踪 ID。仅在跟踪 ID 模式中以及打开跟踪 ID [数据链接](#data-links) 时使用。 |

<Image size="md" img={demo_trace_query} alt="示例 OTel 跟踪查询" border />

此查询类型将在跟踪搜索模式下以表格视图呈现数据，在跟踪 ID 模式下以跟踪面板呈现数据。

## SQL 编辑器 {#sql-editor}

对于过于复杂的查询，可以使用 SQL 编辑器。这使您能够完全控制查询，允许您编写和运行纯 ClickHouse SQL。

可以通过在查询编辑器顶部选择“SQL 编辑器”来打开 SQL 编辑器。

[宏函数](#macros) 在此模式下仍然可以使用。

您可以在查询类型之间切换，以获取最佳适合查询的可视化。此切换在仪表板视图中也有影响，特别是对于时间序列数据。

<Image size="md" img={demo_raw_sql_query} alt="示例原始 SQL 查询" border />

## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可用于链接到新查询。
此功能已在 ClickHouse 插件中启用，用于将跟踪链接到日志，反之亦然。在配置了 OpenTelemetry 的日志和跟踪是 [数据源的配置](./config.md#opentelemetry) 时，效果最佳。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表中跟踪链接示例
  <Image size="sm" img={trace_id_in_table} alt="表中的跟踪链接" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中跟踪链接示例
  <Image size="md" img={trace_id_in_logs} alt="日志中的跟踪链接" border />
</div>

### 如何制作数据链接 {#how-to-make-a-data-link}

您可以通过在查询中选择一个名为 `traceID` 的列来制作数据链接。该名称不区分大小写，并支持在 “ID” 之前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在 [日志](#logs) 或 [跟踪](#traces) 查询中启用了 OpenTelemetry，将自动包含跟踪 ID 列。

通过包含跟踪 ID 列，**查看跟踪** 和 **查看日志** 链接将附加到数据。

### 链接能力 {#linking-abilities}

有了数据链接，您可以使用提供的跟踪 ID 打开跟踪和日志。

**查看跟踪** 将打开一个分屏面板，显示该跟踪，而 **查看日志** 将打开一个按跟踪 ID 过滤的日志查询。
如果从仪表板而不是探查视图单击该链接，则该链接将在探查视图中新标签页中打开。

在交叉查询类型（日志到跟踪和跟踪到日志）时，需要为 [日志](./config.md#logs) 和 [跟踪](./config.md#traces) 配置默认值。在打开相同查询类型的链接时，不需要配置默认值，因为查询可以直接复制。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从日志查询（左面板）查看跟踪（右面板）的示例
  <Image size="md" img={demo_data_links} alt="数据链接链接的示例" border />
</div>


## 宏 {#macros}

宏是为您的查询添加动态 SQL 的简单方法。
在查询发送到 ClickHouse 服务器之前，插件将扩展宏并将其替换为完整的表达式。

来自 SQL 编辑器和查询构建器的查询均可以使用宏。


### 使用宏 {#using-macros}

宏可以在查询中的任何地方包含，如果需要可以多次使用。

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

在这个例子中，Grafana 仪表板的时间范围应用于 `log_time` 列。

该插件还支持使用花括号 `{}` 的符号。在需要的 [参数](/sql-reference/syntax.md#defining-and-using-query-parameters) 中使用此符号。

### 宏列表 {#list-of-macros}

这是插件中可用的所有宏列表：

| 宏 | 描述 | 输出示例 |
| ---- | ---- | ---- |
| `$__dateFilter(columnName)` | 使用 Grafana 面板的时间范围作为 [Date](/sql-reference/data-types/date.md) 对提供列进行替换的时间范围过滤器。 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')` |
| `$__timeFilter(columnName)` | 使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md) 对提供列进行替换的时间范围过滤器。 | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)` |
| `$__timeFilter_ms(columnName)` | 使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md) 对提供列进行替换的时间范围过滤器。 | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)` | 结合 `$__dateFilter()` 和 `$__timeFilter()` 的速记，使用单独的日期和日期时间列。别名 `$__dt()` | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)` |
| `$__fromTime` | 被替换为 Grafana 面板范围的开始时间并转换为 [DateTime](/sql-reference/data-types/datetime.md)。 | `toDateTime(1415792726)` |
| `$__fromTime_ms` | 被替换为面板范围的开始时间并转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。 | `fromUnixTimestamp64Milli(1415792726123)` |
| `$__toTime` | 被替换为 Grafana 面板范围的结束时间并转换为 [DateTime](/sql-reference/data-types/datetime.md)。 | `toDateTime(1447328726)` |
| `$__toTime_ms` | 被替换为面板范围的结束时间并转换为 [DateTime64](/sql-reference/data-types/datetime64.md)。 | `fromUnixTimestamp64Milli(1447328726456)` |
| `$__timeInterval(columnName)` | 被替换为基于窗口大小（以秒为单位）计算的时间间隔的函数。 | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)` |
| `$__timeInterval_ms(columnName)` | 被替换为基于窗口大小（以毫秒为单位）计算的时间间隔的函数。 | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)` |
| `$__interval_s` | 被替换为以秒为单位的仪表板间隔。 | `20` |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量未选择所有值时，被替换为第一个参数。如果模板变量选择所有值，则被替换为 1=1。 | `condition` 或 `1=1` |
