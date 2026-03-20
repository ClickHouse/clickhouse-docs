---
slug: /use-cases/observability/clickstack/dashboards/sql-visualizations
title: '基于 SQL 的可视化'
sidebar_label: '基于 SQL 的可视化'
pagination_prev: null
pagination_next: null
description: '在 ClickStack 中使用 SQL 查询创建可视化'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'sql', 'observability']
---

import Image from '@theme/IdealImage';
import sql_editor_button from '@site/static/images/use-cases/observability/sql-editor-button.png';

ClickStack 支持基于原始 SQL 查询的可视化。这让您能够完全控制查询逻辑，同时仍能与仪表板级别的时间范围、仪表板级筛选器和图表渲染集成。

当您需要实现内置 Chart Explorer 之外的功能时，基于 SQL 的可视化会非常有用——例如，关联表，或构建图表构建器不支持的复杂聚合。

## 创建基于 SQL 的可视化 \{#creating-a-raw-sql-chart\}

要创建基于 SQL 的可视化，请打开仪表板图块编辑器并选择 **SQL** 选项卡。 

<Image img={sql_editor_button} alt="SQL 编辑器按钮" size="lg"/>

接下来：

1. 选择一个 **ClickHouse 连接** 作为运行查询的目标。
2. 可选择一个 **数据源**——这样可通过 `$__filters` 宏将仪表板级筛选器应用到图表。
3. 在编辑器中编写 SQL 查询，并使用查询参数和宏与仪表板的时间范围及筛选器集成。
4. 点击 **play** 按钮预览结果，然后点击 **Save**。

## 查询参数 \{#query-parameters\}

[查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 允许您在 SQL 中引用仪表板当前的时间范围和粒度。它们使用 ClickHouse 参数化查询语法：`{paramName:Type}`。

### Available parameters \{#available-parameters\}

可用参数取决于图表类型：

**折线图和堆叠条形图：**

| Parameter                       | Type    | Description                                               |
|---------------------------------|---------|-----------------------------------------------------------|
| `{startDateMilliseconds:Int64}` | Int64   | 仪表板日期范围的开始时间（自 Unix 纪元以来的毫秒数）      |
| `{endDateMilliseconds:Int64}`   | Int64   | 仪表板日期范围的结束时间（自 Unix 纪元以来的毫秒数）      |
| `{intervalSeconds:Int64}`       | Int64   | 时间桶大小，以秒为单位（基于粒度）                        |
| `{intervalMilliseconds:Int64}`  | Int64   | 时间桶大小，以毫秒为单位（基于粒度）                      |

**表格、饼图和数值图表：**

| Parameter                       | Type    | Description                                               |
|---------------------------------|---------|-----------------------------------------------------------|
| `{startDateMilliseconds:Int64}` | Int64   | 仪表板日期范围的开始时间（自 Unix 纪元以来的毫秒数）      |
| `{endDateMilliseconds:Int64}`   | Int64   | 仪表板日期范围的结束时间（自 Unix 纪元以来的毫秒数）      |

## 宏 \{#macros\}

宏是可展开为常见 ClickHouse SQL 表达式的简写。它们以 `$__` 为前缀，并会在查询发送到 ClickHouse 之前完成替换。

### 时间边界宏 \{#time-boundary-macros\}

这些宏会返回一个表示仪表板起始时间或结束时间的 ClickHouse 表达式。它们不接受任何参数。

| Macro            | 展开为                                                                   | 列类型        |
| ---------------- | --------------------------------------------------------------------- | ---------- |
| `$__fromTime`    | `toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))` | DateTime   |
| `$__toTime`      | `toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))`   | DateTime   |
| `$__fromTime_ms` | `fromUnixTimestamp64Milli({startDateMilliseconds:Int64})`             | DateTime64 |
| `$__toTime_ms`   | `fromUnixTimestamp64Milli({endDateMilliseconds:Int64})`               | DateTime64 |
| `$__interval_s`  | `{intervalSeconds:Int64}`                                             | Int64      |

### 时间过滤宏 \{#time-filter-macros\}

这些宏会生成 `WHERE` 子句片段，用于按仪表板的时间范围过滤列。

| Macro                                 | 描述                               |
| ------------------------------------- | -------------------------------- |
| `$__timeFilter(column)`               | 按仪表板时间范围过滤 `DateTime` 列          |
| `$__timeFilter_ms(column)`            | 按仪表板时间范围过滤 `DateTime64` (毫秒) 列   |
| `$__dateFilter(column)`               | 按仪表板时间范围过滤 `Date` 列              |
| `$__dateTimeFilter(dateCol, timeCol)` | 使用单独的 `Date` 列和 `DateTime` 列进行过滤 |
| `$__dt(dateCol, timeCol)`             | `$__dateTimeFilter` 的别名          |

`$__timeFilter(TimestampTime)` 的**展开示例**：

```sql
TimestampTime >= toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
AND TimestampTime <= toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
```


### 时间间隔宏 \{#time-interval-macros\}

这些宏会将时间戳列按与仪表板粒度匹配的时间间隔进行分桶。它们通常用于时间序列图表的 `SELECT` 和 `GROUP BY` 子句中。仅适用于折线图和堆叠条形图可视化。

| Macro                        | 描述                                                 |
| ---------------------------- | -------------------------------------------------- |
| `$__timeInterval(column)`    | 将 `DateTime` 列按 `intervalSeconds` 的时间间隔进行分桶        |
| `$__timeInterval_ms(column)` | 将 `DateTime64` 列按 `intervalMilliseconds` 的时间间隔进行分桶 |

`$__timeInterval(TimestampTime)` 的**展开示例**：

```sql
toStartOfInterval(toDateTime(TimestampTime), INTERVAL {intervalSeconds:Int64} second)
```


### Dashboard filter macro \{#dashboard-filter-macro\}

| Macro         | Description                                                    |
|---------------|----------------------------------------------------------------|
| `$__filters`  | 替换为仪表板级筛选器条件（需要先选择一个数据源）               |

当在图表上选择了**数据源**且仪表板级筛选器处于启用状态时，`$__filters` 会展开为对应的 SQL `WHERE` 条件。未选择数据源或未应用任何筛选器时，它会展开为 `(1=1)`，因此始终可以安全地将其包含在 `WHERE 子句` 中。

## How query results are plotted \{#how-results-are-plotted\}

ClickStack 会根据列类型自动将结果列映射到图表元素。不同图表类型的映射规则有所不同。

### 折线图和堆叠条形图 \{#line-and-stacked-bar-charts\}

| 角色 | 列类型 | 描述 |
|--------------------|------------------------------------|---------------------------------------------------------------------------------------------|
| **时间戳** | 第一个 `Date` 或 `DateTime` 列 | 用作 x 轴。 |
| **序列值** | 所有数值列 | 每个数值列都会绘制为一个单独的序列。这些通常是聚合值。 |
| **分组名称** | String、Map 或 Array 列 | 可选。分组值不同的行会绘制为单独的序列。 |

### 饼图 \{#pie-chart\}

| 角色       | 列类型                  | 描述                  |
| -------- | -------------------- | ------------------- |
| **切片值**  | 第一个数值列               | 决定各个扇区的大小。          |
| **切片标签** | String、Map 或 Array 列 | 可选。每个唯一值都会成为一个扇区标签。 |

### 数值图表 \{#number-chart\}

| Role       | Column type          | Description                                  |
|------------|----------------------|----------------------------------------------|
| **Number** | First numeric column | 显示第一个数值列第一行的值。                 |

### 表格图表 \{#table-chart\}

所有结果列都会直接显示为表格列。

## 示例 \{#examples\}

:::note 必需的 system table 访问权限
如果要在 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 上运行以下示例，则需要指定 `otel_v2.otel_logs` 或 `otel_v2.otel_traces`。
:::

### 折线图表 — 按服务划分的日志计数随时间变化 \{#example-line-chart\}

此查询按服务统计日志事件数，并按与仪表板粒度一致的时间间隔进行分桶。

```sql
SELECT
  toStartOfInterval(TimestampTime, INTERVAL {intervalSeconds:Int64} second) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

- `ts` (DateTime) 用作 x 轴时间戳。
- `count` (numeric) 作为序列值绘制。
- `ServiceName` (string) 为每个服务生成一条单独的线。

### 折线图表 — 使用宏 \{#example-line-chart-macros\}

为简洁起见，下面是使用宏写法的相同查询：

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

### 堆叠条形图表 — 按严重程度划分的错误计数 \{#example-stacked-bar\}

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  lower(SeverityText),
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND lower(SeverityText) IN ('error', 'warn')
  AND $__filters
GROUP BY SeverityText, ts
ORDER BY ts ASC
```

### Table chart — 前 10 个最慢的 endpoint \{#example-table\}

```sql
SELECT
  SpanName AS endpoint,
  avg(Duration) / 1000 AS avg_duration_ms,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY SpanName
ORDER BY avg_duration_ms DESC
LIMIT 10
```


### 饼图图表 — 按服务划分的请求分布 \{#example-pie\}

```sql
SELECT
  ServiceName,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY ServiceName
```

- `request_count` (numeric) 决定每个切片的大小。
- `ServiceName` (string) 用作每个切片的标签。

### 数值图表 — 错误总数 \{#example-number\}

```sql
SELECT
  count() AS total_errors
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND SeverityText = 'error'
  AND $__filters
```

将显示第一行中的单个数值 `total_errors`。

## 注意事项 \{#notes\}

* 基于 SQL 的可视化会在启用 `readonly` 模式时执行——仅允许 `SELECT` 查询。
* 基于 SQL 的可视化必须且只能包含一个 SQL 查询，不支持多个查询。
* SQL 编辑器会为查询参数和宏提供自动补全建议。
* 必须先选择一个数据源，才能将仪表板筛选器应用到基于 SQL 的可视化。该数据源应与所查询的表一致，以确保筛选准确。