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

<BetaBadge />

提示词库用于保存并复用你经常反复输入的自然语言提示词。你可以把它看作聊天输入框中的代码片段——当相同的分析问题或格式要求在不同对话中反复出现时，它就非常有用。

## 创建提示词 \{#create-a-prompt\}

打开提示词面板，然后点击 **New prompt**。设置以下内容：

* **标题** — 显示在选择器中的名称。尽量写得具体一些：*&quot;按区域划分的每周活跃用户&quot;* 比 *&quot;WAU&quot;* 更清楚。
* **正文** — 实际会插入到输入框中的文本。
* **可选变量** — 正文中的占位符，可在插入时填写。使用 `{{name}}` 这种形式的标记；选择器会在插入前提示你输入相应的值。

将相关提示词按类别或标签分组，这样即使库不断增长，也仍然便于查找和浏览。

## 使用提示词 \{#use-a-prompt\}

在对话中，从输入框中打开提示词选择器，然后搜索或浏览以找到所需的提示词。如果提示词包含变量，请先填写这些变量。提示词内容会插入到输入框中，你可以在发送前进行编辑。

## 共享提示词 \{#share-prompts\}

提示词的访问模型与智能体相同：默认是私有的，可共享给特定用户或组，也可向整个组织开放。请参阅[共享和访问](/cloud/features/ai-ml/agents/sharing-and-access)。

## 提示词 vs. 技能 vs. 指令 \{#prompts-vs-skills-vs-instructions\}

* **提示词**是供用户插入并编辑的一次性文本片段。用户始终参与其中。
* **[技能](/cloud/features/ai-ml/agents/builder/skills)**是由智能体自行激活的指令包。
* **智能体指令**是智能体长期生效的系统提示。

当你想复用某些表述、但又希望每次都能自行把控具体措辞时，请使用提示词。