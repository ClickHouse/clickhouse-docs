---
slug: /use-cases/AI/MCP/claude-desktop
sidebar_label: 'Интеграция с Claude Desktop'
title: 'Настройка MCP-сервера ClickHouse для работы с Claude Desktop'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как настроить Claude Desktop для работы с MCP-сервером ClickHouse.'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';

# Использование MCP-сервера ClickHouse с Claude Desktop \{#using-clickhouse-mcp-server-with-claude-desktop\}

> В этом руководстве объясняется, как настроить Claude Desktop для работы с MCP-сервером ClickHouse с помощью uv
> и подключить его к примерам датасетов ClickHouse.

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

<VerticalStepper headerLevel="h2">
  ## Установка uv \{#install-uv\}

  Чтобы следовать инструкциям в этом руководстве, вам потребуется установить [uv](https://docs.astral.sh/uv/).
  Если вы не хотите использовать uv, вам потребуется обновить config MCP-сервера, чтобы использовать альтернативный менеджер пакетов.

  ## Загрузка Claude Desktop \{#download-claude-desktop\}

  Вам также потребуется установить приложение Claude Desktop, которое можно загрузить с [сайта Claude Desktop](https://claude.ai/desktop).

  ## Настройка MCP-сервера ClickHouse \{#configure-clickhouse-mcp-server\}

  После установки Claude Desktop можно переходить к настройке [MCP-сервера ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).
  Сделать это можно через [файл конфигурации Claude Desktop](https://claude.ai/docs/configuration).

  Чтобы найти этот файл, сначала откройте страницу настроек (`Cmd+,` на Mac), затем нажмите на вкладку `Developer` в левом меню.
  После этого вы увидите следующий экран, на котором нужно нажать кнопку `Edit config`:

  <Image img={ClaudeDesktopConfig} alt="Конфигурация Claude Desktop" size="md" />

  Вы попадёте в каталог, содержащий файл конфигурации (`claude_desktop_config.json`).
  При первом открытии этот файл, скорее всего, будет иметь примерно следующее содержание:

  ```json
  {
    "mcpServers": {}
  }
  ```

  Словарь `mcpServers` использует имя MCP-сервера в качестве ключа и словарь параметров конфигурации в качестве значения.
  Например, конфигурация MCP-сервера ClickHouse для подключения к ClickHouse Playground будет выглядеть следующим образом:

  ```json
  {
    "mcpServers": {
      "mcp-clickhouse": {
        "command": "uv",
        "args": [
          "run",
          "--with",
          "mcp-clickhouse",
          "--python",
          "3.10",
          "mcp-clickhouse"
        ],
        "env": {
          "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
          "CLICKHOUSE_PORT": "8443",
          "CLICKHOUSE_USER": "demo",
          "CLICKHOUSE_PASSWORD": "",
          "CLICKHOUSE_SECURE": "true",
          "CLICKHOUSE_VERIFY": "true",
          "CLICKHOUSE_CONNECT_TIMEOUT": "30",
          "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
        }
      }
    }
  }
  ```

  После обновления конфигурации необходимо перезапустить Claude Desktop, чтобы изменения вступили в силу.

  :::warning
  В зависимости от того, как вы установили `uv`, при перезапуске Claude Desktop вы можете столкнуться со следующей ошибкой:

  ```text
  MCP mcp-clickhouse: spawn uv ENOENT
  ```

  Если это произойдёт, вам нужно будет обновить `command`, указав полный путь к `uv`. Например, если вы установили его через Cargo, путь будет таким: `/Users/&lt;username&gt;/.cargo/bin/uv`
  :::

  ## Использование MCP-сервера ClickHouse \{#using-clickhouse-mcp-server\}

  После перезапуска Claude Desktop вы сможете найти MCP-сервер ClickHouse, нажав значок `Search and tools`:

  <Image img={FindMCPServers} alt="Найти MCP-серверы" size="md" />

  <br />

  Затем вы можете выбрать, отключить все инструменты или только некоторые из них.

  Теперь всё готово, чтобы задать Claude несколько вопросов, которые приведут к использованию MCP-сервера ClickHouse.
  Например, можно спросить: `What's the most interesting dataset in the SQL playground?`.

  При первом вызове каждого инструмента на MCP-сервере Claude попросит подтвердить его использование:

  <Image img={MCPPermission} alt="Дать разрешение на использование инструмента list_databases" size="md" />

  Ниже показана часть разговора, включающая несколько вызовов инструментов к MCP-серверу ClickHouse:

  <Image img={ClaudeConversation} alt="Разговор с Claude" size="md" />
</VerticalStepper>