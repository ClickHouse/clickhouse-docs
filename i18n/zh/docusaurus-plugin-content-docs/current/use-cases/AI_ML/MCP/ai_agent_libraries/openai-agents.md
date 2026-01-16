---
slug: /use-cases/AI/MCP/ai-agent-libraries/openai-agents
sidebar_label: '集成 OpenAI'
title: '如何使用 ClickHouse MCP Server 构建 OpenAI 智能体'
pagination_prev: null
pagination_next: null
description: '了解如何构建一个可以与 ClickHouse MCP Server 交互的 OpenAI 智能体。'
keywords: ['ClickHouse', 'MCP', 'OpenAI']
show_related_blogs: true
doc_type: 'guide'
---

# 如何使用 ClickHouse MCP Server 构建 OpenAI Agent \\{#how-to-build-an-openai-agent-using-clickhouse-mcp-server\\}

在本指南中，你将学习如何构建一个 [OpenAI](https://github.com/openai/openai-agents-python) agent，使其可以通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 交互。

:::note 示例笔记本
该示例可以在 [示例仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb) 中找到对应的笔记本。
:::

## 前置条件 \\{#prerequisites\\}

- 系统需已安装 Python。
- 系统需已安装 `pip`。
- 需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本执行以下步骤。

<VerticalStepper headerLevel="h2">

## 安装库 \\{#install-libraries\\}

运行以下命令安装所需库：

```python
pip install -q --upgrade pip
pip install -q openai-agents
```

## 设置凭据 \\{#setup-credentials\\}

接下来，您需要提供 OpenAI API 密钥：

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

## 初始化 MCP Server 和 OpenAI 代理 \\{#initialize-mcp-and-agent\\}

现在将 ClickHouse MCP Server 配置为连接到 ClickHouse SQL playground，
初始化你的 OpenAI 代理并向它提问：

```python
from agents.mcp import MCPServer, MCPServerStdio
from agents import Agent, Runner, trace
import json

def simple_render_chunk(chunk):
    """Simple version that just filters important events"""

    # Tool calls
    if (hasattr(chunk, 'type') and
            chunk.type == 'run_item_stream_event'):

        if chunk.name == 'tool_called':
            tool_name = chunk.item.raw_item.name
            args = chunk.item.raw_item.arguments
            print(f"🔧 Tool: {tool_name}({args})")

        elif chunk.name == 'tool_output':
            try:
                # Handle both string and already-parsed output
                if isinstance(chunk.item.output, str):
                    output = json.loads(chunk.item.output)
                else:
                    output = chunk.item.output

                # Handle both dict and list formats
                if isinstance(output, dict):
                    if output.get('type') == 'text':
                        text = output['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                elif isinstance(output, list) and len(output) > 0:
                    # Handle list format
                    first_item = output[0]
                    if isinstance(first_item, dict) and first_item.get('type') == 'text':
                        text = first_item['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                else:
                    # Fallback - just print the raw output
                    print(f"✅ Result: {str(output)[:100]}...")

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                # Fallback to raw output if parsing fails
                print(f"✅ Result: {str(chunk.item.output)[:100]}...")

        elif chunk.name == 'message_output_created':
            try:
                content = chunk.item.raw_item.content
                if content and len(content) > 0:
                    print(f"💬 Response: {content[0].text}")
            except (AttributeError, IndexError):
                print(f"💬 Response: {str(chunk.item)[:100]}...")

    # Text deltas for streaming
    elif (hasattr(chunk, 'type') and
          chunk.type == 'raw_response_event' and
          hasattr(chunk, 'data') and
          hasattr(chunk.data, 'type') and
          chunk.data.type == 'response.output_text.delta'):
        print(chunk.data.delta, end='', flush=True)

async with MCPServerStdio(
        name="ClickHouse SQL Playground",
        params={
            "command": "uv",
            "args": [
                'run',
                '--with', 'mcp-clickhouse',
                '--python', '3.13',
                'mcp-clickhouse'
            ],
            "env": env
        }, client_session_timeout_seconds = 60
) as server:
    agent = Agent(
        name="Assistant",
        instructions="Use the tools to query ClickHouse and answer questions based on those files.",
        mcp_servers=[server],
    )

    message = "What's the biggest GitHub project so far in 2025?"
    print(f"\n\nRunning: {message}")
    with trace("Biggest project workflow"):
        result = Runner.run_streamed(starting_agent=agent, input=message, max_turns=20)
        async for chunk in result.stream_events():
            simple_render_chunk(chunk)
```

```response title="Response"
Running: What's the biggest GitHub project so far in 2025?
🔧 Tool: list_databases({})
✅ Result: amazon
bluesky
country
covid
default
dns
environmental
food
forex
geo
git
github
hackernews
imdb
log...
🔧 Tool: list_tables({"database":"github"})
✅ Result: {
  "database": "github",
  "name": "actors_per_repo",
  "comment": "",
  "columns": [
    {
      "...
🔧 Tool: run_select_query({"query":"SELECT repo_name, MAX(stars) FROM github.top_repos_mv"})
✅ Result: {
  "status": "error",
  "message": "Query failed: HTTPDriver for https://sql-clickhouse.clickhouse....
🔧 Tool: run_select_query({"query":"SELECT repo_name, stars FROM github.top_repos ORDER BY stars DESC LIMIT 1"})
✅ Result: {
  "repo_name": "sindresorhus/awesome",
  "stars": 402893
}...
The biggest GitHub project in 2025, based on stars, is "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)" with 402,893 stars.💬 Response: The biggest GitHub project in 2025, based on stars, is "[sindresorhus/awesome](https://github.com/sindresorhus/awesome)" with 402,893 stars.
```

</VerticalStepper>
