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

<BetaBadge />

Memory 会在不同会话之间保留与用户相关的上下文。它不会对完整的聊天记录建立索引，而是存储精简的结构化条目——例如偏好、经常提及的事实和项目细节——以便agent在相关时调用。

## 工作原理 \{#how-it-works\}

一个小型记忆agent会在主对话旁运行。它会读取最近的消息，判断哪些内容值得记住，并将条目写入每位用户各自的存储中。在下一次对话中，这些条目会作为上下文提供给主agent参考，因此你无需重复说明。

你感受到的就是这种连续性：例如，你只需告诉agent一次，你偏好小写的 SQL 输出，并且你的财年在 3 月结束，后续对话就会据此进行。

## 管理你的记忆 \{#manage-your-memories\}

从你的账户菜单中打开记忆面板，即可：

* **查看** agent已存储的与你相关的条目。
* **编辑** 任意条目，以纠正或完善内容。
* **删除** 你不想保留到后续的条目。

记忆内容仅对你的账户可见。其他人的agent绝不会看到你的条目，你的agent也绝不会看到他们的条目。

## 记忆开关 \{#toggle-memory\}

每段对话的聊天标题栏中都有一个记忆开关。对于不想被存储的敏感话题，或是不需要个性化的一次性对话，请将其关闭。

关闭记忆后，agent在该对话中既不会从你的记忆存储中读取内容，也不会向其中写入内容。

## 记忆在哪些情况下有帮助 \{#when-memory-helps\}

* 重复性的约定：首选日期格式、业务定义、命名模式。
* 项目背景：你通常查询哪个服务或数据库，以及你关注哪些仪表板。
* 沟通风格：偏简洁还是偏健谈，回答更侧重代码还是文字说明。

## 当记忆派不上用场时 \{#when-memory-doesnt-help\}

记忆并不是数据库。它不是用来存放大量参考资料的地方——遇到这种情况，请使用[技能](/cloud/features/ai-ml/agents/builder/skills)，或将这些资料直接写入agent的指令中。它也不是对过往聊天内容的检索；这一作用本来就由对话历史本身承担。