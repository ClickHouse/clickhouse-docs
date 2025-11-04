---
'sidebar_label': '查询构建器'
'sidebar_position': 2
'slug': '/integrations/grafana/query-builder'
'description': '在 ClickHouse Grafana 插件中使用查询构建器'
'title': '查询构建器'
'doc_type': 'guide'
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
查询构建器是处理简单查询的便捷选项，但对于复杂查询，您需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个 [查询类型](#query-types)，并至少需要选择一列。

可用的查询类型有：
- [表](#table)：用于以表格格式显示数据的最简单查询类型。对于同时包含简单和复杂聚合函数的查询，效果很好。
- [日志](#logs)：优化用于构建日志查询。最好在具有 [默认配置](./config.md#logs) 的探索视图中使用。
- [时间序列](#time-series)：最佳用于构建时间序列查询。允许选择专用时间列并添加聚合函数。
- [跟踪](#traces)：优化用于搜索/查看跟踪。在具有 [默认配置](./config.md#traces) 的探索视图中效果最佳。
- [SQL 编辑器](#sql-editor)：当您想完全控制查询时，可以使用 SQL 编辑器。在此模式下，可以执行任何 SQL 查询。

## 查询类型 {#query-types}

*查询类型* 设置将更改查询构建器的布局以匹配正在构建的查询类型。
查询类型还决定了在可视化数据时使用哪个面板。

### 表 {#table}

最灵活的查询类型是表查询。这是一个涵盖其他查询构建器的集合，旨在处理简单和聚合查询。

| 字段 | 描述 |
|----|----|
| 构建模式  | 简单查询不包含聚合和分组，而聚合查询包含这些选项。  |
| 列 | 选择的列。可以在此字段中输入原始 SQL，以便使用函数和列别名。 |
| 聚合 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许为函数和列自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询末尾。如果设置为 `0`，则将被排除。一些可视化可能需要将其设置为 `0` 以显示所有数据。 |
| 过滤器 | 将应用于 `WHERE` 子句的过滤器列表。 |

<Image size="md" img={demo_table_query} alt="示例聚合表查询" border />

此查询类型将以表格形式呈现数据。

### 日志 {#logs}

日志查询类型提供了一个专注于查询日志数据的查询构建器。
可以在数据源的 [日志配置](./config.md#logs) 中配置默认值，以允许查询构建器预装默认数据库/表和列。
还可以启用 OpenTelemetry，以根据模式版本自动选择列。

默认情况下，添加了 **时间** 和 **级别** 过滤器，并为时间列添加了排序。
这些过滤器与各自的字段相关联，并将在修改列时更新。
**级别** 过滤器默认排除在 SQL 之外，从 `IS ANYTHING` 选项更改将启用它。

日志查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖所选的列，以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 列 | 要添加到日志行的额外列。可以在此字段中输入原始 SQL，以便使用函数和列别名。 |
| 时间 | 日志的主要时间戳列。将显示类似时间的类型，但允许自定义值/函数。 |
| 日志级别 | 可选。日志的 *级别* 或 *严重性*。值通常类似于 `INFO`、`error`、`Debug` 等。 |
| 消息 | 日志消息内容。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询末尾。如果设置为 `0`，则将被排除，但不建议在大型日志数据集中这样做。 |
| 过滤器 | 将应用于 `WHERE` 子句的过滤器列表。 |
| 消息过滤器 | 一个文本输入，用于方便地使用 `LIKE %value%` 过滤日志。当输入为空时被排除。 |

<Image size="md" img={demo_logs_query} alt="示例 OTel 日志查询" border />

<br/>
此查询类型将在日志面板中呈现数据，并在顶部显示日志直方图面板。

可以在扩展的日志行中查看查询中选择的额外列：
<Image size="md" img={demo_logs_query_fields} alt="日志查询中额外字段示例" border />

### 时间序列 {#time-series}

时间序列查询类型类似于 [表](#table)，但重点关注时间序列数据。

这两种视图大致相同，但有以下显著不同：
- 专用的 *时间* 字段。
- 在聚合模式下，自动应用时间间隔宏以及对时间字段的分组。
- 在聚合模式下，"列" 字段被隐藏。
- 为 **时间** 字段自动添加时间范围过滤器和排序。

:::important 您的可视化是否缺少数据？
在某些情况下，时间序列面板可能会显得被截断，因为限制默认为 `1000`。

请尝试通过将 `LIMIT` 子句设置为 `0` 来移除它（如果您的数据集允许）。
:::

| 字段 | 描述 |
|----|----|
| 构建模式  | 简单查询不包含聚合和分组，而聚合查询包含这些选项。  |
| 时间 | 查询的主要时间列。将显示类似时间的类型，但允许自定义值/函数。 |
| 列 | 选择的列。可以在此字段中输入原始 SQL，以便使用函数和列别名。仅在简单模式下可见。 |
| 聚合 | [聚合函数](/sql-reference/aggregate-functions/index.md) 的列表。允许为函数和列自定义值。仅在聚合模式下可见。 |
| 分组 | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式的列表。仅在聚合模式下可见。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询末尾。如果设置为 `0`，则将被排除，建议在一些时间序列数据集中这样做以显示完整的可视化。 |
| 过滤器 | 将应用于 `WHERE` 子句的过滤器列表。 |

<Image size="md" img={demo_time_series_query} alt="示例时间序列查询" border />

此查询类型将在时间序列面板中呈现数据。

### 跟踪 {#traces}

跟踪查询类型提供了一个查询构建器，用于轻松搜索和查看跟踪。
它是为 OpenTelemetry 数据设计的，但可以选择列以从不同的模式渲染跟踪。
可以在数据源的 [跟踪配置](./config.md#traces) 中配置默认值，以允许查询构建器预装默认数据库/表和列。如果配置了默认值，则列选择将默认折叠。
还可以启用 OpenTelemetry，以根据模式版本自动选择列。

默认过滤器被添加，目的是仅显示顶级跨度。
还包括时间和持续时间列的排序。
这些过滤器与各自的字段相关联，并将在修改列时更新。
**服务名称** 过滤器默认排除在 SQL 之外，从 `IS ANYTHING` 选项更改将启用它。

跟踪查询类型支持 [数据链接](#data-links)。

| 字段 | 描述 |
|----|----|
| 跟踪模式 | 将查询从跟踪搜索更改为跟踪 ID 查找。 |
| 使用 OTel | 启用 OpenTelemetry 列。将覆盖所选的列，以使用所选 OTel 模式版本定义的列（禁用列选择）。 |
| 跟踪 ID 列 | 跟踪的 ID。 |
| Span ID 列 | Span ID。 |
| Parent Span ID 列 | 父级 span ID。这对于顶级跟踪通常是空的。 |
| 服务名称列 | 服务名称。 |
| 操作名称列 | 操作名称。 |
| 开始时间列 | 跟踪跨度的主要时间列。跨度开始时的时间。 |
| 持续时间列 | 跨度的持续时间。默认情况下，Grafana 期望这是毫秒中的浮动值。`持续时间单位` 下拉菜单会自动应用转换。 |
| 持续时间单位 | 用于持续时间的时间单位。默认为纳秒。选择的单位将根据 Grafana 所需转换为毫秒中的浮动值。 |
| 标签列 | Span 标签。如果不使用基于 OTel 的模式，请排除此项，因为它需要特定的 Map 列类型。 |
| 服务标签列 | 服务标签。如果不使用基于 OTel 的模式，请排除此项，因为它需要特定的 Map 列类型。 |
| 排序 | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式的列表。 |
| 限制 | 将 [LIMIT](/sql-reference/statements/select/limit.md) 语句附加到查询末尾。如果设置为 `0`，则将被排除，但不建议在大型跟踪数据集中这样做。 |
| 过滤器 | 将应用于 `WHERE` 子句的过滤器列表。 |
| 跟踪 ID | 要过滤的跟踪 ID。仅在跟踪 ID 模式下使用，并在打开跟踪 ID [数据链接](#data-links) 时使用。 |

<Image size="md" img={demo_trace_query} alt="示例 OTel 跟踪查询" border />

此查询类型将在跟踪搜索模式下将数据以表格视图呈现，而在跟踪 ID 模式下将数据以跟踪面板呈现。

## SQL 编辑器 {#sql-editor}

对于过于复杂而无法使用查询构建器的查询，您可以使用 SQL 编辑器。
这使您可以完全控制查询，允许您编写和运行普通的 ClickHouse SQL。

可以通过在查询编辑器顶部选择 "SQL 编辑器" 来打开 SQL 编辑器。

[宏函数](#macros) 在此模式下仍然可以使用。

您可以在查询类型之间切换，以获得最符合您查询的可视化。
此切换在仪表板视图中也有效，尤其是在时间序列数据中。

<Image size="md" img={demo_raw_sql_query} alt="示例原始 SQL 查询" border />

## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
可以用来链接到新查询。
此功能已在 ClickHouse 插件中启用，以链接跟踪到日志以及反向链接。它在为数据源的 [配置](./config.md#opentelemetry) 同时配置日志和跟踪的 OpenTelemetry 时效果最好。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  表中跟踪链接的示例
  <Image size="sm" img={trace_id_in_table} alt="表中的跟踪链接" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  日志中的跟踪链接示例
  <Image size="md" img={trace_id_in_logs} alt="日志中的跟踪链接" border />
</div>

### 如何制作数据链接 {#how-to-make-a-data-link}

您可以通过在查询中选择一个名为 `traceID` 的列来制作数据链接。此名称不区分大小写，并支持在 "ID" 前添加下划线。例如：`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在 [日志](#logs) 或 [跟踪](#traces) 查询中启用了 OpenTelemetry，则会自动包含一个跟踪 ID 列。

通过包含跟踪 ID 列，"**查看跟踪**" 和 "**查看日志**" 链接将附加到数据。

### 链接功能 {#linking-abilities}

借助现有的数据链接，您可以使用提供的跟踪 ID 打开跟踪和日志。

"**查看跟踪**" 将打开一个包含跟踪的拆分面板，而 "**查看日志**" 将打开通过跟踪 ID 过滤的日志查询。
如果链接是从仪表板中单击而非探索视图中，链接将在探索视图的新标签页中打开。

在交叉查询类型（日志到跟踪和跟踪到日志）时，配置 [日志](./config.md#logs) 和 [跟踪](./config.md#traces) 的默认值是必需的。当打开同一查询类型的链接时，则不需要默认值，因为查询可以简单复制。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  从日志查询（左面板）查看跟踪（右面板）的示例
  <Image size="md" img={demo_data_links} alt="数据链接链接示例" border />
</div>

## 宏 {#macros}

宏是向查询添加动态 SQL 的简单方法。
在查询发送到 ClickHouse 服务器之前，插件会扩展宏并将其替换为完整表达式。

来自 SQL 编辑器和查询构建器的查询都可以使用宏。

### 使用宏 {#using-macros}

宏可以在查询中的任何地方包含，必要时多次使用。

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

该插件还支持使用大括号 `{}` 的表示法。当需要在 [参数](/sql-reference/syntax.md#defining-and-using-query-parameters) 中进行查询时使用此表示法。

### 宏列表 {#list-of-macros}

以下是插件中所有可用宏的列表：

| 宏                                            | 描述                                                                                                                                                                                 | 输出示例                                                                                                        |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `$__dateFilter(columnName)`                  | 被提供的列上的时间范围过滤器替换，使用 Grafana 面板的时间范围作为 [日期](/sql-reference/data-types/date.md)。                                                             | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                     |
| `$__timeFilter(columnName)`                  | 被提供的列上的时间范围过滤器替换，使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md)。                                                     | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                     |
| `$__timeFilter_ms(columnName)`               | 被提供的列上的时间范围过滤器替换，使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md)。                                                  | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 组合 `$__dateFilter()` 和 `$__timeFilter()` 的简写，使用单独的日期和 DateTime 列。别名 `$__dt()`                                                                                      | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | 被 Grafana 面板范围的起始时间转换为 [DateTime](/sql-reference/data-types/datetime.md) 的替换。                                                                           | `toDateTime(1415792726)`                                                                                        |
| `$__fromTime_ms`                             | 被面板范围的起始时间转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 的替换。                                                                                   | `fromUnixTimestamp64Milli(1415792726123)`                                                                        |
| `$__toTime`                                  | 被 Grafana 面板范围的结束时间转换为 [DateTime](/sql-reference/data-types/datetime.md) 的替换。                                                                            | `toDateTime(1447328726)`                                                                                        |
| `$__toTime_ms`                               | 被面板范围的结束时间转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 的替换。                                                                                    | `fromUnixTimestamp64Milli(1447328726456)`                                                                        |
| `$__timeInterval(columnName)`                | 被计算基于窗口大小（以秒为单位）计算间隔的函数替换。                                                                                                                               | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                               |
| `$__timeInterval_ms(columnName)`             | 被计算基于窗口大小（以毫秒为单位）计算间隔的函数替换。                                                                                                                          | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                   |
| `$__interval_s`                              | 被仪表板间隔（以秒为单位）替换。                                                                                                                                                  | `20`                                                                                                            |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量不选择每个值时，用第一个参数替换。當模板变量选择每个值时用 1=1 替换。                                                                    | `condition` 或 `1=1`                                                                                          |
