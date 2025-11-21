---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Интеграция с Chainlit'
title: 'Как создать ИИ-агента с помощью Chainlit и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как использовать Chainlit для создания чат-приложений на основе LLM совместно с сервером ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать агента ИИ с помощью Chainlit и ClickHouse MCP Server

В этом руководстве рассматривается, как объединить мощный фреймворк Chainlit для чат-интерфейсов 
с ClickHouse Model Context Protocol (MCP) Server для создания интерактивных приложений 
для работы с данными. Chainlit позволяет создавать диалоговые интерфейсы для приложений с ИИ 
с минимальным количеством кода, в то время как ClickHouse MCP Server обеспечивает бесшовную
интеграцию с высокопроизводительной колонночной базой данных ClickHouse.



## Предварительные требования {#prerequisites}

- Вам понадобится API-ключ Anthropic
- Необходимо установить [`uv`](https://docs.astral.sh/uv/getting-started/installation/)


## Базовое приложение Chainlit {#basic-chainlit-app}

Пример базового чат-приложения можно посмотреть, выполнив следующую команду:

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
    # Для MCP stdio server могут использоваться только исполняемые файлы из списка разрешённых.
    # Требуется только базовое имя исполняемого файла, например, "npx", а не "/usr/bin/npx".
    # Пожалуйста, не комментируйте эту строку, она необходима для разбора имени исполняемого файла.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
Полный файл `config.toml` можно найти в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)
:::

Для работы MCP Servers с Chainlit требуется дополнительный код, поэтому для запуска Chainlit необходимо выполнить следующую команду:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

Чтобы добавить MCP Server, нажмите на иконку штекера в интерфейсе чата, а затем
добавьте следующую команду для подключения к ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

Если вы хотите использовать собственный экземпляр ClickHouse, можно изменить значения
переменных окружения.

После этого можно задавать такие вопросы:

- Расскажи о таблицах, которые доступны для запросов
- Что интересного можно узнать о такси Нью-Йорка?
