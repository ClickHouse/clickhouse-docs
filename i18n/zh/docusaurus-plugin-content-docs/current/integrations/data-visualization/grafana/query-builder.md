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

任何查询都可以使用 ClickHouse 插件运行。
查询构建器是一个方便的选项，适合简单的查询，但对于复杂的查询，您需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个 [查询类型](#query-types)，并且至少需要选择一个列。

可用的查询类型有：
- [表](#table)：最简单的查询类型，用于以表格格式显示数据。对于包含聚合函数的简单和复杂查询，效果良好。
- [日志](#logs)：优化用于构建日志查询。在使用 [已配置的默认值](./config.md#logs) 的探索视图中效果最佳。
- [时间序列](#time-series)：最适合用于构建时间序列查询。允许选择专用时间列并添加聚合函数。
- [跟踪](#traces)：优化用于搜索/查看跟踪。在使用 [已配置的默认值](./config.md#traces) 的探索视图中效果最佳。
- [SQL 编辑器](#sql-editor)：当您希望完全控制查询时，可以使用 SQL 编辑器。在此模式下，可以执行任何 SQL 查询。

## 查询类型 {#query-types}

*查询类型* 设置将更改查询构建器的布局，以匹配所构建的查询类型。
查询类型还决定了在可视化数据时使用哪个面板。

### 表 {#table}

最灵活的查询类型是表查询。这是为其他设计用于处理简单和聚合查询的查询构建器的汇总。

| 字段 | 描述 |
|----|----|
| 构建器模式  | 简单查询不包括聚合和分组，而聚合查询包括这些选项。  |
| 列 | 选择的列。可以在此字段中输入原始 SQL，以允许函数和列别名。 |
| 聚合 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许为函数和列设置自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0` 则将被排除。一些可视化可能需要将其设置为 `0` 以显示所有数据。 |
| 过滤器 | 在 `WHERE` 子句中应用的过滤器列表。 |

<Image size="md" img={demo_table_query} alt="示例聚合表查询" border />

此查询类型将数据呈现为表格。

### 日志 {#logs}

日志查询类型提供一个专注于查询日志数据的查询构建器。
可以在数据源的 [日志配置](./config.md#logs) 中配置默认值，以允许查询构建器预加载默认数据库/表和列。
也可以启用 OpenTelemetry，自动根据模式版本选择列。

默认情况下，添加了 **时间** 和 **级别** 过滤器，以及针对 **时间** 列的排序。
这些过滤器与其各自的字段相关联，并将在列更改时更新。
默认情况下，**级别** 过滤器未包含在 SQL 中，变更为 `IS ANYTHING` 选项后将启用它。

日志查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 使用 OTel | 启用 OpenTelemetry 列。这将覆盖所选列，以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 列 | 要添加到日志行的额外列。可以在此字段中输入原始 SQL，以允许函数和列别名。 |
| 时间 | 日志的主要时间戳列。将显示类似时间的类型，但允许自定义值/函数。 |
| 日志级别 | 可选。日志的 *级别* 或 *严重性*。值通常看起来像 `INFO`，`error`，`Debug` 等。 |
| 消息 | 日志消息内容。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0` 则将被排除，但对于大型日志数据集不推荐这样做。 |
| 过滤器 | 在 `WHERE` 子句中应用的过滤器列表。 |
| 消息过滤器 | 用于方便过滤日志的文本输入，使用 `LIKE %value%`。当输入为空时排除。 |

<Image size="md" img={demo_logs_query} alt="示例 OTel 日志查询" border />

<br/>
此查询类型将在日志面板中渲染数据，并在顶部呈现一个日志直方图面板。

在扩展的日志行中，可以查看查询中选择的额外列：
<Image size="md" img={demo_logs_query_fields} alt="日志查询中额外字段的示例" border />

### 时间序列 {#time-series}

时间序列查询类型类似于 [表](#table)，但更注重时间序列数据。

这两种视图大致相同，主要的不同之处在于：
  - 一个专用的 *时间* 字段。
  - 在聚合模式下，会自动应用时间间隔宏，并为时间字段添加分组。
  - 在聚合模式下，"列" 字段是隐藏的。
  - 自动为 **时间** 字段添加时间范围过滤器和排序。

:::important 您的可视化缺少数据吗？
在某些情况下，时间序列面板会看起来被截断，因为限制默认为 `1000`。

尝试通过将 `LIMIT` 子句设置为 `0` 来删除（如果您的数据集允许）。
:::

| 字段 | 描述 |
|----|----|
| 构建器模式  | 简单查询不包括聚合和分组，而聚合查询包括这些选项。  |
| 时间 | 查询的主要时间列。将显示类似时间的类型，但允许自定义值/函数。 |
| 列 | 选择的列。可以在此字段中输入原始 SQL，以允许函数和列别名。仅在简单模式下可见。 |
| 聚合 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许为函数和列设置自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0` 则将被排除，建议在某些时间序列数据集中这样做，以显示完整的可视化。 |
| 过滤器 | 在 `WHERE` 子句中应用的过滤器列表。 |

<Image size="md" img={demo_time_series_query} alt="示例时间序列查询" border />

此查询类型将使用时间序列面板渲染数据。

### 跟踪 {#traces}

跟踪查询类型提供一个查询构建器，用于轻松搜索和查看跟踪。
它是为 OpenTelemetry 数据设计的，但可以选择列以从不同的模式呈现跟踪。
可以在数据源的 [跟踪配置](./config.md#traces) 中配置默认值，以允许查询构建器预加载默认数据库/表和列。如果配置了默认值，则列选择将默认折叠。
也可以启用 OpenTelemetry，根据模式版本自动选择列。

添加了默认过滤器，旨在仅显示顶级跨度。
还包括对应于时间和持续时间时间列的排序。
这些过滤器与其各自的字段相关联，并将在列更改时更新。
默认情况下，**服务名称** 过滤器未包含在 SQL 中，变更为 `IS ANYTHING` 选项后将启用它。

跟踪查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 跟踪模式 | 将查询从跟踪搜索更改为跟踪 ID 查找。 |
| 使用 OTel | 启用 OpenTelemetry 列。这将覆盖所选列，以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 跟踪 ID 列 | 跟踪的 ID。 |
| Span ID 列 | Span ID。 |
| 父 Span ID 列 | 父 span ID。对于顶级跟踪，这通常是空的。 |
| 服务名称列 | 服务名称。 |
| 操作名称列 | 操作名称。 |
| 开始时间列 | 跟踪跨度的主要时间列。跨度开始的时间。 |
| 持续时间时间列 | 跨度的持续时间。默认情况下，Grafana 期望这是以毫秒为单位的浮点数。通过 `持续时间单位` 下拉选项自动应用转换。 |
| 持续时间单位 | 用于持续时间的时间单位。默认是纳秒。所选单位将根据 Grafana 的要求转换为以毫秒为单位的浮点数。 |
| 标签列 | Span 标签。如果未使用基于 OTel 的模式，请排除此项，因为它期望特定的映射列类型。 |
| 服务标签列 | 服务标签。如果未使用基于 OTel 的模式，请排除此项，因为它期望特定的映射列类型。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询的末尾。如果设置为 `0` 则将被排除，但对于大型跟踪数据集不推荐这样做。 |
| 过滤器 | 在 `WHERE` 子句中应用的过滤器列表。 |
| 跟踪 ID | 过滤的跟踪 ID。仅用于跟踪 ID 模式，以及当打开跟踪 ID [数据链接](#data-links) 时。 |

<Image size="md" img={demo_trace_query} alt="示例 OTel 跟踪查询" border />

此查询类型将为跟踪搜索模式渲染数据的表视图，而为跟踪 ID 模式渲染跟踪面板。

## SQL 编辑器 {#sql-editor}

对于过于复杂以至于查询构建器无法处理的查询，您可以使用 SQL 编辑器。
这使您可以通过编写和运行纯 ClickHouse SQL 来完全控制查询。

通过在查询编辑器的顶部选择 "SQL 编辑器" 来打开 SQL 编辑器。

[宏函数](#macros) 在此模式下也可以使用。

您可以在查询类型之间切换，以获取最适合您查询的可视化。
这种切换即使在仪表板视图中也会有所影响，尤其是对于时间序列数据。

<Image size="md" img={demo_raw_sql_query} alt="示例原始 SQL 查询" border />

## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可用于链接到新查询。
此功能已在 ClickHouse 插件中启用，以链接跟踪到日志，反之亦然。在 [数据源的配置](./config.md#opentelemetry) 中为日志和跟踪配置 OpenTelemetry 时效果最佳。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表中跟踪链接的示例
  <Image size="sm" img={trace_id_in_table} alt="表中的跟踪链接" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中的跟踪链接示例
  <Image size="md" img={trace_id_in_logs} alt="日志中的跟踪链接" border />
</div>

### 如何创建数据链接 {#how-to-make-a-data-link}

您可以通过在查询中选择名为 `traceID` 的列来创建数据链接。此名称不区分大小写，并支持在 "ID" 之前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在 [日志](#logs) 或 [跟踪](#traces) 查询中启用了 OpenTelemetry，跟踪 ID 列将自动包含。

通过包含跟踪 ID 列，"**查看跟踪**" 和 "**查看日志**" 链接将附加到数据。

### 链接功能 {#linking-abilities}

有了可用的数据链接，您可以使用提供的跟踪 ID 打开跟踪和日志。

"**查看跟踪**" 将打开一个包含跟踪的分割面板，"**查看日志**" 将打开一个按跟踪 ID 过滤的日志查询。
如果从仪表板而不是探索视图中单击链接，则链接将在探索视图中的新标签页中打开。

在跨查询类型（日志到跟踪和跟踪到日志）时，需要为 [日志](./config.md#logs) 和 [跟踪](./config.md#traces) 配置默认值。当打开同一查询类型的链接时，则不需要默认值，因为查询可以简单复制。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从日志查询（左面板）查看跟踪（右面板）的示例
  <Image size="md" img={demo_data_links} alt="数据链接链接的示例" border />
</div>


## 宏 {#macros}

宏是向查询中添加动态 SQL 的简单方法。
在查询发送到 ClickHouse 服务器之前，插件将扩展宏并将其替换为完整表达式。

来自 SQL 编辑器和查询构建器的查询都可以使用宏。


### 使用宏 {#using-macros}

宏可以在查询中的任何位置包含，必要时可以多次使用。

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

在此示例中，将图表仪表板的时间范围应用于 `log_time` 列。

插件还支持使用花括号 `{}` 的表示法。当需要在 [参数](/sql-reference/syntax.md#defining-and-using-query-parameters) 内使用查询时使用此表示法。

### 宏列表 {#list-of-macros}

这是插件中可用的所有宏的列表：

| 宏 | 描述 | 输出示例 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)` | 使用 Grafana 面板的时间范围作为 [Date](/sql-reference/data-types/date.md) 替换所提供列的时间范围过滤器。 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')` |
| `$__timeFilter(columnName)` | 使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md) 替换所提供列的时间范围过滤器。 | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)` |
| `$__timeFilter_ms(columnName)` | 使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md) 替换所提供列的时间范围过滤器。 | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)` | 结合 `$__dateFilter()` 和 `$__timeFilter()` 的简写，使用单独的日期和日期时间列。别名为 `$__dt()` | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)` |
| `$__fromTime` | 替换为转换为 [DateTime](/sql-reference/data-types/datetime.md) 的 Grafana 面板范围的开始时间。 | `toDateTime(1415792726)` |
| `$__fromTime_ms` | 替换为转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 的面板范围的开始时间。 | `fromUnixTimestamp64Milli(1415792726123)` |
| `$__toTime` | 替换为转换为 [DateTime](/sql-reference/data-types/datetime.md) 的 Grafana 面板范围的结束时间。 | `toDateTime(1447328726)` |
| `$__toTime_ms` | 替换为转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 的面板范围的结束时间。 | `fromUnixTimestamp64Milli(1447328726456)` |
| `$__timeInterval(columnName)` | 替换为根据窗口大小（以秒为单位）计算间隔的函数。 | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)` |
| `$__timeInterval_ms(columnName)` | 替换为根据窗口大小（以毫秒为单位）计算间隔的函数。 | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)` |
| `$__interval_s` | 替换为仪表板间隔（以秒为单位）。 | `20` |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量未选择每个值时，替换为第一个参数；当模板变量选择每个值时，替换为 1=1。 | `condition` 或 `1=1` |
