---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Интеграция с Chainlit'
title: 'Как создать ИИ-агента с помощью Chainlit и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как использовать Chainlit для создания чат-приложений на базе LLM совместно с сервером ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать AI-агента с помощью Chainlit и ClickHouse MCP Server {#how-to-build-an-ai-agent-with-chainlit-and-the-clickhouse-mcp-server}

В этом руководстве показано, как объединить мощный фреймворк чат-интерфейсов Chainlit 
с сервером ClickHouse Model Context Protocol (MCP) для создания интерактивных 
приложений для работы с данными. Chainlit позволяет создавать диалоговые интерфейсы для ИИ‑приложений
с минимальным количеством кода, а сервер ClickHouse MCP обеспечивает бесшовную интеграцию 
с высокопроизводительной колоночной базой данных ClickHouse.

## Предварительные требования {#prerequisites}
- Вам потребуется ключ API Anthropic
- У вас должен быть установлен [`uv`](https://docs.astral.sh/uv/getting-started/installation/)

## Базовое приложение Chainlit {#basic-chainlit-app}

Вы можете увидеть пример простого чат-приложения, запустив следующую команду:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

Затем откройте в браузере `http://localhost:8000`

## Добавление ClickHouse MCP Server {#adding-clickhouse-mcp-server}

Дело становится интереснее, если мы добавим ClickHouse MCP Server.
Вам нужно обновить файл `.chainlit/config.toml`, чтобы позволить использовать команду `uv`:

```toml
[features.mcp.stdio]
    enabled = true
    # Для MCP stdio-сервера могут использоваться только исполняемые файлы из списка разрешённых.
    # Необходимо указывать только базовое имя исполняемого файла, например "npx", а не "/usr/bin/npx".
    # Не комментируйте эту строку — она необходима для разбора имени исполняемого файла.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
Полный файл `config.toml` можно найти в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)
:::

Для интеграции MCP Servers с Chainlit требуется немного вспомогательного кода, поэтому для запуска Chainlit нужно выполнить следующую команду:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

Чтобы добавить MCP Server, нажмите на значок штекера в интерфейсе чата, а затем
добавьте следующую команду для подключения и использования ClickHouse SQL Playground:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

Если вы хотите использовать собственный экземпляр ClickHouse, вы можете настроить значения
переменных окружения.

Затем вы можете задавать ему вопросы, например:

* Расскажите о таблицах, к которым вы выполняете запросы
* Расскажите что-нибудь интересное о нью-йоркском такси
