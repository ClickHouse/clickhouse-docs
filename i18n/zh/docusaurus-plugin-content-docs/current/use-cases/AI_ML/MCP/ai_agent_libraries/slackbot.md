---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: '集成 SlackBot'
title: '如何使用 ClickHouse MCP Server 构建 SlackBot 智能体代理'
pagination_prev: null
pagination_next: null
description: '了解如何构建一个可以与 ClickHouse MCP Server 交互的 SlackBot 智能体代理。'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---

# 如何使用 ClickHouse MCP Server 构建 SlackBot 代理 \{#how-to-build-a-slackbot-agent-using-clickhouse-mcp-server\}

在本指南中，您将学习如何构建一个 [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) 代理。
这个机器人允许您在 Slack 中使用自然语言直接查询您的 ClickHouse 数据。它基于
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 和 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1)。

:::note 示例项目
此示例的代码可以在 [examples 仓库](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md) 中找到。
:::

## 前置条件 \{#prerequisites\}

- 您需要安装 [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- 您需要具有 Slack 工作区的访问权限
- 您需要 Anthropic API 密钥或其他 LLM 提供商的 API 密钥

<VerticalStepper headerLevel="h2">

## 创建 Slack 应用 \{#create-a-slack-app\}

1. 前往 [slack.com/apps](https://slack.com/apps) 并点击 `Create New App`。
2. 选择 `From scratch` 选项，并为您的应用命名。
3. 选择您的 Slack 工作区。

## 将应用安装到你的工作区 \{#install-the-app-to-your-workspace\}

接下来，你需要将上一步创建的应用添加到你的工作区。
你可以参考 Slack 文档中的说明：[“Add apps to your Slack workspace”](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)。

## 配置 Slack 应用设置 \{#configure-slack-app-settings\}

- 前往 `App Home`
  - 在 `Show Tabs` → `Messages Tab` 中，启用 `Allow users to send Slash commands and messages from the messages tab`
  - 前往 `Socket Mode`
    - 启用 `Socket Mode`
    - 记下 `Socket Mode Handler`，用于环境变量 `SLACK_APP_TOKEN`
  - 前往 `OAuth & Permissions`
    - 添加以下 `Bot Token Scopes`：
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - 将应用安装到工作区，并记下 `Bot User OAuth Token`，用于环境变量 `SLACK_BOT_TOKEN`。
  - 前往 `Event Subscriptions`
    - 启用 `Events`
    - 在 `Subscribe to bot events` 中添加：
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 保存更改

## 添加环境变量 (`.env`) \{#add-env-vars\}

在项目根目录创建一个 `.env` 文件，并加入以下环境变量，
这些变量将使你的应用能够连接到 [ClickHouse 的 SQL playground](https://sql.clickhouse.com/)。

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

如果您愿意，可以调整这些 ClickHouse 变量，以使用您自己的 ClickHouse 服务器或 ClickHouse Cloud 实例。

## 使用机器人 \{#using-the-bot\}

1. **启动机器人：**

   ```sh
   uv run main.py
   ```

2. **在 Slack 中：**
   - 在频道中 @ 机器人：`@yourbot Who are the top contributors to the ClickHouse git repo?`
   - 在回复串中 @ 机器人回复：`@yourbot how many contributions did these users make last week?`
   - 向机器人发送私信：`Show me all tables in the demo database.`

机器人将在回复串中响应，如适用，会将该回复串中所有先前的消息作为上下文。

**回复串上下文：**
在回复串中响应时，机器人会加载所有先前的消息（当前消息除外）并将其作为 AI 的上下文。

**工具使用：**
机器人仅使用通过 MCP 提供的工具（例如模式发现、SQL 执行），并且始终会显示所使用的 SQL 以及答案的查找摘要。

</VerticalStepper>
