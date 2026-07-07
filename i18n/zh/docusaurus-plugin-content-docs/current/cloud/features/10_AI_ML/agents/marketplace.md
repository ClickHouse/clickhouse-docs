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
import Image from '@theme/IdealImage';
import marketplace from '@site/static/images/cloud/agent-builder/marketplace/marketplace.png';
import browse from '@site/static/images/cloud/agent-builder/marketplace/browse.png';
import useAgent from '@site/static/images/cloud/agent-builder/marketplace/use-agent.png';

<BetaBadge />

智能体市场可供你浏览、搜索和运行组织中其他人与您共享的智能体。这里还包括管理员已发布给整个组织的智能体。从左侧边栏中的 **智能体市场** 选项打开它。

<Image img={marketplace} alt="聊天界面，左侧边栏中高亮显示了智能体市场选项" size="lg" />

## 浏览 \{#browse\}

agent按类别分组，例如 *常规*、*人力资源*、*研发*、*财务*、*IT*、*销售*。通过市场顶部的标签页在不同类别之间切换。每张agent卡片都会显示名称、图标以及所属类别。

使用搜索栏可按名称或关键词在所有类别中查找agent。

<Image img={browse} alt="agent市场视图，显示标题、搜索栏、类别标签页（常规、人力资源、研发、财务、IT、销售、售后、全部），以及一个可见的agent卡片" size="lg" />

## 打开 agent \{#open-an-agent\}

点击任意 agent 卡片即可打开其详情视图。在这里，您可以：

* **开始聊天** - 与该 agent 发起新的聊天。
* **置顶** - 将该 agent 添加到收藏夹，便于快速访问。
* **复制链接** - 分享该 agent 的直接链接。

<Image img={useAgent} alt="显示 agent 名称、图标以及“置顶”“复制链接”和“开始聊天”操作的 agent 详情弹窗" size="md" />

## 发布你自己的agent \{#publish-your-own\}

要让agent能够在市场中被发现，请在 [共享与访问](/cloud/features/ai-ml/agents/sharing-and-access) 面板中按适当的范围共享。可见性级别如下：

* **Private** - 仅你自己可见。不会出现在市场中。
* **Shared with users or groups** - 对这些用户或组可见。会显示在他们的市场中。
* **Organization-wide** - 对组织内所有人可见。是否显示受管理员设置的市场权限控制。

发布前，请先为agent选择类别并撰写清晰的描述——这些字段会同时影响搜索和按类别浏览的体验。

## 管理员控制 \{#admin-controls\}

组织管理员可以：

* 管理市场中显示的类别。
* 将单个智能体置顶到组织范围视图中。
* 按角色允许或限制对市场的访问。

有关权限模型，请参见[共享与访问](/cloud/features/ai-ml/agents/sharing-and-access)。