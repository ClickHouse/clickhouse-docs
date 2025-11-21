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


# 查询构建器

<ClickHouseSupportedBadge/>

任何查询都可以使用 ClickHouse 插件运行。
查询构建器适合用于较为简单的查询，对于复杂查询则需要使用 [SQL 编辑器](#sql-editor)。

查询构建器中的所有查询都有一个[查询类型](#query-types)，并且至少需要选择一列。

可用的查询类型包括：
- [表](#table)：用于以表格形式展示数据的最简单查询类型。适合作为包含聚合函数的简单和复杂查询的通用类型。
- [日志](#logs)：针对构建日志查询进行了优化。在配置了[默认设置](./config.md#logs)的探索视图中效果最佳。
- [时间序列](#time-series)：最适合用于构建时间序列查询。允许选择专用时间列并添加聚合函数。
- [跟踪](#traces)：针对搜索/查看跟踪数据进行了优化。在配置了[默认设置](./config.md#traces)的探索视图中效果最佳。
- [SQL 编辑器](#sql-editor)：当需要对查询进行完全控制时，可以使用 SQL 编辑器。在此模式下，可以执行任意 SQL 查询。



## 查询类型 {#query-types}

_查询类型_ 设置会改变查询构建器的布局,以匹配正在构建的查询类型。
查询类型还决定了可视化数据时使用的面板。

### 表格 {#table}

最灵活的查询类型是表格查询。这是一个通用的查询构建器,用于处理简单查询和聚合查询。

| 字段        | 描述                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Builder Mode | 简单查询不包括聚合和 Group By,而聚合查询包括这些选项。                                                                                                               |
| Columns      | 选定的列。可以在此字段中输入原始 SQL 以支持函数和列别名。                                                                                                       |
| Aggregates   | [聚合函数](/sql-reference/aggregate-functions/index.md)列表。允许为函数和列自定义值。仅在聚合模式下可见。                                              |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在聚合模式下可见。                                                                                              |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                                              |
| Limit        | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`,则将被排除。某些可视化可能需要将其设置为 `0` 以显示所有数据。 |
| Filters      | 要在 `WHERE` 子句中应用的过滤器列表。                                                                                                                                                       |

<Image
  size='md'
  img={demo_table_query}
  alt='聚合表格查询示例'
  border
/>

此查询类型将以表格形式呈现数据。

### 日志 {#logs}

日志查询类型提供了一个专注于查询日志数据的查询构建器。
可以在数据源的[日志配置](./config.md#logs)中配置默认值,以便查询构建器预加载默认数据库/表和列。
还可以启用 OpenTelemetry 以根据架构版本自动选择列。

默认情况下会添加 **Time** 和 **Level** 过滤器,以及 Time 列的 Order By。
这些过滤器与其各自的字段绑定,并会随着列的更改而更新。
**Level** 过滤器默认从 SQL 中排除,将其从 `IS ANYTHING` 选项更改后将启用它。

日志查询类型支持[数据链接](#data-links)。

| 字段          | 描述                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Use OTel       | 启用 OpenTelemetry 列。将覆盖选定的列以使用所选 OTel 架构版本定义的列(禁用列选择)。                                 |
| Columns        | 要添加到日志行的额外列。可以在此字段中输入原始 SQL 以支持函数和列别名。                                                                |
| Time           | 日志的主时间戳列。将显示类似时间的类型,但允许自定义值/函数。                                                                            |
| Log Level      | 可选。日志的_级别_或_严重性_。值通常类似于 `INFO`、`error`、`Debug` 等。                                                                                  |
| Message        | 日志消息内容。                                                                                                                                                                                   |
| Order By       | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                            |
| Limit          | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`,则将被排除,但对于大型日志数据集不建议这样做。 |
| Filters        | 要在 `WHERE` 子句中应用的过滤器列表。                                                                                                                                     |
| Message Filter | 用于使用 `LIKE %value%` 方便地过滤日志的文本输入。输入为空时排除。                                                                                         |

<Image size='md' img={demo_logs_query} alt='OTel 日志查询示例' border />

<br />
此查询类型将在日志面板中呈现数据,并在顶部显示日志直方图面板。

在查询中选择的额外列可以在展开的日志行中查看:

<Image
  size='md'
  img={demo_logs_query_fields}
  alt='日志查询中额外字段的示例'
  border
/>

### 时间序列 {#time-series}

时间序列查询类型类似于[表格](#table),但侧重于时间序列数据。

这两个视图大部分相同,但有以下显著差异:

- 专用的 _Time_ 字段。
- 在聚合模式下,会自动应用时间间隔宏以及 Time 字段的 Group By。
- 在聚合模式下,"Columns" 字段被隐藏。
- 自动为 **Time** 字段添加时间范围过滤器和 Order By。

:::important 您的可视化缺少数据吗?
在某些情况下,时间序列面板会显得被截断,因为限制默认为 `1000`。

尝试通过将其设置为 `0` 来移除 `LIMIT` 子句(如果您的数据集允许)。
:::


| 字段        | 描述                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 构建器模式 | 简单查询不包含聚合和 Group By,而聚合查询包含这些选项。                                                                                                                                     |
| 时间         | 查询的主时间列。将显示时间类型,但允许自定义值/函数。                                                                                                                       |
| 列      | 选定的列。可以在此字段中输入原始 SQL 以使用函数和列别名。仅在简单模式下可见。                                                                                                |
| 聚合   | [聚合函数](/sql-reference/aggregate-functions/index.md)列表。允许为函数和列使用自定义值。仅在聚合模式下可见。                                                                    |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md) 表达式列表。仅在聚合模式下可见。                                                                                                                    |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                                                                    |
| Limit        | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`,则将被排除,对于某些时间序列数据集建议使用此设置以显示完整的可视化效果。 |
| 过滤器      | 要在 `WHERE` 子句中应用的过滤器列表。                                                                                                                                                                             |

<Image
  size='md'
  img={demo_time_series_query}
  alt='时间序列查询示例'
  border
/>

此查询类型将使用时间序列面板呈现数据。

### 追踪 {#traces}

追踪查询类型提供了一个查询构建器,用于轻松搜索和查看追踪。
它专为 OpenTelemetry 数据设计,但可以选择列来呈现来自不同模式的追踪。
可以在数据源的[追踪配置](./config.md#traces)中配置默认值,以允许查询构建器预加载默认数据库/表和列。如果配置了默认值,列选择将默认折叠。
还可以启用 OpenTelemetry 以根据模式版本自动选择列。

默认添加过滤器以仅显示顶级 span。
还包括对时间和持续时间列的 Order By。
这些过滤器与其各自的字段绑定,并将随着列的更改而更新。
默认情况下,**服务名称**过滤器从 SQL 中排除,将其从 `IS ANYTHING` 选项更改将启用它。

追踪查询类型支持[数据链接](#data-links)。

| 字段                 | 描述                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追踪模式            | 将查询从追踪搜索更改为追踪 ID 查找。                                                                                                                                      |
| 使用 OTel              | 启用 OpenTelemetry 列。将覆盖选定的列以使用所选 OTel 模式版本定义的列(禁用列选择)。                                   |
| 追踪 ID 列       | 追踪的 ID。                                                                                                                                                                              |
| Span ID 列        | Span ID。                                                                                                                                                                                     |
| 父 Span ID 列 | 父 span ID。对于顶级追踪,这通常为空。                                                                                                                                  |
| 服务名称列   | 服务名称。                                                                                                                                                                                |
| 操作名称列 | 操作名称。                                                                                                                                                                              |
| 开始时间列     | 追踪 span 的主时间列。span 开始的时间。                                                                                                                  |
| 持续时间列  | span 的持续时间。默认情况下,Grafana 期望这是以毫秒为单位的浮点数。通过 `持续时间单位` 下拉菜单自动应用转换。                             |
| 持续时间单位         | 用于持续时间的时间单位。默认为纳秒。所选单位将根据 Grafana 的要求转换为以毫秒为单位的浮点数。                                       |
| 标签列           | Span 标签。如果不使用基于 OTel 的模式,请排除此项,因为它需要特定的 Map 列类型。                                                                                          |
| 服务标签列   | 服务标签。如果不使用基于 OTel 的模式,请排除此项,因为它需要特定的 Map 列类型。                                                                                       |
| Order By              | [ORDER BY](/sql-reference/statements/select/order-by.md) 表达式列表。                                                                                                              |
| Limit                 | 在查询末尾附加 [LIMIT](/sql-reference/statements/select/limit.md) 语句。如果设置为 `0`,则将被排除,但对于大型追踪数据集不建议这样做。 |
| 过滤器               | 要在 `WHERE` 子句中应用的过滤器列表。                                                                                                                                       |
| 追踪 ID              | 要过滤的追踪 ID。仅在追踪 ID 模式下使用,以及打开追踪 ID [数据链接](#data-links)时使用。                                                                                 |

<Image size='md' img={demo_trace_query} alt='OTel 追踪查询示例' border />

此查询类型将在追踪搜索模式下使用表格视图呈现数据,在追踪 ID 模式下使用追踪面板呈现数据。


## SQL 编辑器 {#sql-editor}

对于查询构建器难以处理的复杂查询,您可以使用 SQL 编辑器。
通过编写和运行原生 ClickHouse SQL,您可以完全控制查询。

在查询编辑器顶部选择"SQL Editor"即可打开 SQL 编辑器。

在此模式下仍可使用[宏函数](#macros)。

您可以在不同查询类型之间切换,以获得最适合您查询的可视化效果。
即使在仪表板视图中,此切换也会生效,尤其是对时间序列数据。

<Image size='md' img={demo_raw_sql_query} alt='原生 SQL 查询示例' border />


## 数据链接 {#data-links}

Grafana [数据链接](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)可用于链接到新查询。

此功能已在 ClickHouse 插件中启用,用于将追踪链接到日志,反之亦然。当在[数据源配置](./config.md#opentelemetry)中同时为日志和追踪配置了 OpenTelemetry 时,效果最佳。

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
  <Image size='sm' img={trace_id_in_table} alt='Trace links in table' border />
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
  <Image size='md' img={trace_id_in_logs} alt='Trace links in logs' border />
</div>

### 如何创建数据链接 {#how-to-make-a-data-link}

您可以通过在查询中选择名为 `traceID` 的列来创建数据链接。此名称不区分大小写,并支持在 "ID" 之前添加下划线。例如:`traceId`、`TraceId`、`TRACE_ID` 和 `tracE_iD` 都是有效的。

如果在[日志](#logs)或[追踪](#traces)查询中启用了 OpenTelemetry,则会自动包含追踪 ID 列。

通过包含追踪 ID 列,"**查看追踪**"和"**查看日志**"链接将附加到数据上。

### 链接功能 {#linking-abilities}

有了数据链接,您可以使用提供的追踪 ID 打开追踪和日志。

"**查看追踪**"将打开一个包含追踪的拆分面板,"**查看日志**"将打开一个按追踪 ID 过滤的日志查询。
如果从仪表板而不是探索视图中点击链接,该链接将在探索视图的新标签页中打开。

在跨查询类型(从日志到追踪以及从追踪到日志)时,需要为[日志](./config.md#logs)和[追踪](./config.md#traces)都配置默认值。当打开相同查询类型的链接时不需要默认值,因为可以直接复制查询。

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
    alt='Example of data links linking'
    border
  />
</div>


## 宏 {#macros}

宏是向查询添加动态 SQL 的一种简单方法。
在查询发送到 ClickHouse 服务器之前,插件会展开宏并将其替换为完整表达式。

SQL 编辑器和查询构建器中的查询都可以使用宏。

### 使用宏 {#using-macros}

宏可以包含在查询的任何位置,如有需要可以多次使用。

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

该插件还支持使用大括号 `{}` 的表示法。当需要在[参数](/sql-reference/syntax.md#defining-and-using-query-parameters)内部使用查询时,请使用此表示法。

### 宏列表 {#list-of-macros}

以下是插件中所有可用宏的列表:

| 宏                                        | 描述                                                                                                                                                                         | 输出示例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 使用 Grafana 面板的时间范围作为 [Date](/sql-reference/data-types/date.md) 类型,替换为对指定列的时间范围过滤器。                                         | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 使用 Grafana 面板的时间范围作为 [DateTime](/sql-reference/data-types/datetime.md) 类型,替换为对指定列的时间范围过滤器。                                 | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 使用 Grafana 面板的时间范围作为 [DateTime64](/sql-reference/data-types/datetime64.md) 类型,替换为对指定列的时间范围过滤器。                             | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 使用独立的 Date 和 DateTime 列组合 `$__dateFilter()` 和 `$__timeFilter()` 的简写形式。别名 `$__dt()`                                                           | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | 替换为 Grafana 面板范围的起始时间,转换为 [DateTime](/sql-reference/data-types/datetime.md) 类型。                                                               | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | 替换为面板范围的起始时间,转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 类型。                                                                   | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | 替换为 Grafana 面板范围的结束时间,转换为 [DateTime](/sql-reference/data-types/datetime.md) 类型。                                                                 | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | 替换为面板范围的结束时间,转换为 [DateTime64](/sql-reference/data-types/datetime64.md) 类型。                                                                     | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | 替换为根据窗口大小(以秒为单位)计算时间间隔的函数。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | 替换为根据窗口大小(以毫秒为单位)计算时间间隔的函数。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | 替换为仪表板时间间隔(以秒为单位)。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 当第二个参数中的模板变量未选择所有值时,替换为第一个参数。当模板变量选择所有值时,替换为 1=1。 | `condition` 或 `1=1`                                                                                              |
