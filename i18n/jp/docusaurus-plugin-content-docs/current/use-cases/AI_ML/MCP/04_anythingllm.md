---
'slug': '/use-cases/AI/MCP/anythingllm'
'sidebar_label': 'AnythingLLM を統合する'
'title': 'クリックハウス MCP サーバーを AnythingLLM と ClickHouse Cloud で設定する'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、Docker を使用して、ClickHouse MCP サーバーで AnythingLLM を設定する方法を説明します。'
'keywords':
- 'AI'
- 'AnythingLLM'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/allm_conversation.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/allm_mcp-servers.png';
import ToolIcon from '@site/static/images/use-cases/AI_ML/MCP/alm_tool-icon.png';


# Using ClickHouse MCP server with AnythingLLM

> このガイドでは、Dockerを使用してClickHouse MCPサーバーに[AnythingLLM](https://anythingllm.com/)を設定し、ClickHouseのサンプルデータセットに接続する方法について説明します。

<VerticalStepper headerLevel="h2">

## Install Docker {#install-docker}

LibreChatとMCPサーバーを実行するにはDockerが必要です。Dockerを取得するには：
1. [docker.com](https://www.docker.com/products/docker-desktop)にアクセスします。
2. あなたのオペレーティングシステムのためのDocker Desktopをダウンロードします。
3. あなたのオペレーティングシステムに対する指示に従ってDockerをインストールします。
4. Docker Desktopを開き、実行中であることを確認します。
<br/>
詳細については、[Dockerのドキュメント](https://docs.docker.com/get-docker/)を参照してください。

## Pull AnythingLLM Docker image {#pull-anythingllm-docker-image}

以下のコマンドを実行して、AnythingLLM Dockerイメージをマシンにプルします：

```bash
docker pull anythingllm/anythingllm
```

## Setup storage location {#setup-storage-location}

ストレージのためのディレクトリを作成し、環境ファイルを初期化します：

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```

## Configure MCP Server config file {#configure-mcp-server-config-file}

`plugins`ディレクトリを作成します：

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

`plugins`ディレクトリに`anythingllm_mcp_servers.json`という名前のファイルを作成し、以下の内容を追加します：

```json
{
  "mcpServers": {
    "mcp-clickhouse": {
      "command": "uv",
      "args": [
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ],
      "env": {
        "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": ""
      }
    }
  }
}
```

自分のデータを探索したい場合は、あなた自身のClickHouse Cloudサービスの[ホスト、ユーザー名、パスワード](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)を使用することができます。

## Start the AnythingLLM Docker container {#start-anythingllm-docker-container}

以下のコマンドを実行して、AnythingLLM Dockerコンテナを開始します：

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

それが開始したら、ブラウザで`http://localhost:3001`に移動します。
使用したいモデルを選択し、APIキーを提供します。

## Wait for MCP Servers to start up {#wait-for-mcp-servers-to-start-up}

UIの左下隅にあるツールアイコンをクリックします：

<Image img={ToolIcon} alt="Tool icon" size="md"/>

`Agent Skills`をクリックし、`MCP Servers`セクションを確認します。 
`Mcp ClickHouse`が`On`に設定されるまで待ちます。

<Image img={MCPServers} alt="MCP servers ready" size="md"/>

## Chat with ClickHouse MCP Server with AnythingLLM {#chat-with-clickhouse-mcp-server-with-anythingllm}

今、チャットを開始する準備ができました。 
MCPサーバーをチャットで利用可能にするには、会話の最初のメッセージを`@agent`でプレフィックスする必要があります。

<Image img={Conversation} alt="Conversation" size="md"/>

</VerticalStepper>
