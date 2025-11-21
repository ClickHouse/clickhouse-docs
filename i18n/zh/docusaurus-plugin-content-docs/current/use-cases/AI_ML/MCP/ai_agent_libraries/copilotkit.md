---
slug: /use-cases/AI/MCP/ai-agent-libraries/copilotkit
sidebar_label: '集成 CopilotKit'
title: '如何使用 CopilotKit 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何借助 ClickHouse MCP 和 CopilotKit，使用存储在 ClickHouse 中的数据构建智能体应用'
keywords: ['ClickHouse', 'MCP', 'copilotkit']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 CopilotKit 和 ClickHouse MCP Server 构建 AI 智能体

这是一个示例，演示如何使用存储在 ClickHouse 中的数据构建智能体应用程序。它使用 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 
从 ClickHouse 查询数据，并基于这些数据生成图表。

[CopilotKit](https://github.com/CopilotKit/CopilotKit) 用于构建 UI，  
并为用户提供聊天界面。

:::note 示例代码
此示例的代码可以在 [examples 仓库](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit) 中找到。
:::



## 前提条件 {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`


## 安装依赖项 {#install-dependencies}

在本地克隆项目:`git clone https://github.com/ClickHouse/examples`,然后进入 `ai/mcp/copilotkit` 目录。

可跳过本节,直接运行脚本 `./install.sh` 安装依赖项。如需手动安装依赖项,请按照以下说明操作。


## 手动安装依赖项 {#install-dependencies-manually}

1. 安装依赖项:

运行 `npm install` 安装 Node 依赖项。

2. 安装 mcp-clickhouse:

创建新文件夹 `external` 并将 mcp-clickhouse 仓库克隆到该文件夹中。

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

安装 Python 依赖项并添加 fastmcp CLI 工具。

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```


## 配置应用程序 {#configure-the-application}

将 `env.example` 文件复制为 `.env`,然后编辑该文件以配置您的 `ANTHROPIC_API_KEY`。


## 使用自定义 LLM {#use-your-own-llm}

如果您需要使用 Anthropic 之外的 LLM 提供商,可以修改 Copilotkit 运行时配置以使用不同的 LLM 适配器。
支持的提供商列表请参见[此处](https://docs.copilotkit.ai/guides/bring-your-own-llm)。


## 使用您自己的 ClickHouse 集群 {#use-your-own-clickhouse-cluster}

默认情况下,示例配置为连接到 [ClickHouse 演示集群](https://sql.clickhouse.com/)。您也可以通过设置以下环境变量来使用自己的 ClickHouse 集群:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`


# 运行应用程序 {#run-the-application}

运行 `npm run dev` 以启动开发服务器。

您可以使用如下提示词测试 Agent:

> "显示曼彻斯特过去 10 年的价格变化趋势。"

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 以查看结果。
