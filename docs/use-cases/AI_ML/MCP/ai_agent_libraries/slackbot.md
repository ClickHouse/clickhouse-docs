---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'Integrate SlackBot'
title: 'How to build a SlackBot agent using ClickHouse MCP Server.'
pagination_prev: null
pagination_next: null
description: 'Learn how to build a SlackBot agent that can interact with ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'how-to'
---

# How to build a SlackBot agent using ClickHouse MCP Server

In this guide, you'll learn how to build a [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) agent.
This bot allows you to ask questions about your ClickHouse data directly from Slack, using natural language. It uses the
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) and [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1).

:::note Example project
The code for this example can be found in the [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md).
:::

## Prerequisites {#prerequisites}
- You'll need to have [`uv`](https://docs.astral.sh/uv/getting-started/installation/) installed
- You'll need access to a Slack workspace
- You'll need an Anthropic API key, or API key from another LLM provider

<VerticalStepper headerLevel="h2">

## Create a Slack App {#create-a-slack-app}

1. Go to [slack.com/apps](https://slack.com/apps) and click `Create New App`.
2. Choose option `From scratch` and give your app a name.
3. Select your Slack workspace.

## Install the app to your workspace {#install-the-app-to-your-workspace}

Next, you'll need to add the app created in the previous step to your workspace.
You can follow the instructions for ["Add apps to your Slack workspace"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)
in the Slack documentation.

## Configure Slack app settings {#configure-slack-app-settings}

- Go to `App Home`
  - Under `Show Tabs` → `Messages Tab`: Enable `Allow users to send Slash commands and messages from the messages tab`
  - Go to `Socket Mode`
    - Enable `Socket Mode`
    - Note down the `Socket Mode Handler` for the environment variable `SLACK_APP_TOKEN`
  - Go to `OAuth & Permissions`
    - Add the following `Bot Token Scopes`:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - Install the app to your workspace and note down the `Bot User OAuth Token` for the environment variable `SLACK_BOT_TOKEN`.
  - Go to `Event Subscriptions`
    - Enable `Events`
    - Under `Subscribe to bot events`, add:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - Save Changes

## Add environment variables (`.env`) {#add-env-vars}

Create a `.env` file in the project root with the following environment variables
which will allow your app to connect to [ClickHouse's SQL playground](https://sql.clickhouse.com/).

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

You can adapt the ClickHouse variables to use your own ClickHouse server
or Cloud instance, if you would prefer.

## Using the bot {#using-the-bot}

1. **Start the bot:**

   ```sh
   uv run main.py
   ```
2. **In Slack:**
    - Mention the bot in a channel: `@yourbot Who are the top contributors to the ClickHouse git repo?`
    - Reply to the thread with a mention: `@yourbot how many contributions did these users make last week?`
    - DM the bot: `Show me all tables in the demo database.`

The bot will reply in the thread, using all previous thread messages as context 
if applicable.

**Thread Context:**
When replying in a thread, the bot loads all previous messages (except the current one) and includes them as context for the AI.

**Tool Usage:**
The bot uses only the tools available via MCP (e.g., schema discovery, SQL execution) and will always show the SQL used and a summary of how the answer was found.

</VerticalStepper>
