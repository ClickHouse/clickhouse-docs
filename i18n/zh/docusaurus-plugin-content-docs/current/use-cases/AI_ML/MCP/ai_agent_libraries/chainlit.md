---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/chainlit'
'sidebar_label': '集成 Chainlit'
'title': '如何使用 Chainlit 和 ClickHouse MCP 服务器构建 AI 代理'
'pagination_prev': null
'pagination_next': null
'description': '学习如何使用 Chainlit 与 ClickHouse MCP 服务器一起构建基于 LLM 的聊天应用'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Chainlit'
'show_related_blogs': true
'doc_type': 'guide'
---


# 如何使用 Chainlit 和 ClickHouse MCP 服务器构建 AI 代理

本指南探讨如何将 Chainlit 强大的聊天界面框架与 ClickHouse 模型上下文协议 (MCP) 服务器相结合，以创建交互式数据应用程序。Chainlit 使您能够以最少的代码构建 AI 应用程序的对话接口，而 ClickHouse MCP 服务器则提供与 ClickHouse 高性能列式数据库的无缝集成。

## 前提条件 {#prerequisites}
- 您需要一个 Anthropic API 密钥
- 您需要安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)

## 基本 Chainlit 应用 {#basic-chainlit-app}

您可以通过运行以下代码查看基本聊天应用的示例：

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

然后导航到 `http://localhost:8000`

## 添加 ClickHouse MCP 服务器 {#adding-clickhouse-mcp-server}

如果我们添加 ClickHouse MCP 服务器，事情会变得更加有趣。
您需要更新 `.chainlit/config.toml` 文件，以允许使用 `uv` 命令：

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
在 [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml) 中找到完整的 `config.toml` 文件
:::

有一些粘合代码可以使 MCP 服务器与 Chainlit 一起运行，因此我们需要运行以下命令来启动 Chainlit：

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

要添加 MCP 服务器，请单击聊天界面中的插件图标，然后添加以下命令以连接使用 ClickHouse SQL Playground：

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

如果您想使用自己的 ClickHouse 实例，可以调整环境变量的值。

然后您可以像这样向它提问：

* 告诉我您可以查询的表
* 关于纽约出租车的有趣事情是什么？
