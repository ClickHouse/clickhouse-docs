---
slug: /use-cases/AI/MCP/anythingllm
sidebar_label: 'AnythingLLM を統合する'
title: 'ClickHouse MCP サーバーを AnythingLLM および ClickHouse Cloud と連携してセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Docker を使用して ClickHouse MCP サーバーと連携する AnythingLLM をセットアップする方法を説明します。'
keywords: ['AI', 'AnythingLLM', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

import Conversation from '@site/static/images/use-cases/AI_ML/MCP/allm_conversation.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/allm_mcp-servers.png';
import ToolIcon from '@site/static/images/use-cases/AI_ML/MCP/alm_tool-icon.png';


# AnythingLLMでClickHouse MCPサーバーを使用する

> 本ガイドでは、Dockerを使用してClickHouse MCPサーバーと[AnythingLLM](https://anythingllm.com/)をセットアップし、
> ClickHouseのサンプルデータセットに接続する方法を説明します。

<VerticalStepper headerLevel="h2">


## Dockerのインストール {#install-docker}

LibreChatとMCPサーバーを実行するには、Dockerが必要です。Dockerを入手するには、以下の手順に従ってください。

1. [docker.com](https://www.docker.com/products/docker-desktop)にアクセスします
2. お使いのオペレーティングシステム用のDocker Desktopをダウンロードします
3. お使いのオペレーティングシステムの手順に従ってDockerをインストールします
4. Docker Desktopを開き、実行されていることを確認します
   <br />
   詳細については、[Dockerドキュメント](https://docs.docker.com/get-docker/)を参照してください。


## AnythingLLM Dockerイメージの取得 {#pull-anythingllm-docker-image}

以下のコマンドを実行して、AnythingLLM Dockerイメージをマシンに取得します：

```bash
docker pull anythingllm/anythingllm
```


## ストレージの場所を設定する {#setup-storage-location}

ストレージ用のディレクトリを作成し、環境ファイルを初期化します:

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env"
```


## MCPサーバー設定ファイルの構成 {#configure-mcp-server-config-file}

`plugins`ディレクトリを作成します:

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

`plugins`ディレクトリ内に`anythingllm_mcp_servers.json`というファイルを作成し、以下の内容を追加します:

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

独自のデータを探索する場合は、ご利用のClickHouse Cloudサービスの[ホスト、ユーザー名、パスワード](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)を使用してください。


## AnythingLLM Dockerコンテナの起動 {#start-anythingllm-docker-container}

以下のコマンドを実行して、AnythingLLM Dockerコンテナを起動します。

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

起動後、ブラウザで`http://localhost:3001`にアクセスしてください。
使用するモデルを選択し、APIキーを入力します。


## MCP サーバーの起動を待つ {#wait-for-mcp-servers-to-start-up}

UI の左下にあるツールアイコンをクリックします：

<Image img={ToolIcon} alt='ツールアイコン' size='md' />

`Agent Skills` をクリックし、`MCP Servers` セクションを確認します。
`Mcp ClickHouse` が `On` に設定されるまで待ちます。

<Image img={MCPServers} alt='MCP サーバー準備完了' size='md' />


## AnythingLLMでClickHouse MCPサーバーとチャットする {#chat-with-clickhouse-mcp-server-with-anythingllm}

これでチャットを開始する準備が整いました。
MCPサーバーをチャットで利用できるようにするには、会話の最初のメッセージの先頭に`@agent`を付ける必要があります。

<Image img={Conversation} alt='Conversation' size='md' />

</VerticalStepper>
