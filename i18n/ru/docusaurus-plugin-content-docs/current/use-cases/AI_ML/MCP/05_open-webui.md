---
slug: /use-cases/AI/MCP/open-webui
sidebar_label: 'Интеграция с Open WebUI'
title: 'Настройка сервера ClickHouse MCP с Open WebUI и ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как настроить Open WebUI с сервером ClickHouse MCP с помощью Docker.'
keywords: ['AI', 'Open WebUI', 'MCP']
show_related_blogs: true
doc_type: 'guide'
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

> В этом руководстве описывается, как настроить [Open WebUI](https://github.com/open-webui/open-webui) с сервером ClickHouse MCP
> и подключить его к примерам наборов данных ClickHouse.

<VerticalStepper headerLevel="h2">


## Установка uv {#install-uv}

Для выполнения инструкций из этого руководства необходимо установить [uv](https://docs.astral.sh/uv/).
Если вы не хотите использовать uv, необходимо обновить конфигурацию MCP Server для использования альтернативного менеджера пакетов.


## Запуск Open WebUI {#launch-open-webui}

Чтобы запустить Open WebUI, выполните следующую команду:

```bash
uv run --with open-webui open-webui serve
```

Откройте http://localhost:8080/ в браузере, чтобы увидеть интерфейс.


## Настройка ClickHouse MCP Server {#configure-clickhouse-mcp-server}

Для настройки ClickHouse MCP Server необходимо преобразовать MCP Server в конечные точки Open API.
Сначала зададим переменные окружения для подключения к ClickHouse SQL Playground:

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

Затем запустим `mcpo` для создания конечных точек Open API:

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

Список созданных конечных точек можно просмотреть, перейдя по адресу http://localhost:8000/docs

<Image img={Endpoints} alt='Конечные точки Open API' size='md' />

Чтобы использовать эти конечные точки с Open WebUI, перейдите в настройки:

<Image img={Settings} alt='Настройки Open WebUI' size='md' />

Нажмите на `Tools`:

<Image img={ToolsPage} alt='Инструменты Open WebUI' size='md' />

Добавьте http://localhost:8000 в качестве URL инструмента:

<Image img={AddTool} alt='Инструмент Open WebUI' size='md' />

После этого рядом со значком инструмента на панели чата должна отобразиться цифра `1`:

<Image img={ToolsAvailable} alt='Доступные инструменты Open WebUI' size='md' />

Нажав на значок инструмента, можно просмотреть список доступных инструментов:

<Image img={ListOfTools} alt='Список инструментов Open WebUI' size='md' />


## Настройка OpenAI {#configure-openai}

По умолчанию Open WebUI работает с моделями Ollama, но можно также добавить конечные точки, совместимые с OpenAI.
Настройка выполняется через меню параметров, но в этот раз необходимо перейти на вкладку `Connections`:

<Image img={Connections} alt='Подключения Open WebUI' size='md' />

Добавим конечную точку и ключ OpenAI:

<Image
  img={AddConnection}
  alt='Open WebUI - Добавление OpenAI в качестве подключения'
  size='md'
/>

После этого модели OpenAI станут доступны в верхнем меню:

<Image img={OpenAIModels} alt='Open WebUI - Модели' size='md' />


## Общение с MCP-сервером ClickHouse через Open WebUI {#chat-to-clickhouse-mcp-server}

Теперь можно начать диалог, и Open WebUI при необходимости будет обращаться к MCP-серверу:

<Image
  img={Conversation}
  alt='Open WebUI - Общение с MCP-сервером ClickHouse'
  size='md'
/>

</VerticalStepper>
