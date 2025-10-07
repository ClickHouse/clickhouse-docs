---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/chainlit'
'sidebar_label': 'Chainlitを統合する'
'title': 'ChainlitとClickHouse MCPサーバーを使ってAIエージェントを構築する方法'
'pagination_prev': null
'pagination_next': null
'description': 'Chainlitを使用して、ClickHouse MCPサーバーと共にLLMベースのチャットアプリを構築する方法を学びましょう'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Chainlit'
'show_related_blogs': true
'doc_type': 'guide'
---


# ChainlitとClickHouse MCPサーバーを使用してAIエージェントを構築する方法

このガイドでは、Chainlitの強力なチャットインターフェースフレームワークとClickHouse Model Context Protocol (MCP) サーバーを組み合わせて、インタラクティブなデータアプリケーションを作成する方法を探ります。Chainlitは、最小限のコードでAIアプリケーションの会話インターフェースを構築できる一方、ClickHouse MCPサーバーはClickHouseの高性能な列指向データベースとシームレスに統合します。

## 前提条件 {#prerequisites}
- Anthropic APIキーが必要です
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)をインストールしておく必要があります

## 基本的なChainlitアプリ {#basic-chainlit-app}

以下のコマンドを実行することで、基本的なチャットアプリの例を確認できます：

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

次に、`http://localhost:8000`に移動します。

## ClickHouse MCPサーバーの追加 {#adding-clickhouse-mcp-server}

ClickHouse MCPサーバーを追加すると、さらに面白くなります。
`uv`コマンドを使用できるようにするために、`.chainlit/config.toml`ファイルを更新する必要があります：

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
完全な`config.toml`ファイルは[examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)で見つけることができます。
:::

ChainlitでMCPサーバーを動作させるためのグルーコードがあるため、Chainlitを起動するためにこのコマンドを実行する必要があります：

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

MCPサーバーを追加するには、チャットインターフェースのプラグアイコンをクリックし、次にClickHouse SQL Playgroundを使用して接続するための次のコマンドを追加します：

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

独自のClickHouseインスタンスを使用する場合は、環境変数の値を調整できます。

次のように質問をしてみることができます：

* クエリするテーブルについて教えてください
* ニューヨークのタクシーについての興味深いことは何ですか？
