---
sidebar_label: '远程 MCP 服务器'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud 中的远程 MCP'
description: 'ClickHouse Cloud 中远程 MCP 功能的介绍'
doc_type: 'reference'
---

# Cloud 中的远程 MCP 服务器 \{#remote-mcp-server-in-cloud\}

并非所有用户都通过 Cloud 控制台与 ClickHouse 交互。
例如，许多开发者直接在自己偏好的代码编辑器、CLI 工具中工作，或者通过自定义方案连接数据库；也有不少用户在大部分探索过程中依赖像 Anthropic Claude 这类通用 AI 助手。
这些用户及代表他们执行操作的 agent 型工作负载，需要一种方式在无需复杂配置或自建基础设施的前提下，安全地访问并查询 ClickHouse Cloud。

ClickHouse Cloud 中的远程 MCP 服务器功能通过提供一个标准接口来解决这一问题，外部代理可以借此获取分析上下文。
MCP（Model Context Protocol）是一个面向由 LLM 驱动的 AI 应用的结构化数据访问标准。
通过该集成，外部代理可以列出数据库和表、检查模式（schema），并运行有范围限制的只读 SELECT 查询。
身份验证通过 OAuth 完成，且服务器在 ClickHouse Cloud 上完全托管，无需任何部署或运维工作。

这使得各类 agent 工具更容易接入 ClickHouse 并获取所需数据，无论是用于分析、总结、代码生成还是探索。

更多详细信息，请参见 [guides](/use-cases/AI/MCP/remote_mcp) 部分。