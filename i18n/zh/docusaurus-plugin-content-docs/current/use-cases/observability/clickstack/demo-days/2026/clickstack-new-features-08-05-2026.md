---
slug: /use-cases/observability/clickstack/demo-days/2026/05/2026-05-08
title: '演示日 - 2026-05-08'
sidebar_label: '2026-05-08'
pagination_prev: null
pagination_next: null
description: 'ClickStack 2026-05-08 演示日'
doc_type: 'guide'
keywords: ['ClickStack', '演示日']
sidebar_position: -20260508
---

## 改进 webhook 中密钥的处理 \{#improved-handling-of-secrets-in-webhooks\}

*演示：[@dhable](https://github.com/dhable)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aD7sT5dc470" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Webhook URL 和请求头中通常会明文包含凭证。Slack webhook URL 会把 secret token 放在 path 中，而 HTTP webhook 通常需要通过 Authorization 请求头完成身份验证。在此版本之前，HyperDX 用于列出和编辑 webhook 的内部 API 会在每次请求时返回所有这些内容，这意味着任何已认证的团队成员只要调用该 API，就能读取这些密钥。

此次变更采用了公共 API 已经使用的同一套脱敏方式。Webhook URL 返回时会将 path 替换为 `****`，这样 Slack token (或 path 中嵌入的任何其他密钥) 就不会离开服务器。请求头默认也会被脱敏，因为我们无法可靠地判断哪些请求头携带密钥，所以所有值都会替换为 `****`，仅显示请求头名称。

编辑表单会将脱敏后的值视为“未更改”：保持不动，则继续使用已存储的值；修改后，则保存新值；清空后，则彻底移除该字段。这样既能让常见场景下的操作流程 (编辑单个字段) 保持清晰直观，又无需让真实密钥在浏览器中来回传递。

**相关 PR：** [#2239](https://github.com/hyperdxio/hyperdx/pull/2239) [HDX-4173] 在内部 webhook API 响应中脱敏敏感字段

## 告警中的额外元数据 \{#extra-metadata-in-alerts\}

*由 [@dhable](https://github.com/dhable) 演示*

<iframe width="768" height="432" src="https://www.youtube.com/embed/evEd7Cc9e1c" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

这是社区 Slack 中提出的一项需求：为告警添加自由填写的上下文，用来记录阈值历史、runbook 链接或值班备注。这对 AI 摘要也很有帮助，可作为事实依据：现在，任何响应已触发告警的 LLM 都能基于操作人员自己的判断来生成内容，而不必仅根据查询去猜测意图。

备注字段支持 Markdown 渲染，因此可折叠部分、列表和链接都可以正常使用。它属于告警配置的一部分，并会在所有显示该告警的地方展示出来。目前 UX 还没有最终定稿，Markdown 展示只是一个起点，也欢迎反馈你希望它如何呈现。

此外，这个 PR 还优化了已保存搜索中的告警触发 UX。当有告警触发时，Alerts 按钮上的铃铛图标会显示红点；对话框会高亮当前处于活动状态的告警，而不只是给出链接；整体视觉表现现在也与 dashboard 磁贴在相同状态下的显示方式保持一致。

**相关 PR：** [#2210](https://github.com/hyperdxio/hyperdx/pull/2210) [HDX-3044] 为告警添加可选备注字段

## 可能的主题 \{#possible-themes\}

*演示者：[ @elizabetdev](https://github.com/elizabetdev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/JZYGz6ZOPf4" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

这是一次黑客松实验，为 ClickStack UI 引入了三种受 IDE 启发的主题：Nord (北境蓝调) 、Catppuccin (粉彩风) 和 One Dark (Atom 风格) ，每种主题都提供亮色和暗色变体。我们尝试基于这些具名源主题生成颜色标记，整体上已经比较接近目标效果，但在侧边栏颜色和线条对比度上仍有一些粗糙之处，还需要进一步打磨。

这个 PR 最终被关闭，没有合并。团队正在转向 ClickUI，而它目前只支持单一主题；如果要同时维护多套并行的标记，就会带来持续性的额外工作，尤其是在开始认真检查每种组合的对比度之后。因此，团队决定暂缓，等 ClickUI 本身支持多主题后再推进。

我们认为，这次实验中有一条设计思路值得在将来重启时保留下来。第一版会根据不同主题给 HyperDX logo 重新配色，这样会削弱品牌识别。更合适的做法是：亮色主题使用深色 logo，暗色主题使用浅色 logo，而绿色的 HyperDX 文字标识本身保持不变。

**相关 PR：** [#2191](https://github.com/hyperdxio/hyperdx/pull/2191) feat: 添加受 IDE 启发的主题 (Nord、Catppuccin、One Dark)