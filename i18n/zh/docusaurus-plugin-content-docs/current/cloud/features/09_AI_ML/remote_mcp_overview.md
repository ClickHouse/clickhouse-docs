---
sidebar_label: '远程 MCP 服务器'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud 中的远程 MCP'
description: 'ClickHouse Cloud 中远程 MCP 功能的介绍'
doc_type: 'reference'
---

# Cloud 中的远程 MCP 服务器 {#remote-mcp-server-in-cloud}

并非所有用户都通过 Cloud 控制台与 ClickHouse 进行交互。
例如，许多开发者直接在自己偏好的代码编辑器、CLI agent 中工作，或者通过自定义方案连接数据库；而另一些人则主要依赖诸如 Anthropic Claude 这类通用 AI 助手来完成大部分探索工作。
这些用户，以及代表他们行动的智能体型工作负载，都需要一种方式，能够在无需复杂配置或自建基础设施的情况下，安全地访问并查询 ClickHouse Cloud。

ClickHouse Cloud 中的远程 MCP 服务器功能通过暴露一个标准接口来解决这一问题，外部 agent 可以通过该接口获取分析上下文。
MCP（Model Context Protocol，模型上下文协议）是由 LLM 驱动的 AI 应用用于访问结构化数据的一种标准。
通过这一集成，外部 agent 可以列出数据库和数据表、检查 schema，并在限定范围内执行只读的 SELECT 查询。
身份验证通过 OAuth 处理，服务器在 ClickHouse Cloud 上完全托管，因此无需任何部署或运维。

这使各类智能体工具更容易接入 ClickHouse 并检索所需数据，无论是用于分析、摘要生成、代码生成，还是探索。

有关更多详细信息，请参阅 [指南](/use-cases/AI/MCP/remote_mcp) 部分。