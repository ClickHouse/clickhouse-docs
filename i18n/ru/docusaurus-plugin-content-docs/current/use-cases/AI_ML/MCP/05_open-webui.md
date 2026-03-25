---
slug: /use-cases/AI/MCP/open-webui
sidebar_label: 'Интеграция Open WebUI'
title: 'Настройка сервера ClickHouse MCP для работы с Open WebUI и ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как настроить Open WebUI для работы с сервером ClickHouse MCP с использованием Docker.'
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

# Использование MCP-сервера ClickHouse с Open WebUI \{#using-clickhouse-mcp-server-with-open-webui\}

> В этом руководстве объясняется, как настроить [Open WebUI](https://github.com/open-webui/open-webui) для работы с MCP-сервером ClickHouse
> и подключить его к примерным датасетам ClickHouse.

<VerticalStepper headerLevel="h2">
  ## Установка uv \{#install-uv\}

  Чтобы следовать инструкциям в этом руководстве, вам потребуется установить [uv](https://docs.astral.sh/uv/).
  Если вы не хотите использовать uv, вам потребуется обновить config MCP-сервера для использования альтернативного менеджера пакетов.

  ## Запуск Open WebUI \{#launch-open-webui\}

  Чтобы запустить Open WebUI, выполните следующую команду:

  ```bash
  uv run --with open-webui open-webui serve
  ```

  Перейдите по адресу http://localhost:8080/, чтобы открыть UI.

  ## Настройка сервера ClickHouse MCP \{#configure-clickhouse-mcp-server\}

  Чтобы настроить сервер ClickHouse MCP, нам нужно будет представить интерфейс сервера MCP в виде конечных точек OpenAPI.
  Сначала зададим переменные окружения, которые позволят нам подключиться к ClickHouse SQL Playground:

  ```bash
  export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
  export CLICKHOUSE_USER="demo"
  export CLICKHOUSE_PASSWORD=""
  ```

  Теперь можно запустить `mcpo`, чтобы создать конечные точки OpenAPI:

  ```bash
  uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
  ```

  Вы можете увидеть список созданных конечных точек, перейдя по адресу http://localhost:8000/docs

  <Image img={Endpoints} alt="Конечные точки OpenAPI" size="md" />

  Чтобы использовать эти конечные точки с Open WebUI, нужно перейти в настройки:

  <Image img={Settings} alt="Настройки Open WebUI" size="md" />

  Нажмите `Tools`:

  <Image img={ToolsPage} alt="Инструменты Open WebUI" size="md" />

  Добавьте http://localhost:8000 в качестве URL инструмента:

  <Image img={AddTool} alt="Инструмент Open WebUI" size="md" />

  После этого рядом со значком инструмента на панели чата должна появиться `1`:

  <Image img={ToolsAvailable} alt="Доступные инструменты Open WebUI" size="md" />

  Если нажать на значок инструмента, отобразится список доступных инструментов:

  <Image img={ListOfTools} alt="Список инструментов Open WebUI" size="md" />

  ## Настройка OpenAI \{#configure-openai\}

  По умолчанию Open WebUI работает с моделями Ollama, но мы также можем добавить конечные точки, совместимые с OpenAI.
  Они настраиваются через меню настроек, но на этот раз нужно нажать на вкладку `Connections`:

  <Image img={Connections} alt="Подключения Open WebUI" size="md" />

  Добавьте конечную точку и ваш ключ OpenAI:

  <Image img={AddConnection} alt="Open WebUI - добавление OpenAI в качестве подключения" size="md" />

  После этого модели OpenAI будут доступны в верхнем меню:

  <Image img={OpenAIModels} alt="Open WebUI - модели" size="md" />

  ## Общение с сервером ClickHouse MCP через Open WebUI \{#chat-to-clickhouse-mcp-server\}

  После этого можно начать диалог, и Open WebUI будет обращаться к MCP-серверу при необходимости:

  <Image img={Conversation} alt="Open WebUI - чат с сервером ClickHouse MCP" size="md" />
</VerticalStepper>