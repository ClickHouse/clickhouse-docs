---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/slackbot'
'sidebar_label': 'Создание SlackBot'
'title': 'Как использовать ClickHouse MCP сервер для создания SlackBot代理.'
'pagination_prev': null
'pagination_next': null
'description': 'Разберем, как создать возможность интеграции SlackBot代理 с ClickHouse
  MCP сервером.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Slack'
- 'SlackBot'
- 'PydanticAI'
'show_related_blogs': true
'doc_type': 'guide'
---
# Как создать SlackBot агент с использованием ClickHouse MCP Server

В этом руководстве вы узнаете, как создать [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) агент.
Этот бот позволяет задавать вопросы о ваших данных ClickHouse прямо из Slack, используя естественный язык. Он использует
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) и [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1).

:::note Пример проекта
Код для этого примера можно найти в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md).
:::

## Предварительные требования {#prerequisites}
- Вам необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- У вас должен быть доступ к рабочему пространству Slack
- Вам нужен ключ API от Anthropic или другого поставщика LLM

<VerticalStepper headerLevel="h2">

## Создать Slack приложение {#create-a-slack-app}

1. Перейдите на [slack.com/apps](https://slack.com/apps) и нажмите `Создать новое приложение`.
2. Выберите опцию `С нуля` и дайте вашему приложению имя.
3. Выберите ваше рабочее пространство Slack.

## Установить приложение в ваше рабочее пространство {#install-the-app-to-your-workspace}

Далее вам нужно добавить приложение, созданное на предыдущем шаге, в ваше рабочее пространство.
Вы можете следовать инструкциям по теме ["Добавление приложений в ваше рабочее пространство Slack"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)
в документации Slack.

## Настроить параметры приложения Slack {#configure-slack-app-settings}

- Перейдите в `Домашняя страница приложения`
  - В разделе `Показать вкладки` → `Вкладка сообщений`: Включите `Разрешить пользователям отправлять команды Slash и сообщения с вкладки сообщений`
  - Перейдите в `Режим сокетов`
    - Включите `Режим сокетов`
    - Запомните `Обработчик режима сокетов` для переменной среды `SLACK_APP_TOKEN`
  - Перейдите в `OAuth и разрешения`
    - Добавьте следующие `Областя токенов бота`:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - Установите приложение в ваше рабочее пространство и запомните `OAuth токен пользователя бота` для переменной среды `SLACK_BOT_TOKEN`.
  - Перейдите в `Подписки на события`
    - Включите `События`
    - В разделе `Подписаться на события бота` добавьте:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - Сохранить изменения

## Добавить переменные окружения (`.env`) {#add-env-vars}

Создайте файл `.env` в корне проекта с следующими переменными окружения,
которые позволят вашему приложению подключиться к [SQL песочнице ClickHouse](https://sql.clickhouse.com/).

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

Вы можете адаптировать переменные ClickHouse для использования с вашим собственным сервером ClickHouse
или облачным экземпляром, если предпочитаете.

## Использование бота {#using-the-bot}

1. **Запустите бота:**

```sh
uv run main.py
```
2. **В Slack:**
    - Упомяните бота в канале: `@yourbot Кто основные контрибьюторы репозитория ClickHouse?`
    - Ответьте в треде, упомянув: `@yourbot сколько вкладов сделали эти пользователи на прошлой неделе?`
    - Напишите боту в личные сообщения: `Покажи все таблицы в демонстрационной базе данных.`

Бот ответит в треде, используя все предыдущие сообщения треда как контекст, 
если это применимо.

**Контекст треда:**
При ответах в треде бот загружает все предыдущие сообщения (кроме текущего) и включает их как контекст для ИИ.

**Использование инструмента:**
Бот использует только инструменты, доступные через MCP (например, выявление схем, выполнение SQL) и всегда показывает используемый SQL и краткое описание того, как был найден ответ.

</VerticalStepper>