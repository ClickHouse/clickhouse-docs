---
'slug': '/use-cases/AI/MCP/ollama'
'sidebar_label': 'Интеграция Ollama'
'title': 'Настройка ClickHouse MCP сервера с Ollama'
'pagination_prev': null
'pagination_next': null
'description': 'Данное руководство объясняет, как настроить Ollama с сервером ClickHouse
  MCP.'
'keywords':
- 'AI'
- 'Ollama'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---
import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# Использование сервера ClickHouse MCP с Ollama

> Этот гид объясняет, как использовать сервер ClickHouse MCP с Ollama.

<VerticalStepper headerLevel="h2">

## Установка Ollama {#install-ollama}

Ollama — это библиотека для запуска Больших Языковых Моделей (LLMs) на вашем собственном компьютере.
Она предлагает [широкий выбор моделей](https://ollama.com/library) и проста в использовании.

Вы можете скачать Ollama для Mac, Windows или Linux с [страницы загрузки](https://ollama.com/download).

После запуска Ollama он запустит локальный сервер в фоновом режиме, который вы можете использовать для запуска моделей.
В качестве альтернативы вы можете запустить сервер вручную, выполнив команду `ollama serve`.

После установки вы можете загрузить модель на свой компьютер следующим образом:

```bash
ollama pull qwen3:8b
```

Это загрузит модель на ваш локальный компьютер, если она отсутствует.
После загрузки вы можете запустить модель следующим образом:

```bash
ollama run qwen3:8b
```

:::note
Только [модели, которые поддерживают инструменты](https://ollama.com/search?c=tools), будут работать с серверами MCP.
:::

Мы можем перечислить модели, которые мы загрузили, следующим образом:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

Мы можем использовать следующую команду, чтобы увидеть больше информации о загруженной модели:

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

Из этого вывода мы можем увидеть, что модель qwen3 по умолчанию имеет чуть более 8 миллиардов параметров.

## Установка MCPHost {#install-mcphost}

На момент написания (июль 2025 года) нет встроенной функциональности для использования Ollama с серверами MCP.
Однако мы можем использовать [MCPHost](https://github.com/mark3labs/mcphost) для запуска моделей Ollama по серверу MCP.

MCPHost — это приложение на Go, поэтому вам нужно убедиться, что у вас установлен [Go](https://go.dev/doc/install) на вашем компьютере.
Затем вы можете установить MCPHost, выполнив следующую команду:

```bash
go install github.com/mark3labs/mcphost@latest
```

Бинарный файл будет установлен в `~/go/bin`, поэтому нам нужно убедиться, что этот каталог находится в нашем пути.

## Настройка сервера ClickHouse MCP {#configure-clickhouse-mcp-server}

Мы можем настроить серверы MCP с MCPHost в файлах YAML или JSON. 
MCPHost будет искать файлы конфигурации в вашей домашней директории в следующем порядке:

1. `.mcphost.yml` или `.mcphost.json`  (предпочтительно)
2. `.mcp.yml` или `.mcp.json` (обратная совместимость)

Он использует синтаксис, аналогичный тому, который используется в стандартном файле конфигурации MCP.
Вот пример конфигурации сервера ClickHouse MCP, которую мы сохраним в файле `~/.mcphost.json`:

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

Главное отличие от стандартного файла конфигурации MCP заключается в том, что нам нужно указать `type`.
Тип используется для указания типа транспорта, используемого сервером MCP.

* `local` → транспорт stdio
* `remote` → потоковый транспорт
* `builtin` → транспорт внутри процесса

Нам также потребуется настроить следующие переменные окружения:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
В теории, вы должны иметь возможность предоставить эти переменные под ключом `environment` в файле конфигурации MCP, но мы обнаружили, что это не работает.
:::

## Запуск MCPHost {#running-mcphost}

После того как вы настроили сервер ClickHouse MCP, вы можете запустить MCPHost, выполнив следующую команду:

```bash
mcphost --model ollama:qwen3
```

Или, если вы хотите использовать конкретный файл конфигурации:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json 
```

:::warning
Если вы не укажете `--model`, MCPHost будет искать переменную окружения `ANTHROPIC_API_KEY` и будет использовать модель `anthropic:claude-sonnet-4-20250514`.
:::

Мы должны увидеть следующий вывод:

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

Мы можем использовать команду `/servers`, чтобы перечислить серверы MCP:

```text
┃                                                                                      ┃
┃  ## Configured MCP Servers                                                           ┃
┃                                                                                      ┃
┃  1. mcp-ch                                                                           ┃
┃   MCPHost System (10:00)                                                             ┃
┃
```

А команду `/tools`, чтобы перечислить доступные инструменты:

```text
┃  ## Available Tools                                                                  ┃
┃                                                                                      ┃
┃  1. mcp-ch__list_databases                                                           ┃
┃  2. mcp-ch__list_tables                                                              ┃
┃  3. mcp-ch__run_select_query
```

Затем мы можем задавать модели вопросы о базах данных/таблицах, доступных в SQL плейграунд ClickHouse.

На нашем опыте, при использовании меньших моделей (модель qwen3 по умолчанию имеет 8 миллиардов параметров), вам нужно будет быть более конкретным относительно того, что вы хотите, чтобы она сделала.
Например, вам нужно будет явно просить ее перечислить базы данных и таблицы, а не сразу спрашивать о запросе к определенной таблице.
Вы можете частично смягчить эту проблему, используя большую модель (например, qwen3:14b), но она будет работать медленнее на потребительском оборудовании.

</VerticalStepper>