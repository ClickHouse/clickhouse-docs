---
slug: /use-cases/AI/MCP/ollama
sidebar_label: 'Интеграция Ollama'
title: 'Настройка сервера ClickHouse MCP с Ollama'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве описывается, как настроить Ollama с сервером ClickHouse MCP.'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# Использование MCP-сервера ClickHouse с Ollama

> В этом руководстве описывается использование MCP-сервера ClickHouse с Ollama.

<VerticalStepper headerLevel="h2">


## Установка Ollama {#install-ollama}

Ollama — это библиотека для запуска больших языковых моделей (LLM) на вашем компьютере.
Она предоставляет [широкий выбор моделей](https://ollama.com/library) и проста в использовании.

Вы можете скачать Ollama для Mac, Windows или Linux со [страницы загрузки](https://ollama.com/download).

После запуска Ollama автоматически запустит локальный сервер в фоновом режиме, который можно использовать для работы с моделями.
Также вы можете запустить сервер вручную, выполнив команду `ollama serve`.

После установки вы можете загрузить модель на свой компьютер следующим образом:

```bash
ollama pull qwen3:8b
```

Эта команда загрузит модель на локальный компьютер, если она ещё не установлена.
После загрузки вы можете запустить модель следующим образом:

```bash
ollama run qwen3:8b
```

:::note
С MCP-серверами будут работать только [модели с поддержкой инструментов](https://ollama.com/search?c=tools).
:::

Список загруженных моделей можно вывести следующим образом:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

Для получения более подробной информации о загруженной модели используйте следующую команду:

```bash
ollama show qwen3
```

```text
  Model
    architecture        qwen3
    parameters          8.2B
    context length      40960
    embedding length    4096
    quantization        Q4_K_M

  Capabilities
    completion
    tools

  Parameters
    repeat_penalty    1
    stop              "<|im_start|>"
    stop              "<|im_end|>"
    temperature       0.6
    top_k             20
    top_p             0.95

  License
    Apache License
    Version 2.0, January 2004
```

Из этого вывода видно, что модель qwen3 по умолчанию имеет чуть более 8 миллиардов параметров.


## Установка MCPHost {#install-mcphost}

На момент написания (июль 2025 года) нативной функциональности для использования Ollama с MCP-серверами не существует.
Однако можно использовать [MCPHost](https://github.com/mark3labs/mcphost) для запуска моделей Ollama с MCP-серверами.

MCPHost — это приложение на Go, поэтому необходимо убедиться, что на вашей машине [установлен Go](https://go.dev/doc/install).
Затем можно установить MCPHost, выполнив следующую команду:

```bash
go install github.com/mark3labs/mcphost@latest
```

Исполняемый файл будет установлен в каталог `~/go/bin`, поэтому необходимо убедиться, что этот каталог добавлен в PATH.


## Настройка ClickHouse MCP Server {#configure-clickhouse-mcp-server}

MCP-серверы можно настроить с помощью MCPHost в файлах YAML или JSON.
MCPHost ищет конфигурационные файлы в домашнем каталоге в следующем порядке:

1. `.mcphost.yml` или `.mcphost.json` (рекомендуется)
2. `.mcp.yml` или `.mcp.json` (для обратной совместимости)

Используется синтаксис, аналогичный синтаксису стандартного конфигурационного файла MCP.
Ниже приведен пример конфигурации ClickHouse MCP-сервера, который сохраним в файл `~/.mcphost.json`:

```json
{
  "mcpServers": {
    "mcp-ch": {
      "type": "local",
      "command": [
        "uv",
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ]
    }
  }
}
```

Основное отличие от стандартного конфигурационного файла MCP заключается в необходимости указания параметра `type`.
Этот параметр определяет тип транспорта, используемый MCP-сервером.

- `local` → транспорт stdio
- `remote` → транспорт streamable
- `builtin` → транспорт inprocess

Также необходимо настроить следующие переменные окружения:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
Теоретически эти переменные можно указать в ключе `environment` конфигурационного файла MCP, однако на практике это не работает.
:::


## Запуск MCPHost {#running-mcphost}

После настройки MCP-сервера ClickHouse вы можете запустить MCPHost, выполнив следующую команду:

```bash
mcphost --model ollama:qwen3
```

Или, если вы хотите использовать определённый файл конфигурации:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json
```

:::warning
Если вы не укажете `--model`, MCPHost будет искать `ANTHROPIC_API_KEY` в переменных окружения и использует модель `anthropic:claude-sonnet-4-20250514`.
:::

Вы должны увидеть следующий вывод:

```text
  ┃                                                                                     ┃
  ┃  Model loaded: ollama (qwen3)                                                       ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  Model loaded successfully on GPU                                                   ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  ┃                                                                                     ┃
  ┃  Loaded 3 tools from MCP servers                                                    ┃
  ┃   MCPHost System (09:52)                                                            ┃
  ┃                                                                                     ┃

  Enter your prompt (Type /help for commands, Ctrl+C to quit, ESC to cancel generation)
```

Для вывода списка MCP-серверов можно использовать команду `/servers`:

```text
  ┃                                                                                      ┃
  ┃  ## Configured MCP Servers                                                           ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch                                                                           ┃
  ┃   MCPHost System (10:00)                                                             ┃
  ┃
```

А команду `/tools` — для вывода списка доступных инструментов:

```text
  ┃  ## Available Tools                                                                  ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

После этого можно задавать модели вопросы о базах данных и таблицах, доступных в песочнице ClickHouse SQL.

По нашему опыту, при использовании небольших моделей (модель qwen3 по умолчанию имеет 8 миллиардов параметров) необходимо более конкретно указывать, что вы хотите от неё получить.
Например, нужно явно попросить её вывести список баз данных и таблиц, а не сразу запрашивать определённую таблицу.
Эту проблему можно частично решить, используя более крупную модель (например, qwen3:14b), но она будет работать медленнее на потребительском оборудовании.

</VerticalStepper>
