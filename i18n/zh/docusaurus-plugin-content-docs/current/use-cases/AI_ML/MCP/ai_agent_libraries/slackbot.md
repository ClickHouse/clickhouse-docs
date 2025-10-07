---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/slackbot'
'sidebar_label': '集成 SlackBot'
'title': '如何使用 ClickHouse MCP 服务器构建 SlackBot 代理。'
'pagination_prev': null
'pagination_next': null
'description': '学习如何构建一个可以与 ClickHouse MCP 服务器交互的 SlackBot 代理。'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Slack'
- 'SlackBot'
- 'PydanticAI'
'show_related_blogs': true
'doc_type': 'guide'
---


# 如何使用 ClickHouse MCP 服务器构建 SlackBot 代理

在本指南中，您将学习如何构建一个 [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) 代理。
该机器人允许您直接从 Slack 使用自然语言询问有关 ClickHouse 数据的问题。它使用 [ClickHouse MCP 服务器](https://github.com/ClickHouse/mcp-clickhouse) 和 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1)。

:::note 示例项目
此示例的代码可以在 [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md) 中找到。
:::

## 前提条件 {#prerequisites}
- 您需要安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- 您需要访问一个 Slack 工作区
- 您需要一个 Anthropic API 密钥，或来自其他 LLM 提供商的 API 密钥

<VerticalStepper headerLevel="h2">

## 创建 Slack 应用 {#create-a-slack-app}

1. 访问 [slack.com/apps](https://slack.com/apps) 并点击 `Create New App`。
2. 选择 `From scratch` 选项并为您的应用命名。
3. 选择您的 Slack 工作区。

## 将应用安装到您的工作区 {#install-the-app-to-your-workspace}

接下来，您需要将上一步创建的应用添加到您的工作区。
您可以遵循 Slack 文档中有关 ["Add apps to your Slack workspace"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace) 的说明。

## 配置 Slack 应用设置 {#configure-slack-app-settings}

- 转到 `App Home`
  - 在 `Show Tabs` → `Messages Tab`：启用 `Allow users to send Slash commands and messages from the messages tab`
  - 转到 `Socket Mode`
    - 启用 `Socket Mode`
    - 记录 `Socket Mode Handler` 的值作为环境变量 `SLACK_APP_TOKEN`
  - 转到 `OAuth & Permissions`
    - 添加以下 `Bot Token Scopes`：
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - 将应用安装到您的工作区，并记录 `Bot User OAuth Token` 的值作为环境变量 `SLACK_BOT_TOKEN`。
  - 转到 `Event Subscriptions`
    - 启用 `Events`
    - 在 `Subscribe to bot events` 下，添加：
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 保存更改

## 添加环境变量 (`.env`) {#add-env-vars}

在项目根目录中创建一个 `.env` 文件，包含以下环境变量，
这些变量将允许您的应用连接到 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/)。

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

如果您愿意，可以将 ClickHouse 变量调整为使用您自己的 ClickHouse 服务器或云实例。

## 使用机器人 {#using-the-bot}

1. **启动机器人：**

```sh
uv run main.py
```
2. **在 Slack 中：**
    - 在频道中提及机器人：`@yourbot Who are the top contributors to the ClickHouse git repo?`
    - 回复线程中的提及：`@yourbot how many contributions did these users make last week?`
    - 私聊机器人：`Show me all tables in the demo database.`

机器人会在线程中回复，使用所有之前线程消息作为上下文（如果适用）。

**线程上下文：**
在回复线程时，机器人会加载所有之前的消息（当前消息除外），并将其作为 AI 的上下文。

**工具使用：**
机器人仅使用通过 MCP 提供的工具（例如，架构发现、SQL 执行），并将始终显示使用的 SQL 及答案求解的摘要。

</VerticalStepper>
