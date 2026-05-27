---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-05-15
title: '演示日 - 2026-05-15'
sidebar_label: '2026-05-15'
sidebar_position: -20260515
pagination_prev: null
pagination_next: null
description: '2026-05-15 的 ClickStack 演示日'
doc_type: 'guide'
keywords: ['ClickStack', '演示日']
---

## 在笔记本中创建告警 \{#alerts-from-notebooks\}

*由 [@brandon-pereira](https://github.com/brandon-pereira) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/HIxCMDmdZ8o" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，笔记本也可以创建告警了。原本就能即时生成仪表板的这套笔记本流程，现在还会顺带帮你配置好告警，这样你就可以直接从“这是一个很有意思的查询”进入到“它一触发就通知我”，而无需离开笔记本。

不过，有一个需要注意的地方。我们团队里预先定义了不少 webhook，但目前笔记本还不会继续追问，所以它只会挑选看起来最相关的那个 webhook，而不是让你自己选择。我们已经有一个正在推进中的 PR，要让笔记本在缺少上下文时能够继续提问，因此这个问题应该很快就会解决。

## 基于 materialized views 的自动补全 \{#autocomplete-from-materialized-views\}

*演示者：[ @knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/iQf5EwktBW4" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

前段时间，我们新增了由 materialized views 支持的搜索栏属性自动补全功能，让候选值可以瞬间显示出来，而不再需要实时计算。现在，我们又将同样的 MVs 用于侧边过滤器，这意味着在繁忙实例上，过滤器加载速度快了很多。

有一项行为变更值得特别说明。由 MV 支持的过滤器会返回当前时间范围内所有可能的过滤值，而不是仅限于当前查询范围。有一个切换开关可以切回按搜索范围限定的过滤器；这种方式会针对实时结果执行较慢的聚合。默认的 `filterValueExpandedKeyLimit` 也已上调：没有 MVs 时为 20 个键，使用 MVs 时为 100 个键，并且可以按需配置到任意值 (我们测试到了 1000) 。

这个 MV 的维护成本相对较低；它目前在我们的预发布实例上针对大量数据运行，表现良好。同一个 MV 还为属性自动补全和 map 列展开提供支持，因此一旦设置完成，你就能在多个地方获得性能提升。演示中还讨论了一个问题：按搜索范围限定与全部过滤器之间的切换，是否应该提升为过滤器面板顶部的一级胶囊式开关，而不是放在设置里；这是我们后续正在评估的事项。

**相关 PR：** [#2272](https://github.com/hyperdxio/hyperdx/pull/2272) feat: 默认情况下过滤器不感知搜索；由 MV 加速

## 表列顺序与按序列格式化 \{#table-column-ordering-and-per-series-formatting\}

*演示者：[@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/iEn8kzvERE8" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

几项相关的表改进一同发布。现在，group-by 列可以固定在表的左侧，而不再总是显示在右侧——这通常正符合 RED 风格仪表板的使用习惯，因为服务名称往往是你纵向浏览时最需要查看的内容。你可以通过每个表的显示设置来控制这一行为。

现在也支持按序列设置数值格式。旧版行为会将单一的数值格式应用到整个表，因此如果表中恰好有任何使用毫秒格式的序列，Requests 列就可能会被渲染为 `123ms`。现在，你可以按列或按序列设置格式，这样请求计数会保持为普通数值，而 latency 列则会格式化为耗时。

此外，格式推断现在也会按序列进行。如果你对 Trace Duration 字段进行聚合，只有该特定序列会被推断为毫秒，表中的其余部分不会仅因为某一列恰好是耗时就一并变成毫秒格式。

**相关 PR：** [#2149](https://github.com/hyperdxio/hyperdx/pull/2149) feat: 允许在表左侧显示 group-by 列，[#2174](https://github.com/hyperdxio/hyperdx/pull/2174) feat: 添加按序列设置的数值格式

## 可自定义的仪表板链接 \{#customizable-dashboard-linking\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Stlz02xES40" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，仪表板中的表格支持在点击行时跳转到其他仪表板 (或搜索页) ，并且目标端和传递的过滤器都可以通过模板进行配置。在表格卡片配置中，新增了一个“行点击操作”选项。选择“仪表板”，选定要跳转到的仪表板，然后将当前行中的过滤条件映射到目标仪表板的过滤条件。过滤器值使用 Handlebars 风格的模板，因此你可以将被点击行中的任意列值带入目标端过滤器或 `WHERE` 子句中 (无论是 SQL 还是 Lucene) 。演示中的示例将服务列表配置为：点击某一行后，直接跳转到服务详情仪表板，并且已按 `service.name` 过滤。

除了选择固定的目标仪表板外，你也可以直接对仪表板名称本身使用模板。因此，如果你为每个服务都建了一个仪表板，名称类似 `${service.name} dashboard`，链接就会解析到与被点击行匹配的那个仪表板。如果模板生成的仪表板不存在，系统也会进行错误处理：弹出通知，而不是跳转到无效页面。

支持多个变量，你可以将被点击行中的任意列组合传入过滤器集或模板化的仪表板名称。Handlebars 支持动态辅助函数和条件块，但目前大部分已被禁用，以尽量保持功能范围精简且行为可预测。导入流程也已更新：现在，对于通过 ID 链接到其他仪表板的仪表板，在导入时可以将这些引用重新映射到目标端账户中实际存在的相应仪表板。

**相关 PR：** [#2146](https://github.com/hyperdxio/hyperdx/pull/2146) feat: 为自定义仪表板点击操作添加过滤器模板功能, [#2148](https://github.com/hyperdxio/hyperdx/pull/2148) feat: 支持仪表板点击操作的导入/导出, [#2156](https://github.com/hyperdxio/hyperdx/pull/2156) feat: 为外部仪表板 API 添加自定义 onClick 字段, [#2273](https://github.com/hyperdxio/hyperdx/pull/2273) feat: 将仪表板表格 onClick 添加到 MCP schema 和提示词中