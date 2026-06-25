---
sidebar_label: '快速入门'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: '快速入门'
description: '构建并运行你的第一个 ClickHouse Agent，并将其连接到 ClickHouse Cloud 服务'
keywords: ['AI', 'ClickHouse Cloud', '智能体', '快速入门', '智能体构建器']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import agentBuilder from '@site/static/images/cloud/agent-builder/agent-builder.png';
import capabilities from '@site/static/images/cloud/agent-builder/capabilities.png';
import toolsButton from '@site/static/images/cloud/agent-builder/tools-button.png';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';
import chatQuery from '@site/static/images/cloud/agent-builder/chat-query.png';
import launchAgents from '@site/static/images/cloud/agent-builder/launch-ch-agents.png';

<BetaBadge />

在 Cloud 控制台中创建自定义 agent，并对您的服务执行自然语言查询。

## 前置条件 \{#prerequisites\}

* 一个可供查询的 ClickHouse Cloud 服务。
* Agent Builder 中的 **Create agent** 选项。如果没有该选项，请让组织管理员按照[共享和访问](/cloud/features/ai-ml/agents/sharing-and-access)中的说明，通过 Admin Settings 授予创建agent的权限。

## 构建agent \{#build-the-agent\}

<VerticalStepper headerLevel="h3">
  ### 启动 ClickHouse Agents \{#launch-agents\}

  在你的 Cloud 服务中，点击左侧边栏中的 **ClickHouse agents**，打开agent启动页。点击 **Launch ClickHouse agents**，进入agent构建器。

  <Image img={launchAgents} alt="Cloud service 导航中已选中 ClickHouse agents（Beta），显示带有 Launch ClickHouse agents 按钮的启动页" size="lg" />

  ### 创建agent \{#create-the-agent\}

  在agent构建器中，点击左侧面板顶部的 **Create New Agent**。填写以下核心字段：

  * **Name** - agent的简短标识名称。
  * **Description** - 说明agent用途的描述，团队成员可见。
  * **Category** - agent所属的类别。除非你的组织定义了自定义类别，否则可保留为 `General`。
  * **Instructions** - 系统提示，用于说明agent的角色、应回答的问题以及必须遵循的业务规则。
  * **Model** - 从下拉列表中选择一个模型。

  <Image img={agentBuilder} alt="agent构建器面板，显示 Create New Agent 下拉菜单、表单字段（Name、Description、Category、Instructions、Model）以及 Capabilities 部分" size="lg" />

  ### 添加能力和工具 \{#attach-tools\}

  agent的能力和工具分布在两个位置。

  主面板中的 **Capabilities** —— 包括 [Run Code](/cloud/features/ai-ml/agents/builder/code-interpreter)、[网页搜索](/cloud/features/ai-ml/agents/builder/web-search)、File Context、Artifacts、[MCP Servers](/cloud/features/ai-ml/agents/builder/mcp-servers) 和 [技能](/cloud/features/ai-ml/agents/builder/skills) 等第一方功能。打开agent所需的功能开关。

  <Image img={capabilities} alt="agent构建器面板中的 Capabilities 部分，显示 Run Code、Web Search、File Context、Artifacts、MCP Servers 和 Skills 开关" size="sm" />

  面板底部 **Add Tools** 按钮中的 **Tools** —— 包括 [图像生成](/cloud/features/ai-ml/agents/builder/image-generation)、[视觉](/cloud/features/ai-ml/agents/builder/vision)、搜索 API 和外部服务等第三方集成。

  <Image img={toolsButton} alt="agent构建器面板底部，高亮显示 Add Tools 按钮" size="sm" />

  点击 **Add Tools** 浏览目录：

  <Image img={toolsModal} alt="Agent Tools 模态框，显示第三方集成网格，包括 Google、OpenAI Image Tools、Wolfram、DALL-E-3、Tavily Search、Calculator 和 Stable Diffusion" size="lg" />

  [子智能体](/cloud/features/ai-ml/agents/builder/subagents) 在 **Advanced settings** 下配置——详情请参见子智能体页面。

  你可以随时更改已添加的能力和工具。

  ### 运行查询 \{#run-a-query\}

  保存agent，打开一个新会话，然后在agent选择器中选中你的agent。输入一个问题——例如，*&quot;What are my top 10 tables by row count this week?&quot;*——随后agent会进行规划、按需调用工具，并返回答案。

  <Image img={chatQuery} alt="聊天对话，显示问题“What are my top 10 tables by row count this week?”以及agent的响应——一个按行数对各服务前 10 张表进行排名的 Markdown 表格，下方附有 Key Observations" size="lg" />
</VerticalStepper>

## 下一步 \{#next-steps\}

* 与团队成员[共享该agent](/cloud/features/ai-ml/agents/sharing-and-access)。
* 该agent进入稳定版本后，即可将其发布到[市场](/cloud/features/ai-ml/agents/marketplace)。