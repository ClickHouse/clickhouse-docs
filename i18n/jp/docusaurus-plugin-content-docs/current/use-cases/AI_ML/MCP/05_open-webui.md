---
slug: /use-cases/AI/MCP/open-webui
sidebar_label: 'Open WebUI を統合する'
title: 'Open WebUI と ClickHouse Cloud で ClickHouse MCP サーバーをセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Docker を使用して ClickHouse MCP サーバーと連携する Open WebUI のセットアップ方法を説明します。'
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


# Open WebUIでClickHouse MCPサーバーを使用する

> このガイドでは、ClickHouse MCPサーバーを使用した[Open WebUI](https://github.com/open-webui/open-webui)のセットアップ方法と、
> ClickHouseのサンプルデータセットへの接続方法について説明します。

<VerticalStepper headerLevel="h2">


## uvのインストール {#install-uv}

本ガイドの手順を実行するには、[uv](https://docs.astral.sh/uv/)をインストールする必要があります。
uvを使用しない場合は、別のパッケージマネージャーを使用するようMCP Serverの設定を更新する必要があります。


## Open WebUIの起動 {#launch-open-webui}

Open WebUIを起動するには、以下のコマンドを実行してください：

```bash
uv run --with open-webui open-webui serve
```

http://localhost:8080/ にアクセスすると、UIが表示されます。


## ClickHouse MCP Serverの設定 {#configure-clickhouse-mcp-server}

ClickHouse MCP Serverをセットアップするには、MCP ServerをOpen APIエンドポイントに変換する必要があります。
まず、ClickHouse SQL Playgroundに接続するための環境変数を設定しましょう:

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

次に、`mcpo`を実行してOpen APIエンドポイントを作成します:

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

http://localhost:8000/docs にアクセスすると、作成されたエンドポイントの一覧を確認できます。

<Image img={Endpoints} alt='Open APIエンドポイント' size='md' />

これらのエンドポイントをOpen WebUIで使用するには、設定画面に移動します:

<Image img={Settings} alt='Open WebUIの設定' size='md' />

`Tools`をクリックします:

<Image img={ToolsPage} alt='Open WebUIのツール' size='md' />

ツールURLとして http://localhost:8000 を追加します:

<Image img={AddTool} alt='Open WebUIツール' size='md' />

この設定が完了すると、チャットバーのツールアイコンの横に`1`が表示されます:

<Image img={ToolsAvailable} alt='Open WebUIで利用可能なツール' size='md' />

ツールアイコンをクリックすると、利用可能なツールの一覧が表示されます:

<Image img={ListOfTools} alt='Open WebUIツール一覧' size='md' />


## OpenAIの設定 {#configure-openai}

デフォルトでは、Open WebUIはOllamaモデルで動作しますが、OpenAI互換エンドポイントも追加できます。
これらは設定メニューから構成しますが、今回は`Connections`タブをクリックする必要があります:

<Image img={Connections} alt='Open WebUI connections' size='md' />

エンドポイントとOpenAIキーを追加しましょう:

<Image
  img={AddConnection}
  alt='Open WebUI - Add OpenAI as a connection'
  size='md'
/>

OpenAIモデルは上部メニューで利用可能になります:

<Image img={OpenAIModels} alt='Open WebUI - Models' size='md' />


## Open WebUIでClickHouse MCPサーバーとチャットする {#chat-to-clickhouse-mcp-server}

これで会話を開始でき、必要に応じてOpen WebUIがMCPサーバーを呼び出します:

<Image
  img={Conversation}
  alt='Open WebUI - ClickHouse MCPサーバーとのチャット'
  size='md'
/>

</VerticalStepper>
