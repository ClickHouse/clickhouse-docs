---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'Интеграция SlackBot'
title: 'Как создать SlackBot-агента с помощью ClickHouse MCP Server.'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать SlackBot-агента, который может взаимодействовать с ClickHouse MCP Server.'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать агента SlackBot с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать агента [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot).
Этот бот позволяет задавать вопросы о ваших данных ClickHouse напрямую из Slack, используя естественный язык. Он использует
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) и [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1).

:::note Пример проекта
Код этого примера можно найти в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md).
:::



## Предварительные требования {#prerequisites}

- Необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Необходим доступ к рабочему пространству Slack
- Необходим API-ключ Anthropic или API-ключ от другого поставщика LLM

<VerticalStepper headerLevel="h2">


## Создание приложения Slack {#create-a-slack-app}

1. Перейдите на [slack.com/apps](https://slack.com/apps) и нажмите `Create New App`.
2. Выберите вариант `From scratch` и укажите название приложения.
3. Выберите рабочее пространство Slack.


## Установите приложение в рабочее пространство {#install-the-app-to-your-workspace}

Далее необходимо добавить приложение, созданное на предыдущем шаге, в ваше рабочее пространство.
Следуйте инструкциям ["Add apps to your Slack workspace"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)
в документации Slack.


## Настройка параметров приложения Slack {#configure-slack-app-settings}

- Перейдите в `App Home`
  - В разделе `Show Tabs` → `Messages Tab`: включите опцию `Allow users to send Slash commands and messages from the messages tab`
  - Перейдите в `Socket Mode`
    - Включите `Socket Mode`
    - Запишите значение `Socket Mode Handler` для переменной окружения `SLACK_APP_TOKEN`
  - Перейдите в `OAuth & Permissions`
    - Добавьте следующие области `Bot Token Scopes`:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - Установите приложение в рабочее пространство и запишите значение `Bot User OAuth Token` для переменной окружения `SLACK_BOT_TOKEN`.
  - Перейдите в `Event Subscriptions`
    - Включите `Events`
    - В разделе `Subscribe to bot events` добавьте:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - Сохраните изменения


## Добавление переменных окружения (`.env`) {#add-env-vars}

Создайте файл `.env` в корневой директории проекта со следующими переменными окружения,
которые позволят вашему приложению подключиться к [SQL playground ClickHouse](https://sql.clickhouse.com/).

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

При необходимости вы можете изменить переменные ClickHouse для использования собственного сервера ClickHouse
или экземпляра ClickHouse Cloud.


## Использование бота {#using-the-bot}

1. **Запустите бота:**

   ```sh
   uv run main.py
   ```

2. **В Slack:**
   - Упомяните бота в канале: `@yourbot Who are the top contributors to the ClickHouse git repo?`
   - Ответьте в ветке с упоминанием: `@yourbot how many contributions did these users make last week?`
   - Напишите боту в личные сообщения: `Show me all tables in the demo database.`

Бот ответит в ветке, используя все предыдущие сообщения ветки в качестве контекста,
если это применимо.

**Контекст ветки:**
При ответе в ветке бот загружает все предыдущие сообщения (кроме текущего) и включает их в качестве контекста для ИИ.

**Использование инструментов:**
Бот использует только инструменты, доступные через MCP (например, обнаружение схемы, выполнение SQL-запросов), и всегда показывает использованный SQL-запрос и краткое описание того, как был получен ответ.

</VerticalStepper>
