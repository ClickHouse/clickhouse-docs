---
slug: /use-cases/AI/MCP/open-webui
sidebar_label: 'Open WebUI を統合する'
title: 'Open WebUI および ClickHouse Cloud 向け ClickHouse MCPサーバーのセットアップ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Docker を使用して ClickHouse MCPサーバーと連携する Open WebUI のセットアップ方法を説明します。'
keywords: ['AI', 'Open WebUI', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

import Endpoints from '@site/static/images/use-cases/AI_ML/MCP/0_endpoints.png';
import Settings from '@site/static/images/use-cases/AI_ML/MCP/1_settings.png';
import ToolsPage from '@site/static/images/use-cases/AI_ML/MCP/2_tools_page.png';
import AddTool from '@site/static/images/use-cases/AI_ML/MCP/3_add_tool.png';
import ToolsAvailable from '@site/static/images/use-cases/AI_ML/MCP/4_tools_available.png';
import ListOfTools from '@site/static/images/use-cases/AI_ML/MCP/5_list_of_tools.png';
import Connections from '@site/static/images/use-cases/AI_ML/MCP/6_connections.png';
import AddConnection from '@site/static/images/use-cases/AI_ML/MCP/7_add_connection.png';
import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/8_openai_models_more.png';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/9_conversation.png';

# Open WebUI で ClickHouse MCPサーバーを使う \{#using-clickhouse-mcp-server-with-open-webui\}

> このガイドでは、[Open WebUI](https://github.com/open-webui/open-webui) を ClickHouse MCPサーバーとともにセットアップし、
> ClickHouse のサンプルデータセットに接続する方法を説明します。

<VerticalStepper headerLevel="h2">
  ## uv をインストールする \{#install-uv\}

  このガイドの手順に従うには、[uv](https://docs.astral.sh/uv/) をインストールする必要があります。
  uv を使いたくない場合は、別のパッケージマネージャーを使うように MCPサーバーの設定を更新する必要があります。

  ## Open WebUI を起動する \{#launch-open-webui\}

  Open WebUI を起動するには、次のコマンドを実行します。

  ```bash
  uv run --with open-webui open-webui serve
  ```

  UI を表示するには、http://localhost:8080/ にアクセスします。

  ## ClickHouse MCPサーバー を構成する \{#configure-clickhouse-mcp-server\}

  ClickHouse MCPサーバー をセットアップするには、MCPサーバー を OpenAPI エンドポイントに変換する必要があります。
  まず、ClickHouse SQL Playground に接続するための環境変数を設定します。

  ```bash
  export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
  export CLICKHOUSE_USER="demo"
  export CLICKHOUSE_PASSWORD=""
  ```

  では、`mcpo` を実行して OpenAPI エンドポイントを作成します:

  ```bash
  uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
  ```

  [http://localhost:8000/docs](http://localhost:8000/docs) にアクセスすると、作成されたエンドポイントの一覧を確認できます。

  <Image img={Endpoints} alt="Open API endpoints" size="md" />

  これらのエンドポイントを Open WebUI から利用するには、設定画面を開きます。

  <Image img={Settings} alt="Open WebUI settings" size="md" />

  `Tools` をクリックします。

  <Image img={ToolsPage} alt="Open WebUI tools" size="md" />

  [http://localhost:8000](http://localhost:8000) をツールの URL として追加します。

  <Image img={AddTool} alt="Open WebUI tool" size="md" />

  追加が完了すると、チャットバーのツールアイコンの横に `1` が表示されるはずです。

  <Image img={ToolsAvailable} alt="Open WebUI tools available" size="md" />

  ツールアイコンをクリックすると、利用可能なツールの一覧が表示されます。

  <Image img={ListOfTools} alt="Open WebUI tool listing" size="md" />

  ## OpenAI を構成する \{#configure-openai\}

  デフォルトでは、Open WebUI は Ollama モデルで動作しますが、OpenAI 互換エンドポイントも追加できます。
  これらは設定メニューから構成しますが、今回は `Connections` タブをクリックする必要があります。

  <Image img={Connections} alt="Open WebUI connections" size="md" />

  エンドポイントと OpenAI キーを追加します。

  <Image img={AddConnection} alt="Open WebUI - Add OpenAI as a connection" size="md" />

  すると、OpenAI モデルが上部のメニューで利用できるようになります。

  <Image img={OpenAIModels} alt="Open WebUI - Models" size="md" />

  ## Open WebUI から ClickHouse MCPサーバーと対話する \{#chat-to-clickhouse-mcp-server\}

  その後、会話を始めると、必要に応じて Open WebUI が MCPサーバーを呼び出します。

  <Image img={Conversation} alt="Open WebUI - Chat with ClickHouse MCP server" size="md" />
</VerticalStepper>