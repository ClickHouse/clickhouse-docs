---
slug: /use-cases/AI/MCP/ai-agent-libraries/claude-agent-sdk
sidebar_label: '集成 Claude Agent SDK'
title: '如何使用 Claude Agent SDK 和 ClickHouse MCP Server 构建 AI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何使用 Claude Agent SDK 和 ClickHouse MCP Server 构建 AI Agent'
keywords: ['ClickHouse', 'MCP', 'Claude']
show_related_blogs: true
doc_type: 'guide'
---

# 如何使用 Claude Agent SDK 和 ClickHouse MCP Server 构建 AI Agent \{#how-to-build-an-ai-agent-with-claude-agent-sdk-and-the-clickhouse-mcp-server\}

在本指南中，您将学习如何使用 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse)，构建一个可以与 [ClickHouse 的 SQL Playground](https://sql.clickhouse.com/) 交互的 [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) AI Agent。

:::note 示例笔记本
该示例可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/claude-agent/claude-agent.ipynb) 中找到对应的笔记本。
:::

## 前提条件 \{#prerequisites\}

* 您需要在系统上安装 Python。
* 您需要在系统上安装 `pip`。
* 您需要一个 Anthropic API 密钥。

您可以在 Python REPL 中或通过脚本来执行以下步骤。

<VerticalStepper headerLevel="h2">
  ## 安装库 \{#install-libraries\}

  运行以下命令安装 Claude Agent SDK 库：

  ```python
  pip install -q --upgrade pip
  pip install -q claude-agent-sdk
  pip install -q ipywidgets
  ```

  ## 设置凭据 \{#setup-credentials\}

  接下来，您需要提供 Anthropic API 密钥：

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Enter Anthropic API Key: ········
  ```

  接下来，定义用于连接 ClickHouse SQL Playground 所需的凭据：

  ```python
  env = {
      "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
      "CLICKHOUSE_PORT": "8443",
      "CLICKHOUSE_USER": "demo",
      "CLICKHOUSE_PASSWORD": "",
      "CLICKHOUSE_SECURE": "true"
  }
  ```

  ## 初始化 MCP 服务器和 Claude Agent SDK 代理 \{#initialize-mcp-and-agent\}

  现在将 ClickHouse MCP 服务器配置为指向 ClickHouse SQL playground，然后初始化我们的代理并向它提出一个问题：

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

  请注意，`for` 块中的代码会对输出进行过滤，以保持简洁。

  ```response title="Response"
  🤖 I'll query the ClickHouse database to find something interesting about UK property sales.

  Let me first see what databases are available:
  🛠️ mcp__mcp-clickhouse__list_databases {}
  🤖 Great! There's a "uk" database. Let me see what tables are available:
  🛠️ mcp__mcp-clickhouse__list_tables {'database': 'uk'}
  🤖 Perfect! The `uk_price_paid` table has over 30 million property sales records. Let me find something interesting:
  🛠️ mcp__mcp-clickhouse__run_select_query {'query': "\nSELECT \n    street,\n    town,\n    max(price) as max_price,\n    min(price) as min_price,\n    max(price) - min(price) as price_difference,\n    count() as sales_count\nFROM uk.uk_price_paid\nWHERE street != ''\nGROUP BY street, town\nHAVING sales_count > 100\nORDER BY price_difference DESC\nLIMIT 1\n"}
  🤖 Here's something fascinating: **Baker Street in London** (yes, the famous Sherlock Holmes street!) has the largest price range of any street with over 100 sales - properties sold for as low as **£2,500** and as high as **£594.3 million**, a staggering difference of over £594 million!

  This makes sense given Baker Street is one of London's most prestigious addresses, running through wealthy areas like Marylebone, and has had 541 recorded sales in this dataset.
  ```
</VerticalStepper>
