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
pip install -q "pydantic-ai-slim[anthropic]" # replace with the appropriate package if using a different LLM provider
```

## 设置凭据 {#setup-credentials}

接下来，您需要提供 Anthropic API 密钥：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
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
    result = await agent.run("Who's done the most PRs for ClickHouse?")
    print(result.output)
```

你会得到类似下面的响应：

```response title="Response"
Based on the data from the ClickHouse GitHub repository, here are the top contributors by number of pull requests created:

**Top contributors to ClickHouse by PRs opened:**

1. **alexey-milovidov** - 3,370 PRs opened
2. **azat** - 1,905 PRs opened  
3. **rschu1ze** - 979 PRs opened
4. **alesapin** - 947 PRs opened
5. **tavplubix** - 896 PRs opened
6. **kssenii** - 871 PRs opened
7. **Avogar** - 805 PRs opened
8. **KochetovNicolai** - 700 PRs opened
9. **Algunenano** - 658 PRs opened
10. **kitaisreal** - 630 PRs opened

**Alexey Milovidov** stands out as by far the most active contributor with over 3,370 pull requests opened, which is significantly more than any other contributor. This makes sense as Alexey Milovidov is one of the founders and lead developers of ClickHouse.

The data also shows that alexey-milovidov has been very active in managing PRs, with 12,818 "closed" events (likely reviewing and closing PRs from other contributors) in addition to creating his own PRs.

It's worth noting that I filtered out various robot/bot accounts that handle automated processes, focusing on human contributors to give you the most meaningful answer about who has contributed the most PRs to ClickHouse.
```

</VerticalStepper>
