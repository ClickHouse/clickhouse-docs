---
slug: /use-cases/AI/MCP/ai-agent-libraries/streamlit-agent
sidebar_label: 'Integrate Streamlit'
title: 'How to build a ClickHouse-backed AI Agent with Streamlit'
pagination_prev: null
pagination_next: null
description: 'Learn how to build a web-based AI Agent with Streamlit and the ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Streamlit', 'Agno', 'AI Agent']
show_related_blogs: true
doc_type: how-to
---

# How to build a ClickHouse-backed AI Agent with Streamlit

In this guide you'll learn how to build a web-based AI agent using [Streamlit](https://streamlit.io/) that can interact with [ClickHouse's SQL playground](https://sql.clickhouse.com/) using [ClickHouse's MCP Server](https://github.com/ClickHouse/mcp-clickhouse) and [Agno](https://github.com/agno-agi/agno).

:::note Example application
This example creates a full web application that provides a chat interface for querying ClickHouse data.
You can find the source code for this example in the [examples repository](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit).
:::

## Prerequisites {#prerequisites}
- You'll need to have Python installed on your system.
  You'll need to have [`uv`](https://docs.astral.sh/uv/getting-started/installation/) installed
- You'll need an Anthropic API key, or API key from another LLM provider

You can run the following steps to create your Streamlit application.

<VerticalStepper headerLevel="h2">

## Install libraries {#install-libraries}

Install the required libraries by running the following commands:

```bash
pip install streamlit agno ipywidgets
```

## Create utilities file {#create-utilities}

Create a `utils.py` file with two utility functions. The first is an
asynchronous function generator for handling stream responses from the 
Agno agent. The second is a function for applying styles to the Streamlit
application:

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

## Setup credentials {#setup-credentials}

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="your_api_key_here"
```

:::note Using another LLM provider
If you don't have an Anthropic API key, and want to use another LLM provider,
you can find the instructions for setting up your credentials in the [Agno "Integrations" docs](https://docs.agentops.ai/v2/integrations/ag2)
:::

## Import required libraries {#import-libraries}

Start by creating your main Streamlit application file (e.g., `app.py`) and add the imports:

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

## Define the agent streaming function {#define-agent-function}

Add the main agent function that connects to [ClickHouse's SQL playground](https://sql.clickhouse.com/) and streams responses:

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
                    You are a ClickHouse assistant. Help users query and understand data using ClickHouse.
                    - Run SQL queries using the ClickHouse MCP tool
                    - Present results in markdown tables when relevant
                    - Keep output concise, useful, and well-formatted
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

## Add synchronous wrapper functions {#add-wrapper-functions}

Add helper functions to handle async streaming in Streamlit:

```python
def run_agent_query_sync(message):
    queue = Queue()
    def run():
        asyncio.run(_agent_stream_to_queue(message, queue))
        queue.put(None)  # Sentinel to end stream
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

## Create the Streamlit interface {#create-interface}

Add the Streamlit UI components and chat functionality:

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

## Run the application {#run-application}

To start your ClickHouse AI agent web application you can run the
following command from your terminal:

```bash
uv run \
  --with streamlit \
  --with agno \
  --with anthropic \
  --with mcp \
  streamlit run app.py --server.headless true
```

This will open your web browser and navigate to `http://localhost:8501` where you
can interact with your AI agent and ask it questions about the example datasets
available in ClickHouse's SQL playground.

</VerticalStepper>