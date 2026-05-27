---
sidebar_label: '市场'
sidebar_position: 7
slug: /cloud/features/ai-ml/agents/marketplace
title: '智能体市场'
description: '发现并使用您所在的 ClickHouse Cloud 组织内共享的智能体'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'marketplace', 'sharing', 'discovery']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

智能体市场可供你浏览、搜索和运行组织中其他人与您共享的智能体。这里还包括管理员已发布给整个组织的智能体。

## 浏览 \{#browse\}

agent按类别分组——例如，*Analytics*、*Operations*、*Engineering*。通过市场顶部的标签页可在不同类别之间切换。每张agent卡片都会显示名称、描述、头像，以及用于发起对话的快捷操作。

使用搜索栏可在所有类别中按名称、描述或关键词查找agent。

## 打开一个agent \{#open-an-agent\}

点击任意agent卡片即可查看其完整详情：使用说明、它所用的模型、已附加的工具，以及分享者。你可以在详情页中：

* **开始对话** — 与该agent开启新的聊天。
* **保存副本** — 如果你有编辑权限，可将该agent克隆到你自己的列表中进行修改。

## 发布你自己的agent \{#publish-your-own\}

要让agent能够在市场中被发现，请在 [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access) 面板中按适当的范围共享。可见性级别如下：

* **Private** — 仅你自己可见。不会出现在市场中。
* **Shared with users or groups** — 对这些用户或组可见。会显示在他们的市场中。
* **Organization-wide** — 对组织内所有人可见。是否显示受管理员设置的市场权限控制。

发布前，请先为agent选择类别并撰写清晰的描述——这些字段会同时影响搜索和按类别浏览的体验。

## 管理员控制 \{#admin-controls\}

组织管理员可以：

* 管理市场中显示的类别。
* 将单个智能体置顶到组织范围视图中。
* 按角色允许或限制对市场的访问。

有关权限模型，请参见[共享与访问](/cloud/features/ai-ml/agents/sharing-and-access)。