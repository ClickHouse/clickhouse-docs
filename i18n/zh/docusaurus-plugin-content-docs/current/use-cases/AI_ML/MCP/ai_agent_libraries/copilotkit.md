---
slug: /use-cases/AI/MCP/ai-agent-libraries/copilotkit
sidebar_label: '集成 CopilotKit'
title: '如何使用 CopilotKit 和 ClickHouse MCP Server 构建 AI 智能体'
pagination_prev: null
pagination_next: null
description: '学习如何使用 ClickHouse MCP 和 CopilotKit，将存储在 ClickHouse 中的数据用于构建具备智能体能力的应用'
keywords: ['ClickHouse', 'MCP', 'copilotkit']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 CopilotKit 和 ClickHouse MCP Server 构建 AI 智能体

这是一个示例，演示如何使用存储在 ClickHouse 中的数据构建智能体应用。它使用 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 
从 ClickHouse 查询数据，并基于这些数据生成图表。

[CopilotKit](https://github.com/CopilotKit/CopilotKit) 用于构建 UI，
并为用户提供聊天界面。

:::note 示例代码
此示例的代码可以在 [examples 仓库](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit) 中找到。
:::



## 前提条件 {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`



## 安装依赖 {#install-dependencies}

在本地克隆项目：`git clone https://github.com/ClickHouse/examples`，然后
进入 `ai/mcp/copilotkit` 目录。

可以跳过本节，直接运行脚本 `./install.sh` 来安装依赖。若要手动安装依赖，请按照下文说明进行操作。



## 手动安装依赖

1. 安装依赖：

运行 `npm install` 安装 Node.js 依赖。

2. 安装 mcp-clickhouse：

创建一个新的文件夹 `external`，并将 mcp-clickhouse 仓库克隆到该文件夹中。

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

将 `env.example` 文件复制到 `.env`，并在其中填入您的 `ANTHROPIC_API_KEY`。



## 使用你自己的 LLM {#use-your-own-llm}

如果你希望使用 Anthropic 以外的其他 LLM 提供商，可以修改
Copilotkit 运行时以使用不同的 LLM 适配器。
受支持的提供商列表见[这里](https://docs.copilotkit.ai/guides/bring-your-own-llm)。



## 使用您自己的 ClickHouse 集群 {#use-your-own-clickhouse-cluster}

默认情况下，本示例默认配置为连接到
[ClickHouse 演示集群](https://sql.clickhouse.com/)。您也可以通过设置以下环境变量来使用您自己的 ClickHouse 集群：

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`



# 运行应用 {#run-the-application}

运行 `npm run dev` 来启动开发服务器。

你可以使用如下提示词来测试 Agent： 

> "Show me the price evolution in 
Manchester for the last 10 years."

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。