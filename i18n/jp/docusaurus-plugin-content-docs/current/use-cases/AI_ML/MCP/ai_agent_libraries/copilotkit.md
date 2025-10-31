---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/copilotkit'
'sidebar_label': 'CopilotKitの統合'
'title': 'CopilotKitとClickHouse MCPサーバーを使用してAIエージェントを構築する方法'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouseに保存されたデータを使用して、ClickHouse MCPとCopilotKitを用いてエージェントアプリケーションを構築する方法を学びましょう。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'copilotkit'
'show_related_blogs': true
'doc_type': 'guide'
---


# CopilotKitとClickHouse MCPサーバーを使ったAIエージェントの構築方法

これは、ClickHouseに保存されたデータを使用してエージェントアプリケーションを構築する方法の例です。 
ClickHouseからデータをクエリし、そのデータに基づいてチャートを生成するために、 
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)を使用します。

[CopilotKit](https://github.com/CopilotKit/CopilotKit)は、UIを構築し、ユーザーにチャットインターフェースを提供するために使用されます。

:::note 例のコード
この例のコードは、[examples repository](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit)で見つけることができます。
:::

## 前提条件 {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`

## 依存関係のインストール {#install-dependencies}

プロジェクトをローカルにクローンします: `git clone https://github.com/ClickHouse/examples` 
その後、`ai/mcp/copilotkit`ディレクトリに移動します。

このセクションをスキップして、依存関係をインストールするためにスクリプト`./install.sh`を実行します。手動で依存関係をインストールしたい場合は、以下の手順に従ってください。

## 依存関係を手動でインストールする {#install-dependencies-manually}

1. 依存関係をインストールします:

`npm install`を実行して、ノード依存関係をインストールします。

2. mcp-clickhouseをインストールします:

新しいフォルダー`external`を作成し、その中にmcp-clickhouseリポジトリをクローンします。

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Python依存関係をインストールし、fastmcp CLIツールを追加します。

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```

## アプリケーションを構成する {#configure-the-application}

`env.example`ファイルを`.env`にコピーし、`ANTHROPIC_API_KEY`を提供するように編集します。

## 自分のLLMを使用する {#use-your-own-llm}

Anthropic以外のLLMプロバイダーを使用したい場合は、Copilotkitランタイムを変更して、別のLLMアダプターを使用することができます。 
[こちら](https://docs.copilotkit.ai/guides/bring-your-own-llm)にサポートされているプロバイダーのリストがあります。

## 自分のClickHouseクラスターを使用する {#use-your-own-clickhouse-cluster}

デフォルトでは、この例は[ClickHouseデモクラスター](https://sql.clickhouse.com/)に接続するように構成されています。 
次の環境変数を設定することで、自分のClickHouseクラスターを使用することもできます:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`


# アプリケーションを実行する {#run-the-application}

`npm run dev`を実行して、開発サーバーを開始します。

次のようなプロンプトを使用してエージェントをテストできます:

> "マンチェスターの過去10年間の価格の推移を見せてください。"

ブラウザで[http://localhost:3000](http://localhost:3000)を開いて結果を確認してください。
