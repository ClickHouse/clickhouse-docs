---
'sidebar_label': '查询构建器'
'sidebar_position': 2
'slug': '/integrations/grafana/query-builder'
'description': '在ClickHouse的Grafana插件中使用查询构建器'
'title': 'Query Builder'
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

可以使用 ClickHouse 插件运行任何查询。
查询构建器是一个便捷选项，适用于简单查询，但对于复杂查询，您需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个 [查询类型](#query-types)，并且至少需要选择一个列。

可用的查询类型包括：
- [表](#table)：最简单的查询类型，以表格格式显示数据。适用于包含聚合函数的简单和复杂查询。
- [日志](#logs)：优化用于构建日志的查询。与配置了 [默认值](./config.md#logs) 的探索视图配合效果最佳。
- [时间序列](#time-series)：最适合构建时间序列查询。允许选择专用时间列并添加聚合函数。
- [追踪](#traces)：优化用于搜索/查看追踪。与配置了 [默认值](./config.md#traces) 的探索视图配合效果最佳。
- [SQL 编辑器](#sql-editor)：当您想要完全控制查询时，可以使用 SQL 编辑器。在此模式下，可以执行任何 SQL 查询。

## 查询类型 {#query-types}

*查询类型* 设置将更改查询构建器的布局，以匹配正在构建的查询类型。
查询类型还决定了在可视化数据时使用哪个面板。

### 表 {#table}

最灵活的查询类型是表查询。这是一个处理简单和聚合查询的万能查询。

| 字段 | 描述 |
|----|----|
| 构建模式  | 简单查询不包括聚合和分组，而聚合查询包括这些选项。  |
| 列 | 选定的列。可以在此字段中输入原始 SQL，以允许函数和列别名。 |
| 聚合函数 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许为函数和列提供自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0` ，则将其排除。一些可视化可能需要将此设置为 `0` 以显示所有数据。 |
| 过滤条件 | 将应用于 `WHERE` 子句的过滤条件列表。 |

<Image size="md" img={demo_table_query} alt="示例聚合表查询" border />

此查询类型将数据呈现为表格。

### 日志 {#logs}

日志查询类型提供了一个专注于查询日志数据的查询构建器。
可以在数据源的 [日志配置](./config.md#logs) 中配置默认值，以允许查询构建器预加载默认数据库/表和列。
还可以启用 OpenTelemetry，以根据模式版本自动选择列。

默认情况下，添加 **时间** 和 **级别** 过滤器，以及时间列的排序。
这些过滤器与各自的字段相绑定，并将在更改列时更新。
**级别** 过滤器默认从 SQL 中排除，将其从 `IS ANYTHING` 选项更改将启用它。

日志查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖所选列以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 列 | 要添加到日志行的额外列。可以在此字段中输入原始 SQL，以允许函数和列别名。 |
| 时间 | 日志的主要时间戳列。将显示时间类型，但允许自定义值/函数。 |
| 日志级别 | 可选。日志的 *级别* 或 *严重性*。值通常类似于 `INFO`、`error`、`Debug` 等。 |
| 消息 | 日志消息内容。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则将其排除，但不建议在大型日志数据集中这样做。 |
| 过滤条件 | 将应用于 `WHERE` 子句的过滤条件列表。 |
| 消息过滤器 | 一个文本输入，用于方便地使用 `LIKE %value%` 过滤日志。当输入为空时排除。 |

<Image size="md" img={demo_logs_query} alt="示例 OTel 日志查询" border />

<br/>
此查询类型将在日志面板中渲染数据，同时在顶部添加日志直方图面板。

在扩展日志行中可以查看查询中选择的额外列：
<Image size="md" img={demo_logs_query_fields} alt="日志查询中的额外字段示例" border />

### 时间序列 {#time-series}

时间序列查询类型类似于 [表](#table)，但更侧重于时间序列数据。

这两种视图基本相同，但有以下显著差异：
  - 专用的 *时间* 字段。
  - 在聚合模式下，时间间隔宏会自动应用，并对时间字段进行分组。
  - 在聚合模式下，"列" 字段被隐藏。
  - 自动为 **时间** 字段添加时间范围过滤器和排序。

:::important 您的可视化是否缺少数据？
在某些情况下，时间序列面板可能会看起来被截断，因为限制默认设置为 `1000`。

尝试通过将 `LIMIT` 子句设置为 `0` 来移除它（如果您的数据集允许）。 
:::

| 字段 | 描述 |
|----|----|
| 构建模式  | 简单查询不包括聚合和分组，而聚合查询包括这些选项。  |
| 时间 | 查询的主要时间列。将显示时间类型，但允许自定义值/函数。 |
| 列 | 选定的列。可以在此字段中输入原始 SQL，以允许函数和列别名。仅在简单模式下可见。 |
| 聚合函数 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许为函数和列提供自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则将其排除，建议在某些时间序列数据集中这样做，以显示完整的可视化。 |
| 过滤条件 | 将应用于 `WHERE` 子句的过滤条件列表。 |

<Image size="md" img={demo_time_series_query} alt="示例时间序列查询" border />

此查询类型将在时间序列面板中渲染数据。

### 追踪 {#traces}

追踪查询类型提供了一个查询构建器，用于方便地搜索和查看追踪。
它专为 OpenTelemetry 数据设计，但也可以选择列以渲染来自不同模式的追踪。
可以在数据源的 [追踪配置](./config.md#traces) 中配置默认值，以允许查询构建器预加载默认数据库/表和列。如果配置了默认值，列选择将默认折叠。
还可以启用 OpenTelemetry，以根据模式版本自动选择列。

默认过滤器的添加旨在显示仅顶级跨度。
同时还包括时间和持续时间列的排序。
这些过滤器与各自的字段相绑定，并将在更改列时更新。
**服务名称** 过滤器默认从 SQL 中排除，将其从 `IS ANYTHING` 选项更改将启用它。

追踪查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 追踪模式 | 将查询从追踪搜索更改为追踪 ID 查找。 |
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖所选列以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 追踪 ID 列 | 追踪的 ID。 |
| 跨度 ID 列 | 跨度 ID。 |
| 父跨度 ID 列 | 父跨度 ID。通常对于顶级追踪，此字段为空。 |
| 服务名称列 | 服务名称。 |
| 操作名称列 | 操作名称。 |
| 开始时间列 | 追踪跨度的主要时间列。跨度开始的时间。 |
| 持续时间列 | 跨度的持续时间。默认情况下，Grafana 期望这是以毫秒为单位的浮点数。通过 `Duration Unit` 下拉菜单自动应用转换。 |
| 持续时间单位 | 用于持续时间的时间单位。默认以纳秒为单位。所选单位将根据 Grafana 的要求转换为以毫秒为单位的浮点数。 |
| 标签列 | 跨度标签。如果不使用基于 OTel 的模式，则排除此项，因为它期望具有特定的 Map 列类型。 |
| 服务标签列 | 服务标签。如果不使用基于 OTel 的模式，则排除此项，因为它期望具有特定的 Map 列类型。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`，则将其排除，但不建议在大型追踪数据集中这样做。 |
| 过滤条件 | 将应用于 `WHERE` 子句的过滤条件列表。 |
| 追踪 ID | 要过滤的追踪 ID。仅在追踪 ID 模式下使用，以及在打开追踪 ID [数据链接](#data-links) 时。 |

<Image size="md" img={demo_trace_query} alt="示例 OTel 追踪查询" border />

此查询类型将在追踪搜索模式下以表格视图呈现数据，在追踪 ID 模式下以追踪面板呈现。

## SQL 编辑器 {#sql-editor}

对于查询过于复杂而无法使用查询构建器，您可以使用 SQL 编辑器。
这使您可以完全控制查询，通过编写和运行普通 ClickHouse SQL。

SQL 编辑器可以通过在查询编辑器顶部选择 "SQL 编辑器" 来打开。

在此模式下，仍然可以使用 [宏函数](#macros)。

您可以在查询类型之间切换，以获得最适合您查询的可视化。
这个切换在仪表板视图中也有影响，尤其是对于时间序列数据。

<Image size="md" img={demo_raw_sql_query} alt="示例原始 SQL 查询" border />

## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可用于链接到新查询。
此功能已在 ClickHouse 插件中启用，以便将追踪链接到日志，反之亦然。在 [数据源配置](./config.md#opentelemetry) 中为日志和追踪配置 OpenTelemetry 时效果最佳。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表中追踪链接的示例
  <Image size="sm" img={trace_id_in_table} alt="表中的追踪链接" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中追踪链接的示例
  <Image size="md" img={trace_id_in_logs} alt="日志中的追踪链接" border />
</div>

### 如何制作数据链接 {#how-to-make-a-data-link}

您可以通过在查询中选择名为 `traceID` 的列来制作数据链接。此名称不区分大小写，并支持在 "ID" 前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在 [日志](#logs) 或 [追踪](#traces) 查询中启用了 OpenTelemetry，将自动包含追踪 ID 列。

通过包含追踪 ID 列，"**查看追踪**" 和 "**查看日志**" 链接将与数据关联。

### 链接能力 {#linking-abilities}

通过存在的数据链接，您可以使用提供的追踪 ID 打开追踪和日志。

"**查看追踪**" 将打开一个包含追踪的拆分面板，而 "**查看日志**" 将打开一个基于追踪 ID 过滤的日志查询。
如果从仪表板而不是探索视图点击链接，则链接将在新的探索视图标签中打开。

在交叉查询类型（日志到追踪和追踪到日志）时，需要为 [日志](./config.md#logs) 和 [追踪](./config.md#traces) 配置默认值。当打开同一查询类型的链接时，不需要默认值，因为可以简单地复制查询。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从日志查询（左面板）中查看追踪（右面板）的示例
  <Image size="md" img={demo_data_links} alt="数据链接示例" border />
</div>

## 宏 {#macros}

宏是为查询添加动态 SQL 的简单方式。
在查询发送到 ClickHouse 服务器之前，插件将扩展宏并用完整表达式替换它。

来自 SQL 编辑器和查询构建器的查询都可以使用宏。

### 使用宏 {#using-macros}

宏可以在查询中的任何地方包含，必要时可以多次使用。

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

在此示例中，Grafana 仪表板的时间范围应用于 `log_time` 列。

插件还支持使用大括号 `{}` 的表示法。当查询需要位于 [参数](/sql-reference/syntax.md#defining-and-using-query-parameters) 中时，请使用此表示法。

### 宏列表 {#list-of-macros}

这是插件中可用的所有宏的列表：

| 宏                                           | 描述                                                                                                                                                                                 | 输出示例                                                                                                         |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `$__dateFilter(columnName)`                  | 使用 Grafana 面板的时间范围作为 [Date](/sql-reference/data-types/date.md) 的提供列替换为一个时间范围过滤器。                                                               | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md) 的提供列替换为一个时间范围过滤器。                                                    | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md) 的提供列替换为一个时间范围过滤器。                                                | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 简写形式，将 `$__dateFilter()` 和 `$__timeFilter()` 结合使用，分别使用 Date 和 DateTime 列。别名 `$__dt()`                                                                                       | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                         |
| `$__fromTime`                                | 用于替换为 Grafana 面板范围的起始时间，转为 [DateTime](/sql-reference/data-types/datetime.md)。                                                                             | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 用于替换为面板范围的起始时间，转为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                                                                   | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | 用于替换为 Grafana 面板范围的结束时间，转为 [DateTime](/sql-reference/data-types/datetime.md)。                                                                             | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | 用于替换为面板范围的结束时间，转为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                                                                   | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 用于替换为根据窗口大小（以秒为单位）计算间隔的函数。                                                                                                                            | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | 用于替换为根据窗口大小（以毫秒为单位）计算间隔的函数。                                                                                                                           | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 用于替换为以秒为单位的仪表板间隔。                                                                                                                                               | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数的模板变量未选择所有值时，用第一个参数替换。当模板变量选择所有值时，用 `1=1` 替换。                                                                                  | `condition` 或 `1=1`                                                                                              |
