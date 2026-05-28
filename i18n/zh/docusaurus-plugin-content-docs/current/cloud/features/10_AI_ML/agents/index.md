---
sidebar_label: '概述'
slug: /cloud/features/ai-ml/agents
title: 'ClickHouse 智能体'
description: 'ClickHouse Cloud 中 ClickHouse 智能体的概述'
keywords: ['AI', 'ClickHouse Cloud', '智能体', 'agent builder']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse 智能体让你无需自己编写 SQL 或编排逻辑，即可通过对话查询和探索 ClickHouse 数据。
智能体会理解你的意图、规划步骤、调用你已配置的工具，并将结果返回给你。
此功能目前处于 Beta 阶段；在正式可用之前，其行为和能力可能会发生变化。

## 你可以用它做什么 \{#what-you-can-do\}

使用 ClickHouse 智能体，你可以：

* 无需编写代码即可构建自定义智能体。你可以编写指令、选择模型并接入工具。
* 围绕你的 ClickHouse 服务发起对话，并由智能体在需要时调用工具。
* 与团队成员共享你的智能体，或将其发布到市场。

## 本节内容 \{#in-this-section\}

通过以下页面进一步了解 ClickHouse 智能体的功能：

| 页面                                                       | 涵盖内容                              |
| -------------------------------------------------------- | --------------------------------- |
| [快速入门](/cloud/features/ai-ml/agents/quickstart)          | 构建你的第一个智能体并运行示例查询                 |
| [聊天](/cloud/features/ai-ml/agents/chat)                  | 对话、书签、分支、多对话和共享                   |
| [智能体构建器](/cloud/features/ai-ml/agents/builder)           | 配置智能体、模型参数，以及附加工具、MCP 服务器、技能和子智能体 |
| [提示词](/cloud/features/ai-ml/agents/prompts)              | 已保存的提示词库                          |
| [Memory](/cloud/features/ai-ml/agents/memory)            | 在不同对话间持久保留上下文                     |
| [市场](/cloud/features/ai-ml/agents/marketplace)           | 在组织内共享和发现智能体                      |
| [共享和访问](/cloud/features/ai-ml/agents/sharing-and-access) | 智能体的权限模型                          |