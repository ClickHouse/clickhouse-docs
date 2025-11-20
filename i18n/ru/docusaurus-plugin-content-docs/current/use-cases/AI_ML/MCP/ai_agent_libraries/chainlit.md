---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Интеграция Chainlit'
title: 'Как создать AI-агента с помощью Chainlit и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как использовать Chainlit для создания чат-приложений на базе LLM совместно с сервером ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать AI-агента с помощью Chainlit и сервера ClickHouse MCP

В этом руководстве показано, как совместить мощный фреймворк чат-интерфейсов Chainlit 
с сервером ClickHouse Model Context Protocol (MCP) для создания интерактивных дата‑
приложений. Chainlit позволяет создавать диалоговые интерфейсы для AI‑приложений 
с минимальным количеством кода, а сервер ClickHouse MCP обеспечивает бесшовную
интеграцию с высокопроизводительной колонночной базой данных ClickHouse.



## Предварительные требования {#prerequisites}

- Вам понадобится API-ключ Anthropic
- Необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/)


## Базовое приложение Chainlit {#basic-chainlit-app}

Чтобы увидеть пример базового чат-приложения, выполните следующую команду:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

Затем откройте в браузере `http://localhost:8000`


## Добавление ClickHouse MCP Server {#adding-clickhouse-mcp-server}

Работа становится интереснее, если добавить ClickHouse MCP Server.
Необходимо обновить файл `.chainlit/config.toml`, чтобы разрешить использование команды `uv`:

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
Полный файл `config.toml` доступен в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)
:::

Для интеграции MCP Servers с Chainlit требуется дополнительный код, поэтому для запуска Chainlit используйте следующую команду:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

Чтобы добавить MCP Server, нажмите на значок штекера в интерфейсе чата и добавьте следующую команду для подключения к ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

Для использования собственного экземпляра ClickHouse измените значения переменных окружения.

Теперь можно задавать такие вопросы:

- Расскажи о доступных таблицах для запросов
- Что интересного можно узнать о такси Нью-Йорка?
