---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/copilotkit'
'sidebar_label': '集成 CopilotKit'
'title': '如何使用 CopilotKit 和 ClickHouse MCP 服务器构建 AI 代理'
'pagination_prev': null
'pagination_next': null
'description': '了解如何使用存储在 ClickHouse 中的数据以及 ClickHouse MCP 和 CopilotKit 构建代理应用程序'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'copilotkit'
'show_related_blogs': true
'doc_type': 'guide'
---


# 如何使用 CopilotKit 和 ClickHouse MCP 服务器构建 AI 代理

这是一个如何使用存储在 ClickHouse 中的数据构建代理应用的示例。它使用 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 从 ClickHouse 查询数据并根据数据生成图表。

[CopilotKit](https://github.com/CopilotKit/CopilotKit) 被用来构建用户界面并提供与用户的聊天接口。

:::note 示例代码
本示例的代码可以在 [examples repository](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit) 中找到。
:::

## 先决条件 {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`

## 安装依赖 {#install-dependencies}

在本地克隆项目：`git clone https://github.com/ClickHouse/examples` 并导航到 `ai/mcp/copilotkit` 目录。

跳过此部分并运行脚本 `./install.sh` 以安装依赖。如果您希望手动安装依赖，请按照以下说明进行。

## 手动安装依赖 {#install-dependencies-manually}

1. 安装依赖：

运行 `npm install` 来安装 Node 依赖。

2. 安装 mcp-clickhouse：

创建一个新文件夹 `external` 并将 mcp-clickhouse 仓库克隆到该目录中。

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

安装 Python 依赖并添加 fastmcp CLI 工具。

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```

## 配置应用程序 {#configure-the-application}

将 `env.example` 文件复制到 `.env` 并编辑以提供您的 `ANTHROPIC_API_KEY`。

## 使用您自己的 LLM {#use-your-own-llm}

如果您更愿意使用 Anthropic 以外的 LLM 提供者，您可以修改 Copilotkit 运行时以使用不同的 LLM 适配器。
[这里](https://docs.copilotkit.ai/guides/bring-your-own-llm) 是支持的提供者列表。

## 使用您自己的 ClickHouse 集群 {#use-your-own-clickhouse-cluster}

默认情况下，该示例配置为连接到 [ClickHouse 演示集群](https://sql.clickhouse.com/)。您也可以通过设置以下环境变量来使用您自己的 ClickHouse 集群：

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`


# 运行应用程序 {#run-the-application}

运行 `npm run dev` 启动开发服务器。

您可以使用如下提示来测试代理：

> “给我显示曼彻斯特最近 10 年的价格演变。”

打开 [http://localhost:3000](http://localhost:3000) 通过浏览器查看结果。
