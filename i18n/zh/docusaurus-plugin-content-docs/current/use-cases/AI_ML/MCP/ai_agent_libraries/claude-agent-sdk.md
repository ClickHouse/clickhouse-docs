---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: '集成 Claude Agent SDK'
title: '如何使用 Claude Agent SDK 和 ClickHouse MCP Server 构建 AI 智能体'
pagination_prev: null
pagination_next: null
description: '学习如何使用 Claude Agent SDK 和 ClickHouse MCP Server 构建 AI 智能体'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Claude Agent SDK 和 ClickHouse MCP Server 构建 AI 智能体

在本指南中,您将学习如何构建一个 [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) AI 智能体,该智能体可以使用 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse SQL 演练场](https://sql.clickhouse.com/)进行交互。

:::note 示例笔记本
此示例可在 [examples 代码仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb)中以笔记本形式找到。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 Anthropic API 密钥。

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装依赖库 {#install-libraries}

运行以下命令安装 Claude Agent SDK 库：

```python
pip install -q --upgrade pip
pip install -q claude-agent-sdk
pip install -q ipywidgets
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

接下来，定义连接到 ClickHouse SQL 演练环境所需的凭据：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## 初始化 MCP Server 和 Claude Agent SDK 代理 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP Server 指向 ClickHouse SQL playground，
并初始化我们的代理向其提问：

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, UserMessage, TextBlock, ToolUseBlock
```

```python
options = ClaudeAgentOptions(
    allowed_tools=[
        "mcp__mcp-clickhouse__list_databases",
        "mcp__mcp-clickhouse__list_tables",
        "mcp__mcp-clickhouse__run_select_query",
        "mcp__mcp-clickhouse__run_chdb_select_query"
    ],
    mcp_servers={
        "mcp-clickhouse": {
            "command": "uv",
            "args": [
                "run",
                "--with", "mcp-clickhouse",
                "--python", "3.10",
                "mcp-clickhouse"
            ],
            "env": env
        }
    }
)


async for message in query(prompt="Tell me something interesting about UK property sales", options=options):
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(f"🤖 {block.text}")
            if isinstance(block, ToolUseBlock):
                print(f"🛠️ {block.name} {block.input}")
    elif isinstance(message, UserMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
```

注意 `for` 块内的代码为简洁起见对输出进行了过滤。

```response title="响应"
🤖 我将查询 ClickHouse 数据库以查找关于英国房产销售的有趣信息。

让我先看看有哪些可用的数据库：
🛠️ mcp__mcp-clickhouse__list_databases {}
🤖 太好了！有一个 "uk" 数据库。让我看看有哪些可用的表：
🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
🤖 完美！`uk_price_paid` 表包含超过 3000 万条房产销售记录。让我找一些有趣的信息：
🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
🤖 这里有一个令人着迷的发现：**伦敦的 Baker Street**（是的,就是著名的福尔摩斯街！）在所有销售记录超过 100 次的街道中拥有最大的价格区间——房产售价最低为 **£2,500**，最高达 **£5.943 亿**，惊人的差价超过 £5.94 亿！

这是合理的，因为 Baker Street 是伦敦最负盛名的地址之一，穿过 Marylebone 等富裕地区，在此数据集中有 541 条销售记录。
```

</VerticalStepper>
