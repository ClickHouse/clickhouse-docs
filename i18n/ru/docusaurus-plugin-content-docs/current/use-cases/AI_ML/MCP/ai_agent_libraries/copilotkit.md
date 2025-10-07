---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/copilotkit'
'sidebar_label': 'Интеграция CopilotKit'
'title': 'Как создать AI агента с CopilotKit и сервером ClickHouse MCP'
'pagination_prev': null
'pagination_next': null
'description': 'Узнайте, как создать агентное приложение, используя данные, хранящиеся
  в ClickHouse с ClickHouse MCP и CopilotKit'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'copilotkit'
'show_related_blogs': true
'doc_type': 'guide'
---


# Как создать AI-агента с помощью CopilotKit и ClickHouse MCP Server

Это пример того, как создать агентное приложение, используя данные, хранящиеся в 
ClickHouse. Он использует [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 
для запроса данных из ClickHouse и генерации графиков на основе этих данных.

[CopilotKit](https://github.com/CopilotKit/CopilotKit) используется для разработки интерфейса 
и предоставления пользователю чат-интерфейса.

:::note Пример кода
Код для этого примера можно найти в [репозитории примеров](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit).
:::

## Предварительные требования {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`

## Установка зависимостей {#install-dependencies}

Клонируйте проект локально: `git clone https://github.com/ClickHouse/examples` и 
перейдите в каталог `ai/mcp/copilotkit`.

Пропустите этот раздел и выполните скрипт `./install.sh` для установки зависимостей. Если 
вы хотите установить зависимости вручную, следуйте приведенным ниже инструкциям.

## Установка зависимостей вручную {#install-dependencies-manually}

1. Установите зависимости:

Запустите `npm install`, чтобы установить зависимости node.

2. Установите mcp-clickhouse:

Создайте новую папку `external` и клонируйте репозиторий mcp-clickhouse в нее.

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Установите зависимости Python и добавьте инструмент командной строки fastmcp.

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```

## Настройка приложения {#configure-the-application}

Скопируйте файл `env.example` в `.env` и отредактируйте его, чтобы указать ваш `ANTHROPIC_API_KEY`.

## Используйте свой собственный LLM {#use-your-own-llm}

Если вы предпочитаете использовать другого провайдера LLM, а не Anthropic, вы можете изменить 
время выполнения CopilotKit, чтобы использовать другой адаптер LLM.
[Здесь](https://docs.copilotkit.ai/guides/bring-your-own-llm) находится список поддерживаемых 
провайдеров.

## Используйте свой собственный кластер ClickHouse {#use-your-own-clickhouse-cluster}

По умолчанию пример настроен для подключения к 
[демо-кластеру ClickHouse](https://sql.clickhouse.com/). Вы также можете использовать свой 
собственный кластер ClickHouse, установив следующие переменные окружения:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`


# Запустите приложение {#run-the-application}

Запустите `npm run dev`, чтобы начать сервер разработки.

Вы можете протестировать агента, используя запрос, например:

> "Покажи мне динамику цен в 
Манчестере за последние 10 лет."

Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере, чтобы увидеть 
результат.
