---
'slug': '/use-cases/AI/MCP/librechat'
'sidebar_label': 'LibreChatを統合する'
'title': 'ClickHouse MCPサーバーをLibreChatとClickHouse Cloudで設定する'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、Dockerを使用してClickHouse MCPサーバーでLibreChatを設定する方法を説明します。'
'keywords':
- 'AI'
- 'Librechat'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# ClickHouse MCPサーバーをLibreChatで使用する

> このガイドでは、Dockerを使用してClickHouse MCPサーバーをセットアップし、それをClickHouseのサンプルデータセットに接続する方法を説明します。

<VerticalStepper headerLevel="h2">

## Dockerのインストール {#install-docker}

LibreChatとMCPサーバーを実行するにはDockerが必要です。Dockerを入手するには：
1. [docker.com](https://www.docker.com/products/docker-desktop) にアクセスする
2. お使いのオペレーティングシステム用のDocker Desktopをダウンロードする
3. お使いのオペレーティングシステムの手順に従ってDockerをインストールする
4. Docker Desktopを開き、実行されていることを確認する
<br/>
詳細については、[Dockerのドキュメント](https://docs.docker.com/get-docker/)を参照してください。

## LibreChatリポジトリのクローン {#clone-librechat-repo}

ターミナル（コマンドプロンプト、ターミナルまたはPowerShell）を開き、次のコマンドを使用してLibreChatリポジトリをクローンします：

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```

## .envファイルの作成と編集 {#create-and-edit-env-file}

`.env.example`から`.env`に例の構成ファイルをコピーします：

```bash
cp .env.example .env
```

お好きなテキストエディタで`.env`ファイルを開きます。OpenAI、Anthropic、AWSベッドロックなど、多くの人気のあるLLMプロバイダーのセクションが表示されます。例えば：

```text title=".venv"
#============#

# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided

# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307

# ANTHROPIC_REVERSE_PROXY=
```

`user_provided`を使用したいLLMプロバイダーのAPIキーに置き換えてください。

:::note ローカルLLMの使用
APIキーを持っていない場合は、OllamaのようなローカルLLMを使用できます。これは後でステップ「["Ollamaのインストール"](#add-local-llm-using-ollama)」で説明します。今のところ、.envファイルを修正せずに次のステップに進んでください。
:::

## librechat.yamlファイルの作成 {#create-librechat-yaml-file}

次のコマンドを実行して新しい`librechat.yaml`ファイルを作成します：

```bash
cp librechat.example.yaml librechat.yaml
```

これにより、LibreChatの主な[構成ファイル](https://www.librechat.ai/docs/configuration/librechat_yaml)が作成されます。

## DockerコンポーズにClickHouse MCPサーバーを追加する {#add-clickhouse-mcp-server-to-docker-compose}

次に、LLMが[ClickHouse SQLプレイグラウンド](https://sql.clickhouse.com/)と対話できるように、LibreChat DockerコンポーズファイルにClickHouse MCPサーバーを追加します。

`docker-compose.override.yml`というファイルを作成し、以下の構成を追加します：

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

自分のデータを探索したい場合は、独自のClickHouse Cloudサービスの[ホスト、ユーザー名、パスワード](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)を使用して行うことができます。

<Link to="https://cloud.clickhouse.com/">
<CardHorizontal
badgeIcon="cloud"
badgeIconDir=""
badgeState="default"
badgeText=""
description="
Cloudアカウントを持っていない場合は、今日からClickHouse Cloudを始めて、$300のクレジットを受け取ってください。30日間の無料トライアルが終了したら、従量課金プランに移行するか、ボリュームベースの割引についてもっと詳しく知るためにお問い合わせください。
詳細については、当社の料金ページをご覧ください。
"
icon="cloud"
infoText=""
infoUrl=""
title="ClickHouse Cloudを始めましょう"
isSelected={true}
/>
</Link>

## librechat.yamlでMCPサーバーを構成する {#configure-mcp-server-in-librechat-yaml}

`librechat.yaml`ファイルを開き、ファイルの最後に次の構成を追加します：

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

これにより、LibreChatがDocker上で実行されているMCPサーバーに接続されるように構成されます。

次の行を見つけます： 

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

簡素化のため、今のところ認証は不要にすることにします：

```text title="librechat.yaml"
socialLogins: []
```

## Ollamaを使用してローカルLLMを追加する（オプション） {#add-local-llm-using-ollama}

### Ollamaのインストール {#install-ollama}

[Ollamaのウェブサイト](https://ollama.com/download)にアクセスし、システム用のOllamaをインストールします。

インストールが完了したら、以下のようにモデルを実行できます：

```bash
ollama run qwen3:32b
```

これにより、モデルがローカルマシンに存在しない場合はダウンロードされます。

モデルのリストについては、[Ollamaライブラリ](https://ollama.com/library)を参照してください。

### librechat.yamlでOllamaを構成する {#configure-ollama-in-librechat-yaml}

モデルがダウンロードされたら、`librechat.yaml`でそれを構成します：

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

## すべてのサービスを開始する {#start-all-services}

LibreChatプロジェクトフォルダーのルートから、次のコマンドを実行してサービスを開始します：

```bash
docker compose up
```

すべてのサービスが完全に実行されるまで待ちます。

## ブラウザでLibreChatを開く {#open-librechat-in-browser}

すべてのサービスが起動したら、ブラウザを開き、`http://localhost:3080/`に移動します。

まだLibreChatアカウントを持っていない場合は、無料のLibreChatアカウントを作成し、サインインします。これで、ClickHouse MCPサーバーに接続されたLibreChatインターフェースが表示され、オプションでローカルLLMも表示されます。

チャットインターフェースから、MCPサーバーとして`clickhouse-playground`を選択します：

<Image img={LibreInterface} alt="MCPサーバーを選択" size="md"/>

これで、LLMにClickHouseのサンプルデータセットを探索するように促すことができます。試してみてください：

```text title="Prompt"
What datasets do you have access to?
```

</VerticalStepper>
