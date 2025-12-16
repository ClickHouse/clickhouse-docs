---
slug: /use-cases/AI/MCP/ai-agent-libraries/copilotkit
sidebar_label: 'Интеграция с CopilotKit'
title: 'Как создать ИИ-агента с помощью CopilotKit и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать агентное приложение на основе данных, хранящихся в ClickHouse, с помощью ClickHouse MCP и CopilotKit'
keywords: ['ClickHouse', 'MCP', 'copilotkit']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать AI-агента с помощью CopilotKit и ClickHouse MCP Server {#how-to-build-an-ai-agent-with-copilotkit-and-the-clickhouse-mcp-server}

Это пример того, как создать агентское приложение, используя данные, хранящиеся в 
ClickHouse. В нем используется [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) 
для выполнения запросов к данным в ClickHouse и построения графиков на основе этих данных.

[CopilotKit](https://github.com/CopilotKit/CopilotKit) используется для создания пользовательского интерфейса 
и предоставления пользователю чат-интерфейса.

:::note Пример кода
Код этого примера доступен в [репозитории с примерами](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit).
:::

## Предварительные требования {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`

## Установка зависимостей {#install-dependencies}

Клонируйте проект локально: `git clone https://github.com/ClickHouse/examples` и 
перейдите в каталог `ai/mcp/copilotkit`.

Можете пропустить этот раздел и просто запустить скрипт `./install.sh` для установки зависимостей. Если 
вы хотите установить зависимости вручную, следуйте инструкциям ниже.

## Ручная установка зависимостей {#install-dependencies-manually}

1. Установите зависимости:

Выполните `npm install`, чтобы установить зависимости для Node.js.

2. Установите mcp-clickhouse:

Создайте новую папку `external` и клонируйте в неё репозиторий mcp-clickhouse.

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Установите зависимости Python и добавьте утилиту командной строки fastmcp.

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```

## Настройка приложения {#configure-the-application}

Скопируйте файл `env.example` в `.env` и отредактируйте его, указав значение `ANTHROPIC_API_KEY`.

## Используйте свою LLM {#use-your-own-llm}

Если вы предпочитаете использовать другого провайдера LLM вместо Anthropic, вы можете изменить 
среду выполнения Copilotkit, чтобы использовать другой адаптер LLM.
[Здесь](https://docs.copilotkit.ai/guides/bring-your-own-llm) приведён список поддерживаемых 
провайдеров.

## Использование собственного кластера ClickHouse {#use-your-own-clickhouse-cluster}

По умолчанию пример настроен на подключение к 
[демо-кластеру ClickHouse](https://sql.clickhouse.com/). Вы также можете использовать 
собственный кластер ClickHouse, задав следующие переменные окружения:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`

# Запуск приложения {#run-the-application}

Выполните `npm run dev`, чтобы запустить сервер разработки.

Вы можете протестировать агента, использовав запрос, например:

> «Покажи динамику цен в 
Манчестере за последние 10 лет».

Откройте [http://localhost:3000](http://localhost:3000) в браузере, чтобы увидеть результат.