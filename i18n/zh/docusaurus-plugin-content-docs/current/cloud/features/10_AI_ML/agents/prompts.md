---
sidebar_label: '提示词'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/prompts
title: '提示词'
description: 'ClickHouse 智能体的已保存提示词库'
keywords: ['AI', 'ClickHouse Cloud', '智能体', '提示词', '模板']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import createPrompt from '@site/static/images/cloud/agent-builder/prompts/create-prompt.png';
import preview from '@site/static/images/cloud/agent-builder/prompts/preview.png';
import usePromptModal from '@site/static/images/cloud/agent-builder/prompts/use-prompt-modal.png';

<BetaBadge />

提示词库用于保存并复用你经常反复输入的自然语言提示词。你可以把它看作聊天输入框中的代码片段——当相同的分析问题或格式要求在不同对话中反复出现时，它就非常有用。

## 创建提示词 \{#create-a-prompt\}

在左侧导航栏中，点击 **提示词** 图标打开 提示词 面板，然后点击 **+** 按钮，打开 **Create Prompt** 表单。填写以下字段：

* **Prompt Name** (必填) - 显示在选择器中的名称。请尽量写得具体明确：例如，*&quot;按区域划分的每周活跃用户&quot;* 就比 *&quot;WAU&quot;* 更清楚。
* **Text** (必填) - 实际会插入到输入框中的文本。
* **Special variables** - 点击 **Special variables** 按钮插入占位符，或者直接输入 `{{name}}` 这种形式的标记。选择器会在插入前提示你填写相应的值。
* **Category**、**Description**、**Command** (可选) - 用于整理提示词库、设置选择器中的预览文本，以及配置快速调用的快捷方式。

然后点击右下角的 **Create Prompt**。

<Image img={createPrompt} alt="提示词 面板，左侧的 + 按钮已高亮，右侧打开了 Create Prompt 表单，其中显示了 Prompt Name、Text、Category、Special variables、Description 和 Command 字段，以及一个 Create Prompt 按钮" size="lg" />

## 使用提示词 \{#use-a-prompt\}

在提示词面板中，打开某个提示词卡片上的 **...** 菜单，然后选择 **Preview**：

<Image img={preview} alt="提示词面板中选中了一个提示词，右侧显示其详细信息，上下文菜单中显示 Preview 和 Edit 选项" size="lg" />

预览中会显示提示词文本，以及作者和日期。点击 **Use Prompt** 可将正文插入输入框。如果该提示词包含变量，请先填写。

<Image img={usePromptModal} alt="提示词预览模态框，显示提示词标题、作者、日期、正文文本和一个 Use Prompt 按钮" size="md" />

## 共享提示词 \{#share-prompts\}

默认情况下，提示词仅创建者可见。所有者可以将提示词的可见范围更改为：

* **特定用户或组** - 你指定的任何人都可以找到并使用该提示词。
* **整个组织** - 你的 ClickHouse Cloud 组织中的所有人都可以找到并使用该提示词。

提示词使用与智能体相同的权限模型。有关角色的完整矩阵以及各角色可执行的操作，请参阅 [共享与
访问](/cloud/features/ai-ml/agents/sharing-and-access)。

## 提示词、技能与指令的区别 \{#prompts-vs-skills-vs-instructions\}

提示词、技能和智能体指令都会向模型添加文本，但它们在由谁触发以及持续性方面有所不同。

* **提示词** - 由你自行插入到输入框中的文本，每轮都可单独编辑。
* **[技能](/cloud/features/ai-ml/agents/builder/skills)** - 当智能体判断其与任务相关时，会自行加载的指令集。
* **智能体指令** - 智能体的持久系统提示，会应用于每一次对话。

如果你想复用措辞，同时又希望每次都能自行把控具体表述，请使用提示词。如果你希望智能体在某类任务中始终一致地应用相同的指导，而无需你手动输入，请使用技能。如果某种行为应在智能体的整个生命周期内持续生效，请使用智能体指令。