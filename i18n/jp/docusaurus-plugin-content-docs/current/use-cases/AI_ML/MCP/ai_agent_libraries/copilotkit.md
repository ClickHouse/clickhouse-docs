---
slug: /use-cases/AI/MCP/ai-agent-libraries/copilotkit
sidebar_label: 'CopilotKit を統合する'
title: 'CopilotKit と ClickHouse MCP Server を使って AI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP と CopilotKit を使用して、ClickHouse に保存されたデータを活用するエージェント型アプリケーションの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'copilotkit']
show_related_blogs: true
doc_type: 'guide'
---



# CopilotKit と ClickHouse MCP Server を使用して AI エージェントを構築する方法

これは、ClickHouse に保存されているデータを利用してエージェント型アプリケーションを構築する方法の例です。[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使用して ClickHouse からデータをクエリし、そのデータに基づいてグラフを生成します。

[CopilotKit](https://github.com/CopilotKit/CopilotKit) は、UI を構築し、ユーザー向けのチャットインターフェースを提供するために使用します。

:::note サンプルコード
このサンプルのコードは [examples リポジトリ](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit) にあります。
:::



## 前提条件 {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`



## 依存関係をインストールする {#install-dependencies}

`git clone https://github.com/ClickHouse/examples` を実行してプロジェクトをローカル環境にクローンし、
`ai/mcp/copilotkit` ディレクトリに移動します。

このセクションはスキップし、スクリプト `./install.sh` を実行して依存関係をインストールします。  
依存関係を手動でインストールしたい場合は、以下の手順に従ってください。



## 依存関係を手動でインストールする

1. 依存関係をインストールします:

`npm install` を実行して、Node.js の依存関係をインストールします。

2. mcp-clickhouse をインストールします:

新しいフォルダ `external` を作成し、その中に mcp-clickhouse リポジトリをクローンします。

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Python の依存パッケージをインストールし、fastmcp CLI ツールを追加します。

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```


## アプリケーションを構成する {#configure-the-application}

`env.example` ファイルを `.env` としてコピーし、`ANTHROPIC_API_KEY` を指定するように編集します。



## 独自の LLM を使用する {#use-your-own-llm}

Anthropic 以外の LLM プロバイダーを使用したい場合は、Copilotkit ランタイムの設定を変更して、別の LLM アダプターを利用できます。
サポートされているプロバイダーの一覧は[こちら](https://docs.copilotkit.ai/guides/bring-your-own-llm)です。



## 独自の ClickHouse クラスターを使用する {#use-your-own-clickhouse-cluster}

デフォルトでは、このサンプルは
[ClickHouse demo cluster](https://sql.clickhouse.com/) に接続するように構成されています。次の環境変数を設定することで、
独自の ClickHouse クラスターを使用することもできます。

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`



# アプリケーションを実行する {#run-the-application}

`npm run dev` を実行して、開発サーバーを起動します。

次のようなプロンプトで Agent をテストできます:

> 「過去10年間のマンチェスターの価格推移を表示して。」

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、結果を確認してください。