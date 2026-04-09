---
slug: /use-cases/observability/clickstack/demo-days/2026/04/03-04-2026
title: '演示日 - 03/04/2026'
sidebar_label: '03/04/2026'
pagination_prev: null
pagination_next: null
description: 'ClickStack 03/04/2026 演示日'
doc_type: 'guide'
keywords: ['ClickStack', '演示日']
---

## 全新的仪表板和已保存的搜索列表页面 \{#new-dashboard-and-saved-search-listing-pages\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/dQCkNZElwcg" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

仪表板和已保存的搜索现已从侧边栏移出，改为使用专门的列表页面。如果您的团队已经积累了相当数量的仪表板，旧的侧边栏方式很快就会变得难以管理。新页面会以按标签组织的卡片视图展示所有内容，并内置名称搜索和标签筛选功能。如果您偏好更紧凑的显示方式，也可以切换到列表视图。

现在也支持收藏功能。为仪表板或已保存的搜索加星后，它会固定到列表页面顶部，并重新出现在侧边栏中，便于快速访问；这与之前的使用方式类似，但不会让导航栏对其他人来说显得过于拥挤。列表页面还会在每张卡片上显示告警状态图标以及“创建者 / 更新者”元数据，因此您可以一眼看出各项内容由谁负责，以及是否有告警正在触发。

新增的模板库进一步补全了这项功能。四个涵盖 Node.js、Python、Go 和 Java 的 OTel 运行时指标的预置仪表板只需点击几次即可导入。导入时还可以编辑标签和目标指标源，因此您可以直接将它们纳入现有的标签体系。

**相关 PR：** [#1971](https://github.com/hyperdxio/hyperdx/pull/1971) 添加仪表板列表页面、[#2012](https://github.com/hyperdxio/hyperdx/pull/2012) 添加已保存的搜索列表页面、[#2021](https://github.com/hyperdxio/hyperdx/pull/2021) 为仪表板和已保存的搜索添加收藏、[#2033](https://github.com/hyperdxio/hyperdx/pull/2033) 按标签对仪表板和搜索进行分组、[#2031](https://github.com/hyperdxio/hyperdx/pull/2031) 显示创建/更新元数据、[#2053](https://github.com/hyperdxio/hyperdx/pull/2053) 为仪表板列表页面添加告警图标、[#2010](https://github.com/hyperdxio/hyperdx/pull/2010) 添加仪表板模板库

## 筛选器的筛选条件 \{#filters-for-filters\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Tfe9kJygoEg" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

仪表板变量筛选器现在支持为其自身设置筛选条件。这个需求很直接：如果您在 Node.js 仪表板中有一个“服务名称”下拉框，通常只希望其中列出 Node.js 服务，而不是环境中的所有服务。现在，您可以直接在仪表板变量上配置筛选条件，以限定显示内容的范围。

筛选器选择器也已更新，现已支持多选。对于按服务分组的仪表板，下拉框中可一次选择多个值，这让比较起来更加方便。

**相关 PR：** [#1969](https://github.com/hyperdxio/hyperdx/pull/1969) 为仪表板筛选器添加条件；支持筛选器多选

## 预定义仪表板的 RBAC \{#rbac-for-predefined-dashboards\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/AZ94-quHEuw" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

基于角色的访问控制现已应用于 ClickStack 的预设仪表板。此前，这些内置仪表板完全不受 RBAC 约束，因此无论分配了什么角色，任何用户都可以访问。这个缺口现已补上。

细粒度读取权限的行为符合预期。为特定服务配置了只读访问权限的角色，会将用户可见范围限制为仅显示与这些服务相关的预设仪表板。该角色中的用户可以查看仪表板及其筛选器，但筛选控件会被锁定，无法编辑。演示展示了一个自定义角色：它拥有作用域限定到某个具名服务的 “services” 读取权限；使用该角色登录的用户，只能看到自己应当有权访问的仪表板及对应的筛选状态。

## 搜索优化 \{#optimizations-for-searching\}

*演示：[@knudtty](https://github.com/knudtty)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/uVD2FKzoHjM" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickHouse 的 “Read in Order” 优化会在 ORDER BY 与表的主键匹配时按顺序读取数据，并在达到 LIMIT 后立即停止，因此能够加快搜索查询。基准测试表明，尽管有这项优化，在较大的数据集上搜索仍然会过度拉取数据。问题的根源在于需要遍历的 parts 数量：即使启用了该优化，只要表足够大，ClickHouse 仍会因为 parts 过多而读取超出实际所需的数据。

修复方法是在搜索查询的窗口化查询数组前预先加上一个 1 分钟的时间窗口。大多数搜索所需的数据本来就位于最近 1 分钟内，因此优先命中这个窗口通常几乎能立即返回结果。如果这里没有找到内容，查询就会像往常一样回退到逐步扩大的时间窗口。除此之外，ORDER BY 优化此前也未能正确应用到 `otel_traces` schema，因为其中的时间戳列使用了未被识别的 `toDateTime(Timestamp)` 表达式。这个问题现在也已修复。

**相关 PR：** [#2019](https://github.com/hyperdxio/hyperdx/pull/2019) 对搜索使用 1 分钟窗口，[#2014](https://github.com/hyperdxio/hyperdx/pull/2014) 修复 `otel_traces` 的 ORDER BY 优化问题

## 复制行和可配置的筛选器大小 \{#copy-row-and-configurable-filter-sizes\}

*由 [@knudtty](https://github.com/knudtty) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/e_IIKG3f6SE" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，行查看器中已提供“复制为 JSON”按钮，可让你一键复制整条日志行。该按钮在完整侧边栏视图中也会显示。它非常适合将某一行粘贴到 LLM 提示中，询问这条日志在代码中的对应位置；或者无需手动选中全部文本，直接复制完整事件以用于事故报告。

现在，可在“查询设置”中将侧边栏获取的筛选器键数量配置为团队设置。此前的固定限制意味着，在较大的数据集中，只能看到部分可用的筛选属性。现在，团队可以提高该限制，以显示更多资源属性和日志属性。此次修改还包括虚拟化方面的改进，即使显示大量筛选器分组，也能保持筛选器面板的快速渲染。

**相关 PR：** [#2035](https://github.com/hyperdxio/hyperdx/pull/2035) 添加“复制行为 JSON”按钮，[#2020](https://github.com/hyperdxio/hyperdx/pull/2020) 新增用于设置获取筛选器数量的团队设置，[#1979](https://github.com/hyperdxio/hyperdx/pull/1979) 嵌套筛选器分组虚拟化

## 仪表板中的选项卡和分组 \{#tabs-and-groups-in-dashboards\}

*由 [@alex-fedotyev](https://github.com/alex-fedotyev) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/tyumDlJuDTg" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，仪表板卡片可以组织到组中。这个改动取代了之前使用两种独立容器类型 (“sections”和“groups”) 的模式；在旧模式下，用户必须事先决定要使用哪种容器类型。新的单一 Group 概念让使用更简单：Group 默认可折叠，可选择显示边框，也可以添加选项卡。每个选项卡都包含自己的一组卡片，并且可通过拖拽手柄在组之间移动卡片。

该演示展示了一个组，并切换了几个自定义选项：可折叠开启或关闭、边框显示或隐藏，以及是否启用选项卡。演示时，该 PR 仍在评审中，同时还在收集设计反馈。合并后，相比旧的双容器类型模式，它应能为仪表板作者提供一套更灵活、也更不易引起混淆的构建模块。

**相关 PR：** [#1972](https://github.com/hyperdxio/hyperdx/pull/1972) 支持选项卡以及可折叠/边框选项的仪表板分组，[#2015](https://github.com/hyperdxio/hyperdx/pull/2015) 将 section/group 统一为单一 Group

## ClickStack CLI \{#clickstack-cli\}

*演示者：[ @wrn14897](https://github.com/wrn14897)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/9XqJNhstabw" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack CLI (`hdx`) 是一个全新的终端 TUI，让你无需离开终端即可搜索、实时查看和检查日志与链路追踪。它通过与浏览器相同的 Web 会话机制连接到你的 HyperDX 实例，因此无需单独管理 API key。只需使用实例 URL 和邮箱执行一次 `hdx auth login`，后续便会持续保持登录状态。

这个 TUI 与 Web 应用中的搜索界面基本一致：使用相同的查询语法、相同的数据源选择，也能查看单条日志记录的详细信息。其中一个亮点是链路追踪瀑布图视图：点开某条日志记录后，完整的分布式链路追踪会直接渲染在终端中。该演示还预览了一项处于早期阶段的智能体实验：让 AI 智能体访问 CLI 的 schema 自省结果，并赋予其通过 ClickHouse 代理运行查询的能力后，它就能自主排查问题。演示还进一步展示了该智能体如何借助 Web 会话通过 Playwright 操作 HyperDX 界面，并从已渲染的图表中提取指标，与它在日志中发现的内容交叉比对。

**相关 PR：** [#2043](https://github.com/hyperdxio/hyperdx/pull/2043) 添加 @hyperdx/cli 包 —— 用于搜索和实时跟踪事件的终端 TUI