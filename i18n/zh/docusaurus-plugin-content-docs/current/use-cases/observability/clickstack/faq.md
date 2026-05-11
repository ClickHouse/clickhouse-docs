---
slug: /use-cases/observability/clickstack/faq
title: 'ClickStack 常见问题'
sidebar_label: '常见问题'
pagination_prev: null
pagination_next: null
description: '关于 ClickStack 告警、仪表板、下钻分析和指标发现的常见问题。'
doc_type: 'guide'
keywords: ['ClickStack', 'FAQ', '告警', '仪表板', '下钻分析', '指标发现']
---

本页解答有关 ClickStack 功能的常见问题，包括告警、仪表板和下钻分析，以及指标发现。

## 告警 \{#alerting\}

<details>
<summary><strong>ClickStack 支持哪些类型的告警？</strong></summary>

ClickStack 支持两种类型的告警：

- [搜索告警](/use-cases/observability/clickstack/alerts#search-alerts) — 当在某个时间窗口内匹配的日志或追踪结果数量超过或低于阈值时触发通知。
- [仪表盘图表告警](/use-cases/observability/clickstack/alerts#dashboard-alerts) — 当在仪表盘卡片上展示的某个指标跨越预先定义的阈值时触发通知。

这两种告警类型都使用静态阈值条件。完整详情请参阅 [告警](/use-cases/observability/clickstack/alerts)。

</details>

<details>
<summary><strong>我可以对比率、p95/p99 或多指标公式等复杂指标条件进行告警吗？</strong></summary>

可以使用 [图表构建器](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) UI 在仪表盘卡片上绘制两个指标的比率，以及 p95 和 p99 值。随后你可以基于这些卡片创建阈值告警。

但是，ClickStack 当前不支持：

- 基于自定义 SQL 指标查询进行告警。
- 将多条件或多指标告警规则合并为单个告警。
- 基于动态阈值或异常检测的告警条件（异常检测已在规划中）。

如果你需要对复杂指标进行告警，推荐的方法是先将其构建为仪表盘图表，然后在该图表上附加一个阈值告警。

</details>

<details>
<summary><strong>我可以将 materialized views 用于告警场景吗？</strong></summary>

在适用的情况下，ClickStack 会自动使用 materialized views 来实现告警。不过，当前在 OpenTelemetry 指标数据源上尚不支持 materialized views。对于指标，ClickStack 与默认的 [ClickHouse OpenTelemetry 指标 schema](/use-cases/observability/clickstack/ingesting-data/schemas) 配合效果最佳。有关 materialized views 的更多信息，请参阅 [Materialized views](/use-cases/observability/clickstack/materialized_views)。

</details>

## 仪表板和下钻 \{#dashboards-and-drill-downs\}

<details>
<summary><strong>ClickStack 是否支持参数化仪表板或仪表板变量？</strong></summary>

ClickStack 在仪表板上支持自定义下拉过滤器，这些过滤器由从 ClickHouse 查询的数据填充。通过这些过滤器，你可以将仪表板上的所有图块动态限定到某个特定值（例如服务名、环境或主机）。

ClickStack 当前不支持类似 Grafana 模板变量那样可复用的仪表板变量。由于 ClickStack 仅使用 ClickHouse 作为数据源，下钻和过滤功能可以原生提供，而无需引入变量抽象层。

有关创建仪表板和应用过滤器的详细信息，请参阅 [Dashboards](/use-cases/observability/clickstack/dashboards)。

</details>

<details>
<summary><strong>有哪些可用的下钻功能？</strong></summary>

ClickStack 支持以下下钻工作流程：

- [仪表板级过滤](/use-cases/observability/clickstack/dashboards#filter-dashboards) — 在仪表板级别应用的 Lucene 或 SQL 过滤器以及时间范围调整会传播到所有图块。
- 自定义仪表板过滤器 — 自定义仪表板支持显式过滤控件，这些控件由你的数据中的值填充，使用户无需手动编写查询即可为所有图块限定范围。
- 点击查看事件 — 在仪表板图块中点击数据并选择 **View Events** 会跳转到带有相关日志和追踪数据过滤条件的 [Search](/use-cases/observability/clickstack/search) 页面。
- [预构建仪表板下钻](/use-cases/observability/clickstack/dashboards#presets) — [Services](/use-cases/observability/clickstack/dashboards#services-dashboard)、[ClickHouse](/use-cases/observability/clickstack/dashboards#clickhouse-dashboard) 和 [Kubernetes](/use-cases/observability/clickstack/dashboards#kubernetes-dashboard) 仪表板包含更丰富的内置跨标签页下钻导航。

目前不支持从一个自定义仪表板到另一个自定义仪表板的多级下钻（仪表板 → 仪表板 → 详情视图）。

:::note
**View Events** 下钻在日志和追踪数据上效果最佳。由于无法在 [Search](/use-cases/observability/clickstack/search) 页面中直接查看指标数据，从指标图块下钻时，将会跳转到所选时间范围附近对应的日志。
:::

</details>

## 指标发现 \{#metrics-discovery\}

<details>
<summary><strong>是否提供用于浏览和搜索指标的界面？</strong></summary>

![Metric Attribute Explorer](/images/clickstack/faq/metrics-explorer.png)

可以通过 [图表构建器](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) 中的指标名称下拉列表来发现可用的指标。选择某个指标后，Metric Attribute Explorer 面板会显示该指标的描述、单位以及可用属性及其取值。这样可以在面板中浏览属性，并将其直接添加为过滤条件或分组字段（group-by）。

当前还没有类似日志搜索体验的专用指标搜索页面。改进指标发现功能是一个正在进行中的开发重点。

</details>

<details>
<summary><strong>基于 SQL 的发现方式是否是指标的长期方案？</strong></summary>

不是。尽管目前可以通过 SQL 查询来发现指标，但这并不是预期的长期方案。改进指标发现工具目前正在积极开发中。

</details>

## 延伸阅读 \{#further-reading\}

- [Alerts](/use-cases/observability/clickstack/alerts) — 搜索告警、仪表盘图表告警和 webhook 集成。
- [Dashboards](/use-cases/observability/clickstack/dashboards) — 创建可视化、构建仪表盘并应用过滤器。
- [Search](/use-cases/observability/clickstack/search) — 使用 Lucene 和 SQL 语法查询日志和追踪。
- [Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) — 面向日志、追踪和指标的 OpenTelemetry 数据架构（schemas）。
- [Architecture](/use-cases/observability/clickstack/architecture) — ClickStack 组件及其组合方式。