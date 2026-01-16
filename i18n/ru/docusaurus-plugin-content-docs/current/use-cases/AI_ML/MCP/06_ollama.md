---
slug: /use-cases/AI/MCP/ollama
sidebar_label: 'Интеграция Ollama'
title: 'Настройка сервера ClickHouse MCP с Ollama'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве описано, как настроить Ollama с сервером ClickHouse MCP.'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

# Использование сервера ClickHouse MCP совместно с Ollama \\{#using-clickhouse-mcp-server-with-ollama\\}

> В этом руководстве объясняется, как использовать сервер ClickHouse MCP совместно с Ollama.

<VerticalStepper headerLevel="h2">

## Установите Ollama \\{#install-ollama\\}

Ollama — это библиотека для запуска больших языковых моделей (LLM) на вашем компьютере.
У неё [широкий выбор моделей](https://ollama.com/library), и ей легко пользоваться.

Вы можете скачать Ollama для Mac, Windows или Linux со [страницы загрузки](https://ollama.com/download).

После запуска Ollama стартует локальный сервер в фоновом режиме, который вы можете использовать для запуска моделей.
Либо вы можете запустить сервер вручную командой `ollama serve`.

После установки вы можете загрузить модель на свой компьютер следующим образом:

```bash
ollama pull qwen3:8b
```

Это загрузит модель на ваш локальный компьютер, если её там ещё нет.
После загрузки модели вы можете запустить её следующим образом:

```bash
ollama run qwen3:8b
```

:::note
Только [модели, которые поддерживают инструменты](https://ollama.com/search?c=tools), будут работать с серверами MCP.
:::

Мы можем вывести список загруженных нами моделей следующим образом:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

Мы можем использовать следующую команду, чтобы получить дополнительную информацию о модели, которую мы скачали:

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

Из этого вывода видно, что у модели qwen3 по умолчанию чуть больше 8 миллиардов параметров.

## Установите MCPHost \\{#install-mcphost\\}

На момент написания этой инструкции (июль 2025 года) нет встроенной поддержки использования Ollama с MCP Servers.
Однако мы можем использовать [MCPHost](https://github.com/mark3labs/mcphost), чтобы запускать модели Ollama с MCP Servers.

MCPHost — это приложение, написанное на Go, поэтому убедитесь, что [Go установлен](https://go.dev/doc/install) на вашем компьютере.
Затем вы можете установить MCPHost, выполнив следующую команду:

```bash
go install github.com/mark3labs/mcphost@latest
```

Исполняемый файл будет установлен в `~/go/bin`, поэтому нужно убедиться, что этот каталог входит в переменную окружения `PATH`.

## Настройка сервера ClickHouse MCP \\{#configure-clickhouse-mcp-server\\}

Мы можем настраивать серверы MCP с помощью MCPHost в файлах YAML или JSON.
MCPHost будет искать файлы конфигурации в вашем домашнем каталоге в следующем порядке:

1. `.mcphost.yml` или `.mcphost.json`  (предпочтительно)
2. `.mcp.yml` или `.mcp.json` (для обратной совместимости)

Используется синтаксис, аналогичный тому, что применяется в стандартном конфигурационном файле MCP.
Ниже приведён пример конфигурации сервера ClickHouse MCP, который мы сохраним в файл `~/.mcphost.json`:

```json
{
  "mcpServers": {
    "mcp-ch": {
      "type": "local",
      "command": ["uv",
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

Основное отличие от стандартного конфигурационного файла MCP заключается в том, что нам нужно указать `type`.
Этот параметр используется для указания типа транспорта, который использует сервер MCP.

* `local` → транспорт stdio
* `remote` → потоковый транспорт
* `builtin` → внутрипроцессный (inprocess) транспорт

Нам также потребуется настроить следующие переменные окружения:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
Теоретически вы должны иметь возможность указать эти переменные под ключом `environment` в конфигурационном файле MCP, но на практике это не работает.
:::

## Running MCPHost \\{#running-mcphost\\}

После того как вы настроили сервер ClickHouse MCP, вы можете запустить MCPHost, выполнив следующую команду:

```bash
mcphost --model ollama:qwen3
```

Или, если вы хотите использовать определённый файл конфигурации:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json 
```

:::warning
Если вы не укажете параметр `--model`, MCPHost будет искать в переменных окружения `ANTHROPIC_API_KEY` и использовать модель `anthropic:claude-sonnet-4-20250514`.
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

Мы можем использовать команду `/servers`, чтобы вывести список MCP-серверов:

```text
  ┃                                                                                      ┃
  ┃  ## Configured MCP Servers                                                           ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch                                                                           ┃
  ┃   MCPHost System (10:00)                                                             ┃
  ┃
```

А команду `/tools` — чтобы вывести список доступных инструментов:

```text
  ┃  ## Available Tools                                                                  ┃
  ┃                                                                                      ┃
  ┃  1. mcp-ch__list_databases                                                           ┃
  ┃  2. mcp-ch__list_tables                                                              ┃
  ┃  3. mcp-ch__run_select_query
```

После этого мы можем задавать модели вопросы о базах данных и таблицах, доступных в песочнице ClickHouse SQL.

По нашему опыту, при использовании более компактных моделей (модель qwen3 по умолчанию имеет 8 миллиардов параметров) вам нужно более точно формулировать, что вы хотите, чтобы модель сделала.
Например, вам нужно будет явно попросить её вывести список баз данных и таблиц, а не сразу просить выполнить запрос к определённой таблице.
Частично уменьшить эту проблему можно, используя более крупную модель (например, qwen3:14b), но она будет работать медленнее на пользовательском оборудовании.

</VerticalStepper>
