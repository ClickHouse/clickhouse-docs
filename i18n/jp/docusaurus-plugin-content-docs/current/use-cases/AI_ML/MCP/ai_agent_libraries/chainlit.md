---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Chainlit を連携する'
title: 'Chainlit と ClickHouse MCP Server を使って AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'Chainlit と ClickHouse MCP Server を組み合わせて、LLM ベースのチャットアプリを構築する方法について学びます'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---

# Chainlit と ClickHouse MCP Server を使って AI エージェントを構築する方法 {#how-to-build-an-ai-agent-with-chainlit-and-the-clickhouse-mcp-server}

このガイドでは、強力なチャットインターフェース用フレームワークである Chainlit と
ClickHouse Model Context Protocol (MCP) Server を組み合わせて、対話型のデータ
アプリケーションを構築する方法を解説します。Chainlit を使用すると、最小限のコードで
AI アプリケーション向けの会話型インターフェースを構築でき、ClickHouse MCP Server により、
高性能なカラム型データベースである ClickHouse とのシームレスな統合が可能になります。

## 前提条件 {#prerequisites}
- Anthropic API キーが必要です
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/) がインストールされている必要があります

## 基本的な Chainlit アプリ {#basic-chainlit-app}

次を実行すると、基本的なチャットアプリの例を確認できます。

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

次に、`http://localhost:8000` にアクセスします

## ClickHouse MCP Server を追加する {#adding-clickhouse-mcp-server}

ClickHouse MCP Server を追加すると、さらに面白くなります。
`uv` コマンドを使用できるようにするには、`.chainlit/config.toml` ファイルを更新する必要があります。

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
完全な `config.toml` ファイルは [examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)で確認できます。
:::

Chainlit で MCP サーバーを動作させるためのグルーコードがいくつかあるため、代わりに次のコマンドを実行して Chainlit を起動します。

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

MCP サーバーを追加するには、チャットインターフェース内のプラグアイコンをクリックし、
ClickHouse SQL Playground に接続して使用するために、次のコマンドを追加します。

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

独自の ClickHouse インスタンスを利用する場合は、
環境変数の値を変更してください。

その後、次のような質問を行うことができます。

* クエリ可能なテーブルについて教えてください
* ニューヨークのタクシーについて何かおもしろいことを教えてください
