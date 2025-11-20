---
slug: /use-cases/AI/MCP/ai-agent-libraries/copilotkit
sidebar_label: 'CopilotKit を統合する'
title: 'CopilotKit と ClickHouse MCP Server で AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP と CopilotKit を使用し、ClickHouse に保存されたデータを活用するエージェント型アプリケーションの構築方法を学びます'
keywords: ['ClickHouse', 'MCP', 'copilotkit']
show_related_blogs: true
doc_type: 'guide'
---



# CopilotKit と ClickHouse MCP Server を使って AI エージェントを構築する方法

これは、ClickHouse に保存されたデータを使ってエージェント型アプリケーションを構築する方法を示す例です。[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使って ClickHouse からデータをクエリし、そのデータに基づいてチャートを生成します。

[CopilotKit](https://github.com/CopilotKit/CopilotKit) は、UI の構築とユーザー向けチャットインターフェイスの提供に使用します。

:::note Example code
このサンプルのコードは [examples リポジトリ](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit) で確認できます。
:::



## 前提条件 {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`


## 依存関係のインストール {#install-dependencies}

プロジェクトをローカルにクローンします：`git clone https://github.com/ClickHouse/examples` を実行し、`ai/mcp/copilotkit` ディレクトリに移動してください。

このセクションをスキップして `./install.sh` スクリプトを実行すれば、依存関係をインストールできます。依存関係を手動でインストールする場合は、以下の手順に従ってください。


## 依存関係を手動でインストールする {#install-dependencies-manually}

1. 依存関係のインストール:

`npm install` を実行してNode.jsの依存関係をインストールします。

2. mcp-clickhouseのインストール:

新しいフォルダ `external` を作成し、その中にmcp-clickhouseリポジトリをクローンします。

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Pythonの依存関係をインストールし、fastmcp CLIツールを追加します。

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```


## アプリケーションの設定 {#configure-the-application}

`env.example` ファイルを `.env` にコピーし、`ANTHROPIC_API_KEY` を指定するために編集してください。


## 独自のLLMを使用する {#use-your-own-llm}

Anthropic以外のLLMプロバイダーを使用する場合は、Copilotkitランタイムを変更して別のLLMアダプターを使用できます。サポートされているプロバイダーの一覧は[こちら](https://docs.copilotkit.ai/guides/bring-your-own-llm)をご覧ください。


## 独自のClickHouseクラスタを使用する {#use-your-own-clickhouse-cluster}

デフォルトでは、このサンプルは[ClickHouseデモクラスタ](https://sql.clickhouse.com/)に接続するように設定されています。以下の環境変数を設定することで、独自のClickHouseクラスタを使用することもできます：

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`


# アプリケーションの実行 {#run-the-application}

開発サーバーを起動するには、`npm run dev` を実行します。

次のようなプロンプトでエージェントをテストできます:

> "過去10年間のマンチェスターの価格推移を表示してください。"

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。
