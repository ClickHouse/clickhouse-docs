---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-22
title: '演示日 - 2026-05-22'
sidebar_label: '2026-05-22'
sidebar_position: -20260522
pagination_prev: null
pagination_next: null
description: 'ClickStack 演示日（2026-05-22）'
doc_type: 'guide'
keywords: ['ClickStack', '演示日']
---

## ClickCannon 数据生成功能更新 \{#clickcannon-data-generation-update\}

*演示者：[ @SpencerTorres](https://github.com/SpencerTorres)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Zljd07_4uF4" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

[ClickCannon](https://github.com/clickhouse/clickcannon) 是我们内部用于容量评估的工具：它可以在发起并发查询的同时生成大量 OpenTelemetry 数据，从而估算客户在特定摄取和查询工作负载下所需的资源。我们在 OpenHouse 上正式对外公布了它，Spencer 也演示了它的最新版本。

现在，你不必再预先在磁盘上准备数据，而是可以直接以内联方式配置生成器。启用后，设置线程数、每个块的行数、每秒总行数，以及一些内存限制即可。这样就不再需要先在磁盘上准备 2 TB 的测试数据——而这正是该工具此前难以推广的原因。

接下来，我们会向更多用户推荐 ClickCannon，用于他们自己的容量评估。代码仓库地址为 [https://github.com/clickhouse/clickcannon](https://github.com/clickhouse/clickcannon)。

## 全屏卡片和按 数据源 限定的过滤器的日期输入 \{#date-input-for-full-screen-tiles-and-source-scoped-filters\}

*演示者：[ @pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Mop1EYtGwKc" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

两个相关的 仪表盘 改进一并上线了。现在，当你将单个卡片切换到全屏时，会看到一个专用的时间选择器和粒度选择器，它们独立于 仪表盘 本身的时间范围。这意味着，你可以针对某个特定指标 (例如 ClickHouse 集群 仪表盘 中的一张图表) 放大查看较长时间范围内的历史数据，而不会导致 仪表盘 中的其他卡片全部刷新。现在，浏览器标签页标题中也会显示 仪表盘 名称。

第二项改进是 仪表盘 过滤器的 数据源 范围限定。过滤器现在可以被限制为仅广播到由特定 数据源 支持的卡片，而不是全局应用到每张卡片。在一个混合 数据源 的 仪表盘 上 (例如同时包含 logs 和链路追踪) ，你可以避免过滤器“泄漏”到不适用的卡片中。

**相关 PR：** [#2302](https://github.com/hyperdxio/hyperdx/pull/2302) feat: 仪表盘 小幅改进，[#2331](https://github.com/hyperdxio/hyperdx/pull/2331) feat: 为 仪表盘 过滤器添加 数据源 范围限定

## 在 lower(Body) 上识别文本索引 \{#text-index-recognised-on-lower-body\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/l0GpNBP859o" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

这是一个虽小但切实修复了正确性问题的改动，针对不区分大小写的搜索。如果你的数据源在 `lower(Body)` 上定义了文本索引，但没有指定 preprocessor 参数，查询规划器此前会生成 `hasAllTokens(Body, ...)` 条件。由于该表达式与索引表达式不匹配，因此不会使用文本索引，查询会退回到扫描。

现在生成的查询为 `hasAllTokens(lower(Body), ...)`，这与索引表达式相匹配。对于以这种方式配置的数据源，不区分大小写的搜索现在可以正确地通过文本索引加速。

**相关 PR：** [#2326](https://github.com/hyperdxio/hyperdx/pull/2326) feat: 支持在没有 preprocessor 的 lower(Body) 上使用文本索引

## 更简洁的 Event Deltas 体验 \{#simpler-event-deltas-experience\}

*由 [@alex-fedotyev](https://github.com/alex-fedotyev) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BrIHHFz_Aw8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Event Deltas 过去需要多一步操作：你必须先点击按钮进入比较模式，才能在热力图上拖拽选择区域。现在这一步已经省掉了：页面加载后会立即显示分布条，而当你在热力图上拖出一个区域时，这些条形会立刻切换到“所选区域 vs 背景”的比较模式。点击选区外部后，视图就会切回全部 span 视图。

这项改动几周前就已进入 OSS，但其中有一部分尚未包含在托管 ClickStack 中。现在这一差距已经补上，因此两个版本中的简化流程都已保持一致。

**相关 PR：** [#1899](https://github.com/hyperdxio/hyperdx/pull/1899) feat: 始终开启的属性分布模式

## 仪表盘目录和批量折叠 \{#dashboard-table-of-contents-and-bulk-collapse\}

*由 [@teeohhem](https://github.com/teeohhem) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Pojo5zf_hrE" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

当仪表盘中的分区不再只是寥寥几个时 (这正是我们想要的，因为分区是组织大型仪表盘的方式) ，在其中导航就会变得很麻烦。Tom 添加了一个右侧目录栏，列出所有分区，并支持你直接跳转到任意分区。现在还有一个批量折叠/展开控件，可一次性隐藏所有分区的内容，这样你就能快速查看长仪表盘的整体结构，而不必从头到尾滚动浏览。

虽然仍处于草稿阶段，但对于我们随 ClickHouse 集群和 Kubernetes 视图一同提供的多分区仪表盘来说，已经非常实用了。

**相关 PR：** [#2350](https://github.com/hyperdxio/hyperdx/pull/2350) feat(dashboard): 添加支持批量折叠/展开的右侧目录栏

## 列宽调整可在各会话间保留 \{#column-resize-persisted-across-sessions\}

*演示者：[ @teeohhem](https://github.com/teeohhem)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/7l-Rz1tFlq8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

昨天有客户反馈：在结果表中调整列宽后，这个设置应该保留下来。现在已经支持了。调整后的宽度会存储在本地存储中，并按表 ID 分别保存，因此不同的表会各自保留独立的列布局。即使关闭浏览器，之后再回来，列宽也会保持为你上次设置的样子。向表中添加或删除某一列，也不会重置其他列的宽度。

**相关 PR：** [#2327](https://github.com/hyperdxio/hyperdx/pull/2327) 修复：在搜索结果表中持久保存列宽