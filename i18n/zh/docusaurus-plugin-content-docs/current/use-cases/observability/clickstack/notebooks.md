---
slug: /use-cases/observability/clickstack/notebooks
title: 'ClickStack 的 AI 笔记本'
sidebar_label: 'AI 笔记本'
pagination_prev: null
pagination_next: null
description: '用于 ClickStack 的 AI 驱动排障笔记本'
doc_type: 'guide'
keywords: ['clickstack', 'AI 笔记本', '排障', '可观测性', 'HyperDX']
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import notebook_hero from '@site/static/images/use-cases/observability/hyperdx-notebook-hero.png';
import notebook_list from '@site/static/images/use-cases/observability/hyperdx-notebook-list.png';
import notebook_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-tiles.png';
import notebook_branching from '@site/static/images/use-cases/observability/hyperdx-notebook-branching.png';
import notebook_branch_modal from '@site/static/images/use-cases/observability/hyperdx-notebook-branch-modal.png';
import notebook_manual_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-manual-tiles.png';
import notebook_agent_context from '@site/static/images/use-cases/observability/hyperdx-notebook-agent-context.png';
import notebook_ai_consent from '@site/static/images/use-cases/observability/hyperdx-notebook-ai-consent.png';

<PrivatePreviewBadge />

AI Notebooks 是 ClickStack 中的一种交互式调查工具，将 AI 智能体与人工分析结合起来。您可以用自然语言描述问题，AI 智能体会代您查询日志、追踪和指标，并以一系列卡片的形式呈现相关数据、图表和摘要。您也可以在 AI 生成的输出旁添加自己的卡片 (图表、表格、搜索和 Markdown 注释) ，构建完整的调查记录。

<Image img={notebook_hero} alt="用于调查 Visa 缓存写满故障的 AI Notebook" size="lg" />

:::note 仅限托管版 ClickStack
AI Notebooks 仅在托管版 ClickStack 部署中可用。
:::

## 设置 \{#setup\}

AI Notebooks 当前在 ClickHouse Cloud 中处于私有预览阶段。AI 模型和提供商由平台自动管理。

使用 AI Notebooks 之前：

1. **启用 Generative AI** — 团队管理员必须开启 Generative AI 同意开关。请参阅 [启用 Generative AI](#enabling-generative-ai)。
2. **Notebook 访问权限** — 您的角色必须具有 Notebooks 的读写权限。

启用后，左侧边栏中会向所有具有相应角色的用户显示 **Notebooks** 条目。

## 启用生成式 AI \{#enabling-generative-ai\}

必须先由团队管理员启用生成式 AI 同意开关，之后才能使用笔记本 (及其他 AI 功能) 。

1. 前往 **Team Settings &gt; Security Policies**。
2. 将 **Generative AI** 切换为开启状态。
3. 查看并接受同意对话框。

<Image img={notebook_ai_consent} alt="Team Settings 中的生成式 AI 开关" size="lg" />

## 使用 AI 笔记本 \{#using-notebooks\}

### 创建笔记本 \{#creating-a-notebook\}

1. 在左侧边栏中选择 **Notebooks**。
2. 点击 **New Private Notebook** (仅您可见) 或 **New Shared Notebook** (您的团队可见) 。

笔记本列表页面显示您可访问的所有笔记本。您可以按名称或标签筛选，也可以在 **My Notebooks** 和 **All Notebooks** 之间切换。

<Image img={notebook_list} alt="笔记本列表页面" size="lg" />

### 运行 AI 调查 \{#running-investigation\}

在笔记本底部，输入一条提示，描述您想调查的内容——例如，*&quot;为什么过去一小时内 checkout 服务的错误率激增？&quot;*

按 **Send** (或按 Enter 键) 。AI 智能体将：

1. 查看您可用的数据源。
2. 针对您的日志、追踪和指标运行搜索与聚合查询。
3. 生成一系列卡片，展示其思考过程、运行的查询、中间图表，以及包含结论的最终总结。

每个步骤都会以笔记本中的一个卡片显示。**思考过程** 卡片会展示每个查询背后的推理，**输出** 卡片则包含智能体的结论和可选图表。与普通的 AI 聊天不同，笔记本让您可以清楚看到 AI 在每一步具体基于哪些数据开展工作——这样您就可以验证其推理，发现它可能忽略的有价值线索，并通过[分支](#branching)功能将调查引导到不同方向。

调查运行期间，您可以点击 **Stop** 取消。

<Image img={notebook_tiles} alt="包含 AI 生成卡片的笔记本" size="lg" />

### 调查分支 \{#branching\}

在 AI 调查过程中，你可能会注意到某个中间步骤出现了有价值的线索，但 agent 已继续沿着另一条路径展开。**分支**功能可让你从该节点使用不同的提示重新开始，而不会丢失原始调查路径。

要创建分支：

1. 展开一个思考过程图块，然后点击 **Restart from Here**。
2. 在对话框中输入修改后的提示，将调查引导到新的方向。
3. 点击 **Interrupt &amp; Create Branch**。AI 会从该节点启动一个新的调查分支。

<Image img={notebook_branch_modal} alt="创建新分支对话框" size="md" />

当一个图块包含多个分支时，图块头部会显示左右箭头按钮，以及一个徽标 (例如 **1/2**) 来指示分支数量。点击箭头即可在各个分支之间切换。

<Image img={notebook_branching} alt="图块上的分支导航箭头和 1/2 徽标" size="lg" />

### 添加手动卡片 \{#manual-tiles\}

除了 AI 生成的卡片外，您还可以使用笔记本底部的按钮添加自己的分析区块：

| Button       | Shortcut | Description                                                                |
| ------------ | -------- | -------------------------------------------------------------------------- |
| **Search**   | `S`      | 日志/链路搜索视图，等同于搜索页面。                                                         |
| **Chart**    | `L`      | 时间序列折线图，使用与[仪表板](/use-cases/observability/clickstack/dashboards)相同的可视化构建器。 |
| **Table**    | `T`      | 表格聚合视图。                                                                    |
| **Markdown** | `M`      | 用于记录备注、假设或结论的自由文本。                                                         |

添加卡片后，它会以内联编辑模式打开，您可以在其中配置数据源、筛选器和聚合——与构建[仪表板可视化](/use-cases/observability/clickstack/dashboards#creating-visualizations)时使用的是同一界面。点击 **Save** 以保存并完成该卡片。

手动卡片会添加到当前分支中最后一个可见卡片的下方。您可以拖动卡片的底边来垂直调整其大小。

<Image img={notebook_manual_tiles} alt="笔记本底部的手动卡片按钮" size="lg" />

:::note
如果当前有 AI 调查正在运行，添加或编辑手动卡片会取消该调查。继续前会显示确认对话框。
:::

### 共享与组织 \{#sharing-organizing\}

* **私有与共享** — 切换笔记本标题栏中的锁形图标，即可在私有 (仅自己可见) 和共享 (团队可见) 之间切换。只有笔记本创建者才能修改此设置。
* **标签** — 为笔记本添加标签，便于在列表页面中筛选。
* **命名** — 点击笔记本标题即可重命名。如果你在一个未命名的笔记本中开始调查，AI 会自动建议一个名称。

### 自定义 agent 上下文 \{#custom-agent-context\}

团队管理员可以提供额外的上下文，这些内容会包含在团队内每次 AI 笔记本 调查中。这有助于让 AI 了解你的系统架构、命名约定或已知问题等背景信息。

要进行配置：

1. 在左侧边栏中进入 **Notebooks**。
2. 打开 **Agent Settings** (仅团队管理员可用) 。
3. 输入自定义上下文 (最多 50,000 个字符) 并保存。

对于团队中的所有 笔记本 调查，此上下文都会附加到 AI 的系统提示中。

<Image img={notebook_agent_context} alt="用于自定义上下文的 Agent Settings 面板" size="lg" />