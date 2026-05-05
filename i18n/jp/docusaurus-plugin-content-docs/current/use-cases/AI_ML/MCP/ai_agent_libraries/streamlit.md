---
slug: /use-cases/AI/MCP/ai-agent-libraries/streamlit-agent
sidebar_label: 'Streamlit と連携する'
title: 'Streamlit を使って ClickHouse をバックエンドにした AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Streamlit と ClickHouse MCPサーバーを使用して、Web ベースの AI エージェントを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'Streamlit', 'Agno', 'AI エージェント']
show_related_blogs: true
doc_type: 'guide'
---

# Streamlit を使って ClickHouse をバックエンドにした AI エージェントを構築する方法 \{#how-to-build-a-clickhouse-backed-ai-agent-with-streamlit\}

このガイドでは、[Streamlit](https://streamlit.io/) を使用して、[ClickHouse の SQL playground](https://sql.clickhouse.com/) に対して [ClickHouse MCPサーバー](https://github.com/ClickHouse/mcp-clickhouse) と [Agno](https://github.com/agno-agi/agno) を通じて対話できる、Web ベースの AI エージェントを構築する方法を説明します。

:::note サンプルアプリケーション
この例では、ClickHouse のデータにクエリを実行するためのチャットインターフェースを提供する、完成した Web アプリケーションを作成します。
このサンプルのソースコードは、[examples リポジトリ](https://github.com/ClickHouse/examples/tree/main/ai/mcp/streamlit)で確認できます。
:::

## 前提条件 \{#prerequisites\}

- システムにPythonがインストールされている必要があります。
  [`uv`](https://docs.astral.sh/uv/getting-started/installation/)がインストールされている必要があります
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキーが必要です

以下の手順でStreamlitアプリケーションを作成します。

<VerticalStepper headerLevel="h2">
  ## ライブラリをインストールする

  以下のコマンドを実行して、必要なライブラリをインストールします:

  ```bash
  pip install streamlit agno ipywidgets
  ```

  ## ユーティリティファイルを作成する

  2つのユーティリティ関数を含む `utils.py` ファイルを作成します。1つ目は、Agno エージェントからのストリームレスポンスを処理するための非同期関数ジェネレーターです。2つ目は、Streamlit アプリケーションにスタイルを適用するための関数です:

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

  ## 認証情報を設定する

  Anthropic API キーを環境変数として設定します:

  ```bash
  export ANTHROPIC_API_KEY="your_api_key_here"
  ```

  :::note 別の LLM プロバイダーを使用する場合
  Anthropic API キーをお持ちでなく、別の LLM プロバイダーを使用したい場合は、
  [Agno &quot;Integrations&quot; ドキュメント](https://docs.agentops.ai/v2/integrations/ag2)で認証情報の設定手順を確認できます。
  :::

  ## 必要なライブラリをインポートする

  まず、メインの Streamlit アプリケーションファイル(例: `app.py`)を作成し、インポートを追加します:

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

  ## エージェントのストリーミング関数を定義する

  [ClickHouse の SQL Playground](https://sql.clickhouse.com/) に接続し、レスポンスをストリーミングするメインのエージェント関数を追加します。

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

  ## 同期ラッパー関数を追加する

  Streamlit で非同期ストリーミングを処理するヘルパー関数を追加します:

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

  ## Streamlit インターフェースを作成する

  Streamlit の UI コンポーネントとチャット機能を追加します:

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

  ## アプリケーションを実行する

  ClickHouse AI エージェント Web アプリケーションを起動するには、ターミナルから次のコマンドを実行します。

  ```bash
  uv run \
    --with streamlit \
    --with agno \
    --with anthropic \
    --with mcp \
    streamlit run app.py --server.headless true
  ```

  これにより Web ブラウザが開き、`http://localhost:8501` に移動します。そこで AI エージェントと対話し、ClickHouse の SQL Playground で利用可能なサンプルデータセットについて質問できます。
</VerticalStepper>