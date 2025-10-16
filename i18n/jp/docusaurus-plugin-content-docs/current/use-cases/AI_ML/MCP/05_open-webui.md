---
'slug': '/use-cases/AI/MCP/open-webui'
'sidebar_label': 'Open WebUI の統合'
'title': 'ClickHouse MCP サーバーの設定と Open WebUI および ClickHouse Cloud の統合'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、Docker を使用して ClickHouse MCP サーバーと Open WebUI を設定する方法を説明します。'
'keywords':
- 'AI'
- 'Open WebUI'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
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


# ClickHouse MCPサーバーとOpen WebUIの使用

> このガイドでは、ClickHouse MCPサーバーを使用して[Open WebUI](https://github.com/open-webui/open-webui)をセットアップし、ClickHouseのサンプルデータセットに接続する方法を説明します。

<VerticalStepper headerLevel="h2">

## uvのインストール {#install-uv}

このガイドの手順に従うには、[uv](https://docs.astral.sh/uv/)をインストールする必要があります。
uvを使用したくない場合は、MCPサーバーの設定を更新して代替のパッケージマネージャーを使用する必要があります。

## Open WebUIの起動 {#launch-open-webui}

Open WebUIを起動するには、次のコマンドを実行できます：

```bash
uv run --with open-webui open-webui serve
```

http://localhost:8080/ に移動して、UIを表示します。

## ClickHouse MCPサーバーの設定 {#configure-clickhouse-mcp-server}

ClickHouse MCPサーバーをセットアップするには、MCPサーバーをOpen APIのエンドポイントに変換する必要があります。
まず、ClickHouse SQL Playgroundに接続できるように環境変数を設定しましょう：

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

次に、`mcpo`を実行してOpen APIエンドポイントを作成します：

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

作成されたエンドポイントのリストは、http://localhost:8000/docs に移動することで確認できます。

<Image img={Endpoints} alt="Open API endpoints" size="md"/>

これらのエンドポイントをOpen WebUIで使用するには、設定に移動する必要があります：

<Image img={Settings} alt="Open WebUI settings" size="md"/>

`Tools`をクリックします：

<Image img={ToolsPage} alt="Open WebUI tools" size="md"/>

ツールURLとして http://localhost:8000 を追加します：

<Image img={AddTool} alt="Open WebUI tool" size="md"/>

これを行った後、チャットバーのツールアイコンの隣に`1`が表示されるはずです：

<Image img={ToolsAvailable} alt="Open WebUI tools available" size="md"/>

ツールアイコンをクリックすると、利用可能なツールのリストを表示できます：

<Image img={ListOfTools} alt="Open WebUI tool listing" size="md"/>

## OpenAIの設定 {#configure-openai}

デフォルトでは、Open WebUIはOllamaモデルで動作しますが、OpenAI互換のエンドポイントも追加できます。
これらは設定メニューから構成されますが、今回は`Connections`タブをクリックする必要があります：

<Image img={Connections} alt="Open WebUI connections" size="md"/>

エンドポイントとOpenAIキーを追加しましょう：

<Image img={AddConnection} alt="Open WebUI - Add OpenAI as a connection" size="md"/>

OpenAIモデルは、トップメニューから利用可能になります：

<Image img={OpenAIModels} alt="Open WebUI - Models" size="md"/>

## Open WebUIを使用してClickHouse MCPサーバーとチャットする {#chat-to-clickhouse-mcp-server}

その後、会話を行うことができ、必要に応じてOpen WebUIがMCPサーバーを呼び出します：

<Image img={Conversation} alt="Open WebUI - Chat with ClickHouse MCP Server" size="md"/>

</VerticalStepper>
