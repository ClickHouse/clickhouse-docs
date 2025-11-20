---
slug: /use-cases/AI/MCP/ai-agent-libraries/streamlit-agent
sidebar_label: '集成 Streamlit'
title: '如何使用 Streamlit 构建基于 ClickHouse 的 AI Agent'
pagination_prev: null
pagination_next: null
description: '学习如何使用 Streamlit 和 ClickHouse MCP Server 构建基于 Web 的 AI Agent'
keywords: ['ClickHouse', 'MCP', 'Streamlit', 'Agno', 'AI Agent']
show_related_blogs: true
doc_type: 'guide'
---



# 如何使用 Streamlit 构建基于 ClickHouse 的 AI Agent

在本指南中，你将学习如何使用 [Streamlit](https://streamlit.io/) 构建一个基于 Web 的 AI agent，使其能够借助 [ClickHouse 的 MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 和 [Agno](https://github.com/agno-agi/agno) 与 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/) 进行交互。

:::note 示例应用
此示例会创建一个完整的 Web 应用，提供用于查询 ClickHouse 数据的聊天界面。
你可以在 [examples 仓库](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit) 中找到该示例的源代码。
:::



## 前置条件 {#prerequisites}

- 您需要在系统上安装 Python。
  您需要安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- 您需要 Anthropic API 密钥,或其他 LLM 提供商的 API 密钥

您可以按照以下步骤创建 Streamlit 应用程序。

<VerticalStepper headerLevel="h2">


## 安装依赖库 {#install-libraries}

通过运行以下命令安装所需的依赖库：

```bash
pip install streamlit agno ipywidgets
```


## 创建工具文件 {#create-utilities}

创建一个 `utils.py` 文件,包含两个工具函数。第一个是异步生成器函数,用于处理来自 Agno 代理的流式响应。第二个函数用于为 Streamlit 应用程序应用样式:

```python title="utils.py"
import streamlit as st
from agno.run.response import RunEvent, RunResponse

async def as_stream(response):
    async for chunk in response:
        if isinstance(chunk, RunResponse) and isinstance(chunk.content, str):
            if chunk.event == RunEvent.run_response:
                yield chunk.content

def apply_styles():
    st.markdown("""
  <style>
  hr.divider {
  background-color: white;
  margin: 0;
  }
  </style>
  <hr class='divider' />""", unsafe_allow_html=True)
```


## 设置凭据 {#setup-credentials}

将您的 Anthropic API 密钥设置为环境变量:

```bash
export ANTHROPIC_API_KEY="your_api_key_here"
```

:::note 使用其他 LLM 提供商
如果您没有 Anthropic API 密钥,且希望使用其他 LLM 提供商,
可以在 [Agno "Integrations" 文档](https://docs.agentops.ai/v2/integrations/ag2)中查看设置凭据的相关说明
:::


## 导入所需库 {#import-libraries}

首先创建主 Streamlit 应用程序文件(例如 `app.py`)并添加导入语句:

```python
from utils import apply_styles

import streamlit as st
from textwrap import dedent

from agno.models.anthropic import Claude
from agno.agent import Agent
from agno.tools.mcp import MCPTools
from agno.storage.json import JsonStorage
from agno.run.response import RunEvent, RunResponse
from mcp.client.stdio import stdio_client, StdioServerParameters

from mcp import ClientSession

import asyncio
import threading
from queue import Queue
```


## 定义代理流式函数 {#define-agent-function}

添加主代理函数,用于连接到 [ClickHouse SQL 演练场](https://sql.clickhouse.com/) 并流式传输响应:

```python
async def stream_clickhouse_agent(message):
    env = {
            "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
            "CLICKHOUSE_PORT": "8443",
            "CLICKHOUSE_USER": "demo",
            "CLICKHOUSE_PASSWORD": "",
            "CLICKHOUSE_SECURE": "true"
        }

    server_params = StdioServerParameters(
        command="uv",
        args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
        ],
        env=env
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            mcp_tools = MCPTools(timeout_seconds=60, session=session)
            await mcp_tools.initialize()
            agent = Agent(
                model=Claude(id="claude-3-5-sonnet-20240620"),
                tools=[mcp_tools],
                instructions=dedent("""\
                    你是 ClickHouse 助手。帮助用户使用 ClickHouse 查询和理解数据。
                    - 使用 ClickHouse MCP 工具运行 SQL 查询
                    - 在适当时以 Markdown 表格形式呈现结果
                    - 保持输出简洁、实用且格式规范
                """),
                markdown=True,
                show_tool_calls=True,
                storage=JsonStorage(dir_path="tmp/team_sessions_json"),
                add_datetime_to_instructions=True,
                add_history_to_messages=True,
            )
            chunks = await agent.arun(message, stream=True)
            async for chunk in chunks:
                if isinstance(chunk, RunResponse) and chunk.event == RunEvent.run_response:
                    yield chunk.content
```


## 添加同步包装函数 {#add-wrapper-functions}

添加辅助函数以在 Streamlit 中处理异步流:

```python
def run_agent_query_sync(message):
    queue = Queue()
    def run():
        asyncio.run(_agent_stream_to_queue(message, queue))
        queue.put(None)  # 结束流的标记值
    threading.Thread(target=run, daemon=True).start()
    while True:
        chunk = queue.get()
        if chunk is None:
            break
        yield chunk

async def _agent_stream_to_queue(message, queue):
    async for chunk in stream_clickhouse_agent(message):
        queue.put(chunk)
```


## 创建 Streamlit 界面 {#create-interface}

添加 Streamlit UI 组件和聊天功能：

```python
st.title("A ClickHouse-backed AI agent")

if st.button("💬 New Chat"):
  st.session_state.messages = []
  st.rerun()

apply_styles()

if "messages" not in st.session_state:
  st.session_state.messages = []

for message in st.session_state.messages:
  with st.chat_message(message["role"]):
    st.markdown(message["content"])

if prompt := st.chat_input("What is up?"):
  st.session_state.messages.append({"role": "user", "content": prompt})
  with st.chat_message("user"):
    st.markdown(prompt)
  with st.chat_message("assistant"):
    response = st.write_stream(run_agent_query_sync(prompt))
  st.session_state.messages.append({"role": "assistant", "content": response})
```


## 运行应用程序 {#run-application}

要启动 ClickHouse AI 代理 Web 应用程序,请在终端中运行以下命令:

```bash
uv run \
  --with streamlit \
  --with agno \
  --with anthropic \
  --with mcp \
  streamlit run app.py --server.headless true
```

这将打开 Web 浏览器并导航到 `http://localhost:8501`,您可以在此与 AI 代理交互,并询问有关 ClickHouse SQL playground 中可用示例数据集的问题。

</VerticalStepper>
