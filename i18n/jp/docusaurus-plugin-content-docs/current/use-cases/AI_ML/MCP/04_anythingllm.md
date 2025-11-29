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


# AnythingLLMでClickHouse MCPサーバーを使用する {#using-clickhouse-mcp-server-with-anythingllm}

> 本ガイドでは、Dockerを使用してClickHouse MCPサーバーと[AnythingLLM](https://anythingllm.com/)をセットアップし、
> ClickHouseのサンプルデータセットに接続する方法について説明します。

<VerticalStepper headerLevel="h2">


## Docker をインストールする {#install-docker}

LibreChat と MCP サーバーを実行するには Docker が必要です。Docker を入手するには、次の手順を実行します。
1. [docker.com](https://www.docker.com/products/docker-desktop) にアクセスします
2. お使いのオペレーティングシステム向けの Docker Desktop をダウンロードします
3. オペレーティングシステムのインストール手順に従って Docker をインストールします
4. Docker Desktop を開き、起動していることを確認します
<br/>
詳細については、[Docker のドキュメント](https://docs.docker.com/get-docker/)を参照してください。



## AnythingLLM の Docker イメージをプルする {#pull-anythingllm-docker-image}

次のコマンドを実行して、AnythingLLM の Docker イメージをローカル環境にプルします。

```bash
docker pull anythingllm/anythingllm
```


## ストレージの場所を設定する {#setup-storage-location}

ストレージ用のディレクトリを作成し、環境ファイルを初期化します。

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```


## MCP サーバー設定ファイルの設定 {#configure-mcp-server-config-file}

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


## AnythingLLM の Docker コンテナを起動する {#start-anythingllm-docker-container}

次のコマンドを実行して、AnythingLLM の Docker コンテナを起動します。

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

起動したら、ブラウザで `http://localhost:3001` にアクセスします。
利用したいモデルを選択し、API キーを入力します。


## MCP サーバーの起動を待つ {#wait-for-mcp-servers-to-start-up}

UI 左下にあるツールアイコンをクリックします。

<Image img={ToolIcon} alt="ツールアイコン" size="md"/>

`Agent Skills` をクリックし、`MCP Servers` セクションを確認します。  
`Mcp ClickHouse` が `On` になるまで待ちます。

<Image img={MCPServers} alt="MCP サーバーの準備完了" size="md"/>



## AnythingLLM で ClickHouse MCP Server とチャットする {#chat-with-clickhouse-mcp-server-with-anythingllm}

これでチャットを開始する準備が整いました。
チャットで MCP Server を利用できるようにするには、会話の最初のメッセージの先頭に `@agent` を付ける必要があります。

<Image img={Conversation} alt='会話' size='md' />

</VerticalStepper>
