---
slug: /use-cases/AI/MCP/ai-agent-libraries/langchain
sidebar_label: 'LangChain を統合する'
title: 'ClickHouse MCP Server を使用して LangChain/LangGraph AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse の MCP Server を使用して、ClickHouse の SQL playground と対話できる LangChain/LangGraph AI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'LangChain', 'LangGraph']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP Server を使用して LangChain/LangGraph AI エージェントを構築する方法 {#how-to-build-a-langchainlanggraph-ai-agent-using-clickhouse-mcp-server}

このガイドでは、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できるようにするために、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を利用した [LangChain/LangGraph](https://github.com/langchain-ai/langgraph) AI エージェントの構築方法を学びます。

:::note Example notebook
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/langchain/langchain.ipynb) 内の notebook として利用できます。
:::

## 前提条件 {#prerequisites}

- システムに Python がインストールされている必要があります。
- システムに `pip` がインストールされている必要があります。
- Anthropic の API キー、または他の LLM プロバイダーの API キーのいずれかが必要です。

以下の手順は、Python REPL からでも、スクリプトとしてでも実行できます。

<VerticalStepper headerLevel="h2">
  ## ライブラリのインストール

  以下のコマンドを実行して、必要なライブラリをインストールします：

  ```python
  pip install -q --upgrade pip
  pip install -q langchain-mcp-adapters langgraph "langchain[anthropic]"
  ```

  ## 認証情報の設定

  次に、Anthropic APIキーを指定する必要があります:

  ```python
  import os, getpass
  os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
  ```

  ```response title="Response"
  Anthropic APIキーを入力: ········
  ```

  :::note 別のLLMプロバイダーを使用する場合
  Anthropic APIキーをお持ちでない場合や、別のLLMプロバイダーを使用したい場合は、
  [Langchain Providers docs](https://python.langchain.com/docs/integrations/providers/)で認証情報の設定手順を確認できます。
  :::

  ## MCPサーバーの初期化

  次に、ClickHouse MCP ServerをClickHouse SQLプレイグラウンドに接続するよう設定します:

  ```python
  from mcp import ClientSession, StdioServerParameters
  from mcp.client.stdio import stdio_client

  server_params = StdioServerParameters(
      command="uv",
      args=[
          "run",
          "--with", "mcp-clickhouse",
          "--python", "3.13",
          "mcp-clickhouse"
      ],
      env={
          "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
          "CLICKHOUSE_PORT": "8443",
          "CLICKHOUSE_USER": "demo",
          "CLICKHOUSE_PASSWORD": "",
          "CLICKHOUSE_SECURE": "true"
      }
  )
  ```

  ## ストリームハンドラーの設定

  LangchainとClickHouse MCP Serverを使用する際、クエリ結果は単一のレスポンスではなく、ストリーミングデータとして返されることが多くあります。大規模なデータセットや処理に時間を要する複雑な分析クエリに対しては、ストリームハンドラーの設定が重要です。適切に処理しない場合、このストリーミング出力をアプリケーション内で扱うことが困難になります。

  ストリーム出力のハンドラを設定して、利用しやすくします:

  ```python
  class UltraCleanStreamHandler:
      def __init__(self):
          self.buffer = ""
          self.in_text_generation = False
          self.last_was_tool = False
          
      def handle_chunk(self, chunk):
          event = chunk.get("event", "")
          
          if event == "on_chat_model_stream":
              data = chunk.get("data", {})
              chunk_data = data.get("chunk", {})
              
              # Only handle actual text content, skip tool invocation streams
              if hasattr(chunk_data, 'content'):
                  content = chunk_data.content
                  if isinstance(content, str) and not content.startswith('{"'):
                      # Add space after tool completion if needed
                      if self.last_was_tool:
                          print(" ", end="", flush=True)
                          self.last_was_tool = False
                      print(content, end="", flush=True)
                      self.in_text_generation = True
                  elif isinstance(content, list):
                      for item in content:
                          if (isinstance(item, dict) and 
                              item.get('type') == 'text' and 
                              'partial_json' not in str(item)):
                              text = item.get('text', '')
                              if text and not text.startswith('{"'):
                                  # Add space after tool completion if needed
                                  if self.last_was_tool:
                                      print(" ", end="", flush=True)
                                      self.last_was_tool = False
                                  print(text, end="", flush=True)
                                  self.in_text_generation = True
                                  
          elif event == "on_tool_start":
              if self.in_text_generation:
                  print(f"\n🔧 {chunk.get('name', 'tool')}", end="", flush=True)
                  self.in_text_generation = False
                  
          elif event == "on_tool_end":
              print(" ✅", end="", flush=True)
              self.last_was_tool = True
  ```

  ## エージェントを呼び出す

  最後に、エージェントを呼び出して、ClickHouseに最も多くのコードをコミットした人物を問い合わせます:

  ```python
  async with stdio_client(server_params) as (read, write):
      async with ClientSession(read, write) as session:
          await session.initialize()
          tools = await load_mcp_tools(session)
          agent = create_react_agent("anthropic:claude-sonnet-4-0", tools)
          
          handler = UltraCleanStreamHandler()        
          async for chunk in agent.astream_events(
              {"messages": [{"role": "user", "content": "ClickHouseに最も多くコードをコミットしたのは誰ですか？"}]}, 
              version="v1"
          ):
              handler.handle_chunk(chunk)
              
          print("\n")
  ```

  以下のような応答が表示されます：

  ```response title="Response"
  利用可能なデータベースとテーブルを調査してgitコミットデータを特定し、ClickHouseに最も多くのコードをコミットした人物を見つけます。
  🔧 list_databases ✅ gitコミット情報を含むと思われる`git`データベースが確認できました。このデータベース内のテーブルを調査します:
  🔧 list_tables ✅ 完璧です。gitデータベース内の`clickhouse_commits`テーブルに80,644件のClickHouseコミットデータが含まれていることが確認できました。このテーブルには、作成者、追加/削除された行数、変更されたファイルなど、各コミットに関する情報が格納されています。さまざまな指標に基づいて最も多くのコードをコミットした人物を特定するため、このテーブルにクエリを実行します。
  🔧 run_select_query ✅ 追加された行数のみを確認して、最も多くの新規コードを貢献した人物を特定します:
  🔧 run_select_query ✅ ClickHouseのgitコミットデータに基づくと、**Alexey Milovidov**が複数の指標においてClickHouseに最も多くのコードをコミットしています:

  ## 主要統計:

  1. **変更行数合計**: Alexey Milovidovが**1,696,929行を変更**(853,049行追加 + 843,880行削除)
  2. **追加行数**: Alexey Milovidovが**853,049行を追加**
  3. **コミット数**: Alexey Milovidovが**15,375コミット**
  4. **変更ファイル数**: Alexey Milovidovが**73,529ファイルを変更**

  ## 追加行数による上位貢献者:

  1. **Alexey Milovidov**: 853,049行追加(15,375コミット)
  2. **s-kat**: 541,609行追加(50コミット) 
  3. **Nikolai Kochetov**: 219,020行追加(4,218コミット)
  4. **alesapin**: 193,566行追加(4,783コミット)
  5. **Vitaly Baranov**: 168,807行追加(1,152コミット)

  Alexey Milovidovは明らかにClickHouseへの最も多産な貢献者であり、これはプロジェクトの創設者の一人であり主要開発者であることを考えれば当然です。彼の貢献は、総コード量とコミット数の両面で他を圧倒しており、約16,000コミットと850,000行以上のコードをプロジェクトに追加しています。
  ```
</VerticalStepper>