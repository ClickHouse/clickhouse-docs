---
'slug': '/use-cases/AI/MCP/claude-desktop'
'sidebar_label': 'Интеграция Claude Desktop'
'title': 'Настройка сервера ClickHouse MCP с Claude Desktop'
'pagination_prev': null
'pagination_next': null
'description': 'В этом руководстве объясняется, как настроить Claude Desktop с сервером
  ClickHouse MCP.'
'keywords':
- 'AI'
- 'Librechat'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';


# Использование сервера ClickHouse MCP с Claude Desktop

> В этом руководстве объясняется, как настроить Claude Desktop с сервером ClickHouse MCP, используя uv, и подключить его к примерным наборам данных ClickHouse.

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<VerticalStepper headerLevel="h2">

## Установка uv {#install-uv}

Вам нужно установить [uv](https://docs.astral.sh/uv/), чтобы следовать инструкциям в этом руководстве.  
Если вы не хотите использовать uv, вам необходимо обновить конфигурацию MCP Server, чтобы использовать альтернативный менеджер пакетов.

## Скачивание Claude Desktop {#download-claude-desktop}

Также вам нужно установить приложение Claude Desktop, которое можно скачать с [веб-сайта Claude Desktop](https://claude.ai/desktop).

## Настройка сервера ClickHouse MCP {#configure-clickhouse-mcp-server}

После установки Claude Desktop пора настроить [сервер ClickHouse MCP](https://github.com/ClickHouse/mcp-clickhouse).  
Мы можем сделать это через [файл конфигурации Claude Desktop](https://claude.ai/docs/configuration).

Чтобы найти этот файл, сначала перейдите на страницу настроек (`Cmd+,` на Mac), затем нажмите на вкладку `Developer` в левом меню.  
Вы увидите следующий экран, на котором нужно нажать на кнопку `Edit config`:

<Image img={ClaudeDesktopConfig} alt="Конфигурация Claude Desktop" size="md" />

Это приведет вас к директории, содержащей файл конфигурации (`claude_desktop_config.json`).  
В первый раз, когда вы откроете этот файл, он, вероятно, будет содержать следующее содержимое:

```json
{
  "mcpServers": {}
}
```

Словарь `mcpServers` принимает имя сервера MCP в качестве ключа и словарь параметров конфигурации в качестве значения.  
Например, конфигурация сервера ClickHouse MCP, подключающаяся к ClickHouse Playground, будет выглядеть следующим образом:

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

После обновления конфигурации вам нужно будет перезапустить Claude Desktop, чтобы изменения вступили в силу.

:::warning
В зависимости от того, как вы установили `uv`, вы можете получить следующую ошибку при перезапуске Claude Desktop:

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

Если это произойдет, вам нужно будет обновить `command`, чтобы указать полный путь к `uv`. Например, если вы установили его через Cargo, это будет `/Users/<username>/.cargo/bin/uv`
:::

## Использование сервера ClickHouse MCP {#using-clickhouse-mcp-server}

После перезагрузки Claude Desktop вы можете найти сервер ClickHouse MCP, нажав на иконку `Search and tools`:

<Image img={FindMCPServers} alt="Найти серверы MCP" size="md" />
<br/>

Вы можете выбрать, отключить ли все или некоторые инструменты.

Теперь мы готовы задать Claude несколько вопросов, что приведет к использованию сервера ClickHouse MCP.  
Например, мы можем спросить его `Какой самый интересный набор данных в SQL playground?`.

Claude попросит нас подтвердить использование каждого инструмента на сервере MCP в первый раз, когда он будет вызван:

<Image img={MCPPermission} alt="Предоставить разрешение на использование инструмента list_databases" size="md" />

Ниже вы можете увидеть часть разговора, который включает в себя несколько вызовов инструментов к серверу ClickHouse MCP:

<Image img={ClaudeConversation} alt="Разговор Claude" size="md" />

</VerticalStepper>
