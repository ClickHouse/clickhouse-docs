---
sidebar_label: 'MCP 服务器'
sidebar_position: 8
slug: /cloud/features/ai-ml/agents/builder/mcp-servers
title: 'MCP 服务器'
description: '将第三方 MCP 服务器连接到 ClickHouse Agent'
keywords: ['AI', 'ClickHouse Cloud', '智能体', 'MCP', 'Model Context Protocol']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Model Context Protocol (MCP) 是将工具和数据源暴露给 AI 模型的开放标准。将 MCP 服务器连接到 ClickHouse Agent 后，agent 即可访问该服务器提供的所有能力——问题跟踪系统、可观测性后端、内部 API、第三方 SaaS，或任何其他带有 MCP 端点的服务。

## 连接 MCP 服务器 \{#attach-an-mcp-server\}

在 Agent Builder 中，打开 **MCP 服务器** 部分，然后点击 **添加服务器**。输入服务器的 URL 和身份验证设置，再选择要让该agent使用哪些服务器工具。保存agent。

你可以为一个agent连接多个服务器。agent调用的每个工具都会记录在对话中，方便用户查看agent执行了哪些操作。

## 传输 \{#transport\}

ClickHouse 智能体使用 Streamable HTTP——一种适用于生产环境的 MCP 传输方式。要连接的服务器必须能让 ClickHouse Cloud 通过 HTTP(S) 访问。

## 身份验证 \{#authentication\}

MCP 服务器可能会要求提供凭据。ClickHouse Agents 支持：

* **Bearer 令牌**和其他静态请求头——即你在配置服务器时提供的固定值。
* **OAuth 2.0**——交互式流程。你 (或任何有权访问的用户) 首次调用服务器上的工具时，浏览器会打开登录窗口；令牌会自动管理和刷新。
* **每用户凭据**——服务器配置中的变量会从调用用户的个人资料中替换，因此每个用户都使用自己的身份进行身份验证，而不是共用同一个服务账号。

用户提供的凭据会以加密形式存储，并且仅限输入这些凭据的用户使用。某个用户的凭据绝不会对另一位用户的 agent 运行可见。

## 限制 \{#limits\}

单次agent运行在每个请求中最多可引用 50 个不同的 MCP 服务器目标，以及最多 100 个展开后的工具配置。若需要更多，应通过 [subagents](/cloud/features/ai-ml/agents/builder/subagents) 进行拆分。