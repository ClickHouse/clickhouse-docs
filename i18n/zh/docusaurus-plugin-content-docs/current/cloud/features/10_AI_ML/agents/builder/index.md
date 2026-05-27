---
sidebar_label: '概述'
slug: /cloud/features/ai-ml/agents/builder
title: '智能体构建器'
description: '使用智能体构建器创建和配置 ClickHouse 智能体'
keywords: ['AI', 'ClickHouse Cloud', '智能体', '智能体构建器', '工具', '说明']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Agent Builder 用于创建和配置智能体。它会在 Cloud 控制台中以侧边面板的形式打开。

该面板包含三个部分：

* 顶部的 **身份标识** —— 名称、描述、头像，以及指令字段 (系统提示) 。
* 中间的 **模型配置** —— 提供商、模型和生成参数。
* 底部的 **Capabilities** —— 你添加的工具、MCP 服务器、技能和子智能体。

使用页脚中的按钮保存。编辑会在下一次对话时生效；正在进行中的运行不会中断。

## 身份标识 \{#identity\}

指令字段是该智能体的系统提示。请说明它的角色、应回答的问题类型，以及必须遵循的规则。如果该智能体会查询你的 ClickHouse 服务，请明确 schema 约定、计算指标和术语——模型无法自行推断你的业务定义。

## 核心配置 \{#core-configuration\}

* [模型参数](/cloud/features/ai-ml/agents/builder/model-parameters) — 选择模型并调整生成参数。将配置保存为带名称的预设，以便重复使用。

## 内置工具 \{#built-in-tools\}

* [代码解释器](/cloud/features/ai-ml/agents/builder/code-interpreter) — 沙箱式代码执行。
* [网页搜索](/cloud/features/ai-ml/agents/builder/web-search) — 公网搜索。
* [图像生成](/cloud/features/ai-ml/agents/builder/image-generation) — 根据文本生成图像。
* [视觉](/cloud/features/ai-ml/agents/builder/vision) — 支持图像输入。

## 扩展性 \{#extensibility\}

* [MCP 服务器](/cloud/features/ai-ml/agents/builder/mcp-servers) — 将第三方 MCP 服务器接入智能体。
* [技能](/cloud/features/ai-ml/agents/builder/skills) — 可复用的指令包。
* [子智能体](/cloud/features/ai-ml/agents/builder/subagents) — 将工作委派给子智能体。