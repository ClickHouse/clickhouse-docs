---
slug: /use-cases/AI/MCP/librechat
sidebar_label: 'LibreChat と連携する'
title: 'LibreChat と ClickHouse Cloud 向けの ClickHouse MCP サーバーをセットアップする'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Docker を使用して LibreChat を ClickHouse MCP サーバーと連携させる手順を説明します。'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';

# LibreChatでClickHouse MCPサーバーを使用する \{#using-clickhouse-mcp-server-with-librechat\}

> 本ガイドでは、Dockerを使用してLibreChatとClickHouse MCPサーバーをセットアップし、
> ClickHouseのサンプルデータセットに接続する方法を説明します。

<VerticalStepper headerLevel="h2">
  ## Docker をインストールする \{#install-docker\}

  LibreChat と MCP サーバーを実行するには Docker が必要です。Docker を入手するには:

  1. [docker.com](https://www.docker.com/products/docker-desktop) にアクセスしてください
  2. お使いの OS 向けの Docker Desktop をダウンロードする
  3. お使いのオペレーティングシステム向けの手順に従って、Docker をインストールしてください
  4. Docker Desktop を起動し、実行中であることを確認します

  <br />

  詳細については、[Docker ドキュメント](https://docs.docker.com/get-docker/)を参照してください。

  ## LibreChat リポジトリをクローンする \{#clone-librechat-repo\}

  ターミナル(コマンドプロンプト、ターミナル、または PowerShell)を開き、次のコマンドを使用して LibreChat リポジトリをクローンします。

  ```bash
  git clone https://github.com/danny-avila/LibreChat.git
  cd LibreChat
  ```

  ## .env ファイルを作成して編集する \{#create-and-edit-env-file\}

  サンプル設定ファイルを `.env.example` から `.env` にコピーします:

  ```bash
  cp .env.example .env
  ```

  お好みのテキストエディタで `.env` ファイルを開きます。OpenAI、Anthropic、AWS Bedrock など、
  多くの主要な LLM プロバイダーのセクションが表示されます。例えば次のようになります。

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

  :::note ローカル LLM の使用
  API キーをお持ちでない場合は、Ollama のようなローカル LLM を使用できます。これについては、
  後の手順 [&quot;Ollama のインストール&quot;](#add-local-llm-using-ollama) で説明します。今のところ
  .env ファイルは変更せず、次の手順に進んでください。
  :::

  ## librechat.yaml ファイルを作成する \{#create-librechat-yaml-file\}

  次のコマンドを実行して、新しい `librechat.yaml` ファイルを作成します。

  ```bash
  cp librechat.example.yaml librechat.yaml
  ```

  これにより、LibreChat のメイン[設定ファイル](https://www.librechat.ai/docs/configuration/librechat_yaml)が作成されます。

  ## Docker Compose に ClickHouse MCP サーバーを追加する \{#add-clickhouse-mcp-server-to-docker-compose\}

  次に、LLM が
  [ClickHouse SQL playground](https://sql.clickhouse.com/)
  と対話できるようにするため、ClickHouse MCP サーバーを LibreChat の Docker Compose ファイルに追加します。

  `docker-compose.override.yml` という名前のファイルを作成し、次の設定を追加します。

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

  独自のデータを探索したい場合は、ご利用の ClickHouse Cloud サービスの
  [ホスト名、ユーザー名、パスワード](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)
  を使用して接続できます。

  <Link to="https://cloud.clickhouse.com/">
    <CardHorizontal
      badgeIcon="cloud"
      badgeIconDir=""
      badgeState="default"
      badgeText=""
      description="
まだ Cloud アカウントをお持ちでない場合は、今すぐ ClickHouse Cloud を使い始めて
300 ドル分のクレジットを獲得できます。30 日間の無料トライアル終了後は、
従量課金プランを継続するか、ボリュームベースの割引についてお問い合わせください。
詳細は料金ページをご覧ください。
"
      icon="cloud"
      infoText=""
      infoUrl=""
      title="ClickHouse Cloud を始める"
      isSelected={true}
    />
  </Link>

  ## librechat.yaml で MCP サーバーを設定する \{#configure-mcp-server-in-librechat-yaml\}

  `librechat.yaml` を開き、ファイルの末尾に次の設定を追加します。

  ```yml
  mcpServers:
    clickhouse-playground:
      type: sse
      url: http://host.docker.internal:8001/sse
  ```

  これにより、Docker 上で実行されている MCP サーバーに LibreChat が接続するように設定されます。

  次の行を見つけてください。

  ```text title="librechat.yaml"
  socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
  ```

  簡略化のため、ここでは認証を一旦無効にします。

  ```text title="librechat.yaml"
  socialLogins: []
  ```

  ## Ollama を使用してローカル LLM を追加する(オプション) \{#add-local-llm-using-ollama\}

  ### Ollama をインストールする \{#install-ollama\}

  [Ollama ウェブサイト](https://ollama.com/download)にアクセスし、お使いのシステム用の Ollama をインストールしてください。

  インストール後、次のようにモデルを実行できます:

  ```bash
  ollama run qwen3:32b
  ```

  これにより、モデルがローカルマシンに存在しない場合、プルが実行されます。

  モデルの一覧については、[Ollama ライブラリ](https://ollama.com/library)を参照してください

  ### librechat.yaml で Ollama を設定する \{#configure-ollama-in-librechat-yaml\}

  モデルのダウンロードが完了したら、`librechat.yaml` で設定します:

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

  ## すべてのサービスを起動する \{#start-all-services\}

  LibreChat プロジェクトフォルダのルートから、次のコマンドを実行してサービスを起動します。

  ```bash
  docker compose up
  ```

  すべてのサービスが完全に起動するまで待機します。

  ## ブラウザで LibreChat を開く \{#open-librechat-in-browser\}

  すべてのサービスが起動して実行されたら、ブラウザを開いて `http://localhost:3080/` にアクセスしてください。

  まだアカウントをお持ちでない場合は、無料の LibreChat アカウントを作成してサインインします。ClickHouse MCP サーバーに接続された LibreChat インターフェースが表示され、オプションでローカル LLM も利用できるようになります。

  チャットインターフェースから、MCP サーバーとして `clickhouse-playground` を選択します:

  <Image img={LibreInterface} alt="MCP サーバーを選択する" size="md" />

  これで、LLM に ClickHouse のサンプルデータセットを探索するよう指示できます。試してみましょう:

  ```text title="Prompt"
  What datasets do you have access to?
  ```
</VerticalStepper>

:::note
LibreChat の UI に MCP サーバーのオプションが表示されない場合は、
`librechat.yaml` ファイルで適切な権限が設定されているか確認してください。
:::

`interface` セクション内の `mcpServers` で `use` が `false` に設定されている場合、チャット画面に MCP 選択用ドロップダウンは表示されません。

```yml title="librechat.yaml"
interface:
  mcpServers:
    use: true
    share: false
    create: false
    public: false
```
