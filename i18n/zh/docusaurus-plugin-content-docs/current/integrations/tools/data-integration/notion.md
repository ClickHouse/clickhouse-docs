---
sidebar_label: 'Notion'
slug: /integrations/notion
keywords: ['ClickHouse', 'Notion', 'MCP', '自定义智能体', 'AI', '集成', '连接']
description: '通过 ClickHouse Remote MCP 服务器 将 ClickHouse Cloud 连接到 Notion 自定义智能体。'
title: '将 Notion 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';
import addClickHouseConnection from '@site/static/images/integrations/tools/data-integration/notion/add-clickhouse-connection.png';
import clickhouseToolsToggles from '@site/static/images/integrations/tools/data-integration/notion/clickhouse-tools-toggles.png';

<PartnerBadge />

[Notion](https://www.notion.com/) 是一个一体化工作空间，可用于管理笔记、文档、项目以及 AI 驱动的自定义智能体。

您可以将 ClickHouse Cloud 连接到 Notion 的 [自定义智能体](https://www.notion.com/help/mcp-connections-for-custom-agents)。连接后，该智能体无需离开 Notion，即可浏览您的数据、运行只读分析查询，并显示 ClickHouse Cloud 的服务信息和成本信息。

## 前置条件 \{#prerequisites\}

* 一个正在运行且已[启用远程 MCP 服务器](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)的 [ClickHouse Cloud 服务](/getting-started/quick-start/cloud)
* 一个采用 **Business** 或 **Enterprise** 套餐的 Notion 工作区

## 将 ClickHouse 连接到 Notion 自定义智能体 \{#connect-clickhouse-to-notion\}

ClickHouse 在 Notion 中已作为预配置连接提供 (当前处于 Beta 阶段) 。无需设置自定义 MCP 服务器，也不需要粘贴 URL。

1. 在 Notion 中，从侧边栏的 **Agents** 部分创建一个新的 自定义智能体。
2. 在你的 Agent 的 **Settings** 中，在 **Tools and Access** 下选择 **Add connection**，然后从可用连接列表中添加 **ClickHouse**。

<Image img={addClickHouseConnection} size="md" alt="在 Notion 的“Add connection”选择器中选择 ClickHouse" />

3. 点击 **Connect**，然后使用你的 ClickHouse Cloud 凭据完成 OAuth 流程。访问范围仅限于你的账户当前已可访问的组织和服务。

4. 在该 agent 的设置中展开新的 ClickHouse 连接，并启用你希望此 agent 使用的工具。对于每个工具，你还可以选择让 agent 自动运行，或始终先请求批准。ClickHouse Remote MCP 服务器 提供的所有工具均为只读。完整的最新列表请参阅[可用工具](/cloud/features/ai-ml/remote-mcp#available-tools)参考。

<Image img={clickhouseToolsToggles} size="md" alt="Notion 中展开后的 ClickHouse 连接，显示各工具的切换开关" />

:::note
每个 自定义智能体 都需要各自独立的 ClickHouse 连接，并且只有完成该连接身份验证的人才能更改其工具设置。更多详情，请参阅 Notion 的 [Agent connections 安全最佳实践](https://www.notion.com/help/security-best-practices-for-agent-connections)。
:::

## 相关内容 \{#related-content\}

* [启用并连接 ClickHouse Cloud 远程 MCP 服务器](/use-cases/AI/MCP/remote_mcp)
* [Cloud 中的远程 MCP：工具参考](/cloud/features/ai-ml/remote-mcp)
* Notion: [适用于自定义智能体的 MCP 连接](https://www.notion.com/help/mcp-connections-for-custom-agents)
* Notion: [通过 MCP 集成将自定义智能体连接到你的工具栈](https://www.notion.com/help/guides/connect-custom-agents-to-mcp-integrations)