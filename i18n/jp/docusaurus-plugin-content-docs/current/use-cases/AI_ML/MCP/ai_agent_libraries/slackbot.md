---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/slackbot'
'sidebar_label': 'SlackBot を統合する'
'title': 'SlackBot エージェントを ClickHouse MCP サーバーを使用して構築する方法'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse MCP サーバーと対話する SlackBot エージェントを構築する方法を学びましょう。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Slack'
- 'SlackBot'
- 'PydanticAI'
'show_related_blogs': true
'doc_type': 'guide'
---


# ClickHouse MCPサーバーを使用してSlackBotエージェントを構築する方法

このガイドでは、[SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot)エージェントを構築する方法を学びます。このボットを使用すると、自然言語を使用してSlackから直接ClickHouseデータについて質問できます。これは、[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)と[PyDanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1)を利用しています。

:::note 例プロジェクト
この例のコードは、[examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md)で見つけることができます。
:::

## 前提条件 {#prerequisites}
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)をインストールしておく必要があります
- Slackワークスペースへのアクセスが必要です
- Anthropic APIキーまたは他のLLMプロバイダーからのAPIキーが必要です

<VerticalStepper headerLevel="h2">

## Slackアプリを作成する {#create-a-slack-app}

1. [slack.com/apps](https://slack.com/apps)に行き、`Create New App`をクリックします。
2. `From scratch`オプションを選択し、アプリに名前を付けます。
3. 自分のSlackワークスペースを選択します。

## アプリをワークスペースにインストールする {#install-the-app-to-your-workspace}

次に、前のステップで作成したアプリをワークスペースに追加する必要があります。
Slackドキュメントの「["Add apps to your Slack workspace"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)」の指示に従うことができます。

## Slackアプリの設定を構成する {#configure-slack-app-settings}

- `App Home`に行く
  - `Show Tabs` → `Messages Tab`で: `Allow users to send Slash commands and messages from the messages tab`を有効にします
  - `Socket Mode`に行く
    - `Socket Mode`を有効にします
    - 環境変数`SLACK_APP_TOKEN`用に`Socket Mode Handler`をメモします
  - `OAuth & Permissions`に行く
    - 次の`Bot Token Scopes`を追加します:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - アプリをワークスペースにインストールし、環境変数`SLACK_BOT_TOKEN`用の`Bot User OAuth Token`をメモします。
  - `Event Subscriptions`に行く
    - `Events`を有効にします
    - `Subscribe to bot events`の下に、追加します:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 変更を保存します

## 環境変数（`.env`）を追加する {#add-env-vars}

プロジェクトのルートに`.env`ファイルを作成し、以下の環境変数を追加します。これにより、アプリが[ClickHouseのSQLプレイグラウンド](https://sql.clickhouse.com/)に接続できるようになります。

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

ClickHouseの変数を変更して、自分のClickHouseサーバーやCloudインスタンスを使用することもできます。

## ボットの使用法 {#using-the-bot}

1. **ボットを起動する:**

```sh
uv run main.py
```
2. **Slackで:**
    - チャンネルでボットをメンションする: `@yourbot Who are the top contributors to the ClickHouse git repo?`
    - メンション付きでスレッドに返信する: `@yourbot how many contributions did these users make last week?`
    - ボットへDMを送る: `Show me all tables in the demo database.`

ボットはスレッド内で返信し、関連する場合は以前のスレッドメッセージをすべてコンテキストとして使用します。

**スレッドコンテキスト:**
ボットはスレッド内で返信する際、すべての前のメッセージ（現在のメッセージを除く）を読み込み、AIへのコンテキストとして含めます。

**ツールの使用:**
ボットはMCP経由で利用可能なツール（例: スキーマ発見、SQL実行）を使用し、常に使用されたSQLと回答がどのように見つかったかの要約を表示します。

</VerticalStepper>
