---
'slug': '/use-cases/AI/MCP/open-webui'
'sidebar_label': 'Интеграция Open WebUI'
'title': 'Настройка сервера ClickHouse MCP с Open WebUI и ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'description': 'Этот гайд объясняет, как настроить Open WebUI с сервером ClickHouse
  MCP с использованием Docker.'
'keywords':
- 'AI'
- 'Open WebUI'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import Endpoints from '@site/static/images/use-cases/AI_ML/MCP/0_endpoints.png';
import Settings from '@site/static/images/use-cases/AI_ML/MCP/1_settings.png';
import ToolsPage from '@site/static/images/use-cases/AI_ML/MCP/2_tools_page.png';
import AddTool from '@site/static/images/use-cases/AI_ML/MCP/3_add_tool.png';
import ToolsAvailable from '@site/static/images/use-cases/AI_ML/MCP/4_tools_available.png';
import ListOfTools from '@site/static/images/use-cases/AI_ML/MCP/5_list_of_tools.png';
import Connections from '@site/static/images/use-cases/AI_ML/MCP/6_connections.png';
import AddConnection from '@site/static/images/use-cases/AI_ML/MCP/7_add_connection.png';
import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/8_openai_models_more.png';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/9_conversation.png';


# Использование сервера ClickHouse MCP с Open WebUI

> Этот гид объясняет, как настроить [Open WebUI](https://github.com/open-webui/open-webui) с сервером ClickHouse MCP
> и подключить его к примерным наборам данных ClickHouse.

<VerticalStepper headerLevel="h2">

## Установите uv {#install-uv}

Вам необходимо установить [uv](https://docs.astral.sh/uv/), чтобы следовать инструкциям в этом гиде.
Если вы не хотите использовать uv, вам потребуется обновить конфигурацию сервера MCP для использования альтернативного менеджера пакетов.

## Запустите Open WebUI {#launch-open-webui}

Чтобы запустить Open WebUI, вы можете выполнить следующую команду:

```bash
uv run --with open-webui open-webui serve
```

Перейдите к http://localhost:8080/, чтобы увидеть пользовательский интерфейс.

## Настройте сервер ClickHouse MCP {#configure-clickhouse-mcp-server}

Чтобы настроить сервер ClickHouse MCP, нам нужно преобразовать сервер MCP в конечные точки Open API.
Сначала давайте установим переменные окружения, которые позволят нам подключиться к SQL Playground ClickHouse:

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

А затем мы можем запустить `mcpo`, чтобы создать конечные точки Open API: 

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

Вы можете увидеть список созданных конечных точек, перейдя по адресу http://localhost:8000/docs

<Image img={Endpoints} alt="Конечные точки Open API" size="md"/>

Чтобы использовать эти конечные точки с Open WebUI, нам нужно перейти к настройкам:

<Image img={Settings} alt="Настройки Open WebUI" size="md"/>

Нажмите на `Инструменты`:

<Image img={ToolsPage} alt="Инструменты Open WebUI" size="md"/>

Добавьте http://localhost:8000 как URL инструмента:

<Image img={AddTool} alt="Инструмент Open WebUI" size="md"/>

После этого мы должны увидеть `1` рядом с иконкой инструмента на панели чата:

<Image img={ToolsAvailable} alt="Доступные инструменты Open WebUI" size="md"/>

Если мы нажмем на иконку инструмента, мы сможем увидеть доступные инструменты:

<Image img={ListOfTools} alt="Список инструментов Open WebUI" size="md"/>

## Настройте OpenAI {#configure-openai}

По умолчанию Open WebUI работает с моделями Ollama, но мы также можем добавить совместимые с OpenAI конечные точки.
Эти параметры настраиваются через меню настроек, но на этот раз нам нужно нажать на вкладку `Подключения`:

<Image img={Connections} alt="Подключения Open WebUI" size="md"/>

Давайте добавим конечную точку и наш ключ OpenAI:

<Image img={AddConnection} alt="Open WebUI - Добавить OpenAI как подключение" size="md"/>

Модели OpenAI будут доступны в верхнем меню:

<Image img={OpenAIModels} alt="Open WebUI - Модели" size="md"/>

## Общение с сервером ClickHouse MCP через Open WebUI {#chat-to-clickhouse-mcp-server}

Теперь мы можем вести беседу, и Open WebUI будет вызывать сервер MCP, если это необходимо:

<Image img={Conversation} alt="Open WebUI - Чат с сервером ClickHouse MCP" size="md"/>

</VerticalStepper>
