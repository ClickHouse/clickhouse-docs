---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-29
title: '演示日 - 2026-05-29'
sidebar_label: '2026-05-29'
sidebar_position: -20260529
pagination_prev: null
pagination_next: null
description: 'ClickStack 2026-05-29 演示日'
doc_type: 'guide'
keywords: ['ClickStack', '演示日']
---

## 支持版本感知的 schema 过滤改进 \{#version-aware-improved-schema-filtering\}

*由 [@knudtty](https://github.com/knudtty) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bAVaBnfJ82Y" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack 现在仅在 ClickHouse 26.2 及以上版本中启用 direct&#95;read 优化，因为这些版本中的全文搜索索引已能正确支持加入开源 schema 的别名列。此前，旧版本中也可能会尝试应用这一优化，但实际上无法正常工作。版本检查会在查询时通过检查 schema 来完成，而这些别名列现在也已默认包含在开源 schema 中。

另外还展示了一项仍在进行中的工作：用直接查询文本索引来替代自动补全 materialized view。目前这两者的功能有所重叠，因而增加了摄取压力。如果基准测试确认文本索引查询在性能上能够达标，就可以简化甚至移除 materialized view。Aaron 还解答了团队提出的问题：未来 ClickHouse 文本索引版本中的位置编码，可能会让键值过滤查找更加准确。

**相关 PR：** [#2341](https://github.com/hyperdxio/hyperdx/pull/2341) feat: 默认对日志和链路追踪启用 direct&#95;read 优化，[#2405](https://github.com/hyperdxio/hyperdx/pull/2405) feat(common-utils): 将 direct&#95;read KV items 优化应用于 SQL 过滤器，[#2376](https://github.com/hyperdxio/hyperdx/pull/2376) feat: 使用文本索引支持过滤器和自动补全

## 更好的日志解析 \{#better-log-parsing\}

*由 [@dhable](https://github.com/dhable) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/vhkMlddahu4" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

某个客户的日志中，事件体是一个包含 `level` 字段的 JSON 对象。严重级别推断逻辑会做两件事：将事件体解析为 JSON 以提取属性；如果 OTel 层未设置严重级别，再回退到字符串匹配。结果，字符串匹配从事件体中的某个告警管理器名称里匹配到了单词 “alert”，从而误判了日志级别。

这个修复添加了一个守卫条件：如果事件体能解析为 JSON，且已包含 `level` 字段，就完全跳过字符串推断步骤。大约一年前构建的一套冒烟测试，让验证这项修复并捕获相关边界情况变得非常容易——只需添加新的测试用例即可，而这也正是它的设计目的。

**相关 PR：** [#2363](https://github.com/hyperdxio/hyperdx/pull/2363) fix(log-parser): 当事件体解析为包含 `level` 字段的 JSON 时，跳过字符串推断

## MCP 服务器改进 \{#mcp-server-improvements\}

*演示者：[ @brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aIy1zfmlz3Y" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

本周上线了多项 MCP 改进：优化了事件模式的分桶和评分，改进了错误提示，并整理了共享辅助函数。工具前缀也从 `hyperdx_` 更名为 `clickstack_`，以匹配产品名称。

**相关 PR：** [#2337](https://github.com/hyperdxio/hyperdx/pull/2337) feat(mcp): 提升 MCP 工具质量——错误提示、共享辅助函数、更清晰的消息，[#2396](https://github.com/hyperdxio/hyperdx/pull/2396) refactor(mcp): 将工具前缀从 hyperdx&#95; 更名为 clickstack&#95;，[#2343](https://github.com/hyperdxio/hyperdx/pull/2343) feat(mcp): 添加 patch&#95;dashboard、get&#95;dashboard&#95;tile、search&#95;dashboards 工具，[#2418](https://github.com/hyperdxio/hyperdx/pull/2418) fix(mcp): 改进别名说明和示例，使图表图例更易读，[#2412](https://github.com/hyperdxio/hyperdx/pull/2412) refactor: 使用共享辅助函数和 schema 级检查简化 MCP ObjectId 验证

## 新的系列配色板 \{#new-series-color-palette\}

*演示者：[ @elizabetdev](https://github.com/elizabetdev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/YzECP3diWvg" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

为了配合 Alex 的取色器相关工作，Elizabet 着手统一 HyperDX 和 ClickStack 主题中的数据可视化配色板。这两个主题原本各自使用独立的配色板，并分别带有一些特殊规则，导致颜色选择和使用变得不必要地复杂。她的目标是打造一套同时适用于两种主题的统一配色板。

她借助色觉模拟工具，对照业界常用的配色板 (Tableau、Observable、IBM) 进行了测试，以检查对比度和无障碍表现。ClickHouse 配色板表现较差——其中的绿色在白色背景上的对比度不足。Tableau 和 Observable 也都至少有一项检查未通过；IBM 的配色板虽然全部通过，但只有五种颜色，不够用。综合来看，Observable 的配色板最接近目标，只需对蓝色稍作调整，今后也将同时用于这两种主题。

**相关 PR：** [#2362](https://github.com/hyperdxio/hyperdx/pull/2362) refactor(theme): 将图表配色板标记重命名为色相名称，并统一到各主题中

## 带吸顶页头的新页面布局 \{#new-page-layout-with-sticky-header\}

*演示者：[ @elizabetdev](https://github.com/elizabetdev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e7d3ocqi4Ac" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

新版 PageHeader 和 PageLayout 组件组合现已应用到所有主要页面，包括：仪表盘、Service Map、客户端会话、Kubernetes 以及 ClickHouse 仪表盘。现在，所有页面都采用统一的内边距、标题下方分隔线和标题结构。在此之前，各页面并不统一——有些页面左侧是标题、右侧是控件，有些页面则完全没有标题。

吸顶行为通过 prop 按需启用。传入 sticky 插槽的任何内容，在滚动时都会固定在页头下方；其余内容则正常滚动。如果没有传入任何内容，只有面包屑或页面选项时，它们会自动吸顶。

**相关 PR：** [#2282](https://github.com/hyperdxio/hyperdx/pull/2282) 添加 PageHeader/PageLayout 并迁移 Sessions，[#2345](https://github.com/hyperdxio/hyperdx/pull/2345) 在列表页面使用 PageHeader 标题，[#2346](https://github.com/hyperdxio/hyperdx/pull/2346) 将 Service Map 迁移到 PageLayout，[#2347](https://github.com/hyperdxio/hyperdx/pull/2347) 将 Kubernetes 仪表盘迁移到 PageLayout，[#2348](https://github.com/hyperdxio/hyperdx/pull/2348) 将 ClickHouse 仪表盘迁移到 PageLayout，[#2364](https://github.com/hyperdxio/hyperdx/pull/2364) feat(dashboard): 迁移到带吸顶查询工具栏的 PageLayout，[#2394](https://github.com/hyperdxio/hyperdx/pull/2394) fix(PageHeader): 让吸顶页头保持在抽屉遮罩层下方

## 全新的数据源选择器与序列颜色选择功能 \{#new-datasource-selector-and-color-picking-for-series\}

*演示者：[@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/DKfJs9onl50" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

这是 Alex 带来的两项 UI 改进。数据源选择器已经做了精简：现在点击后，只会显示可供选择的数据源。像查看 schema 或创建新 source 这样的管理操作，则被移到了单独的 kebab 菜单中。这样就把选择和配置分开了——这项改动已经在待办清单上放了一段时间，也回应了团队的反馈。

数值卡片现在也支持固定颜色选择器，因此你可以为某个指标指定特定颜色。条件颜色规则 (根据阈值或列变成红色、绿色或黄色) 也在开发中。等到 Elizabet 的统一调色板上线后，这两项功能都会使用有明确名称的颜色，而不是现在这种“color 1、2、3”的标签；对于从 Grafana 等工具迁移过来的用户来说，这会是一个很有意义的改进。

**相关 PR：** [#2365](https://github.com/hyperdxio/hyperdx/pull/2365) feat(source-picker): chip + kebab menu UX, [#2265](https://github.com/hyperdxio/hyperdx/pull/2265) feat(app): number tile static color picker

## 改进 仪表盘 操作提示 \{#better-hints-for-dashboard-actions\}

*由 [@alex-fedotyev](https://github.com/alex-fedotyev) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/yQaKMSXp8YA" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

仪表盘 表格卡片中的各行现在会显示更明确的悬停提示。鼠标悬停时，光标和图标会发生变化，提示点击后将执行的操作——要么打开关联的 仪表盘，要么下钻到数据源。在这项改动之前，这些行是否可以点击并不直观，更别说点击后具体会发生什么了。

**相关 PR：** [#2321](https://github.com/hyperdxio/hyperdx/pull/2321) feat(app): 为 仪表盘 表格卡片行点击添加悬停提示和原生链接交互反馈