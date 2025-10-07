---
'slug': '/use-cases/AI/MCP/janai'
'sidebar_label': 'Интеграция Jan.ai'
'title': 'Настройка ClickHouse MCP сервера с Jan.ai'
'pagination_prev': null
'pagination_next': null
'description': 'Этот гид объясняет, как настроить Jan.ai с сервером ClickHouse MCP.'
'keywords':
- 'AI'
- 'Jan.ai'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/0_janai_openai.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/1_janai_mcp_servers.png';
import MCPServersList from '@site/static/images/use-cases/AI_ML/MCP/2_janai_mcp_servers_list.png';
import MCPForm from '@site/static/images/use-cases/AI_ML/MCP/3_janai_add_mcp_server.png';
import MCPEnabled from '@site/static/images/use-cases/AI_ML/MCP/4_janai_toggle.png';
import MCPTool from '@site/static/images/use-cases/AI_ML/MCP/5_jani_tools.png';
import Question from '@site/static/images/use-cases/AI_ML/MCP/6_janai_question.png';
import MCPToolConfirm from '@site/static/images/use-cases/AI_ML/MCP/7_janai_tool_confirmation.png';

import ToolsCalled from '@site/static/images/use-cases/AI_ML/MCP/8_janai_tools_called.png';  
import ToolsCalledExpanded from '@site/static/images/use-cases/AI_ML/MCP/9_janai_tools_called_expanded.png';  
import Result from '@site/static/images/use-cases/AI_ML/MCP/10_janai_result.png';  


# Использование сервера ClickHouse MCP с Jan.ai

> В этом руководстве объясняется, как использовать сервер ClickHouse MCP с [Jan.ai](https://jan.ai/docs).

<VerticalStepper headerLevel="h2">

## Установка Jan.ai {#install-janai}

Jan.ai — это альтернативный ChatGPT с открытым исходным кодом, который работает на 100% в оффлайн-режиме. 
Вы можете скачать Jan.ai для [Mac](https://jan.ai/docs/desktop/mac), [Windows](https://jan.ai/docs/desktop/windows) или [Linux](https://jan.ai/docs/desktop/linux).

Это нативное приложение, поэтому после загрузки вы можете его запустить.

## Добавление LLM в Jan.ai {#add-llm-to-janai}

Мы можем включить модели через меню настроек. 

Чтобы включить OpenAI, нам необходимо предоставить API-ключ, как показано ниже:

<Image img={OpenAIModels} alt="Включить модели OpenAI" size="md"/>

## Включение MCP-серверов {#enable-mcp-servers}

На момент написания MCP-серверы являются экспериментальной функцией в Jan.ai. 
Мы можем включить их, переключив эксперименты:

<Image img={MCPServers} alt="Включить MCP-серверы" size="md"/>

После того как переключатель будет активирован, мы увидим `MCP Servers` в меню слева.

## Настройка сервера ClickHouse MCP {#configure-clickhouse-mcp-server}

Если мы нажмем на меню `MCP Servers`, мы увидим список MCP-серверов, к которым можем подключиться:

<Image img={MCPServersList} alt="Список MCP-серверов" size="md"/>

Эти сервера по умолчанию отключены, но мы можем включить их, нажав на переключатель.

Чтобы установить сервер ClickHouse MCP, нужно нажать на значок `+`, а затем заполнить форму следующими данными:

<Image img={MCPForm} alt="Добавить MCP-сервер" size="md"/>

После этого нам нужно переключить сервер ClickHouse, если он еще не включен:

<Image img={MCPEnabled} alt="Включить MCP-сервер" size="md"/>

Теперь инструменты сервера ClickHouse MCP будут видны в диалоговом окне чата:

<Image img={MCPTool} alt="Инструменты сервера ClickHouse MCP" size="md"/>

## Общение с сервером ClickHouse MCP с Jan.ai {#chat-to-clickhouse-mcp-server}

Пришло время поговорить о данных, хранящихся в ClickHouse! 
Давайте зададим вопрос:

<Image img={Question} alt="Вопрос" size="md"/>

Jan.ai спросит подтверждение перед вызовом инструмента:

<Image img={MCPToolConfirm} alt="Подтверждение инструмента" size="md"/>

Затем он покажет нам список вызовов инструментов, которые были совершены:

<Image img={ToolsCalled} alt="Вызванные инструменты" size="md"/>

Если мы нажмем на вызов инструмента, мы сможем увидеть детали вызова:

<Image img={ToolsCalledExpanded} alt="Вызванные инструменты - расширенный вид" size="md"/>    

А затем внизу мы увидим наш результат:

<Image img={Result} alt="Результат" size="md"/>    

</VerticalStepper>
