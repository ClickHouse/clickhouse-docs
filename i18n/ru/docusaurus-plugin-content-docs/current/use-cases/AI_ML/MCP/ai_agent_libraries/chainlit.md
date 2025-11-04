---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/chainlit'
'sidebar_label': 'Интеграция Chainlit'
'title': 'Как построить AI-агента с Chainlit и сервером ClickHouse MCP'
'pagination_prev': null
'pagination_next': null
'description': 'Узнайте, как использовать Chainlit для создания приложений чата на
  основе LLM вместе с сервером ClickHouse MCP'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Chainlit'
'show_related_blogs': true
'doc_type': 'guide'
---
# Как создать AI-агента с Chainlit и ClickHouse MCP Server

Этот гайд исследует, как совместить мощный фреймворк интерфейсов чата Chainlit с ClickHouse Model Context Protocol (MCP) Server для создания интерактивных приложений с данными. Chainlit позволяет вам создавать разговорные интерфейсы для AI-приложений с минимальным количеством кода, в то время как ClickHouse MCP Server обеспечивает бесшовную интеграцию с высокопроизводительной столбцовой базой данных ClickHouse.

## Предварительные требования {#prerequisites}
- Вам потребуется API-ключ Anthropic
- Убедитесь, что у вас установлен [`uv`](https://docs.astral.sh/uv/getting-started/installation/)

## Основное приложение Chainlit {#basic-chainlit-app}

Вы можете увидеть пример основного чат-приложения, запустив следующее:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

Затем перейдите по адресу `http://localhost:8000`

## Добавление ClickHouse MCP Server {#adding-clickhouse-mcp-server}

Ситуация становится более интересной, если мы добавим ClickHouse MCP Server. Вам нужно будет обновить ваш файл `.chainlit/config.toml`, чтобы разрешить использование команды `uv`:

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
Полный файл `config.toml` можно найти в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)
:::

Есть немного вспомогательного кода, чтобы заставить MCP Servers работать с Chainlit, поэтому нам нужно будет запустить следующую команду для запуска Chainlit:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

Чтобы добавить MCP Server, нажмите на значок плага в интерфейсе чата, затем добавьте следующую команду для подключения и использования ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

Если вы хотите использовать свою собственную инстанцию ClickHouse, вы можете изменить значения переменных окружения.

После этого вы можете задавать ему вопросы, такие как:

* Расскажи мне о таблицах, которые у тебя есть для запроса
* Что-то интересное о такси Нью-Йорка?