---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Chainlit を統合する'
title: 'Chainlit と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Chainlit と ClickHouse MCP Server を組み合わせて、LLM ベースのチャットアプリケーションを構築する方法を学びます'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---



# Chainlit と ClickHouse MCP Server を使って AI エージェントを構築する方法

このガイドでは、Chainlit の強力なチャットインターフェイスフレームワークと
ClickHouse Model Context Protocol (MCP) Server を組み合わせて、対話型のデータ
アプリケーションを作成する方法を解説します。Chainlit を使用すると、最小限のコードで
AI アプリケーション向けの会話型インターフェイスを構築でき、ClickHouse MCP Server は
高性能な列指向データベースである ClickHouse とのシームレスな統合を提供します。



## 前提条件 {#prerequisites}

- Anthropic APIキーが必要です
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)をインストールしておく必要があります


## 基本的なChainlitアプリ {#basic-chainlit-app}

以下のコマンドを実行すると、基本的なチャットアプリの例を確認できます:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

その後、`http://localhost:8000` にアクセスしてください


## ClickHouse MCP Serverの追加 {#adding-clickhouse-mcp-server}

ClickHouse MCP Serverを追加すると、さらに興味深い機能が利用できるようになります。
`uv`コマンドを使用できるようにするため、`.chainlit/config.toml`ファイルを更新する必要があります:

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
完全な`config.toml`ファイルは[examplesリポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)で確認できます
:::

MCP ServerをChainlitと連携させるための接続コードがあるため、Chainlitを起動するには次のコマンドを実行する必要があります:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

MCP Serverを追加するには、チャットインターフェースのプラグアイコンをクリックし、ClickHouse SQL Playgroundに接続するために次のコマンドを追加します:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

独自のClickHouseインスタンスを使用する場合は、環境変数の値を調整できます。

その後、次のような質問をすることができます:

- クエリ可能なテーブルについて教えてください
- ニューヨークのタクシーについて興味深いことは何ですか?
