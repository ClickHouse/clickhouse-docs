---
slug: /use-cases/AI/MCP/librechat
sidebar_label: 'LibreChat を統合する'
title: 'ClickHouse MCP サーバーを LibreChat と ClickHouse Cloud でセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Docker を使用して LibreChat と ClickHouse MCP サーバーをセットアップする方法を説明します。'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# LibreChatでClickHouse MCPサーバーを使用する

> このガイドでは、Dockerを使用してClickHouse MCPサーバーとLibreChatをセットアップし、
> ClickHouseのサンプルデータセットに接続する方法について説明します。

<VerticalStepper headerLevel="h2">


## Dockerのインストール {#install-docker}

LibreChatとMCPサーバーを実行するには、Dockerが必要です。Dockerを入手するには以下の手順に従ってください：

1. [docker.com](https://www.docker.com/products/docker-desktop)にアクセスします
2. お使いのオペレーティングシステム用のDocker Desktopをダウンロードします
3. お使いのオペレーティングシステムの手順に従ってDockerをインストールします
4. Docker Desktopを開き、実行されていることを確認します
   <br />
   詳細については、[Dockerドキュメント](https://docs.docker.com/get-docker/)を参照してください。


## LibreChatリポジトリのクローン {#clone-librechat-repo}

ターミナル（コマンドプロンプト、ターミナル、またはPowerShell）を開き、以下のコマンドでLibreChatリポジトリをクローンします：

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```


## .envファイルの作成と編集 {#create-and-edit-env-file}

`.env.example`から`.env`へ設定ファイルのサンプルをコピーします:

```bash
cp .env.example .env
```

任意のテキストエディタで`.env`ファイルを開きます。OpenAI、Anthropic、AWS Bedrockなど、多数の主要なLLMプロバイダーのセクションが表示されます。例:


```text title=".venv"
#============#
# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided
# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307
# ANTHROPIC_REVERSE_PROXY=
```

`user_provided` を、使用したい LLM プロバイダーの API キーに置き換えます。

:::note ローカル LLM を使用する場合
API キーがない場合は、Ollama のようなローカル LLM を使用できます。
その方法は、後のステップ [&quot;Install Ollama&quot;](#add-local-llm-using-ollama) で説明します。
ここでは .env ファイルは変更せず、そのまま次のステップに進んでください。
:::


## librechat.yamlファイルの作成 {#create-librechat-yaml-file}

以下のコマンドを実行して、新しい`librechat.yaml`ファイルを作成します:

```bash
cp librechat.example.yaml librechat.yaml
```

これにより、LibreChatのメイン[設定ファイル](https://www.librechat.ai/docs/configuration/librechat_yaml)が作成されます。


## Docker ComposeへのClickHouse MCPサーバーの追加 {#add-clickhouse-mcp-server-to-docker-compose}

次に、LLMが[ClickHouse SQLプレイグラウンド](https://sql.clickhouse.com/)と対話できるようにするため、LibreChatのDocker ComposeファイルにClickHouse MCPサーバーを追加します。

`docker-compose.override.yml`というファイルを作成し、以下の設定を追加してください:

```yml title="docker-compose.override.yml"
services:
  api:
    volumes:
      - ./librechat.yaml:/app/librechat.yaml
  mcp-clickhouse:
    image: mcp/clickhouse
    container_name: mcp-clickhouse
    ports:
      - 8001:8000
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
      - CLICKHOUSE_USER=demo
      - CLICKHOUSE_PASSWORD=
      - CLICKHOUSE_MCP_SERVER_TRANSPORT=sse
      - CLICKHOUSE_MCP_BIND_HOST=0.0.0.0
```

独自のデータを探索する場合は、ご利用のClickHouse Cloudサービスの[ホスト、ユーザー名、パスワード](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)を使用してください。

<Link to='https://cloud.clickhouse.com/'>
  <CardHorizontal
    badgeIcon='cloud'
    badgeIconDir=''
    badgeState='default'
    badgeText=''
    description="
まだCloudアカウントをお持ちでない場合は、今すぐClickHouse Cloudを始めて
300ドル分のクレジットを獲得しましょう。30日間の無料トライアル終了後は、
従量課金プランで継続するか、ボリュームベースの割引について詳しくは
お問い合わせください。詳細は料金ページをご覧ください。
"
    icon='cloud'
    infoText=''
    infoUrl=''
    title='ClickHouse Cloudを始める'
    isSelected={true}
  />
</Link>


## librechat.yamlでMCPサーバーを設定する {#configure-mcp-server-in-librechat-yaml}

`librechat.yaml`を開き、ファイルの末尾に以下の設定を記述します:

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

これにより、Docker上で実行されているMCPサーバーに接続するようLibreChatが設定されます。

以下の行を探します:

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

簡略化のため、ここでは認証を不要にします:

```text title="librechat.yaml"
socialLogins: []
```


## Ollamaを使用したローカルLLMの追加(オプション) {#add-local-llm-using-ollama}

### Ollamaのインストール {#install-ollama}

[Ollamaウェブサイト](https://ollama.com/download)にアクセスし、お使いのシステム用のOllamaをインストールしてください。

インストール後、次のようにモデルを実行できます:

```bash
ollama run qwen3:32b
```

モデルがローカルマシンに存在しない場合、このコマンドでモデルがダウンロードされます。

利用可能なモデルの一覧については、[Ollamaライブラリ](https://ollama.com/library)を参照してください。

### librechat.yamlでのOllama設定 {#configure-ollama-in-librechat-yaml}

モデルのダウンロード完了後、`librechat.yaml`で設定を行います:

```text title="librechat.yaml"
custom:
  - name: "Ollama"
    apiKey: "ollama"
    baseURL: "http://host.docker.internal:11434/v1/"
    models:
      default:
        [
          "qwen3:32b"
        ]
      fetch: false
    titleConvo: true
    titleModel: "current_model"
    summarize: false
    summaryModel: "current_model"
    forcePrompt: false
    modelDisplayLabel: "Ollama"
```


## すべてのサービスを起動する {#start-all-services}

LibreChatプロジェクトフォルダのルートから、以下のコマンドを実行してサービスを起動します:

```bash
docker compose up
```

すべてのサービスが完全に起動するまで待ちます。


## ブラウザでLibreChatを開く {#open-librechat-in-browser}

すべてのサービスが起動したら、ブラウザを開いて `http://localhost:3080/` にアクセスします。

まだアカウントをお持ちでない場合は、無料のLibreChatアカウントを作成してサインインしてください。ClickHouse MCPサーバーに接続されたLibreChatインターフェースが表示されます。オプションでローカルLLMも利用できます。

チャットインターフェースから、MCPサーバーとして `clickhouse-playground` を選択します：

<Image img={LibreInterface} alt='MCPサーバーを選択' size='md' />

これで、LLMにプロンプトを送信してClickHouseのサンプルデータセットを探索できます。試してみましょう：

```text title="プロンプト"
What datasets do you have access to?
```

</VerticalStepper>
