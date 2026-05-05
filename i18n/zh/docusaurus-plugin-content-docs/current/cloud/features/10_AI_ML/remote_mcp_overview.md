---
sidebar_label: '远程 MCP 服务器'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud 中的远程 MCP'
description: 'ClickHouse Cloud 中远程 MCP 功能的介绍'
keywords: ['AI', 'ClickHouse Cloud', 'MCP', 'Model Context Protocol', '远程 MCP']
doc_type: 'reference'
---

# Cloud 中的远程 MCP 服务器 \{#remote-mcp-server-in-cloud\}

并非所有用户都通过 Cloud 控制台与 ClickHouse 交互。
例如，许多开发者直接在自己偏好的代码编辑器、CLI 工具中工作，或者通过自定义方案连接数据库；也有不少用户在大部分探索过程中依赖像 Anthropic Claude 这类通用 AI 助手。
这些用户及代表他们执行操作的智能体型工作负载，需要一种方式在无需复杂配置或自建基础设施的前提下，安全地访问并查询 ClickHouse Cloud。

ClickHouse Cloud 中的远程 MCP 服务器功能通过提供一个标准接口来解决这一问题，外部agent可以借此获取分析上下文。
MCP (Model Context Protocol) 是一个面向由 LLM 驱动的 AI 应用的结构化数据访问标准。
通过该集成，外部agent可以列出数据库和表、检查schema ，并运行有范围限制的只读 SELECT 查询。
身份验证通过 OAuth 完成。服务器在 ClickHouse Cloud 上完全托管，因此无需任何部署或运维工作。

这使得各类agent工具更容易接入 ClickHouse 并获取所需数据，无论是用于分析、总结、代码生成还是探索。

## 远程 MCP 服务器与开源 MCP 服务器对比 \{#remote-vs-oss\}

ClickHouse 提供两种 MCP 服务器。

|          | 远程 MCP 服务器 (Cloud)                           | 开源 MCP 服务器                                                               |
| -------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| **来源**   | 由 ClickHouse Cloud 全托管                       | GitHub 上的 [mcp-clickhouse](https://github.com/ClickHouse/mcp-clickhouse) |
| **传输**   | 流式 HTTP (`https://mcp.clickhouse.cloud/mcp`) | 本地 stdio                                                                 |
| **适用范围** | ClickHouse Cloud 服务                          | 任何 ClickHouse 实例 (自托管或 Cloud)                                            |
| **身份验证** | 使用您的 Cloud 凭据通过 OAuth 2.0 进行身份验证             | 环境变量                                                                     |
| **工具**   | 13 个工具，涵盖查询、schema 浏览、服务管理、备份、ClickPipes 和计费 | 3 个工具：`run_select_query`、`list_databases`、`list_tables`                  |
| **配置**   | 无需安装。将您的 MCP 客户端指向该端点并完成身份验证。                | 在本地安装并运行服务器                                                              |

远程 MCP 服务器提供与 ClickHouse Cloud 最完整的集成，包括服务管理、备份监控、查看 ClickPipe 以及计费数据，并且无需管理任何基础设施。
对于自托管的 ClickHouse 实例，参阅 [开源 MCP 服务器指南](/use-cases/AI/MCP)。

## 启用远程 MCP 服务器 \{#enabling\}

远程 MCP 服务器必须先在每个服务中启用，之后才能接受连接。
在 ClickHouse Cloud 控制台中，打开您的服务，点击 **Connect** 按钮，选择 **MCP**，然后将其启用。
如需查看带截图的详细步骤，请参阅[配置指南](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)。

## 端点 \{#endpoint\}

启用后，远程 MCP 服务器可通过以下地址访问：

```text
https://mcp.clickhouse.cloud/mcp
```

## 身份验证 \{#authentication\}

对远程 MCP 服务器的所有访问都通过 OAuth 2.0 进行身份验证。
MCP 客户端首次连接时，会启动 OAuth 流程并打开浏览器窗口，供用户使用其 ClickHouse Cloud 凭据登录。
访问范围仅限于该已通过身份验证的用户有权访问的组织和服务，无需额外配置 API 密钥。

## 安全性 \{#safety\}

远程 MCP 服务器公开的所有工具均为**只读**。每个工具都会在其 MCP 元数据中标注 `readOnlyHint: true`。任何工具都无法修改数据、更改服务配置或执行任何破坏性操作。

## 可用工具 \{#available-tools\}

远程 MCP 服务器提供了 13 个工具，分为以下几类。

### 查询与 schema 探索 \{#query-and-schema\}

这些工具允许 agent 发现可用数据，并运行分析查询。

| Tool               | 描述                             | 参数                                                                   |
| ------------------ | ------------------------------ | -------------------------------------------------------------------- |
| `run_select_query` | 对 ClickHouse 服务执行只读 SELECT 查询。 | `query`，有效的 ClickHouse SQL SELECT 查询；`serviceId`                     |
| `list_databases`   | 列出 ClickHouse 服务中所有可用的数据库。     | `serviceId`                                                          |
| `list_tables`      | 列出数据库中的所有表，包括列定义。              | `serviceId`；`database`；可选 `like` 或 `notLike` (用于按表名筛选的 SQL LIKE 模式)  |

### 组织 \{#organizations\}

| 工具                         | 描述                                 | 参数               |
| -------------------------- | ---------------------------------- | ---------------- |
| `get_organizations`        | 获取已认证用户可访问的所有 ClickHouse Cloud 组织。 | 无                |
| `get_organization_details` | 返回单个组织的详细信息。                       | `organizationId` |

### 服务 \{#services\}

| Tool                  | 描述                            | 参数                            |
| --------------------- | ----------------------------- | ----------------------------- |
| `get_services_list`   | 列出 ClickHouse Cloud 组织中的所有服务。 | `organizationId`              |
| `get_service_details` | 返回指定服务的详细信息。                  | `organizationId`; `serviceId` |

### 备份 \{#backups\}

| Tool                               | 描述                        | 参数                                        |
| ---------------------------------- | ------------------------- | ----------------------------------------- |
| `list_service_backups`             | 列出某个服务的所有备份，按最新到最旧排序。     | `organizationId`; `serviceId`             |
| `get_service_backup_details`       | 返回单个备份的详细信息。              | `organizationId`; `serviceId`; `backupId` |
| `get_service_backup_configuration` | 返回某个服务的备份配置 (计划和保留期限设置) 。 | `organizationId`; `serviceId`             |

### ClickPipes \{#clickpipes\}

| Tool              | 描述                       | 参数                                           |
| ----------------- | ------------------------ | -------------------------------------------- |
| `list_clickpipes` | 列出为某项服务配置的所有 ClickPipes。 | `organizationId`; `serviceId`                |
| `get_clickpipe`   | 返回特定 ClickPipe 的详细信息。    | `organizationId`; `serviceId`; `clickPipeId` |

### 计费 \{#billing\}

| Tool                    | 描述                                  | 参数                                                                |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `get_organization_cost` | 获取组织的计费和用量成本数据。返回总成本以及按天统计的各实体成本记录。 | `organizationId`；可选 `from_date` 和 `to_date` (YYYY-MM-DD，最长 31 天)  |

## 快速开始 \{#getting-started\}

参阅[配置指南](/use-cases/AI/MCP/remote_mcp)，了解如何逐步启用远程 MCP 服务器并将其连接到 MCP 客户端。