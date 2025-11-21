---
slug: /use-cases/AI/MCP/ai-agent-libraries/openai-agents
sidebar_label: '集成 OpenAI'
title: '如何使用 ClickHouse MCP Server 构建 OpenAI Agent'
pagination_prev: null
pagination_next: null
description: '了解如何构建可与 ClickHouse MCP Server 交互的 OpenAI Agent。'
keywords: ['ClickHouse', 'MCP', 'OpenAI']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 ClickHouse MCP Server 构建 OpenAI Agent

在本指南中，你将学习如何构建一个 [OpenAI](https://github.com/openai/openai-agents-python) agent，使其能够通过 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例 Notebook
该示例可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/openai-agents/openai-agents.ipynb) 中以 Notebook 形式查看。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
- 您需要在系统上安装 `pip`。
- 您需要一个 OpenAI API 密钥

您可以通过 Python REPL 或脚本运行以下步骤。

<VerticalStepper headerLevel="h2">


## 安装库 {#install-libraries}

通过运行以下命令安装所需的库:

```python
pip install -q --upgrade pip
pip install -q openai-agents
```


## 设置凭据 {#setup-credentials}

接下来,您需要提供 OpenAI API 密钥:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```


## 初始化 MCP 服务器和 OpenAI 代理 {#initialize-mcp-and-agent}

现在配置 ClickHouse MCP 服务器指向 ClickHouse SQL 演练场,
初始化您的 OpenAI 代理并向其提问:

```python
from agents.mcp import MCPServer, MCPServerStdio
from agents import Agent, Runner, trace
import json

def simple_render_chunk(chunk):
    """仅过滤重要事件的简化版本"""

    # 工具调用
    if (hasattr(chunk, 'type') and
            chunk.type == 'run_item_stream_event'):

        if chunk.name == 'tool_called':
            tool_name = chunk.item.raw_item.name
            args = chunk.item.raw_item.arguments
            print(f"🔧 Tool: {tool_name}({args})")

        elif chunk.name == 'tool_output':
            try:
                # 处理字符串和已解析的输出
                if isinstance(chunk.item.output, str):
                    output = json.loads(chunk.item.output)
                else:
                    output = chunk.item.output

                # 处理字典和列表格式
                if isinstance(output, dict):
                    if output.get('type') == 'text':
                        text = output['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                elif isinstance(output, list) and len(output) > 0:
                    # 处理列表格式
                    first_item = output[0]
                    if isinstance(first_item, dict) and first_item.get('type') == 'text':
                        text = first_item['text']
                        if 'Error' in text:
                            print(f"❌ Error: {text}")
                        else:
                            print(f"✅ Result: {text[:100]}...")
                else:
                    # 回退 - 仅打印原始输出
                    print(f"✅ Result: {str(output)[:100]}...")

            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                # 如果解析失败则回退到原始输出
                print(f"✅ Result: {str(chunk.item.output)[:100]}...")

        elif chunk.name == 'message_output_created':
            try:
                content = chunk.item.raw_item.content
                if content and len(content) > 0:
                    print(f"💬 Response: {content[0].text}")
            except (AttributeError, IndexError):
                print(f"💬 Response: {str(chunk.item)[:100]}...")

    # 用于流式传输的文本增量
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
        instructions="使用工具查询 ClickHouse 并根据这些文件回答问题。",
        mcp_servers=[server],
    )

    message = "2025 年迄今为止最大的 GitHub 项目是什么?"
    print(f"\n\n正在运行: {message}")
    with trace("最大项目工作流"):
        result = Runner.run_streamed(starting_agent=agent, input=message, max_turns=20)
        async for chunk in result.stream_events():
            simple_render_chunk(chunk)
```


```response title="响应"
运行中：2025 年迄今为止最大的 GitHub 项目是什么？
🔧 工具：list_databases({})
✅ 结果：amazon
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
🔧 工具：list_tables({"database":"github"})
✅ 结果：{
  "database": "github",
  "name": "actors_per_repo",
  "comment": "",
  "columns": [
    {
      "...
🔧 工具：run_select_query({"query":"SELECT repo_name, MAX(stars) FROM github.top_repos_mv"})
✅ 结果：{
  "status": "error",
  "message": "Query failed: HTTPDriver for https://sql-clickhouse.clickhouse....
🔧 工具：run_select_query({"query":"SELECT repo_name, stars FROM github.top_repos ORDER BY stars DESC LIMIT 1"})
✅ 结果：{
  "repo_name": "sindresorhus/awesome",
  "stars": 402893
}...
基于星标数，2025 年最大的 GitHub 项目是"[sindresorhus/awesome](https://github.com/sindresorhus/awesome)"，拥有 402,893 个星标。💬 响应：基于星标数，2025 年最大的 GitHub 项目是"[sindresorhus/awesome](https://github.com/sindresorhus/awesome)"，拥有 402,893 个星标。
```

</VerticalStepper>
