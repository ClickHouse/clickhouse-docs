---
sidebar_label: '快速入门'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: '快速入门'
description: '构建并运行你的第一个 ClickHouse Agent，并将其连接到 ClickHouse Cloud 服务'
keywords: ['AI', 'ClickHouse Cloud', '智能体', '快速入门', 'Agent 构建器']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

在 Cloud 控制台中创建自定义 agent，并对您的服务执行自然语言查询。

## 前置条件 \{#prerequisites\}

* 一个可供查询的 ClickHouse Cloud 服务。
* Agent Builder 中的 **Create agent** 选项。如果没有该选项，请让组织管理员按照[共享和访问](/cloud/features/ai-ml/agents/sharing-and-access)中的说明，通过 Admin Settings 授予创建agent的权限。

## 创建agent \{#create-the-agent\}

在 Cloud 控制台 中打开 Agents，然后在 Agent Builder 侧边栏中点击 **Create agent**。填写以下核心字段：

* **Name** — 简短标识符。
* **Description** — 用一行说明，让团队成员知道该agent的用途。
* **Instructions** — 系统提示。说明agent的角色、应回答的问题，以及必须遵循的业务规则。
* **Model** — 从下拉列表中选择一个模型。在[模型参数](/cloud/features/ai-ml/agents/builder/model-parameters)中调整 temperature 和其他生成设置。

## 添加工具 \{#attach-tools\}

确定agent需要哪些能力。你可以在 Builder 中添加：

* [代码解释器](/cloud/features/ai-ml/agents/builder/code-interpreter) — 在沙箱环境中执行代码，用于计算和数据转换。
* [网络搜索](/cloud/features/ai-ml/agents/builder/web-search) — 检索公开网页信息。
* [图像生成](/cloud/features/ai-ml/agents/builder/image-generation) 和 [视觉](/cloud/features/ai-ml/agents/builder/vision) — 视觉输出与输入。
* [MCP 服务器](/cloud/features/ai-ml/agents/builder/mcp-servers) — 通过 Model Context Protocol 接入第三方工具。
* [技能](/cloud/features/ai-ml/agents/builder/skills) 和 [子agent](/cloud/features/ai-ml/agents/builder/subagents) — 可复用的指令包和任务委派。

你可以随时更改已添加的工具。

## 运行查询 \{#run-a-query\}

保存该agent后，打开一个新对话，然后在agent选择器中选中你的agent。输入一个问题——例如，*&quot;本周按行数统计，排名前 10 的表有哪些？&quot;*——agent会自行规划、按需调用工具，并返回答案。

## 下一步 \{#next-steps\}

* 与团队成员[共享该agent](/cloud/features/ai-ml/agents/sharing-and-access)。
* 该agent进入稳定版本后，即可将其发布到[市场](/cloud/features/ai-ml/agents/marketplace)。