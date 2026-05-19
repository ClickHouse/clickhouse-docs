---
slug: /use-cases/observability/clickstack/demo-days/2026/04/2026-04-17
title: '演示日 - 2026-04-17'
sidebar_label: '2026-04-17'
pagination_prev: null
pagination_next: null
description: 'ClickStack 2026-04-17 演示日'
doc_type: 'guide'
keywords: ['ClickStack', '演示日']
sidebar_position: -20260417
---

## 总结日志和链路追踪 \{#summarize-logs-and-traces\}

*演示：[ @alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/TWsFyWt-tD8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX 现已提供 AI 总结功能，可跨日志、链路追踪和模式使用。新的“总结”按钮会将您的遥测数据提炼为易于阅读的摘要，让您无需逐条手动查看事件，也能快速了解一组事件中发生了什么。

该架构还设计为可接入 Anthropic (或类似) API，并支持后续对话，因此用户在获得初始总结后还可以继续提问。

**相关 PR：** [#2108](https://github.com/hyperdxio/hyperdx/pull/2108) feat: 支持可扩展主题、链路追踪上下文和安全加固的 AI 总结，[#2100](https://github.com/hyperdxio/hyperdx/pull/2100) 实现带有智能语气模式的真实 AI 总结回调

## 将事件增量热力图整合到图表构建器中 \{#event-deltas-heatmap-into-chart-builder\}

*由 [@alex-fedotyev](https://github.com/alex-fedotyev) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BLVhIQjocwE" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

事件增量热力图可视化正在迁移到主图表构建器中，作为一种标准图表类型提供，与 HyperDX 的其他可视化并列。此前，它只能在专用视图中使用；现在，它可在图表探索器中与其他图表类型一起使用。

完成后，用户将能够将事件增量热力图直接添加到仪表板卡片中，并支持与其他图表相同的字段筛选和时间范围控制。该功能目前仍在开发中。

**相关 PR：** [#2107](https://github.com/hyperdxio/hyperdx/pull/2107) feat: 将热力图图表接入仪表板编辑器和卡片渲染，[#2102](https://github.com/hyperdxio/hyperdx/pull/2102) 实现支持事件增量的可复用热力图图表

## schema 改进的基准测试 \{#benchmarking-for-schema-improvements\}

*由 [@knudtty](https://github.com/knudtty) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/_B7TmIiXZyM" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Aaron 介绍了 HyperDX 更新后的默认 OpenTelemetry 日志 schema 的基准测试结果。关键变化是弃用旧的 `timestamp_time` 列 (一个秒级粒度的 32 位 Unix 时间戳) ，改为仅使用 `timestamp`。后者可提供纳秒级精度，同时让 schema 减少一列。在一系列广泛的查询基准测试中，更新后的 schema 几乎在所有场景下都与旧版持平或表现更好。

最终版 schema 还包含读取顺序优化，在选择性查询上带来了明显收益。与基线相比，搜索相对少见的 map 值时，速度大约提升到两倍；而高频值查找的提升幅度更大。插入开销略有增加 (需要维护更多列) ，但整体查询性能持平或有所提升，因此这是一次可以直接进行的升级。

**相关 PR：** [#2125](https://github.com/hyperdxio/hyperdx/pull/2125) feat: 优化默认 otel-logs schema

## 自动补全功能改进 \{#improvements-to-autocomplete\}

*由 [@knudtty](https://github.com/knudtty) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/8zDZx49uYQo" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX 的自动补全正在进行一次重大改造，以支持更高的基数并更快地加载值。新实现基于汇总表 (在 15 分钟时间桶内预聚合键值对的 `AggregatingMergeTrees`) ，因此系统无需在每次按键时都查询原始数据，而是从规模小得多的预计算数据集中读取。在针对一个 2.3 亿行预发布环境实例的实时演示中，自动补全能够快速加载 `hostname` 等高基数字段的值，且几乎没有可感知的延迟。

该系统同时支持仅键汇总 (返回所有键，但不返回附带的值，以降低基数开销) 和完整的键值汇总。如果仅存在键汇总，系统会在值查找阶段回退到现有的值获取策略。如果完全未检测到汇总表，它也会平稳回退到当前行为。Aaron 还提到，未来如果能提供一个允许列表 UI，用于控制哪些键生成值汇总，对于拥有特别高基数数据的客户来说会是一个很有用的补充。

**相关 PR：** [#2128](https://github.com/hyperdxio/hyperdx/pull/2128) feat: fast and full autocomplete, [#2127](https://github.com/hyperdxio/hyperdx/pull/2127) feat: better autocomplete

## SQL 告警功能改进 \{#improvements-to-alerting-with-sql\}

*演示：[ @pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/BOk-LC0y2no" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

继前一周为 Raw SQL 折线图和柱状图新增告警功能后，HyperDX 现在也支持对 Raw SQL 数字图表设置告警。设置告警时不再要求必须提供时间过滤器参数：如果省略会显示警告，但不包含任何时间维度的查询现在也完全有效。这让针对不会随时间变化的配置值或系统指标设置告警变得更容易，例如检查 ClickHouse 集群数量是否等于预期值。

此外，还新增了多种阈值类型：不等于、高于、至多、介于之间以及区间外。这让团队在表达告警条件时，除了简单的大于比较之外，也能拥有更高的灵活性。最后，告警历史现在会直接显示在卡片编辑器中，因此当某个已触发的告警链接到特定的仪表板卡片时，用户可以查看完整历史、了解触发原因，并且无需离开仪表板即可确认或静默该告警。

**相关 PR：** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: 为基于 Raw SQL 的仪表板卡片实现告警功能, [#2114](https://github.com/hyperdxio/hyperdx/pull/2114) feat: 支持对 Raw SQL 数字图表设置告警, [#2122](https://github.com/hyperdxio/hyperdx/pull/2122) feat: 新增更多告警阈值类型, [#2130](https://github.com/hyperdxio/hyperdx/pull/2130) feat: 新增介于区间内和区间外的告警阈值, [#2123](https://github.com/hyperdxio/hyperdx/pull/2123) feat: 在告警编辑器中新增告警历史和确认功能

## 告警执行错误 \{#errors-during-alert-execution\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/b3G8kFiQiUg" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

当告警执行失败时，HyperDX 现在会直接在 UI 中显示错误，而不是悄悄将其忽略。此前，用户可能会发现告警历史中有空档，却不知道原因：没有错误消息，也无法调试到底出了什么问题。现在，针对不同类型的失败，系统会内联显示不同的错误图标，包括无效查询、Webhook 投递失败，以及 Webhook 设置缺失或配置错误。

点击错误图标后，会显示诊断和解决问题所需的具体信息，因此用户无需翻查服务器日志或提交支持请求，就能修复配置有误的告警。其目标是让告警失败可以自助处理：看到错误、理解原因并修复它。

**相关 PR：** [#2132](https://github.com/hyperdxio/hyperdx/pull/2132) feat: 在 UI 中显示告警执行错误，[#2136](https://github.com/hyperdxio/hyperdx/pull/2136) fix: 隐藏可能敏感的告警错误