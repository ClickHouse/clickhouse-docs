---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'SlackBot を統合する'
title: 'ClickHouse MCP Server を使って SlackBot エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と連携して動作する SlackBot エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'ガイド'
---



# ClickHouse MCP Server を使用して SlackBot エージェントを構築する方法

このガイドでは、[SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) エージェントの構築方法を説明します。
このボットを使うと、自然言語で Slack から直接 ClickHouse データに関する質問ができます。このボットは
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) と [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) を使用します。

:::note サンプルプロジェクト
このサンプルのコードは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md)で確認できます。
:::



## 前提条件 {#prerequisites}

- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)をインストールしておく必要があります
- Slackワークスペースへのアクセス権が必要です
- Anthropic APIキーまたは他のLLMプロバイダーのAPIキーが必要です

<VerticalStepper headerLevel="h2">


## Slackアプリを作成する {#create-a-slack-app}

1. [slack.com/apps](https://slack.com/apps)にアクセスし、`Create New App`をクリックします。
2. `From scratch`オプションを選択し、アプリに名前を付けます。
3. Slackワークスペースを選択します。


## ワークスペースへのアプリのインストール {#install-the-app-to-your-workspace}

次に、前のステップで作成したアプリをワークスペースに追加します。
Slackドキュメントの[「Slackワークスペースにアプリを追加する」](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)の手順を参照してください。


## Slackアプリの設定を構成する {#configure-slack-app-settings}

- `App Home`に移動します
  - `Show Tabs` → `Messages Tab`で、`Allow users to send Slash commands and messages from the messages tab`を有効にします
  - `Socket Mode`に移動します
    - `Socket Mode`を有効にします
    - 環境変数`SLACK_APP_TOKEN`用の`Socket Mode Handler`をメモします
  - `OAuth & Permissions`に移動します
    - 以下の`Bot Token Scopes`を追加します:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - アプリをワークスペースにインストールし、環境変数`SLACK_BOT_TOKEN`用の`Bot User OAuth Token`をメモします。
  - `Event Subscriptions`に移動します
    - `Events`を有効にします
    - `Subscribe to bot events`で、以下を追加します:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 変更を保存します


## 環境変数の追加（`.env`）{#add-env-vars}

プロジェクトルートに`.env`ファイルを作成し、以下の環境変数を設定します。
これにより、アプリケーションが[ClickHouseのSQLプレイグラウンド](https://sql.clickhouse.com/)に接続できるようになります。

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

必要に応じて、ClickHouse関連の変数を独自のClickHouseサーバーまたはClickHouse Cloudインスタンスを使用するように変更できます。


## ボットの使用 {#using-the-bot}

1. **ボットを起動:**

   ```sh
   uv run main.py
   ```

2. **Slackでの操作:**
   - チャンネルでボットをメンション: `@yourbot Who are the top contributors to the ClickHouse git repo?`
   - スレッドでメンション付きで返信: `@yourbot how many contributions did these users make last week?`
   - ボットにDMを送信: `Show me all tables in the demo database.`

ボットはスレッド内で返信し、該当する場合は以前のスレッドメッセージすべてをコンテキストとして使用します。

**スレッドコンテキスト:**
スレッド内で返信する際、ボットは以前のメッセージすべて(現在のメッセージを除く)を読み込み、AIのコンテキストとして含めます。

**ツールの使用:**
ボットはMCP経由で利用可能なツールのみを使用し(例: スキーマ検出、SQL実行)、常に使用されたSQLと回答がどのように見つかったかの要約を表示します。

</VerticalStepper>
