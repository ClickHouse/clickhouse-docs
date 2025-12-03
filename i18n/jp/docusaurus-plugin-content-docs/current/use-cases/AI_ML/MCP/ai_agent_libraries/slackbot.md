---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'SlackBot を統合する'
title: 'ClickHouse MCP Server を使用して SlackBot エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と対話できる SlackBot エージェントの作り方を学びます。'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP Server を使用して SlackBot エージェントを構築する方法 {#how-to-build-a-slackbot-agent-using-clickhouse-mcp-server}

このガイドでは、[SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) エージェントの構築方法を解説します。
このボットを使うと、自然言語で Slack から直接 ClickHouse のデータについて質問できます。内部的には
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) と [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) を使用します。

:::note サンプルプロジェクト
このサンプルのコードは [examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md) で参照できます。
:::

## 前提条件 {#prerequisites}

- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)をインストールしておく必要があります
- Slackワークスペースへのアクセス権が必要です
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキーが必要です

<VerticalStepper headerLevel="h2">

## Slack アプリを作成する {#create-a-slack-app}

1. [slack.com/apps](https://slack.com/apps) にアクセスし、`Create New App` をクリックします。
2. `From scratch` を選択し、アプリに名前を付けます。
3. Slack ワークスペースを選択します。

## ワークスペースにアプリをインストールする {#install-the-app-to-your-workspace}

次に、前の手順で作成したアプリをワークスペースに追加します。
Slack のドキュメントにある
「[Slack ワークスペースにアプリを追加する](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)」
の手順に従ってください。

## Slack アプリの設定を行う {#configure-slack-app-settings}

- `App Home` に移動する
  - `Show Tabs` → `Messages Tab` の `Allow users to send Slash commands and messages from the messages tab` を有効にする
  - `Socket Mode` に移動する
    - `Socket Mode` を有効にする
    - 環境変数 `SLACK_APP_TOKEN` に設定するため、`Socket Mode Handler` を控えておく
  - `OAuth & Permissions` に移動する
    - 次の `Bot Token Scopes` を追加する:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - アプリをワークスペースにインストールし、環境変数 `SLACK_BOT_TOKEN` に設定するための `Bot User OAuth Token` を控えておく
  - `Event Subscriptions` に移動する
    - `Events` を有効にする
    - `Subscribe to bot events` に次を追加する:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 変更を保存する

## 環境変数を追加する (`.env`) {#add-env-vars}

プロジェクトのルートに `.env` ファイルを作成し、以下の環境変数を定義します。
これにより、アプリケーションから [ClickHouse の SQL playground](https://sql.clickhouse.com/) に接続できるようになります。

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

必要に応じて、ClickHouse の変数を調整し、ご自身の ClickHouse サーバーまたは ClickHouse Cloud インスタンスを使用することもできます。

## ボットの使用 {#using-the-bot}

1. **ボットを起動:**

   ```sh
   uv run main.py
   ```

2. **Slackでの操作:**
   - チャンネルでボットをメンション: `@yourbot Who are the top contributors to the ClickHouse git repo?`
   - スレッドでメンションして返信: `@yourbot how many contributions did these users make last week?`
   - ボットにダイレクトメッセージを送信: `Show me all tables in the demo database.`

ボットはスレッド内で返信し、該当する場合は以前のスレッドメッセージすべてをコンテキストとして使用します。

**スレッドコンテキスト:**
スレッド内で返信する際、ボットは以前のメッセージすべて(現在のメッセージを除く)を読み込み、AIのコンテキストとして含めます。

**ツールの使用:**
ボットはMCP経由で利用可能なツール(スキーマ検出、SQL実行など)のみを使用し、使用されたSQLと回答の導出方法の要約を常に表示します。

</VerticalStepper>
