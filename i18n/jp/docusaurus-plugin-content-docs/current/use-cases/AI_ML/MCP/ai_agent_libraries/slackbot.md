---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'SlackBot を統合する'
title: 'ClickHouse MCP server を使用して SlackBot エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP server と対話できる SlackBot エージェントの構築方法を学ぶ。'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP server を使用して SlackBot エージェントを構築する方法 \{#how-to-build-a-slackbot-agent-using-clickhouse-mcp-server\}

このガイドでは、[SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) エージェントの構築方法を学びます。
このボットを使うと、自然言語で Slack から直接 ClickHouse のデータについて質問できます。内部的には
[ClickHouse MCP server](https://github.com/ClickHouse/mcp-clickhouse) と [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) を使用します。

:::note サンプルプロジェクト
このサンプルのコードは [examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md) で参照できます。
:::

## 前提条件 \{#prerequisites\}

* [`uv`](https://docs.astral.sh/uv/getting-started/installation/) がインストールされている必要があります
* Slack ワークスペースにアクセスできる必要があります
* Anthropic の API キー、または別の LLM provider の API キーが必要です

<VerticalStepper headerLevel="h2">
  ## Slack アプリを作成する \{#create-a-slack-app\}

  1. [slack.com/apps](https://slack.com/apps) にアクセスし、`Create New App` をクリックします。
  2. `From scratch` オプションを選択し、アプリに名前を付けます。
  3. Slack ワークスペースを選択します。

  ## アプリをワークスペースにインストールする \{#install-the-app-to-your-workspace\}

  次に、前の手順で作成したアプリをワークスペースに追加する必要があります。
  Slack のドキュメントにある [&quot;Add apps to your Slack workspace&quot;](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)
  の手順に従ってください。

  ## Slack アプリの設定を行う \{#configure-slack-app-settings\}

  * `App Home` に移動する
    * `Show Tabs` → `Messages Tab` の `Allow users to send Slash commands and messages from the messages tab` を有効にする
    * `Socket Mode` に移動する
      * `Socket Mode` を有効にする
      * 環境変数 `SLACK_APP_TOKEN` に設定するため、`Socket Mode Handler` を控えておく
    * `OAuth & Permissions` に移動する
      * 次の `Bot Token Scopes` を追加する:
        * `app_mentions:read`
        * `assistant:write`
        * `chat:write`
        * `im:history`
        * `im:read`
        * `im:write`
        * `channels:history`
      * アプリをワークスペースにインストールし、環境変数 `SLACK_BOT_TOKEN` に設定するための `Bot User OAuth Token` を控えておく
    * `Event Subscriptions` に移動する
      * `Events` を有効にする
      * `Subscribe to bot events` に次を追加する:
        * `app_mention`
        * `assistant_thread_started`
        * `message:im`
      * 変更を保存する

  ## 環境変数 (`.env`) を追加する \{#add-env-vars\}

  次の環境変数を含む `.env` ファイルをプロジェクトのルートに作成します。
  これにより、アプリを [ClickHouse&#39;s SQL playground](https://sql.clickhouse.com/) に接続できるようになります。

  ```env
  SLACK_BOT_TOKEN=your-slack-bot-token
  SLACK_APP_TOKEN=your-slack-app-level-token
  ANTHROPIC_API_KEY=your-anthropic-api-key
  CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
  CLICKHOUSE_PORT=8443
  CLICKHOUSE_USER=demo
  CLICKHOUSE_PASSWORD=
  CLICKHOUSE_SECURE=true
  ```

  必要に応じて、ClickHouse の変数を自分の ClickHouse サーバー
  または Cloud instance を使うように調整できます。

  ## ボットを使う \{#using-the-bot\}

  1. **ボットを起動する:**

     ```sh
     uv run main.py
     ```
  2. **Slack 内で:**
     * チャンネルでボットにメンションする: `@yourbot Who are the top contributors to the ClickHouse git repo?`
     * スレッドでメンションして返信する: `@yourbot how many contributions did these users make last week?`
     * ボットに DM を送る: `Show me all tables in the demo database.`

  ボットは、該当する場合はそれまでのスレッド内のメッセージをすべて Context として使い、
  スレッド内で返信します。

  **スレッド Context:**
  スレッドで返信する際、ボットはそれまでのすべてのメッセージ (現在のメッセージを除く) を読み込み、AI の Context として含めます。

  **ツールの使用方法:**
  ボットは MCP 経由で利用可能なツール (たとえば schema discovery や SQL execution) のみを使い、使用した SQL と回答に至った方法の要約を常に表示します。
</VerticalStepper>