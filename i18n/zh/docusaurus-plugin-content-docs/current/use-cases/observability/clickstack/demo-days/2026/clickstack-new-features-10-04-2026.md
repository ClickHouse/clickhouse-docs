---
slug: /use-cases/observability/clickstack/demo-days/2026/04/10-04-2026
title: "演示日 - 10/04/2026"
sidebar_label: "10/04/2026"
pagination_prev: null
pagination_next: null
description: "ClickStack 演示日 - 10/04/2026"
doc_type: "guide"
keywords: ["ClickStack", "演示日"]
---

## 可固定的数据源筛选器 \{#pinnable-datasource-filters\}

*演示：[ @brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/j-b1ztSl8IQ" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，团队可以固定数据源筛选器，并将其共享给整个团队。点击任意筛选器上的固定图标后，你可以选择仅固定给自己，或共享给所有人。共享筛选器会显示在筛选器列表顶部的独立区域中，让每位团队成员都能轻松找到并应用，而无需知道确切的筛选器名称。

这是社区呼声最高的功能之一。这意味着团队不再需要通过其他渠道沟通筛选器配置。共享筛选器一经固定，所有用户都会立即看到；而且共享的不仅可以是筛选器键，也可以是特定的筛选器值，因此筛选器的完整上下文也会一并传递。

**相关 PR：** [#2047](https://github.com/hyperdxio/hyperdx/pull/2047) [HDX-2300] 引入共享筛选器，提升团队范围内筛选器的可见性和可发现性

## 从 ClickStack Cloud 唤醒服务 \{#waking-service-from-clickstack-cloud\}

*演示者：[@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Od7X0NOCqY0" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ClickStack Cloud 用户现在可以直接在应用内唤醒休眠中的服务。此前，如果您的服务已休眠，您会看到“retry”提示，但应用实际上不会代您唤醒服务。您必须先跳转到 ClickStack Cloud 手动唤醒服务，然后再返回并自行点击“retry”。

现在，应用可以端到端处理这一过程。当服务处于休眠状态时，提示会显示“wake service”，并自动完成整个流程，无需您离开当前页面。这是一个虽小但实用的体验优化，去掉了工作流中这种令人沮丧的多步骤打断——尤其是在一段时间未活动后进入 ClickStack、只想立即查看数据时。

## 统一启用 AI 功能 \{#consistent-enabling-of-ai-features\}

*演示：[ @brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/zS5OekPCzC0" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，ClickStack 中的 AI 功能仅能通过 ClickHouse Cloud 控制平面开关，它也因此成为唯一的事实来源。此前有两个彼此独立的复选框：一个在 ClickStack 控制平面中，另一个在应用内部。勾选其中一个，并不能保证另一个会同步，这常常让人不清楚 AI 是否真的已启用。

现在，ClickStack 内部的复选框会链接到 ClickHouse Cloud，除此之外则处于禁用状态。如果你在 ClickHouse Cloud 中切换该开关，相关功能就会自动在 ClickStack 中可用。这样一来，AI 功能的启用方式就更加一致、可预期，也无需再猜测究竟是哪项设置在实际生效。

## Raw SQL 告警 \{#raw-sql-alerting\}

*由 [@pulpdrew](https://github.com/pulpdrew) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bYYcYHkyy2E" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

现在，Raw SQL 折线图已支持告警，在现有 Raw SQL 图表能力的基础上增加了基于阈值的通知功能。如果您有一个由自定义 SQL 查询驱动的折线图，您可以为其添加告警，并像配置其他图表告警一样进行设置。目前，该功能适用于折线图和柱状图，因为阈值比较需要同时用到时间间隔和日期范围参数。

这带来了一些非常强大的使用场景。演示中展示了这样一个查询：统计当前时间间隔内的错误数，并将其与前 30 个时间间隔进行比较；如果该值比历史常态高出两个标准差以上，就会被标记出来。这类统计异常检测现在只需编写合适的 SQL 并设置阈值即可实现。告警配置位于图表编辑器中的可折叠区域内，在实际需要之前可让 UI 保持整洁。

**相关 PR：** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: 为基于 Raw SQL 的仪表板卡片实现告警，[#2085](https://github.com/hyperdxio/hyperdx/pull/2085) refactor: 创建 TileAlertEditor 组件

## HyperDX TUI 改进 \{#hyperdx-tui-improvements\}

*演示者：[@wrn14897](https://github.com/wrn14897)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/cIigBpcrYlw" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

HyperDX 终端 UI 现在变得越来越容易上手。您现在可以通过 `npm install -g @hyperdx/cli` 全局安装，然后运行 `hdx` 启动。使用 `--tui` 选项可直接打开交互式终端界面。该二进制文件也可通过 `npm` 以 `hdx` 的形式获取，因此在包安装完成后，无需单独的安装步骤。

除了安装体验改进外，本周还上线了两个值得关注的功能。错误信息现在会在终端中以正确的高亮和结构化形式呈现，并与 Web 前端的格式保持一致，因此无论您是在浏览器中还是在 TUI 中，都能获得同等详细程度的信息。此外，还新增了 SQL 预览，便于您查看底层正在执行的查询。在此基础上，事件查看器中还新增了一个可通过 `Shift+A` 访问的告警页面，让您无需离开终端即可总览所有已配置的告警及其近期触发历史。

**相关 PR：** [#2095](https://github.com/hyperdxio/hyperdx/pull/2095) [HDX-3966] 改进 TUI 错误信息渲染并添加 SQL 预览，[#2093](https://github.com/hyperdxio/hyperdx/pull/2093) [HDX-3969] 添加告警页面 (Shift+A) ，包含总览和近期历史，[#2043](https://github.com/hyperdxio/hyperdx/pull/2043) [HDX-3919] 添加 @hyperdx/cli 包，[#2101](https://github.com/hyperdxio/hyperdx/pull/2101) [HDX-3976] CLI：从 apiUrl 迁移到 appUrl，并引入交互式登录流程