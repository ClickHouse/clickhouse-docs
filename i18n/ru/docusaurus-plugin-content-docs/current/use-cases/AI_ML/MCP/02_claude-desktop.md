---
slug: /use-cases/AI/MCP/claude-desktop
sidebar_label: 'Интеграция с Claude Desktop'
title: 'Настройка сервера ClickHouse MCP для Claude Desktop'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как настроить Claude Desktop для работы с сервером ClickHouse MCP.'
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


# Использование MCP-сервера ClickHouse с Claude Desktop

> В этом руководстве описывается, как настроить Claude Desktop с MCP-сервером ClickHouse с помощью uv
> и подключить его к примерам наборов данных ClickHouse.

<iframe
  width='768'
  height='432'
  src='https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q'
  title='YouTube video player'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

<VerticalStepper headerLevel="h2">


## Установка uv {#install-uv}

Для выполнения инструкций из этого руководства необходимо установить [uv](https://docs.astral.sh/uv/).
Если вы не хотите использовать uv, необходимо обновить конфигурацию MCP Server для использования альтернативного менеджера пакетов.


## Загрузка Claude Desktop {#download-claude-desktop}

Вам также потребуется установить приложение Claude Desktop, которое можно скачать с [сайта Claude Desktop](https://claude.ai/desktop).


## Настройка сервера ClickHouse MCP {#configure-clickhouse-mcp-server}

После установки Claude Desktop необходимо настроить [сервер ClickHouse MCP](https://github.com/ClickHouse/mcp-clickhouse).
Это можно сделать с помощью [файла конфигурации Claude Desktop](https://claude.ai/docs/configuration).

Чтобы найти этот файл, сначала откройте страницу настроек (`Cmd+,` на Mac), а затем нажмите на вкладку `Developer` в левом меню.
Вы увидите следующий экран, на котором нужно нажать кнопку `Edit config`:

<Image img={ClaudeDesktopConfig} alt='Конфигурация Claude Desktop' size='md' />

Откроется директория с файлом конфигурации (`claude_desktop_config.json`).
При первом открытии этот файл, скорее всего, будет содержать следующее:

```json
{
  "mcpServers": {}
}
```

Словарь `mcpServers` принимает имя сервера MCP в качестве ключа и словарь параметров конфигурации в качестве значения.  
Например, конфигурация сервера ClickHouse MCP для подключения к ClickHouse Playground будет выглядеть следующим образом:

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
В зависимости от способа установки `uv` при перезапуске Claude Desktop может возникнуть следующая ошибка:

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

В этом случае необходимо обновить параметр `command`, указав полный путь к `uv`. Например, если установка выполнена через Cargo, путь будет `/Users/<username>/.cargo/bin/uv`
:::


## Использование MCP-сервера ClickHouse {#using-clickhouse-mcp-server}

После перезапуска Claude Desktop вы можете найти MCP-сервер ClickHouse, нажав на значок `Search and tools`:

<Image img={FindMCPServers} alt='Поиск MCP-серверов' size='md' />
<br />

Затем вы можете выбрать, отключить ли все инструменты или только некоторые из них.

Теперь мы готовы задать Claude несколько вопросов, которые приведут к использованию MCP-сервера ClickHouse.
Например, можно спросить `What's the most interesting dataset in the SQL playground?`.

Claude попросит подтвердить использование каждого инструмента MCP-сервера при первом вызове:

<Image
  img={MCPPermission}
  alt='Предоставление разрешения на использование инструмента list_databases'
  size='md'
/>

Ниже показана часть диалога, включающая несколько вызовов инструментов MCP-сервера ClickHouse:

<Image img={ClaudeConversation} alt='Диалог с Claude' size='md' />

</VerticalStepper>
