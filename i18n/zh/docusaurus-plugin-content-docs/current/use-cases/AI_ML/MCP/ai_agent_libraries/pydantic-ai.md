---
slug: /use-cases/AI/MCP/ai-agent-libraries/pydantic-ai
sidebar_label: '集成 PydanticAI'
title: '如何使用 ClickHouse MCP 服务器构建 PydanticAI 代理'
pagination_prev: null
pagination_next: null
description: '了解如何构建一个可以与 ClickHouse MCP 服务器交互的 PydanticAI 代理。'
keywords: ['ClickHouse', 'MCP', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---

# 如何使用 ClickHouse MCP Server 构建 PydanticAI 代理 {#how-to-build-a-pydanticai-agent-using-clickhouse-mcp-server}

在本指南中，您将学习如何构建一个 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) 代理，
使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL 在线体验环境](https://sql.clickhouse.com/) 进行交互。

:::note 示例 notebook
该示例可以在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb) 中以 notebook 形式查阅。
:::

## 前提条件 {#prerequisites}

- 需要在系统上安装 Python。
- 需要在系统上安装 `pip`。
- 需要一个 Anthropic 的 API 密钥，或来自其他 LLM 提供商的 API 密钥。

可以在 Python REPL 中或通过脚本来执行以下步骤。

<VerticalStepper headerLevel="h2">

## 安装库 {#install-libraries}

通过运行以下命令来安装所需的库：

```python
pip install -q --upgrade pip
pip install -q "pydantic-ai-slim[mcp]"
pip install -q "pydantic-ai-slim[anthropic]" # 如果使用其他 LLM 提供商，请替换为对应的包
```

## 设置凭据 {#setup-credentials}

接下来，您需要提供 Anthropic API 密钥：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("请输入 Anthropic API 密钥：")
```

```response title="Response"
请输入 Anthropic API 密钥：········
```

:::note 使用其他 LLM 提供商
如果你没有 Anthropic API 密钥，并且想使用其他 LLM 提供商，
可以在 [PydanticAI 文档](https://ai.pydantic.dev/models/) 中找到配置凭据的说明
:::

接下来，定义连接到 ClickHouse SQL playground 演示环境所需的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## 初始化 MCP Server 和 PydanticAI 代理 {#initialize-mcp}

现在将 ClickHouse MCP Server 配置为连接到 ClickHouse SQL Playground：

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.messages import ToolCallPart, ToolReturnPart

server = MCPServerStdio(
    'uv',
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
agent = Agent('anthropic:claude-sonnet-4-0', mcp_servers=[server])
```

## 向智能体提问 {#ask-agent}

最后，你可以向智能体提出一个问题：

```python
async with agent.run_mcp_servers():
    result = await agent.run("谁为 ClickHouse 发起的 PR 最多？")
    print(result.output)
```

你会得到类似下面的响应：

```response title="响应"
基于 ClickHouse GitHub 仓库中的数据，以下是按创建拉取请求（pull request，简称 PR）数量统计的主要贡献者：

**按发起 PR 数量统计的 ClickHouse 主要贡献者：**

1. **alexey-milovidov** - 共发起 3,370 个 PR
2. **azat** - 共发起 1,905 个 PR
3. **rschu1ze** - 共发起 979 个 PR
4. **alesapin** - 共发起 947 个 PR
5. **tavplubix** - 共发起 896 个 PR
6. **kssenii** - 共发起 871 个 PR
7. **Avogar** - 共发起 805 个 PR
8. **KochetovNicolai** - 共发起 700 个 PR
9. **Algunenano** - 共发起 658 个 PR
10. **kitaisreal** - 共发起 630 个 PR

**Alexey Milovidov** 无疑是迄今为止最活跃的贡献者，他发起了超过 3,370 个拉取请求，远高于其他任何贡献者。这也很好理解，因为 Alexey Milovidov 是 ClickHouse 的创始人和核心开发者之一。

数据还显示，alexey-milovidov 在管理 PR 方面也非常活跃，除了创建自己的 PR 外，还记录了 12,818 次“关闭（closed）”事件（很可能是对其他贡献者的 PR 进行评审并关闭）。

需要说明的是，我过滤掉了负责自动化流程的机器人账户，只保留了人工贡献者的数据，以便为你提供关于谁为 ClickHouse 提交 PR 最多的更有参考价值的答案。
```

</VerticalStepper>
