---
sidebar_label: '记忆'
sidebar_position: 6
slug: /cloud/features/ai-ml/agents/memory
title: '记忆'
description: 'ClickHouse agent中的记忆与个性化'
keywords: ['AI', 'ClickHouse Cloud', 'agent', '记忆', '个性化']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import memories from '@site/static/images/cloud/agent-builder/memory/memories.png';
import create from '@site/static/images/cloud/agent-builder/memory/create.png';
import edit from '@site/static/images/cloud/agent-builder/memory/edit.png';
import deleteMemory from '@site/static/images/cloud/agent-builder/memory/delete.png';
import filter from '@site/static/images/cloud/agent-builder/memory/filter.png';
import toggle from '@site/static/images/cloud/agent-builder/memory/toggle.png';

<BetaBadge />

是一个按用户划分的存储，agent可以在不同会话之间调用。它由多个条目组成，每个条目都是一个键值对——例如你偏好的
日期格式、你通常查询的数据库，以及你希望回复有多简洁。agent会在适用时将这些内容纳入上下文。

## 记忆的工作原理 \{#how-it-works\}

一个小型记忆agent会在主对话旁运行。它会读取最近的消息，判断哪些内容值得记住，并将条目写入每位用户各自的存储中。在下一次对话中，这些条目会作为上下文提供给主agent参考，因此你无需重复说明。

你感受到的就是这种连续性：例如，你只需告诉agent一次，你偏好小写的 SQL 输出，并且你的财年在 3 月结束，后续对话就会据此进行。

## 管理你的记忆 \{#manage-your-memories\}

点击左侧导航中的 **Memories** (大脑) 图标，打开记忆面板。面板中会列出你已保存的记忆，并提供创建、编辑、删除和过滤条目的控件。

<Image img={memories} alt="记忆面板，显示左侧导航中高亮的大脑图标、一个过滤输入框、一个 Add 按钮、一个 使用记忆 复选框、一条带有编辑和删除控件的记忆条目，以及一个 Admin Settings 按钮" size="sm" />

Memory 仅对你本人可见。其他人的agent绝不会看到你的条目，你的agent也绝不会看到他们的条目。

### 创建记忆 \{#create-memory\}

点击面板顶部的 **+** 按钮，打开 **Create 记忆** 对话框。输入 **键** (仅限小写字母和下划线) 和 **值**，然后点击 **Create**。

<Image img={create} alt="记忆 面板中高亮显示的 Create 记忆 + 按钮" size="sm" />

### 筛选记忆 \{#filter-memories\}

使用面板顶部的 **筛选记忆** 输入框，可按键名查找条目。

<Image img={filter} alt="记忆面板，其中“筛选记忆”输入框已高亮，并输入了“demo”" size="sm" />

### 编辑记忆 \{#edit-memory\}

点击某条记忆旁的铅笔图标，打开 **编辑记忆** 对话框。修改键或值，然后点击 **保存**。

<Image img={edit} alt="高亮显示“编辑记忆”铅笔图标的记忆条目" size="sm" />

### 删除一条记忆 \{#delete-memory\}

点击某条记忆上的垃圾桶图标即可将其删除。

<Image img={deleteMemory} alt="突出显示“删除 记忆”垃圾桶图标的 记忆 条目" size="sm" />

## 记忆开关 \{#toggle-memory\}

使用记忆面板顶部的 **使用记忆** 复选框来开启或关闭记忆。对于不想被存储的敏感话题，或是不需要个性化的一次性对话，请将其关闭。

关闭记忆后，agent既不会从你的记忆存储中读取内容，也不会向其中写入内容。

<Image img={toggle} alt="记忆面板，顶部的“使用记忆”复选框已高亮显示" size="sm" />

## 记忆 最佳实践 \{#memory-best-practices\}

记忆 在以下情况下会有所帮助：

* 重复性的约定：首选日期格式、业务定义、命名模式。
* 项目背景：你通常查询哪个服务或数据库，以及你关注哪些仪表板。
* 沟通风格：偏简洁还是偏健谈，回答更侧重代码还是文字说明。

记忆 并非设计用来充当数据库。例如，它不是用来存放大量参考资料的地方。
对于这类内容，你应该改用[技能](/cloud/features/ai-ml/agents/builder/skills)，或将这些材料直接写入agent的指令中。
它也不适用于检索过往聊天内容；这一作用由会话历史本身承担。