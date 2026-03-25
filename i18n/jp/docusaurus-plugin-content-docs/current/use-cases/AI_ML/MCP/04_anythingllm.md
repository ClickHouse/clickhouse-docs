---
slug: /use-cases/AI/MCP/anythingllm
sidebar_label: 'AnythingLLM を統合する'
title: 'AnythingLLM および ClickHouse Cloud 向けの ClickHouse MCP サーバーをセットアップする'
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

# AnythingLLM で ClickHouse MCPサーバーを使う \{#using-clickhouse-mcp-server-with-anythingllm\}

> このガイドでは、Docker を使用して ClickHouse MCP サーバーと連携する [AnythingLLM](https://anythingllm.com/) をセットアップし、
> ClickHouse のサンプルデータセットに接続する方法を説明します。

<VerticalStepper headerLevel="h2">
  ## Docker のインストール \{#install-docker\}

  LibreChat と MCPサーバーを実行するには Docker が必要です。Docker を入手するには、次の手順に従います。

  1. [docker.com](https://www.docker.com/products/docker-desktop) にアクセスします
  2. ご利用の OS 向けの Docker Desktop をダウンロードします
  3. ご利用の OS 向けの手順に従って Docker をインストールします
  4. Docker Desktop を開き、実行中であることを確認します

  <br />

  詳しくは、[Docker ドキュメント](https://docs.docker.com/get-docker/)を参照してください。

  ## AnythingLLM Docker イメージの取得 \{#pull-anythingllm-docker-image\}

  以下のコマンドを実行して、AnythingLLM Docker イメージをローカルマシンに取得します。

  ```bash
  docker pull anythingllm/anythingllm
  ```

  ## ストレージ保存場所の設定 \{#setup-storage-location\}

  保存用のディレクトリを作成し、環境ファイルを初期化します。

  ```bash
  export STORAGE_LOCATION=$PWD/anythingllm && \
  mkdir -p $STORAGE_LOCATION && \
  touch "$STORAGE_LOCATION/.env" 
  ```

  ## MCP サーバー設定ファイルの設定 \{#configure-mcp-server-config-file\}

  `plugins` ディレクトリを作成します。

  ```bash
  mkdir -p "$STORAGE_LOCATION/plugins"
  ```

  `plugins` ディレクトリに `anythingllm_mcp_servers.json` という名前のファイルを作成し、以下の内容を記述します。

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

  ご自身のデータを探索したい場合は、
  ご利用の ClickHouse Cloud サービスの [ホスト名、ユーザー名、パスワード](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)
  を使用して行えます。

  ## AnythingLLM Docker コンテナの起動 \{#start-anythingllm-docker-container\}

  以下のコマンドを実行して、AnythingLLM Docker コンテナを起動します。

  ```bash
  docker run -p 3001:3001 \
  --cap-add SYS_ADMIN \
  -v ${STORAGE_LOCATION}:/app/server/storage \
  -v ${STORAGE_LOCATION}/.env:/app/server/.env \
  -e STORAGE_DIR="/app/server/storage" \
  mintplexlabs/anythingllm
  ```

  起動したら、ブラウザで `http://localhost:3001` にアクセスします。
  使用するモデルを選択し、API key を入力します。

  ## MCPサーバーの起動を待機 \{#wait-for-mcp-servers-to-start-up\}

  UI の左下にあるツールアイコンをクリックします。

  <Image img={ToolIcon} alt="ツールアイコン" size="md" />

  `Agent Skills` をクリックし、`MCP servers` セクションを確認します。
  `Mcp ClickHouse` が `On` になるまで待ちます

  <Image img={MCPServers} alt="MCPサーバーの準備完了" size="md" />

  ## AnythingLLM で ClickHouse MCPサーバーとチャットする \{#chat-with-clickhouse-mcp-server-with-anythingllm\}

  これでチャットを開始する準備が整いました。
  チャットで MCPサーバーを利用できるようにするには、会話の最初のメッセージの先頭に `@agent` を付ける必要があります。

  <Image img={Conversation} alt="会話" size="md" />
</VerticalStepper>